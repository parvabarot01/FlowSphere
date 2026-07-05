import { registerJobHandler } from "@/lib/jobs/registry";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type { TaskPriority, TaskStatus } from "@/lib/supabase/types";

export type AutomationEvent =
  | {
      trigger: "task_status_changed";
      orgId: string;
      projectId: string;
      taskId: string;
      taskTitle: string;
      toStatus: TaskStatus;
      assigneeId: string | null;
    }
  | {
      trigger: "task_created";
      orgId: string;
      projectId: string;
      taskId: string;
      taskTitle: string;
      priority: TaskPriority;
      assigneeId: string | null;
    };

function matchesTriggerConfig(config: Record<string, unknown>, event: AutomationEvent): boolean {
  if (event.trigger === "task_status_changed" && typeof config.to_status === "string") {
    return config.to_status === event.toStatus;
  }
  if (event.trigger === "task_created" && typeof config.priority === "string") {
    return config.priority === event.priority;
  }
  // No filter configured on this trigger's relevant key — fires on every event of this type.
  return true;
}

/**
 * Runs as a background job (or inline, in dev without QStash configured). Uses
 * the service-role client since it isn't tied to a user session — bypasses
 * RLS by design, same pattern as AI report generation.
 */
async function evaluateAutomationRules(event: AutomationEvent): Promise<void> {
  const supabase = createServiceRoleClient();

  const { data: rules } = await supabase
    .from("automation_rules")
    .select("id, project_id, action_type, action_config, trigger_config")
    .eq("org_id", event.orgId)
    .eq("is_active", true)
    .eq("trigger_type", event.trigger);

  if (!rules || rules.length === 0) return;

  for (const rule of rules) {
    if (rule.project_id && rule.project_id !== event.projectId) continue;
    if (!matchesTriggerConfig((rule.trigger_config ?? {}) as Record<string, unknown>, event)) continue;

    const actionConfig = (rule.action_config ?? {}) as Record<string, unknown>;

    if (rule.action_type === "send_notification" && event.assigneeId) {
      const title = typeof actionConfig.message === "string" ? actionConfig.message : `Automation: "${event.taskTitle}"`;
      await supabase.from("notifications").insert({
        org_id: event.orgId,
        user_id: event.assigneeId,
        type: "automation",
        title,
        body: null,
        link: null,
      });
    } else if (rule.action_type === "create_task") {
      const title = typeof actionConfig.title === "string" && actionConfig.title ? actionConfig.title : `Follow-up: ${event.taskTitle}`;
      const validPriorities: TaskPriority[] = ["low", "medium", "high", "urgent"];
      const priority = validPriorities.includes(actionConfig.priority as TaskPriority)
        ? (actionConfig.priority as TaskPriority)
        : "medium";
      await supabase.from("tasks").insert({
        org_id: event.orgId,
        project_id: event.projectId,
        title,
        priority,
      });
    }

    await supabase.from("audit_log").insert({
      org_id: event.orgId,
      actor_id: null,
      action: "automation.rule_fired",
      entity_type: "automation_rule",
      entity_id: rule.id,
      metadata: { trigger: event.trigger, action_type: rule.action_type },
    });
  }
}

registerJobHandler<AutomationEvent>("automation.evaluate", evaluateAutomationRules);

export { evaluateAutomationRules };

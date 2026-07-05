"use server";

import { revalidatePath } from "next/cache";
import { createAutomationRuleSchema } from "@/lib/validations/automation";
import { createClient } from "@/lib/supabase/server";

export type AutomationRuleActionState = { error?: string };

export async function createAutomationRule(
  orgId: string,
  orgSlug: string,
  _prevState: AutomationRuleActionState,
  formData: FormData
): Promise<AutomationRuleActionState> {
  const parsed = createAutomationRuleSchema.safeParse({
    name: formData.get("name"),
    projectId: formData.get("projectId") || "",
    triggerType: formData.get("triggerType"),
    toStatus: formData.get("toStatus") || "",
    priorityFilter: formData.get("priorityFilter") || "",
    actionType: formData.get("actionType"),
    message: formData.get("message") || "",
    newTaskTitle: formData.get("newTaskTitle") || "",
    newTaskPriority: formData.get("newTaskPriority") || "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const triggerConfig: Record<string, string> = {};
  if (parsed.data.triggerType === "task_status_changed" && parsed.data.toStatus) {
    triggerConfig.to_status = parsed.data.toStatus;
  }
  if (parsed.data.triggerType === "task_created" && parsed.data.priorityFilter) {
    triggerConfig.priority = parsed.data.priorityFilter;
  }

  const actionConfig: Record<string, string> = {};
  if (parsed.data.actionType === "send_notification" && parsed.data.message) {
    actionConfig.message = parsed.data.message;
  }
  if (parsed.data.actionType === "create_task") {
    if (parsed.data.newTaskTitle) actionConfig.title = parsed.data.newTaskTitle;
    if (parsed.data.newTaskPriority) actionConfig.priority = parsed.data.newTaskPriority;
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: rule, error } = await supabase
    .from("automation_rules")
    .insert({
      org_id: orgId,
      project_id: parsed.data.projectId || null,
      name: parsed.data.name,
      trigger_type: parsed.data.triggerType,
      trigger_config: triggerConfig,
      action_type: parsed.data.actionType,
      action_config: actionConfig,
      created_by: user?.id,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  await supabase.rpc("log_audit_event", {
    p_org_id: orgId,
    p_action: "automation_rule.created",
    p_entity_type: "automation_rule",
    p_entity_id: rule.id,
    p_metadata: { name: parsed.data.name },
  });

  revalidatePath(`/org/${orgSlug}/automation`);
  return {};
}

export async function toggleAutomationRule(
  orgId: string,
  orgSlug: string,
  ruleId: string,
  isActive: boolean
): Promise<void> {
  const supabase = createClient();
  await supabase.from("automation_rules").update({ is_active: !isActive }).eq("id", ruleId);

  await supabase.rpc("log_audit_event", {
    p_org_id: orgId,
    p_action: "automation_rule.toggled",
    p_entity_type: "automation_rule",
    p_entity_id: ruleId,
    p_metadata: { is_active: !isActive },
  });

  revalidatePath(`/org/${orgSlug}/automation`);
}

export async function deleteAutomationRule(orgId: string, orgSlug: string, ruleId: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("automation_rules").delete().eq("id", ruleId);

  await supabase.rpc("log_audit_event", {
    p_org_id: orgId,
    p_action: "automation_rule.deleted",
    p_entity_type: "automation_rule",
    p_entity_id: ruleId,
    p_metadata: {},
  });

  revalidatePath(`/org/${orgSlug}/automation`);
}

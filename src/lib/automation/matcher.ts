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

export function matchesTriggerConfig(config: Record<string, unknown>, event: AutomationEvent): boolean {
  if (event.trigger === "task_status_changed" && typeof config.to_status === "string") {
    return config.to_status === event.toStatus;
  }
  if (event.trigger === "task_created" && typeof config.priority === "string") {
    return config.priority === event.priority;
  }
  // No filter configured on this trigger's relevant key — fires on every event of this type.
  return true;
}

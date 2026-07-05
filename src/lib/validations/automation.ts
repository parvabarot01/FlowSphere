import { z } from "zod";

export const createAutomationRuleSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  projectId: z.string().uuid().optional().or(z.literal("")),
  triggerType: z.enum(["task_status_changed", "task_created"]),
  toStatus: z.enum(["todo", "in_progress", "in_review", "done"]).optional().or(z.literal("")),
  priorityFilter: z.enum(["low", "medium", "high", "urgent"]).optional().or(z.literal("")),
  actionType: z.enum(["send_notification", "create_task"]),
  message: z.string().trim().max(500).optional().or(z.literal("")),
  newTaskTitle: z.string().trim().max(200).optional().or(z.literal("")),
  newTaskPriority: z.enum(["low", "medium", "high", "urgent"]).optional().or(z.literal("")),
});

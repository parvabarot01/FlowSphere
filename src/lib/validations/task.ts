import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(2000).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  assigneeId: z.string().uuid().optional().or(z.literal("")),
  dueDate: z.string().optional().or(z.literal("")),
});

export const updateTaskStatusSchema = z.object({
  status: z.enum(["todo", "in_progress", "in_review", "done"]),
});

import { z } from "zod";

export const requestApprovalSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  approverId1: z.string().uuid("First approver is required"),
  approverId2: z.string().uuid().optional().or(z.literal("")),
  approverId3: z.string().uuid().optional().or(z.literal("")),
});

export const decideStepSchema = z.object({
  comment: z.string().trim().max(1000).optional().or(z.literal("")),
});

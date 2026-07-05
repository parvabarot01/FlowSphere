import { z } from "zod";

export const createSprintSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  goal: z.string().trim().max(500).optional(),
  startDate: z.string().optional().or(z.literal("")),
  endDate: z.string().optional().or(z.literal("")),
});

export const updateSprintStatusSchema = z.object({
  status: z.enum(["planned", "active", "completed"]),
});

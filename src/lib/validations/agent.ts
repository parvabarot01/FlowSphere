import { z } from "zod";

export const agentDraftRequestSchema = z.object({
  department: z.enum(["product", "engineering", "design_qa", "executive"]),
  draftType: z.enum(["sprint_plan", "backlog"]),
  goal: z.string().trim().max(1000).optional().or(z.literal("")),
});

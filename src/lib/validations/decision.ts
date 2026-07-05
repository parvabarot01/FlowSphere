import { z } from "zod";

export const createDecisionSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  decision: z.string().trim().min(1, "Decision is required").max(2000),
  rationale: z.string().trim().max(2000).optional().or(z.literal("")),
  meetingSummaryId: z.string().uuid().optional().or(z.literal("")),
});

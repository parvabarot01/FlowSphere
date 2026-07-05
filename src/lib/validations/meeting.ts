import { z } from "zod";

export const summarizeTranscriptSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  transcript: z.string().trim().min(1, "Paste a transcript first").max(20000, "Transcript is too long (max 20,000 characters)"),
});

export const meetingSummaryResultSchema = z.object({
  summary: z.string().trim().min(1),
  action_items: z
    .array(z.object({ description: z.string().trim().min(1).max(300) }))
    .max(20)
    .default([]),
});

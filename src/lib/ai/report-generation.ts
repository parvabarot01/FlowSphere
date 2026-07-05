import { z } from "zod";
import { runAgentCompletion } from "@/lib/ai/groq-client";
import type { AiReportType } from "@/lib/supabase/types";

const severityEnum = z.enum(["low", "medium", "high"]);

export const reportContentSchemas = {
  weekly_update: z.object({
    summary: z.string(),
    highlights: z.array(z.string()).default([]),
    blockers: z.array(z.string()).default([]),
  }),
  health_score: z.object({
    score: z.number().min(0).max(100),
    risk_level: severityEnum,
    rationale: z.string(),
  }),
  risk_analysis: z.object({
    risks: z.array(z.object({ description: z.string(), severity: severityEnum })).default([]),
  }),
  dependency_graph: z.object({
    nodes: z.array(z.object({ id: z.string(), label: z.string() })).default([]),
    edges: z.array(z.object({ from: z.string(), to: z.string() })).default([]),
  }),
} satisfies Record<AiReportType, z.ZodTypeAny>;

const REPORT_SYSTEM_PROMPTS: Record<AiReportType, string> = {
  weekly_update:
    "You write a weekly executive project update from the given task/sprint data. Respond with strict JSON " +
    '(no markdown): {"summary": string, "highlights": string[], "blockers": string[]}. ' +
    "Ground everything only in the data given — never invent progress that isn't reflected in it.",
  health_score:
    "You assess overall project health from the given task/sprint data. Respond with strict JSON: " +
    '{"score": number (0-100), "risk_level": "low"|"medium"|"high", "rationale": string}. ' +
    "Base the score on completion rate, overdue tasks, and blocked/urgent work — explain your reasoning briefly.",
  risk_analysis:
    "You identify project risks from the given task/sprint data. Respond with strict JSON: " +
    '{"risks": [{"description": string, "severity": "low"|"medium"|"high"}]}. ' +
    "Only flag risks grounded in the data (e.g. overdue urgent tasks, stalled sprints, unassigned high-priority work). " +
    "Return an empty array if nothing stands out — don't invent risks.",
  dependency_graph:
    "You infer a best-effort task dependency graph from the given task data (titles/descriptions only — there is no " +
    'explicit dependency field). Respond with strict JSON: {"nodes": [{"id": string, "label": string}], ' +
    '"edges": [{"from": string, "to": string}]}. Node ids should be short slugs derived from the task title. ' +
    "Only include an edge when the transcript data clearly implies one task blocks or precedes another; when unsure, omit it.",
};

export type ReportGenerationOutcome =
  | { success: true; content: unknown }
  | { success: false; error: string };

export async function generateReportContent(
  reportType: AiReportType,
  contextText: string
): Promise<ReportGenerationOutcome> {
  const completion = await runAgentCompletion({
    systemPrompt: REPORT_SYSTEM_PROMPTS[reportType],
    messages: [{ role: "user", content: contextText }],
    jsonMode: true,
  });

  if (!completion.success) {
    return { success: false, error: completion.error };
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(completion.content);
  } catch {
    return { success: false, error: "AI agent returned malformed JSON." };
  }

  const parsed = reportContentSchemas[reportType].safeParse(parsedJson);
  if (!parsed.success) {
    return { success: false, error: "AI agent response didn't match the expected shape." };
  }

  return { success: true, content: parsed.data };
}

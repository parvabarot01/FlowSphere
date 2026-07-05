import { runAgentCompletion } from "@/lib/ai/groq-client";
import { meetingSummaryResultSchema } from "@/lib/validations/meeting";

const SYSTEM_PROMPT =
  "You summarize meeting transcripts for a team work tracker. Given a raw transcript, respond with strict JSON " +
  '(no markdown, no commentary) matching: {"summary": string, "action_items": [{"description": string}]}. ' +
  "The summary should be a few short paragraphs or bullet points covering what was discussed and decided. " +
  "Action items are concrete, assignable follow-up tasks mentioned or implied in the transcript — omit this array " +
  "entirely (empty array) if there genuinely are none. Never invent action items that aren't grounded in the transcript.";

export type MeetingSummaryResult = {
  summary: string;
  actionItems: string[];
};

export type MeetingSummaryOutcome =
  | { success: true; result: MeetingSummaryResult }
  | { success: false; error: string };

export async function summarizeMeetingTranscript(transcript: string): Promise<MeetingSummaryOutcome> {
  const completion = await runAgentCompletion({
    systemPrompt: SYSTEM_PROMPT,
    messages: [{ role: "user", content: transcript }],
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

  const parsed = meetingSummaryResultSchema.safeParse(parsedJson);
  if (!parsed.success) {
    return { success: false, error: "AI agent response didn't match the expected shape." };
  }

  return {
    success: true,
    result: {
      summary: parsed.data.summary,
      actionItems: parsed.data.action_items.map((item) => item.description),
    },
  };
}

import Groq from "groq-sdk";
import type { ChatCompletionCreateParamsNonStreaming } from "groq-sdk/resources/chat/completions";
import { DEPARTMENT_SYSTEM_PROMPTS, type Department } from "@/lib/ai/departments";

const apiKey = process.env.GROQ_API_KEY;
const groq = apiKey ? new Groq({ apiKey }) : null;

const MODEL = "llama-3.3-70b-versatile";
const MAX_RETRIES = 3;

export type AgentMessage = { role: "user" | "assistant"; content: string };

export type AgentResult =
  | { success: true; content: string }
  | { success: false; error: string };

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableStatus(status: number | undefined) {
  return status === 429 || (status !== undefined && status >= 500);
}

/**
 * Groq's free tier is rate-limited per-minute; a 429 here is an expected,
 * recoverable condition rather than a bug, so we back off and retry instead
 * of surfacing it straight to the user.
 */
async function completeWithRetry(params: ChatCompletionCreateParamsNonStreaming): Promise<AgentResult> {
  if (!groq) {
    return { success: false, error: "Groq is not configured — set GROQ_API_KEY to enable AI agents." };
  }

  let lastError = "AI agent request failed.";

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const completion = await groq.chat.completions.create(params);
      const content = completion.choices[0]?.message?.content;
      if (!content) {
        return { success: false, error: "AI agent returned an empty response." };
      }
      return { success: true, content };
    } catch (err) {
      const status = err instanceof Groq.APIError ? err.status : undefined;
      lastError = err instanceof Error ? err.message : "AI agent request failed.";

      if (attempt < MAX_RETRIES && isRetryableStatus(status)) {
        await sleep(2 ** attempt * 500);
        continue;
      }
      break;
    }
  }

  return { success: false, error: lastError };
}

/**
 * Runs a department agent with its fixed system prompt plus a short
 * conversation. Callers pass in whatever FlowSphere context (tasks, project
 * name, transcript text, etc.) is relevant as part of the user message —
 * the agent has no access to the database directly.
 */
export async function runDepartmentAgent({
  department,
  messages,
  jsonMode = false,
}: {
  department: Department;
  messages: AgentMessage[];
  jsonMode?: boolean;
}): Promise<AgentResult> {
  return completeWithRetry({
    model: MODEL,
    messages: [{ role: "system", content: DEPARTMENT_SYSTEM_PROMPTS[department] }, ...messages],
    temperature: 0.3,
    ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
  });
}

/**
 * Runs a one-off completion with a caller-supplied system prompt, for
 * agent work that isn't tied to a specific department (e.g. executive
 * reports, transcript summarization).
 */
export async function runAgentCompletion({
  systemPrompt,
  messages,
  jsonMode = false,
}: {
  systemPrompt: string;
  messages: AgentMessage[];
  jsonMode?: boolean;
}): Promise<AgentResult> {
  return completeWithRetry({
    model: MODEL,
    messages: [{ role: "system", content: systemPrompt }, ...messages],
    temperature: 0.3,
    ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
  });
}

export const isGroqConfigured = Boolean(apiKey);

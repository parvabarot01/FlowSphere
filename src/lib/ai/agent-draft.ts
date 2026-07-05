import { runDepartmentAgent } from "@/lib/ai/groq-client";
import type { Department } from "@/lib/ai/departments";
import type { TaskSummary } from "@/lib/tasks";

const MAX_TASKS_IN_CONTEXT = 40;

const DRAFT_TYPE_LABEL: Record<"sprint_plan" | "backlog", string> = {
  sprint_plan: "a sprint plan for the upcoming sprint",
  backlog: "a prioritized backlog draft",
};

export type AgentDraftOutcome = { success: true; draft: string } | { success: false; error: string };

export async function generateAgentDraft({
  department,
  draftType,
  goal,
  projectName,
  tasks,
}: {
  department: Department;
  draftType: "sprint_plan" | "backlog";
  goal: string;
  projectName: string;
  tasks: TaskSummary[];
}): Promise<AgentDraftOutcome> {
  const taskLines = tasks
    .slice(0, MAX_TASKS_IN_CONTEXT)
    .map((t) => `- [${t.status}/${t.priority}] ${t.title}`)
    .join("\n");

  const prompt = [
    `Project: ${projectName}`,
    `Existing tasks (${tasks.length} total${tasks.length > MAX_TASKS_IN_CONTEXT ? `, showing first ${MAX_TASKS_IN_CONTEXT}` : ""}):`,
    taskLines || "(no tasks yet)",
    "",
    `Draft ${DRAFT_TYPE_LABEL[draftType]}, grounded only in the tasks listed above.`,
    goal ? `Additional context from the requester: ${goal}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const completion = await runDepartmentAgent({
    department,
    messages: [{ role: "user", content: prompt }],
  });

  if (!completion.success) {
    return { success: false, error: completion.error };
  }

  return { success: true, draft: completion.content };
}

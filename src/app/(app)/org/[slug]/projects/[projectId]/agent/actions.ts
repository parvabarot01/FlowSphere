"use server";

import { agentDraftRequestSchema } from "@/lib/validations/agent";
import { generateAgentDraft } from "@/lib/ai/agent-draft";
import { getProjectTasks } from "@/lib/tasks";
import { createClient } from "@/lib/supabase/server";

export type AgentDraftState = { error?: string; draft?: string };

export async function requestAgentDraft(
  orgId: string,
  projectId: string,
  projectName: string,
  _prevState: AgentDraftState,
  formData: FormData
): Promise<AgentDraftState> {
  const parsed = agentDraftRequestSchema.safeParse({
    department: formData.get("department"),
    draftType: formData.get("draftType"),
    goal: formData.get("goal") || "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const tasks = await getProjectTasks(projectId);

  const outcome = await generateAgentDraft({
    department: parsed.data.department,
    draftType: parsed.data.draftType,
    goal: parsed.data.goal || "",
    projectName,
    tasks,
  });

  if (!outcome.success) {
    return { error: outcome.error };
  }

  const supabase = createClient();
  await supabase.rpc("log_audit_event", {
    p_org_id: orgId,
    p_action: "agent.draft_requested",
    p_entity_type: "project",
    p_entity_id: projectId,
    p_metadata: { department: parsed.data.department, draft_type: parsed.data.draftType },
  });

  return { draft: outcome.draft };
}

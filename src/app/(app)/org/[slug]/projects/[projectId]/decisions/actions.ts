"use server";

import { revalidatePath } from "next/cache";
import { createDecisionSchema } from "@/lib/validations/decision";
import { createClient } from "@/lib/supabase/server";

export type DecisionActionState = { error?: string };

export async function createDecision(
  orgId: string,
  orgSlug: string,
  projectId: string,
  _prevState: DecisionActionState,
  formData: FormData
): Promise<DecisionActionState> {
  const parsed = createDecisionSchema.safeParse({
    title: formData.get("title"),
    decision: formData.get("decision"),
    rationale: formData.get("rationale") || "",
    meetingSummaryId: formData.get("meetingSummaryId") || "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: decision, error } = await supabase
    .from("decision_log")
    .insert({
      org_id: orgId,
      project_id: projectId,
      meeting_summary_id: parsed.data.meetingSummaryId || null,
      title: parsed.data.title,
      decision: parsed.data.decision,
      rationale: parsed.data.rationale || null,
      decided_by: user?.id,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  await supabase.rpc("log_audit_event", {
    p_org_id: orgId,
    p_action: "decision.logged",
    p_entity_type: "decision_log",
    p_entity_id: decision.id,
    p_metadata: { title: parsed.data.title },
  });

  revalidatePath(`/org/${orgSlug}/projects/${projectId}/decisions`);
  return {};
}

export async function dismissActionItem(
  orgId: string,
  orgSlug: string,
  projectId: string,
  actionItemId: string
): Promise<void> {
  const supabase = createClient();
  await supabase.from("action_items").update({ status: "dismissed" }).eq("id", actionItemId);

  await supabase.rpc("log_audit_event", {
    p_org_id: orgId,
    p_action: "action_item.dismissed",
    p_entity_type: "action_item",
    p_entity_id: actionItemId,
    p_metadata: {},
  });

  revalidatePath(`/org/${orgSlug}/projects/${projectId}/decisions`);
}

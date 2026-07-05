"use server";

import { revalidatePath } from "next/cache";
import { requestApprovalSchema, decideStepSchema } from "@/lib/validations/approval";
import { createClient } from "@/lib/supabase/server";

export type ApprovalActionState = { error?: string };

export async function requestApproval(
  orgId: string,
  orgSlug: string,
  projectId: string,
  _prevState: ApprovalActionState,
  formData: FormData
): Promise<ApprovalActionState> {
  const parsed = requestApprovalSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || "",
    approverId1: formData.get("approverId1"),
    approverId2: formData.get("approverId2") || "",
    approverId3: formData.get("approverId3") || "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const approverIds = [parsed.data.approverId1, parsed.data.approverId2, parsed.data.approverId3].filter(
    (id): id is string => Boolean(id)
  );

  const supabase = createClient();
  const { error } = await supabase.rpc("create_approval_request", {
    p_org_id: orgId,
    p_project_id: projectId,
    p_title: parsed.data.title,
    p_description: parsed.data.description || null,
    p_approver_ids: approverIds,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/org/${orgSlug}/projects/${projectId}/approvals`);
  return {};
}

export async function decideApprovalStep(
  orgSlug: string,
  projectId: string,
  stepId: string,
  decision: "approved" | "rejected",
  _prevState: ApprovalActionState,
  formData: FormData
): Promise<ApprovalActionState> {
  const parsed = decideStepSchema.safeParse({ comment: formData.get("comment") || "" });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = createClient();
  const { error } = await supabase.rpc("decide_approval_step", {
    p_step_id: stepId,
    p_decision: decision,
    p_comment: parsed.data.comment || null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/org/${orgSlug}/projects/${projectId}/approvals`);
  return {};
}

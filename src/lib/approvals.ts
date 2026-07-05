import { createClient } from "@/lib/supabase/server";
import type { ApprovalStatus } from "@/lib/supabase/types";

export type ApprovalStepRow = {
  id: string;
  stepOrder: number;
  approverId: string;
  approverName: string;
  status: ApprovalStatus;
  comment: string | null;
  decidedAt: string | null;
};

export type ApprovalSummary = {
  id: string;
  title: string;
  description: string | null;
  status: ApprovalStatus;
  requestedByName: string | null;
  createdAt: string;
  resolvedAt: string | null;
  steps: ApprovalStepRow[];
};

export async function getProjectApprovals(projectId: string): Promise<ApprovalSummary[]> {
  const supabase = createClient();

  const { data: approvals, error } = await supabase
    .from("approvals")
    .select("id, title, description, requested_by, status, created_at, resolved_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error || !approvals || approvals.length === 0) return [];

  const approvalIds = approvals.map((a) => a.id);
  const { data: steps } = await supabase
    .from("approval_steps")
    .select("id, approval_id, step_order, approver_id, status, comment, decided_at")
    .in("approval_id", approvalIds)
    .order("step_order", { ascending: true });

  const userIds = Array.from(
    new Set([
      ...approvals.map((a) => a.requested_by).filter((id): id is string => Boolean(id)),
      ...(steps ?? []).map((s) => s.approver_id),
    ])
  );

  const { data: profiles } = userIds.length
    ? await supabase.from("profiles").select("id, full_name, email").in("id", userIds)
    : { data: [] as { id: string; full_name: string | null; email: string }[] };

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p.full_name ?? p.email]));

  const stepsByApprovalId = new Map<string, ApprovalStepRow[]>();
  for (const s of steps ?? []) {
    const list = stepsByApprovalId.get(s.approval_id) ?? [];
    list.push({
      id: s.id,
      stepOrder: s.step_order,
      approverId: s.approver_id,
      approverName: profileById.get(s.approver_id) ?? "Unknown",
      status: s.status,
      comment: s.comment,
      decidedAt: s.decided_at,
    });
    stepsByApprovalId.set(s.approval_id, list);
  }

  return approvals.map((a) => ({
    id: a.id,
    title: a.title,
    description: a.description,
    status: a.status,
    requestedByName: a.requested_by ? profileById.get(a.requested_by) ?? null : null,
    createdAt: a.created_at,
    resolvedAt: a.resolved_at,
    steps: stepsByApprovalId.get(a.id) ?? [],
  }));
}

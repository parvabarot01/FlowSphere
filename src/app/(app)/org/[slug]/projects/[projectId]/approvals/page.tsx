import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProjectApprovals } from "@/lib/approvals";
import { getOrgMembers } from "@/lib/members";
import { RequestApprovalForm } from "@/app/(app)/org/[slug]/projects/[projectId]/approvals/request-approval-form";
import { DecideStepForm } from "@/app/(app)/org/[slug]/projects/[projectId]/approvals/decide-step-form";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-slate-100 text-slate-600",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

export default async function ApprovalsPage({
  params,
}: {
  params: { slug: string; projectId: string };
}) {
  const supabase = createClient();
  const { data: org } = await supabase
    .from("organizations")
    .select("id, slug")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!org) {
    notFound();
  }

  const { data: project } = await supabase
    .from("projects")
    .select("id, name")
    .eq("id", params.projectId)
    .eq("org_id", org.id)
    .maybeSingle();

  if (!project) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [approvals, members] = await Promise.all([getProjectApprovals(project.id), getOrgMembers(org.id)]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Approvals — {project.name}</h1>
        <p className="mt-1 text-sm text-slate-500">Sequential multi-step approval requests.</p>
      </div>

      {approvals.length > 0 && (
        <ul className="space-y-3">
          {approvals.map((approval) => {
            const currentStep = approval.steps.find((s) => s.status === "pending");
            const isMyTurn = Boolean(currentStep && user && currentStep.approverId === user.id);

            return (
              <li key={approval.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-900">{approval.title}</p>
                  <span className={`rounded px-1.5 py-0.5 text-xs uppercase tracking-wide ${STATUS_STYLES[approval.status]}`}>
                    {approval.status}
                  </span>
                </div>
                {approval.description && <p className="mt-1 text-sm text-slate-600">{approval.description}</p>}
                {approval.requestedByName && (
                  <p className="mt-1 text-xs text-slate-400">Requested by {approval.requestedByName}</p>
                )}

                <ol className="mt-3 space-y-1.5 border-t border-slate-100 pt-3">
                  {approval.steps.map((step) => (
                    <li key={step.id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="text-slate-600">
                        Step {step.stepOrder}: {step.approverName}
                        {step.comment && <span className="text-slate-400"> — &ldquo;{step.comment}&rdquo;</span>}
                      </span>
                      <span className={`rounded px-1.5 py-0.5 text-xs ${STATUS_STYLES[step.status]}`}>{step.status}</span>
                    </li>
                  ))}
                </ol>

                {isMyTurn && currentStep && (
                  <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                    <DecideStepForm orgSlug={org.slug} projectId={project.id} stepId={currentStep.id} decision="approved" />
                    <DecideStepForm orgSlug={org.slug} projectId={project.id} stepId={currentStep.id} decision="rejected" />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <div className="max-w-2xl rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Request an approval</h2>
        <div className="mt-3">
          <RequestApprovalForm orgId={org.id} orgSlug={org.slug} projectId={project.id} members={members} />
        </div>
      </div>
    </div>
  );
}

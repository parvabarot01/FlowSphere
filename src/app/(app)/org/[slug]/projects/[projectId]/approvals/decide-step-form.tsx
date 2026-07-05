"use client";

import { useFormState, useFormStatus } from "react-dom";
import { decideApprovalStep } from "@/app/(app)/org/[slug]/projects/[projectId]/approvals/actions";

function SubmitButton({ decision }: { decision: "approved" | "rejected" }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={
        decision === "approved"
          ? "rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          : "rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
      }
    >
      {decision === "approved" ? "Approve" : "Reject"}
    </button>
  );
}

export function DecideStepForm({
  orgSlug,
  projectId,
  stepId,
  decision,
}: {
  orgSlug: string;
  projectId: string;
  stepId: string;
  decision: "approved" | "rejected";
}) {
  const decideWithIds = decideApprovalStep.bind(null, orgSlug, projectId, stepId, decision);
  const [state, formAction] = useFormState(decideWithIds, {});

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input
        name="comment"
        type="text"
        placeholder="Comment (optional)"
        className="rounded-md border border-slate-300 px-2 py-1 text-xs focus:border-slate-500 focus:outline-none"
      />
      <SubmitButton decision={decision} />
      {state.error && <span className="text-xs text-red-600">{state.error}</span>}
    </form>
  );
}

"use client";

import { useFormState } from "react-dom";
import { decideApprovalStep } from "@/app/(app)/org/[slug]/projects/[projectId]/approvals/actions";
import { SubmitButton } from "@/components/submit-button";

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
      <SubmitButton
        label={decision === "approved" ? "Approve" : "Reject"}
        variant={decision === "approved" ? "success" : "danger"}
        size="xs"
      />
      {state.error && <span className="text-xs text-red-600">{state.error}</span>}
    </form>
  );
}

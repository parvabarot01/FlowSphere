"use client";

import { useFormState } from "react-dom";
import { createDecision } from "@/app/(app)/org/[slug]/projects/[projectId]/decisions/actions";
import type { MeetingSummarySummary } from "@/lib/meetings";
import { SubmitButton } from "@/components/submit-button";

export function CreateDecisionForm({
  orgId,
  orgSlug,
  projectId,
  meetingSummaries,
}: {
  orgId: string;
  orgSlug: string;
  projectId: string;
  meetingSummaries: MeetingSummarySummary[];
}) {
  const createWithIds = createDecision.bind(null, orgId, orgSlug, projectId);
  const [state, formAction] = useFormState(createWithIds, {});

  return (
    <form action={formAction} className="space-y-3">
      <input
        name="title"
        type="text"
        required
        placeholder="Decision title"
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
      />
      <textarea
        name="decision"
        required
        rows={3}
        placeholder="What was decided?"
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
      />
      <textarea
        name="rationale"
        rows={2}
        placeholder="Rationale (optional)"
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
      />
      {meetingSummaries.length > 0 && (
        <select
          name="meetingSummaryId"
          defaultValue=""
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        >
          <option value="">Not tied to a meeting</option>
          {meetingSummaries.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
      )}
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton label="Log decision" pendingLabel="Logging..." />
    </form>
  );
}

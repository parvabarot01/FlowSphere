"use client";

import { useFormState } from "react-dom";
import { createSprint } from "@/app/(app)/org/[slug]/projects/[projectId]/sprints/sprint-actions";
import { SubmitButton } from "@/components/submit-button";

export function CreateSprintForm({
  orgId,
  orgSlug,
  projectId,
}: {
  orgId: string;
  orgSlug: string;
  projectId: string;
}) {
  const createWithIds = createSprint.bind(null, orgId, orgSlug, projectId);
  const [state, formAction] = useFormState(createWithIds, {});

  return (
    <form action={formAction} className="mt-3 space-y-3">
      <input
        name="name"
        type="text"
        required
        placeholder="Sprint name (e.g. Sprint 1)"
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
      />
      <textarea
        name="goal"
        placeholder="Goal (optional)"
        rows={2}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
      />
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">Start date</label>
          <input
            name="startDate"
            type="date"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">End date</label>
          <input name="endDate" type="date" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton label="Create sprint" pendingLabel="Creating..." className="mt-3 w-full" />
    </form>
  );
}

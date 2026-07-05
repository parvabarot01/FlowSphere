"use client";

import { useFormState } from "react-dom";
import { summarizeTranscript } from "@/app/(app)/org/[slug]/projects/[projectId]/meetings/actions";
import { SubmitButton } from "@/components/submit-button";

export function SummarizeTranscriptForm({
  orgId,
  orgSlug,
  projectId,
}: {
  orgId: string;
  orgSlug: string;
  projectId: string;
}) {
  const summarizeWithIds = summarizeTranscript.bind(null, orgId, orgSlug, projectId);
  const [state, formAction] = useFormState(summarizeWithIds, {});

  return (
    <form action={formAction} className="mt-3 space-y-3">
      <input
        name="title"
        type="text"
        required
        placeholder="Meeting title"
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
      />
      <textarea
        name="transcript"
        required
        rows={8}
        placeholder="Paste the raw meeting transcript here..."
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
      />
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton label="Summarize" pendingLabel="Summarizing..." />
    </form>
  );
}

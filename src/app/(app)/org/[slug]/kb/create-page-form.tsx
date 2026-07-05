"use client";

import { useFormState } from "react-dom";
import { createKnowledgeBasePage } from "@/app/(app)/org/[slug]/kb/actions";
import { SubmitButton } from "@/components/submit-button";

export function CreatePageForm({ orgId, orgSlug }: { orgId: string; orgSlug: string }) {
  const createWithIds = createKnowledgeBasePage.bind(null, orgId, orgSlug);
  const [state, formAction] = useFormState(createWithIds, {});

  return (
    <form action={formAction} className="space-y-3">
      <input
        name="title"
        type="text"
        required
        placeholder="Page title"
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
      />
      <textarea
        name="body"
        required
        rows={6}
        placeholder="Write the page content..."
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
      />
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton label="Create page" pendingLabel="Creating..." />
    </form>
  );
}

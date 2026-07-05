"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createKnowledgeBasePage } from "@/app/(app)/org/[slug]/kb/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
    >
      {pending ? "Creating..." : "Create page"}
    </button>
  );
}

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
      <SubmitButton />
    </form>
  );
}

"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updateKnowledgeBasePage, deleteKnowledgeBasePage } from "@/app/(app)/org/[slug]/kb/actions";
import type { KnowledgeBasePage } from "@/lib/knowledge-base";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
    >
      {pending ? "Saving..." : "Save"}
    </button>
  );
}

export function EditPageForm({ orgId, orgSlug, page }: { orgId: string; orgSlug: string; page: KnowledgeBasePage }) {
  const updateWithIds = updateKnowledgeBasePage.bind(null, orgId, orgSlug, page.id, page.slug);
  const [state, formAction] = useFormState(updateWithIds, {});

  return (
    <div className="space-y-3">
      <form action={formAction} className="space-y-3">
        <input
          name="title"
          type="text"
          required
          defaultValue={page.title}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-medium focus:border-slate-500 focus:outline-none"
        />
        <textarea
          name="body"
          required
          rows={12}
          defaultValue={page.body}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        <SubmitButton />
      </form>

      <form action={deleteKnowledgeBasePage.bind(null, orgId, orgSlug, page.id)}>
        <button type="submit" className="text-sm text-slate-400 hover:text-red-600">
          Delete page
        </button>
      </form>
    </div>
  );
}

"use client";

import { useFormState } from "react-dom";
import { motion } from "framer-motion";
import { updateKnowledgeBasePage, deleteKnowledgeBasePage } from "@/app/(app)/org/[slug]/kb/actions";
import type { KnowledgeBasePage } from "@/lib/knowledge-base";
import { SubmitButton } from "@/components/submit-button";

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
        <SubmitButton label="Save" pendingLabel="Saving..." />
      </form>

      <form action={deleteKnowledgeBasePage.bind(null, orgId, orgSlug, page.id)}>
        <motion.button
          type="submit"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="text-sm text-slate-400 transition-colors hover:text-red-600"
        >
          Delete page
        </motion.button>
      </form>
    </div>
  );
}

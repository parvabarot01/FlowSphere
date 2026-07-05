"use client";

import { useFormState } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { requestAgentDraft } from "@/app/(app)/org/[slug]/projects/[projectId]/agent/actions";
import { DEPARTMENTS } from "@/lib/ai/departments";
import { SubmitButton } from "@/components/submit-button";

export function AgentDraftForm({
  orgId,
  projectId,
  projectName,
}: {
  orgId: string;
  projectId: string;
  projectName: string;
}) {
  const requestWithIds = requestAgentDraft.bind(null, orgId, projectId, projectName);
  const [state, formAction] = useFormState(requestWithIds, {});

  return (
    <div className="space-y-4">
      <form action={formAction} className="grid gap-3 sm:grid-cols-2">
        <select
          name="department"
          defaultValue="product"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        >
          {DEPARTMENTS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
        <select
          name="draftType"
          defaultValue="sprint_plan"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        >
          <option value="sprint_plan">Sprint plan</option>
          <option value="backlog">Backlog draft</option>
        </select>
        <input
          name="goal"
          type="text"
          placeholder="Optional context (e.g. focus area, deadline)"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none sm:col-span-2"
        />
        <div className="sm:col-span-2">
          {state.error && <p className="mb-2 text-sm text-red-600">{state.error}</p>}
          <SubmitButton label="Generate draft" pendingLabel="Drafting..." />
        </div>
      </form>

      <AnimatePresence>
        {state.draft && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="rounded-lg border border-slate-200 bg-slate-50 p-4"
          >
            <p className="whitespace-pre-wrap text-sm text-slate-700">{state.draft}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

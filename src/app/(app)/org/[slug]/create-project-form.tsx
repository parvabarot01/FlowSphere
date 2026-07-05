"use client";

import { useFormState } from "react-dom";
import { createProject } from "@/app/(app)/org/[slug]/project-actions";
import { SubmitButton } from "@/components/submit-button";

export function CreateProjectForm({ orgId, orgSlug }: { orgId: string; orgSlug: string }) {
  const createWithOrg = createProject.bind(null, orgId, orgSlug);
  const [state, formAction] = useFormState(createWithOrg, {});

  return (
    <form action={formAction} className="mt-3 space-y-3">
      <input
        name="name"
        type="text"
        required
        placeholder="Project name"
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
      />
      <textarea
        name="description"
        placeholder="Description (optional)"
        rows={2}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
      />
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton label="Create project" pendingLabel="Creating..." className="mt-3 w-full" />
    </form>
  );
}

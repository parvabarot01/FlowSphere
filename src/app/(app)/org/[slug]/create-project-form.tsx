"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createProject } from "@/app/(app)/org/[slug]/project-actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-3 w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
    >
      {pending ? "Creating..." : "Create project"}
    </button>
  );
}

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
      <SubmitButton />
    </form>
  );
}

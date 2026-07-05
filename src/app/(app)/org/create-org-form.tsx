"use client";

import { useFormState } from "react-dom";
import { createOrganization } from "@/app/(app)/org/actions";
import { SubmitButton } from "@/components/submit-button";

export function CreateOrgForm() {
  const [state, formAction] = useFormState(createOrganization, {});

  return (
    <form action={formAction} className="mt-3">
      <label htmlFor="name" className="sr-only">
        Organization name
      </label>
      <input
        id="name"
        name="name"
        type="text"
        required
        placeholder="Acme Inc."
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
      />
      {state.error && <p className="mt-2 text-sm text-red-600">{state.error}</p>}
      <SubmitButton label="Create organization" pendingLabel="Creating..." className="mt-3 w-full" />
    </form>
  );
}

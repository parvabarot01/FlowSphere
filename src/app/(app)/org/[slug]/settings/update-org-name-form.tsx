"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updateOrganizationName } from "@/app/(app)/org/actions";

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

export function UpdateOrgNameForm({
  orgId,
  slug,
  initialName,
}: {
  orgId: string;
  slug: string;
  initialName: string;
}) {
  const updateWithIds = updateOrganizationName.bind(null, orgId, slug);
  const [state, formAction] = useFormState(updateWithIds, {});

  return (
    <form action={formAction} className="space-y-3">
      <div className="space-y-1">
        <label htmlFor="name" className="text-sm font-medium text-slate-700">
          Organization name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={initialName}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}

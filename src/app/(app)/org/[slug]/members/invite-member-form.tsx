"use client";

import { useFormState, useFormStatus } from "react-dom";
import { inviteMember } from "@/app/(app)/org/[slug]/members/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-3 w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
    >
      {pending ? "Sending..." : "Send invite"}
    </button>
  );
}

export function InviteMemberForm({
  orgId,
  orgSlug,
  orgName,
}: {
  orgId: string;
  orgSlug: string;
  orgName: string;
}) {
  const inviteWithOrg = inviteMember.bind(null, orgId, orgSlug, orgName);
  const [state, formAction] = useFormState(inviteWithOrg, {});

  return (
    <form action={formAction} className="mt-3 space-y-3">
      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="role" className="text-sm font-medium text-slate-700">
          Role
        </label>
        <select
          id="role"
          name="role"
          defaultValue="member"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        >
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.message && <p className="break-all text-sm text-emerald-600">{state.message}</p>}
      <SubmitButton />
    </form>
  );
}

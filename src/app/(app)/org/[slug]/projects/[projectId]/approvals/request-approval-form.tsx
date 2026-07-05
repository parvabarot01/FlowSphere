"use client";

import { useFormState, useFormStatus } from "react-dom";
import { requestApproval } from "@/app/(app)/org/[slug]/projects/[projectId]/approvals/actions";
import type { OrgMemberRow } from "@/lib/members";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
    >
      {pending ? "Requesting..." : "Request approval"}
    </button>
  );
}

export function RequestApprovalForm({
  orgId,
  orgSlug,
  projectId,
  members,
}: {
  orgId: string;
  orgSlug: string;
  projectId: string;
  members: OrgMemberRow[];
}) {
  const requestWithIds = requestApproval.bind(null, orgId, orgSlug, projectId);
  const [state, formAction] = useFormState(requestWithIds, {});

  return (
    <form action={formAction} className="space-y-3">
      <input
        name="title"
        type="text"
        required
        placeholder="What needs approval?"
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
      />
      <textarea
        name="description"
        rows={2}
        placeholder="Description (optional)"
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
      />
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        Approvers, in order (later steps unlock once earlier ones approve)
      </p>
      <div className="grid gap-2 sm:grid-cols-3">
        <select
          name="approverId1"
          required
          defaultValue=""
          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-slate-500 focus:outline-none"
        >
          <option value="" disabled>
            Step 1 approver
          </option>
          {members.map((m) => (
            <option key={m.userId} value={m.userId}>
              {m.fullName ?? m.email}
            </option>
          ))}
        </select>
        <select
          name="approverId2"
          defaultValue=""
          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-slate-500 focus:outline-none"
        >
          <option value="">Step 2 approver (optional)</option>
          {members.map((m) => (
            <option key={m.userId} value={m.userId}>
              {m.fullName ?? m.email}
            </option>
          ))}
        </select>
        <select
          name="approverId3"
          defaultValue=""
          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-slate-500 focus:outline-none"
        >
          <option value="">Step 3 approver (optional)</option>
          {members.map((m) => (
            <option key={m.userId} value={m.userId}>
              {m.fullName ?? m.email}
            </option>
          ))}
        </select>
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}

"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createTask } from "@/app/(app)/org/[slug]/projects/[projectId]/task-actions";
import type { OrgMemberRow } from "@/lib/members";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
    >
      {pending ? "Adding..." : "Add task"}
    </button>
  );
}

export function CreateTaskForm({
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
  const createWithIds = createTask.bind(null, orgId, orgSlug, projectId);
  const [state, formAction] = useFormState(createWithIds, {});

  return (
    <form action={formAction} className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <input
        name="title"
        type="text"
        required
        placeholder="Task title"
        className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none sm:col-span-2 lg:col-span-2"
      />
      <select
        name="priority"
        defaultValue="medium"
        className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="urgent">Urgent</option>
      </select>
      <select
        name="assigneeId"
        defaultValue=""
        className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
      >
        <option value="">Unassigned</option>
        {members.map((m) => (
          <option key={m.userId} value={m.userId}>
            {m.fullName ?? m.email}
          </option>
        ))}
      </select>
      <input
        name="dueDate"
        type="date"
        className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
      />
      <div className="sm:col-span-2 lg:col-span-4">
        {state.error && <p className="mb-2 text-sm text-red-600">{state.error}</p>}
        <SubmitButton />
      </div>
    </form>
  );
}

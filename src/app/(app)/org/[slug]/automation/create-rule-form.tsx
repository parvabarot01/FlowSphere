"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createAutomationRule } from "@/app/(app)/org/[slug]/automation/actions";
import type { ProjectSummary } from "@/lib/projects";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
    >
      {pending ? "Creating..." : "Create rule"}
    </button>
  );
}

export function CreateRuleForm({
  orgId,
  orgSlug,
  projects,
}: {
  orgId: string;
  orgSlug: string;
  projects: ProjectSummary[];
}) {
  const createWithIds = createAutomationRule.bind(null, orgId, orgSlug);
  const [state, formAction] = useFormState(createWithIds, {});

  return (
    <form action={formAction} className="space-y-3">
      <input
        name="name"
        type="text"
        required
        placeholder="Rule name"
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
      />

      <select
        name="projectId"
        defaultValue=""
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
      >
        <option value="">All projects</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      <div className="rounded-md border border-slate-200 p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">When...</p>
        <select
          name="triggerType"
          defaultValue="task_status_changed"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        >
          <option value="task_status_changed">A task&apos;s status changes to...</option>
          <option value="task_created">A task is created with priority...</option>
        </select>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <select
            name="toStatus"
            defaultValue=""
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-slate-500 focus:outline-none"
          >
            <option value="">(status, if applicable)</option>
            <option value="todo">To do</option>
            <option value="in_progress">In progress</option>
            <option value="in_review">In review</option>
            <option value="done">Done</option>
          </select>
          <select
            name="priorityFilter"
            defaultValue=""
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-slate-500 focus:outline-none"
          >
            <option value="">(priority, if applicable)</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      <div className="rounded-md border border-slate-200 p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Then...</p>
        <select
          name="actionType"
          defaultValue="send_notification"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        >
          <option value="send_notification">Notify the task&apos;s assignee</option>
          <option value="create_task">Create a follow-up task</option>
        </select>
        <input
          name="message"
          type="text"
          placeholder="Notification message (if notifying)"
          className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
        <div className="mt-2 grid grid-cols-2 gap-2">
          <input
            name="newTaskTitle"
            type="text"
            placeholder="New task title (if creating)"
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-slate-500 focus:outline-none"
          />
          <select
            name="newTaskPriority"
            defaultValue=""
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-slate-500 focus:outline-none"
          >
            <option value="">(priority, if creating)</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}

"use client";

import { useFormStatus } from "react-dom";
import { assignTaskToSprint } from "@/app/(app)/org/[slug]/projects/[projectId]/sprints/sprint-actions";
import type { TaskSummary } from "@/lib/tasks";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
    >
      Add to sprint
    </button>
  );
}

export function AddTaskToSprintForm({
  orgId,
  orgSlug,
  projectId,
  sprintId,
  backlogTasks,
}: {
  orgId: string;
  orgSlug: string;
  projectId: string;
  sprintId: string;
  backlogTasks: TaskSummary[];
}) {
  return (
    <form
      action={assignTaskToSprint.bind(null, orgId, orgSlug, projectId, sprintId)}
      className="mt-3 flex gap-2"
    >
      <select name="taskId" required className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm">
        {backlogTasks.map((task) => (
          <option key={task.id} value={task.id}>
            {task.title}
          </option>
        ))}
      </select>
      <SubmitButton />
    </form>
  );
}

"use client";

import { assignTaskToSprint } from "@/app/(app)/org/[slug]/projects/[projectId]/sprints/sprint-actions";
import type { TaskSummary } from "@/lib/tasks";
import { SubmitButton } from "@/components/submit-button";

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
      <SubmitButton label="Add to sprint" size="sm" />
    </form>
  );
}

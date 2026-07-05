"use client";

import type { TaskSummary } from "@/lib/tasks";
import type { OrgMemberRow } from "@/lib/members";
import {
  updateTaskStatus,
  updateTaskAssignee,
  deleteTask,
} from "@/app/(app)/org/[slug]/projects/[projectId]/task-actions";

const COLUMNS: { status: TaskSummary["status"]; label: string }[] = [
  { status: "todo", label: "To do" },
  { status: "in_progress", label: "In progress" },
  { status: "in_review", label: "In review" },
  { status: "done", label: "Done" },
];

const PRIORITY_STYLES: Record<TaskSummary["priority"], string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-amber-100 text-amber-700",
  urgent: "bg-red-100 text-red-700",
};

export function TaskBoard({
  tasks,
  members,
  orgId,
  orgSlug,
  projectId,
}: {
  tasks: TaskSummary[];
  members: OrgMemberRow[];
  orgId: string;
  orgSlug: string;
  projectId: string;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {COLUMNS.map((column) => {
        const columnTasks = tasks.filter((t) => t.status === column.status);
        return (
          <div key={column.status} className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {column.label} <span className="text-slate-400">({columnTasks.length})</span>
            </h2>
            <div className="space-y-2">
              {columnTasks.map((task) => (
                <div key={task.id} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-slate-900">{task.title}</p>
                    <form action={deleteTask.bind(null, orgId, orgSlug, projectId, task.id)}>
                      <button type="submit" className="text-xs text-slate-400 hover:text-red-600">
                        ✕
                      </button>
                    </form>
                  </div>

                  <span
                    className={`mt-1 inline-block rounded px-1.5 py-0.5 text-xs ${PRIORITY_STYLES[task.priority]}`}
                  >
                    {task.priority}
                  </span>

                  {task.dueDate && (
                    <p className="mt-1 text-xs text-slate-400">
                      Due {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  )}

                  <div className="mt-2 flex flex-col gap-1.5">
                    <form action={updateTaskStatus.bind(null, orgId, orgSlug, projectId, task.id)}>
                      <select
                        name="status"
                        defaultValue={task.status}
                        onChange={(e) => e.currentTarget.form?.requestSubmit()}
                        className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
                      >
                        {COLUMNS.map((c) => (
                          <option key={c.status} value={c.status}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </form>

                    <form action={updateTaskAssignee.bind(null, orgId, orgSlug, projectId, task.id)}>
                      <select
                        name="assigneeId"
                        defaultValue={task.assigneeId ?? ""}
                        onChange={(e) => e.currentTarget.form?.requestSubmit()}
                        className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
                      >
                        <option value="">Unassigned</option>
                        {members.map((m) => (
                          <option key={m.userId} value={m.userId}>
                            {m.fullName ?? m.email}
                          </option>
                        ))}
                      </select>
                    </form>
                  </div>
                </div>
              ))}
              {columnTasks.length === 0 && <p className="text-xs text-slate-400">No tasks</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

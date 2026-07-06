"use client";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import type { TaskSummary } from "@/lib/tasks";
import type { OrgMemberRow } from "@/lib/members";
import {
  updateTaskStatus,
  updateTaskAssignee,
  deleteTask,
} from "@/app/(app)/org/[slug]/projects/[projectId]/task-actions";

const COLUMNS: { status: TaskSummary["status"]; label: string; accent: string }[] = [
  { status: "todo", label: "To do", accent: "bg-slate-300" },
  { status: "in_progress", label: "In progress", accent: "bg-indigo-400" },
  { status: "in_review", label: "In review", accent: "bg-amber-400" },
  { status: "done", label: "Done", accent: "bg-emerald-400" },
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
    <LayoutGroup>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {COLUMNS.map((column) => {
          const columnTasks = tasks.filter((t) => t.status === column.status);
          return (
            <div key={column.status} className="space-y-3">
              <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <span className={`h-2 w-2 rounded-full ${column.accent}`} />
                {column.label} <span className="text-slate-400">({columnTasks.length})</span>
              </h2>
              <div className="space-y-2">
                <AnimatePresence>
                  {columnTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      layoutId={task.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={{ y: -2 }}
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-slate-900">{task.title}</p>
                        <form action={deleteTask.bind(null, orgId, orgSlug, projectId, task.id)}>
                          <motion.button
                            type="submit"
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            className="text-xs text-slate-400 hover:text-red-600"
                          >
                            ✕
                          </motion.button>
                        </form>
                      </div>

                      <span
                        className={`mt-1 inline-block rounded px-1.5 py-0.5 text-xs ${PRIORITY_STYLES[task.priority]}`}
                      >
                        {task.priority}
                      </span>

                      {task.dueDate && (
                        <p className="mt-1 text-xs text-slate-400">
                          Due {new Date(task.dueDate).toLocaleDateString("en-US")}
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
                    </motion.div>
                  ))}
                </AnimatePresence>
                {columnTasks.length === 0 && <p className="text-xs text-slate-400">No tasks</p>}
              </div>
            </div>
          );
        })}
      </div>
    </LayoutGroup>
  );
}

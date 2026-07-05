"use client";

import { updateSprintStatus } from "@/app/(app)/org/[slug]/projects/[projectId]/sprints/sprint-actions";
import type { SprintStatus } from "@/lib/supabase/types";

export function SprintStatusForm({
  orgId,
  orgSlug,
  projectId,
  sprintId,
  status,
}: {
  orgId: string;
  orgSlug: string;
  projectId: string;
  sprintId: string;
  status: SprintStatus;
}) {
  return (
    <form action={updateSprintStatus.bind(null, orgId, orgSlug, projectId, sprintId)}>
      <select
        name="status"
        defaultValue={status}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
      >
        <option value="planned">Planned</option>
        <option value="active">Active</option>
        <option value="completed">Completed</option>
      </select>
    </form>
  );
}

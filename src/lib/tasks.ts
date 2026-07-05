import { createClient } from "@/lib/supabase/server";
import type { TaskPriority, TaskStatus } from "@/lib/supabase/types";

export type TaskSummary = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  assigneeName: string | null;
  sprintId: string | null;
  dueDate: string | null;
  createdAt: string;
};

export async function getProjectTasks(projectId: string, sprintId?: string | null): Promise<TaskSummary[]> {
  const supabase = createClient();
  let query = supabase
    .from("tasks")
    .select("id, title, description, status, priority, assignee_id, sprint_id, due_date, created_at")
    .eq("project_id", projectId);

  if (sprintId !== undefined) {
    query = sprintId === null ? query.is("sprint_id", null) : query.eq("sprint_id", sprintId);
  }

  const { data, error } = await query.order("created_at", { ascending: true });

  if (error || !data) return [];

  const assigneeIds = Array.from(
    new Set(data.map((t) => t.assignee_id).filter((id): id is string => Boolean(id)))
  );

  const { data: profiles } = assigneeIds.length
    ? await supabase.from("profiles").select("id, full_name, email").in("id", assigneeIds)
    : { data: [] as { id: string; full_name: string | null; email: string }[] };

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  return data.map((t) => {
    const assignee = t.assignee_id ? profileById.get(t.assignee_id) : undefined;
    return {
      id: t.id,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      assigneeId: t.assignee_id,
      assigneeName: assignee?.full_name ?? assignee?.email ?? null,
      sprintId: t.sprint_id,
      dueDate: t.due_date,
      createdAt: t.created_at,
    };
  });
}

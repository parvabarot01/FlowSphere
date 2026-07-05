import { createClient } from "@/lib/supabase/server";
import type { ActionItemStatus, TaskStatus } from "@/lib/supabase/types";

export type ActionItemTrackerRow = {
  id: string;
  description: string;
  status: ActionItemStatus;
  taskId: string | null;
  taskStatus: TaskStatus | null;
  meetingSummaryTitle: string;
};

export async function getProjectActionItems(projectId: string): Promise<ActionItemTrackerRow[]> {
  const supabase = createClient();

  const { data: summaries } = await supabase
    .from("meeting_summaries")
    .select("id, title")
    .eq("project_id", projectId);

  if (!summaries || summaries.length === 0) return [];

  const summaryTitleById = new Map(summaries.map((s) => [s.id, s.title]));
  const summaryIds = summaries.map((s) => s.id);

  const { data: items, error } = await supabase
    .from("action_items")
    .select("id, meeting_summary_id, description, task_id, status")
    .in("meeting_summary_id", summaryIds)
    .order("created_at", { ascending: false });

  if (error || !items || items.length === 0) return [];

  const taskIds = Array.from(new Set(items.map((i) => i.task_id).filter((id): id is string => Boolean(id))));

  const { data: tasks } = taskIds.length
    ? await supabase.from("tasks").select("id, status").in("id", taskIds)
    : { data: [] as { id: string; status: TaskStatus }[] };

  const taskStatusById = new Map((tasks ?? []).map((t) => [t.id, t.status]));

  return items.map((item) => ({
    id: item.id,
    description: item.description,
    status: item.status,
    taskId: item.task_id,
    taskStatus: item.task_id ? taskStatusById.get(item.task_id) ?? null : null,
    meetingSummaryTitle: summaryTitleById.get(item.meeting_summary_id) ?? "",
  }));
}

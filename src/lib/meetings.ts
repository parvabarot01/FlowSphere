import { createClient } from "@/lib/supabase/server";

export type MeetingActionItem = {
  id: string;
  description: string;
  taskId: string | null;
};

export type MeetingSummarySummary = {
  id: string;
  title: string;
  summary: string;
  createdAt: string;
  actionItems: MeetingActionItem[];
};

export async function getProjectMeetingSummaries(projectId: string): Promise<MeetingSummarySummary[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("meeting_summaries")
    .select("id, title, summary, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) return [];

  const summaryIds = data.map((s) => s.id);
  const { data: actionItems } = await supabase
    .from("action_items")
    .select("id, meeting_summary_id, description, task_id")
    .in("meeting_summary_id", summaryIds);

  const itemsBySummaryId = new Map<string, MeetingActionItem[]>();
  for (const item of actionItems ?? []) {
    const list = itemsBySummaryId.get(item.meeting_summary_id) ?? [];
    list.push({ id: item.id, description: item.description, taskId: item.task_id });
    itemsBySummaryId.set(item.meeting_summary_id, list);
  }

  return data.map((s) => ({
    id: s.id,
    title: s.title,
    summary: s.summary,
    createdAt: s.created_at,
    actionItems: itemsBySummaryId.get(s.id) ?? [],
  }));
}

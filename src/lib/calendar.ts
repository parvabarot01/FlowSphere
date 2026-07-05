import { createClient } from "@/lib/supabase/server";
import type { TaskPriority } from "@/lib/supabase/types";

export type CalendarTask = {
  id: string;
  title: string;
  dueDate: string;
  priority: TaskPriority;
  projectId: string;
};

export type CalendarSprint = {
  id: string;
  name: string;
  startDate: string | null;
  endDate: string | null;
  projectId: string;
};

export async function getOrgCalendarData(
  orgId: string,
  monthStart: Date,
  monthEnd: Date
): Promise<{ tasks: CalendarTask[]; sprints: CalendarSprint[] }> {
  const supabase = createClient();
  const monthStartStr = monthStart.toISOString().slice(0, 10);
  const monthEndStr = monthEnd.toISOString().slice(0, 10);

  const { data: taskRows } = await supabase
    .from("tasks")
    .select("id, title, due_date, priority, project_id")
    .eq("org_id", orgId)
    .gte("due_date", monthStartStr)
    .lte("due_date", monthEndStr);

  const { data: sprintRows } = await supabase
    .from("sprints")
    .select("id, name, start_date, end_date, project_id")
    .eq("org_id", orgId);

  const tasks: CalendarTask[] = (taskRows ?? [])
    .filter((t) => t.due_date !== null)
    .map((t) => ({
      id: t.id,
      title: t.title,
      dueDate: t.due_date as string,
      priority: t.priority,
      projectId: t.project_id,
    }));

  const sprints: CalendarSprint[] = (sprintRows ?? [])
    .filter((s) => {
      if (!s.start_date && !s.end_date) return false;
      const start = new Date(s.start_date ?? (s.end_date as string));
      const end = new Date(s.end_date ?? (s.start_date as string));
      return start <= monthEnd && end >= monthStart;
    })
    .map((s) => ({
      id: s.id,
      name: s.name,
      startDate: s.start_date,
      endDate: s.end_date,
      projectId: s.project_id,
    }));

  return { tasks, sprints };
}

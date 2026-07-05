import { createClient } from "@/lib/supabase/server";
import type { SprintStatus } from "@/lib/supabase/types";

export type SprintSummary = {
  id: string;
  name: string;
  goal: string | null;
  status: SprintStatus;
  startDate: string | null;
  endDate: string | null;
};

export async function getProjectSprints(projectId: string): Promise<SprintSummary[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sprints")
    .select("id, name, goal, status, start_date, end_date")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((s) => ({
    id: s.id,
    name: s.name,
    goal: s.goal,
    status: s.status,
    startDate: s.start_date,
    endDate: s.end_date,
  }));
}

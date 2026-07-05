import { createClient } from "@/lib/supabase/server";

export type DecisionLogEntry = {
  id: string;
  title: string;
  decision: string;
  rationale: string | null;
  decidedByName: string | null;
  createdAt: string;
};

export async function getProjectDecisions(projectId: string): Promise<DecisionLogEntry[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("decision_log")
    .select("id, title, decision, rationale, decided_by, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) return [];

  const decidedByIds = Array.from(
    new Set(data.map((d) => d.decided_by).filter((id): id is string => Boolean(id)))
  );

  const { data: profiles } = decidedByIds.length
    ? await supabase.from("profiles").select("id, full_name, email").in("id", decidedByIds)
    : { data: [] as { id: string; full_name: string | null; email: string }[] };

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  return data.map((d) => {
    const decider = d.decided_by ? profileById.get(d.decided_by) : undefined;
    return {
      id: d.id,
      title: d.title,
      decision: d.decision,
      rationale: d.rationale,
      decidedByName: decider?.full_name ?? decider?.email ?? null,
      createdAt: d.created_at,
    };
  });
}

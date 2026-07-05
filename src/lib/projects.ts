import { createClient } from "@/lib/supabase/server";

export type ProjectSummary = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
};

export async function getOrgProjects(orgId: string): Promise<ProjectSummary[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id, name, description, created_at")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    createdAt: p.created_at,
  }));
}

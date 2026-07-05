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

export type UserProjectSummary = ProjectSummary & {
  orgId: string;
  orgName: string;
  orgSlug: string;
};

/**
 * All projects across every org the signed-in user belongs to — RLS already
 * scopes the query to accessible rows, so no explicit org filter is needed.
 */
export async function getUserProjects(): Promise<UserProjectSummary[]> {
  const supabase = createClient();
  const { data: projects, error } = await supabase
    .from("projects")
    .select("id, name, description, created_at, org_id")
    .order("created_at", { ascending: false });

  if (error || !projects || projects.length === 0) return [];

  const orgIds = Array.from(new Set(projects.map((p) => p.org_id)));
  const { data: orgs } = await supabase.from("organizations").select("id, name, slug").in("id", orgIds);
  const orgById = new Map((orgs ?? []).map((o) => [o.id, o]));

  return projects.map((p) => {
    const org = orgById.get(p.org_id);
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      createdAt: p.created_at,
      orgId: p.org_id,
      orgName: org?.name ?? "Unknown org",
      orgSlug: org?.slug ?? "",
    };
  });
}

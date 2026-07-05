import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";

export type AutomationRuleSummary = {
  id: string;
  name: string;
  isActive: boolean;
  triggerType: string;
  triggerConfig: Json;
  actionType: string;
  actionConfig: Json;
  projectName: string | null;
};

export async function getOrgAutomationRules(orgId: string): Promise<AutomationRuleSummary[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("automation_rules")
    .select("id, name, is_active, trigger_type, trigger_config, action_type, action_config, project_id")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) return [];

  const projectIds = Array.from(new Set(data.map((r) => r.project_id).filter((id): id is string => Boolean(id))));

  const { data: projects } = projectIds.length
    ? await supabase.from("projects").select("id, name").in("id", projectIds)
    : { data: [] as { id: string; name: string }[] };

  const projectNameById = new Map((projects ?? []).map((p) => [p.id, p.name]));

  return data.map((r) => ({
    id: r.id,
    name: r.name,
    isActive: r.is_active,
    triggerType: r.trigger_type,
    triggerConfig: r.trigger_config,
    actionType: r.action_type,
    actionConfig: r.action_config,
    projectName: r.project_id ? projectNameById.get(r.project_id) ?? null : null,
  }));
}

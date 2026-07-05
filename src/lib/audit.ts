import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";

export type AuditLogEntry = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Json;
  createdAt: string;
  actorId: string | null;
  actorName: string | null;
  actorEmail: string | null;
};

export async function getAuditLog(orgId: string, limit = 50): Promise<AuditLogEntry[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("audit_log")
    .select("id, action, entity_type, entity_id, metadata, created_at, actor_id")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data || data.length === 0) return [];

  const actorIds = Array.from(
    new Set(data.map((row) => row.actor_id).filter((id): id is string => Boolean(id)))
  );

  const { data: profiles } = actorIds.length
    ? await supabase.from("profiles").select("id, email, full_name").in("id", actorIds)
    : { data: [] as { id: string; email: string; full_name: string | null }[] };

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  return data.map((row) => {
    const actor = row.actor_id ? profileById.get(row.actor_id) : undefined;
    return {
      id: row.id,
      action: row.action,
      entityType: row.entity_type,
      entityId: row.entity_id,
      metadata: row.metadata,
      createdAt: row.created_at,
      actorId: row.actor_id,
      actorName: actor?.full_name ?? null,
      actorEmail: actor?.email ?? null,
    };
  });
}

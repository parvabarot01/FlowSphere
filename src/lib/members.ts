import { createClient } from "@/lib/supabase/server";
import type { OrgRole } from "@/lib/supabase/types";

export type OrgMemberRow = {
  membershipId: string;
  userId: string;
  role: OrgRole;
  email: string;
  fullName: string | null;
};

export type OrgInviteRow = {
  id: string;
  email: string;
  role: "admin" | "member";
  createdAt: string;
};

export async function getOrgMembers(orgId: string): Promise<OrgMemberRow[]> {
  const supabase = createClient();

  const { data: memberships, error } = await supabase
    .from("org_members")
    .select("id, user_id, role")
    .eq("org_id", orgId);

  if (error || !memberships || memberships.length === 0) {
    return [];
  }

  const userIds = memberships.map((m) => m.user_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, full_name")
    .in("id", userIds);

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  return memberships
    .map((m) => {
      const profile = profileById.get(m.user_id);
      return {
        membershipId: m.id,
        userId: m.user_id,
        role: m.role,
        email: profile?.email ?? "unknown",
        fullName: profile?.full_name ?? null,
      };
    })
    .sort((a, b) => (a.fullName ?? a.email).localeCompare(b.fullName ?? b.email));
}

export async function getPendingInvites(orgId: string): Promise<OrgInviteRow[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("org_invites")
    .select("id, email, role, created_at")
    .eq("org_id", orgId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    email: row.email,
    role: row.role,
    createdAt: row.created_at,
  }));
}

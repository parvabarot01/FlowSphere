import { createClient } from "@/lib/supabase/server";
import type { OrgRole } from "@/lib/supabase/types";

export type UserOrgSummary = {
  id: string;
  name: string;
  slug: string;
  role: OrgRole;
};

export async function getUserOrganizations(): Promise<UserOrgSummary[]> {
  const supabase = createClient();

  const { data: memberships, error: membershipError } = await supabase
    .from("org_members")
    .select("org_id, role");

  if (membershipError || !memberships || memberships.length === 0) {
    return [];
  }

  const orgIds = memberships.map((m) => m.org_id);
  const { data: orgs, error: orgsError } = await supabase
    .from("organizations")
    .select("id, name, slug")
    .in("id", orgIds);

  if (orgsError || !orgs) {
    return [];
  }

  const roleByOrgId = new Map(memberships.map((m) => [m.org_id, m.role]));

  return orgs
    .map((org) => ({ ...org, role: roleByOrgId.get(org.id)! }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

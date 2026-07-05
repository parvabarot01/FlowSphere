import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserOrganizations } from "@/lib/orgs";
import { getOrgMembers, getPendingInvites } from "@/lib/members";
import { InviteMemberForm } from "@/app/(app)/org/[slug]/members/invite-member-form";
import { MembersTable } from "@/app/(app)/org/[slug]/members/members-table";
import { PendingInvitesList } from "@/app/(app)/org/[slug]/members/pending-invites-list";

export default async function MembersPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: org } = await supabase
    .from("organizations")
    .select("id, name, slug")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!org) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [orgs, members, invites] = await Promise.all([
    getUserOrganizations(),
    getOrgMembers(org.id),
    getPendingInvites(org.id),
  ]);

  const membership = orgs.find((o) => o.id === org.id);
  const isAdmin = membership?.role === "owner" || membership?.role === "admin";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Members</h1>
        <p className="mt-1 text-sm text-slate-500">
          {members.length} member{members.length === 1 ? "" : "s"} in {org.name}.
        </p>
      </div>

      <MembersTable
        members={members}
        currentUserId={user!.id}
        isAdmin={isAdmin}
        orgId={org.id}
        orgSlug={org.slug}
      />

      {isAdmin && (
        <>
          <PendingInvitesList invites={invites} orgId={org.id} orgSlug={org.slug} />

          <div className="max-w-sm rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-900">Invite a teammate</h2>
            <InviteMemberForm orgId={org.id} orgSlug={org.slug} orgName={org.name} />
          </div>
        </>
      )}
    </div>
  );
}

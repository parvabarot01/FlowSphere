import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserOrganizations } from "@/lib/orgs";
import { UpdateOrgNameForm } from "@/app/(app)/org/[slug]/settings/update-org-name-form";

export default async function OrgSettingsPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: org } = await supabase
    .from("organizations")
    .select("id, name, slug")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!org) {
    notFound();
  }

  const orgs = await getUserOrganizations();
  const membership = orgs.find((o) => o.id === org.id);

  if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
    redirect(`/org/${params.slug}`);
  }

  return (
    <div className="max-w-md space-y-6">
      <h1 className="text-lg font-semibold text-slate-900">Organization settings</h1>
      <UpdateOrgNameForm orgId={org.id} slug={org.slug} initialName={org.name} />
    </div>
  );
}

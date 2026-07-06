import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserOrganizations } from "@/lib/orgs";
import { OrgSwitcher } from "@/app/(app)/org/org-switcher";
import { OrgNav } from "@/app/(app)/org/[slug]/org-nav";

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const supabase = createClient();
  const { data: org, error } = await supabase
    .from("organizations")
    .select("id, name, slug")
    .eq("slug", params.slug)
    .maybeSingle();

  if (error || !org) {
    notFound();
  }

  const orgs = await getUserOrganizations();
  const membership = orgs.find((o) => o.id === org.id);
  const isAdmin = membership?.role === "owner" || membership?.role === "admin";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <OrgSwitcher orgs={orgs} currentSlug={org.slug} />
        <OrgNav orgSlug={org.slug} isAdmin={isAdmin} />
      </div>
      {children}
    </div>
  );
}

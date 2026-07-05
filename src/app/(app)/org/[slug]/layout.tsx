import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserOrganizations } from "@/lib/orgs";
import { OrgSwitcher } from "@/app/(app)/org/org-switcher";

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
        <nav className="flex gap-4 text-sm font-medium text-slate-600">
          <Link href={`/org/${org.slug}`} className="hover:text-slate-900">
            Projects
          </Link>
          <Link href={`/org/${org.slug}/members`} className="hover:text-slate-900">
            Members
          </Link>
          <Link href={`/org/${org.slug}/calendar`} className="hover:text-slate-900">
            Calendar
          </Link>
          <Link href={`/org/${org.slug}/kb`} className="hover:text-slate-900">
            Knowledge Base
          </Link>
          {isAdmin && (
            <Link href={`/org/${org.slug}/audit-log`} className="hover:text-slate-900">
              Audit Log
            </Link>
          )}
          {isAdmin && (
            <Link href={`/org/${org.slug}/settings`} className="hover:text-slate-900">
              Settings
            </Link>
          )}
        </nav>
      </div>
      {children}
    </div>
  );
}

import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgAutomationRules } from "@/lib/automation-rules";
import { getOrgProjects } from "@/lib/projects";
import { getUserOrganizations } from "@/lib/orgs";
import { CreateRuleForm } from "@/app/(app)/org/[slug]/automation/create-rule-form";
import { RuleList } from "@/app/(app)/org/[slug]/automation/rule-list";

export default async function AutomationPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: org } = await supabase
    .from("organizations")
    .select("id, name, slug")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!org) {
    notFound();
  }

  const [rules, projects, orgs] = await Promise.all([
    getOrgAutomationRules(org.id),
    getOrgProjects(org.id),
    getUserOrganizations(),
  ]);

  const membership = orgs.find((o) => o.id === org.id);
  const isAdmin = membership?.role === "owner" || membership?.role === "admin";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Automation</h1>
        <p className="mt-1 text-sm text-slate-500">Trigger→action rules that run automatically as work happens.</p>
      </div>

      {rules.length > 0 && <RuleList orgId={org.id} orgSlug={org.slug} rules={rules} canManage={isAdmin} />}
      {rules.length === 0 && <p className="text-sm text-slate-500">No automation rules yet.</p>}

      <div className="max-w-lg rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">New rule</h2>
        <div className="mt-3">
          <CreateRuleForm orgId={org.id} orgSlug={org.slug} projects={projects} />
        </div>
      </div>
    </div>
  );
}

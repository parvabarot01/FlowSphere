import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProjectReports } from "@/lib/reports";
import { RequestReportForm } from "@/app/(app)/org/[slug]/projects/[projectId]/reports/request-report-form";
import { ReportCard } from "@/app/(app)/org/[slug]/projects/[projectId]/reports/report-card";

export default async function ReportsPage({
  params,
}: {
  params: { slug: string; projectId: string };
}) {
  const supabase = createClient();
  const { data: org } = await supabase
    .from("organizations")
    .select("id, slug")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!org) {
    notFound();
  }

  const { data: project } = await supabase
    .from("projects")
    .select("id, name")
    .eq("id", params.projectId)
    .eq("org_id", org.id)
    .maybeSingle();

  if (!project) {
    notFound();
  }

  const reports = await getProjectReports(project.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Executive reports — {project.name}</h1>
        <p className="mt-1 text-sm text-slate-500">
          AI-generated from this project&apos;s current tasks and sprints. New reports run in the background and
          appear here once ready.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <RequestReportForm orgId={org.id} orgSlug={org.slug} projectId={project.id} projectName={project.name} />
      </div>

      {reports.length > 0 ? (
        <div className="space-y-3">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">No reports yet.</p>
      )}
    </div>
  );
}

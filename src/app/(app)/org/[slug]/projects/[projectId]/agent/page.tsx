import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AgentDraftForm } from "@/app/(app)/org/[slug]/projects/[projectId]/agent/agent-draft-form";

export default async function AgentPage({
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Department agent — {project.name}</h1>
        <p className="mt-1 text-sm text-slate-500">
          Ask a department agent to draft a sprint plan or backlog, grounded in this project&apos;s existing tasks.
        </p>
      </div>

      <div className="max-w-2xl rounded-lg border border-slate-200 bg-white p-5">
        <AgentDraftForm orgId={org.id} projectId={project.id} projectName={project.name} />
      </div>
    </div>
  );
}

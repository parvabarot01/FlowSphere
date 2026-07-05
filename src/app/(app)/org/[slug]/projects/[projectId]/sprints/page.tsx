import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProjectSprints } from "@/lib/sprints";
import { CreateSprintForm } from "@/app/(app)/org/[slug]/projects/[projectId]/sprints/create-sprint-form";

const STATUS_STYLES: Record<string, string> = {
  planned: "bg-slate-100 text-slate-600",
  active: "bg-emerald-100 text-emerald-700",
  completed: "bg-blue-100 text-blue-700",
};

export default async function SprintsPage({
  params,
}: {
  params: { slug: string; projectId: string };
}) {
  const supabase = createClient();
  const { data: org } = await supabase
    .from("organizations")
    .select("id, name, slug")
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

  const sprints = await getProjectSprints(project.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Sprints — {project.name}</h1>
        <p className="mt-1 text-sm text-slate-500">Plan work in time-boxed sprints.</p>
      </div>

      {sprints.length > 0 && (
        <ul className="space-y-2">
          {sprints.map((sprint) => (
            <li key={sprint.id}>
              <Link
                href={`/org/${org.slug}/projects/${project.id}/sprints/${sprint.id}`}
                className="block rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-400"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-slate-900">{sprint.name}</p>
                  <span className={`rounded px-1.5 py-0.5 text-xs uppercase tracking-wide ${STATUS_STYLES[sprint.status]}`}>
                    {sprint.status}
                  </span>
                </div>
                {sprint.goal && <p className="mt-1 text-sm text-slate-500">{sprint.goal}</p>}
                {(sprint.startDate || sprint.endDate) && (
                  <p className="mt-1 text-xs text-slate-400">
                    {sprint.startDate ? new Date(sprint.startDate).toLocaleDateString() : "?"} →{" "}
                    {sprint.endDate ? new Date(sprint.endDate).toLocaleDateString() : "?"}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="max-w-md rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Create a sprint</h2>
        <CreateSprintForm orgId={org.id} orgSlug={org.slug} projectId={project.id} />
      </div>
    </div>
  );
}

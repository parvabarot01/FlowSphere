import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProjectTasks } from "@/lib/tasks";
import { getOrgMembers } from "@/lib/members";
import { CreateTaskForm } from "@/app/(app)/org/[slug]/projects/[projectId]/create-task-form";
import { TaskBoard } from "@/app/(app)/org/[slug]/projects/[projectId]/task-board";

export default async function ProjectPage({
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
    .select("id, name, description")
    .eq("id", params.projectId)
    .eq("org_id", org.id)
    .maybeSingle();

  if (!project) {
    notFound();
  }

  const [tasks, members] = await Promise.all([getProjectTasks(project.id), getOrgMembers(org.id)]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">{project.name}</h1>
          {project.description && <p className="mt-1 text-sm text-slate-500">{project.description}</p>}
        </div>
        <div className="flex shrink-0 gap-2">
          <Link
            href={`/org/${org.slug}/projects/${project.id}/sprints`}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Sprints
          </Link>
          <Link
            href={`/org/${org.slug}/projects/${project.id}/meetings`}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Meetings
          </Link>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-900">New task</h2>
        <CreateTaskForm orgId={org.id} orgSlug={org.slug} projectId={project.id} members={members} />
      </div>

      <TaskBoard tasks={tasks} members={members} orgId={org.id} orgSlug={org.slug} projectId={project.id} />
    </div>
  );
}

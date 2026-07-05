import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProjectTasks } from "@/lib/tasks";
import { getOrgMembers } from "@/lib/members";
import { TaskBoard } from "@/app/(app)/org/[slug]/projects/[projectId]/task-board";
import { SprintStatusForm } from "@/app/(app)/org/[slug]/projects/[projectId]/sprints/[sprintId]/sprint-status-form";
import { AddTaskToSprintForm } from "@/app/(app)/org/[slug]/projects/[projectId]/sprints/[sprintId]/add-task-to-sprint-form";

export default async function SprintPage({
  params,
}: {
  params: { slug: string; projectId: string; sprintId: string };
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

  const { data: sprint } = await supabase
    .from("sprints")
    .select("id, name, goal, status, start_date, end_date")
    .eq("id", params.sprintId)
    .eq("project_id", project.id)
    .maybeSingle();

  if (!sprint) {
    notFound();
  }

  const [sprintTasks, backlogTasks, members] = await Promise.all([
    getProjectTasks(project.id, sprint.id),
    getProjectTasks(project.id, null),
    getOrgMembers(org.id),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">{sprint.name}</h1>
          {sprint.goal && <p className="mt-1 text-sm text-slate-500">{sprint.goal}</p>}
          {(sprint.start_date || sprint.end_date) && (
            <p className="mt-1 text-xs text-slate-400">
              {sprint.start_date ? new Date(sprint.start_date).toLocaleDateString() : "?"} →{" "}
              {sprint.end_date ? new Date(sprint.end_date).toLocaleDateString() : "?"}
            </p>
          )}
        </div>
        <SprintStatusForm
          orgId={org.id}
          orgSlug={org.slug}
          projectId={project.id}
          sprintId={sprint.id}
          status={sprint.status}
        />
      </div>

      {backlogTasks.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-900">Add a task from the backlog</h2>
          <AddTaskToSprintForm
            orgId={org.id}
            orgSlug={org.slug}
            projectId={project.id}
            sprintId={sprint.id}
            backlogTasks={backlogTasks}
          />
        </div>
      )}

      <TaskBoard tasks={sprintTasks} members={members} orgId={org.id} orgSlug={org.slug} projectId={project.id} />
    </div>
  );
}

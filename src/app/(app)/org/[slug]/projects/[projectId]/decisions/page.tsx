import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProjectDecisions } from "@/lib/decisions";
import { getProjectActionItems } from "@/lib/action-items";
import { getProjectMeetingSummaries } from "@/lib/meetings";
import { CreateDecisionForm } from "@/app/(app)/org/[slug]/projects/[projectId]/decisions/create-decision-form";
import { dismissActionItem } from "@/app/(app)/org/[slug]/projects/[projectId]/decisions/actions";
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list";

const TASK_STATUS_LABEL: Record<string, string> = {
  todo: "To do",
  in_progress: "In progress",
  in_review: "In review",
  done: "Done",
};

export default async function DecisionsPage({
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

  const [decisions, actionItems, meetingSummaries] = await Promise.all([
    getProjectDecisions(project.id),
    getProjectActionItems(project.id),
    getProjectMeetingSummaries(project.id),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Decisions & action items — {project.name}</h1>
        <p className="mt-1 text-sm text-slate-500">
          Decisions logged for this project, and every action item extracted from a meeting summary.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">Action item tracker</h2>
        {actionItems.length > 0 ? (
          <StaggerList className="space-y-2">
            {actionItems.map((item) => (
              <StaggerItem
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
              >
                <div>
                  <p className="text-sm text-slate-900">{item.description}</p>
                  <p className="mt-0.5 text-xs text-slate-400">From: {item.meetingSummaryTitle}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {item.taskStatus && (
                    <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700">
                      {TASK_STATUS_LABEL[item.taskStatus] ?? item.taskStatus}
                    </span>
                  )}
                  {item.status === "dismissed" && (
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">Dismissed</span>
                  )}
                  {item.status === "pending" && (
                    <form action={dismissActionItem.bind(null, org.id, org.slug, project.id, item.id)}>
                      <button type="submit" className="text-xs text-slate-400 hover:text-red-600">
                        Dismiss
                      </button>
                    </form>
                  )}
                </div>
              </StaggerItem>
            ))}
          </StaggerList>
        ) : (
          <p className="text-sm text-slate-500">No action items yet — summarize a meeting transcript to generate some.</p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">Decision log</h2>
        {decisions.length > 0 && (
          <StaggerList className="space-y-2">
            {decisions.map((d) => (
              <StaggerItem key={d.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-slate-900">{d.title}</p>
                  <span className="text-xs text-slate-400">{new Date(d.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{d.decision}</p>
                {d.rationale && <p className="mt-1 text-xs text-slate-400">Why: {d.rationale}</p>}
                {d.decidedByName && <p className="mt-1 text-xs text-slate-400">Decided by {d.decidedByName}</p>}
              </StaggerItem>
            ))}
          </StaggerList>
        )}

        <div className="max-w-md rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900">Log a decision</h3>
          <div className="mt-3">
            <CreateDecisionForm
              orgId={org.id}
              orgSlug={org.slug}
              projectId={project.id}
              meetingSummaries={meetingSummaries}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

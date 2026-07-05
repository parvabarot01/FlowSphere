import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProjectMeetingSummaries } from "@/lib/meetings";
import { SummarizeTranscriptForm } from "@/app/(app)/org/[slug]/projects/[projectId]/meetings/summarize-transcript-form";
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list";

export default async function MeetingsPage({
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

  const summaries = await getProjectMeetingSummaries(project.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Meeting summaries — {project.name}</h1>
        <p className="mt-1 text-sm text-slate-500">
          Paste a transcript to get an AI summary; action items are added to the task tracker automatically.
        </p>
      </div>

      <div className="max-w-2xl rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Summarize a transcript</h2>
        <SummarizeTranscriptForm orgId={org.id} orgSlug={org.slug} projectId={project.id} />
      </div>

      {summaries.length > 0 && (
        <StaggerList className="space-y-3">
          {summaries.map((s) => (
            <StaggerItem key={s.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between">
                <p className="font-medium text-slate-900">{s.title}</p>
                <span className="text-xs text-slate-400">{new Date(s.createdAt).toLocaleString()}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{s.summary}</p>
              {s.actionItems.length > 0 && (
                <div className="mt-3 border-t border-slate-100 pt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Action items</p>
                  <ul className="mt-1 space-y-1">
                    {s.actionItems.map((item) => (
                      <li key={item.id} className="text-sm text-slate-600">
                        {item.taskId ? (
                          <Link
                            href={`/org/${org.slug}/projects/${project.id}`}
                            className="text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-500"
                          >
                            {item.description}
                          </Link>
                        ) : (
                          item.description
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </StaggerItem>
          ))}
        </StaggerList>
      )}
    </div>
  );
}

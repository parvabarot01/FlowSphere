"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getProjectTasks } from "@/lib/tasks";
import { getProjectSprints } from "@/lib/sprints";
import { triggerReportGeneration } from "@/lib/reports/trigger";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

const requestReportSchema = z.object({
  reportType: z.enum(["weekly_update", "health_score", "risk_analysis", "dependency_graph"]),
});

export type ReportActionState = { error?: string };

export async function requestReport(
  orgId: string,
  orgSlug: string,
  projectId: string,
  projectName: string,
  _prevState: ReportActionState,
  formData: FormData
): Promise<ReportActionState> {
  const parsed = requestReportSchema.safeParse({ reportType: formData.get("reportType") });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  // Groq's free tier is rate-limited account-wide, so per-user throttling here
  // protects the shared quota from being exhausted by rapid submissions.
  const { success } = await rateLimit("ai-agent", user.id, 10, "60 s");
  if (!success) {
    return { error: "Too many AI requests — please wait a minute and try again." };
  }

  const [tasks, sprints] = await Promise.all([getProjectTasks(projectId), getProjectSprints(projectId)]);

  const contextText = [
    `Project: ${projectName}`,
    `Sprints (${sprints.length}):`,
    sprints.map((s) => `- [${s.status}] ${s.name}${s.endDate ? ` (ends ${s.endDate})` : ""}`).join("\n") || "(none)",
    "",
    `Tasks (${tasks.length}):`,
    tasks
      .map((t) => `- [${t.status}/${t.priority}] ${t.title}${t.dueDate ? ` (due ${t.dueDate})` : ""}`)
      .join("\n") || "(none)",
  ].join("\n");

  await triggerReportGeneration({
    orgId,
    projectId,
    reportType: parsed.data.reportType,
    contextText,
  });

  revalidatePath(`/org/${orgSlug}/projects/${projectId}/reports`);
  return {};
}

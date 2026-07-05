import { registerJobHandler } from "@/lib/jobs/registry";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { generateReportContent } from "@/lib/ai/report-generation";
import type { AiReportType } from "@/lib/supabase/types";

export type GenerateReportEvent = {
  orgId: string;
  projectId: string;
  reportType: AiReportType;
  contextText: string;
};

/**
 * Runs as a background job (or inline, in dev without QStash configured).
 * Best-effort: on failure there's no user waiting synchronously, so it just
 * doesn't produce a report row rather than surfacing an error anywhere.
 */
async function generateReportJob(event: GenerateReportEvent): Promise<void> {
  const outcome = await generateReportContent(event.reportType, event.contextText);
  if (!outcome.success) return;

  const supabase = createServiceRoleClient();
  await supabase.from("ai_reports").insert({
    org_id: event.orgId,
    project_id: event.projectId,
    report_type: event.reportType,
    content: outcome.content as never,
  });
}

registerJobHandler<GenerateReportEvent>("ai_report.generate", generateReportJob);

export { generateReportJob };

// Side-effect import: registers the "ai_report.generate" job handler before
// any triggerReportGeneration() call can reach publishJob(), so the dev
// inline fallback (no QStash configured) always finds a handler.
import "@/lib/reports/engine";
import { publishJob } from "@/lib/qstash";
import type { GenerateReportEvent } from "@/lib/reports/engine";

export async function triggerReportGeneration(event: GenerateReportEvent): Promise<void> {
  await publishJob("ai_report.generate", event);
}

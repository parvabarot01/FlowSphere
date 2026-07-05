// Side-effect import: registers the "automation.evaluate" job handler before
// any triggerAutomation() call can reach publishJob(), so the dev inline
// fallback (no QStash configured) always finds a handler.
import "@/lib/automation/engine";
import { publishJob } from "@/lib/qstash";
import type { AutomationEvent } from "@/lib/automation/engine";

export async function triggerAutomation(event: AutomationEvent): Promise<void> {
  await publishJob("automation.evaluate", event);
}

import { Client } from "@upstash/qstash";
import { env } from "@/lib/env";
import { getJobHandler } from "@/lib/jobs/registry";

const token = process.env.QSTASH_TOKEN;
const qstash = token ? new Client({ token }) : null;

/**
 * Enqueues a background job. When QStash isn't configured yet (no
 * QSTASH_TOKEN), runs the job inline instead of queueing it, so local
 * development and free-tier deploys without QStash set up still work
 * end-to-end — just synchronously rather than in the background.
 */
export async function publishJob(type: string, payload: unknown): Promise<{ success: boolean; error?: string }> {
  if (!qstash) {
    const handler = getJobHandler(type);
    if (!handler) {
      return { success: false, error: `No handler registered for job type "${type}".` };
    }
    try {
      await handler(payload);
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Job failed." };
    }
  }

  try {
    await qstash.publishJSON({
      url: `${env.appUrl}/api/jobs`,
      body: { type, payload },
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to enqueue job." };
  }
}

export const isQstashConfigured = Boolean(token);

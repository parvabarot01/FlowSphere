"use server";

import { revalidatePath } from "next/cache";
import { summarizeTranscriptSchema } from "@/lib/validations/meeting";
import { summarizeMeetingTranscript } from "@/lib/ai/meeting-summary";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

export type SummarizeTranscriptState = { error?: string };

export async function summarizeTranscript(
  orgId: string,
  orgSlug: string,
  projectId: string,
  _prevState: SummarizeTranscriptState,
  formData: FormData
): Promise<SummarizeTranscriptState> {
  const parsed = summarizeTranscriptSchema.safeParse({
    title: formData.get("title"),
    transcript: formData.get("transcript"),
  });

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

  const outcome = await summarizeMeetingTranscript(parsed.data.transcript);
  if (!outcome.success) {
    return { error: outcome.error };
  }

  const { data: meetingSummary, error: insertError } = await supabase
    .from("meeting_summaries")
    .insert({
      org_id: orgId,
      project_id: projectId,
      title: parsed.data.title,
      raw_transcript: parsed.data.transcript,
      summary: outcome.result.summary,
      created_by: user?.id,
    })
    .select("id")
    .single();

  if (insertError || !meetingSummary) {
    return { error: insertError?.message ?? "Failed to save meeting summary" };
  }

  for (const description of outcome.result.actionItems) {
    const { data: task } = await supabase
      .from("tasks")
      .insert({
        org_id: orgId,
        project_id: projectId,
        title: description.slice(0, 200),
        created_by: user?.id,
      })
      .select("id")
      .single();

    await supabase.from("action_items").insert({
      org_id: orgId,
      meeting_summary_id: meetingSummary.id,
      description,
      task_id: task?.id ?? null,
      status: task ? "added" : "pending",
    });
  }

  await supabase.rpc("log_audit_event", {
    p_org_id: orgId,
    p_action: "meeting_summary.created",
    p_entity_type: "meeting_summary",
    p_entity_id: meetingSummary.id,
    p_metadata: { title: parsed.data.title, action_item_count: outcome.result.actionItems.length },
  });

  revalidatePath(`/org/${orgSlug}/projects/${projectId}/meetings`);
  return {};
}

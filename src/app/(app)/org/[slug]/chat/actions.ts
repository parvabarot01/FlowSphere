"use server";

import { redirect } from "next/navigation";
import { createThreadSchema, postMessageSchema } from "@/lib/validations/chat";
import { createClient } from "@/lib/supabase/server";

export type ChatActionState = { error?: string };

export async function createThread(
  orgId: string,
  orgSlug: string,
  _prevState: ChatActionState,
  formData: FormData
): Promise<ChatActionState> {
  const parsed = createThreadSchema.safeParse({ title: formData.get("title") });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: thread, error } = await supabase
    .from("chat_threads")
    .insert({ org_id: orgId, title: parsed.data.title, created_by: user?.id })
    .select("id")
    .single();

  if (error || !thread) {
    return { error: error?.message ?? "Failed to create thread" };
  }

  redirect(`/org/${orgSlug}/chat/${thread.id}`);
}

export async function postMessage(orgId: string, threadId: string, formData: FormData): Promise<void> {
  const parsed = postMessageSchema.safeParse({ body: formData.get("body") });
  if (!parsed.success) return;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase.from("chat_messages").insert({
    org_id: orgId,
    thread_id: threadId,
    author_id: user.id,
    body: parsed.data.body,
  });
}

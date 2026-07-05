import { createClient } from "@/lib/supabase/server";

export type ChatThreadSummary = {
  id: string;
  title: string;
  createdAt: string;
};

export type ChatMessageRow = {
  id: string;
  authorId: string | null;
  authorName: string;
  body: string;
  createdAt: string;
};

export async function getOrgChatThreads(orgId: string): Promise<ChatThreadSummary[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("chat_threads")
    .select("id, title, created_at")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((t) => ({ id: t.id, title: t.title, createdAt: t.created_at }));
}

export async function getChatThread(orgId: string, threadId: string): Promise<ChatThreadSummary | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("chat_threads")
    .select("id, title, created_at")
    .eq("org_id", orgId)
    .eq("id", threadId)
    .maybeSingle();

  if (error || !data) return null;

  return { id: data.id, title: data.title, createdAt: data.created_at };
}

export async function getThreadMessages(threadId: string): Promise<ChatMessageRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("chat_messages")
    .select("id, author_id, body, created_at")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (error || !data || data.length === 0) return [];

  const authorIds = Array.from(new Set(data.map((m) => m.author_id).filter((id): id is string => Boolean(id))));

  const { data: profiles } = authorIds.length
    ? await supabase.from("profiles").select("id, full_name, email").in("id", authorIds)
    : { data: [] as { id: string; full_name: string | null; email: string }[] };

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p.full_name ?? p.email]));

  return data.map((m) => ({
    id: m.id,
    authorId: m.author_id,
    authorName: m.author_id ? profileById.get(m.author_id) ?? "Unknown" : "Unknown",
    body: m.body,
    createdAt: m.created_at,
  }));
}

import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getChatThread, getThreadMessages } from "@/lib/chat";
import { getOrgMembers } from "@/lib/members";
import { ChatThreadView } from "@/app/(app)/org/[slug]/chat/[threadId]/chat-thread-view";

export default async function ChatThreadPage({
  params,
}: {
  params: { slug: string; threadId: string };
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

  const thread = await getChatThread(org.id, params.threadId);

  if (!thread) {
    notFound();
  }

  const [messages, members] = await Promise.all([getThreadMessages(thread.id), getOrgMembers(org.id)]);

  const authorNamesById = Object.fromEntries(members.map((m) => [m.userId, m.fullName ?? m.email]));

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-lg font-semibold text-slate-900">{thread.title}</h1>
      <ChatThreadView orgId={org.id} threadId={thread.id} initialMessages={messages} authorNamesById={authorNamesById} />
    </div>
  );
}

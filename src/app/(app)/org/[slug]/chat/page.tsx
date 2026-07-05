import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgChatThreads } from "@/lib/chat";
import { CreateThreadForm } from "@/app/(app)/org/[slug]/chat/create-thread-form";
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list";

export default async function ChatPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: org } = await supabase
    .from("organizations")
    .select("id, name, slug")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!org) {
    notFound();
  }

  const threads = await getOrgChatThreads(org.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Chat</h1>
        <p className="mt-1 text-sm text-slate-500">Cross-team threads for {org.name}.</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <CreateThreadForm orgId={org.id} orgSlug={org.slug} />
      </div>

      {threads.length > 0 ? (
        <StaggerList className="space-y-2">
          {threads.map((thread) => (
            <StaggerItem key={thread.id}>
              <Link
                href={`/org/${org.slug}/chat/${thread.id}`}
                className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:border-slate-400 hover:shadow-md"
              >
                <p className="font-medium text-slate-900">{thread.title}</p>
                <p className="mt-1 text-xs text-slate-400">Started {new Date(thread.createdAt).toLocaleDateString()}</p>
              </Link>
            </StaggerItem>
          ))}
        </StaggerList>
      ) : (
        <p className="text-sm text-slate-500">No threads yet.</p>
      )}
    </div>
  );
}

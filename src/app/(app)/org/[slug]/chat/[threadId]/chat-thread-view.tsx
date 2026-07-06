"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { postMessage } from "@/app/(app)/org/[slug]/chat/actions";
import type { ChatMessageRow } from "@/lib/chat";

export function ChatThreadView({
  orgId,
  threadId,
  initialMessages,
  authorNamesById,
}: {
  orgId: string;
  threadId: string;
  initialMessages: ChatMessageRow[];
  authorNamesById: Record<string, string>;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`chat_messages:${threadId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `thread_id=eq.${threadId}` },
        (payload) => {
          const row = payload.new as { id: string; author_id: string | null; body: string; created_at: string };
          setMessages((prev) =>
            prev.some((m) => m.id === row.id)
              ? prev
              : [
                  ...prev,
                  {
                    id: row.id,
                    authorId: row.author_id,
                    authorName: (row.author_id && authorNamesById[row.author_id]) || "Unknown",
                    body: row.body,
                    createdAt: row.created_at,
                  },
                ]
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId, authorNamesById]);

  return (
    <div className="space-y-4">
      <ul className="max-h-[28rem] space-y-3 overflow-y-auto rounded-lg border border-slate-200 bg-white p-4">
        {messages.length === 0 && <p className="text-sm text-slate-400">No messages yet — say hello.</p>}
        {messages.map((m) => (
          <li key={m.id}>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-medium text-slate-900">{m.authorName}</span>
              <span className="text-xs text-slate-400">{new Date(m.createdAt).toLocaleString()}</span>
            </div>
            <p className="whitespace-pre-wrap text-sm text-slate-600">{m.body}</p>
          </li>
        ))}
      </ul>

      <form
        ref={formRef}
        action={async (formData) => {
          await postMessage(orgId, threadId, formData);
          formRef.current?.reset();
        }}
        className="flex gap-2"
      >
        <input
          name="body"
          type="text"
          required
          placeholder="Write a message..."
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-md bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-indigo-600/20 hover:from-indigo-500 hover:to-violet-500"
        >
          Send
        </button>
      </form>
    </div>
  );
}

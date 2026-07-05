"use client";

import { useFormState } from "react-dom";
import { createThread } from "@/app/(app)/org/[slug]/chat/actions";
import { SubmitButton } from "@/components/submit-button";

export function CreateThreadForm({ orgId, orgSlug }: { orgId: string; orgSlug: string }) {
  const createWithIds = createThread.bind(null, orgId, orgSlug);
  const [state, formAction] = useFormState(createWithIds, {});

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-3">
      <input
        name="title"
        type="text"
        required
        placeholder="New thread title"
        className="min-w-[16rem] flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
      />
      <SubmitButton label="Start thread" pendingLabel="Creating..." />
      {state.error && <p className="w-full text-sm text-red-600">{state.error}</p>}
    </form>
  );
}

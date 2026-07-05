"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createThread } from "@/app/(app)/org/[slug]/chat/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
    >
      {pending ? "Creating..." : "Start thread"}
    </button>
  );
}

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
      <SubmitButton />
      {state.error && <p className="w-full text-sm text-red-600">{state.error}</p>}
    </form>
  );
}

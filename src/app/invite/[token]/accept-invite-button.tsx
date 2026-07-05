"use client";

import { useFormStatus } from "react-dom";
import { acceptInvite } from "@/app/invite/[token]/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
    >
      {pending ? "Joining..." : "Accept invite"}
    </button>
  );
}

export function AcceptInviteButton({ token }: { token: string }) {
  return (
    <form action={acceptInvite.bind(null, token)}>
      <SubmitButton />
    </form>
  );
}

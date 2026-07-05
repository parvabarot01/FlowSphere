"use client";

import { acceptInvite } from "@/app/invite/[token]/actions";
import { SubmitButton } from "@/components/submit-button";

export function AcceptInviteButton({ token }: { token: string }) {
  return (
    <form action={acceptInvite.bind(null, token)}>
      <SubmitButton label="Accept invite" pendingLabel="Joining..." />
    </form>
  );
}

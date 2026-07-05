"use client";

import type { OrgInviteRow } from "@/lib/members";
import { revokeInvite } from "@/app/(app)/org/[slug]/members/actions";

export function PendingInvitesList({
  invites,
  orgId,
  orgSlug,
}: {
  invites: OrgInviteRow[];
  orgId: string;
  orgSlug: string;
}) {
  if (invites.length === 0) return null;

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-slate-900">Pending invites</h2>
      <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
        {invites.map((invite) => (
          <li key={invite.id} className="flex items-center justify-between px-4 py-2 text-sm">
            <span className="text-slate-700">
              {invite.email}{" "}
              <span className="text-xs uppercase tracking-wide text-slate-400">({invite.role})</span>
            </span>
            <form action={revokeInvite.bind(null, orgId, orgSlug, invite.id)}>
              <button type="submit" className="text-xs text-red-600 hover:underline">
                Revoke
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}

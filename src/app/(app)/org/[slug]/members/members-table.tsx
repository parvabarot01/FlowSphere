"use client";

import type { OrgMemberRow } from "@/lib/members";
import { updateMemberRole, removeMember } from "@/app/(app)/org/[slug]/members/actions";

export function MembersTable({
  members,
  currentUserId,
  isAdmin,
  orgId,
  orgSlug,
}: {
  members: OrgMemberRow[];
  currentUserId: string;
  isAdmin: boolean;
  orgId: string;
  orgSlug: string;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Role</th>
            {isAdmin && <th className="px-4 py-2" />}
          </tr>
        </thead>
        <tbody>
          {members.map((member) => {
            const isSelf = member.userId === currentUserId;
            return (
              <tr key={member.membershipId} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-2 text-slate-900">{member.fullName ?? "—"}</td>
                <td className="px-4 py-2 text-slate-500">{member.email}</td>
                <td className="px-4 py-2">
                  {isAdmin && !isSelf ? (
                    <form action={updateMemberRole.bind(null, orgId, orgSlug, member.membershipId)}>
                      <select
                        name="role"
                        defaultValue={member.role}
                        onChange={(e) => e.currentTarget.form?.requestSubmit()}
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                      >
                        <option value="owner">Owner</option>
                        <option value="admin">Admin</option>
                        <option value="member">Member</option>
                      </select>
                    </form>
                  ) : (
                    <span className="text-xs uppercase tracking-wide text-slate-400">{member.role}</span>
                  )}
                </td>
                {isAdmin && (
                  <td className="px-4 py-2 text-right">
                    {!isSelf && (
                      <form action={removeMember.bind(null, orgId, orgSlug, member.membershipId)}>
                        <button type="submit" className="text-xs text-red-600 hover:underline">
                          Remove
                        </button>
                      </form>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

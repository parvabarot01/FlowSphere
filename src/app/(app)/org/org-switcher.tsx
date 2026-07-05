"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { UserOrgSummary } from "@/lib/orgs";

export function OrgSwitcher({ orgs, currentSlug }: { orgs: UserOrgSummary[]; currentSlug: string }) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-3">
      <select
        value={currentSlug}
        onChange={(e) => router.push(`/org/${e.target.value}`)}
        className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-900 focus:border-slate-500 focus:outline-none"
      >
        {orgs.map((org) => (
          <option key={org.id} value={org.slug}>
            {org.name}
          </option>
        ))}
      </select>
      <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-900 hover:underline">
        All organizations
      </Link>
    </div>
  );
}

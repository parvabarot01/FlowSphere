"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function OrgNav({ orgSlug, isAdmin }: { orgSlug: string; isAdmin: boolean }) {
  const pathname = usePathname();

  const links = [
    { href: `/org/${orgSlug}`, label: "Projects", exact: true },
    { href: `/org/${orgSlug}/members`, label: "Members" },
    { href: `/org/${orgSlug}/calendar`, label: "Calendar" },
    { href: `/org/${orgSlug}/kb`, label: "Knowledge Base" },
    { href: `/org/${orgSlug}/automation`, label: "Automation" },
    { href: `/org/${orgSlug}/chat`, label: "Chat" },
    ...(isAdmin
      ? [
          { href: `/org/${orgSlug}/audit-log`, label: "Audit Log" },
          { href: `/org/${orgSlug}/settings`, label: "Settings" },
        ]
      : []),
  ];

  return (
    <nav className="flex flex-wrap gap-1 text-sm font-medium">
      {links.map((link) => {
        const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-md px-3 py-1.5 transition-colors ${
              isActive
                ? "bg-indigo-50 text-indigo-600"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

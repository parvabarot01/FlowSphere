import Link from "next/link";
import { getUserOrganizations } from "@/lib/orgs";
import { CreateOrgForm } from "@/app/(app)/org/create-org-form";

export default async function DashboardPage() {
  const orgs = await getUserOrganizations();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Your organizations</h1>
        <p className="mt-1 text-sm text-slate-500">
          Pick a workspace to jump into, or create a new one.
        </p>
      </div>

      {orgs.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2">
          {orgs.map((org) => (
            <li key={org.id}>
              <Link
                href={`/org/${org.slug}`}
                className="block rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-400"
              >
                <p className="font-medium text-slate-900">{org.name}</p>
                <p className="text-xs uppercase tracking-wide text-slate-400">{org.role}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="max-w-sm rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Create an organization</h2>
        <p className="mt-1 text-xs text-slate-500">
          Organizations keep your projects, tasks, and teammates separate from other workspaces.
        </p>
        <CreateOrgForm />
      </div>
    </div>
  );
}

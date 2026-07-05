import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserOrganizations } from "@/lib/orgs";
import { getAuditLog } from "@/lib/audit";

function formatAction(action: string) {
  return action.replace(/\./g, " ").replace(/_/g, " ");
}

export default async function AuditLogPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: org } = await supabase
    .from("organizations")
    .select("id, name, slug")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!org) {
    notFound();
  }

  const orgs = await getUserOrganizations();
  const membership = orgs.find((o) => o.id === org.id);

  if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
    redirect(`/org/${params.slug}`);
  }

  const entries = await getAuditLog(org.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Audit log</h1>
        <p className="mt-1 text-sm text-slate-500">
          Append-only record of key actions in {org.name}. Nothing here can be edited or deleted.
        </p>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-slate-500">No activity recorded yet.</p>
      ) : (
        <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-start justify-between gap-4 px-4 py-3 text-sm">
              <div>
                <p className="text-slate-900">
                  <span className="font-medium">{entry.actorName ?? entry.actorEmail ?? "System"}</span>{" "}
                  {formatAction(entry.action)}
                  {entry.entityType && <span className="text-slate-400"> · {entry.entityType}</span>}
                </p>
                {entry.metadata && typeof entry.metadata === "object" && Object.keys(entry.metadata).length > 0 && (
                  <p className="mt-0.5 text-xs text-slate-400">{JSON.stringify(entry.metadata)}</p>
                )}
              </div>
              <time className="shrink-0 whitespace-nowrap text-xs text-slate-400" dateTime={entry.createdAt}>
                {new Date(entry.createdAt).toLocaleString()}
              </time>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

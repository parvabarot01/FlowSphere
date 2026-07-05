import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listKnowledgeBasePages } from "@/lib/knowledge-base";
import { CreatePageForm } from "@/app/(app)/org/[slug]/kb/create-page-form";

export default async function KnowledgeBasePage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { q?: string };
}) {
  const supabase = createClient();
  const { data: org } = await supabase
    .from("organizations")
    .select("id, name, slug")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!org) {
    notFound();
  }

  const query = searchParams.q ?? "";
  const pages = await listKnowledgeBasePages(org.id, query);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Knowledge base</h1>
        <p className="mt-1 text-sm text-slate-500">{org.name}&apos;s shared wiki, searchable across every page.</p>
      </div>

      <form method="get" className="max-w-md">
        <input
          name="q"
          type="search"
          defaultValue={query}
          placeholder="Search the knowledge base..."
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
      </form>

      {pages.length > 0 ? (
        <ul className="space-y-2">
          {pages.map((page) => (
            <li key={page.id}>
              <Link
                href={`/org/${org.slug}/kb/${page.slug}`}
                className="block rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-400"
              >
                <p className="font-medium text-slate-900">{page.title}</p>
                <p className="mt-1 text-sm text-slate-500">{page.snippet}</p>
                <p className="mt-1 text-xs text-slate-400">Updated {new Date(page.updatedAt).toLocaleDateString()}</p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">{query ? "No pages match your search." : "No pages yet."}</p>
      )}

      <div className="max-w-md rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">New page</h2>
        <div className="mt-3">
          <CreatePageForm orgId={org.id} orgSlug={org.slug} />
        </div>
      </div>
    </div>
  );
}

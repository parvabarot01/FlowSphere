import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getKnowledgeBasePage } from "@/lib/knowledge-base";
import { EditPageForm } from "@/app/(app)/org/[slug]/kb/[pageSlug]/edit-page-form";

export default async function KnowledgeBasePageDetail({
  params,
}: {
  params: { slug: string; pageSlug: string };
}) {
  const supabase = createClient();
  const { data: org } = await supabase
    .from("organizations")
    .select("id, slug")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!org) {
    notFound();
  }

  const page = await getKnowledgeBasePage(org.id, params.pageSlug);

  if (!page) {
    notFound();
  }

  return (
    <div className="max-w-2xl space-y-4">
      <EditPageForm orgId={org.id} orgSlug={org.slug} page={page} />
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";

export type KnowledgeBasePageSummary = {
  id: string;
  slug: string;
  title: string;
  snippet: string;
  updatedAt: string;
};

export type KnowledgeBasePage = {
  id: string;
  slug: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export async function listKnowledgeBasePages(orgId: string, query?: string): Promise<KnowledgeBasePageSummary[]> {
  const supabase = createClient();
  let request = supabase.from("knowledge_base_pages").select("id, slug, title, body, updated_at").eq("org_id", orgId);

  if (query && query.trim()) {
    request = request.textSearch("body_search", query.trim(), { type: "websearch", config: "english" });
  }

  const { data, error } = await request.order("updated_at", { ascending: false });

  if (error || !data) return [];

  return data.map((page) => ({
    id: page.id,
    slug: page.slug,
    title: page.title,
    snippet: page.body.length > 160 ? `${page.body.slice(0, 160)}...` : page.body,
    updatedAt: page.updated_at,
  }));
}

export async function getKnowledgeBasePage(orgId: string, slug: string): Promise<KnowledgeBasePage | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("knowledge_base_pages")
    .select("id, slug, title, body, created_at, updated_at")
    .eq("org_id", orgId)
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    body: data.body,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

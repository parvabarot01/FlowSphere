"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { kbPageSchema } from "@/lib/validations/knowledge-base";
import { slugify, withRandomSuffix } from "@/lib/slug";
import { createClient } from "@/lib/supabase/server";

export type KbActionState = { error?: string };

export async function createKnowledgeBasePage(
  orgId: string,
  orgSlug: string,
  _prevState: KbActionState,
  formData: FormData
): Promise<KbActionState> {
  const parsed = kbPageSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let pageSlug = slugify(parsed.data.title);
  let createdId: string | null = null;

  for (let attempt = 0; attempt < 5; attempt++) {
    const { data, error } = await supabase
      .from("knowledge_base_pages")
      .insert({
        org_id: orgId,
        slug: pageSlug,
        title: parsed.data.title,
        body: parsed.data.body,
        created_by: user?.id,
        updated_by: user?.id,
      })
      .select("id")
      .single();

    if (!error) {
      createdId = data.id;
      break;
    }

    if (error.code === "23505") {
      pageSlug = withRandomSuffix(slugify(parsed.data.title));
      continue;
    }

    return { error: error.message };
  }

  if (!createdId) {
    return { error: "Could not create page — please try again." };
  }

  await supabase.rpc("log_audit_event", {
    p_org_id: orgId,
    p_action: "kb_page.created",
    p_entity_type: "knowledge_base_page",
    p_entity_id: createdId,
    p_metadata: { title: parsed.data.title },
  });

  redirect(`/org/${orgSlug}/kb/${pageSlug}`);
}

export async function updateKnowledgeBasePage(
  orgId: string,
  orgSlug: string,
  pageId: string,
  pageSlug: string,
  _prevState: KbActionState,
  formData: FormData
): Promise<KbActionState> {
  const parsed = kbPageSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("knowledge_base_pages")
    .update({ title: parsed.data.title, body: parsed.data.body, updated_by: user?.id })
    .eq("id", pageId);

  if (error) {
    return { error: error.message };
  }

  await supabase.rpc("log_audit_event", {
    p_org_id: orgId,
    p_action: "kb_page.updated",
    p_entity_type: "knowledge_base_page",
    p_entity_id: pageId,
    p_metadata: { title: parsed.data.title },
  });

  revalidatePath(`/org/${orgSlug}/kb/${pageSlug}`);
  return {};
}

export async function deleteKnowledgeBasePage(orgId: string, orgSlug: string, pageId: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("knowledge_base_pages").delete().eq("id", pageId);

  await supabase.rpc("log_audit_event", {
    p_org_id: orgId,
    p_action: "kb_page.deleted",
    p_entity_type: "knowledge_base_page",
    p_entity_id: pageId,
    p_metadata: {},
  });

  redirect(`/org/${orgSlug}/kb`);
}

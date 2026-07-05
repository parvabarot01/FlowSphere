"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createOrganizationSchema, updateOrganizationSchema } from "@/lib/validations/organization";
import { slugify, withRandomSuffix } from "@/lib/slug";
import { createClient } from "@/lib/supabase/server";

export type OrgActionState = { error?: string };

export async function createOrganization(
  _prevState: OrgActionState,
  formData: FormData
): Promise<OrgActionState> {
  const parsed = createOrganizationSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = createClient();
  let slug = slugify(parsed.data.name);
  let orgSlug: string | null = null;

  for (let attempt = 0; attempt < 5; attempt++) {
    const { data, error } = await supabase.rpc("create_organization_with_owner", {
      p_name: parsed.data.name,
      p_slug: slug,
    });

    if (!error) {
      orgSlug = data.slug;
      break;
    }

    if (error.code === "23505") {
      slug = withRandomSuffix(slugify(parsed.data.name));
      continue;
    }

    return { error: error.message };
  }

  if (!orgSlug) {
    return { error: "Could not create organization — please try again." };
  }

  redirect(`/org/${orgSlug}`);
}

export async function updateOrganizationName(
  orgId: string,
  currentSlug: string,
  _prevState: OrgActionState,
  formData: FormData
): Promise<OrgActionState> {
  const parsed = updateOrganizationSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("organizations")
    .update({ name: parsed.data.name })
    .eq("id", orgId);

  if (error) {
    return { error: error.message };
  }

  await supabase.rpc("log_audit_event", {
    p_org_id: orgId,
    p_action: "organization.updated",
    p_entity_type: "organization",
    p_entity_id: orgId,
    p_metadata: { name: parsed.data.name },
  });

  revalidatePath(`/org/${currentSlug}/settings`);
  return {};
}

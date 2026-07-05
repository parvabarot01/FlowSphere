"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createProjectSchema } from "@/lib/validations/project";
import { createClient } from "@/lib/supabase/server";

export type ProjectActionState = { error?: string };

export async function createProject(
  orgId: string,
  orgSlug: string,
  _prevState: ProjectActionState,
  formData: FormData
): Promise<ProjectActionState> {
  const parsed = createProjectSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      org_id: orgId,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      created_by: user?.id,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  await supabase.rpc("log_audit_event", {
    p_org_id: orgId,
    p_action: "project.created",
    p_entity_type: "project",
    p_entity_id: project.id,
    p_metadata: { name: parsed.data.name },
  });

  revalidatePath(`/org/${orgSlug}`);
  redirect(`/org/${orgSlug}/projects/${project.id}`);
}

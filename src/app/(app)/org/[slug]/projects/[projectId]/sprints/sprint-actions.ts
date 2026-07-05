"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSprintSchema, updateSprintStatusSchema } from "@/lib/validations/sprint";
import { createClient } from "@/lib/supabase/server";

export type SprintActionState = { error?: string };

export async function createSprint(
  orgId: string,
  orgSlug: string,
  projectId: string,
  _prevState: SprintActionState,
  formData: FormData
): Promise<SprintActionState> {
  const parsed = createSprintSchema.safeParse({
    name: formData.get("name"),
    goal: formData.get("goal") || undefined,
    startDate: formData.get("startDate") || "",
    endDate: formData.get("endDate") || "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: sprint, error } = await supabase
    .from("sprints")
    .insert({
      org_id: orgId,
      project_id: projectId,
      name: parsed.data.name,
      goal: parsed.data.goal || null,
      start_date: parsed.data.startDate || null,
      end_date: parsed.data.endDate || null,
      created_by: user?.id,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  await supabase.rpc("log_audit_event", {
    p_org_id: orgId,
    p_action: "sprint.created",
    p_entity_type: "sprint",
    p_entity_id: sprint.id,
    p_metadata: { name: parsed.data.name },
  });

  revalidatePath(`/org/${orgSlug}/projects/${projectId}/sprints`);
  redirect(`/org/${orgSlug}/projects/${projectId}/sprints/${sprint.id}`);
}

export async function updateSprintStatus(
  orgId: string,
  orgSlug: string,
  projectId: string,
  sprintId: string,
  formData: FormData
): Promise<void> {
  const parsed = updateSprintStatusSchema.safeParse({ status: formData.get("status") });
  if (!parsed.success) return;

  const supabase = createClient();
  await supabase.from("sprints").update({ status: parsed.data.status }).eq("id", sprintId);

  await supabase.rpc("log_audit_event", {
    p_org_id: orgId,
    p_action: "sprint.status_changed",
    p_entity_type: "sprint",
    p_entity_id: sprintId,
    p_metadata: { status: parsed.data.status },
  });

  revalidatePath(`/org/${orgSlug}/projects/${projectId}/sprints/${sprintId}`);
}

export async function assignTaskToSprint(
  orgId: string,
  orgSlug: string,
  projectId: string,
  sprintId: string,
  formData: FormData
): Promise<void> {
  const taskId = formData.get("taskId");
  if (typeof taskId !== "string" || !taskId) return;

  const supabase = createClient();
  await supabase.from("tasks").update({ sprint_id: sprintId }).eq("id", taskId);

  await supabase.rpc("log_audit_event", {
    p_org_id: orgId,
    p_action: "task.added_to_sprint",
    p_entity_type: "task",
    p_entity_id: taskId,
    p_metadata: { sprint_id: sprintId },
  });

  revalidatePath(`/org/${orgSlug}/projects/${projectId}/sprints/${sprintId}`);
}

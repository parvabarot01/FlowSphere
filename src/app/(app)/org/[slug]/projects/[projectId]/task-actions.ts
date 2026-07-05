"use server";

import { revalidatePath } from "next/cache";
import { createTaskSchema, updateTaskStatusSchema } from "@/lib/validations/task";
import { createClient } from "@/lib/supabase/server";
import { notifyTaskAssignment } from "@/lib/notify";

export type TaskActionState = { error?: string };

export async function createTask(
  orgId: string,
  orgSlug: string,
  projectId: string,
  _prevState: TaskActionState,
  formData: FormData
): Promise<TaskActionState> {
  const parsed = createTaskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    priority: formData.get("priority") || "medium",
    assigneeId: formData.get("assigneeId") || "",
    dueDate: formData.get("dueDate") || "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: task, error } = await supabase
    .from("tasks")
    .insert({
      org_id: orgId,
      project_id: projectId,
      title: parsed.data.title,
      description: parsed.data.description || null,
      priority: parsed.data.priority,
      assignee_id: parsed.data.assigneeId || null,
      due_date: parsed.data.dueDate || null,
      created_by: user?.id,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  await supabase.rpc("log_audit_event", {
    p_org_id: orgId,
    p_action: "task.created",
    p_entity_type: "task",
    p_entity_id: task.id,
    p_metadata: { title: parsed.data.title },
  });

  if (parsed.data.assigneeId) {
    await notifyTaskAssignment({
      orgId,
      orgSlug,
      projectId,
      taskTitle: parsed.data.title,
      assigneeId: parsed.data.assigneeId,
    });
  }

  revalidatePath(`/org/${orgSlug}/projects/${projectId}`);
  return {};
}

export async function updateTaskStatus(
  orgId: string,
  orgSlug: string,
  projectId: string,
  taskId: string,
  formData: FormData
): Promise<void> {
  const parsed = updateTaskStatusSchema.safeParse({ status: formData.get("status") });
  if (!parsed.success) return;

  const supabase = createClient();
  await supabase.from("tasks").update({ status: parsed.data.status }).eq("id", taskId);

  await supabase.rpc("log_audit_event", {
    p_org_id: orgId,
    p_action: "task.status_changed",
    p_entity_type: "task",
    p_entity_id: taskId,
    p_metadata: { status: parsed.data.status },
  });

  revalidatePath(`/org/${orgSlug}/projects/${projectId}`);
}

export async function updateTaskAssignee(
  orgId: string,
  orgSlug: string,
  projectId: string,
  taskId: string,
  formData: FormData
): Promise<void> {
  const assigneeId = formData.get("assigneeId");
  const value = typeof assigneeId === "string" && assigneeId ? assigneeId : null;

  const supabase = createClient();
  const { data: task } = await supabase
    .from("tasks")
    .update({ assignee_id: value })
    .eq("id", taskId)
    .select("title")
    .single();

  await supabase.rpc("log_audit_event", {
    p_org_id: orgId,
    p_action: "task.assignee_changed",
    p_entity_type: "task",
    p_entity_id: taskId,
    p_metadata: { assignee_id: value },
  });

  if (value && task) {
    await notifyTaskAssignment({
      orgId,
      orgSlug,
      projectId,
      taskTitle: task.title,
      assigneeId: value,
    });
  }

  revalidatePath(`/org/${orgSlug}/projects/${projectId}`);
}

export async function deleteTask(
  orgId: string,
  orgSlug: string,
  projectId: string,
  taskId: string
): Promise<void> {
  const supabase = createClient();
  await supabase.from("tasks").delete().eq("id", taskId);

  await supabase.rpc("log_audit_event", {
    p_org_id: orgId,
    p_action: "task.deleted",
    p_entity_type: "task",
    p_entity_id: taskId,
    p_metadata: {},
  });

  revalidatePath(`/org/${orgSlug}/projects/${projectId}`);
}

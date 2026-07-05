import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { env } from "@/lib/env";

export async function notifyTaskAssignment({
  orgId,
  orgSlug,
  projectId,
  taskTitle,
  assigneeId,
}: {
  orgId: string;
  orgSlug: string;
  projectId: string;
  taskTitle: string;
  assigneeId: string;
}) {
  const supabase = createClient();
  const link = `/org/${orgSlug}/projects/${projectId}`;

  await supabase.rpc("create_notification", {
    p_org_id: orgId,
    p_user_id: assigneeId,
    p_type: "task_assigned",
    p_title: `You were assigned: ${taskTitle}`,
    p_body: null,
    p_link: link,
  });

  const { data: assignee } = await supabase.from("profiles").select("email").eq("id", assigneeId).maybeSingle();

  if (assignee?.email) {
    await sendEmail({
      to: assignee.email,
      subject: `You were assigned a task: ${taskTitle}`,
      html: `<p>You've been assigned <strong>${taskTitle}</strong>.</p><p><a href="${env.appUrl}${link}">View it in FlowSphere</a></p>`,
    });
  }
}

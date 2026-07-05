"use server";

import { revalidatePath } from "next/cache";
import { inviteMemberSchema, updateMemberRoleSchema } from "@/lib/validations/invite";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { env } from "@/lib/env";

export type MemberActionState = { error?: string; message?: string };

export async function inviteMember(
  orgId: string,
  orgSlug: string,
  orgName: string,
  _prevState: MemberActionState,
  formData: FormData
): Promise<MemberActionState> {
  const parsed = inviteMemberSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: invite, error } = await supabase
    .from("org_invites")
    .insert({
      org_id: orgId,
      email: parsed.data.email,
      role: parsed.data.role,
      invited_by: user?.id,
    })
    .select("id, token")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "There's already a pending invite for that email." };
    }
    return { error: error.message };
  }

  await supabase.rpc("log_audit_event", {
    p_org_id: orgId,
    p_action: "member.invited",
    p_entity_type: "org_invite",
    p_entity_id: invite.id,
    p_metadata: { email: parsed.data.email, role: parsed.data.role },
  });

  const inviteUrl = `${env.appUrl}/invite/${invite.token}`;

  await sendEmail({
    to: parsed.data.email,
    subject: `You're invited to join ${orgName} on FlowSphere`,
    html: `<p>You've been invited to join <strong>${orgName}</strong> on FlowSphere as ${parsed.data.role}.</p><p><a href="${inviteUrl}">Accept the invite</a></p>`,
  });

  revalidatePath(`/org/${orgSlug}/members`);
  return { message: `Invite sent. If the email doesn't arrive, share this link directly: ${inviteUrl}` };
}

export async function revokeInvite(orgId: string, orgSlug: string, inviteId: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("org_invites").update({ status: "revoked" }).eq("id", inviteId);

  await supabase.rpc("log_audit_event", {
    p_org_id: orgId,
    p_action: "invite.revoked",
    p_entity_type: "org_invite",
    p_entity_id: inviteId,
    p_metadata: {},
  });

  revalidatePath(`/org/${orgSlug}/members`);
}

export async function updateMemberRole(
  orgId: string,
  orgSlug: string,
  membershipId: string,
  formData: FormData
): Promise<void> {
  const parsed = updateMemberRoleSchema.safeParse({ role: formData.get("role") });
  if (!parsed.success) return;

  const supabase = createClient();
  await supabase.from("org_members").update({ role: parsed.data.role }).eq("id", membershipId);

  await supabase.rpc("log_audit_event", {
    p_org_id: orgId,
    p_action: "member.role_changed",
    p_entity_type: "org_member",
    p_entity_id: membershipId,
    p_metadata: { role: parsed.data.role },
  });

  revalidatePath(`/org/${orgSlug}/members`);
}

export async function removeMember(orgId: string, orgSlug: string, membershipId: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("org_members").delete().eq("id", membershipId);

  await supabase.rpc("log_audit_event", {
    p_org_id: orgId,
    p_action: "member.removed",
    p_entity_type: "org_member",
    p_entity_id: membershipId,
    p_metadata: {},
  });

  revalidatePath(`/org/${orgSlug}/members`);
}

"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function acceptInvite(token: string) {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("accept_org_invite", { p_token: token });

  if (error || !data) {
    redirect(`/invite/${token}?error=1`);
  }

  redirect(`/org/${data.slug}`);
}

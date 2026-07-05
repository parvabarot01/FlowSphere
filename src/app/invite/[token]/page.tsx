import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AcceptInviteButton } from "@/app/invite/[token]/accept-invite-button";
import { FadeIn } from "@/components/motion/fade-in";

export default async function InvitePage({
  params,
  searchParams,
}: {
  params: { token: string };
  searchParams: { error?: string };
}) {
  const supabase = createClient();

  const { data: invite, error } = await supabase
    .rpc("get_invite_by_token", { p_token: params.token })
    .maybeSingle();

  if (error || !invite || invite.status !== "pending") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-center">
        <FadeIn>
          <h1 className="text-xl font-semibold text-slate-900">Invite not found</h1>
          <p className="mt-2 text-sm text-slate-500">
            This invite link is invalid, expired, or has already been used.
          </p>
          <Link href="/login" className="mt-4 inline-block text-sm font-medium text-slate-900 hover:underline">
            Go to login
          </Link>
        </FadeIn>
      </div>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const emailMatches = user?.email?.toLowerCase() === invite.email.toLowerCase();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-center">
      <FadeIn className="max-w-sm space-y-4">
        <h1 className="text-xl font-semibold text-slate-900">
          You&apos;re invited to join {invite.org_name}
        </h1>
        <p className="text-sm text-slate-500">
          {invite.email} has been invited as {invite.role}.
        </p>

        {searchParams.error && (
          <p className="text-sm text-red-600">Something went wrong accepting the invite. Please try again.</p>
        )}

        {!user && (
          <div className="flex justify-center gap-3">
            <Link
              href="/signup"
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              Sign up
            </Link>
            <Link
              href="/login"
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Log in
            </Link>
          </div>
        )}

        {user && !emailMatches && (
          <p className="text-sm text-red-600">
            You&apos;re logged in as {user.email}, but this invite was sent to {invite.email}. Log out and use
            that account to accept.
          </p>
        )}

        {user && emailMatches && (
          <div className="flex justify-center">
            <AcceptInviteButton token={params.token} />
          </div>
        )}

        {!user && (
          <p className="text-xs text-slate-400">
            After creating your account, come back to this link to finish joining.
          </p>
        )}
      </FadeIn>
    </div>
  );
}

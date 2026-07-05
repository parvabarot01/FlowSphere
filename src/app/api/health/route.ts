import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

// Without this, the early-return branch below has no dynamic API calls, so
// Next.js statically prerenders the route at build time and Vercel caches
// that response forever — meaning env vars added after the build would
// never be reflected. This forces it to actually run on every request.
export const dynamic = "force-dynamic";

export async function GET() {
  if (!env.isSupabaseConfigured) {
    return NextResponse.json({ status: "not_configured", supabase: false });
  }

  try {
    const supabase = createClient();
    const { error } = await supabase.auth.getUser();
    // "Auth session missing" just means no logged-in user — the connection itself is fine.
    const reachable = !error || error.message.includes("Auth session missing");

    return NextResponse.json({
      status: reachable ? "ok" : "error",
      supabase: reachable,
      error: reachable ? undefined : error?.message,
    });
  } catch (err) {
    return NextResponse.json(
      { status: "error", supabase: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}

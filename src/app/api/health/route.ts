import { NextResponse } from "next/server";
import { getHealthStatus } from "@/lib/health";

// Without this, the early-return branch below has no dynamic API calls, so
// Next.js statically prerenders the route at build time and Vercel caches
// that response forever — meaning env vars added after the build would
// never be reflected. This forces it to actually run on every request.
export const dynamic = "force-dynamic";

export async function GET() {
  const services = await getHealthStatus();
  const allHealthy = services.every((s) => s.status !== "error");

  return NextResponse.json({ status: allHealthy ? "ok" : "error", services }, { status: allHealthy ? 200 : 503 });
}

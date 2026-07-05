import { NextResponse, type NextRequest } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { getJobHandler } from "@/lib/jobs/registry";

export const dynamic = "force-dynamic";

async function handler(request: NextRequest) {
  const { type, payload } = (await request.json()) as { type?: string; payload?: unknown };

  if (!type) {
    return NextResponse.json({ error: "Missing job type" }, { status: 400 });
  }

  const jobHandler = getJobHandler(type);
  if (!jobHandler) {
    return NextResponse.json({ error: `Unknown job type "${type}"` }, { status: 400 });
  }

  await jobHandler(payload);
  return NextResponse.json({ success: true });
}

// QStash signs every delivery; this rejects anything that isn't a genuine
// QStash callback before the handler above ever runs. verifySignatureAppRouter
// throws immediately if the signing keys aren't set, which would otherwise
// crash `next build` before real QStash credentials exist — so it's only
// wrapped once they're configured.
const currentSigningKey = process.env.QSTASH_CURRENT_SIGNING_KEY;
const nextSigningKey = process.env.QSTASH_NEXT_SIGNING_KEY;

export const POST =
  currentSigningKey && nextSigningKey
    ? verifySignatureAppRouter(handler)
    : async () => NextResponse.json({ error: "QStash is not configured" }, { status: 503 });

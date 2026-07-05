import { Redis } from "@upstash/redis";
import Groq from "groq-sdk";
import { createClient } from "@/lib/supabase/server";

export type ServiceHealth = {
  name: string;
  // "ok"/"error" are live-verified; "configured" means a key is present but
  // wasn't live-checked (avoids side effects like sending a real email, or
  // there's no cheap endpoint to check against).
  status: "ok" | "error" | "configured" | "not_configured";
  detail?: string;
};

async function checkSupabase(): Promise<ServiceHealth> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { name: "Supabase", status: "not_configured" };
  }

  try {
    const supabase = createClient();
    const { error } = await supabase.auth.getUser();
    // "Auth session missing" just means no logged-in session — the connection itself is fine.
    const reachable = !error || error.message.includes("Auth session missing");
    return reachable
      ? { name: "Supabase", status: "ok" }
      : { name: "Supabase", status: "error", detail: error?.message };
  } catch (err) {
    return { name: "Supabase", status: "error", detail: (err as Error).message };
  }
}

async function checkUpstashRedis(): Promise<ServiceHealth> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    return { name: "Upstash Redis", status: "not_configured" };
  }

  try {
    const redis = new Redis({ url, token });
    await redis.ping();
    return { name: "Upstash Redis", status: "ok" };
  } catch (err) {
    return { name: "Upstash Redis", status: "error", detail: (err as Error).message };
  }
}

async function checkGroq(): Promise<ServiceHealth> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return { name: "Groq", status: "not_configured" };
  }

  try {
    const groq = new Groq({ apiKey });
    // Listing models is a free, read-only call — confirms the key works without generating any completions.
    await groq.models.list();
    return { name: "Groq", status: "ok" };
  } catch (err) {
    return { name: "Groq", status: "error", detail: (err as Error).message };
  }
}

function configOnly(name: string, envVar: string | undefined): ServiceHealth {
  return { name, status: envVar ? "configured" : "not_configured" };
}

/**
 * Live-checks the services with cheap, side-effect-free endpoints
 * (Supabase, Upstash Redis, Groq). QStash/Resend/Sentry are reported as
 * configured-or-not only — there's no free way to verify them without
 * either sending a real email or no meaningfully cheap endpoint to hit.
 */
export async function getHealthStatus(): Promise<ServiceHealth[]> {
  const [supabase, upstashRedis, groq] = await Promise.all([checkSupabase(), checkUpstashRedis(), checkGroq()]);

  return [
    supabase,
    upstashRedis,
    configOnly("Upstash QStash", process.env.QSTASH_TOKEN),
    groq,
    configOnly("Resend", process.env.RESEND_API_KEY),
    configOnly("Sentry", process.env.SENTRY_DSN),
  ];
}

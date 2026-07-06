import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the environment.");
  console.error("Run this with: node --env-file=.env.local scripts/seed-test-users.mjs");
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const PASSWORD = "12345678";

const USERS = [
  ...Array.from({ length: 10 }, (_, i) => ({
    email: `flowsphere.tester${i + 1}@gmail.com`,
    fullName: `Test User ${i + 1}`,
  })),
  { email: "Test@gmail.com", fullName: "Test Account" },
];

async function upsertUser(email, fullName) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (!error) {
    console.log(`✓ created ${email} (id: ${data.user.id})`);
    return data.user.id;
  }

  if (error.message.toLowerCase().includes("already been registered") || error.status === 422) {
    const { data: list, error: listError } = await supabase.auth.admin.listUsers({ perPage: 200 });
    if (listError) {
      console.error(`✗ ${email}: could not look up existing user (${listError.message})`);
      return null;
    }
    const existing = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (existing) {
      console.log(`= ${email} already exists (id: ${existing.id})`);
      return existing.id;
    }
  }

  console.error(`✗ ${email}: ${error.message}`);
  return null;
}

async function ensureOrg(name, slug, ownerId) {
  const { data: existing } = await supabase.from("organizations").select("id").eq("slug", slug).maybeSingle();
  if (existing) {
    console.log(`= org "${name}" already exists (id: ${existing.id})`);
    return existing.id;
  }

  const { data: org, error } = await supabase
    .from("organizations")
    .insert({ name, slug, created_by: ownerId })
    .select("id")
    .single();

  if (error) {
    console.error(`✗ org "${name}": ${error.message}`);
    return null;
  }

  console.log(`✓ created org "${name}" (id: ${org.id})`);
  return org.id;
}

async function ensureMember(orgId, userId, role) {
  const { error } = await supabase
    .from("org_members")
    .upsert({ org_id: orgId, user_id: userId, role }, { onConflict: "org_id,user_id" });
  if (error) console.error(`✗ membership (org ${orgId}, user ${userId}): ${error.message}`);
}

async function ensurePendingInvite(orgId, email, role, invitedBy) {
  const { data: existing } = await supabase
    .from("org_invites")
    .select("id")
    .eq("org_id", orgId)
    .eq("email", email)
    .eq("status", "pending")
    .maybeSingle();
  if (existing) return;

  const { error } = await supabase
    .from("org_invites")
    .insert({ org_id: orgId, email, role, token: randomUUID(), invited_by: invitedBy });
  if (error) console.error(`✗ invite for ${email}: ${error.message}`);
  else console.log(`✓ pending invite queued for ${email} in org ${orgId}`);
}

async function main() {
  const ids = {};
  for (const { email, fullName } of USERS) {
    ids[email] = await upsertUser(email, fullName);
  }

  const tester = (n) => ids[`flowsphere.tester${n}@gmail.com`];
  const testAccount = ids["Test@gmail.com"];

  if (!tester(1) || !tester(6) || !testAccount) {
    console.error("Missing required user ids — aborting org seeding.");
    process.exit(1);
  }

  // Org A: owner tester1, admin tester2, members tester3/4/5 + Test@gmail.com
  const orgA = await ensureOrg("FlowSphere QA", "flowsphere-qa", tester(1));
  if (orgA) {
    await ensureMember(orgA, tester(1), "owner");
    await ensureMember(orgA, tester(2), "admin");
    await ensureMember(orgA, tester(3), "member");
    await ensureMember(orgA, tester(4), "member");
    await ensureMember(orgA, tester(5), "member");
    await ensureMember(orgA, testAccount, "member");
    await ensurePendingInvite(orgA, "flowsphere.pending@gmail.com", "member", tester(1));
  }

  // Org B: owner tester6, admin tester7, members tester8/9/10, plus tester1 for
  // multi-org switcher testing
  const orgB = await ensureOrg("Beta Crew", "beta-crew", tester(6));
  if (orgB) {
    await ensureMember(orgB, tester(6), "owner");
    await ensureMember(orgB, tester(7), "admin");
    await ensureMember(orgB, tester(8), "member");
    await ensureMember(orgB, tester(9), "member");
    await ensureMember(orgB, tester(10), "member");
    await ensureMember(orgB, tester(1), "member");
  }

  console.log(`\nDone. All accounts use password: ${PASSWORD}`);
  console.log("Orgs: FlowSphere QA (slug flowsphere-qa), Beta Crew (slug beta-crew)");
}

main();

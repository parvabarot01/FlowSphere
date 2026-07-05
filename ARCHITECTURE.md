# Architecture

Living document, updated every sprint. Sprint 1 covers the database schema and RLS model. API surface and agent design are added in Sprint 2.

## Multi-tenancy model

Every tenant is an `organization`. A user's access to everything else — projects, sprints, tasks, the audit log — is derived from their row in `org_members`. There is no separate tenant-scoping mechanism beyond Postgres RLS: every table that holds tenant data carries an `org_id` column, and every policy checks membership through it. `projects`, `sprints`, and `tasks` all denormalize `org_id` directly (rather than requiring a join through `projects`) so RLS policies stay simple, single-table checks instead of subqueries — cheaper to plan and easier to audit.

## Database schema (`supabase/migrations/20260704000001_core_schema.sql`)

| Table | Purpose |
|---|---|
| `profiles` | Mirrors `auth.users` 1:1; created automatically by the `on_auth_user_created` trigger. Holds display name/avatar/email — the only user data safe to read across org boundaries. |
| `organizations` | A tenant. Has a unique `slug` for URLs. |
| `org_members` | Join table between `profiles` and `organizations`, carrying `role` (`owner` / `admin` / `member`). This row's existence *is* the access grant. |
| `projects` | Belongs to one org. |
| `sprints` | Belongs to one project (and, denormalized, one org). |
| `tasks` | Belongs to one project, optionally assigned to a sprint and/or a profile. |
| `audit_log` | Append-only. No update/delete policy exists for any role — entries can never be edited or removed once written. |

## Database schema (`supabase/migrations/20260705000001_sprint2_schema.sql`)

| Table | Purpose |
|---|---|
| `meeting_summaries` | A pasted transcript plus its AI-generated summary. Optionally scoped to a project. |
| `action_items` | Action items extracted from a meeting summary; `task_id` links to the real task once added to the tracker. |
| `decision_log` | Standalone or meeting-linked decision records (title, decision, rationale). |
| `knowledge_base_pages` | Org wiki pages with a generated `tsvector` column (`body_search`) for Postgres full-text search. |
| `automation_rules` | Trigger→action rules (`trigger_type`/`trigger_config`, `action_type`/`action_config` as jsonb); execution logic lives in application code, not a DB trigger. |
| `approvals` / `approval_steps` | Sequential multi-step approval requests. Status transitions are gated by `create_approval_request()` / `decide_approval_step()` — never a plain client update — so a requester can't approve their own request and steps must be decided in order. |
| `ai_reports` | AI-generated executive reports (weekly updates, health scores, risk analysis, dependency graphs). No client insert policy — written by the background report job via the service-role client. |
| `chat_threads` / `chat_messages` | Cross-team threaded chat, org- or project-scoped. Messages are immutable once posted; Realtime-enabled the same way `notifications` is. |

## RLS design

Two SECURITY DEFINER helper functions do the membership lookups so policies stay one-liners and so `org_members`' own policies don't recurse into themselves:

- `is_org_member(org_id)` — is the caller a member of this org, any role.
- `get_org_role(org_id)` — the caller's role in this org, or null.
- `shares_org_with(user_id)` — do the caller and this other user share any org (used to scope `profiles` reads).

Role gating in Sprint 1: any active member can create/edit projects, sprints, and tasks; only `owner`/`admin` can delete a project, manage membership, or change org settings; only `owner` can delete the org itself.

### The org-creation bootstrap problem

`org_members`' insert policy requires the caller already have `owner`/`admin` role in that org — which is impossible for a brand new org with no members yet. This is solved with a SECURITY DEFINER RPC, `create_organization_with_owner(name, slug)`, that inserts the organization row and the creator's `owner` membership row in a single transaction, bypassing RLS by virtue of running as the function's (table-owning) role. The app calls this RPC instead of inserting into `organizations` directly.

### Audit log integrity

`audit_log` has a `select` policy for org members but deliberately **no insert policy** for the `authenticated` role. All writes go through `log_audit_event(org_id, action, entity_type, entity_id, metadata)`, a SECURITY DEFINER function that stamps `actor_id` from `auth.uid()` server-side. This means a client can never forge an audit entry under someone else's name, and never write one directly — only through this trusted gateway. Feature code (invites, task mutations, approvals, etc.) calls this RPC as part of its own mutations rather than writing to `audit_log` directly.

## Free-tier ceilings to watch

- **Supabase free tier:** 500MB database, 5GB bandwidth/month, project pauses after 1 week of inactivity (auto-resumes on first request, with a cold-start delay).
- **Resend free tier:** 3,000 emails/month, 100/day.
- **Upstash free tier:** 500K commands/month (Redis), 500 messages/day (QStash).
- **Groq free tier:** rate-limited requests/tokens-per-minute, varies by model — the department-agent framework needs to queue/backoff around this rather than fan out requests freely.
- **Sentry free tier:** 5,000 errors/month, 1 team member on the Developer plan.

None of these are close to being hit at current scale; noted here so a later hardening pass has a baseline to check against.

## Error tracking & testing (hardening pass)

Server- and edge-runtime errors are reported to Sentry via `src/instrumentation.ts` + `sentry.server.config.ts` / `sentry.edge.config.ts`, following the same fails-open convention as every other integration: `Sentry.init` runs with `enabled: false` when `SENTRY_DSN` isn't set, so this is inert until a Sentry project is created and the DSN added to env vars (a manual one-time step, same as Vercel project linking). Client-side (browser) error capture isn't wired up yet — Next.js 14's App Router requires either the Sentry wizard's `next.config` wrapping or a manually-imported `sentry.client.config.ts`, and doing that without a real DSN to verify against risked repeating the kind of build-time breakage QStash's signature verification caused earlier, so it's left as a follow-up once Sentry is actually configured.

Core-flow logic is covered by Vitest (`npm test`, wired into CI): validation schemas for auth, org, task, sprint, agent-draft, and automation requests, plus the automation engine's trigger-matching logic (`src/lib/automation/matcher.ts`, split out from `engine.ts` specifically so it's testable without a live Supabase connection) and the slug helper. These are unit tests against pure logic, not integration tests against a real database — full end-to-end coverage of the happy paths (create org → invite → task → sprint → agent draft → automation fire) needs a real Supabase project to run against, which is a follow-up once one is connected.

## Rate limiting (hardening pass)

Every route that spends a shared free-tier quota is throttled per-actor via `rateLimit()` (`src/lib/rate-limit.ts`, Upstash sliding window, fails open if Upstash isn't configured):

- **`ai-agent`** (10/60s per user): meeting transcript summarization, department agent drafts, and executive report requests all call Groq, so they share one bucket keyed by user id — this is what actually protects the account-wide Groq rate limit, not per-feature limits.
- **`invite-email`** (20/60s per org): invite sends, since Resend's free tier caps at 100/day.
- **`login`** / **`signup`** (Sprint 1): per IP+email and per IP respectively, to slow credential-stuffing and signup spam.

RLS-wise, the Sprint 2 tables follow the same two patterns already established in Sprint 1: plain member-scoped CRUD (`meeting_summaries`, `action_items`, `decision_log`, `knowledge_base_pages`, `automation_rules` — delete admin-gated) for anything a member should freely manage, and trusted-gateway-only writes (`approvals`/`approval_steps` via `create_approval_request`/`decide_approval_step`, `ai_reports` via the service-role background job) for anything where a direct client write would let someone forge state — approving their own request, or hand-writing a fake AI report.

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`) runs on every push and PR to `main`: install, lint, typecheck, build. This needs no external account and is wired up as of Sprint 1.

Production hosting is Vercel, which deploys straight from this GitHub repo — but connecting a repo to Vercel is a one-time action tied to a personal Vercel account, so it can't be scripted from here. To finish this half:

1. Go to vercel.com → **Add New Project** → import this GitHub repo (`parvabarot01/FlowSphere`).
2. In the project's **Environment Variables** settings, add the same keys listed in `.env.example` (Supabase, Upstash, Groq, Resend) once those services are set up.
3. Vercel then auto-deploys a preview on every PR and promotes `main` to production on merge — no further setup needed.

# PRD — v1 (Sprint 1 scope)

## Overview

FlowSphere is a multi-tenant workspace for teams to run projects, sprints, and tasks, with an AI agent layer (Sprint 2) and automation/reporting layer (Sprint 3) built on top of the foundation this document covers. This v1 PRD covers what Sprint 1 actually ships: the collaboration primitives everything else depends on.

## Goals

- A team can sign up, create an organization, and invite teammates without any manual/support intervention.
- Role-based access (owner/admin/member) gates administrative actions, enforced at the database layer, not just in the UI.
- A team can create projects, break them into tasks, and organize tasks into sprints.
- Assigning a task notifies the assignee, in-app and by email.
- Every meaningful action across an org is attributable and auditable after the fact.

## Non-goals (explicitly out of scope for v1)

- AI features of any kind — that's Sprint 2's `department agent` framework, not this PRD.
- Workflow automation, approvals, executive reporting — Sprint 3.
- Mobile apps, SSO/SCIM, third-party integrations.
- Billing/paid plans — the whole stack runs on free tiers by design (see `PROJECT_PLAN.md` §3).

## User stories

- As a new user, I can sign up with email/password and confirm my email before logging in, so my account is verified.
- As a returning user, I can log in and land on a dashboard of the organizations I belong to.
- As a user with no organization yet, I can create one and immediately become its owner.
- As an org owner/admin, I can invite a teammate by email with a role (admin or member), and they can accept via a link that works whether or not they have an account yet.
- As an org owner/admin, I can change a member's role or remove them, except I can't do this to myself from the roster (prevents accidental self-lockout).
- As any org member, I can create a project and add tasks to it with a title, priority, assignee, and due date.
- As any org member, I can change a task's status or assignee directly from its card on the board.
- As any org member, I can create a sprint, pull backlog tasks into it, and view a sprint-scoped board.
- As a task assignee, I get an in-app notification (live, no refresh needed) and an email when I'm assigned.
- As any org member, I can see a monthly calendar of task due dates and sprint date ranges for my org.
- As an org owner/admin, I can view an append-only audit log of who did what and when.

## Functional requirements by area

**Auth** — Supabase email/password, email confirmation flow, session refresh via middleware, protected route group that redirects unauthenticated requests to `/login`.

**Organizations** — create (via an atomic RPC that also grants ownership), rename (owner/admin), switch between orgs you belong to. Multi-tenancy is enforced by Postgres RLS on every table, not application-level filtering alone.

**RBAC** — three roles (`owner`, `admin`, `member`). Role checks live in RLS policies (database-enforced) and are mirrored in the UI to hide actions a user can't take.

**Invites** — email + role, unique pending invite per (org, email), token-based accept link that works pre-signup, revoke by admin.

**Projects & tasks** — CRUD on both; task status (`todo` / `in_progress` / `in_review` / `done`) and priority (`low` / `medium` / `high` / `urgent`); board view grouped by status.

**Sprints** — CRUD, status (`planned` / `active` / `completed`), task assignment in and out of a sprint, sprint-scoped board reusing the same board component as the project view.

**Notifications** — in-app via Supabase Realtime (live-updating bell, unread count, mark-as-read), email via Resend on task assignment. Both degrade gracefully (log-and-continue) if the underlying service isn't configured, so the rest of the app keeps working.

**Calendar** — month-grid view per org, tasks plotted by due date, sprints shown as date-range chips, month navigation.

**Audit log** — append-only (no update/delete path exists at the database level), records actor, action, entity, and metadata for org/member/project/task/sprint/invite mutations, viewable by owner/admin.

## Non-functional requirements

- **Security:** RLS on every table; every mutation validated with Zod before touching the database; rate limiting on auth endpoints (fails open if Upstash isn't configured yet, so local dev isn't blocked); secrets only ever read from environment variables.
- **Cost:** every dependency has a genuine free tier this project is designed to stay within (see `ARCHITECTURE.md` for the ceilings).
- **Resilience:** every server-rendered page that touches Supabase must degrade to a redirect or empty state rather than a 500 if credentials are missing or a service is unreachable — verified in Sprint 1 by running the whole app with no real credentials configured at all.

## Open questions carried into Sprint 2

- Should invites support a `next` redirect so a brand-new signup lands back on the invite automatically, instead of requiring a second click on the emailed link? (Deferred as a minor UX gap, not a blocker.)
- What's the right granularity for audit log retention/pagination once orgs have months of history? Currently capped at the last 50 entries.

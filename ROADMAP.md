# Roadmap

Living document — updated at the end of every sprint. Status reflects what's actually shipped, not what's planned.

## MVP — Sprint 1 (Foundation, org structure, core collaboration primitives)

**Status: shipped.**

- [x] Auth (sign up / log in / log out, protected routes)
- [x] Organizations, RBAC (owner/admin/member), team invites
- [x] Audit log (append-only, owner/admin viewer)
- [x] Projects & tasks with a kanban-style board
- [x] Sprint planning (create sprints, assign tasks, sprint board)
- [x] In-app + email notifications on task assignment
- [x] Calendar view (tasks by due date, sprint date ranges)
- [x] CI (GitHub Actions: lint/typecheck/build on every push); Vercel project linking is a one-time manual step (see `ARCHITECTURE.md`)

**MVP is done when:** a user can create an org, invite teammates, create a project with tasks, plan a sprint, and get notified of assignments. All true as of Sprint 1.

## V1+V2 — Sprint 2 (Final): AI department agents, knowledge base, automation, reporting, executive layer

*Combines the former separate Sprint 2 (V1) and Sprint 3 (V2) into one sprint, per a mid-project decision to stop pausing between them — see `BACKLOG.md`.*

**Status: shipped.**

- [x] Agent framework: one shared Groq client, per-department system prompts (Product, Engineering, Design/QA, Executive), retry/backoff around Groq's free-tier rate limits
- [x] Meeting transcript → structured summary + action items, auto-added to the task tracker
- [x] AI-generated department sprint plans and backlog drafts, grounded in existing tasks
- [x] Knowledge base / wiki with Postgres full-text search
- [x] Decision log + action item tracker tied to meeting summaries
- [x] Trigger → action workflow automation, executed via QStash
- [x] Approvals module (sequential multi-step flow)
- [x] AI-generated executive reports: weekly updates, project health scores, risk analysis, dependency graphs
- [x] Cross-team threaded chat (Realtime-backed)
- [x] Hardening pass: RLS + rate-limit audit, error tracking (Sentry, server/edge), core-flow test coverage (Vitest)

**Done when:** a user can paste a meeting transcript and get a structured summary with action items auto-added to the tracker; query a department agent for a sprint plan or backlog draft; automate a trigger→action rule; route a request through approval; get an AI executive report; and chat cross-team — all true as of this sprint. This is the "operating system" positioning fully realized, and the point where FlowSphere stops being "a task tracker" and becomes the AI-native product described in `PROJECT_PLAN.md`.

## Beyond V2 (not committed, tracked for later prioritization)

- Mobile app
- Third-party integrations / marketplace
- Enterprise SSO / SCIM
- Multi-region hosting for larger orgs

These are the gaps called out honestly in `COMPETITIVE_ANALYSIS.md` — accepted trade-offs for the current target segment (small-to-mid product teams), revisited only if the market being served changes.

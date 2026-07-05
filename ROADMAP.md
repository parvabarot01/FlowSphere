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

## V1 — Sprint 2 (AI department agents + knowledge base)

**Status: not started.**

- [ ] Agent framework: one shared Groq client, per-department system prompts (Product, Engineering, Marketing, etc.), selectable per query
- [ ] AI-generated sprint plans and backlog drafts
- [ ] Meeting transcript → structured summary + action items, auto-added to the task tracker
- [ ] Knowledge base / wiki with Postgres full-text search
- [ ] Decision log tied to meeting summaries

**V1 is done when:** a user can paste a meeting transcript and get a structured summary with action items auto-added to the tracker, and can query a department agent for a sprint plan or backlog draft. This is the point where FlowSphere stops being "a task tracker" and starts being the AI-native product described in `PROJECT_PLAN.md`.

## V2 — Sprint 3 (Workflow automation, reporting, executive layer, launch polish)

**Status: not started.**

- [ ] Trigger → action workflow automation (e.g., "task marked blocked → notify assignee's manager")
- [ ] Approvals module (basic multi-step flow)
- [ ] AI-generated executive reports: weekly updates, project health scores, risk analysis, dependency graphs
- [ ] Cross-team threaded chat (Realtime-backed)
- [ ] Hardening pass: RLS audit, rate-limit audit, error tracking, core-flow test coverage

**V2 is done when:** the full loop — task/meeting activity → automation → AI report → executive rollup — is demoable end to end and deployed. This is the "operating system" positioning fully realized.

## Beyond V2 (not committed, tracked for later prioritization)

- Mobile app
- Third-party integrations / marketplace
- Enterprise SSO / SCIM
- Multi-region hosting for larger orgs

These are the gaps called out honestly in `COMPETITIVE_ANALYSIS.md` — accepted trade-offs for the current target segment (small-to-mid product teams), revisited only if the market being served changes.

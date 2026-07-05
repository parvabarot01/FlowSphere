# Backlog

Living backlog, sprint-tagged. Items are checked off as they ship (code + test + commit + push).

Legend: `[ ]` open · `[x]` shipped

---

## Sprint 1 — Foundation, Org Structure, Core Collaboration Primitives

**Goal:** a working multi-tenant workspace where teams can actually create and track work.
**Done when:** a user can create an org, invite teammates, create a project with tasks, plan a sprint, and get notified of assignments.

### Infra
- [x] `S1-01` [Infra] Repo & app scaffold — Next.js 14 (App Router) + TypeScript + Tailwind, `.gitignore` (incl. `CLAUDE.md`, `PROGRESS_LOG.md`, `node_modules`, `.env*`, `.next`, `.vercel`, `*.log`), base folder structure, git init + first commit
- [x] `S1-02` [Infra] Supabase wiring — typed client (browser + server), middleware session refresh, env config with dev-safe placeholders, `/api/health` connection check
- [x] `S1-03` [Infra] Core DB schema & RLS — `organizations`, `profiles`, `org_members`, `projects`, `tasks`, `sprints`, `audit_log` tables, migrations, RLS policies per table
- [ ] `S1-10` [Infra] CI/CD to Vercel — project linked, preview deployments on push, production deploy on main

### Docs
- [ ] `S1-D1` [Docs] `PRD.md` (v1)
- [ ] `S1-D2` [Docs] `PERSONAS.md` — Product Manager, Engineer, Designer/QA, Executive
- [ ] `S1-D3` [Docs] `COMPETITIVE_ANALYSIS.md` — vs Notion, Jira, Asana, Monday, ClickUp
- [ ] `S1-D4` [Docs] `KPI_FRAMEWORK.md` (draft) — adoption, time-saved proxy metrics, project health score accuracy
- [ ] `S1-D5` [Docs] `ROADMAP.md` — MVP → V1 → V2

### Features
- [x] `S1-04` [Feature] Auth — sign up / log in / log out via Supabase Auth, session handling, protected routes/middleware
- [x] `S1-05` [Feature] Organizations — create org, org settings, org switcher, RLS-scoped multi-tenancy
- [x] `S1-06` [Feature] Team invites & RBAC — invite by email, roles (owner/admin/member), accept-invite flow, role-gated actions
- [x] `S1-07` [Feature] Audit log — write-path hook recording key actions (org/member/project/task/sprint changes) + basic viewer UI
- [x] `S1-08` [Feature] Projects & tasks — create/assign/status CRUD, list + board view
- [ ] `S1-09` [Feature] Sprint planning board — create sprints, assign tasks to a sprint, sprint board view
- [ ] `S1-11` [Feature] Notifications & calendar — in-app notifications (Supabase Realtime) + email via Resend on assignment; calendar view of tasks/sprints by due date

---

## Sprint 2 — AI Department Agents + Knowledge Base *(not yet decomposed — break down at sprint start)*
- Agent framework: shared Groq client, per-department system prompts (Product, Engineering, Marketing, etc.)
- AI-generated sprint plans, backlogs, meeting summaries (paste-in transcript → structured summary + action items)
- Knowledge base / wiki with Postgres full-text search
- Decision log + action item tracker tied to meeting summaries
- Docs: `EXECUTIVE_SUMMARY.md` update, `ARCHITECTURE.md` (full schema + API + agent design)

## Sprint 3 — Workflow Automation, Reporting, Executive Layer, Launch Polish *(not yet decomposed — break down at sprint start)*
- Workflow automation: trigger→action rules
- Approvals module (basic multi-step approval flow)
- AI-generated executive reports: weekly updates, project health scores, risk analysis, dependency graphs
- Cross-team enterprise chat (threaded, Realtime-backed)
- Hardening pass: RLS audit, rate-limit audit, error tracking, core-flow test coverage
- Docs: `GTM_STRATEGY.md`, `PRICING_STRATEGY.md`, final `EXECUTIVE_SUMMARY.md`, one-page Executive Presentation doc

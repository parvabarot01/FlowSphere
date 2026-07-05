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
- [x] `S1-10` [Infra] CI/CD to Vercel — GitHub Actions (lint/typecheck/build) wired up; Vercel project linking documented as a manual one-time step in ARCHITECTURE.md (requires the user's own Vercel account)

### Docs
- [x] `S1-D1` [Docs] `PRD.md` (v1)
- [x] `S1-D2` [Docs] `PERSONAS.md` — Product Manager, Engineer, Designer/QA, Executive
- [x] `S1-D3` [Docs] `COMPETITIVE_ANALYSIS.md` — vs Notion, Jira, Asana, Monday, ClickUp
- [x] `S1-D4` [Docs] `KPI_FRAMEWORK.md` (draft) — adoption, time-saved proxy metrics, project health score accuracy
- [x] `S1-D5` [Docs] `ROADMAP.md` — MVP → V1 → V2

### Features
- [x] `S1-04` [Feature] Auth — sign up / log in / log out via Supabase Auth, session handling, protected routes/middleware
- [x] `S1-05` [Feature] Organizations — create org, org settings, org switcher, RLS-scoped multi-tenancy
- [x] `S1-06` [Feature] Team invites & RBAC — invite by email, roles (owner/admin/member), accept-invite flow, role-gated actions
- [x] `S1-07` [Feature] Audit log — write-path hook recording key actions (org/member/project/task/sprint changes) + basic viewer UI
- [x] `S1-08` [Feature] Projects & tasks — create/assign/status CRUD, list + board view
- [x] `S1-09` [Feature] Sprint planning board — create sprints, assign tasks to a sprint, sprint board view
- [x] `S1-11` [Feature] Notifications & calendar — in-app notifications (Supabase Realtime) + email via Resend on assignment; calendar view of tasks/sprints by due date

---

## Sprint 2 (Final) — AI Agents + Knowledge Base + Workflow Automation + Reporting + Launch Polish *(combines former Sprint 2 + Sprint 3, implemented as one sprint with no pause in between)*

**Goal:** every remaining piece of the product — AI department agents, knowledge base, automation, approvals, executive reporting, cross-team chat — built and hardened for launch.
**Done when:** a user can paste a meeting transcript and get a structured summary with action items auto-added to the tracker; query a department agent for a sprint plan/backlog draft; search a knowledge base; define an automation rule that fires on an event; route something through an approval; get an AI-generated executive report with a health score; and chat cross-team in a thread — all backed by RLS, rate-limited, and covered by core-flow tests.

### Infra
- [ ] `S2-01` [Infra] Groq agent framework — shared Groq client (Llama 3.3 70B), per-department system prompts (Product, Engineering, Design/QA, Executive), retry/backoff around free-tier rate limits
- [ ] `S2-02` [Infra] Upstash QStash wiring — background job queue for long-running AI work (report generation, automation execution) so requests don't block on Groq latency
- [ ] `S2-03` [Infra] Schema & RLS for Sprint 2 scope — `knowledge_base_pages`, `decision_log`, `action_items`, `automation_rules`, `approvals` (+ steps), `ai_reports`, `chat_threads`/`chat_messages` tables, migrations, RLS policies per table

### Features — AI agents + knowledge base
- [ ] `S2-04` [Feature] Meeting transcript summarizer — paste transcript → structured AI summary + extracted action items auto-added to the task tracker
- [ ] `S2-05` [Feature] Department agent sprint plan / backlog draft — query a department agent for a sprint plan or backlog draft grounded in the project's existing tasks
- [ ] `S2-06` [Feature] Knowledge base / wiki — create/edit pages, Postgres full-text search across the org's KB
- [ ] `S2-07` [Feature] Decision log + action item tracker — log decisions tied to meeting summaries, track action items to completion

### Features — automation, reporting, executive layer
- [ ] `S2-08` [Feature] Workflow automation rules — trigger→action rule builder (e.g. task status change → notify/assign), executed via QStash
- [ ] `S2-09` [Feature] Approvals module — basic multi-step approval flow (request, approve/reject, audit-logged)
- [ ] `S2-10` [Feature] AI executive reports — weekly project updates, health scores, risk analysis, dependency graphs
- [ ] `S2-11` [Feature] Cross-team threaded chat — Realtime-backed threads scoped to org/project

### Hardening
- [ ] `S2-12` [Hardening] RLS + rate-limit audit across all Sprint 1 + Sprint 2 tables/routes
- [ ] `S2-13` [Hardening] Error tracking wired in (free-tier service) + core-flow test coverage (auth, org, task, sprint, agent, automation happy paths)

### Docs
- [ ] `S2-D1` [Docs] `ARCHITECTURE.md` update — full schema, API surface, agent design
- [ ] `S2-D2` [Docs] `EXECUTIVE_SUMMARY.md`
- [ ] `S2-D3` [Docs] `GTM_STRATEGY.md`
- [ ] `S2-D4` [Docs] `PRICING_STRATEGY.md`
- [ ] `S2-D5` [Docs] One-page Executive Presentation doc

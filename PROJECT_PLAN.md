# FlowSphere — Project Plan

## Vision & business case

FlowSphere is an AI-powered workplace operating system: instead of switching between Slack, Jira, Notion, Confluence, and Zoom, every department gets an AI agent that lives inside one collaborative workspace — handling sprint plans, meeting summaries, documentation, and cross-team communication.

**Problem it solves:** employees lose real time context-switching between disconnected collaboration tools, and nobody owns the job of turning meetings/docs/tasks into a single coherent picture. FlowSphere unifies the workspace and automates the repetitive glue work (summarizing, tracking, reporting).

**Positioning:** a lightweight, AI-native alternative to running Jira + Notion + Slack + a human PM assistant.

## Target users

Covered in detail in `PERSONAS.md`:
- **Product Manager** — owns roadmap/OKRs, needs auto-generated status reports
- **Engineer** — needs low-friction task tracking, not another tool to babysit
- **Designer / QA** — needs visibility into cross-functional dependencies
- **Executive** — needs project health scores and weekly rollups, not raw activity feeds

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS | Deploys free on Vercel |
| Hosting | Vercel (free tier) | Zero-cost CI/CD |
| Database + Auth | Supabase (free tier: Postgres, Auth, Storage, RLS, Realtime) | Multi-tenancy via RLS, Realtime covers live collaboration |
| Background jobs / queue | Upstash Redis + Upstash QStash (free tier) | No paid queue needed at this scale |
| AI agents | Groq API (free tier, Llama 3.3 70B) | One shared client, prompted per department-agent persona |
| Notifications | Supabase Realtime + Resend (free tier) | In-app + email notifications at zero cost |
| Search | Postgres full-text search | Built into Supabase, avoids paid search services |

Security practices applied throughout: Supabase RLS on every table, schema validation on every route, rate-limiting, full security headers, secrets in env vars only, audit logging on all agent actions and approvals.

Every service in this stack runs on a genuinely free tier. Real free-tier ceilings are tracked in `ARCHITECTURE.md` rather than exceeded silently.

## Roadmap — three sprints to launch

### Sprint 1 — Foundation, org structure, core collaboration primitives
A working multi-tenant workspace where teams can create and track work: auth, organizations, teams, RBAC, audit log; core schema (organizations/users/projects/tasks/sprints); project and task management UI with a sprint planning board; in-app and email notifications; calendar view; CI/CD to Vercel.

**Done when:** a user can create an org, invite teammates, create a project with tasks, plan a sprint, and get notified of assignments.

### Sprint 2 — AI department agents + knowledge base
The AI agent layer becomes real and useful, and knowledge stops living in people's heads: a shared AI client with per-department system prompts (Product, Engineering, Marketing, etc.), AI-generated sprint plans/backlogs/meeting summaries, a knowledge base/wiki with full-text search, and a decision log tied to meeting summaries.

**Done when:** a user can paste a meeting transcript and get a structured summary with action items auto-added to the task tracker, and can query a department agent for a sprint plan or backlog draft.

### Sprint 3 — Workflow automation, reporting, executive layer, launch polish
The automation and reporting layer that makes this an operating system, not just a task tool: trigger→action workflow rules, an approvals module, AI-generated executive reports (weekly updates, project health scores, risk analysis, dependency graphs), cross-team threaded chat, and a full hardening pass.

**Done when:** the full loop — task/meeting activity → automation → AI report → executive rollup — is demoable end to end and deployed.

## Repo documents

`README.md`, `PROJECT_PLAN.md`, `PRD.md`, `PERSONAS.md`, `COMPETITIVE_ANALYSIS.md`, `ROADMAP.md`, `KPI_FRAMEWORK.md`, `GTM_STRATEGY.md`, `PRICING_STRATEGY.md`, `EXECUTIVE_SUMMARY.md`, `BACKLOG.md`, `ARCHITECTURE.md` — added during Sprint 1 and kept current every sprint.

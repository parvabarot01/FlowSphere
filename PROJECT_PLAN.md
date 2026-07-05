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

## Roadmap

### Sprint 1 — Foundation, org structure, core collaboration primitives *(shipped)*
A working multi-tenant workspace where teams can create and track work: auth, organizations, teams, RBAC, audit log; core schema (organizations/users/projects/tasks/sprints); project and task management UI with a sprint planning board; in-app and email notifications; calendar view; CI/CD to Vercel.

**Done when:** a user can create an org, invite teammates, create a project with tasks, plan a sprint, and get notified of assignments. All true as of Sprint 1.

### Sprint 2 (Final) — AI department agents, knowledge base, automation, reporting, executive layer *(shipped)*
Originally planned as two separate sprints (AI agents + knowledge base, then workflow automation + reporting + launch polish), combined mid-project into one sprint with no pause in between — see `BACKLOG.md`. The AI agent layer, the automation/reporting layer, and the full hardening pass all shipped together: a shared Groq client with per-department system prompts, AI-generated sprint plans/backlogs, meeting-transcript summarization with auto-created action items, a knowledge base/wiki with full-text search, a decision log, trigger→action workflow automation, a sequential multi-step approvals module, AI-generated executive reports (weekly updates, health scores, risk analysis, dependency graphs), cross-team threaded chat, and an RLS/rate-limit/error-tracking/test-coverage hardening pass.

**Done when:** a user can paste a meeting transcript and get a structured summary with action items auto-added to the task tracker; query a department agent for a sprint plan or backlog draft; automate a trigger→action rule; route a request through approval; get an AI executive report; and chat cross-team. All true as of this sprint — see `ROADMAP.md` for the full shipped checklist.

## Repo documents

`README.md`, `PROJECT_PLAN.md`, `PRD.md`, `PERSONAS.md`, `COMPETITIVE_ANALYSIS.md`, `ROADMAP.md`, `KPI_FRAMEWORK.md`, `GTM_STRATEGY.md`, `PRICING_STRATEGY.md`, `EXECUTIVE_SUMMARY.md`, `BACKLOG.md`, `ARCHITECTURE.md` — added during Sprint 1 and kept current every sprint.

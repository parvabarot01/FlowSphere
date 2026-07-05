# FlowSphere

FlowSphere is an AI-native workplace operating system: one collaborative workspace for sprint planning, task tracking, meeting summaries, documentation, and cross-team communication — instead of stitching together Slack, Jira, Notion, Confluence, and Zoom. Every department gets an agent that lives inside the workspace and handles the repetitive glue work of turning meetings, docs, and tasks into a single coherent picture.

See [`PROJECT_PLAN.md`](./PROJECT_PLAN.md) for product vision, target users, tech stack, and the sprint roadmap; [`PRD.md`](./PRD.md) and [`PERSONAS.md`](./PERSONAS.md) for scope and target users; [`ARCHITECTURE.md`](./ARCHITECTURE.md) for schema, RLS, agent design, and API surface; [`ROADMAP.md`](./ROADMAP.md) and [`BACKLOG.md`](./BACKLOG.md) for what's shipped.

## Features

**Foundation** — multi-tenant orgs with RBAC (owner/admin/member), team invites, projects and tasks with a kanban board, sprint planning, in-app + email notifications, a calendar view, and an append-only audit log.

**AI agents** — paste a meeting transcript and get a structured summary with action items auto-added to the task tracker; ask a department agent (Product/Engineering/Design-QA/Executive) for a sprint plan or backlog draft grounded in your existing tasks; an org knowledge base with full-text search; a decision log tied to meeting summaries.

**Automation & executive layer** — trigger→action workflow automation rules; sequential multi-step approvals; AI-generated executive reports (weekly updates, project health scores, risk analysis, dependency graphs); cross-team threaded chat.

Every table is RLS-scoped to organization membership, every mutation is Zod-validated, and every AI-calling route is rate-limited against the underlying free-tier quota. See `ARCHITECTURE.md` for the full design.

## Tech stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Hosting:** Vercel
- **Database & Auth:** Supabase (Postgres, Auth, Storage, RLS, Realtime)
- **Background jobs / queue:** Upstash Redis + QStash
- **AI agents:** Groq API (Llama 3.3 70B)
- **Email:** Resend
- **Search:** Postgres full-text search
- **Error tracking:** Sentry
- **Testing:** Vitest

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and fill in your own service keys (Supabase, Upstash, Groq, Resend, Sentry — all optional at dev time; every integration degrades gracefully when its key is absent).
3. Run the dev server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000).

Run `npm test` for the unit test suite, `npm run lint` / `npx tsc --noEmit` for lint/typecheck, `npm run build` for a production build — all four run in CI on every push.

## Project structure

- `src/app` — routes and pages (Next.js App Router)
- `src/lib` — clients, helpers, and shared server/browser utilities (`ai/` for the Groq agent layer, `automation/` and `reports/` for background jobs, `validations/` for Zod schemas)
- `supabase/migrations` — database schema and RLS policy migrations
- `*.test.ts` files colocated with the code they test (Vitest)

## License

Proprietary — all rights reserved.

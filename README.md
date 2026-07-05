# FlowSphere

FlowSphere is an AI-native workplace operating system: one collaborative workspace for sprint planning, task tracking, meeting summaries, documentation, and cross-team communication — instead of stitching together Slack, Jira, Notion, Confluence, and Zoom. Every department gets an agent that lives inside the workspace and handles the repetitive glue work of turning meetings, docs, and tasks into a single coherent picture.

See [`PROJECT_PLAN.md`](./PROJECT_PLAN.md) for product vision, target users, tech stack, and the sprint roadmap. See [`PRD.md`](./PRD.md), [`PERSONAS.md`](./PERSONAS.md), and [`ARCHITECTURE.md`](./ARCHITECTURE.md) as they're added.

## Tech stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Hosting:** Vercel
- **Database & Auth:** Supabase (Postgres, Auth, Storage, RLS, Realtime)
- **Background jobs / queue:** Upstash Redis + QStash
- **AI agents:** Groq API (Llama 3.3 70B)
- **Email:** Resend
- **Search:** Postgres full-text search

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and fill in your own service keys (Supabase, Upstash, Groq, Resend).
3. Run the dev server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000).

## Project structure

- `src/app` — routes and pages (Next.js App Router)
- `src/components` — shared UI components
- `src/lib` — clients, helpers, and shared server/browser utilities
- `supabase/migrations` — database schema and RLS policy migrations

## License

Proprietary — all rights reserved.

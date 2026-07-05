# Executive Summary

## The problem

Small-to-mid product teams (15–50 people) run on a stitched-together stack — Jira for tickets, Notion for docs, Slack for everything else, and a PM manually doing the "glue work": summarizing meetings, chasing status, writing weekly rollups. Every AI feature bolted onto that stack today is a paid add-on layered on top of a pre-AI workflow, not a redesign of the workflow itself.

## The product

FlowSphere is a single AI-native workspace that replaces that stack for teams who don't need Jira's configuration depth or ClickUp's feature sprawl. Every department gets an agent living inside the workspace — not a chatbot bolted onto a dashboard, but the thing that turns a pasted meeting transcript into tracked action items, drafts a sprint plan from the existing backlog, and generates the weekly executive rollup a PM used to write by hand.

## What's built

- **Foundation:** multi-tenant orgs with RBAC, projects, tasks, sprint boards, notifications (in-app + email), calendar, append-only audit log — all RLS-enforced at the database layer.
- **AI agent layer:** meeting-transcript summarization with auto-created action items, department-agent sprint plan/backlog drafts, an org knowledge base with full-text search, and a decision log tied back to the meetings that produced them.
- **Automation & executive layer:** trigger→action workflow rules, sequential multi-step approvals, AI-generated executive reports (weekly updates, health scores, risk analysis, dependency graphs), and cross-team threaded chat.
- **Hardened:** RLS + rate-limit audit across every table and AI-calling route, error tracking, and core-flow test coverage.

Full detail in `PRD.md` (v1 scope) and `ARCHITECTURE.md` (schema, RLS, agent design, API surface). Live feature status in `BACKLOG.md`.

## Why now

Every competitor in `COMPETITIVE_ANALYSIS.md` treats AI as a premium tier on top of a pre-AI product. FlowSphere treats the agent layer as the product's reason for existing, and runs entirely on free-tier infrastructure (Supabase, Vercel, Groq, Upstash, Resend) — meaning the cost structure for the target segment (small teams, pre-budget-for-tools) is close to zero, not a Jira-plus-Notion-plus-Slack seat-license stack.

## Go-to-market & pricing

See `GTM_STRATEGY.md` and `PRICING_STRATEGY.md` for the plan to take this from a working product to paying teams.

## Honest gaps

No mobile app, no third-party integration marketplace, no enterprise SSO/SCIM, single-region hosting. These are accepted trade-offs for the current target segment, detailed in `COMPETITIVE_ANALYSIS.md` — revisited only if the target segment changes.

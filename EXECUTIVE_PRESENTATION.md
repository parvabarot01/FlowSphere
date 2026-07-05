# FlowSphere — One-Page Executive Presentation

**What it is:** An AI-native workplace operating system — one workspace replacing Jira + Notion + Slack + a human PM assistant for small-to-mid product teams (15–50 people).

**The problem:** Every AI feature in the incumbent stack is a paid add-on bolted onto a pre-AI workflow. PMs still manually summarize meetings, chase status, and write weekly rollups by hand.

**The bet:** Make the AI agent layer the product, not the upsell — paste a transcript, get tracked action items; ask a department agent for a sprint plan; get an executive rollup generated, not written.

---

## What's shipped

| Layer | Capability |
|---|---|
| Foundation | Multi-tenant orgs, RBAC, projects/tasks/sprints, notifications, calendar, audit log |
| AI agents | Meeting summarization → auto-created action items, department sprint-plan/backlog drafts, knowledge base with search, decision log |
| Automation & executive | Trigger→action rules, multi-step approvals, AI executive reports (health score, risk, dependencies), cross-team chat |
| Hardening | RLS + rate-limit audit, error tracking, core-flow tests |

## Why it wins

- **Cost:** runs entirely on free-tier infrastructure — near-zero marginal cost per team, vs. seat-licensed incumbents.
- **Positioning:** AI is core, not a premium add-on (see `COMPETITIVE_ANALYSIS.md`).
- **Focus:** does less than ClickUp/Monday on purpose, so what it does is zero-config.

## Honest gaps

No mobile app, no integrations marketplace, no enterprise SSO. Accepted trade-offs for the current target segment — not oversights.

## The ask / next steps

- **GTM:** product-led, founder-led content, warm-network-first launch (`GTM_STRATEGY.md`) — no paid acquisition budget required.
- **Pricing:** freemium, flat team pricing once usage outgrows shared free-tier quotas (`PRICING_STRATEGY.md`) — not per-seat.
- **Next:** move from private beta to public launch once the first warm-network cohort validates activation and retention (`KPI_FRAMEWORK.md`).

*Full detail: `EXECUTIVE_SUMMARY.md`, `PRD.md`, `ARCHITECTURE.md`, `BACKLOG.md`.*

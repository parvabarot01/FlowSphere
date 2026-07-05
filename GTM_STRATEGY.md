# Go-to-Market Strategy

## Target segment (ICP)

Small-to-mid product teams, 15–50 people, at seed-to-Series-B startups — teams past the "one spreadsheet" stage but not yet locked into an enterprise Jira/Confluence contract. Buyer and primary user is usually the same person: a Product Manager or founding engineer who owns tooling decisions without procurement friction. See `PERSONAS.md` for the four roles this has to work for day one (PM, Engineer, Designer/QA, Executive) — GTM messaging leads with the PM persona since they're the one who evaluates and champions the switch.

## Positioning

"The AI-native alternative to Jira + Notion + Slack + a human PM assistant" (from `COMPETITIVE_ANALYSIS.md`). The wedge isn't feature parity — it's that the AI agent layer is the product, not an upsell. Every GTM asset should lead with a concrete before/after: *paste a transcript → get tracked action items*, not "AI-powered project management."

## Why product-led, not sales-led

Zero-dollar constraint (`ARCHITECTURE.md`) isn't just an infra decision — it shapes GTM too. There's no ad budget and no sales team, so distribution has to come from the product being good enough to spread on its own plus founder-led content. That means:

1. **Self-serve signup, no demo gate.** Anyone can create an org and see value in the first session — the whole point of Sprint 1's "create org → invite → task → sprint → notified" loop being frictionless.
2. **Founder-led content**, not paid acquisition: build in public (progress updates, the free-tier architecture as a talking point for cost-conscious founders), write about the specific pain ("I used to spend 3 hours/week writing status updates") rather than generic AI-productivity content.
3. **Community seeding** in places the ICP already is: indie/startup builder communities, PM-specific communities (where "I hate writing status updates" is a universally shared complaint), r/ProductManagement-style forums. Not cold outbound.
4. **Warm network first.** Before any public launch, the first 10–20 teams should come from direct founder relationships — people who'll give honest, fast feedback and tolerate rough edges in exchange for early access.

## Launch sequence

1. **Private beta (current stage):** a handful of warm-network teams, direct onboarding, feedback loop tight enough to ship fixes same-day.
2. **Public launch:** a single strong artifact (a demo video or interactive sandbox showing the meeting-transcript-to-action-items flow, since that's the sharpest wedge) posted where builders and PMs actually are — not a press release, a demo.
3. **Content cadence post-launch:** one concrete "how we built X for free" or "here's the exact status-update time this saved" post per sprint cycle, tied to real usage data once `KPI_FRAMEWORK.md`'s instrumentation exists.

## Channels ranked by expected effort-to-signal ratio

| Channel | Cost | Why it's here |
|---|---|---|
| Warm network / direct outreach | Time only | Highest-quality feedback, fastest iteration loop |
| Builder/PM communities (organic posts) | Time only | ICP is already there; no ad spend needed |
| Founder-led content (build-in-public) | Time only | Compounds — every post is a permanent asset |
| SEO/content marketing | Time, slow payoff | Deferred until there's a stable feature set worth ranking for |
| Paid acquisition | $ | Explicitly out of scope while the zero-dollar constraint holds |

## Success signal

Not signups — activation and retention, per `KPI_FRAMEWORK.md`: does an org create a project and task within 48 hours, and do members keep coming back weekly. A GTM motion that drives signups but not activation is solving the wrong problem.

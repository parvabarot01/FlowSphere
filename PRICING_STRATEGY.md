# Pricing Strategy

## Starting position

The entire stack runs on free tiers today (`ARCHITECTURE.md` — Supabase, Vercel, Groq, Upstash, Resend), so marginal cost per additional small team is near zero until real usage bumps into one of the documented free-tier ceilings (500MB database, 100 emails/day, Groq's per-minute rate limit, 500 QStash messages/day). That means pricing isn't funding infrastructure yet — it's funding the time to keep building and, eventually, the upgrade to paid tiers of these same services once a team's usage genuinely requires it. Pricing should reflect that honestly rather than pretending there's a cost basis that doesn't exist yet.

## Model: freemium, team-seat-light

Per-seat pricing (the Jira/Asana model) is a bad fit for the target segment (`GTM_STRATEGY.md` ICP) — a 20-person team evaluating "one more tool" is exactly the audience allergic to seat-license math. Instead:

| Tier | Price | What's included | Who it's for |
|---|---|---|---|
| **Free** | $0 | Everything in this repo today: unlimited projects/tasks/sprints, AI agent features, automation, approvals, chat — capped only by the underlying free-tier service ceilings shared across the whole org (e.g., Groq rate limits, Resend's 100 emails/day) | Teams up to ~15–20 active members, or anyone evaluating before committing |
| **Team** | Flat monthly fee (not per-seat) | Same features, but backed by paid tiers of the underlying services (higher Groq throughput, more email volume, more QStash jobs) so a growing team doesn't hit shared free-tier ceilings | Teams that have outgrown the Free tier's shared quotas, not teams wanting a feature the Free tier lacks |
| **Growth** (future) | Custom | Priority support, data export/retention guarantees, higher usage ceilings | Teams large enough to need operational guarantees, not just headroom |

Deliberately **not** gating core features (AI agents, automation, reporting) behind a paid wall — the whole positioning in `COMPETITIVE_ANALYSIS.md` is that AI is the product, not an upsell. Gating it behind a paywall would be the exact mistake every competitor already makes.

## Why flat, not per-seat

1. **Matches the cost driver.** The actual constraint that costs money is shared-service usage (API calls, emails, database size) — not headcount directly. A 30-person team where 5 people are active costs less than a 10-person team where all 10 are active. Pricing on usage/tier, not seats, matches reality.
2. **Removes the "one more license" objection.** The ICP (`GTM_STRATEGY.md`) actively resents per-seat math from prior tools. A flat team price sidesteps that friction entirely.
3. **Simplicity as a selling point.** No usage calculator, no seat negotiation — one number, matching the "opinionated, zero-config" positioning already established in `COMPETITIVE_ANALYSIS.md`.

## Open question, deliberately unresolved

Exact Team-tier price point isn't set yet — that requires knowing real usage patterns against the free-tier ceilings once there's actual paying-adjacent demand (i.e., a team hitting the Free tier's shared quotas is the trigger to have this conversation, not a date on a calendar). Revisit once `KPI_FRAMEWORK.md` instrumentation shows real orgs approaching those ceilings.

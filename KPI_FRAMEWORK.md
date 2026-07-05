# KPI Framework (draft)

Draft as of Sprint 1 — defines what should be measured and why. Instrumentation (actually capturing these events) is not yet built; that's a Sprint 2/3 follow-up once there's a real usage signal worth measuring. Recorded now so metric definitions don't drift as features get added.

## 1. Adoption

The question this answers: is the org actually using FlowSphere as its system of record, or did people sign up and quietly go back to Jira/Notion?

| Metric | Definition | Why it matters |
|---|---|---|
| Activation rate | % of orgs that create ≥1 project and ≥1 task within 48h of org creation | Catches "signed up but never got past onboarding" |
| Weekly active members | Members with ≥1 write action (task/sprint/project mutation) in a 7-day window, ÷ total members | Distinguishes real usage from a ghost org with one admin logged in |
| Invite acceptance rate | Accepted invites ÷ invites sent | A low rate signals either invite-flow friction or the invited person doesn't see the value |

## 2. Time-saved proxy metrics

FlowSphere can't directly measure "hours saved" — that requires self-reported baseline data. Instead, track proxies that plausibly correlate with time saved once Sprint 2's AI features exist to compare against:

| Metric | Definition | Why it's a proxy |
|---|---|---|
| Manual status updates avoided | Count of dashboard/board views by non-assignees (i.e., "checking status" without pinging someone) | Every such view is a Slack message or meeting that didn't have to happen |
| Meeting-transcript-to-action-items usage (Sprint 2) | # transcripts submitted ÷ # sprints run | Direct measure of the flagship "automates the glue work" feature once it exists |
| Task updates per assignee per week | Median task status/assignee changes per active member | A rough floor for "is tracking actually happening here, or is the board stale" |

## 3. Project health score accuracy

Sprint 3 introduces an AI-generated project health score. Before trusting it, this framework needs a way to check it isn't noise:

| Metric | Definition | Why it matters |
|---|---|---|
| Health score / human rating agreement | % of scores where a PM's manual "healthy / at risk / off track" call matches the generated score, sampled periodically | The score is worthless if it doesn't match what a PM would say by reading the board directly |
| False "at risk" rate | % of "at risk" flags that a PM overrides as fine | High false-positive rate trains users to ignore the signal |
| Score staleness | Time between an underlying change (e.g., sprint goes overdue) and the score reflecting it | A health score that lags reality by a week isn't actionable |

## What Sprint 1 actually has today

No analytics/event-tracking pipeline exists yet — this section is deliberately just the audit log (append-only, who-did-what) plus whatever can be derived from raw table counts (members, projects, tasks, sprints) via direct queries. That's enough to sanity-check activation and weekly-active manually; a proper events pipeline is a Sprint 2+ decision once there's a concrete report (Sprint 2's meeting-summary/backlog features) that needs to consume it.

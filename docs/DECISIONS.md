# Decisions

## 2026-08-22 — Four synthetic scheme archetypes for demo breadth

- **Status:** Accepted
- **Context:** The Stage 0 “one complete journey” cut delivered a working explorer, but the presentational scheme switcher and a single water-works tree under-sold how different public fund-flow shapes feel. Public budget / SNA / DBT documents describe cardinally different topologies (works float, demand wages, central DBT, matching society).
- **Decision:** Stage 1 keeps only local deterministic synthetic fixtures, but ships four fictional archetypes sharing the Sundar / Aravali / Malwa geography. One-time citizen research of published documents may calibrate topology and ratios; the app must not scrape, login to, or wire live government systems. Fixtures never copy real district rupee rows or real scheme branding.
- **Consequences:** The switcher is real; reviewers can contrast gap types (unpublished float vs late wage file vs returned credit vs missing state share). Stage 3 still requires a licensed adapter and explicit approval before any non-synthetic source.

## 2026-08-22 — Adaptive hierarchy for the flow map

- **Status:** Accepted
- **Context:** A static full tree cannot reliably show every node at overview zoom; the Lovable-style explorer needs level-of-detail without hiding the user’s focus path.
- **Decision:** The flow map exposes hierarchy bands (Auto, National→State, State→District, District→Agency, Full). Auto selects the band from zoom, keeps the selected-node ancestor path visible, and at higher zoom prefers the focus state’s branch. The fourth column’s display label comes from `scenario.lastMileLabel` (Agency / Panchayat / Credit batch / Facility) without changing the `agency` node level.
- **Consequences:** Overview stays readable; drill-down reveals deeper levels. Layout is computed from the canonical tree rather than hardcoded coordinates, so fixtures can grow without rewriting the canvas.

## 2026-08-22 — Synthetic-first, adapter-ready data model

- **Status:** Accepted
- **Context:** The competition prohibits live government-system connections and requires mock or synthetic data, while the product should be extendable after the competition.
- **Decision:** Stage 1 uses only local deterministic synthetic fixtures. The app will consume a canonical fund-flow model through replaceable source adapters.
- **Consequences:** The demo remains compliant and reliable. Future data integrations require a deliberate adapter, permission/licensing review, and normalization work.

## 2026-08-22 — Reconciliation, not accusation

- **Status:** Accepted
- **Context:** A difference between released, transferred, reported, and spent funds can result from valid timing, balances, or incomplete reporting.
- **Decision:** The product surfaces reconciliation status and information gaps with explainable categories. It does not infer misconduct or identify individuals as responsible.
- **Consequences:** The experience is safer, more credible, and more useful to citizens; it does not claim to be a corruption detector.

## 2026-08-22 — One complete journey before platform breadth

- **Status:** Superseded for Stage 1 demo breadth by “Four synthetic scheme archetypes” above; the original intent (finish one journey before platforms/admin tools) remains.
- **Context:** The judges assess a working, end-to-end citizen experience rather than an admin panel or static concept.
- **Decision:** Build a single rich synthetic scenario before adding multiple schemes, authoring tools, or integrations.
- **Consequences:** The prototype will be easier to complete, test, demo, and deploy before the deadline.

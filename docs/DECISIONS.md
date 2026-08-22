# Decisions

## 2026-08-22 — Adaptive hierarchy for the flow map

- **Status:** Accepted
- **Context:** A static full tree cannot reliably show every node at overview zoom; the Lovable-style explorer needs level-of-detail without hiding the user’s focus path.
- **Decision:** The flow map exposes hierarchy bands (Auto, National→State, State→District, District→Agency, Full). Auto selects the band from zoom, keeps the selected-node ancestor path visible, and at higher zoom prefers the focus state’s branch.
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

- **Status:** Accepted
- **Context:** The judges assess a working, end-to-end citizen experience rather than an admin panel or static concept.
- **Decision:** Build a single rich synthetic scenario before adding multiple schemes, authoring tools, or integrations.
- **Consequences:** The prototype will be easier to complete, test, demo, and deploy before the deadline.

# Decisions

## 2026-08-22 — Used here: office consumption vs leftover

- **Status:** Accepted
- **Context:** Real offices spend a capped admin/support slice at their own level. Showing only Received / Sent onward / What’s left made that slice look like money missing from the next office.
- **Decision:** Citizen equation is **Received = sent to named offices + used here + what’s left**. Optional `usedHerePaise` / `usedHereLabel` on funding nodes. Parents: sent onward = child sum; leftover must equal `unpublishedPaise`. Leaves: used here = reported utilisation. Tree shows a three-segment bar (gold / teal / amber) and a teal amount chip — no third layout-node kind and no card paragraphs. Ledger adds a Used here column; inspector adds one scheme-aware remark.
- **Consequences:** Fixtures raise received when leftover is too small to peel, so named children stay stable. Calibration notes the ~6% / support / thin-DBT toy scales in `docs/SYNTHETIC-CALIBRATION.md`.

## 2026-08-22 — Citizen leftover: still on ledger vs next office not named

- **Status:** Accepted (tightened; extended by “Used here” above)
- **Context:** Ledger columns invited subtraction. Showing Received 140 / Reported sent 140 / What’s left 5 looked broken even when ₹5 Cr was a real untraced-to-children gap.
- **Decision:** For any node with named children, Sent onward = sum of those children. What’s left = Received − Sent onward − Used here (“next office not named” when that remainder has no named next office). Leaf rows use Used here = utilisation on that ledger (“still on this ledger”). Fixtures must obey the same rule; `findStandingInconsistencies` checks it. Matching-society national is exempt from child ≤ parent because state match merges below.
- **Consequences:** Centre row always reads with finger math. Citizens can verify every parent row the same way.

## 2026-08-22 — Realistic synthetic gazetteer and five-level last-mile

- **Status:** Accepted
- **Context:** Cartoon place-noun districts (`Maidan`, `Khet`) and four-level trees made allocations feel like “₹13 Cr to a Hindi word,” not like public-scheme machinery. Public operational notes describe block / programme-officer / BPMU bands and body-specific last miles (Paani Samiti, FTO, APBS file, PHC).
- **Decision:** Keep four fictional scheme archetypes and toy-scale synthetic rupees. Replace geography with a shared fictional gazetteer (Kanak Pradesh / Girikhand / Meera Coast). Extend the canonical tree to National → State → District → Block → last-mile. Attach scheme-specific `bodyKind` / `workLabel` and SNA/FTO/APBS-style transfer references. Authoring may read public documents once; the product still ships only local fixtures — no scraper, no live portal rows.
- **Consequences:** The explorer shows implementing bodies and instruments. Dense expansion is limited to the Raital branch so Auto layout stays demoable. Calibration stays in `docs/SYNTHETIC-CALIBRATION.md`.

## 2026-08-22 — Four synthetic scheme archetypes for demo breadth

- **Status:** Accepted
- **Context:** The Stage 0 “one complete journey” cut delivered a working explorer, but the presentational scheme switcher and a single water-works tree under-sold how different public fund-flow shapes feel. Public budget / SNA / DBT documents describe cardinally different topologies (works float, demand wages, central DBT, matching society).
- **Decision:** Stage 1 keeps only local deterministic synthetic fixtures, but ships four fictional archetypes sharing one fictional geography. One-time citizen research of published documents may calibrate topology and ratios; the app must not scrape, login to, or wire live government systems. Fixtures never copy real district rupee rows or real scheme branding.
- **Consequences:** The switcher is real; reviewers can contrast gap types (unpublished float vs late wage file vs returned credit vs missing state share). Stage 3 still requires a licensed adapter and explicit approval before any non-synthetic source.

## 2026-08-22 — Adaptive hierarchy for the flow map

- **Status:** Accepted (extended for block band)
- **Context:** A static full tree cannot reliably show every node at overview zoom; the Lovable-style explorer needs level-of-detail without hiding the user’s focus path.
- **Decision:** The flow map exposes hierarchy bands (Auto, National→State, State→District, District→Block, Block→last-mile, Full). Auto selects the band from zoom, keeps the selected-node ancestor path visible, and at higher zoom prefers the focus state’s branch. The last column’s display label comes from `scenario.lastMileLabel` without changing the `agency` node level.
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

# Roadmap

## Goal

Deliver a live, independent, mobile-first prototype that lets a citizen trace a fictional public-scheme allocation through reported levels of distribution, understand any unreconciled amount without accusations, and inspect the supporting synthetic record trail.

## Stage 0 — Product spine `[IN PROGRESS]`

**Outcome:** One implementation-ready citizen journey and scenario, not a broad platform specification.

- [x] Confirm competition, data, and safety constraints.
- [x] Define the product framing: visibility and reconciliation, never allegation.
- [x] Set the plug-in source / canonical-model architecture direction.
- [x] Choose the fictional scheme and plain-language citizen question.
- [x] Define the scenario topology: national → state → district → implementing agency.
- [x] Write the reconciliation categories and story for the highlighted status.
- [x] Build the first-minute demo journey and essential screens.
- [x] Select implementation stack and testing baseline.
- [x] Define Stage 1 acceptance criteria and explicitly cut non-essential work.

## Stage 1 — Working citizen journey `[COMPLETE]`

**Outcome:** A reviewer can complete the main journey in a browser without assistance.

- [x] Scheme overview with released, reported, and needs-explanation summaries.
- [x] Progressive map/tree drill-down across the synthetic fund flow.
- [x] District/agency detail with transfer timeline and reconciliation explanation.
- [x] Multiple synthetic scheme archetypes with a working switcher (works SNA, demand wage, central DBT, matching society).
- [x] Responsive, accessible, low-bandwidth-friendly interface.
- [x] Public deployment ([ourmoney.fyi](https://ourmoney.fyi)).
- [x] Scenario tests.
- [x] Evidence/provenance drawer identifying every record as synthetic.

## Stage 2 — Credibility and polish `[IN PROGRESS]`

- [x] Plain-language “Explain this status” assistant grounded only in the displayed scenario.
- [x] Shareable evidence card and disclosure page.
- [x] Citizen landing + place locator (fictional gazetteer) — now Ask-first with typeahead.
- [x] Reconciliation flag layer on flow map.
- [x] Information-request draft → full RTI composer (copy/share/download; does not file).
- [x] Cloudflare Worker proxy for OpenRouter (OpenAI primary).
- [x] Deterministic reconciliation engine with unit tests.
- [x] Evidence/provenance drawer identifying every record as synthetic.
- [x] Empty, loading, error, and slow-network states (template AI fallback + skeletons + retry).
- [x] Compare / Features / How it scales / About honesty pages; Ask-only footer.
- [x] Hindi UI strings + voice input; PWA offline shell.
- [ ] Submission video (draft script in STAGE-2-SUBMISSION.md); written summary updated for Ask + Explore + RTI.

## Stage 3 — Post-competition expansion `[IN PROGRESS]`

- [x] Mock / Live data-mode toggle with replaceable `IFundFlowSource`.
- [x] First public-record extract: MGNREGA Himachal Pradesh FY 2025–26 (local fixture, no scrape).
- [ ] Refresh / expand extracts when official MIS Excel/HTML is reliably available.
- [ ] Add further licensed-open-data adapters after legal and licensing review.
- [ ] Add approved partner-data adapters only when access is explicitly authorized.
- [ ] Create scenario authoring tools for researchers; never an unapproved scraper.

## Scope cuts for the competition build

- No live government integrations, scraping, or automatic data collection in the product. One-time reading of published budget/SNA/DBT documents to calibrate synthetic recipes is allowed; copying live portal rows is not.
- No real persons, officers, beneficiaries, payments, or transaction data.
- No login, public submissions, complaints workflow, or admin panel.
- No attempt to cover every government scheme or every geography (four fictional archetypes only).
- No allegations, rankings of people, or corruption-detection claims.
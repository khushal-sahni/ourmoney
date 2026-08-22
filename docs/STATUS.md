# Project Status

> Last updated: 2026-08-22 · Session 5

## Current state

Stage 1 citizen journey runs locally as a full-bleed scheme explorer with **four cardinally different synthetic scheme archetypes**, a stacked scheme switcher, quieter pan/zoom, collision-aware flow layout, and a persisted day/night theme.

## What works

- Four synthetic scenarios sharing Sundar / Aravali / Malwa geography:
  - Community Water Access Mission — works / SNA float
  - Rural Works Guarantee — demand wage + material, panchayat last mile
  - Landholder Income Support — central DBT installment credits
  - Neighbourhood Health Mission — 60:40 matching society route
- Scheme switcher loads catalog + scenario by id and focuses each scheme’s highlight node; label sits above the scheme name.
- Flow map: dampened pan/zoom, adaptive hierarchy with last-mile labels, awaiting cards placed after published children, per-column collision resolve, ledger alternate view, detail inspector with scheme-kind copy.
- Light and dark themes via a header day/night toggle (`nagrik-theme` in localStorage); dark muted text lifted for readability.
- Metrics derived from scenario data; every surface labels the prototype and data as synthetic.
- Calibration note documents public sources used for topology/ratios only ([docs/SYNTHETIC-CALIBRATION.md](SYNTHETIC-CALIBRATION.md)).

## In progress

- Unit tests for hierarchy layout, money formatting, and reconciliation presentation.
- Public deployment and a tight first-minute demo path across schemes.

## Blockers

- None.

## Next concrete step

Add focused unit tests (especially layout collision / awaiting placement), then deploy a public reviewable build and rehearse a two-minute walkthrough that switches archetypes once.

## Architecture snapshot

```text
src/
├── domain/              # fund-flow types + adaptive hierarchy/layout
├── data/
│   ├── fixtures/        # four synthetic scenarios + catalog source
│   └── sources/         # IFundFlowSource (catalog + load by id)
├── services/            # ledger orchestration
├── components/          # FlowCanvas, ThemeToggle
├── utils/               # money + theme helpers
└── App.tsx              # explorer shell (switcher + flow + ledger + inspector)
```

## Data and safety boundary

- All current and competition-demo data is synthetic.
- No scraping or live government-system integrations.
- One-time public-document research may inform fixture recipes; fixtures do not copy live rows.
- Future sources must implement an adapter and normalize to the canonical model.

## Tech debt

- Hierarchy auto-mode currently keys off zoom + focus branch; viewport-frustum culling could further reduce clutter on larger scenarios.
- Matching-share state contribution is visible in reconciliations and node totals, not as a separate national parent edge.

## Open questions

- Whether Stage 1 also needs a geographic map alongside the schematic flow tree.

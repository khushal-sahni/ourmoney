# Project Status

> Last updated: 2026-08-22 · Session 3

## Current state

Stage 1 citizen journey is running locally as a dark, full-bleed scheme explorer. Codex’s interrupted redesign is finished: pan/zoom flow canvas, adaptive hierarchy bands, ledger alternate view, and detail inspector.

## What works

- Synthetic Community Water Access Mission scenario (national → state → district → agency) with amber “awaiting details” gaps.
- Flow map: cursor-anchored wheel zoom, drag pan, two-finger pinch, volume-weighted gold edges, LOD node cards.
- Adaptive hierarchy: Auto (from zoom) plus manual National→State / State→District / District→Agency / Full switcher.
- Ledger table alternate view with indented hierarchy, search, breadcrumbs, and mobile bottom-sheet inspector.
- Metrics derived from scenario data; every surface labels the prototype and data as synthetic.

## In progress

- Unit tests for hierarchy layout, money formatting, and reconciliation presentation.
- Public deployment and a tight first-minute demo path.

## Blockers

- None.

## Next concrete step

Add focused unit tests, then deploy a public reviewable build and rehearse the two-minute walkthrough.

## Architecture snapshot

```text
src/
├── domain/              # fund-flow types + adaptive hierarchy/layout
├── data/                # source contract + synthetic fixture
├── services/            # ledger orchestration
├── components/          # FlowCanvas
├── utils/               # money display helpers
└── App.tsx              # explorer shell (flow + ledger + inspector)
```

## Data and safety boundary

- All current and competition-demo data is synthetic.
- No scraping or live government-system integrations.
- Future sources must implement an adapter and normalize to the canonical model.

## Tech debt

- Hierarchy auto-mode currently keys off zoom + focus branch; viewport-frustum culling could further reduce clutter on larger scenarios.
- Scheme switcher is presentational (single scenario) until a second fixture exists.

## Open questions

- Whether Stage 1 also needs a geographic map alongside the schematic flow tree.

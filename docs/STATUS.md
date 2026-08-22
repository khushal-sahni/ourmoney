# Project Status

> Last updated: 2026-08-22 · Session 9

## Current state

Stage 1 citizen journey runs locally as a full-bleed scheme explorer with **four cardinally different synthetic scheme archetypes**, a shared fictional Indian gazetteer, a five-level flow tree (National → State → District → Block → last-mile), scheme-specific implementing bodies, **used-here office consumption** on tree and ledger, and a persisted day/night theme.

## What works

- Four synthetic scenarios sharing Kanak / Girikhand / Meera Coast geography with dense Raital drill-down:
  - Community Water Access Mission — SWSM SNA → DWSM → block → Paani Samiti / PHED
  - Rural Works Guarantee — SEGF → DPC → Block PO → Gram Panchayat (wage FTO + material)
  - Landholder Income Support — DBT cell → DAO → block enrollment → APBS credit file
  - Neighbourhood Health Mission — SHS → DHS → BPMU → PHC/CHC/VHC (60:40 matching)
- Citizen standing: **Received = sent onward + used here + what’s left** (admin/support/last-mile use is not leftover).
- Tree: segmented gold / teal / amber bar + teal used-here amount chip; awaiting stays a separate next-column card.
- Ledger columns: Node · Received · Sent onward · Used here · What’s left; inspector one-line used-here remark.
- Scheme switcher loads catalog + scenario by id and focuses each scheme’s highlight node.
- Flow map: five-column adaptive hierarchy, work labels on nodes, quieter pan/zoom, collision-aware layout, ledger alternate view, detail inspector with official body name + scheme-kind copy.
- Light and dark themes via a header day/night toggle (`nagrik-theme` in localStorage).
- Metrics derived from scenario data; every surface labels the prototype and data as synthetic.
- Calibration note documents public sources used for topology/vocabulary only ([docs/SYNTHETIC-CALIBRATION.md](SYNTHETIC-CALIBRATION.md)).

## In progress

- Unit tests for hierarchy layout, money formatting, and reconciliation presentation.
- Public deployment and a tight first-minute demo path across schemes.

## Blockers

- None.

## Next concrete step

Add focused unit tests (especially five-level layout / awaiting placement / used-here math), then deploy a public reviewable build and rehearse a two-minute walkthrough that switches archetypes once.

## Architecture snapshot

```text
src/
├── domain/              # fund-flow types + adaptive hierarchy/layout (5 levels)
├── data/
│   ├── fixtures/        # gazetteer + four synthetic scenarios + catalog source
│   └── sources/         # IFundFlowSource (catalog + load by id)
├── services/            # ledger orchestration
├── components/          # FlowCanvas, ThemeToggle
├── utils/               # money + theme helpers
└── App.tsx              # explorer shell (switcher + flow + ledger + inspector)
```

## Data and safety boundary

- All current and competition-demo data is synthetic.
- No scraping or live government-system integrations in the product.
- One-time public-document research may inform fixture recipes; fixtures do not copy live rows.
- Future sources must implement an adapter and normalize to the canonical model.

## Tech debt

- Hierarchy auto-mode currently keys off zoom + focus branch; viewport-frustum culling could further reduce clutter on larger scenarios.
- Matching-share state contribution is visible in reconciliations and node totals, not as a separate national parent edge.

## Open questions

- Whether Stage 1 also needs a geographic map alongside the schematic flow tree.

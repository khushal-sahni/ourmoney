# Project Status

> Last updated: 2026-08-22 · Session 11 (paused)

## Current state

Stage 1 citizen journey for **ourmoney** is live at [ourmoney.fyi](https://ourmoney.fyi): full-bleed scheme explorer with **four cardinally different synthetic scheme archetypes**, shared fictional gazetteer, five-level flow tree, used-here standing, day/night theme, and a mobile-first dismissible details sheet. Competition-ready as a synthetic-data prototype; active build paused for a few days (interview prep).

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
- Flow map: five-column adaptive hierarchy, work labels on nodes, quieter pan/zoom, collision-aware layout, ledger alternate view, detail inspector with official body name + scheme-kind copy. Node tap updates selection (and mobile CTA label) only; auto branch focus changes on scheme load / search. Double-tap toggles immediate child branches.
- Mobile (≤850px): inspector closed by default as a 75vh bottom sheet; open from **View details** CTA; dismiss with ×, backdrop, or Escape. Compact header + collapsible metrics summary + hierarchy select so the map keeps most of the viewport.
- Light and dark themes via a header day/night toggle (`ourmoney-theme` in localStorage).
- Metrics derived from scenario data; every surface labels the prototype and data as synthetic.
- Calibration note documents public sources used for topology/vocabulary only ([docs/SYNTHETIC-CALIBRATION.md](SYNTHETIC-CALIBRATION.md)).
- Public deploy: [ourmoney.fyi](https://ourmoney.fyi).

## In progress

- Paused. Optional later: evidence drawer, unit tests, Stage 2 polish.

## Blockers

- None.

## Next concrete step

Resume after interview prep if needed: evidence/provenance drawer, scenario tests, or submission video/summary for the hackathon deadline (28 August 2026).

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

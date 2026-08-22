# Changelog

## Session 3 — 2026-08-22

### Built

- Finished the interrupted Codex redesign: full-bleed pan/zoom flow workspace with pinch, cursor-anchored zoom, weighted gold edges, and amber awaiting-details nodes.
- Added adaptive hierarchy bands (Auto from zoom, plus National→State / State→District / District→Agency / Full) with dynamic tree layout instead of hardcoded positions.
- Expanded the synthetic scenario across three states and nested districts/agencies; metrics now compute from fixture data.
- Polished ledger alternate view (indented hierarchy), inspector (allocation in full), mobile bottom sheet, and synthetic-data disclosure copy.

### Verified

- `npm run build` completes successfully with TypeScript strict checking.

### Deferred

- Automated tests, public deployment, and submission assets.

### Tech debt

- Auto hierarchy could later use viewport frustum culling for very large trees; scheme switcher still targets a single scenario.

## Session 2 — 2026-08-22

### Built

- Scaffolded a strict TypeScript React/Vite app with a production build command.
- Added a canonical fund-flow domain model, replaceable source contract, synthetic source, and ledger service.
- Built the local citizen journey: programme overview, interactive fund-flow explorer, transfer trail, and reconciliation explanation panel.
- Added responsive styling and explicit synthetic-data / independent-prototype disclosure.

### Verified

- `npm run build` completes successfully.
- Browser checks confirmed the explanation panel and selected-node drill-down work.

### Deferred

- Automated tests, geographic map treatment, public deployment, and submission assets.

### Tech debt

- The flow visual currently uses columns rather than explicit connecting transfer lines; add relationship rendering when polishing the visual narrative.

## Session 1 — 2026-08-22

### Defined

- Reframed the project as a synthetic, independent public-scheme fund-flow transparency prototype.
- Established a non-accusatory reconciliation vocabulary and competition-safe data boundary.
- Chose a plug-in source-adapter architecture around a canonical fund-flow model.

### Changed

- Rewrote the project operating instructions, status, roadmap, and decision log to replace generic templates.

### Deferred

- Product naming, scenario design, stack selection, and all application code are deferred to Stage 0 completion.

### Tech debt

- None.

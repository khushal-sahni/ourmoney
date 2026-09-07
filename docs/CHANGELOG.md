# Changelog

## Session 24 — 2026-09-07

### Changed

- **Mobile Explore declutter:** drop the scheme-totals metrics pane and the floating breadcrumb overlay so the flow map fills the screen. Keep only the bottom “View details” CTA (selected node name). Desktop metrics bar and breadcrumbs unchanged.

## Session 23 — 2026-09-07

### Fixed

- **iPhone Ask first view:** shells size to `visualViewport` via `--app-height` (no `min-height: 100vh`). Ask empty body scrolls so chrome stays visible and all four starters sit above the footer; safe-area insets on chrome/footer. Static compare/features/scale pages can scroll like About.

### Changed

- **Mobile Explore:** map fills the work region; persistent bottom “View details” CTA opens a dismissible bottom sheet with the full inspector. Explore chat on mobile uses the same sheet. Desktop resizable panes unchanged.

## Session 22 — 2026-09-07

### Fixed

- **RTI Print / PDF:** `window.open(..., 'noopener,noreferrer')` returned `null`, so the draft never wrote and print never ran (blank tab only). Print now uses a same-document hidden iframe, then the browser print dialog (Save as PDF still available).

## Session 21 — 2026-09-07

### Changed

- **Voice dictation UX:** mic opens a ChatGPT-style recording bar (waveform + live interim text, cancel / confirm). Confirm fills the composer draft for editing; voice never auto-sends. Escape cancels. Applies to Ask landing, Ask follow-up, and Explore chat.

## Session 20 — 2026-09-07

### Built

- **Chrome Info menu:** shared `AppChrome` Info overflow lists Compare / Features / How it scales / About plus the synthetic-data disclosure, so site pages stay reachable during Ask conversation and Explore without a footer under the docked composer. Ask empty-state `SiteFooter` unchanged.

## Session 19 — 2026-09-06

### Built

- **Static pages:** `#compare`, `#features`, `#scale`, redesigned `#about` on a shared `StaticPage` shell. Ask-only `SiteFooter` carries Compare / Features / How it scales / About — Explore stays chrome-dense without a footer.
- **RTI composer:** domain `rti-request.ts` resolves PIO / appellate authority from `bodyKind` + level, builds Section 2(f) record points, encodes fee / 30-day / appeal scaffolding, and splits past rtionline.gov.in's 3000-char Text of Application into Annexure A. Four-step modal reachable from Ask answers, Explore docked chat, and inspector.
- **Hindi + voice:** `src/i18n/strings.ts` + `useT()`; Web Speech API mic on Ask and chat composers (`hi-IN` / `en-IN`); `html lang` switches with locale.
- **PWA:** `vite-plugin-pwa` autoUpdate + offline banner (Explore works offline; Ask falls back).

### Changed

- Information-request draft panel superseded by RTI composer; `buildShareText` retained.
- Deleted unused `landing-overlay.tsx`. AGENTS.md Stage 2 deadline corrected.

## Session 18 — 2026-09-06

### Fixed

- **Ask scheme-only bounce:** questions that name a scheme but not a place (e.g. landholder income “which village got the most”) now ground on the national root, rank named district offices from the synthetic ledger, and answer instead of refusing with a gazetteer bounce.
- **Fake “API unavailable” badge:** guidance and optimistic template replies no longer set `source: 'template'`. The offline badge appears only after a real `/api/ask` fallback.
- **Ambiguous follow-ups:** cold-start “Hey?” still gets gazetteer guidance; after a ledger-backed answer, ambiguous messages inherit the active scheme and focus.

### Built

- `rankNamedPlaces` / `nationalRootNode` domain helpers; scheme-only Ask slice attaches top districts as `related` for template and model ranking.

## Session 17 — 2026-09-06

### Built

- **Client session persist:** chat, locale, scheme, selection, and highlights survive hard refresh via `localStorage` (`ourmoney-session`). Full scenario trees are not stored — messages keep `schemeId` and rehydrate fixtures on load. Explore URL hash still overrides scheme/node on boot.

### Fixed

- **Scheme switcher stuck loading:** switching schemes kept the previous node id (e.g. Piprahi). When that id is absent from the new tree, `selected` stayed undefined and Explore never left the skeleton screen. Load now falls back to the scheme’s default focus; switcher also updates the `#explore?scheme=&node=` hash.
- **Explore Ask CTAs:** header Ask and inspector “Ask about this” open the docked chat pane instead of navigating to the Ask landing. Chrome Ask | Explore switcher is unchanged.
- **Open in Explore no-op:** Ask’s path artifact required local `activeIntent`, which is cleared when Ask remounts while chat messages persist. CTA now uses the message’s `schemeId` (then session). AppRouter follows `session.route` so `openExplore` switches views reliably.

## Session 16 — 2026-09-05

### Built

- **Ask-first dual view:** default Ask landing (composer, starters, gazetteer typeahead, EN/हि); Explore at `#explore` with deep links.
- Persistent **Ask | Explore** switcher and shared session (scheme, node, chat, highlights).
- Cross-scheme intent resolver (`resolve-question-intent.ts`) — roads/wage/health keywords, Orai → Uttar Raital honest miss.
- Path artifact card + Open in Explore; API `followUps` surfaced as chips.
- Evidence/provenance drawer (synthetic record trail per node).
- Deterministic `reconciliation-engine.ts`; Vitest scenario tests (14 passing).
- Loading skeletons, catalog/scenario error + retry states.

### Changed

- `App.tsx` → thin router + `SessionProvider`; explorer extracted to `features/explore/explore-app.tsx`.
- Fixture load asserts `findStandingInconsistencies` at boot.

### Verified

- `npm run test` and `npm run build` pass.
- Dev server at `localhost:5173`.

## Session 15 — 2026-09-05

### Changed

- Landing overlay no longer auto-opens on first visit; component and dismiss/place/golden-path handlers remain for optional future entry points.

## Session 14 — 2026-09-05

### Fixed

- **Chat place resolution:** Ask now resolves place names in the citizen question (longest overlapping span wins) before building the grounded slice. Questions like “Kanak Pradesh and Uttar Raital” cite the block, not the parent district Raital.
- **Ask corridor slice:** Multi-place questions send a tight corridor path + `mentionedNodeIds` to the model; transfers along that corridor are included. Inspector narration still follows the selected node only.
- **Citations:** Chat shows place `shortName` labels (e.g. `Kanak Pradesh → Uttar Raital`) instead of raw node ids.

### Built

- `src/domain/resolve-question-nodes.ts` — longest-span matcher and corridor builder for ask grounding.

### Verified

- `npm run build` passes.

## Session 13 — 2026-09-05

### Built

- Cursor-style resizable panes for every explorer region (metrics, workspace, inspector, chat) via `react-resizable-panels`.
- Shared pane kit in `src/components/panes/` with collapse-to-rail restore icons — no outside toggle buttons.
- Desktop: metrics over horizontal workbench (map/ledger | inspector/chat stack); mobile: same primitives in a vertical stack with separate `localStorage` layout ids.
- Icon-first chrome: header view/about/ask, inspector actions, and chat send use inline SVG icons.
- **Inspector plain-language summary:** fixed `/api/narrate` response field (`text` → `narration`); template seeds immediately on node change; empty API body falls back to template; loading hint no longer replaces the paragraph.

### Fixed (pane UX)

- Inspector collapse shrinks the **detail column** to a ~44px rail (not height inside a fixed 340px block).
- Removed full-width pane chrome rows; collapse toggles are small floating edge buttons.
- Restored text labels in header (Map/Ledger, About, Ask) and inspector actions (icon + label).
- Layout storage ids bumped to `*-v2` so broken saved layouts reset.
- **Stable toggle corners:** collapse and restore controls stay in the same corner (metrics right, inspector top-right, workspace top-left); map flags moved to node meta column to stop overlapping titles.

### Verified

- `npm run build` passes.
- Dev server serves updated pane layout at `localhost:5173`.
- Inspector plain-language summary shows node-specific text on Piprahi and updates on node switch.

## Session 12 — 2026-09-04

### Built (Stage 2: 250 → 10)

- Citizen landing overlay with fictional gazetteer search and Piprahi golden-path CTA.
- Reconciliation flag layer on flow-map nodes (`watch` / `needs-explanation`) and inspector status chips.
- Grounded `ExplainService` + Cloudflare Pages Functions (`/api/ask`, `/api/narrate`) via OpenRouter (gpt-4o-mini primary, free fallback).
- Inspector AI narration; docked chat with EN/हि locale, path highlighting, and suggested questions.
- Draft information request + shareable standing card.
- About page (`#about`) with PFMS/MGNREGA adoption story and mocked-vs-real disclosure.
- Submission assets in [docs/STAGE-2-SUBMISSION.md](STAGE-2-SUBMISSION.md).

### Verified

- `npm run build` passes.
- Dev server serves updated explorer at `localhost:5173`.

## Session 11 — 2026-08-22

### Built

- Mobile inspector is a closed-by-default bottom sheet (75vh) opened only from a fixed **View details** CTA that tracks the selected node.
- Sheet dismisses via close ×, backdrop tap, or Escape; scheme switch resets it closed.
- Mobile layout uses a flex shell so the flow map fills the remaining viewport (no always-open 49vh sheet covering the tree).
- Flow canvas recenters the selected node when the stage first gains usable size after layout changes.
- Mobile chrome compacted for tree space: denser header (scheme + Map/Ledger + theme), period/kind chips hidden, metrics collapsed to a one-line Centre/Onward/Left summary (expand for full), hierarchy band as a select instead of a wrapping button row.

### Verified

- `npm run build` passes.
- Live at [ourmoney.fyi](https://ourmoney.fyi). Build paused for interview prep; Stage 1 judged competition-ready as a synthetic-data prototype.

## Session 10 — 2026-08-22

### Built

- Renamed product to **ourmoney**; header title, page meta, package name, and theme storage key updated.
- Added a simple SVG favicon (gold / teal / amber flow bands) under `public/favicon.svg`.

### Verified

- Favicon linked from `index.html`; ready for Cloudflare Pages deploy to `ourmoney.fyi`.

## Session 9 — 2026-08-22

### Built

- Added **used here** (office admin/support/last-mile use) to the citizen equation: Received = sent onward + used here + what’s left.
- Fixtures carry scheme-calibrated synthetic slices (~6% admin, ~4% support, thin DBT admin) with labels on tree chips and ledger.
- Tree: three-segment bar (gold / teal / amber) + teal amount chip; no new card paragraphs or layout-node kind.
- Ledger: Sent onward · Used here · What’s left; inspector teal bar + one scheme-aware remark.
- Updated calibration, decisions, and status docs.
- Flow map: node tap only updates the sidebar; auto-mode branch focus stays put (search still moves the branch). National focus no longer culls the visible band.
- Double-tap a node to show/hide its immediate children; metrics blurb shortened to prototype label + that one tip.

### Verified

- `findStandingInconsistencies` clean on all four scenarios; `npm run build` passes.

## Session 8 — 2026-08-22

### Built

- Fixed the “140 sent / 5 left” confusion: Reported sent for parents is now the named-children total, so What’s left = Received − Reported sent.
- Audited and corrected all four fixtures to that rule; leaves no longer misuse `unpublishedPaise`.
- Added `findStandingInconsistencies` so mock data can be checked for the same citizen math.

### Verified

- Coherence check clean on all four scenarios; `npm run build` passes.

## Session 7 — 2026-08-22

### Built

- Explained leftovers the way a citizen already subtracts: Received − Reported sent = What’s left.
- “What’s left” is still-on-this-ledger when those numbers differ; amber “next office not named” only when that is a different story.
- Inspector always adds one plain-language sentence; scheme headline leftover is the centre row only (no child-flag double count).

### Verified

- `npm run build` completes successfully with TypeScript strict checking.

### Deferred

- Automated tests for citizen-standing copy, public deployment.

## Session 6 — 2026-08-22

### Built

- Replaced cartoon place-noun geography with a shared fictional gazetteer (Kanak Pradesh / Girikhand / Meera Coast; Raital dense branch).
- Extended the canonical tree to National → State → District → Block → last-mile; hierarchy bands and five-column layout follow.
- Rewrote all four scenarios with scheme-specific implementing bodies (`bodyKind` / `workLabel`) and SNA / ZBSA / FTO / APBS-style transfer references.
- Inspector and ledger now show place name, work label, and official body name; canvas nodes show work labels when zoomed in.
- Expanded calibration, decisions, and status docs; product still ships local fixtures only (no scraper).

### Verified

- `npm run build` completes successfully with TypeScript strict checking.

### Deferred

- Automated layout tests, public deployment, and submission assets.

### Tech debt

- Matching state share is explained in reconciliations rather than a separate national-parent transfer edge.

## Session 5 — 2026-08-22

### Built

- Stacked the scheme switcher so “Scheme explorer” sits above the scheme name; period and kind chips stay on the name row.
- Increased flow-map node pitch and column spacing; awaiting-details cards now sit after the last published child, with a per-column collision pass and parent recentering.
- Dampened wheel zoom with `deltaY`-scaled factors, `deltaMode` normalization, and `requestAnimationFrame` coalescing.
- Tokenized colors for dark + light themes, raised dark muted text contrast, and added a persisted day/night toggle in the header.

### Verified

- `npm run build` completes successfully with TypeScript strict checking.

### Deferred

- Automated layout tests, public deployment, and submission assets.

### Tech debt

- Matching state share is explained in reconciliations rather than a separate national-parent transfer edge.

## Session 4 — 2026-08-22

### Built

- Extended the canonical model with `schemeKind`, `lastMileLabel`, transfer `component`, optional centre/state share fields, and a multi-scheme source catalog API.
- Added four hand-authored synthetic fixtures with distinct topologies and gap types (works SNA, demand wage/material, central DBT, matching society).
- Wired the scheme switcher, dynamic District→last-mile hierarchy labels, inspector scheme-kind copy, and per-scheme default focus nodes.
- Documented public-document calibration in `docs/SYNTHETIC-CALIBRATION.md` without wiring live government systems.

### Verified

- `npm run build` completes successfully with TypeScript strict checking.

### Deferred

- Automated tests, public deployment, and submission assets.


### Tech debt

- Matching state share is explained in reconciliations rather than a separate national-parent transfer edge.

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

# Project Status

> Last updated: 2026-09-12 · Session 26

## Current state

Post-competition expansion: **Mock / Live** chrome toggle. Mock keeps the four synthetic scheme archetypes. Live is one reconstructed public extract — **MGNREGA · FY 2025–26** — with all states named at Centre and a deep corridor in Himachal (12 districts → blocks → Mashobra GPs). No runtime government API. Domain still at [ourmoney.fyi](https://ourmoney.fyi).

## What works

- **Ask (default):** composer, EN/हि UI + voice dictation, gazetteer typeahead, grounded answers, path artifact, RTI composer. Starters and disclaimers switch with Mock/Live.
- **Explore (`#explore`):** flow map, ledger, inspector, docked chat, evidence drawer. Live chrome line says public MIS extract.
- **Data modes:** `DataModeToggle` next to theme; per-mode session persist; `SyntheticScenarioSource` vs `PublicRecordSource`.
- **RTI composer:** authority resolution, record points, never auto-files; live drafts cite public-record extract.
- **Static pages:** `#compare`, `#features`, `#scale` (adapter + live extract note), `#about` (Mock vs Live honesty).
- **PWA:** service worker; offline banner.
- **Tests:** Vitest — standing (incl. live extract), reconciliation, intent (mock + live), ranking, templateAsk, session persist (per mode), routing, RTI domain.

## In progress

- None for Mock/Live extract. Optional: refresh extract figures when MIS hosts are up; LinkedIn / outreach are human tasks.

## Blockers

- Official MGNREGA MIS hosts returned HTTP 503 during extract authoring — figures are reconstructed from the public Financial Statement schema; see [docs/LIVE-CALIBRATION.md](LIVE-CALIBRATION.md).

## Next concrete step

Verify Mock ↔ Live toggle in the browser (desktop + narrow), then draft the LinkedIn post around the Mashobra corridor.

## Architecture snapshot

```text
src/
├── app/                 # routing, session (dataMode + openRti)
├── features/
│   ├── ask/             # Ask landing + conversation
│   ├── explore/         # Flow-map workbench
│   └── pages/           # compare, features, scale
├── components/          # chrome, data-mode toggle, RTI, evidence, …
├── domain/              # rti, intent, reconciliation, standing, evidence
├── data/
│   ├── fixtures/        # synthetic scenarios
│   ├── live/            # public-record extracts
│   └── sources/         # IFundFlowSource adapters
├── services/            # ledger, explain
└── utils/               # money, theme, data-mode, viewport
```

## Data and safety boundary

- Mock: all synthetic.
- Live: reconstructed public MIS extract only; no PFMS scrape; no misconduct language.
- RTI drafts never auto-file.
- AI grounded only on displayed scenario slice.

# Project Status

> Last updated: 2026-09-07 · Session 20

## Current state

**Stage 2 final push** for Build What Moves India. Ask-first dual view plus Compare / Features / Scale / About pages, RTI composer, Hindi UI + voice input, and PWA offline shell. Production API key is live on Cloudflare. Remaining human task: **2-minute submission video** and resubmit by **7 September 2026**.

## What works

- **Ask (default):** composer, EN/हि UI + voice, gazetteer typeahead, grounded answers, path artifact, **Request the records** → RTI composer, Ask-empty `SiteFooter`, plus chrome Info menu for site pages during conversation.
- **Explore (`#explore`):** flow map, ledger, inspector, docked chat with RTI affordance, evidence drawer, share standing; same chrome Info menu for site pages.
- **RTI composer:** authority resolution, record points, applicant details (browser-local), review with rtionline field mapping, 3000-char annexure split, copy / download / print / WhatsApp, 30-day tracking checklist.
- **Static pages:** `#compare` (MIS before/after), `#features`, `#scale` (adapter field map), `#about` (honesty table).
- **PWA:** service worker via `vite-plugin-pwa`; offline banner.
- **Tests:** Vitest — standing, reconciliation, intent, ranking, templateAsk, session persist, routing, RTI domain.

## In progress

- Record 2-minute submission video; resubmit with same email as Stage 1.

## Blockers

- None for the live demo (API key set). Video is the only submission blocker.

## Next concrete step

Record video using [docs/STAGE-2-SUBMISSION.md](STAGE-2-SUBMISSION.md), then resubmit.

## Architecture snapshot

```text
src/
├── app/                 # routing, session (incl. openRti)
├── features/
│   ├── ask/             # Ask landing + conversation
│   ├── explore/         # Flow-map workbench
│   └── pages/           # compare, features, scale
├── components/          # chrome (+ Info site menu), footer, RTI composer, voice, static-page, …
├── domain/              # rti-request, intent, reconciliation, standing, …
├── i18n/                # strings + useT
├── data/                # fixtures, place-index
├── services/            # ledger, explain
functions/
├── api/ask.ts
├── api/narrate.ts
└── _shared/openrouter.ts
```

## Data and safety boundary

- All data synthetic; no live government integrations.
- RTI drafts never auto-file; disclaimer in every step.
- AI grounded only on displayed scenario slice; no misconduct language.

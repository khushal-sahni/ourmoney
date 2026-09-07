# Project Status

> Last updated: 2026-09-07 · Session 23

## Current state

**Stage 2 final push** for Build What Moves India. Ask-first dual view plus Compare / Features / Scale / About pages, RTI composer, Hindi UI + voice input (confirm-to-draft dictation), and PWA offline shell. Mobile Ask uses visual-viewport height + scrollable empty state; mobile Explore uses a bottom details CTA + sheet. Production API key is live on Cloudflare. Remaining human task: **2-minute submission video** and resubmit by **7 September 2026**.

## What works

- **Ask (default):** composer, EN/हि UI + voice dictation (waveform + check/cross → edit in draft), gazetteer typeahead, grounded answers, path artifact, **Request the records** → RTI composer, Ask-empty `SiteFooter`, plus chrome Info menu for site pages during conversation. Mobile empty state scrolls; chrome respects safe-area / visual viewport.
- **Explore (`#explore`):** flow map, ledger, inspector, docked chat with RTI affordance and the same voice dictation, evidence drawer, share standing; same chrome Info menu for site pages. On mobile: map-first with bottom “View details” CTA → dismissible inspector sheet; chat also as a sheet.
- **RTI composer:** authority resolution, record points, applicant details (browser-local), review with rtionline field mapping, 3000-char annexure split, copy / download / print (hidden-iframe Print / PDF) / WhatsApp, 30-day tracking checklist.
- **Static pages:** `#compare` (MIS before/after), `#features`, `#scale` (adapter field map), `#about` (honesty table).
- **PWA:** service worker via `vite-plugin-pwa`; offline banner.
- **Tests:** Vitest — standing, reconciliation, intent, ranking, templateAsk, session persist, routing, RTI domain.

## In progress

- Record 2-minute submission video; resubmit with same email as Stage 1.

## Blockers

- None for the live demo (API key set). Video is the only submission blocker. True iPhone Chrome confirmation of the mobile viewport fix remains a human pass after deploy.

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
├── components/          # chrome, bottom-sheet, footer, RTI, voice, …
├── domain/              # rti-request, intent, reconciliation, standing, …
├── i18n/                # strings + useT
├── data/                # fixtures, place-index
├── services/            # ledger, explain
├── utils/               # money, theme, viewport height
functions/
├── api/ask.ts
├── api/narrate.ts
└── _shared/openrouter.ts
```

## Data and safety boundary

- All data synthetic; no live government integrations.
- RTI drafts never auto-file; disclaimer in every step.
- AI grounded only on displayed scenario slice; no misconduct language.

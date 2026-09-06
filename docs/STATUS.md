# Project Status

> Last updated: 2026-09-06 · Session 17

## Current state

**Dual-view build** for Build What Moves India. **Ask** is the default landing (ChatGPT-style composer + starters); **Explore** is the full flow-map workbench at `#explore`. Stage 1/2 credibility items closed except the submission video — Vitest scenario tests, reconciliation engine, evidence drawer, and resilient loading/error states are in.

## What works

- **Ask (default):** cinematic empty state, gazetteer typeahead, EN/हि starters, cross-scheme intent resolution (e.g. roads → Rural Works + Uttar Raital), path artifact + Open in Explore, follow-up chips, template-then-model answers.
- **Explore (`#explore`):** resizable panes, map/ledger, inspector narration, docked chat, scheme switcher, deep links `#explore?scheme=&node=`.
- **Shared session:** scheme, selection, chat history, and highlights persist across Ask ↔ Explore.
- **Evidence drawer:** synthetic provenance trail per node (equation, transfers, reconciliation lines).
- **Tests:** Vitest — standing math, fixture coherence, intent resolver, reconciliation engine.
- Everything from prior sessions (flags, information-request draft, About, Cloudflare `/api/ask` + `/api/narrate`).

## In progress

- Deploy to production with `OPENROUTER_API_KEY` set in Cloudflare Pages env.
- Record 2-minute submission video; submit by **7 September 2026**.

## Blockers

- OpenRouter API key must be configured on Cloudflare Pages for live AI (template fallback works without it).

## Next concrete step

Deploy, set `OPENROUTER_API_KEY`, record video using [docs/STAGE-2-SUBMISSION.md](STAGE-2-SUBMISSION.md), resubmit with same email as Stage 1.

## Architecture snapshot

```text
src/
├── app/                 # routing, session context
├── features/
│   ├── ask/             # Ask landing + conversation
│   └── explore/         # Flow-map workbench
├── components/          # AppChrome, EvidenceDrawer, PathArtifact, panes, …
├── domain/              # intent resolver, reconciliation-engine, evidence, …
├── data/                # fixtures, place-index
├── services/            # ledger.service, explain.service
functions/
├── api/ask.ts
├── api/narrate.ts
└── _shared/openrouter.ts
```

## Data and safety boundary

- All data synthetic; no live government integrations.
- Unknown real places (e.g. Orai) get an honest miss + demo analogue — never invented rupees.
- AI grounded only on displayed scenario slice; no misconduct language.

## Open questions

- None blocking submission except video.

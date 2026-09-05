# Project Status

> Last updated: 2026-09-05 · Session 14

## Current state

**Stage 2 resubmission build** for Build What Moves India (250 → 10). Live at [ourmoney.fyi](https://ourmoney.fyi) after deploy. Adds citizen landing, reconciliation flags, grounded AI narration + chat, information-request draft, share card, About page, and resizable pane layout — all on synthetic data.

## What works

- Everything from Stage 1 (four scheme archetypes, flow map, ledger, themes).
- **Resizable panes:** metrics, workspace (map/ledger), inspector, and chat are independently resizable and collapsible on desktop and mobile; layouts persist per breakpoint in `localStorage`.
- **Landing overlay:** fictional gazetteer search + “Open Piprahi village” golden-path CTA.
- **Flag layer:** `watch` / `needs-explanation` badges on flow-map nodes and inspector status chips.
- **AI layer:** grounded narration in inspector + chat pane (EN/हि); chat resolves place names in the question (longest-span) before grounding; cites nodes and highlights path; template seeds instantly on node change; template fallback when API unavailable.
- **Act:** draft information request (copy / share / WhatsApp) + shareable standing card.
- **About page** (`#about`): honesty disclosure, PFMS/MGNREGA adoption story, mocked vs real.
- **Cloudflare Pages Functions:** `/api/ask` and `/api/narrate` via OpenRouter (OpenAI primary, free backup).

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
├── components/
│   ├── panes/           # ShellLayout, WorkbenchLayout, DetailSplit, usePaneCollapse
│   ├── explorer-shell.tsx
│   ├── FlowCanvas, LandingOverlay, ChatPanel, AboutPage, …
├── constants/           # golden-path
├── data/                # fixtures, place-index
├── domain/              # fund-flow, explain-types, reconciliation-display, resolve-question-nodes
├── services/            # ledger.service, explain.service
functions/
├── api/ask.ts           # OpenRouter proxy
├── api/narrate.ts
└── _shared/openrouter.ts
```

## Data and safety boundary

- All data synthetic; no live government integrations.
- AI grounded only on displayed scenario slice; no misconduct language.
- Information-request drafts do not file automatically.

## Open questions

- None blocking submission.

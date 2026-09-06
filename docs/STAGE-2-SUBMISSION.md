# Stage 2 submission assets

## Live link

https://ourmoney.fyi

## 250-word summary (draft)

**ourmoney** helps a citizen answer one question in under a minute: *where did the reported rupee for my place go?*

Today, PFMS and scheme MIS portals publish fund-flow data for agencies, not for everyday users. A villager who hears that money was sanctioned cannot tell whether it is still at the state nodal account, used here as admin, sent onward, or waiting on a late utilisation report — and the public MIS is hard to navigate (no data dictionary, inconsistent field names, historic daytime-only access).

**ourmoney** is an independent hackathon prototype with **synthetic data only**. **Ask** is the default: type or speak a plain-language question (English or Hindi), get a grounded answer with a fund-flow path you can open in **Explore**. When a gap needs explanation, a four-step **RTI composer** builds a record-based information request aimed at the right PIO, with a filing guide for rtionline.gov.in — nothing is filed automatically. Compare / Features / How it scales pages show the before-after and the adapter path to real extracts.

Built with Codex. Adapter architecture over a canonical fund-flow model. Production would be a **citizen layer on PFMS + one licensed scheme MIS** — not a scraper or government replacement.

## 2-minute video script

**Minute 1 (citizen, phone):**
1. Broken-road frustration → Ask landing → speak Hindi question (or starter: roads at Uttar Raital)
2. Answer + gap → path artifact → Open in Explore
3. Tree / standing equation → Request the records
4. RTI composer: points → review → filing guide (say: does not file automatically)
5. Say aloud: independent prototype, synthetic data

**Minute 2 (builder):**
1. `#compare` — 14 clicks / 6 acronyms vs one question; FTO field confusion
2. Standing equation + non-accusatory vocabulary
3. `#scale` adapter contract — expose fields, don’t rebuild PFMS
4. Codex + OpenAI grounded Q&A; Hindi/voice; PWA offline Explore
5. Honesty table on About

## Cloudflare setup

Set `OPENROUTER_API_KEY` in Cloudflare Pages → Settings → Environment variables (Production).
Functions live in `/functions/api/ask` and `/functions/api/narrate`.

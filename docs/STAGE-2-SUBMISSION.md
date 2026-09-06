# Stage 2 submission assets

## Live link

https://ourmoney.fyi

## 250-word summary (draft)

**ourmoney** helps a citizen answer one question in under a minute: *where did the reported rupee for my place go?*

Today, PFMS and scheme MIS portals track fund flow for agencies, not for everyday users. A villager who hears that money was sanctioned cannot tell whether it is still at the state nodal account, used here as admin, sent onward, or waiting on a late utilisation report.

**ourmoney** is an independent hackathon prototype with **synthetic data only**. **Ask** is the default: type a plain-language question (English or Hindi), get a grounded answer with a fund-flow path you can open in **Explore** — the full interactive map, ledger, and inspector. Reconciliation language never alleges misconduct. Flagged nodes surface late reports and unreconciled amounts. A provenance drawer labels every figure as synthetic. One-click draft information request turns observation into copy-ready action.

Built with Codex. Adapter architecture over a canonical fund-flow model. Production would be a **citizen layer on PFMS + one licensed scheme MIS** (MGNREGA first) — not a scraper or government replacement.

## 2-minute video script

**Minute 1 (citizen, phone):**
1. Ask landing → starter or “roads at Uttar Raital”
2. Answer + path artifact → Open in Explore
3. Tree highlights → inspector narration
4. View evidence drawer → Draft information request → Copy
5. Say aloud: independent prototype, synthetic data

**Minute 2 (builder):**
1. Ask | Explore dual view; cross-scheme intent resolver
2. Codex + OpenAI grounded Q&A; Vitest scenario tests
3. Adapter architecture → PFMS + MGNREGA MIS in production
4. About page → what is mocked vs real

## Cloudflare setup

Set `OPENROUTER_API_KEY` in Cloudflare Pages → Settings → Environment variables (Production).
Functions live in `/functions/api/ask` and `/functions/api/narrate`.

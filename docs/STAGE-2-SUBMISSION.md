# Stage 2 submission assets

## Live link

https://ourmoney.fyi

## 250-word summary (draft)

**ourmoney** helps a citizen answer one question in under a minute: *where did the reported rupee for my place go?*

Today, PFMS and scheme MIS portals track fund flow for agencies, not for everyday users. OpenBudgetsIndia publishes budget documents, not a continuous last-mile ledger. eGramSwaraj and NREGA reports exist, but behind jargon and scheme-specific navigation. A villager who hears that money was sanctioned cannot tell whether it is still at the state nodal account, used here as admin, sent onward, or waiting on a late utilisation report.

**ourmoney** is an independent hackathon prototype with **synthetic data only**. It shows one continuous drill-down from centre release to a Paani Samiti or gram panchayat on a live flow map, with reconciliation language that never alleges misconduct. An OpenAI-powered layer (via OpenRouter) narrates each node and answers questions in English or Hindi, citing only the displayed ledger and highlighting the path on the map. Flagged nodes surface late reports and unreconciled amounts in plain language. A one-click draft information request turns observation into action — copy-ready text, not an automatic filing.

Built with Codex. Architecture uses replaceable source adapters over a canonical fund-flow model. Production would be a **citizen layer on PFMS + one licensed scheme MIS** (MGNREGA first), with moderated official updates — not a scraper or government replacement.

## 2-minute video script

**Minute 1 (citizen, phone):**
1. Landing → “Open Piprahi village”
2. Tree path lights up → inspector narration
3. Tap “Ask about this” → “Why is the utilisation report late?”
4. Cited answer highlights path → “Draft information request” → Copy
5. Say aloud: independent prototype, synthetic data

**Minute 2 (builder):**
1. Codex built the explorer; OpenAI model powers grounded Q&A
2. Adapter architecture → PFMS + MGNREGA MIS in production
3. Why we refuse corruption language
4. About page → what is mocked vs real

## Cloudflare setup

Set `OPENROUTER_API_KEY` in Cloudflare Pages → Settings → Environment variables (Production).
Functions live in `/functions/api/ask` and `/functions/api/narrate`.

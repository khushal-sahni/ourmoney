# Synthetic calibration note

> Independent hackathon prototype. Fixtures are fictional. Public documents informed **topology and distribution recipes only** — no live portal rows, beneficiary lists, officer names, or real district rupee figures were copied into the app.

## Sources consulted (one-time citizen research)

| Source | What we used | What we refused |
| --- | --- | --- |
| [Union Budget Expenditure Profile](https://www.indiabudget.gov.in/) and [SNA / SPARSH statement (`stat4aa`)](https://www.indiabudget.gov.in/doc/eb/stat4aa.pdf) | CSS vs Central Sector distinction; SNA float vs just-in-time SPARSH; order-of-magnitude scheme envelopes | Exact BE/RE rows, state-wise SNA balances, real scheme names in product copy |
| PFMS / SNA / SPARSH public notes (CGA, DoE) | Topology: Centre → State treasury / SNA → Zero Balance Subsidiary Accounts; SPARSH is claim-based | PFMS APIs, dashboards behind login, transaction lists |
| [DBT Bharat](https://dbtbharat.gov.in/) | Cash-to-account last mile vs works agency | Scheme registries, beneficiary counts |
| CBGA “Fund Flow Routes in Social Sectors” | Four routes: treasury, society, DBT, dual-stream wage/material | District case-study figures |
| PRS / budget analysis notes | Relative utilisation stories (works underspend, DBT near-full, matching-share delays) | Any claim that our demo numbers are real |
| Scheme MIS portal structure (NREGA, AwaasSoft, JJM IMIS) | Installment waves, rejected-credit concepts, wage vs material split | Scraped MIS tables |

## Recipes used in fixtures

Shared fictional geography: Sundar Pradesh, Aravali, Malwa, plus shared district names (Nadi, Pahar, Maidan, Teer, Khet, Ghat, Ridge).

### 1. Community Water Access Mission (`works-sna`)

- **Shape:** CSS works with SNA-style float.
- **National:** ₹140 cr (toy scale).
- **Distribution:** Relatively even district splits.
- **Gaps:** Unpublished onward split at state (~5–10%); late agency utilisation; unmatched transfer.
- **Last mile:** Works agency.

### 2. Rural Works Guarantee (`demand-wage`)

- **Shape:** Demand-driven dual stream (wage + material ≈ 62:38).
- **National:** ₹420 cr (larger, lumpy).
- **Distribution:** Steep power law — drought district Nadi ≈ 40% of Sundar; Malwa districts small.
- **Gaps:** Late wage-credit file + pending material bill at Bakul panchayat.
- **Last mile:** Panchayat.

### 3. Landholder Income Support (`central-dbt`)

- **Shape:** Central Sector direct credit; thin state DBT cells.
- **National:** ₹95 cr.
- **Distribution:** Enrollment-weighted districts; three installment waves.
- **Gaps:** ~2% returned credits / awaiting re-issue; almost no parked float.
- **Last mile:** District credit batch.

### 4. Neighbourhood Health Mission (`matching-society`)

- **Shape:** CSS 60:40 matching; society route.
- **National centre share:** ₹108 cr; scenario also records synthetic state-share total ₹72 cr.
- **Distribution:** Even-ish districts (per facility); Sundar/Aravali fully merged; Malwa holds centre share only.
- **Gaps:** State share not yet released (~₹12 cr) at Malwa; awaiting society report.
- **Last mile:** Facility.

## Product rules that still apply

- Every surface labels data as **synthetic**.
- Gaps use `unreconciled` / `late report` / `returned credit` / `state share not yet released` — never corruption language.
- No government branding that implies endorsement.
- Future live adapters remain a deliberate Stage 3 decision after licensing review — not an unapproved scraper.

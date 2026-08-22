# Synthetic calibration note

> Independent hackathon prototype. Fixtures are fictional. Public documents informed **topology, institutional vocabulary, and distribution recipes only** — no live portal rows, beneficiary lists, officer names, or real district rupee figures were copied into the app. The product does not scrape or connect to government systems.

## Sources consulted (one-time authoring research)

| Source | What we used | What we refused |
| --- | --- | --- |
| [Union Budget Expenditure Profile](https://www.indiabudget.gov.in/) and [SNA / SPARSH statement (`stat4aa`)](https://www.indiabudget.gov.in/doc/eb/stat4aa.pdf) | CSS vs Central Sector; SNA float vs just-in-time SPARSH; ZBSA drawing-limit language | Exact BE/RE rows, state-wise SNA balances, real scheme names in product copy |
| DoE / PFMS public notes on SNA procedure | Centre → Single Nodal Account → Zero Balance Subsidiary Accounts | PFMS APIs, dashboards behind login, transaction lists |
| [JJM institutional bodies](https://jaljeevanmission.gov.in/institutional-bodies-content) / PIB operational guidelines | SWSM → DWSM → block resource centre → Paani Samiti / PHED bulk | IMIS tables, village FHTC counts |
| MGNREGA operational / e-FMS manuals (public PDFs) | SEGF → DPC → Block PO → Gram Panchayat; wage FTO dual-signatory; ~60:40 wage:material | NREGASoft scrapes, muster rolls, real FTOs |
| [DBT Bharat](https://dbtbharat.gov.in/) / public installment-status vocabulary | APBS credit files; returned credit / re-issue categories | Scheme registries, beneficiary counts, live installment rows |
| NHM / CBGA / CAG fund-flow notes | SHS → DHS → BPMU → PHC/CHC; 60:40 matching; genericised flexipools | District PIP figures, real society bank balances |
| Scheme MIS portal *structure* only (NREGA, AwaasSoft, JJM IMIS) | Installment waves, rejected-credit concepts, wage vs material split | Scraped MIS tables |

## Shared fictional gazetteer

Geography is shared across schemes; implementing **bodies** differ by archetype.

| Level | Places |
| --- | --- |
| States | Kanak Pradesh (plains / high demand), Girikhand (hills), Meera Coast (smaller envelope) |
| Districts | Raital, Chandanpur Kalan, Morwa East · Patharwadi, Sitabari · Dhowli, Nirmalbandh |
| Raital blocks (dense drill-down) | Raital Sadar, Kharonda, Uttar Raital |

Canvas `shortName` is the place; long `name` / `workLabel` / `bodyKind` describe the implementing body (e.g. “Raital District Water and Sanitation Mission”). Names are compound/administrative and are not real Indian districts.

Density rule: fully expand **Raital** (blocks + several last-mile units). Other districts stay shallower so the demo stays readable.

## Recipes used in fixtures

Citizen standing on every parent office:

**Received = sent to named offices + used here + what’s left**

“Used here” is allowed own spend (admin / support / last-mile use). It is **not** leftover and **not** a missing next office. Fixtures raise `receivedPaise` by the used-here amount when leftover was too small to peel, so named children stay stable.

### 1. Community Water Access Mission (`works-sna`)

- **Shape:** CSS works with SNA + ZBSA float.
- **Bodies:** SWSM (SNA) → DWSM → block resource centre → Paani Samiti (in-village) / PHED division (bulk).
- **Used here:** ~4% **Support** at SWSM / DWSM / block resource centres (JJM-style support envelope, toy scale). Last-mile label **Works**.
- **National:** centre row includes named states + support used here + ~₹5 cr unnamed onward.
- **Gaps:** Unpublished onward split at state; late Paani Samiti utilisation at Piprahi.
- **Refs:** `SNA/KANAK/CWAM/…`, `ZBSA/…`, `IA/…/IV|BULK/…`

### 2. Rural Works Guarantee (`demand-wage`)

- **Shape:** Demand-driven dual stream (wage + material ≈ 60:40) plus admin.
- **Bodies:** SEGF (SNA) → District Programme Coordinator → Block Programme Officer → Gram Panchayat.
- **Used here:** ~6% **Admin** at SEGF / DPC / Block PO (MGNREGA-style admin cap, toy scale). GP leaf label **Wages & material**.
- **National:** larger lumpy envelope; Raital remains the dense high-demand branch.
- **Gaps:** FTO pending second signatory + pending material bill at Bakul GP.
- **Refs:** `FTO-W-…`, `MAT-BILL-…`, `ADM-…`

### 3. Landholder Income Support (`central-dbt`)

- **Shape:** Central Sector direct credit; thin state DBT cells.
- **Bodies:** DBT cell → District Agriculture Office → block enrollment file → Installment 2 APBS credit file.
- **Used here:** ~0.5–1% **Admin** at state DBT cell / DAO only. National row stays pass-through + leftover. Credit-file leaf label **Credits**.
- **Gaps:** ~returned credits / awaiting re-issue (account mismatch / NPCI seeding language); almost no parked float.
- **Refs:** `APBS/I2/…`, `DAO/…/ENR-…`, `BLK/…/ENR-…`

### 4. Neighbourhood Health Mission (`matching-society`)

- **Shape:** CSS 60:40 matching; society route.
- **Bodies:** State Health Society → District Health Society → BPMU → PHC / CHC / village health committee.
- **Used here:** ~6% **Admin** programme-management at SHS / DHS / BPMU (NHM PMU-style, toy scale). Facility leaf label **Facility**. Small admin at the national centre-share row.
- **Pools (genericised):** `family-health`, `disease-control`, `infrastructure` — not real programme acronyms.
- **Gaps:** Meera Coast state share not yet released (~₹12 cr); awaiting society report.

## Product rules that still apply

- Every surface labels data as **synthetic**.
- Gaps use `unreconciled` / `late report` / `returned credit` / `state share not yet released` / `FTO pending second signatory` — never corruption language.
- No government branding that implies endorsement.
- Future live adapters remain a deliberate Stage 3 decision after licensing review — not an unapproved scraper.

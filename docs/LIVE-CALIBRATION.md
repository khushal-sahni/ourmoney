# Live calibration note — MGNREGA FY 2025–26

> Independent prototype. Live mode is a **reconstructed public-record extract**, not a runtime connection to PFMS or NREGASoft. Do not allege misconduct. Verify current totals on the official MIS.

## Scope

| Field | Value |
| --- | --- |
| Scheme | Mahatma Gandhi NREGA (legacy MIS title for FY 2025–26) |
| Geography | All states + rural UTs named at Centre; **deep corridor** only in Himachal Pradesh (12 districts → blocks → Mashobra GPs) |
| Period | FY 2025–26 |
| Retrieved | 2026-09-12 |
| Adapter | `PublicRecordSource` → `src/data/live/mgnrega-hp-2025-26/` |

## Column mapping (MIS Financial Statement → canonical model)

| MIS column (₹ lakh) | Canonical field |
| --- | --- |
| Total Availability | `receivedPaise` |
| Wage + Material expenditure | leaf `reportedPaise` / `usedHere` (wages & material) |
| Admin expenditure | parent `usedHerePaise` (Admin); shallow states fold admin into used here |
| Payment due | reconciliation item `Payment due on MIS` |
| Residual vs named children | `unpublishedPaise` (“next office not named”) |

Conversion: `paise = Math.round(lakh * 10_000_000)`.

## Tree density

- National parent names **every state and rural UT** (skip Delhi / Chandigarh). National leftover is a **tiny residual** after named states — not ~99% of the scheme.
- Shallow states are **leaves** (no districts): utilisation = used here; remainder = still on this ledger.
- Himachal alone expands: State → 12 districts → blocks; gram panchayats under **Mashobra only** (12 GPs). Other HP GP spend appears as leftover / unnamed at the parent.

## National envelope

| Layer | ₹ lakh (approx) |
| --- | --- |
| National availability | 1,20,00,000 (₹1,20,000 Cr) |
| Himachal (deep, extract row) | 1,24,580 |
| Other named states/UTs | 1,18,55,420 |
| Planned residual | 20,000 (₹200 Cr) |

Extract rows close as HP + others + ₹200 Cr = national. After the builder raises Himachal `receivedPaise` so district + admin standing holds, national `unpublishedPaise` is a slightly smaller residual (~₹154 Cr) — still under 1% of Centre, not the old ~99% unnamed card.

Other-state shares follow typical MGNREGA expenditure weights — reconstructed for the citizen prototype, not scraped from live MIS.

## Sources

Authoring notes and official URL patterns: [`src/data/live/mgnrega-hp-2025-26/sources.md`](../src/data/live/mgnrega-hp-2025-26/sources.md).

MIS hosts returned HTTP 503 during authoring. Figures follow the public Financial Statement schema and administrative geography, scaled to publicly reported order of magnitude. They are **not** a certified government publication.

## Safety copy

- Gaps: `unreconciled` / `late report` / `payment due on MIS` / `not in this extract` / `still on this ledger`.
- Never: corruption, theft, loss, misconduct.
- Product never scrapes or calls government APIs at runtime.
- MGNREGA Act repealed 1 Jul 2026 (VB–G RAM G); this extract stays on the completed FY 2025–26 title.

# Live calibration note — MGNREGA Himachal Pradesh FY 2025–26

> Independent prototype. Live mode is a **reconstructed public-record extract**, not a runtime connection to PFMS or NREGASoft. Do not allege misconduct. Verify current totals on the official MIS.

## Scope

| Field | Value |
| --- | --- |
| Scheme | Mahatma Gandhi NREGA (legacy MIS title for FY 2025–26) |
| Geography | Himachal Pradesh — all 12 districts, major blocks; GPs under Shimla · Mashobra only |
| Period | FY 2025–26 |
| Retrieved | 2026-09-12 |
| Adapter | `PublicRecordSource` → `src/data/live/mgnrega-hp-2025-26/` |

## Column mapping (MIS Financial Statement → canonical model)

| MIS column (₹ lakh) | Canonical field |
| --- | --- |
| Total Availability | `receivedPaise` |
| Wage + Material expenditure | leaf `reportedPaise` / `usedHere` (wages & material) |
| Admin expenditure | parent `usedHerePaise` (Admin) |
| Payment due | reconciliation item `Payment due on MIS` |
| Residual vs named children | `unpublishedPaise` (“next office not named”) |

Conversion: `paise = Math.round(lakh * 10_000_000)`.

## Tree density

- National parent names Himachal only; other states remain `unpublishedPaise` (“not in this extract”).
- State → 12 districts → blocks for each district.
- Gram panchayats: **Mashobra block only** (12 GPs). Remaining GP spend in that block is leftover / unnamed — same density rule as Raital in mock fixtures.

## Sources

Authoring notes and official URL patterns: [`src/data/live/mgnrega-hp-2025-26/sources.md`](../src/data/live/mgnrega-hp-2025-26/sources.md).

MIS hosts returned HTTP 503 during authoring. Figures follow the public Financial Statement schema and HP administrative geography, scaled to the publicly reported order of magnitude for the state. They are **not** a certified government publication.

## Safety copy

- Gaps: `unreconciled` / `late report` / `payment due on MIS` / `not in this extract`.
- Never: corruption, theft, loss, misconduct.
- Product never scrapes or calls government APIs at runtime.
- MGNREGA Act repealed 1 Jul 2026 (VB–G RAM G); this extract stays on the completed FY 2025–26 title.

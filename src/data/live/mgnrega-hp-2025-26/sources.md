# MGNREGA Himachal Pradesh · FY 2025–26 sources

Independent prototype extract. Not a government product. Not an official mirror of PFMS or NREGASoft.

## Retrieval

| Field | Value |
| --- | --- |
| Retrieved | 2026-09-12 |
| Financial year | 2025–26 |
| State | Himachal Pradesh (MIS state_code `13`) |
| Schema | Citizen **Financial Statement** (`funddisreport`) — availability, wage, material, admin, payment due (₹ lakh) |

## Official report URLs (verify live figures here)

Portal hosts were returning HTTP 503 / 404 during authoring. Use these entry points when the MIS is up:

- State financial statement pattern: `https://mnregaweb4.nic.in/netnrega/citizen_html/funddisreport.aspx?lflag=eng&fin_year=2025-2026&state_code=13&state_name=HIMACHAL+PRADESH&page=s`
- District example (Shimla `1309`): open from the state page drill-down, or cached citizen_out HTML when published: `funddisreport_1309_eng_2526_.html` on the MoRD MIS host
- Public data portal (historical FY selector): https://nregarep1.nic.in/netnrega/dynamic2/dynamicreport_new4.aspx
- Legacy note: MGNREGA Act repealed 1 Jul 2026 in favour of VB–G RAM G; FY 2025–26 remains on the Mahatma Gandhi NREGA MIS title

## What we typed

- All 12 Himachal districts and their major development blocks (public administrative geography).
- Gram panchayat last-mile only under **Shimla · Mashobra** (12 GPs). Other GP spend appears as “next office not named” / leftover at the parent.
- Column mapping: see [docs/LIVE-CALIBRATION.md](../../../../docs/LIVE-CALIBRATION.md).

## Honesty

Figures in `extract.ts` follow the public Financial Statement schema and HP geography, scaled to the publicly reported order of magnitude for the state. They are a **reconstructed extract for the citizen prototype**, not a live scrape and not a certified government publication. Always re-check the official MIS before citing a rupee amount outside this demo.

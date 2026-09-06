# AGENTS.md

## Project

- **Working name:** ourmoney
- **Purpose:** An independent, citizen-facing prototype that makes the reported flow of public-scheme funds easier to understand, without asserting wrongdoing.
- **Competition:** Build What Moves India (OpenAI × Varun Mayya). Stage 1 shortlist complete; Stage 2 resubmission deadline **7 September 2026**.
- **Stage 2 scope:** Ask-first dual-view prototype with grounded AI, RTI composer, Compare/Features/Scale honesty pages, Hindi + voice, PWA — all on synthetic data for one fictional geography across four scheme archetypes.

## Non-negotiable safety and competition rules

- Do not connect to, scrape, probe, reverse-engineer, or otherwise interact with live government systems.
- Do not use real personal, financial, beneficiary, officer, or transaction data.
- Label all demo data as **synthetic** and the app as an **independent hackathon prototype**.
- Do not use government branding in a way that implies endorsement.
- Never describe a reconciliation difference as corruption, loss, theft, or misconduct. Use precise terms such as `unreconciled`, `reported balance`, `late report`, or `needs explanation`.

## Product principles

1. A citizen should understand where a reported rupee is in under one minute.
2. Every number needs a source/status explanation in the interface.
3. Overview first; detail only when the user drills down.
4. The main citizen journey must work end-to-end on a mobile device and a slow connection.
5. The prototype must be honest about what is simulated and what a production system would require.

## Data architecture

- Build against a canonical internal model: `Scheme`, `FundingNode`, `Transfer`, `Report`, `Reconciliation`, and `Evidence`.
- Treat sources as replaceable adapters. The default is `SyntheticScenarioSource`; future adapters may use licensed open data or an explicitly approved partner integration.
- Source adapters normalize input into the canonical model. UI components and reconciliation logic must not depend on a source's raw schema.
- Keep fixture data local, versioned, deterministic, and free of real entities or data copied from public portals.
- Store monetary values in integer paise; format for display at the edge.
- Reconciliation must expose its formula and categories. A gap is not an accusation.

## Architecture and code standards

- Use TypeScript strict mode; no `any`, unsafe casts, or non-null assertions without justification.
- Use small, cohesive modules with explicit public return types.
- Separate the app into presentation, application/domain, and infrastructure/data-adapter layers.
- Keep framework components focused on rendering and user interaction. Keep reconciliation and source-normalization logic framework-independent and unit tested.
- Use dependency injection or explicit composition at application boundaries; never instantiate data providers inside UI components.
- No secrets in source control, no production `console.log`, and no silent error handling.

## Suggested layout

```text
src/
├── app/                 # routes and page composition
├── components/          # accessible presentational UI
├── features/            # citizen journeys and view models
├── domain/              # canonical types and reconciliation rules
├── data/
│   ├── sources/         # plug-in source adapters
│   └── fixtures/        # synthetic scenarios only
├── services/            # application orchestration
└── utils/               # pure stateless helpers
```

## Session workflow

1. Read `docs/STATUS.md`, `docs/ROADMAP.md`, and `docs/DECISIONS.md` before changing code.
2. Confirm any material scope change with the engineer before implementation.
3. Update `docs/STATUS.md` and prepend a session entry to `docs/CHANGELOG.md` before closing.
4. Record durable architecture choices in `docs/DECISIONS.md`.

# Stage 0 Plan — Product Spine

## Objective

Leave Stage 0 with a small, testable brief from which Stage 1 can be implemented without reopening product scope.

## Proposed timebox

Two focused working sessions, approximately 3–5 hours total.

## Deliverables

1. **Citizen problem statement** — one person, one question, one outcome.
2. **Synthetic scenario packet** — fictional scheme, locations, nodes, transfers, reports, and evidence labels.
3. **Reconciliation specification** — exact displayed categories and formulas for each status.
4. **Journey map** — overview → drill-down → explanation → evidence/share.
5. **Screen inventory** — only the pages and states necessary for the two-minute demo.
6. **Technical brief** — stack, source-adapter interface, canonical model, test plan, and deployment target.
7. **Stage 1 acceptance checklist** — conditions that make the build demo-ready.

## Work sequence

### Session A — Shape the story

- Choose a fictional, non-branded scheme and a citizen persona.
- Write the one-line question the product answers.
- Create one realistic flow across four levels with a single explainable amber status.
- Decide which values are visible at each zoom level.

### Session B — Make it buildable

- Freeze the canonical model and synthetic source contract.
- Define reconciliation formulas and status thresholds.
- Choose stack and deployment target.
- Turn the journey into a small screen list and acceptance tests.

## Initial acceptance criteria

- A reviewer can answer “where did the reported money go?” for the selected scenario.
- A highlighted difference has a visible calculation and plain-language explanation.
- Every displayed record states that it is synthetic.
- The scenario is deterministic and can be loaded through a source adapter.
- The Stage 1 scope fits a working browser demo, rather than an admin system.

## Explicitly out of scope

- Real-data ingestion, scraping, login, administrative tools, citizen complaint filing, and multi-scheme coverage.

# E14 — concrete routines use implementation and verification

2026-10-16 JST. Baseline d4a6625c79ab68957eac8ad0a05930d4906a3127, including personal interview question-bank work.

New drafts only: guide/customer-service training with a concrete scene uses COACH → REVIEW instead of ANALYZE → COACH → OPERATE → REVIEW. Location-specific cleaning uses FIELD → REVIEW instead of FIELD → OPERATE → REVIEW. Generic training/cleaning and requests mentioning planning, analysis, staffing, budgets, systems, multiple sites or broad scope retain their original workflows. Selection remains a transparent keyword heuristic; it is not free-text understanding or an estimate of time/staff required.

Pre-practice observation and an explicitly supplied source stay in the coaching task. Verification checks actual demonstration or cleaning inspection, records remaining/unverified issues, assigns follow-up and reports to the existing authority. No independent coordination task for these concrete routines. Due dates, constraints, escalation, evidence requirements, dependency gating and capability-based assignment remain.

Existing saved plans are parsed as-is, never regenerated. No persistence/schema, images, interview, database, deployment workflow or dependencies changed. Initial regression caught a dropped user source in the new first coaching task; corrected the implementation, retaining the existing assertion. UI expectations for the intentionally smaller newly-generated plans were updated.

Validation: typecheck/build passed. 47 domain cases passed, including conditions/source, exact dependency, broad-work guardrails and old four-step plan restoration. Interview regression passed (53 JS and 3 Python). Focused desktop/mobile UI 24/24 passed, including two-step completion with evidence, reload, full copy, retained old records, search and scroll. Full CI passed: 47 domain, 53 interview JS, 3 Python, 98 UI cases. Build and Pages deployment succeeded in run 38904001518 for bab319db01c5f1d58a1655a334c3ec6eaec27227. Android hardware unverified.

## Public verification

Root displayed E14. Two clearly labelled dummy drafts (newcomer guidance practice and toilet cleaning) each showed two expanded commands. Guidance had two executor/verification recipients, with practice/actual demonstration instructions; one-click full clipboard copy included the verification action. Cleaning showed actual cleaning/stocking/final inspection followed by matching inspection verification, with no separate coordination task. Interview first question and model-answer display remained operational. No existing records were edited/deleted; dummy drafts remain in the test browser session. Physical Android not tested.

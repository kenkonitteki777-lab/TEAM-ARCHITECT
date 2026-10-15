# E13 — readable agreements and saved-instruction search

2026-10-15 JST. Baseline 824872f767fbd5a72f749672089ec2f5c2d346c8, including latest interview prosody/audio changes.

## Changes

- Search saved instructions immediately by issue, goal, category or command owner. Normalize NFKC/case; multiple space-separated words use AND matching. Show result count, no-match state and clear action. Search never persists or edits missions.
- Show exact identical nonempty reporting, consultation, emergency and discretion agreements once below the displayed instruction set. Per-command differences remain next to each task. Full actions and completion conditions stay expanded in drafts.
- Apply the same lossless deduplication to copied multi-command messages. Single-command copies remain self-contained. Dependencies, actual reporting names, dates, actions and MBTI adaptation remain intact.
- No schema migration, assignment/workflow changes, new API service, art or interview edits.

## Validation

Typecheck/build passed; 45 domain tests passed, including plain/adapted copy facts, exact shared-rule deduplication, custom rules and immutability. Interview JS 49 cases and Python 3 cases passed. Focused UI: initial 14/16 passed; custom-rule test used the wrong label locator for an existing textarea. Corrected the test to its textbox role; all four new desktop/mobile UI cases passed. Other 12 focused cases passed, including complete-sheet copy, reload, navigation, MBTI and creation scroll. Full CI and public verification pending. React review: derived filters/rules without effect-driven state, labelled search and status count, stable keys, no new dependencies or storage writes.

Scope intentionally does not change automatic workflow selection or claim arbitrary text understanding. Smaller task plans and deeper context-specific instructions remain future work. Android hardware unverified.

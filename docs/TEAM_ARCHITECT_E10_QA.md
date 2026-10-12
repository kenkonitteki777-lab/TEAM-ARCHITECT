# E10 — task-specific instructions and complete delivery messages

2026-10-12 JST. Initial baseline d3f4d6892208b18e81842783a11635c36dddfbac. Rebased onto concurrent interview updates through 454e811c46fbefe78ccc997f23a8fe68d76ed906. Current main included independently updated interview reading features; those files are untouched.

## Findings and changes

Broad staff keywords previously overrode queue/service requests, all topics used near-identical actions/outputs, and recipient messages omitted all actions after the first. Depending on MBTI or the adaptation toggle, completion criteria, consultation and discretion were also missing from messages.

`workPlan.ts` supplies eight transparent editorial profiles: training (with guide practice), service/queues, cleaning, handover, new machines, promotion, sales and team coordination; unsupported inputs get a general confirmation plan. Profile candidates use issue and explicit goal. Training uses observation → coaching → progress → review; cleaning starts with actual field checks (three functions); handover uses three functions without sales/promotion. Other profiles retain relevant existing functions. Actions, deliverables and completion criteria describe the chosen task. User constraints remain literal in every command's discretion and in implementation/proposal steps. Unknown dates, KPI values and staffing capacity remain unconfirmed. No AI provider, billing, backend or external transmission was added.

Additive `general` kind prevents unsupported tasks from appearing as sales and from automatically matching sales learning. Schema version 2, stable IDs and storage keys remain; parser accepts all previous kinds and the additional kind. Existing saved commands are not regenerated. Older deployed versions may reject newly exported general-kind backups; use the current version for restoration. Public UI shows the candidate procedure before instructions. Message generation includes all actions, completion criteria, report timing, consultation, discretion and urgent reporting regardless of recipient type/toggle; MBTI context, sixteen distinct conversational questions and dialogue invitation remain optional.

## Verification

Typecheck/build passed. 43 domain and initially 28 interview cases passed, including new training/queue separation, three-step cleaning/handover, unsupported general plans, constraints, source/goal preservation and backup roundtrip. Message tests require all operational facts for every registered recipient with adaptation both on and off.

Initial full browser run: 56 passed, 2 failed due to the old fixed deliverable assertion (`比較表と主要論点（1ページ）`). Updated assertion checks the new night-specific deliverable. General-kind display and storage were subsequently added to the new scenario test. Four focused final desktop/mobile cases verify scenario selection, full message, unchanged older records, general kind, activation/task editing/reload. Concurrent main updates were preserved by replaying only these eleven files; all 31 updated interview regressions passed. Final CI/public results will be recorded after deployment.

No changes to interview files, original artworks, registered abilities, authority enforcement, existing records or databases. This remains rule-based candidate generation, not arbitrary AI understanding or a measured workplace effectiveness claim.


Final result: published commit 19a1177493444149e404da67b391ef15625f6f88, GitHub Pages run 38204460675. Full final CI passed 43 domain + 31 interview + 58 desktop/mobile browser cases (132 total), build and deploy succeeded. Public reload displayed E10. In the dedicated verification browser (initially no records), created one clearly labelled draft `動作確認：トイレの清掃漏れをなくす`; it produced FIELD/OPERATE/REVIEW, three-person outline and cleaning-specific action/deliverable. Recipient preview contained all three actions, completion criteria and consultation. Reload and list reopening preserved the draft. Test draft was retained; no pre-existing record was edited/deleted, no mission activated and no message transmitted. Original green portrait remained. Public interview retained the concurrent 実戦5問/reading UI and model-answer reveal worked. No application-origin errors observed in either page. Android physical hardware and human first-time/workplace effectiveness remain unverified.

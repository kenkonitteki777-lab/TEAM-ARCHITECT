# E1 — practical daily use and review-to-next-mission

2026-10-10. User requirement: the application must have a practical reason to exist.

## Concrete changes

- **Daily work across missions**: owner filter, immediate decisions first, checkpoint reminders, ready work separated from dependency waits and held work. Open the correct mission/directive directly. Personal briefing text can be selected and copied; it is not transmitted by the app.
- **Cross-mission concentration**: new initial assignments take unfinished commands in other active missions into account. Drafts and finished commands are excluded. Reasons and alternatives show the recorded backlog count, while explicitly leaving effort and availability unconfirmed. Existing missions are not reallocated automatically.
- **Business scope**: sales analysis no longer always prescribes night utilization. Morning and profit-related issue text is reflected in the initial analysis action.
- **Evidence-based review**: outcome, evidence, cause/unknowns, next concrete action, target work function, applicability condition and recorder. Corrections append history; no capability or MBTI assessment is changed. Unfinished tasks and outstanding decisions remain visible. Choosing “stop” is a recorded proposal/decision, not a silent task stop.
- **Explicit reuse**: select a prior review in the same issue category and confirm its applicability. A new draft gets one extra action in the selected work function; owner, authority, dates, dependency graph and original steps are preserved. Source review evidence and exact before/after actions remain attached to the new mission. New inputs invalidate the applicability confirmation.
- **Loading maintenance**: stable entry paths are retained. JS/CSS receive a content version query so freshly fetched HTML requests the current assets without deleting browser storage.

## Data and protected assets

- schemaVersion 2 and existing storage keys unchanged. `reviews` and `learning` are optional fields. Older mission snapshots still parse without mutation.
- Review and reuse data are validated before save/import; malformed data does not overwrite the current saved store. JSON backup/merge includes the new records and before/after snapshot.
- Integrated main `3b3fc1bf72006df85bf46152b5ea3b6bdc971bd6`, including the latest approved interview portrait. No changes to interview, Supabase, or character artwork relative to that main.
- Keep the original R2 loading recovery and independent diagnosis route.

## Verification

Local typecheck/build passed. Domain tests 34, interview tests 25, and full desktop/mobile E2E 28 are the publication checks. They cover personal daily work, the correct directive dialog, evidence-based review, applicability rejection, reuse diff, unchanged source mission, reload/JSON restoration, existing cockpit/KPI/handoff, startup failure recovery, all sixteen portraits and interview model-answer/next-question regression. Mobile layout assertions cover 360/390/430 px and 1440 px desktop.

React review: components are declared at module scope; hooks unconditional; form fields have labels; derived lists are computed without effect-driven state copies; existing modal focus/escape behavior reused. No new framework or runtime dependency; compressed JS remains about 106 kB.

User Android device and actual time savings remain unmeasured; do not claim proven business outcomes.

## Practical limits and next priorities

This is the first operational review/reuse loop, not completion of all stage E/F requirements. Work counts are not working hours or staffing capacity. No model has been trained; initial analysis/commands remain rules. The application stores on this browser and does not authenticate the selected recorder or share team state across devices.

Next improvements: actual availability and task effort, capability evidence/date/assessor, parallelizable work dependencies instead of overly serial default processes, category-specific command editing quality, and user-tested reductions in daily briefing/planning time. Preserve the same operating/data boundaries while making these changes.

## Public confirmation — 2026-10-10

- Implementation commit: `ee115599b12ad1eab79cb732b402a443f6ea1e88`.
- [Pages workflow 38052018170](https://github.com/kenkonitteki777-lab/TEAM-ARCHITECT/actions/runs/38052018170): build and deploy both succeeded, including the startup/application workflow gate.
- Verified public E1 at https://kenkonitteki777-lab.github.io/TEAM-ARCHITECT/?view=work&v=e1.1 using the cloud browser. Loaded entry script `./assets/team-architect.js?v=955611802454`.
- Created a labelled public-operation test mission in the isolated browser, set deadline/checkpoint, started execution: daily board showed 1 ready command and 6 dependency waits. Owner filter and personal briefing produced the expected person's work. Opening the first work item opened its correct directive dialog. Reload retained the saved active mission.
- Saved an evidence-based review, selected it from a same-category new mission, explicitly confirmed its condition and verified the source/evidence/condition attached to the new draft.
- Public interview app: current approved portrait was present; model answer opened and next-question navigation succeeded.
- A separate scratch Chromium attempt could not reach Pages (`ERR_EMPTY_RESPONSE`), so it was not counted as a public test pass. The public checks above used the working cloud browser. Its datetime fill required native keyboard adjustment to commit the input; local/CI Playwright date-input tests passed.
- User Android startup and actual business/time-saving outcomes remain unmeasured.

## E2 — short instructions and readable sixteen-type traits

2026-10-10. User requested a simple mission view showing only who needs which message, and understandable strengths, weaknesses, comfortable and difficult work for all sixteen types.

- Mission selection/creation now opens **individual instructions** first. Person cards group multiple tasks under one recipient. Show next action, deliverable, deadline/report recipient and waiting/completion state; full remaining actions and authority conditions expand on demand. A recipient filter and selectable, short handoff message reduce searching. Completed/waiting work is labelled in the message.
- Existing progress/KPI/decisions/review/learning/hierarchy remain available under **進捗・詳細**. All saved command actions and data are retained; no migration or deletion.
- Each of the sixteen portrait cards and both personality detail views now use four explicit headings: 強み / 弱み / 得意 / 不得意. Text is an editorial collaboration example, not an individual ability rating or job-selection rule. Existing artwork and assessments are unchanged.
- Reviewed the official preferences/types guidance: https://www.myersbriggs.org/my-mbti-personality-type/all-types-are-valuable/ and https://www.myersbriggs.org/my-mbti-personality-type/the-16-mbti-personality-types/home.htm . Concrete workplace examples and possible difficulties are editorial interpretations, not official measured scores.
- Synced main 5b35404 (latest interview director v2/name/crop update) before editing. No interview/Supabase/artwork edits.
- React review: extracted components at module scope, labelled filter/text fields, native details, local derived grouping; no new dependency or data schema.
- E2 validation: typecheck/build passed; domain 34 + interview 25 + desktop/mobile E2E 30 = 89 passing tests. E2 tests exercise person filtering, short-message contents, full-action disclosure, correct edit dialog, preserved progress/review route, all sixteen four-field profiles and responsive widths 360/390/430/1440. Existing startup/recovery, backups, review reuse and interview tests passed.
- Initial E2 public verification: commit 5dd4b8fa94b416d766247c0e51a654d7352eb02c, Pages workflow 38053257180 build/deploy both succeeded. Cloud browser rendered E2 with all sixteen four-field portrait cards; an existing saved mission opened short person cards by default. Filtering to 八阪, generating its message and returning to preserved progress/review worked. Final visual QA detected a wrapping recipient-filter label; follow-up fixes the label/select widths without changing data or logic.

- Final E2 public confirmation: cf0be4c628e4bb240f65f89301688fed579401aa; workflow 38053543222 build/deploy succeeded, including all application workflow gates. Final CSS-specific desktop/mobile simple-flow checks also passed (2). Verified https://kenkonitteki777-lab.github.io/TEAM-ARCHITECT/?view=characters&v=e2.1 with sixteen cards; existing mission opened person-first instructions, recipient selection worked and the label stayed on one line. Screenshot preserved for review. User's physical Android device remains untested.

## E3 — MBTI conversations that feed real work

2026-10-10. User wanted the MBTI foundation to be more engaging and useful.

- Added a pair conversation lab above the sixteen profiles. All 16 × 16 ordered combinations can be explored in three scenes: requesting work, disagreement, and helping someone stuck. Existing type art, staff presets, role swapping, two perspectives, a bridging sentence, complementary perspectives and likely misunderstanding make differences tangible. Four-axis explanation expands on demand; no numeric compatibility or ability ranking.
- The sixteen distinct questions and dialogue are editorial examples informed by preferences guidance (https://www.myersbriggs.org/type-in-my-life/personality-type-and-organizations/). They do not predict individual reactions. Actual preferences/reactions must take precedence. Job assignments still use registered ability/expertise, not MBTI.
- Real mission handoff messages now use the recipient's information/decision/conversation preferences. Actual action, deliverable, date, reporting recipient and waiting/completion labels remain intact. Show only supplied purpose/issue/criteria/consultation/authority, without inventing business impacts. Plain-message toggle is available. Blocked/completed directives do not receive a generic invitation to start work. Generated messages derive from current commands so edits cannot leave obsolete copy text.
- Story: pair/scene selection → local preference rules → dialogue; mission recipient → current saved directive + preferences → copyable message. No server/API, remote generation, environment variables, paid calls or schema migration are introduced.
- Synced concurrent interview noir/silhouette update 66306d6 before publication. Interview assets/UI and Supabase configuration are not part of this change. Existing local data/artwork unchanged.
- React review: module-scope component, unconditional hooks, derived message, labelled native selects/checkbox, scene pressed state, native disclosure and live conversation output. No new runtime dependency.
- Validation pending final combined result and public confirmation below. Initial 4-worker E2E: 33/34 passed; the long desktop KPI/hold/handoff/backup flow hit its 30-second total limit at the restored browser's history navigation. Domain 37 and interview 25 passed. Two-worker run passed 32/34; the two long desktop flows again reached 30 seconds under shared CPU load (concurrent unrelated build observed). The sixteen-selection and full KPI/hold/handoff/backup tests now have 60-second total budgets; individual assertions and checks are unchanged. Rebuilt final derived-message fix and reran affected UI/workflow tests.
- Final local validation: typecheck/build passed; domain 37 and interview 25 passed. Final rebuilt MBTI/simple/full workflow desktop/mobile tests 22/22 passed, including fresh message after editing; startup/recovery and practical board/review tests (remaining 12) passed in preceding full run. Widths 360/390/430/1440 fit without horizontal overflow. Publication CI will run the combined suite against exactly the published revision.

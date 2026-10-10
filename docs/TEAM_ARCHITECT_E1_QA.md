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

Public confirmation will be appended after deployment. User Android device and actual time savings remain unmeasured; do not claim proven business outcomes.

## Practical limits and next priorities

This is the first operational review/reuse loop, not completion of all stage E/F requirements. Work counts are not working hours or staffing capacity. No model has been trained; initial analysis/commands remain rules. The application stores on this browser and does not authenticate the selected recorder or share team state across devices.

Next improvements: actual availability and task effort, capability evidence/date/assessor, parallelizable work dependencies instead of overly serial default processes, category-specific command editing quality, and user-tested reductions in daily briefing/planning time. Preserve the same operating/data boundaries while making these changes.

# E8 — separate creation, selection and execution

2026-10-11 JST. Baseline main 493455c4863494f6c87df8f43c08b3cc82b02415.

User found “司令室” and “ミッション” indistinguishable. Audit: home mixed drafting, a staff roster, an active-resume card and five saved missions; records repeated all saved missions; control opened the last selected mission rather than a list. This made both destination and terminology ambiguous.

- 新しい指示書: one-sentence creation only, with optional settings and relevant previous learning. Removed duplicate roster/resume/list from this screen; original portraits remain in People and instruction screens.
- 指示書一覧: one complete list of all existing drafts and active instructions; select a specific record to inspect/edit. Details keep this navigation item selected and provide an explicit return-to-list button.
- 今日の仕事: existing actionable tasks across active instructions, completion and consultation unchanged.
- バックアップ: export/import and original legacy-data protection; no duplicate current instruction list. Restore then select through 指示書一覧.

Changing screens preserves unsaved drafting input and does not write local storage. No schema/key, saved missions, abilities, old assets, interview, database, dependency or AppDeploy changes. Existing approvals and execution logic are unchanged.

Local typecheck/build, 40 domain and 25 interview regression cases passed. New desktop/mobile story checks empty list, two separate saved drafts, selecting the correct older draft, return, preserved input, unchanged raw stored data, and distinct backup/work screens. List geometry is checked at 360/390/430/768/1440px. Existing workflow tests now navigate through the real list rather than removed duplicate home/backup rows. Final browser and public verification are recorded after completion. Physical Android not tested.

Local UI results: 50 cases passed in the full run; four reload/recovery cases still attempted the removed home list. Updated their navigation to 指示書一覧 and all four passed in a focused rerun. All 54 UI stories passed across these runs; combined with 65 domain/interview cases, 119 verified cases. Public CI runs the entire suite on the final revision.

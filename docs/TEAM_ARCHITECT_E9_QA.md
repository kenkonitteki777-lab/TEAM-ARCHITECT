# E9 — remove remaining duplication and protect unfinished input

2026-10-11 JST. Baseline 6ad6ca7997cf7c8482dfc73afe72ffb0c0ab0f15.

The user asked what to do about the remaining usability gaps. People previously repeated the full sixteen-type reference already present in the archive. That duplicate selector/profile is removed; all seven staff portraits and eighteen evaluation controls remain. Each staff member now links directly to their exact archive profile, with focus/scroll to the selected detail and return-to-card support. The original sixteen E6 artworks, group filters and equal archive rows remain.

WorkBoard used “新しいミッション” for the same creation destination, but its callback reset the unfinished brief. The callback now only changes views, preserving issue, optional fields and learning selection, like the other creation entry points. Visible creation/switch/tab terminology uses 指示書. Mobile backup navigation reads データ to distinguish it from manual saving. Recipient message preview reads “への文章を確認”; clipboard action remains separately labelled コピー. Work memo preview also reads 確認.

No domain-generation, schema, storage-key, approval, saved-data, ability-setting, interview, database, dependency or image changes. Arbitrary goal understanding remains limited to the existing five rule categories; real first-time human usability and workplace outcomes are not claimed.

Typecheck/build and 40 domain + 25 interview regression cases passed. Browser suite contains 56 desktop/mobile cases, including direct staff-to-profile navigation, unchanged stored evaluations, creation-entry input preservation and all sixteen archive row geometry at 360/390/430/768/1000/1440px. Initial browser run could not launch because the temporary test binary had been cleaned up; restored from the official package registry without changing project dependencies. Final browser and public results follow below.

Local final results: all 56 browser cases passed after restoring the temporary binary. Final terminology changes passed typecheck/build and six additional desktop/mobile workflow checks (creation, daily landing and work memo). React review found no new conditional hooks, inline component definitions, storage writes on navigation or dependency additions. Production CI and public verification are pending.

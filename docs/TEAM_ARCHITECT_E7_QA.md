# E7 — first-use instruction workflow

2026-10-11 JST. Baseline main 3e8db357b8728a3bac583109ca901201be22be30.

The previous large hero and always-visible planning fields obscured the first useful action. Entry now asks for one sentence, shows three optional examples, and puts “指示書を作る” before optional settings. Phone widths 360/390/430 retain the create action within the first 844px screen, without horizontal overflow. Original E6 portraits and sixteen-type alignment are retained.

Drafts immediately show person-first instructions and copyable recipient messages. A collapsed full-team overview explains the other roles and outputs. Purpose, deadline and checkpoint can be confirmed in the same view before activation; unknown dates are not invented, and the original issue is only an editable goal suggestion until explicitly saved. Activation focuses the missing-condition form. Existing approval, dependencies, revision audit and completed-work protections remain in force. Failed saves retain the form and original stored state.

Classification recognises 新人/OJT/研修/教育 as development work, preventing the new example from producing sales instructions. The system remains a rules-based first draft: arbitrary task understanding or a workplace outcome is not claimed.

Verification: typecheck/build and 40 domain + 25 interview regression tests passed. Browser suite covers 52 desktop/mobile cases including the complete one-sentence → development draft → inline dates → activation → reload journey, entry geometry, quota failure, loading recovery, backups, MBTI groups and interview answers. Initial browser failures came from assertions retaining the previous heading; updated assertions passed in the focused six-case rerun. Full final suite and public deployment results are recorded below after completion.

Scope: entry UI, draft guidance, keyword classification, tests and this document. No interview application files, Supabase, database, schema, storage key, dependencies or AppDeploy change. Public checks use a separate verification browser; physical Android and workplace effectiveness have not been measured.

## Final and public verification

- Final local suite: 52/52 desktop/mobile UI cases passed; typecheck/build and 65 domain/interview cases passed (117 total).
- Published app commit abde3234ec4b995ce61e9fc6f704d91e462be2c0. Pages workflow 38122986887: build and deploy successful; all required workflow checks passed.
- Public root rendered E7, original purple portrait and concise entry. A clearly labelled verification mission was created in the separate remote browser (previously zero missions). One sentence produced a development draft; purpose/dates were saved inline; activation and recipient message reflected the purpose and deadline; reload opened the daily work board with the saved mission. No real user records were overwritten or removed; test record is retained only in that browser's local storage, with no messages sent to staff.
- Cloud browser datetime fill initially altered DOM values without updating React state. Normal keyboard input events committed each field; save and activation then succeeded. This is an automation-input limitation, not evidence of failed ordinary typing; standard Playwright's desktop/mobile datetime fill and full journey passed.
- Public interview application rendered and revealed its model answer normally. No application-origin console error observed. No database, shared storage or interview edits.

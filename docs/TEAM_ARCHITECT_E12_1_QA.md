# E12.1 — keep a newly created instruction sheet at the top

2026-10-14 JST. Baseline ba74086f7c7215eb0037ae95929319b0bddea802.

Navigation reset previously ran in a passive effect after paint; implicit input focus, smooth scroll and browser scroll anchoring could interfere during a long form → expanded document transition. Use layout effect and explicit instant scroll before paint, including selection changes. Blur the submitting control only after successful persistence. Disable implicit smooth scrolling for this root application and scroll anchoring within main. No timer/repeated scroll reset, no input blur on failure. Explicit missing-condition navigation on activation and archive detail focus remain.

Typecheck/build and 44 domain cases passed. Initial focused UI: 17/18 passed; emulated smooth scrolling yielded a 3px mobile residual. Explicit root auto-scroll CSS removed it; six final desktop/mobile creation/navigation cases passed. Regression submits via Enter from the optional goal field, samples scroll position over 20 frames, checks top <=1px and focus not left in an input, retains all four visible instructions, and verifies activation still focuses missing conditions. Other focused coverage checks complete sheet, retained optional inputs and edits. Full CI/public results pending.

Only App, root composer styles, this QA record and the new scroll test changed. Existing saved data, rules, artwork, interview application and databases untouched. Mobile viewport tests are not Android hardware verification.

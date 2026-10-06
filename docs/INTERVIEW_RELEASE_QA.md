# Interview coach release / 2026-10-06

## Scope and source

- Original interview app: `edaed67a06825d213a57a1907cda7e5852987387`.
- Concurrent organizational-app handoff `6370220edec500728cabfcf6185fbf1a9bf30753` was preserved. `src/index.css` is unchanged. A single existing null-sentinel error in `src/App.tsx` was fixed after root-URL regression verification found a blank page. No organization redesign was performed.
- Initial public release: `e2934649db1ae879e3e2ed3af9eef37b4980cdfe`; follow-up hardens storage recovery and question positioning.
- URL: https://kenkonitteki777-lab.github.io/TEAM-ARCHITECT/interview/
- 48 original questions retained with stable IDs; 18 new angle questions; all 66 have answer draft, core, interviewer intent, two followup questions and proposed responses. Unknown personal facts and numbers remain marked.

## Executed checks

- `npm run test:interview`: 18/18 pass (data completeness, wording, diagnostic criteria, weighted selection, backup validation/merge, secret patterns, server authorization/allowlist/anonymous rejection, usage cap, malformed model response).
- `npm run build`: pass. GitHub Actions also executes interview tests before deploying.
- JavaScript syntax checks and native Node TypeScript syntax check for the function: pass.
- Public app browser operations: page loads with all 66 questions; input -> record -> contextual followup; profit -> concrete plan -> improvement amount; followup draft survives reload; save-and-next; weakness accumulated in history; weak-only session; mock answer/diagnostic hidden.
- Browser console inspection: extension-generated errors only; no app-origin errors observed in tested flow.
- Public UI adjustment after live checks: next/followup scrolls immediately to question; diagnostics use the current followup prompt; limited sessions use available pool size when fewer questions exist; corrupted primary data copied before replacement; cross-tab histories merged; expired sessions require login.

## Unverified and blocked

- Supabase projects listed: ジョブシート and MOCOMO; neither used or modified. No dedicated interview project exists.
- Server implementation and SQL prepared, but no server deployment, live AI call, real RLS database tests or live two-device synchronization claimed. Live RLS test script is rollback-only and must run on the dedicated project before activation.
- Browser verification runs in remote desktop Chrome. Android hardware, mobile microphone permission, mobile speech recognition and 360/390/430px screenshots are not verified here. Responsive CSS is provided and uses 600/850/1100px breakpoints with 16px mobile input text and primary 54px action.
- Root app TypeScript check initially had six pre-existing errors in `src/App.tsx`: unused done, fn, p, requestText, rel, and a null index. The null-index runtime defect was fixed with a one-line null check; five unused-symbol errors remain outside interview scope.
- Original PDF source material is absent; original source labels explicitly marked unverified. New answers are proposals, not confirmed past statements. No budgets/achievements fabricated.
- AI requires dedicated project/account and server-side API secret with a cost decision; remains visibly disabled until then.

## Root regression recovery

Public root URL initially rendered a blank page with `Cannot read properties of undefined (reading name)`. The final workflow step assigns `nextOwner=null`, but the handoff expression checked `undefined`. Corrected the sentinel to null. A regression test runs all five mission kinds and verifies their final handoff and valid owners.

## Next activation task

Confirm dedicated Supabase organization/project plan and AI budget; follow `docs/INTERVIEW_BACKEND.md`. Run live RLS/advisors/auth denial tests before setting `CLOUD.enabled`. Then test real contextual AI output for both modes, user consent, per-day cap and offline recovery. Do not report fully completed AI coaching until these pass.


## Free shared backend / 2026-10-06

- User-approved non-MOCOMO sharing: interview-prefixed resources added to ジョブシート. Existing app resources and Auth configuration not altered. Infrastructure/Auth/quotas shared. MOCOMO untouched.
- Live migration and Edge Function deployment succeeded. Live rollback-only RLS checks passed: owner isolation, unapproved shared-user denial, self-enrollment denial, anonymous denial, ownership transfer denial, server-only reservation. No synthetic users or snapshots remain.
- 20 local regression checks passed, including no paid provider invocation despite shared keys, membership lookup failing closed, and optimistic sync conflict retry excluding drafts. Vite production build passed.
- Advisor: interview_ai_usage has RLS without policies intentionally (deny all clients; service role only). Existing unrelated findings preserved; no new interview warning-level findings.
- Membership initially empty pending owner's verified Auth account. Authorized end-to-end sync and two-device round trip are not yet verified.
- Live Edge HTTP checks passed: OPTIONS preflight 200, missing bearer 401, forged bearer 401. Anonymous REST on profiles denied with insufficient privilege.

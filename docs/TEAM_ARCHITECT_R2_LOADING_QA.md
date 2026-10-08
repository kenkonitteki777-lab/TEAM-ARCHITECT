# R2 loading recovery — 2026-10-08

Baseline: `b85b801c030c87cec2fa275ad8089523da23de24` (main).
Read both `TEAM_ARCHITECT_2_RESTART_HANDOFF.md` and the formal work specification.

## Findings and limits

- Current public HTML, JS and UI load in the cloud Chrome verification environment. No application error observed. This does **not** identify the cause on the user's Android device.
- Previous HTML contained only an empty root. Entry fetch/execution failure left no usable status, recovery route, or way to describe the stalled stage.
- Vite generated hashed entry/CSS URLs. Pages replaces the artifact on each deployment; cached HTML can refer to files absent from a later artifact. This is a reproducible failure mode, **not proof that it caused the user's report**.
- Storage denial and malformed data already have an initial catch in App. Retained it and verified original data protection; no storage schema migration was required.

## Change

- Stable, single-bundle JS and CSS entry URLs prevent future cached R2 HTML from referencing removed entry names. Assets can remain cached for the Pages cache lifetime; this does not guarantee instant upgrade of already cached old versions.
- HTML startup shell is independent of the React bundle and stylesheet. Shows entry failure, execution failure, or startup timeout; reload link preserves URL state and adds a fresh HTML query.
- React error boundary brings the recovery shell back for rendering failures. No saved data is removed or overwritten by recovery.
- Independent `recovery.html` checks JS/CSS/artwork with 12-second bounds and reports storage readability. No user data is sent. Explicit raw backup reads only four TEAM ARCHITECT keys; interview keys remain untouched.
- E2E checks now gate Pages publication, alongside the existing domain and interview checks.

## Local verification

- Typecheck and production build: passed. JS 324.79 kB / gzip 100.40 kB; CSS 45.58 kB / gzip 10.17 kB.
- Domain tests: 26 passed. Interview regression: 25 passed.
- Desktop/mobile E2E: 24 passed (including entry 404 → visible recovery → retry, denied storage, independent diagnostics without storage mutation, raw export, preserved mission after recovery, 16 portraits, cockpit workflow, JSON restoration, interview model answer and next question).
- Existing mobile overflow checks cover 360 / 390 / 430 px and desktop 1440 px.
- Official Playwright browser download was unavailable in this restricted local environment; tests used Chromium obtained from the npm package `@sparticuz/chromium`, outside the repository. No runtime dependency or package lock changes.
- `public/interview/`, `supabase/`, illustrations and storage format unchanged.

## Public verification

- Published implementation commit: `394d57ffcc74e0c0a64fcfc54ddcb0fdf2127417`.
- Pages workflow https://github.com/kenkonitteki777-lab/TEAM-ARCHITECT/actions/runs/37780759526: build, browser E2E and deployment succeeded.
- Cloud Chrome opened https://kenkonitteki777-lab.github.io/TEAM-ARCHITECT/?v=r2 and verified the new stable entry URL and hidden startup shell after successful rendering.
- A mission created in the previous public version was retained in R2. Opened its seven individual commands and reloaded; saved mission was still available.
- https://kenkonitteki777-lab.github.io/TEAM-ARCHITECT/recovery.html: HTML reached, storage readable, JS / CSS / portrait each HTTP 200 with matching content types.
- Public `/interview/` was reloaded after publication; model answer displayed and next question changed successfully.
- Protected paths (`public/interview/`, `supabase/`, `public/operatives/`, lockfile) have no diff against baseline.
- Android real-device access remains unconfirmed; request only the result from the new app URL or the diagnostic page if still blocked. Do not tell the user to clear site data.

## Next work

Once real-device access is confirmed, improve daily practical use from the existing D1 cockpit. Keep illustrations. Review capability evidence / available capacity, explicit selection alternatives and review-to-next-mission learning before expanding AI or shared storage.

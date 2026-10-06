# TEAM ARCHITECT / free interview backend

## Deployed architecture

The user approved free operation separate from MOCOMO, with multiple applications sharing a free Supabase slot. Interview-only tables and the `interview-coach` function use the non-MOCOMO project `jjhtmtvhlgkhbswixtpf` (ジョブシート). MOCOMO is untouched. No existing Job Sheet tables, policies, functions, Auth configuration or users are modified. Infrastructure, Auth and quotas are shared; this is logical isolation, not a dedicated Supabase instance. No third project, paid plan or paid AI provider is activated.

The frontend has only the public URL and publishable key. All local practice remains usable without login. Cloud sync is explicitly triggered by the user. The release has `AI_ENABLED=false` in the deployed server, independently of frontend consent or any keys belonging to other apps. Contextual follow-ups use local rules; they are not generative AI.

## Owner activation still required

`public.interview_members` is initially empty. No account is inferred from names, Job Sheet roles or dashboard ownership. Obtain the owner's confirmed Auth account ID through a secure process, then add only that user to `interview_members`. The dashboard account email is not itself a Supabase Auth account. If needed, provision a separate owner Auth account in the shared project's dashboard, without changing shared signup settings or sending passwords in chat/git. Existing Job Sheet Auth may be reused only after the owner identifies the account. Do not silently grant every shared-app user access.

The app checks the live Auth session and membership before marking login successful. A pending account receives a clear error. A valid signed-in user without interview membership cannot access the interview tables directly through REST, either. Membership has self-only SELECT and no browser INSERT/UPDATE/DELETE grants. The profile policy requires both ownership and active interview membership. No profile DELETE grant or delete endpoint exists.

## Deployment and verification

- Apply `supabase/interview-schema.sql` using the connected Supabase migration tool (`interview_free_isolated_storage`). Migration SQL adds only interview-prefixed resources. No local migration filename timestamp is guessed.
- Run rollback-only `supabase/tests/rls.sql`. It checks owner isolation, ownership transfer, unapproved shared-user denial, self-enrollment denial, anonymous denial and server-only rate reservation.
- Deploy `interview-coach` with index.ts, engine.js and questions.js; `verify_jwt=false` because every request is validated through live `/auth/v1/user`, rejects anonymous users, and checks membership. Origin checks do not substitute for authentication. Sync queries run under the user's token and RLS.
- Check security advisors against the existing-project baseline. Do not alter another app's existing functions or authorization to clean up unrelated advisor findings.
- Verify the actual GitHub Pages URL, preflight, missing/forged token denial, anonymous REST denial and local practice. Authorized two-device synchronization remains pending until the owner account is identified; do not report it as verified.

## Data integrity

Stable question IDs; legacy keys retained. Drafts use localStorage and IndexedDB snapshots; they stay local and are omitted from cloud payloads. Backups merge history by immutable ID, latest records by edit time and facts by timestamps. Cloud sync uses revision compare-and-swap and retries conflicts. No destructive merge; maximum payload 10 MB, history retention 5,000 attempts per snapshot. Export regularly. Logout uses `scope=local` so the interview app does not revoke other shared-app sessions.

## AI and evaluation limits

Local diagnostics are weakness candidates, not semantic scores. Future generative AI requires a separately reviewed free provider or explicit user approval for cost/secrets. The disabled scaffold includes 15-axis structured output validation, rate reservation and server-only credentials. It must not be activated simply because the shared project has provider keys. Unknown numbers, experiences and budgets remain 要確認. Public answer drafts are visible on GitHub Pages; actual answers and registered facts are only sent on explicit sync.

# TEAM ARCHITECT / private interview coach

## Current release

The public GitHub Pages app is a fully usable local trainer. AI and cloud sync are disabled until a dedicated project, owner account, server secrets and budget are approved/configured. No changes have been made to MOCOMO or ジョブシート.

## Activation gates

1. Confirm a dedicated Supabase project (organization and plan). Do not use another app's project without explicit approval.
2. Disable public signups and anonymous sign-ins; provision the owner's account securely.
3. Run `supabase --help`, then `supabase migration --help` and `supabase migration new --help`. Generate a migration with `supabase migration new interview_coach`, copy `supabase/interview-schema.sql` into it, review and apply to the dedicated project. No generated migration timestamp is guessed in this repository.
4. Verify RLS with `supabase/tests/rls.sql` using rollback-only test data. Check advisors; confirm anonymous access denied, owners isolated, ownership transfer denied, rate-limit RPC denied to authenticated users.
5. Configure Edge Function secrets securely (never in chat or git): `OPENAI_API_KEY`, `INTERVIEW_AI_MODEL` (a supported structured-output model chosen after approving usage), `INTERVIEW_ALLOWED_USER_IDS`, `INTERVIEW_ORIGIN=https://kenkonitteki777-lab.github.io`, `INTERVIEW_DAILY_LIMIT` (default 30, max 100). Built-in Supabase URL/anon/service-role variables remain server-only. The daily cap is request-based, not a currency cap; set the provider budget alert as well. Failed calls consume a reservation conservatively.
6. Deploy `interview-coach`. `verify_jwt=false` supports current publishable/signing-key workflows, while the handler validates every request through live Auth `/user`, rejects anonymous or non-allowlisted users, and runs owner-data queries with the user's token (RLS). Origin checks do not replace authentication. There is no unauthenticated AI path.
7. In `public/interview/config.js`, set only the public URL and publishable key, then `enabled:true`. Never put AI or service-role keys in public code. Push and verify.
8. Log in from the app. Sync only on explicit button press. AI runs only with explicit consent; the app explains which data goes to OpenAI. Tokens are held only in sessionStorage; expired tokens require a new login.
9. Verify authorized AI output, forged/expired tokens, unapproved user, rejected origin, daily cap, double-call limit, provider timeout, wrong model, two-device sync and offline operation. Do not call this fully deployed until these live checks pass.

## Data integrity

- Stable question IDs; legacy keys are read without deleting them.
- Input drafts use localStorage and an IndexedDB snapshot. This protects against some write failures, not device loss or storage clearing.
- Backups merge histories by immutable attempt ID; latest question records win. Timestamped facts merge by their last edit time; older backups without timestamps preserve existing local facts. Drafts stay local and are omitted from cloud snapshots. Stored numbers require a source and confirmation date before substituting into answer drafts.
- Cloud sync uses revision compare-and-swap, retries conflicts, and merges histories. No DELETE grant or endpoint. Maximum backup size is 10 MB and history retention is 5,000 attempts per snapshot; export regularly.
- Model output is schema constrained and validated, rendered as escaped text, and never executed. No transcript is printed in server logs. `store:false` is set for OpenAI; this is not a claim of zero provider retention.

## Evaluation limits

Local diagnostic rules suggest weaknesses; they do not assess meaning or guarantee results. AI scores each of the 15 requested axes with evidence, uses null for unknown/inapplicable aspects, and must not verify personal facts by inference. The UI timer measures page-to-save duration; it is not a voice-accurate measure of conclusion latency. User can amend weaknesses manually.

The original source labels referenced old PDFs without those PDFs being present in this repo; the UI marks them unverified. Added answers are proposals, not invented past results. MIRACLE WORLD facts and budgets must be confirmed by the owner.

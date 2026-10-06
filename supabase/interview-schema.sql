-- Add interview-only resources to the non-MOCOMO shared project. Existing apps are untouched.
begin;
create table public.interview_members (
  user_id uuid primary key references auth.users(id),
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.interview_members enable row level security;
revoke all on public.interview_members from public, anon, authenticated;
grant select on public.interview_members to authenticated;
create policy interview_member_self on public.interview_members for select to authenticated
  using ((select auth.uid()) = user_id);
-- Membership can only be granted administratively, never by the browser or shared-app users.
create table public.interview_profiles (
  user_id uuid primary key references auth.users(id),
  payload jsonb not null check (jsonb_typeof(payload) = 'object' and octet_length(payload::text) <= 10485760),
  revision bigint not null default 1 check (revision > 0),
  updated_at timestamptz not null default now()
);
alter table public.interview_profiles enable row level security;
revoke all on public.interview_profiles from public, anon, authenticated;
grant select, insert, update on public.interview_profiles to authenticated;
create policy interview_select on public.interview_profiles for select to authenticated using ((select auth.uid()) = user_id and exists (select 1 from public.interview_members m where m.user_id = (select auth.uid()) and m.enabled));
create policy interview_insert on public.interview_profiles for insert to authenticated with check ((select auth.uid()) = user_id and exists (select 1 from public.interview_members m where m.user_id = (select auth.uid()) and m.enabled));
create policy interview_update on public.interview_profiles for update to authenticated using ((select auth.uid()) = user_id and exists (select 1 from public.interview_members m where m.user_id = (select auth.uid()) and m.enabled)) with check ((select auth.uid()) = user_id and exists (select 1 from public.interview_members m where m.user_id = (select auth.uid()) and m.enabled));
create table public.interview_ai_usage (
  user_id uuid not null references auth.users(id),
  day date not null default current_date,
  requests integer not null default 0,
  last_request timestamptz,
  primary key (user_id, day)
);
alter table public.interview_ai_usage enable row level security;
revoke all on public.interview_ai_usage from public, anon, authenticated;
grant select, insert, update on public.interview_ai_usage to service_role;
-- No SECURITY DEFINER. Service role is the only caller permitted to reserve usage.
create function public.interview_reserve_usage(p_user uuid, p_daily_limit integer)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare accepted boolean;
begin
  if p_daily_limit < 1 or p_daily_limit > 100 then return false; end if;
  insert into public.interview_ai_usage(user_id, day, requests, last_request)
  values(p_user, current_date, 1, clock_timestamp())
  on conflict(user_id, day) do update
    set requests = interview_ai_usage.requests + 1, last_request = clock_timestamp()
    where interview_ai_usage.requests < p_daily_limit
      and interview_ai_usage.last_request < clock_timestamp() - interval '3 seconds'
  returning true into accepted;
  return coalesce(accepted, false);
end; $$;
revoke all on function public.interview_reserve_usage(uuid, integer) from public, anon, authenticated;
grant execute on function public.interview_reserve_usage(uuid, integer) to service_role;
commit;

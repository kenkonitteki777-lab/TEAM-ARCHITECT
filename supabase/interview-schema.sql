-- Apply to a dedicated TEAM-ARCHITECT project only, after reviewing deployment instructions.
begin;
create table public.interview_profiles (
  user_id uuid primary key references auth.users(id),
  payload jsonb not null check (jsonb_typeof(payload) = 'object' and octet_length(payload::text) <= 10485760),
  revision bigint not null default 1 check (revision > 0),
  updated_at timestamptz not null default now()
);
alter table public.interview_profiles enable row level security;
revoke all on public.interview_profiles from public, anon, authenticated;
grant select, insert, update on public.interview_profiles to authenticated;
create policy interview_select on public.interview_profiles for select to authenticated using ((select auth.uid()) = user_id);
create policy interview_insert on public.interview_profiles for insert to authenticated with check ((select auth.uid()) = user_id);
create policy interview_update on public.interview_profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
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

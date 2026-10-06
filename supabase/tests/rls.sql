-- Run after schema deployment. Synthetic users and all writes roll back.
begin;
insert into auth.users(id, aud, role, email) values
 ('11111111-1111-4111-8111-111111111111','authenticated','authenticated','interview-rls-a@example.invalid'),
 ('22222222-2222-4222-8222-222222222222','authenticated','authenticated','interview-rls-b@example.invalid');
insert into public.interview_members(user_id) values ('11111111-1111-4111-8111-111111111111');
insert into public.interview_profiles(user_id,payload) values
 ('11111111-1111-4111-8111-111111111111','{"version":3}'),
 ('22222222-2222-4222-8222-222222222222','{"version":3}');
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}',true);
do $$ begin
 if (select count(*) from public.interview_profiles) <> 1 then raise exception 'FAIL: cross-user SELECT'; end if;
 update public.interview_profiles set revision=2 where user_id='22222222-2222-4222-8222-222222222222';
 if found then raise exception 'FAIL: cross-user UPDATE'; end if;
 begin
  update public.interview_profiles set user_id='33333333-3333-4333-8333-333333333333' where user_id='11111111-1111-4111-8111-111111111111';
  raise exception 'FAIL: ownership transfer';
 exception when insufficient_privilege then null; end;
 begin
  perform public.interview_reserve_usage('11111111-1111-4111-8111-111111111111',30);
  raise exception 'FAIL: client rate-limit access';
 exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}',true);
do $$ begin
 if exists(select 1 from public.interview_profiles) then raise exception 'FAIL: unapproved shared-app user SELECT'; end if;
 begin
  insert into public.interview_members(user_id) values('22222222-2222-4222-8222-222222222222');
  raise exception 'FAIL: self-enrollment';
 exception when insufficient_privilege then null; end;
 begin
  insert into public.interview_profiles(user_id,payload) values('22222222-2222-4222-8222-222222222222','{}');
  raise exception 'FAIL: unapproved INSERT';
 exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role anon;
do $$ begin
 begin
  perform 1 from public.interview_profiles;
  raise exception 'FAIL: anonymous SELECT';
 exception when insufficient_privilege then null; end;
end $$;
reset role;
rollback;

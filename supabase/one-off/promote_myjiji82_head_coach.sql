-- One-off: myjiji82@gmail.com (손지영) → head_coach
-- Run in Supabase Dashboard → SQL Editor as a privileged role (postgres bypasses RLS).
-- Prerequisite: the user must already exist in auth.users (signed up at least once).

do $$
declare
  target_email constant text := 'myjiji82@gmail.com';
  uid uuid;
begin
  select id into uid
  from auth.users
  where lower(email) = lower(target_email);

  if uid is null then
    raise exception 'auth.users에 해당 이메일이 없습니다: %', target_email;
  end if;

  insert into public.coach_profiles (user_id, display_name, role, is_active)
  values (uid, '손지영', 'head_coach'::public.coach_role, true)
  on conflict (user_id) do update set
    role = 'head_coach'::public.coach_role,
    display_name = case
      when coach_profiles.display_name is null or btrim(coach_profiles.display_name) = ''
        then '손지영'
      else coach_profiles.display_name
    end,
    is_active = true,
    updated_at = now();
end $$;

-- Verify
select cp.user_id, au.email, cp.display_name, cp.role, cp.is_active
from public.coach_profiles cp
join auth.users au on au.id = cp.user_id
where lower(au.email) = lower('myjiji82@gmail.com');

-- Coach onboarding helper for ER coach aliases.
-- Run after each coach has completed signup in Supabase Auth.
-- Important: coach_profiles can only reference emails that already exist in auth.users.
-- Existing display_name values should be preserved when a coach row already exists.
-- Founder/admin contacts are handled separately and are not seeded here.

-- 1) Check which target login emails already exist in auth.users.
select id, email, created_at
from auth.users
where lower(email) in (
  lower('dchoi@er-coaching.com'),
  lower('csuh@er-coaching.com'),
  lower('aaddff4023@naver.com'),
  lower('sonoggi80@gmail.com'),
  lower('snowdrop0228@gmail.com'),
  lower('ywamchanmi@gmail.com'),
  lower('caidychoi@gmail.com'),
  lower('suhjy326@gmail.com')
)
order by created_at desc;

-- 2) Upsert coach profiles for confirmed coach identities.
-- Use the exact email each coach actually used for signup.
-- For ambiguous naming, preserve the current seed display_name until explicitly changed.
with coach_seed as (
  select * from (values
    ('dchoi@er-coaching.com', '최다영', 'coach'::coach_role, true),
    ('csuh@er-coaching.com', '서초윤', 'coach'::coach_role, true),
    ('aaddff4023@naver.com', '임효조', 'coach'::coach_role, true),
    ('sonoggi80@gmail.com', '김수잔', 'coach'::coach_role, true),
    ('snowdrop0228@gmail.com', '정경하', 'coach'::coach_role, true),
    ('ywamchanmi@gmail.com', '주찬미', 'coach'::coach_role, true)
  ) as t(email, display_name, role, is_active)
),
matched as (
  select
    au.id as user_id,
    s.display_name,
    s.role,
    s.is_active,
    s.email
  from coach_seed s
  join auth.users au
    on lower(au.email) = lower(s.email)
)
insert into public.coach_profiles (user_id, display_name, role, is_active)
select user_id, display_name, role, is_active
from matched
on conflict (user_id)
do update set
  display_name = public.coach_profiles.display_name,
  role = excluded.role,
  is_active = excluded.is_active,
  updated_at = now();

-- 3) Missing rows check.
with coach_seed as (
  select * from (values
    ('aaddff4023@naver.com'),
    ('sonoggi80@gmail.com'),
    ('snowdrop0228@gmail.com'),
    ('ywamchanmi@gmail.com'),
    ('dchoi@er-coaching.com'),
    ('csuh@er-coaching.com')
  ) as t(email)
)
select s.email as missing_email
from coach_seed s
left join auth.users au
  on lower(au.email) = lower(s.email)
where au.id is null;

-- 4) Verify coach_profiles rows.
select cp.user_id, au.email, cp.display_name, cp.role, cp.is_active
from public.coach_profiles cp
join auth.users au on au.id = cp.user_id
where lower(au.email) in (
  lower('aaddff4023@naver.com'),
  lower('sonoggi80@gmail.com'),
  lower('snowdrop0228@gmail.com'),
  lower('ywamchanmi@gmail.com'),
  lower('dchoi@er-coaching.com'),
  lower('csuh@er-coaching.com')
)
order by cp.display_name asc;

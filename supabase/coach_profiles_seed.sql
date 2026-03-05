-- Seed coach_profiles for 7 coaches
-- Prerequisite: Users must already exist in auth.users with these emails.
-- Run this after coach_portal_schema.sql

with coach_seed as (
  select * from (values
    ('campus.12000@gmail.com', '관리자', 'head_coach'::coach_role, true),
    ('restoration.son@gmail.com', '손지영', 'head_coach'::coach_role, true),
    ('coach1@example.com', '김수잔', 'coach'::coach_role, true),
    ('coach2@example.com', '서초윤', 'coach'::coach_role, true),
    ('coach3@example.com', '정익훈', 'coach'::coach_role, true),
    ('coach4@example.com', '정경하', 'coach'::coach_role, true),
    ('coach5@example.com', '주찬미', 'coach'::coach_role, true),
    ('coach6@example.com', '임효조', 'coach'::coach_role, true),
    ('coach7@example.com', '최다영', 'coach'::coach_role, true)
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
  left join auth.users au
    on lower(au.email) = lower(s.email)
)
insert into public.coach_profiles (user_id, display_name, role, is_active)
select user_id, display_name, role, is_active
from matched
where user_id is not null
on conflict (user_id)
do update set
  display_name = excluded.display_name,
  role = excluded.role,
  is_active = excluded.is_active,
  updated_at = now();

-- Check which emails were not found in auth.users
with coach_seed as (
  select * from (values
    ('campus.12000@gmail.com'),
    ('restoration.son@gmail.com'),
    ('coach1@example.com'),
    ('coach2@example.com'),
    ('coach3@example.com'),
    ('coach4@example.com'),
    ('coach5@example.com'),
    ('coach6@example.com'),
    ('coach7@example.com')
  ) as t(email)
)
select s.email as missing_email
from coach_seed s
left join auth.users au
  on lower(au.email) = lower(s.email)
where au.id is null;

-- Quick verify
select cp.user_id, au.email, cp.display_name, cp.role, cp.is_active
from public.coach_profiles cp
join auth.users au on au.id = cp.user_id
order by cp.role desc, cp.display_name asc;

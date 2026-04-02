-- 전문가 양성반 7·8주차: 6주차(4/2 목)와 동일 요일(목)로 정정
-- 이전 버전(20260329120000)이 4/7·4/14 화요일로 들어간 DB에도 idempotent하게 반영

with target_coach as (
  select id as user_id
  from auth.users
  where lower(email) = lower('campus.12000@gmail.com')
  limit 1
),
fallback_user as (
  select id as user_id
  from auth.users
  order by created_at asc
  limit 1
),
creator as (
  select coalesce((select user_id from target_coach), (select user_id from fallback_user)) as user_id
)
insert into public.coach_schedules (
  id,
  title,
  schedule_type,
  start_at,
  end_at,
  location,
  notes,
  created_by
)
select
  v.id,
  v.title,
  v.schedule_type::text,
  v.start_at,
  v.end_at,
  v.location,
  v.notes,
  c.user_id
from creator c
cross join (
  values
    (
      'c9e2f6a0-1111-4a26-8c11-002234040202'::uuid,
      '전문가 양성반 6주차'::text,
      'er_ministry',
      (timestamp '2026-04-02 20:00:00' at time zone 'America/Chicago'),
      (timestamp '2026-04-02 23:00:00' at time zone 'America/Chicago'),
      'https://us06web.zoom.us/j/86399751879?pwd=Ht5MitBouVqwpMN5yzGwVZCTOTpaox.1'::text,
      '달라스 20:00–23:00 · 한국 익일 금요일 10:00–13:00 (KST)'::text
    ),
    (
      'c9e2f6a0-1111-4a26-8c11-002234040707'::uuid,
      '전문가 양성반 7주차'::text,
      'er_ministry',
      (timestamp '2026-04-09 20:00:00' at time zone 'America/Chicago'),
      (timestamp '2026-04-09 23:00:00' at time zone 'America/Chicago'),
      'https://us06web.zoom.us/j/86399751879?pwd=Ht5MitBouVqwpMN5yzGwVZCTOTpaox.1'::text,
      '달라스 20:00–23:00 · 한국 익일 금요일 10:00–13:00 (KST)'::text
    ),
    (
      'c9e2f6a0-1111-4a26-8c11-002234040714'::uuid,
      '전문가 양성반 8주차'::text,
      'er_ministry',
      (timestamp '2026-04-16 20:00:00' at time zone 'America/Chicago'),
      (timestamp '2026-04-16 23:00:00' at time zone 'America/Chicago'),
      'https://us06web.zoom.us/j/86399751879?pwd=Ht5MitBouVqwpMN5yzGwVZCTOTpaox.1'::text,
      '달라스 20:00–23:00 · 한국 익일 금요일 10:00–13:00 (KST)'::text
    )
) as v(id, title, schedule_type, start_at, end_at, location, notes)
where c.user_id is not null
on conflict (id) do update set
  title = excluded.title,
  schedule_type = excluded.schedule_type,
  start_at = excluded.start_at,
  end_at = excluded.end_at,
  location = excluded.location,
  notes = excluded.notes,
  updated_at = now();

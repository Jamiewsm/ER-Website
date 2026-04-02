-- April 2026: weekly Wednesday regular (Dallas 8:30–10:30) + expert cohort Thursday week 6
-- created_by: same account as other coach portal seeds (falls back to any auth user if missing)

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
      'c9e2f6a0-1111-4a26-8c11-001234040101'::uuid,
      '수요 정규 모임 · Instructor 스터디 (1번 하위유형)'::text,
      'study_track',
      (timestamp '2026-04-01 08:30:00' at time zone 'America/Chicago'),
      (timestamp '2026-04-01 10:30:00' at time zone 'America/Chicago'),
      'https://us06web.zoom.us/j/89006271650?pwd=JvGeNtW6r44gplqoGfTO3QyIcZXIFf.1'::text,
      '달라스 8:30–10:30 · 한국 같은 날 22:30 ~ 익일 00:30 (KST)'::text
    ),
    (
      'c9e2f6a0-1111-4a26-8c11-001234040108'::uuid,
      '수요 정규 모임 · Formation 트랙'::text,
      'spiritual_formation_track',
      (timestamp '2026-04-08 08:30:00' at time zone 'America/Chicago'),
      (timestamp '2026-04-08 10:30:00' at time zone 'America/Chicago'),
      'https://us06web.zoom.us/j/89006271650?pwd=JvGeNtW6r44gplqoGfTO3QyIcZXIFf.1'::text,
      '달라스 8:30–10:30 · 한국 같은 날 22:30 ~ 익일 00:30 (KST)'::text
    ),
    (
      'c9e2f6a0-1111-4a26-8c11-001234040115'::uuid,
      '수요 정규 모임 · Instructor 스터디 (7번 하위유형)'::text,
      'study_track',
      (timestamp '2026-04-15 08:30:00' at time zone 'America/Chicago'),
      (timestamp '2026-04-15 10:30:00' at time zone 'America/Chicago'),
      'https://us06web.zoom.us/j/89006271650?pwd=JvGeNtW6r44gplqoGfTO3QyIcZXIFf.1'::text,
      '달라스 8:30–10:30 · 한국 같은 날 22:30 ~ 익일 00:30 (KST)'::text
    ),
    (
      'c9e2f6a0-1111-4a26-8c11-001234040122'::uuid,
      '수요 정규 모임 · 코칭 스킬 — 손지영 대표 특강 (심리학·기독교)'::text,
      'coaching_track',
      (timestamp '2026-04-22 08:30:00' at time zone 'America/Chicago'),
      (timestamp '2026-04-22 10:30:00' at time zone 'America/Chicago'),
      'https://us06web.zoom.us/j/89006271650?pwd=JvGeNtW6r44gplqoGfTO3QyIcZXIFf.1'::text,
      '달라스 8:30–10:30 · 한국 같은 날 22:30 ~ 익일 00:30 (KST)'::text
    ),
    (
      'c9e2f6a0-1111-4a26-8c11-002234040202'::uuid,
      '전문가 양성반 6주차'::text,
      'er_ministry',
      (timestamp '2026-04-02 20:00:00' at time zone 'America/Chicago'),
      (timestamp '2026-04-02 23:00:00' at time zone 'America/Chicago'),
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

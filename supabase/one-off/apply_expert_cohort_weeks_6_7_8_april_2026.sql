-- PRODUCTION ONE-OFF: 전문가 양성반 6·7·8주차 (2026-04 목요일 달라스 저녁)
-- Supabase SQL Editor에서 실행. auth.users에 최소 1명 있어야 합니다.
-- (마이그레이션이 아직 적용되지 않았거나, 마이그레이션 시점에 creator가 비어 0행이었을 때 사용)

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
  u.id
from (select id from auth.users order by created_at asc limit 1) u
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
where exists (select 1 from auth.users limit 1)
on conflict (id) do update set
  title = excluded.title,
  schedule_type = excluded.schedule_type,
  start_at = excluded.start_at,
  end_at = excluded.end_at,
  location = excluded.location,
  notes = excluded.notes,
  updated_at = now();

select id, title, start_at, end_at from public.coach_schedules
where id in (
  'c9e2f6a0-1111-4a26-8c11-002234040202'::uuid,
  'c9e2f6a0-1111-4a26-8c11-002234040707'::uuid,
  'c9e2f6a0-1111-4a26-8c11-002234040714'::uuid
)
order by start_at;

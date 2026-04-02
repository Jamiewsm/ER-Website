-- Seed starter data for coach portal training/mentoring views
-- Target: campus.12000@gmail.com

with target_coach as (
  select id as user_id
  from auth.users
  where lower(email) = lower('campus.12000@gmail.com')
  limit 1
),
month_info as (
  select to_char(now(), 'YYYY-MM') as month_key
)
insert into public.coach_training_progress (
  coach_user_id,
  track_key,
  month_key,
  required_count,
  completed_count,
  latest_submission_title,
  latest_submission_at,
  next_deadline
)
select
  tc.user_id,
  seed.track_key,
  mi.month_key,
  seed.required_count,
  seed.completed_count,
  seed.latest_submission_title,
  seed.latest_submission_at,
  seed.next_deadline
from target_coach tc
cross join month_info mi
cross join (
  values
    ('formation'::text, 1, 1, 'Formation 월간 N번 보고서', now() - interval '3 day', now() + interval '7 day'),
    ('instructor'::text, 2, 1, 'Instructor 스터디 요약 #1', now() - interval '5 day', now() + interval '4 day'),
    ('coaching'::text, 1, 0, null::text, null::timestamptz, now() + interval '10 day'),
    ('practicum'::text, 1, 0, null::text, null::timestamptz, now() + interval '12 day')
) as seed(track_key, required_count, completed_count, latest_submission_title, latest_submission_at, next_deadline)
on conflict (coach_user_id, track_key, month_key)
do update set
  required_count = excluded.required_count,
  completed_count = excluded.completed_count,
  latest_submission_title = excluded.latest_submission_title,
  latest_submission_at = excluded.latest_submission_at,
  next_deadline = excluded.next_deadline,
  updated_at = now();

with target_coach as (
  select id as user_id
  from auth.users
  where lower(email) = lower('campus.12000@gmail.com')
  limit 1
)
insert into public.coach_mentees (
  coach_user_id,
  display_name,
  risk_level,
  status,
  next_session_at,
  is_active,
  notes
)
select
  tc.user_id,
  seed.display_name,
  seed.risk_level,
  'active',
  seed.next_session_at,
  true,
  seed.notes
from target_coach tc
cross join (
  values
    ('훈련생 A'::text, 'attention'::text, now() + interval '1 day', '실습 로그 follow-up 필요'),
    ('훈련생 B'::text, 'normal'::text, now() + interval '2 day', 'Formation 보고서 피드백 전달 예정'),
    ('훈련생 C'::text, 'high'::text, now() + interval '3 day', '일정 재조정 및 집중 체크인 필요')
) as seed(display_name, risk_level, next_session_at, notes)
where not exists (
  select 1
  from public.coach_mentees cm
  where cm.coach_user_id = tc.user_id
    and cm.display_name = seed.display_name
    and cm.is_active = true
);

with target_coach as (
  select id as user_id
  from auth.users
  where lower(email) = lower('campus.12000@gmail.com')
  limit 1
),
seed as (
  select *
  from (
    values
      ('훈련생 A'::text, '1:1 실습 질문 follow-up'::text, '실습 질문 2개를 이번 주 내 재정리'::text, now() + interval '2 day', 'pending'::text, 'high'::text, null::text),
      ('훈련생 B'::text, 'Formation 코멘트 전달'::text, '월간 보고서 코멘트 전달 후 체크인'::text, now() + interval '3 day', 'pending'::text, 'normal'::text, null::text),
      ('훈련생 C'::text, '일정 재조율'::text, '다음 멘토링 시간을 확정하고 상태 확인'::text, now() + interval '1 day', 'attention'::text, 'high'::text, '우선 연락 필요'::text)
  ) as rows(mentee_name, title, summary, due_at, status, priority, mentor_feedback)
),
mentee_map as (
  select cm.id, cm.display_name, cm.coach_user_id
  from public.coach_mentees cm
  join target_coach tc on tc.user_id = cm.coach_user_id
  where cm.is_active = true
)
insert into public.coach_mentoring_followups (
  coach_user_id,
  mentee_id,
  title,
  summary,
  due_at,
  status,
  priority,
  mentor_feedback
)
select
  tc.user_id,
  mm.id,
  seed.title,
  seed.summary,
  seed.due_at,
  seed.status,
  seed.priority,
  seed.mentor_feedback
from target_coach tc
join seed on true
join mentee_map mm on mm.coach_user_id = tc.user_id and mm.display_name = seed.mentee_name
where not exists (
  select 1
  from public.coach_mentoring_followups f
  where f.coach_user_id = tc.user_id
    and f.title = seed.title
    and f.status <> 'done'
);

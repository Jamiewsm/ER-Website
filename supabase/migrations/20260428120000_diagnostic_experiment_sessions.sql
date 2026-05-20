-- 실험용 적응형 진단 응답 저장 (사전 초대·실명 동의 참가자 전용)
-- 적용: Supabase SQL Editor 또는 `supabase db push`

create table if not exists public.diagnostic_experiment_sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  participant_name text not null,
  consent_version text not null default '2026-04-28',
  consent_accepted boolean not null default true,
  lang text not null default 'ko',
  responses jsonb not null default '{}'::jsonb,
  scores jsonb not null default '{}'::jsonb,
  top3 jsonb,
  result_summary jsonb,
  tie_break_log jsonb,
  evidence jsonb,
  self_assessment text,
  self_reported_core text,
  self_reported_subtype text,
  self_reported_wing text,
  self_note text,
  user_agent text
);

alter table public.diagnostic_experiment_sessions
  add column if not exists self_reported_core text;

alter table public.diagnostic_experiment_sessions
  add column if not exists self_reported_subtype text;

alter table public.diagnostic_experiment_sessions
  add column if not exists self_reported_wing text;

create index if not exists diagnostic_experiment_sessions_created_at_idx
  on public.diagnostic_experiment_sessions (created_at desc);

comment on table public.diagnostic_experiment_sessions is
  'Pre-launch Enneagram diagnostic experiment payloads; PII (real names). RLS: anon insert only.';

alter table public.diagnostic_experiment_sessions enable row level security;

-- 익명(미로그인) 참가자도 제출 가능. 공개 사이트에 쓰지 말 것 — URL experiment=1 로만 안내.
drop policy if exists "diagnostic_experiment_anon_insert" on public.diagnostic_experiment_sessions;
create policy "diagnostic_experiment_anon_insert"
  on public.diagnostic_experiment_sessions
  for insert
  to anon
  with check (
    consent_accepted = true
    and length(trim(participant_name)) >= 1
    and length(trim(participant_name)) <= 200
    and coalesce(jsonb_typeof(responses), 'object') = 'object'
  );

drop policy if exists "diagnostic_experiment_authenticated_insert" on public.diagnostic_experiment_sessions;
create policy "diagnostic_experiment_authenticated_insert"
  on public.diagnostic_experiment_sessions
  for insert
  to authenticated
  with check (
    consent_accepted = true
    and length(trim(participant_name)) >= 1
    and length(trim(participant_name)) <= 200
    and coalesce(jsonb_typeof(responses), 'object') = 'object'
  );

-- anon/authenticated 일반 사용자는 조회 불가 (대시보드·service role로만 확인)

grant insert on public.diagnostic_experiment_sessions to anon;
grant insert on public.diagnostic_experiment_sessions to authenticated;

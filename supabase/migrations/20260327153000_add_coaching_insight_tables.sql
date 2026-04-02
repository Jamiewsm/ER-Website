-- Coach portal: coaching insight dashboard schema
-- Safe to run multiple times.

alter table if exists public.coach_mentees
  add column if not exists enneagram_core text,
  add column if not exists enneagram_wing text,
  add column if not exists subtype_primary text,
  add column if not exists subtype_secondary text;

create table if not exists public.coach_mentee_insights (
  id uuid primary key default gen_random_uuid(),
  coach_user_id uuid not null references auth.users(id) on delete cascade,
  mentee_id uuid not null references public.coach_mentees(id) on delete cascade,
  week_key text not null,
  key_pattern text,
  defense_pattern text,
  current_interpretation text,
  relational_tension text,
  suggested_focus text,
  urgency_level text not null default 'attention' check (urgency_level in ('risk', 'attention', 'stable')),
  next_action text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (coach_user_id, mentee_id, week_key)
);

create table if not exists public.coach_mentoring_weekly_checklists (
  id uuid primary key default gen_random_uuid(),
  coach_user_id uuid not null references auth.users(id) on delete cascade,
  mentee_id uuid not null references public.coach_mentees(id) on delete cascade,
  week_key text not null,
  check_type_confirmed boolean not null default false,
  check_homework_reviewed boolean not null default false,
  check_pattern_logged boolean not null default false,
  check_next_question_set boolean not null default false,
  check_followup_registered boolean not null default false,
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (coach_user_id, mentee_id, week_key)
);

drop trigger if exists trg_coach_mentee_insights_updated_at on public.coach_mentee_insights;
create trigger trg_coach_mentee_insights_updated_at
before update on public.coach_mentee_insights
for each row execute function public.set_updated_at();

drop trigger if exists trg_coach_mentoring_weekly_checklists_updated_at on public.coach_mentoring_weekly_checklists;
create trigger trg_coach_mentoring_weekly_checklists_updated_at
before update on public.coach_mentoring_weekly_checklists
for each row execute function public.set_updated_at();

alter table public.coach_mentee_insights enable row level security;
alter table public.coach_mentoring_weekly_checklists enable row level security;

drop policy if exists "coaches can read own mentee insights" on public.coach_mentee_insights;
create policy "coaches can read own mentee insights"
on public.coach_mentee_insights
for select
using (
  public.is_active_coach(auth.uid())
  and (coach_user_id = auth.uid() or public.is_head_coach(auth.uid()))
);

drop policy if exists "coaches can write own mentee insights" on public.coach_mentee_insights;
create policy "coaches can write own mentee insights"
on public.coach_mentee_insights
for all
using (
  public.is_active_coach(auth.uid())
  and (coach_user_id = auth.uid() or public.is_head_coach(auth.uid()))
)
with check (
  public.is_active_coach(auth.uid())
  and (coach_user_id = auth.uid() or public.is_head_coach(auth.uid()))
);

drop policy if exists "coaches can read own weekly checklists" on public.coach_mentoring_weekly_checklists;
create policy "coaches can read own weekly checklists"
on public.coach_mentoring_weekly_checklists
for select
using (
  public.is_active_coach(auth.uid())
  and (coach_user_id = auth.uid() or public.is_head_coach(auth.uid()))
);

drop policy if exists "coaches can write own weekly checklists" on public.coach_mentoring_weekly_checklists;
create policy "coaches can write own weekly checklists"
on public.coach_mentoring_weekly_checklists
for all
using (
  public.is_active_coach(auth.uid())
  and (coach_user_id = auth.uid() or public.is_head_coach(auth.uid()))
)
with check (
  public.is_active_coach(auth.uid())
  and (coach_user_id = auth.uid() or public.is_head_coach(auth.uid()))
);

-- Coach portal: training progress / mentees / mentoring follow-ups
-- Safe to run multiple times.

create table if not exists public.coach_training_progress (
  id uuid primary key default gen_random_uuid(),
  coach_user_id uuid not null references auth.users(id) on delete cascade,
  track_key text not null check (track_key in ('formation', 'instructor', 'coaching', 'practicum')),
  month_key text not null,
  required_count integer not null default 1,
  completed_count integer not null default 0,
  latest_submission_title text,
  latest_submission_at timestamptz,
  next_deadline timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (coach_user_id, track_key, month_key)
);

create table if not exists public.coach_mentees (
  id uuid primary key default gen_random_uuid(),
  coach_user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  risk_level text not null default 'normal' check (risk_level in ('normal', 'attention', 'high')),
  status text not null default 'active' check (status in ('active', 'paused', 'completed')),
  next_session_at timestamptz,
  is_active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.coach_mentoring_followups (
  id uuid primary key default gen_random_uuid(),
  coach_user_id uuid not null references auth.users(id) on delete cascade,
  mentee_id uuid references public.coach_mentees(id) on delete set null,
  title text not null,
  summary text,
  due_at timestamptz,
  status text not null default 'pending' check (status in ('pending', 'attention', 'done')),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high')),
  mentor_feedback text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_coach_training_progress_updated_at on public.coach_training_progress;
create trigger trg_coach_training_progress_updated_at
before update on public.coach_training_progress
for each row execute function public.set_updated_at();

drop trigger if exists trg_coach_mentees_updated_at on public.coach_mentees;
create trigger trg_coach_mentees_updated_at
before update on public.coach_mentees
for each row execute function public.set_updated_at();

drop trigger if exists trg_coach_mentoring_followups_updated_at on public.coach_mentoring_followups;
create trigger trg_coach_mentoring_followups_updated_at
before update on public.coach_mentoring_followups
for each row execute function public.set_updated_at();

alter table public.coach_training_progress enable row level security;
alter table public.coach_mentees enable row level security;
alter table public.coach_mentoring_followups enable row level security;

drop policy if exists "coaches can read own training progress" on public.coach_training_progress;
create policy "coaches can read own training progress"
on public.coach_training_progress
for select
using (public.is_active_coach(auth.uid()) and (coach_user_id = auth.uid() or public.is_head_coach(auth.uid())));

drop policy if exists "coaches can write own training progress" on public.coach_training_progress;
create policy "coaches can write own training progress"
on public.coach_training_progress
for all
using (public.is_active_coach(auth.uid()) and (coach_user_id = auth.uid() or public.is_head_coach(auth.uid())))
with check (public.is_active_coach(auth.uid()) and (coach_user_id = auth.uid() or public.is_head_coach(auth.uid())));

drop policy if exists "coaches can read own mentees" on public.coach_mentees;
create policy "coaches can read own mentees"
on public.coach_mentees
for select
using (public.is_active_coach(auth.uid()) and (coach_user_id = auth.uid() or public.is_head_coach(auth.uid())));

drop policy if exists "coaches can write own mentees" on public.coach_mentees;
create policy "coaches can write own mentees"
on public.coach_mentees
for all
using (public.is_active_coach(auth.uid()) and (coach_user_id = auth.uid() or public.is_head_coach(auth.uid())))
with check (public.is_active_coach(auth.uid()) and (coach_user_id = auth.uid() or public.is_head_coach(auth.uid())));

drop policy if exists "coaches can read own followups" on public.coach_mentoring_followups;
create policy "coaches can read own followups"
on public.coach_mentoring_followups
for select
using (public.is_active_coach(auth.uid()) and (coach_user_id = auth.uid() or public.is_head_coach(auth.uid())));

drop policy if exists "coaches can write own followups" on public.coach_mentoring_followups;
create policy "coaches can write own followups"
on public.coach_mentoring_followups
for all
using (public.is_active_coach(auth.uid()) and (coach_user_id = auth.uid() or public.is_head_coach(auth.uid())))
with check (public.is_active_coach(auth.uid()) and (coach_user_id = auth.uid() or public.is_head_coach(auth.uid())));


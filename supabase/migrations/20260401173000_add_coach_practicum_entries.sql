-- ER Coach Portal v2: Practicum entry model + report linkage
-- Safe to run multiple times.

create table if not exists public.coach_practicum_entries (
  id uuid primary key default gen_random_uuid(),
  coach_user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('mentoring', 'study_lead', 'typing', 'co_teaching', 'observation', 'short_practicum')),
  title text not null,
  description text,
  cadence text not null default 'weekly' check (cadence in ('weekly', 'monthly', 'adhoc')),
  is_active boolean not null default true,
  start_date date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_coach_practicum_entries_owner
  on public.coach_practicum_entries (coach_user_id, is_active, created_at desc);

drop trigger if exists trg_coach_practicum_entries_updated_at on public.coach_practicum_entries;
create trigger trg_coach_practicum_entries_updated_at
before update on public.coach_practicum_entries
for each row execute function public.set_updated_at();

alter table public.coach_practicum_entries enable row level security;

drop policy if exists "coaches can read own practicum entries" on public.coach_practicum_entries;
create policy "coaches can read own practicum entries"
on public.coach_practicum_entries
for select
using (
  public.is_active_coach(auth.uid())
  and (
    coach_user_id = auth.uid()
    or public.is_head_coach(auth.uid())
  )
);

drop policy if exists "coaches can insert own practicum entries" on public.coach_practicum_entries;
create policy "coaches can insert own practicum entries"
on public.coach_practicum_entries
for insert
with check (
  public.is_active_coach(auth.uid())
  and coach_user_id = auth.uid()
);

drop policy if exists "coaches can update own practicum entries" on public.coach_practicum_entries;
create policy "coaches can update own practicum entries"
on public.coach_practicum_entries
for update
using (
  public.is_active_coach(auth.uid())
  and (
    coach_user_id = auth.uid()
    or public.is_head_coach(auth.uid())
  )
)
with check (
  public.is_active_coach(auth.uid())
  and (
    coach_user_id = auth.uid()
    or public.is_head_coach(auth.uid())
  )
);

drop policy if exists "coaches can delete own practicum entries" on public.coach_practicum_entries;
create policy "coaches can delete own practicum entries"
on public.coach_practicum_entries
for delete
using (
  public.is_active_coach(auth.uid())
  and (
    coach_user_id = auth.uid()
    or public.is_head_coach(auth.uid())
  )
);

alter table public.coach_tasks
  add column if not exists practicum_entry_id uuid references public.coach_practicum_entries(id) on delete set null;

alter table public.coach_session_notes
  add column if not exists practicum_entry_id uuid references public.coach_practicum_entries(id) on delete set null;

alter table public.coach_typing_practicum_reports
  add column if not exists practicum_entry_id uuid references public.coach_practicum_entries(id) on delete set null;

create index if not exists idx_coach_tasks_practicum_entry
  on public.coach_tasks (practicum_entry_id, created_at desc);

create index if not exists idx_coach_session_notes_practicum_entry
  on public.coach_session_notes (practicum_entry_id, created_at desc);

create index if not exists idx_coach_typing_reports_practicum_entry
  on public.coach_typing_practicum_reports (practicum_entry_id, created_at desc);

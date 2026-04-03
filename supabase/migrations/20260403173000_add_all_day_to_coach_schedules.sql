alter table public.coach_schedules
  add column if not exists all_day boolean not null default false;

-- Allow active coaches to read mentee + weekly checklist rows
-- so submitted mentoring reports can be reviewed across coaches.

drop policy if exists "coaches can read own mentees" on public.coach_mentees;
create policy "coaches can read own mentees"
on public.coach_mentees
for select
using (
  public.is_active_coach(auth.uid())
);

drop policy if exists "coaches can read own weekly checklists" on public.coach_mentoring_weekly_checklists;
create policy "coaches can read own weekly checklists"
on public.coach_mentoring_weekly_checklists
for select
using (
  public.is_active_coach(auth.uid())
);

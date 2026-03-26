-- Allow head_coach to update/delete any material (while coaches keep owner scope)

create or replace function public.is_head_coach(_uid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.coach_profiles cp
    where cp.user_id = _uid
      and cp.role = 'head_coach'
      and cp.is_active = true
  );
$$;

drop policy if exists "coaches can update materials" on public.coach_materials;
create policy "coaches can update materials"
on public.coach_materials
for update
using (
  public.is_active_coach(auth.uid())
  and (
    uploaded_by = auth.uid()
    or public.is_head_coach(auth.uid())
  )
)
with check (
  public.is_active_coach(auth.uid())
  and (
    uploaded_by = auth.uid()
    or public.is_head_coach(auth.uid())
  )
);

drop policy if exists "coaches can delete materials" on public.coach_materials;
create policy "coaches can delete materials"
on public.coach_materials
for delete
using (
  public.is_active_coach(auth.uid())
  and (
    uploaded_by = auth.uid()
    or public.is_head_coach(auth.uid())
  )
);

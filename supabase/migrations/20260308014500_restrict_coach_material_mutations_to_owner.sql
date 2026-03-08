-- Restrict coach_materials update/delete to uploader only

drop policy if exists "coaches can update materials" on public.coach_materials;
create policy "coaches can update materials"
on public.coach_materials
for update
using (
  public.is_active_coach(auth.uid())
  and uploaded_by = auth.uid()
)
with check (
  public.is_active_coach(auth.uid())
  and uploaded_by = auth.uid()
);

drop policy if exists "coaches can delete materials" on public.coach_materials;
create policy "coaches can delete materials"
on public.coach_materials
for delete
using (
  public.is_active_coach(auth.uid())
  and uploaded_by = auth.uid()
);

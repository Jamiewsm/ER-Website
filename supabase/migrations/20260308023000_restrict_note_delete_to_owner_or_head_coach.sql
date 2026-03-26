-- Limit session note delete to uploader or head coach

drop policy if exists "coaches can delete session notes" on public.coach_session_notes;
create policy "coaches can delete session notes"
on public.coach_session_notes
for delete
using (
  public.is_active_coach(auth.uid())
  and (
    uploaded_by = auth.uid()
    or public.is_head_coach(auth.uid())
  )
);

-- 보고서(coach_tasks): 읽기는 전 코치 유지, 수정·삭제는 작성자 또는 헤드 코치만
-- 첨부(coach_task_files): 삭제는 업로더·헤드·해당 보고서 작성자만

drop policy if exists "coaches can update tasks" on public.coach_tasks;
create policy "coaches can update tasks"
on public.coach_tasks
for update
using (
  public.is_active_coach(auth.uid())
  and (
    created_by = auth.uid()
    or public.is_head_coach(auth.uid())
  )
)
with check (
  public.is_active_coach(auth.uid())
  and (
    created_by = auth.uid()
    or public.is_head_coach(auth.uid())
  )
);

drop policy if exists "coaches can delete tasks" on public.coach_tasks;
create policy "coaches can delete tasks"
on public.coach_tasks
for delete
using (
  public.is_active_coach(auth.uid())
  and (
    created_by = auth.uid()
    or public.is_head_coach(auth.uid())
  )
);

drop policy if exists "coaches can delete task files" on public.coach_task_files;
create policy "coaches can delete task files"
on public.coach_task_files
for delete
using (
  public.is_active_coach(auth.uid())
  and (
    uploaded_by = auth.uid()
    or public.is_head_coach(auth.uid())
    or exists (
      select 1
      from public.coach_tasks t
      where t.id = coach_task_files.task_id
        and t.created_by = auth.uid()
    )
  )
);

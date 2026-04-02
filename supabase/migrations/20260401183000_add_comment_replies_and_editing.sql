-- Coach portal comments: support threaded replies and edited marker
-- Safe to run multiple times.

alter table public.coach_post_comments
  add column if not exists parent_comment_id uuid;

alter table public.coach_post_comments
  add column if not exists edited_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'coach_post_comments_parent_comment_id_fkey'
  ) then
    alter table public.coach_post_comments
      add constraint coach_post_comments_parent_comment_id_fkey
      foreign key (parent_comment_id)
      references public.coach_post_comments(id)
      on delete cascade;
  end if;
end $$;

create index if not exists idx_coach_post_comments_parent
  on public.coach_post_comments (parent_comment_id, created_at);

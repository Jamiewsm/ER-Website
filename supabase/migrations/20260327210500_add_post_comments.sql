-- Coach portal: comments for all post detail items (schedule/task/note/material/followup)
-- Safe to run multiple times.

create table if not exists public.coach_post_comments (
  id uuid primary key default gen_random_uuid(),
  post_kind text not null check (post_kind in ('schedule', 'task', 'note', 'material', 'followup')),
  post_id text not null,
  comment_body text not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  author_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_coach_post_comments_post
  on public.coach_post_comments (post_kind, post_id, created_at);

create index if not exists idx_coach_post_comments_created_by
  on public.coach_post_comments (created_by);

drop trigger if exists trg_coach_post_comments_updated_at on public.coach_post_comments;
create trigger trg_coach_post_comments_updated_at
before update on public.coach_post_comments
for each row execute function public.set_updated_at();

alter table public.coach_post_comments enable row level security;

drop policy if exists "coaches can read comments" on public.coach_post_comments;
create policy "coaches can read comments"
on public.coach_post_comments
for select
using (public.is_active_coach(auth.uid()));

drop policy if exists "coaches can insert own comments" on public.coach_post_comments;
create policy "coaches can insert own comments"
on public.coach_post_comments
for insert
with check (
  public.is_active_coach(auth.uid())
  and created_by = auth.uid()
);

drop policy if exists "comment owner or head coach can update" on public.coach_post_comments;
create policy "comment owner or head coach can update"
on public.coach_post_comments
for update
using (
  public.is_active_coach(auth.uid())
  and (created_by = auth.uid() or public.is_head_coach(auth.uid()))
)
with check (
  public.is_active_coach(auth.uid())
  and (created_by = auth.uid() or public.is_head_coach(auth.uid()))
);

drop policy if exists "comment owner or head coach can delete" on public.coach_post_comments;
create policy "comment owner or head coach can delete"
on public.coach_post_comments
for delete
using (
  public.is_active_coach(auth.uid())
  and (created_by = auth.uid() or public.is_head_coach(auth.uid()))
);

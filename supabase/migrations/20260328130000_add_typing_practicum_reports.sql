-- Coach portal: add monthly typing practicum reports with attachment support
-- Safe to run multiple times.

create table if not exists public.coach_typing_practicum_reports (
  id uuid primary key default gen_random_uuid(),
  coach_user_id uuid not null references auth.users(id) on delete cascade,
  coach_display_name text not null,
  month_key text not null,
  participant_name text not null,
  participant_gender text,
  enneagram_base text,
  subtype_primary text,
  wing text,
  session_date date not null,
  session_time_text text,
  youtube_url text not null,
  report_body text,
  attachment_path text,
  attachment_name text,
  attachment_mime_type text,
  attachment_size_bytes bigint,
  review_status text not null default 'pending' check (review_status in ('pending', 'selected', 'reviewed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint coach_typing_practicum_reports_month_key_format_check
    check (month_key ~ '^[0-9]{4}-[0-9]{2}$'),
  constraint coach_typing_practicum_reports_report_input_check
    check (
      coalesce(nullif(trim(report_body), ''), '') <> ''
      or attachment_path is not null
    ),
  constraint coach_typing_practicum_reports_youtube_url_check
    check (youtube_url ~* '^https?://'),
  constraint coach_typing_practicum_reports_unique_month
    unique (coach_user_id, month_key)
);

create index if not exists idx_coach_typing_practicum_reports_month
  on public.coach_typing_practicum_reports (month_key desc, session_date desc);

create index if not exists idx_coach_typing_practicum_reports_coach
  on public.coach_typing_practicum_reports (coach_user_id, month_key desc);

drop trigger if exists trg_coach_typing_practicum_reports_updated_at on public.coach_typing_practicum_reports;
create trigger trg_coach_typing_practicum_reports_updated_at
before update on public.coach_typing_practicum_reports
for each row execute function public.set_updated_at();

alter table public.coach_typing_practicum_reports enable row level security;

drop policy if exists "coaches can read typing practicum reports" on public.coach_typing_practicum_reports;
create policy "coaches can read typing practicum reports"
on public.coach_typing_practicum_reports
for select
using (public.is_active_coach(auth.uid()));

drop policy if exists "coaches can insert own typing practicum reports" on public.coach_typing_practicum_reports;
create policy "coaches can insert own typing practicum reports"
on public.coach_typing_practicum_reports
for insert
with check (
  public.is_active_coach(auth.uid())
  and coach_user_id = auth.uid()
);

drop policy if exists "owner or head coach can update typing practicum reports" on public.coach_typing_practicum_reports;
create policy "owner or head coach can update typing practicum reports"
on public.coach_typing_practicum_reports
for update
using (
  public.is_active_coach(auth.uid())
  and (coach_user_id = auth.uid() or public.is_head_coach(auth.uid()))
)
with check (
  public.is_active_coach(auth.uid())
  and (coach_user_id = auth.uid() or public.is_head_coach(auth.uid()))
);

drop policy if exists "owner or head coach can delete typing practicum reports" on public.coach_typing_practicum_reports;
create policy "owner or head coach can delete typing practicum reports"
on public.coach_typing_practicum_reports
for delete
using (
  public.is_active_coach(auth.uid())
  and (coach_user_id = auth.uid() or public.is_head_coach(auth.uid()))
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'coach-typing-practicum',
  'coach-typing-practicum',
  false,
  104857600,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'image/png',
    'image/jpeg',
    'image/webp',
    'application/haansofthwp',
    'application/x-hwp',
    'application/zip'
  ]::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "coach typing practicum read" on storage.objects;
create policy "coach typing practicum read"
on storage.objects
for select
using (
  bucket_id = 'coach-typing-practicum'
  and public.is_active_coach(auth.uid())
);

drop policy if exists "coach typing practicum write" on storage.objects;
create policy "coach typing practicum write"
on storage.objects
for insert
with check (
  bucket_id = 'coach-typing-practicum'
  and public.is_active_coach(auth.uid())
);

drop policy if exists "coach typing practicum delete" on storage.objects;
create policy "coach typing practicum delete"
on storage.objects
for delete
using (
  bucket_id = 'coach-typing-practicum'
  and public.is_active_coach(auth.uid())
);

alter table public.coach_post_comments
  drop constraint if exists coach_post_comments_post_kind_check;

alter table public.coach_post_comments
  add constraint coach_post_comments_post_kind_check
  check (post_kind in ('schedule', 'task', 'note', 'material', 'followup', 'typing_practicum_report'));

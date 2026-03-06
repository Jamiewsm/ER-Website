create table if not exists public.coach_session_notes (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references public.coach_schedules(id) on delete cascade,
  title text not null,
  note_body text not null,
  attachment_path text,
  attachment_name text,
  attachment_mime_type text,
  attachment_size_bytes bigint,
  uploaded_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_coach_session_notes_updated_at on public.coach_session_notes;
create trigger trg_coach_session_notes_updated_at
before update on public.coach_session_notes
for each row execute function public.set_updated_at();

alter table public.coach_session_notes enable row level security;

drop policy if exists "coaches can read session notes" on public.coach_session_notes;
create policy "coaches can read session notes"
on public.coach_session_notes
for select
using (public.is_active_coach(auth.uid()));

drop policy if exists "coaches can write session notes" on public.coach_session_notes;
create policy "coaches can write session notes"
on public.coach_session_notes
for insert
with check (
  public.is_active_coach(auth.uid())
  and uploaded_by = auth.uid()
);

drop policy if exists "coaches can update session notes" on public.coach_session_notes;
create policy "coaches can update session notes"
on public.coach_session_notes
for update
using (public.is_active_coach(auth.uid()))
with check (public.is_active_coach(auth.uid()));

drop policy if exists "coaches can delete session notes" on public.coach_session_notes;
create policy "coaches can delete session notes"
on public.coach_session_notes
for delete
using (public.is_active_coach(auth.uid()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'coach-session-notes',
  'coach-session-notes',
  false,
  104857600,
  array[
    'application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain','text/csv',
    'image/png','image/jpeg','image/webp','image/gif',
    'video/mp4','video/quicktime','audio/mpeg','audio/wav','audio/x-m4a','audio/mp4','audio/aac'
  ]::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "coach session notes read" on storage.objects;
create policy "coach session notes read"
on storage.objects
for select
using (
  bucket_id = 'coach-session-notes'
  and public.is_active_coach(auth.uid())
);

drop policy if exists "coach session notes write" on storage.objects;
create policy "coach session notes write"
on storage.objects
for insert
with check (
  bucket_id = 'coach-session-notes'
  and public.is_active_coach(auth.uid())
);

drop policy if exists "coach session notes delete" on storage.objects;
create policy "coach session notes delete"
on storage.objects
for delete
using (
  bucket_id = 'coach-session-notes'
  and public.is_active_coach(auth.uid())
);

-- Coach profile avatars uploaded from coach app
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'coach-avatars',
  'coach-avatars',
  true,
  5242880,
  ARRAY['image/jpeg','image/png','image/webp','image/heic']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "coach avatars read" on storage.objects;
create policy "coach avatars read"
on storage.objects
for select
using (
  bucket_id = 'coach-avatars'
  and public.is_active_coach(auth.uid())
);

drop policy if exists "coach avatars write own" on storage.objects;
create policy "coach avatars write own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'coach-avatars'
  and public.is_active_coach(auth.uid())
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "coach avatars update own" on storage.objects;
create policy "coach avatars update own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'coach-avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'coach-avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "coach avatars delete own" on storage.objects;
create policy "coach avatars delete own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'coach-avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

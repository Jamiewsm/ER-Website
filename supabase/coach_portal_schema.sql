-- Coach portal schema for ER Website
-- Apply in Supabase SQL Editor

create extension if not exists pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'coach_role') THEN
    CREATE TYPE coach_role AS ENUM ('head_coach', 'coach');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'material_visibility') THEN
    CREATE TYPE material_visibility AS ENUM ('coaches_only');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
    CREATE TYPE task_status AS ENUM ('draft', 'published', 'archived');
  END IF;
END $$;

create table if not exists public.coach_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role coach_role not null default 'coach',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.coach_schedules (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  schedule_type text not null check (
    schedule_type in (
      'study',
      'training',
      'study_track',
      'spiritual_formation_track',
      'coaching_track',
      'practicum_track'
    )
  ),
  start_at timestamptz not null,
  end_at timestamptz not null,
  location text,
  notes text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.coach_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  due_at timestamptz,
  week_label text,
  status task_status not null default 'published',
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.coach_task_files (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.coach_tasks(id) on delete cascade,
  storage_path text not null,
  original_name text not null,
  mime_type text,
  size_bytes bigint,
  uploaded_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.coach_materials (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null default 'general',
  visibility material_visibility not null default 'coaches_only',
  storage_path text not null,
  original_name text not null,
  mime_type text,
  size_bytes bigint,
  uploaded_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_active_coach(_uid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.coach_profiles cp
    where cp.user_id = _uid
      and cp.is_active = true
  );
$$;

create or replace function public.require_head_coach()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.coach_profiles
    where user_id = auth.uid()
      and role = 'head_coach'
      and is_active = true
  ) then
    raise exception 'forbidden'
      using errcode = '42501';
  end if;
end;
$$;

create or replace function public.admin_list_coach_candidates()
returns table (
  user_id uuid,
  email text,
  created_at timestamptz,
  is_coach boolean,
  display_name text,
  role coach_role,
  is_active boolean
)
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  perform public.require_head_coach();

  return query
  select
    au.id,
    au.email::text,
    au.created_at,
    (cp.user_id is not null and cp.is_active = true) as is_coach,
    cp.display_name,
    cp.role,
    cp.is_active
  from auth.users au
  left join public.coach_profiles cp
    on cp.user_id = au.id
  where au.email is not null
  order by
    case when cp.user_id is not null and cp.is_active = true then 0 else 1 end,
    au.created_at desc;
end;
$$;

create or replace function public.admin_upsert_coach_profile(
  p_user_id uuid,
  p_display_name text,
  p_role coach_role default 'coach',
  p_is_active boolean default true
)
returns public.coach_profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  result_row public.coach_profiles;
begin
  perform public.require_head_coach();

  insert into public.coach_profiles (user_id, display_name, role, is_active)
  values (
    p_user_id,
    coalesce(nullif(trim(p_display_name), ''), 'Coach'),
    p_role,
    p_is_active
  )
  on conflict (user_id)
  do update set
    display_name = excluded.display_name,
    role = excluded.role,
    is_active = excluded.is_active,
    updated_at = now()
  returning * into result_row;

  return result_row;
end;
$$;

create or replace function public.admin_disable_coach_profile(p_user_id uuid)
returns public.coach_profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  result_row public.coach_profiles;
begin
  perform public.require_head_coach();

  update public.coach_profiles
  set is_active = false,
      updated_at = now()
  where user_id = p_user_id
  returning * into result_row;

  if result_row.user_id is null then
    raise exception 'coach profile not found'
      using errcode = 'P0002';
  end if;

  return result_row;
end;
$$;

DROP TRIGGER IF EXISTS trg_coach_profiles_updated_at ON public.coach_profiles;
CREATE TRIGGER trg_coach_profiles_updated_at
BEFORE UPDATE ON public.coach_profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_coach_schedules_updated_at ON public.coach_schedules;
CREATE TRIGGER trg_coach_schedules_updated_at
BEFORE UPDATE ON public.coach_schedules
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_coach_tasks_updated_at ON public.coach_tasks;
CREATE TRIGGER trg_coach_tasks_updated_at
BEFORE UPDATE ON public.coach_tasks
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_coach_materials_updated_at ON public.coach_materials;
CREATE TRIGGER trg_coach_materials_updated_at
BEFORE UPDATE ON public.coach_materials
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_coach_session_notes_updated_at ON public.coach_session_notes;
CREATE TRIGGER trg_coach_session_notes_updated_at
BEFORE UPDATE ON public.coach_session_notes
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.coach_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_task_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_session_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "coaches can view profiles" ON public.coach_profiles;
DROP POLICY IF EXISTS "users can view own profile" ON public.coach_profiles;
CREATE POLICY "users can view own profile"
ON public.coach_profiles
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "head coach can manage profiles" ON public.coach_profiles;
DROP POLICY IF EXISTS "head coach can insert profiles" ON public.coach_profiles;
DROP POLICY IF EXISTS "head coach can update profiles" ON public.coach_profiles;
DROP POLICY IF EXISTS "head coach can delete profiles" ON public.coach_profiles;

revoke all on function public.require_head_coach() from public;
revoke all on function public.admin_list_coach_candidates() from public;
revoke all on function public.admin_upsert_coach_profile(uuid, text, coach_role, boolean) from public;
revoke all on function public.admin_disable_coach_profile(uuid) from public;

grant execute on function public.admin_list_coach_candidates() to authenticated;
grant execute on function public.admin_upsert_coach_profile(uuid, text, coach_role, boolean) to authenticated;
grant execute on function public.admin_disable_coach_profile(uuid) to authenticated;

DROP POLICY IF EXISTS "coaches can read schedules" ON public.coach_schedules;
CREATE POLICY "coaches can read schedules"
ON public.coach_schedules
FOR SELECT
USING (public.is_active_coach(auth.uid()));

DROP POLICY IF EXISTS "coaches can write schedules" ON public.coach_schedules;
CREATE POLICY "coaches can write schedules"
ON public.coach_schedules
FOR INSERT
WITH CHECK (public.is_active_coach(auth.uid()) and created_by = auth.uid());

DROP POLICY IF EXISTS "coaches can update schedules" ON public.coach_schedules;
CREATE POLICY "coaches can update schedules"
ON public.coach_schedules
FOR UPDATE
USING (public.is_active_coach(auth.uid()))
WITH CHECK (public.is_active_coach(auth.uid()));

DROP POLICY IF EXISTS "coaches can delete schedules" ON public.coach_schedules;
CREATE POLICY "coaches can delete schedules"
ON public.coach_schedules
FOR DELETE
USING (public.is_active_coach(auth.uid()));

DROP POLICY IF EXISTS "coaches can read tasks" ON public.coach_tasks;
CREATE POLICY "coaches can read tasks"
ON public.coach_tasks
FOR SELECT
USING (public.is_active_coach(auth.uid()));

DROP POLICY IF EXISTS "coaches can write tasks" ON public.coach_tasks;
CREATE POLICY "coaches can write tasks"
ON public.coach_tasks
FOR INSERT
WITH CHECK (public.is_active_coach(auth.uid()) and created_by = auth.uid());

DROP POLICY IF EXISTS "coaches can update tasks" ON public.coach_tasks;
CREATE POLICY "coaches can update tasks"
ON public.coach_tasks
FOR UPDATE
USING (public.is_active_coach(auth.uid()))
WITH CHECK (public.is_active_coach(auth.uid()));

DROP POLICY IF EXISTS "coaches can delete tasks" ON public.coach_tasks;
CREATE POLICY "coaches can delete tasks"
ON public.coach_tasks
FOR DELETE
USING (public.is_active_coach(auth.uid()));

DROP POLICY IF EXISTS "coaches can read task files" ON public.coach_task_files;
CREATE POLICY "coaches can read task files"
ON public.coach_task_files
FOR SELECT
USING (public.is_active_coach(auth.uid()));

DROP POLICY IF EXISTS "coaches can write task files" ON public.coach_task_files;
CREATE POLICY "coaches can write task files"
ON public.coach_task_files
FOR INSERT
WITH CHECK (public.is_active_coach(auth.uid()) and uploaded_by = auth.uid());

DROP POLICY IF EXISTS "coaches can delete task files" ON public.coach_task_files;
CREATE POLICY "coaches can delete task files"
ON public.coach_task_files
FOR DELETE
USING (public.is_active_coach(auth.uid()));

DROP POLICY IF EXISTS "coaches can read materials" ON public.coach_materials;
CREATE POLICY "coaches can read materials"
ON public.coach_materials
FOR SELECT
USING (public.is_active_coach(auth.uid()));

DROP POLICY IF EXISTS "coaches can write materials" ON public.coach_materials;
CREATE POLICY "coaches can write materials"
ON public.coach_materials
FOR INSERT
WITH CHECK (public.is_active_coach(auth.uid()) and uploaded_by = auth.uid());

DROP POLICY IF EXISTS "coaches can update materials" ON public.coach_materials;
CREATE POLICY "coaches can update materials"
ON public.coach_materials
FOR UPDATE
USING (public.is_active_coach(auth.uid()))
WITH CHECK (public.is_active_coach(auth.uid()));

DROP POLICY IF EXISTS "coaches can delete materials" ON public.coach_materials;
CREATE POLICY "coaches can delete materials"
ON public.coach_materials
FOR DELETE
USING (public.is_active_coach(auth.uid()));

DROP POLICY IF EXISTS "coaches can read session notes" ON public.coach_session_notes;
CREATE POLICY "coaches can read session notes"
ON public.coach_session_notes
FOR SELECT
USING (public.is_active_coach(auth.uid()));

DROP POLICY IF EXISTS "coaches can write session notes" ON public.coach_session_notes;
CREATE POLICY "coaches can write session notes"
ON public.coach_session_notes
FOR INSERT
WITH CHECK (public.is_active_coach(auth.uid()) and uploaded_by = auth.uid());

DROP POLICY IF EXISTS "coaches can update session notes" ON public.coach_session_notes;
CREATE POLICY "coaches can update session notes"
ON public.coach_session_notes
FOR UPDATE
USING (public.is_active_coach(auth.uid()))
WITH CHECK (public.is_active_coach(auth.uid()));

DROP POLICY IF EXISTS "coaches can delete session notes" ON public.coach_session_notes;
CREATE POLICY "coaches can delete session notes"
ON public.coach_session_notes
FOR DELETE
USING (public.is_active_coach(auth.uid()));

-- Storage buckets (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'coach-task-files',
  'coach-task-files',
  false,
  104857600,
  ARRAY[
    'application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/haansofthwp','application/x-hwp','application/haansofthwpx','application/x-hwpx',
    'text/plain','text/csv','application/zip','application/x-zip-compressed',
    'image/png','image/jpeg','image/webp','image/gif',
    'video/mp4','video/quicktime','audio/mpeg','audio/wav','audio/x-m4a','audio/mp4','audio/aac'
  ]::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'coach-materials',
  'coach-materials',
  false,
  104857600,
  ARRAY[
    'application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/haansofthwp','application/x-hwp','application/haansofthwpx','application/x-hwpx',
    'text/plain','text/csv','application/zip','application/x-zip-compressed',
    'image/png','image/jpeg','image/webp','image/gif',
    'video/mp4','video/quicktime','audio/mpeg','audio/wav','audio/x-m4a','audio/mp4','audio/aac'
  ]::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'coach-session-notes',
  'coach-session-notes',
  false,
  104857600,
  ARRAY[
    'application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain','text/csv',
    'image/png','image/jpeg','image/webp','image/gif',
    'video/mp4','video/quicktime','audio/mpeg','audio/wav','audio/x-m4a','audio/mp4','audio/aac'
  ]::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Storage policies for coach-task-files
DROP POLICY IF EXISTS "coach task files read" ON storage.objects;
CREATE POLICY "coach task files read"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'coach-task-files'
  AND public.is_active_coach(auth.uid())
);

DROP POLICY IF EXISTS "coach task files write" ON storage.objects;
CREATE POLICY "coach task files write"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'coach-task-files'
  AND public.is_active_coach(auth.uid())
);

DROP POLICY IF EXISTS "coach task files delete" ON storage.objects;
CREATE POLICY "coach task files delete"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'coach-task-files'
  AND public.is_active_coach(auth.uid())
);

-- Storage policies for coach-materials
DROP POLICY IF EXISTS "coach materials read" ON storage.objects;
CREATE POLICY "coach materials read"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'coach-materials'
  AND public.is_active_coach(auth.uid())
);

DROP POLICY IF EXISTS "coach materials write" ON storage.objects;
CREATE POLICY "coach materials write"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'coach-materials'
  AND public.is_active_coach(auth.uid())
);

DROP POLICY IF EXISTS "coach materials delete" ON storage.objects;
CREATE POLICY "coach materials delete"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'coach-materials'
  AND public.is_active_coach(auth.uid())
);

DROP POLICY IF EXISTS "coach session notes read" ON storage.objects;
CREATE POLICY "coach session notes read"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'coach-session-notes'
  AND public.is_active_coach(auth.uid())
);

DROP POLICY IF EXISTS "coach session notes write" ON storage.objects;
CREATE POLICY "coach session notes write"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'coach-session-notes'
  AND public.is_active_coach(auth.uid())
);

DROP POLICY IF EXISTS "coach session notes delete" ON storage.objects;
CREATE POLICY "coach session notes delete"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'coach-session-notes'
  AND public.is_active_coach(auth.uid())
);

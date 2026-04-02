-- Coach directory: avatar URL + peer profile read for names/photos in the coach web app

alter table public.coach_profiles
  add column if not exists avatar_url text;

comment on column public.coach_profiles.avatar_url is 'Optional HTTPS URL for profile photo (e.g. OAuth picture).';

-- Active coaches can read other active coaches'' public directory fields (display name, avatar, role for UI).
drop policy if exists "active coaches can read peer profiles" on public.coach_profiles;
create policy "active coaches can read peer profiles"
on public.coach_profiles
for select
to authenticated
using (
  public.is_active_coach(auth.uid())
  and public.coach_profiles.is_active = true
);

-- Safe avatar sync (only updates avatar_url for auth.uid(); bypasses broad UPDATE RLS).
create or replace function public.coach_sync_my_avatar(p_avatar_url text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  next_url text;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  if not public.is_active_coach(auth.uid()) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  next_url := nullif(left(trim(coalesce(p_avatar_url, '')), 2048), '');
  if next_url is not null and next_url !~* '^https?://' then
    raise exception 'invalid avatar url';
  end if;
  update public.coach_profiles
  set
    avatar_url = next_url,
    updated_at = now()
  where user_id = auth.uid();
end;
$$;

revoke all on function public.coach_sync_my_avatar(text) from public;
grant execute on function public.coach_sync_my_avatar(text) to authenticated;

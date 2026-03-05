-- Add admin RPC helpers for approving and managing coach accounts.

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

revoke all on function public.require_head_coach() from public;
revoke all on function public.admin_list_coach_candidates() from public;
revoke all on function public.admin_upsert_coach_profile(uuid, text, coach_role, boolean) from public;
revoke all on function public.admin_disable_coach_profile(uuid) from public;

grant execute on function public.admin_list_coach_candidates() to authenticated;
grant execute on function public.admin_upsert_coach_profile(uuid, text, coach_role, boolean) to authenticated;
grant execute on function public.admin_disable_coach_profile(uuid) to authenticated;

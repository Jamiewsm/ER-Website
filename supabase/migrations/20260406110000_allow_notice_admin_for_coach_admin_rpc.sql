-- Allow site admin email to pass coach admin RPC guard as well as head coach.
create or replace function public.require_head_coach()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not (
    exists (
      select 1
      from public.coach_profiles
      where user_id = auth.uid()
        and role = 'head_coach'
        and is_active = true
    )
    or lower(coalesce(auth.jwt()->>'email','')) = 'campus.12000@gmail.com'
  ) then
    raise exception 'forbidden'
      using errcode = '42501';
  end if;
end;
$$;

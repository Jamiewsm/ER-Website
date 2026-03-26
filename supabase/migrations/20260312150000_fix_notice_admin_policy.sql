create or replace function public.is_notice_admin()
returns boolean
language sql
stable
as $$
  select (
    lower(
      coalesce(
        auth.jwt()->>'email',
        auth.jwt()->'user_metadata'->>'email',
        auth.jwt()->'app_metadata'->>'email',
        ''
      )
    ) = 'campus.12000@gmail.com'
  ) or public.is_head_coach(auth.uid());
$$;

drop policy if exists "admins can insert notices" on public.public_notices;
create policy "admins can insert notices"
on public.public_notices
for insert
with check (public.is_notice_admin());

drop policy if exists "admins can update notices" on public.public_notices;
create policy "admins can update notices"
on public.public_notices
for update
using (public.is_notice_admin())
with check (public.is_notice_admin());

drop policy if exists "admins can delete notices" on public.public_notices;
create policy "admins can delete notices"
on public.public_notices
for delete
using (public.is_notice_admin());

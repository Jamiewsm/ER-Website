-- Remove email-based coach profile admin policies.
-- Head coach management should go through role-based security definer RPCs only.

drop policy if exists "head coach can manage profiles" on public.coach_profiles;
drop policy if exists "head coach can insert profiles" on public.coach_profiles;
drop policy if exists "head coach can update profiles" on public.coach_profiles;
drop policy if exists "head coach can delete profiles" on public.coach_profiles;

-- Fix wrong coach display name for snowdrop0228@gmail.com
update public.coach_profiles cp
set display_name = '정경하',
    updated_at = now()
from auth.users au
where cp.user_id = au.id
  and lower(au.email) = lower('snowdrop0228@gmail.com')
  and cp.display_name is distinct from '정경하';

// 헤드 코치 JWT·프로필 검증
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { corsHeaders } from './cors.ts';

export async function requireHeadCoach(req: Request, supabaseUrl: string, anonKey: string) {
  const authHeader = req.headers.get('Authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    throw new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) {
    throw new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { data: profile, error: profileError } = await userClient
    .from('coach_profiles')
    .select('role, is_active')
    .eq('user_id', userData.user.id)
    .maybeSingle();

  if (profileError || !profile || profile.role !== 'head_coach' || !profile.is_active) {
    throw new Response(JSON.stringify({ error: 'forbidden' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return userData.user;
}

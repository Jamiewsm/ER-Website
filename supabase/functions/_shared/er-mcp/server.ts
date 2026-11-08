import { createMcpHandler, McpServer } from 'npm:@modelcontextprotocol/server@2.2.0';
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2.117.2';
import { withOAuthProtectedResource, withSupabase } from 'npm:@supabase/server@1.8.1';
import { z } from 'npm:zod@4.6.5';
import { registerCoachTools, registerEducationTools, registerWebsiteTools } from './operations.ts';

type Domain = 'education' | 'coach' | 'website';

export function makeErMcpServer(domain: Domain, supabase: SupabaseClient) {
  const server = new McpServer({ name: `er-${domain}`, version: '0.1.0' }, {
    instructions: 'Use only the authenticated user\'s permissions. Read the relevant record before changing it. Drafts stay private. Publishing, deletion, payment confirmation and email sending are not available through this server.',
  });
  server.registerTool('get_profile', {
    title: '연결 계정 확인',
    description: '이 연결에 로그인한 ER 계정의 안정적인 ID와 표시용 이메일을 확인합니다.',
    inputSchema: z.object({}),
    outputSchema: z.object({ id: z.string().min(1), email: z.string().optional() }),
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    _meta: { 'openai/profile': true },
  }, async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw new Error('로그인이 필요합니다.');
    const profile = { id: data.user.id, ...(data.user.email ? { email: data.user.email } : {}) };
    return { structuredContent: profile, content: [{ type: 'text', text: JSON.stringify(profile) }] };
  });
  if (domain === 'education') registerEducationTools(server, supabase);
  else if (domain === 'coach') registerCoachTools(server, supabase);
  else registerWebsiteTools(server, supabase);
  return server;
}

/** Each HTTP request receives a fresh RLS-scoped client; no service role key is used. */
export function serveErMcp(domain: Domain) {
  Deno.serve(withOAuthProtectedResource(withSupabase({ auth: 'user' }, async (request, { supabase }) => {
    const handler = createMcpHandler(() => makeErMcpServer(domain, supabase));
    return handler.fetch(request);
  })));
}

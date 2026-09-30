import { registerCoachTools, registerEducationTools, registerWebsiteTools } from './operations.ts';

function registry() {
  const tools = new Map<string, { definition: any; handler: (input: any) => Promise<any> }>();
  return {
    tools,
    registerTool(name: string, definition: any, handler: (input: any) => Promise<any>) {
      tools.set(name, { definition, handler });
    },
  };
}

Deno.test('education draft stays unpublished and uses the caller-scoped client', async () => {
  const calls: unknown[] = [];
  const db = {
    from(table: string) {
      return {
        insert(value: unknown) {
          calls.push({ table, value });
          return { select() { return { single: async () => ({ data: { id: 'draft-id', ...value as object }, error: null }) }; } };
        },
      };
    },
  };
  const server = registry();
  registerEducationTools(server, db as any);
  const tool = server.tools.get('education_create_draft_post')!;
  const input = tool.definition.inputSchema.parse({
    class_id: '00000000-0000-4000-8000-000000000001', title: '공지 초안', body: '내용',
  });
  const output = await tool.handler(input);
  if (JSON.stringify(calls) !== JSON.stringify([{ table: 'edu_posts', value: {
    class_id: input.class_id, title: input.title, body: input.body, publish_at: null,
  } }])) throw new Error('draft publish_at must remain null');
  if (!output.content[0].text.includes('draft-id')) throw new Error('draft ID missing');
});

Deno.test('website status tool calls only the guarded RPC and rejects confirmation', async () => {
  let called: { name: string; args: unknown } | undefined;
  const server = registry();
  registerWebsiteTools(server, {
    rpc: async (name: string, args: unknown) => {
      called = { name, args };
      return { data: { id: 'application-id', status: 'contacted' }, error: null };
    },
  } as any);
  const tool = server.tools.get('website_update_application_status')!;
  const schema = tool.definition.inputSchema;
  const id = '00000000-0000-4000-8000-000000000001';
  for (const status of ['confirmed', 'cancelled', 'received']) {
    if (schema.safeParse({ id, status }).success) throw new Error(`${status} must not be accepted`);
  }
  if (!schema.safeParse({ id, status: 'contacted' }).success) throw new Error('contacted should be accepted');
  await tool.handler(schema.parse({ id, status: 'contacted' }));
  if (JSON.stringify(called) !== JSON.stringify({
    name: 'er_mcp_update_application_status', args: { p_id: id, p_status: 'contacted' },
  })) throw new Error('status must use the guarded MCP RPC');
});

Deno.test('coach draft tool cannot create a published task', async () => {
  let inserted: Record<string, unknown> | undefined;
  const db = {
    auth: { getUser: async () => ({ data: { user: { id: 'caller-id' } }, error: null }) },
    from: () => ({
      insert(value: Record<string, unknown>) {
        inserted = value;
        return { select: () => ({ single: async () => ({ data: value, error: null }) }) };
      },
    }),
  };
  const server = registry();
  registerCoachTools(server, db as any);
  await server.tools.get('coach_create_draft_task')!.handler({ title: '과제', description: '초안' });
  if (inserted?.status !== 'draft' || inserted?.created_by !== 'caller-id') {
    throw new Error('coach task must be an own draft');
  }
});

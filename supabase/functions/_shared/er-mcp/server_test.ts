import { createMcpHandler } from 'npm:@modelcontextprotocol/server@2.2.0';
import { makeErMcpServer } from './server.ts';

async function toolsFor(domain: 'education' | 'coach' | 'website') {
  const handler = createMcpHandler(() => makeErMcpServer(domain, {} as any));
  const request = new Request('http://localhost/mcp', {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} }),
  });
  const response = await handler.fetch(request);
  if (response.status !== 200) throw new Error(`MCP tools/list failed: ${response.status}`);
  const match = (await response.text()).match(/^data: (.+)$/m);
  if (!match) throw new Error('No MCP event data');
  return JSON.parse(match[1]).result.tools as { name: string; annotations?: { readOnlyHint?: boolean }; _meta?: Record<string, unknown> }[];
}

Deno.test('three endpoints advertise separate tool sets and an account profile', async () => {
  const education = await toolsFor('education');
  const coach = await toolsFor('coach');
  const website = await toolsFor('website');
  const names = (tools: { name: string }[]) => tools.map((tool) => tool.name);
  for (const tools of [education, coach, website]) {
    const profile = tools.find((tool) => tool.name === 'get_profile');
    if (profile?._meta?.['openai/profile'] !== true) throw new Error('profile metadata missing');
  }
  if (!names(education).includes('education_submissions') || names(education).includes('website_applications')) {
    throw new Error('education tools leaked across domains');
  }
  if (!names(coach).includes('coach_tasks') || names(coach).includes('education_submissions')) {
    throw new Error('coach tools leaked across domains');
  }
  if (!names(website).includes('website_applications') || names(website).includes('coach_tasks')) {
    throw new Error('website tools leaked across domains');
  }
  const write = education.find((tool) => tool.name === 'education_create_draft_post');
  if (write?.annotations?.readOnlyHint !== false) throw new Error('write tool mislabeled read-only');
});

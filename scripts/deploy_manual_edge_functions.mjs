#!/usr/bin/env node
// submit-application·notify-program-application Edge Function 배포
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PROJECT_REF = 'osdynbadhtfgoxilgmpy';
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
  console.error('SUPABASE_ACCESS_TOKEN required (supabase login or Dashboard → Account → Access Tokens)');
  process.exit(1);
}

const FUNCTIONS = ['submit-application', 'notify-program-application'];

for (const name of FUNCTIONS) {
  const payload = JSON.parse(
    readFileSync(join(ROOT, '.mcp-deploy-stripe', `${name}.json`), 'utf8'),
  );
  const body = {
    name: payload.name,
    entrypoint_path: payload.entrypoint_path,
    verify_jwt: payload.verify_jwt,
    files: payload.files,
  };

  const url = `https://api.supabase.com/v1/projects/${PROJECT_REF}/functions/deploy?slug=${encodeURIComponent(name)}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = text;
  }

  if (!response.ok) {
    console.error(`FAIL ${name}:`, response.status, parsed);
    process.exit(1);
  }

  console.log(`OK ${name}:`, typeof parsed === 'object' ? JSON.stringify(parsed) : parsed);
}

#!/usr/bin/env node
// PayPal Checkout Edge Function 3종 배포 (Management API)
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PROJECT_REF = 'osdynbadhtfgoxilgmpy';
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

const FUNCTIONS = [
  'notify-program-application',
  'paypal-webhook',
  'capture-paypal-order',
];

if (!ACCESS_TOKEN) {
  console.error('SUPABASE_ACCESS_TOKEN required');
  console.error('Dashboard → Account → Access Tokens 에서 발급 후 export SUPABASE_ACCESS_TOKEN=...');
  process.exit(1);
}

for (const name of FUNCTIONS) {
  const build = spawnSync('python3', [join(ROOT, 'scripts/build_mcp_deploy_from_disk.py'), name], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  if (build.status !== 0) {
    console.error(`build failed for ${name}:`, build.stderr || build.stdout);
    process.exit(1);
  }

  const payload = JSON.parse(build.stdout);
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

  console.log(`OK ${name}`);
}

console.log('Done. Webhook URL: https://osdynbadhtfgoxilgmpy.supabase.co/functions/v1/paypal-webhook');

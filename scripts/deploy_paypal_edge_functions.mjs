#!/usr/bin/env node
// PayPal Checkout Edge Function 3종 배포 (Management API, multipart zip)
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deployEdgeFunctionViaApi } from './deploy_edge_function_api.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
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
  try {
    await deployEdgeFunctionViaApi(ACCESS_TOKEN, payload);
    console.log(`OK ${name}`);
  } catch (err) {
    console.error(`FAIL ${name}:`, err.status || '', err.body || err.message);
    process.exit(1);
  }
}

console.log('Done. Webhook URL: https://osdynbadhtfgoxilgmpy.supabase.co/functions/v1/paypal-webhook');

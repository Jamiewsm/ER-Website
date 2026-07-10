#!/usr/bin/env node
// PayPal Checkout Edge Function 3종 배포 (Supabase CLI --use-api)
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PROJECT_REF = 'osdynbadhtfgoxilgmpy';
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

const FUNCTIONS = [
  { name: 'notify-program-application', noVerifyJwt: false },
  { name: 'paypal-webhook', noVerifyJwt: true },
  { name: 'capture-paypal-order', noVerifyJwt: true },
];

if (!ACCESS_TOKEN) {
  console.error('SUPABASE_ACCESS_TOKEN required');
  console.error('Dashboard → Account → Access Tokens 에서 발급 후 export SUPABASE_ACCESS_TOKEN=...');
  process.exit(1);
}

for (const fn of FUNCTIONS) {
  const args = [
    'supabase',
    'functions',
    'deploy',
    fn.name,
    '--project-ref',
    PROJECT_REF,
    '--use-api',
    '--yes',
  ];
  if (fn.noVerifyJwt) args.push('--no-verify-jwt');

  console.log(`Deploying ${fn.name}...`);
  const result = spawnSync('npx', args, {
    cwd: ROOT,
    encoding: 'utf8',
    env: { ...process.env, SUPABASE_ACCESS_TOKEN: ACCESS_TOKEN },
  });

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);

  if (result.status !== 0) {
    console.error(`FAIL ${fn.name} (exit ${result.status})`);
    process.exit(1);
  }

  console.log(`OK ${fn.name}`);
}

console.log('Done. Webhook URL: https://osdynbadhtfgoxilgmpy.supabase.co/functions/v1/paypal-webhook');

#!/usr/bin/env node
// PayPal 결제용 DB 마이그레이션 원격 적용 (Management API)
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PROJECT_REF = 'osdynbadhtfgoxilgmpy';
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
  console.error('SUPABASE_ACCESS_TOKEN required');
  process.exit(1);
}

const sql = readFileSync(
  join(ROOT, 'supabase/migrations/20260710100000_paypal_program_payments.sql'),
  'utf8',
);

const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query: sql }),
});

const text = await response.text();
if (!response.ok) {
  console.error('Migration failed:', response.status, text);
  process.exit(1);
}

console.log('Migration applied:', text || 'ok');

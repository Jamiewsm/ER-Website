#!/usr/bin/env node
// submit-application·notify-program-application Edge Function 배포
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const FN_ROOT = join(ROOT, 'supabase', 'functions');
const PROJECT_REF = 'osdynbadhtfgoxilgmpy';
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
  console.error('SUPABASE_ACCESS_TOKEN required (supabase login or Dashboard → Account → Access Tokens)');
  process.exit(1);
}

const FUNCTIONS = {
  'submit-application': {
    entrypoint_path: 'submit-application/index.ts',
    verify_jwt: false,
    files: [
      'submit-application/index.ts',
      '_shared/cors.ts',
      '_shared/email-templates.ts',
      '_shared/resend.ts',
      '_shared/turnstile.ts',
    ],
  },
  'notify-program-application': {
    entrypoint_path: 'notify-program-application/index.ts',
    verify_jwt: true,
    files: [
      'notify-program-application/index.ts',
      '_shared/cors.ts',
      '_shared/email-templates.ts',
      '_shared/program-pricing.ts',
      '_shared/resend.ts',
      '_shared/head-coach.ts',
    ],
  },
};

function buildPayload(name) {
  const spec = FUNCTIONS[name];
  return {
    name,
    entrypoint_path: spec.entrypoint_path,
    verify_jwt: spec.verify_jwt,
    files: spec.files.map((fileName) => ({
      name: fileName,
      content: readFileSync(join(FN_ROOT, fileName), 'utf8'),
    })),
  };
}

for (const name of Object.keys(FUNCTIONS)) {
  const payload = buildPayload(name);
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

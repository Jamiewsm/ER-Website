#!/usr/bin/env node
// js/test.js 또는 live URL이 premium test인지 검사 (legacy 배포 차단용)
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import http from 'node:http';
import https from 'node:https';
import { assertPremiumTestSource } from './deploy-tracks.mjs';

function usage() {
  return [
    'Usage:',
    '  node scripts/check_premium_test_markers.mjs --file js/test.js [--html test.html]',
    '  node scripts/check_premium_test_markers.mjs --url https://er-coaching.com/js/test.js',
  ].join('\n');
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--file') out.file = argv[++i];
    else if (arg === '--html') out.html = argv[++i];
    else if (arg === '--url') out.url = argv[++i];
    else if (arg === '--help' || arg === '-h') out.help = true;
  }
  return out;
}

function fetchText(url, redirectsLeft = 5) {
  const client = url.startsWith('https://') ? https : http;
  return new Promise((resolveText, reject) => {
    client.get(url, { headers: { 'user-agent': 'ER-Premium-Guard/1.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        if (redirectsLeft <= 0) {
          reject(new Error(`redirect limit for ${url}`));
          res.resume();
          return;
        }
        res.resume();
        fetchText(new URL(res.headers.location, url).toString(), redirectsLeft - 1).then(resolveText, reject);
        return;
      }
      if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
        reject(new Error(`GET ${url} HTTP ${res.statusCode}`));
        res.resume();
        return;
      }
      res.setEncoding('utf8');
      let body = '';
      res.on('data', (c) => { body += c; });
      res.on('end', () => resolveText(body));
    }).on('error', reject);
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }

  let testJs = '';
  let testHtml = '<!-- remote -->';

  if (args.url) {
    testJs = await fetchText(args.url);
    // Live URL checks must also load test.html (redirects to /test are followed).
    const origin = new URL(args.url).origin;
    testHtml = await fetchText(`${origin}/test.html`);
  } else if (args.file) {
    testJs = readFileSync(resolve(args.file), 'utf8');
    if (args.html) testHtml = readFileSync(resolve(args.html), 'utf8');
  } else {
    console.error(usage());
    process.exit(1);
  }

  const errors = assertPremiumTestSource(testJs, testHtml);
  if (errors.length) {
    console.error('FAIL: not premium test runtime');
    errors.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  }
  console.log('OK: premium test markers verified');
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});

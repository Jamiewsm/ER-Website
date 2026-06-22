#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import http from 'node:http';
import https from 'node:https';
import { DEFAULT_SITE, TEST_RUNTIME_ALLOWLIST } from './deploy-tracks.mjs';

const TEST_FILE_ALLOWLIST = TEST_RUNTIME_ALLOWLIST;

function usage() {
  return [
    'Usage:',
    '  node scripts/build_test_only_deploy_bundle.mjs --base /path/live-base --source . --out /tmp/er-deploy --site https://er-coaching.com',
    '',
    'Purpose:',
    '  Preserve current live landing files and overlay only ER premium test runtime files.'
  ].join('\n');
}

function parseArgs(argv) {
  const out = { site: DEFAULT_SITE, source: process.cwd() };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--base') out.base = argv[++i];
    else if (arg === '--source') out.source = argv[++i];
    else if (arg === '--out') out.out = argv[++i];
    else if (arg === '--site') out.site = argv[++i];
    else if (arg === '--help' || arg === '-h') out.help = true;
  }
  return out;
}

function assertDir(path, label) {
  if (!path || !existsSync(path)) {
    throw new Error(`${label} does not exist: ${path || '(missing)'}`);
  }
}

function readFromFileSite(site, relPath) {
  const root = fileURLToPath(new URL(site.endsWith('/') ? site : `${site}/`));
  return readFileSync(join(root, relPath), 'utf8');
}

function fetchText(url, redirectsLeft = 5) {
  if (url.startsWith('file://')) {
    throw new Error('fetchText does not support file:// directly');
  }
  const client = url.startsWith('https://') ? https : http;
  return new Promise((resolveText, reject) => {
    client.get(url, { headers: { 'user-agent': 'curl/8.0 ER-Deploy-Safety' } }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        if (redirectsLeft <= 0) {
          reject(new Error(`GET ${url} exceeded redirect limit`));
          res.resume();
          return;
        }
        const redirected = new URL(res.headers.location, url).toString();
        res.resume();
        fetchText(redirected, redirectsLeft - 1).then(resolveText, reject);
        return;
      }
      if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
        reject(new Error(`GET ${url} failed with HTTP ${res.statusCode}`));
        res.resume();
        return;
      }
      res.setEncoding('utf8');
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => resolveText(body));
    }).on('error', reject);
  });
}

function stripCloudflareInjectedScripts(html) {
  return html.replace(/<script\b[^>]*static\.cloudflareinsights\.com\/beacon\.min\.js[^>]*><\/script>\s*/gi, '');
}

async function readLiveText(site, relPath) {
  if (site.startsWith('file://')) return readFromFileSite(site, relPath);
  const base = site.replace(/\/+$/, '');
  return fetchText(`${base}/${relPath}`);
}

function copyAllowlistedTestFiles(source, out) {
  const copied = [];
  TEST_FILE_ALLOWLIST.forEach((relPath) => {
    const from = join(source, relPath);
    if (!existsSync(from)) {
      throw new Error(`Required test deploy file is missing: ${relPath}`);
    }
    const to = join(out, relPath);
    mkdirSync(dirname(to), { recursive: true });
    cpSync(from, to);
    copied.push(relPath);
  });
  return copied;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }
  if (!args.base || !args.out) {
    console.error(usage());
    process.exit(1);
  }

  const base = resolve(args.base);
  const source = resolve(args.source);
  const out = resolve(args.out);
  assertDir(base, '--base');
  assertDir(source, '--source');

  if (out === base || out === source) {
    throw new Error('--out must be separate from --base and --source');
  }

  rmSync(out, { recursive: true, force: true });
  cpSync(base, out, { recursive: true });

  const liveIndex = stripCloudflareInjectedScripts(await readLiveText(args.site, 'index.html'));
  const liveHome = await readLiveText(args.site, 'js/sections/home.js');
  writeFileSync(join(out, 'index.html'), liveIndex);
  mkdirSync(join(out, 'js/sections'), { recursive: true });
  writeFileSync(join(out, 'js/sections/home.js'), liveHome);

  const copied = copyAllowlistedTestFiles(source, out);
  console.log(`OK: built test-only deploy bundle at ${out}`);
  console.log(`Preserved live landing: index.html, js/sections/home.js`);
  console.log(`Overlayed premium test files from source: ${copied.join(', ')}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});

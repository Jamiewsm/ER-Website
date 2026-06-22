#!/usr/bin/env node
// Site deploy bundle: source의 landing/site만 반영하고 live test runtime은 그대로 보존
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import http from 'node:http';
import https from 'node:https';
import { DEFAULT_SITE, TEST_RUNTIME_ALLOWLIST } from './deploy-tracks.mjs';

function usage() {
  return [
    'Usage:',
    '  node scripts/build_site_only_deploy_bundle.mjs --source . --out /tmp/er-site-deploy --site https://er-coaching.com',
    '',
    'Purpose:',
    '  Deploy site/landing changes WITHOUT overwriting premium test runtime on live.',
    '  Test allowlist files are fetched from live and written into the bundle.',
  ].join('\n');
}

function parseArgs(argv) {
  const out = { site: DEFAULT_SITE, source: process.cwd() };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--source') out.source = argv[++i];
    else if (arg === '--out') out.out = argv[++i];
    else if (arg === '--site') out.site = argv[++i];
    else if (arg === '--help' || arg === '-h') out.help = true;
  }
  return out;
}

function readFromFileSite(site, relPath, binary = false) {
  const root = fileURLToPath(new URL(site.endsWith('/') ? site : `${site}/`));
  const full = join(root, relPath);
  return binary ? readFileSync(full) : readFileSync(full, 'utf8');
}

function fetchBuffer(url, redirectsLeft = 5) {
  if (url.startsWith('file://')) {
    throw new Error('use readFromFileSite for file://');
  }
  const client = url.startsWith('https://') ? https : http;
  return new Promise((resolveBuf, reject) => {
    client.get(url, { headers: { 'user-agent': 'curl/8.0 ER-Site-Deploy' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        if (redirectsLeft <= 0) {
          reject(new Error(`GET ${url} exceeded redirect limit`));
          res.resume();
          return;
        }
        res.resume();
        fetchBuffer(new URL(res.headers.location, url).toString(), redirectsLeft - 1).then(resolveBuf, reject);
        return;
      }
      if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
        reject(new Error(`GET ${url} failed with HTTP ${res.statusCode}`));
        res.resume();
        return;
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolveBuf(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

async function readLiveAsset(site, relPath) {
  const isBinary = relPath.endsWith('.png');
  if (site.startsWith('file://')) {
    return readFromFileSite(site, relPath, isBinary);
  }
  const base = site.replace(/\/+$/, '');
  const buf = await fetchBuffer(`${base}/${relPath}`);
  return isBinary ? buf : buf.toString('utf8');
}

async function preserveLiveTestRuntime(site, out) {
  const preserved = [];
  for (const relPath of TEST_RUNTIME_ALLOWLIST) {
    const content = await readLiveAsset(site, relPath);
    const to = join(out, relPath);
    mkdirSync(dirname(to), { recursive: true });
    if (Buffer.isBuffer(content)) writeFileSync(to, content);
    else writeFileSync(to, content);
    preserved.push(relPath);
  }
  return preserved;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }
  if (!args.out) {
    console.error(usage());
    process.exit(1);
  }

  const source = resolve(args.source);
  const out = resolve(args.out);
  if (!existsSync(source)) throw new Error(`--source does not exist: ${source}`);

  rmSync(out, { recursive: true, force: true });
  cpSync(source, out, { recursive: true });

  const preserved = await preserveLiveTestRuntime(args.site, out);
  console.log(`OK: built site-only deploy bundle at ${out}`);
  console.log(`Site files from source: ${source}`);
  console.log(`Preserved live test runtime (${preserved.length} files): ${preserved.join(', ')}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});

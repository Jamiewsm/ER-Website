#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import http from 'node:http';
import https from 'node:https';
import { assertPremiumTestSource } from './deploy-tracks.mjs';

const DEFAULT_SITE = 'https://er-coaching.com';

const CHECKS = [
  {
    path: 'index.html',
    label: 'live landing/menu',
    markers: ['유형검사', '프리미엄 검사', 'child-type-test/child-type-test.html']
  },
  {
    path: 'js/sections/home.js',
    label: 'live home design assets',
    markers: ['home-parent-child-photo.jpg', 'home-couple-photo.jpg', 'home-team-photo.jpg', 'hands and green.png', 'green and seat.png']
  },
  {
    path: 'test.html',
    label: 'premium test entry scripts',
    markers: ['css/test.css', 'js/diagnostic-experiment.js', 'js/report-support-materials.js', 'js/test.js']
  },
  {
    path: 'js/test.js',
    label: 'premium test runtime',
    markers: ['buildResponseQualitySnapshot', 'buildConfidenceExplanation', 'tb_2_9_1', 'er-report-application-map']
  },
  {
    path: 'js/diagnostic-experiment.js',
    label: 'experiment analytics payload',
    markers: ['buildExperimentAnalyticsPayload', 'experiment_payload', 'feedback_detail']
  },
  {
    path: 'css/test.css',
    label: 'premium report CSS',
    markers: ['background_vase.png', 'er-report-application-map', 'er-report-application-map-card']
  },
  {
    path: 'test-results/background.png',
    label: 'premium report background asset',
    markers: []
  }
];

function usage() {
  return [
    'Usage:',
    '  node scripts/verify_live_test_deploy.mjs --site https://er-coaching.com',
    '',
    'Purpose:',
    '  Verify production still has the latest landing/menu markers and the latest premium test runtime markers.'
  ].join('\n');
}

function parseArgs(argv) {
  const out = { site: DEFAULT_SITE, minChildBytes: 30000 };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--site') out.site = argv[++i];
    else if (arg === '--min-child-bytes') out.minChildBytes = Number(argv[++i]);
    else if (arg === '--help' || arg === '-h') out.help = true;
  }
  return out;
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
    client.get(url, (res) => {
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

async function readSiteText(site, relPath) {
  if (site.startsWith('file://')) return readFromFileSite(site, relPath);
  const base = site.replace(/\/+$/, '');
  return fetchText(`${base}/${relPath}`);
}

function requireMarkers(body, check) {
  check.markers.forEach((marker) => {
    if (!body.includes(marker)) {
      throw new Error(`Missing marker "${marker}" in ${check.path} (${check.label})`);
    }
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }

  for (const check of CHECKS) {
    const body = await readSiteText(args.site, check.path);
    requireMarkers(body, check);
    if (check.path === 'js/test.js') {
      const testHtml = await readSiteText(args.site, 'test.html');
      const legacyErrors = assertPremiumTestSource(body, testHtml);
      if (legacyErrors.length) {
        throw new Error(`Live js/test.js failed premium guard: ${legacyErrors.join('; ')}`);
      }
    }
    console.log(`OK ${check.path}: ${check.label}`);
  }

  const childTypePage = await readSiteText(args.site, 'child-type-test/child-type-test.html');
  if (childTypePage.length < args.minChildBytes) {
    throw new Error(`child-type-test/child-type-test.html is too small: ${childTypePage.length} bytes`);
  }
  console.log(`OK child-type-test/child-type-test.html: ${childTypePage.length} bytes`);
  console.log(`OK: production deployment guard passed for ${args.site}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});

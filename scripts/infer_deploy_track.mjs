#!/usr/bin/env node
// 변경 파일 경로에서 site/test deploy track을 추론 (CI·PR 라벨 자동화 SSOT)
import { pathToFileURL } from 'node:url';
import { SITE_OVERLAY_GLOBS, TEST_RUNTIME_ALLOWLIST } from './deploy-tracks.mjs';

function globToRegex(glob) {
  let pattern = glob
    .replace(/\./g, '\\.')
    .replace(/\*\*/g, '<<<GLOBSTAR>>>')
    .replace(/\*/g, '[^/]*')
    .replace(/<<<GLOBSTAR>>>/g, '.*');
  return new RegExp(`^${pattern}$`);
}

const SITE_PATTERNS = SITE_OVERLAY_GLOBS.map(globToRegex);
const TEST_PATTERNS = TEST_RUNTIME_ALLOWLIST.map(globToRegex);

export function matchesSitePath(filePath) {
  return SITE_PATTERNS.some((re) => re.test(filePath));
}

export function matchesTestPath(filePath) {
  return TEST_PATTERNS.some((re) => re.test(filePath));
}

export function inferDeployTrackFromPaths(paths) {
  let deploySite = false;
  let deployTest = false;
  for (const filePath of paths) {
    if (!filePath) continue;
    if (matchesSitePath(filePath)) deploySite = true;
    if (matchesTestPath(filePath)) deployTest = true;
  }
  let track = 'skip';
  if (deploySite && deployTest) track = 'both';
  else if (deploySite) track = 'site';
  else if (deployTest) track = 'test';
  return { deploySite, deployTest, track };
}

function usage() {
  return [
    'Usage:',
    '  node scripts/infer_deploy_track.mjs --files path1 path2 ...',
    '  git diff --name-only HEAD~1 | xargs node scripts/infer_deploy_track.mjs --files',
    '',
    'Outputs JSON: { "deploySite": bool, "deployTest": bool, "track": "skip|site|test|both" }',
  ].join('\n');
}

function parseArgs(argv) {
  const out = { files: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--files') {
      while (argv[i + 1] && !argv[i + 1].startsWith('--')) {
        out.files.push(argv[++i]);
      }
    } else if (arg === '--help' || arg === '-h') out.help = true;
    else if (!arg.startsWith('--')) out.files.push(arg);
  }
  return out;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }
  const result = inferDeployTrackFromPaths(args.files);
  console.log(JSON.stringify(result));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}

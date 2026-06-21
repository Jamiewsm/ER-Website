#!/usr/bin/env node
// Codex/Claude/Cursor 서브 에이전트가 GitHub Actions 배포를 요청하는 CLI
import { execFileSync } from 'node:child_process';

const REPO = process.env.GITHUB_REPOSITORY || 'Jamiewsm/ER-Website';

function usage() {
  return [
    'Usage:',
    '  node scripts/submit_deploy_request.mjs --track site|test|both --by codex --reason "PR #59 merged"',
    '',
    'Requires: gh CLI authenticated (GH_TOKEN or gh auth login)',
    '',
    'Triggers GitHub Actions workflow "Deploy Production" via repository_dispatch.',
    'Do NOT run wrangler locally. Merge/deploy orchestration is CI + Cursor main agent.',
  ].join('\n');
}

function parseArgs(argv) {
  const out = { ref: 'main' };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--track') out.track = argv[++i];
    else if (arg === '--by') out.requested_by = argv[++i];
    else if (arg === '--reason') out.reason = argv[++i];
    else if (arg === '--ref') out.ref = argv[++i];
    else if (arg === '--pr') out.pr = Number(argv[++i]);
    else if (arg === '--dry-run') out.dryRun = true;
    else if (arg === '--help' || arg === '-h') out.help = true;
  }
  return out;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }
  if (!args.track || !['site', 'test', 'both'].includes(args.track)) {
    console.error('--track is required: site | test | both');
    console.error(usage());
    process.exit(1);
  }
  if (!args.requested_by) {
    console.error('--by is required (codex | claude | cursor-sub | human)');
    process.exit(1);
  }

  if (args.dryRun) {
    console.log('Dry run:', { track: args.track, ref: args.ref, requested_by: args.requested_by, reason: args.reason || '' });
    return;
  }

  try {
    execFileSync(
      'gh',
      [
        'api',
        `repos/${REPO}/dispatches`,
        '-f', 'event_type=deploy-request',
        '-f', `client_payload[track]=${args.track}`,
        '-f', `client_payload[ref]=${args.ref}`,
        '-f', `client_payload[requested_by]=${args.requested_by}`,
        '-f', `client_payload[reason]=${args.reason || ''}`,
        ...(args.pr ? ['-f', `client_payload[pr]=${args.pr}`] : []),
      ],
      { stdio: 'inherit', encoding: 'utf8' }
    );
    console.log(`OK: deploy-request dispatched (track=${args.track}, by=${args.requested_by})`);
    console.log('Monitor: gh run list --workflow=deploy-production.yml');
  } catch (err) {
    console.error('Failed to dispatch deploy-request. Ensure gh is authenticated with repo scope.');
    console.error(err.message || err);
    process.exit(1);
  }
}

main();

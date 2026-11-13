#!/usr/bin/env node
/**
 * Sync partials/site-header.html into static pages between
 * <!-- ER_SITE_HEADER_BEGIN --> … <!-- ER_SITE_HEADER_END -->.
 *
 * Usage:
 *   node scripts/sync-site-header.mjs            # write
 *   node scripts/sync-site-header.mjs --check    # exit 1 if drift
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const partialPath = join(root, 'partials/site-header.html');
const checkOnly = process.argv.includes('--check');

/** @type {{ file: string, current?: string }[]} */
const TARGETS = [
  { file: 'theology/index.html', current: 'theology' },
  { file: 'christian-enneagram/index.html', current: 'christian-enneagram' },
  { file: 'biblical-enneagram/index.html', current: 'biblical-enneagram' },
  { file: 'enneagram-certification/index.html', current: 'enneagram-certification' },
  { file: 'parenting-workshop.html', current: 'parenting-workshop' },
  { file: 'parenting-seminar.html', current: 'parenting-seminar' },
  { file: 'couple-seminar.html', current: 'couple-seminar' },
  { file: 'teamwork-seminar.html', current: 'teamwork-seminar' },
  { file: 'church-programs.html', current: 'church-programs' },
  { file: 'basic-course.html', current: 'basic-course' },
];

const BEGIN = '<!-- ER_SITE_HEADER_BEGIN -->';
const END = '<!-- ER_SITE_HEADER_END -->';

function applyCurrent(html, current) {
  if (!current) {
    return html.replace(/\s*data-nav-current="[^"]*"/g, '');
  }
  return html.replace(
    new RegExp(`(data-nav-current="${current}")`, 'g'),
    'aria-current="page"'
  ).replace(/\s*data-nav-current="[^"]*"/g, '');
}

function replaceOrInsert(source, block) {
  const beginIdx = source.indexOf(BEGIN);
  const endIdx = source.indexOf(END);
  if (beginIdx !== -1 && endIdx !== -1 && endIdx > beginIdx) {
    return source.slice(0, beginIdx) + block.trim() + source.slice(endIdx + END.length);
  }

  // Replace first <header>…</header> (non-greedy across lines) after <body>
  const bodyIdx = source.search(/<body\b[^>]*>/i);
  if (bodyIdx === -1) throw new Error('no <body>');
  const afterBody = bodyIdx + source.slice(bodyIdx).match(/<body\b[^>]*>/i)[0].length;
  const headerMatch = source.slice(afterBody).match(/^\s*(?:<a class="skip"[\s\S]*?<\/a>\s*)?<header\b[\s\S]*?<\/header>/i);
  if (headerMatch) {
    const start = afterBody + headerMatch.index;
    const end = start + headerMatch[0].length;
    return `${source.slice(0, start)}\n${block.trim()}\n${source.slice(end)}`;
  }

  return `${source.slice(0, afterBody)}\n${block.trim()}\n${source.slice(afterBody)}`;
}

const partialRaw = readFileSync(partialPath, 'utf8').trim();
let drift = 0;

for (const target of TARGETS) {
  const abs = join(root, target.file);
  if (!existsSync(abs)) {
    console.warn(`skip missing ${target.file}`);
    continue;
  }
  const before = readFileSync(abs, 'utf8');
  const block = applyCurrent(partialRaw, target.current);
  let after = replaceOrInsert(before, block);

  // Ensure main has id="content" for skip link when missing
  if (!/id=["']content["']/.test(after)) {
    after = after.replace(/<main\b([^>]*)>/i, (m, attrs) => {
      if (/id=/.test(attrs)) return m;
      return `<main id="content"${attrs}>`;
    });
  }

  // Ensure site-header.css is linked once
  if (!/href=["']\/?css\/site-header\.css/.test(after)) {
    if (/href=["']\/?css\/reading\.css/.test(after)) {
      // reading.css imports site-header.css
    } else {
      after = after.replace(
        /<\/head>/i,
        '  <link rel="stylesheet" href="/css/site-header.css" />\n</head>'
      );
    }
  }

  if (after === before) {
    console.log(`ok  ${relative(root, abs)}`);
    continue;
  }
  if (checkOnly) {
    console.error(`drift ${relative(root, abs)}`);
    drift += 1;
    continue;
  }
  writeFileSync(abs, after);
  console.log(`sync ${relative(root, abs)}`);
}

if (checkOnly && drift) {
  console.error(`${drift} page(s) out of sync with partials/site-header.html`);
  process.exit(1);
}

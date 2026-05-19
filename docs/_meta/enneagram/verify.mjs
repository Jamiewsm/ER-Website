#!/usr/bin/env node
// 에니어그램 KB 산출물 검증 스크립트 (frontmatter, 링크, 분량, 한국어 헤더 검사)
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

const REQUIRED_KEYS = ['kb_id', 'title', 'created_at', 'retrieval_tags'];

const TASK_FILE_SPECS = {
  '1.0': [
    { path: 'docs/_meta/enneagram/CONTEXT.md', minLines: 100, maxLines: 500 },
    { path: 'docs/_meta/enneagram/WORK_STATUS.md', minLines: 10, maxLines: 200 },
    { path: 'docs/_meta/enneagram/PHASE_PLAN.md', minLines: 200, maxLines: 2000 },
    { path: 'docs/_meta/enneagram/HANDOFF.md', minLines: 30, maxLines: 200 },
    { path: 'docs/_meta/enneagram/HISTORY.md', minLines: 5, maxLines: 5000 },
    { path: 'AGENTS.md', minLines: 5, maxLines: 80, requireOurFrontmatter: false },
    { path: '.cursor/rules/enneagram-work.mdc', minLines: 5, maxLines: 80, requireOurFrontmatter: false },
  ],
  '1.1': [
    { path: 'docs/knowledge_base/enneagram/complete_enneagram/type_pair_disambiguation.md', minLines: 200, maxLines: 400 },
  ],
  '1.2': [
    { path: 'docs/knowledge_base/enneagram/complete_enneagram/centers_and_triads.md', minLines: 80, maxLines: 200 },
  ],
  '1.3': [
    { path: 'docs/knowledge_base/enneagram/complete_enneagram/type_wings.md', minLines: 250, maxLines: 500 },
  ],
  '1.4': [
    { path: 'docs/knowledge_base/enneagram/complete_enneagram/instinct_stacks.md', minLines: 150, maxLines: 300 },
  ],
  '1.5': [
    { path: 'docs/knowledge_base/enneagram/complete_enneagram/korean_test_copy_guide.md', minLines: 200, maxLines: 350 },
  ],
  '1.6': [
    { path: 'docs/knowledge_base/enneagram/complete_enneagram/complete_enneagram_kb.md', minLines: 380, maxLines: 450 },
  ],
  '1.7': [
    { path: 'docs/knowledge_base/enneagram/complete_enneagram/README.md', minLines: 40, maxLines: 100 },
  ],
  '2.0': [
    { path: 'docs/_meta/enneagram/PHASE_2_PLAN.md', minLines: 200, maxLines: 800 },
  ],
  '2.1': [
    { path: 'docs/knowledge_base/enneagram/complete_enneagram/subtypes_27.md', minLines: 110, maxLines: 200 },
  ],
  '2.2': [
    { path: 'docs/knowledge_base/enneagram/complete_enneagram/subtypes_27.md', minLines: 200, maxLines: 320 },
  ],
  '2.3': [
    { path: 'docs/knowledge_base/enneagram/complete_enneagram/subtypes_27.md', minLines: 290, maxLines: 440 },
  ],
  '2.4': [
    { path: 'docs/knowledge_base/enneagram/complete_enneagram/subtypes_27.md', minLines: 380, maxLines: 560 },
  ],
  '2.5': [
    { path: 'docs/knowledge_base/enneagram/complete_enneagram/subtypes_27.md', minLines: 470, maxLines: 680 },
  ],
  '2.6': [
    { path: 'docs/knowledge_base/enneagram/complete_enneagram/subtypes_27.md', minLines: 560, maxLines: 800 },
  ],
  '2.7': [
    { path: 'docs/knowledge_base/enneagram/complete_enneagram/subtypes_27.md', minLines: 650, maxLines: 920 },
  ],
  '2.8': [
    { path: 'docs/knowledge_base/enneagram/complete_enneagram/subtypes_27.md', minLines: 740, maxLines: 1040 },
  ],
  '2.9': [
    { path: 'docs/knowledge_base/enneagram/complete_enneagram/subtypes_27.md', minLines: 830, maxLines: 1300 },
  ],
  '3.0': [
    { path: 'docs/_meta/enneagram/PHASE_3_PLAN.md', minLines: 200, maxLines: 1500 },
  ],
  '3.1': [
    { path: 'docs/_meta/enneagram/scoring_spec.md', minLines: 80, maxLines: 300 },
  ],
  '3.2': [
    { path: 'js/test-scoring.js', minLines: 30, maxLines: 200, requireOurFrontmatter: false },
  ],
  '3.3': [
    { path: 'js/test-scoring.js', minLines: 60, maxLines: 250, requireOurFrontmatter: false },
  ],
  '3.4': [
    { path: 'js/test-scoring.js', minLines: 100, maxLines: 300, requireOurFrontmatter: false },
  ],
  '3.5': [
    { path: 'js/test-scoring.js', minLines: 140, maxLines: 350, requireOurFrontmatter: false },
  ],
  '3.6': [
    { path: 'test.html', minLines: 150, maxLines: 400, requireOurFrontmatter: false },
  ],
  '3.7': [
    { path: 'tests/test-scoring.test.mjs', minLines: 100, maxLines: 400, requireOurFrontmatter: false },
  ],
  '6.2': [
    { path: 'docs/_meta/enneagram/PHASE_6_PLAN.md', minLines: 100, maxLines: 800 },
  ],
  '6.3': [
    { path: 'test.html', minLines: 200, maxLines: 1000, requireOurFrontmatter: false },
  ],
  '6.4': [
    { path: 'js/test-charts.js', minLines: 80, maxLines: 500, requireOurFrontmatter: false },
  ],
  '6.5': [
    { path: 'js/test-result-renderer.js', minLines: 200, maxLines: 800, requireOurFrontmatter: false },
  ],
  '6.6': [
    { path: 'test.html', minLines: 250, maxLines: 1500, requireOurFrontmatter: false },
  ],
  '4.0': [
    { path: 'docs/_meta/enneagram/PHASE_4_PLAN.md', minLines: 100, maxLines: 800 },
  ],
  '4.1': [
    { path: 'docs/_meta/enneagram/test_dup_audit.md', minLines: 60, maxLines: 300 },
  ],
  '4.2': [
    { path: 'js/test-shared.js', minLines: 20, maxLines: 150, requireOurFrontmatter: false },
  ],
  '4.3': [
    { path: 'js/test.js', minLines: 950, maxLines: 1100, requireOurFrontmatter: false },
  ],
  '4.4': [
    { path: 'js/app-adaptive-data.js', minLines: 200, maxLines: 250, requireOurFrontmatter: false },
  ],
  '5.0': [
    { path: 'docs/_meta/enneagram/PHASE_5_PLAN.md', minLines: 100, maxLines: 800 },
  ],
  '5.1': [
    { path: 'js/subtypes-27-data.js', minLines: 250, maxLines: 1500, requireOurFrontmatter: false },
  ],
  '5.2': [
    { path: 'js/test-result-renderer.js', minLines: 50, maxLines: 300, requireOurFrontmatter: false },
  ],
  '5.3': [
    { path: 'test.html', minLines: 150, maxLines: 500, requireOurFrontmatter: false },
  ],
  '5.4': [
    { path: 'js/test.js', minLines: 950, maxLines: 1200, requireOurFrontmatter: false },
  ],
};

function parseFrontmatter(text) {
  const m = text.match(/^(?:<!--[^\n]*-->\s*\n)?---\n([\s\S]*?)\n---/);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split('\n')) {
    const km = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*):\s*(.*)$/);
    if (km) fm[km[1]] = km[2].trim();
  }
  // retrieval_tags array detection (multi-line list or inline)
  const tagsBlock = m[1].match(/retrieval_tags:\s*\n((?:\s*-\s*.+\n?)+)/);
  if (tagsBlock) {
    fm.retrieval_tags = tagsBlock[1].split('\n').filter(l => l.trim().startsWith('-')).map(l => l.replace(/^\s*-\s*/, '').trim());
  } else if (fm.retrieval_tags && fm.retrieval_tags.startsWith('[')) {
    fm.retrieval_tags = fm.retrieval_tags.replace(/^\[|\]$/g, '').split(',').map(s => s.trim()).filter(Boolean);
  }
  return fm;
}

function checkFile(spec) {
  const errors = [];
  const full = path.join(ROOT, spec.path);
  if (!fs.existsSync(full)) {
    errors.push(`FILE_MISSING: ${spec.path}`);
    return errors;
  }
  const text = fs.readFileSync(full, 'utf8');
  const lines = text.split('\n');
  if (lines.length < spec.minLines) errors.push(`TOO_SHORT: ${spec.path} (${lines.length} < ${spec.minLines})`);
  if (lines.length > spec.maxLines) errors.push(`TOO_LONG: ${spec.path} (${lines.length} > ${spec.maxLines})`);

  if (spec.path.endsWith('.md')) {
    // Korean header comment must be the first non-empty line, before frontmatter
    const firstNonEmpty = lines.find(l => l.trim().length > 0);
    if (!firstNonEmpty || !firstNonEmpty.trim().startsWith('<!--')) {
      errors.push(`MISSING_KOREAN_HEADER: ${spec.path}`);
    }
    if (spec.requireOurFrontmatter !== false) {
      const fm = parseFrontmatter(text);
      if (!fm) {
        errors.push(`MISSING_FRONTMATTER: ${spec.path}`);
      } else {
        for (const key of REQUIRED_KEYS) {
          if (!fm[key]) errors.push(`MISSING_KEY: ${spec.path} :: ${key}`);
        }
        if (fm.retrieval_tags && (!Array.isArray(fm.retrieval_tags) || fm.retrieval_tags.length === 0)) {
          errors.push(`EMPTY_RETRIEVAL_TAGS: ${spec.path}`);
        }
      }
    }
    // broken internal links (./xxx.md, ../xxx.md, sibling .md only — no http)
    // strip fenced code blocks (```...```) so illustrative example links inside them are ignored
    const stripped = text.replace(/```[\s\S]*?```/g, '').replace(/`[^`]*`/g, '');
    const linkRe = /\[[^\]]+\]\((\.{1,2}\/[^)]+\.md|[a-zA-Z0-9_./-]+\.md)\)/g;
    let m;
    while ((m = linkRe.exec(stripped)) !== null) {
      const linkPath = m[1];
      const resolved = path.resolve(path.dirname(full), linkPath);
      if (!fs.existsSync(resolved)) errors.push(`BROKEN_LINK: ${spec.path} -> ${linkPath}`);
    }
  }
  return errors;
}

function main() {
  const taskId = process.argv[2];
  if (!taskId) { console.error('Usage: node verify.mjs <task_id>'); process.exit(2); }
  let specs;
  if (taskId === 'all') {
    // For "all" mode, dedupe by path keeping only the LAST spec per file
    // (handles progressive minLines/maxLines across tasks like 2.1-2.9 that share subtypes_27.md)
    const byPath = new Map();
    for (const spec of Object.values(TASK_FILE_SPECS).flat()) byPath.set(spec.path, spec);
    specs = Array.from(byPath.values());
  } else {
    specs = TASK_FILE_SPECS[taskId];
  }
  if (!specs) { console.error(`Unknown task: ${taskId}`); process.exit(2); }
  const errors = [];
  for (const spec of specs) errors.push(...checkFile(spec));
  if (errors.length === 0) {
    console.log(`OK: task ${taskId} verified (${specs.length} files)`);
    process.exit(0);
  }
  console.error(`FAIL: task ${taskId}`);
  for (const e of errors) console.error('  ' + e);
  process.exit(1);
}

main();

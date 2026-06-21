#!/usr/bin/env node
// child-type-data.js SSOT에서 웹 관찰 문항 JSON을 생성하는 동기화 스크립트
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const data = require('../js/child-type-data.js');

const outPath = join(__dirname, '../docs/parent_resources/child_type_web_observation.json');

const payload = {
  generatedFrom: 'js/child-type-data.js',
  generatedAt: new Date().toISOString(),
  version: data.VERSION || 2,
  scale: data.SCALE,
  perPage: data.PER_PAGE,
  situations: data.SITUATIONS,
  types: Object.fromEntries(
    Object.entries(data.TYPES).map(([num, row]) => [
      num,
      { title: row.title, core: row.core, questions: row.q },
    ])
  ),
  instincts: Object.fromEntries(
    Object.entries(data.INSTINCTS).map(([key, row]) => [
      key,
      { name: row.name, questions: row.q },
    ])
  ),
  pairs: data.PAIRS,
  wings: data.WINGS,
};

writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
console.log(`Wrote ${outPath} (${Object.keys(data.TYPES).length} types, ${data.SITUATIONS.length} situations)`);

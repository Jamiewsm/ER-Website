#!/usr/bin/env node
// ER 프리미엄 결과지 콘텐츠 JSON 검증 스크립트
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CHEMISTRY_DIR = path.join(ROOT, 'docs/report-content/chemistry');

const REQUIRED_TOP_LEVEL = [
  'schema_version',
  'combination_key',
  'core',
  'dominant_instinct',
  'wing',
  'status',
  'identity_sentence',
  'core_tension',
  'chemistry_story',
  'distinctive_signs',
  'contrast_pair',
  'misread_pattern',
  'stress_chemistry',
  'recovery_hook',
  'faith_optional',
  'display',
];

const REQUIRED_DISPLAY = ['one_page_title', 'one_page_body', 'pull_quote', 'bullets'];
const INSTINCTS = new Set(['sp', 'sx', 'so']);
const NON_FAITH_BANNED = ['복음', '죄', '회개', '거짓 자아'];
const TYPO_BANNED = ['격과지', '길이 다루며'];

function fail(errors, message) {
  errors.push(message);
}

function collectNonFaithText(card) {
  const copy = { ...card, faith_optional: [] };
  return JSON.stringify(copy);
}

function checkArray(errors, card, key, minLength) {
  if (!Array.isArray(card[key])) {
    fail(errors, `${card.combination_key || 'unknown'}: ${key} must be an array`);
    return;
  }
  if (card[key].length < minLength) {
    fail(errors, `${card.combination_key || 'unknown'}: ${key} must contain at least ${minLength} item(s)`);
  }
  card[key].forEach((item, index) => {
    if (typeof item !== 'string' || item.trim().length < 8) {
      fail(errors, `${card.combination_key || 'unknown'}: ${key}[${index}] is too short`);
    }
  });
}

function checkCard(filePath) {
  const errors = [];
  const raw = fs.readFileSync(filePath, 'utf8');
  let card;
  try {
    card = JSON.parse(raw);
  } catch (err) {
    return [`${path.relative(ROOT, filePath)}: invalid JSON: ${err.message}`];
  }

  for (const key of REQUIRED_TOP_LEVEL) {
    if (!(key in card)) fail(errors, `${card.combination_key || path.basename(filePath)}: missing ${key}`);
  }

  if (card.schema_version !== 1) fail(errors, `${card.combination_key}: schema_version must be 1`);
  if (!Number.isInteger(card.core) || card.core < 1 || card.core > 9) fail(errors, `${card.combination_key}: core must be 1-9`);
  if (!INSTINCTS.has(card.dominant_instinct)) fail(errors, `${card.combination_key}: dominant_instinct must be sp/sx/so`);
  if (card.secondary_instinct != null && !INSTINCTS.has(card.secondary_instinct)) fail(errors, `${card.combination_key}: secondary_instinct must be sp/sx/so/null`);
  if (card.blind_instinct != null && !INSTINCTS.has(card.blind_instinct)) fail(errors, `${card.combination_key}: blind_instinct must be sp/sx/so/null`);
  if (!Number.isInteger(card.wing) || card.wing < 1 || card.wing > 9) fail(errors, `${card.combination_key}: wing must be 1-9`);

  const expectedKey = `${card.dominant_instinct}_${card.core}_w${card.wing}`;
  if (card.combination_key !== expectedKey) fail(errors, `${card.combination_key}: expected combination_key ${expectedKey}`);

  if (typeof card.identity_sentence !== 'string' || card.identity_sentence.length < 25) {
    fail(errors, `${card.combination_key}: identity_sentence is too short`);
  }

  checkArray(errors, card, 'core_tension', 2);
  checkArray(errors, card, 'chemistry_story', 2);
  checkArray(errors, card, 'distinctive_signs', 3);
  checkArray(errors, card, 'contrast_pair', 1);
  checkArray(errors, card, 'misread_pattern', 1);
  checkArray(errors, card, 'stress_chemistry', 1);
  checkArray(errors, card, 'recovery_hook', 1);
  checkArray(errors, card, 'faith_optional', 1);

  if (!card.display || typeof card.display !== 'object') {
    fail(errors, `${card.combination_key}: display must be an object`);
  } else {
    for (const key of REQUIRED_DISPLAY) {
      if (!(key in card.display)) fail(errors, `${card.combination_key}: display missing ${key}`);
    }
    if (!Array.isArray(card.display.one_page_body) || card.display.one_page_body.length < 1) {
      fail(errors, `${card.combination_key}: display.one_page_body must contain at least 1 paragraph`);
    }
    if (!Array.isArray(card.display.bullets) || card.display.bullets.length < 3) {
      fail(errors, `${card.combination_key}: display.bullets must contain at least 3 items`);
    }
  }

  const nonFaith = collectNonFaithText(card);
  for (const word of NON_FAITH_BANNED) {
    if (nonFaith.includes(word)) fail(errors, `${card.combination_key}: non-faith content contains "${word}"`);
  }
  const fullText = JSON.stringify(card);
  for (const word of TYPO_BANNED) {
    if (fullText.includes(word)) fail(errors, `${card.combination_key}: typo banned term "${word}" found`);
  }

  return errors;
}

function main() {
  if (!fs.existsSync(CHEMISTRY_DIR)) {
    console.error(`Missing directory: ${path.relative(ROOT, CHEMISTRY_DIR)}`);
    process.exit(1);
  }
  const files = fs.readdirSync(CHEMISTRY_DIR)
    .filter((name) => name.endsWith('.json'))
    .map((name) => path.join(CHEMISTRY_DIR, name));

  if (files.length === 0) {
    console.error('No chemistry JSON files found.');
    process.exit(1);
  }

  const errors = files.flatMap(checkCard);
  if (errors.length > 0) {
    console.error(`FAIL: report content verification (${errors.length} issue(s))`);
    errors.forEach((error) => console.error(`  ${error}`));
    process.exit(1);
  }

  console.log(`OK: report content verified (${files.length} chemistry file(s))`);
}

main();

// Text quality guardrails for long-form premium reports.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  assertReportTextQuality,
  findForbiddenPhrases,
  findRepeatedLongPhrases,
  findRepeatedLongSentences,
  normalizeKoreanText,
} from '../scripts/lib/report-text-quality.mjs';

test('normalizeKoreanText compacts repeated whitespace without stripping Korean text', () => {
  assert.equal(
    normalizeKoreanText('  관계 안에서   에너지가\n다시 정돈됩니다.  '),
    '관계 안에서 에너지가 다시 정돈됩니다.'
  );
});

test('findForbiddenPhrases reports banned customer-facing phrases', () => {
  const matches = findForbiddenPhrases('이 조합만의 화학은 매력적입니다.', ['조합만의 화학']);

  assert.deepEqual(matches, [{ phrase: '조합만의 화학', count: 1 }]);
});

test('findRepeatedLongSentences flags duplicated long Korean sentences', () => {
  const text = [
    '새로운 가능성을 향해 움직일 때 이 사람은 빠르게 활기를 되찾습니다.',
    '관계에서는 속도를 낮추는 연습이 필요합니다.',
    '새로운 가능성을 향해 움직일 때 이 사람은 빠르게 활기를 되찾습니다.',
  ].join('\n');

  const repeated = findRepeatedLongSentences(text);

  assert.equal(repeated.length, 1);
  assert.match(repeated[0].text, /새로운 가능성을 향해/);
  assert.equal(repeated[0].count, 2);
});

test('findRepeatedLongPhrases flags repeated long phrase fragments across paragraphs', () => {
  const text = [
    '일에서는 빠르게 방향을 넓히는 힘이 장점으로 드러납니다.',
    '관계에서는 빠르게 방향을 넓히는 힘이 상대를 앞질러 갈 수 있습니다.',
  ].join('\n\n');

  const repeated = findRepeatedLongPhrases(text, { minLength: 10 });

  assert.ok(repeated.some((item) => item.text.includes('빠르게 방향을 넓히는 힘')));
});

test('short ordinary report words are ignored by repetition checks', () => {
  const text = '회복 관계 일 회복 관계 일 회복 관계 일';

  assert.deepEqual(findRepeatedLongSentences(text), []);
  assert.deepEqual(findRepeatedLongPhrases(text), []);
});

test('contextual reuse passes when the repeated concept changes the user task', () => {
  const text = [
    'Page 3: 이 패턴은 선택지가 줄어드는 순간 긴장합니다.',
    'Page 7: 오늘의 실천은 회의 전에 선택 기준을 한 줄로 정하는 것입니다.',
    'Page 16: 관계에서는 상대의 속도를 확인하고 대답을 기다리는 것이 핵심입니다.',
  ].join('\n');

  assert.doesNotThrow(() => assertReportTextQuality(text));
});

test('assertReportTextQuality combines forbidden phrase and repetition failures', () => {
  const text = [
    '이 조합만의 화학은 특별합니다.',
    '새로운 가능성을 향해 움직일 때 이 사람은 빠르게 활기를 되찾습니다.',
    '새로운 가능성을 향해 움직일 때 이 사람은 빠르게 활기를 되찾습니다.',
  ].join('\n');

  assert.throws(
    () => assertReportTextQuality(text, { forbiddenPhrases: ['조합만의 화학'] }),
    /Report text quality failed/
  );
});

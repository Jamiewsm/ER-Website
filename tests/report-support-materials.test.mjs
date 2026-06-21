// 프리미엄 결과지 보조자료 선택 workflow 테스트.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

const require = createRequire(import.meta.url);
const support = require('../js/report-support-materials.js');
const catalog = JSON.parse(readFileSync(new URL('../docs/report-content/support-materials/catalog.json', import.meta.url), 'utf8'));

test('catalog records clarified suppression terms and conservative thresholds', () => {
  assert.equal(catalog.termMap.so.projectAlias, '사본');
  assert.equal(catalog.termMap.so.suppressionName, '사본억압형');
  assert.equal(catalog.termMap.sx.projectAlias, '성본');
  assert.equal(catalog.termMap.sx.suppressionName, '성본억압형');
  assert.equal(catalog.termMap.sp.projectAlias, '자본');
  assert.equal(catalog.termMap.sp.status, 'available');

  const thresholds = catalog.thresholds.instinctSuppression;
  assert.equal(thresholds.extremeLowPercentMax, 25);
  assert.equal(thresholds.minimumGapFromMiddle, 20);
  assert.equal(thresholds.tieTolerancePoints, 3);
});

test('catalog includes all provided materials and enables all three suppression guides', () => {
  const ids = catalog.materials.map((material) => material.id).sort();
  assert.deepEqual(ids, [
    'child_observation_checklist',
    'child_type_conversation_principles',
    'mother_type_traits',
    'self_preservation_instinct_repressed',
    'sexual_instinct_repressed',
    'sibling_conflict_mediation',
    'social_instinct_repressed'
  ]);

  const social = catalog.materials.find((material) => material.id === 'social_instinct_repressed');
  const sexual = catalog.materials.find((material) => material.id === 'sexual_instinct_repressed');
  const selfPres = catalog.materials.find((material) => material.id === 'self_preservation_instinct_repressed');

  assert.equal(social.suppressionCode, 'so');
  assert.equal(sexual.suppressionCode, 'sx');
  assert.equal(selfPres.suppressionCode, 'sp');
  assert.equal(selfPres.status, 'available');
  assert.equal(Object.keys(social.typeSpecificTitles).length, 9);
  assert.equal(Object.keys(sexual.typeSpecificTitles).length, 9);
  assert.equal(Object.keys(selfPres.typeSpecificTitles).length, 9);
  assert.match(selfPres.summary, /몸, 돈, 시간, 안전/);
});

test('normalizeInstinctCode accepts ER Korean aliases', () => {
  assert.equal(support.normalizeInstinctCode('사본'), 'so');
  assert.equal(support.normalizeInstinctCode('성본'), 'sx');
  assert.equal(support.normalizeInstinctCode('자본'), 'sp');
  assert.equal(support.normalizeInstinctCode('성적/일대일'), 'sx');
  assert.equal(support.normalizeInstinctCode('자기보존'), 'sp');
});

test('detectRepressedInstinct detects social suppression only when extremely low and clearly lowest', () => {
  const result = support.detectRepressedInstinct({ sp: 55, sx: 80, so: 12 });
  assert.equal(result.code, 'so');
  assert.equal(result.percent, 12);
  assert.equal(result.gapFromMiddle, 43);
  assert.equal(result.materialId, 'social_instinct_repressed');
  assert.equal(result.materialStatus, 'available');
});

test('detectRepressedInstinct detects sexual suppression from row-shaped data', () => {
  const result = support.detectRepressedInstinct([
    { label: '자본', percent: 60 },
    { label: '성본', percent: '15%' },
    { label: '사본', percent: 74 }
  ]);

  assert.equal(result.code, 'sx');
  assert.equal(result.percent, 15);
  assert.equal(result.materialId, 'sexual_instinct_repressed');
});

test('detectRepressedInstinct detects self-preservation suppression from Korean aliases', () => {
  const result = support.detectRepressedInstinct([
    { label: '자본', percent: 10 },
    { label: '성본', percent: 70 },
    { label: '사본', percent: 55 }
  ]);

  assert.equal(result.code, 'sp');
  assert.equal(result.percent, 10);
  assert.equal(result.materialId, 'self_preservation_instinct_repressed');
  assert.equal(result.materialStatus, 'available');
});

test('detectRepressedInstinct avoids over-calling normal third-instinct weakness', () => {
  assert.equal(
    support.detectRepressedInstinct({ sp: 31, sx: 80, so: 60 }).reason,
    'not_extreme_low'
  );
  assert.equal(
    support.detectRepressedInstinct({ sp: 20, sx: 35, so: 30 }).reason,
    'not_enough_gap'
  );
  assert.equal(
    support.detectRepressedInstinct({ sp: 12, sx: 13, so: 80 }).reason,
    'ambiguous_lowest'
  );
});

test('selectSupportMaterials adds adult suppression material without parent resources', () => {
  const result = support.selectSupportMaterials({
    audience: 'adult',
    coreType: 7,
    instinctPct: { sp: 55, sx: 80, so: 12 }
  });

  assert.equal(result.repressedInstinct.code, 'so');
  assert.deepEqual(result.materials.map((material) => material.id), ['social_instinct_repressed']);
  assert.equal(result.materials[0].typeTitle, '내 자유와 계획이 가장 중요한 사람');
  assert.match(result.materials[0].reportSummary, /집단 소속/);
  assert.ok(result.materials[0].focusAreas.length > 0);
  assert.ok(result.materials[0].practicePrompts.length > 0);
  assert.equal(result.pendingMaterials.length, 0);
});

test('selectSupportMaterials builds parent package with child and sibling resources', () => {
  const result = support.selectSupportMaterials({
    audience: 'parent',
    adultType: 8,
    childType: 6,
    hasMultipleChildren: true,
    instinctPct: { sp: 70, sx: 14, so: 62 }
  });

  const ids = result.materials.map((material) => material.id);
  assert.deepEqual(ids, [
    'sexual_instinct_repressed',
    'mother_type_traits',
    'child_observation_checklist',
    'child_type_conversation_principles',
    'sibling_conflict_mediation'
  ]);
  assert.equal(result.materials[0].typeTitle, '조용하고 덜 침투적인 8번');
  assert.equal(result.materials[1].typeTitle, '8번 유형 엄마');
  assert.equal(result.materials[2].typeTitle, '충성하는 사람 / 의심하는 사람');
  assert.equal(result.materials[3].typeTitle, '충성스러운 아이');
  assert.ok(result.recommendedSlots.includes('parenting_pattern'));
  assert.ok(result.recommendedSlots.includes('child_conversation'));
  assert.ok(result.recommendedSlots.includes('sibling_mediation'));
});

test('selectSupportMaterials adds self-preservation suppression material now that source is available', () => {
  const result = support.selectSupportMaterials({
    audience: 'parent',
    adultType: 5,
    instinctPct: { sp: 10, sx: 70, so: 55 }
  });

  assert.equal(result.repressedInstinct.code, 'sp');
  assert.deepEqual(result.materials.map((material) => material.id), [
    'self_preservation_instinct_repressed',
    'mother_type_traits'
  ]);
  assert.equal(result.materials[0].typeTitle, '머리는 멀리 가지만 몸과 현실은 뒤에 남는 사람');
  assert.deepEqual(result.pendingMaterials.map((material) => material.id), []);
});

test('selector entries do not leak internal source file paths', () => {
  const result = support.selectSupportMaterials({
    audience: 'parent',
    adultType: 2,
    childType: 9,
    instinctPct: { sp: 60, sx: 12, so: 70 }
  });

  for (const material of result.materials) {
    assert.equal(Object.prototype.hasOwnProperty.call(material, 'sourceFile'), false);
    assert.equal(Object.prototype.hasOwnProperty.call(material, 'localAsset'), false);
    assert.equal(Object.prototype.hasOwnProperty.call(material, 'sourceNote'), false);
  }
});

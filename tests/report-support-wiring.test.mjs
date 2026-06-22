// 결과지 보조자료 selector가 실제 premium report 렌더링 경로에 연결되어 있는지 검증.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const testHtml = readFileSync(new URL('../test.html', import.meta.url), 'utf8');
const testJs = readFileSync(new URL('../js/test.js', import.meta.url), 'utf8');
const testCss = readFileSync(new URL('../css/test.css', import.meta.url), 'utf8');

test('test.html loads report-support-materials before the test renderer', () => {
  const supportIdx = testHtml.indexOf('js/report-support-materials.js');
  const testIdx = testHtml.indexOf('js/test.js');

  assert.ok(supportIdx > 0, 'support selector script should be loaded');
  assert.ok(testIdx > 0, 'test renderer script should be loaded');
  assert.ok(supportIdx < testIdx, 'support selector must load before js/test.js');
});

test('premium report model calls ERReportSupportMaterials selector', () => {
  assert.match(testJs, /window\.ERReportSupportMaterials/);
  assert.match(testJs, /selectSupportMaterials/);
  assert.match(testJs, /buildReportSupportSelection/);
  assert.match(testJs, /buildInstinctPctFromScores/);
  assert.match(testJs, /instinctPct: resultData\.instinctPct/);
  assert.match(testJs, /supportMaterials/);
});

test('premium report renderer includes support materials section and nav link', () => {
  assert.match(testJs, /id="report-support"/);
  assert.match(testJs, /Support Materials/);
  assert.match(testJs, /결과에 따라 함께 보면 좋은 자료/);
  assert.match(testJs, /href="#report-support"/);
});

test('premium report renderer includes application hook before next-step CTA', () => {
  assert.match(testJs, /id="report-application"/);
  assert.match(testJs, /이해에서 끝나지 않고, 실제 관계를 돕는 지도/);
  assert.match(testJs, /er-report-application-map/);
  assert.match(testJs, /나의 필요/);
  assert.match(testJs, /나의 욕구/);
  assert.match(testJs, /내가 힘들 때 필요한 도움/);
  assert.match(testJs, /가족·동료·리더가 나를 도울 방법/);
  assert.match(testJs, /결과지 해석상담이나 기본과정/);
  assert.match(testJs, /data-report-program-key="result_consult"/);
  assert.match(testJs, /data-core-tone/);
});

test('phase 1 uses a shorter forced center screen plus behavior-recall type items', () => {
  const q1Start = testJs.indexOf('const q1 = [');
  const firstCoreItem = testJs.indexOf("{ id:'c1'");
  assert.ok(q1Start > 0, 'q1 should be defined');
  assert.ok(firstCoreItem > q1Start, 'core type items should follow center screeners');

  const centerBlock = testJs.slice(q1Start, firstCoreItem);
  assert.match(centerBlock, /id: 'center_auto_1'/);
  assert.match(centerBlock, /id: 'center_auto_2'/);
  assert.match(centerBlock, /id: 'center_auto_3'/);
  assert.match(centerBlock, /id: 'center_situation_1'/);
  assert.match(centerBlock, /id: 'center_situation_2'/);
  assert.match(centerBlock, /id: 'center_situation_3'/);
  assert.doesNotMatch(centerBlock, /id: 'center_auto_4'|id: 'center_auto_5'|id: 'center_auto_6'|id: 'center_auto_7'|id: 'center_auto_8'|id: 'center_auto_9'|id: 'center_auto_10'/);
  assert.equal((centerBlock.match(/centerChoice: true/g) || []).length, 6);
  assert.doesNotMatch(centerBlock, /triad:/);
  assert.doesNotMatch(centerBlock, /가치|의미|밀어내|버티/);
  assert.match(centerBlock, /회의나 대화에서 내 의견이 충분히 받아들여지지 않았을 때/);
  assert.match(centerBlock, /예상보다 차갑게 대하거나 거절했을 때/);
  assert.match(centerBlock, /일이 예상과 다르게 틀어졌을 때/);

  const phase1Block = testJs.slice(q1Start, testJs.indexOf('const deep = {'));
  assert.match(phase1Block, /회의나 대화에서 실수한 뒤/);
  assert.match(phase1Block, /행복한 순간에도/);
  assert.match(phase1Block, /요청받지 않아도 개입/);
  assert.match(phase1Block, /며칠 동안/);
  assert.match(phase1Block, /더 이상 나를 필요로 하지 않는다고 느껴질 때/);
  assert.match(phase1Block, /사람들과 잘 어울리고 있어도/);
  assert.match(testJs, /phase1CenterChoice/);
  assert.match(testJs, /item\.format === 'abc' && item\.centerChoice/);
  assert.match(testJs, /option\.types\.forEach/);
});

test('phase 1 adds one scored instinct attention-bias situation question', () => {
  const q1Start = testJs.indexOf('const q1 = [');
  const phase1Block = testJs.slice(q1Start, testJs.indexOf('const deep = {'));

  assert.match(phase1Block, /id:'instinct_attention_1'/);
  assert.match(phase1Block, /instinctChoice:true/);
  assert.match(phase1Block, /어디서 쉬고, 먹고, 이동하고/);
  assert.match(phase1Block, /강하게 끌리거나 에너지가 집중되는 대상/);
  assert.match(phase1Block, /누가 영향력이 있고, 관계 흐름이 어떻게 움직이는지/);
  assert.match(testJs, /addInstinctScoresFromResponses/);
  assert.match(testJs, /item\.format === 'abc' && item\.instinctChoice/);
  assert.match(testJs, /instinctAttentionChoice/);
});

test('state anxiety guardrail is wired for type 6 over-scoring', () => {
  assert.match(testJs, /calculateStateStressAdjustment/);
  assert.match(testJs, /applyStateStressAdjustment/);
  assert.match(testJs, /appendStateAnxietyTieBreakersForType6/);
  assert.match(testJs, /stateAnxietyType6Damp/);
  assert.match(testJs, /stateAnxietySixRivalMargin/);
  assert.match(testJs, /stateStressAdjustment/);
  assert.match(testJs, /tb16/);
  assert.match(testJs, /tb56/);
  assert.match(testJs, /tb69/);
});

test('scoring axes snapshot keeps future scoring dimensions separated', () => {
  assert.match(testJs, /buildScoringAxesSnapshot/);
  assert.match(testJs, /centerScore/);
  assert.match(testJs, /harmonicScore/);
  assert.match(testJs, /hornevianScore/);
  assert.match(testJs, /coreTypeScore/);
  assert.match(testJs, /instinctScore/);
  assert.match(testJs, /stateStressAdjustment/);
});

test('support materials section does not render internal source fields', () => {
  assert.doesNotMatch(testJs, /sourceFile/);
  assert.doesNotMatch(testJs, /localAsset/);
  assert.doesNotMatch(testJs, /sourceNote/);
});

test('support materials have dedicated responsive styles', () => {
  assert.match(testCss, /\.er-report-support-grid/);
  assert.match(testCss, /\.er-report-support-card/);
  assert.match(testCss, /grid-template-columns: repeat\(auto-fit, minmax\(58px, 1fr\)\)/);
});

test('premium report styles use uploaded backgrounds and one report font family', () => {
  assert.match(testCss, /background\.png/);
  assert.match(testCss, /background_card\.png/);
  assert.match(testCss, /background_vase\.png/);
  assert.match(testCss, /backgrdound_road\.png/);
  assert.match(testCss, /\.er-report-application/);
  assert.match(testCss, /\.er-report-application-map/);
  assert.match(testCss, /\.er-report-application-map-card/);
  assert.match(testCss, /\.er-report-next-rationale/);
  assert.doesNotMatch(testCss, /Noto Serif KR/);
  assert.doesNotMatch(testCss, /ui-monospace/);
});

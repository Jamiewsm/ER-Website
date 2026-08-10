// 결과지 보조자료 selector가 실제 premium report 렌더링 경로에 연결되어 있는지 검증.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const testHtml = readFileSync(new URL('../test.html', import.meta.url), 'utf8');
const testJs = readFileSync(new URL('../js/test.js', import.meta.url), 'utf8');
const testCss = readFileSync(new URL('../css/test.css', import.meta.url), 'utf8');
const reportContentJs = readFileSync(new URL('../js/diagnostic-report-content.js', import.meta.url), 'utf8');

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
  assert.match(testJs, /내가 지키려는 것/);
  assert.match(testJs, /건강할 때 드러나는 강점/);
  assert.match(testJs, /압박에서 과해지는 것/);
  assert.match(testJs, /가까운 사람이 알아야 할 것/);
  assert.match(testJs, /결과지 해석상담이나 기본과정/);
  assert.match(testJs, /const finalCtaProgramKey = 'result_consult'/);
  assert.match(testJs, /data-core-tone/);
});

test('premium report first screen includes executive summary card', () => {
  assert.match(testJs, /function renderExecutiveSummaryCard/);
  assert.match(testJs, /id="report-executive"/);
  assert.match(testJs, /이 결과에서 가장 먼저 볼 것/);
  assert.match(testJs, /Close Types/);
  assert.match(testJs, /Counseling Focus/);
  assert.match(testJs, /href="#report-executive"/);
  assert.match(testCss, /\.er-report-executive/);
  assert.match(testCss, /\.er-report-executive-grid/);
  assert.match(testCss, /\.er-report-executive-focus/);
});

test('premium report body uses personal synthesis instead of repeated subtype notes', () => {
  assert.match(testJs, /c\.synthesis/);
  assert.match(testJs, /class="er-report-synthesis"/);
  assert.match(testJs, /Personal Synthesis/);
  assert.match(testJs, /무엇을 지키는가/);
  assert.match(testJs, /압박에서 과해지는 것/);
  assert.match(testJs, /가까운 사람이 경험하는 것/);
  assert.match(testJs, /상담에서 확인할 것/);
  assert.match(testJs, /class="er-report-summary-strip"/);
  assert.doesNotMatch(testJs, /<strong>하위유형 해석<\/strong>/);
  assert.match(testCss, /\.er-report-synthesis/);
  assert.match(testCss, /\.er-report-summary-strip/);
});

test('premium report evidence section puts interpretation before score charts', () => {
  assert.match(testJs, /function buildReportEvidenceCopy/);
  assert.match(testJs, /id="report-evidence"/);
  assert.match(testJs, /왜 이 결과가 나왔는가/);
  assert.match(testJs, /href="#report-evidence"/);
  assert.match(testJs, /class="er-report-panel-lead"/);
  assert.match(testJs, /coreScoreForWing/);
  assert.match(testJs, /Number\.isFinite\(Number\(row\.percent\)\)/);
  assert.match(testCss, /\.er-report-panel-lead/);
});

test('diagnostic report content includes synthesis copy for all 27 subtype families', () => {
  assert.match(reportContentJs, /const CORE_SYNTHESIS/);
  assert.match(reportContentJs, /const SUBTYPE_SYNTHESIS/);
  assert.match(reportContentJs, /const WING_SYNTHESIS/);
  assert.match(reportContentJs, /const REPORT_SYNTHESIS/);
  [
    'sp_1', 'so_1', 'sx_1',
    'sp_2', 'so_2', 'sx_2',
    'sp_3', 'so_3', 'sx_3',
    'sp_4', 'so_4', 'sx_4',
    'sp_5', 'so_5', 'sx_5',
    'sp_6', 'so_6', 'sx_6',
    'sp_7', 'so_7', 'sx_7',
    'sp_8', 'so_8', 'sx_8',
    'sp_9', 'so_9', 'sx_9'
  ].forEach((key) => {
    assert.match(reportContentJs, new RegExp(`${key}:\\s*\\{`), `${key} should have subtype synthesis copy`);
  });
  [
    '1w9', '1w2', '2w1', '2w3', '3w2', '3w4',
    '4w3', '4w5', '5w4', '5w6', '6w5', '6w7',
    '7w6', '7w8', '8w7', '8w9', '9w8', '9w1'
  ].forEach((key) => {
    assert.match(reportContentJs, new RegExp(`"${key}":\\s*\\{`), `${key} should have wing synthesis modifier`);
  });
  assert.match(reportContentJs, /sx_7w8/);
  assert.match(reportContentJs, /성적\/일대일 7w8 조합/);
  assert.match(reportContentJs, /sp_4w5/);
  assert.match(reportContentJs, /자기보존 4w5 조합/);
  assert.match(reportContentJs, /so_9w8/);
  assert.match(reportContentJs, /사회적 9w8 조합/);
  assert.match(reportContentJs, /getSynthesis/);
});

test('premium report Life Application Growth sections are density-compressed', () => {
  assert.match(testJs, /const list = \(items, limit = Infinity\) => \(items \|\| \[\]\)\.slice\(0, limit\)/);
  assert.match(testJs, /const actionRows = \(c\.actionPlan \|\| \[\]\)\.slice\(0, 2\)/);
  assert.match(testJs, /roadmap\(c\.roadmap, 3\)/);
  assert.match(testJs, /step\.bullets\.filter\(Boolean\)\.slice\(0, 2\)/);
  assert.doesNotMatch(testJs, /마음을 돌이키는 방향/);
});

test('premium report final consultation CTA always routes to result_consult', () => {
  assert.match(testJs, /const finalCtaProgramKey = 'result_consult';/);
  assert.match(testJs, /class="er-report-final-primary" data-report-program-key="\$\{escapeReportHtml\(finalCtaProgramKey\)\}"/);
  assert.match(testJs, /root\.querySelectorAll\('\[data-report-program-key\]'\)/);
  assert.match(testJs, /window\.ERProgramCatalog\.buildApplyPayload\(key\)/);
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
  // 장형: 얼어붙기만 쓰지 말고 행동 충동(맞선다/참는다/물러난다)을 묻는다.
  assert.doesNotMatch(centerBlock, /굳는다|움츠러들/);
  assert.match(centerBlock, /맞설지, 참을지, 물러날지|밀어붙일지|따질지/);
  // 질문 줄기에 프라이밍을 넣지 않는다. 센터 차이는 선택지에서만.
  assert.doesNotMatch(centerBlock, /의식적으로 판단하기 전에|머리로 정리하기 전에|돌이켜보면/);
  // Heart는 인정욕구가 아니라 수치심·정체성 감정.
  assert.match(centerBlock, /창피하거나|부끄럽거나|잘못된 사람처럼/);
  assert.doesNotMatch(centerBlock, /인정받은|존재로 받아들여|가치를 깎아내린/);
  assert.match(centerBlock, /회의나 대화에서 내 의견이 잘 받아들여지지 않았을 때/);
  assert.match(centerBlock, /생각보다 차갑게 대하거나 거절했을 때/);
  assert.match(centerBlock, /일이 예상과 다르게 틀어졌을 때/);
  // A/B 강제선택에는 억지 선택을 막는 비채점 옵션.
  assert.match(testJs, /둘 다 아니다 \(비채점\)/);
  assert.match(testJs, /if \(raw === 'U'\) return;/);
  assert.match(testJs, /if \(choice === 'U'\) return;/);

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
  assert.match(phase1Block, /강하게 끌리는 사람이나 에너지가 쏠리는 대상/);
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

test('premium report print styles compress pages without forcing every section to stay intact', () => {
  assert.match(testCss, /@media print/);
  assert.match(testCss, /@page\s*\{/);
  assert.match(testCss, /\.er-report-section\s*\{\s*break-inside:\s*auto;/);
  assert.match(testCss, /\.er-report-executive-grid article,[\s\S]*?break-inside:\s*avoid;/);
  assert.match(testCss, /\.er-report-confidence-grid\s*\{[\s\S]*?grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/);
});

test('premium report PDF download applies export-only compression styles', () => {
  assert.match(testJs, /target\.querySelector\('\.er-premium-report'\)/);
  assert.match(testJs, /report\.classList\.add\('er-pdf-export'\)/);
  assert.match(testJs, /requestAnimationFrame/);
  assert.match(testJs, /report\.classList\.remove\('er-pdf-export'\)/);
  assert.match(testCss, /\.er-premium-report\.er-pdf-export/);
  assert.match(testCss, /\.er-premium-report\.er-pdf-export \.er-report-nav,[\s\S]*?display:\s*none;/);
  assert.match(testCss, /\.er-premium-report\.er-pdf-export \.er-report-confidence-grid\s*\{[\s\S]*?grid-template-columns:\s*0\.9fr 1\.1fr 1\.1fr/);
  assert.match(testCss, /\.er-premium-report\.er-pdf-export \.er-report-synthesis-grid\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/);
});

test('premium report named background sections override alternating section backgrounds', () => {
  assert.match(testCss, /\.er-report-section\.er-report-application\s*\{/);
  assert.match(testCss, /\.er-report-section\.er-report-growth\s*\{/);
  assert.match(testCss, /\.er-report-section\.er-report-next\s*\{/);
});

test('low confidence result hides the report and routes to a typing session gate', () => {
  assert.match(testJs, /function renderLowConfidenceGate\(/);
  assert.match(testJs, /if \(confidence === '낮음'\) \{\s*renderLowConfidenceGate\(premiumModel\);\s*\} else \{\s*renderPremiumReport\(premiumModel\);\s*\}/);
  assert.match(testJs, /er-report-gate[\s\S]*?data-report-program-key="identity_session"/);
  assert.match(testJs, /처음부터 다시 검사하기/);
  assert.doesNotMatch(testJs, /id="cta-consulting"/);
  assert.match(testCss, /\.er-report-gate-session\s*\{/);
  assert.match(testCss, /\.er-report-gate-primary\s*\{/);
});

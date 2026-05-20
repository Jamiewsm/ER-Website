// ER 에니어그램 테스트 스코어링 helper — wing %, instinct %, 27 subtype 산출 (Phase 3)
// pure functions, 브라우저 + Node.js 호환.

// === Wing % ===
//
// 두 wing 간 상대 우세를 0-100 으로 표현. 0 = 균등, 100 = 한쪽만.
// 50% 는 한쪽 wing 이 다른 쪽의 약 3배 강도 (75% : 25%).
//
// 입력:
//   coreType: 1-9
//   scores: { 1..9: number }  (각 type 의 누적 점수)
// 출력:
//   { wing: number|null, pct: 0-100 }
function computeWingPct(coreType, scores) {
  const left = coreType === 1 ? 9 : coreType - 1;
  const right = coreType === 9 ? 1 : coreType + 1;
  const leftScore = scores[left] || 0;
  const rightScore = scores[right] || 0;
  if (leftScore === 0 && rightScore === 0) return { wing: null, pct: 0 };
  const dominantWing = leftScore >= rightScore ? left : right;
  const dom = Math.max(leftScore, rightScore);
  const oth = Math.min(leftScore, rightScore);
  const total = dom + oth;
  if (total === 0) return { wing: null, pct: 0 };
  // [0.5, 1.0] -> [0%, 100%]
  const raw = (dom / total - 0.5) * 200;
  const pct = Math.max(0, Math.min(100, Math.round(raw)));
  return { wing: dominantWing, pct };
}

// === Instinct % ===
//
// 각 본능 (sp/sx/so) 의 절대 강도. 응답된 문항으로 정규화.
// 결과는 서로 독립 (합 100% 아님).
//
// 입력:
//   responses: { [qId]: 'A' | 'B' | '1'..'6' | 'U' | undefined }
//   q1: phase 1 question array (각 항목에 .inst = 'sp'|'sx'|'so'|undefined)
// 출력:
//   { sp: 0-100, sx: 0-100, so: 0-100 }
function computeInstinctPct(responses, q1) {
  const buckets = { sp: { sum: 0, count: 0 }, sx: { sum: 0, count: 0 }, so: { sum: 0, count: 0 } };
  q1.forEach((q) => {
    if (!q.inst) return;
    const raw = responses[q.id];
    if (raw === 'U' || raw === undefined || raw === null) return;
    const score = Number(raw);
    if (!Number.isFinite(score)) return;
    if (!buckets[q.inst]) return;
    buckets[q.inst].sum += score;
    buckets[q.inst].count += 1;
  });
  const norm = (b) => (b.count === 0 ? 0 : Math.round((b.sum / (b.count * 6)) * 100));
  return { sp: norm(buckets.sp), sx: norm(buckets.sx), so: norm(buckets.so) };
}

// === 27 Subtype + Countertype ===
//
// Phase 1 source_page_index.md countertype 빠른 색인 + Phase 2 subtypes_27.md 기준.
// 9 countertype: sx_1, sp_2, sp_3, sp_4, sx_5, sx_6, so_7, so_8, so_9.
const COUNTERTYPES = {
  1: 'sx',  // Sexual 1 - Zeal
  2: 'sp',  // Self-Preservation 2 - Privilege
  3: 'sp',  // Self-Preservation 3 - Security
  4: 'sp',  // Self-Preservation 4 - Tenacity
  5: 'sx',  // Sexual 5 - Confidence
  6: 'sx',  // Sexual 6 - Strength/Beauty
  7: 'so',  // Social 7 - Sacrifice
  8: 'so',  // Social 8 - Solidarity
  9: 'so',  // Social 9 - Participation
};

// 1차 본능 결정. tie 시 sx > sp > so (Chestnut 의 sx countertype 빈도).
function computeDominantInstinct(instinctPct) {
  const { sp, sx, so } = instinctPct;
  const max = Math.max(sp, sx, so);
  if (max === 0) return null;
  if (sx === max) return 'sx';
  if (sp === max) return 'sp';
  return 'so';
}

function compute27Subtype(coreType, dominantInstinct) {
  if (!coreType || !dominantInstinct) return null;
  return `${dominantInstinct}_${coreType}`;
}

function isCountertype(coreType, dominantInstinct) {
  if (!coreType || !dominantInstinct) return false;
  return COUNTERTYPES[coreType] === dominantInstinct;
}

// === 통합 결과 함수 ===
//
// 모든 스코어링 함수를 묶어서 단일 결과 객체 반환.
//
// 입력:
//   { coreType: 1-9, scores: {1..9: number}, responses: {...}, q1: phase1 question array }
// 출력:
//   {
//     coreType, wing, instinctPct, dominantInstinct, subtype, countertype, formatted
//   }
function computeResult({ coreType, scores, responses, q1 }) {
  const wing = computeWingPct(coreType, scores);
  const instinctPct = computeInstinctPct(responses, q1);
  const dominantInstinct = computeDominantInstinct(instinctPct);
  const subtype = compute27Subtype(coreType, dominantInstinct);
  const countertype = isCountertype(coreType, dominantInstinct);
  return {
    coreType,
    wing,
    instinctPct,
    dominantInstinct,
    subtype,
    countertype,
    formatted: formatResult(coreType, wing, instinctPct),
  };
}

// 결과 포맷 — `<core> w<wing>(<%>) <inst1>(<%>) <inst2>(<%>) <inst3>(<%>)` 또는 `<core> (순수) ...`.
function formatResult(coreType, wing, instinctPct) {
  const wingStr = wing && wing.wing !== null ? `w${wing.wing}(${wing.pct}%)` : '(순수)';
  const instArr = ['sp', 'sx', 'so']
    .map((k) => ({ k, v: instinctPct[k] }))
    .sort((a, b) => b.v - a.v);
  const instStr = instArr.map((i) => `${i.k}(${i.v}%)`).join(' ');
  return `${coreType} ${wingStr} ${instStr}`.trim();
}

// === 모듈 export (브라우저 + Node 호환) ===
const TestScoring = {
  computeWingPct,
  computeInstinctPct,
  computeDominantInstinct,
  compute27Subtype,
  isCountertype,
  COUNTERTYPES,
  computeResult,
  formatResult,
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TestScoring;
}
if (typeof window !== 'undefined') {
  window.TestScoring = Object.assign(window.TestScoring || {}, TestScoring);
}

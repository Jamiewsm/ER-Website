// Enneagram 진단테스트 시뮬레이션 — 27 subtype + countertype + edge case 검증.
// 실행 — `node tests/simulate.mjs`. 출력 — 케이스별 PASS/FAIL + 상세.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const scoring = require('../js/test-scoring.js');
const subdata = require('../js/subtypes-27-data.js');

const Q1_INSTINCT = [
  { id: 'i_sp_1', inst: 'sp' }, { id: 'i_sp_2', inst: 'sp' }, { id: 'i_sp_3', inst: 'sp' },
  { id: 'i_sx_1', inst: 'sx' }, { id: 'i_sx_2', inst: 'sx' }, { id: 'i_sx_3', inst: 'sx' },
  { id: 'i_so_1', inst: 'so' }, { id: 'i_so_2', inst: 'so' }, { id: 'i_so_3', inst: 'so' },
];

// 본능 응답 생성 helper — 점수 1-6.
function instResponses({ sp = 1, sx = 1, so = 1 }) {
  return {
    i_sp_1: String(sp), i_sp_2: String(sp), i_sp_3: String(sp),
    i_sx_1: String(sx), i_sx_2: String(sx), i_sx_3: String(sx),
    i_so_1: String(so), i_so_2: String(so), i_so_3: String(so),
  };
}

// Type 점수 생성 — core 가장 높고 wing 들이 보조, 나머지 낮음.
function typeScores(core, leftWing, rightWing) {
  const s = {};
  for (let i = 1; i <= 9; i++) s[i] = 1;
  s[core] = 30;
  const l = core === 1 ? 9 : core - 1;
  const r = core === 9 ? 1 : core + 1;
  s[l] = leftWing;
  s[r] = rightWing;
  return s;
}

const cases = [
  // === 9 countertype 케이스 — 가장 어려운 진단 ===
  { name: 'sx_1 Zeal (countertype)', core: 1, wings: [10, 20], inst: { sp: 1, sx: 6, so: 2 }, expect: { subtype: 'sx_1', countertype: true } },
  { name: 'sp_2 Privilege (countertype)', core: 2, wings: [20, 10], inst: { sp: 6, sx: 2, so: 2 }, expect: { subtype: 'sp_2', countertype: true } },
  { name: 'sp_3 Security (countertype)', core: 3, wings: [10, 20], inst: { sp: 6, sx: 2, so: 3 }, expect: { subtype: 'sp_3', countertype: true } },
  { name: 'sp_4 Tenacity (countertype)', core: 4, wings: [20, 10], inst: { sp: 6, sx: 3, so: 2 }, expect: { subtype: 'sp_4', countertype: true } },
  { name: 'sx_5 Confidence (countertype)', core: 5, wings: [15, 15], inst: { sp: 2, sx: 6, so: 2 }, expect: { subtype: 'sx_5', countertype: true } },
  { name: 'sx_6 Strength/Beauty (countertype)', core: 6, wings: [10, 20], inst: { sp: 2, sx: 6, so: 3 }, expect: { subtype: 'sx_6', countertype: true } },
  { name: 'so_7 Sacrifice (countertype)', core: 7, wings: [10, 20], inst: { sp: 3, sx: 2, so: 6 }, expect: { subtype: 'so_7', countertype: true } },
  { name: 'so_8 Solidarity (countertype)', core: 8, wings: [20, 10], inst: { sp: 2, sx: 3, so: 6 }, expect: { subtype: 'so_8', countertype: true } },
  { name: 'so_9 Participation (countertype)', core: 9, wings: [15, 15], inst: { sp: 2, sx: 2, so: 6 }, expect: { subtype: 'so_9', countertype: true } },

  // === 일반 subtype 18 케이스 (countertype 아닌 것들 샘플) ===
  { name: 'sp_1 Worry', core: 1, wings: [25, 15], inst: { sp: 6, sx: 2, so: 3 }, expect: { subtype: 'sp_1', countertype: false } },
  { name: 'so_1 Non-Adaptability', core: 1, wings: [20, 20], inst: { sp: 2, sx: 2, so: 6 }, expect: { subtype: 'so_1', countertype: false } },
  { name: 'so_2 Ambition', core: 2, wings: [15, 25], inst: { sp: 2, sx: 3, so: 6 }, expect: { subtype: 'so_2', countertype: false } },
  { name: 'sx_2 Aggressive/Seductive', core: 2, wings: [15, 25], inst: { sp: 2, sx: 6, so: 3 }, expect: { subtype: 'sx_2', countertype: false } },
  { name: 'so_3 Prestige', core: 3, wings: [10, 25], inst: { sp: 2, sx: 3, so: 6 }, expect: { subtype: 'so_3', countertype: false } },
  { name: 'sx_3 Charisma', core: 3, wings: [10, 25], inst: { sp: 2, sx: 6, so: 3 }, expect: { subtype: 'sx_3', countertype: false } },
  { name: 'so_4 Shame', core: 4, wings: [25, 10], inst: { sp: 3, sx: 2, so: 6 }, expect: { subtype: 'so_4', countertype: false } },
  { name: 'sx_4 Competition', core: 4, wings: [25, 10], inst: { sp: 2, sx: 6, so: 3 }, expect: { subtype: 'sx_4', countertype: false } },
  { name: 'sp_5 Castle', core: 5, wings: [15, 15], inst: { sp: 6, sx: 2, so: 3 }, expect: { subtype: 'sp_5', countertype: false } },
  { name: 'so_5 Totem', core: 5, wings: [15, 15], inst: { sp: 2, sx: 3, so: 6 }, expect: { subtype: 'so_5', countertype: false } },
  { name: 'sp_6 Warmth', core: 6, wings: [15, 25], inst: { sp: 6, sx: 2, so: 3 }, expect: { subtype: 'sp_6', countertype: false } },
  { name: 'so_6 Duty', core: 6, wings: [15, 25], inst: { sp: 2, sx: 3, so: 6 }, expect: { subtype: 'so_6', countertype: false } },
  { name: 'sp_7 Keeper of the Castle', core: 7, wings: [10, 25], inst: { sp: 6, sx: 2, so: 3 }, expect: { subtype: 'sp_7', countertype: false } },
  { name: 'sx_7 Suggestibility', core: 7, wings: [10, 25], inst: { sp: 2, sx: 6, so: 3 }, expect: { subtype: 'sx_7', countertype: false } },
  { name: 'sp_8 Satisfaction', core: 8, wings: [10, 25], inst: { sp: 6, sx: 2, so: 3 }, expect: { subtype: 'sp_8', countertype: false } },
  { name: 'sx_8 Possession', core: 8, wings: [25, 10], inst: { sp: 2, sx: 6, so: 3 }, expect: { subtype: 'sx_8', countertype: false } },
  { name: 'sp_9 Appetite', core: 9, wings: [15, 15], inst: { sp: 6, sx: 2, so: 3 }, expect: { subtype: 'sp_9', countertype: false } },
  { name: 'sx_9 Fusion', core: 9, wings: [15, 15], inst: { sp: 2, sx: 6, so: 3 }, expect: { subtype: 'sx_9', countertype: false } },

  // === Edge cases ===
  { name: 'All instincts U (skipped)', core: 7, wings: [10, 25], inst: null, responsesOverride: {
    i_sp_1: 'U', i_sp_2: 'U', i_sp_3: 'U',
    i_sx_1: 'U', i_sx_2: 'U', i_sx_3: 'U',
    i_so_1: 'U', i_so_2: 'U', i_so_3: 'U',
  }, expect: { subtype: null, countertype: false } },
  { name: 'Balanced wings (no wing dominant)', core: 5, wings: [20, 20], inst: { sp: 5, sx: 3, so: 3 }, expect: { subtype: 'sp_5', wingPct: 0 } },
  { name: 'Single-direction wing (other = 0)', core: 7, wings: [0, 30], inst: { sp: 5, sx: 3, so: 3 }, expect: { subtype: 'sp_7', wingPct: 100 } },
  { name: 'Tie sp/sx (sx wins tie)', core: 3, wings: [20, 10], inst: { sp: 5, sx: 5, so: 2 }, expect: { dominantInstinct: 'sx', subtype: 'sx_3' } },
  { name: 'Tie sp/so (sp wins tie)', core: 3, wings: [20, 10], inst: { sp: 5, sx: 2, so: 5 }, expect: { dominantInstinct: 'sp', subtype: 'sp_3', countertype: true } },
  { name: 'All instincts equal high (sx wins)', core: 5, wings: [15, 15], inst: { sp: 5, sx: 5, so: 5 }, expect: { dominantInstinct: 'sx', subtype: 'sx_5', countertype: true } },
  { name: 'Wing edge — Type 1 (left=9)', core: 1, wings: [25, 5], inst: { sp: 5, sx: 2, so: 2 }, expect: { wingType: 9 } },
  { name: 'Wing edge — Type 9 (right=1)', core: 9, wings: [5, 25], inst: { sp: 5, sx: 2, so: 2 }, expect: { wingType: 1 } },
];

function runCase(c) {
  const responses = c.responsesOverride || instResponses(c.inst);
  const scores = typeScores(c.core, c.wings[0], c.wings[1]);
  const result = scoring.computeResult({
    coreType: c.core, scores, responses, q1: Q1_INSTINCT
  });
  const issues = [];
  const e = c.expect;
  if (e.subtype !== undefined && result.subtype !== e.subtype) {
    issues.push(`subtype: expected=${e.subtype}, got=${result.subtype}`);
  }
  if (e.countertype !== undefined && result.countertype !== e.countertype) {
    issues.push(`countertype: expected=${e.countertype}, got=${result.countertype}`);
  }
  if (e.dominantInstinct !== undefined && result.dominantInstinct !== e.dominantInstinct) {
    issues.push(`dominantInstinct: expected=${e.dominantInstinct}, got=${result.dominantInstinct}`);
  }
  if (e.wingType !== undefined && result.wing.wing !== e.wingType) {
    issues.push(`wing.wing: expected=${e.wingType}, got=${result.wing.wing}`);
  }
  if (e.wingPct !== undefined && result.wing.pct !== e.wingPct) {
    issues.push(`wing.pct: expected=${e.wingPct}, got=${result.wing.pct}`);
  }
  // 추가 검증 — subtype 가 SUBTYPES_27 에서 lookup 되는지
  let lookupOk = true;
  if (result.subtype && !subdata.SUBTYPES_27[result.subtype]) {
    issues.push(`SUBTYPES_27 lookup failed: ${result.subtype}`);
    lookupOk = false;
  }
  return { pass: issues.length === 0, issues, result, lookupOk };
}

let passes = 0, fails = 0;
const failureDetails = [];

console.log('# Enneagram Test Simulation Report\n');
console.log('| # | Case | Result | Formatted | Lookup |');
console.log('|---:|---|---|---|---|');

cases.forEach((c, i) => {
  const r = runCase(c);
  const status = r.pass ? '✅ PASS' : '❌ FAIL';
  const lookupStr = c.expect.subtype === null ? 'N/A' : (r.lookupOk ? '✓' : '✗');
  console.log(`| ${i+1} | ${c.name} | ${status} | \`${r.result.formatted}\` | ${lookupStr} |`);
  if (r.pass) passes++;
  else { fails++; failureDetails.push({ name: c.name, issues: r.issues, formatted: r.result.formatted }); }
});

console.log(`\n## Summary\n`);
console.log(`- Total: ${cases.length}`);
console.log(`- Pass: ${passes}`);
console.log(`- Fail: ${fails}`);

if (failureDetails.length > 0) {
  console.log(`\n## Failures\n`);
  failureDetails.forEach((f) => {
    console.log(`### ${f.name}`);
    console.log(`- formatted: \`${f.formatted}\``);
    f.issues.forEach((i) => console.log(`- ${i}`));
    console.log('');
  });
}

// 추가 — 27 subtype 매트릭스 검증 — SUBTYPES_27 데이터 일관성
console.log(`\n## SUBTYPES_27 Data Integrity\n`);
const keys = Object.keys(subdata.SUBTYPES_27);
console.log(`- entry count: ${keys.length} (expected 27)`);
const ctypes = keys.filter((k) => subdata.SUBTYPES_27[k].countertype);
console.log(`- countertype count: ${ctypes.length} (expected 9)`);
console.log(`- countertypes: ${ctypes.sort().join(', ')}`);

// 각 entry 의 슬롯 완전성 확인
const requiredSlots = ['preoccupation', 'defense', 'signatures', 'shadow', 'sisterDifferences', 'confusedWith', 'seedWords', 'description'];
const slotIssues = [];
keys.forEach((k) => {
  const e = subdata.SUBTYPES_27[k];
  requiredSlots.forEach((s) => {
    if (e[s] == null || (Array.isArray(e[s]) && e[s].length === 0) ||
        (typeof e[s] === 'string' && e[s].trim() === '') ||
        (typeof e[s] === 'object' && !Array.isArray(e[s]) && Object.keys(e[s]).length === 0)) {
      slotIssues.push(`${k}: empty/missing ${s}`);
    }
  });
});
console.log(`- slot issues: ${slotIssues.length}`);
slotIssues.forEach((i) => console.log(`  - ${i}`));

// 27 subtype 의 signatures 길이 (3 권장)
const sigIssues = [];
keys.forEach((k) => {
  const sigs = subdata.SUBTYPES_27[k].signatures;
  if (!Array.isArray(sigs) || sigs.length !== 3) {
    sigIssues.push(`${k}: signatures count = ${Array.isArray(sigs) ? sigs.length : 'not array'}`);
  }
});
console.log(`- signature count issues (expected 3 each): ${sigIssues.length}`);
sigIssues.forEach((i) => console.log(`  - ${i}`));

// 각 countertype 의 confusedWith 가 비어있지 않은지
const confIssues = [];
keys.forEach((k) => {
  const e = subdata.SUBTYPES_27[k];
  if (!e.confusedWith || e.confusedWith.length < 20) {
    confIssues.push(`${k}: confusedWith too short = "${e.confusedWith}"`);
  }
});
console.log(`- confusedWith issues (length < 20 char): ${confIssues.length}`);
confIssues.forEach((i) => console.log(`  - ${i}`));

process.exit(fails > 0 || slotIssues.length > 0 || sigIssues.length > 0 ? 1 : 0);

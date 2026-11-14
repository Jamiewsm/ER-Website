#!/usr/bin/env node
// 검사 버전과 평가 출처를 구분해 체감 일치와 상담 자기보고 일치를 분석한다.
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const COUNTERTYPES = new Set(['sx_1', 'sp_2', 'sp_3', 'sp_4', 'sx_5', 'sx_6', 'so_7', 'so_8', 'so_9']);

function usage() {
  return [
    'Usage:',
    '  node scripts/analyze_diagnostic_experiments.mjs --fixture tests/fixtures/diagnostic-experiments.sample.json',
    '',
    'Input: Supabase diagnostic_experiment_sessions or diagnostic_result_feedback rows exported as a JSON array.'
  ].join('\n');
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--fixture' || arg === '--input') {
      out.input = argv[i + 1];
      i += 1;
    } else if (arg === '--help' || arg === '-h') {
      out.help = true;
    }
  }
  return out;
}

function normalizeCore(value) {
  if (value === undefined || value === null || value === '') return null;
  const match = String(value).match(/^[1-9]$/);
  return match ? Number(match[0]) : null;
}

function normalizeSubtype(value, coreHint) {
  if (value === undefined || value === null) return null;
  const text = String(value).trim().toLowerCase();
  const core = normalizeCore(coreHint);
  if (!core) return null;
  const combined = text.match(/^(sp|sx|so)[_\-\s]*([1-9])$/);
  if (combined) return Number(combined[2]) === core ? `${combined[1]}_${core}` : null;
  const bare = text.match(/^(sp|sx|so)$/);
  if (!bare) return null;
  return core ? `${bare[1]}_${core}` : null;
}

function getExperimentPayload(row) {
  return row?.result_summary?.experiment_payload || {};
}

function getFeedback(row) {
  return row?.result_summary?.feedback_detail || {};
}

function getPredictedCore(row) {
  const payload = getExperimentPayload(row);
  if ((payload.result?.coreResolved ?? row?.result_summary?.core_resolved) === false) return null;
  return normalizeCore(payload.result?.core ?? row?.result_summary?.core);
}

function getConfirmedCore(row) {
  const feedback = getFeedback(row);
  return normalizeCore(
    feedback?.reported_type?.core ?? feedback?.confirmed_type?.core ??
      row?.self_reported_core ??
      row?.known_core
  );
}

function getPredictedSubtype(row) {
  return normalizeSubtype(
    getExperimentPayload(row)?.result?.subtype ?? row?.result_summary?.subtype,
    getPredictedCore(row)
  );
}

function getConfirmedSubtype(row) {
  const feedback = getFeedback(row);
  return normalizeSubtype(
    feedback?.reported_type?.subtype ?? feedback?.confirmed_type?.subtype ??
      row?.self_reported_subtype ??
      row?.known_subtype,
    getConfirmedCore(row)
  );
}

function getConfidence(row) {
  const payload = getExperimentPayload(row);
  return String(payload?.result?.confidence ?? row?.result_summary?.confidence ?? '').trim();
}

function isLowConfidence(row) {
  const confidence = getConfidence(row).toLowerCase();
  return confidence.includes('낮') || confidence.includes('low');
}

function hasQualityFlag(row) {
  const quality = getExperimentPayload(row)?.responseQuality || row?.result_summary?.response_quality || null;
  if (!quality) return false;
  if (quality.level && quality.level !== 'good') return true;
  return Array.isArray(quality.flags) && quality.flags.length > 0;
}

function getTiePair(row) {
  const topPair = getExperimentPayload(row)?.topPair;
  if (!topPair) return null;
  const first = normalizeCore(topPair.first);
  const second = normalizeCore(topPair.second);
  if (!first || !second) return null;
  return `${first}-${second}`;
}

function increment(map, key) {
  if (!key) return;
  map.set(key, (map.get(key) || 0) + 1);
}

function pct(numerator, denominator) {
  if (!denominator) return 'N/A';
  return `${((numerator / denominator) * 100).toFixed(1)}%`;
}

function sortedEntries(map) {
  return [...map.entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])));
}

function summarize(rows) {
  const coreMatrix = new Map();
  const subtypeMatrix = new Map();
  const lowConfidence = { correct: 0, total: 0 };
  const qualityFlag = { correct: 0, total: 0 };
  const tiePair = new Map();
  const countertype = { miss: 0, total: 0, eligible: 0, unavailable: 0 };
  let usable = 0;
  let unresolved = 0;
  const initialRecall = { matched: 0, total: 0 };
  const reviewedRecall = { matched: 0, total: 0 };
  const candidateCoverage = { initial: { missing: 0, empty: 0 }, reviewed: { missing: 0, empty: 0 } };
  const ratings = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, deferred: 0, missing: 0 };
  const legacyRatings = {};
  const matching = {};
  const mismatching = {};
  const difficulties = {};
  const subtypeConditional = { matched: 0, total: 0, eligible: 0, unavailable: 0 };
  const subtypeCoverage = { eligible: 0, resolved: 0, unavailable: 0 };

  rows.forEach((row) => {
    const predictedCore = getPredictedCore(row);
    const confirmedCore = getConfirmedCore(row);
    const predictedSubtype = getPredictedSubtype(row);
    const confirmedSubtype = getConfirmedSubtype(row);

    const feedback = getFeedback(row);
    if (!predictedCore) unresolved += 1;
    if (feedback.deferred === true) ratings.deferred += 1;
    else if (Number.isInteger(feedback.rating) && feedback.rating >= 1 && feedback.rating <= 5) ratings[feedback.rating] += 1;
    else {
      ratings.missing += 1;
      if (['correct', 'ambiguous', 'incorrect'].includes(row.self_assessment)) legacyRatings[row.self_assessment] = (legacyRatings[row.self_assessment] || 0) + 1;
    }
    for (const [field, target, allowed] of [
      ['matching_parts', matching, ['core', 'subtype', 'wing', 'description']],
      ['mismatching_parts', mismatching, ['core', 'subtype', 'wing', 'description']],
      ['difficulties', difficulties, ['words', 'context', 'multiple', 'none_fit', 'length', 'none']],
    ]) for (const value of new Set(Array.isArray(feedback[field]) ? feedback[field] : [])) if (allowed.includes(value)) target[value] = (target[value] || 0) + 1;
    const payload = getExperimentPayload(row);
    const metadata = payload.assessmentMetadata || {};
    if (confirmedCore) for (const [candidates, target, coverage] of [
      [metadata.initialCandidates ?? payload.screening?.suggestedCandidates, initialRecall, candidateCoverage.initial],
      [metadata.reviewedCandidates ?? payload.screening?.candidates, reviewedRecall, candidateCoverage.reviewed],
    ]) {
      if (!Array.isArray(candidates)) { coverage.missing += 1; continue; }
      if (!candidates.length) coverage.empty += 1;
      target.total += 1;
      if (candidates.map(normalizeCore).includes(confirmedCore)) target.matched += 1;
    }
    // 보류 결과도 비교 대상 수에 남겨, 확정 사례만의 일치율이 개선으로 오해되지 않게 한다.
    if (confirmedSubtype) {
      subtypeCoverage.eligible += 1;
      if (predictedSubtype) subtypeCoverage.resolved += 1;
      else subtypeCoverage.unavailable += 1;
      if (COUNTERTYPES.has(confirmedSubtype)) {
        countertype.eligible += 1;
        if (predictedSubtype) {
          countertype.total += 1;
          if (predictedSubtype !== confirmedSubtype) countertype.miss += 1;
        } else countertype.unavailable += 1;
      }
    }
    if (!predictedCore || !confirmedCore) return;
    usable += 1;

    const coreCorrect = predictedCore === confirmedCore;
    increment(coreMatrix, `${predictedCore} -> ${confirmedCore}`);

    if (predictedSubtype && confirmedSubtype) {
      increment(subtypeMatrix, `${predictedSubtype} -> ${confirmedSubtype}`);
    }
    if (coreCorrect && confirmedSubtype) {
      subtypeConditional.eligible += 1;
      if (predictedSubtype) {
        subtypeConditional.total += 1;
        if (predictedSubtype === confirmedSubtype) subtypeConditional.matched += 1;
      } else subtypeConditional.unavailable += 1;
    }

    if (isLowConfidence(row)) {
      lowConfidence.total += 1;
      if (coreCorrect) lowConfidence.correct += 1;
    }

    if (hasQualityFlag(row)) {
      qualityFlag.total += 1;
      if (coreCorrect) qualityFlag.correct += 1;
    }

    const pair = getTiePair(row);
    if (pair) {
      const current = tiePair.get(pair) || { miss: 0, total: 0 };
      current.total += 1;
      if (!coreCorrect) current.miss += 1;
      tiePair.set(pair, current);
    }

  });

  return { submitted: rows.length, usable, unresolved, coreMatrix, subtypeMatrix, lowConfidence, qualityFlag, tiePair, countertype, initialRecall, reviewedRecall, candidateCoverage, subtypeConditional, subtypeCoverage, ratings, legacyRatings, matching, mismatching, difficulties };
}

function renderReport(summary) {
  const lines = [];
  lines.push('Participant-reported consultation comparison');
  lines.push(`submitted: ${summary.submitted}; unresolved core: ${summary.unresolved}`);
  lines.push(`felt agreement 1-5/deferred/missing ${JSON.stringify(summary.ratings)}`);
  lines.push(`legacy three-choice feedback (not converted) ${JSON.stringify(summary.legacyRatings)}`);
  for (const key of ['matching', 'mismatching', 'difficulties']) lines.push(`${key} ${JSON.stringify(summary[key])}`);
  for (const key of ['initialRecall', 'reviewedRecall', 'subtypeConditional']) lines.push(`${key} ${summary[key].matched}/${summary[key].total} (${pct(summary[key].matched, summary[key].total)})`);
  lines.push(`candidate coverage (known empty lists count as misses) ${JSON.stringify(summary.candidateCoverage)}`);
  lines.push(`subtype comparison coverage ${JSON.stringify(summary.subtypeCoverage)}`);
  lines.push(`subtypeConditional coverage eligible: ${summary.subtypeConditional.eligible}; resolved: ${summary.subtypeConditional.total}; deferred or missing: ${summary.subtypeConditional.unavailable}`);
  lines.push(`usable rows: ${summary.usable}`);
  lines.push('');
  lines.push('predicted_core -> participant_reported_core count');
  sortedEntries(summary.coreMatrix).forEach(([key, count]) => lines.push(`${key} ${count}`));
  lines.push('');
  lines.push('predicted_subtype -> participant_reported_subtype count');
  sortedEntries(summary.subtypeMatrix).forEach(([key, count]) => lines.push(`${key} ${count}`));
  lines.push('');
  lines.push(`low_confidence agreement ${summary.lowConfidence.correct}/${summary.lowConfidence.total} (${pct(summary.lowConfidence.correct, summary.lowConfidence.total)})`);
  lines.push(`quality_flag agreement ${summary.qualityFlag.correct}/${summary.qualityFlag.total} (${pct(summary.qualityFlag.correct, summary.qualityFlag.total)})`);
  lines.push('');
  lines.push('tie_pair disagreement rate');
  [...summary.tiePair.entries()]
    .sort((a, b) => b[1].total - a[1].total || String(a[0]).localeCompare(String(b[0])))
    .forEach(([key, value]) => {
      lines.push(`${key} ${value.miss}/${value.total} (${pct(value.miss, value.total)})`);
    });
  lines.push('');
  lines.push(`reported_countertype disagreement rate ${summary.countertype.miss}/${summary.countertype.total} (${pct(summary.countertype.miss, summary.countertype.total)})`);
  lines.push(`reported_countertype coverage eligible: ${summary.countertype.eligible}; resolved: ${summary.countertype.total}; deferred or missing: ${summary.countertype.unavailable}`);
  lines.push('');
  lines.push('weight change gate (historical minimums, not proof of validity)');
  lines.push('- require at least 100 usable rows before production weight changes');
  lines.push('- require at least 20 rows for the affected confusion pair, unless qualitative review documents a critical issue');
  lines.push('- require before/after replay to improve the target miss without increasing adjacent regressions');
  lines.push('- freeze versions and adoption criteria before a pilot; validate with separate data; never auto-update weights');
  return lines.join('\n');
}

function normalizeRow(row) {
  if (!(row.result && row.versions)) return row;
  // 공개 평가는 본인 체감만 수집한다. 상담 결과 필드를 만들어내지 않는다.
  return {
    id: row.id, created_at: row.created_at,
    result_summary: {
      experiment_payload: {
        result: { ...row.result, coreResolved: row.result.core_resolved },
        screening: { candidates: row.result.candidate_types },
        assessmentMetadata: { attemptId: row.attempt_id, revision: row.revision, versions: row.versions, variant: row.variant },
      },
      feedback_detail: { ...row, reported_type: {}, comparison_source: 'public_feedback' },
    },
  };
}

export function analyzeRows(rows) {
  const groups = new Map();
  const seen = new Set();
  let duplicates = 0;
  let invalid = 0;
  const ordered = rows.slice().sort((a, b) => String(a?.created_at || a?.completed_at || '').localeCompare(String(b?.created_at || b?.completed_at || '')));
  for (const input of ordered) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) { invalid += 1; continue; }
    const row = normalizeRow(input);
    const payload = getExperimentPayload(row);
    const metadata = payload.assessmentMetadata || {};
    const feedback = getFeedback(row);
    const source = feedback.comparison_source === 'public_feedback' ? 'public_feedback' : feedback.comparison_source === 'participant_report' ? 'participant_report' : 'legacy_participant_report';
    const id = metadata.attemptId ? source + ':' + metadata.attemptId + ':' + (metadata.revision ?? 0) : row.id ? source + ':row:' + row.id : null;
    if (id && seen.has(id)) { duplicates += 1; continue; }
    if (id) seen.add(id);
    const versions = metadata.versions || {};
    const group = Object.fromEntries(['assessment', 'instructions', 'questions', 'scoring', 'report', 'survey'].map((key) => [key,
      versions[key] || (key === 'assessment' ? payload.assessmentVersion : null) || (key === 'survey' ? feedback.survey_version : null) || 'unversioned'
    ]));
    Object.assign(group, { variant: metadata.variant || 'unspecified', source });
    const key = JSON.stringify(group);
    if (!groups.has(key)) groups.set(key, { group, rows: [] });
    groups.get(key).rows.push(row);
  }
  return { inputRows: rows.length, duplicates, invalid, groups: [...groups.values()].map(({ group, rows }) => ({ group, summary: summarize(rows) })) };
}

export function renderAnalysis(analysis) {
  return [
    'ER assessment feedback and comparison report',
    'Submitted records only. Felt agreement and participant reports are not validated accuracy.',
    'No completion rate, independent coach verification, or test-retest reliability is inferred.',
    'Repeated revisions are observations, not independent participants.',
    `input rows: ${analysis.inputRows}; duplicate submissions excluded: ${analysis.duplicates}; invalid rows: ${analysis.invalid}`,
    ...analysis.groups.map(({ group, summary }) => '\nGroup ' + JSON.stringify(group) + '\n' + renderReport(summary)),
  ].join('\n');
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.input) {
    console.log(usage());
    process.exitCode = args.help ? 0 : 1;
    return;
  }
  const rows = JSON.parse(readFileSync(args.input, 'utf8'));
  if (!Array.isArray(rows)) throw new Error('Input JSON must be an array of exported feedback or experiment rows.');
  console.log(renderAnalysis(analyzeRows(rows)));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();

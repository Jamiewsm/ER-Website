#!/usr/bin/env node
import { readFileSync } from 'node:fs';

const COUNTERTYPES = new Set(['sx_1', 'sp_2', 'sp_3', 'sp_4', 'sx_5', 'sx_6', 'so_7', 'so_8', 'so_9']);

function usage() {
  return [
    'Usage:',
    '  node scripts/analyze_diagnostic_experiments.mjs --fixture tests/fixtures/diagnostic-experiments.sample.json',
    '',
    'Input: Supabase diagnostic_experiment_sessions rows exported as a JSON array.'
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
  const match = String(value).match(/[1-9]/);
  return match ? Number(match[0]) : null;
}

function normalizeSubtype(value) {
  if (value === undefined || value === null) return null;
  const text = String(value).trim().toLowerCase();
  const match = text.match(/\b(sp|sx|so)[_\-\s]*([1-9])\b/);
  return match ? `${match[1]}_${match[2]}` : null;
}

function getExperimentPayload(row) {
  return row?.result_summary?.experiment_payload || {};
}

function getFeedback(row) {
  return row?.result_summary?.feedback_detail || {};
}

function getPredictedCore(row) {
  return normalizeCore(getExperimentPayload(row)?.result?.core ?? row?.result_summary?.core);
}

function getConfirmedCore(row) {
  const feedback = getFeedback(row);
  return normalizeCore(
    feedback?.confirmed_type?.core ??
      row?.self_reported_core ??
      row?.known_core ??
      row?.confirmed_core
  );
}

function getPredictedSubtype(row) {
  return normalizeSubtype(getExperimentPayload(row)?.result?.subtype ?? row?.result_summary?.subtype);
}

function getConfirmedSubtype(row) {
  const feedback = getFeedback(row);
  return normalizeSubtype(
    feedback?.confirmed_type?.subtype ??
      row?.self_reported_subtype ??
      row?.known_subtype ??
      row?.confirmed_subtype
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
  if (!denominator) return '0.0%';
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
  const countertype = { miss: 0, total: 0 };
  let usable = 0;

  rows.forEach((row) => {
    const predictedCore = getPredictedCore(row);
    const confirmedCore = getConfirmedCore(row);
    const predictedSubtype = getPredictedSubtype(row);
    const confirmedSubtype = getConfirmedSubtype(row);

    if (!predictedCore || !confirmedCore) return;
    usable += 1;

    const coreCorrect = predictedCore === confirmedCore;
    increment(coreMatrix, `${predictedCore} -> ${confirmedCore}`);

    if (predictedSubtype && confirmedSubtype) {
      increment(subtypeMatrix, `${predictedSubtype} -> ${confirmedSubtype}`);
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

    if (COUNTERTYPES.has(predictedSubtype) || COUNTERTYPES.has(confirmedSubtype)) {
      countertype.total += 1;
      if (predictedSubtype !== confirmedSubtype) countertype.miss += 1;
    }
  });

  return { usable, coreMatrix, subtypeMatrix, lowConfidence, qualityFlag, tiePair, countertype };
}

function renderReport(summary) {
  const lines = [];
  lines.push('ER diagnostic experiment analysis');
  lines.push(`usable rows: ${summary.usable}`);
  lines.push('');
  lines.push('predicted_core -> confirmed_core count');
  sortedEntries(summary.coreMatrix).forEach(([key, count]) => lines.push(`${key} ${count}`));
  lines.push('');
  lines.push('predicted_subtype -> confirmed_subtype count');
  sortedEntries(summary.subtypeMatrix).forEach(([key, count]) => lines.push(`${key} ${count}`));
  lines.push('');
  lines.push(`low_confidence accuracy ${summary.lowConfidence.correct}/${summary.lowConfidence.total} (${pct(summary.lowConfidence.correct, summary.lowConfidence.total)})`);
  lines.push(`quality_flag accuracy ${summary.qualityFlag.correct}/${summary.qualityFlag.total} (${pct(summary.qualityFlag.correct, summary.qualityFlag.total)})`);
  lines.push('');
  lines.push('tie_pair miss rate');
  [...summary.tiePair.entries()]
    .sort((a, b) => b[1].total - a[1].total || String(a[0]).localeCompare(String(b[0])))
    .forEach(([key, value]) => {
      lines.push(`${key} ${value.miss}/${value.total} (${pct(value.miss, value.total)})`);
    });
  lines.push('');
  lines.push(`countertype miss rate ${summary.countertype.miss}/${summary.countertype.total} (${pct(summary.countertype.miss, summary.countertype.total)})`);
  lines.push('');
  lines.push('weight change gate');
  lines.push('- require at least 100 usable rows before production weight changes');
  lines.push('- require at least 20 rows for the affected confusion pair, unless qualitative review documents a critical issue');
  lines.push('- require before/after replay to improve the target miss without increasing adjacent regressions');
  return lines.join('\n');
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.input) {
    console.log(usage());
    process.exit(args.help ? 0 : 1);
  }

  const rows = JSON.parse(readFileSync(args.input, 'utf8'));
  if (!Array.isArray(rows)) {
    throw new Error('Input JSON must be an array of diagnostic experiment rows.');
  }
  console.log(renderReport(summarize(rows)));
}

main();

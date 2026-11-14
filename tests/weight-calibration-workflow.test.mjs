import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { analyzeRows, renderAnalysis } from '../scripts/analyze_diagnostic_experiments.mjs';

const script = fileURLToPath(new URL('../scripts/analyze_diagnostic_experiments.mjs', import.meta.url));
const fixture = fileURLToPath(new URL('./fixtures/diagnostic-experiments.sample.json', import.meta.url));

test('diagnostic experiment analyzer reports calibration metrics', () => {
  const output = execFileSync(process.execPath, [script, '--fixture', fixture], {
    encoding: 'utf8'
  });

  assert.match(output, /predicted_core -> participant_reported_core count/);
  assert.match(output, /7 -> 9\s+1/);
  assert.match(output, /8 -> 6\s+1/);
  assert.match(output, /predicted_subtype -> participant_reported_subtype count/);
  assert.match(output, /sx_7 -> sp_9\s+1/);
  assert.match(output, /low_confidence agreement\s+0\/1 \(0\.0%\)/);
  assert.match(output, /quality_flag agreement\s+0\/2 \(0\.0%\)/);
  assert.match(output, /tie_pair disagreement rate/);
  assert.match(output, /7-9\s+1\/1 \(100\.0%\)/);
  assert.match(output, /reported_countertype disagreement rate\s+1\/2 \(50\.0%\)/);
  assert.match(output, /weight change gate/);
  assert.match(output, /usable rows:\s+4/);
});

function experiment({ attempt = 'attempt-a', revision = 0, scoring = 'review-v1', resolved = true, reported = '6', rating = 4, deferred = false } = {}) {
  return {
    result_summary: {
      experiment_payload: {
        result: { core: 6, coreResolved: resolved, subtype: null },
        assessmentMetadata: {
          attemptId: attempt, revision, variant: 'word',
          versions: { assessment: 'v2', scoring },
          initialCandidates: [1, 2, 3], reviewedCandidates: [1, 3, 6],
        },
      },
      feedback_detail: { survey_version: 'feedback-v1', rating, deferred, comparison_source: 'participant_report', reported_type: { core: reported } },
    },
  };
}

test('analysis separates versions and sources and excludes duplicate attempt revisions', () => {
  const rows = [experiment(), experiment(), experiment({ revision: 1 }), experiment({ attempt: 'b', scoring: 'review-v2' })];
  const analysis = analyzeRows(rows);
  assert.equal(analysis.duplicates, 1);
  assert.equal(analysis.groups.length, 2);
  assert.equal(analysis.groups[0].summary.submitted, 2);
  assert.equal(analysis.groups[1].summary.submitted, 1);
  assert.equal(analysis.groups[0].group.source, 'participant_report');
  assert.equal(analysis.groups[0].group.survey, 'feedback-v1');
});

test('candidate recall includes unresolved outcomes without calling them incorrect types', () => {
  const analysis = analyzeRows([experiment({ resolved: false })]);
  const summary = analysis.groups[0].summary;
  assert.equal(summary.usable, 0);
  assert.equal(summary.unresolved, 1);
  assert.deepEqual(summary.initialRecall, { matched: 0, total: 1 });
  assert.deepEqual(summary.reviewedRecall, { matched: 1, total: 1 });
  assert.match(renderAnalysis(analysis), /low_confidence agreement 0\/0 \(N\/A\)/);
});

test('public feedback is satisfaction data, not a consultation comparison or completion denominator', () => {
  const analysis = analyzeRows([{
    attempt_id: 'public-a', revision: 0, versions: { assessment: 'v2', survey: 'feedback-v1' }, variant: 'word',
    result: { core: 6, core_resolved: true, subtype: 'sp', wing: 5, candidate_types: [1, 3, 6] },
    rating: 5, deferred: false, matching_parts: ['description'],
    mismatching_parts: ['wing'], difficulties: ['words'], self_reported_core: '6',
  }]);
  const group = analysis.groups[0];
  assert.equal(group.group.source, 'public_feedback');
  assert.equal(group.summary.usable, 0);
  assert.equal(group.summary.ratings[5], 1);
  assert.deepEqual(group.summary.matching, { description: 1 });
  assert.deepEqual(group.summary.mismatching, { wing: 1 });
  assert.deepEqual(group.summary.difficulties, { words: 1 });
  assert.match(renderAnalysis(analysis), /No completion rate, independent coach verification, or test-retest reliability is inferred/);
});

test('deferred judgment, missing feedback, and legacy three-choice responses remain distinct', () => {
  const deferred = experiment({ rating: null, deferred: true });
  const missing = experiment({ attempt: 'b', rating: null });
  const legacy = { id: 'old', self_assessment: 'correct', self_reported_core: '6', result_summary: { core: 6 } };
  const analysis = analyzeRows([deferred, missing, legacy]);
  assert.equal(analysis.groups.length, 2);
  assert.equal(analysis.groups[0].summary.ratings.deferred, 1);
  assert.equal(analysis.groups[0].summary.ratings.missing, 1);
  assert.equal(analysis.groups[1].summary.ratings[5], 0);
  assert.deepEqual(analysis.groups[1].summary.legacyRatings, { correct: 1 });
});

test('malformed comparison types and unsupported standalone confirmed fields do not become ground truth', () => {
  const analysis = analyzeRows([null, [], experiment({ reported: '16' }), { confirmed_core: 6, result_summary: { core: 6 } }]);
  assert.equal(analysis.invalid, 2);
  assert.equal(analysis.groups.reduce((sum, group) => sum + group.summary.usable, 0), 0);
  assert.equal(analyzeRows([]).groups.length, 0);
});

test('known empty candidate sets count as misses while absent history remains missing', () => {
  const empty = experiment();
  empty.result_summary.experiment_payload.assessmentMetadata.initialCandidates = [];
  const hit = experiment({ attempt: 'b' });
  hit.result_summary.experiment_payload.assessmentMetadata.initialCandidates = [3, 6, 9];
  const missing = experiment({ attempt: 'c' });
  delete missing.result_summary.experiment_payload.assessmentMetadata.initialCandidates;
  const summary = analyzeRows([empty, hit, missing]).groups[0].summary;
  assert.deepEqual(summary.initialRecall, { matched: 1, total: 2 });
  assert.deepEqual(summary.candidateCoverage.initial, { missing: 1, empty: 1 });
});

test('subtype agreement exposes deferred outcomes including unresolved core results', () => {
  const rows = [experiment(), experiment({ attempt: 'b' }), experiment({ attempt: 'c', resolved: false })];
  for (const row of rows) row.result_summary.feedback_detail.reported_type.subtype = 'sx_6';
  rows[0].result_summary.experiment_payload.result.subtype = 'sx';
  // 미확정 유형에 남아 있는 오래된 하위유형도 확정값으로 읽지 않는다.
  rows[2].result_summary.experiment_payload.result.subtype = 'sx_6';
  const analysis = analyzeRows(rows);
  const summary = analysis.groups[0].summary;
  assert.deepEqual(summary.subtypeConditional, { matched: 1, total: 1, eligible: 2, unavailable: 1 });
  assert.deepEqual(summary.subtypeCoverage, { eligible: 3, resolved: 1, unavailable: 2 });
  assert.deepEqual(summary.countertype, { miss: 0, total: 1, eligible: 3, unavailable: 2 });
  assert.match(renderAnalysis(analysis), /reported_countertype coverage eligible: 3; resolved: 1; deferred or missing: 2/);
});

test('subtype codes must agree with their core and cannot contain unrelated text', () => {
  const rows = [experiment(), experiment({ attempt: 'b' }), experiment({ attempt: 'c' })];
  rows[0].result_summary.feedback_detail.reported_type.subtype = 'sx_9';
  rows[1].result_summary.feedback_detail.reported_type.subtype = 'maybe sx_6';
  rows[2].result_summary.feedback_detail.reported_type.subtype = 'sx_6';
  rows[2].result_summary.experiment_payload.result.subtype = 'sx_9';
  const summary = analyzeRows(rows).groups[0].summary;
  assert.deepEqual(summary.subtypeCoverage, { eligible: 1, resolved: 0, unavailable: 1 });
  assert.equal(summary.subtypeMatrix.size, 0);
});

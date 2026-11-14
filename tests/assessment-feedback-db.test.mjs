// 격리 Postgres에서 공개 평가 테이블의 역할별 권한과 추가 저장 제약을 검증한다.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const { PGlite } = await import(process.env.PGLITE_MODULE || new URL('./education/node_modules/@electric-sql/pglite/dist/index.js', import.meta.url).href);
const migration = await readFile(new URL('../supabase/migrations/20260928120000_diagnostic_result_feedback.sql', import.meta.url), 'utf8');
const insert = `INSERT INTO public.diagnostic_result_feedback
  (attempt_id,revision,result,versions,variant,rating,deferred,matching_parts,mismatching_parts,difficulties,consent_version,consent_accepted,body_fingerprint,challenge_fingerprint)
  VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING id,created_at`;
function values(overrides = {}) {
  const row = {
    attempt_id: '10000000-0000-4000-8000-000000000001', revision: 0,
    result: { core: 4, core_resolved: true, subtype: 'sp', wing: 5, candidate_types: [4, 6, 9] },
    versions: { assessment: 'word-narrative-v2', instructions: 'v1', questions: 'v2', scoring: 'v2', report: 'v1', survey: 'v1' },
    variant: 'word', rating: 4, deferred: false, matching_parts: ['core'], mismatching_parts: ['description'], difficulties: ['words'],
    consent_version: '2026-09-28-feedback-v1', consent_accepted: true, body_fingerprint: 'a'.repeat(64), challenge_fingerprint: 'b'.repeat(64),
    ...overrides,
  };
  return Object.values(row).map((value, index) => [2, 3].includes(index) ? JSON.stringify(value) : value);
}

test('migration grants only server SELECT/INSERT and preserves old rows across revisions', async () => {
  const db = new PGlite();
  try {
    await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS; GRANT USAGE ON SCHEMA public TO anon,authenticated,service_role;');
    await db.exec(migration);
    assert.equal((await db.query("SELECT relrowsecurity FROM pg_class WHERE relname='diagnostic_result_feedback'")).rows[0].relrowsecurity, true);
    for (const role of ['anon', 'authenticated']) {
      await db.exec(`SET ROLE ${role}`);
      await assert.rejects(db.query(insert, values()), /permission denied/);
      await assert.rejects(db.query('SELECT * FROM diagnostic_result_feedback'), /permission denied/);
      await assert.rejects(db.query('UPDATE diagnostic_result_feedback SET rating=1'), /permission denied/);
      await assert.rejects(db.query('DELETE FROM diagnostic_result_feedback'), /permission denied/);
      await db.exec('RESET ROLE');
    }
    await db.exec('SET ROLE service_role');
    const saved = await db.query(insert, values());
    assert.match(saved.rows[0].id, /^[a-f0-9-]{36}$/);
    assert.ok(saved.rows[0].created_at);
    await assert.rejects(db.query(insert, values({ challenge_fingerprint: 'c'.repeat(64) })), /unique constraint/);
    await assert.rejects(db.query(insert, values({ revision: 1 })), /unique constraint/, '같은 검증 토큰을 다른 revision에 재사용할 수 없다');
    await db.query(insert, values({ revision: 1, rating: 2, challenge_fingerprint: 'c'.repeat(64) }));
    assert.deepEqual((await db.query('SELECT rating FROM diagnostic_result_feedback ORDER BY revision')).rows.map((row) => row.rating), [4, 2]);
    await assert.rejects(db.query('UPDATE diagnostic_result_feedback SET rating=1'), /permission denied/);
    await assert.rejects(db.query('DELETE FROM diagnostic_result_feedback'), /permission denied/);

    for (const invalid of [
      { revision: -1 }, { rating: 0 }, { rating: 6 }, { rating: null }, { deferred: true },
      { consent_accepted: false }, { consent_version: 'old' }, { variant: 'legacy' },
      { matching_parts: ['unknown'] }, { mismatching_parts: ['core'] }, { difficulties: ['none', 'words'] },
      { difficulties: ['other'] }, { result: [] }, { versions: [] }, { body_fingerprint: 'not-a-hash' },
    ]) {
      await assert.rejects(db.query(insert, values({ revision: 2, challenge_fingerprint: 'd'.repeat(64), ...invalid })), /check constraint/, JSON.stringify(invalid));
    }
    for (const revision of [1.5, 2147483648]) {
      await assert.rejects(db.query(insert, values({ revision, challenge_fingerprint: 'd'.repeat(64) })), /invalid input syntax for type integer|out of range/, String(revision));
    }
    await db.query(insert, values({ revision: 2, rating: null, deferred: true, challenge_fingerprint: 'd'.repeat(64) }));
    await db.query(insert, values({ revision: 21, challenge_fingerprint: 'e'.repeat(64) }));
    await db.query(insert, values({ revision: 2147483647, challenge_fingerprint: 'f'.repeat(64) }));
    assert.equal((await db.query('SELECT count(*)::int AS count FROM diagnostic_result_feedback')).rows[0].count, 5);
  } finally { await db.close(); }
});

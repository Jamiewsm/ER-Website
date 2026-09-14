// 격리 Postgres에서 통합 안내의 영속 발송 선점과 기존 발송 기록 보존을 검증한다.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { createDB, asUser, users, uid } from './helpers/education-db.mjs';

test('발송 선점은 한 번만 성공하고 시간이 지나도 불확실한 발송을 다시 허용하지 않는다', async () => {
  const db = await createDB();
  try {
    await db.exec(`ALTER TABLE public.program_applications ADD COLUMN receipt_email_sent_at timestamptz, ADD COLUMN registration_email_sent_at timestamptz;
      REVOKE ALL ON public.program_applications FROM anon, authenticated;`);
    await db.query(`INSERT INTO public.program_applications(id,program_key,cohort_key,receipt_email_sent_at,registration_email_sent_at) VALUES
      ($1,'enneagram_basic_july','enneagram_basic_2026_10','2026-09-10',NULL),
      ($2,'enneagram_basic_july','enneagram_basic_2026_07','2026-07-01',NULL),
      ($3,'growth_101','growth-2026','2026-09-10',NULL),
      ($4,'enneagram_basic_july','enneagram_basic_2026_10',NULL,'2026-09-11'),
      ($5,'enneagram_basic_july','enneagram_basic_2026_10',NULL,NULL)`, [uid(100), uid(101), uid(102), uid(103), uid(104)]);
    const migration = await readFile(new URL('../supabase/migrations/20260915002000_application_confirmation_delivery_guard.sql', import.meta.url), 'utf8');
    await db.exec(migration);
    const rows = (await db.query('SELECT id,confirmation_email_sent_at FROM program_applications ORDER BY id')).rows;
    assert.ok(rows[0].confirmation_email_sent_at);
    assert.equal(rows[1].confirmation_email_sent_at, null, '과거 기수 접수는 10월 통합 안내로 추정하지 않는다');
    assert.equal(rows[2].confirmation_email_sent_at, null, '성장 일반 접수 확인을 결제 안내로 추정하지 않는다');
    assert.ok(rows[3].confirmation_email_sent_at);
    const claim = (id) => db.query(`UPDATE program_applications SET confirmation_email_attempted_at=now()
      WHERE id=$1 AND confirmation_email_attempted_at IS NULL AND confirmation_email_sent_at IS NULL RETURNING id`, [id]);
    assert.equal((await claim(uid(100))).rows.length, 0, '기존 발송 완료 기록을 보존한다');
    const results = await Promise.all([claim(uid(104)), claim(uid(104))]);
    assert.equal(results.reduce((count, result) => count + result.rows.length, 0), 1);
    await db.query("UPDATE program_applications SET confirmation_email_attempted_at='2020-01-01' WHERE id=$1", [uid(104)]);
    await db.exec(migration);
    assert.equal((await claim(uid(104))).rows.length, 0, '시간 경과와 재실행으로 선점이 풀리지 않는다');
    await asUser(db, users.head, async () => {
      await assert.rejects(claim(uid(104)), /permission denied/);
    });
    await asUser(db, null, async () => {
      await assert.rejects(claim(uid(104)), /permission denied/);
    });
  } finally { await db.close(); }
});

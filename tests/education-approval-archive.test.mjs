// 승인 목록 삭제·복구의 수석 권한과 기존 계정·결제·교육 기록 보존을 검증한다.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { asUser, createDB, uid, users } from './helpers/education-db.mjs';

const basic = 'enneagram_basic_july';
const cohort = 'enneagram_basic_2026_10';
const migration = '20260920001000_program_application_approval_archive.sql';
const source = file => readFile(new URL('../supabase/migrations/' + file, import.meta.url), 'utf8');
const ids = rows => rows.map(row => row.id).sort();

async function fixture() {
  // Use the real application schema and existing administrator RPCs, not simplified stand-ins.
  // Auth identities and Storage metadata remain local synthetic data.
  const db = await createDB({ beforeMigration: async database => {
    await database.exec('DROP TABLE program_applications');
    await database.exec(await source('20260611160000_program_applications.sql'));
    const coachAdmin = await source('20260305134500_add_coach_admin_rpc.sql');
    await database.exec(coachAdmin.slice(0, coachAdmin.indexOf('create or replace function public.admin_list_coach_candidates()')));
    await database.exec('REVOKE ALL ON FUNCTION public.require_head_coach() FROM PUBLIC');
    await database.exec(await source('20260611161000_program_applications_admin_rpc.sql'));
    // The historical application migration also updates unrelated notices; an empty table contains those writes.
    await database.exec(`CREATE TABLE public.public_notices(legacy_key integer,tag text,title text,summary text,
      body text,body_is_html boolean,program_period text,program_target text,apply_deadline date,updated_at timestamptz)`);
    await database.exec(await source('20260827135419_october_basic_course_cohort_payment_metadata.sql'));
  } });
  await db.exec('ALTER TABLE auth.users ADD COLUMN email_confirmed_at timestamptz; UPDATE auth.users SET email_confirmed_at=now()');
  for (const file of [
    '20260908091000_education_registration_capacity.sql',
    '20260915002000_application_confirmation_delivery_guard.sql',
    '20260915003000_education_onboarding.sql',
    '20260915003100_education_preparation_submission.sql',
    '20260919001000_education_welcome_pending_deadline.sql',
    migration,
  ]) await db.exec(await source(file));
  const application = async (number, options = {}) => {
    const row = {
      id: uid(number), name: '[합성] 신청자', contact: users.student.email,
      program_key: basic, cohort_key: cohort, status: 'received',
      created_at: new Date(Date.UTC(2026, 8, 1, 0, number % 60)).toISOString(), ...options,
    };
    await db.query(`INSERT INTO program_applications(id,name,contact,program_key,cohort_key,status,created_at)
      VALUES($1,$2,$3,$4,$5,$6,$7)`, [row.id, row.name, row.contact, row.program_key, row.cohort_key, row.status, row.created_at]);
    return row.id;
  };
  return { db, application };
}

test('수석은 신청 상태와 무관하게 승인 목록에서만 삭제하고 동일 신청서를 복구한다', async () => {
  const { db, application } = await fixture();
  try {
    const all = [];
    for (const [index, status] of ['received', 'contacted', 'payment_pending', 'confirmed', 'waitlisted', 'cancelled'].entries())
      all.push(await application(100 + index, { status }));
    const growth = await application(110, { program_key: 'growth_101', cohort_key: 'growth_2026' });
    const prior = await application(111, { cohort_key: 'enneagram_basic_2026_07' });
    const unchangedFields = row => {
      const { archived_at, archived_by, updated_at, ...rest } = row;
      return rest;
    };
    await asUser(db, users.head, async () => {
      const initial = (await db.query('SELECT * FROM admin_list_program_applications()')).rows;
      assert.equal(initial.length, 8);
      assert.ok(initial.every(row => row.archived_at === null && row.archived_by === null));
      const expected = initial.filter(row => all.includes(row.id));
      for (const row of expected) {
        const archived = (await db.query('SELECT * FROM admin_archive_program_application($1)', [row.id])).rows[0];
        assert.ok(archived.archived_at);
        assert.equal(archived.archived_by, users.head.id);
        assert.deepEqual(unchangedFields(archived), unchangedFields(row));
        assert.deepEqual((await db.query('SELECT * FROM admin_archive_program_application($1)', [row.id])).rows[0], archived,
          '반복 삭제는 최초 담당자와 삭제 시각 및 updated_at을 바꾸지 않는다');
      }
      assert.deepEqual(ids((await db.query('SELECT * FROM admin_list_program_applications()')).rows), [growth, prior].sort());
      assert.equal((await db.query('SELECT * FROM admin_list_program_applications_by_cohort($1,$2)', [basic, cohort])).rows.length, 0);
      assert.deepEqual(ids((await db.query('SELECT * FROM admin_list_archived_program_applications($1,500)', [basic])).rows), all.sort());
      assert.equal((await db.query('SELECT * FROM admin_list_archived_program_applications($1)', ['growth_101'])).rows.length, 0);
      for (const row of expected) {
        const restored = (await db.query('SELECT * FROM admin_restore_program_application($1)', [row.id])).rows[0];
        assert.equal(restored.archived_at, null);
        assert.equal(restored.archived_by, null);
        assert.deepEqual(unchangedFields(restored), unchangedFields(row));
        assert.deepEqual((await db.query('SELECT * FROM admin_restore_program_application($1)', [row.id])).rows[0], restored);
      }
      assert.deepEqual(ids((await db.query('SELECT * FROM admin_list_program_applications_by_cohort($1,$2)', [basic, cohort])).rows), all.sort());
      assert.equal((await db.query('SELECT * FROM admin_list_archived_program_applications()')).rows.length, 0);
      for (const fn of ['admin_archive_program_application', 'admin_restore_program_application']) {
        await assert.rejects(db.query(`SELECT ${fn}($1)`, [uid(999)]), { message: 'application_not_found', code: 'P0002' });
        await assert.rejects(db.query(`SELECT ${fn}(NULL)`), { message: 'application_not_found', code: 'P0002' });
      }
    });
  } finally { await db.close(); }
});

test('학생·일반 코치·비활성 수석·익명 사용자는 보관 목록과 삭제·복구를 호출하거나 직접 변경할 수 없다', async () => {
  const { db, application } = await fixture();
  try {
    const id = await application(120);
    const inactiveHead = { id: uid(121), email: 'inactive-head@example.test' };
    await db.query('INSERT INTO auth.users(id,email) VALUES($1,$2)', [inactiveHead.id, inactiveHead.email]);
    await db.query("INSERT INTO coach_profiles(user_id,role,is_active) VALUES($1,'head_coach',false)", [inactiveHead.id]);
    await asUser(db, users.head, () => db.query('SELECT admin_archive_program_application($1)', [id]));
    const methods = [
      ['admin_list_program_applications()', []],
      ['admin_list_program_applications_by_cohort($1,$2)', [basic, cohort]],
      ['admin_list_archived_program_applications()', []],
      ['admin_archive_program_application($1)', [id]],
      ['admin_restore_program_application($1)', [id]],
    ];
    for (const actor of [users.student, users.mentor, inactiveHead, null]) {
      await asUser(db, actor, async () => {
        for (const [method, args] of methods)
          await assert.rejects(db.query('SELECT * FROM ' + method, args), error => error.code === '42501');
        await assert.rejects(db.query('SELECT * FROM program_applications'), /permission denied/);
        await assert.rejects(db.query('UPDATE program_applications SET archived_at=NULL,archived_by=NULL WHERE id=$1', [id]), /permission denied/);
        await assert.rejects(db.query(`INSERT INTO program_applications(name,contact,archived_at,archived_by)
          VALUES('[합성] 위조','forged@example.test',now(),$1)`, [users.head.id]), /permission denied/);
      });
    }
    await asUser(db, users.head, () => assert.rejects(db.query('UPDATE program_applications SET archived_at=NULL,archived_by=NULL WHERE id=$1', [id]), /permission denied/));
    const row = (await db.query('SELECT * FROM program_applications WHERE id=$1', [id])).rows[0];
    assert.ok(row.archived_at);
    assert.equal(row.archived_by, users.head.id);
    await assert.rejects(db.query('UPDATE program_applications SET archived_by=NULL WHERE id=$1', [id]), /check constraint/);
  } finally { await db.close(); }
});

test('승인 목록 삭제와 복구는 기존 계정·결제·교육 등록·제출·멘토·메일 기록과 정원을 보존한다', async () => {
  const { db, application } = await fixture();
  try {
    const id = await application(130, { status: 'payment_pending' });
    await db.query(`UPDATE program_applications SET payment_currency='KRW',payment_amount_krw=225000,
      payment_amount_usd=165,admin_notes='[합성] 납부 확인',receipt_email_sent_at='2026-09-01',
      confirmation_email_attempted_at='2026-09-01',confirmation_email_sent_at='2026-09-01' WHERE id=$1`, [id]);
    const classroom = (await db.query('SELECT * FROM edu_classes ORDER BY title LIMIT 1')).rows[0];
    await asUser(db, users.head, () => db.query('SELECT edu_confirm_registration($1,$2,$3,$4,true)', [id, classroom.id, users.student.email, users.student.name]));
    await asUser(db, users.student, () => db.query('SELECT edu_claim_registrations()'));
    const enrollment = (await db.query('SELECT * FROM edu_enrollments WHERE application_id=$1', [id])).rows[0];
    let lesson;
    await asUser(db, users.head, async () => {
      const mentor = (await db.query("SELECT * FROM edu_add_member($1,$2,$3,'mentor')", [classroom.id, users.mentor.email, users.mentor.name])).rows[0];
      await db.query('INSERT INTO edu_mentor_assignments(student_enrollment_id,mentor_enrollment_id) VALUES($1,$2)', [enrollment.id, mentor.id]);
      await db.query("INSERT INTO edu_payment_entries(enrollment_id,amount,currency,paid_at) VALUES($1,225000,'KRW',now())", [enrollment.id]);
      lesson = (await db.query(`INSERT INTO edu_lessons(class_id,kind,position,title,publish_at,questions)
        VALUES($1,'preparation',0,'[합성] 보고서',now()-interval '1 hour','[{"id":"report","prompt":"합성 보고서","required":true}]') RETURNING *`, [classroom.id])).rows[0];
    });
    let submission;
    await asUser(db, users.student, async () => {
      submission = (await db.query(`INSERT INTO edu_submissions(lesson_id,student_enrollment_id,answers)
        VALUES($1,$2,'{"report":"[합성] 보존되어야 하는 본문"}') RETURNING *`, [lesson.id, enrollment.id])).rows[0];
      await db.query("INSERT INTO storage.objects(bucket_id,name) VALUES('edu-files',$1)", [`submission/${submission.id}/report.pdf`]);
      await db.query('UPDATE edu_submissions SET submitted_at=now() WHERE id=$1', [submission.id]);
    });
    await asUser(db, users.mentor, () => db.query("INSERT INTO edu_feedback(submission_id,body,is_shared) VALUES($1,'[합성] 보존 피드백',true)", [submission.id]));
    await db.query("INSERT INTO edu_onboarding_email_deliveries(application_id,kind,status,sent_at,provider_id) VALUES($1,'welcome','sent',now(),'synthetic-provider')", [id]);
    const tables = ['auth.users', 'coach_profiles', 'edu_enrollments', 'edu_mentor_assignments', 'edu_payment_entries',
      'edu_lessons', 'edu_submissions', 'edu_feedback', 'storage.objects', 'edu_registration_onboarding', 'edu_onboarding_email_deliveries'];
    const snapshot = async () => Object.fromEntries(await Promise.all(tables.map(async table => [table, (await db.query(`SELECT * FROM ${table}`)).rows])));
    const before = await snapshot();
    const seatCount = async () => (await db.query('SELECT edu_cohort_occupied($1) AS n', [classroom.cohort_id])).rows[0].n;
    assert.equal(await seatCount(), 1);
    for (const method of ['admin_archive_program_application', 'admin_restore_program_application']) {
      await asUser(db, users.head, () => db.query(`SELECT ${method}($1)`, [id]));
      assert.deepEqual(await snapshot(), before);
      assert.equal(await seatCount(), 1);
      const applicationRow = (await db.query('SELECT * FROM program_applications WHERE id=$1', [id])).rows[0];
      assert.equal(applicationRow.status, 'confirmed');
      assert.equal(applicationRow.payment_amount_krw, 225000);
      assert.equal(applicationRow.payment_amount_usd, '165.00');
      assert.equal(applicationRow.admin_notes, '[합성] 납부 확인');
      assert.ok(applicationRow.confirmation_email_sent_at);
      await asUser(db, users.student, async () => {
        assert.equal((await db.query('SELECT edu_claim_registrations() AS n')).rows[0].n, 0);
        assert.equal((await db.query('SELECT * FROM edu_classes WHERE id=$1', [classroom.id])).rows.length, 1);
        assert.equal((await db.query('SELECT * FROM edu_submissions WHERE id=$1', [submission.id])).rows.length, 1);
        assert.equal((await db.query('SELECT * FROM edu_feedback')).rows.length, 1);
      });
    }
  } finally { await db.close(); }
});

test('삭제 목록은 과정 필터와 최신 삭제순을 적용하며 기존 목록과 같은 조회 상한을 지킨다', async () => {
  const { db } = await fixture();
  try {
    await db.query(`INSERT INTO program_applications(name,contact,program_key,created_at,archived_at,archived_by)
      SELECT '[합성] 신청 '||n,'synthetic-'||n||'@example.test',CASE WHEN n%2=0 THEN $2 ELSE 'growth_101' END,
      timestamptz '2000-01-01'+n*interval '1 minute',timestamptz '2000-01-01'+n*interval '1 minute',$1
      FROM generate_series(1,510) n`, [users.head.id, basic]);
    await asUser(db, users.head, async () => {
      assert.equal((await db.query('SELECT * FROM admin_list_archived_program_applications()')).rows.length, 100);
      assert.equal((await db.query('SELECT * FROM admin_list_archived_program_applications(NULL,NULL)')).rows.length, 100);
      assert.equal((await db.query('SELECT * FROM admin_list_archived_program_applications(NULL,999999)')).rows.length, 500);
      assert.equal((await db.query('SELECT * FROM admin_list_archived_program_applications(NULL,0)')).rows.length, 1);
      const listed = (await db.query('SELECT * FROM admin_list_archived_program_applications($1,500)', [basic])).rows;
      assert.equal(listed.length, 255);
      assert.ok(listed.every(row => row.program_key === basic));
      assert.equal(listed[0].name, '[합성] 신청 510');
      assert.equal((await db.query('SELECT * FROM admin_list_program_applications()')).rows.length, 0);
      assert.equal((await db.query('SELECT * FROM admin_list_program_applications_by_cohort(NULL,NULL)')).rows.length, 0);
    });
  } finally { await db.close(); }
});

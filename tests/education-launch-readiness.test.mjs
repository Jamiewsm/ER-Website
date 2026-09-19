// 기본과정 10명의 개강 전 준비와 담당 멘토 권한을 격리 데이터베이스에서 검증한다.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { asUser, createDB, uid, users } from './helpers/education-db.mjs';

// Auth identities and Storage objects are synthetic. No real account, file transport or email is used.
async function launchFixture() {
  const db = await createDB();
  await db.exec(`
    ALTER TABLE auth.users ADD COLUMN email_confirmed_at timestamptz;
    UPDATE auth.users SET email_confirmed_at=now();
    ALTER TABLE program_applications ADD COLUMN confirmed_at timestamptz,
      ADD COLUMN payment_region text, ADD COLUMN payment_currency text,
      ADD COLUMN payment_amount_usd numeric, ADD COLUMN payment_amount_krw bigint;
    CREATE FUNCTION require_head_coach() RETURNS void LANGUAGE plpgsql AS $$
      BEGIN IF NOT edu_is_head() THEN RAISE EXCEPTION 'head_coach_required'; END IF; END$$;
    GRANT USAGE ON SCHEMA public TO service_role;
  `);
  for (const file of [
    '20260908091000_education_registration_capacity.sql',
    '20260915003000_education_onboarding.sql',
    '20260915003100_education_preparation_submission.sql',
    '20260919001000_education_welcome_pending_deadline.sql',
  ]) await db.exec(await readFile(new URL('../supabase/migrations/' + file, import.meta.url), 'utf8'));
  return db;
}

test('10명 기본과정 학생은 일정 미정 공통 교실에서 안전하게 준비하고 담당 멘토에게만 제출한다', async (t) => {
  const db = await launchFixture();
  const rows = async (sql, args = []) => (await db.query(sql, args)).rows;
  const one = async (sql, args = []) => (await rows(sql, args))[0];
  const students = Array.from({ length: 10 }, (_, index) => ({
    id: uid(800 + index), email: `launch-${index + 1}@example.test`, name: `[합성] 학생 ${index + 1}`,
    applicationId: uid(900 + index),
  }));
  let classroom, preparation, regularLesson, privateLesson, mentor, otherMentor;
  try {
    await t.test('수석의 결제 확인 후 인증된 계정만 접근하며 등록 확정은 메일을 발송하지 않는다', async () => {
      await asUser(db, users.head, async () => {
        classroom = await one(`UPDATE edu_classes SET title='[합성] 기본과정 공통 준비',capacity=14,schedule_note='수업 시간 조율 중'
          WHERE id=(SELECT id FROM edu_classes ORDER BY title LIMIT 1) RETURNING *`);
        await db.query('UPDATE edu_cohorts SET starts_on=NULL,ends_on=NULL WHERE id=$1', [classroom.cohort_id]);
        mentor = await one("SELECT * FROM edu_add_member($1,$2,$3,'mentor')", [classroom.id, users.mentor.email, users.mentor.name]);
        otherMentor = await one("SELECT * FROM edu_add_member($1,$2,$3,'mentor')", [classroom.id, users.unassigned.email, users.unassigned.name]);
        await db.query("SELECT edu_add_member($1,$2,$3,'instructor')", [classroom.id, users.instructor.email, users.instructor.name]);
      });
      for (const student of students) {
        await db.query('INSERT INTO auth.users(id,email) VALUES($1,$2)', [student.id, student.email]);
        await db.query(`INSERT INTO program_applications(id,contact,cohort_key,program_key,status)
          VALUES($1,$2,'enneagram_basic_2026_10','enneagram_basic_july','payment_pending')`, [student.applicationId, student.email]);
        await asUser(db, users.head, () => db.query('SELECT edu_confirm_registration($1,$2,$3,$4,true)',
          [student.applicationId, classroom.id, student.email, student.name]));
        await asUser(db, student, async () => {
          assert.equal((await one('SELECT edu_claim_registrations() AS n')).n, 0);
          assert.equal((await rows('SELECT * FROM edu_classes')).length, 0);
        });
        await db.query('UPDATE auth.users SET email_confirmed_at=now() WHERE id=$1', [student.id]);
        await asUser(db, student, async () => {
          assert.equal((await one('SELECT edu_claim_registrations() AS n')).n, 1);
          assert.equal((await one('SELECT edu_claim_registrations() AS n')).n, 0);
          student.enrollment = await one('SELECT * FROM edu_enrollments WHERE user_id=$1', [student.id]);
          assert.equal(student.enrollment.class_id, classroom.id);
          assert.deepEqual((await rows('SELECT id FROM edu_classes')).map(row => row.id), [classroom.id]);
          assert.equal((await rows('SELECT * FROM edu_registration_onboarding')).length, 0);
        });
      }
      assert.equal((await one('SELECT edu_cohort_occupied($1) AS n', [classroom.cohort_id])).n, 10);
      assert.equal((await one('SELECT edu_class_occupied($1) AS n', [classroom.id])).n, 10);
      assert.equal((await rows('SELECT * FROM edu_onboarding_email_deliveries')).length, 0);
      await asUser(db, users.empty, async () => {
        assert.equal((await rows('SELECT * FROM edu_classes')).length, 0);
        assert.equal((await one('SELECT edu_claim_registrations() AS n')).n, 0);
      });
    });

    await t.test('공개 준비 자료와 정규 8회차를 분리하며 비공개 강의와 파일은 노출하지 않는다', async () => {
      await asUser(db, users.head, async () => {
        preparation = await one(`INSERT INTO edu_lessons(class_id,position,kind,title,publish_at,due_at,questions)
          VALUES($1,0,'preparation','[합성] 강의계획안과 자기관찰보고서',now()-interval '1 hour',NULL,
          '[{"id":"report","prompt":"자유롭게 관찰한 내용을 작성해 주세요.","required":true}]') RETURNING *`, [classroom.id]);
        for (let position = 1; position <= 8; position++) {
          const lesson = await one(`INSERT INTO edu_lessons(class_id,position,title,publish_at,questions,resources)
            VALUES($1,$2,$3,$4,'[]','[{"title":"강의영상","url":"https://example.test/lecture"}]') RETURNING *`,
          [classroom.id, position, `[합성] ${position}회차`, position === 1 ? new Date(0).toISOString() : null]);
          if (position === 1) regularLesson = lesson;
          if (position === 2) privateLesson = lesson;
        }
        for (const lesson of [preparation, regularLesson, privateLesson])
          await db.query("INSERT INTO storage.objects(bucket_id,name) VALUES('edu-files',$1)", [`lesson/${lesson.id}/syllabus.pdf`]);
      });
      for (const student of students) {
        await asUser(db, student, async () => {
          assert.deepEqual((await rows('SELECT position FROM edu_lessons ORDER BY position')).map(row => row.position), [0, 1]);
          assert.equal((await rows("SELECT * FROM storage.objects WHERE bucket_id='edu-files'")).length, 2);
          await assert.rejects(db.query("INSERT INTO storage.objects(bucket_id,name) VALUES('edu-files',$1)",
            [`lesson/${preparation.id}/forged.pdf`]), /row-level security/);
        });
      }
      assert.equal((await one("SELECT count(*)::int AS n FROM edu_lessons WHERE kind='lesson'")).n, 8);
      assert.equal((await one("SELECT public FROM storage.buckets WHERE id='edu-files'")).public, false);
      await asUser(db, null, () => assert.rejects(db.query('SELECT * FROM edu_lessons'), /permission denied/));
    });

    await t.test('기한 미정 초대는 공개 자료만 허용하고 알림은 기한 확정 후에만 시작한다', async () => {
      const service = async work => {
        await db.exec('RESET ROLE; SET ROLE service_role');
        try { return await work(); } finally { await db.exec('RESET ROLE'); }
      };
      const claim = kind => one('SELECT edu_claim_onboarding_email($1,$2,$3) AS result',
        [students[0].applicationId, kind, kind === 'welcome' ? users.head.id : null]);
      await asUser(db, users.head, () => db.query("UPDATE edu_lessons SET publish_at=now()+interval '1 day' WHERE id=$1", [preparation.id]));
      await service(async () => assert.equal((await claim('welcome')).result.reason, 'preparation_not_ready'));
      assert.equal((await rows('SELECT * FROM edu_onboarding_email_deliveries')).length, 0);
      await asUser(db, users.head, () => db.query("UPDATE edu_lessons SET publish_at=now()-interval '1 hour' WHERE id=$1", [preparation.id]));
      await service(async () => {
        const welcome = (await claim('welcome')).result;
        assert.equal(welcome.ok, true);
        assert.equal(welcome.due_at, null);
        assert.equal(welcome.starts_at, null);
        assert.equal(welcome.recipient, students[0].email);
        // Synthetic delivery acknowledgement only; no provider API is invoked.
        await db.query('SELECT edu_finish_onboarding_email($1,$2)', [welcome.delivery_id, 'synthetic-launch-welcome']);
        assert.equal((await claim('welcome')).result.reason, 'already_sent');
        for (const kind of ['reminder_3d', 'reminder_1d'])
          assert.equal((await claim(kind)).result.reason, 'reminders_inactive');
        assert.equal((await rows('SELECT * FROM edu_onboarding_reminder_candidates()')).length, 0);
      });
      await db.query("UPDATE edu_onboarding_email_deliveries SET attempted_at=now()-interval '2 days',sent_at=now()-interval '2 days'");
      await asUser(db, users.head, async () => {
        await assert.rejects(db.query('UPDATE edu_lessons SET reminders_enabled=true WHERE id=$1', [preparation.id]), /check constraint/);
        await db.query("UPDATE edu_lessons SET due_at=now()+interval '3 days',reminders_enabled=true WHERE id=$1", [preparation.id]);
      });
      await service(async () => assert.deepEqual(await rows('SELECT * FROM edu_onboarding_reminder_candidates()'),
        [{ application_id: students[0].applicationId, kind: 'reminder_3d' }]));
      await asUser(db, users.head, () => db.query('UPDATE edu_lessons SET due_at=NULL,reminders_enabled=false WHERE id=$1', [preparation.id]));
      await service(async () => assert.equal((await rows('SELECT * FROM edu_onboarding_reminder_candidates()')).length, 0));
      for (const actor of [users.head, users.mentor, students[0]]) {
        await asUser(db, actor, () => assert.rejects(db.query('SELECT edu_onboarding_email_payload($1,$2)',
          [students[0].applicationId, 'welcome']), /permission denied/));
      }
    });

    await t.test('10명의 개인 초안과 파일은 본인만 읽고 텍스트·파일 제출 및 외부 접수를 구분한다', async () => {
      for (const student of students) {
        await asUser(db, student, async () => {
          student.submission = await one(`INSERT INTO edu_submissions(lesson_id,student_enrollment_id,answers)
            VALUES($1,$2,$3) RETURNING *`, [preparation.id, student.enrollment.id, JSON.stringify({ report: `${student.name}의 비공개 초안` })]);
          student.file = `submission/${student.submission.id}/report.pdf`;
          await db.query("INSERT INTO storage.objects(bucket_id,name) VALUES('edu-files',$1)", [student.file]);
          assert.equal((await rows('SELECT * FROM edu_submissions')).length, 1);
          await assert.rejects(db.query('SELECT edu_mark_preparation_received($1,$2,true)',
            [student.enrollment.id, preparation.id]), /head_coach_required/);
        });
      }
      for (const role of [users.head, users.mentor, users.unassigned, users.instructor]) {
        await asUser(db, role, async () => {
          assert.equal((await rows('SELECT * FROM edu_submissions')).length, 0);
          assert.equal((await rows("SELECT * FROM storage.objects WHERE name LIKE 'submission/%'")).length, 0);
        });
      }
      await asUser(db, students[0], () => db.query('UPDATE edu_submissions SET submitted_at=now() WHERE id=$1', [students[0].submission.id]));
      await asUser(db, students[1], async () => {
        await db.query("UPDATE edu_submissions SET answers='{}',submitted_at=now() WHERE id=$1", [students[1].submission.id]);
        await assert.rejects(db.query("INSERT INTO storage.objects(bucket_id,name) VALUES('edu-files',$1)",
          [`submission/${students[1].submission.id}/late.pdf`]), /row-level security/);
      });
      await asUser(db, users.head, async () => {
        await db.query('SELECT edu_mark_preparation_received($1,$2,true)', [students[2].enrollment.id, preparation.id]);
        const statuses = await rows('SELECT * FROM edu_preparation_statuses()');
        assert.equal(statuses.length, 10);
        assert.equal(statuses.filter(row => row.submitted_at || row.external_received_at).length, 3);
        assert.ok(statuses.every(row => !('answers' in row)));
        assert.equal((await rows('SELECT * FROM edu_submissions')).length, 2);
      });
    });

    await t.test('담당 학생을 배정해야 멘토가 제출을 읽고 공유 피드백만 학생에게 보인다', async () => {
      await asUser(db, users.mentor, async () => assert.equal((await rows('SELECT * FROM edu_submissions')).length, 0));
      await asUser(db, users.head, async () => {
        for (const [index, student] of students.entries())
          await db.query('INSERT INTO edu_mentor_assignments(student_enrollment_id,mentor_enrollment_id) VALUES($1,$2)',
            [student.enrollment.id, index < 5 ? mentor.id : otherMentor.id]);
      });
      await asUser(db, users.mentor, async () => {
        assert.equal((await rows('SELECT * FROM edu_submissions')).length, 2);
        assert.equal((await rows("SELECT * FROM storage.objects WHERE name LIKE 'submission/%'")).length, 2);
        await db.query(`INSERT INTO edu_feedback(submission_id,body,is_shared)
          VALUES($1,'[합성] 학생에게 보이는 피드백',true),($1,'[합성] 멘토 전용 메모',false)`, [students[0].submission.id]);
      });
      for (const role of [users.unassigned, users.instructor]) {
        await asUser(db, role, async () => {
          assert.equal((await rows('SELECT * FROM edu_submissions')).length, 0);
          await assert.rejects(db.query("INSERT INTO edu_feedback(submission_id,body,is_shared) VALUES($1,'권한 없는 피드백',true)",
            [students[0].submission.id]), /row-level security/);
        });
      }
      await asUser(db, students[0], async () => {
        const feedback = await rows('SELECT * FROM edu_feedback');
        assert.equal(feedback.length, 1);
        assert.equal(feedback[0].is_shared, true);
      });
      await asUser(db, students[1], async () => assert.equal((await rows('SELECT * FROM edu_feedback')).length, 0));
      await asUser(db, users.head, () => db.query("UPDATE edu_enrollments SET status='withdrawn' WHERE id=$1", [mentor.id]));
      await asUser(db, users.mentor, async () => {
        assert.equal((await rows('SELECT * FROM edu_submissions')).length, 0);
        assert.equal((await rows('SELECT * FROM edu_feedback')).length, 0);
        assert.equal((await rows("SELECT * FROM storage.objects WHERE name LIKE 'submission/%'")).length, 0);
      });
    });

    await t.test('등록 취소는 교실 접근과 계정 재연결을 막고 제출한 원문은 보존한다', async () => {
      await asUser(db, users.head, () => db.query('SELECT edu_cancel_registration($1)', [students[0].applicationId]));
      await asUser(db, students[0], async () => {
        assert.equal((await one('SELECT edu_claim_registrations() AS n')).n, 0);
        assert.equal((await rows('SELECT * FROM edu_classes')).length, 0);
        assert.equal((await rows('SELECT * FROM edu_lessons')).length, 0);
        const saved = await one('SELECT * FROM edu_submissions');
        assert.equal(saved.answers.report, `${students[0].name}의 비공개 초안`);
      });
      assert.equal((await one('SELECT edu_class_occupied($1) AS n', [classroom.id])).n, 9);
    });
  } finally {
    await db.close();
  }
});

// 학생 신청의 본인 권한과 중복 방지 및 승인 후 교실 연결을 검증한다.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createDB, asUser, users, uid } from './helpers/education-db.mjs';

async function fixture() {
  const db = await createDB();
  await db.exec(`ALTER TABLE auth.users ADD COLUMN email_confirmed_at timestamptz,ADD COLUMN raw_user_meta_data jsonb DEFAULT '{}';
    UPDATE auth.users SET email_confirmed_at=now();
    ALTER TABLE program_applications ALTER COLUMN id SET DEFAULT gen_random_uuid();
    ALTER TABLE program_applications ADD COLUMN name text, ADD COLUMN user_id uuid REFERENCES auth.users,
      ADD COLUMN source text, ADD COLUMN apply_source text, ADD COLUMN created_at timestamptz DEFAULT now(),
      ADD COLUMN confirmed_at timestamptz, ADD COLUMN payment_region text, ADD COLUMN payment_currency text,
      ADD COLUMN payment_amount_usd numeric, ADD COLUMN payment_amount_krw bigint;
    CREATE FUNCTION require_head_coach() RETURNS void LANGUAGE plpgsql AS $$BEGIN IF NOT edu_is_head() THEN RAISE EXCEPTION 'head_coach_required'; END IF; END$$;
    GRANT USAGE ON SCHEMA public TO service_role;
    INSERT INTO edu_cohorts(id,course_id,title,application_cohort_key)
      SELECT '${uid(501)}',id,'101 스터디','growth_101_2026' FROM edu_courses WHERE code='growth_101';
    INSERT INTO edu_cohorts(id,course_id,title,application_cohort_key)
      SELECT '${uid(502)}',id,'심화과정 201 Parenting 스터디','growth_201_2026' FROM edu_courses WHERE code='growth_201';
    INSERT INTO edu_classes(id,cohort_id,title) VALUES
      ('${uid(601)}','${uid(501)}','하위유형 스터디'),('${uid(602)}','${uid(502)}','Parenting 스터디');`);
  for (const file of ['20260908091000_education_registration_capacity.sql','20260915003000_education_onboarding.sql','20261005043528_student_study_enrollment.sql','20261005070000_er_account_consent.sql']) {
    await db.exec(await readFile(new URL('../supabase/migrations/'+file,import.meta.url),'utf8'));
  }
  return db;
}
const request = (db, cls=uid(601), name='신청 학생') => db.query('SELECT edu_request_enrollment($1,$2) AS id',[cls,name]);

test('모집은 두 스터디만 제공하며 비인증 계정과 기본과정·닫힌 반 신청은 차단한다', async()=>{
  const db=await fixture();
  try {
    assert.equal((await db.query('SELECT title FROM edu_cohorts WHERE id=$1',[uid(502)])).rows[0].title,'심화과정 102 Parenting 스터디');
    await asUser(db,null,async()=>{
      await assert.rejects(request(db),/permission denied/);
      await assert.rejects(db.query('SELECT * FROM edu_application_options()'),/permission denied/);
      await assert.rejects(db.query('SELECT * FROM edu_my_applications()'),/permission denied/);
    });
    await db.query('UPDATE auth.users SET email_confirmed_at=NULL WHERE id=$1',[users.other.id]);
    await asUser(db,users.other,()=>assert.rejects(request(db),/edu_verified_account_required/));
    await asUser(db,users.empty,async()=>{
      const options=(await db.query('SELECT * FROM edu_application_options()')).rows;
      assert.equal(options.length,2);
      assert.deepEqual(options.map(x=>x.course_title),['심화과정 101 하위유형 스터디','심화과정 102 Parenting 스터디']);
      await assert.rejects(request(db,uid(601),' '),/edu_invalid_display_name/);
      await assert.rejects(request(db,uid(601),'가'.repeat(101)),/edu_invalid_display_name/);
      await assert.rejects(request(db,uid(999)),/edu_enrollment_closed/);
      const basic=(await db.query('SELECT id FROM edu_classes WHERE id NOT IN ($1,$2) LIMIT 1',[uid(601),uid(602)])).rows;
      // 학생에게 기존 반 목록이 공개되지 않아도 서버에 실제 기본반 ID를 전달해 검사한다.
      assert.equal(basic.length,0);
    });
    const basic=(await db.query('SELECT id FROM edu_classes WHERE id NOT IN ($1,$2) LIMIT 1',[uid(601),uid(602)])).rows[0];
    await db.query('UPDATE edu_classes SET enrollment_open=true WHERE id=$1',[basic.id]);
    await asUser(db,users.empty,()=>assert.rejects(request(db,basic.id),/edu_enrollment_closed/));
    await db.query('UPDATE edu_classes SET enrollment_open=false WHERE id=$1',[uid(601)]);
    await asUser(db,users.empty,()=>assert.rejects(request(db),/edu_enrollment_closed/));
  } finally { await db.close(); }
});

test('신청 이메일은 인증 계정에서 가져오며 중복 신청·다른 학생 조회·승인 우회를 막는다', async()=>{
  const db=await fixture();
  try {
    let id;
    await asUser(db,users.empty,async()=>{
      id=(await request(db)).rows[0].id;
      assert.equal((await request(db)).rows[0].id,id);
      const mine=(await db.query('SELECT * FROM edu_my_applications()')).rows;
      assert.equal(mine.length,1); assert.equal(mine[0].status,'received');
      assert.equal((await db.query('SELECT edu_claim_registrations() AS n')).rows[0].n,0);
      assert.equal((await db.query('SELECT * FROM edu_enrollments')).rows.length,0);
      await assert.rejects(db.query("UPDATE program_applications SET status='confirmed' WHERE id=$1",[id]),/permission denied/);
      assert.equal((await db.query('UPDATE edu_classes SET enrollment_open=false WHERE id=$1 RETURNING id',[uid(601)])).rows.length,0);
      await assert.rejects(db.query("SELECT edu_confirm_registration($1,$2,$3,'학생',true)",[id,uid(601),users.empty.email]),/head_coach_required/);
    });
    const a=(await db.query('SELECT * FROM program_applications WHERE id=$1',[id])).rows[0];
    assert.equal(a.user_id,users.empty.id); assert.equal(a.contact,users.empty.email); assert.equal(a.requested_class_id,uid(601));
    await asUser(db,users.student,async()=>assert.equal((await db.query('SELECT * FROM edu_my_applications()')).rows.length,0));
    await asUser(db,users.head,()=>db.query("SELECT edu_confirm_registration($1,$2,$3,'신청 학생',true)",[id,uid(601),users.empty.email]));
    await asUser(db,users.empty,async()=>{
      assert.equal((await db.query('SELECT edu_claim_registrations() AS n')).rows[0].n,1);
      assert.equal((await db.query('SELECT * FROM edu_enrollments')).rows[0].class_id,uid(601));
      assert.equal((await db.query('SELECT * FROM edu_my_applications()')).rows[0].status,'confirmed');
    });
  } finally { await db.close(); }
});

test('취소 후 재신청과 기존 기본과정 학생의 추가 스터디 신청을 허용한다', async()=>{
  const db=await fixture();
  try {
    const basic=(await db.query('SELECT id FROM edu_classes WHERE id NOT IN ($1,$2) LIMIT 1',[uid(601),uid(602)])).rows[0];
    await asUser(db,users.head,()=>db.query("SELECT edu_add_member($1,$2,'기존 학생','student')",[basic.id,users.student.email]));
    const first=await asUser(db,users.student,async()=>(await request(db)).rows[0].id);
    await db.query("UPDATE program_applications SET status='cancelled' WHERE id=$1",[first]);
    const second=await asUser(db,users.student,async()=>(await request(db)).rows[0].id);
    assert.notEqual(first,second);
    assert.equal((await db.query('SELECT count(*)::int AS n FROM edu_enrollments WHERE class_id=$1',[basic.id])).rows[0].n,1);
    await asUser(db,users.student,async()=>assert.equal((await db.query('SELECT * FROM edu_my_applications()')).rows.length,2));
  } finally { await db.close(); }
});

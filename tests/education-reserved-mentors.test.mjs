// 격리 Postgres에서 납부 승인과 계정 연결, 사전 보고서와 중복 메일 방지를 검증한다.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { createDB, asUser, users, uid } from './helpers/education-db.mjs';

const cohortKey = 'enneagram_basic_2026_10';
async function fixture() {
  const db = await createDB();
  await db.exec(`ALTER TABLE auth.users ADD COLUMN email_confirmed_at timestamptz;
    UPDATE auth.users SET email_confirmed_at=now();
    ALTER TABLE program_applications ADD COLUMN confirmed_at timestamptz,
    ADD COLUMN payment_region text, ADD COLUMN payment_currency text, ADD COLUMN payment_amount_usd numeric, ADD COLUMN payment_amount_krw bigint;
    CREATE FUNCTION require_head_coach() RETURNS void LANGUAGE plpgsql AS $$BEGIN IF NOT edu_is_head() THEN RAISE EXCEPTION 'head_coach_required'; END IF; END$$;
    GRANT USAGE ON SCHEMA public TO service_role;`);
  for (const file of ['20260908091000_education_registration_capacity.sql','20260915003000_education_onboarding.sql','20260915003100_education_preparation_submission.sql','20260919001000_education_welcome_pending_deadline.sql','20260922115726_education_reserved_mentors.sql']) {
    const sql=await readFile(new URL('../supabase/migrations/'+file,import.meta.url),'utf8');
    try { await db.exec(sql); } catch(error) { throw new Error(file+': '+error.message+' at '+error.position+' '+error.where+' '+sql.slice(Number(error.position)-100,Number(error.position)+100),{cause:error}); }
  }
  const [a,b]=(await db.query('SELECT * FROM edu_classes ORDER BY title')).rows;
  const app=async(n,user=users.empty,extra={})=>{
    await db.query('INSERT INTO program_applications(id,contact,cohort_key,program_key,status) VALUES($1,$2,$3,$4,$5)',
      [uid(n),user.email,extra.cohort || cohortKey,extra.program || 'enneagram_basic_july',extra.status || 'received']);
    return uid(n);
  };
  const confirm=(id,cls=a,user=users.empty,paid=true)=>db.query('SELECT * FROM edu_confirm_registration($1,$2,$3,$4,$5)',[id,cls.id,user.email,user.name,paid]);
  const preparation=async(due='3 days')=>asUser(db,users.head,async()=> (await db.query(`INSERT INTO edu_lessons(class_id,position,kind,title,publish_at,due_at,reminders_enabled,questions)
    VALUES($1,0,'preparation','자기관찰보고서',now()-interval '1 day',now()+$2::interval,true,'[{"id":"report","prompt":"자기관찰보고서를 작성해 주세요.","required":true}]') RETURNING *`,[a.id,due])).rows[0]);
  const service=async(fn)=>{await db.exec('RESET ROLE; SET ROLE service_role');try{return await fn();}finally{await db.exec('RESET ROLE');}};
  const claimMail=(id,kind='welcome',actor=users.head.id)=>db.query('SELECT edu_claim_onboarding_email($1,$2,$3) AS result',[id,kind,actor]).then(r=>r.rows[0].result);
  return {db,a,b,app,confirm,preparation,service,claimMail};
}
test('예약 멘토는 첫 계정 연결에 적용되고 다른 반·학생의 조작은 거부한다',async()=>{
 const f=await fixture(), {db}=f;
 try {
  const id=await f.app(301);
  const mentor=await asUser(db,users.head,async()=>{
    await f.confirm(id);
    return (await db.query("SELECT * FROM edu_add_member($1,$2,$3,'mentor')",[f.a.id,users.mentor.email,users.mentor.name])).rows[0];
  });
  await db.query("UPDATE edu_registration_onboarding SET mentor_enrollment_id=$1,time_zone='America/Chicago' WHERE application_id=$2",[mentor.id,id]);
  await asUser(db,users.empty,async()=>{
    await assert.rejects(db.query("UPDATE edu_registration_onboarding SET mentor_enrollment_id=NULL WHERE application_id=$1",[id]),/permission denied/);
    assert.equal((await db.query('SELECT edu_claim_registrations() AS n')).rows[0].n,1);
    assert.equal((await db.query('SELECT edu_claim_registrations() AS n')).rows[0].n,0);
    const e=(await db.query('SELECT * FROM edu_enrollments WHERE application_id=$1',[id])).rows[0];
    assert.equal(e.time_zone,'America/Chicago');
    assert.equal((await db.query('SELECT * FROM edu_mentor_assignments WHERE student_enrollment_id=$1',[e.id])).rows[0].mentor_enrollment_id,mentor.id);
  });
  await assert.rejects(db.query("UPDATE edu_registration_onboarding SET time_zone='Not/AZone' WHERE application_id=$1",[id]),/edu_invalid_time_zone/);
  const wrong=await asUser(db,users.head,async()=> (await db.query("SELECT * FROM edu_add_member($1,$2,$3,'mentor')",[f.b.id,users.unassigned.email,users.unassigned.name])).rows[0]);
  await assert.rejects(db.query('UPDATE edu_registration_onboarding SET mentor_enrollment_id=$1 WHERE application_id=$2',[wrong.id,id]),/edu_invalid_mentor_assignment/);
  assert.equal((await db.query('SELECT * FROM edu_mentor_assignments')).rows.length,1);
  assert.equal((await db.query('SELECT * FROM edu_onboarding_email_deliveries')).rows.length,0);
 } finally {await db.close();}
});

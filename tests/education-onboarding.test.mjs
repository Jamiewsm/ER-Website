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
  for (const file of ['20260908091000_education_registration_capacity.sql','20260915003000_education_onboarding.sql','20260915003100_education_preparation_submission.sql','20260919001000_education_welcome_pending_deadline.sql']) {
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

test('수석코치만 납부와 반을 확정하고 검증된 이메일은 한 번만 교실에 연결한다',async()=>{
 const f=await fixture(); const {db}=f;
 try {
  const id=await f.app(100);
  await asUser(db,users.student,async()=>{await assert.rejects(f.confirm(id),/head_coach_required/);assert.equal((await db.query('SELECT * FROM edu_registration_onboarding')).rows.length,0);});
  await asUser(db,null,async()=>{await assert.rejects(f.confirm(id),/permission denied/);});
  await asUser(db,users.head,async()=>{
   await assert.rejects(f.confirm(id,f.a,users.empty,false),/edu_payment_confirmation_required/);
   await assert.rejects(f.confirm(id,f.a,users.other),/edu_application_email_mismatch/);
   const row=(await f.confirm(id)).rows[0];assert.ok(row.payment_confirmed_at);assert.equal(row.claimed_at,null);
   assert.equal((await f.confirm(id)).rows[0].confirmed_at.getTime(),row.confirmed_at.getTime());
   await assert.rejects(f.confirm(id,f.b),/edu_registration_already_confirmed/);
   assert.equal((await db.query('SELECT * FROM edu_onboarding_email_deliveries')).rows.length,0,'등록 확정은 메일을 보내지 않는다');
  });
  assert.equal((await db.query('SELECT status FROM program_applications WHERE id=$1',[id])).rows[0].status,'confirmed');
  await db.query('UPDATE auth.users SET email_confirmed_at=NULL WHERE id=$1',[users.empty.id]);
  await asUser(db,users.empty,async()=>{assert.equal((await db.query('SELECT edu_claim_registrations() AS n')).rows[0].n,0);});
  await db.query('UPDATE auth.users SET email_confirmed_at=now() WHERE id=$1',[users.empty.id]);
  await asUser(db,users.other,async()=>{assert.equal((await db.query('SELECT edu_claim_registrations() AS n')).rows[0].n,0);});
  await asUser(db,users.empty,async()=>{
   assert.equal((await db.query('SELECT edu_claim_registrations() AS n')).rows[0].n,1);
   assert.equal((await db.query('SELECT edu_claim_registrations() AS n')).rows[0].n,0);
   const members=(await db.query('SELECT * FROM edu_enrollments')).rows;assert.equal(members.length,1);assert.equal(members[0].role,'student');
   assert.equal((await db.query('SELECT * FROM edu_registration_onboarding')).rows.length,0,'신청과 발송 기록은 학생에게 열리지 않는다');
  });
  assert.equal((await db.query('SELECT edu_cohort_occupied($1) AS n',[f.a.cohort_id])).rows[0].n,1,'기수 예약과 실제 교실이 중복 집계되지 않는다');
 } finally {await db.close();}
});

test('반 정원은 미가입 승인 좌석을 포함하며 기존 계정 배정과 취소를 보존한다',async()=>{
 const f=await fixture();const {db}=f;
 try {
  const id=await f.app(101);const second=await f.app(102,users.other);
  await asUser(db,users.head,async()=>{
   await db.query('UPDATE edu_classes SET capacity=1 WHERE id=$1',[f.a.id]);
   await f.confirm(id);
   await assert.rejects(f.confirm(second,f.a,users.other),/edu_class_full/);
   await assert.rejects(db.query("SELECT edu_add_member($1,$2,'다른 학생','student')",[f.a.id,users.student.email]),/edu_class_full/);
  });
  await asUser(db,users.empty,()=>db.query('SELECT edu_claim_registrations()'));
  await asUser(db,users.head,()=>db.query('SELECT edu_cancel_registration($1)',[id]));
  assert.equal((await db.query('SELECT status FROM edu_enrollments WHERE application_id=$1',[id])).rows[0].status,'withdrawn');
  await db.query("UPDATE program_applications SET status='confirmed' WHERE id=$1",[id]);
  await asUser(db,users.empty,async()=>assert.equal((await db.query('SELECT edu_claim_registrations() AS n')).rows[0].n,0));
  await asUser(db,users.head,async()=>{
   await assert.rejects(f.confirm(id),/edu_registration_cancelled/);
   await f.confirm(second,f.a,users.other);
  });
  const old=await f.app(103,users.student);
  await asUser(db,users.head,async()=>{
   const before=(await db.query("SELECT * FROM edu_add_member($1,$2,$3,'student')",[f.b.id,users.student.email,users.student.name])).rows[0];
   const record=(await f.confirm(old,f.b,users.student)).rows[0];assert.equal(record.claimed_enrollment_id,before.id);
   assert.equal((await db.query('SELECT count(*)::int AS n FROM edu_enrollments WHERE user_id=$1',[users.student.id])).rows[0].n,1);
  });
  const wrong=await f.app(104,users.unassigned,{program:'growth_101'});
  await asUser(db,users.head,()=>assert.rejects(f.confirm(wrong,f.b,users.unassigned),/edu_application_course_mismatch/));
  await db.query("UPDATE edu_cohorts SET status='completed' WHERE id=$1",[f.a.cohort_id]);
  await asUser(db,users.other,async()=>assert.equal((await db.query('SELECT edu_claim_registrations() AS n')).rows[0].n,0));
 } finally {await db.close();}
});

test('사전 보고서와 회차 번호가 분리되고 실제 첨부 파일만으로 제출할 수 있다',async()=>{
 const f=await fixture();const {db}=f;
 try {
  const id=await f.app(110);await asUser(db,users.head,()=>f.confirm(id));await asUser(db,users.empty,()=>db.query('SELECT edu_claim_registrations()'));
  const lesson=await f.preparation();const enrollment=(await db.query('SELECT id FROM edu_enrollments WHERE application_id=$1',[id])).rows[0].id;
  await asUser(db,users.head,async()=>{
   await db.query("INSERT INTO edu_lessons(class_id,position,title,publish_at,questions) VALUES($1,1,'1회차',now()-interval '1 hour','[]')",[f.a.id]);
   await assert.rejects(db.query("INSERT INTO edu_lessons(class_id,position,kind,title) VALUES($1,1,'preparation','잘못된 준비')",[f.a.id]),/check constraint/);
   await assert.rejects(db.query("INSERT INTO edu_lessons(class_id,position,kind,title) VALUES($1,0,'preparation','중복 준비')",[f.a.id]),/unique constraint/);
  });
  await asUser(db,users.empty,async()=>{
   const s=(await db.query('INSERT INTO edu_submissions(lesson_id,student_enrollment_id) VALUES($1,$2) RETURNING *',[lesson.id,enrollment])).rows[0];
   await assert.rejects(db.query('UPDATE edu_submissions SET submitted_at=now() WHERE id=$1',[s.id]),/edu_answer_required/);
   await assert.rejects(db.query('UPDATE edu_submissions SET external_received_at=now(),external_received_by=$2 WHERE id=$1',[s.id,users.empty.id]),/head_coach_required/);
   await db.query("INSERT INTO storage.objects(bucket_id,name) VALUES('edu-files',$1)",['submission/'+s.id+'/report.pdf']);
   await db.query('UPDATE edu_submissions SET submitted_at=now() WHERE id=$1',[s.id]);
   assert.ok((await db.query('SELECT submitted_at FROM edu_submissions WHERE id=$1',[s.id])).rows[0].submitted_at);
   assert.equal((await db.query('SELECT edu_file_allowed($1,true) AS allowed',['submission/'+s.id+'/report.pdf'])).rows[0].allowed,false);
  });
 } finally {await db.close();}
});

test('수석코치 외부 접수는 학생이 위조하거나 수정할 수 없으며 알림을 막는다',async()=>{
 const f=await fixture();const {db}=f;
 try {
  const id=await f.app(120);await asUser(db,users.head,()=>f.confirm(id));await asUser(db,users.empty,()=>db.query('SELECT edu_claim_registrations()'));
  const lesson=await f.preparation();const enrollment=(await db.query('SELECT id FROM edu_enrollments WHERE application_id=$1',[id])).rows[0].id;
  await asUser(db,users.empty,()=>assert.rejects(db.query('SELECT edu_mark_preparation_received($1,$2,true)',[enrollment,lesson.id]),/head_coach_required/));
  await asUser(db,users.empty,()=>db.query(`INSERT INTO edu_submissions(lesson_id,student_enrollment_id,answers) VALUES($1,$2,'{"report":"비공개 초안"}')`,[lesson.id,enrollment]));
  await asUser(db,users.head,async()=>{
   const receipt=(await db.query('SELECT * FROM edu_mark_preparation_received($1,$2,true)',[enrollment,lesson.id])).rows[0];
   assert.deepEqual(receipt.answers,{});
   assert.equal((await db.query('SELECT * FROM edu_submissions WHERE id=$1',[receipt.id])).rows.length,0,'접수 표시 후에도 초안 본문은 수석에게 노출하지 않는다');
   const status=(await db.query('SELECT * FROM edu_preparation_statuses()')).rows[0];assert.equal(status.enrollment_id,enrollment);assert.ok(status.external_received_at);assert.equal('answers' in status,false);
  });
  await asUser(db,users.empty,async()=>{
   const row=(await db.query('SELECT * FROM edu_submissions')).rows[0];assert.ok(row.external_received_at);assert.equal(row.submitted_at,null);
   assert.equal(row.answers.report,'비공개 초안');
   await assert.rejects(db.query('SELECT * FROM edu_preparation_statuses()'),/head_coach_required/);
   await assert.rejects(db.query("UPDATE edu_submissions SET answers='{}' WHERE id=$1",[row.id]),/edu_submission_immutable/);
   assert.equal((await db.query('SELECT edu_file_allowed($1,true) AS allowed',['submission/'+row.id+'/report.pdf'])).rows[0].allowed,false);
  });
  await f.service(async()=>{
   const mail=await f.claimMail(id);assert.equal(mail.ok,true);
   await db.query('SELECT edu_finish_onboarding_email($1,$2)',[mail.delivery_id,'provider-120']);
  });
  await db.query("UPDATE edu_onboarding_email_deliveries SET sent_at=now()-interval '2 days',attempted_at=now()-interval '2 days' WHERE application_id=$1",[id]);
  await f.service(async()=>{const mail=await f.claimMail(id,'reminder_3d',null);assert.equal(mail.reason,'already_submitted');});
  await asUser(db,users.head,()=>db.query('SELECT edu_mark_preparation_received($1,$2,false)',[enrollment,lesson.id]));
  await f.service(async()=>assert.equal((await f.claimMail(id,'reminder_3d',null)).ok,true));
 } finally {await db.close();}
});

test('발송 선점, 마감 알림 간격과 발송 직전 재검사는 영속적이다',async()=>{
 const f=await fixture();const {db}=f;
 try {
  const id=await f.app(130);await asUser(db,users.head,()=>f.confirm(id));
  await asUser(db,users.head,()=>assert.rejects(f.claimMail(id),/permission denied/));
  await f.service(async()=>assert.equal((await f.claimMail(id)).reason,'preparation_not_ready'));
  const lesson=await f.preparation();
  await f.service(async()=>{
   assert.equal((await f.claimMail(id,'welcome',users.mentor.id)).reason,'head_coach_required');
   const mails=await Promise.all([f.claimMail(id),f.claimMail(id)]);
   assert.equal(mails.filter(m=>m.ok).length,1,'동시 요청 중 영속 선점은 한 번만 성공한다');
   assert.equal(mails.find(m=>!m.ok).reason,'delivery_uncertain');
   const mail=mails.find(m=>m.ok);assert.equal(mail.recipient,users.empty.email);assert.equal(mail.class_title,f.a.title);
   await db.query('SELECT edu_finish_onboarding_email($1,$2)',[mail.delivery_id,'provider-130']);
   assert.equal((await f.claimMail(id)).reason,'already_sent');
   assert.equal((await f.claimMail(id,'reminder_3d',null)).reason,'reminder_spacing');
  });
  await db.query("UPDATE edu_onboarding_email_deliveries SET sent_at=now()-interval '2 days',attempted_at=now()-interval '2 days' WHERE application_id=$1",[id]);
  let reminder;
  await f.service(async()=>{
   const candidates=(await db.query('SELECT * FROM edu_onboarding_reminder_candidates()')).rows;assert.deepEqual(candidates,[{application_id:id,kind:'reminder_3d'}]);
   assert.equal((await db.query('SELECT * FROM edu_onboarding_reminder_candidates()')).rows.length,1,'대상 조회는 선점하지 않는다');
   reminder=await f.claimMail(id,'reminder_3d',null);assert.equal(reminder.ok,true);
  });
  await asUser(db,users.head,()=>db.query('SELECT edu_cancel_registration($1)',[id]));
  await f.service(async()=>{
   assert.equal((await db.query('SELECT edu_check_onboarding_email($1) AS result',[reminder.delivery_id])).rows[0].result.reason,'registration_inactive');
   await db.query('SELECT edu_finish_onboarding_email($1,NULL,$2)',[reminder.delivery_id,'ineligible_before_send']);
  });
  assert.equal((await db.query('SELECT status FROM edu_onboarding_email_deliveries WHERE id=$1',[reminder.delivery_id])).rows[0].status,'uncertain');
  const next=await f.app(131,users.other);await asUser(db,users.head,()=>f.confirm(next,f.a,users.other));
  await f.service(async()=>{
   const m=await f.claimMail(next);await db.query('SELECT edu_finish_onboarding_email($1,NULL,$2)',[m.delivery_id,'provider_timeout']);
  });
  await db.query("UPDATE edu_onboarding_email_deliveries SET attempted_at='2020-01-01' WHERE application_id=$1",[next]);
  await f.service(async()=>assert.equal((await f.claimMail(next)).reason,'delivery_uncertain','시간 경과로 불확실한 메일을 재전송하지 않는다'));
 } finally {await db.close();}
});

test('신청 예약 전환과 미가입 반 정원 축소는 같은 좌석을 한 번만 센다',async()=>{
 const f=await fixture();const {db}=f;
 try {
  const one=await f.app(140,users.empty,{status:'payment_pending'});
  const two=await f.app(141,users.other,{status:'payment_pending'});
  await asUser(db,users.head,async()=>{
   await db.query('UPDATE edu_classes SET capacity=2 WHERE id=$1',[f.a.id]);
   await f.confirm(one);await f.confirm(two,f.a,users.other);
   await assert.rejects(db.query('UPDATE edu_classes SET capacity=1 WHERE id=$1',[f.a.id]),/edu_capacity_below_reservations/);
  });
  assert.equal((await db.query('SELECT edu_class_occupied($1) AS n',[f.a.id])).rows[0].n,2);
  assert.equal((await db.query('SELECT edu_cohort_occupied($1) AS n',[f.a.cohort_id])).rows[0].n,2);
  await asUser(db,users.empty,()=>db.query('SELECT edu_claim_registrations()'));
  assert.equal((await db.query('SELECT edu_class_occupied($1) AS n',[f.a.id])).rows[0].n,2);
  assert.equal((await db.query('SELECT edu_cohort_occupied($1) AS n',[f.a.cohort_id])).rows[0].n,2);
  await db.query("UPDATE program_applications SET status='cancelled' WHERE id=$1",[two]);
  assert.equal((await db.query('SELECT edu_class_occupied($1) AS n',[f.a.id])).rows[0].n,1);
  await asUser(db,users.other,async()=>assert.equal((await db.query('SELECT edu_claim_registrations() AS n')).rows[0].n,0));
 } finally {await db.close();}
});

test('전날 알림은 마감·공개·수신간격·제출 상태를 재검사하고 최대 두 종류만 보낸다',async()=>{
 const f=await fixture();const {db}=f;
 try {
  const id=await f.app(150);await asUser(db,users.head,()=>f.confirm(id));const lesson=await f.preparation();
  await f.service(async()=>{
   const welcome=await f.claimMail(id);await db.query('SELECT edu_finish_onboarding_email($1,$2)',[welcome.delivery_id,'welcome-150']);
  });
  await db.query("UPDATE edu_onboarding_email_deliveries SET sent_at=now()-interval '4 days',attempted_at=now()-interval '4 days' WHERE application_id=$1",[id]);
  await f.service(async()=>{
   const three=await f.claimMail(id,'reminder_3d',null);await db.query('SELECT edu_finish_onboarding_email($1,$2)',[three.delivery_id,'three-150']);
  });
  await db.query("UPDATE edu_lessons SET due_at=now()+interval '1 day' WHERE id=$1",[lesson.id]);
  await f.service(async()=>assert.equal((await f.claimMail(id,'reminder_1d',null)).reason,'reminder_spacing'));
  await db.query("UPDATE edu_onboarding_email_deliveries SET attempted_at=now()-interval '2 days' WHERE application_id=$1 AND kind='reminder_3d'",[id]);
  await db.query('UPDATE edu_lessons SET reminders_enabled=false WHERE id=$1',[lesson.id]);
  await f.service(async()=>assert.equal((await f.claimMail(id,'reminder_1d',null)).reason,'reminders_inactive'));
  await db.query('UPDATE edu_lessons SET reminders_enabled=true WHERE id=$1',[lesson.id]);
  let mail;
  await f.service(async()=>{mail=await f.claimMail(id,'reminder_1d',null);assert.equal(mail.ok,true);});
  await asUser(db,users.empty,async()=>{
   await db.query('SELECT edu_claim_registrations()');
   const e=(await db.query('SELECT id FROM edu_enrollments WHERE application_id=$1',[id])).rows[0].id;
   await db.query(`INSERT INTO edu_submissions(lesson_id,student_enrollment_id,answers,submitted_at)
    VALUES($1,$2,'{"report":"이번 주에 관찰한 내용입니다."}',now())`,[lesson.id,e]);
  });
  await f.service(async()=>assert.equal((await db.query('SELECT edu_check_onboarding_email($1) AS r',[mail.delivery_id])).rows[0].r.reason,'already_submitted'));
  assert.equal((await db.query("SELECT count(*)::int AS n FROM edu_onboarding_email_deliveries WHERE application_id=$1 AND kind<>'welcome'",[id])).rows[0].n,2);
 } finally {await db.close();}
});

test('신규 준비 기능이 정규 과제 필수 응답과 개인 초안 권한을 넓히지 않는다',async()=>{
 const f=await fixture();const {db}=f;
 try {
  const id=await f.app(160);await asUser(db,users.head,()=>f.confirm(id));await asUser(db,users.empty,()=>db.query('SELECT edu_claim_registrations()'));
  const e=(await db.query('SELECT id FROM edu_enrollments WHERE application_id=$1',[id])).rows[0].id;
  const l=await asUser(db,users.head,async()=>{
   await db.query("SELECT edu_add_member($1,$2,'담당 강사','instructor')",[f.a.id,users.instructor.email]);
   return (await db.query(`INSERT INTO edu_lessons(class_id,position,title,publish_at,questions)
    VALUES($1,1,'정규 과제',now()-interval '1 hour','[{"id":"required","prompt":"필수 답변","required":true}]') RETURNING id`,[f.a.id])).rows[0].id;
  });
  let s;
  await asUser(db,users.empty,async()=>{
   s=(await db.query('INSERT INTO edu_submissions(lesson_id,student_enrollment_id) VALUES($1,$2) RETURNING id',[l,e])).rows[0].id;
   await db.query("INSERT INTO storage.objects(bucket_id,name) VALUES('edu-files',$1)",['submission/'+s+'/file.pdf']);
   await assert.rejects(db.query('UPDATE edu_submissions SET submitted_at=now() WHERE id=$1',[s]),/edu_answer_required/);
  });
  await asUser(db,users.instructor,async()=>{
   assert.equal((await db.query('SELECT * FROM edu_submissions WHERE id=$1',[s])).rows.length,0);
   await assert.rejects(db.query('SELECT edu_mark_preparation_received($1,$2,true)',[e,l]),/head_coach_required/);
   await assert.rejects(db.query('SELECT edu_onboarding_reminder_candidates()'),/permission denied/);
   await assert.rejects(db.query('SELECT edu_check_onboarding_email($1)',[uid(999)]),/permission denied/);
  });
  await asUser(db,users.head,async()=>{
   assert.equal((await db.query('SELECT * FROM edu_submissions WHERE id=$1',[s])).rows.length,0,'미제출 개인 초안은 수석 목록에도 노출하지 않는다');
   await assert.rejects(db.query('SELECT edu_mark_preparation_received($1,$2,true)',[e,l]),/edu_preparation_not_found/);
  });
  await asUser(db,users.empty,()=>db.query(`UPDATE edu_submissions SET answers='{"required":"작성 완료"}',submitted_at=now() WHERE id=$1`,[s]));
  await asUser(db,users.head,()=>assert.rejects(db.query("UPDATE edu_lessons SET kind='preparation',position=0 WHERE id=$1",[l]),/edu_identity_immutable/));
 } finally {await db.close();}
});

test('승인 후 기존 배정 화면으로 연결한 학생도 제출 알림에서 제외하고 로그인 링크를 보완한다',async()=>{
 const f=await fixture();const {db}=f;
 try {
  const id=await f.app(170);await asUser(db,users.head,()=>f.confirm(id));const l=await f.preparation();
  const enrollment=await asUser(db,users.head,async()=>(await db.query("SELECT * FROM edu_add_member($1,$2,$3,'student',$4)",[f.a.id,users.empty.email,users.empty.name,id])).rows[0]);
  assert.equal((await db.query('SELECT claimed_enrollment_id FROM edu_registration_onboarding WHERE application_id=$1',[id])).rows[0].claimed_enrollment_id,null);
  await f.service(async()=>{const welcome=await f.claimMail(id);assert.equal(welcome.ok,true);await db.query('SELECT edu_finish_onboarding_email($1,$2)',[welcome.delivery_id,'welcome-170']);});
  await db.query("UPDATE edu_onboarding_email_deliveries SET sent_at=now()-interval '2 days' WHERE application_id=$1",[id]);
  // 이미 열려 있던 이전 포털은 새 claim RPC를 호출하지 않고도 제출할 수 있다.
  await asUser(db,users.empty,()=>db.query(`INSERT INTO edu_submissions(lesson_id,student_enrollment_id,answers,submitted_at)
    VALUES($1,$2,'{"report":"작성한 보고서"}',now())`,[l.id,enrollment.id]));
  await f.service(async()=>assert.equal((await f.claimMail(id,'reminder_3d',null)).reason,'already_submitted'));
  await asUser(db,users.empty,async()=>{
   assert.equal((await db.query('SELECT edu_claim_registrations() AS n')).rows[0].n,1);
   assert.equal((await db.query('SELECT edu_claim_registrations() AS n')).rows[0].n,0);
  });
  assert.equal((await db.query('SELECT claimed_enrollment_id FROM edu_registration_onboarding WHERE application_id=$1',[id])).rows[0].claimed_enrollment_id,enrollment.id);
  assert.equal((await db.query('SELECT count(*)::int AS n FROM edu_enrollments WHERE application_id=$1',[id])).rows[0].n,1);
  const other=await f.app(171,users.other);await asUser(db,users.head,async()=>{
   await f.confirm(other,f.a,users.other);
   const e=(await db.query("SELECT * FROM edu_add_member($1,$2,$3,'student',$4)",[f.a.id,users.other.email,users.other.name,other])).rows[0];
   await db.query("UPDATE edu_enrollments SET status='withdrawn' WHERE id=$1",[e.id]);
  });
  await asUser(db,users.other,async()=>assert.equal((await db.query('SELECT edu_claim_registrations() AS n')).rows[0].n,0));
  await f.service(async()=>assert.equal((await f.claimMail(other)).reason,'registration_inactive'));
 } finally {await db.close();}
});

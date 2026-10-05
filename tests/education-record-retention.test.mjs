// 수료 후 1년 원문 접근 제한과 수석의 백업·정리 조회 권한을 검증한다.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createDB,seed,asUser,users} from './helpers/education-db.mjs';
test('기존 완료 과정의 일반 수정은 시각을 추정하지 않고 실제 과거 수료일 보충을 허용한다',async()=>{
 const db=await createDB();try {
  const f=await seed(db);
  const cohort=(await db.query('SELECT cohort_id FROM edu_classes WHERE id=$1',[f.a.id])).rows[0].cohort_id;
  await db.query("UPDATE edu_cohorts SET status='completed' WHERE id=$1",[cohort]);
  await db.exec(await readFile(new URL('../supabase/migrations/20261005080000_education_record_retention.sql',import.meta.url),'utf8'));
  await asUser(db,users.head,()=>db.query("UPDATE edu_cohorts SET title='이전 완료 과정' WHERE id=$1",[cohort]));
  assert.equal((await db.query('SELECT completed_at FROM edu_cohorts WHERE id=$1',[cohort])).rows[0].completed_at,null);
  await asUser(db,users.head,()=>assert.rejects(db.query("UPDATE edu_cohorts SET completed_at=now()+interval '1 day' WHERE id=$1",[cohort]),/edu_invalid_completion_date/));
  const actual=new Date('2024-10-01T00:00:00Z');
  await asUser(db,users.head,()=>db.query('UPDATE edu_cohorts SET completed_at=$1 WHERE id=$2',[actual,cohort]));
  assert.equal((await db.query('SELECT completed_at FROM edu_cohorts WHERE id=$1',[cohort])).rows[0].completed_at.toISOString(),actual.toISOString());
 }finally{await db.close()}
});
test('수료 시각을 서버에서 보존하고 만료 원문은 학생·멘토에게 숨기며 수석은 정리 대상만 확인한다',async()=>{
 const db=await createDB();try {
  const f=await seed(db);
  await db.exec(await readFile(new URL('../supabase/migrations/20261005080000_education_record_retention.sql',import.meta.url),'utf8'));
  const cohort=(await db.query('SELECT cohort_id FROM edu_classes WHERE id=$1',[f.a.id])).rows[0].cohort_id;
  const submission=(await asUser(db,users.student,()=>db.query('INSERT INTO edu_submissions(lesson_id,student_enrollment_id,answers,submitted_at) VALUES($1,$2,$3,now()) RETURNING id',[f.lesson.id,f.student.id,{q1:'내 교육 답변'}]))).rows[0].id;
  await asUser(db,users.mentor,()=>db.query("INSERT INTO edu_feedback(submission_id,body,is_shared) VALUES($1,'공유 피드백',true)",[submission]));
  await asUser(db,users.head,()=>db.query("UPDATE edu_cohorts SET status='completed' WHERE id=$1",[cohort]));
  const first=(await db.query('SELECT completed_at FROM edu_cohorts WHERE id=$1',[cohort])).rows[0].completed_at;
  await asUser(db,users.head,()=>db.query("UPDATE edu_cohorts SET completed_at=now()+interval '10 years' WHERE id=$1",[cohort]));
  assert.equal((await db.query('SELECT completed_at FROM edu_cohorts WHERE id=$1',[cohort])).rows[0].completed_at.toISOString(),first.toISOString());
  const file='submission/'+submission+'/original.pdf';
  await db.query("INSERT INTO storage.objects(bucket_id,name) VALUES('edu-files',$1)",[file]);
  await asUser(db,users.student,async()=>{
   assert.equal((await db.query('SELECT id FROM edu_submissions WHERE id=$1',[submission])).rows.length,1);
   assert.equal((await db.query('SELECT name FROM storage.objects WHERE name=$1',[file])).rows.length,1);
   await assert.rejects(db.query('SELECT edu_record_retention_due()'),/edu_head_required/);
  });
  // 합성 데이터의 경과 시간을 재현한다. 운영에서 trigger를 해제하지 않는다.
  await db.exec('ALTER TABLE edu_cohorts DISABLE TRIGGER edu_stamp_completion');
  await db.query("UPDATE edu_cohorts SET completed_at=now()-interval '1 year 1 second' WHERE id=$1",[cohort]);
  await db.exec('ALTER TABLE edu_cohorts ENABLE TRIGGER edu_stamp_completion');
  for(const user of [users.student,users.mentor]) await asUser(db,user,async()=>{
   assert.equal((await db.query('SELECT id FROM edu_submissions WHERE id=$1',[submission])).rows.length,0);
   assert.equal((await db.query('SELECT id FROM edu_feedback WHERE submission_id=$1',[submission])).rows.length,0);
   assert.equal((await db.query('SELECT name FROM storage.objects WHERE name=$1',[file])).rows.length,0);
  });
  await asUser(db,users.head,async()=>{
   assert.equal((await db.query('SELECT id FROM edu_submissions WHERE id=$1',[submission])).rows.length,1);
   const due=(await db.query('SELECT edu_record_retention_due() AS r')).rows[0].r;
   assert.equal(due[0].state,'due');assert.equal(due[0].submissions,1);
  });
 }finally{await db.close()}
});

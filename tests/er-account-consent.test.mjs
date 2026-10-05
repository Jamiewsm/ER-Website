// 합성 문서와 계정으로 가입 동의의 권한·원자성·철회·문구 변경을 검증한다.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {createDB,asUser,users,uid} from './helpers/education-db.mjs';
const purposes=['policy_notice','terms_acceptance','privacy_required','news_email','events_email','kakao_messages'];
export const documents=purposes.map(purpose=>({purpose,title:purpose,body:'격리 테스트 전용 안내문입니다. 운영에 공개하지 않습니다. 목적·항목·보관·철회 테스트.'}));
export async function consentFixture() {
 const db=await createDB({beforeMigration:async db=>{
  await db.exec('ALTER TABLE coach_profiles ENABLE ROW LEVEL SECURITY; GRANT SELECT ON coach_profiles TO authenticated; CREATE POLICY visible_profiles ON coach_profiles FOR SELECT TO authenticated USING(true);');
 }});
 await db.exec(`ALTER TABLE auth.users ADD COLUMN email_confirmed_at timestamptz,ADD COLUMN raw_user_meta_data jsonb DEFAULT '{}';
 UPDATE auth.users SET email_confirmed_at=now();
 CREATE FUNCTION edu_request_enrollment(p_class_id uuid,p_display_name text) RETURNS uuid LANGUAGE sql AS $$SELECT p_class_id$$;
 CREATE FUNCTION edu_claim_registrations() RETURNS integer LANGUAGE sql AS $$SELECT 1$$;
 CREATE FUNCTION require_head_coach() RETURNS void LANGUAGE plpgsql AS $$BEGIN IF NOT edu_is_head() THEN RAISE EXCEPTION 'forbidden'; END IF; END$$;
 GRANT USAGE ON SCHEMA public TO service_role;`);
 await db.exec(await readFile(new URL('../supabase/migrations/20261005070000_er_account_consent.sql',import.meta.url),'utf8'));
 return db;
}
export async function publish(db,version='test-v1') {
 await db.query('INSERT INTO er_consent_documents(version,documents,approved_by,effective_at) VALUES($1,$2,$3,now())',[version,JSON.stringify(documents),'synthetic-test-only']);
}
const changes={policy_notice:'acknowledge',terms_acceptance:'accept',privacy_required:'agree',news_email:'reject',events_email:'reject',kakao_messages:'reject'};
const payload=(extra={})=>({version:'test-v1',revision:0,request_id:randomUUID(),changes:{...changes},...extra});
const state=async(db)=>(await db.query('SELECT er_consent_state() AS s')).rows[0].s;
const save=async(db,p)=>(await db.query('SELECT er_save_consent($1) AS s',[p])).rows[0].s;
const account=async(db,n=800,meta={})=>{
 const u={id:uid(n),email:`new${n}@example.test`};
 await db.query('INSERT INTO auth.users(id,email,email_confirmed_at,raw_user_meta_data) VALUES($1,$2,now(),$3)',[u.id,u.email,meta]);return u;
};
test('미공개 문서에서는 신규 동의를 저장하지 않고 기존 계정의 접근·미확인 상태는 보존한다',async()=>{
 const db=await consentFixture();try {
  await asUser(db,users.student,async()=>{assert.equal((await state(db)).membership,'legacy');assert.equal((await state(db)).history.length,0);assert.equal((await db.query('SELECT er_membership_active() AS a')).rows[0].a,true)});
  const u=await account(db);
  await asUser(db,u,async()=>{
   assert.equal((await state(db)).membership,'pending');
   await assert.rejects(save(db,payload()),/er_policy_unavailable_or_stale/);
   await assert.rejects(db.query('SELECT edu_request_enrollment($1,$2)',[uid(601),'학생']),/er_required_consent_missing/);
   await assert.rejects(db.query('SELECT edu_claim_registrations()'),/er_required_consent_missing/);
   assert.equal((await db.query('SELECT * FROM edu_courses')).rows.length,0);
   assert.equal((await db.query('SELECT * FROM coach_profiles')).rows.length,0);
   assert.equal((await db.query('SELECT edu_is_head() AS a')).rows[0].a,false);
   await assert.rejects(db.query('SELECT require_head_coach()'),/er_required_consent_missing/);
  });
 }finally{await db.close()}
});
test('이메일 가입 동의는 계정 생성과 원자적으로 저장하며 필수 누락·위조·직접 쓰기를 차단한다',async()=>{
 const db=await consentFixture();try {
  await publish(db);const p=payload();
  const bad=payload({changes:{...changes,privacy_required:'reject'}});
  await assert.rejects(account(db,801,{er_consent:bad}),/er_invalid_consent/);
  assert.equal((await db.query('SELECT * FROM auth.users WHERE id=$1',[uid(801)])).rows.length,0);
  const u=await account(db,802,{er_consent:p});
  await asUser(db,u,async()=>{
   const s=await state(db);assert.equal(s.membership,'active');assert.equal(s.history.length,6);assert.equal(s.current.filter(x=>x.action==='agree').length,1);
   const doc=(await db.query('SELECT er_consent_catalog() AS c')).rows[0].c.documents.find(d=>d.purpose==='privacy_required');
   assert.equal(s.current.find(x=>x.purpose==='privacy_required').document_digest.length,64);
   assert.equal((await db.query('SELECT edu_claim_registrations() AS n')).rows[0].n,1);
   for(const table of ['er_consent_events','er_memberships','er_consent_requests','er_consent_documents']) await assert.rejects(db.query(`SELECT * FROM ${table}`),/permission denied/);
   await assert.rejects(db.query('SELECT er_record_consent($1,$2,$3)',[users.other.id,p,'settings']),/permission denied/);
   assert.equal(doc.body,documents[2].body);
  });
  const partial=payload({changes:{policy_notice:'acknowledge'}});
  await assert.rejects(account(db,803,{er_consent:partial}),/er_required_consent_missing/);
  await asUser(db,users.other,async()=>assert.equal((await state(db)).history.length,0));
  await asUser(db,null,async()=>{
   assert.ok((await db.query('SELECT er_consent_catalog() AS c')).rows[0].c.version);
   await assert.rejects(db.query('SELECT er_consent_state()'),/permission denied/);
  });
 }finally{await db.close()}
});
test('소셜 인증 후 필수 동의 완료·중복 요청·stale revision·문구 변경을 서버에서 검증한다',async()=>{
 const db=await consentFixture();try {
  await publish(db);const u=await account(db);let rev;
  await asUser(db,u,async()=>{
   const p=payload({changes:{...changes,news_email:'agree'}});
   const s=await save(db,p);rev=s.revision;assert.equal(s.membership,'active');
   assert.equal((await save(db,p)).revision,rev);
   await assert.rejects(save(db,{...p,changes:{...changes}}),/er_idempotency_conflict/);
   await assert.rejects(save(db,payload({changes:{news_email:'withdraw'}})),/er_consent_changed/);
   await assert.rejects(save(db,payload({revision:rev,user_id:users.other.id,changes:{events_email:'agree'}})),/er_invalid_consent/);
  });
  await publish(db,'test-v2');
  await asUser(db,u,async()=>{
   await assert.rejects(save(db,payload({revision:rev,changes:{events_email:'agree'}})),/er_policy_unavailable_or_stale/);
   assert.equal((await state(db)).revision,rev);
  });
 }finally{await db.close()}
});
test('목적별 철회는 기존 동의 버전을 참조하며 발송 대상에서 즉시 제외되고 수업 접근은 유지한다',async()=>{
 const db=await consentFixture();try {
  await publish(db);const u=await account(db,805,{er_consent:payload({changes:{...changes,news_email:'agree',events_email:'agree',kakao_messages:'agree'}})});
  await asUser(db,u,async()=>{
   await assert.rejects(db.query("SELECT * FROM er_email_recipients('news_email')"),/permission denied/);
   const s=await state(db);await save(db,payload({version:'unavailable',revision:s.revision,changes:{news_email:'withdraw',kakao_messages:'withdraw'}}));
   assert.equal((await state(db)).membership,'active');
   assert.equal((await state(db)).current.find(x=>x.purpose==='news_email').version,'test-v1');
   assert.equal((await db.query('SELECT er_membership_active() AS a')).rows[0].a,true);
  });
  await db.exec('SET ROLE service_role');
  assert.equal((await db.query("SELECT * FROM er_email_recipients('news_email')")).rows.length,0);
  assert.equal((await db.query("SELECT * FROM er_email_recipients('events_email')")).rows.length,1);
  await db.exec('RESET ROLE');
  await assert.rejects(db.query('UPDATE er_consent_events SET action=$1',['agree']),/er_consent_immutable/);
  await assert.rejects(db.query('UPDATE er_consent_documents SET version=$1',['altered']),/er_consent_immutable/);
  await db.query('DELETE FROM auth.users WHERE id=$1',[u.id]);
  assert.equal((await db.query('SELECT * FROM er_consent_events WHERE user_id=$1',[u.id])).rows.length,0);
 }finally{await db.close()}
});

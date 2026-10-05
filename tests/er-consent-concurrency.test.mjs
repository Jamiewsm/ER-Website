// 실제 PostgreSQL의 독립 세션으로 동시 동의 저장과 중복 요청의 원자성을 검증한다.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createPostgres,uid} from './helpers/education-postgres.mjs';
const literal=value=>"'"+JSON.stringify(value).replaceAll("'","''")+"'::jsonb";
const identity=`SELECT set_config('request.jwt.claim.sub','${uid(800)}',false); SET ROLE authenticated;`;
const p={version:'race-test-v1',revision:0,request_id:uid(900),changes:{policy_notice:'acknowledge',terms_acceptance:'accept',privacy_required:'agree',news_email:'agree',events_email:'reject',kakao_messages:'reject'}};
async function fixture(cluster,name) {
 const db=await cluster.database(name);
 await db.query(`ALTER TABLE auth.users ADD COLUMN email_confirmed_at timestamptz,ADD COLUMN raw_user_meta_data jsonb DEFAULT '{}';
 UPDATE auth.users SET email_confirmed_at=now();
 CREATE FUNCTION edu_claim_registrations() RETURNS integer LANGUAGE sql AS $$SELECT 0$$;
 CREATE FUNCTION edu_request_enrollment(p_class_id uuid,p_display_name text) RETURNS uuid LANGUAGE sql AS $$SELECT p_class_id$$;`);
 await db.query(await readFile(new URL('../supabase/migrations/20261005070000_er_account_consent.sql',import.meta.url),'utf8'));
 const documents=Object.keys(p.changes).map(purpose=>({purpose,title:purpose,body:'독립 세션 경쟁 검사를 위한 합성 문서이며 운영에 공개하지 않습니다.'}));
 await db.query(`INSERT INTO er_consent_documents(version,documents,approved_by,effective_at) VALUES('race-test-v1',${literal(documents)},'synthetic-test-only',now());
 INSERT INTO auth.users(id,email,email_confirmed_at) VALUES('${uid(800)}','race@example.test',now());`);
 return db;
}
async function race(db,secondPayload,error) {
 const first=db.session(),second=db.session();
 first.write(`BEGIN; ${identity} SELECT 'PID:'||pg_backend_pid(); SELECT er_save_consent(${literal(p)}); SELECT 'READY';`);
 await first.until('READY');
 const firstPID=Number(await first.value('PID:'));
 second.write(`BEGIN; ${identity} SELECT 'PID:'||pg_backend_pid(); SELECT er_save_consent(${literal(secondPayload)}); COMMIT;`);
 const secondPID=Number(await second.value('PID:'));
 await db.blockedBy(secondPID,firstPID);
 second.end();first.end('COMMIT;');
 assert.equal((await first.done).code,0);
 const result=await second.done;
 if(error){assert.notEqual(result.code,0);assert.match(result.stderr,error)}else assert.equal(result.code,0,result.stderr);
 assert.equal(await db.query('SELECT count(*) FROM er_consent_events;'),'6');
 assert.equal(await db.query('SELECT count(*) FROM er_consent_requests;'),'1');
}
test('독립 세션의 동일 요청은 한 번 저장되고 다른 변경의 stale revision은 부분 저장 없이 차단한다',async()=>{
 const cluster=await createPostgres();try {
  await race(await fixture(cluster,'er_consent_duplicate'),p);
  await race(await fixture(cluster,'er_consent_stale'),{...p,request_id:uid(901),changes:{events_email:'agree'}},/er_consent_changed/);
 }finally{await cluster.close()}
});

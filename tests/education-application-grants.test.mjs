// Real migrations, real roles, synthetic data, and no automatic table grants.
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile, readdir } from 'node:fs/promises';
import { createPostgres } from './helpers/education-postgres.mjs';

test('application service works without automatic public table grants',
  { skip: !process.env.PG_BIN_DIR, timeout: 90000 }, async t => {
    const cluster = await createPostgres();
    t.after(() => cluster.close());
    t.diagnostic(`Disposable PostgreSQL ${cluster.version}; private socket; synthetic records only.`);
    const db = await cluster.database('explicit_application_grants', { applicationMigrations: true });
    const tables = ['edu_courses', 'edu_cohorts', 'program_applications'];
    for (const table of tables) {
      await assert.rejects(db.query(`set role service_role; select * from ${table};`), /permission denied for table/);
    }
    const existingACLs = await db.query("select relname,coalesce(relacl::text,'{}') from pg_class where oid in ('edu_courses'::regclass,'edu_cohorts'::regclass,'program_applications'::regclass) order by relname;");
    // Apply the additive fix as a migration, rather than injecting equivalent test grants.
    const migrations = new URL('../supabase/migrations/', import.meta.url);
    for (const filename of (await readdir(migrations)).filter(f => f.endsWith('_application_service_explicit_grants.sql'))) {
      const sql = await readFile(new URL(filename, migrations), 'utf8');
      await db.query(sql);
      await db.query(sql); // replay must preserve the same contract
    }
    assert.equal(await db.query("select count(*) from pg_default_acl where defaclobjtype='r';"), '0');
    assert.equal(await db.query("select has_schema_privilege('service_role','public','usage');"), 't');
    for (const table of tables) {
      const allowed = table === 'program_applications' ? ['SELECT','INSERT','UPDATE'] : ['SELECT'];
      for (const privilege of ['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER']) {
        assert.equal(await db.query(`select has_table_privilege('service_role','${table}','${privilege}');`), allowed.includes(privilege) ? 't' : 'f', `${table} ${privilege}`);
      }
    }
    // Same catalog lookups, INSERT RETURNING, conditional claim, and receipt update as submit-application.
    await db.query(`set role service_role; select id,code,title,kind from edu_courses;
      select id,course_id from edu_cohorts;
      insert into program_applications(id,program_key,name,contact,cohort_key)
      values('20000000-0000-4000-8000-000000000001','general','Synthetic','applicant@example.test','test') returning id;
      update program_applications set confirmation_email_attempted_at=now()
      where id='20000000-0000-4000-8000-000000000001'
      and confirmation_email_attempted_at is null and confirmation_email_sent_at is null returning id;
      update program_applications set receipt_email_sent_at=now(),confirmation_email_sent_at=now()
      where id='20000000-0000-4000-8000-000000000001';`);
    assert.equal(await db.query(`set role service_role; select count(*) from program_applications
      where receipt_email_sent_at is not null and confirmation_email_attempted_at is not null
      and confirmation_email_sent_at is not null;`), '1');
    // BYPASSRLS alone must not grant unrelated mutation privileges.
    for (const sql of ['delete from program_applications', 'update edu_courses set title=title', 'delete from edu_cohorts']) {
      await assert.rejects(db.query(`set role service_role; ${sql};`), /permission denied/);
    }
    for (const role of ['anon','authenticated']) {
      for (const operation of ['select * from','insert into']) {
        const sql = operation.startsWith('insert')
          ? "insert into program_applications(name,contact) values('Synthetic','blocked@example.test')"
          : 'select * from program_applications';
        await assert.rejects(db.query(`set role ${role}; ${sql};`), /permission denied/);
      }
    }
    await assert.rejects(db.query('set role anon; select * from edu_courses;'), /permission denied/);
    assert.equal(await db.query("select count(*) from pg_class where oid in ('edu_courses'::regclass,'edu_cohorts'::regclass,'program_applications'::regclass) and relrowsecurity;"), '3');
    const preservedACLs = await db.query("select relname,array(select x from unnest(relacl) x where x::text not like 'service_role=%')::text from pg_class where oid in ('edu_courses'::regclass,'edu_cohorts'::regclass,'program_applications'::regclass) order by relname;");
    assert.equal(preservedACLs, existingACLs);
  });

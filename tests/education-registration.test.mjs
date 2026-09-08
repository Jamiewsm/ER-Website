// 교실 정원과 기존 신청 예약의 연결 및 과거 기수 호환을 검증한다.
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import assert from "node:assert/strict";
import { createDB, seed, asUser, users, uid } from "./helpers/education-db.mjs";
test("registration reserves 14 places, follows added classes, preserves confirmed and legacy registrations", async () => {
  const db = await createDB();
  try {
    const f = await seed(db);
    await db.exec(`alter table program_applications add column cohort_key text, add column program_key text, add column status text, add column payment_region text, add column payment_currency text, add column payment_amount_usd numeric, add column payment_amount_krw bigint;
 create function require_head_coach() returns void language plpgsql as $$begin if not public.edu_is_head() then raise exception 'head_coach_required';end if;end$$;
 create table public_notices(legacy_key integer,summary text,body text,body_is_html boolean,program_period text,updated_at timestamptz);
 insert into public_notices(legacy_key,body) values(1,'old'),(7,'<p>8명</p>');`);
    await db.exec(
      await readFile(
        new URL(
          "../supabase/migrations/20260908091000_education_registration_capacity.sql",
          import.meta.url,
        ),
        "utf8",
      ),
    );
    for (let i = 100; i < 117; i++)
      await db.query(
        "insert into program_applications(id,cohort_key,program_key,status) values($1,'enneagram_basic_2026_10','enneagram_basic_july','received')",
        [uid(i)],
      );
    const reserve = (id) =>
      db.query(
        "select * from admin_prepare_program_application_registration($1,'enneagram_basic_2026_10',8,'KR','KRW',null,450000)",
        [id],
      );
    await asUser(db, users.student, async () => {
      await assert.rejects(reserve(uid(100)), /head_coach_required/);
    });
    await asUser(db, users.head, async () => {
      for (let i = 100; i < 114; i++)
        assert.equal((await reserve(uid(i))).rows[0].status, "payment_pending");
      assert.equal((await reserve(uid(114))).rows[0].status, "waitlisted");
      await db.exec("reset role");
      await db.query(
        "update program_applications set status='confirmed' where id=$1",
        [uid(100)],
      );
      await db.exec("set role authenticated");
      assert.equal((await reserve(uid(100))).rows[0].status, "confirmed");
      await db.query(
        "insert into edu_classes(cohort_id,title,capacity) values($1,'C반',7)",
        [f.a.cohort_id],
      );
      assert.equal((await reserve(uid(114))).rows[0].status, "payment_pending");
      assert.equal((await reserve(uid(114))).rows[0].status, "payment_pending");
    });
    for (let i = 200; i < 209; i++)
      await db.query(
        "insert into program_applications(id,cohort_key,program_key,status) values($1,'legacy-july','enneagram_basic_july','received')",
        [uid(i)],
      );
    await asUser(db, users.head, async () => {
      for (let i = 200; i < 209; i++) {
        const r = await db.query(
          "select * from admin_prepare_program_application_registration($1,'legacy-july',8,'KR','KRW',null,450000)",
          [uid(i)],
        );
        assert.equal(
          r.rows[0].status,
          i === 208 ? "waitlisted" : "payment_pending",
        );
      }
    });
    assert.match(
      (await db.query("select summary from public_notices where legacy_key=7"))
        .rows[0].summary,
      /7명/,
    );
  } finally {
    await db.close();
  }
});

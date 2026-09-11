// 교실 정원과 기존 신청 예약의 연결 및 과거 기수 호환을 검증한다.
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import assert from "node:assert/strict";
import { createDB, seed, asUser, users, uid } from "./helpers/education-db.mjs";
test("registration shares 14 places with existing enrollments, follows added classes, preserves confirmed and legacy registrations", async () => {
  const db = await createDB();
  try {
    const f = await seed(db);
    await db.exec(`alter table program_applications add column payment_region text, add column payment_currency text, add column payment_amount_usd numeric, add column payment_amount_krw bigint;
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
      for (let i = 100; i < 112; i++)
        assert.equal((await reserve(uid(i))).rows[0].status, "payment_pending");
      assert.equal((await reserve(uid(112))).rows[0].status, "waitlisted");
      await assert.rejects(
        db.query("select edu_add_member($1,$2,'정원 초과','student')", [
          f.a.id,
          users.empty.email,
        ]),
        /edu_cohort_full/,
      );
      await assert.rejects(
        db.query("update edu_classes set capacity=6 where id=$1", [f.b.id]),
        /edu_capacity_below_reservations/,
      );
      // A repeated assignment and converting a reserved application must work at total capacity.
      assert.equal(
        (
          await db.query("select * from edu_add_member($1,$2,$3,'student')", [
            f.a.id,
            users.student.email,
            "이름 수정",
          ])
        ).rows[0].id,
        f.student.id,
      );
      await assert.rejects(
        db.query(
          "select * from admin_prepare_program_application_registration($1,'wrong-cohort',8,'KR','KRW',null,450000)",
          [uid(100)],
        ),
        /edu_application_cohort_mismatch/,
      );
      await db.exec("reset role");
      await db.query(
        "update program_applications set status='confirmed' where id=$1",
        [uid(100)],
      );
      await db.query("update program_applications set contact=$1 where id=$2", [
        users.empty.email,
        uid(100),
      ]);
      await assert.rejects(
        db.query(
          "update program_applications set status='confirmed' where id=$1",
          [uid(112)],
        ),
        /edu_cohort_full/,
      );
      await db.exec("set role authenticated");
      await assert.rejects(
        db.query(
          "select * from edu_add_member($1,$2,'다른 계정','student',$3)",
          [f.a.id, users.other.email, uid(100)],
        ),
        /edu_application_email_mismatch/,
      );
      const mapped = (
        await db.query(
          "select * from edu_add_member($1,$2,'예약 학생','student',$3)",
          [f.a.id, users.empty.email, uid(100)],
        )
      ).rows[0];
      assert.equal(mapped.application_id, uid(100));
      await assert.rejects(
        db.query("select edu_link_application($1,null)", [mapped.id]),
        /edu_cohort_full/,
      );
      assert.equal(
        (
          await db.query(
            "select * from edu_add_member($1,$2,'예약 학생','student',$3)",
            [f.a.id, users.empty.email, uid(100)],
          )
        ).rows[0].id,
        mapped.id,
      );
      assert.equal((await reserve(uid(112))).rows[0].status, "waitlisted");
      await assert.rejects(
        db.query("select edu_cohort_occupied($1)", [f.a.cohort_id]),
        /permission denied/,
      );

      assert.equal((await reserve(uid(100))).rows[0].status, "confirmed");
      await db.query(
        "insert into edu_classes(cohort_id,title,capacity) values($1,'C반',7)",
        [f.a.cohort_id],
      );
      assert.equal((await reserve(uid(112))).rows[0].status, "payment_pending");
      assert.equal((await reserve(uid(112))).rows[0].status, "payment_pending");
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
    assert.equal(
      (await db.query("select body from public_notices where legacy_key=7"))
        .rows[0].body,
      "<p>8명</p>",
    );
  } finally {
    await db.close();
  }
});

test("initial classes preserve already reserved October applications during migration", async () => {
  const db = await createDB({
    beforeMigration: async (db) => {
      for (let i = 300; i < 308; i++)
        await db.query(
          "insert into program_applications(id,cohort_key,program_key,status) values($1,'enneagram_basic_2026_10','enneagram_basic_july','payment_pending')",
          [uid(i)],
        );
    },
  });
  try {
    assert.equal(
      (
        await db.query(
          "select sum(capacity)::integer as capacity from edu_classes",
        )
      ).rows[0].capacity,
      14,
    );
    assert.equal(
      (
        await db.query(
          "select count(*)::integer as count from program_applications where status='payment_pending'",
        )
      ).rows[0].count,
      8,
    );
  } finally {
    await db.close();
  }
});

test("education migrations and review-only notice draft preserve every existing public notice field", async () => {
  let before;
  const db = await createDB({
    beforeMigration: async (db) => {
      await db.exec(`
        create table public_notices(legacy_key integer primary key,title text,summary text,body text,body_is_html boolean,program_period text,updated_at timestamptz);
        insert into public_notices values
          (1,'운영 중 과정 안내','운영 중 요약','<p>사용자가 유지한 기존 과정 본문</p>',true,'기존 과정',timestamptz '2026-09-01 00:00:00+00'),
          (7,'운영 중 모집 안내','기존 모집 요약','<p>사용자가 유지한 기존 모집 본문</p>',true,'기존 모집',timestamptz '2026-09-02 00:00:00+00'),
          (99,'기타 공지',null,'다른 공지도 보존',false,null,timestamptz '2026-09-03 00:00:00+00');
      `);
      before = (
        await db.query("select * from public_notices order by legacy_key")
      ).rows;
    },
  });
  try {
    const notices = async () =>
      (await db.query("select * from public_notices order by legacy_key")).rows;
    assert.deepEqual(
      await notices(),
      before,
      "portal schema migration must preserve published notices",
    );
    await db.exec(`
      alter table program_applications add column payment_region text, add column payment_currency text, add column payment_amount_usd numeric, add column payment_amount_krw bigint;
      create function require_head_coach() returns void language plpgsql as $$begin if not public.edu_is_head() then raise exception 'head_coach_required';end if;end$$;
    `);
    await db.exec(
      await readFile(
        new URL(
          "../supabase/migrations/20260908091000_education_registration_capacity.sql",
          import.meta.url,
        ),
        "utf8",
      ),
    );
    assert.deepEqual(
      await notices(),
      before,
      "registration migration must preserve published notices",
    );
    const pending = await readFile(
      new URL(
        "../supabase/manual/education-public-notices.pending.sql",
        import.meta.url,
      ),
      "utf8",
    );
    await db.exec(pending);
    assert.deepEqual(
      await notices(),
      before,
      "review-only SQL must remain inert even if accidentally executed",
    );
  } finally {
    await db.close();
  }
});

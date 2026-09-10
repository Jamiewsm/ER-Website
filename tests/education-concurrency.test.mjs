// 서로 다른 실제 PostgreSQL 세션의 잠금 대기를 관찰해 정원 경쟁과 부분 저장을 검증한다.
import assert from "node:assert/strict";
import test from "node:test";
import { createPostgres, headSQL, uid } from "./helpers/education-postgres.mjs";

const cohortKey = "enneagram_basic_2026_10";
const reserve = (n) =>
  `select status from admin_prepare_program_application_registration('${uid(n)}','${cohortKey}',14,'KR','KRW',null,450000);`;
const place = (cls, n, application) =>
  `select id from edu_add_member('${cls}','student${n}@example.test','합성 학생','student',${application ? `'${uid(application)}'` : "null"});`;
async function fixture(cluster, name, occupied = 13) {
  const db = await cluster.database(name);
  const [a, b] = (
    await db.query("select id from edu_classes order by title;")
  ).split("\n");
  await db.query(
    Array.from(
      { length: 16 },
      (_, i) =>
        `insert into auth.users values('${uid(i + 10)}','student${i + 10}@example.test');`,
    ).join("\n"),
  );
  await db.query(
    headSQL +
      Array.from({ length: occupied }, (_, i) =>
        place(i < 7 ? a : b, i + 10),
      ).join("\n"),
  );
  return { db, a, b };
}
async function applications(db, rows) {
  await db.query(
    rows
      .map(
        ([n, status = "received", student = 23]) =>
          `insert into program_applications(id,contact,cohort_key,program_key,status) values('${uid(n)}','student${student}@example.test','${cohortKey}','enneagram_basic_july','${status}');`,
      )
      .join("\n"),
  );
}
// First operation has run but not committed. The second must wait on its actual cohort lock.
async function race(db, firstSQL, secondSQL, secondError) {
  const first = db.session(),
    second = db.session();
  first.write(
    `begin; ${headSQL} select 'PID:'||pg_backend_pid(); ${firstSQL} select 'READY';`,
  );
  await first.until("READY");
  const firstPID = Number(await first.value("PID:"));
  second.write(
    `begin; ${headSQL} select 'PID:'||pg_backend_pid(); ${secondSQL} commit;`,
  );
  const secondPID = Number(await second.value("PID:"));
  assert.ok(firstPID > 0 && secondPID > 0 && firstPID !== secondPID);
  await db.blockedBy(secondPID, firstPID);
  first.end("commit;");
  assert.equal((await first.done).code, 0);
  second.end();
  const result = await second.done;
  if (secondError) {
    assert.notEqual(result.code, 0);
    assert.match(result.stderr, secondError);
  } else assert.equal(result.code, 0, result.stderr);
  return result;
}

test(
  "independent PostgreSQL sessions preserve class and cohort capacity",
  { skip: !process.env.PG_BIN_DIR, timeout: 90000 },
  async (t) => {
    const cluster = await createPostgres();
    t.diagnostic(
      `Disposable PostgreSQL ${cluster.version}; private Unix socket, synthetic Auth/Storage metadata only.`,
    );
    try {
      await t.test("two registrations compete for the last seat", async () => {
        const { db } = await fixture(cluster, "last_reservation");
        await applications(db, [[100], [101]]);
        await race(db, reserve(100), reserve(101));
        assert.equal(
          await db.query(
            "select string_agg(status,',' order by id) from program_applications;",
          ),
          "payment_pending,waitlisted",
        );
        assert.equal(
          await db.query(
            "select edu_cohort_occupied(id) from edu_cohorts where application_cohort_key='enneagram_basic_2026_10';",
          ),
          "14",
        );
      });
      await t.test(
        "two placements compete for the last class seat",
        async () => {
          const { db, b } = await fixture(cluster, "last_placement");
          await race(db, place(b, 23), place(b, 24), /edu_class_full/);
          assert.equal(
            await db.query(
              "select count(*) from edu_enrollments where role='student';",
            ),
            "14",
          );
          assert.equal(
            await db.query(
              `select count(*) from edu_enrollments where user_id='${uid(24)}';`,
            ),
            "0",
          );
        },
      );
      await t.test(
        "converting a reservation into enrollment does not free an extra seat",
        async () => {
          const { db, b } = await fixture(cluster, "reservation_conversion");
          await applications(db, [[100, "confirmed"], [101]]);
          await race(db, place(b, 23, 100), reserve(101));
          assert.equal(
            await db.query(
              `select status from program_applications where id='${uid(101)}';`,
            ),
            "waitlisted",
          );
          assert.equal(
            await db.query(
              `select count(*) from edu_enrollments where application_id='${uid(100)}';`,
            ),
            "1",
          );
          assert.equal(
            await db.query(
              "select edu_cohort_occupied(id) from edu_cohorts where application_cohort_key='enneagram_basic_2026_10';",
            ),
            "14",
          );
        },
      );
      await t.test(
        "a capacity reduction rejects a waiting placement without a partial enrollment",
        async () => {
          const { db, b } = await fixture(cluster, "capacity_reduction");
          await race(
            db,
            `update edu_classes set capacity=6 where id='${b}';`,
            place(b, 23),
            /edu_class_full/,
          );
          assert.equal(
            await db.query("select sum(capacity) from edu_classes;"),
            "13",
          );
          assert.equal(
            await db.query(
              "select count(*) from edu_enrollments where role='student';",
            ),
            "13",
          );
          assert.equal(
            await db.query(
              `select count(*) from edu_enrollments where user_id='${uid(23)}';`,
            ),
            "0",
          );
        },
      );
      await t.test(
        "a completed placement rejects a waiting capacity reduction",
        async () => {
          const { db, b } = await fixture(cluster, "capacity_after_placement");
          await race(
            db,
            place(b, 23),
            `update edu_classes set capacity=6 where id='${b}';`,
            /edu_capacity_below_enrollment/,
          );
          assert.equal(
            await db.query("select sum(capacity) from edu_classes;"),
            "14",
          );
          assert.equal(
            await db.query(
              "select count(*) from edu_enrollments where role='student';",
            ),
            "14",
          );
        },
      );
    } finally {
      await cluster.close();
    }
  },
);

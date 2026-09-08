// 실제 Postgres 역할 전환으로 학생·멘토·수석코치 경계를 검증한다.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createDB, seed, asUser, users, uid } from "./helpers/education-db.mjs";
test("education portal enforces class, draft, submission, feedback and storage boundaries", async () => {
  const db = await createDB();
  try {
    const f = await seed(db);
    let draft;
    await asUser(db, null, async () => {
      await assert.rejects(
        db.query("select * from edu_classes"),
        /permission denied/,
      );
      await assert.rejects(
        db.query("select edu_context()"),
        /permission denied/,
      );
    });
    await asUser(db, users.empty, async () => {
      assert.equal(
        (await db.query("select * from edu_classes")).rows.length,
        0,
      );
      await assert.rejects(
        db.query(
          "insert into edu_enrollments(class_id,user_id,display_name,role) values($1,$2,'hack','instructor')",
          [f.a.id, users.empty.id],
        ),
        /row-level security/,
      );
      await assert.rejects(
        db.query("select edu_add_member($1,$2,$3,$4)", [
          f.a.id,
          users.empty.email,
          "hack",
          "instructor",
        ]),
        /head_coach_required/,
      );
    });
    await asUser(db, users.student, async () => {
      assert.deepEqual(
        (await db.query("select id from edu_classes")).rows.map((x) => x.id),
        [f.a.id],
      );
      assert.equal(
        (await db.query("select * from edu_lessons")).rows.length,
        1,
      );
      draft = (
        await db.query(
          "insert into edu_submissions(lesson_id,student_enrollment_id,answers) values($1,$2,$3) returning *",
          [f.lesson.id, f.student.id, JSON.stringify({ q1: "나의 성찰" })],
        )
      ).rows[0];
      await assert.rejects(
        db.query(
          "insert into edu_submissions(lesson_id,student_enrollment_id) values($1,$2)",
          [f.draftLesson.id, f.student.id],
        ),
        /not_open|row-level/,
      );
      await assert.rejects(
        db.query(
          "update edu_submissions set student_enrollment_id=$1 where id=$2",
          [f.other.id, draft.id],
        ),
        /immutable/,
      );
      await db.query(
        "insert into storage.objects(bucket_id,name) values('edu-files',$1)",
        ["submission/" + draft.id + "/answer.txt"],
      );
    });
    for (const u of [
      users.mentor,
      users.unassigned,
      users.instructor,
      users.other,
    ])
      await asUser(db, u, async () => {
        assert.equal(
          (await db.query("select * from edu_submissions")).rows.length,
          0,
        );
        assert.equal(
          (await db.query("select * from storage.objects")).rows.length,
          0,
        );
      });
    await asUser(db, users.student, async () => {
      await db.query(
        "update edu_submissions set submitted_at=now() where id=$1",
        [draft.id],
      );
      assert.equal(
        (
          await db.query("update edu_submissions set answers=$1 where id=$2", [
            JSON.stringify({ q1: "바꾸기" }),
            draft.id,
          ])
        ).affectedRows,
        0,
      );
      assert.equal(
        (
          await db.query("select answers from edu_submissions where id=$1", [
            draft.id,
          ])
        ).rows[0].answers.q1,
        "나의 성찰",
      );
      await assert.rejects(
        db.query(
          "insert into storage.objects(bucket_id,name) values('edu-files',$1)",
          ["submission/" + draft.id + "/later.txt"],
        ),
        /row-level security/,
      );
    });
    for (const u of [users.mentor, users.head])
      await asUser(db, u, async () => {
        assert.equal(
          (await db.query("select * from edu_submissions")).rows.length,
          1,
        );
        assert.equal(
          (await db.query("select * from storage.objects")).rows.length,
          1,
        );
      });
    for (const u of [users.unassigned, users.instructor, users.other])
      await asUser(db, u, async () => {
        assert.equal(
          (await db.query("select * from edu_submissions")).rows.length,
          0,
        );
      });
    await asUser(db, users.mentor, async () => {
      await db.query(
        "insert into edu_feedback(submission_id,body,is_shared) values($1,'공유 피드백',true),($1,'멘토 내부 관찰',false)",
        [draft.id],
      );
      await assert.rejects(
        db.query(
          "insert into edu_feedback(submission_id,author_id,body) values($1,$2,'위조')",
          [draft.id, users.head.id],
        ),
        /row-level security/,
      );
    });
    await asUser(db, users.student, async () => {
      const feedback = (await db.query("select * from edu_feedback")).rows;
      assert.equal(feedback.length, 1);
      assert.equal(feedback[0].body, "공유 피드백");
      await assert.rejects(
        db.query(
          "insert into edu_feedback(submission_id,body,is_shared) values($1,'위조',true)",
          [draft.id],
        ),
        /row-level security/,
      );
    });
    await asUser(db, users.head, async () => {
      await assert.rejects(
        db.query("update edu_lessons set questions=$1 where id=$2", [
          "[]",
          f.lesson.id,
        ]),
        /frozen/,
      );
      await assert.rejects(
        db.query("update edu_enrollments set user_id=$1 where id=$2", [
          users.other.id,
          f.student.id,
        ]),
        /immutable/,
      );
      await assert.rejects(
        db.query(
          "insert into edu_mentor_assignments(student_enrollment_id,mentor_enrollment_id) values($1,$2)",
          [f.other.id, f.mentor.id],
        ),
        /invalid_mentor_assignment/,
      );
    });
    await asUser(db, users.other, async () => {
      assert.equal((await db.query("select * from edu_posts")).rows.length, 0);
      await assert.rejects(
        db.query(
          "insert into edu_comments(post_id,body) values($1,'외부 반 댓글')",
          [f.post.id],
        ),
        /row-level security/,
      );
    });
    await asUser(db, users.student, async () => {
      await db.query(
        "insert into edu_comments(post_id,body) values($1,'질문 있습니다')",
        [f.post.id],
      );
      await db.query("insert into edu_post_reads(post_id) values($1)", [
        f.post.id,
      ]);
    });
    await asUser(db, users.head, async () => {
      await db.query(
        "update edu_enrollments set status='withdrawn' where id=$1",
        [f.mentor.id],
      );
    });
    await asUser(db, users.mentor, async () => {
      assert.equal(
        (await db.query("select * from edu_submissions")).rows.length,
        0,
      );
      assert.equal(
        (await db.query("select * from storage.objects")).rows.length,
        0,
      );
    });
  } finally {
    await db.close();
  }
});
test("class capacity excludes mentors and persists completed students; manual credentials and payment are private", async () => {
  const db = await createDB();
  try {
    const f = await seed(db);
    for (let i = 20; i < 27; i++)
      await db.query("insert into auth.users values($1,$2)", [
        uid(i),
        `student${i}@example.test`,
      ]);
    await asUser(db, users.head, async () => {
      for (let i = 20; i < 26; i++)
        await db.query("select edu_add_member($1,$2,$3,'student')", [
          f.a.id,
          `student${i}@example.test`,
          "정원 학생",
        ]);
      await assert.rejects(
        db.query("select edu_add_member($1,$2,$3,'student')", [
          f.a.id,
          "student26@example.test",
          "정원 초과",
        ]),
        /class_full/,
      );
      await db.query(
        "update edu_enrollments set status='completed' where id=$1",
        [f.student.id],
      );
      await assert.rejects(
        db.query("select edu_add_member($1,$2,$3,'student')", [
          f.a.id,
          "student26@example.test",
          "수료후 초과",
        ]),
        /class_full/,
      );
      await db.query(
        "insert into edu_payment_entries(enrollment_id,amount,currency) values($1,50000,'KRW')",
        [f.student.id],
      );
      await db.query(
        "insert into edu_credentials(user_id,kind,status) values($1,'level2_exam','applied')",
        [users.student.id],
      );
    });
    await asUser(db, users.student, async () => {
      assert.equal(
        (await db.query("select * from edu_payment_entries")).rows.length,
        1,
      );
      assert.equal(
        (await db.query("select * from edu_credentials")).rows[0].status,
        "applied",
      );
    });
    await asUser(db, users.mentor, async () => {
      assert.equal(
        (await db.query("select * from edu_payment_entries")).rows.length,
        0,
      );
      assert.equal(
        (await db.query("select * from edu_credentials")).rows.length,
        0,
      );
    });
  } finally {
    await db.close();
  }
});

test("one account can study in training while mentoring basic students; malformed answers and future lessons are rejected", async () => {
  const db = await createDB();
  try {
    const f = await seed(db);
    let enrollment, lesson;
    await asUser(db, users.head, async () => {
      const course = (
        await db.query("select id from edu_courses where code='training'")
      ).rows[0];
      const cohort = (
        await db.query(
          "insert into edu_cohorts(course_id,title) values($1,'2027 훈련') returning id",
          [course.id],
        )
      ).rows[0];
      const cls = (
        await db.query(
          "insert into edu_classes(cohort_id,title) values($1,'훈련반') returning id",
          [cohort.id],
        )
      ).rows[0];
      enrollment = (
        await db.query(
          "select * from edu_add_member($1,$2,'겸임 훈련생','student')",
          [cls.id, users.mentor.email],
        )
      ).rows[0];
      lesson = (
        await db.query(
          "insert into edu_lessons(class_id,position,title,publish_at,questions) values($1,1,'훈련 성찰',now(),$2) returning *",
          [
            cls.id,
            JSON.stringify([
              { id: "required", prompt: "필수 질문", required: true },
              { id: "optional", prompt: "선택 질문", required: false },
            ]),
          ],
        )
      ).rows[0];
      await assert.rejects(
        db.query("update edu_lessons set questions=$1 where id=$2", [
          JSON.stringify([{ id: "q", prompt: "질문", required: "false" }]),
          f.draftLesson.id,
        ]),
        /invalid_question_required/,
      );
      await db.query(
        "update edu_lessons set publish_at=now()+interval '1 day' where id=$1",
        [f.draftLesson.id],
      );
    });
    await asUser(db, users.mentor, async () => {
      assert.equal(
        (await db.query("select id from edu_classes")).rows.length,
        2,
      );
      await assert.rejects(
        db.query(
          "insert into edu_submissions(lesson_id,student_enrollment_id,answers,submitted_at) values($1,$2,$3,now())",
          [
            lesson.id,
            enrollment.id,
            JSON.stringify({ optional: "선택 답변만" }),
          ],
        ),
        /answer_required/,
      );
      await assert.rejects(
        db.query(
          "insert into edu_submissions(lesson_id,student_enrollment_id,answers) values($1,$2,$3)",
          [
            lesson.id,
            enrollment.id,
            JSON.stringify({ required: { nested: "bad" } }),
          ],
        ),
        /invalid_answer/,
      );
      await assert.rejects(
        db.query(
          "insert into edu_submissions(lesson_id,student_enrollment_id,answers) values($1,$2,$3)",
          [
            f.lesson.id,
            enrollment.id,
            JSON.stringify({ q1: "다른 반 배정 위조" }),
          ],
        ),
        /not_open/,
      );
      await db.query(
        "insert into edu_submissions(lesson_id,student_enrollment_id,answers,submitted_at) values($1,$2,$3,now())",
        [
          lesson.id,
          enrollment.id,
          JSON.stringify({ required: "내 훈련 성찰" }),
        ],
      );
    });
    await asUser(db, users.student, async () => {
      assert.equal(
        (await db.query("select id from edu_lessons")).rows.length,
        1,
      );
      assert.equal(
        (await db.query("select id from edu_submissions")).rows.length,
        0,
      );
    });
  } finally {
    await db.close();
  }
});

test("administrative accounts archive academic records rather than deleting them", async () => {
  const db = await createDB();
  try {
    const f = await seed(db);
    await asUser(db, users.head, async () => {
      for (const table of [
        "edu_courses",
        "edu_cohorts",
        "edu_classes",
        "edu_enrollments",
        "edu_payment_entries",
        "edu_credentials",
        "edu_attendance",
        "edu_submissions",
      ])
        await assert.rejects(
          db.query("delete from " + table),
          /permission denied/,
        );
      await db.query(
        "update edu_enrollments set status='withdrawn' where id=$1",
        [f.student.id],
      );
    });
    await asUser(db, users.student, async () => {
      assert.equal(
        (await db.query("select status from edu_enrollments")).rows[0].status,
        "withdrawn",
      );
    });
  } finally {
    await db.close();
  }
});

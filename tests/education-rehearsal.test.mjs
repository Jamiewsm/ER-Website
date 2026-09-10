// 격리된 단일 연결 Postgres에서 합성 A/B반의 8주 운영과 원문 보존을 검증한다.
// Dates below are fictional test dates, not an approved class schedule.
// Auth and Storage tables are test stubs: this does not test email, file transport, or concurrency.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createDB, asUser, users, uid } from "./helpers/education-db.mjs";

const syntheticUser = (n, name) => ({
  id: uid(n), email: `rehearsal-${n}@example.test`, name: `[SYNTHETIC] ${name}`,
});
const sorted = (values) => [...values].sort();
const sameIds = (rows, expected, field = "id") =>
  assert.deepEqual(sorted(rows.map((row) => row[field])), sorted(expected));

// Every actor is executed sequentially. asUser switches SQL roles, not real Auth sessions.
test("synthetic A/B classes finish eight weeks while preserving private reflections and cohort boundaries", async (t) => {
  const db = await createDB();
  const q = async (sql, args = []) => (await db.query(sql, args)).rows;
  const one = async (sql, args = []) => (await q(sql, args))[0];
  const actor = (user, work) => asUser(db, user, work);
  const students = Array.from({ length: 14 }, (_, i) => syntheticUser(500 + i, `학생 ${i + 1}`));
  const mentors = Array.from({ length: 6 }, (_, i) => syntheticUser(600 + i, `멘토 ${i + 1}`));
  const instructor = syntheticUser(700, "A반 강사");
  const snapshots = new Map();
  const weeks = [];
  let classes, cohort;
  try {
    for (const u of [...students, ...mentors, instructor])
      await db.query("insert into auth.users(id,email) values($1,$2)", [u.id, u.email]);

    await t.test("head assigns seven students and three mentors per class; nobody self-enrolls", async () => {
      await actor(users.head, async () => {
        cohort = await one("insert into edu_cohorts(course_id,title,status,starts_on,ends_on) select id,'[SYNTHETIC] 8주 리허설','active','2000-01-03','2000-02-27' from edu_courses where code='basic' returning *");
        classes = await q("insert into edu_classes(cohort_id,title,capacity) values($1,'[SYNTHETIC] A반',7),($1,'[SYNTHETIC] B반',7) returning *", [cohort.id]);
        const enroll = (u, cls, role) => one("select * from edu_add_member($1,$2,$3,$4)", [cls.id, u.email, u.name, role]);
        for (const [i, s] of students.entries()) {
          s.classIndex = Math.floor(i / 7);
          s.enrollment = await enroll(s, classes[s.classIndex], "student");
          // Per class, mentor loads are 3 + 2 + 2 students.
          s.mentorIndex = s.classIndex * 3 + (i % 7 < 3 ? 0 : i % 7 < 5 ? 1 : 2);
        }
        for (const [i, m] of mentors.entries()) {
          m.classIndex = Math.floor(i / 3);
          m.enrollment = await enroll(m, classes[m.classIndex], "mentor");
          m.students = students.filter((s) => s.mentorIndex === i);
          assert.ok(m.students.length >= 2 && m.students.length <= 3);
          for (const s of m.students)
            await db.query("insert into edu_mentor_assignments(student_enrollment_id,mentor_enrollment_id) values($1,$2)", [s.enrollment.id, m.enrollment.id]);
        }
        await enroll(instructor, classes[0], "instructor");
        await assert.rejects(enroll(users.empty, classes[0], "student"), /edu_class_full/);
        for (const cls of classes) {
          assert.equal((await q("select id from edu_enrollments where class_id=$1 and role='student'", [cls.id])).length, 7);
          assert.equal((await q("select id from edu_enrollments where class_id=$1 and role='mentor'", [cls.id])).length, 3);
        }
      });
      await actor(students[0], async () => {
        sameIds(await q("select id from edu_classes"), [classes[0].id]);
        await assert.rejects(db.query("select edu_add_member($1,$2,'위조','mentor')", [classes[1].id, students[0].email]), /head_coach_required/);
      });
      await actor(users.empty, async () => assert.equal((await q("select id from edu_classes")).length, 0));
      await actor(null, async () => assert.rejects(db.query("select * from edu_submissions"), /permission denied/));
    });

    for (let week = 1; week <= 8; week++) {
      await t.test(`week ${week}: private drafts → 14 submissions → assigned feedback, attendance and class notices`, async () => {
        const lessons = [], posts = [];
        const date = new Date(Date.UTC(2000, 0, 3 + (week - 1) * 7)).toISOString();
        await actor(users.head, async () => {
          for (const cls of classes) {
            const questions = [{ id: `week_${week}`, prompt: `[SYNTHETIC] ${week}주차 가상 성찰`, required: true }];
            lessons.push(await one("insert into edu_lessons(class_id,position,title,starts_at,questions) values($1,$2,$3,$4,$5) returning *", [cls.id, week, `[SYNTHETIC] 수업 ${week}`, date, JSON.stringify(questions)]));
            posts.push(await one("insert into edu_posts(class_id,title,body,publish_at) values($1,$2,'합성 리허설 공지',now()+interval '1 day') returning *", [cls.id, `[SYNTHETIC] 공지 ${week}`]));
          }
        });
        for (const s of [students[0], students[7]]) {
          await actor(s, async () => {
            assert.equal((await q("select id from edu_lessons where id=any($1::uuid[])", [lessons.map((l) => l.id)])).length, 0);
            assert.equal((await q("select id from edu_posts where id=any($1::uuid[])", [posts.map((p) => p.id)])).length, 0);
            await assert.rejects(db.query("insert into edu_submissions(lesson_id,student_enrollment_id,answers) values($1,$2,$3)", [lessons[s.classIndex].id, s.enrollment.id, JSON.stringify({ [`week_${week}`]: "공개 전 작성" })]), /edu_submission_not_open|row-level security/);
          });
        }
        await actor(users.head, async () => {
          await db.query("update edu_lessons set publish_at=now()-interval '1 minute' where id=any($1::uuid[])", [lessons.map((l) => l.id)]);
          await db.query("update edu_posts set publish_at=now()-interval '1 minute' where id=any($1::uuid[])", [posts.map((p) => p.id)]);
        });
        const submissions = [];
        for (const s of students) {
          await actor(s, async () => {
            sameIds(await q("select id from edu_lessons where position=$1", [week]), [lessons[s.classIndex].id]);
            const answers = { [`week_${week}`]: `[SYNTHETIC] ${s.id}의 ${week}주차 원문` };
            const sub = await one("insert into edu_submissions(lesson_id,student_enrollment_id,answers) values($1,$2,$3) returning *", [lessons[s.classIndex].id, s.enrollment.id, JSON.stringify(answers)]);
            submissions.push(sub);
            snapshots.set(sub.id, { answers, question_snapshot: lessons[s.classIndex].questions });
            // Only metadata is stored here; real file upload/download is covered separately.
            await db.query("insert into storage.objects(bucket_id,name) values('edu-files',$1)", [`submission/${sub.id}/synthetic.txt`]);
            sameIds(await q("select id from edu_submissions where lesson_id=any($1::uuid[])", [lessons.map((l) => l.id)]), [sub.id]);
          });
        }
        for (const u of [...mentors, users.head, instructor]) {
          await actor(u, async () => {
            assert.equal((await q("select id from edu_submissions where lesson_id=any($1::uuid[])", [lessons.map((l) => l.id)])).length, 0, "drafts remain owner-only, including against head");
            assert.equal((await q("select id from storage.objects where name like any($1::text[])", [submissions.map((s) => `submission/${s.id}/%`)])).length, 0);
          });
        }
        for (const [i, s] of students.entries()) {
          await actor(s, async () => {
            const sub = await one("update edu_submissions set submitted_at=now() where id=$1 returning *", [submissions[i].id]);
            assert.ok(sub.submitted_at);
            assert.deepEqual(sub.question_snapshot, lessons[s.classIndex].questions);
            assert.equal((await db.query("update edu_submissions set answers='{}' where id=$1", [sub.id])).affectedRows, 0);
            await assert.rejects(db.query("insert into storage.objects(bucket_id,name) values('edu-files',$1)", [`submission/${sub.id}/late.txt`]), /row-level security/);
            await db.query("insert into edu_comments(post_id,body) values($1,$2)", [posts[s.classIndex].id, `[SYNTHETIC] ${week}주차 확인`]);
            await db.query("insert into edu_post_reads(post_id) values($1)", [posts[s.classIndex].id]);
          });
        }
        for (const m of mentors) {
          await actor(m, async () => {
            const expected = submissions.filter((sub) => m.students.some((s) => s.enrollment.id === sub.student_enrollment_id));
            sameIds(await q("select id from edu_submissions where lesson_id=any($1::uuid[])", [lessons.map((l) => l.id)]), expected.map((s) => s.id));
            for (const sub of expected)
              await db.query("insert into edu_feedback(submission_id,body,is_shared) values($1,'[SYNTHETIC] 학생 공유',true),($1,'[SYNTHETIC] 멘토 내부',false)", [sub.id]);
            const unrelated = submissions.find((sub) => !expected.some((x) => x.id === sub.id));
            await assert.rejects(db.query("insert into edu_feedback(submission_id,body) values($1,'권한 없는 작성')", [unrelated.id]), /row-level security/);
          });
        }
        await actor(instructor, async () => {
          assert.equal((await q("select id from edu_submissions")).length, 0, "teaching alone never grants reflection access");
          assert.equal((await q("select id from edu_feedback")).length, 0);
          for (const s of students.filter((s) => s.classIndex === 0))
            await db.query("insert into edu_attendance(lesson_id,student_enrollment_id,status) values($1,$2,'present')", [lessons[0].id, s.enrollment.id]);
          await assert.rejects(db.query("insert into edu_attendance(lesson_id,student_enrollment_id,status) values($1,$2,'present')", [lessons[1].id, students[7].enrollment.id]), /row-level security/);
        });
        await actor(users.head, async () => {
          sameIds(await q("select id from edu_submissions where lesson_id=any($1::uuid[])", [lessons.map((l) => l.id)]), submissions.map((s) => s.id));
          assert.equal((await q("select id from edu_feedback where submission_id=any($1::uuid[])", [submissions.map((s) => s.id)])).length, 28);
          for (const s of students.filter((s) => s.classIndex === 1))
            await db.query("insert into edu_attendance(lesson_id,student_enrollment_id,status) values($1,$2,$3)", [lessons[1].id, s.enrollment.id, week === 4 && s === students[7] ? "excused" : "present"]);
          assert.equal((await q("select * from edu_post_reads where post_id=any($1::uuid[])", [posts.map((p) => p.id)])).length, 14);
          await assert.rejects(db.query("update edu_lessons set questions='[]' where id=$1", [lessons[0].id]), /edu_questions_frozen/);
        });
        for (const [i, s] of students.entries()) {
          await actor(s, async () => {
            const feedback = await q("select * from edu_feedback where submission_id=$1", [submissions[i].id]);
            assert.equal(feedback.length, 1);
            assert.equal(feedback[0].is_shared, true);
            sameIds(await q("select * from edu_attendance where lesson_id=any($1::uuid[])", [lessons.map((l) => l.id)]), [s.enrollment.id], "student_enrollment_id");
            assert.equal((await q("select * from edu_comments where post_id=$1", [posts[s.classIndex].id])).length, 7);
            assert.equal((await q("select * from edu_post_reads where post_id=$1", [posts[s.classIndex].id])).length, 1, "students cannot read classmates' receipts");
          });
        }
        for (const m of mentors) {
          await actor(m, async () => sameIds(await q("select * from edu_attendance where lesson_id=any($1::uuid[])", [lessons.map((l) => l.id)]), m.students.map((s) => s.enrollment.id), "student_enrollment_id"));
        }
        await actor(students[0], async () => assert.rejects(db.query("insert into edu_comments(post_id,body) values($1,'다른 반 댓글')", [posts[1].id]), /row-level security/));
        weeks.push({ lessons, submissions });
      });
    }

    await t.test("six mentors study in synthetic 2026 Q3 while 2027 and growth classes remain separate", async () => {
      const extras = {};
      await actor(users.head, async () => {
        for (const [key, code, title] of [
          ["training2026Q3", "training", "[SYNTHETIC] 2026년 10~12월 3분기"],
          ["training2027", "training", "[SYNTHETIC] 2027 신규 2기"],
          ["growth101", "growth_101", "[SYNTHETIC] 심화101"],
          ["growth201", "growth_201", "[SYNTHETIC] 심화201"],
        ]) {
          const co = await one("insert into edu_cohorts(course_id,title,status) select id,$2,'active' from edu_courses where code=$1 returning *", [code, title]);
          const cls = await one("insert into edu_classes(cohort_id,title,capacity) values($1,$2,7) returning *", [co.id, title]);
          const lesson = await one("insert into edu_lessons(class_id,position,title,publish_at,questions) values($1,1,$2,now()-interval '1 minute',$3) returning *", [cls.id, title, JSON.stringify([{ id: "separate", prompt: "[SYNTHETIC] 별도 과정 질문" }])]);
          extras[key] = { cls, lesson };
        }
        for (const m of mentors)
          m.training = await one("select * from edu_add_member($1,$2,$3,'student')", [extras.training2026Q3.cls.id, m.email, m.name]);
        for (const [u, key] of [[users.empty, "training2027"], [students[0], "growth101"], [students[7], "growth201"]])
          extras[key].enrollment = await one("select * from edu_add_member($1,$2,$3,'student')", [extras[key].cls.id, u.email, u.name]);
      });
      for (const m of mentors) {
        await actor(m, async () => {
          sameIds(await q("select id from edu_classes"), [classes[m.classIndex].id, extras.training2026Q3.cls.id]);
          await db.query("insert into edu_submissions(lesson_id,student_enrollment_id,answers,submitted_at) values($1,$2,$3,now())", [extras.training2026Q3.lesson.id, m.training.id, JSON.stringify({ separate: `[SYNTHETIC] ${m.id} 본인 훈련 성찰` })]);
        });
      }
      for (const m of mentors) {
        await actor(m, async () => {
          sameIds(await q("select * from edu_submissions where lesson_id=$1", [extras.training2026Q3.lesson.id]), [m.training.id], "student_enrollment_id");
          assert.equal((await q("select id from edu_submissions where lesson_id=any($1::uuid[])", [weeks.flatMap((w) => w.lessons.map((l) => l.id))])).length, m.students.length * 8);
          await assert.rejects(db.query("insert into edu_feedback(submission_id,body) select id,'훈련 동료 엿보기' from edu_submissions where student_enrollment_id=$1 returning id", [m.training.id]), /row-level security/);
        });
      }
      for (const [u, key] of [[users.empty, "training2027"], [students[0], "growth101"], [students[7], "growth201"]]) {
        await actor(u, async () => {
          const visible = await q("select id from edu_lessons where id=any($1::uuid[])", [Object.values(extras).map((x) => x.lesson.id)]);
          sameIds(visible, [extras[key].lesson.id]);
          assert.equal((await q("select id from edu_submissions where lesson_id=$1", [extras.training2026Q3.lesson.id])).length, 0);
          await assert.rejects(db.query("insert into edu_submissions(lesson_id,student_enrollment_id,answers) values($1,$2,$3)", [extras.training2026Q3.lesson.id, extras[key].enrollment.id, JSON.stringify({ separate: "다른 기수 제출" })]), /edu_submission_not_open|row-level security/);
        });
      }
    });

    await t.test("completion and withdrawal preserve all 112 basic reflections and revoke mentor access", async () => {
      const lessonIds = weeks.flatMap((w) => w.lessons.map((l) => l.id));
      await actor(users.head, async () => {
        const rows = await q("select * from edu_submissions where lesson_id=any($1::uuid[])", [lessonIds]);
        assert.equal(rows.length, 112);
        assert.equal((await q("select * from edu_attendance where lesson_id=any($1::uuid[])", [lessonIds])).length, 112);
        await db.query("update edu_enrollments set status='completed' where id=any($1::uuid[])", [students.map((s) => s.enrollment.id)]);
        await db.query("update edu_cohorts set status='completed' where id=$1", [cohort.id]);
        assert.equal((await q("select * from edu_credentials")).length, 0, "course completion must not award a credential");
      });
      for (const s of students) {
        await actor(s, async () => {
          sameIds(await q("select id from edu_lessons where class_id=$1", [classes[s.classIndex].id]), weeks.map((w) => w.lessons[s.classIndex].id));
          assert.equal((await q("select id from edu_submissions where student_enrollment_id=$1", [s.enrollment.id])).length, 8);
        });
      }
      await actor(users.head, async () => {
        await db.query("update edu_lessons set publish_at=null where id=any($1::uuid[])", [lessonIds]);
        await db.query("update edu_enrollments set status='withdrawn' where id=any($1::uuid[])", [[students[0].enrollment.id, students[7].enrollment.id, mentors[0].enrollment.id]]);
      });
      for (const s of students) {
        await actor(s, async () => {
          const rows = await q("select * from edu_submissions where student_enrollment_id=$1", [s.enrollment.id]);
          assert.equal(rows.length, 8);
          for (const row of rows) {
            assert.deepEqual(row.answers, snapshots.get(row.id).answers);
            assert.deepEqual(row.question_snapshot, snapshots.get(row.id).question_snapshot);
          }
          assert.equal((await q("select id from edu_feedback where submission_id=any($1::uuid[])", [rows.map((r) => r.id)])).length, 8);
          assert.equal((await q("select id from storage.objects where name like any($1::text[])", [rows.map((r) => `submission/${r.id}/%`)])).length, 8);
          assert.equal((await q("select id from edu_lessons where id=any($1::uuid[])", [lessonIds])).length, 0);
          assert.equal((await db.query("update edu_submissions set answers='{}' where id=$1", [rows[0].id])).affectedRows, 0);
        });
      }
      await actor(mentors[0], async () => {
        assert.equal((await q("select id from edu_submissions where lesson_id=any($1::uuid[])", [lessonIds])).length, 0);
        assert.equal((await q("select id from edu_feedback")).length, 0);
        assert.equal((await q("select id from storage.objects")).length, 0);
      });
      await actor(users.head, async () => {
        assert.equal((await q("select id from edu_submissions where lesson_id=any($1::uuid[])", [lessonIds])).length, 112);
        assert.equal((await q("select id from edu_feedback")).length, 224);
      });
    });
  } finally {
    await db.close();
  }
});

// 교육 포털의 권한 테스트용 격리 Postgres와 합성 계정을 생성한다.
import { readFile } from "node:fs/promises";
const { PGlite } = await import(
  process.env.PGLITE_MODULE ||
    new URL(
      "../education/node_modules/@electric-sql/pglite/dist/index.js",
      import.meta.url,
    ).href
);
export const uid = (n) =>
  "10000000-0000-4000-8000-" + String(n).padStart(12, "0");
export const users = {
  head: { id: uid(1), email: "head@example.test", name: "테스트 수석" },
  student: { id: uid(2), email: "student@example.test", name: "테스트 학생" },
  other: { id: uid(3), email: "other@example.test", name: "다른 반 학생" },
  mentor: { id: uid(4), email: "mentor@example.test", name: "담당 멘토" },
  unassigned: {
    id: uid(5),
    email: "unassigned@example.test",
    name: "다른 멘토",
  },
  instructor: { id: uid(6), email: "teacher@example.test", name: "담당 강사" },
  empty: { id: uid(7), email: "empty@example.test", name: "미배정 학생" },
};
export async function asUser(db, user, fn) {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
    user?.id || "",
  ]);
  await db.exec("set role " + (user ? "authenticated" : "anon"));
  try {
    return await fn();
  } finally {
    await db.exec("reset role");
  }
}
export async function createDB({ beforeMigration } = {}) {
  const db = new PGlite();
  await db.exec(`
create role anon;create role authenticated;create role service_role bypassrls;
create schema auth;create schema storage;
create table auth.users(id uuid primary key,email text);
create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
grant usage on schema public,auth,storage to anon,authenticated;
create table public.coach_profiles(user_id uuid primary key references auth.users,role text,is_active boolean default true);
create table public.coach_mentees(id uuid primary key,coach_user_id uuid references auth.users);
create table public.program_applications(id uuid primary key,contact text,cohort_key text,program_key text,status text);
create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint);
create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text references storage.buckets,name text,metadata jsonb default '{}',unique(bucket_id,name));
alter table storage.objects enable row level security;grant select,insert,update,delete on storage.objects to authenticated;
`);
  for (const u of Object.values(users))
    await db.query("insert into auth.users values($1,$2)", [u.id, u.email]);
  await db.query(
    "insert into coach_profiles values($1,'head_coach',true),($2,'coach',true),($3,'coach',true)",
    [users.head.id, users.mentor.id, users.unassigned.id],
  );
  if (beforeMigration) await beforeMigration(db);
  await db.exec(
    await readFile(
      new URL(
        "../../supabase/migrations/20260908090000_education_portal.sql",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  return db;
}
export async function seed(db) {
  return asUser(db, users.head, async () => {
    const q = async (sql, args = []) => (await db.query(sql, args)).rows[0];
    const classes = (await db.query("select * from edu_classes order by title"))
        .rows,
      a = classes[0],
      b = classes[1];
    const add = async (user, cls, role) =>
      (
        await db.query("select * from edu_add_member($1,$2,$3,$4)", [
          cls.id,
          user.email,
          user.name,
          role,
        ])
      ).rows[0];
    const student = await add(users.student, a, "student"),
      other = await add(users.other, b, "student"),
      mentor = await add(users.mentor, a, "mentor"),
      unassigned = await add(users.unassigned, a, "mentor"),
      instructor = await add(users.instructor, a, "instructor");
    await db.query(
      "insert into edu_mentor_assignments(student_enrollment_id,mentor_enrollment_id) values($1,$2)",
      [student.id, mentor.id],
    );
    const questions = [
      {
        id: "q1",
        prompt: "이번 주에 새롭게 알게 된 나의 모습은 무엇인가요?",
        required: false,
      },
      {
        id: "q2",
        prompt: "다음 한 주 동안 시도하고 싶은 변화는 무엇인가요?",
        required: false,
      },
    ];
    const lesson = await q(
      "insert into edu_lessons(class_id,position,title,publish_at,starts_at,questions,resources) values($1,1,'첫 주 자기성찰',now()-interval '1 hour',now()+interval '1 day',$2,$3) returning *",
      [
        a.id,
        JSON.stringify(questions),
        JSON.stringify([
          { title: "강의 영상", url: "https://www.youtube.com/watch?v=test" },
        ]),
      ],
    );
    const draftLesson = await q(
      "insert into edu_lessons(class_id,position,title,questions) values($1,2,'다음 주 준비 자료',$2) returning *",
      [a.id, JSON.stringify(questions)],
    );
    const post = await q(
      "insert into edu_posts(class_id,title,body,publish_at) values($1,'첫 수업 안내','수업 전에 자료를 확인해 주세요.',now()-interval '1 hour') returning *",
      [a.id],
    );
    return {
      a,
      b,
      student,
      other,
      mentor,
      unassigned,
      instructor,
      lesson,
      draftLesson,
      post,
    };
  });
}

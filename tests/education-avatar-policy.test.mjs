// 격리 Postgres에서 교육 사진 업로드의 본인 경로와 등록 상태 경계를 검증한다.
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import assert from "node:assert/strict";
import { createDB, seed, asUser, users } from "./helpers/education-db.mjs";

test("교육 사진은 본인 등록과 경로를 확인하고 기존 코치 정책을 보존한다", async () => {
  const db = await createDB();
  try {
    const f = await seed(db);
    await db.exec(`
      CREATE FUNCTION storage.foldername(name text) RETURNS text[] LANGUAGE sql IMMUTABLE AS
        $$ SELECT (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1)-1] $$;
      CREATE FUNCTION public.is_active_coach(id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS
        $$ SELECT EXISTS(SELECT 1 FROM public.coach_profiles WHERE user_id=id AND is_active) $$;
      INSERT INTO storage.buckets(id,name,public,file_size_limit)
        VALUES('coach-avatars','coach-avatars',true,5242880);
      CREATE POLICY "coach avatars write own" ON storage.objects FOR INSERT TO authenticated
        WITH CHECK(bucket_id='coach-avatars' AND public.is_active_coach(auth.uid()) AND (storage.foldername(name))[1]=auth.uid()::text);
      CREATE POLICY "coach avatars delete own" ON storage.objects FOR DELETE TO authenticated
        USING(bucket_id='coach-avatars' AND (storage.foldername(name))[1]=auth.uid()::text);
    `);
    const insert = (user, name = "photo.png", bucket = "coach-avatars") =>
      db.query("INSERT INTO storage.objects(bucket_id,name) VALUES($1,$2)", [bucket, user.id + "/" + name]);
    await insert(users.student, "orphan.png");
    const cleanup = (user) => db.query("DELETE FROM storage.objects WHERE bucket_id='coach-avatars' AND name=$1 RETURNING name", [user.id + "/orphan.png"]);
    await asUser(db, users.student, async () => {
      await assert.rejects(insert(users.student, "before.png"), /row-level security/);
      assert.equal((await cleanup(users.student)).rows.length, 0, "기존 DELETE만으로는 학생 파일 정리가 불가능하다");
    });
    const before = (await db.query("SELECT with_check FROM pg_policies WHERE policyname='coach avatars write own'")).rows;
    await db.exec(await readFile(new URL("../supabase/migrations/20260915001000_education_profile_avatar_upload.sql", import.meta.url), "utf8"));
    assert.deepEqual((await db.query("SELECT with_check FROM pg_policies WHERE policyname='coach avatars write own'")).rows, before);
    await asUser(db, users.student, async () => {
      assert.equal((await cleanup(users.student)).rows.length, 1, "본인 SELECT와 기존 DELETE로 신규 파일을 정리한다");
      await insert(users.student);
      await assert.rejects(insert(users.other, "forged.png"), /row-level security/);
      await assert.rejects(insert(users.student, "wrong-bucket.png", "edu-files"), /row-level security/);
      await assert.rejects(db.query("INSERT INTO storage.objects(bucket_id,name) VALUES('coach-avatars','photo.png')"), /row-level security/);
    });
    await asUser(db, users.empty, async () => {
      await assert.rejects(insert(users.empty), /row-level security/);
      assert.equal((await db.query("SELECT * FROM storage.objects WHERE bucket_id='coach-avatars'")).rows.length, 0);
      assert.equal((await db.query("DELETE FROM storage.objects WHERE bucket_id='coach-avatars' RETURNING name")).rows.length, 0);
    });
    await asUser(db, null, async () => {
      await assert.rejects(insert(users.student, "anon.png"), /permission denied/);
    });
    await db.query("UPDATE edu_enrollments SET status='completed' WHERE id=$1", [f.student.id]);
    await asUser(db, users.student, () => insert(users.student, "completed.png"));
    await db.query("UPDATE edu_enrollments SET status='withdrawn' WHERE id=$1", [f.student.id]);
    await asUser(db, users.student, async () => {
      await assert.rejects(insert(users.student, "withdrawn.png"), /row-level security/);
    });
    // 미배정 코치는 교육 조건과 무관하게 기존 코치 정책을 계속 사용한다.
    await db.query("DELETE FROM edu_enrollments WHERE user_id=$1", [users.unassigned.id]);
    await asUser(db, users.unassigned, () => insert(users.unassigned, "coach.png"));
    assert.equal((await db.query("SELECT count(*)::integer AS total FROM storage.objects WHERE bucket_id='coach-avatars'")).rows[0].total, 3);
  } finally { await db.close(); }
});

-- 기존 코치 기록을 보존하며 교육 교실과 역할별 접근권한을 추가한다.
BEGIN;
CREATE TABLE public.edu_courses (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text NOT NULL UNIQUE, title text NOT NULL,
 kind text NOT NULL CHECK(kind IN ('basic','growth','training')), description text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.edu_cohorts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), course_id uuid NOT NULL REFERENCES public.edu_courses ON DELETE RESTRICT,
 title text NOT NULL, application_cohort_key text UNIQUE, status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','active','completed')),
 starts_on date, ends_on date, created_at timestamptz NOT NULL DEFAULT now(), CHECK(ends_on IS NULL OR starts_on IS NULL OR ends_on>=starts_on));
CREATE TABLE public.edu_classes (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), cohort_id uuid NOT NULL REFERENCES public.edu_cohorts ON DELETE RESTRICT,
 title text NOT NULL, capacity integer NOT NULL DEFAULT 7 CHECK(capacity BETWEEN 1 AND 100), zoom_url text NOT NULL DEFAULT '' CHECK(zoom_url='' OR zoom_url ~ '^https://[^[:space:]]+$'),
 schedule_note text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.edu_enrollments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), class_id uuid NOT NULL REFERENCES public.edu_classes ON DELETE RESTRICT,
 user_id uuid NOT NULL REFERENCES auth.users ON DELETE RESTRICT, display_name text NOT NULL,
 role text NOT NULL CHECK(role IN ('student','mentor','instructor')), status text NOT NULL DEFAULT 'active' CHECK(status IN ('active','completed','withdrawn')),
 application_id uuid REFERENCES public.program_applications ON DELETE RESTRICT, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(class_id,user_id,role));
CREATE UNIQUE INDEX edu_enrollments_application ON public.edu_enrollments(application_id) WHERE application_id IS NOT NULL;
CREATE TABLE public.edu_mentor_assignments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), student_enrollment_id uuid NOT NULL UNIQUE REFERENCES public.edu_enrollments ON DELETE RESTRICT,
 mentor_enrollment_id uuid NOT NULL REFERENCES public.edu_enrollments ON DELETE RESTRICT,
 legacy_mentee_id uuid REFERENCES public.coach_mentees ON DELETE RESTRICT, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.edu_lessons (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), class_id uuid NOT NULL REFERENCES public.edu_classes ON DELETE RESTRICT,
 position integer NOT NULL CHECK(position>0), title text NOT NULL, starts_at timestamptz, publish_at timestamptz,
 questions jsonb NOT NULL DEFAULT '[]', resources jsonb NOT NULL DEFAULT '[]', description text NOT NULL DEFAULT '',
 created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(class_id,position));
CREATE TABLE public.edu_submissions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), lesson_id uuid NOT NULL REFERENCES public.edu_lessons ON DELETE RESTRICT,
 student_enrollment_id uuid NOT NULL REFERENCES public.edu_enrollments ON DELETE RESTRICT, answers jsonb NOT NULL DEFAULT '{}',
 submitted_at timestamptz, question_snapshot jsonb NOT NULL DEFAULT '[]', updated_at timestamptz NOT NULL DEFAULT now(),
 created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(lesson_id,student_enrollment_id));
CREATE TABLE public.edu_feedback (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), submission_id uuid NOT NULL REFERENCES public.edu_submissions ON DELETE RESTRICT,
 author_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users ON DELETE RESTRICT,
 body text NOT NULL CHECK(length(trim(body)) BETWEEN 1 AND 20000), is_shared boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.edu_posts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), class_id uuid NOT NULL REFERENCES public.edu_classes ON DELETE RESTRICT,
 title text NOT NULL, body text NOT NULL DEFAULT '', publish_at timestamptz,
 created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users ON DELETE RESTRICT, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.edu_comments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), post_id uuid NOT NULL REFERENCES public.edu_posts ON DELETE RESTRICT,
 author_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users ON DELETE RESTRICT,
 body text NOT NULL CHECK(length(trim(body)) BETWEEN 1 AND 10000), created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.edu_post_reads (
 post_id uuid NOT NULL REFERENCES public.edu_posts ON DELETE CASCADE, user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users ON DELETE CASCADE,
 read_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(post_id,user_id));
CREATE TABLE public.edu_attendance (
 lesson_id uuid NOT NULL REFERENCES public.edu_lessons ON DELETE RESTRICT, student_enrollment_id uuid NOT NULL REFERENCES public.edu_enrollments ON DELETE RESTRICT,
 status text NOT NULL CHECK(status IN ('present','absent','excused')), recorded_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users ON DELETE RESTRICT,
 PRIMARY KEY(lesson_id,student_enrollment_id));
CREATE TABLE public.edu_payment_entries (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), enrollment_id uuid NOT NULL REFERENCES public.edu_enrollments ON DELETE RESTRICT,
 amount numeric NOT NULL CHECK(amount>0 AND amount<1000000000), currency text NOT NULL CHECK(currency IN ('KRW','USD')),
 due_on date, paid_at timestamptz, note text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.edu_credentials (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES auth.users ON DELETE RESTRICT,
 kind text NOT NULL CHECK(kind IN ('level2_exam','level2_certificate','level1_certificate')),
 status text NOT NULL CHECK(status IN ('applied','passed','issued','failed')), date_on date, note text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX edu_enrollments_user ON public.edu_enrollments(user_id,class_id);
CREATE INDEX edu_mentor_assignments_mentor ON public.edu_mentor_assignments(mentor_enrollment_id);
CREATE INDEX edu_feedback_submission ON public.edu_feedback(submission_id);
CREATE INDEX edu_posts_class ON public.edu_posts(class_id,publish_at);
CREATE INDEX edu_comments_post ON public.edu_comments(post_id);

CREATE FUNCTION public.edu_is_head() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
SELECT EXISTS(SELECT 1 FROM public.coach_profiles WHERE user_id=auth.uid() AND role='head_coach' AND is_active)
$$;

CREATE FUNCTION public.edu_is_member(p_class uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
SELECT EXISTS(SELECT 1 FROM public.edu_enrollments WHERE class_id=p_class AND user_id=auth.uid() AND status IN ('active','completed'))
$$;

CREATE FUNCTION public.edu_can_teach(p_class uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
SELECT public.edu_is_head() OR EXISTS(SELECT 1 FROM public.edu_enrollments WHERE class_id=p_class AND user_id=auth.uid() AND role='instructor' AND status='active')
$$;

CREATE FUNCTION public.edu_owns_student(p_enrollment uuid, p_active boolean DEFAULT false) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
SELECT EXISTS(SELECT 1 FROM public.edu_enrollments WHERE id=p_enrollment AND user_id=auth.uid() AND role='student' AND (NOT p_active OR status='active'))
$$;

CREATE FUNCTION public.edu_is_mentor(p_student uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
SELECT EXISTS(SELECT 1 FROM public.edu_mentor_assignments a
 JOIN public.edu_enrollments m ON m.id=a.mentor_enrollment_id
 JOIN public.edu_enrollments e ON e.id=a.student_enrollment_id
 WHERE a.student_enrollment_id=p_student AND m.user_id=auth.uid() AND m.role='mentor' AND m.status='active'
 AND e.status IN ('active','completed') AND e.class_id=m.class_id)
$$;

CREATE FUNCTION public.edu_lesson_visible(p_lesson uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
SELECT EXISTS(SELECT 1 FROM public.edu_lessons WHERE id=p_lesson AND (public.edu_can_teach(class_id) OR (publish_at<=now() AND public.edu_is_member(class_id))))
$$;

CREATE FUNCTION public.edu_post_visible(p_post uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
SELECT EXISTS(SELECT 1 FROM public.edu_posts WHERE id=p_post AND (public.edu_can_teach(class_id) OR (publish_at<=now() AND public.edu_is_member(class_id))))
$$;

CREATE FUNCTION public.edu_submission_visible(p_submission uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
SELECT EXISTS(SELECT 1 FROM public.edu_submissions WHERE id=p_submission AND (public.edu_owns_student(student_enrollment_id) OR (submitted_at IS NOT NULL AND (public.edu_is_head() OR public.edu_is_mentor(student_enrollment_id)))))
$$;

CREATE FUNCTION public.edu_can_feedback(p_submission uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
SELECT EXISTS(SELECT 1 FROM public.edu_submissions WHERE id=p_submission AND submitted_at IS NOT NULL AND (public.edu_is_head() OR public.edu_is_mentor(student_enrollment_id)))
$$;

CREATE FUNCTION public.edu_context() RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
SELECT jsonb_build_object('user_id',auth.uid(),'is_head',public.edu_is_head(),'is_coach',EXISTS(SELECT 1 FROM public.coach_profiles WHERE user_id=auth.uid() AND is_active))
$$;

CREATE FUNCTION public.edu_validate_row() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE oldj jsonb; newj jsonb := to_jsonb(NEW); col text; cols text[];
 e public.edu_enrollments; m public.edu_enrollments; l public.edu_lessons; q jsonb; r jsonb; used integer; cap integer;
BEGIN
 IF TG_OP='UPDATE' THEN
  oldj := to_jsonb(OLD);
  cols := CASE TG_TABLE_NAME
   WHEN 'edu_cohorts' THEN ARRAY['id','course_id'] WHEN 'edu_classes' THEN ARRAY['id','cohort_id']
   WHEN 'edu_enrollments' THEN ARRAY['id','class_id','user_id','role']
   WHEN 'edu_mentor_assignments' THEN ARRAY['id','student_enrollment_id','mentor_enrollment_id']
   WHEN 'edu_lessons' THEN ARRAY['id','class_id'] WHEN 'edu_submissions' THEN ARRAY['id','lesson_id','student_enrollment_id']
   WHEN 'edu_feedback' THEN ARRAY['id','submission_id','author_id'] WHEN 'edu_posts' THEN ARRAY['id','class_id','created_by']
   WHEN 'edu_comments' THEN ARRAY['id','post_id','author_id'] WHEN 'edu_post_reads' THEN ARRAY['post_id','user_id']
   WHEN 'edu_attendance' THEN ARRAY['lesson_id','student_enrollment_id']
   WHEN 'edu_payment_entries' THEN ARRAY['id','enrollment_id'] WHEN 'edu_credentials' THEN ARRAY['id','user_id'] ELSE ARRAY['id'] END;
  FOREACH col IN ARRAY cols LOOP
   IF oldj->col IS DISTINCT FROM newj->col THEN RAISE EXCEPTION 'edu_identity_immutable: %',col; END IF;
  END LOOP;
  IF oldj ? 'created_at' AND oldj->'created_at' IS DISTINCT FROM newj->'created_at' THEN RAISE EXCEPTION 'edu_created_at_immutable'; END IF;
 END IF;
 IF TG_TABLE_NAME='edu_classes' THEN
  SELECT count(*) INTO used FROM public.edu_enrollments WHERE class_id=NEW.id AND role='student' AND status IN ('active','completed');
  IF used>NEW.capacity THEN RAISE EXCEPTION 'edu_capacity_below_enrollment'; END IF;
 ELSIF TG_TABLE_NAME='edu_enrollments' THEN
  SELECT capacity INTO cap FROM public.edu_classes WHERE id=NEW.class_id FOR UPDATE;
  IF NEW.role='student' AND NEW.status IN ('active','completed') THEN
   SELECT count(*) INTO used FROM public.edu_enrollments WHERE class_id=NEW.class_id AND role='student' AND status IN ('active','completed') AND id<>NEW.id;
   IF used>=cap THEN RAISE EXCEPTION 'edu_class_full'; END IF;
  END IF;
  IF NEW.application_id IS NOT NULL THEN
   IF NEW.role<>'student' THEN RAISE EXCEPTION 'edu_application_requires_student'; END IF;
   -- Exact email matching when the contact itself is an email. Phone/mixed contact is an explicit head mapping.
   IF EXISTS(SELECT 1 FROM public.program_applications a JOIN auth.users u ON u.id=NEW.user_id
    WHERE a.id=NEW.application_id AND trim(a.contact) ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
    AND lower(trim(a.contact))<>lower(trim(u.email))) THEN RAISE EXCEPTION 'edu_application_email_mismatch'; END IF;
  END IF;
 ELSIF TG_TABLE_NAME='edu_mentor_assignments' THEN
  SELECT * INTO e FROM public.edu_enrollments WHERE id=NEW.student_enrollment_id FOR SHARE;
  SELECT * INTO m FROM public.edu_enrollments WHERE id=NEW.mentor_enrollment_id FOR SHARE;
  IF e.role<>'student' OR m.role<>'mentor' OR e.class_id<>m.class_id OR e.status NOT IN ('active','completed') OR m.status<>'active' THEN RAISE EXCEPTION 'edu_invalid_mentor_assignment'; END IF;
  IF NEW.legacy_mentee_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.coach_mentees WHERE id=NEW.legacy_mentee_id AND coach_user_id=m.user_id) THEN RAISE EXCEPTION 'edu_legacy_mentor_mismatch'; END IF;
 ELSIF TG_TABLE_NAME='edu_lessons' THEN
  IF jsonb_typeof(NEW.questions)<>'array' OR jsonb_array_length(NEW.questions)>50 OR jsonb_typeof(NEW.resources)<>'array' OR jsonb_array_length(NEW.resources)>100 THEN RAISE EXCEPTION 'edu_invalid_lesson_data'; END IF;
  IF TG_OP='UPDATE' AND OLD.questions IS DISTINCT FROM NEW.questions AND EXISTS(SELECT 1 FROM public.edu_submissions WHERE lesson_id=NEW.id AND submitted_at IS NOT NULL) THEN RAISE EXCEPTION 'edu_questions_frozen'; END IF;
  FOR q IN SELECT value FROM jsonb_array_elements(NEW.questions) LOOP
   IF q ? 'required' AND jsonb_typeof(q->'required')<>'boolean' THEN RAISE EXCEPTION 'edu_invalid_question_required'; END IF;
   IF jsonb_typeof(q)<>'object' OR coalesce(jsonb_typeof(q->'id'),'')<>'string' OR coalesce(q->>'id','') !~ '^[a-zA-Z0-9_-]{1,80}$' OR coalesce(jsonb_typeof(q->'prompt'),'')<>'string' OR length(trim(q->>'prompt')) NOT BETWEEN 1 AND 4000 THEN RAISE EXCEPTION 'edu_invalid_question'; END IF;
  END LOOP;
  IF (SELECT count(*) FROM jsonb_array_elements(NEW.questions))<>(SELECT count(DISTINCT value->>'id') FROM jsonb_array_elements(NEW.questions)) THEN RAISE EXCEPTION 'edu_duplicate_question'; END IF;
  FOR r IN SELECT value FROM jsonb_array_elements(NEW.resources) LOOP
   IF jsonb_typeof(r)<>'object' OR coalesce(jsonb_typeof(r->'title'),'')<>'string' OR length(trim(r->>'title')) NOT BETWEEN 1 AND 300 OR coalesce(jsonb_typeof(r->'url'),'')<>'string' OR NOT (r->>'url' ~ '^https://[^[:space:]]+$' OR r->>'url' ~ ('^storage:lesson/'||NEW.id::text||'/[^/[:space:]]+$')) THEN RAISE EXCEPTION 'edu_invalid_resource'; END IF;
  END LOOP;
 ELSIF TG_TABLE_NAME='edu_submissions' THEN
  IF TG_OP='UPDATE' AND OLD.submitted_at IS NOT NULL THEN RAISE EXCEPTION 'edu_submission_immutable'; END IF;
  SELECT * INTO l FROM public.edu_lessons WHERE id=NEW.lesson_id FOR UPDATE;
  SELECT * INTO e FROM public.edu_enrollments WHERE id=NEW.student_enrollment_id FOR SHARE;
  IF e.role<>'student' OR e.status<>'active' OR e.class_id<>l.class_id OR l.publish_at IS NULL OR l.publish_at>now() THEN RAISE EXCEPTION 'edu_submission_not_open'; END IF;
  IF jsonb_typeof(NEW.answers)<>'object' OR octet_length(NEW.answers::text)>200000 THEN RAISE EXCEPTION 'edu_invalid_answers'; END IF;
  FOR r IN SELECT jsonb_build_object('id',key,'answer',value) FROM jsonb_each(NEW.answers) LOOP
   IF jsonb_typeof(r->'answer')<>'string' OR length(r->>'answer')>20000 OR NOT EXISTS(SELECT 1 FROM jsonb_array_elements(l.questions) x WHERE x->>'id'=r->>'id') THEN RAISE EXCEPTION 'edu_invalid_answer'; END IF;
  END LOOP;
  NEW.question_snapshot := '[]'; NEW.updated_at := now();
  IF NEW.submitted_at IS NOT NULL THEN
   IF EXISTS(SELECT 1 FROM jsonb_array_elements(l.questions) x WHERE coalesce((x->>'required')::boolean,false) AND length(trim(coalesce(NEW.answers->>(x->>'id'),'')))=0) THEN RAISE EXCEPTION 'edu_answer_required'; END IF;
   IF NOT EXISTS(SELECT 1 FROM jsonb_each_text(NEW.answers) WHERE length(trim(value))>0) THEN RAISE EXCEPTION 'edu_answer_required'; END IF;
   NEW.submitted_at := now(); NEW.question_snapshot := l.questions;
  END IF;
 ELSIF TG_TABLE_NAME='edu_attendance' THEN
  SELECT * INTO e FROM public.edu_enrollments WHERE id=NEW.student_enrollment_id;
  IF e.role<>'student' OR NOT EXISTS(SELECT 1 FROM public.edu_lessons WHERE id=NEW.lesson_id AND class_id=e.class_id) THEN RAISE EXCEPTION 'edu_attendance_class_mismatch'; END IF;
  NEW.recorded_by := auth.uid();
 ELSIF TG_TABLE_NAME='edu_payment_entries' THEN
  IF NOT EXISTS(SELECT 1 FROM public.edu_enrollments WHERE id=NEW.enrollment_id AND role='student') THEN RAISE EXCEPTION 'edu_payment_requires_student'; END IF;
 ELSIF TG_TABLE_NAME='edu_post_reads' THEN NEW.read_at := now();
 END IF;
 RETURN NEW;
END
$$;

CREATE FUNCTION public.edu_add_member(p_class_id uuid, p_email text, p_display_name text, p_role text) RETURNS public.edu_enrollments
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE u uuid; result public.edu_enrollments;
BEGIN
 IF NOT public.edu_is_head() THEN RAISE EXCEPTION 'head_coach_required' USING ERRCODE='42501'; END IF;
 SELECT id INTO u FROM auth.users WHERE lower(trim(email))=lower(trim(p_email));
 IF u IS NULL THEN RAISE EXCEPTION 'edu_account_not_found'; END IF;
 IF length(trim(p_display_name)) NOT BETWEEN 1 AND 100 THEN RAISE EXCEPTION 'edu_invalid_display_name'; END IF;
 INSERT INTO public.edu_enrollments(class_id,user_id,display_name,role) VALUES(p_class_id,u,trim(p_display_name),p_role)
 ON CONFLICT(class_id,user_id,role) DO UPDATE SET display_name=EXCLUDED.display_name,status='active' RETURNING * INTO result;
 RETURN result;
END
$$;

CREATE FUNCTION public.edu_link_application(p_enrollment_id uuid, p_application_id uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
 IF NOT public.edu_is_head() THEN RAISE EXCEPTION 'head_coach_required' USING ERRCODE='42501'; END IF;
 UPDATE public.edu_enrollments SET application_id=p_application_id WHERE id=p_enrollment_id AND role='student';
 IF NOT FOUND THEN RAISE EXCEPTION 'edu_student_not_found'; END IF;
END
$$;

ALTER TABLE public.edu_courses ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.edu_courses FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.edu_courses TO authenticated;
CREATE TRIGGER edu_validate BEFORE INSERT OR UPDATE ON public.edu_courses FOR EACH ROW EXECUTE FUNCTION public.edu_validate_row();

ALTER TABLE public.edu_cohorts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.edu_cohorts FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.edu_cohorts TO authenticated;
CREATE TRIGGER edu_validate BEFORE INSERT OR UPDATE ON public.edu_cohorts FOR EACH ROW EXECUTE FUNCTION public.edu_validate_row();

ALTER TABLE public.edu_classes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.edu_classes FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.edu_classes TO authenticated;
CREATE TRIGGER edu_validate BEFORE INSERT OR UPDATE ON public.edu_classes FOR EACH ROW EXECUTE FUNCTION public.edu_validate_row();

ALTER TABLE public.edu_enrollments ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.edu_enrollments FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.edu_enrollments TO authenticated;
CREATE TRIGGER edu_validate BEFORE INSERT OR UPDATE ON public.edu_enrollments FOR EACH ROW EXECUTE FUNCTION public.edu_validate_row();

ALTER TABLE public.edu_mentor_assignments ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.edu_mentor_assignments FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.edu_mentor_assignments TO authenticated;
CREATE TRIGGER edu_validate BEFORE INSERT OR UPDATE ON public.edu_mentor_assignments FOR EACH ROW EXECUTE FUNCTION public.edu_validate_row();

ALTER TABLE public.edu_lessons ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.edu_lessons FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.edu_lessons TO authenticated;
CREATE TRIGGER edu_validate BEFORE INSERT OR UPDATE ON public.edu_lessons FOR EACH ROW EXECUTE FUNCTION public.edu_validate_row();

ALTER TABLE public.edu_submissions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.edu_submissions FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.edu_submissions TO authenticated;
CREATE TRIGGER edu_validate BEFORE INSERT OR UPDATE ON public.edu_submissions FOR EACH ROW EXECUTE FUNCTION public.edu_validate_row();

ALTER TABLE public.edu_feedback ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.edu_feedback FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.edu_feedback TO authenticated;
CREATE TRIGGER edu_validate BEFORE INSERT OR UPDATE ON public.edu_feedback FOR EACH ROW EXECUTE FUNCTION public.edu_validate_row();

ALTER TABLE public.edu_posts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.edu_posts FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.edu_posts TO authenticated;
CREATE TRIGGER edu_validate BEFORE INSERT OR UPDATE ON public.edu_posts FOR EACH ROW EXECUTE FUNCTION public.edu_validate_row();

ALTER TABLE public.edu_comments ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.edu_comments FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.edu_comments TO authenticated;
CREATE TRIGGER edu_validate BEFORE INSERT OR UPDATE ON public.edu_comments FOR EACH ROW EXECUTE FUNCTION public.edu_validate_row();

ALTER TABLE public.edu_post_reads ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.edu_post_reads FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.edu_post_reads TO authenticated;
CREATE TRIGGER edu_validate BEFORE INSERT OR UPDATE ON public.edu_post_reads FOR EACH ROW EXECUTE FUNCTION public.edu_validate_row();

ALTER TABLE public.edu_attendance ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.edu_attendance FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.edu_attendance TO authenticated;
CREATE TRIGGER edu_validate BEFORE INSERT OR UPDATE ON public.edu_attendance FOR EACH ROW EXECUTE FUNCTION public.edu_validate_row();

ALTER TABLE public.edu_payment_entries ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.edu_payment_entries FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.edu_payment_entries TO authenticated;
CREATE TRIGGER edu_validate BEFORE INSERT OR UPDATE ON public.edu_payment_entries FOR EACH ROW EXECUTE FUNCTION public.edu_validate_row();

ALTER TABLE public.edu_credentials ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.edu_credentials FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.edu_credentials TO authenticated;
CREATE TRIGGER edu_validate BEFORE INSERT OR UPDATE ON public.edu_credentials FOR EACH ROW EXECUTE FUNCTION public.edu_validate_row();
REVOKE DELETE ON public.edu_submissions, public.edu_enrollments, public.edu_payment_entries, public.edu_credentials, public.edu_attendance, public.edu_courses, public.edu_cohorts, public.edu_classes FROM authenticated;
CREATE POLICY head_manage ON public.edu_courses FOR ALL TO authenticated USING (public.edu_is_head()) WITH CHECK (public.edu_is_head());
CREATE POLICY head_manage ON public.edu_cohorts FOR ALL TO authenticated USING (public.edu_is_head()) WITH CHECK (public.edu_is_head());
CREATE POLICY head_manage ON public.edu_classes FOR ALL TO authenticated USING (public.edu_is_head()) WITH CHECK (public.edu_is_head());
CREATE POLICY head_manage ON public.edu_enrollments FOR ALL TO authenticated USING (public.edu_is_head()) WITH CHECK (public.edu_is_head());
CREATE POLICY head_manage ON public.edu_mentor_assignments FOR ALL TO authenticated USING (public.edu_is_head()) WITH CHECK (public.edu_is_head());
CREATE POLICY head_manage ON public.edu_payment_entries FOR ALL TO authenticated USING (public.edu_is_head()) WITH CHECK (public.edu_is_head());
CREATE POLICY head_manage ON public.edu_credentials FOR ALL TO authenticated USING (public.edu_is_head()) WITH CHECK (public.edu_is_head());
CREATE POLICY catalog ON public.edu_courses FOR SELECT TO authenticated USING (true);
CREATE POLICY member_read ON public.edu_cohorts FOR SELECT TO authenticated USING (EXISTS(SELECT 1 FROM public.edu_classes c WHERE c.cohort_id=edu_cohorts.id AND public.edu_is_member(c.id)));
CREATE POLICY member_read ON public.edu_classes FOR SELECT TO authenticated USING (public.edu_is_member(id));
CREATE POLICY class_roster ON public.edu_enrollments FOR SELECT TO authenticated USING (user_id=auth.uid() OR public.edu_is_member(class_id));
CREATE POLICY assigned_read ON public.edu_mentor_assignments FOR SELECT TO authenticated USING (public.edu_owns_student(student_enrollment_id) OR public.edu_is_mentor(student_enrollment_id));
CREATE POLICY owner_read ON public.edu_payment_entries FOR SELECT TO authenticated USING (public.edu_owns_student(enrollment_id));
CREATE POLICY owner_read ON public.edu_credentials FOR SELECT TO authenticated USING (user_id=auth.uid());
CREATE POLICY visible ON public.edu_lessons FOR SELECT TO authenticated USING (public.edu_can_teach(class_id) OR (publish_at<=now() AND public.edu_is_member(class_id)));
CREATE POLICY teacher_insert ON public.edu_lessons FOR INSERT TO authenticated WITH CHECK (public.edu_can_teach(class_id));
CREATE POLICY teacher_update ON public.edu_lessons FOR UPDATE TO authenticated USING (public.edu_can_teach(class_id)) WITH CHECK (public.edu_can_teach(class_id));
CREATE POLICY teacher_delete ON public.edu_lessons FOR DELETE TO authenticated USING (public.edu_can_teach(class_id));
CREATE POLICY private_read ON public.edu_submissions FOR SELECT TO authenticated USING (public.edu_owns_student(student_enrollment_id) OR (submitted_at IS NOT NULL AND (public.edu_is_head() OR public.edu_is_mentor(student_enrollment_id))));
CREATE POLICY owner_insert ON public.edu_submissions FOR INSERT TO authenticated WITH CHECK (public.edu_owns_student(student_enrollment_id,true) AND public.edu_lesson_visible(lesson_id));
CREATE POLICY owner_draft_update ON public.edu_submissions FOR UPDATE TO authenticated USING (public.edu_owns_student(student_enrollment_id,true) AND submitted_at IS NULL) WITH CHECK (public.edu_owns_student(student_enrollment_id,true) AND public.edu_lesson_visible(lesson_id));
CREATE POLICY private_or_shared_read ON public.edu_feedback FOR SELECT TO authenticated USING (public.edu_can_feedback(submission_id) OR (is_shared AND EXISTS(SELECT 1 FROM public.edu_submissions s WHERE s.id=submission_id AND public.edu_owns_student(s.student_enrollment_id))));
CREATE POLICY mentor_insert ON public.edu_feedback FOR INSERT TO authenticated WITH CHECK (author_id=auth.uid() AND public.edu_can_feedback(submission_id));
CREATE POLICY author_update ON public.edu_feedback FOR UPDATE TO authenticated USING (public.edu_can_feedback(submission_id) AND (author_id=auth.uid() OR public.edu_is_head())) WITH CHECK (public.edu_can_feedback(submission_id) AND (author_id=auth.uid() OR public.edu_is_head()));
CREATE POLICY author_delete ON public.edu_feedback FOR DELETE TO authenticated USING (public.edu_can_feedback(submission_id) AND (author_id=auth.uid() OR public.edu_is_head()));
CREATE POLICY visible ON public.edu_posts FOR SELECT TO authenticated USING (public.edu_can_teach(class_id) OR (publish_at<=now() AND public.edu_is_member(class_id)));
CREATE POLICY teacher_insert ON public.edu_posts FOR INSERT TO authenticated WITH CHECK (public.edu_can_teach(class_id) AND created_by=auth.uid());
CREATE POLICY teacher_update ON public.edu_posts FOR UPDATE TO authenticated USING (public.edu_can_teach(class_id)) WITH CHECK (public.edu_can_teach(class_id));
CREATE POLICY teacher_delete ON public.edu_posts FOR DELETE TO authenticated USING (public.edu_can_teach(class_id));
CREATE POLICY visible ON public.edu_comments FOR SELECT TO authenticated USING (public.edu_post_visible(post_id));
CREATE POLICY participant_insert ON public.edu_comments FOR INSERT TO authenticated WITH CHECK (author_id=auth.uid() AND public.edu_post_visible(post_id));
CREATE POLICY author_update ON public.edu_comments FOR UPDATE TO authenticated USING (public.edu_post_visible(post_id) AND (author_id=auth.uid() OR public.edu_is_head())) WITH CHECK (public.edu_post_visible(post_id) AND (author_id=auth.uid() OR public.edu_is_head()));
CREATE POLICY author_delete ON public.edu_comments FOR DELETE TO authenticated USING (public.edu_post_visible(post_id) AND (author_id=auth.uid() OR public.edu_is_head()));
CREATE POLICY own_or_teacher_read ON public.edu_post_reads FOR SELECT TO authenticated USING (public.edu_post_visible(post_id) AND (user_id=auth.uid() OR EXISTS(SELECT 1 FROM public.edu_posts WHERE id=post_id AND public.edu_can_teach(class_id))));
CREATE POLICY owner_insert ON public.edu_post_reads FOR INSERT TO authenticated WITH CHECK (user_id=auth.uid() AND public.edu_post_visible(post_id));
CREATE POLICY owner_update ON public.edu_post_reads FOR UPDATE TO authenticated USING (user_id=auth.uid() AND public.edu_post_visible(post_id)) WITH CHECK (user_id=auth.uid() AND public.edu_post_visible(post_id));
CREATE POLICY participants_read ON public.edu_attendance FOR SELECT TO authenticated USING (public.edu_owns_student(student_enrollment_id) OR public.edu_is_mentor(student_enrollment_id) OR EXISTS(SELECT 1 FROM public.edu_lessons WHERE id=lesson_id AND public.edu_can_teach(class_id)));
CREATE POLICY teacher_manage ON public.edu_attendance FOR ALL TO authenticated USING (EXISTS(SELECT 1 FROM public.edu_lessons WHERE id=lesson_id AND public.edu_can_teach(class_id))) WITH CHECK (EXISTS(SELECT 1 FROM public.edu_lessons WHERE id=lesson_id AND public.edu_can_teach(class_id)));

CREATE FUNCTION public.edu_file_allowed(p_name text, p_write boolean DEFAULT false) RETURNS boolean
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
DECLARE parts text[]; item uuid;
BEGIN
 IF auth.uid() IS NULL THEN RETURN false; END IF;
 parts := string_to_array(p_name,'/');
 IF array_length(parts,1)<>3 OR parts[3]='' OR parts[3] IN ('.','..') OR parts[2] !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' THEN RETURN false; END IF;
 item := parts[2]::uuid;
 IF parts[1]='lesson' THEN
  IF p_write THEN RETURN EXISTS(SELECT 1 FROM public.edu_lessons WHERE id=item AND public.edu_can_teach(class_id)); END IF;
  RETURN public.edu_lesson_visible(item);
 ELSIF parts[1]='submission' THEN
  IF p_write THEN RETURN EXISTS(SELECT 1 FROM public.edu_submissions WHERE id=item AND submitted_at IS NULL AND public.edu_owns_student(student_enrollment_id,true) AND public.edu_lesson_visible(lesson_id)); END IF;
  RETURN public.edu_submission_visible(item);
 END IF;
 RETURN false;
END
$$;

INSERT INTO storage.buckets(id,name,public,file_size_limit) VALUES('edu-files','edu-files',false,10485760);
CREATE POLICY edu_files_read ON storage.objects FOR SELECT TO authenticated USING(bucket_id='edu-files' AND public.edu_file_allowed(name));
CREATE POLICY edu_files_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK(bucket_id='edu-files' AND public.edu_file_allowed(name,true));
CREATE POLICY edu_files_update ON storage.objects FOR UPDATE TO authenticated USING(bucket_id='edu-files' AND public.edu_file_allowed(name,true)) WITH CHECK(bucket_id='edu-files' AND public.edu_file_allowed(name,true));
CREATE POLICY edu_files_delete ON storage.objects FOR DELETE TO authenticated USING(bucket_id='edu-files' AND public.edu_file_allowed(name,true));
-- Explicit allowlist: newly created definer helpers must never inherit PUBLIC execute.
DO $$ DECLARE f record; BEGIN
 FOR f IN SELECT p.oid::regprocedure AS signature FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname LIKE 'edu_%' LOOP
  EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated',f.signature);
  IF f.signature::text NOT LIKE '%edu_validate_row(%' THEN EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated',f.signature); END IF;
 END LOOP;
END $$;
INSERT INTO public.edu_courses(code,title,kind) VALUES
 ('basic','성경적 에니어그램 기본과정','basic'),('growth_101','심화 101','growth'),('growth_201','심화 201','growth'),('growth_202','심화 202 (안내 준비 중)','growth'),('training','코치 트레이닝','training');
INSERT INTO public.edu_cohorts(id,course_id,title,status,application_cohort_key) SELECT 'ed000000-0000-4000-8000-000000000010',id,'2026년 10월 기본과정','draft','enneagram_basic_2026_10' FROM public.edu_courses WHERE code='basic';
INSERT INTO public.edu_classes(cohort_id,title,capacity) VALUES
 ('ed000000-0000-4000-8000-000000000010','A반',7),('ed000000-0000-4000-8000-000000000010','B반',7);
COMMIT;

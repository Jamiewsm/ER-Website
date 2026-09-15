-- 사전 보고서의 파일 제출과 수석코치 외부 접수 표시를 기존 과제 권한 안에서 검증한다.
BEGIN;
CREATE OR REPLACE FUNCTION public.edu_validate_row() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE oldj jsonb; newj jsonb := to_jsonb(NEW); col text; cols text[];
 e public.edu_enrollments; m public.edu_enrollments; l public.edu_lessons; q jsonb; r jsonb; used integer; cap integer; cohort uuid; v_cohort_key text; total_cap integer;
BEGIN
 IF TG_OP='UPDATE' THEN
  oldj := to_jsonb(OLD);
  cols := CASE TG_TABLE_NAME
   WHEN 'edu_cohorts' THEN ARRAY['id','course_id','application_cohort_key'] WHEN 'edu_classes' THEN ARRAY['id','cohort_id']
   WHEN 'edu_enrollments' THEN ARRAY['id','class_id','user_id','role']
   WHEN 'edu_mentor_assignments' THEN ARRAY['id','student_enrollment_id','mentor_enrollment_id']
   WHEN 'edu_lessons' THEN ARRAY['id','class_id','kind'] WHEN 'edu_submissions' THEN ARRAY['id','lesson_id','student_enrollment_id']
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
  SELECT application_cohort_key INTO v_cohort_key FROM public.edu_cohorts WHERE id=NEW.cohort_id;
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(coalesce(v_cohort_key,NEW.cohort_id::text),0));
  SELECT count(*) INTO used FROM public.edu_enrollments WHERE class_id=NEW.id AND role='student' AND status IN ('active','completed');
  IF used>NEW.capacity THEN RAISE EXCEPTION 'edu_capacity_below_enrollment'; END IF;
  SELECT coalesce(sum(capacity),0)+NEW.capacity INTO total_cap FROM public.edu_classes WHERE cohort_id=NEW.cohort_id AND id<>NEW.id;
  IF TG_OP='UPDATE' AND NEW.capacity<OLD.capacity AND public.edu_cohort_occupied(NEW.cohort_id)>total_cap THEN RAISE EXCEPTION 'edu_capacity_below_reservations'; END IF;
 ELSIF TG_TABLE_NAME='edu_enrollments' THEN
  SELECT c.cohort_id,h.application_cohort_key INTO cohort,v_cohort_key FROM public.edu_classes c JOIN public.edu_cohorts h ON h.id=c.cohort_id WHERE c.id=NEW.class_id;
  IF cohort IS NULL THEN RAISE EXCEPTION 'edu_class_not_found'; END IF;
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(coalesce(v_cohort_key,cohort::text),0));
  SELECT capacity INTO cap FROM public.edu_classes WHERE id=NEW.class_id;
  IF NEW.role='student' AND NEW.status IN ('active','completed') THEN
   SELECT count(*) INTO used FROM public.edu_enrollments WHERE class_id=NEW.class_id AND role='student' AND status IN ('active','completed') AND id<>NEW.id;
   IF used>=cap THEN RAISE EXCEPTION 'edu_class_full'; END IF;
   SELECT coalesce(sum(capacity),0) INTO total_cap FROM public.edu_classes WHERE cohort_id=cohort;
   IF public.edu_cohort_occupied(cohort,NEW.id,NEW.application_id)>=total_cap THEN RAISE EXCEPTION 'edu_cohort_full'; END IF;
  END IF;
  IF NEW.application_id IS NOT NULL THEN
   IF NEW.role<>'student' THEN RAISE EXCEPTION 'edu_application_requires_student'; END IF;
   IF NOT EXISTS(SELECT 1 FROM public.program_applications a WHERE a.id=NEW.application_id AND v_cohort_key IS NOT NULL AND a.cohort_key=v_cohort_key) THEN RAISE EXCEPTION 'edu_application_cohort_mismatch'; END IF;
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
  IF NOT public.edu_is_head() AND ((TG_OP='INSERT' AND NEW.external_received_at IS NOT NULL) OR (TG_OP='UPDATE' AND (OLD.external_received_at IS DISTINCT FROM NEW.external_received_at OR OLD.external_received_by IS DISTINCT FROM NEW.external_received_by))) THEN RAISE EXCEPTION 'head_coach_required' USING ERRCODE='42501'; END IF;
  IF TG_OP='UPDATE' AND OLD.external_received_at IS NOT NULL AND NOT public.edu_is_head() THEN RAISE EXCEPTION 'edu_submission_immutable'; END IF;
  IF TG_OP='UPDATE' AND OLD.submitted_at IS NOT NULL THEN RAISE EXCEPTION 'edu_submission_immutable'; END IF;
  SELECT * INTO l FROM public.edu_lessons WHERE id=NEW.lesson_id FOR UPDATE;
  SELECT * INTO e FROM public.edu_enrollments WHERE id=NEW.student_enrollment_id FOR SHARE;
  IF e.role<>'student' OR e.status<>'active' OR e.class_id<>l.class_id OR l.publish_at IS NULL OR l.publish_at>now() THEN RAISE EXCEPTION 'edu_submission_not_open'; END IF;
  IF NEW.external_received_at IS NOT NULL AND l.kind<>'preparation' THEN RAISE EXCEPTION 'edu_preparation_not_found'; END IF;
  IF jsonb_typeof(NEW.answers)<>'object' OR octet_length(NEW.answers::text)>200000 THEN RAISE EXCEPTION 'edu_invalid_answers'; END IF;
  FOR r IN SELECT jsonb_build_object('id',key,'answer',value) FROM jsonb_each(NEW.answers) LOOP
   IF jsonb_typeof(r->'answer')<>'string' OR length(r->>'answer')>20000 OR NOT EXISTS(SELECT 1 FROM jsonb_array_elements(l.questions) x WHERE x->>'id'=r->>'id') THEN RAISE EXCEPTION 'edu_invalid_answer'; END IF;
  END LOOP;
  NEW.question_snapshot := l.questions; NEW.updated_at := now();
  IF NEW.submitted_at IS NOT NULL THEN
   -- 사전 보고서의 파일 제출은 실제 비공개 저장소 객체를 확인한다. 정규 과제의 필수 문항은 유지한다.
   IF NOT (l.kind='preparation' AND EXISTS(SELECT 1 FROM storage.objects WHERE bucket_id='edu-files' AND name LIKE 'submission/'||NEW.id::text||'/%' AND array_length(string_to_array(name,'/'),1)=3)) THEN
   IF EXISTS(SELECT 1 FROM jsonb_array_elements(l.questions) x WHERE coalesce((x->>'required')::boolean,false) AND length(trim(coalesce(NEW.answers->>(x->>'id'),'')))=0) THEN RAISE EXCEPTION 'edu_answer_required'; END IF;
   IF NOT EXISTS(SELECT 1 FROM jsonb_each_text(NEW.answers) WHERE length(trim(value))>0) THEN RAISE EXCEPTION 'edu_answer_required'; END IF;
   END IF;
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

CREATE OR REPLACE FUNCTION public.edu_file_allowed(p_name text, p_write boolean DEFAULT false) RETURNS boolean
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
  IF p_write THEN RETURN EXISTS(SELECT 1 FROM public.edu_submissions WHERE id=item AND submitted_at IS NULL AND external_received_at IS NULL AND public.edu_owns_student(student_enrollment_id,true) AND public.edu_lesson_visible(lesson_id)); END IF;
  RETURN public.edu_submission_visible(item);
 END IF;
 RETURN false;
END
$$;

COMMIT;

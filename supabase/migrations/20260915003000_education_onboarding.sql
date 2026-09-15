-- 납부 확인과 반 배정을 확정하고 인증 이메일로 교실을 연결하며 사전 준비 발송을 기록한다.
BEGIN;

ALTER TABLE public.edu_lessons ADD COLUMN kind text NOT NULL DEFAULT 'lesson' CHECK(kind IN ('lesson','preparation')),
 ADD COLUMN due_at timestamptz, ADD COLUMN reminders_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE public.edu_lessons DROP CONSTRAINT edu_lessons_position_check;
ALTER TABLE public.edu_lessons ADD CONSTRAINT edu_lessons_kind_position_check
 CHECK((kind='preparation' AND position=0) OR (kind='lesson' AND position>0));
ALTER TABLE public.edu_lessons ADD CONSTRAINT edu_lessons_reminder_deadline_check
 CHECK(NOT reminders_enabled OR (kind='preparation' AND due_at IS NOT NULL));
ALTER TABLE public.edu_submissions ADD COLUMN external_received_at timestamptz,
 ADD COLUMN external_received_by uuid REFERENCES auth.users ON DELETE RESTRICT;
ALTER TABLE public.edu_submissions ADD CONSTRAINT edu_external_receipt_complete
 CHECK((external_received_at IS NULL)=(external_received_by IS NULL));

CREATE TABLE public.edu_registration_onboarding (
 application_id uuid PRIMARY KEY REFERENCES public.program_applications ON DELETE RESTRICT,
 class_id uuid NOT NULL REFERENCES public.edu_classes ON DELETE RESTRICT,
 email text NOT NULL CHECK(email=lower(trim(email)) AND email ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'),
 display_name text NOT NULL CHECK(length(trim(display_name)) BETWEEN 1 AND 100),
 payment_confirmed_at timestamptz NOT NULL DEFAULT now(), confirmed_at timestamptz NOT NULL DEFAULT now(),
 confirmed_by uuid NOT NULL REFERENCES auth.users ON DELETE RESTRICT,
 claimed_enrollment_id uuid REFERENCES public.edu_enrollments ON DELETE RESTRICT,
 claimed_at timestamptz, cancelled_at timestamptz,
 CHECK((claimed_at IS NULL)=(claimed_enrollment_id IS NULL))
);
CREATE UNIQUE INDEX edu_onboarding_class_email ON public.edu_registration_onboarding(class_id,email) WHERE cancelled_at IS NULL;
CREATE INDEX edu_onboarding_email ON public.edu_registration_onboarding(email) WHERE claimed_at IS NULL AND cancelled_at IS NULL;
CREATE TABLE public.edu_onboarding_email_deliveries (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 application_id uuid NOT NULL REFERENCES public.edu_registration_onboarding ON DELETE RESTRICT,
 kind text NOT NULL CHECK(kind IN ('welcome','reminder_3d','reminder_1d')),
 status text NOT NULL DEFAULT 'claimed' CHECK(status IN ('claimed','sent','uncertain')),
 attempted_at timestamptz NOT NULL DEFAULT now(), sent_at timestamptz, finished_at timestamptz,
 actor_id uuid REFERENCES auth.users ON DELETE RESTRICT, provider_id text, error text,
 UNIQUE(application_id,kind)
);
ALTER TABLE public.edu_registration_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edu_onboarding_email_deliveries ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.edu_registration_onboarding,public.edu_onboarding_email_deliveries FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.edu_registration_onboarding,public.edu_onboarding_email_deliveries TO authenticated;
CREATE POLICY head_read ON public.edu_registration_onboarding FOR SELECT TO authenticated USING(public.edu_is_head());
CREATE POLICY head_read ON public.edu_onboarding_email_deliveries FOR SELECT TO authenticated USING(public.edu_is_head());

-- 미가입자의 확정 신청은 기존 기수 예약에 이미 포함되므로 반 정원에만 추가한다.
CREATE FUNCTION public.edu_class_occupied(p_class uuid,p_exclude_enrollment uuid DEFAULT NULL,p_exclude_application uuid DEFAULT NULL) RETURNS integer
LANGUAGE sql VOLATILE SECURITY DEFINER SET search_path='' AS $$
 SELECT ((SELECT count(*) FROM public.edu_enrollments e WHERE e.class_id=p_class AND e.role='student'
  AND e.status IN ('active','completed') AND e.id IS DISTINCT FROM p_exclude_enrollment)
 + (SELECT count(*) FROM public.edu_registration_onboarding o JOIN public.program_applications a ON a.id=o.application_id
  WHERE o.class_id=p_class AND o.cancelled_at IS NULL AND a.status='confirmed' AND o.application_id IS DISTINCT FROM p_exclude_application
  AND NOT EXISTS(SELECT 1 FROM public.edu_enrollments e WHERE e.application_id=o.application_id AND e.role='student'
   AND e.status IN ('active','completed') AND e.id IS DISTINCT FROM p_exclude_enrollment)))::integer
$$;

CREATE FUNCTION public.edu_validate_onboarding_capacity() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE lock_key text; class_id uuid; cap integer;
BEGIN
 IF TG_TABLE_NAME='edu_classes' THEN
  SELECT coalesce(application_cohort_key,id::text) INTO lock_key FROM public.edu_cohorts WHERE id=NEW.cohort_id;
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(lock_key,0));
  IF public.edu_class_occupied(NEW.id)>NEW.capacity THEN RAISE EXCEPTION 'edu_capacity_below_reservations'; END IF;
 ELSE
  IF NEW.role<>'student' OR NEW.status NOT IN ('active','completed') THEN RETURN NEW; END IF;
  SELECT coalesce(h.application_cohort_key,h.id::text),c.capacity INTO lock_key,cap
   FROM public.edu_classes c JOIN public.edu_cohorts h ON h.id=c.cohort_id WHERE c.id=NEW.class_id;
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(lock_key,0));
  IF public.edu_class_occupied(NEW.class_id,NEW.id,NEW.application_id)>=cap THEN RAISE EXCEPTION 'edu_class_full'; END IF;
  IF NEW.application_id IS NOT NULL AND EXISTS(SELECT 1 FROM public.edu_registration_onboarding o
   WHERE o.application_id=NEW.application_id AND (o.class_id<>NEW.class_id OR o.cancelled_at IS NOT NULL)) THEN
   RAISE EXCEPTION 'edu_onboarding_assignment_mismatch';
  END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER edu_onboarding_capacity BEFORE INSERT OR UPDATE ON public.edu_classes FOR EACH ROW EXECUTE FUNCTION public.edu_validate_onboarding_capacity();
CREATE TRIGGER edu_onboarding_capacity BEFORE INSERT OR UPDATE ON public.edu_enrollments FOR EACH ROW EXECUTE FUNCTION public.edu_validate_onboarding_capacity();

CREATE FUNCTION public.edu_confirm_registration(p_application_id uuid,p_class_id uuid,p_email text,p_display_name text,p_payment_confirmed boolean)
RETURNS public.edu_registration_onboarding LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE a public.program_applications; h public.edu_cohorts; c public.edu_classes; o public.edu_registration_onboarding;
 e public.edu_enrollments; account_id uuid; normalized_email text:=lower(trim(p_email));
BEGIN
 IF NOT public.edu_is_head() THEN RAISE EXCEPTION 'head_coach_required' USING ERRCODE='42501'; END IF;
 IF p_payment_confirmed IS DISTINCT FROM true THEN RAISE EXCEPTION 'edu_payment_confirmation_required'; END IF;
 IF normalized_email IS NULL OR normalized_email !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$' THEN RAISE EXCEPTION 'edu_invalid_email'; END IF;
 IF p_display_name IS NULL OR length(trim(p_display_name)) NOT BETWEEN 1 AND 100 THEN RAISE EXCEPTION 'edu_invalid_display_name'; END IF;
 SELECT * INTO c FROM public.edu_classes WHERE id=p_class_id;
 SELECT * INTO h FROM public.edu_cohorts WHERE id=c.cohort_id;
 IF c.id IS NULL THEN RAISE EXCEPTION 'edu_class_not_found'; END IF;
 IF h.status='completed' THEN RAISE EXCEPTION 'edu_cohort_completed'; END IF;
 PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(coalesce(h.application_cohort_key,h.id::text),0));
 -- 잠금을 기다리는 동안 바뀐 반 정원과 기수 상태를 다시 읽는다.
 SELECT * INTO c FROM public.edu_classes WHERE id=p_class_id;
 SELECT * INTO h FROM public.edu_cohorts WHERE id=c.cohort_id;
 IF h.status='completed' THEN RAISE EXCEPTION 'edu_cohort_completed'; END IF;
 SELECT * INTO a FROM public.program_applications WHERE id=p_application_id FOR UPDATE;
 IF a.id IS NULL THEN RAISE EXCEPTION 'application_not_found'; END IF;
 IF a.status='cancelled' THEN RAISE EXCEPTION 'edu_registration_cancelled'; END IF;
 IF h.application_cohort_key IS NULL OR a.cohort_key IS DISTINCT FROM h.application_cohort_key THEN RAISE EXCEPTION 'edu_application_cohort_mismatch'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.edu_courses WHERE id=h.course_id AND
  ((kind='basic' AND a.program_key='enneagram_basic_july') OR (kind='growth' AND code=a.program_key))) THEN
  RAISE EXCEPTION 'edu_application_course_mismatch';
 END IF;
 IF trim(a.contact) ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$' AND lower(trim(a.contact))<>normalized_email THEN RAISE EXCEPTION 'edu_application_email_mismatch'; END IF;
 SELECT * INTO o FROM public.edu_registration_onboarding WHERE application_id=p_application_id FOR UPDATE;
 IF o.application_id IS NOT NULL THEN
  IF o.cancelled_at IS NOT NULL OR a.status<>'confirmed' THEN RAISE EXCEPTION 'edu_registration_cancelled'; END IF;
  IF o.class_id<>p_class_id OR o.email<>normalized_email OR o.display_name<>trim(p_display_name) THEN RAISE EXCEPTION 'edu_registration_already_confirmed'; END IF;
  RETURN o;
 END IF;
 SELECT * INTO e FROM public.edu_enrollments WHERE application_id=p_application_id;
 IF e.id IS NOT NULL AND (e.class_id<>p_class_id OR e.role<>'student' OR e.status<>'active') THEN RAISE EXCEPTION 'edu_onboarding_assignment_mismatch'; END IF;
 IF e.id IS NULL THEN
  SELECT id INTO account_id FROM auth.users WHERE lower(trim(email))=normalized_email;
  SELECT * INTO e FROM public.edu_enrollments WHERE class_id=p_class_id AND user_id=account_id AND role='student';
  IF e.id IS NOT NULL AND (e.status<>'active' OR (e.application_id IS NOT NULL AND e.application_id<>p_application_id)) THEN RAISE EXCEPTION 'edu_onboarding_assignment_mismatch'; END IF;
 END IF;
 IF e.id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM auth.users WHERE id=e.user_id AND lower(trim(email))=normalized_email) THEN RAISE EXCEPTION 'edu_application_email_mismatch'; END IF;
 IF public.edu_class_occupied(p_class_id,e.id,p_application_id)>=c.capacity THEN RAISE EXCEPTION 'edu_class_full'; END IF;
 -- 이미 수석코치가 배정한 계정은 신청 연결만 보완하여 같은 자리를 두 번 세지 않는다.
 IF e.id IS NOT NULL AND e.application_id IS NULL THEN
  UPDATE public.edu_enrollments SET application_id=p_application_id WHERE id=e.id;
 END IF;
 UPDATE public.program_applications SET status='confirmed',confirmed_at=coalesce(confirmed_at,now()) WHERE id=p_application_id;
 INSERT INTO public.edu_registration_onboarding(application_id,class_id,email,display_name,confirmed_by,claimed_enrollment_id,claimed_at)
  VALUES(p_application_id,p_class_id,normalized_email,trim(p_display_name),auth.uid(),e.id,CASE WHEN e.id IS NOT NULL THEN now() END) RETURNING * INTO o;
 RETURN o;
END $$;

CREATE FUNCTION public.edu_claim_registrations() RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE account_email text; o public.edu_registration_onboarding; e public.edu_enrollments; n integer:=0; lock_key text;
BEGIN
 SELECT lower(trim(email)) INTO account_email FROM auth.users WHERE id=auth.uid() AND email_confirmed_at IS NOT NULL FOR SHARE;
 IF account_email IS NULL THEN RETURN 0; END IF;
 FOR o IN SELECT * FROM public.edu_registration_onboarding WHERE email=account_email AND claimed_at IS NULL AND cancelled_at IS NULL ORDER BY application_id LOOP
  SELECT coalesce(h.application_cohort_key,h.id::text) INTO lock_key FROM public.edu_classes c JOIN public.edu_cohorts h ON h.id=c.cohort_id WHERE c.id=o.class_id;
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(lock_key,0));
  SELECT * INTO o FROM public.edu_registration_onboarding WHERE application_id=o.application_id FOR UPDATE;
  IF o.claimed_at IS NOT NULL OR o.cancelled_at IS NOT NULL OR NOT EXISTS(
   SELECT 1 FROM public.program_applications a JOIN public.edu_classes c ON c.id=o.class_id JOIN public.edu_cohorts h ON h.id=c.cohort_id
   WHERE a.id=o.application_id AND a.status='confirmed' AND a.cohort_key=h.application_cohort_key AND h.status<>'completed') THEN CONTINUE; END IF;
  SELECT * INTO e FROM public.edu_enrollments WHERE application_id=o.application_id;
  IF e.id IS NOT NULL THEN CONTINUE; END IF;
  SELECT * INTO e FROM public.edu_enrollments WHERE class_id=o.class_id AND user_id=auth.uid() AND role='student';
  IF e.id IS NOT NULL AND (e.status<>'active' OR (e.application_id IS NOT NULL AND e.application_id<>o.application_id)) THEN CONTINUE; END IF;
  IF e.id IS NULL THEN
   INSERT INTO public.edu_enrollments(class_id,user_id,display_name,role,application_id)
    VALUES(o.class_id,auth.uid(),o.display_name,'student',o.application_id) RETURNING * INTO e;
  ELSE
   UPDATE public.edu_enrollments SET application_id=o.application_id WHERE id=e.id RETURNING * INTO e;
  END IF;
  UPDATE public.edu_registration_onboarding SET claimed_enrollment_id=e.id,claimed_at=now() WHERE application_id=o.application_id;
  n:=n+1;
 END LOOP;
 RETURN n;
END $$;

CREATE FUNCTION public.edu_cancel_onboarding_from_application() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF (NEW.status<>'confirmed' OR OLD.cohort_key IS DISTINCT FROM NEW.cohort_key) THEN
  UPDATE public.edu_registration_onboarding SET cancelled_at=coalesce(cancelled_at,now()) WHERE application_id=NEW.id;
  UPDATE public.edu_enrollments SET status='withdrawn' WHERE application_id=NEW.id AND role='student' AND status='active'
   AND EXISTS(SELECT 1 FROM public.edu_registration_onboarding WHERE application_id=NEW.id);
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER edu_onboarding_cancel AFTER UPDATE OF status,cohort_key ON public.program_applications FOR EACH ROW EXECUTE FUNCTION public.edu_cancel_onboarding_from_application();
CREATE FUNCTION public.edu_cancel_registration(p_application_id uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF NOT public.edu_is_head() THEN RAISE EXCEPTION 'head_coach_required' USING ERRCODE='42501'; END IF;
 UPDATE public.program_applications SET status='cancelled' WHERE id=p_application_id;
 IF NOT FOUND THEN RAISE EXCEPTION 'application_not_found'; END IF;
END $$;

CREATE FUNCTION public.edu_mark_preparation_received(p_enrollment_id uuid,p_lesson_id uuid,p_received boolean)
RETURNS public.edu_submissions LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE result public.edu_submissions;
BEGIN
 IF NOT public.edu_is_head() THEN RAISE EXCEPTION 'head_coach_required' USING ERRCODE='42501'; END IF;
 IF p_received IS NULL THEN RAISE EXCEPTION 'edu_invalid_receipt'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.edu_enrollments e JOIN public.edu_lessons l ON l.class_id=e.class_id
  WHERE e.id=p_enrollment_id AND e.role='student' AND e.status='active' AND l.id=p_lesson_id AND l.kind='preparation') THEN RAISE EXCEPTION 'edu_preparation_not_found'; END IF;
 SELECT * INTO result FROM public.edu_submissions WHERE lesson_id=p_lesson_id AND student_enrollment_id=p_enrollment_id FOR UPDATE;
 IF result.submitted_at IS NOT NULL THEN RETURN result; END IF;
 IF result.id IS NULL THEN
  IF NOT p_received THEN RETURN result; END IF;
  INSERT INTO public.edu_submissions(lesson_id,student_enrollment_id,external_received_at,external_received_by)
   VALUES(p_lesson_id,p_enrollment_id,now(),auth.uid()) RETURNING * INTO result;
 ELSE
  UPDATE public.edu_submissions SET external_received_at=CASE WHEN p_received THEN coalesce(external_received_at,now()) END,
   external_received_by=CASE WHEN p_received THEN coalesce(external_received_by,auth.uid()) END WHERE id=result.id RETURNING * INTO result;
 END IF;
 -- 접수 상태를 확인하는 수석코치에게 학생의 미제출 초안 본문을 반환하지 않는다.
 result.answers:='{}'::jsonb;
 result.question_snapshot:='[]'::jsonb;
 RETURN result;
END $$;

CREATE FUNCTION public.edu_preparation_statuses()
RETURNS TABLE(enrollment_id uuid,lesson_id uuid,submitted_at timestamptz,external_received_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF NOT public.edu_is_head() THEN RAISE EXCEPTION 'head_coach_required' USING ERRCODE='42501'; END IF;
 RETURN QUERY SELECT e.id,l.id,s.submitted_at,s.external_received_at
  FROM public.edu_enrollments e JOIN public.edu_lessons l ON l.class_id=e.class_id AND l.kind='preparation'
  LEFT JOIN public.edu_submissions s ON s.student_enrollment_id=e.id AND s.lesson_id=l.id
  WHERE e.role='student' AND e.status='active' AND l.publish_at<=now();
END $$;

-- 아래 발송 함수는 서비스 역할만 호출한다. 선점은 자동 만료하지 않아 불확실한 재전송을 막는다.
CREATE FUNCTION public.edu_onboarding_email_payload(p_application_id uuid,p_kind text) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$
DECLARE o public.edu_registration_onboarding; l public.edu_lessons; result jsonb; welcome_at timestamptz; previous_at timestamptz; days_left integer;
BEGIN
 IF p_kind NOT IN ('welcome','reminder_3d','reminder_1d') OR p_kind IS NULL THEN RETURN jsonb_build_object('ok',false,'reason','invalid_kind'); END IF;
 SELECT * INTO o FROM public.edu_registration_onboarding WHERE application_id=p_application_id;
 IF o.application_id IS NULL OR o.cancelled_at IS NOT NULL OR NOT EXISTS(
  SELECT 1 FROM public.program_applications a JOIN public.edu_classes c ON c.id=o.class_id JOIN public.edu_cohorts h ON h.id=c.cohort_id
  WHERE a.id=o.application_id AND a.status='confirmed' AND a.cohort_key=h.application_cohort_key AND h.status<>'completed')
  OR (o.claimed_enrollment_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.edu_enrollments e WHERE e.id=o.claimed_enrollment_id AND e.status='active'
    AND e.application_id=o.application_id AND e.class_id=o.class_id)) THEN
  RETURN jsonb_build_object('ok',false,'reason','registration_inactive');
 END IF;
 SELECT * INTO l FROM public.edu_lessons WHERE class_id=o.class_id AND kind='preparation';
 IF l.id IS NULL OR l.publish_at IS NULL OR l.publish_at>now() OR l.due_at IS NULL THEN RETURN jsonb_build_object('ok',false,'reason','preparation_not_ready'); END IF;
 IF p_kind<>'welcome' THEN
  IF NOT l.reminders_enabled OR l.due_at<=now() THEN RETURN jsonb_build_object('ok',false,'reason','reminders_inactive'); END IF;
  IF EXISTS(SELECT 1 FROM public.edu_submissions WHERE lesson_id=l.id AND student_enrollment_id=o.claimed_enrollment_id
   AND (submitted_at IS NOT NULL OR external_received_at IS NOT NULL)) THEN RETURN jsonb_build_object('ok',false,'reason','already_submitted'); END IF;
  days_left:=(l.due_at AT TIME ZONE 'Asia/Seoul')::date-(now() AT TIME ZONE 'Asia/Seoul')::date;
  IF days_left<>(CASE p_kind WHEN 'reminder_3d' THEN 3 ELSE 1 END) THEN RETURN jsonb_build_object('ok',false,'reason','outside_reminder_window'); END IF;
  SELECT sent_at INTO welcome_at FROM public.edu_onboarding_email_deliveries WHERE application_id=o.application_id AND kind='welcome' AND status='sent';
  SELECT max(attempted_at) INTO previous_at FROM public.edu_onboarding_email_deliveries WHERE application_id=o.application_id AND kind NOT IN ('welcome',p_kind);
  IF welcome_at IS NULL OR welcome_at>now()-interval '24 hours' OR previous_at>now()-interval '24 hours' THEN RETURN jsonb_build_object('ok',false,'reason','reminder_spacing'); END IF;
 END IF;
 SELECT jsonb_build_object('ok',true,'application_id',o.application_id,'recipient',o.email,'name',o.display_name,
  'course_title',course.title,'cohort_title',h.title,'class_title',c.title,'schedule_note',c.schedule_note,
  'starts_at',(SELECT min(starts_at) FROM public.edu_lessons WHERE class_id=c.id AND kind='lesson'),
  'due_at',l.due_at) INTO result FROM public.edu_classes c JOIN public.edu_cohorts h ON h.id=c.cohort_id
  JOIN public.edu_courses course ON course.id=h.course_id WHERE c.id=o.class_id;
 RETURN result;
END $$;

CREATE FUNCTION public.edu_claim_onboarding_email(p_application_id uuid,p_kind text,p_actor uuid DEFAULT NULL) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE result jsonb; delivery public.edu_onboarding_email_deliveries;
BEGIN
 IF p_kind='welcome' AND NOT EXISTS(SELECT 1 FROM public.coach_profiles WHERE user_id=p_actor AND role='head_coach' AND is_active) THEN
  RETURN jsonb_build_object('ok',false,'reason','head_coach_required');
 END IF;
 result:=public.edu_onboarding_email_payload(p_application_id,p_kind);
 IF NOT coalesce((result->>'ok')::boolean,false) THEN RETURN result; END IF;
 INSERT INTO public.edu_onboarding_email_deliveries(application_id,kind,actor_id) VALUES(p_application_id,p_kind,p_actor)
  ON CONFLICT(application_id,kind) DO NOTHING RETURNING * INTO delivery;
 IF delivery.id IS NULL THEN
  SELECT * INTO delivery FROM public.edu_onboarding_email_deliveries WHERE application_id=p_application_id AND kind=p_kind;
  RETURN jsonb_build_object('ok',false,'delivery_id',delivery.id,'reason',CASE WHEN delivery.status='sent' THEN 'already_sent' ELSE 'delivery_uncertain' END);
 END IF;
 RETURN result||jsonb_build_object('delivery_id',delivery.id);
END $$;
CREATE FUNCTION public.edu_check_onboarding_email(p_delivery_id uuid) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$
DECLARE delivery public.edu_onboarding_email_deliveries;
BEGIN
 SELECT * INTO delivery FROM public.edu_onboarding_email_deliveries WHERE id=p_delivery_id;
 IF delivery.id IS NULL OR delivery.status<>'claimed' THEN RETURN jsonb_build_object('ok',false,'reason','delivery_not_pending'); END IF;
 RETURN public.edu_onboarding_email_payload(delivery.application_id,delivery.kind)||jsonb_build_object('delivery_id',delivery.id);
END $$;
CREATE FUNCTION public.edu_finish_onboarding_email(p_delivery_id uuid,p_provider_id text DEFAULT NULL,p_error text DEFAULT NULL) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 UPDATE public.edu_onboarding_email_deliveries SET
  status=CASE WHEN nullif(trim(p_provider_id),'') IS NOT NULL AND p_error IS NULL THEN 'sent' ELSE 'uncertain' END,
  sent_at=CASE WHEN nullif(trim(p_provider_id),'') IS NOT NULL AND p_error IS NULL THEN now() END,
  finished_at=now(),provider_id=nullif(trim(p_provider_id),''),error=left(p_error,2000)
 WHERE id=p_delivery_id AND status='claimed';
 IF NOT FOUND AND NOT EXISTS(SELECT 1 FROM public.edu_onboarding_email_deliveries WHERE id=p_delivery_id) THEN RAISE EXCEPTION 'edu_delivery_not_found'; END IF;
END $$;
CREATE FUNCTION public.edu_onboarding_reminder_candidates(p_limit integer DEFAULT 100)
RETURNS TABLE(application_id uuid,kind text) LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT o.application_id,k.kind FROM public.edu_registration_onboarding o
 CROSS JOIN (VALUES('reminder_3d'::text),('reminder_1d'::text)) k(kind)
 WHERE NOT EXISTS(SELECT 1 FROM public.edu_onboarding_email_deliveries d WHERE d.application_id=o.application_id AND d.kind=k.kind)
 AND (public.edu_onboarding_email_payload(o.application_id,k.kind)->>'ok')::boolean
 ORDER BY o.confirmed_at,o.application_id,k.kind LIMIT greatest(1,least(coalesce(p_limit,100),100))
$$;

REVOKE ALL ON FUNCTION public.edu_class_occupied(uuid,uuid,uuid),public.edu_validate_onboarding_capacity(),
 public.edu_cancel_onboarding_from_application(),public.edu_onboarding_email_payload(uuid,text) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.edu_confirm_registration(uuid,uuid,text,text,boolean),public.edu_claim_registrations(),
 public.edu_cancel_registration(uuid),public.edu_mark_preparation_received(uuid,uuid,boolean),public.edu_preparation_statuses() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.edu_confirm_registration(uuid,uuid,text,text,boolean),public.edu_claim_registrations(),
 public.edu_cancel_registration(uuid),public.edu_mark_preparation_received(uuid,uuid,boolean),public.edu_preparation_statuses() TO authenticated;
REVOKE ALL ON FUNCTION public.edu_claim_onboarding_email(uuid,text,uuid),public.edu_check_onboarding_email(uuid),
 public.edu_finish_onboarding_email(uuid,text,text),public.edu_onboarding_reminder_candidates(integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.edu_claim_onboarding_email(uuid,text,uuid),public.edu_check_onboarding_email(uuid),
 public.edu_finish_onboarding_email(uuid,text,text),public.edu_onboarding_reminder_candidates(integer) TO service_role;

COMMIT;

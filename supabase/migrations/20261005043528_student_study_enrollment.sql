-- 인증된 학생의 스터디 신청을 기존 등록 승인과 연결한다.
BEGIN;

ALTER TABLE public.edu_classes ADD COLUMN enrollment_open boolean NOT NULL DEFAULT false;
ALTER TABLE public.program_applications ADD COLUMN requested_class_id uuid REFERENCES public.edu_classes ON DELETE RESTRICT;
-- 기존 Parenting 기수의 표시 번호만 정정하며 관계·기수 키·수강 기록은 유지한다.
UPDATE public.edu_cohorts h SET title=regexp_replace(h.title,'^심화과정 201','심화과정 102')
 FROM public.edu_courses c WHERE c.id=h.course_id AND c.code='growth_201'
 AND h.application_cohort_key='growth_201_2026' AND h.title LIKE '심화과정 201%';
CREATE UNIQUE INDEX edu_portal_application_user_cohort ON public.program_applications(user_id,cohort_key)
 WHERE apply_source='education_portal' AND status<>'cancelled';

-- 기존 기수 식별자를 보존하며 이번에 요청된 두 스터디만 모집한다.
UPDATE public.edu_classes k SET enrollment_open=true FROM public.edu_cohorts h JOIN public.edu_courses c ON c.id=h.course_id
 WHERE k.cohort_id=h.id AND h.status<>'completed' AND c.kind='growth'
 AND ((c.code='growth_101' AND h.application_cohort_key='growth_101_2026')
   OR (c.code='growth_201' AND h.application_cohort_key='growth_201_2026'));

CREATE FUNCTION public.edu_application_options() RETURNS TABLE(class_id uuid,course_title text,class_title text,schedule_note text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT k.id,CASE c.code WHEN 'growth_101' THEN '심화과정 101 하위유형 스터디' ELSE '심화과정 102 Parenting 스터디' END,k.title,k.schedule_note
 FROM public.edu_classes k JOIN public.edu_cohorts h ON h.id=k.cohort_id JOIN public.edu_courses c ON c.id=h.course_id
 WHERE auth.uid() IS NOT NULL AND k.enrollment_open AND h.status<>'completed' AND h.application_cohort_key IS NOT NULL
 AND c.kind='growth' AND c.code IN ('growth_101','growth_201') ORDER BY c.code,h.created_at,k.title
$$;

CREATE FUNCTION public.edu_my_applications() RETURNS TABLE(id uuid,class_id uuid,course_title text,class_title text,status text,created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT a.id,a.requested_class_id,CASE c.code WHEN 'growth_101' THEN '심화과정 101 하위유형 스터디' ELSE '심화과정 102 Parenting 스터디' END,k.title,a.status::text,a.created_at
 FROM public.program_applications a JOIN public.edu_classes k ON k.id=a.requested_class_id
 JOIN public.edu_cohorts h ON h.id=k.cohort_id JOIN public.edu_courses c ON c.id=h.course_id
 WHERE a.user_id=auth.uid() AND a.apply_source='education_portal' ORDER BY a.created_at DESC
$$;

CREATE FUNCTION public.edu_request_enrollment(p_class_id uuid,p_display_name text) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE account_email text; k public.edu_classes; h public.edu_cohorts; course_code text; application_id uuid;
BEGIN
 SELECT lower(trim(email)) INTO account_email FROM auth.users WHERE id=auth.uid() AND email_confirmed_at IS NOT NULL FOR SHARE;
 IF account_email IS NULL THEN RAISE EXCEPTION 'edu_verified_account_required' USING ERRCODE='42501'; END IF;
 IF p_display_name IS NULL OR length(trim(p_display_name)) NOT BETWEEN 1 AND 100 THEN RAISE EXCEPTION 'edu_invalid_display_name'; END IF;
 SELECT * INTO k FROM public.edu_classes WHERE id=p_class_id;
 SELECT * INTO h FROM public.edu_cohorts WHERE id=k.cohort_id;
 SELECT code INTO course_code FROM public.edu_courses WHERE id=h.course_id AND kind='growth';
 IF k.id IS NULL OR NOT k.enrollment_open OR h.status='completed' OR h.application_cohort_key IS NULL
  OR course_code IS NULL OR course_code NOT IN ('growth_101','growth_201') THEN RAISE EXCEPTION 'edu_enrollment_closed'; END IF;
 -- 기존 등록 확정과 같은 잠금 순서로 모집 변경과 중복 클릭을 조율한다.
 PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(h.application_cohort_key,0));
 SELECT * INTO k FROM public.edu_classes WHERE id=p_class_id;
 SELECT * INTO h FROM public.edu_cohorts WHERE id=k.cohort_id;
 IF k.id IS NULL OR NOT k.enrollment_open OR h.status='completed' THEN RAISE EXCEPTION 'edu_enrollment_closed'; END IF;
 SELECT id INTO application_id FROM public.program_applications WHERE user_id=auth.uid() AND cohort_key=h.application_cohort_key AND apply_source='education_portal'
  AND status<>'cancelled' ORDER BY created_at LIMIT 1;
 IF application_id IS NOT NULL THEN RETURN application_id; END IF;
 IF EXISTS(SELECT 1 FROM public.edu_enrollments e JOIN public.edu_classes c ON c.id=e.class_id
  WHERE e.user_id=auth.uid() AND c.cohort_id=h.id AND e.role='student' AND e.status IN ('active','completed')) THEN
  RAISE EXCEPTION 'edu_already_enrolled';
 END IF;
 INSERT INTO public.program_applications(program_key,cohort_key,name,contact,user_id,status,source,apply_source,requested_class_id)
 VALUES(course_code,h.application_cohort_key,trim(p_display_name),account_email,auth.uid(),'received','education_portal','education_portal',k.id)
 RETURNING id INTO application_id;
 RETURN application_id;
END $$;

REVOKE ALL ON FUNCTION public.edu_application_options(),public.edu_my_applications(),public.edu_request_enrollment(uuid,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.edu_application_options(),public.edu_my_applications(),public.edu_request_enrollment(uuid,text) TO authenticated;
-- 승인 결과와 실제 반 배정 모두 신청한 반을 따른다. 기존 null 신청은 유지한다.
CREATE FUNCTION public.edu_validate_requested_class() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$BEGIN
 IF EXISTS(SELECT 1 FROM public.program_applications a WHERE a.id=NEW.application_id
  AND a.requested_class_id IS NOT NULL AND a.requested_class_id IS DISTINCT FROM NEW.class_id) THEN
  RAISE EXCEPTION 'edu_requested_class_mismatch';
 END IF;
 RETURN NEW;
END$$;
REVOKE ALL ON FUNCTION public.edu_validate_requested_class() FROM PUBLIC,anon,authenticated,service_role;
CREATE TRIGGER edu_validate_requested_class BEFORE INSERT OR UPDATE ON public.edu_registration_onboarding
 FOR EACH ROW EXECUTE FUNCTION public.edu_validate_requested_class();
CREATE TRIGGER edu_validate_requested_class BEFORE INSERT OR UPDATE ON public.edu_enrollments
 FOR EACH ROW EXECUTE FUNCTION public.edu_validate_requested_class();
COMMIT;

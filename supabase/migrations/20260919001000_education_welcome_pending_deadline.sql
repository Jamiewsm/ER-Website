-- 제출 기한 미정이어도 공개 준비 자료로 초대하되 자동 알림은 확정된 기한을 요구한다.
BEGIN;

CREATE OR REPLACE FUNCTION public.edu_onboarding_email_payload(p_application_id uuid,p_kind text) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$
DECLARE o public.edu_registration_onboarding; l public.edu_lessons; linked_enrollment public.edu_enrollments; result jsonb; welcome_at timestamptz; previous_at timestamptz; days_left integer;
BEGIN
 IF p_kind NOT IN ('welcome','reminder_3d','reminder_1d') OR p_kind IS NULL THEN RETURN jsonb_build_object('ok',false,'reason','invalid_kind'); END IF;
 SELECT * INTO o FROM public.edu_registration_onboarding WHERE application_id=p_application_id;
 SELECT * INTO linked_enrollment FROM public.edu_enrollments WHERE application_id=p_application_id;
 IF o.application_id IS NULL OR o.cancelled_at IS NOT NULL OR NOT EXISTS(
  SELECT 1 FROM public.program_applications a JOIN public.edu_classes c ON c.id=o.class_id JOIN public.edu_cohorts h ON h.id=c.cohort_id
  WHERE a.id=o.application_id AND a.status='confirmed' AND a.cohort_key=h.application_cohort_key AND h.status<>'completed')
  OR (o.claimed_enrollment_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.edu_enrollments e WHERE e.id=o.claimed_enrollment_id AND e.status='active'
    AND e.application_id=o.application_id AND e.class_id=o.class_id))
  OR (linked_enrollment.id IS NOT NULL AND (linked_enrollment.role<>'student' OR linked_enrollment.status<>'active' OR linked_enrollment.class_id<>o.class_id
    OR (o.claimed_enrollment_id IS NULL AND NOT EXISTS(SELECT 1 FROM auth.users WHERE id=linked_enrollment.user_id AND lower(trim(email))=o.email)))) THEN
  RETURN jsonb_build_object('ok',false,'reason','registration_inactive');
 END IF;
 SELECT * INTO l FROM public.edu_lessons WHERE class_id=o.class_id AND kind='preparation';
 IF l.id IS NULL OR l.publish_at IS NULL OR l.publish_at>now() THEN RETURN jsonb_build_object('ok',false,'reason','preparation_not_ready'); END IF;
 IF p_kind<>'welcome' THEN
  IF l.due_at IS NULL OR NOT l.reminders_enabled OR l.due_at<=now() THEN RETURN jsonb_build_object('ok',false,'reason','reminders_inactive'); END IF;
  IF EXISTS(SELECT 1 FROM public.edu_submissions WHERE lesson_id=l.id AND student_enrollment_id=coalesce(o.claimed_enrollment_id,linked_enrollment.id)
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

-- CREATE OR REPLACE preserves the original grants; keep this internal helper private explicitly.
REVOKE ALL ON FUNCTION public.edu_onboarding_email_payload(uuid,text) FROM PUBLIC,anon,authenticated;

COMMIT;

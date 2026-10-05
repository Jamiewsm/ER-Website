-- 실제 수료 시각을 기록하고 1년이 지난 교육 원문 접근과 정리 대상을 관리한다.
BEGIN;
ALTER TABLE public.edu_cohorts ADD COLUMN completed_at timestamptz;
CREATE FUNCTION public.edu_stamp_completion() RETURNS trigger
LANGUAGE plpgsql SET search_path='' AS $$BEGIN
 IF TG_OP='UPDATE' AND OLD.completed_at IS NOT NULL THEN
  NEW.completed_at:=OLD.completed_at;
 ELSIF TG_OP='UPDATE' AND OLD.status='completed' THEN
  -- 기존 완료 과정은 실제 수료일을 보충할 때까지 미확인 상태를 유지한다.
  NEW.completed_at:=NEW.completed_at;
 ELSE
  NEW.completed_at:=CASE WHEN NEW.status='completed' THEN coalesce(NEW.completed_at,now()) ELSE NULL END;
 END IF;
 IF NEW.completed_at>now() THEN RAISE EXCEPTION 'edu_invalid_completion_date'; END IF;
 RETURN NEW;
END$$;
CREATE TRIGGER edu_stamp_completion BEFORE INSERT OR UPDATE ON public.edu_cohorts
 FOR EACH ROW EXECUTE FUNCTION public.edu_stamp_completion();
-- 이미 완료된 과정의 실제 수료일은 계획된 ends_on으로 추정하지 않는다.
CREATE FUNCTION public.edu_record_available(p_enrollment uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT public.edu_is_head() OR EXISTS(
  SELECT 1 FROM public.edu_enrollments e JOIN public.edu_classes c ON c.id=e.class_id
  JOIN public.edu_cohorts cohort ON cohort.id=c.cohort_id
  WHERE e.id=p_enrollment AND (cohort.completed_at IS NULL OR now()<cohort.completed_at+interval '1 year')
 )
$$;
CREATE FUNCTION public.edu_feedback_record_available(p_submission uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT EXISTS(SELECT 1 FROM public.edu_submissions s
  WHERE s.id=p_submission AND public.edu_record_available(s.student_enrollment_id))
$$;
CREATE POLICY edu_retention_window ON public.edu_submissions AS RESTRICTIVE FOR ALL TO authenticated
 USING(public.edu_record_available(student_enrollment_id)) WITH CHECK(public.edu_record_available(student_enrollment_id));
CREATE POLICY edu_retention_window ON public.edu_attendance AS RESTRICTIVE FOR ALL TO authenticated
 USING(public.edu_record_available(student_enrollment_id)) WITH CHECK(public.edu_record_available(student_enrollment_id));
CREATE POLICY edu_retention_window ON public.edu_feedback AS RESTRICTIVE FOR ALL TO authenticated
 USING(public.edu_feedback_record_available(submission_id)) WITH CHECK(public.edu_feedback_record_available(submission_id));
CREATE FUNCTION public.edu_file_retention_available(p_name text) RETURNS boolean
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$DECLARE parts text[]; BEGIN
 parts:=string_to_array(p_name,'/');
 IF parts[1]<>'submission' THEN RETURN true; END IF;
 IF array_length(parts,1)<>3 OR parts[2] !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' THEN RETURN false; END IF;
 RETURN public.edu_feedback_record_available(parts[2]::uuid);
END$$;
CREATE POLICY edu_retention_window ON storage.objects AS RESTRICTIVE FOR ALL TO authenticated
 USING(bucket_id<>'edu-files' OR public.edu_file_retention_available(name))
 WITH CHECK(bucket_id<>'edu-files' OR public.edu_file_retention_available(name));
CREATE FUNCTION public.edu_record_retention_due() RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$BEGIN
 IF NOT public.edu_is_head() THEN RAISE EXCEPTION 'edu_head_required'; END IF;
 RETURN coalesce((SELECT jsonb_agg(to_jsonb(r)) FROM (
  SELECT cohort.id,cohort.title,cohort.completed_at,
   cohort.completed_at+interval '1 year' AS purge_after,
   CASE WHEN cohort.completed_at IS NULL THEN 'completion_date_required'
        WHEN cohort.completed_at+interval '1 year'<=now() THEN 'due' ELSE 'upcoming' END AS state,
   (SELECT count(*) FROM public.edu_submissions s JOIN public.edu_enrollments e ON e.id=s.student_enrollment_id
    JOIN public.edu_classes c ON c.id=e.class_id WHERE c.cohort_id=cohort.id) AS submissions
  FROM public.edu_cohorts cohort WHERE cohort.completed_at IS NOT NULL OR cohort.status='completed'
  ORDER BY cohort.completed_at NULLS FIRST
 ) r),'[]'::jsonb);
END$$;
REVOKE ALL ON FUNCTION public.edu_stamp_completion(),public.edu_record_available(uuid),public.edu_feedback_record_available(uuid),public.edu_file_retention_available(text),public.edu_record_retention_due() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.edu_record_available(uuid),public.edu_feedback_record_available(uuid),public.edu_file_retention_available(text),public.edu_record_retention_due() TO authenticated;
COMMIT;

-- 교육 교실의 반별 정원을 기존 신청 예약에 연결한다. 공개 웹사이트 공지는 변경하지 않는다.
BEGIN;
CREATE OR REPLACE FUNCTION public.admin_prepare_program_application_registration(
  p_id uuid,
  p_cohort_key text,
  p_max_seats integer,
  p_payment_region text,
  p_payment_currency text,
  p_payment_amount_usd numeric DEFAULT NULL,
  p_payment_amount_krw bigint DEFAULT NULL
)
RETURNS public.program_applications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result_row public.program_applications;
  reserved_count integer;
  lock_key text;
  class_capacity integer;
  linked_cohort uuid;
BEGIN
  PERFORM public.require_head_coach();

  SELECT * INTO result_row
  FROM public.program_applications
  WHERE id = p_id
  FOR UPDATE;

  IF result_row.id IS NULL THEN
    RAISE EXCEPTION 'application_not_found' USING ERRCODE = 'P0002';
  END IF;

  IF NULLIF(p_cohort_key,'') IS NOT NULL AND result_row.cohort_key IS NOT NULL AND result_row.cohort_key<>p_cohort_key THEN
    RAISE EXCEPTION 'edu_application_cohort_mismatch';
  END IF;
  lock_key := COALESCE(NULLIF(p_cohort_key, ''), result_row.cohort_key, result_row.program_key);
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(lock_key, 0));

  -- Re-sending a registration notice must not downgrade an already confirmed student.
  IF result_row.status = 'confirmed' AND coalesce(result_row.cohort_key,result_row.program_key) = lock_key THEN
    RETURN result_row;
  END IF;

  SELECT id INTO linked_cohort FROM public.edu_cohorts WHERE application_cohort_key = lock_key;
  IF linked_cohort IS NOT NULL THEN
    SELECT coalesce(sum(capacity),0)::integer INTO class_capacity FROM public.edu_classes WHERE cohort_id = linked_cohort;
  ELSE
    class_capacity := GREATEST(1, p_max_seats);
  END IF;

  IF linked_cohort IS NOT NULL THEN
    reserved_count := public.edu_cohort_occupied(linked_cohort,NULL,p_id);
  ELSE
    SELECT count(*)::integer INTO reserved_count FROM public.program_applications pa
    WHERE pa.id<>p_id AND coalesce(pa.cohort_key,pa.program_key)=lock_key AND pa.status IN ('payment_pending','confirmed');
  END IF;

  IF reserved_count >= class_capacity AND NOT EXISTS(
    SELECT 1 FROM public.edu_enrollments WHERE application_id=p_id AND role='student' AND status IN ('active','completed')
  ) THEN
    UPDATE public.program_applications
    SET status = 'waitlisted', cohort_key = lock_key
    WHERE id = p_id
    RETURNING * INTO result_row;
    RETURN result_row;
  END IF;

  UPDATE public.program_applications
  SET
    status = 'payment_pending',
    cohort_key = lock_key,
    payment_region = p_payment_region,
    payment_currency = p_payment_currency,
    payment_amount_usd = p_payment_amount_usd,
    payment_amount_krw = p_payment_amount_krw
  WHERE id = p_id
  RETURNING * INTO result_row;

  RETURN result_row;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_prepare_program_application_registration(uuid, text, integer, text, text, numeric, bigint) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_prepare_program_application_registration(uuid, text, integer, text, text, numeric, bigint) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_prepare_program_application_registration(uuid, text, integer, text, text, numeric, bigint) TO authenticated;


-- Direct status edits share the same lock/capacity rule as classroom placement and registration notices.
CREATE FUNCTION public.edu_validate_application_seat() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE cohort uuid; cap integer;
BEGIN
 IF TG_OP='UPDATE' AND OLD.cohort_key IS DISTINCT FROM NEW.cohort_key AND EXISTS(SELECT 1 FROM public.edu_enrollments WHERE application_id=NEW.id) THEN
  RAISE EXCEPTION 'edu_application_cohort_mismatch';
 END IF;
 SELECT id INTO cohort FROM public.edu_cohorts WHERE application_cohort_key=NEW.cohort_key;
 IF cohort IS NOT NULL THEN
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(NEW.cohort_key,0));
  IF NEW.status IN ('payment_pending','confirmed') THEN
   SELECT coalesce(sum(capacity),0) INTO cap FROM public.edu_classes WHERE cohort_id=cohort;
   IF public.edu_cohort_occupied(cohort,NULL,NEW.id)>=cap AND NOT EXISTS(SELECT 1 FROM public.edu_enrollments WHERE application_id=NEW.id AND role='student' AND status IN ('active','completed')) THEN
    RAISE EXCEPTION 'edu_cohort_full';
   END IF;
  END IF;
 END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.edu_validate_application_seat() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER edu_application_seat BEFORE INSERT OR UPDATE OF status,cohort_key ON public.program_applications FOR EACH ROW EXECUTE FUNCTION public.edu_validate_application_seat();

-- Public website notice copy is on hold and must not change with portal DB readiness.
-- Review-only draft: supabase/manual/education-public-notices.pending.sql

COMMIT;

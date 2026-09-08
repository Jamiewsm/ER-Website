-- 교육 교실의 반별 정원을 기존 신청 예약에 연결하고 교육 안내를 갱신한다.
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

-- Keep public notices consistent with the approved 2026-2027 education pathway.
UPDATE public.public_notices SET
 summary='기본과정 수료 후 2급 검정과 심화성장101 · 2급 소지 및 101 이수 후 2027 코치 트레이닝 지원',
 body='<p>8주 기본과정을 수료하면 ER에니어그램 전문가 2급 검정에 응시하고 심화성장101에 신청할 수 있습니다. 2급 검정은 2026년 9월 말 온라인 객관식으로 예정되어 있으며 검정료는 3만원입니다. 정확한 날짜는 추후 공지합니다.</p><p>심화성장101은 2026년 10–12월에 열립니다. 고착과 하위유형을 참여와 나눔으로 탐구하며, 주 1회 약 2시간, 수강료 15만원(월 5만원 분납 가능)입니다. 전임사역자 및 사모에게 반액 장학금을 제공합니다.</p><p>2027년 ER 코치 트레이닝 2기는 2급 소지 및 심화성장101 이수 후 지원할 수 있는 전문가 1급 과정입니다. 2–12월 중 9개월 훈련과 5월·9월 휴식으로 구성되며 수강료는 120만원(월 10만원씩 12회 분납 가능)입니다. 전임사역자 및 사모 반액 장학금이 있습니다.</p><p><a href="/#coach_training">전체 과정 안내 보기</a></p>',
 body_is_html=true, program_period='기본과정 · 심화성장 · 2027 코치 트레이닝',updated_at=now()
WHERE legacy_key=1;
UPDATE public.public_notices SET
 summary='10월 첫주 개강 · 반당 학생 7명 · A·B반 운영 예정 · 한국 ₩450,000 / 미국 $330',
 body='<p>2026년 10월 ER 성경적 에니어그램 기본과정은 관계 속에서 드러나는 나를 이해하고 하나님 안에서 본래의 나로 회복되는 8주 온라인 과정입니다.</p><p>10월 첫주 개강 예정이며, 요일과 시간은 참여자와 조율합니다. 반당 학생 7명으로 A·B반 운영을 준비합니다. 멘토는 학생 정원에 포함하지 않으며 같은 반에서 8주를 함께합니다.</p><p>한국 계좌이체 ₩450,000 · 미국 Zelle·Venmo $330. 등록 절차와 분반은 개별 안내합니다.</p><p><a href="/basic-course.html">과정 안내 보기</a> · <a href="/#apply?track=paid&amp;focus=enneagram_basic_october">지금 신청하기</a></p>',
 body_is_html=true,updated_at=now()
WHERE legacy_key=7;

COMMIT;

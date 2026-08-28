-- 2026년 10월 기본과정 기수·결제 선호·메일 발송 이력 분리

ALTER TABLE public.program_applications
  ADD COLUMN IF NOT EXISTS cohort_key text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS payment_region text,
  ADD COLUMN IF NOT EXISTS payment_currency text,
  ADD COLUMN IF NOT EXISTS payment_preference text,
  ADD COLUMN IF NOT EXISTS installment_preference text,
  ADD COLUMN IF NOT EXISTS payment_method text,
  ADD COLUMN IF NOT EXISTS payment_amount_krw bigint,
  ADD COLUMN IF NOT EXISTS receipt_email_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS registration_email_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS graduation_email_sent_at timestamptz;

COMMENT ON COLUMN public.program_applications.cohort_key IS
  '실제 기수 식별자. program_key의 오래된 july 호환값과 분리한다.';
COMMENT ON COLUMN public.program_applications.payment_preference IS
  '신청자가 선택한 희망 결제수단이며 실제 승인된 payment_method와 다를 수 있다.';
COMMENT ON COLUMN public.program_applications.installment_preference IS
  'full, card_installment, split_consult 중 신청 단계 선호값.';

ALTER TABLE public.program_applications
  DROP CONSTRAINT IF EXISTS program_applications_payment_region_check,
  ADD CONSTRAINT program_applications_payment_region_check
    CHECK (payment_region IS NULL OR payment_region IN ('KR', 'OVERSEAS')) NOT VALID,
  DROP CONSTRAINT IF EXISTS program_applications_payment_currency_check,
  ADD CONSTRAINT program_applications_payment_currency_check
    CHECK (payment_currency IS NULL OR payment_currency IN ('KRW', 'USD')) NOT VALID,
  DROP CONSTRAINT IF EXISTS program_applications_payment_preference_check,
  ADD CONSTRAINT program_applications_payment_preference_check
    CHECK (
      payment_preference IS NULL
      OR payment_preference IN ('kr_bank', 'kr_card', 'kakao_pay', 'naver_pay', 'paypal', 'zelle')
    ) NOT VALID,
  DROP CONSTRAINT IF EXISTS program_applications_installment_preference_check,
  ADD CONSTRAINT program_applications_installment_preference_check
    CHECK (
      installment_preference IS NULL
      OR installment_preference IN ('full', 'card_installment', 'split_consult')
    ) NOT VALID,
  DROP CONSTRAINT IF EXISTS program_applications_payment_amount_krw_check,
  ADD CONSTRAINT program_applications_payment_amount_krw_check
    CHECK (payment_amount_krw IS NULL OR payment_amount_krw >= 0) NOT VALID;

ALTER TABLE public.program_applications
  VALIDATE CONSTRAINT program_applications_payment_region_check;
ALTER TABLE public.program_applications
  VALIDATE CONSTRAINT program_applications_payment_currency_check;
ALTER TABLE public.program_applications
  VALIDATE CONSTRAINT program_applications_payment_preference_check;
ALTER TABLE public.program_applications
  VALIDATE CONSTRAINT program_applications_installment_preference_check;
ALTER TABLE public.program_applications
  VALIDATE CONSTRAINT program_applications_payment_amount_krw_check;

-- 10월 모집 공개 이후 들어온 legacy program_key 신청을 새 cohort로 백필한다.
UPDATE public.program_applications
SET cohort_key = 'enneagram_basic_2026_10'
WHERE program_key = 'enneagram_basic_july'
  AND cohort_key IS NULL
  AND created_at >= timestamptz '2026-08-27 00:00:00+09';

CREATE INDEX IF NOT EXISTS program_applications_cohort_key_idx
  ON public.program_applications (cohort_key, created_at DESC)
  WHERE cohort_key IS NOT NULL;

-- 브라우저는 관리자 RPC만 사용하고 테이블 직접 조회는 허용하지 않는다.
REVOKE ALL ON TABLE public.program_applications FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.admin_list_program_applications_by_cohort(
  p_program_key text,
  p_cohort_key text,
  p_limit integer DEFAULT 100
)
RETURNS SETOF public.program_applications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM public.require_head_coach();

  RETURN QUERY
  SELECT *
  FROM public.program_applications pa
  WHERE (p_program_key IS NULL OR pa.program_key = p_program_key)
    AND (p_cohort_key IS NULL OR pa.cohort_key = p_cohort_key)
  ORDER BY pa.created_at DESC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 100), 500));
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_program_applications_by_cohort(text, text, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_list_program_applications_by_cohort(text, text, integer) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_list_program_applications_by_cohort(text, text, integer) TO authenticated;

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
BEGIN
  PERFORM public.require_head_coach();

  SELECT * INTO result_row
  FROM public.program_applications
  WHERE id = p_id
  FOR UPDATE;

  IF result_row.id IS NULL THEN
    RAISE EXCEPTION 'application_not_found' USING ERRCODE = 'P0002';
  END IF;

  lock_key := COALESCE(NULLIF(p_cohort_key, ''), result_row.cohort_key, result_row.program_key);
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(lock_key, 0));

  SELECT count(*)::integer INTO reserved_count
  FROM public.program_applications pa
  WHERE pa.id <> p_id
    AND pa.cohort_key = lock_key
    AND pa.status IN ('payment_pending', 'confirmed');

  IF reserved_count >= GREATEST(1, p_max_seats) THEN
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

-- 공개 공지에 남아 있던 별도 전문가 양성반 모집과 6기 신청 CTA를 정보성 전체 여정으로 교체한다.
UPDATE public.public_notices
SET
  tag = '안내',
  title = 'ER 전문가 과정 안내',
  summary = '에니어그램 기본과정 + 팔로우업 스터디 + 1년 코칭스쿨로 이어지는 전체 훈련 여정',
  body = '<p class="text-gray-600 leading-relaxed break-keep"><strong>ER 전문가 과정</strong>은 별도의 8주 기수 이름이 아닙니다. 에니어그램 기본과정에서 시작해 팔로우업 스터디와 1년 코칭스쿨로 이어지는 전체 훈련 여정을 뜻합니다.</p><div class="mt-6 grid gap-3"><div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"><span class="text-xs font-bold text-gray-500 w-20">1단계</span><span class="text-sm text-gray-700 break-keep">에니어그램 기본과정 8주</span></div><div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"><span class="text-xs font-bold text-gray-500 w-20">2단계</span><span class="text-sm text-gray-700 break-keep">팔로우업 스터디</span></div><div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"><span class="text-xs font-bold text-gray-500 w-20">3단계</span><span class="text-sm text-gray-700 break-keep">1년 코칭스쿨</span></div></div><p class="mt-6"><a href="/#coach_training" class="inline-flex items-center justify-center rounded-full bg-er-dark text-white px-5 py-2.5 text-sm font-bold shadow-soft hover:bg-gray-800 transition-colors">전체 과정 안내 보기</a></p>',
  body_is_html = true,
  program_period = '기본과정 · 스터디 · 1년 코칭스쿨',
  program_target = '기본과정부터 단계적으로 성장하려는 분',
  apply_deadline = NULL,
  updated_at = now()
WHERE legacy_key = 1;

UPDATE public.public_notices
SET
  title = '에니어그램 기본과정 수료 — 7명',
  summary = '기본과정 수료생 7분이 8주 과정을 마치고 다음 단계로 나아갑니다',
  body = '<p class="text-gray-600 leading-relaxed break-keep"><strong>ER 에니어그램 기본과정</strong> 수료를 축하드립니다. 8주 동안 이론과 적용, 멘토링을 함께 걸어온 <strong>7분</strong>이 과정을 마치고 스터디·코칭스쿨 등 다음 여정으로 이어갑니다.</p><p class="mt-4 text-sm text-gray-600 leading-relaxed break-keep">수료생 여러분의 회복 사역을 응원합니다. 앞으로도 ER 공동체 안에서 서로 세워 주는 동역이 이어지기를 바랍니다.</p>',
  body_is_html = true,
  updated_at = now()
WHERE legacy_key = 5;

UPDATE public.public_notices
SET
  summary = '10월 첫주 개강 · 정원 8명 · 한국 ₩450,000부터 / 해외 $330',
  body = '<p class="text-gray-600 leading-relaxed break-keep"><strong>2026년 10월 ER 성경적 에니어그램 기본과정</strong> 모집을 시작합니다. 관계 속에서 드러나는 나를 이해하고, 하나님 안에서 본래의 나로 회복되는 8주 온라인 과정입니다.</p><div class="mt-6 grid gap-3"><div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"><span class="text-xs font-bold text-gray-500 w-20">개강</span><span class="text-sm text-gray-700 break-keep">2026년 10월 첫주 (요일·시간은 참여자와 조율)</span></div><div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"><span class="text-xs font-bold text-gray-500 w-20">정원</span><span class="text-sm text-gray-700 break-keep">8명</span></div><div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"><span class="text-xs font-bold text-gray-500 w-20">구성</span><span class="text-sm text-gray-700 break-keep">8주 · 주 1회 강의 3시간 + 1:1 멘토링 1시간</span></div><div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"><span class="text-xs font-bold text-gray-500 w-20">수강료</span><span class="text-sm text-gray-700 break-keep">한국 계좌이체 ₩450,000 · 카드·간편결제 ₩470,000 · 해외 $330</span></div></div><p class="mt-6 flex flex-wrap gap-3"><a href="/basic-course.html" class="inline-flex items-center justify-center rounded-full bg-er-dark text-white px-5 py-2.5 text-sm font-bold shadow-soft hover:bg-gray-800 transition-colors">과정 안내 보기</a><a href="/#apply?track=paid&focus=enneagram_basic_october" class="inline-flex items-center justify-center rounded-full border border-er-accent/40 bg-er-accentLight/30 px-5 py-2.5 text-sm font-bold text-er-dark hover:border-er-accent transition-colors">지금 신청하기</a></p>',
  body_is_html = true,
  updated_at = now()
WHERE legacy_key = 7;

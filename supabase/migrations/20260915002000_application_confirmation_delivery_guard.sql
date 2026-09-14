-- 통합 등록 안내의 발송 시도를 영속 기록해 결과가 불명확할 때 중복 발송을 차단한다.
BEGIN;
ALTER TABLE public.program_applications
  ADD COLUMN IF NOT EXISTS confirmation_email_attempted_at timestamptz,
  ADD COLUMN IF NOT EXISTS confirmation_email_sent_at timestamptz;

-- 기존 10월 기본과정 접수 안내와 등록 안내는 이미 발송된 것으로 보존한다.
UPDATE public.program_applications
SET confirmation_email_sent_at = COALESCE(registration_email_sent_at, receipt_email_sent_at)
WHERE confirmation_email_sent_at IS NULL
  AND (registration_email_sent_at IS NOT NULL
    OR (program_key = 'enneagram_basic_july'
      AND cohort_key = 'enneagram_basic_2026_10'
      AND receipt_email_sent_at IS NOT NULL));

COMMENT ON COLUMN public.program_applications.confirmation_email_attempted_at IS
  'Resend 호출 전 조건부 UPDATE로 선점한다. 완료 기록이 없으면 운영자가 실제 미발송을 확인하기 전에는 자동으로 지우지 않는다.';
COMMENT ON COLUMN public.program_applications.confirmation_email_sent_at IS
  '통합 등록 안내의 발송 완료 시각. 기존 receipt/registration 발송 시각을 대체하지 않는다.';
COMMIT;

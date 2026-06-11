-- 프로그램 신청 접수·상태 관리 (기본과정 7월 기수 등)

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'program_application_status') THEN
    CREATE TYPE public.program_application_status AS ENUM (
      'received',
      'contacted',
      'payment_pending',
      'confirmed',
      'waitlisted',
      'cancelled'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.program_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  program_key text NOT NULL DEFAULT 'general',
  status public.program_application_status NOT NULL DEFAULT 'received',
  name text NOT NULL,
  contact text NOT NULL,
  category text,
  message text,
  country text,
  preferred_time text,
  enneagram_experience text,
  referral_source text,
  referral_name text,
  covenant_agreed boolean NOT NULL DEFAULT false,
  source text,
  apply_source text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_notes text,
  payment_amount_usd numeric(10, 2),
  confirmed_at timestamptz,
  pre_survey_sent_at timestamptz
);

CREATE INDEX IF NOT EXISTS program_applications_program_key_idx
  ON public.program_applications (program_key, created_at DESC);

CREATE INDEX IF NOT EXISTS program_applications_status_idx
  ON public.program_applications (status, created_at DESC);

CREATE OR REPLACE FUNCTION public.touch_program_applications_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS program_applications_updated_at ON public.program_applications;
CREATE TRIGGER program_applications_updated_at
  BEFORE UPDATE ON public.program_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_program_applications_updated_at();

ALTER TABLE public.program_applications ENABLE ROW LEVEL SECURITY;

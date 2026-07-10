-- PayPal Checkout 결제 연동 (기본과정 7월 — checkout_url·원장 공유)

ALTER TABLE public.program_applications
  ADD COLUMN IF NOT EXISTS stripe_checkout_session_id text,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
  ADD COLUMN IF NOT EXISTS checkout_url text,
  ADD COLUMN IF NOT EXISTS checkout_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz,
  ADD COLUMN IF NOT EXISTS payment_method text,
  ADD COLUMN IF NOT EXISTS paypal_order_id text,
  ADD COLUMN IF NOT EXISTS paypal_capture_id text;

CREATE INDEX IF NOT EXISTS program_applications_paypal_order_idx
  ON public.program_applications (paypal_order_id)
  WHERE paypal_order_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.payment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  application_id uuid REFERENCES public.program_applications(id) ON DELETE SET NULL,
  program_key text NOT NULL,
  provider text NOT NULL DEFAULT 'stripe',
  external_id text NOT NULL,
  amount_usd numeric(10, 2) NOT NULL,
  currency text NOT NULL DEFAULT 'usd',
  customer_email text,
  customer_name text,
  paid_at timestamptz NOT NULL DEFAULT now(),
  raw_metadata jsonb
);

CREATE UNIQUE INDEX IF NOT EXISTS payment_events_provider_external_idx
  ON public.payment_events (provider, external_id);

CREATE INDEX IF NOT EXISTS payment_events_program_key_idx
  ON public.payment_events (program_key, paid_at DESC);

ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.admin_list_payment_events(
  p_program_key text DEFAULT NULL,
  p_limit integer DEFAULT 500
)
RETURNS SETOF public.payment_events
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.require_head_coach();
  RETURN QUERY
  SELECT pe.*
  FROM public.payment_events pe
  WHERE (p_program_key IS NULL OR pe.program_key = p_program_key)
  ORDER BY pe.paid_at DESC
  LIMIT LEAST(GREATEST(p_limit, 1), 1000);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_payment_events(text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_list_payment_events(text, integer) TO authenticated;

-- 헤드 코치용 프로그램 신청 목록·상태 변경 RPC

CREATE OR REPLACE FUNCTION public.admin_list_program_applications(
  p_program_key text DEFAULT NULL,
  p_limit integer DEFAULT 100
)
RETURNS SETOF public.program_applications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.require_head_coach();

  RETURN QUERY
  SELECT *
  FROM public.program_applications pa
  WHERE (p_program_key IS NULL OR pa.program_key = p_program_key)
  ORDER BY pa.created_at DESC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 100), 500));
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_program_application_status(
  p_id uuid,
  p_status public.program_application_status,
  p_admin_notes text DEFAULT NULL,
  p_payment_amount_usd numeric DEFAULT NULL
)
RETURNS public.program_applications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result_row public.program_applications;
BEGIN
  PERFORM public.require_head_coach();

  UPDATE public.program_applications
  SET
    status = p_status,
    admin_notes = COALESCE(p_admin_notes, admin_notes),
    payment_amount_usd = COALESCE(p_payment_amount_usd, payment_amount_usd),
    confirmed_at = CASE
      WHEN p_status = 'confirmed' AND confirmed_at IS NULL THEN now()
      ELSE confirmed_at
    END
  WHERE id = p_id
  RETURNING * INTO result_row;

  IF result_row.id IS NULL THEN
    RAISE EXCEPTION 'application_not_found'
      USING ERRCODE = 'P0002';
  END IF;

  RETURN result_row;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_program_applications(text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_list_program_applications(text, integer) TO authenticated;

REVOKE ALL ON FUNCTION public.admin_update_program_application_status(uuid, public.program_application_status, text, numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_update_program_application_status(uuid, public.program_application_status, text, numeric) TO authenticated;

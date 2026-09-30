-- ChatGPT/Codex status changes must not rewrite a confirmed, cancelled or linked registration.
BEGIN;

CREATE FUNCTION public.er_mcp_update_application_status(
  p_id uuid,
  p_status public.program_application_status
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE current_row public.program_applications;
BEGIN
  PERFORM public.require_head_coach();
  IF p_status NOT IN ('contacted', 'payment_pending', 'waitlisted') THEN
    RAISE EXCEPTION 'mcp_status_not_allowed' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO current_row FROM public.program_applications
  WHERE id = p_id FOR UPDATE;
  IF current_row.id IS NULL THEN
    RAISE EXCEPTION 'application_not_found' USING ERRCODE = 'P0002';
  END IF;
  IF current_row.archived_at IS NOT NULL
    OR current_row.status IN ('confirmed', 'cancelled')
    OR current_row.confirmed_at IS NOT NULL
    OR EXISTS (SELECT 1 FROM public.edu_enrollments WHERE application_id = p_id)
    OR EXISTS (SELECT 1 FROM public.edu_registration_onboarding WHERE application_id = p_id)
  THEN
    RAISE EXCEPTION 'registration_locked' USING ERRCODE = '23514';
  END IF;

  UPDATE public.program_applications SET status = p_status
  WHERE id = p_id RETURNING * INTO current_row;
  RETURN jsonb_build_object('id', current_row.id, 'status', current_row.status,
    'updated_at', current_row.updated_at);
END;
$$;

REVOKE ALL ON FUNCTION public.er_mcp_update_application_status(uuid, public.program_application_status)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.er_mcp_update_application_status(uuid, public.program_application_status)
  TO authenticated;

COMMIT;

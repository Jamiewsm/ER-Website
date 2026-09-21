-- 수석코치가 계정·결제·등록을 보존하면서 신청서를 승인 목록에서 숨기거나 복구한다.
BEGIN;

ALTER TABLE public.program_applications
  ADD COLUMN archived_at timestamptz,
  ADD COLUMN archived_by uuid REFERENCES auth.users(id) ON DELETE RESTRICT,
  ADD CONSTRAINT program_applications_archive_actor_check
    CHECK ((archived_at IS NULL) = (archived_by IS NULL));

COMMENT ON COLUMN public.program_applications.archived_at IS
  '승인 목록에서 삭제한 시각. 신청 취소, 계정 삭제, 교육 등록 철회를 의미하지 않는다.';
COMMENT ON COLUMN public.program_applications.archived_by IS
  '승인 목록에서 삭제한 수석코치. 복구하면 archived_at과 함께 지운다.';

CREATE OR REPLACE FUNCTION public.admin_list_program_applications(
  p_program_key text DEFAULT NULL,
  p_limit integer DEFAULT 100
)
RETURNS SETOF public.program_applications
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  PERFORM public.require_head_coach();
  RETURN QUERY SELECT * FROM public.program_applications pa
  WHERE pa.archived_at IS NULL AND (p_program_key IS NULL OR pa.program_key = p_program_key)
  ORDER BY pa.created_at DESC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 100), 500));
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_program_applications_by_cohort(
  p_program_key text,
  p_cohort_key text,
  p_limit integer DEFAULT 100
)
RETURNS SETOF public.program_applications
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  PERFORM public.require_head_coach();
  RETURN QUERY SELECT * FROM public.program_applications pa
  WHERE pa.archived_at IS NULL AND (p_program_key IS NULL OR pa.program_key = p_program_key)
    AND (p_cohort_key IS NULL OR pa.cohort_key = p_cohort_key)
  ORDER BY pa.created_at DESC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 100), 500));
END;
$$;

CREATE FUNCTION public.admin_list_archived_program_applications(
  p_program_key text DEFAULT NULL,
  p_limit integer DEFAULT 100
)
RETURNS SETOF public.program_applications
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  PERFORM public.require_head_coach();
  RETURN QUERY SELECT * FROM public.program_applications pa
  WHERE pa.archived_at IS NOT NULL AND (p_program_key IS NULL OR pa.program_key = p_program_key)
  ORDER BY pa.archived_at DESC, pa.created_at DESC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 100), 500));
END;
$$;

CREATE FUNCTION public.admin_archive_program_application(p_id uuid)
RETURNS public.program_applications
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE result_row public.program_applications;
BEGIN
  PERFORM public.require_head_coach();
  SELECT * INTO result_row FROM public.program_applications WHERE id = p_id FOR UPDATE;
  IF result_row.id IS NULL THEN RAISE EXCEPTION 'application_not_found' USING ERRCODE = 'P0002'; END IF;
  IF result_row.archived_at IS NULL THEN
    UPDATE public.program_applications SET archived_at = now(), archived_by = auth.uid()
    WHERE id = p_id RETURNING * INTO result_row;
  END IF;
  RETURN result_row;
END;
$$;

CREATE FUNCTION public.admin_restore_program_application(p_id uuid)
RETURNS public.program_applications
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE result_row public.program_applications;
BEGIN
  PERFORM public.require_head_coach();
  SELECT * INTO result_row FROM public.program_applications WHERE id = p_id FOR UPDATE;
  IF result_row.id IS NULL THEN RAISE EXCEPTION 'application_not_found' USING ERRCODE = 'P0002'; END IF;
  IF result_row.archived_at IS NOT NULL THEN
    UPDATE public.program_applications SET archived_at = NULL, archived_by = NULL
    WHERE id = p_id RETURNING * INTO result_row;
  END IF;
  RETURN result_row;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_program_applications(text, integer),
  public.admin_list_program_applications_by_cohort(text, text, integer),
  public.admin_list_archived_program_applications(text, integer),
  public.admin_archive_program_application(uuid), public.admin_restore_program_application(uuid)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_program_applications(text, integer),
  public.admin_list_program_applications_by_cohort(text, text, integer),
  public.admin_list_archived_program_applications(text, integer),
  public.admin_archive_program_application(uuid), public.admin_restore_program_application(uuid)
  TO authenticated;

COMMIT;

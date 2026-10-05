-- ER 가입 완료와 승인된 문서에 대한 목적별 동의·철회 증거를 관리한다.
BEGIN;
-- 전환 중 생성된 Auth 계정이 기존 계정 이관과 가입 트리거 사이에서 누락되지 않게 한다.
LOCK TABLE auth.users IN SHARE ROW EXCLUSIVE MODE;

CREATE TABLE public.er_consent_documents (
 version text PRIMARY KEY CHECK(length(version) BETWEEN 1 AND 80),
 documents jsonb NOT NULL CHECK(jsonb_typeof(documents)='array' AND jsonb_array_length(documents)=6),
 approved_by text NOT NULL CHECK(length(trim(approved_by))>0),
 approved_at timestamptz NOT NULL DEFAULT now(),
 effective_at timestamptz NOT NULL,
 digest text NOT NULL
);
CREATE TABLE public.er_memberships (
 user_id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
 status text NOT NULL CHECK(status IN ('legacy','pending','active')),
 completed_at timestamptz
);
-- 기존 계정의 서비스 접근만 보존한다. 과거 동의를 생성하지 않는다.
INSERT INTO public.er_memberships SELECT id,'legacy',NULL FROM auth.users;
CREATE TABLE public.er_consent_events (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
 purpose text NOT NULL CHECK(purpose IN ('policy_notice','terms_acceptance','privacy_required','news_email','events_email','kakao_messages')),
 action text NOT NULL CHECK(action IN ('acknowledge','accept','agree','reject','withdraw')),
 version text NOT NULL REFERENCES public.er_consent_documents,
 document_digest text NOT NULL,
 recorded_at timestamptz NOT NULL DEFAULT now(),
 source text NOT NULL CHECK(source IN ('email_signup','member_completion','settings')),
 request_id uuid NOT NULL
);
CREATE INDEX er_consent_events_subject ON public.er_consent_events(user_id,purpose,id DESC);
CREATE TABLE public.er_consent_requests (
 user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
 request_id uuid NOT NULL,
 payload jsonb NOT NULL,
 result_revision bigint NOT NULL,
 PRIMARY KEY(user_id,request_id)
);
ALTER TABLE public.er_consent_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.er_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.er_consent_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.er_consent_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.er_consent_documents,public.er_memberships,public.er_consent_events,public.er_consent_requests FROM anon,authenticated,service_role;
REVOKE ALL ON SEQUENCE public.er_consent_events_id_seq FROM anon,authenticated,service_role;
GRANT SELECT,INSERT ON public.er_consent_documents TO service_role;

CREATE FUNCTION public.er_consent_immutable() RETURNS trigger
LANGUAGE plpgsql SET search_path='' AS $$BEGIN RAISE EXCEPTION 'er_consent_immutable'; END$$;
CREATE TRIGGER er_documents_immutable BEFORE UPDATE OR DELETE ON public.er_consent_documents FOR EACH ROW EXECUTE FUNCTION public.er_consent_immutable();
-- Auth 계정 삭제에 따른 FK cascade는 허용하고 직접 수정·삭제는 금지한다.
CREATE FUNCTION public.er_event_immutable() RETURNS trigger
LANGUAGE plpgsql SET search_path='' AS $$BEGIN
 IF TG_OP='DELETE' AND pg_trigger_depth()>1 THEN RETURN OLD; END IF;
 RAISE EXCEPTION 'er_consent_immutable';
END$$;
CREATE TRIGGER er_events_immutable BEFORE UPDATE OR DELETE ON public.er_consent_events FOR EACH ROW EXECUTE FUNCTION public.er_event_immutable();
CREATE FUNCTION public.er_validate_documents() RETURNS trigger
LANGUAGE plpgsql SET search_path='' AS $$DECLARE d jsonb; seen text[] := '{}'; BEGIN
 FOR d IN SELECT value FROM jsonb_array_elements(NEW.documents) LOOP
  IF d->>'purpose' NOT IN ('policy_notice','terms_acceptance','privacy_required','news_email','events_email','kakao_messages')
     OR d->>'purpose' IS NULL OR d->>'purpose'=ANY(seen)
     OR jsonb_typeof(d->'title') IS DISTINCT FROM 'string' OR length(trim(d->>'title'))=0
     OR jsonb_typeof(d->'body') IS DISTINCT FROM 'string' OR length(trim(d->>'body'))<20 THEN
   RAISE EXCEPTION 'er_invalid_documents';
  END IF;
  seen := array_append(seen,d->>'purpose');
 END LOOP;
 NEW.digest := encode(sha256(convert_to(NEW.documents::text,'UTF8')),'hex');
 RETURN NEW;
END$$;
CREATE TRIGGER er_validate_documents BEFORE INSERT ON public.er_consent_documents FOR EACH ROW EXECUTE FUNCTION public.er_validate_documents();

CREATE FUNCTION public.er_consent_catalog() RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT jsonb_build_object('version',version,'digest',digest,'documents',documents,'effective_at',effective_at)
 FROM public.er_consent_documents WHERE effective_at<=now() ORDER BY effective_at DESC,approved_at DESC,version DESC LIMIT 1
$$;
CREATE FUNCTION public.er_membership_active() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT EXISTS(SELECT 1 FROM public.er_memberships WHERE user_id=auth.uid() AND status IN ('legacy','active'))
$$;
CREATE FUNCTION public.er_consent_state() RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$DECLARE result jsonb; BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'er_account_required'; END IF;
 SELECT jsonb_build_object(
  'membership',coalesce((SELECT status FROM public.er_memberships WHERE user_id=auth.uid()),'pending'),
  'revision',coalesce((SELECT max(id) FROM public.er_consent_events WHERE user_id=auth.uid()),0),
  'current',coalesce((SELECT jsonb_agg(to_jsonb(e)) FROM (SELECT DISTINCT ON (purpose) purpose,action,version,document_digest,recorded_at,id FROM public.er_consent_events WHERE user_id=auth.uid() ORDER BY purpose,id DESC) e),'[]'::jsonb),
  'history',coalesce((SELECT jsonb_agg(to_jsonb(e)) FROM (SELECT purpose,action,version,document_digest,recorded_at,source,id FROM public.er_consent_events WHERE user_id=auth.uid() ORDER BY id DESC LIMIT 100) e),'[]'::jsonb)
 ) INTO result;
 RETURN result;
END$$;

-- actor·시각·해시·가입 완료 상태는 클라이언트가 지정할 수 없다.
CREATE FUNCTION public.er_record_consent(p_user uuid,p_payload jsonb,p_source text) RETURNS bigint
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE catalog jsonb; change record; old_event public.er_consent_events; prior public.er_consent_requests;
 revision bigint; request_uuid uuid; body_digest text; membership text;
BEGIN
 IF jsonb_typeof(p_payload) IS DISTINCT FROM 'object' OR
    EXISTS(SELECT 1 FROM jsonb_object_keys(p_payload) k WHERE k NOT IN ('version','changes','request_id','revision')) OR
    jsonb_typeof(p_payload->'changes') IS DISTINCT FROM 'object' OR p_payload->'changes'='{}'::jsonb THEN
  RAISE EXCEPTION 'er_invalid_consent';
 END IF;
 request_uuid := (p_payload->>'request_id')::uuid;
 IF request_uuid IS NULL OR p_source NOT IN ('email_signup','member_completion','settings') THEN RAISE EXCEPTION 'er_invalid_consent'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('er_consent:'||p_user::text,0));
 SELECT * INTO prior FROM public.er_consent_requests WHERE user_id=p_user AND request_id=request_uuid;
 IF FOUND THEN
  IF prior.payload<>p_payload THEN RAISE EXCEPTION 'er_idempotency_conflict'; END IF;
  RETURN prior.result_revision;
 END IF;
 SELECT coalesce(max(id),0) INTO revision FROM public.er_consent_events WHERE user_id=p_user;
 IF (p_payload->>'revision')::bigint IS DISTINCT FROM revision THEN RAISE EXCEPTION 'er_consent_changed'; END IF;
 SELECT status INTO membership FROM public.er_memberships WHERE user_id=p_user FOR UPDATE;
 IF membership IS NULL THEN RAISE EXCEPTION 'er_account_required'; END IF;
 catalog := public.er_consent_catalog();
 FOR change IN SELECT key,value #>> '{}' AS action FROM jsonb_each(p_payload->'changes') LOOP
  IF change.key NOT IN ('policy_notice','terms_acceptance','privacy_required','news_email','events_email','kakao_messages') OR
     (change.key='policy_notice' AND change.action<>'acknowledge') OR
     (change.key='terms_acceptance' AND change.action<>'accept') OR
     (change.key='privacy_required' AND change.action<>'agree') OR
     (change.key IN ('news_email','events_email','kakao_messages') AND change.action NOT IN ('agree','reject','withdraw')) OR change.action IS NULL THEN
   RAISE EXCEPTION 'er_invalid_consent';
  END IF;
  IF change.action='withdraw' THEN
   SELECT * INTO old_event FROM public.er_consent_events WHERE user_id=p_user AND purpose=change.key ORDER BY id DESC LIMIT 1;
   IF old_event.action IS DISTINCT FROM 'agree' THEN RAISE EXCEPTION 'er_no_active_consent'; END IF;
   INSERT INTO public.er_consent_events(user_id,purpose,action,version,document_digest,source,request_id)
   VALUES(p_user,change.key,'withdraw',old_event.version,old_event.document_digest,p_source,request_uuid);
  ELSE
   IF catalog IS NULL OR p_payload->>'version' IS DISTINCT FROM catalog->>'version' THEN RAISE EXCEPTION 'er_policy_unavailable_or_stale'; END IF;
   SELECT encode(sha256(convert_to(d::text,'UTF8')),'hex') INTO body_digest FROM jsonb_array_elements(catalog->'documents') d WHERE d->>'purpose'=change.key;
   INSERT INTO public.er_consent_events(user_id,purpose,action,version,document_digest,source,request_id)
   VALUES(p_user,change.key,change.action,catalog->>'version',body_digest,p_source,request_uuid);
  END IF;
 END LOOP;
 IF membership='pending' THEN
  IF p_source='settings' OR p_payload->'changes'->>'policy_notice' IS DISTINCT FROM 'acknowledge'
    OR p_payload->'changes'->>'terms_acceptance' IS DISTINCT FROM 'accept'
    OR p_payload->'changes'->>'privacy_required' IS DISTINCT FROM 'agree'
    OR (SELECT count(*) FROM jsonb_object_keys(p_payload->'changes'))<>6 THEN
   RAISE EXCEPTION 'er_required_consent_missing';
  END IF;
  UPDATE public.er_memberships SET status='active',completed_at=now() WHERE user_id=p_user;
 END IF;
 SELECT max(id) INTO revision FROM public.er_consent_events WHERE user_id=p_user;
 INSERT INTO public.er_consent_requests VALUES(p_user,request_uuid,p_payload,revision);
 RETURN revision;
END$$;

CREATE FUNCTION public.er_save_consent(p_payload jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$DECLARE source text; BEGIN
 IF NOT EXISTS(SELECT 1 FROM auth.users WHERE id=auth.uid() AND email_confirmed_at IS NOT NULL) THEN RAISE EXCEPTION 'edu_verified_account_required'; END IF;
 SELECT CASE WHEN status='pending' THEN 'member_completion' ELSE 'settings' END INTO source FROM public.er_memberships WHERE user_id=auth.uid();
 PERFORM public.er_record_consent(auth.uid(),p_payload,source);
 RETURN public.er_consent_state();
END$$;
CREATE FUNCTION public.er_signup_consent() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$BEGIN
 INSERT INTO public.er_memberships(user_id,status) VALUES(NEW.id,'pending');
 IF NEW.raw_user_meta_data ? 'er_consent' THEN
  PERFORM public.er_record_consent(NEW.id,NEW.raw_user_meta_data->'er_consent','email_signup');
  -- 메타데이터를 동의 증거나 권한 판단에 사용하지 않는다. 증거는 전용 테이블에만 저장한다.
 END IF;
 RETURN NEW;
END$$;
CREATE TRIGGER er_signup_consent AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.er_signup_consent();

-- 발송 직전 조회용이다. 채널 친구 여부·발송 자체는 별도 운영 시스템에서 검증한다.
CREATE FUNCTION public.er_email_recipients(p_purpose text) RETURNS TABLE(user_id uuid,email text,event_id bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$BEGIN
 IF p_purpose NOT IN ('news_email','events_email') OR p_purpose IS NULL THEN RAISE EXCEPTION 'er_invalid_purpose'; END IF;
 RETURN QUERY SELECT u.id,u.email,e.id FROM auth.users u JOIN public.er_memberships m ON m.user_id=u.id AND m.status IN ('active','legacy')
 JOIN LATERAL(SELECT c.id,c.action FROM public.er_consent_events c WHERE c.user_id=u.id AND c.purpose=p_purpose ORDER BY c.id DESC LIMIT 1) e ON e.action='agree'
 WHERE u.email_confirmed_at IS NOT NULL;
END$$;

CREATE OR REPLACE FUNCTION public.edu_is_head() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT public.er_membership_active() AND EXISTS(SELECT 1 FROM public.coach_profiles WHERE user_id=auth.uid() AND role='head_coach' AND is_active)
$$;
CREATE OR REPLACE FUNCTION public.edu_is_member(p_class uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT public.er_membership_active() AND EXISTS(SELECT 1 FROM public.edu_enrollments WHERE class_id=p_class AND user_id=auth.uid() AND status IN ('active','completed'))
$$;
CREATE OR REPLACE FUNCTION public.edu_can_teach(p_class uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT public.er_membership_active() AND (public.edu_is_head() OR EXISTS(SELECT 1 FROM public.edu_enrollments WHERE class_id=p_class AND user_id=auth.uid() AND role='instructor' AND status='active'))
$$;
CREATE OR REPLACE FUNCTION public.edu_owns_student(p_enrollment uuid,p_active boolean DEFAULT false) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT public.er_membership_active() AND EXISTS(SELECT 1 FROM public.edu_enrollments WHERE id=p_enrollment AND user_id=auth.uid() AND role='student' AND (NOT p_active OR status='active'))
$$;
CREATE OR REPLACE FUNCTION public.edu_is_mentor(p_student uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT public.er_membership_active() AND EXISTS(SELECT 1 FROM public.edu_mentor_assignments a
 JOIN public.edu_enrollments m ON m.id=a.mentor_enrollment_id JOIN public.edu_enrollments e ON e.id=a.student_enrollment_id
 WHERE a.student_enrollment_id=p_student AND m.user_id=auth.uid() AND m.role='mentor' AND m.status='active'
 AND e.status IN ('active','completed') AND e.class_id=m.class_id)
$$;

-- 신규 계정은 동의 완료 전 교육 테이블 직접 접근을 제한한다. 기존 정책과 AND로 적용된다.
DO $$DECLARE t record; BEGIN
 FOR t IN SELECT tablename FROM pg_tables WHERE schemaname='public' AND rowsecurity
  AND (tablename LIKE 'edu\_%' ESCAPE '\' OR tablename LIKE 'coach\_%' ESCAPE '\') LOOP
  EXECUTE format('CREATE POLICY er_membership_required ON public.%I AS RESTRICTIVE FOR ALL TO authenticated USING (public.er_membership_active()) WITH CHECK (public.er_membership_active())',t.tablename);
 END LOOP;
END$$;
CREATE OR REPLACE FUNCTION public.coach_portal_is_head_coach() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT public.er_membership_active() AND EXISTS(SELECT 1 FROM public.coach_profiles WHERE user_id=auth.uid() AND role='head_coach' AND coalesce(is_active,true) IS DISTINCT FROM false)
$$;
-- 기존 head 검증의 에러·권한을 유지하며 가입 완료 검증을 앞에 둔다.
DO $guard$ BEGIN
 IF to_regprocedure('public.require_head_coach()') IS NOT NULL THEN
  ALTER FUNCTION public.require_head_coach() RENAME TO require_head_coach_without_consent;
  REVOKE ALL ON FUNCTION public.require_head_coach_without_consent() FROM PUBLIC,anon,authenticated,service_role;
  EXECUTE $fn$CREATE FUNCTION public.require_head_coach() RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $body$
   BEGIN IF NOT public.er_membership_active() THEN RAISE EXCEPTION 'er_required_consent_missing'; END IF;
   PERFORM public.require_head_coach_without_consent(); END; $body$ $fn$;
  REVOKE ALL ON FUNCTION public.require_head_coach() FROM PUBLIC,anon;
  GRANT EXECUTE ON FUNCTION public.require_head_coach() TO authenticated,service_role;
 END IF;
END $guard$;
-- SECURITY DEFINER 신청 함수에도 같은 서버 검증을 추가한다.
ALTER FUNCTION public.edu_request_enrollment(uuid,text) RENAME TO edu_request_enrollment_without_consent;
REVOKE ALL ON FUNCTION public.edu_request_enrollment_without_consent(uuid,text) FROM PUBLIC,anon,authenticated,service_role;
CREATE FUNCTION public.edu_request_enrollment(p_class_id uuid,p_display_name text) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$BEGIN
 IF NOT public.er_membership_active() THEN RAISE EXCEPTION 'er_required_consent_missing'; END IF;
 RETURN public.edu_request_enrollment_without_consent(p_class_id,p_display_name);
END$$;
ALTER FUNCTION public.edu_claim_registrations() RENAME TO edu_claim_registrations_without_consent;
REVOKE ALL ON FUNCTION public.edu_claim_registrations_without_consent() FROM PUBLIC,anon,authenticated,service_role;
CREATE FUNCTION public.edu_claim_registrations() RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$BEGIN
 IF NOT public.er_membership_active() THEN RAISE EXCEPTION 'er_required_consent_missing'; END IF;
 RETURN public.edu_claim_registrations_without_consent();
END$$;

REVOKE ALL ON FUNCTION public.er_consent_immutable(),public.er_event_immutable(),public.er_validate_documents(),public.er_signup_consent(),public.er_record_consent(uuid,jsonb,text),public.er_consent_catalog(),public.er_membership_active(),public.er_consent_state(),public.er_save_consent(jsonb),public.er_email_recipients(text),public.edu_request_enrollment(uuid,text),public.edu_claim_registrations() FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public.er_consent_catalog() TO anon,authenticated;
GRANT EXECUTE ON FUNCTION public.er_membership_active(),public.er_consent_state(),public.er_save_consent(jsonb),public.edu_request_enrollment(uuid,text),public.edu_claim_registrations() TO authenticated;
GRANT EXECUTE ON FUNCTION public.er_email_recipients(text) TO service_role;
COMMIT;

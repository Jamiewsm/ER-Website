-- 공개 검사 선택형 평가를 실명 실험과 분리하고 서버의 추가 저장만 허용한다.
CREATE TABLE public.diagnostic_result_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  attempt_id uuid NOT NULL,
  revision integer NOT NULL CHECK (revision BETWEEN 0 AND 2147483647),
  result jsonb NOT NULL CHECK (jsonb_typeof(result) = 'object'),
  versions jsonb NOT NULL CHECK (jsonb_typeof(versions) = 'object'),
  variant text NOT NULL CHECK (variant = 'word'),
  rating smallint CHECK (rating BETWEEN 1 AND 5),
  deferred boolean NOT NULL,
  matching_parts text[] NOT NULL DEFAULT '{}',
  mismatching_parts text[] NOT NULL DEFAULT '{}',
  difficulties text[] NOT NULL DEFAULT '{}',
  consent_version text NOT NULL CHECK (consent_version = '2026-09-28-feedback-v1'),
  consent_accepted boolean NOT NULL CHECK (consent_accepted),
  body_fingerprint text NOT NULL CHECK (body_fingerprint ~ '^[a-f0-9]{64}$'),
  challenge_fingerprint text NOT NULL UNIQUE CHECK (challenge_fingerprint ~ '^[a-f0-9]{64}$'),
  UNIQUE (attempt_id, revision),
  CHECK ((deferred AND rating IS NULL) OR (NOT deferred AND rating IS NOT NULL)),
  CHECK (matching_parts <@ ARRAY['core','subtype','wing','description']::text[] AND cardinality(matching_parts) <= 4 AND array_position(matching_parts, NULL) IS NULL),
  CHECK (mismatching_parts <@ ARRAY['core','subtype','wing','description']::text[] AND cardinality(mismatching_parts) <= 4 AND array_position(mismatching_parts, NULL) IS NULL),
  CHECK (NOT matching_parts && mismatching_parts),
  CHECK (difficulties <@ ARRAY['words','context','multiple','none_fit','length','none']::text[] AND cardinality(difficulties) <= 6 AND array_position(difficulties, NULL) IS NULL),
  CHECK (NOT 'none' = ANY(difficulties) OR cardinality(difficulties) = 1)
);

CREATE INDEX diagnostic_result_feedback_created_at_idx ON public.diagnostic_result_feedback(created_at DESC);
COMMENT ON TABLE public.diagnostic_result_feedback IS
  'Opt-in felt agreement only. Client-reported results, not independently verified type. No names, contacts, raw answers or free text. New revisions append; prior rows are preserved.';

ALTER TABLE public.diagnostic_result_feedback ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.diagnostic_result_feedback FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT, INSERT ON TABLE public.diagnostic_result_feedback TO service_role;
-- 공개 역할용 RLS 정책을 만들지 않는다. service_role도 UPDATE/DELETE 권한이 없다.

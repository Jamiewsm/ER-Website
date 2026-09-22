-- 미가입 학생의 멘토와 시간대를 예약하고 기존 계정 연결 시 같은 반의 멘토를 연결한다.
BEGIN;
ALTER TABLE public.edu_registration_onboarding
 ADD COLUMN mentor_enrollment_id uuid REFERENCES public.edu_enrollments ON DELETE RESTRICT,
 ADD COLUMN time_zone text;
ALTER TABLE public.edu_enrollments ADD COLUMN time_zone text;

CREATE FUNCTION public.edu_validate_reserved_mentor() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF NEW.time_zone IS NOT NULL AND NOT EXISTS(SELECT 1 FROM pg_catalog.pg_timezone_names WHERE name=NEW.time_zone) THEN
  RAISE EXCEPTION 'edu_invalid_time_zone';
 END IF;
 IF NEW.mentor_enrollment_id IS NOT NULL AND NOT EXISTS(
  SELECT 1 FROM public.edu_enrollments WHERE id=NEW.mentor_enrollment_id AND class_id=NEW.class_id AND role='mentor' AND status='active') THEN
  RAISE EXCEPTION 'edu_invalid_mentor_assignment';
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER edu_reserved_mentor_validate BEFORE INSERT OR UPDATE ON public.edu_registration_onboarding
 FOR EACH ROW EXECUTE FUNCTION public.edu_validate_reserved_mentor();

-- onboarding의 기존 head 전용 쓰기 경계를 유지한다. 학생이 직접 멘토를 지정할 수 없다.
CREATE FUNCTION public.edu_apply_reserved_mentor() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE student public.edu_enrollments;
BEGIN
 IF NEW.claimed_enrollment_id IS NULL OR NEW.cancelled_at IS NOT NULL THEN RETURN NEW; END IF;
 SELECT * INTO student FROM public.edu_enrollments WHERE id=NEW.claimed_enrollment_id;
 IF student.class_id<>NEW.class_id OR student.role<>'student' OR student.status<>'active' OR student.application_id IS DISTINCT FROM NEW.application_id THEN
  RAISE EXCEPTION 'edu_invalid_reserved_student';
 END IF;
 IF NEW.time_zone IS NOT NULL THEN
  UPDATE public.edu_enrollments SET time_zone=NEW.time_zone WHERE id=student.id AND time_zone IS DISTINCT FROM NEW.time_zone;
 END IF;
 IF NEW.mentor_enrollment_id IS NOT NULL THEN
  INSERT INTO public.edu_mentor_assignments(student_enrollment_id,mentor_enrollment_id)
   VALUES(student.id,NEW.mentor_enrollment_id)
   ON CONFLICT(student_enrollment_id) DO NOTHING;
  -- 실제 멘토 배정은 별도 운영 화면에서 변경 가능하므로 이미 있는 매칭을 덮어쓰지 않는다.
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER edu_reserved_mentor_apply AFTER INSERT OR UPDATE OF claimed_enrollment_id,mentor_enrollment_id,time_zone ON public.edu_registration_onboarding
 FOR EACH ROW EXECUTE FUNCTION public.edu_apply_reserved_mentor();
REVOKE ALL ON FUNCTION public.edu_validate_reserved_mentor(),public.edu_apply_reserved_mentor() FROM PUBLIC,anon,authenticated;
NOTIFY pgrst,'reload schema';
COMMIT;

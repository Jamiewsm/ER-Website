-- B반 11월 수업: 달라스 08:30 고정 (서머타임 종료 후 CST = 14:30Z)
-- A반은 한국시간 기준 유지. 주찬미 멘토 enrollment에 탄자니아 시간대 지정.
DO $$
DECLARE
  n integer;
BEGIN
  UPDATE public.edu_classes
  SET schedule_note='10월 1일 개강 · 매주 목요일 달라스·오스틴 08:30 기준(서머타임 이후에도 동일) · 한국 10월 22:30 / 11월 23:30 · 시애틀 06:30 · 푸네 10월 19:00·11월 20:00 · 탄자니아 10월 16:30·11월 17:30 · Zoom 수업 15분 전 입장 · 회의 ID 840 3722 9090 · 암호 160794'
  WHERE id='84ded1cf-989c-4ec4-89a2-d287ec4795a2' AND title='B반';
  GET DIAGNOSTICS n=ROW_COUNT;
  IF n<>1 THEN RAISE EXCEPTION 'class_changed'; END IF;

  UPDATE public.edu_lessons
  SET starts_at='2026-11-05T14:30:00+00:00', description='강의 및 자료는 해당 주차에 안내합니다.'
  WHERE class_id='84ded1cf-989c-4ec4-89a2-d287ec4795a2' AND position=6 AND title='머리형 I · 두려움, 사고와 안전' AND starts_at IS NULL;
  GET DIAGNOSTICS n=ROW_COUNT;
  IF n<>1 THEN RAISE EXCEPTION 'lesson6_changed'; END IF;

  UPDATE public.edu_lessons
  SET starts_at='2026-11-12T14:30:00+00:00', description='강의 및 자료는 해당 주차에 안내합니다.'
  WHERE class_id='84ded1cf-989c-4ec4-89a2-d287ec4795a2' AND position=7 AND title='머리형 II · 불안을 다루는 서로 다른 전략' AND starts_at IS NULL;
  GET DIAGNOSTICS n=ROW_COUNT;
  IF n<>1 THEN RAISE EXCEPTION 'lesson7_changed'; END IF;

  UPDATE public.edu_lessons
  SET starts_at='2026-11-19T14:30:00+00:00', description='강의 및 자료는 해당 주차에 안내합니다.'
  WHERE class_id='84ded1cf-989c-4ec4-89a2-d287ec4795a2' AND position=8 AND title='종합성찰 발표 및 수료식 · 기본과정을 통해 새롭게 만난 나' AND starts_at IS NULL;
  GET DIAGNOSTICS n=ROW_COUNT;
  IF n<>1 THEN RAISE EXCEPTION 'lesson8_changed'; END IF;

  UPDATE public.edu_enrollments
  SET time_zone='Africa/Dar_es_Salaam'
  WHERE id IN (
    'f204f288-6828-4e30-ad2e-b318ba5556f7',
    '8518a9b4-25ff-46a5-af23-db14f4bb21e3'
  ) AND display_name='주찬미' AND role='mentor';
  GET DIAGNOSTICS n=ROW_COUNT;
  IF n<>2 THEN RAISE EXCEPTION 'chanmi_enrollment_changed'; END IF;
END $$;

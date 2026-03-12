alter table public.public_notices
  add column if not exists program_period text,
  add column if not exists program_target text,
  add column if not exists apply_deadline text;

update public.public_notices
set
  body_is_html = false,
  body = '에니어그램을 "아는 단계"에서 끝내지 않고, 삶과 현장에 적용하는 단계까지 함께 갑니다. 전문가반 5기에서는 기초 이론부터 적용까지 매주 심화 수업과 과제로 훈련하고, 1:1 멘토링과 강의 피드백을 통해 실제 강의·코칭 현장에서 자신 있게 사용할 수 있도록 돕습니다. 수료 후에는 (선택사항) 스터디 그룹과 코칭 실습으로 이어지며, 정식 코치 활동을 준비할 수 있습니다.',
  program_period = '8주',
  program_target = '에니어그램을 단순한 성격 이해를 넘어, 기독교 세계관 안에서 자기 이해와 타인 돌봄(코칭·강의)에 실제로 적용하고자 하는 분',
  apply_deadline = '2025.01.15',
  updated_at = now()
where legacy_key = 1;

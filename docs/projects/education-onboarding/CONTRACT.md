# 등록·사전 준비 연동 계약

## DB와 포털
- edu_lessons.kind = lesson(기본값) 또는 preparation. preparation은 position0, 정규 수업은 position>0. 기존 class_id/position 유일성 유지. due_at timestamptz, reminders_enabled boolean defaultfalse.
- 사전 준비는 반당 하나이며 기존 description/questions/resources에 강의계획안/선택 도움 질문/자유서술 문항을 저장한다. 내용은 공개 전에 운영자가 검토한다.
- edu_registration_onboarding. application_id PK, class_id, email, display_name, payment_confirmed_at, confirmed_at, confirmed_by, claimed_enrollment_id, claimed_at, cancelled_at. SELECT는 수석코치 전용.
- edu_onboarding_email_deliveries. 수석코치가 발송 단계/시각/결과를 읽는다. 이메일 워커와 DB 워커가 정확한 서버 RPC를 직접 조율하고 추가 계약을 기록한다.
- edu_confirm_registration(p_application_id uuid,p_class_id uuid,p_email text,p_display_name text,p_payment_confirmed boolean) -> onboarding row. 수석코치 전용. 실제 과정/기수·반/정원·이메일을 검증하고 신청을 confirmed로 만든다. 같은 승인 반복은 idempotent, 승인 대상 변경은 차단한다. 이 RPC는 메일을 보내지 않는다.
- edu_claim_registrations() -> integer. 로그인한 auth.users의 인증 이메일과 유효한 확정/납부확인 신청을 연결한다. 정원 중복 집계와 취소/철회 후 재가입 방지 포함. 클라이언트는 일반 데이터 조회 전에 호출한다.
- edu_mark_preparation_received(p_enrollment_id uuid,p_lesson_id uuid,p_received boolean) -> submission row. 수석코치 전용 외부 제출 접수 표시. edu_submissions.external_received_at/by 추가. 제출 완료는 submitted_at 또는 external_received_at이며 알림도 중단한다.
- edu_cancel_registration(p_application_id uuid) -> void. 취소 시 연결된 active 학생 접근을 해제하며 기존 제출/기록은 삭제하지 않는다. 상태를 되돌려 자동 재가입시키지 않는다.
- preparation 파일만 제출은 실제 storage.objects bucket edu-files의 submission/{submission.id}/... 객체가 존재해야 한다. 일반 과제의 기존 필수 답변 검사는 유지한다.

## 이메일
- POST education-onboarding-email {application_id}. 수석 JWT를 서버에서 검사. 결제/등록/대상 반과 공개된 준비 자료를 검증한 뒤 영속 발송 선점. 성공 email.id 또는 already_sent, 불확실 시409와 운영 확인 안내.
- 메일에는 등록 과정·반·확정된 일정·제출기한·https://coach.er-coaching.com/education.html 링크·처음 가입/기존 로그인 안내만 담는다. 자동 Auth 계정 생성은 하지 않는다.
- POST education-onboarding-reminders {dry_run:true|false}. 기본dryrun, 서버 전용 X-Education-Reminder-Secret, 서버에서 대상자 선택. 임의 수신자 지정 불가.
- 제출 기한 미정의 공개 준비 자료도 등록 안내에 사용할 수 있다. 메일·포털에는 추후 안내로 표시하며, 알림 활성화에는 확정 기한이 필요하다.
- 마감3일 전/전날 알림은 최대2회, 환영 메일24시간 이후와 마지막 알림24시간 이후에만. 늦은등록에 과거단계 몰아 보내지 않음. 실제 제출/외부접수/취소/등록해제/기수종료는 발송 직전에 검사.
- GitHub Actions UTC00 일일 작업. EDUCATION_REMINDERS_ENABLED=true일 때만 활성, secret 없으면 발송하지 않음. workflow_dispatch 기본dryrun. 운영에서는 backend migration/함수/자료와 포털을 먼저 적용하고 검증한 뒤 별도 활성화한다.

## 소유권
- DB worker. 신규 migrations, DB tests, education test package.
- Email worker. 신규/기존 Edge mail files와 Edge tests, schedule/config, EMAIL_OPERATIONS.md.
- Root. 포털 전체 UI·테스트/캐시/브라우저/문서·통합·PR.

## 이메일 DB RPC 상세
- `edu_claim_onboarding_email(p_application_id uuid,p_kind text,p_actor uuid default null)`은 서비스 역할 전용이다. kind는 `welcome`, `reminder_3d`, `reminder_1d`이며 welcome의 actor는 활성 수석코치여야 한다.
- 성공 응답은 `{ok:true, delivery_id, application_id, recipient, name, course_title, cohort_title, class_title, schedule_note, starts_at, due_at}`이다. 날짜는 timestamptz의 JSON 문자열이며 아직 등록된 정규 수업 시작 시각이 없으면 starts_at은 null이다.
- 실패 응답은 `{ok:false,reason}`이며 기존 발송은 `already_sent`, 미완료·불확실 선점은 `delivery_uncertain`과 기존 delivery_id를 반환한다. 등록·자료·알림 상태에 따라 `registration_inactive`, `preparation_not_ready`, `reminders_inactive`, `already_submitted`, `outside_reminder_window`, `reminder_spacing`을 반환한다.
- `edu_check_onboarding_email(p_delivery_id uuid)`는 선점 상태와 최신 등록·제출 조건을 다시 검사하고 같은 성공 payload를 반환한다. terminal 상태는 `delivery_not_pending`이다.
- `edu_finish_onboarding_email(p_delivery_id uuid,p_provider_id text default null,p_error text default null)`은 void를 반환한다. provider_id와 오류 없음이면 sent, 그 외에는 uncertain으로 확정한다. 선점은 시간이 지나도 재사용하지 않는다.
- `edu_onboarding_reminder_candidates(p_limit integer default 100)`은 `{application_id,kind}[]`를 반환하는 읽기 전용 서비스 RPC이다. 한 번에 최대 100개이며 이미 선점된 후보는 제외한다. Asia/Seoul 날짜 기준 마감 3일 전·전날과 24시간 발송 간격을 적용한다.
- `edu_onboarding_email_deliveries` 필드는 `id, application_id, kind, status, attempted_at, sent_at, finished_at, actor_id, provider_id, error`이다. status는 `claimed`, `sent`, `uncertain`이며 authenticated SELECT는 수석코치만 허용한다.
- `edu_preparation_statuses()`는 수석코치 전용이며 `{enrollment_id,lesson_id,submitted_at,external_received_at}[]`만 반환한다. 외부 접수 표시로 학생의 미제출 초안 본문을 수석에게 공개하지 않는다. `edu_mark_preparation_received` 역시 미제출 row의 answers/question_snapshot을 반환할 때만 비우고 실제 저장값은 보존한다.
- 이미 수석코치가 같은 이메일을 같은 반에 배정한 active 학생은 승인 시 기존 enrollment에 신청만 연결한다. 기존 배정과 신청 예약이 같은 좌석을 두 번 차지하지 않게 한다. withdrawn 멤버는 자동 복구하지 않으며, 좌석 예약까지 해제하려면 명시적인 등록 취소를 사용한다.

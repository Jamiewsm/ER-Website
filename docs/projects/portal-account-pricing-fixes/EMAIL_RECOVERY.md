# 통합 등록 안내 발송 복구

서버는 Resend 호출 전에 `confirmation_email_attempted_at`을 조건부 UPDATE로 기록합니다. 이미 시도한 기록이 있고 `confirmation_email_sent_at`이 비어 있으면 재발송하지 않습니다. Resend의 24시간 중복 방지 키가 만료되어도 이 상태는 자동으로 풀리지 않습니다.

`email_delivery_uncertain`은 아직 발송 중이거나, 제공자 응답 또는 발송 완료 기록 저장에 실패한 경우입니다. `email_sent_record_failed`는 메일 API가 성공했으나 DB에 완료 시각을 저장하지 못한 경우입니다. 사용자가 다시 버튼을 누르는 것으로 재발송되지 않습니다.

운영자는 먼저 Resend Dashboard에서 신청자 주소와 신청 ID의 `application-confirmation/<ID>` 키, 시각을 대조해야 합니다. 이메일 또는 개인정보를 공개 이슈에 붙이지 않습니다.

- 발송이 확인되면 실제 발송 시각을 `confirmation_email_sent_at`과 해당 `receipt_email_sent_at` 또는 `registration_email_sent_at`에 기록합니다. 메일을 다시 보내지 않습니다.
- 진행 중이거나 결과를 확정할 수 없으면 시도 기록을 유지합니다.
- Resend 기록에서 **실제로 발송되지 않았음이 확인된 경우에만** 운영자가 시도 기록을 비운 뒤 관리자 화면의 등록 준비를 다시 실행합니다. 이 단계는 자동화하지 않습니다.

확인 후 수동 복구에 사용하는 SQL 예시입니다. 실제 신청 UUID를 검토해 치환한 다음 운영 권한으로만 실행합니다. 이 문서 작성 중 운영 데이터는 변경하지 않았습니다.

```sql
-- 미발송이 확인된 한 신청에만 재시도를 허용한다.
UPDATE public.program_applications
SET confirmation_email_attempted_at = NULL
WHERE id = 'REPLACE_WITH_APPLICATION_UUID'::uuid
  AND confirmation_email_sent_at IS NULL
  AND registration_email_sent_at IS NULL;
```

실제 발송된 경우에는 위 초기화 쿼리를 사용하지 않습니다. 성공 시각을 복원하는 방법으로 처리합니다. 코드나 템플릿이 바뀌어도 이미 시도한 발송의 결과를 먼저 확인하며, 새 중복 방지 키로 우회하지 않습니다.

심화과정은 실제 `edu_courses`와 해당 과정의 `edu_cohorts.application_cohort_key`가 일치해야만 접수와 금액 안내를 허용합니다. 현재 공개 웹사이트에는 심화 전용 신청폼이 없으므로 이 백엔드 변경만으로 새 모집이나 교실을 만들지 않습니다. 기존 `parenting_workshop` 4주 과정은 심화 3개월 과정으로 변환하지 않습니다.

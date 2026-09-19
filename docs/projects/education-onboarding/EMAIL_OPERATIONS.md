# 교육 등록 안내·미제출 알림 운영

## 발송 흐름

1. 수석코치가 신청자, 신청 이메일, 과정·기수·반을 확인하고 실제 결제 확인 후 등록을 확정한다. 등록 확정 자체는 메일을 보내지 않는다.
2. 해당 반의 사전 준비에 강의계획안·자기관찰보고서 안내를 작성하고 공개한다. 제출 기한이 미정이어도 공개할 수 있으며, 이때 미제출 알림은 끈다.
3. 수석코치가 포털에서 등록 안내 보내기 버튼을 누른다. 서버가 수석코치 권한·유효한 등록·반 배정·공개된 준비 자료를 확인한 뒤 한 번 발송한다.
4. 학생은 메일의 `내 교실 시작하기` 링크를 연다. 처음 참여하면 신청 이메일로 가입하고 인증 메일을 확인한다. 기존 계정이면 같은 이메일로 로그인한다. 인증된 이메일에 확정된 등록이 연결된다. 서버는 Auth 계정을 임의로 만들지 않는다.
5. 강의계획안과 보고서 작성·제출은 포털에서 관리한다. 안내 메일에 보고서 본문, 답변, PDF 첨부를 넣지 않는다.
6. 미제출 자동 알림은 시스템과 반별 설정을 모두 켠 뒤 마감 3일 전과 전날 각각 최대 한 번만 발송한다. 기한과 알림 날짜는 한국 시간 기준이다. 환영 메일 발송 후 최소 24시간, 이전 알림 시도 후 최소 24시간이 지나야 한다. 놓친 날짜를 뒤늦게 몰아서 보내지 않는다.

이전 포털의 `pre_survey` 요청은 `410 new_onboarding_flow_required`로 종료된다. 오래 열린 탭은 새로고침하고 새 등록 확정 화면을 사용한다. 접수·결제 안내와 수료 안내는 기존 경로를 유지한다.

## 적용 순서

- 백엔드 마이그레이션 `20260915003000_education_onboarding.sql`, `20260915003100_education_preparation_submission.sql`, `20260919001000_education_welcome_pending_deadline.sql`을 먼저 검토·적용한다.
- Edge Functions `education-onboarding-email`, `education-onboarding-reminders`, 변경된 `notify-program-application`과 공유 모듈을 배포한다. `supabase/config.toml`에서 수동 안내는 JWT 검증을 켜고 스케줄러는 끈다. 스케줄러는 자체 전용 비밀키를 별도로 검증한다.
- 포털 PR #22의 등록 확정·가입 연결·사전 준비 UI를 적용한다.
- 준비 자료와 신청 이메일을 검토한다. 기한이 미정이면 메일·포털에 추후 안내로 표시하며 임의 날짜를 넣지 않는다. 테스트 환경에서 아래 확인을 마친 뒤 운영 수동 메일을 확인한다.
- 운영 확인을 마친 후 반의 `reminders_enabled`와 저장소 변수 `EDUCATION_REMINDERS_ENABLED`를 켠다. 두 값은 기본적으로 꺼져 있다. 이 PR은 운영 설정을 변경하거나 실제 메일을 발송하지 않는다.

ER-Website의 사이트 배포 워크플로는 Supabase 전용 변경을 자동 배포하지 않는다. 백엔드 마이그레이션·함수 적용은 별도로 확인해야 한다. `main` 병합이나 사이트 CI 성공을 백엔드 적용 증거로 사용하지 않는다.

## 설정

Supabase Edge Function secrets.

| 이름 | 용도 |
| --- | --- |
| `RESEND_API_KEY` | 기존 메일 제공자 키. 비어 있으면 선점 기록을 만들기 전에 중단한다. |
| `APPLICATION_FROM_EMAIL` | 기본 `ER <enrollment@er-coaching.com>`. Resend에서 인증된 발신 주소를 사용한다. |
| `APPLICATION_REPLY_TO` | 기본 `json@er-coaching.com`. 학생 문의를 받는 주소다. |
| `EDUCATION_PORTAL_URL` | 기본 `https://coach.er-coaching.com/education.html`. HTTPS 주소만 허용하며 자격 증명·검색 매개변수·해시는 받지 않는다. |
| `EDUCATION_REMINDER_SECRET` | 새 스케줄러 전용 무작위 비밀값. 학생 JWT나 service-role 키를 재사용하지 않는다. |

GitHub `Jamiewsm/ER-Website` → Settings → Secrets and variables → Actions.

| 종류 | 이름 | 값 |
| --- | --- | --- |
| Variable | `SUPABASE_URL` | 대상 프로젝트의 `https://<project-ref>.supabase.co` 주소. |
| Secret | `EDUCATION_REMINDER_SECRET` | Edge Function에 설정한 전용 값과 동일. |
| Variable | `EDUCATION_REMINDERS_ENABLED` | 검증 전 `false` 또는 미설정. 실제 예약 발송을 시작할 때만 `true`. |

`Education preparation reminders`는 매일 UTC 00:00, 한국 시간 오전 9시에 실행된다. GitHub 예약 실행은 지연될 수 있으므로 분 단위 정시 발송을 보장하지 않는다. 동시 실행은 직렬화하며 각 발송 시도 전에 1초 간격을 둔다. 실패한 네트워크 요청은 재시도하지 않는다. 요청마다 최대 50명을 처리하고 다음 미처리 묶음을 조회하며, 작업당 최대 10묶음에 도달하면 확인이 필요한 실패로 표시한다. 기존 선점 이력은 다음 묶음에서 제외된다.

일부 메일만 실패한 정상 형식의 집계 응답은 후속 묶음을 계속 처리하고, 마지막에 누적 실패 수와 함께 작업을 실패로 표시한다. 성공이 한 건도 없는 실패 묶음, 네트워크 실패 또는 집계 형식이 잘못된 응답은 추가 처리를 중단한다. Resend의 429 응답도 자동 재시도하지 않으며 해당 시도는 불확실 상태로 남겨 중복 방지를 우선한다.

## 발송 없는 확인

Actions → `Education preparation reminders` → Run workflow에서 **dry_run=true**를 유지한다. 활성 변수와 무관하게 실행할 수 있고, 결과에는 수신자 정보 없이 첫 묶음의 대상 수(최대 50명)만 나온다. 선점·발송 기록도 만들지 않는다.

같은 확인을 API로 할 때는 운영자 셸에 이미 주입한 환경변수를 사용한다. 출력이나 문서에 비밀값을 붙여 넣지 않는다.

```bash
curl --silent --show-error --fail-with-body \
  --request POST "$SUPABASE_URL/functions/v1/education-onboarding-reminders" \
  --header "X-Education-Reminder-Secret: $EDUCATION_REMINDER_SECRET" \
  --header 'Content-Type: application/json' \
  --data '{"dry_run":true}'
```

정상 예시는 `{"ok":true,"dry_run":true,"eligible":0}`이다. 대상이 0명이면 공개 시간·알림 허용·기한·24시간 간격·미제출·유효한 등록·이전 발송 기록을 확인한다. 대상 이메일이나 신청 ID를 API에 직접 지정할 수 없다.

## 검증 항목

- 테스트 수석코치가 납부 확인·등록 확정 후 메일 버튼을 직접 누를 때만 안내가 발송되는지 확인한다.
- 미납, 취소, 등록 해제, 종료된 기수, 준비 자료 미공개일 때 차단되는지 확인한다. 기한 미정이면 등록 안내는 허용하고 자동 알림은 차단되는지 확인한다.
- 같은 버튼을 두 번 눌러도 발송이 한 번인지 확인한다. 성공 후에는 `already_sent`로 응답한다.
- 신규 계정의 이메일 인증 이후 해당 반이 표시되는지 확인한다. 다른 이메일의 계정에는 반이 자동 연결되지 않는다.
- 마감 3일 전·전날에만 후보가 되며 제출 완료·외부 접수·취소 이후에는 후보에서 제외되는지 확인한다. 후보 조회 이후 제출되어도 발송 직전 검사에서 중단되어야 한다.
- 테스트 메일의 수신 주소·본문·포털 링크와 Resend의 실제 접수 기록을 확인한다. `200` 또는 `email.id`만으로 수신함 배달까지 확인했다고 판단하지 않는다.
- 자동화 활성화 후 첫 실행의 Actions 결과와 포털 발송 이력을 확인한다. 예약 작업을 멈출 때 저장소 변수를 `false`로 바꾸고 필요한 반의 알림 설정도 끈다.

## 오류와 복구

| 응답 | 의미·조치 |
| --- | --- |
| `503 email_not_configured` | 메일 키 또는 포털 주소 설정을 확인한다. 선점 전 실패하므로 설정 수정 후 같은 버튼을 누를 수 있다. |
| `409 registration_inactive` | 확정·납부 확인·반 연결·등록 취소·기수 종료 상태를 확인한다. |
| `409 preparation_not_ready` | 해당 반의 준비 자료가 존재하고 현재 공개되어 있는지 확인한다. 등록 안내에는 제출 기한이 필수가 아니다. |
| `409 delivery_uncertain` | 이미 시도된 메일의 완료 여부가 불명확하다. 자동 재전송하지 않는다. |
| `502 email_delivery_uncertain` | 제공자 응답을 확인하지 못했다. 실제 발송되었을 수 있으므로 반복 클릭하지 않는다. |
| `500 email_sent_record_failed` | Resend가 접수했으나 완료 기록 저장에 실패했다. 응답의 메일 ID로 제공자 기록을 대조한다. |

`edu_onboarding_email_deliveries`의 `application_id`, `kind`, `id`, `status`, `attempted_at`, `provider_id`와 Resend를 대조한다. 제공자 idempotency 키는 `education-onboarding/<delivery-id>`이다. 중복 방지는 제공자의 제한된 보존 기간에 의존하지 않고 DB의 영속 선점으로 유지한다.

네트워크 오류 후 선점은 자동 해제·만료되지 않는다. 복구 담당자는 실제 제공자 기록을 먼저 확인하고 발송 완료를 확인한 경우에만 이력을 보정한다. 불확실한 기록을 삭제해서 버튼을 다시 활성화하거나 발송 여부를 추정해 다시 보내지 않는다. 확인되지 않는 동안 학생에게 필요한 안내는 운영자가 별도 연락으로 처리한다.

## 로컬 검증

```bash
node --test tests/education-onboarding-email.test.mjs tests/education-registration-notification.test.mjs
```

실제 핸들러와 공유 메일 코드를 실행하되 DB·Resend 경계는 가상 구현을 사용한다. 실제 메일, 계정 생성, 운영 DB 쓰기는 발생하지 않는다. DB의 지급 확인·정원·이메일 연결·D-3/D-1·권한은 `tests/education-onboarding.test.mjs`에서 별도로 검증한다.

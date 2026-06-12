# 7월 기본과정 — 운영 워크플로우 (Phase 2)

## 신청 상태

| 상태 | 의미 | 다음 액션 |
|------|------|-----------|
| `received` | 웹 신청 접수 | **결제 안내 메일** 발송 |
| `contacted` | 1차 연락 완료 (선택) | 결제 안내 메일 발송 |
| `payment_pending` | PayPal·Zelle 결제 안내 발송됨 | 입금 확인 대기 (재발송 가능) |
| `confirmed` | 등록 확정 (입금 확인) | 사전 성찰 메일 (수동 또는 확정 시 함께) |
| `waitlisted` | 정원 초과 대기 | 빈자리 시 연락·환불 검토 |
| `cancelled` | 취소·환불 완료 | — |

## 일일 처리 (헤드 코치)

1. **코치 포털 → 코치 승인** 화면 상단 **7월 기본과정 신청** 목록 확인
2. 신규 접수마다 **결제 안내 메일** 한 번 클릭 (PayPal·Zelle·은행 송금 안내 + 환불 요약)
3. PayPal·Zelle·은행 입금 확인 후 상태를 **등록 확정**으로 변경 (사전 성찰 메일 함께 발송 여부 선택)
4. 강의 요일·시간은 등록자 시간대 조율 후 별도 안내

Stripe 자동 결제는 **사용하지 않습니다** (미국 사업자 등록 없이 Stripe 운영이 어려움).

## 이메일 종류

| 트리거 | 수신자 | 내용 |
|--------|--------|------|
| 신청 접수 (`submit-application`) | 신청자 + json@ | 접수 확인 (24h 내 결제 안내 예고) |
| **결제 안내 메일** (`notify-program-application` · `registration`) | 신청자 | USD 금액·PayPal·Zelle·은행 안내·환불 요약 |
| **등록 확정** (상태 변경 + 선택) | 신청자 | 사전 성찰 Form (`BASIC_COURSE_PRE_SURVEY_URL`) |
| **사전 성찰 메일** 버튼 (수동) | 신청자 | Form 재발송 |
| **수료·양성반 안내** 버튼 | 수료생 | 양성반 6기(9월) CTA + 후기 요청 |

## Supabase 배포 체크리스트

1. 마이그레이션: `20260611160000_*`, `20260611161000_*` (선택: `20260611170000_*` Stripe 컬럼은 미사용 가능)
2. Edge Function 배포: `submit-application`, `notify-program-application` — [EDGE_FUNCTIONS_SETUP.md](./EDGE_FUNCTIONS_SETUP.md)
3. Secrets: `BASIC_COURSE_PAYPAL_EMAIL`, `BASIC_COURSE_ZELLE_EMAIL` / `BASIC_COURSE_ZELLE_PHONE`, `BASIC_COURSE_BANK_INSTRUCTIONS` (선택), `BASIC_COURSE_PRE_SURVEY_URL`, `RESEND_*`
4. 테스트 신청 1건 → 결제 안내 메일 → 입금 확인 → 등록 확정

## Google Form (2단계 사전 성찰)

질문 원문은 [PRE_SURVEY_QUESTIONS.md](./PRE_SURVEY_QUESTIONS.md) 참고. Form URL을 만든 뒤 Supabase secret `BASIC_COURSE_PRE_SURVEY_URL` 에 등록.

## Phase 3 — 수료 시

8주 마지막 주에 **수료·양성반 안내** 메일 버튼으로 6기 안내 발송. 수집된 후기는 `json@er-coaching.com` 또는 Form 응답에서 `basic-course.html` 수료생 이야기 섹션에 반영.

## 입금 기록

코치 포털에서 `payment_amount_usd`·상태로 관리합니다. 필요 시 `payment_events` / `admin_list_payment_events` RPC로 수동 원장을 보완할 수 있습니다.

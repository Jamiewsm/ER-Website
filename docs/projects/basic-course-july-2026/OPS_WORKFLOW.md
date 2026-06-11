# 7월 기본과정 — 운영 워크플로우 (Phase 2)

## 신청 상태

| 상태 | 의미 | 다음 액션 |
|------|------|-----------|
| `received` | 웹 신청 접수 | 확인 메일·결제 안내 발송 |
| `contacted` | 1차 연락 완료 | 결제 안내·질문 응답 |
| `payment_pending` | 결제 대기 | PayPal/Zelle 입금 확인 |
| `confirmed` | 등록 확정 (결제 완료) | **사전 성찰 설문** 메일 발송 |
| `waitlisted` | 정원 초과 대기 | 빈자리 시 연락 |
| `cancelled` | 취소·환불 완료 | — |

## 일일 처리 (헤드 코치)

1. **코치 포털 → 코치 승인** 화면 상단 **7월 기본과정 신청** 목록 확인
2. 신규 접수 시 **결제 안내 메일** 버튼 (또는 자동 발송된 경우 상태만 `payment_pending`으로)
3. 입금 확인 후 상태 **등록 확정** → 사전 성찰 메일 발송 확인
4. 강의 요일·시간은 등록자 시간대 조율 후 별도 안내

## 이메일 종류

| 트리거 | 수신자 | 내용 |
|--------|--------|------|
| 신청 접수 (`submit-application`) | 신청자 + json@ | 접수 확인 또는 결제 안내 (PayPal·Zelle env 설정 시 즉시 결제 안내) |
| **결제 안내 메일** 버튼 | 신청자 | USD 가격, PayPal, Zelle, 환불 요약 |
| **사전 성찰 메일** 버튼 | 신청자 | Google Form 링크 (`BASIC_COURSE_PRE_SURVEY_URL`) |
| **수료·양성반 안내** 버튼 | 수료생 | 양성반 6기(9월) CTA + 후기 요청 |

## Supabase 배포 체크리스트

1. 마이그레이션 적용: `20260611160000_program_applications.sql`, `20260611161000_program_applications_admin_rpc.sql`
2. Edge Function 배포: [EDGE_FUNCTIONS_SETUP.md](./EDGE_FUNCTIONS_SETUP.md)
3. Secrets 설정 후 테스트 신청 1건

## Google Form (2단계 사전 성찰)

질문 원문은 [PRE_SURVEY_QUESTIONS.md](./PRE_SURVEY_QUESTIONS.md) 참고. Form URL을 만든 뒤 Supabase secret `BASIC_COURSE_PRE_SURVEY_URL` 에 등록.

## Phase 3 — 수료 시

8주 마지막 주에 **수료·양성반 안내** 메일 버튼으로 6기 안내 발송. 수집된 후기는 `json@er-coaching.com` 또는 Form 응답에서 `basic-course.html` 수료생 이야기 섹션에 반영.

# 2026년 10월 기본과정 — Supabase 적용 순서

이 문서는 10월 기수 신청 데이터와 자동메일 변경의 운영 적용 순서다. 사이트 merge와 별도로 Supabase migration과 Edge Function 배포가 필요하다.

## 바뀌는 흐름

1. 신청 폼이 `program_key=enneagram_basic_july` 호환값과 `cohort_key=enneagram_basic_2026_10` 실제 기수를 함께 전송한다.
2. `submit-application`이 신청서, 결제 지역·통화·희망 수단·분납 요청을 저장한다.
3. 관리자 알림과 신청자 접수 확인 메일을 자동 발송하고 성공 시간을 `receipt_email_sent_at`에 남긴다.
4. 신청 접수는 현재 신청 인원과 무관하게 계속 저장되며, 접수 단계에서는 정원 수로 폼을 닫지 않는다.
5. 코치가 결제 안내 메일을 누르면 관리자 RPC가 기수 정원 8명을 잠금 상태에서 확인한다.
6. 자리가 있으면 `payment_pending`으로 예약하고, 한국 계좌이체는 ₩450,000, 국내 카드·카카오페이·네이버페이는 ₩470,000, 해외는 $330을 기록한다. 정원이 차면 신청서는 삭제하지 않고 `waitlisted`로 보존한다.
7. 결제 안내, 사전 설문, 수료 메일은 성공한 발송 시간을 각각 기록한다.
8. 수료 메일에는 별도 전문가 기수 신청 링크가 없으며, 전문가 과정이 기본과정 + 스터디 + 1년 코칭스쿨 전체 여정임을 설명한다.

## 적용 순서

1. migration 적용
   - `20260827135419_october_basic_course_cohort_payment_metadata.sql`
2. Edge Function 배포
   - `submit-application` (`verify_jwt=false`)
   - `notify-program-application` (`verify_jwt=true`)
3. secrets 확인
4. 테스트 신청 1건으로 접수·관리자·신청자 메일 확인
5. 코치 포털에서 한국 결제 안내 → 등록 확정 → 사전 설문 순서 확인
6. 해외 테스트 신청으로 USD 안내 확인

Edge Function을 migration보다 먼저 배포하면 새 컬럼 insert가 실패할 수 있으므로 반드시 migration을 먼저 적용한다.

## 필요한 secrets

| 이름 | 용도 |
|---|---|
| `RESEND_API_KEY` | 이메일 발송 |
| `APPLICATION_FROM_EMAIL` | 발신자 |
| `APPLICATION_NOTIFY_EMAIL` | 관리자 신청 알림 수신자 |
| `APPLICATION_REPLY_TO` | 신청자 회신 주소 |
| `TURNSTILE_SECRET_KEY` | 공개 신청 폼 스팸 방지 |
| `BASIC_COURSE_PAYPAL_EMAIL` | 해외 PayPal |
| `BASIC_COURSE_ZELLE_EMAIL` | 해외 Zelle 이메일 |
| `BASIC_COURSE_ZELLE_PHONE` | 해외 Zelle 전화번호 (선택) |
| `BASIC_COURSE_KR_BANK_INSTRUCTIONS` | 한국 원화 계좌 안내 (여러 줄 가능) |
| `BASIC_COURSE_KR_CHECKOUT_URL` | 국내 온라인 결제 URL. 실제 PG 오픈·검증 후에만 설정 |
| `BASIC_COURSE_PRE_SURVEY_URL` | 등록 확정자 사전 성찰 설문 |
| `BASIC_COURSE_TESTIMONIAL_URL` | 수료 후기 URL (선택) |

`EXPERT_COHORT_APPLY_URL`은 더 이상 사용하지 않는다.

## 국내 온라인 결제 활성화 조건

`BASIC_COURSE_KR_CHECKOUT_URL`은 단순 홍보 URL이 아니라 실제 승인·취소·환불이 검증된 결제 URL만 넣는다. 값이 비어 있으면 메일은 원화 계좌이체만 안내하고 카드·카카오페이·네이버페이를 사용 가능하다고 표시하지 않는다.

완전 자동 확정을 도입할 때는 결제 webhook이 다음 정보를 검증한 뒤 신청 상태를 `confirmed`로 변경해야 한다.

- 서버에 저장된 주문번호와 결제사의 주문번호 일치
- 서버 금액과 승인 금액 일치
- 통화 KRW 일치
- 중복 webhook 멱등 처리
- 취소·부분환불 상태 동기화

## 점검 쿼리

```sql
select
  id,
  created_at,
  cohort_key,
  status,
  payment_region,
  payment_currency,
  payment_preference,
  installment_preference,
  payment_amount_krw,
  payment_amount_usd,
  receipt_email_sent_at,
  registration_email_sent_at,
  pre_survey_sent_at,
  graduation_email_sent_at
from public.program_applications
where cohort_key = 'enneagram_basic_2026_10'
order by created_at desc;
```

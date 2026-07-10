# Edge Functions 배포 — 신청·PayPal 결제 (2026-07)

| 함수 | JWT | 역할 |
|------|-----|------|
| `submit-application` | off | 신청 접수 → DB + Resend (신청자·json@) |
| `notify-program-application` | on (헤드 코치) | 결제 안내(PayPal 링크)·사전 성찰·수료 메일 |
| `paypal-webhook` | off | PayPal 결제 완료 → 등록 확정 |
| `capture-paypal-order` | off | PayPal 리턴 URL → 주문 캡처·등록 확정 |

`create-program-checkout`, `stripe-webhook` 은 **사용하지 않습니다**.

대표 필수 작업은 [PAYPAL_SETUP.md](./PAYPAL_SETUP.md) 참고.

## CLI 배포

```bash
supabase functions deploy submit-application --no-verify-jwt
supabase functions deploy notify-program-application
supabase functions deploy paypal-webhook --no-verify-jwt
supabase functions deploy capture-paypal-order --no-verify-jwt
```

## Secrets (Supabase Dashboard → Edge Functions → Secrets)

| Secret | 용도 |
|--------|------|
| `PAYPAL_CLIENT_ID` | PayPal Checkout (Sandbox/Live) |
| `PAYPAL_CLIENT_SECRET` | PayPal API 시크릿 |
| `PAYPAL_MODE` | `sandbox` 또는 `live` |
| `PAYPAL_WEBHOOK_ID` | Webhook 서명 검증 (권장) |
| `RESEND_API_KEY` | 이메일 발송 |
| `APPLICATION_FROM_EMAIL` | 발신 (기본 `ER <enrollment@er-coaching.com>`) |
| `APPLICATION_NOTIFY_EMAIL` | 신규 신청 알림 (기본 `json@er-coaching.com`) |
| `APPLICATION_REPLY_TO` | 회신 주소 |
| `TURNSTILE_SECRET_KEY` | 신청 폼 봇 방지 |
| `BASIC_COURSE_PAYPAL_EMAIL` | PayPal 미연동 시 수동 송금 안내 (fallback) |
| `BASIC_COURSE_ZELLE_EMAIL` | Zelle 이메일 |
| `BASIC_COURSE_ZELLE_PHONE` | Zelle 전화번호 (해당 시) |
| `BASIC_COURSE_BANK_INSTRUCTIONS` | 은행 송금 안내 (선택) |
| `BASIC_COURSE_PRE_SURVEY_URL` | 사전 성찰 Google Form URL |
| `EXPERT_COHORT_APPLY_URL` | 수료·양성반 CTA (선택) |
| `BASIC_COURSE_TESTIMONIAL_URL` | 수료 후기 링크 (선택) |

PayPal Secret이 설정되면 결제 안내 메일에 **PayPal 결제 버튼**이 포함됩니다. Zelle·은행은 선택 fallback.

## 스모크 테스트

1. Sandbox Secret 등록 후 테스트 신청
2. 코치 포털 → **결제 안내 메일**
3. 메일 **PayPal로 $… 결제하기** 버튼 확인
4. Sandbox 구매자로 결제 → **등록 확정** + 사전 성찰 메일

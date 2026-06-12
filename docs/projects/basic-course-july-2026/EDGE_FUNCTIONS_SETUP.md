# Edge Functions 배포 — 신청·수동 결제 안내 (Phase 2)

| 함수 | JWT | 역할 |
|------|-----|------|
| `submit-application` | off | 신청 접수 → DB + Resend (신청자·json@) |
| `notify-program-application` | on (헤드 코치) | 결제 안내·사전 성찰·수료 메일 |

`create-program-checkout`, `stripe-webhook` 은 배포되어 있어도 **사용하지 않습니다**. Stripe 미사용 정책 (2026-06-12).

## CLI 배포 (선택)

```bash
supabase functions deploy submit-application --no-verify-jwt
supabase functions deploy notify-program-application
```

## Secrets (Supabase Dashboard → Edge Functions → Secrets)

| Secret | 용도 |
|--------|------|
| `RESEND_API_KEY` | 이메일 발송 |
| `APPLICATION_FROM_EMAIL` | 발신 (기본 `ER <enrollment@er-coaching.com>`) |
| `APPLICATION_NOTIFY_EMAIL` | 신규 신청 알림 (기본 `json@er-coaching.com`) |
| `APPLICATION_REPLY_TO` | 회신 주소 |
| `TURNSTILE_SECRET_KEY` | 신청 폼 봇 방지 |
| `BASIC_COURSE_PAYPAL_EMAIL` | 결제 안내 메일 — PayPal (기본 `json@er-coaching.com`) |
| `BASIC_COURSE_ZELLE_EMAIL` | Zelle 이메일 (기본 `campus.12000@gmail.com`) |
| `BASIC_COURSE_ZELLE_PHONE` | Zelle 전화번호 (해당 시) |
| `BASIC_COURSE_BANK_INSTRUCTIONS` | 은행 송금 안내 (여러 줄 텍스트, 선택) |
| `BASIC_COURSE_PRE_SURVEY_URL` | 사전 성찰 Google Form URL |
| `EXPERT_COHORT_APPLY_URL` | 수료·양성반 CTA (선택) |
| `BASIC_COURSE_TESTIMONIAL_URL` | 수료 후기 링크 (선택) |

PayPal·Zelle·은행 계좌는 **Secrets에만** 넣고, 공개 페이지에는 “PayPal·Zelle 가능” 정도만 안내합니다.

## 스모크 테스트

1. `test.html` 또는 `/#apply?focus=enneagram_basic_july` 로 테스트 신청
2. 코치 포털 → **결제 안내 메일**
3. 메일에 PayPal·Zelle 안내 확인
4. 입금 확인 후 상태 **등록 확정** + 사전 성찰 메일

# Edge Functions 배포 — 신청·메일 (Phase 2)

## 함수

| 함수 | 역할 |
|------|------|
| `submit-application` | 신청 DB 저장 + 관리자 알림 + 신청자 접수/결제 안내 메일 |
| `notify-program-application` | 헤드 코치: 결제 안내·사전 성찰·수료 안내 메일 수동 발송 |

## Supabase CLI

```bash
cd "/path/to/ER-Website"
supabase link --project-ref osdynbadhtfgoxilgmpy
supabase db push
supabase functions deploy submit-application --no-verify-jwt
supabase functions deploy notify-program-application
```

`submit-application` 은 Turnstile 검증만 하고 JWT는 사용하지 않으므로 `--no-verify-jwt` 가 일반적입니다. (대시보드에서 Verify JWT 끄기와 동일)

## Secrets (Dashboard → Edge Functions → Secrets)

| Key | 설명 |
|-----|------|
| `RESEND_API_KEY` | Resend API 키 |
| `APPLICATION_FROM_EMAIL` | 예: `ER <enrollment@er-coaching.com>` (Resend verified domain) |
| `APPLICATION_NOTIFY_EMAIL` | 관리자 수신 (기본 json@er-coaching.com) |
| `APPLICATION_REPLY_TO` | 회신 주소 |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret |
| `PAYPAL_BUSINESS_EMAIL` | PayPal Business 이메일 |
| `ZELLE_CONTACT` | Zelle 이메일 또는 전화 |
| `BASIC_COURSE_PRE_SURVEY_URL` | Google Form URL |
| `BASIC_COURSE_TESTIMONIAL_URL` | 후기 Form 또는 mailto URL (선택) |
| `EXPERT_COHORT_APPLY_URL` | 양성반 신청 링크 (기본 `https://er-coaching.com/#apply?track=paid`) |

`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY` 는 배포 시 자동 주입됩니다.

## Resend 도메인

`er-coaching.com` 발신 도메인을 Resend에서 verify 한 뒤 `APPLICATION_FROM_EMAIL` 을 설정하세요.

## 테스트

1. `test.html` 또는 `/#apply?focus=enneagram_basic_july` 에서 테스트 신청
2. `program_applications` 테이블에 row 생성 확인
3. 관리자·신청자 메일 수신 확인
4. 코치 포털 → 코치 승인 → 상태 변경·메일 버튼 테스트

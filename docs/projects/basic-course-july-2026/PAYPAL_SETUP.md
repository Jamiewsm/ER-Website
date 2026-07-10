# PayPal Checkout — 대표가 직접 하는 작업 (Secrets만)

아래 **2가지**만 하시면 됩니다. DB·Function 배포·사이트 PR은 개발 쪽에서 처리합니다.

---

## 1. Supabase Secrets 등록 (필수)

### 어디서?

1. [https://supabase.com/dashboard](https://supabase.com/dashboard) 로그인
2. 프로젝트 **ER Website** (`osdynbadhtfgoxilgmpy`) 선택
3. 왼쪽 **Edge Functions** → 상단 **Secrets**
4. **Add new secret** 으로 아래 3개 추가

**바로가기 (로그인 후).**  
[https://supabase.com/dashboard/project/osdynbadhtfgoxilgmpy/functions/secrets](https://supabase.com/dashboard/project/osdynbadhtfgoxilgmpy/functions/secrets)

| Secret 이름 | 값 |
|-------------|-----|
| `PAYPAL_CLIENT_ID` | PayPal Developer Sandbox **API 키** |
| `PAYPAL_CLIENT_SECRET` | Sandbox **시크릿 번호** |
| `PAYPAL_MODE` | `sandbox` |

> 시크릿은 Git·채팅에 붙여넣지 마세요.

---

## 2. PayPal Webhook ID (Function 배포 후)

1. [PayPal Developer](https://developer.paypal.com/dashboard/) → Sandbox 앱 → **Webhooks** → Add
2. URL: `https://osdynbadhtfgoxilgmpy.supabase.co/functions/v1/paypal-webhook`
3. 이벤트: `CHECKOUT.ORDER.APPROVED`, `PAYMENT.CAPTURE.COMPLETED`
4. **Webhook ID** → Supabase Secrets에 `PAYPAL_WEBHOOK_ID` 로 추가 (같은 Secrets 화면)

---

## 개발 쪽 처리 (대표 작업 아님)

- `node scripts/apply_paypal_migration.mjs`
- `node scripts/deploy_paypal_edge_functions.mjs`
- PR merge → `basic-course-payment.html` 배포

## Live 전환 시

Live Client ID·Secret으로 Secrets 교체, `PAYPAL_MODE=live`, Live Webhook 재등록.

# PayPal Checkout — 대표가 직접 하는 작업 (Secrets만)

> **일시 중지 (2026-07-10)** — PayPal Business 은행 계좌 연결이 되지 않아 Live/실결제 연동을 중단했습니다.  
> 코드·PR(#90)·Sandbox Edge Function·Secrets는 그대로 두었습니다. 은행 연결이 되면 이 문서의 Webhook → Sandbox 테스트 → Live 순으로 재개하면 됩니다.  
> 당분간 운영은 기존처럼 **수동 PayPal·Zelle 송금 안내**를 사용합니다.

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

```bash
export SUPABASE_ACCESS_TOKEN=...
node scripts/apply_paypal_migration.mjs   # 최초 1회
node scripts/deploy_paypal_edge_functions.mjs
```

`deploy_paypal_edge_functions.mjs` 는 Supabase CLI (`--use-api`) 로 배포합니다.

## Live 전환 시

Live Client ID·Secret으로 Secrets 교체, `PAYPAL_MODE=live`, Live Webhook 재등록.

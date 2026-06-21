# Deployment Safety Guardrail

ER Website 배포 사고(landing regression, 오래된 branch 일괄 deploy, test rollback)를 막기 위한 운영 절차다.

**Live state SSOT:** [DEPLOY_LEDGER.md](./DEPLOY_LEDGER.md) — 배포 전·후 반드시 갱신.

---

## 1. 원칙

1. **Production은 git에서 추적 가능해야 한다.** 수동 deploy 후에도 `main` merge 또는 ledger 갱신으로 남긴다.
2. **에이전트·로컬에서 `wrangler deploy` 금지.** 예외는 사용자가 명시한 1회성 복구뿐이다. (Codex / Claude / Cursor 서브 세션 포함)
3. **Test 작업 시 branch 전체를 production에 덮어쓰지 않는다.** landing/menu/home은 live production 기준을 유지하고, test runtime allowlist만 overlay한다.
4. **`main` merge = full site deploy** (Cloudflare Pages)가 켜져 있으면, test-only로 live에 올려 둔 runtime도 **legacy main 내용으로 덮일 수 있다.** test 변경은 merge와 deploy 순서를 ledger에 맞춘다.

---

## 2. Deploy track 분리

| Track | 대상 | merge 후 deploy |
|-------|------|-----------------|
| **Site** | `index.html`, `js/sections/home.js`, child-type-test shell, apply, home assets | `main` full deploy (CI 전환 예정) |
| **Test runtime** | 아래 allowlist | **test-only bundle** (§3) |
| **Supabase Edge** | `supabase/functions/*` | Supabase CLI — wrangler 와 혼합 금지 |

PR 규칙: **site PR과 test PR을 한 PR에 넣지 않는다.**

---

## 3. Test-only deploy bundle

스크립트: `scripts/build_test_only_deploy_bundle.mjs` (PR #59 / `codex/er-test-quality-confidence-v2` merge 후 `main`에 존재)

```bash
node scripts/build_test_only_deploy_bundle.mjs \
  --base /path/to/current-live-base-snapshot \
  --source . \
  --out /path/to/deploy-bundle \
  --site https://er-coaching.com
```

스크립트가 강제하는 것.

- `https://er-coaching.com/index.html` → bundle `index.html` (live landing 보존)
- `https://er-coaching.com/js/sections/home.js` → bundle `js/sections/home.js`
- Cloudflare `static.cloudflareinsights.com/beacon.min.js` injection 제거
- 아래 allowlist만 `--source`에서 overlay

### Test runtime allowlist

- `test.html`
- `css/test.css`
- `js/test.js`
- `js/diagnostic-experiment.js`
- `js/diagnostic-report-content.js`
- `js/report-support-materials.js`
- `test-results/background.png`
- `test-results/background_card.png`
- `test-results/background_vase.png`
- `test-results/backgrdound_road.png`

### Dry-run and deploy

```bash
cd /path/to/deploy-bundle
npx --yes wrangler@latest deploy --dry-run
npx --yes wrangler@latest deploy
```

배포 주체: **GitHub Actions `Deploy Production` workflow** 만. 완료 후 ledger job이 [DEPLOY_LEDGER.md](./DEPLOY_LEDGER.md) 갱신.

다른 AI 배포 요청: [DEPLOY_REQUEST_PROTOCOL.md](./DEPLOY_REQUEST_PROTOCOL.md)

---

## 4. Post-deploy verification

스크립트: `scripts/verify_live_test_deploy.mjs`

```bash
node scripts/verify_live_test_deploy.mjs --site https://er-coaching.com
```

확인 항목.

- Landing/menu: `유형검사`, `프리미엄 검사`, `child-type-test/child-type-test.html`
- Home assets: `home-parent-child-photo.jpg`, `home-couple-photo.jpg`, `home-team-photo.jpg`, `hands and green.png`, `green and seat.png`
- Premium test markers (PR #59 merge 후): `buildResponseQualitySnapshot`, `buildConfidenceExplanation`, `tb_2_9_1`, `er-report-application-map`
- Experiment: `buildExperimentAnalyticsPayload`, `experiment_payload`, `feedback_detail`
- CSS: `background_vase.png`, `er-report-application-map`
- Child type page minimum size

**legacy test가 live인 동안** premium marker 검증은 실패한다. ledger의 Test runtime fingerprint와 함께 해석한다.

---

## 5. Regression test

```bash
node --test tests/deploy-safety.test.mjs
```

- bundle builder가 source landing을 배포하지 않는지
- verifier가 필수 marker 누락을 fail로 잡는지
- HTTP redirect follow (production `test.html` → `/test` 등)

---

## 6. 적용 기준 (이 절차 필수)

다음 파일을 production에 반영할 때.

- `js/test.js`, `css/test.css`, `test.html`
- `js/diagnostic-experiment.js`, `js/diagnostic-report-content.js`, `js/report-support-materials.js`
- `test-results/*`

Landing, menu, home, child-type-test IA를 함께 바꾸는 작업은 **Site track** 별도 PR → full deploy.

---

## 7. merge 순서 (test rollback 방지)

프리미엄 test처럼 `main`보다 앞선 runtime을 live에 올려 둔 경우.

1. feature branch를 `main`에 merge (git = intended runtime)
2. **즉시** test-only bundle deploy (또는 CI test track deploy)
3. `verify_live_test_deploy.mjs` + ledger 갱신
4. 그 다음 site-only PR merge

`main` merge만 하고 test-only deploy를 생략하면 **full auto-deploy가 legacy test로 덮어쓴다.**

---

## 8. 관련 문서

- [DEPLOY_LEDGER.md](./DEPLOY_LEDGER.md)
- [MAIN_AGENT.md](./MAIN_AGENT.md)
- [../AGENTS.md](../../AGENTS.md)

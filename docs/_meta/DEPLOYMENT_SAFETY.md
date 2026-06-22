# Deployment Safety Guardrail

ER Website 배포 사고(landing regression, 오래된 branch 일괄 deploy, **legacy test rollback**)를 막기 위한 운영 절차다.

**Live state SSOT:** [DEPLOY_LEDGER.md](./DEPLOY_LEDGER.md) — 배포 전·후 반드시 갱신.

---

## 1. 원칙

1. **Production은 git에서 추적 가능해야 한다.** 수동 deploy 후에도 `main` merge 또는 ledger 갱신으로 남긴다.
2. **에이전트·로컬에서 `wrangler deploy` 금지.** 예외는 사용자가 명시한 1회성 복구뿐이다. (Codex / Claude / Cursor 서브 세션 포함)
3. **Test 작업 시 branch 전체를 production에 덮어쓰지 않는다.** landing/menu/home은 live production 기준을 유지하고, test runtime allowlist만 overlay한다.
4. **Site deploy는 live test runtime을 덮어쓰지 않는다.** `build_site_only_deploy_bundle.mjs`가 live test 파일을 보존한다.
5. **`main` full deploy = legacy test 위험.** repo의 `js/test.js`는 premium이지만, site full deploy가 test path를 올리면 rollback된다. `.assetsignore` + site-only bundle + CI 순서로 차단한다.
6. **Repo `main`에는 legacy test marker가 있으면 안 된다.** `tests/premium-test-guard.test.mjs`가 CI에서 fail한다.

---

## 2. Deploy track 분리

| Track | 대상 | deploy 방법 |
|-------|------|-------------|
| **Site** | `index.html`, `js/sections/home.js`, child-type-test shell, apply, home assets | `build_site_only_deploy_bundle.mjs` → wrangler (live test **보존**) |
| **Test runtime** | 아래 allowlist | `build_test_only_deploy_bundle.mjs` → wrangler (live landing **보존**) |
| **Supabase Edge** | `supabase/functions/*` | Supabase CLI — wrangler 와 혼합 금지 |

PR 규칙: **site PR과 test PR을 한 PR에 넣지 않는다.**

SSOT: `scripts/deploy-tracks.mjs` (`TEST_RUNTIME_ALLOWLIST`, `PREMIUM_TEST_REQUIRED_MARKERS`, `LEGACY_TEST_FORBIDDEN_MARKERS`)

---

## 3. Test-only deploy bundle

```bash
node scripts/build_test_only_deploy_bundle.mjs \
  --base /path/to/current-live-base-snapshot \
  --source . \
  --out /path/to/deploy-bundle \
  --site https://er-coaching.com
```

- live `index.html` / `js/sections/home.js` 보존
- Cloudflare beacon injection 제거
- `--source`에서 test runtime allowlist만 overlay

### Test runtime allowlist

- `test.html`, `css/test.css`, `js/test.js`
- `js/diagnostic-experiment.js`, `js/diagnostic-report-content.js`, `js/report-support-materials.js`
- `test-results/background.png`, `background_card.png`, `background_vase.png`, `backgrdound_road.png`

---

## 4. Site-only deploy bundle (legacy test rollback 방지)

```bash
node scripts/build_site_only_deploy_bundle.mjs \
  --source . \
  --out /path/to/deploy-bundle \
  --site https://er-coaching.com
```

- `--source`의 site 파일만 배포
- live production에서 test runtime allowlist 전체를 **그대로 복사** (source의 legacy `js/test.js`는 절대 올라가지 않음)
- CI `deploy-site` job은 이 bundle만 사용

### `.assetsignore`

로컬/실수 full wrangler deploy 시 test path 업로드 차단.

---

## 5. Premium test guard (repo + live)

### Repo CI

```bash
node --test tests/premium-test-guard.test.mjs
```

- `js/test.js`에 premium marker 필수
- legacy triad item (`id:'t2'`, `t5`, `t8`) 금지

### Live / post-deploy

```bash
node scripts/check_premium_test_markers.mjs --url https://er-coaching.com/js/test.js
node scripts/verify_live_test_deploy.mjs --site https://er-coaching.com
```

**현재 live가 legacy인 경우** premium marker 검증은 실패한다. test track deploy로 복구 후 ledger 갱신.

---

## 6. Dry-run and deploy

```bash
cd /path/to/deploy-bundle
npx --yes wrangler@latest deploy --dry-run
npx --yes wrangler@latest deploy
```

배포 주체: **GitHub Actions `Deploy Production` workflow** (`deploy-test` → `deploy-site` 순서).  
에이전트 요청: [DEPLOY_REQUEST_PROTOCOL.md](./DEPLOY_REQUEST_PROTOCOL.md)

---

## 7. Regression test

```bash
node --test tests/deploy-safety.test.mjs tests/premium-test-guard.test.mjs
```

- test-only bundle이 landing을 보존하는지
- site-only bundle이 live test를 보존하는지
- verifier + premium guard가 marker 누락/legacy를 fail로 잡는지

---

## 8. merge 순서 (test rollback 방지)

프리미엄 test를 live에 유지하려면.

1. premium test + guard PR을 `main`에 merge (git = intended runtime)
2. **즉시** test track deploy (`node scripts/submit_deploy_request.mjs --track test --by …`)
3. `verify_live_test_deploy.mjs` + ledger 갱신
4. 그 다음 site track deploy (site-only bundle — test 덮어쓰기 없음)

`main` merge만 하고 test deploy를 생략하거나, site full deploy를 쓰면 **legacy test rollback** 가능.

---

## 9. 관련 문서

- [DEPLOY_LEDGER.md](./DEPLOY_LEDGER.md)
- [MAIN_AGENT.md](./MAIN_AGENT.md)
- [../AGENTS.md](../../AGENTS.md)

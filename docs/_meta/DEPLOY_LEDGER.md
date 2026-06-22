# Deploy Ledger — Live state SSOT

이 문서는 **er-coaching.com 에 실제로 올라가 있는 상태**를 기록한다.  
Git `main`, feature branch, 수동 wrangler deploy 가 서로 다를 수 있으므로, **배포·머지·롤백 전에 반드시 이 표를 먼저 읽는다.**

**갱신 규칙:** production deploy가 끝날 때마다 Cursor Cloud **메인 에이전트**가 같은 PR 또는 follow-up commit으로 이 파일을 갱신한다. Codex·Claude·로컬 Cursor 세션은 이 파일을 **읽기만** 한다.

---

## Live state (마지막 확인: 2026-06-22)

| Surface | Git ref (의도) | Live SHA / fingerprint | Deployed at (UTC) | Method | Notes |
|---------|----------------|------------------------|-------------------|--------|-------|
| **Site** (landing, menu, home, child-type-test shell) | `origin/main` @ `9b2339a` | 새 로고 24,903B, `home.js` mid-section logo 없음 | 2026-06-22 | wrangler site-only bundle (local OAuth) | PR #66 merge 후 복구 deploy |
| **Test runtime** | `origin/main` @ `9b2339a` | `js/test.js` SHA-256 `81f85306428c…` (premium, `buildResponseQualitySnapshot`) | 2026-06-22 | wrangler test-only bundle (local OAuth) | legacy `t2` triad 없음 |
| **Supabase Edge** | `main` / 별도 branch | (미기록) | — | `supabase functions deploy` | 웹 wrangler deploy 와 **분리** |

### Drift 요약

- **Site + Test runtime:** 2026-06-22 local wrangler bundle deploy로 `main` (#66)과 live 동기화됨.
- **CI deploy:** GitHub Secrets `CLOUDFLARE_API_TOKEN` 아직 없음 → Actions deploy는 secret 설정 후 사용.
- **과거 사고 패턴:** full deploy / `.assetsignore` test 제외로 test 404 가능 → bundle prune + assetsignore 수정 (#67).

---

## Deploy tracks (경로 분리)

| Track | 경로 prefix | Git source | Deploy 방식 | Ledger 컬럼 |
|-------|-------------|------------|-------------|-------------|
| **A — Site** | `index.html`, `js/sections/*`, `child-type-test/*`, `css/style.css`, images | `main` only | CI → full wrangler (추후) 또는 CF Pages `main` | Site |
| **B — Test runtime** | `test.html`, `js/test.js`, `css/test.css`, `js/diagnostic-*.js`, `js/report-support-materials.js`, `test-results/*` | feature → `main` | **test-only bundle** ([DEPLOYMENT_SAFETY.md](./DEPLOYMENT_SAFETY.md)) | Test runtime |
| **C — Supabase Edge** | `supabase/functions/*` | 별도 PR | Supabase CLI / MCP | Supabase Edge |

**금지:** Track B 작업을 Track A PR에 섞기. Track A merge 시 test runtime이 legacy로 rollback 되지 않도록, test 변경은 **먼저 main 동기화 + test-only deploy** 또는 CI 분리 deploy.

---

## 갱신 템플릿 (배포 후 복사)

```markdown
### YYYY-MM-DD — <짧은 설명>
| Surface | Git ref | Live fingerprint | Method | By |
|---------|---------|------------------|--------|-----|
| Site | main @ abc1234 | landing markers OK | CI site deploy | cursor-main |
| Test runtime | main @ def5678 | js/test.js sha256 … | test-only bundle | cursor-main |
```

---

## 빠른 확인 명령

```bash
git fetch origin
git log origin/main -1 --oneline

# Live test fingerprint (legacy vs premium 구분)
curl -sSL https://er-coaching.com/js/test.js | shasum -a 256
curl -sSL https://er-coaching.com/js/test.js | rg "buildResponseQualitySnapshot|center_auto_1|'t2'" | head -3

# PR #59 merge 후 사용 (scripts는 해당 branch/merge 이후)
node scripts/verify_live_test_deploy.mjs --site https://er-coaching.com
```

---

## 관련 문서

- [DEPLOYMENT_SAFETY.md](./DEPLOYMENT_SAFETY.md) — test-only bundle, wrangler 금지, verify
- [DEPLOY_REQUEST_PROTOCOL.md](./DEPLOY_REQUEST_PROTOCOL.md) — Codex/Claude → CI 배포 요청
- [MAIN_AGENT.md](./MAIN_AGENT.md) — merge/deploy 조율
- [../AGENTS.md](../../AGENTS.md) — Codex / Claude / Cursor 역할 분리
- `.github/workflows/deploy-production.yml` — production deploy CI

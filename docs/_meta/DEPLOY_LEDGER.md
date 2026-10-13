# Deploy Ledger — Live state SSOT

이 문서는 **er-coaching.com 에 실제로 올라가 있는 상태**를 기록한다.  
Git `main`, feature branch, 수동 wrangler deploy 가 서로 다를 수 있으므로, **배포·머지·롤백 전에 반드시 이 표를 먼저 읽는다.**

**갱신 규칙:** production deploy가 끝날 때마다 Cursor Cloud **메인 에이전트**가 같은 PR 또는 follow-up commit으로 이 파일을 갱신한다. Codex·Claude·로컬 Cursor 세션은 이 파일을 **읽기만** 한다.

---

## Live state (마지막 CI 확인: 2026-10-13 07:35:19 UTC)

| Surface | Git ref (의도) | Live SHA / fingerprint | Deployed at (UTC) | Method | Notes |
|---------|----------------|------------------------|-------------------|--------|-------|
| **Site** (landing, menu, home, child-type-test shell) | `origin/main` @ `0d89d95` | landing/menu·home design assets·child-type-test guard OK | 2026-10-13T07:35:14Z | GitHub Actions site-only bundle | run 38363480410, track both; 최종 live guard 07:35:19 UTC 통과 |
| **Test runtime** | `origin/main` @ `0d89d95` | premium runtime·entry scripts·analytics·report CSS/assets guard OK | 2026-10-13T07:34:48Z | GitHub Actions test-only bundle | run 38363480410; 07:34:49 UTC 검증 통과, site deploy 후 07:35:19 UTC 재검증 통과 |
| **Supabase Edge** | `main` / 별도 branch | (미기록) | — | `supabase functions deploy` | 웹 wrangler deploy 와 **분리** |

### Drift 요약

- **Site + Test runtime:** 2026-10-13 CI Deploy Production으로 `main` @ `0d89d95` (PR #169/#170 반영)을 배포·검증했다. 위 SHA는 배포 소스이며 이후 문서 전용 PR #171의 merge SHA `78825e5`와 구분한다.
- **CI ledger 저장 실패:** run 38363480410의 ledger 생성·runner 로컬 commit은 완료됐지만 protected `main` push는 GH006으로 거부됐다. `continue-on-error: true`로 workflow가 green이어도 원격 ledger 저장 성공을 뜻하지 않는다. 아래 기록은 로그에 근거한 후속 문서 정정이다.
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

### 2026-10-13 — 내러티브 검사 배포 기록 정정 (#169/#170)

- 배포 소스: [`0d89d959218abeeb18d830c53579eb8961238de6`](https://github.com/Jamiewsm/ER-Website/commit/0d89d959218abeeb18d830c53579eb8961238de6), [Deploy Production run 38363480410](https://github.com/Jamiewsm/ER-Website/actions/runs/38363480410), track `both`.
- [Test job](https://github.com/Jamiewsm/ER-Website/actions/runs/38363480410/job/115183054818): 2026-10-13 07:34:48 UTC 배포 완료, 07:34:49 UTC live guard 통과.
- [Site job](https://github.com/Jamiewsm/ER-Website/actions/runs/38363480410/job/115183194583): 2026-10-13 07:35:14 UTC 배포 완료, 07:35:19 UTC 최종 live guard 8개 항목 모두 OK (child-type-test HTML 31,901 bytes). Site-only bundle은 live test runtime을 보존했다.
- [Ledger job](https://github.com/Jamiewsm/ER-Website/actions/runs/38363480410/job/115183372454): 07:35:28 UTC 파일 생성·runner 로컬 commit `24e3166`; 07:35:29 UTC `GH006: Protected branch update failed for refs/heads/main` 및 `Changes must be made through a pull request`로 push 실패(exit 1). 이 시각은 배포 완료 시각이 아니다.
- [배포 당시 workflow](https://github.com/Jamiewsm/ER-Website/blob/0d89d959218abeeb18d830c53579eb8961238de6/.github/workflows/deploy-production.yml#L280-L288)의 `continue-on-error: true` 때문에 run은 success였다. [PR #171 검토 지적](https://github.com/Jamiewsm/ER-Website/pull/171#discussion_r4255958413)에 따라 CI 자동 저장 실패와 실제 배포 성공을 구분해 기록한다.

### 2026-09-15 — reading TOC + footer (#142)
| Surface | Git ref | Live fingerprint | Method | By |
|---------|---------|------------------|--------|-----|
| Site | main @ 2ccdf76 | theology TOC single numbers; reading footers match About/Coaches | CI site+test deploy | cursor-main |
| Test runtime | main @ 2ccdf76 | premium markers OK | test-only bundle | cursor-main |


### 2026-09-15 — reading pages header IA (#140)
| Surface | Git ref | Live fingerprint | Method | By |
|---------|---------|------------------|--------|-----|
| Site | main @ 6c4f7d4 | reading.css 1d954e19… | CI site+test deploy | cursor-main |
| Test runtime | main @ 6c4f7d4 | premium markers OK | test-only bundle | cursor-main |


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

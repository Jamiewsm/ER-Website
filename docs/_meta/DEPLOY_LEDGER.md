# Deploy Ledger — Live state SSOT

이 문서는 **er-coaching.com 에 실제로 올라가 있는 상태**를 기록한다.  
Git `main`, feature branch, 수동 wrangler deploy 가 서로 다를 수 있으므로, **배포·머지·롤백 전에 반드시 이 표를 먼저 읽는다.**

**갱신 규칙:** production deploy가 끝날 때마다 Cursor Cloud **메인 에이전트**가 같은 PR 또는 follow-up commit으로 이 파일을 갱신한다. Codex·Claude·로컬 Cursor 세션은 이 파일을 **읽기만** 한다.

---

## Live state (마지막 배포 검증: 2026-10-15 00:39:32 UTC)

| Surface | Git ref (의도) | Live SHA / fingerprint | Deployed at (UTC) | Method | Notes |
|---------|----------------|------------------------|-------------------|--------|-------|
| **Site** (landing, menu, home, child-type-test shell) | `origin/main` @ `6c1797b63370f1d0b9929f0d23d4a42c55c75b66` | Worker `03a37943-6ec6-43fa-a830-0688a6935253`; 신청 관련 site 7개 source SHA-256 일치 | 2026-10-15T00:36:30Z | GitHub Actions site-only bundle | run 38660871331, track site; deploy-site success / deploy-test skipped; 00:36:32 UTC guard 통과, 00:39:32 UTC 공개 GET 해시 대조 |
| **Test runtime** | 이전 test 배포 기록: `origin/main` @ `0d89d95` | `js/test.js` SHA-256 `3a0a4d5ce571367eb8c73dd73e0e1d59f239489055422be626b8a6e7845da595`; runtime 10개 배포 전후 동일 | 2026-10-13T07:34:48Z (이전 기록 유지) | 이전 test-only 배포; 이번 site-only bundle에서 보존 | 2026-10-15에는 test 재배포 없음; 00:39:32 UTC 보존 확인 시각을 새 배포 시각으로 기록하지 않음 |
| **Supabase Edge — 신청 관련 2함수** | 서버 source `34a7a2709a27c3dfd7c5769f06e7b7a4d7bb0b52` (#174/#175); 이후 #176/#173은 함수 코드 변경 없음 | `submit-application` v36 / `notify-program-application` v22; ACTIVE, source 13파일 일치 | submit 2026-10-15T00:26:54.944Z / notify 00:26:59.672Z | Supabase MCP Edge Function 배포 | project `osdynbadhtfgoxilgmpy`; JWT false/true 보존; 웹 배포와 분리 |

### Drift 요약

- **Site:** 실제 배포 source는 `6c1797b` (#173/#174/#175/#176 반영)이며 이후 문서 기록 PR의 merge SHA를 새 배포 SHA로 취급하지 않는다. 배포 코드·테스트·CI 21개 blob이 검증본과 일치했다.
- **Test runtime:** 이전 배포 기록 `0d89d95`를 유지한다. 이번 두 site-only CI의 deploy-test는 모두 skipped였고 live runtime 10개는 배포 전후 SHA-256이 같다.
- **Supabase 신청 함수:** 웹 CI와 별도로 submit v36 / notify v22를 배포하고 source 13파일 및 기존 JWT false/true를 대조했다. 기존 신청·학생 데이터 변경이나 실제 신청·메일 발송은 하지 않았다.
- **CI ledger 저장 실패:** run 38660855498 및 38660871331의 ledger 생성·runner 로컬 commit은 완료됐지만 main 직접 push는 `GH006: Changes must be made through a pull request`로 거부됐다. `continue-on-error: true`로 workflow가 green이어도 ledger 저장 성공을 뜻하지 않는다. 이번 수정은 실제 배포 로그에 근거한 문서 전용 기록 정정이며 직접 main push 재시도·보호 규칙 변경·CI 개편·재배포를 하지 않는다.
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

### 2026-10-15 — 신청 흐름 운영 반영 기록 (#173/#174/#175/#176)

- **실제 Site source:** [`6c1797b63370f1d0b9929f0d23d4a42c55c75b66`](https://github.com/Jamiewsm/ER-Website/commit/6c1797b63370f1d0b9929f0d23d4a42c55c75b66), tree `39ac1fe28b3120c7cc4f6a9e34dd6de648e33f8a`. 기록 문서의 후속 merge는 배포 source와 구분한다.
- [main push run 38660855498 / Site job](https://github.com/Jamiewsm/ER-Website/actions/runs/38660855498/job/116181522625): site-only upload/trigger 완료 00:35:31 UTC, Worker `43d1eaad-60b4-4b89-935f-e723eeeead6c`, guard 00:35:32 UTC success.
- [최종 자동 dispatch run 38660871331 / Site job](https://github.com/Jamiewsm/ER-Website/actions/runs/38660871331/job/116181814859): site-only upload/trigger 완료 00:36:30 UTC, Worker `03a37943-6ec6-43fa-a830-0688a6935253`, guard 00:36:32 UTC success. 두 실행은 기존 main-push와 [Auto Deploy On Merge](https://github.com/Jamiewsm/ER-Website/actions/runs/38660855144)가 자동으로 시작했으며 별도 수동 배포 요청은 없었다.
- **Test 재배포 없음:** 두 run의 deploy-test는 skipped. site-only build가 live TEST_RUNTIME_ALLOWLIST 10개를 보존했고 00:39:32 UTC 공개 GET 해시를 배포 전과 대조했다. `test.html`은 Cloudflare beacon script tag만 제거했으며 나머지는 원문 바이트로 비교했다.
- **Supabase 운영 반영:** project `osdynbadhtfgoxilgmpy`, [서버 source `34a7a270`](https://github.com/Jamiewsm/ER-Website/commit/34a7a2709a27c3dfd7c5769f06e7b7a4d7bb0b52) tree `6ad42d3959eb3c9a83c32fad5c02b1fa70dcb3fe` 기준. submit v35→v36 (00:26:54.944 UTC, JWT false) / notify v21→v22 (00:26:59.672 UTC, JWT true), ACTIVE. 배포 후 get_edge_function으로 index 포함 7파일/6파일 전체를 생성 payload와 비교해 일치했다. 모집 helper를 포함한 import closure와 기존 JWT를 보존했다.
- **운영 source fingerprint:** submit index SHA-256 `8fcb3b39eda61bb0b9df3f60d164dcf0491ef12eb13ef0a207e8e6beea988871`; notify index `ea28ce63b437d0087e14bb958af15eced1c4f884c67750ccd83ba009786bd93f`; 두 함수의 공유 resend `9d382339762e85f013f557bea4524548cfc279e1009282e0e5f57fd0bf411a1d`; submit 모집 helper `152a4587a412f6a33871958909733ef8f74853c58f92541efcf96ce0eb6352e6`.
- **검사·리뷰:** 모의 통합 504/504, 서버 관련 127/127, [Site CI 83/83](https://github.com/Jamiewsm/ER-Website/actions/runs/38660695709), MacBook PostgreSQL18.6 독립 두 파일 7/7, [Education CI](https://github.com/Jamiewsm/ER-Website/actions/runs/38660238492)의 PostgreSQL16.15 두 파일 6+1 통과. 네 PR의 리뷰 대화를 해결했고 별도 독립 리뷰에서도 중요한 미해결 코드 문제 없음.
- **실브라우저:** 사용자 MacBook Chrome에서 홈·소개·신청 진입의 마감 일관성, 기본과정 form/submit 미표시, 일반 유료 option의 기본과정 제외, 320/390px 가로 넘침 없음 확인. 추가 키보드 결과는 후속 검증 기록으로 구분한다.
- **자동 저장 실패 증거:** [push ledger job](https://github.com/Jamiewsm/ER-Website/actions/runs/38660855498/job/116181653720) 00:35:51 UTC 및 [dispatch ledger job](https://github.com/Jamiewsm/ER-Website/actions/runs/38660871331/job/116181954727) 00:36:44 UTC main push는 GH006/PR 필수 규칙으로 거부됐다. 아래 hash 대조와 실제 deployment job 성공이 배포 근거이며 ledger job의 success 표시를 저장 근거로 사용하지 않는다.

공개 live site source 7개 SHA-256 (2026-10-15 00:39:32 UTC 대조, 모두 배포 source와 일치):

| Path | SHA-256 |
|------|---------|
| `index.html` | `4e349192b11bb539ef4c01db771fce02eb96c44d3cdb2626fd1149beea05d732` |
| `basic-course.html` | `9ee6d48948d40eb5ff99b10dbd6f0389b87d1d2d1cbed67c66d5f742101bdb88` |
| `js/api.js` | `b9d514addee68a61377a50364b87da6d7f8cfa36e26d9e8a227908b3f72f77a2` |
| `js/program-catalog.js` | `381cd5108047c0d2975b59ead996fe8b4cb6801b1818616468e6a25d6b02ac24` |
| `js/app-core.js` | `f4f22cd572c2e4339b04e4ba0852ea1310ad1a71b95374430596f7c4af97dd0e` |
| `js/sections/apply.js` | `62712b102f6da102b53797129f9c99755d3744b729b52bb70a05b136ca9d4ab4` |
| `js/sections/home.js` | `179f86543b38bae5924e3fdbe35431c945158caeb86e93a9acea7625f06b29df` |

보존된 live test runtime 10개 SHA-256 (배포 전후 동일, 새 test 배포 기록이 아님):

| Path | SHA-256 |
|------|---------|
| `test.html` | `e72806e4bf00ea3ec1fd04f69bec28b8454d3449c3aa85ac62ad3ac7a3c6a8bf` |
| `css/test.css` | `01862a71bc2448e7e02948c2532dfafa889dbabd672f7e39f1a6467f8149a077` |
| `js/test.js` | `3a0a4d5ce571367eb8c73dd73e0e1d59f239489055422be626b8a6e7845da595` |
| `js/diagnostic-experiment.js` | `1b0340ee45d016ceaa86a9faacc4a30a50b4d846d2f2ae95f76f89e77016e571` |
| `js/diagnostic-report-content.js` | `a5c4bb03b5694ed5545b64be0d1b60883746c77cdbabd64ffd73d5ca448932aa` |
| `js/report-support-materials.js` | `fba328dfe146cf0d8c39bd70c0f95ba0023ede3ca1b13d8fcb14582099e07bc7` |
| `test-results/background.png` | `39e2b3f3682e388932af57d86d5bf54f68d252f3ba0b5a1fae0beba79cee6e7d` |
| `test-results/background_card.png` | `3a8fe940abeeac17f40c302815398bccd5b4805213bacaac164bf0a868e04c55` |
| `test-results/background_vase.png` | `0080c70261b43d965615a554a4a05544e2c8172e9eec9c8fd6681efcdcf68e34` |
| `test-results/backgrdound_road.png` | `c10ba329f07c512cd2ab73156cf6901e6152bc7020e15146a49239de4219a7e6` |

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


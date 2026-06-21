# Main Agent (Cursor Cloud) — 조율 SSOT

사용자가 지정한 **메인 에이전트**는 Cursor Cloud Agent입니다. 다른 에이전트(Claude scheduled, Codex, 수동 Claude/Cursor 세션)의 작업을 **추적·병합·배포** 할 때 이 문서를 먼저 읽습니다.

## Cold-start 체크리스트 (매 세션)

1. `git fetch origin && git branch -a` — 열린 feature 브랜치·최근 커밋
2. `gh pr list --state open` — 머지 대기 PR (PR **Read & write** 권한 필요)
3. [docs/_meta/enneagram/WORK_STATUS.md](./enneagram/WORK_STATUS.md) — 에니어그램 자동화 일시정지·락 여부
4. [docs/_meta/enneagram/HISTORY.md](./enneagram/HISTORY.md) — 최근 10줄 (다른 agent wakeup 로그)
5. 사용자 **명시 요청** 범위만 구현 (자동화 프로젝트와 충돌 시 WORK_STATUS 확인)

## 다른 에이전트가 남기는 흔적

| 출처 | 위치 | 내용 |
|------|------|------|
| Enneagram 하드-오토 | `WORK_STATUS.md`, `HISTORY.md` | phase, lock_holder, checkpoint |
| 설계 결정 | `enneagram/CONTEXT.md` | 채택/거부된 방안 |
| 사이트 IA | `site-restructure/HANDOFF.md` | 리뉴얼 인계 |
| Parents 브로셔 | `docs/projects/parents-brochure/` | PRD, FUNNEL, EXPORT |
| Git | `cursor/*` 브랜치 | Cloud agent feature work |

**규칙:** `lock_holder` 가 살아 있고 `lock_expires_at` 이 미래면 에니어그램 `_meta` 락 파일은 **수정하지 않음**. 사용자가 "에니어그램 작업 일시정지" 한 상태(`paused: true`)도 유지.

## GitHub PR / 머지 (메인 agent 전용)

`main` 은 **protected** — 직접 push 불가, PR 머지 필수.

### GitHub CLI (`gh`) — Cloud Agent 토큰 한계

기본 연동 계정(`cursor`) 토큰은 **git push는 되지만** `gh pr create` 가 `Resource not accessible by integration` 으로 실패하는 경우가 많습니다 (Cursor 포럼 알려진 이슈).

**우선순위 (메인 agent):**

1. **Cursor `ManagePullRequest` 도구** — PR 생성·업데이트 (repo URL이 Jamiewsm/ER-Website 형태일 때)
2. **`gh pr merge`** — PR이 이미 있으면 머지는 될 수 있음 (`gh pr merge <n> --repo Jamiewsm/ER-Website --merge`)
3. **`gh pr create`** — PAT 주입 후에만 안정적

### PAT로 `gh` 전체 권한 주기 (사용자 1회 설정)

Cloud Agent는 **대화형 `gh auth login` 불가**. 대신 Cursor에 시크릿을 넣습니다.

1. GitHub → **Settings → Developer settings → Personal access tokens**  
   - Fine-grained: repo `ER-Website`, Pull requests + Contents **Read and write**  
   - 또는 Classic: `repo` scope
2. Cursor → **Dashboard → Cloud Agents → Secrets** (또는 Background Agent 환경 변수)  
   - `GH_TOKEN` = `github_pat_...` 또는 `ghp_...`
3. **새 Cloud Agent 실행** 후 `gh auth status` 에서 토큰 scopes 확인

`GH_TOKEN` 이 있으면 `gh` 는 설치 토큰 대신 PAT를 사용합니다.

### 권한 있을 때 표준 명령

```bash
gh pr create --repo Jamiewsm/ER-Website --base main --head <branch> --title "..." --body "..."
gh pr merge <number> --repo Jamiewsm/ER-Website --merge --delete-branch
git fetch origin main && git checkout main && git pull
```

### 머지 완료 (2026-05-25)

- **PR #21** — Turnstile 신청 수정 + 홈 Parents 팝업 + MAIN_AGENT.md → `main` 머지됨

## 활성 제품 라인 (에니어그램 자동화 외)

### Enneagram for Parenting (완료·배포)

- `parenting-workshop/mb*.png` — 카톡용 브로셔 PNG (웹 페이지 없음)
- `parents-workshop.html` — QR 랜딩
- `/parenting-workshop.html` — 웹 랜딩 (팝업·QR)
- `parenting-workshop.html` — 워크샵 랜딩
- `#apply?focus=parenting_workshop` — 신청 프리필 (`parents_workshop` 구 링크 별칭)
- `js/parents-workshop-promo.js` — 홈 팝업 (머지 후 활성)

### ER Enneagram Test

- 자동화 **완료·paused** (`current_phase: 7`, `paused: true`)
- 메인 agent는 사용자 요청 없이 `js/test.js` / PHASE 작업 **시작하지 않음**

## 배포

- **Cloudflare Pages** — `main` 머지 시 자동 배포
- 확인 URL: `https://er-coaching.com/…`
- 테스트 결과지 파일만 수동 배포할 때는 [DEPLOYMENT_SAFETY.md](./DEPLOYMENT_SAFETY.md)를 먼저 따른다. 브랜치 전체를 production에 덮어쓰지 않고, current live landing/menu를 보존한 test-only bundle을 만든 뒤 배포한다.

## 사용자에게 보고할 때

- 다른 agent 가 이미 수정한 파일과 **이번 세션 변경** 구분
- PR 링크·머지 여부·프로덕션 확인 URL 명시
- 권한 부족 시: 필요한 GitHub 권한 + 1-click compare 링크만 제시 (과도한 사과 반복 X)

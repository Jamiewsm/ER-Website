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

### Cursor GitHub App 권한

Repository **Jamiewsm/ER-Website** (또는 `jamiewsm/er-website`) 에서:

- **Settings → Integrations / GitHub Apps → Cursor** (또는 Cursor Settings → GitHub)
- **Repository permissions → Pull requests: Read and write**
- 저장 후 Cloud Agent 세션 **재시작** 또는 `gh auth refresh`

### 권한 있을 때 표준 명령

```bash
gh pr create --repo Jamiewsm/ER-Website --base main --head <branch> --title "..." --body "..."
gh pr merge <number> --merge --delete-branch
git fetch origin main && git checkout main && git pull
```

### 현재 머지 대기 (2026-05-25)

| 브랜치 | 내용 | Compare |
|--------|------|---------|
| `cursor/fix-apply-turnstile-c2f9` | Turnstile 신청 수정 + 홈 Parents 팝업 | [compare](https://github.com/Jamiewsm/ER-Website/compare/main...cursor/fix-apply-turnstile-c2f9) |

권한 없을 때: 사용자에게 위 compare 링크로 **Create PR → Merge** 요청.

## 활성 제품 라인 (에니어그램 자동화 외)

### Enneagram for Parents (완료·배포 대기)

- `parents-brochure.html` — 6p 모바일 브로셔
- `parents-workshop.html` — QR 랜딩
- `#apply?focus=parents_workshop` — 신청 프리필
- `js/parents-workshop-promo.js` — 홈 팝업 (머지 후 활성)

### ER Enneagram Test

- 자동화 **완료·paused** (`current_phase: 7`, `paused: true`)
- 메인 agent는 사용자 요청 없이 `js/test.js` / PHASE 작업 **시작하지 않음**

## 배포

- **Cloudflare Pages** — `main` 머지 시 자동 배포
- 확인 URL: `https://er-coaching.com/…`

## 사용자에게 보고할 때

- 다른 agent 가 이미 수정한 파일과 **이번 세션 변경** 구분
- PR 링크·머지 여부·프로덕션 확인 URL 명시
- 권한 부족 시: 필요한 GitHub 권한 + 1-click compare 링크만 제시 (과도한 사과 반복 X)

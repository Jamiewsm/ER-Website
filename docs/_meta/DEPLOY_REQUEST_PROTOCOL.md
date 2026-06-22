# Codex / Claude / Cursor 서브 → CI 배포 프로토콜

사용자가 **merge 후 배포를 요청하지 않아도** production에 반영되도록 한다.  
실제 `wrangler deploy` 는 **GitHub Actions `Deploy Production` workflow** 가 실행한다.

**Live state:** [DEPLOY_LEDGER.md](./DEPLOY_LEDGER.md)  
**안전 규칙:** [DEPLOYMENT_SAFETY.md](./DEPLOYMENT_SAFETY.md)

---

## 기본 원칙 (2026-06-22~)

| 단계 | 누가 | 무엇 |
|------|------|------|
| PR 생성·push | Codex / Claude | track에 맞는 파일만 변경 |
| PR 라벨 | **CI 자동** (`PR Auto Deploy Label`) | `deploy/site` · `deploy/test` · `deploy/both` |
| merge | Cursor Cloud 메인 | `main` protected branch |
| production deploy | **CI 자동** (`Auto Deploy On Merge`) | merge 직후 track 추론 → Deploy Production |

**Codex/Claude는 merge 후 `submit_deploy_request` 를 호출하지 않는다.**  
**사용자는 Cursor에게 "배포해줘" 라고 말하지 않는다.**

---

## 역할

| Agent | 할 일 | 하지 말 것 |
|-------|--------|------------|
| Codex / Claude | PR push, 테스트, PR 본문에 track 명시 | `wrangler deploy`, main merge, merge 후 수동 deploy 요청 |
| Cursor Cloud 메인 | PR merge 조율, Actions 실패 시 수습 | feature branch 직접 deploy |
| GitHub Actions | merge·path 기반 site/test deploy | — |

---

## 자동화 workflow

| Workflow | Trigger | 동작 |
|----------|---------|------|
| `pr-auto-deploy-label.yml` | PR open/sync | 변경 파일 → `deploy/*` 라벨 자동 |
| `auto-deploy-on-merge.yml` | PR merged | 변경 파일 → `repository_dispatch` deploy-request |
| `deploy-production.yml` | dispatch / main push / `/deploy` | test-only 또는 site-only bundle deploy |

Track 추론 SSOT: `scripts/infer_deploy_track.mjs` + `scripts/deploy-tracks.mjs`

---

## 수동 채널 (복구·예외만)

### A — 배포 요청 CLI

브랜치 preview 복구, merge 전 강제 deploy 등 **예외**에만.

```bash
node scripts/submit_deploy_request.mjs \
  --track test \
  --by codex \
  --reason "recovery: live drift" \
  --ref main
```

### B — PR 댓글 (사람만, 봇 제외)

```text
/deploy test
/deploy site
/deploy both
```

### C — workflow_dispatch

```bash
gh workflow run deploy-production.yml -f track=both -f requested_by=human -f reason=recovery
```

---

## Codex / Claude 작업 종료 체크리스트

1. PR 생성 + 본문에 **Track: site | test** 명시
2. `node --test tests/...` (해당 scope)
3. merge는 **Cursor 메인** handoff
4. merge 후 **아무 것도 하지 않음** — CI가 deploy + PR에 상태 댓글
5. 실패 시에만 Actions log를 Cursor 메인 handoff에 첨부

---

## GitHub Secrets (1회 설정, 사용자)

| Secret | 용도 |
|--------|------|
| `CLOUDFLARE_API_TOKEN` | wrangler deploy |
| `CLOUDFLARE_ACCOUNT_ID` | wrangler deploy |

---

## Cursor Cloud 메인 handoff (다른 AI → Cursor)

```markdown
## Merge handoff
- PR: #NNN (ready to merge)
- Track: test (CI가 자동 라벨·deploy 예정)
- Action: merge만 하면 됨. 별도 deploy 요청 불필요.
```

Cursor 메인은 **merge + Actions 성공 확인** 만 하면 된다.

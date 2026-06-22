# Codex / Claude / Cursor 서브 → CI 배포 요청 프로토콜

사용자가 Cursor 메인에게 **일일이 "배포해줘"** 라고 말하지 않아도 되도록, 다른 AI는 아래 **자동 채널** 중 하나로 배포를 요청한다.  
실제 `wrangler deploy` 는 **GitHub Actions `Deploy Production` workflow** 가 실행한다.

**Live state:** [DEPLOY_LEDGER.md](./DEPLOY_LEDGER.md)  
**안전 규칙:** [DEPLOYMENT_SAFETY.md](./DEPLOYMENT_SAFETY.md)

---

## 역할

| Agent | 할 일 | 하지 말 것 |
|-------|--------|------------|
| Codex / Claude / Cursor 서브 | PR push, 테스트, **배포 요청** | `wrangler deploy`, main merge |
| Cursor Cloud 메인 | PR merge 조율, ledger 확인, 실패 시 수습 | feature branch 직접 deploy |
| GitHub Actions | path/요청에 따라 site 또는 test-only deploy | — |

---

## 방법 A — 배포 요청 CLI (권장)

PR merge **후** 또는 merge **직전** (label과 함께):

```bash
node scripts/submit_deploy_request.mjs \
  --track test \
  --by codex \
  --reason "PR #59 premium test runtime" \
  --ref main
```

`--track`: `site` | `test` | `both`

**필요 조건:** `gh` CLI + repo 권한 (`GH_TOKEN` 또는 `gh auth login`)

**모니터링:**

```bash
gh run list --workflow=deploy-production.yml --limit 5
gh run watch
```

---

## 방법 B — PR label (merge 시 자동)

PR에 label 추가 후 merge.

| Label | 의미 |
|-------|------|
| `deploy/site` | landing/home/site full deploy |
| `deploy/test` | test-only bundle deploy |
| `deploy/both` | site full → test bundle 순서 |

Codex/Claude PR 본문 footer 예시.

```markdown
Deploy: add label `deploy/test` before merge.
```

Label은 GitHub repo Settings → Labels 에 한 번만 생성하면 된다.

---

## 방법 C — PR/Issue 댓글

PR 또는 Issue에 댓글.

```text
/deploy test
/deploy site
/deploy both
```

---

## 방법 D — GitHub Actions 수동 실행

Cursor Cloud 또는 사용자.

```bash
gh workflow run deploy-production.yml \
  -f track=test \
  -f ref=main \
  -f requested_by=cursor-main \
  -f reason="manual recovery"
```

---

## 방법 E — main merge 자동 (기본)

`main` merge 시 **변경 path** 로 자동 판단.

- Site paths → full wrangler deploy
- Test paths → test-only bundle (live landing fetch 후 overlay)
- 둘 다 → site 먼저, test bundle 다음

Ledger-only commit (`[skip deploy]`) 은 deploy를 트리거하지 않음.

---

## Codex / Claude 작업 종료 체크리스트

1. PR 생성 + track 명시 (`site` / `test`)
2. `node --test tests/...` (해당 scope)
3. merge는 **Cursor 메인**에게 handoff
4. merge 후:

```bash
node scripts/submit_deploy_request.mjs --track test --by codex --reason "PR #NNN"
```

5. `gh run list --workflow=deploy-production.yml` 로 성공 확인
6. 실패 시 [DEPLOY_LEDGER.md](./DEPLOY_LEDGER.md) 와 Actions log를 Cursor 메인 handoff에 첨부

---

## GitHub Secrets (1회 설정, 사용자)

Repository → Settings → Secrets → Actions.

| Secret | 용도 |
|--------|------|
| `CLOUDFLARE_API_TOKEN` | wrangler deploy |
| `CLOUDFLARE_ACCOUNT_ID` | wrangler deploy |

Cloudflare Pages direct git 연동이 켜져 있으면 **중복 deploy** 가 날 수 있다. Actions만 쓰려면 Pages auto-deploy를 끄거나 production branch를 Actions 전용으로 맞춘다.

---

## Cursor Cloud 메인 handoff 템플릿 (다른 AI → Cursor)

다른 AI가 사용자 대신 Cursor에게 넘길 때 PR 본문 또는 Issue에 붙여넣기.

```markdown
## Deploy handoff
- PR: #NNN (merged / ready to merge)
- Track: test
- Request: merge 후 `node scripts/submit_deploy_request.mjs --track test --by codex --reason "..."` 실행됨
- Verify: `node scripts/verify_live_test_deploy.mjs --site https://er-coaching.com`
- Ledger: Actions `update-ledger` job이 DEPLOY_LEDGER 갱신
```

Cursor 메인은 **merge + Actions 성공 확인 + ledger drift** 만 보면 된다.

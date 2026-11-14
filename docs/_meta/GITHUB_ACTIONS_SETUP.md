# GitHub Actions — 1회 설정

Production deploy CI (`.github/workflows/deploy-production.yml`) 를 쓰려면 아래를 한 번만 설정한다.

## 1. Repository Secrets

GitHub → **Jamiewsm/ER-Website** → Settings → Secrets and variables → Actions → New repository secret

| Name | Value |
|------|--------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token (Account + Workers/Pages edit) |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID |

Wrangler local 과 동일한 account/project (`er-coaching-site` in `wrangler.toml`).

## 2. Labels (PR deploy 요청)

Settings → Labels → New label (없으면 생성).

- `deploy/site`
- `deploy/test`
- `deploy/both`
- `deploy-request` (Issue template용)

## 3. Cloudflare Pages 중복 deploy 방지

**둘 중 하나만** 사용한다.

| 방식 | 설정 |
|------|------|
| **A — Actions only (권장)** | Cloudflare Pages dashboard → 해당 project → Builds → Git 연동 **끄기** 또는 production branch deploy 비활성 |
| **B — Pages git + Actions** | Actions path filter만 사용, Pages는 main full deploy 유지 → **test rollback 위험** (비권장) |

## 4. Branch protection (main)

- Require pull request
- Require status checks: `test-runtime` (er-test-pr-review), deploy workflow (선택)
- Restrict who can push (optional)

## 5. Agent PAT (Codex / Claude / Cursor Cloud)

`submit_deploy_request.mjs` 및 `gh workflow run` 용.

- Fine-grained PAT: repo `ER-Website`, Actions **Read and write**, Contents read
- Cursor Cloud Secrets: `GH_TOKEN`
- Codex/Claude: 사용자 환경 `gh auth login` 또는 동일 PAT

## 6. 확인

```bash
# Dry run (dispatch 없음)
node scripts/submit_deploy_request.mjs --track test --by human --reason test --dry-run

# 수동 workflow (merge 후)
gh workflow run deploy-production.yml -f track=test -f requested_by=human -f reason=setup-test

gh run list --workflow=deploy-production.yml --limit 3
```

## 7. Workflows 요약

### 배포 원장 PR 저장

- Repository Settings → Actions → General → Workflow permissions의 **Allow GitHub Actions to create and approve pull requests**를 켠다. 기본 workflow 권한은 read를 유지한다.
- Deploy Production은 별도 `bot/deploy-ledger-<run>-<attempt>` 브랜치에 원장만 저장하고 PR을 만든다. workflow에서 승인·main 직접 push·브랜치 보호 우회는 하지 않는다.
- ledger job 성공은 PR 생성 성공이다. 원격 main 저장은 원장 PR 병합 후 별도 확인한다. PR 병합 시 source SHA·배포 실행·현재 운영 상태를 대조한다.
- 원장 PR은 docs-only이므로 deploy 라벨을 추가하지 않는다. 저장 실패는 workflow 실패로 드러나며 main 직접 push를 재시도하지 않는다.
- 기능 PR merge가 자동 시작하는 배포와 원장 PR 저장을 구분한다. 새 PAT는 필요하지 않다.

| Workflow | Trigger |
|----------|---------|
| `deploy-production.yml` | dispatch, main push (paths), `/deploy` comment |
| `auto-deploy-on-merge.yml` | PR merged → deploy-request dispatch |
| `pr-auto-deploy-label.yml` | PR open/sync → `deploy/*` 라벨 자동 |
| `er-test-pr-review.yml` | PR touching test-runtime paths |

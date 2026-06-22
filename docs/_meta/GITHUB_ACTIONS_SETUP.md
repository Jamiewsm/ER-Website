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

| Workflow | Trigger |
|----------|---------|
| `deploy-production.yml` | main push (paths), dispatch, `/deploy`, PR label, `submit_deploy_request.mjs` |
| `er-test-pr-review.yml` | PR touching test-runtime paths |

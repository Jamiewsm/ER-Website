# Safe Git Workflow For Codex

This repository uses a pull request-based workflow for AI-assisted development.

## Branch Rules

- The `main` branch is production-facing and must be protected in GitHub.
- Codex must never commit or push directly to `main`.
- Every task must begin on a feature branch named `codex/<feature-name>`.
- Codex must push the feature branch and create a pull request targeting `main`.
- A human reviewer must approve the pull request before merge.

## Review Rules

- Pull requests must use the repository PR template.
- Pull requests must clearly describe:
  - feature summary
  - files changed
  - test results
  - potential risks
  - Supabase or database impact
  - deployment impact
- Pull requests with Supabase migrations must include the migration review checklist.

## Deployment Rules

- Only merges into `main` trigger production deployment.
- Feature branches must use preview deployment for review and validation.
- No branch should be merged automatically without human review.

## Expected Codex Flow

1. Update local `main`.
2. Create `codex/<feature-name>`.
3. Make changes only on that branch.
4. Run available automated checks.
5. Commit with a clear message.
6. Push the branch.
7. Open a pull request to `main`.
8. Wait for human review.
9. Merge only after approval and required checks pass.

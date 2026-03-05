# Safe Git Workflow For Codex

This repository uses a pull request-based workflow for AI-assisted development.

## Branch Rules

- The `main` branch is protected and production-facing.
- Codex must never commit or push directly to `main`.
- Every task starts on a feature branch named `codex/<feature-name>`.
- Codex may modify code, run available checks, commit, and push the feature branch.
- Codex must open a pull request targeting `main`.
- A human must review the pull request before merge.

## Merge Rules

- Codex must not merge a pull request automatically.
- Codex may merge a pull request only after the user gives explicit approval in chat.
- Direct pushes to `main` remain disabled even after approval.

## Deployment Rules

- Only merges into `main` trigger production deployment.
- Feature branches are for preview validation only.

## Default Codex Flow

1. Start from latest `main`.
2. Create `codex/<feature-name>`.
3. Make changes only on that branch.
4. Run available checks and summarize results.
5. Commit the changes.
6. Push the branch.
7. Open a pull request to `main`.
8. Wait for explicit user approval before merge.

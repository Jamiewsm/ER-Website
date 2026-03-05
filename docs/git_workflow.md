# Safe Git Workflow For Codex

This repository uses a pull request-based workflow for AI-assisted development.

## Rules

- The `main` branch is protected.
- Codex must never push directly to `main`.
- Codex must always create a feature branch before making changes.
- Codex must open a pull request for every feature branch.
- A human review is required before any pull request is merged.

## Deployment

- Merges into `main` trigger the production deploy.
- Feature branches trigger preview deploys for review and validation.

## Expected Codex Flow

1. Start from the latest `main`.
2. Create a feature branch using the `codex/` prefix.
3. Make changes only on that feature branch.
4. Commit the changes with a clear message.
5. Push the feature branch to the remote repository.
6. Open a pull request targeting `main`.
7. Wait for human review and approval.
8. Merge only after approval and required checks pass.

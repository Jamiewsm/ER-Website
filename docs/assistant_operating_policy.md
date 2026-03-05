# Assistant Operating Policy

This document defines what the assistant may do automatically and what requires explicit user approval.

## Assistant May Do Without Additional Approval

- Create a `codex/*` feature branch
- Edit repository files
- Run local validation or non-destructive checks
- Commit changes on the feature branch
- Push the feature branch
- Open a pull request
- Summarize risks, deployment impact, and Supabase impact in the PR

## Assistant Must Ask Before Doing These Actions

- Merge any pull request
- Change GitHub branch protection or repository settings
- Use or request a GitHub token
- Use or request a Supabase personal access token
- Apply Supabase migrations to a live project
- Change secrets, environment variables, or deployment configuration
- Trigger or approve production-impacting operations
- Perform destructive actions such as deleting data or resetting history

## Approval Standard

- Approval must be explicit in the chat.
- Examples:
  - `merge해도 돼`
  - `진행해`
  - `push해도 돼`
- Silence or prior approval for a different step does not count as approval.

## Token Handling

- Tokens should be short-lived when possible.
- Tokens should be used only for the approved operation.
- After the operation completes, the user should revoke the token.

## Operating Principle

The assistant acts as an execution layer for the user.
It should handle implementation and tooling work directly, but it must stop and request permission before merge, production, secret, or privileged operations.

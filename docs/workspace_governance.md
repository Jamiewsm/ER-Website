# Workspace Governance

## Scope

This workspace contains two independent codebases that share one product domain:

- `ER-Website`
  - Public website and coach portal frontend
  - Supabase schema, migrations, storage policy, and web-facing operational docs
- `CoachPortal-iOS`
  - iOS client app
  - Native UI, mobile session flows, and app-specific Supabase integration code

The parent folder `Visual Studio Code` is a workspace container only. It is not a Git repository.

## Source Of Truth

- Supabase schema and migrations
  - Source of truth: `ER-Website/supabase`
- Web UI behavior
  - Source of truth: `ER-Website`
- iOS app behavior
  - Source of truth: `CoachPortal-iOS`

If a change affects database structure, RLS, buckets, or RPC functions, the authoritative migration must be created and reviewed from `ER-Website`.

## Repository Rules

- `ER-Website` and `CoachPortal-iOS` are managed as separate Git repositories.
- Changes must never be mixed across repos in a single commit.
- The parent workspace must not be re-initialized as a Git repository.
- Temporary files, editor artifacts, and platform cache files should be cleaned within each repo, not from a shared parent repo.

## Cross-Project Change Rules

### Web-only changes

Examples:

- website layout
- coach portal UI
- Cloudflare Pages config
- web auth flow

These belong in `ER-Website` only.

### iOS-only changes

Examples:

- SwiftUI screens
- native login state handling
- mobile navigation
- iOS-specific Supabase service code

These belong in `CoachPortal-iOS` only.

### Shared backend changes

Examples:

- new tables
- new storage buckets
- RLS policy changes
- RPC functions
- new shared metadata fields

These must follow this order:

1. Define the schema change in `ER-Website/supabase/migrations`
2. Apply and verify the migration
3. Update web code if needed
4. Update iOS code if needed

## Assistant Operating Expectations

The assistant should treat this workspace as one product with two repositories.

Operationally:

- inspect both repos when a change may affect shared backend behavior
- avoid editing the other repo unless the task actually requires it
- call out cross-repo impact before applying schema or auth changes
- keep branch history clean per repo
- avoid mixing unrelated iOS and web changes in the same branch or PR

## Current Practical Rule

When in doubt:

- backend and migration ownership lives in `ER-Website`
- mobile client behavior lives in `CoachPortal-iOS`
- shared product logic must be reflected in both, but committed separately

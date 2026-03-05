# Backup Strategy

## Current State

- Application files are stored in Git and GitHub.
- Supabase database changes are tracked with SQL migrations in `supabase/migrations/`.
- Supabase Storage files and live database contents should **not** be treated as automatically recoverable operational backups.

In practice, this means deleted or corrupted uploaded materials may not be easy to restore unless a separate backup process exists.

## Recommended Backup Scope

1. Supabase database
2. Supabase Storage buckets
3. Migration files and operational documents in GitHub

## Recommended Database Backup

- Run a scheduled PostgreSQL dump at least daily.
- Store backups in a separate location from the application runtime.
- Keep at least:
  - 7 daily backups
  - 4 weekly backups
  - 3 monthly backups

## Recommended Storage Backup

- Copy private storage buckets to a separate backup location on a schedule.
- For critical materials, prefer archive-before-delete over hard delete.
- Consider soft delete metadata for uploaded materials before permanent removal.

## Restore Expectations

- A backup strategy is incomplete unless restore has been tested.
- Run a restore drill on a non-production environment at least once per quarter.
- Document:
  - restore commands
  - restore owner
  - recovery time target
  - known limitations

## Operational Gaps To Close

- Add a scheduled backup job with separate credentials and storage target.
- Define where backups are stored and who can access them.
- Decide whether deleted materials should be restorable by admins from the app, or only through operational restore.

## Minimum Policy

- Never rely on production storage as the only copy of uploaded materials.
- Never assume Supabase operational durability equals business backup readiness.

# Backup Setup

This repository includes a scheduled backup workflow for:

- Supabase PostgreSQL database dump
- Supabase Storage bucket export
- Optional upload of the backup archive to S3-compatible object storage such as AWS S3 or Cloudflare R2

## What This Does

- Runs on a daily schedule and manual trigger
- Exports the database with `pg_dump`
- Downloads configured Supabase Storage buckets using the service role key
- Saves the result as a GitHub Actions artifact
- Optionally uploads the archive to an external object storage target

## Required GitHub Repository Variables

- `BACKUP_ENABLED`
  - Set to `true` to enable the scheduled job
- `BACKUP_BUCKETS`
  - Comma-separated bucket list
  - Example: `coach-materials,coach-task-files`
- `S3_BACKUP_BUCKET`
  - Backup target bucket name
- `S3_BACKUP_PREFIX`
  - Optional object prefix
  - Example: `er-website/nightly`
- `S3_BACKUP_REGION`
  - Example: `auto` for R2 or `us-east-1` for S3
- `S3_ENDPOINT_URL`
  - Optional
  - Required for R2
  - Example: `https://<accountid>.r2.cloudflarestorage.com`

## Required GitHub Secrets

- `SUPABASE_DB_URL`
  - Direct PostgreSQL connection string used by `pg_dump`
- `SUPABASE_URL`
  - Example: `https://osdynbadhtfgoxilgmpy.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY`
  - Required for private bucket listing and file download
- `AWS_ACCESS_KEY_ID`
  - Required only when uploading the archive to S3-compatible storage
- `AWS_SECRET_ACCESS_KEY`
  - Required only when uploading the archive to S3-compatible storage

## Recommended Initial Configuration

1. Create a dedicated backup target bucket outside the production app path.
2. Create dedicated access keys only for backup upload.
3. Add `coach-materials` and `coach-task-files` to `BACKUP_BUCKETS`.
4. Run the workflow manually once.
5. Confirm:
   - database dump exists
   - storage files are present
   - external upload succeeds
6. Test restore on a non-production environment.

## Important Limits

- This workflow does not restore automatically.
- Database point-in-time recovery is not configured here.
- Large storage buckets may require pagination tuning or longer runtime later.
- If production data grows, retention and compression settings should be revisited.

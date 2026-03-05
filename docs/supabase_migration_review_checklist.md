# Supabase Migration Review Checklist

Use this checklist for any pull request that changes files in `supabase/migrations/` or `supabase/coach_portal_schema.sql`.

## Required Review Items

- Migration file name uses a timestamp prefix and a clear description.
- Schema change is explained in the PR summary.
- Affected tables, functions, triggers, policies, or storage buckets are listed.
- RLS impact is explicitly described.
- `security definer` functions, if any, are justified and scoped narrowly.
- New grants or role changes are documented.
- Data backfill requirements are described, if needed.
- Rollback path is described.
- Deployment order is clear when app code and migrations must ship together.
- Manual verification steps are included.

## Risk Questions

- Does this migration expose new data to `anon` or `authenticated` users?
- Does it widen access through RPC, RLS, or storage policies?
- Does it change auth assumptions such as email-based admin checks?
- Can it break existing clients if applied before frontend changes deploy?
- Can it lock out admins or coaches by mistake?

## Minimum PR Notes

- Migration files changed:
- Supabase objects affected:
- RLS / permission impact:
- Data migration or backfill:
- Rollback approach:

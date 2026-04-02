# Coach Email Onboarding

This document captures the current coach email routing status and the safest Supabase onboarding path.

## Cloudflare Email Routing

The following forwarding aliases are already active on `er-coaching.com`:

| Alias | Forwards to | Status |
| --- | --- | --- |
| `dchoi@er-coaching.com` | `caidychoi@gmail.com` | active |
| `csuh@er-coaching.com` | `suhjy326@gmail.com` | active |

Notes:
- These are forwarding aliases, not full mailboxes.
- If a coach signs up to Supabase with the alias email, verification mail will forward to the linked Gmail inbox.
- If a coach already signed up with a personal Gmail address, keep using that exact Gmail address in `auth.users` and `coach_profiles`.
- Existing `coach_profiles.display_name` values should be preserved when a coach row already exists.
- `campus.12000@gmail.com` is the administrator login for notices and site management. It is not part of the coach alias list.
- `json@er-coaching.com` is the public founder/admin contact for 손지영 대표, not a coach onboarding alias.

## Supabase Provisioning Model

`coach_profiles` can only be linked to rows that already exist in `auth.users`.

That means the safe sequence is:

1. Decide which login email each coach will use:
   - preferred: `@er-coaching.com` alias
   - fallback: existing personal Gmail
2. Have the coach complete signup once with that email.
3. Run the onboarding SQL in `supabase/coach_email_onboarding.sql`.
4. Verify the row in `public.coach_profiles`.

## Known Mapping

Confirmed alias mappings:

| Coach | Preferred login email | Personal inbox |
| --- | --- | --- |
| 최다영 | `dchoi@er-coaching.com` | `caidychoi@gmail.com` |
| 서초윤 | `csuh@er-coaching.com` | `suhjy326@gmail.com` |

Additional onboarding context from the latest coach list:

| Current display name to preserve | Preferred login email | Personal inbox | Notes |
| --- | --- | --- | --- |
| 임효조 | pending | `aaddff4023@naver.com` | no alias requested yet |
| 김수잔 | pending | `sonoggi80@gmail.com` | no alias requested yet |
| 정경하 | pending | `snowdrop0228@gmail.com` | no alias requested yet |
| 주찬미 | pending | `ywamchanmi@gmail.com` | user supplied `박찬미`; preserve current seed display name until confirmed |
| 최다영 | `dchoi@er-coaching.com` | `caidychoi@gmail.com` | alias already active |
| 서초윤 | `csuh@er-coaching.com` | `suhjy326@gmail.com` | alias already active |
| 손지영 대표 | `json@er-coaching.com` | `myjiji82@gmail.com` | founder/admin contact, not a coach onboarding alias |

Pending confirmation:

| Preferred login email | Personal inbox | Missing data |
| --- | --- | --- |
| none | none | all current coach aliases are accounted for |

## When More Coach Emails Arrive

For each new coach:

1. Create a Cloudflare Email Routing rule
2. Confirm the forwarding target
3. Decide the Supabase login email
4. Add the coach to the SQL onboarding file without overwriting an existing display name
5. Run the verification query after signup

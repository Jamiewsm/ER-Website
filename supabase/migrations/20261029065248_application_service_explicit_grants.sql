-- New public tables no longer inherit Data API grants automatically.
-- submit-application uses a server-only service client: catalog reads, INSERT
-- RETURNING, conditional email-delivery claim, and delivery timestamp updates.
-- Additive and safe to replay; preserve existing ACLs and all RLS policies.
BEGIN;
GRANT SELECT ON TABLE public.edu_courses, public.edu_cohorts TO service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.program_applications TO service_role;
COMMIT;

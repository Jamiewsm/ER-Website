-- 동의 증거의 목적별 보관 기간 만료를 매일 확인하고 서버에서 파기한다.
BEGIN;
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
SELECT cron.schedule('er-consent-retention','17 18 * * *','SELECT public.er_purge_expired_consent();');
COMMIT;

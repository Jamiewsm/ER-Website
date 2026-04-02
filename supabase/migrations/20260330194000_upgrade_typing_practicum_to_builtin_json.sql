-- Upgrade typing practicum reports to built-in questionnaire model
-- Keep legacy attachment columns for read compatibility.

alter table if exists public.coach_typing_practicum_reports
  add column if not exists coach_name text,
  add column if not exists client_type text,
  add column if not exists session_at timestamptz,
  add column if not exists recording_url text,
  add column if not exists report_body_json jsonb;

update public.coach_typing_practicum_reports
set coach_name = coalesce(nullif(trim(coach_name), ''), coach_display_name)
where coalesce(nullif(trim(coach_name), ''), '') = '';

update public.coach_typing_practicum_reports
set recording_url = youtube_url
where recording_url is null and youtube_url is not null;

update public.coach_typing_practicum_reports
set report_body_json = jsonb_build_array(
  jsonb_build_object(
    'section_key', 'legacy_note',
    'section_label', '기존 보고서 메모',
    'prompts', jsonb_build_array(),
    'answer', report_body
  )
)
where report_body_json is null and coalesce(nullif(trim(report_body), ''), '') <> '';

alter table if exists public.coach_typing_practicum_reports
  alter column youtube_url drop not null;

alter table if exists public.coach_typing_practicum_reports
  drop constraint if exists coach_typing_practicum_reports_youtube_url_check;

alter table if exists public.coach_typing_practicum_reports
  add constraint coach_typing_practicum_reports_links_check
  check (
    (youtube_url is null or youtube_url ~* '^https?://')
    and (recording_url is null or recording_url ~* '^https?://')
  );

alter table if exists public.coach_typing_practicum_reports
  drop constraint if exists coach_typing_practicum_reports_report_input_check;

alter table if exists public.coach_typing_practicum_reports
  add constraint coach_typing_practicum_reports_report_input_check
  check (
    coalesce(nullif(trim(report_body), ''), '') <> ''
    or report_body_json is not null
    or attachment_path is not null
  );

-- Remove in-body "모바일 브로셔" links from Parenting / Magazine notices (distribution is PNG/PDF, not site nav)

UPDATE public.public_notices
SET body = regexp_replace(
  body,
  '<a href="/parents-brochure\.html"[^>]*>모바일 브로셔</a>',
  '',
  'g'
)
WHERE legacy_key IN ('3', '4')
   OR title ILIKE '%Parenting%'
   OR title ILIKE '%매거진%';

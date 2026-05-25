-- Point "모바일 브로셔" links to hosted PDF (replaces deleted parents-brochure.html)

UPDATE public.public_notices
SET body = regexp_replace(
  body,
  'href="/parents-brochure\.html[^"]*"',
  'href="/parenting-workshop/mobile-brochure.pdf" target="_blank" rel="noopener noreferrer"',
  'g'
)
WHERE body ~ 'parents-brochure\.html';

UPDATE public.public_notices
SET body = regexp_replace(
  body,
  'href="/parenting-workshop/mobile-brochure\.pdf"(?![^>]*target=)',
  'href="/parenting-workshop/mobile-brochure.pdf" target="_blank" rel="noopener noreferrer"',
  'g'
)
WHERE body ~ 'parenting-workshop/mobile-brochure\.pdf';

-- 9월 Parenting 세미나 · 10월 기본과정 모집 예정 공지 추가
INSERT INTO public.public_notices (
  legacy_key,
  tag,
  title,
  summary,
  body,
  body_is_html,
  published_at
)
VALUES
  (
    8,
    '모집 예정',
    'Enneagram for Parenting — 9월 세미나 모집 예정',
    '9월 Parenting 세미나 · 부모의 자기이해와 아이 이해 · 일정 확정 후 안내',
    '<p class="text-gray-600 leading-relaxed break-keep"><strong>2026년 9월 Enneagram for Parenting 세미나</strong> 모집을 준비하고 있습니다. 에니어그램을 어느 정도 알고 계신 부모님이 반복되는 양육 반응을 성찰하고, 자녀를 새롭게 바라보는 시간입니다.</p><div class="mt-6 grid gap-3"><div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"><span class="text-xs font-bold text-gray-500 w-20">시기</span><span class="text-sm text-gray-700 break-keep">2026년 9월 예정 (일정 확정 후 안내)</span></div><div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"><span class="text-xs font-bold text-gray-500 w-20">대상</span><span class="text-sm text-gray-700 break-keep">유형을 어느 정도 알고 계신 부모님</span></div><div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"><span class="text-xs font-bold text-gray-500 w-20">형태</span><span class="text-sm text-gray-700 break-keep">온라인 Zoom · 소규모</span></div></div><p class="mt-6 flex flex-wrap gap-3"><a href="/parenting-workshop.html" class="inline-flex items-center justify-center rounded-full bg-er-dark text-white px-5 py-2.5 text-sm font-bold shadow-soft hover:bg-gray-800 transition-colors">Parenting 안내 보기</a><a href="/#apply?track=paid&amp;focus=parenting_workshop" class="inline-flex items-center justify-center rounded-full border border-er-accent/40 bg-er-accentLight/30 px-5 py-2.5 text-sm font-bold text-er-dark hover:border-er-accent transition-colors">관심 문의·신청</a></p>',
    true,
    date '2026-07-10'
  ),
  (
    9,
    '모집 예정',
    '에니어그램 기본과정 8주 — 10월 기수 모집 예정',
    '10월 개강 예정 · 8주 온라인 · 모집 일정은 추후 공지',
    '<p class="text-gray-600 leading-relaxed break-keep"><strong>2026년 10월 ER 성경적 에니어그램 기본과정</strong> 모집을 준비하고 있습니다. 7월 기수와 동일하게 8주 온라인 과정으로, 관계 속에서 드러나는 나를 이해하고 복음 안에서 회복을 경험하는 시간입니다.</p><div class="mt-6 grid gap-3"><div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"><span class="text-xs font-bold text-gray-500 w-20">개강</span><span class="text-sm text-gray-700 break-keep">2026년 10월 예정 (일정 확정 후 안내)</span></div><div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"><span class="text-xs font-bold text-gray-500 w-20">구성</span><span class="text-sm text-gray-700 break-keep">8주 · 주 1회 강의 3시간 + 1:1 멘토링 1시간</span></div><div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"><span class="text-xs font-bold text-gray-500 w-20">형태</span><span class="text-sm text-gray-700 break-keep">온라인 Zoom · 소규모</span></div></div><p class="mt-6 flex flex-wrap gap-3"><a href="/basic-course.html" class="inline-flex items-center justify-center rounded-full bg-er-dark text-white px-5 py-2.5 text-sm font-bold shadow-soft hover:bg-gray-800 transition-colors">과정 안내 보기</a><a href="mailto:json@er-coaching.com?subject=%EB%8B%A4%EC%9D%8C%20%EA%B8%B0%EB%B3%B8%EA%B3%BC%EC%A0%95%20%EC%95%8C%EB%A6%BC%20%EC%9A%94%EC%B2%AD" class="inline-flex items-center justify-center rounded-full border border-er-accent/40 bg-er-accentLight/30 px-5 py-2.5 text-sm font-bold text-er-dark hover:border-er-accent transition-colors">10월 기수 알림 신청</a></p>',
    true,
    date '2026-07-10'
  )
ON CONFLICT (legacy_key) DO UPDATE SET
  tag = EXCLUDED.tag,
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  body = EXCLUDED.body,
  body_is_html = EXCLUDED.body_is_html,
  published_at = EXCLUDED.published_at,
  updated_at = now();

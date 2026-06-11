-- 7월 에니어그램 기본과정 8주 모집 공지

insert into public.public_notices (
  legacy_key,
  tag,
  title,
  summary,
  body,
  body_is_html,
  published_at,
  program_period,
  program_target,
  apply_deadline
)
values (
  7,
  '모집중',
  '에니어그램 기본과정 8주 — 7월 개강',
  '온라인 8주 · 1:1 멘토링 · 정원 10명 · 얼리버드 $270 (6/24까지)',
  '<p class="text-gray-600 leading-relaxed break-keep"><strong>ER 성경적 에니어그램 기본과정</strong>은 단순히 유형을 배우는 시간이 아니라, 하나님이 창조하신 나의 오리지널 디자인을 이해하고 복음 안에서 회복과 성장을 경험하는 8주 과정입니다.</p><div class="mt-6 grid gap-3"><div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"><span class="text-xs font-bold text-gray-500 w-20">기간</span><span class="text-sm text-gray-700 break-keep">2026년 7월 개강 · 8주</span></div><div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"><span class="text-xs font-bold text-gray-500 w-20">구성</span><span class="text-sm text-gray-700 break-keep">주 1회 강의 3시간 + 1:1 멘토링 1시간</span></div><div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"><span class="text-xs font-bold text-gray-500 w-20">수강료</span><span class="text-sm text-gray-700 break-keep">$300 (USD) · 6/24까지 얼리버드 $270</span></div><div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"><span class="text-xs font-bold text-gray-500 w-20">결제</span><span class="text-sm text-gray-700 break-keep">PayPal · Zelle (등록 안내 메일로 안내)</span></div><div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"><span class="text-xs font-bold text-gray-500 w-20">정원</span><span class="text-sm text-gray-700 break-keep">최대 10명 · 결제 완료 순 확정</span></div></div><p class="mt-6 flex flex-wrap gap-3"><a href="/basic-course.html" class="inline-flex items-center justify-center rounded-full bg-er-dark text-white px-5 py-2.5 text-sm font-bold shadow-soft hover:bg-gray-800 transition-colors">과정 안내 보기</a><a href="/#apply?track=paid&amp;focus=enneagram_basic_july&amp;apply_source=notice" class="inline-flex items-center justify-center rounded-full border border-er-accent/40 bg-er-accentLight/30 px-5 py-2.5 text-sm font-bold text-er-dark hover:border-er-accent transition-colors">신청하기</a></p>',
  true,
  date '2026-06-11',
  '2026년 7월 개강 · 8주',
  '에니어그램 기초부터 체계적으로 배우고 싶은 분',
  date '2026-07-05'
)
on conflict (legacy_key) do update set
  tag = excluded.tag,
  title = excluded.title,
  summary = excluded.summary,
  body = excluded.body,
  body_is_html = excluded.body_is_html,
  published_at = excluded.published_at,
  program_period = excluded.program_period,
  program_target = excluded.program_target,
  apply_deadline = excluded.apply_deadline,
  updated_at = now();

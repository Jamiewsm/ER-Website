-- 10월 에니어그램 기본과정 8주 모집 공지 (기존 7월 개강 공지를 모집 공지로 갱신)
UPDATE public.public_notices
SET
  tag = '모집중',
  title = '에니어그램 기본과정 8주 — 10월 기수 모집',
  summary = '10월 첫주 개강 · 선착순 8명 · 얼리버드 $270 (9/17까지) · 8주 온라인',
  body = '<p class="text-gray-600 leading-relaxed break-keep"><strong>2026년 10월 ER 성경적 에니어그램 기본과정</strong> 모집을 시작합니다. 관계 속에서 드러나는 나를 이해하고, 하나님 안에서 본래의 나로 회복되는 8주 온라인 과정입니다.</p><div class="mt-6 grid gap-3"><div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"><span class="text-xs font-bold text-gray-500 w-20">개강</span><span class="text-sm text-gray-700 break-keep">2026년 10월 첫주 (요일·시간은 참여자와 조율)</span></div><div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"><span class="text-xs font-bold text-gray-500 w-20">정원</span><span class="text-sm text-gray-700 break-keep">선착순 8명 · 입금 확인 순 확정</span></div><div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"><span class="text-xs font-bold text-gray-500 w-20">구성</span><span class="text-sm text-gray-700 break-keep">8주 · 주 1회 강의 3시간 + 1:1 멘토링 1시간</span></div><div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"><span class="text-xs font-bold text-gray-500 w-20">수강료</span><span class="text-sm text-gray-700 break-keep">$300 · 9월 17일까지 얼리버드 $270</span></div></div><p class="mt-6 flex flex-wrap gap-3"><a href="/basic-course.html" class="inline-flex items-center justify-center rounded-full bg-er-dark text-white px-5 py-2.5 text-sm font-bold shadow-soft hover:bg-gray-800 transition-colors">과정 안내 보기</a><a href="/#apply?track=paid&focus=enneagram_basic_july" class="inline-flex items-center justify-center rounded-full border border-er-accent/40 bg-er-accentLight/30 px-5 py-2.5 text-sm font-bold text-er-dark hover:border-er-accent transition-colors">지금 신청하기</a></p>',
  published_at = '2026-08-27',
  program_period = '2026년 10월 첫주 개강 · 8주',
  program_target = '자기 이해와 관계 회복을 원하는 성인',
  updated_at = now()
WHERE title LIKE '%기본과정 8주%'
  AND (title LIKE '%7월%' OR title LIKE '%10월%');

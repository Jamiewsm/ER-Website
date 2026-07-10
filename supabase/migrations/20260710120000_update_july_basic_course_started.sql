-- 7월 에니어그램 기본과정 8주 — 기수 개강 후 공지 갱신

update public.public_notices
set
  tag = '안내',
  title = '에니어그램 기본과정 8주 — 7월 기수 개강',
  summary = 'A·B반 총 13명 · A반 7/7 · B반 7/10 개강 · 8주 온라인',
  body = '<p class="text-gray-600 leading-relaxed break-keep"><strong>2026년 7월 ER 성경적 에니어그램 기본과정</strong>이 A반·B반으로 나뉘어 시작되었습니다. 참여자 시간대에 맞춰 두 반으로 진행하며, 총 <strong>13명</strong>이 함께합니다.</p><div class="mt-6 grid gap-3"><div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"><span class="text-xs font-bold text-gray-500 w-20">A반</span><span class="text-sm text-gray-700 break-keep">2026년 7월 7일(월) 개강</span></div><div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"><span class="text-xs font-bold text-gray-500 w-20">B반</span><span class="text-sm text-gray-700 break-keep">2026년 7월 10일(목) 개강</span></div><div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"><span class="text-xs font-bold text-gray-500 w-20">구성</span><span class="text-sm text-gray-700 break-keep">8주 · 주 1회 강의 3시간 + 1:1 멘토링 1시간</span></div><div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"><span class="text-xs font-bold text-gray-500 w-20">모집</span><span class="text-sm text-gray-700 break-keep">7월 기수 모집 마감 (7/5)</span></div></div><p class="mt-6 flex flex-wrap gap-3"><a href="/basic-course.html" class="inline-flex items-center justify-center rounded-full bg-er-dark text-white px-5 py-2.5 text-sm font-bold shadow-soft hover:bg-gray-800 transition-colors">과정 안내 보기</a><a href="mailto:json@er-coaching.com?subject=%EB%8B%A4%EC%9D%8C%20%EA%B8%B0%EB%B3%B8%EA%B3%BC%EC%A0%95%20%EC%95%8C%EB%A6%BC%20%EC%9A%94%EC%B2%AD" class="inline-flex items-center justify-center rounded-full border border-er-accent/40 bg-er-accentLight/30 px-5 py-2.5 text-sm font-bold text-er-dark hover:border-er-accent transition-colors">다음 기수 알림 문의</a></p>',
  published_at = date '2026-07-10',
  program_period = '2026년 7월 기수 · A반 7/7 · B반 7/10',
  program_target = '7월 기수 수강생 · 다음 기수 관심자',
  apply_deadline = null,
  updated_at = now()
where legacy_key = 7;

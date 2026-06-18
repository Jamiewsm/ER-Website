-- 2026-06 공지 업데이트: 매거진 정정, 양성반 5·6기, 4기 수료, 인스타그램 런칭

-- 1) 매거진 공지: 워크샵 모집 내용 제거, 매거진 콘텐츠만 안내
update public.public_notices
set
  summary = 'ER 의 회복 사역 이야기와 인사이트를 담은 매거진 창간호',
  body = '<p class="text-gray-600 leading-relaxed break-keep">ER 매거진 창간호가 나왔습니다. 회복의 여정에서 만난 분들의 이야기와, 에니어그램과 기독교 세계관을 통합한 사역의 인사이트를 한 권에 담았습니다.</p><div class="mt-8 rounded-2xl border border-er-accent/25 bg-er-accentLight/25 p-5 md:p-6"><p class="text-[10px] font-bold uppercase tracking-[0.2em] text-er-accent mb-2">창간호 하이라이트</p><h3 class="text-lg font-bold text-er-dark break-keep">회복의 이야기 — 사역 현장에서 만난 변화</h3><p class="mt-3 text-sm text-gray-600 leading-relaxed break-keep">코칭·강의를 통해 자기 이해와 관계 회복을 경험한 분들의 실제 이야기, ER 관점에서 읽는 에니어그램과 복음적 세계관, 그리고 독자가 스스로 돌아볼 수 있는 성찰 질문을 소개합니다.</p><ul class="mt-4 space-y-2 text-sm text-gray-600 list-none pl-0"><li class="break-keep">· 회복 사역 현장 인터뷰와 사례</li><li class="break-keep">· 에니어그램을 삶의 언어로 바꾸는 ER 관점</li><li class="break-keep">· 계절별로 이어지는 주제 에세이</li></ul></div><p class="mt-6 text-xs text-er-muted break-keep">전체 PDF 다운로드는 준비 중이며, 계절별 하이라이트는 웹에서 먼저 만나보실 수 있습니다. 워크샵·프로그램 모집은 별도 공지에서 안내합니다.</p>',
  body_is_html = true,
  updated_at = now()
where legacy_key = 3;

-- 2) 전문가 양성반 5기(7월)·6기(9월) 모집
update public.public_notices
set
  tag = '모집중',
  title = 'ER 전문가 양성반 5기·6기 모집',
  summary = '7월 5기 개강, 9월 6기 개강 예정 — 8주 온라인 전문가 과정',
  body = '<p class="text-gray-600 leading-relaxed break-keep">에니어그램을 "아는 단계"에서 끝내지 않고, 삶과 코칭·강의 현장에 적용하는 단계까지 함께 가는 <strong>ER 전문가 양성반</strong>입니다. 매주 심화 수업과 과제, 1:1 멘토링과 강의 피드백을 통해 실제 현장에서 자신 있게 사용할 수 있도록 돕습니다.</p><div class="mt-6 grid gap-3"><div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"><span class="text-xs font-bold text-gray-500 w-20">5기</span><span class="text-sm text-gray-700 break-keep">2026년 7월 개강</span></div><div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"><span class="text-xs font-bold text-gray-500 w-20">6기</span><span class="text-sm text-gray-700 break-keep">2026년 9월 개강 예정</span></div><div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"><span class="text-xs font-bold text-gray-500 w-20">구성</span><span class="text-sm text-gray-700 break-keep">8주 온라인 · 강의·과제·멘토링</span></div><div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"><span class="text-xs font-bold text-gray-500 w-20">대상</span><span class="text-sm text-gray-700 break-keep">기독교 세계관 안에서 자기 이해와 타인 돌봄(코칭·강의)에 실제로 적용하고자 하는 분</span></div></div><p class="mt-6 flex flex-wrap gap-3"><a href="/#coach_training" class="inline-flex items-center justify-center rounded-full bg-er-dark text-white px-5 py-2.5 text-sm font-bold shadow-soft hover:bg-gray-800 transition-colors">양성반 안내 보기</a><a href="/#apply?track=paid" class="inline-flex items-center justify-center rounded-full border border-er-accent/40 bg-er-accentLight/30 px-5 py-2.5 text-sm font-bold text-er-dark hover:border-er-accent transition-colors">문의·신청하기</a></p>',
  body_is_html = true,
  published_at = date '2026-06-11',
  program_period = '5기 2026년 7월 · 6기 2026년 9월',
  program_target = '코칭·강의 현장 적용을 준비하는 분',
  apply_deadline = null,
  updated_at = now()
where legacy_key = 1;

-- 3) 양성반 4기 수료
insert into public.public_notices (
  legacy_key,
  tag,
  title,
  summary,
  body,
  body_is_html,
  published_at
)
values (
  5,
  '축하',
  '전문가 양성반 4기 수료 — 7명 졸업',
  '4기 수료생 7분이 8주 과정을 마치고 다음 단계로 나아갑니다',
  '<p class="text-gray-600 leading-relaxed break-keep"><strong>ER 전문가 양성반 4기</strong> 수료를 축하드립니다. 8주 동안 이론과 적용, 멘토링을 함께 걸어온 <strong>7분</strong>이 과정을 마치고 스터디·코칭스쿨 등 다음 여정으로 이어갑니다.</p><p class="mt-4 text-sm text-gray-600 leading-relaxed break-keep">수료생 여러분의 회복 사역을 응원합니다. 앞으로도 ER 공동체 안에서 서로 세워 주는 동역이 이어지기를 바랍니다.</p>',
  true,
  date '2026-06-10'
)
on conflict (legacy_key) do update set
  tag = excluded.tag,
  title = excluded.title,
  summary = excluded.summary,
  body = excluded.body,
  body_is_html = excluded.body_is_html,
  published_at = excluded.published_at,
  updated_at = now();

-- 4) 인스타그램 공식 런칭
insert into public.public_notices (
  legacy_key,
  tag,
  title,
  summary,
  body,
  body_is_html,
  published_at
)
values (
  6,
  '안내',
  'ER 인스타그램 공식 런칭',
  '코칭·강의·회복 사역 소식을 더 가깝게 — @er_official_Korea',
  '<p class="text-gray-600 leading-relaxed break-keep">ER 인스타그램 계정이 공식 런칭되었습니다. 코칭·강의 일정, 회복 사역 인사이트, 짧은 묵상과 현장 소식을 더 자주 전해 드립니다.</p><p class="mt-4 text-sm text-gray-600 leading-relaxed break-keep">관심 있으시면 팔로우해 주세요. 새 소식과 모집 안내도 인스타그램에서 함께 나눕니다.</p><p class="mt-6 flex flex-wrap gap-3"><a href="https://www.instagram.com/er_official_Korea/" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center gap-2 rounded-full bg-er-dark text-white px-5 py-2.5 text-sm font-bold shadow-soft hover:bg-gray-800 transition-colors"><i class="fab fa-instagram"></i> @er_official_Korea 팔로우하기</a></p>',
  true,
  date '2026-06-11'
)
on conflict (legacy_key) do update set
  tag = excluded.tag,
  title = excluded.title,
  summary = excluded.summary,
  body = excluded.body,
  body_is_html = excluded.body_is_html,
  published_at = excluded.published_at,
  updated_at = now();

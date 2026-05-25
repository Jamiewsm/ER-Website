-- Seed bundled notices (legacy_key 3, 4) for Supabase public_notices.
-- Site also merges js/strings.js fallbacks when rows are missing.

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
values
(
  3,
  '발행',
  'ER 매거진 창간호 발행',
  'ER 의 회복 사역 이야기와 인사이트를 담은 매거진 첫 호가 나왔습니다.',
  '<p class="text-gray-600 leading-relaxed break-keep">ER 매거진 창간호가 나왔습니다. 회복의 여정에서 만난 분들의 이야기와, 에니어그램과 기독교 세계관을 통합한 사역의 인사이트를 한 권에 담았습니다. 자세한 안내는 곧 업데이트 됩니다.</p>',
  true,
  date '2026-05-24',
  null,
  null,
  null
),
(
  4,
  '모집중',
  'Enneagram for Parenting — 6월 4주 워크샵 모집',
  '나를 알고, 아이를 이해하는 4주 자녀양육 심화 워크샵 — 부모의 자기이해와 복음적 회복의 관점',
  '<p class="text-gray-600 leading-relaxed break-keep">양육의 변화는 부모의 자기이해에서 시작됩니다. <strong>Enneagram for Parenting</strong>는 에니어그램 입문이 아닌 심화 과정으로, 자신의 유형을 어느 정도 알고 계신 부모님이 반복되는 양육 반응을 성찰하고 자녀를 새롭게 바라보는 4주 워크샵입니다.</p><div class="mt-6 grid gap-3"><div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"><span class="text-xs font-bold text-gray-500 w-20">기간</span><span class="text-sm text-gray-700 break-keep">6월 셋째 주–7월 둘째 주 (일정 확정 후 안내)</span></div><div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"><span class="text-xs font-bold text-gray-500 w-20">대상</span><span class="text-sm text-gray-700 break-keep">ER 강의·세션 등을 통해 유형을 어느 정도 알고 계신 부모님</span></div><div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"><span class="text-xs font-bold text-gray-500 w-20">구성</span><span class="text-sm text-gray-700 break-keep">4주 / 총 10시간 · 주 1회 온라인 Zoom · $120</span></div><div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"><span class="text-xs font-bold text-gray-500 w-20">모집</span><span class="text-sm text-gray-700 break-keep">소규모 선착순</span></div></div><p class="mt-6 flex flex-wrap gap-3"><a href="/parenting-workshop.html" class="inline-flex items-center justify-center rounded-full bg-er-dark text-white px-5 py-2.5 text-sm font-bold shadow-soft hover:bg-gray-800 transition-colors">워크샵 안내 보기</a><a href="/parents-brochure.html" class="inline-flex items-center justify-center rounded-full border border-er-accent/40 bg-er-accentLight/30 px-5 py-2.5 text-sm font-bold text-er-dark hover:border-er-accent transition-colors">모바일 브로셔</a></p>',
  true,
  date '2026-05-24',
  '6월 셋째 주–7월 둘째 주 (일정 확정 후 안내)',
  'ER 강의·세션 등을 통해 유형을 어느 정도 알고 계신 부모님',
  null
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

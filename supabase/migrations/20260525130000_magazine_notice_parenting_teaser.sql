-- Magazine notice (legacy_key 3): Parenting season teaser + web CTAs

update public.public_notices
set
  summary = 'ER 의 회복 사역 이야기와 인사이트를 담은 매거진 첫 호 — 이번 호 Parenting 하이라이트',
  body = '<p class="text-gray-600 leading-relaxed break-keep">ER 매거진 창간호가 나왔습니다. 회복의 여정에서 만난 분들의 이야기와, 에니어그램과 기독교 세계관을 통합한 사역의 인사이트를 담았습니다.</p><div class="mt-8 rounded-2xl border border-er-accent/25 bg-er-accentLight/25 p-5 md:p-6"><p class="text-[10px] font-bold uppercase tracking-[0.2em] text-er-accent mb-2">이번 호 · Special</p><h3 class="text-lg font-bold text-er-dark break-keep">Parenting — 양육은 부모의 자기이해에서 시작됩니다</h3><p class="mt-3 text-sm text-gray-600 leading-relaxed break-keep">창간호에서는 부모가 자신의 반복 패턴을 돌아보고, 아이의 오리지널 디자인을 새롭게 바라보는 관점을 소개합니다. 6월 <strong>Enneagram for Parenting</strong> 4주 워크샵과 이어지는 계절의 주제입니다.</p><ul class="mt-4 space-y-2 text-sm text-gray-600 list-none pl-0"><li class="break-keep">· 입문이 아닌 심화 — 유형을 어느 정도 아시는 부모님 대상</li><li class="break-keep">· 4주 · 온라인 Zoom · 소규모 선착순 · $120</li></ul><p class="mt-5 flex flex-wrap gap-3"><a href="/parenting-workshop.html?apply_source=magazine" class="inline-flex items-center justify-center rounded-full bg-er-dark text-white px-5 py-2.5 text-sm font-bold shadow-soft hover:bg-gray-800 transition-colors">워크샵 안내 보기</a><a href="/parents-brochure.html" class="inline-flex items-center justify-center rounded-full border border-er-accent/40 bg-er-accentLight/30 px-5 py-2.5 text-sm font-bold text-er-dark hover:border-er-accent transition-colors">모바일 브로셔</a></p></div><p class="mt-6 text-xs text-er-muted break-keep">전체 PDF 다운로드는 준비 중이며, 계절별 하이라이트는 웹에서 먼저 만나보실 수 있습니다.</p>',
  body_is_html = true,
  updated_at = now()
where legacy_key = 3;

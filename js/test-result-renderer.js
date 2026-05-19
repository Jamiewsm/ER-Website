// ER 에니어그램 테스트 결과지 렌더러 — 27 subtype lookup + 카드 HTML 생성 (Phase 5).
// 의존: window.SubtypesData (subtypes-27-data.js), window.TestShared (test-shared.js, 선택).

(function () {
  'use strict';

  function escapeHtml(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getSubtypeProfile(subtypeKey) {
    if (typeof window === 'undefined' || !window.SubtypesData || !window.SubtypesData.SUBTYPES_27) return null;
    return window.SubtypesData.SUBTYPES_27[subtypeKey] || null;
  }

  // 본능 % 시각화 — 단순 progress bar (0-100).
  function instinctBarHtml(label, pct) {
    const safePct = Math.max(0, Math.min(100, pct || 0));
    return `
      <div class="flex items-center gap-3 mb-2">
        <span class="text-xs font-bold text-gray-500 w-10">${escapeHtml(label)}</span>
        <div class="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
          <div class="bg-[#bfa68a] h-2 rounded-full" style="width: ${safePct}%"></div>
        </div>
        <span class="text-xs font-semibold text-gray-700 w-12 text-right">${safePct}%</span>
      </div>`;
  }

  function buildHeaderCard(profile, phase3Result) {
    const cleanName = profile.name + (profile.countertype ? ' (countertype)' : '');
    return `
      <div class="bg-[#f5f5f0] p-6 rounded-2xl border-l-4 border-[#bfa68a]">
        <p class="text-xs text-gray-400 font-bold uppercase mb-1">Your 27 Subtype</p>
        <h3 class="text-2xl font-bold text-[#4a4540] mb-1">${escapeHtml(profile.nameKr)} — ${escapeHtml(cleanName)}</h3>
        <p class="text-sm text-gray-600">${escapeHtml(profile.preoccupation)}</p>
      </div>`;
  }

  function buildCountertypeWarning(profile) {
    if (!profile.countertype) return '';
    return `
      <div class="bg-amber-50 border border-amber-200 p-5 rounded-2xl">
        <h4 class="text-sm font-bold text-amber-800 mb-2">⚠ Countertype 안내</h4>
        <p class="text-sm text-amber-900 leading-relaxed">이 subtype 은 일반 ${escapeHtml(String(profile.coreType))}번 stereotype 과 다르게 보일 수 있습니다. 같은 코어 안에서도 이 표현은 자기 진단에서 오해되기 쉬워, 자기 type 을 다른 type 으로 의심하기도 합니다. 핵심 동기 (위 카드 참조) 가 진단의 1차 기준입니다.</p>
      </div>`;
  }

  function buildSignaturesCard(profile) {
    const items = (profile.signatures || []).map((s) => `<li class="leading-relaxed">${escapeHtml(s)}</li>`).join('');
    return `
      <div class="bg-gray-50 p-5 rounded-2xl border border-gray-100">
        <h4 class="text-sm font-bold text-[#4a4540] mb-3">행동 시그니처</h4>
        <ul class="list-disc pl-5 text-sm text-gray-700 space-y-1">${items}</ul>
      </div>`;
  }

  function buildDefenseShadowCard(profile) {
    return `
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div class="bg-gray-50 p-5 rounded-2xl border border-gray-100">
          <h4 class="text-xs font-bold text-gray-400 uppercase mb-2">방어 패턴</h4>
          <p class="text-sm text-gray-700 leading-relaxed">${escapeHtml(profile.defense)}</p>
        </div>
        <div class="bg-gray-50 p-5 rounded-2xl border border-gray-100">
          <h4 class="text-xs font-bold text-gray-400 uppercase mb-2">그림자 / 맹점</h4>
          <p class="text-sm text-gray-700 leading-relaxed">${escapeHtml(profile.shadow)}</p>
        </div>
      </div>`;
  }

  function buildSisterDiffCard(profile) {
    const entries = Object.entries(profile.sisterDifferences || {});
    if (entries.length === 0) return '';
    const items = entries.map(([k, v]) => `<li class="leading-relaxed"><span class="font-bold text-[#4a4540]">vs ${escapeHtml(k)}</span> — ${escapeHtml(v)}</li>`).join('');
    return `
      <div class="bg-gray-50 p-5 rounded-2xl border border-gray-100">
        <h4 class="text-sm font-bold text-[#4a4540] mb-3">같은 코어의 다른 두 subtype 과 차이</h4>
        <ul class="list-disc pl-5 text-sm text-gray-700 space-y-2">${items}</ul>
      </div>`;
  }

  function buildConfusedWithCard(profile) {
    if (!profile.confusedWith) return '';
    return `
      <div class="bg-gray-50 p-5 rounded-2xl border border-gray-100">
        <h4 class="text-sm font-bold text-[#4a4540] mb-2">자주 헷갈리는 다른 코어 type</h4>
        <p class="text-sm text-gray-700 leading-relaxed">${escapeHtml(profile.confusedWith)}</p>
      </div>`;
  }

  function buildDescriptionCard(profile) {
    return `
      <div class="bg-[#4a4540] text-white p-6 rounded-2xl">
        <h4 class="text-xs font-bold text-[#bfa68a] uppercase mb-3">결과 카피</h4>
        <p class="text-sm leading-relaxed">${escapeHtml(profile.description)}</p>
      </div>`;
  }

  function buildInstinctBarsCard(phase3Result) {
    if (!phase3Result || !phase3Result.instinctPct) return '';
    const ip = phase3Result.instinctPct;
    return `
      <div class="bg-gray-50 p-5 rounded-2xl border border-gray-100">
        <h4 class="text-sm font-bold text-[#4a4540] mb-3">본능 스택 (각 본능 절대 강도)</h4>
        ${instinctBarHtml('sp', ip.sp)}
        ${instinctBarHtml('sx', ip.sx)}
        ${instinctBarHtml('so', ip.so)}
        <p class="text-xs text-gray-500 mt-2">각 본능은 독립 측정 (합 100% 아님). 가장 낮은 본능 = blind/repressed (성장 영역).</p>
      </div>`;
  }

  function buildWingBarCard(phase3Result) {
    if (!phase3Result || !phase3Result.wing || phase3Result.wing.wing === null) {
      return `
        <div class="bg-gray-50 p-5 rounded-2xl border border-gray-100">
          <h4 class="text-sm font-bold text-[#4a4540] mb-3">Wing 강도</h4>
          <p class="text-sm text-gray-600">두 wing 균형 — 순수 type 표현이 우세합니다.</p>
        </div>`;
    }
    const { wing, pct } = phase3Result.wing;
    let band = '거의 무 wing';
    if (pct >= 81) band = '매우 강 (wing type 으로 오진단 위험)';
    else if (pct >= 61) band = '강 wing';
    else if (pct >= 41) band = '중 wing';
    else if (pct >= 21) band = '약 wing';
    return `
      <div class="bg-gray-50 p-5 rounded-2xl border border-gray-100">
        <h4 class="text-sm font-bold text-[#4a4540] mb-3">Wing ${escapeHtml(String(wing))} 강도</h4>
        ${instinctBarHtml('w' + wing, pct)}
        <p class="text-xs text-gray-500 mt-2">${escapeHtml(band)}</p>
      </div>`;
  }

  // 메인 — 결과지 카드 HTML 을 컨테이너에 주입.
  // phase3Result: { coreType, wing, instinctPct, dominantInstinct, subtype, countertype, formatted }
  function renderResultCards(phase3Result, container) {
    if (!container) return;
    if (!phase3Result || !phase3Result.subtype) {
      container.innerHTML = '<p class="text-sm text-gray-500">결과 데이터 없음 (코어 확정 후 표시).</p>';
      return;
    }
    const profile = getSubtypeProfile(phase3Result.subtype);
    if (!profile) {
      container.innerHTML = `<p class="text-sm text-gray-500">subtype 콘텐츠 미발견: ${escapeHtml(phase3Result.subtype)}</p>`;
      return;
    }
    container.innerHTML = [
      buildHeaderCard(profile, phase3Result),
      buildCountertypeWarning(profile),
      buildSignaturesCard(profile),
      buildDefenseShadowCard(profile),
      buildSisterDiffCard(profile),
      buildConfusedWithCard(profile),
      buildWingBarCard(phase3Result),
      buildInstinctBarsCard(phase3Result),
      buildDescriptionCard(profile),
    ].filter(Boolean).join('\n');
  }

  const TestResultRenderer = { renderResultCards, getSubtypeProfile };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = TestResultRenderer;
  }
  if (typeof window !== 'undefined') {
    window.TestResultRenderer = Object.assign(window.TestResultRenderer || {}, TestResultRenderer);
  }
})();

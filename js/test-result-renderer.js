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

  // === Phase 6 — 신규 헬퍼 ===
  //
  // 3 Center 컬러 매핑 (test-charts.js 와 동기화).
  const CENTER_OF = { 1: 'body', 8: 'body', 9: 'body', 2: 'heart', 3: 'heart', 4: 'heart', 5: 'head', 6: 'head', 7: 'head' };
  const CENTER_COLOR = { body: '#C44536', heart: '#5A8F69', head: '#3D5A80' };

  // Subtype Hero — Section 9 (YOUR 27 SUBTYPE) main 카드.
  function renderSubtypeHeader(phase3Result, container) {
    if (!container || !phase3Result || !phase3Result.subtype) return;
    const profile = getSubtypeProfile(phase3Result.subtype);
    if (!profile) return;
    const centerKey = CENTER_OF[profile.coreType];
    const color = CENTER_COLOR[centerKey];
    container.innerHTML = `
      <div class="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
        <div class="px-6 py-5 text-white" style="background:${color}">
          <p class="text-[10px] uppercase tracking-[0.3em] opacity-80 mb-1">Center · ${centerKey.toUpperCase()}</p>
          <h4 class="text-2xl font-bold">${escapeHtml(profile.nameKr)} — ${escapeHtml(profile.name)}${profile.countertype ? ' <span class="text-sm font-normal opacity-90">(countertype)</span>' : ''}</h4>
        </div>
        <div class="p-6 bg-white">
          <p class="text-xs font-bold text-gray-400 uppercase mb-2">핵심 집착</p>
          <p class="text-sm text-gray-800 leading-relaxed">${escapeHtml(profile.preoccupation)}</p>
        </div>
      </div>`;
  }

  // Countertype Full Card — Section 11. countertype 일 때만 표시.
  function renderCountertypeFull(phase3Result, sectionEl, cardEl) {
    if (!sectionEl || !cardEl) return;
    if (!phase3Result || !phase3Result.countertype) {
      sectionEl.classList.add('hidden');
      return;
    }
    sectionEl.classList.remove('hidden');
    const profile = getSubtypeProfile(phase3Result.subtype);
    if (!profile) return;
    // 같은 코어의 다른 두 subtype 과의 차이를 직접 노출.
    const sisterDiffs = Object.entries(profile.sisterDifferences || {});
    const sisterHtml = sisterDiffs.map(([k, v]) => `<li><span class="font-bold text-amber-900">vs ${escapeHtml(k)}</span> — ${escapeHtml(v)}</li>`).join('');
    cardEl.innerHTML = `
      <div class="rounded-2xl overflow-hidden border-2 border-amber-300 bg-amber-50">
        <div class="bg-amber-600 px-6 py-4 text-white">
          <p class="text-xs uppercase tracking-widest opacity-80">9개 Countertype 중 하나</p>
          <h4 class="text-lg font-bold">${escapeHtml(profile.subtype || phase3Result.subtype)} · ${escapeHtml(profile.name)}</h4>
        </div>
        <div class="p-6 space-y-4">
          <p class="text-sm text-amber-950 leading-relaxed">
            이 subtype 은 일반 ${escapeHtml(String(profile.coreType))}번 stereotype 과 <strong>반대로 보일 수 있습니다.</strong>
            그래서 자기 진단 시 다른 type 으로 오해받기 쉬워, 가장 신경 써서 봐야 할 자리입니다.
          </p>
          <div>
            <p class="text-xs font-bold text-amber-900 uppercase mb-2">같은 코어의 다른 두 subtype 과 차이</p>
            <ul class="list-disc pl-5 text-sm text-amber-950 space-y-2">${sisterHtml}</ul>
          </div>
          <div>
            <p class="text-xs font-bold text-amber-900 uppercase mb-2">자주 헷갈리는 다른 코어 type</p>
            <p class="text-sm text-amber-950 leading-relaxed">${escapeHtml(profile.confusedWith)}</p>
          </div>
          <div class="bg-white rounded-xl p-4 border border-amber-200">
            <p class="text-xs font-bold text-amber-800 uppercase mb-2">진단 시 주의</p>
            <p class="text-xs text-amber-900 leading-relaxed">핵심 동기 (위 SUBTYPE Detail 카드 참조) 가 진단의 1차 기준입니다. 표면 행동만으로 type 을 의심하지 마세요.</p>
          </div>
        </div>
      </div>`;
  }

  // Signature Summary — Section 14. 1-page 압축 대시보드. (Phase 6.6 보강)
  function renderSignatureSummary(coreType, scores, phase3Result, container) {
    if (!container || !phase3Result) return;
    const profile = phase3Result.subtype ? getSubtypeProfile(phase3Result.subtype) : null;
    const ip = phase3Result.instinctPct || { sp: 0, sx: 0, so: 0 };
    const wing = phase3Result.wing || { wing: null, pct: 0 };
    const centerKey = CENTER_OF[coreType];
    const color = CENTER_COLOR[centerKey];
    const types = [1,2,3,4,5,6,7,8,9];
    const total = types.reduce((a, t) => a + (scores[t] || 0), 0) || 1;
    const typeBars = types.map((t) => {
      const pct = Math.round((scores[t] || 0) / total * 100);
      const isCenter = (t === coreType);
      const c = isCenter ? '#bfa68a' : ({ body: '#C44536', heart: '#5A8F69', head: '#3D5A80' })[CENTER_OF[t]];
      return `
        <div class="flex items-center gap-2 text-xs">
          <span class="w-6 font-bold ${isCenter ? 'text-[#4a4540]' : 'text-gray-500'}">T${t}</span>
          <div class="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
            <div style="background:${c};width:${pct}%;height:100%;"></div>
          </div>
          <span class="w-10 text-right ${isCenter ? 'font-bold text-[#4a4540]' : 'text-gray-500'}">${pct}%</span>
        </div>`;
    }).join('');
    const instBars = ['sp','sx','so'].map((k) => {
      const pct = ip[k] || 0;
      const c = ({ sp: '#A0522D', sx: '#9C3848', so: '#3E7CB1' })[k];
      return `
        <div class="flex items-center gap-2 text-xs">
          <span class="w-8 font-bold text-gray-700">${k}</span>
          <div class="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
            <div style="background:${c};width:${pct}%;height:100%;"></div>
          </div>
          <span class="w-10 text-right font-semibold" style="color:${c}">${pct}%</span>
        </div>`;
    }).join('');
    const ctBadge = phase3Result.countertype
      ? '<span class="inline-block bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ml-2">Countertype</span>'
      : '';
    container.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="sm:col-span-3 px-5 py-4 rounded-xl text-white" style="background:${color}">
          <p class="text-[10px] uppercase tracking-widest opacity-80">YOUR ER ENNEAGRAM RESULT</p>
          <div class="flex items-baseline gap-3 flex-wrap mt-1">
            <p class="text-2xl sm:text-3xl font-bold">${escapeHtml(phase3Result.formatted)}</p>
            ${ctBadge}
          </div>
          ${profile ? `<p class="text-sm opacity-90 mt-1">${escapeHtml(profile.nameKr)} — ${escapeHtml(profile.name)}</p>` : ''}
        </div>
        <div class="sm:col-span-2 bg-white p-5 rounded-xl border border-gray-200">
          <p class="text-xs font-bold text-gray-400 uppercase mb-3">9 Type Scores</p>
          <div class="space-y-1.5">${typeBars}</div>
        </div>
        <div class="bg-white p-5 rounded-xl border border-gray-200">
          <p class="text-xs font-bold text-gray-400 uppercase mb-3">Instinct Stack</p>
          <div class="space-y-2">${instBars}</div>
          <div class="mt-4 pt-3 border-t border-gray-100">
            <p class="text-xs font-bold text-gray-400 uppercase mb-2">Wing</p>
            ${wing.wing ? `<p class="text-sm font-bold text-gray-800">${coreType}w${wing.wing} (${wing.pct}%)</p>` : '<p class="text-sm text-gray-500">균등 — 순수 표현 우세</p>'}
          </div>
        </div>
        ${profile ? `
        <div class="sm:col-span-3 bg-white p-5 rounded-xl border border-gray-200">
          <p class="text-xs font-bold text-gray-400 uppercase mb-2">핵심 한국어 카피</p>
          <p class="text-sm text-gray-800 leading-relaxed">${escapeHtml(profile.description)}</p>
        </div>` : ''}
      </div>`;
  }

  const TestResultRenderer = { renderResultCards, getSubtypeProfile, renderSubtypeHeader, renderCountertypeFull, renderSignatureSummary };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = TestResultRenderer;
  }
  if (typeof window !== 'undefined') {
    window.TestResultRenderer = Object.assign(window.TestResultRenderer || {}, TestResultRenderer);
  }
})();

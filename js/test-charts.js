// ER 에니어그램 결과지 차트 모듈 — 에니어그램 지도 (SVG), 9-type 도넛 (Chart.js), wing 메터, 본능 바, triads (Phase 6).
// 의존 — Chart.js (CDN), Tailwind CSS, window.TestShared.

(function () {
  'use strict';

  // === 컬러 시스템 (CSS 변수와 동기화) ===
  const CENTER_COLOR = {
    1: '#C44536', 8: '#C44536', 9: '#C44536',  // Body
    2: '#5A8F69', 3: '#5A8F69', 4: '#5A8F69',  // Heart
    5: '#3D5A80', 6: '#3D5A80', 7: '#3D5A80',  // Head
  };
  const CENTER_OF = { 1: 'body', 8: 'body', 9: 'body', 2: 'heart', 3: 'heart', 4: 'heart', 5: 'head', 6: 'head', 7: 'head' };
  const HORNEVIAN = { 1: 'compliant', 2: 'compliant', 6: 'compliant', 3: 'assertive', 7: 'assertive', 8: 'assertive', 4: 'withdrawn', 5: 'withdrawn', 9: 'withdrawn' };
  const HARMONIC = { 2: 'positive_outlook', 7: 'positive_outlook', 9: 'positive_outlook', 4: 'reactive', 6: 'reactive', 8: 'reactive', 1: 'competency', 3: 'competency', 5: 'competency' };
  const INST_COLOR = { sp: '#A0522D', sx: '#9C3848', so: '#3E7CB1' };
  const INST_LABEL = { sp: '자기보호 sp', sx: '일대일 sx', so: '사회 so' };

  // === 에니어그램 9점 SVG 지도 ===
  // 표준 배치 — 9 top, 시계방향으로 1, 2, ..., 8.
  function renderEnneagramMap(coreType, scores, svgEl) {
    if (!svgEl) return;
    const cx = 200, cy = 200, r = 140, dotMaxR = 26, dotMinR = 12;
    // 9 type 의 각도 (12시 방향 기준 시계방향, 9가 12시).
    const angle = { 9: 0, 1: 40, 2: 80, 3: 120, 4: 160, 5: 200, 6: 240, 7: 280, 8: 320 };
    const types = [1,2,3,4,5,6,7,8,9];
    const maxScore = Math.max(...Object.values(scores), 1);
    // 점수 정규화 — score / max → 0-1 → 점 크기 + opacity.
    const pos = {};
    types.forEach((t) => {
      const a = angle[t] * Math.PI / 180;
      pos[t] = { x: cx + r * Math.sin(a), y: cy - r * Math.cos(a) };
    });
    // SVG 내용 빌드.
    let svg = '';
    // 9각형 연결선 (희미하게).
    svg += `<polygon points="${types.map((t) => `${pos[t].x},${pos[t].y}`).join(' ')}" fill="none" stroke="#eadccf" stroke-width="1.5"/>`;
    // 내부 연결 — 화살표 라인 (1→4→2→8→5→7→1 + 3→9→6→3 = Riso-Hudson 표준 9각성형).
    const lines = [[1,4],[4,2],[2,8],[8,5],[5,7],[7,1],[3,9],[9,6],[6,3]];
    lines.forEach(([a,b]) => {
      svg += `<line x1="${pos[a].x}" y1="${pos[a].y}" x2="${pos[b].x}" y2="${pos[b].y}" stroke="#eadccf" stroke-width="1" stroke-dasharray="4,3"/>`;
    });
    // 9 type 점.
    types.forEach((t) => {
      const score = scores[t] || 0;
      const ratio = score / maxScore;
      const dotR = dotMinR + (dotMaxR - dotMinR) * ratio;
      const isCore = (t === coreType);
      const color = isCore ? '#657453' : CENTER_COLOR[t];
      const opacity = isCore ? 1 : (0.3 + 0.7 * ratio);
      const stroke = isCore ? '#30322D' : 'transparent';
      const strokeW = isCore ? 3 : 0;
      svg += `<circle cx="${pos[t].x}" cy="${pos[t].y}" r="${dotR}" fill="${color}" fill-opacity="${opacity}" stroke="${stroke}" stroke-width="${strokeW}"/>`;
      svg += `<text x="${pos[t].x}" y="${pos[t].y + 5}" text-anchor="middle" font-size="${isCore ? 16 : 14}" font-weight="${isCore ? 800 : 700}" fill="white">${t}</text>`;
    });
    svgEl.innerHTML = svg;
  }

  // === 9 type 도넛 차트 (Chart.js) ===
  let _9typeChart = null;
  function render9TypeDonut(scores, canvasEl, legendEl) {
    if (!canvasEl || typeof Chart === 'undefined') return;
    if (_9typeChart) { try { _9typeChart.destroy(); } catch (_e) {} _9typeChart = null; }
    const types = [1,2,3,4,5,6,7,8,9];
    const data = types.map((t) => scores[t] || 0);
    const colors = types.map((t) => CENTER_COLOR[t]);
    _9typeChart = new Chart(canvasEl.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: types.map((t) => `Type ${t}`),
        datasets: [{ data, backgroundColor: colors, borderColor: '#fff', borderWidth: 3 }],
      },
      options: {
        responsive: true, maintainAspectRatio: true, cutout: '58%',
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => `Type ${c.label.split(' ')[1]}: ${c.parsed.toFixed(1)}` } } },
      },
    });
    if (legendEl) {
      const total = data.reduce((a, b) => a + b, 0) || 1;
      legendEl.innerHTML = types.map((t, i) => {
        const pct = Math.round(data[i] / total * 100);
        return `<div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full" style="background:${colors[i]}"></span><span class="font-semibold">T${t}</span><span class="text-gray-500">${pct}%</span></div>`;
      }).join('');
    }
  }

  // === Wing 메터 (SVG 인라인 — 양옆 wing 강도 시각화) ===
  function renderWingMeter(coreType, wingInfo, container) {
    if (!container) return;
    if (!wingInfo || wingInfo.wing === null) {
      container.innerHTML = '<p class="text-sm text-gray-500 text-center">두 wing 균등 — 순수 type 표현이 우세</p>';
      return;
    }
    const left = coreType === 1 ? 9 : coreType - 1;
    const right = coreType === 9 ? 1 : coreType + 1;
    const isLeftDominant = wingInfo.wing === left;
    const dominantPct = wingInfo.pct;
    container.innerHTML = `
      <div class="flex items-stretch gap-3 max-w-xl mx-auto">
        <div class="flex-1 text-center">
          <div class="text-xs font-bold uppercase mb-2" style="color:${CENTER_COLOR[left]}">Wing ${left}</div>
          <div class="h-24 rounded-xl flex items-end overflow-hidden bg-gray-100">
            <div style="background:${CENTER_COLOR[left]};height:${isLeftDominant ? dominantPct : 100-dominantPct}%;width:100%"></div>
          </div>
          <div class="text-xs text-gray-500 mt-2">${isLeftDominant ? dominantPct : 100-dominantPct}%</div>
        </div>
        <div class="flex flex-col items-center justify-center px-3">
          <div class="text-3xl font-bold text-[#657453]">${coreType}</div>
          <div class="text-[10px] text-gray-400 uppercase tracking-wider">core</div>
        </div>
        <div class="flex-1 text-center">
          <div class="text-xs font-bold uppercase mb-2" style="color:${CENTER_COLOR[right]}">Wing ${right}</div>
          <div class="h-24 rounded-xl flex items-end overflow-hidden bg-gray-100">
            <div style="background:${CENTER_COLOR[right]};height:${isLeftDominant ? 100-dominantPct : dominantPct}%;width:100%"></div>
          </div>
          <div class="text-xs text-gray-500 mt-2">${isLeftDominant ? 100-dominantPct : dominantPct}%</div>
        </div>
      </div>`;
  }

  // === 본능 바 ===
  function renderInstinctBars(instinctPct, container) {
    if (!container) return;
    const insts = ['sp', 'sx', 'so'];
    // 정렬 — % desc, dominant 가 위.
    const sorted = insts.slice().sort((a, b) => (instinctPct[b] || 0) - (instinctPct[a] || 0));
    container.innerHTML = sorted.map((k, i) => {
      const pct = Math.max(0, Math.min(100, instinctPct[k] || 0));
      const label = INST_LABEL[k];
      const color = INST_COLOR[k];
      const tag = i === 0 ? '1차 (Dominant)' : (i === 1 ? '2차 (Secondary)' : '3차 (Blind / Repressed)');
      return `
        <div>
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full" style="background:${color}"></span>
              <span class="font-bold text-sm text-gray-800">${label}</span>
              <span class="text-[10px] uppercase tracking-wider text-gray-400">${tag}</span>
            </div>
            <span class="font-bold text-sm" style="color:${color}">${pct}%</span>
          </div>
          <div class="bg-gray-100 rounded-full h-3 overflow-hidden">
            <div class="h-3 rounded-full" style="background:${color};width:${pct}%"></div>
          </div>
        </div>`;
    }).join('');
  }

  // === Triads (Center / Hornevian / Harmonic) — coreType 기반 카드 3개 ===
  const TRIAD_INFO = {
    center: {
      body:  { name: 'BODY · 본능 (Gut)', desc: '분노/경계/통제. Anger 가 깊은 감정.', color: '#C44536', members: '8 · 9 · 1' },
      heart: { name: 'HEART · 감정 (Image)', desc: '인정/이미지/정체성. Shame 이 깊은 감정.', color: '#5A8F69', members: '2 · 3 · 4' },
      head:  { name: 'HEAD · 사고 (Fear)', desc: '위험/분석/안전. Fear 가 깊은 감정.', color: '#3D5A80', members: '5 · 6 · 7' },
    },
    hornevian: {
      assertive:  { name: 'ASSERTIVE · 능동', desc: '원하는 것을 직접 추구, 환경을 자기 쪽으로.', color: '#C44536', members: '3 · 7 · 8' },
      compliant:  { name: 'COMPLIANT · 순응', desc: '의무/도움/충성으로 얻음.', color: '#5A8F69', members: '1 · 2 · 6' },
      withdrawn:  { name: 'WITHDRAWN · 철수', desc: '거리/내면으로 물러남.', color: '#3D5A80', members: '4 · 5 · 9' },
    },
    harmonic: {
      positive_outlook: { name: 'POSITIVE OUTLOOK · 긍정화', desc: '좋은 면 보기, 무거움 떨치기.', color: '#5A8F69', members: '2 · 7 · 9' },
      reactive:         { name: 'REACTIVE · 감정 반응', desc: '즉각 강한 반응, 같이 끌어들이기.', color: '#C44536', members: '4 · 6 · 8' },
      competency:       { name: 'COMPETENCY · 역량', desc: '논리/효율/기준으로 처리.', color: '#3D5A80', members: '1 · 3 · 5' },
    },
  };

  function renderTriads(coreType, container) {
    if (!container || !coreType) return;
    const center = TRIAD_INFO.center[CENTER_OF[coreType]];
    const horn = TRIAD_INFO.hornevian[HORNEVIAN[coreType]];
    const harm = TRIAD_INFO.harmonic[HARMONIC[coreType]];
    const card = (label, info) => `
      <div class="rounded-2xl overflow-hidden border border-gray-100">
        <div class="px-5 py-3" style="background:${info.color}">
          <p class="text-[10px] uppercase tracking-widest text-white/70">${label}</p>
          <h4 class="text-white font-bold text-base">${info.name}</h4>
        </div>
        <div class="p-5 bg-white">
          <p class="text-xs text-gray-500 mb-2">Types ${info.members}</p>
          <p class="text-sm text-gray-700 leading-relaxed">${info.desc}</p>
        </div>
      </div>`;
    container.innerHTML = card('Center', center) + card('Hornevian', horn) + card('Harmonic', harm);
  }

  // === 통합 결과 차트 렌더링 (test.js 가 호출) ===
  function renderAllCharts({ coreType, scores, phase3Result }) {
    try {
      const svgEl = document.getElementById('chart-enneagram-svg');
      if (svgEl) renderEnneagramMap(coreType, scores, svgEl);
    } catch (_e) {}
    try {
      const cvEl = document.getElementById('chart-9-types');
      const lgEl = document.getElementById('chart-9-types-legend');
      if (cvEl) render9TypeDonut(scores, cvEl, lgEl);
    } catch (_e) {}
    try {
      const wmEl = document.getElementById('chart-wing-meter');
      if (wmEl && phase3Result) renderWingMeter(coreType, phase3Result.wing, wmEl);
    } catch (_e) {}
    try {
      const ibEl = document.getElementById('chart-instinct-bars');
      if (ibEl && phase3Result) renderInstinctBars(phase3Result.instinctPct, ibEl);
    } catch (_e) {}
    try {
      const trEl = document.getElementById('res-triads');
      if (trEl) renderTriads(coreType, trEl);
    } catch (_e) {}
  }

  const TestCharts = {
    renderEnneagramMap, render9TypeDonut, renderWingMeter, renderInstinctBars, renderTriads, renderAllCharts,
    CENTER_COLOR, CENTER_OF, HORNEVIAN, HARMONIC, INST_COLOR, INST_LABEL, TRIAD_INFO,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = TestCharts;
  if (typeof window !== 'undefined') window.TestCharts = Object.assign(window.TestCharts || {}, TestCharts);
})();

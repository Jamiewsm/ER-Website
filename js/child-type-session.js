// 부모 관찰형 검사 — 진행 저장·결과 스냅샷 (localStorage / sessionStorage)
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  if (typeof root !== 'undefined') {
    root.ChildTypeSession = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const VERSION = 2;
  const PROGRESS_KEY = 'er_child_type_test_v2';
  const RESULT_KEY = 'er_child_type_result';
  const POOL_LENGTH = 96;

  function serializePool(pool) {
    return pool.map((it) =>
      it.kind === 'type'
        ? { kind: 'type', t: it.t, i: it.i }
        : { kind: 'inst', k: it.k, i: it.i }
    );
  }

  function deserializePool(serialized, data) {
    if (!Array.isArray(serialized) || serialized.length !== POOL_LENGTH) return null;
    const pool = [];
    for (const ref of serialized) {
      if (ref.kind === 'type' && ref.t >= 1 && ref.t <= 9) {
        const text = data.TYPES[ref.t]?.q?.[ref.i];
        if (text == null) return null;
        pool.push({ text, kind: 'type', t: ref.t, i: ref.i });
      } else if (ref.kind === 'inst' && data.INSTINCTS[ref.k]) {
        const text = data.INSTINCTS[ref.k]?.q?.[ref.i];
        if (text == null) return null;
        pool.push({ text, kind: 'inst', k: ref.k, i: ref.i });
      } else {
        return null;
      }
    }
    return pool;
  }

  function serializeState(state) {
    const situations = state.situations instanceof Set ? state.situations : new Set(state.situations || []);
    return {
      situations: [...situations],
      type: state.type,
      conf: state.conf,
      wing: state.wing,
      inst: state.inst,
    };
  }

  function hydrateState(raw) {
    const state = {
      situations: new Set(Array.isArray(raw.situations) ? raw.situations : []),
      type: {},
      conf: raw.conf && typeof raw.conf === 'object' ? raw.conf : {},
      wing: raw.wing ?? null,
      inst: { SP: [], SO: [], SX: [] },
    };
    for (let t = 1; t <= 9; t++) {
      state.type[t] = Array.isArray(raw.type?.[t]) ? raw.type[t].slice(0, 8) : Array(8).fill(null);
      while (state.type[t].length < 8) state.type[t].push(null);
    }
    for (const k of ['SP', 'SO', 'SX']) {
      state.inst[k] = Array.isArray(raw.inst?.[k]) ? raw.inst[k].slice(0, 8) : Array(8).fill(null);
      while (state.inst[k].length < 8) state.inst[k].push(null);
    }
    return state;
  }

  function saveProgress({ stepIdx, state, pool }) {
    try {
      const payload = {
        v: VERSION,
        stepIdx,
        state: serializeState(state),
        pool: serializePool(pool),
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(payload));
      return true;
    } catch (_err) {
      return false;
    }
  }

  function loadProgress() {
    try {
      const raw = localStorage.getItem(PROGRESS_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (data.v !== VERSION) return null;
      if (typeof data.stepIdx !== 'number' || data.stepIdx < 0) return null;
      if (!data.state) return null;
      return {
        stepIdx: data.stepIdx,
        state: hydrateState(data.state),
        poolRefs: data.pool,
        savedAt: data.savedAt || null,
      };
    } catch (_err) {
      return null;
    }
  }

  function clearProgress() {
    try {
      localStorage.removeItem(PROGRESS_KEY);
    } catch (_err) {
      // ignore
    }
  }

  function buildResultSummary(state, computeResult, data) {
    const { main, conf, reliability, top3, inst, selectedSituations } = computeResult;
    const dom = inst[0][0];
    const wingStr = state.wing ? `${main}w${state.wing}` : `${main}w?`;
    const finalLabel = `${dom} ${wingStr}`;
    const instinctOrder = inst.map(([k]) => k).join(' > ');
    const typeTitle = data.TYPES[main]?.title || '';
    return {
      source: 'child_type_test',
      version: VERSION,
      finalLabel,
      coreType: main,
      coreTitle: typeTitle,
      wingLabel: wingStr,
      wing: state.wing,
      subtypeSummary: instinctOrder,
      instinctSummary: dom,
      instinctName: data.INSTINCTS[dom]?.name?.split(' (')[0] || dom,
      confidenceLabel: conf.label,
      confidenceLevel: conf.level,
      reliabilityLabel: reliability.label,
      reliabilityLevel: reliability.level,
      topTypes: top3,
      selectedSituations: selectedSituations || [],
      completedAt: new Date().toISOString(),
    };
  }

  function formatResultSummaryForApply(summary) {
    if (!summary) return '';
    const top = Array.isArray(summary.topTypes)
      ? summary.topTypes.filter((t) => t !== summary.coreType).map((t) => `${t}번`).join(', ')
      : '';
    const parts = [
      `부모 관찰형 검사 결과: ${summary.finalLabel}`,
      `코어 ${summary.coreType}번${summary.coreTitle ? ` (${summary.coreTitle})` : ''}`,
      `날개 ${summary.wingLabel}`,
      `본능 ${summary.instinctSummary} (${summary.subtypeSummary})`,
      `점수 확신도 ${summary.confidenceLabel}`,
      `관찰 신뢰도 ${summary.reliabilityLabel}`,
    ];
    if (top) parts.push(`보조 후보 ${top}`);
    if (summary.selectedSituations?.length) {
      parts.push(`관찰 상황 ${summary.selectedSituations.length}건`);
    }
    return parts.join(', ');
  }

  function persistResultSummary(summary) {
    if (!summary) return;
    try {
      sessionStorage.setItem(RESULT_KEY, JSON.stringify(summary));
    } catch (_err) {
      // ignore
    }
  }

  function loadResultSummary() {
    try {
      const raw = sessionStorage.getItem(RESULT_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed?.source !== 'child_type_test') return null;
      return parsed;
    } catch (_err) {
      return null;
    }
  }

  return {
    VERSION,
    PROGRESS_KEY,
    RESULT_KEY,
    POOL_LENGTH,
    serializePool,
    deserializePool,
    serializeState,
    hydrateState,
    saveProgress,
    loadProgress,
    clearProgress,
    buildResultSummary,
    formatResultSummaryForApply,
    persistResultSummary,
    loadResultSummary,
  };
});

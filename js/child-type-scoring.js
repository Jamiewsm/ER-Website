// 부모 관찰형 아이 유형검사 — 순수 채점·신뢰도 함수 (브라우저 + Node 호환)
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  if (typeof root !== 'undefined') {
    root.ChildTypeScoring = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const REVERSE_INDEX = 7;

  function typeTotal(typeRow, reverseIndex) {
    const rev = reverseIndex == null ? REVERSE_INDEX : reverseIndex;
    let sum = 0;
    for (let i = 0; i < 8; i++) {
      const v = typeRow[i];
      if (v === null || v === 0) continue;
      sum += i === rev ? 6 - v : v;
    }
    return sum;
  }

  function ranked(typeResponses, reverseIndex) {
    const arr = [];
    for (let t = 1; t <= 9; t++) {
      arr.push({ t, total: typeTotal(typeResponses[t], reverseIndex) });
    }
    arr.sort((x, y) => y.total - x.total || x.t - y.t);
    return arr;
  }

  function confidence(r) {
    const gap = r[0].total - r[1].total;
    if (gap >= 8) return { gap, level: 'high', label: '점수 차이 확신도 높음' };
    if (gap >= 4) return { gap, level: 'mid', label: '점수 차이 확신도 보통' };
    return { gap, level: 'low', label: '점수 차이 확신도 낮음' };
  }

  function instTotal(instRow) {
    return instRow.reduce((s, v) => (v === null || v === 0 ? s : s + v), 0);
  }

  function buildQuestionPool(data, shuffle) {
    const pool = [];
    for (let t = 1; t <= 9; t++) {
      data.TYPES[t].q.forEach((text, i) => pool.push({ text, kind: 'type', t, i }));
    }
    for (const k of ['SP', 'SO', 'SX']) {
      data.INSTINCTS[k].q.forEach((text, i) => pool.push({ text, kind: 'inst', k, i }));
    }
    if (shuffle !== false) {
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = pool[i];
        pool[i] = pool[j];
        pool[j] = tmp;
      }
    }
    return pool;
  }

  function poolVal(state, item) {
    return item.kind === 'type' ? state.type[item.t][item.i] : state.inst[item.k][item.i];
  }

  function observationalReliability(state, pool, relPairs) {
    const typeStats = [];
    for (let t = 1; t <= 9; t++) {
      let zeros = 0;
      let answered = 0;
      for (let i = 0; i < 8; i++) {
        const v = state.type[t][i];
        if (v === null) continue;
        answered++;
        if (v === 0) zeros++;
      }
      typeStats.push({ t, zeros, answered, zeroRate: answered ? zeros / answered : 0 });
    }

    let allZeros = 0;
    let allAnswered = 0;
    pool.forEach((it) => {
      const v = poolVal(state, it);
      if (v === null) return;
      allAnswered++;
      if (v === 0) allZeros++;
    });

    const overallZeroRate = allAnswered ? allZeros / allAnswered : 0;
    const underobservedTypes = typeStats
      .filter((s) => s.zeros >= 4 || (s.answered >= 3 && s.zeroRate >= 0.5))
      .map((s) => s.t)
      .sort((a, b) => a - b);

    let level = 'high';
    if (overallZeroRate >= 0.25 || underobservedTypes.length >= 3) level = 'low';
    else if (overallZeroRate >= 0.15 || underobservedTypes.length >= 1) level = 'mid';

    const labels = { high: '관찰 신뢰도 높음', mid: '관찰 신뢰도 보통', low: '관찰 신뢰도 낮음' };
    const reasons = [];
    if (allAnswered && overallZeroRate >= 0.12) {
      reasons.push(`전체 ${allAnswered}개 응답 중 ${allZeros}개(${Math.round(overallZeroRate * 100)}%)가 관찰부족(0)입니다.`);
    }
    if (underobservedTypes.length) {
      const nums = underobservedTypes
        .map((t) => {
          const s = typeStats.find((x) => x.t === t);
          return `${t}번(${s.zeros}회)`;
        })
        .join(', ');
      reasons.push(`${nums} 관련 문항에서 관찰부족이 많아 해당 유형 가능성은 과소평가되었을 수 있습니다.`);
    }
    const skippedPairs = (relPairs || []).filter((p) => !state.conf[p.idx]).length;
    if (skippedPairs > 0) {
      reasons.push(`비교 문항 ${skippedPairs}개를 선택하지 않아 유형 구분 신뢰도가 낮아질 수 있습니다.`);
    }
    if (!state.wing) reasons.push('날개 비교를 선택하지 않아 날개 가설은 미확정입니다.');

    return {
      typeStats,
      underobservedTypes,
      overallZeroRate,
      allZeros,
      allAnswered,
      level,
      label: labels[level],
      reasons,
    };
  }

  function compute(state, data, pool) {
    const reverseIndex = data.REVERSE_INDEX != null ? data.REVERSE_INDEX : REVERSE_INDEX;
    const r = ranked(state.type, reverseIndex);
    const top3 = r.slice(0, 3).map((x) => x.t);

    const relPairs = data.PAIRS.map((p, idx) => ({ ...p, idx })).filter(
      (p) => top3.includes(p.a) && top3.includes(p.b)
    );

    const conf = confidence(r);
    const reliability = observationalReliability(state, pool, relPairs);

    const wins = {};
    top3.forEach((t) => {
      wins[t] = 0;
    });
    relPairs.forEach((p) => {
      const c = state.conf[p.idx];
      if (c === 'A') wins[p.a]++;
      else if (c === 'B') wins[p.b]++;
    });

    let main;
    if (conf.level === 'high') {
      main = r[0].t;
    } else {
      main = top3
        .slice()
        .sort(
          (x, y) =>
            wins[y] - wins[x] ||
            typeTotal(state.type[y], reverseIndex) - typeTotal(state.type[x], reverseIndex) ||
            x - y
        )[0];
    }

    const inst = [
      ['SP', instTotal(state.inst.SP)],
      ['SO', instTotal(state.inst.SO)],
      ['SX', instTotal(state.inst.SX)],
    ].sort((a, b) => b[1] - a[1] || 0);

    const situationSet = state.situations instanceof Set ? state.situations : new Set(state.situations || []);
    const selectedSituations = [...situationSet]
      .sort((a, b) => a - b)
      .map((i) => data.SITUATIONS[i]);

    return { r, conf, reliability, top3, relPairs, wins, main, inst, selectedSituations };
  }

  return {
    REVERSE_INDEX,
    typeTotal,
    ranked,
    confidence,
    instTotal,
    buildQuestionPool,
    poolVal,
    observationalReliability,
    compute,
  };
});

// ER 코칭·프로그램 가격·신청 라우팅 SSOT — 결과지·프로그램·신청 폼이 동일 데이터를 참조
(function () {
  const PRICING = {
    identity_session: { total: 100, sessions: 1, label: '$100' },
    coaching_single: { total: 80, sessions: 1, label: '$80 / 1회' },
    recovery_journey_4: { total: 300, sessions: 4, label: '$300' },
    recovery_journey_8: { total: 480, sessions: 8, label: '$480' },
    couple_coaching: { total: 220, sessions: 1, label: '$220' },
    parenting_workshop: { total: 120, sessions: 4, label: '$120' },
    basic_course: { total: 300, sessions: 8, label: '$300' },
    result_consult: { total: 50, sessions: 1, label: '$50 / 1시간' }
  };

  function perSession(price) {
    if (!price || !price.sessions) return '';
    const each = price.total / price.sessions;
    return each % 1 === 0 ? `$${each}` : `$${each.toFixed(0)}`;
  }

  const PROGRAM_ALIAS = {
    '정체성 회복 코칭': 'identity_session',
    '정체성 발견 세션': 'identity_session',
    '유형(Typing) 상담': 'identity_session',
    '테스트 결과지 해석상담': 'result_consult',
    '결과지 해석상담': 'result_consult',
    '관계 패턴 코칭': 'coaching_single',
    'ER 전문가 양성반': 'coach_training',
    '에니어그램 8주 기본과정': 'basic_course',
    '에니어그램 기본과정 8주': 'basic_course',
    '커리어/소명 코칭': 'identity_session',
    '리더십/소명 코칭': 'coach_training',
    '회복 여정 8회': 'recovery_journey_8',
    '회복 여정 4회': 'recovery_journey_4',
    '회복 코칭 8회': 'recovery_journey_8',
    '회복 코칭 4회': 'recovery_journey_4'
  };

  const JULY_BASIC_RECRUITMENT_END = '2026-07-05T23:59:59-07:00';

  function isJulyBasicRecruitmentOpen() {
    return Date.now() <= Date.parse(JULY_BASIC_RECRUITMENT_END);
  }

  function withResultConsultPrimary(programNames) {
    const names = Array.from(programNames || []);
    const filtered = names.filter((name) => resolveKey(name) !== 'result_consult');
    return ['테스트 결과지 해석상담', ...filtered].slice(0, 3);
  }

  function withJulyBasicBoost(programNames) {
    const primary = withResultConsultPrimary(programNames);
    if (!isJulyBasicRecruitmentOpen()) return primary;
    const filtered = primary.filter((name) => !['result_consult', 'basic_course'].includes(resolveKey(name)));
    return ['테스트 결과지 해석상담', '에니어그램 8주 기본과정', ...filtered].slice(0, 3);
  }

  const PROGRAMS = {
    identity_session: {
      key: 'identity_session',
      title: '유형(Typing) 상담',
      shortTitle: 'Typing 상담',
      price: PRICING.identity_session,
      category: '유형(Typing) 상담 ($100)',
      track: 'paid',
      focus: 'identity_session',
      outcome: '사전 설문·인터뷰 기반 타이핑과 핵심 동기·방어 패턴을 함께 정리합니다.',
      reasonPrimary: '현재 반복 패턴의 중심 동기와 가장 직접적으로 연결됩니다.',
      reasonSecondary: '결과지를 읽은 뒤 실제 타이핑·동기 확인으로 이어가기 좋습니다.',
      applyMessage: '유형(Typing) 상담 신청합니다.'
    },
    result_consult: {
      key: 'result_consult',
      title: '테스트 결과지 해석상담',
      shortTitle: '결과지 해석상담',
      price: PRICING.result_consult,
      category: '테스트 결과지 해석상담 ($50)',
      track: 'paid',
      focus: 'result_consult',
      outcome: '결과지를 함께 읽으며 핵심 유형, 하위유형, 날개, 신뢰도, 헷갈리는 유형을 1시간 동안 정리합니다.',
      reasonPrimary: '결과지를 혼자 읽고 끝내지 않고, 내 실제 삶의 장면과 맞는지 가장 먼저 확인하는 단계입니다.',
      reasonSecondary: '결과지의 핵심 문장과 점수 흐름을 상담자와 함께 정리하기 좋습니다.',
      applyMessage: '테스트 결과지 해석상담 신청합니다.'
    },
    coaching_single: {
      key: 'coaching_single',
      title: '개별 코칭 (1회)',
      shortTitle: '개별 코칭',
      price: PRICING.coaching_single,
      category: '개별 코칭 1회 ($80)',
      track: 'paid',
      focus: 'coaching_single',
      outcome: '관계·감정의 막힌 지점을 실제 장면에 적용하는 60분 코칭입니다.',
      reasonPrimary: '결과지에서 읽은 패턴을 일상 관계 장면에 바로 연결하기 좋습니다.',
      reasonSecondary: '짧은 기간 안에 한 가지 반응 패턴을 집중적으로 다루기 좋습니다.',
      applyMessage: '개별 코칭 1회 신청합니다.'
    },
    recovery_journey_4: {
      key: 'recovery_journey_4',
      title: '회복 코칭 프로그램 (4회)',
      shortTitle: '회복 코칭 4회',
      price: PRICING.recovery_journey_4,
      category: '회복 코칭 4회 ($300)',
      track: 'paid',
      focus: 'recovery_journey_4',
      outcome: `4회 집중 코스 · 회당 ${perSession(PRICING.recovery_journey_4)} (단회 $80 대비 소폭 할인)`,
      reasonPrimary: '한 달 안에 패턴 인식부터 실행 루틴까지 이어가기 좋습니다.',
      reasonSecondary: '짧은 집중 코스로 회복 방향을 정착시키기 좋습니다.',
      applyMessage: '회복 코칭 4회 프로그램 신청합니다.'
    },
    recovery_journey_8: {
      key: 'recovery_journey_8',
      title: '회복 코칭 프로그램 (8회)',
      shortTitle: '회복 코칭 8회',
      price: PRICING.recovery_journey_8,
      category: '회복 코칭 8회 ($480)',
      track: 'paid',
      focus: 'recovery_journey_8',
      featured: true,
      outcome: `8회 심화 코스 · 회당 ${perSession(PRICING.recovery_journey_8)} · 가장 많이 선택`,
      reasonPrimary: '감정·관계·실행 루틴까지 이어지는 지속적 변화에 가장 적합합니다.',
      reasonSecondary: '단회 대비 가장 경제적이며, 회복이 습관으로 정착하기 좋습니다.',
      applyMessage: '회복 코칭 8회 프로그램 신청합니다.'
    },
    couple_coaching: {
      key: 'couple_coaching',
      title: '부부 코칭 (1회)',
      shortTitle: '부부 코칭',
      price: PRICING.couple_coaching,
      category: '부부 코칭 1회 ($220)',
      track: 'paid',
      focus: 'couple',
      outcome: '부부의 반복 갈등 구조를 함께 읽고 대화 방식을 설계합니다.',
      reasonPrimary: '관계 장면에서 드러나는 패턴을 함께 다루기 좋습니다.',
      reasonSecondary: '부부 관계의 반복 오해를 구조적으로 정리하기 좋습니다.',
      applyMessage: '부부 코칭을 원합니다.'
    },
    parenting_workshop: {
      key: 'parenting_workshop',
      title: 'Enneagram for Parenting 4주',
      shortTitle: 'Parenting 워크샵',
      price: PRICING.parenting_workshop,
      category: 'Enneagram for Parenting 4주 ($120)',
      track: 'paid',
      focus: 'parenting_workshop',
      outcome: '나와 아이의 기질 차이를 이해하는 4주 온라인 워크샵입니다.',
      reasonPrimary: '양육 장면에서 드러나는 패턴을 함께 다루기 좋습니다.',
      reasonSecondary: '부모-자녀 관계에 결과를 적용하기 좋습니다.',
      applyMessage: 'Enneagram for Parenting 4주 워크샵 신청합니다.'
    },
    basic_course: {
      key: 'basic_course',
      title: '에니어그램 8주 기본과정',
      shortTitle: '8주 기본과정',
      price: PRICING.basic_course,
      category: '에니어그램 8주 기본과정 ($300)',
      track: 'paid',
      focus: 'enneagram_basic_july',
      featured: true,
      outcome: '10월 기수 모집 예정 · 8주 온라인 + 1:1 멘토링',
      reasonPrimary: '무료 진단 결과를 체계적인 8주 학습으로 확장하기 좋은 시점입니다.',
      reasonSecondary: '9유형의 핵심 동기와 회복 관점을 깊이 배우기 좋습니다.',
      applyMessage: '에니어그램 8주 기본과정 신청합니다.'
    },
    coach_training: {
      key: 'coach_training',
      title: 'ER 전문가 양성반',
      shortTitle: '전문가 양성반',
      navigateSection: 'coach_training',
      outcome: '에니어그램 8주 기본과정, 스터디, 코칭스쿨로 이어지는 ER 전문가 여정입니다.',
      reasonPrimary: '다른 사람의 회복 여정을 돕는 소명과 연결됩니다.',
      reasonSecondary: '리더십·사역·코칭 역량을 체계적으로 키우기 좋습니다.',
      applyMessage: 'ER 전문가 양성반 안내를 받고 싶습니다.'
    }
  };

  function resolveKey(nameOrKey) {
    if (PROGRAMS[nameOrKey]) return nameOrKey;
    return PROGRAM_ALIAS[nameOrKey] || 'identity_session';
  }

  function get(keyOrAlias) {
    return PROGRAMS[resolveKey(keyOrAlias)] || PROGRAMS.identity_session;
  }

  function buildApplyPayload(programKey, extra) {
    const prog = get(programKey);
    if (prog.navigateSection) {
      return {
        type: 'section',
        section: prog.navigateSection,
        payload: { source: 'test', apply_source: 'report_next_step', ...(extra || {}) }
      };
    }
    return {
      type: 'apply',
      payload: {
        track: prog.track || 'paid',
        focus: prog.focus || programKey,
        source: 'test',
        apply_source: 'report_next_step',
        ...(extra || {})
      }
    };
  }

  function buildNextSteps(programNames) {
    return withJulyBasicBoost(programNames).map((name, index) => {
      const key = resolveKey(name);
      const prog = get(key);
      const priceNote = prog.price ? prog.price.label : '';
      return {
        rank: index + 1,
        programKey: key,
        program: prog.title,
        priceLabel: priceNote,
        reason: index === 0 ? (prog.reasonPrimary || '') : (prog.reasonSecondary || ''),
        outcome: prog.outcome || '',
        applyAction: buildApplyPayload(key)
      };
    });
  }

  function getPaidCategoryOptions() {
    return [
      PROGRAMS.result_consult.category,
      PROGRAMS.identity_session.category,
      PROGRAMS.coaching_single.category,
      PROGRAMS.basic_course.category,
      '자녀 양육 코칭 문의',
      PROGRAMS.recovery_journey_4.category,
      PROGRAMS.recovery_journey_8.category,
      PROGRAMS.couple_coaching.category,
      PROGRAMS.parenting_workshop.category
    ];
  }

  function getRecoveryPackageCopy() {
    const p4 = PRICING.recovery_journey_4;
    const p8 = PRICING.recovery_journey_8;
    return `4회 패키지: ${p4.label} (회당 ${perSession(p4)})\n8회 패키지: ${p8.label} (회당 ${perSession(p8)} · 가장 많이 선택)`;
  }

  window.ERProgramCatalog = {
    pricing: PRICING,
    programs: PROGRAMS,
    resolveKey,
    get,
    buildApplyPayload,
    buildNextSteps,
    withResultConsultPrimary,
    withJulyBasicBoost,
    isJulyBasicRecruitmentOpen,
    getPaidCategoryOptions,
    getRecoveryPackageCopy,
    perSession
  };
})();

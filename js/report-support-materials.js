// 프리미엄 결과지 보조자료 선택 helper — 억압형/부모/아이 자료를 조건별로 고른다.
(function () {
  const DEFAULT_THRESHOLDS = {
    extremeLowPercentMax: 25,
    minimumGapFromMiddle: 20,
    tieTolerancePoints: 3
  };

  const MATERIALS = [
    {
      id: "social_instinct_repressed",
      displayName: "사회적 본능 억압형 이해",
      status: "available",
      suppressionCode: "so",
      audiences: ["adult", "parent", "coach"],
      resultSlots: ["instinct_profile", "relationship_pattern", "parenting_pattern", "recommended_resources"],
      reportSummary: "집단 소속, 역할 감각, 분위기 읽기, 자기 영향력 인식이 의식의 앞쪽에 잘 올라오지 않을 수 있습니다. 사람을 싫어한다는 뜻이 아니라, 관계가 많아질수록 조율 비용이 커지는 패턴입니다.",
      focusAreas: ["집단 안에서 내 위치와 역할 감각", "직설성과 관계적 전달 방식의 균형", "자녀나 팀원이 겪는 사회적 감정의 무게"],
      practicePrompts: ["내 의도와 상대가 경험한 영향을 함께 점검하기", "회의나 모임에서 한 문장으로 내 자리를 표시하기", "아이의 친구 관계 감정을 해결보다 공감으로 먼저 받기"],
      typeSpecificTitles: {
        1: "더 날것의 비판자",
        2: "가까워지면 따뜻하지만, 처음엔 차가워 보이는 사람",
        3: "조용히 성취하지만, 주목받기는 싫은 사람",
        4: "좋게 보이려 애쓰지 않는 특별한 사람",
        5: "혼자 있는 것이 가장 편한 관찰자",
        6: "더 의심 많고 반항적인 현실주의자",
        7: "내 자유와 계획이 가장 중요한 사람",
        8: "더 거칠고 직설적인 도전자",
        9: "조용히 사라지는 평화주의자"
      }
    },
    {
      id: "sexual_instinct_repressed",
      displayName: "성적 본능 억압형 이해",
      status: "available",
      suppressionCode: "sx",
      audiences: ["adult", "parent", "couple", "coach"],
      resultSlots: ["instinct_profile", "relationship_pattern", "parenting_pattern", "recommended_resources"],
      reportSummary: "강한 끌림, 일대일 몰입, 직접 접촉, 갈등 접근, 생동감 표현이 상대적으로 낮게 나타날 수 있습니다. 사랑이 없다는 뜻이 아니라, 강렬한 접촉 안에 오래 머무는 데 에너지가 많이 드는 패턴입니다.",
      focusAreas: ["일대일 관계에서 먼저 다가가는 힘", "갈등이 생겼을 때 물러남과 회피의 구분", "사랑이 체감되도록 현존을 보여주는 방식"],
      practicePrompts: ["짧지만 집중된 10분 대화 만들기", "불편함을 사라지기 전에 한 문장으로 표현하기", "책임 수행뿐 아니라 정서적 접촉을 명시적으로 보여주기"],
      typeSpecificTitles: {
        1: "분노를 안으로 삼키는 1번",
        2: "가까워지고 싶지만 먼저 다가가기 어려운 2번",
        3: "조용히 성취를 쌓는 3번",
        4: "조용히 아파하는 4번",
        5: "더 멀리 물러나는 5번",
        6: "더 조심스럽고 확신이 약한 6번",
        7: "더 조심스럽고 잘 듣는 7번",
        8: "조용하고 덜 침투적인 8번",
        9: "더 무기력하고 수동적인 9번"
      }
    },
    {
      id: "self_preservation_instinct_repressed",
      displayName: "자기보존 본능 억압형 이해",
      status: "available",
      suppressionCode: "sp",
      audiences: ["adult", "parent", "coach"],
      resultSlots: ["instinct_profile", "relationship_pattern", "parenting_pattern", "recommended_resources"],
      reportSummary: "몸, 돈, 시간, 안전, 생활 기반, 개인 경계가 의식의 우선순위에서 밀릴 수 있습니다. 살아가는 힘이 없다는 뜻이 아니라, 나를 돌보는 감각이 행동으로 연결되기까지 시간이 걸리는 패턴입니다.",
      focusAreas: ["몸의 신호와 회복 리듬", "돈과 시간 같은 현실 자원의 확인", "도움과 헌신 속에서 내 경계를 지키는 훈련"],
      practicePrompts: ["식사, 수면, 병원 일정을 먼저 달력에 넣기", "새 일을 시작하기 전 비용과 위험 세 가지 적기", "부탁에 즉답하지 않고 일정을 확인한 뒤 답하기"],
      typeSpecificTitles: {
        1: "타인을 위해 바르게 살지만 자신은 방치하는 사람",
        2: "다른 사람에게는 모든 것을 주지만 도움은 받지 않는 사람",
        3: "성공의 모습에는 집중하지만 기반은 놓치는 사람",
        4: "감정은 자신을 향하지만 에너지는 바깥으로 흩어지는 사람",
        5: "머리는 멀리 가지만 몸과 현실은 뒤에 남는 사람",
        6: "큰 위험은 걱정하지만 일상의 위험은 놓치는 사람",
        7: "가능성은 크게 보지만 비용과 위험은 작게 보는 사람",
        8: "강하지만 자기 몸은 돌보지 않는 보호자",
        9: "자신을 두 번 잊어버리는 사람"
      }
    },
    {
      id: "mother_type_traits",
      displayName: "엄마 유형 특징 정리",
      status: "available",
      audiences: ["parent", "coach"],
      resultSlots: ["parenting_pattern", "recommended_resources"],
      reportSummary: "부모 자신의 핵심 유형이 자녀에게 주는 강점과, 스트레스에서 과해질 수 있는 그림자를 함께 점검합니다.",
      focusAreas: ["자녀가 받는 긍정적 영향", "부모 유형의 양육 그림자", "오늘부터 조정할 실천 전략"],
      practicePrompts: ["자녀가 체감하는 내 강점 한 가지 말로 확인하기", "스트레스에서 반복되는 말투와 요구를 기록하기", "이번 주 하나의 양육 기준을 낮추고 관계를 먼저 선택하기"],
      typeSpecificTitles: {
        1: "1번 유형 엄마",
        2: "2번 유형 엄마",
        3: "3번 유형 엄마",
        4: "4번 유형 엄마",
        5: "5번 유형 엄마",
        6: "6번 유형 엄마",
        7: "7번 유형 엄마",
        8: "8번 유형 엄마",
        9: "9번 유형 엄마"
      }
    },
    {
      id: "child_observation_checklist",
      displayName: "아이 유형 관찰 체크리스트",
      status: "available",
      audiences: ["parent", "child_report", "coach"],
      resultSlots: ["child_observation", "recommended_resources"],
      reportSummary: "아이를 한 번호로 단정하지 않고, 여러 상황에서 반복되는 욕구와 두려움을 관찰하는 체크리스트입니다.",
      focusAreas: ["반복 행동과 스트레스 신호", "겉행동 아래의 속마음", "도움이 되는 부모 반응과 피해야 할 말"],
      practicePrompts: ["한두 장면이 아니라 2주 이상 반복 패턴 보기", "아이의 행동보다 그 아래 욕구를 먼저 메모하기", "확정 진단 대신 관찰 질문으로 대화 열기"],
      typeSpecificTitles: {
        1: "올바른 사람 / 완벽주의자",
        2: "도움 주는 사람 / 사람을 기쁘게 하는 사람",
        3: "성취하는 사람 / 이미지 지향",
        4: "개성 있는 사람 / 낭만적",
        5: "탐구하는 사람 / 관찰자",
        6: "충성하는 사람 / 의심하는 사람",
        7: "열정적인 사람 / 즐거움 추구자",
        8: "도전하는 사람 / 보호자",
        9: "평화로운 사람 / 중재자"
      }
    },
    {
      id: "child_type_conversation_principles",
      displayName: "아이 유형별 대화 원칙",
      status: "available",
      audiences: ["parent", "child_report", "coach"],
      resultSlots: ["child_conversation", "recommended_resources"],
      reportSummary: "아이 유형별 핵심 두려움을 자극하지 않고, 존재 자체를 인정하는 대화 원칙을 제공합니다.",
      focusAreas: ["아이에게 특히 상처가 되는 말", "핵심 두려움을 건드리지 않는 표현", "존재 자체를 확인하는 문장"],
      practicePrompts: ["지적 전에 아이가 들을 수 있는 안전한 첫 문장 만들기", "비교와 조건부 칭찬을 줄이기", "아이의 유형별 핵심 두려움을 건드리는 표현 점검하기"],
      typeSpecificTitles: {
        1: "완벽을 추구하는 아이",
        2: "돕는 아이",
        3: "열매 맺는 아이",
        4: "아름다운 아이",
        5: "관찰하는 아이",
        6: "충성스러운 아이",
        7: "열정적인 아이",
        8: "보호하는 아이",
        9: "평화로운 아이"
      }
    },
    {
      id: "sibling_conflict_mediation",
      displayName: "형제 싸움 중재 멘트 20선",
      status: "available",
      audiences: ["parent", "coach"],
      resultSlots: ["sibling_mediation", "recommended_resources"],
      reportSummary: "형제 갈등 상황에서 부모가 재판관이 아니라 중재자로 서도록 돕는 실전 멘트 자료입니다.",
      focusAreas: ["싸움이 터진 첫 30초", "각자의 감정을 들리게 하는 중재", "강요 없는 회복과 가족 규칙 만들기"],
      practicePrompts: ["누가 먼저인지 묻기 전에 몸싸움부터 멈추기", "둘 다의 감정을 한 문장씩 번역하기", "반복 갈등은 멘트가 아니라 규칙으로 정리하기"],
      typeSpecificTitles: {}
    }
  ];

  const SUPPRESSION_MATERIAL_BY_INSTINCT = {
    so: "social_instinct_repressed",
    sx: "sexual_instinct_repressed",
    sp: "self_preservation_instinct_repressed"
  };

  const INSTINCT_LABELS = {
    sp: "자기보존",
    sx: "성적/일대일",
    so: "사회적"
  };

  function normalizeInstinctCode(value) {
    if (value === null || value === undefined) return null;
    const compact = String(value)
      .trim()
      .toLowerCase()
      .replace(/[\s_\-/()]+/g, "");

    if (["sp", "selfpres", "selfpreservation", "selfprotect", "자기보존", "자본"].includes(compact)) {
      return "sp";
    }
    if (["sx", "sexual", "sex", "onetoone", "성적", "성본", "일대일", "성적일대일"].includes(compact)) {
      return "sx";
    }
    if (["so", "social", "사회적", "사회", "사본"].includes(compact)) {
      return "so";
    }
    return null;
  }

  function normalizePercent(value) {
    if (value === null || value === undefined || value === "") return null;
    const raw = typeof value === "string" ? value.replace("%", "").trim() : value;
    const number = Number(raw);
    if (!Number.isFinite(number)) return null;
    return Math.max(0, Math.min(100, Math.round(number)));
  }

  function pickPercent(row) {
    if (row === null || row === undefined) return null;
    if (typeof row !== "object") return normalizePercent(row);
    const fields = ["percent", "pct", "value", "score", "v"];
    for (const field of fields) {
      if (Object.prototype.hasOwnProperty.call(row, field)) {
        return normalizePercent(row[field]);
      }
    }
    return null;
  }

  function normalizeInstinctPercents(input) {
    const source = input && input.instinctPct
      ? input.instinctPct
      : input && input.instinctRows
        ? input.instinctRows
        : input && input.instincts
          ? input.instincts
          : input;

    const percents = { sp: null, sx: null, so: null };
    if (!source) return percents;

    if (Array.isArray(source)) {
      source.forEach((row) => {
        const code = normalizeInstinctCode(row && (row.code || row.k || row.instinct || row.id || row.label || row.name));
        if (!code) return;
        percents[code] = pickPercent(row);
      });
      return percents;
    }

    if (typeof source === "object") {
      Object.keys(source).forEach((key) => {
        const code = normalizeInstinctCode(key);
        if (!code) return;
        percents[code] = pickPercent(source[key]);
      });
    }

    return percents;
  }

  function getMaterial(id) {
    return MATERIALS.find((material) => material.id === id) || null;
  }

  function detectRepressedInstinct(input, thresholds) {
    const config = Object.assign({}, DEFAULT_THRESHOLDS, thresholds || {});
    const percents = normalizeInstinctPercents(input);
    const rows = ["sp", "sx", "so"]
      .map((code) => ({ code, percent: percents[code] }))
      .filter((row) => Number.isFinite(row.percent));

    if (rows.length < 3) {
      return {
        code: null,
        reason: "insufficient_data",
        percents
      };
    }

    rows.sort((a, b) => a.percent - b.percent);
    const lowest = rows[0];
    const middle = rows[1];
    const gapFromMiddle = middle.percent - lowest.percent;

    if (gapFromMiddle <= config.tieTolerancePoints) {
      return {
        code: null,
        reason: "ambiguous_lowest",
        percents,
        lowest: lowest.code,
        gapFromMiddle
      };
    }

    if (lowest.percent > config.extremeLowPercentMax) {
      return {
        code: null,
        reason: "not_extreme_low",
        percents,
        lowest: lowest.code,
        lowestPercent: lowest.percent
      };
    }

    if (gapFromMiddle < config.minimumGapFromMiddle) {
      return {
        code: null,
        reason: "not_enough_gap",
        percents,
        lowest: lowest.code,
        lowestPercent: lowest.percent,
        gapFromMiddle
      };
    }

    const materialId = SUPPRESSION_MATERIAL_BY_INSTINCT[lowest.code];
    const material = getMaterial(materialId);

    return {
      code: lowest.code,
      label: INSTINCT_LABELS[lowest.code],
      percent: lowest.percent,
      gapFromMiddle,
      materialId,
      materialStatus: material ? material.status : "missing",
      reason: "suppressed",
      percents
    };
  }

  function normalizeCoreType(value) {
    const number = Number(value);
    if (!Number.isInteger(number) || number < 1 || number > 9) return null;
    return number;
  }

  function deriveAudience(profile) {
    if (profile && profile.audience) return profile.audience;
    if (profile && profile.childReport) return "child_report";
    if (profile && (profile.isParent || profile.parentContext || profile.hasChildren)) return "parent";
    return "adult";
  }

  function materialEntry(material, options) {
    const type = normalizeCoreType(options && options.type);
    return {
      id: material.id,
      displayName: material.displayName,
      status: material.status,
      reason: options && options.reason ? options.reason : null,
      type,
      typeTitle: type && material.typeSpecificTitles ? material.typeSpecificTitles[type] || null : null,
      suppressionCode: material.suppressionCode || null,
      reportSummary: material.reportSummary || "",
      focusAreas: (material.focusAreas || []).slice(),
      practicePrompts: (material.practicePrompts || []).slice(),
      resultSlots: material.resultSlots.slice()
    };
  }

  function selectSupportMaterials(profile) {
    const source = profile || {};
    const audience = deriveAudience(source);
    const adultType = normalizeCoreType(source.adultType || source.coreType || source.core || source.type);
    const childType = normalizeCoreType(source.childType || source.childCoreType);
    const isParent = audience === "parent" || Boolean(source.isParent || source.parentContext || source.hasChildren);
    const wantsChildMaterials = Boolean(childType || source.includeChildMaterials || source.childContext || audience === "child_report");
    const needsSiblingMediation = Boolean(source.needsSiblingMediation || source.siblingConflict || source.hasMultipleChildren);
    const repressedInstinct = detectRepressedInstinct(source, source.thresholds);
    const materials = [];
    const pendingMaterials = [];
    const seen = new Set();

    function addMaterial(id, options) {
      const material = getMaterial(id);
      if (!material || seen.has(id)) return;
      seen.add(id);
      const entry = materialEntry(material, options || {});
      if (material.status === "available") {
        materials.push(entry);
      } else {
        pendingMaterials.push(entry);
      }
    }

    if (repressedInstinct.code && repressedInstinct.materialId) {
      addMaterial(repressedInstinct.materialId, {
        type: adultType,
        reason: `${repressedInstinct.code} instinct is extremely low`
      });
    }

    if (isParent && adultType) {
      addMaterial("mother_type_traits", {
        type: adultType,
        reason: "parent profile with known adult core type"
      });
    }

    if (wantsChildMaterials && childType) {
      addMaterial("child_observation_checklist", {
        type: childType,
        reason: "child type observation lens requested"
      });
      addMaterial("child_type_conversation_principles", {
        type: childType,
        reason: "child-facing conversation guidance requested"
      });
    }

    if (isParent && needsSiblingMediation) {
      addMaterial("sibling_conflict_mediation", {
        reason: "sibling conflict or multiple-child context"
      });
    }

    const recommendedSlots = Array.from(new Set(
      materials.flatMap((material) => material.resultSlots)
    ));

    return {
      audience,
      adultType,
      childType,
      repressedInstinct,
      materials,
      pendingMaterials,
      recommendedSlots
    };
  }

  const ReportSupportMaterials = {
    DEFAULT_THRESHOLDS,
    MATERIALS,
    normalizeInstinctCode,
    normalizeInstinctPercents,
    detectRepressedInstinct,
    selectSupportMaterials
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = ReportSupportMaterials;
  }
  if (typeof window !== "undefined") {
    window.ERReportSupportMaterials = ReportSupportMaterials;
  }
})();

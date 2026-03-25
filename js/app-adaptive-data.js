// ER App: Adaptive test data, questions, UI strings
// Adaptive Test State/Data
let adaptivePhase1Responses = {};
let adaptiveTopCandidates = [];
let adaptivePhase2QuestionsData = [];
let adaptiveTieBreakerMeta = { enabled: false, weight: 0, margin: null };
let adaptiveTieBreaker31Meta = { enabled: false, weight: 0, margin: null };
let adaptiveTieBreaker3SXMeta = { enabled: false, weight: 0, margin: null };
let adaptiveTieBreaker71Meta = { enabled: false, weight: 0, margin: null };
let adaptiveTieBreaker78Meta = { enabled: false, weight: 0, margin: null };
let adaptiveTieBreaker7WingMeta = { enabled: false, weight: 0, margin: null };
let adaptiveLang = 'ko';
const adaptiveArrowLines = {
    1: { stress: 4, growth: 7 },
    2: { stress: 8, growth: 4 },
    3: { stress: 9, growth: 6 },
    4: { stress: 2, growth: 1 },
    5: { stress: 7, growth: 8 },
    6: { stress: 3, growth: 9 },
    7: { stress: 1, growth: 5 },
    8: { stress: 5, growth: 2 },
    9: { stress: 6, growth: 3 }
};

const adaptivePhase1Questions = [
    { id: 't2', type: 2, q: "관계가 어색해지거나 평가받는 느낌이 들면, 나는 내 진짜 감정보다 상대가 원하는 모습으로 조율하고, 그 대가로 내 욕구가 뒤로 밀린다." },
    { id: 't5', type: 5, q: "불확실한 상황에서 나는 먼저 머릿속 시뮬레이션과 정보 정리에 들어가고, 그 대가로 즉각적인 참여와 감정 교류가 줄어든다." },
    { id: 't8', type: 8, q: "통제당하거나 밀린다고 느끼면 나는 즉시 경계선을 세우고 주도권을 잡으려 하며, 그 대가로 관계 긴장이 커질 때가 있다." },
    { id: 'c1', type: 1, q: "무언가가 어긋나 보이면 나는 바로잡아야 마음이 놓이고, 그 대가로 나와 타인 모두에게 엄격해질 때가 있다." },
    { id: 'c2', type: 2, q: "관계가 멀어질까 불안할 때 나는 먼저 돕고 챙기며 연결을 붙잡고, 그 대가로 서운함을 표현하지 못하고 쌓아두곤 한다." },
    { id: 'c3', type: 3, q: "가치가 흔들릴 때 나는 성과와 이미지 최적화로 신뢰를 확보하려 하고, 그 대가로 감정·피로 신호를 무시할 때가 있다." },
    { id: 'c4', type: 4, q: "비슷해 보이거나 평범해질 때 나는 나만의 의미와 감정 깊이를 더 찾고, 그 대가로 현재의 만족이 늦어진다." },
    { id: 'c5', type: 5, q: "요구가 많아지면 나는 거리를 두고 에너지를 보존하며, 그 대가로 관계가 차갑게 느껴질 수 있다." },
    { id: 'c6', type: 6, q: "위험 신호를 느끼면 나는 확인·재확인과 대안 시나리오를 늘리고, 그 대가로 결정 속도가 느려질 때가 있다." },
    { id: 'c7', type: 7, q: "답답함이나 불편한 감정이 올라오면 나는 가능한 선택지를 늘리고 분위기를 전환하며, 그 대가로 어려운 감정 직면이 미뤄진다." },
    { id: 'c8', type: 8, q: "힘의 불균형을 감지하면 나는 정면으로 개입해 판을 주도하려 하고, 그 대가로 타인이 압박을 느끼기도 한다." },
    { id: 'c9', type: 9, q: "갈등 조짐이 보이면 나는 평화를 위해 내 우선순위를 뒤로 미루고, 그 대가로 중요한 결정을 지연시킬 때가 있다." },
    { id: 'f_2_3', format: 'ab', leftType: 2, rightType: 3, weight: 2.2, q: "압박 상황에서 더 자동으로 나오는 쪽을 고르세요.", a: "A. 먼저 상대를 챙겨 관계를 붙잡는다.", b: "B. 먼저 성과와 유능함을 증명한다." },
    { id: 'f_3_6', format: 'ab', leftType: 3, rightType: 6, weight: 2.2, q: "불안할 때 더 자동으로 나오는 쪽을 고르세요.", a: "A. 결과를 내서 인정받는 쪽으로 몰입한다.", b: "B. 리스크를 점검하고 대비를 강화한다." },
    { id: 'f_6_8', format: 'ab', leftType: 6, rightType: 8, weight: 2.2, q: "위협을 느낄 때 더 자동으로 나오는 쪽을 고르세요.", a: "A. 확인·협의·안전장치부터 만든다.", b: "B. 바로 개입해 힘의 균형을 바꾼다." },
    { id: 'f_1_9', format: 'ab', leftType: 1, rightType: 9, weight: 2.2, q: "갈등 직전 더 자동으로 나오는 쪽을 고르세요.", a: "A. 기준을 분명히 하고 바로잡는다.", b: "B. 마찰을 줄이고 흐름을 유지한다." },
    { id: 'f_5_7', format: 'ab', leftType: 5, rightType: 7, weight: 2.2, q: "에너지가 떨어질 때 더 자동으로 나오는 쪽을 고르세요.", a: "A. 물러나 분석하고 최소 반응한다.", b: "B. 전환점과 새로운 자극을 찾는다." },
    { id: 'f_2_8', format: 'ab', leftType: 2, rightType: 8, weight: 2.2, q: "관계가 흔들릴 때 더 자동으로 나오는 쪽을 고르세요.", a: "A. 더 도우며 연결을 붙잡는다.", b: "B. 선을 긋고 주도권을 회수한다." },
    { id: 'state_2w', q: "최근 2주 기준으로, 내 일상은 전반적으로 얼마나 압박/스트레스 상태였나요? (1=매우 안정, 5=매우 높은 압박)" },
    { id: 'i_sp_1', inst: 'sp', q: "나는 안전, 재정, 생활 리듬(수면/식사/체력)을 먼저 정비해야 관계와 일이 안정된다고 느낀다." },
    { id: 'i_sp_2', inst: 'sp', q: "시간·돈·에너지 낭비가 생기면 마음이 크게 흔들리고, 효율 회복이 우선순위가 된다." },
    { id: 'i_sx_1', inst: 'sx', q: "넓은 네트워킹보다 강한 1:1 몰입 관계나 대상이 있을 때 삶의 에너지가 급격히 올라간다." },
    { id: 'i_sx_2', inst: 'sx', q: "중요하다고 느낀 대상에는 단기간에 강하게 몰입하고, 강도 높은 연결을 원한다." },
    { id: 'i_so_1', inst: 'so', q: "집단 안에서 영향력 구조, 역할, 소속의 위치를 빠르게 읽고 그 흐름에 맞춰 움직인다." },
    { id: 'i_so_2', inst: 'so', q: "개인 만족보다 공동체 기여·평판·역할의 지속성이 더 중요하다고 느낄 때가 많다." }
];

const adaptiveDeepMotivations = {
    1: [
        { id: 'd1_1', type: 1, q: "무언가를 할 때 '이것이 최선인가? 더 제대로 해야 하지 않나?'라며 스스로의 행동을 점검하고 기준을 맞추려는 내면의 목소리가 자주 들리는 편이다." },
        { id: 'd1_2', type: 1, q: "나는 속으로 '이건 이렇게 해야 해'라는 정답을 정해놓고, 나 자신이나 타인이 그 기준에 미치지 못할 때 자주 답답함을 느낀다." }
    ],
    2: [
        { id: 'd2_1', type: 2, q: "관계 불안을 느끼면 나는 먼저 도움·배려를 제공해 유대를 묶으려 하고, 그 대가로 거절·요청을 직접 말하지 못하는 편이다." },
        { id: 'd2_2', type: 2, q: "상대 필요를 읽는 속도는 빠르지만, 내 필요를 분명히 말하는 순간 미묘한 수치심이나 미안함이 올라온다." }
    ],
    3: [
        { id: 'd3_1', type: 3, q: "압박이 오면 나는 즉시 목표·성과 지표 중심으로 재정렬하고, 그 대가로 내 감정 상태나 관계 피로를 뒤로 미루는 편이다." },
        { id: 'd3_2', type: 3, q: "나는 존재 자체보다 '유능한 결과물'로 평가받을 때 안전하다고 느끼며, 효율과 이미지 관리를 자동으로 최적화한다." }
    ],
    4: [
        { id: 'd4_1', type: 4, q: "사람들에게 온전히 이해받지 못한다는 묘한 소외감을 종종 느끼며, 나의 슬픔이나 결핍마저도 나만의 특별함이라고 여기는 경향이 있다." },
        { id: 'd4_2', type: 4, q: "무미건조하고 평범한 일상보다는, 감정이 깊이 요동치고 의미가 담긴 상황에서 비로소 내가 살아있음을 강하게 느끼곤 한다." }
    ],
    5: [
        { id: 'd5_1', type: 5, q: "나는 세상이나 사람들과 직접 부딪히기보다, 한 발짝 떨어져서 적당한 거리를 두고 관찰자 모드로 있을 때 가장 안전하다고 느낀다." },
        { id: 'd5_2', type: 5, q: "누군가 나에게 갑작스러운 감정적 반응을 요구하거나 내 지적 영역을 침범하면, 무의식적으로 에너지를 차단하고 물러서게 된다." }
    ],
    6: [
        { id: 'd6_1', type: 6, q: "애매함이 커질수록 나는 위험 시나리오를 늘려 점검하고, 그 대가로 확신 전까지 행동이 늦어질 때가 있다." },
        { id: 'd6_2', type: 6, q: "권위를 따르며 안전을 얻고 싶지만, 동시에 허점을 찾기 위해 질문·검증을 반복하는 이중 반응이 있다." }
    ],
    7: [
        { id: 'd7_1', type: 7, q: "부정적인 감정이나 복잡하고 불편한 현실에 직면하는 것이 피곤하게 느껴져서, 나도 모르게 분위기를 환기하거나 흥미로운 다른 일들로 주의를 돌리려는 패턴이 있다." },
        { id: 'd7_2', type: 7, q: "어떤 한 가지에 얽매이거나 제한당하는 것을 꽤 답답해하며, 항상 다양한 가능성과 선택지를 열어두어야 마음이 편하다." }
    ],
    8: [
        { id: 'd8_1', type: 8, q: "힘의 역학에서 밀린다고 느끼면 나는 즉시 압력을 올리거나 판을 재구성하며, 그 대가로 충돌 강도가 높아질 수 있다." },
        { id: 'd8_2', type: 8, q: "내가 원하는 것은 호감 자체보다 약해 보이지 않는 존중과 영향력이며, 필요시 직접적 표현을 주저하지 않는다." }
    ],
    9: [
        { id: 'd9_1', type: 9, q: "나는 나와 타인, 혹은 환경과의 '연결감'이 끊어지는 것을 두려워하며, 내 안의 평화를 유지하기 위해 종종 내 진짜 분노나 욕구를 억누르곤 한다." },
        { id: 'd9_2', type: 9, q: "중요한 갈등 상황이나 결정을 마주할 때, 직면하는 스트레스를 피하기 위해 덜 중요한 사소한 일들에 몰두하며 에너지를 분산시키는 패턴이 있다." }
    ]
};

const adaptiveTieBreaker36 = [
    { id: 'tb_3_6_1', type: 3, q: "내가 유능하게 일을 처리하고 성과를 내는 것은, 궁극적으로 '사람들의 인정과 사랑받을 만한 존재가 되기 위함'에 더 가깝다." },
    { id: 'tb_3_6_2', type: 6, q: "내가 열심히 일하고 대비하는 것은, 궁극적으로 '예측 불가능한 상황에서 나를 보호하고 안전한 지지 기반을 확보하기 위함'에 더 가깝다." }
];
const adaptiveTieBreaker31 = [
    { id: 'tb_3_1_1', type: 3, q: "내가 목표를 성취하려는 가장 큰 이유는, 결과를 통해 나의 유능함과 가치를 인정받기 위해서인 경우가 많다." },
    { id: 'tb_3_1_2', type: 1, q: "내가 목표를 끝까지 밀어붙이는 가장 큰 이유는, 올바른 기준에 맞게 바로잡고 완성해야 마음이 편해지기 때문이다." }
];
const adaptiveTieBreaker3SX = [
    { id: 'tb_3_sx_1', type: 3, q: "내가 기어코 목표를 달성하려는 가장 큰 이유는, 그것을 해냈을 때 사람들에게 가치 있는 사람으로 인정받고 나의 유능함을 증명할 수 있기 때문이다." },
    { id: 'tb_3_sx_2', q: "내가 무언가에 무섭게 몰두하여 끝을 보려는 가장 큰 이유는, 타인의 인정보다는 그 과정에서 느끼는 강렬한 몰입감과 성취해냈다는 내적 쾌감이 더 크기 때문이다." }
];
const adaptiveTieBreaker71 = [
    { id: 'tb_7_1_1', type: 7, q: "압박이 커질수록 나는 기준을 강화하기보다, 선택지를 넓히고 가능성을 찾아 숨통을 트는 쪽이 더 자동적이다." },
    { id: 'tb_7_1_2', type: 1, q: "압박이 커질수록 나는 가능성 확장보다, 기준을 세우고 오류를 바로잡는 쪽이 더 자동적이다." }
];
const adaptiveTieBreaker78 = [
    { id: 'tb_7_8_1', type: 7, q: "나는 '막힘을 뚫는 방식'으로 전환·아이디어·속도(7)를 더 자주 사용한다." },
    { id: 'tb_7_8_2', type: 8, q: "나는 '막힘을 뚫는 방식'으로 힘의 재배치·직접 개입·주도권 회수(8)를 더 자주 사용한다." }
];
const adaptiveTieBreaker7Wing = [
    { id: 'tb_7w_1', wing: 6, q: "7번 패턴일 때, 나는 현실 리스크 점검·안전장치·신뢰 가능한 구조(7w6)에 더 끌린다." },
    { id: 'tb_7w_2', wing: 8, q: "7번 패턴일 때, 나는 독립성·강한 추진·직접 압박 돌파(7w8)에 더 끌린다." }
];

const adaptiveQuestionEn = {
    t2: "When I feel evaluated in relationships, I adjust to how I want to be seen, and my own needs get pushed to the background.",
    t5: "In uncertain situations, I go into analysis first, and immediate emotional engagement tends to drop.",
    t8: "When I feel controlled or overpowered, I quickly draw a line and move to regain control, even if tension rises.",
    c1: "When something feels off, I feel driven to fix it and get it right, and I can become strict with myself and others.",
    c2: "When connection feels shaky, I tend to secure the bond by helping first, while my own needs stay unspoken.",
    c3: "When my sense of worth feels threatened, I shift into performance and image mode to restore credibility.",
    c4: "When life feels too ordinary, I look for emotional depth and personal meaning, even if it delays contentment.",
    c5: "When demands pile up, I pull back to conserve energy, and that distance can make me seem emotionally unavailable.",
    c6: "When risk is in the air, I double-check assumptions and run contingency scenarios, which can slow decisions.",
    c7: "When discomfort rises, I instinctively open up options and pivot toward possibility, often delaying direct emotional contact.",
    c8: "When I sense a power imbalance, I step in directly to reset control, even if the intensity escalates.",
    c9: "When conflict starts building, I tend to prioritize peace over preference and postpone hard decisions.",
    f_2_3: "Under pressure, which pattern shows up first for you?",
    f_3_6: "When anxiety rises, which pattern comes online first?",
    f_6_8: "When you feel threatened, which response is more automatic?",
    f_1_9: "Right before conflict, which response tends to come first?",
    f_5_7: "When your energy is low, which recovery pattern appears first?",
    f_2_8: "When a relationship feels unstable, which reaction is more automatic?",
    state_2w: "Over the last two weeks, how much pressure or stress have you been under overall? (1 = very stable, 5 = very high pressure)",
    i_sp_1: "I feel most stable when basics like safety, money, sleep, and physical rhythm are in order.",
    i_sp_2: "Waste of time, money, or energy unsettles me quickly, and restoring order becomes urgent.",
    i_sx_1: "A deep one-on-one bond energizes me more than broad social connection.",
    i_sx_2: "When something matters to me, I lock in with strong intensity and focus.",
    i_so_1: "In groups, I quickly track status, role, and influence dynamics.",
    i_so_2: "Contribution, role continuity, and belonging often matter more to me than private comfort.",
    d1_1: "I often hear an inner pressure asking, “Is this the best version? Can this be done more correctly?”",
    d1_2: "I carry a strong internal standard, and I feel tension when I or others fall short of it.",
    d2_1: "When relational anxiety rises, I secure attachment by giving first, while delaying direct requests for what I need.",
    d2_2: "I read others' needs quickly, but naming my own can trigger subtle shame or guilt.",
    d3_1: "Under pressure, I reorganize around goals and measurable outcomes, often sidelining emotional signals.",
    d3_2: "I feel safer being valued for visible competence than for simply being who I am.",
    d4_1: "I often feel fundamentally misunderstood, and even painful emotions can feel tied to my identity.",
    d4_2: "I feel most alive in emotionally meaningful moments, not in flat, routine flow.",
    d5_1: "I feel safest when I can step back, observe, and understand before engaging.",
    d5_2: "When emotional demands are sudden or intrusive, I instinctively withdraw to protect my energy.",
    d6_1: "As ambiguity increases, I expand risk checks and verification, which can delay action.",
    d6_2: "I seek safety through systems and authority while also testing them for hidden weakness.",
    d7_1: "When reality feels heavy, I move toward reframing, options, and lighter momentum.",
    d7_2: "Too much limitation feels suffocating; I relax when multiple paths remain open.",
    d8_1: "When I feel overpowered, I increase pressure and move to reclaim control, even at relational cost.",
    d8_2: "What I need most is not approval but respect for my impact, boundaries, and agency.",
    d9_1: "To preserve peace and connection, I can mute my real anger or desires without fully noticing.",
    d9_2: "At major conflict or decision points, I may diffuse tension by shifting into less urgent tasks.",
    tb_3_6_1: "When I push for performance, the core motive is proving competence and securing recognition.",
    tb_3_6_2: "When I push for preparation, the core motive is building safety and a reliable base.",
    tb_3_1_1: "My strongest achievement drive is usually about proving value through results.",
    tb_3_1_2: "My strongest achievement drive is usually about getting things right by principle.",
    tb_3_sx_1: "When I push to achieve, the core motive is to be seen as competent and valuable.",
    tb_3_sx_2: "When I push intensely, the deeper reward is immersion and internal charge more than recognition.",
    tb_7_1_1: "Under pressure, I more often expand options and chase possibility.",
    tb_7_1_2: "Under pressure, I more often tighten standards and correct what is wrong.",
    tb_7_8_1: "When blocked, I break through by reframing, alternatives, and momentum (7).",
    tb_7_8_2: "When blocked, I break through through direct force, confrontation, and control reset (8).",
    tb_7w_1: "In a 7 pattern, I lean toward risk checks, safety planning, and trusted structure (7w6).",
    tb_7w_2: "In a 7 pattern, I lean toward independence, assertive drive, and direct push-through (7w8).",
    f_2_3_a: "A. I first support the other person to preserve connection.",
    f_2_3_b: "B. I first prove competence through visible performance.",
    f_3_6_a: "A. I immerse in delivering results to secure recognition.",
    f_3_6_b: "B. I strengthen risk checks and safety preparation first.",
    f_6_8_a: "A. I start with verification, alignment, and safeguards.",
    f_6_8_b: "B. I intervene directly to reset the power balance.",
    f_1_9_a: "A. I clarify standards and correct what is off.",
    f_1_9_b: "B. I reduce friction and preserve relational flow.",
    f_5_7_a: "A. I step back, analyze, and minimize stimulation.",
    f_5_7_b: "B. I look for pivots and fresh stimulating options.",
    f_2_8_a: "A. I offer more care to hold the connection.",
    f_2_8_b: "B. I draw firmer boundaries and reclaim control."
};

const adaptiveUi = (ER.adaptiveUi && ER.adaptiveUi.ko && ER.adaptiveUi.en) ? ER.adaptiveUi : { ko: {}, en: {} };

function adaptiveText(key) {
    return adaptiveUi[adaptiveLang][key];
}

function adaptiveQuestionText(item) {
    if (adaptiveLang === 'en' && adaptiveQuestionEn[item.id]) return adaptiveQuestionEn[item.id];
    return item.q;
}

function adaptiveOptionText(item, side) {
    const value = side === 'a' ? item.a : item.b;
    if (adaptiveLang === 'en') {
        const key = `${item.id}_${side}`;
        if (adaptiveQuestionEn[key]) return adaptiveQuestionEn[key];
    }
    return value;
}

function setAdaptiveTestLanguage(lang) {
    adaptiveLang = lang === 'en' ? 'en' : 'ko';
    renderSection('test');
}
if (typeof window !== 'undefined') window.setAdaptiveTestLanguage = setAdaptiveTestLanguage;

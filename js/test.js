const params = new URLSearchParams(window.location.search || '');
const pageLang = params.get('lang') === 'en' ? 'en' : 'ko';

// Minimal English question/option texts (ported from adaptiveQuestionEn in index.html)
const questionTextEn = {
  t2: "When I feel evaluated in relationships, I adjust to how I want to be seen, and my own needs get pushed to the background.",
  t5: "In uncertain situations, I go into analysis first, and immediate emotional engagement tends to drop.",
  t8: "In relationships or work, I quickly sense what is right or wrong and who is responsible for what; when that order is violated or something unfair happens, I want to react immediately.",
  c1: "When something feels off, I feel driven to fix it and get it right, and I can become strict with myself and others.",
  c2: "When connection feels shaky, I tend to secure the bond by helping first, while my own needs stay unspoken.",
  c3: "When my sense of worth feels threatened, I shift into performance and image mode to restore credibility.",
  c4: "When life feels too ordinary, I look for emotional depth and personal meaning, even if it delays contentment.",
  c5: "When demands pile up, I pull back to conserve energy, and that distance can make me seem emotionally unavailable.",
  c6: "When risk is in the air, I double-check assumptions and run contingency scenarios, which can slow decisions.",
  c7: "When discomfort rises, I instinctively open up options and pivot toward possibility, often delaying direct emotional contact.",
  c8: "When I see my people or the vulnerable being treated unfairly or used, my first reaction is to step in directly to protect them and change the situation, rather than back off.",
  c9: "When conflict starts building, I tend to prioritize peace over preference and postpone hard decisions.",
  f_2_3: "Under pressure, which pattern shows up first for you?",
  f_3_6: "When anxiety rises, which pattern comes online first?",
  f_6_8: "When you feel threatened, which response is more automatic?",
  f_1_9: "Right before conflict, which response tends to come first?",
  f_5_7: "When your energy is low, which recovery pattern appears first?",
  f_2_8: "When a relationship feels unstable, which reaction is more automatic?",
  f_2_3_a: "A. I first move to care for the other person and hold on to the connection.",
  f_2_3_b: "B. I first move to prove competence and take charge of the situation.",
  f_3_6_a: "A. I focus on producing results quickly to secure recognition and trust.",
  f_3_6_b: "B. I strengthen risk checks and safety preparation first.",
  f_6_8_a: "A. I start with verification, alignment, and safeguards.",
  f_6_8_b: "B. I intervene directly to reset the power balance.",
  f_1_9_a: "A. I clarify standards and correct what is off.",
  f_1_9_b: "B. I reduce friction and preserve relational flow.",
  f_5_7_a: "A. I step back, analyze, and minimize stimulation.",
  f_5_7_b: "B. I look for pivots and fresh stimulating options.",
  f_2_8_a: "A. I offer more care to hold the connection.",
  f_2_8_b: "B. I draw firmer boundaries and reclaim control.",
  tb_1_8_1: "Source of anger: Which sentence describes you more accurately?",
  tb_1_8_1_a: "A. I feel more anger when things are done in a wrong or irrational way.",
  tb_1_8_1_b: "B. I feel more anger when my people or the vulnerable are unfairly attacked or exploited.",
  tb_1_8_2: "Core fear: Which sentence do you relate to more?",
  tb_1_8_2_a: "A. I am more afraid of being criticized for being flawed or wrong in my judgment or actions.",
  tb_1_8_2_b: "B. I am more afraid of being controlled by others or appearing weak and being taken advantage of.",
  tb_1_8_3: "Leadership you seek: Which direction is closer to how you want to lead?",
  tb_1_8_3_a: "A. I want to lead by being the example who shows the right path.",
  tb_1_8_3_b: "B. I want to lead with strong force, protecting my people and fighting external threats.",
  tb_1_8_4: "Self-perception: Which do you more often feel inside?",
  tb_1_8_4_a: "A. I often hear an inner critic voice inside me.",
  tb_1_8_4_b: "B. I often feel a strong will like an inner warrior.",
  tb_1_8_5: "Motivation for 'standing up': In which situation do you feel a stronger urge?",
  tb_1_8_5_a: "A. When someone makes an irrational or principle-breaking decision in my area of responsibility, I feel a strong urge to correct that wrong order.",
  tb_1_8_5_b: "B. When someone ignores my control and tries to unfairly influence my people, I feel a strong urge to stand up to that violation of power and assert my influence."
};

function getQuestionText(item) {
  if (pageLang === 'en' && item.id.startsWith('tb_gen_')) return 'Which of the two sentences below is closer to you?';
  if (pageLang === 'en' && questionTextEn[item.id]) return questionTextEn[item.id];
  return item.q;
}

function getOptionText(item, side) {
  const base = side === 'a' ? item.a : item.b;
  if (pageLang === 'en') {
    const key = `${item.id}_${side}`;
    if (questionTextEn[key]) return questionTextEn[key];
  }
  return base;
}

const arrowLines = {1:{stress:4,growth:7},2:{stress:8,growth:4},3:{stress:9,growth:6},4:{stress:2,growth:1},5:{stress:7,growth:8},6:{stress:3,growth:9},7:{stress:1,growth:5},8:{stress:5,growth:2},9:{stress:6,growth:3}};

const TEST_CONFIG = {
  weights: {
    phase1Core: 1.5,
    phase1Binary: 1.8,
    phase2Base: 2.0,
    postTieBreak: 6.0,
    tieBreaker: {
      default: 1.8,
      near: 1.95,
      close: 2.1,
      type71Default: 2.0,
      type71Close: 2.2,
      type78Default: 2.0,
      type78Close: 2.2,
      wing7: 2.0
    }
  },
  thresholds: {
    candidateRatio: 0.70,
    minCandidates: 3,
    maxCandidates: 5,
    tie36Margin: 0.08,
    tie31Margin: 0.10,
    tie71Margin: 0.12,
    tie78Margin: 0.12,
    tie18Margin: 0.12,
    top2TieMargin: 0.16,
    tie3sxMargin: 0.10,
    tieCloseBand: 0.03,
    tieNearBand31: 0.04,
    tieNearBand718: 0.05,
    tie3sxNearTopInstinctGap: 1,
    confidenceHigh: 0.20,
    confidenceMedium: 0.08,
    confidenceStrongTop3Primary: 44,
    confidenceStrongTop3Secondary: 40,
    confidenceStrongTop2Mass: 0.80,
    postTieBreakDiff: 0.07,
    postTieBreakTop2Mass: 0.78,
    coreReserveDiff: 0.04,
    stressCorrectionStart: 5,
    stressCorrectionMargin: 6.0,
    wingActivationRatio: 0.85
  },
  corrections: {
    sxDampFactor: 0.45,
    sxDampMaxCoreRatio: 0.06,
    sxBoostFactor: 0.35,
    sxBoostCap: 1.5,
    stressType1Damp: 1.0,
    stressType7Boost: 0.6,
    soPenaltyHighLead: 2,
    soPenaltyLowLead: 1,
    soPenaltyHigh: 2.0,
    soPenaltyLow: 1.0
  }
};

const testState = {
  phase1Responses: {},
  phase2Questions: [],
  phase3Question: null,
  pendingResult: null,
  tie: {
    t36: {enabled:false,weight:0,margin:null},
    t31: {enabled:false,weight:0,margin:null},
    t3sx: {enabled:false,weight:0,margin:null},
    t71: {enabled:false,weight:0,margin:null},
    t78: {enabled:false,weight:0,margin:null},
    t18: {enabled:false,weight:0,margin:null},
    tGeneric: {enabled:false,typeA:null,typeB:null,weight:0},
    t7wing: {enabled:false,weight:0,margin:null}
  }
};

const q1 = [
  { id:'t2', type:2, q:'사람들과 함께 있을 때, 내 실제 감정보다 내가 어떻게 보이는지를 먼저 의식해 말과 태도를 조절하는 편이며, 부정적 평가나 민망한 반응을 받으면 수치감이 오래 남는 편이다.' },
  { id:'t5', type:5, q:'예상 밖의 상황을 마주하면 감정적으로 바로 반응하기보다, 먼저 머릿속에서 정보를 정리하고 가능한 변수들을 계산해 불확실성을 줄이려는 쪽으로 자동 반응하는 편이다.' },
  { id:'t8', type:8, q:'관계나 업무 상황에서 무엇이 옳고 그른지, 누가 무엇을 담당하는지에 대한 감각이 빠른 편이며, 그 기준이 깨지거나 부당한 일이 생기면 즉각 반응하고 싶어지는 편이다.' },
  { id:'c1', type:1, q:'일을 할 때 스스로 정한 기준과 원칙을 맞추려는 압력이 강한 편이다.' },
  { id:'c2', type:2, q:'관계에서 필요한 사람으로 보이고 싶어, 내 필요보다 상대를 먼저 챙기는 쪽으로 움직이는 편이다.' },
  { id:'c3', type:3, q:'내가 유능하고 가치 있게 보이는지를 성과로 확인하려는 동기가 강한 편이다.' },
  { id:'c4', type:4, q:'평범하고 무난한 흐름이 길어지면, 내 고유함이 흐려진다고 느끼는 편이다.' },
  { id:'c5', type:5, q:'사람들과 오래 상호작용하면 에너지가 빠르게 소진되어, 혼자 거리를 두고 정리하는 시간이 반드시 필요하다.' },
  { id:'c6', type:6, q:'중요한 결정을 앞두면 실행보다 위험 요소와 예외 상황 점검이 먼저 올라오는 편이다.' },
  { id:'c7', type:7, q:'분위기가 무겁거나 답답할 때, 그 감정에 머물기보다 새로운 가능성으로 빠르게 전환하려는 반응이 먼저 나온다.' },
  { id:'c8', type:8, q:'내 사람이나 약자가 부당하게 공격받거나 이용당하는 것을 보면, 물러서기보다 직접 개입해 보호하고 판을 바꾸려는 반응이 먼저 나온다.' },
  { id:'c9', type:9, q:'갈등 기류가 생기면 내 주장보다 관계의 마찰을 줄이는 쪽을 먼저 선택하는 편이다.' },
  { id:'f_2_3', format:'ab', leftType:2,rightType:3,weight:2.2,q:'압박 상황에서 내 안에서 더 자동으로 튀어나오는 패턴에 가까운 쪽을 고르세요.',a:'나는 먼저 상대의 필요를 읽고 돕는 방식으로 관계를 붙잡으려는 반응이 더 먼저 나온다.',b:'나는 먼저 성과와 유능함을 증명해 상황을 장악하려는 반응이 더 먼저 나온다.' },
  { id:'f_3_6', format:'ab', leftType:3,rightType:6,weight:2.2,q:'불안이 올라올 때 더 본능적으로 선택하는 방향에 가까운 쪽을 고르세요.',a:'나는 결과를 빠르게 만들어 인정과 신뢰를 확보하는 쪽으로 몰입하는 반응이 더 강하다.',b:'나는 리스크를 점검하고 최악의 경우를 대비해 안전장치를 갖추는 반응이 더 강하다.' },
  { id:'f_6_8', format:'ab', leftType:6,rightType:8,weight:2.2,q:'위협을 느낄 때 실제로 더 자주 쓰는 대응 방식에 가까운 쪽을 고르세요.',a:'나는 먼저 확인과 협의, 검증 가능한 안전장치를 마련하여 실수를 줄이려는 편이다.',b:'나는 바로 개입해 힘의 균형을 바꾸고 주도권을 회수하려는 편이다.' },
  { id:'f_1_9', format:'ab', leftType:1,rightType:9,weight:2.2,q:'갈등 직전 순간에 더 자동으로 작동하는 경향에 가까운 쪽을 고르세요.',a:'나는 기준을 분명히 세우고 잘못된 부분을 바로잡아야 마음이 놓인다.',b:'나는 마찰을 줄이고 관계의 흐름을 유지하는 쪽을 우선 선택한다.' },
  { id:'f_5_7', format:'ab', leftType:5,rightType:7,weight:2.2,q:'에너지가 떨어졌을 때 회복을 위해 더 본능적으로 택하는 방식에 가까운 쪽을 고르세요.',a:'나는 물러나 상황을 분석하고 자극을 최소화하며 에너지를 보존한다.',b:'나는 전환점이 될 만한 새로운 자극과 가능성을 찾아 분위기를 바꾼다.' },
  { id:'f_2_8', format:'ab', leftType:2,rightType:8,weight:2.2,q:'관계가 흔들린다고 느낄 때 더 자동으로 나오는 패턴에 가까운 쪽을 고르세요.',a:'나는 더 도우며 유대감을 회복하려 하고, 관계를 붙잡는 쪽으로 에너지를 쓴다.',b:'나는 경계를 분명히 세우고 주도권을 회수하는 쪽으로 에너지를 쓴다.' },
  { id:'state_2w', q:'최근 2주를 기준으로 볼 때, 내 일상 전반은 어느 정도 압박과 스트레스 상태였나요? (1=매우 안정, 6=매우 높은 압박)' },
  { id:'i_sp_1', inst:'sp', q:'어딜 가든 온도, 조명, 식사, 수면 등 나의 신체적 안락함과 환경적 요소가 꽤 중요하게 느껴진다.' },
  { id:'i_sp_2', inst:'sp', q:'나의 시간, 에너지, 자원(돈 등)이 불필요하게 낭비되거나 예측 불가능하게 소모되는 것에 예민한 편이다.' },
  { id:'i_sp_3', inst:'sp', q:'재정적인 안정과 독립적인 생활 기반을 확보하는 것이 삶에서 우선순위가 높은 편이다.' },
  { id:'i_sx_1', inst:'sx', q:'여러 사람과 얕게 어울리는 것보다, 나와 코드가 맞는 단 한 사람과 깊고 강렬하게 교감할 때 에너지를 얻는다.' },
  { id:'i_sx_2', inst:'sx', q:'무언가(사람, 취미, 관심사)에 한 번 꽂히면 주변을 잊을 만큼 모든 열정을 쏟아붓는 편이다.' },
  { id:'i_sx_3', inst:'sx', q:'표면적이고 일상적인 대화보다는, 서로의 깊은 생각이나 가치관을 온전히 알 수 있는 밀도 높은 대화를 훨씬 선호한다.' },
  { id:'i_so_1', inst:'so', q:'내가 속한 조직이나 모임에 들어가면, 누가 실질적 영향력을 갖고 있고 분위기가 어디로 흐르는지 같은 집단 역학을 본능적으로 읽게 되는 편이다.' },
  { id:'i_so_2', inst:'so', q:'어떤 그룹에서든 내가 맡은 역할과 기여 지점이 분명할 때 심리적으로 가장 안정되며, 소속감이 약해지면 에너지가 빠르게 떨어지는 편이다.' },
  { id:'i_so_3', inst:'so', q:'개인적 편안함이나 1:1 친밀감만큼, 집단과 사회의 흐름 안에서 내 역할이 연결되어 있다고 느낄 때 동기와 에너지가 더 또렷해지는 편이다.' }
];

const deep = {
  1:[{id:'d1_1',type:1,q:'일을 끝낸 뒤에도 이것이 최선이었는지, 더 정확하게 할 수 있었는지를 스스로 반복 점검하며 기준에 맞추려는 내면의 압력이 자주 작동하는 편이다.'},{id:'d1_2',type:1,q:'속으로는 이 상황의 올바른 방식이 분명하다는 감각이 강해서, 내가 그 기준을 어기거나 타인이 기준 밖으로 움직일 때 답답함과 긴장이 빠르게 올라오는 편이다.'}],
  2:[{id:'d2_1',type:2,q:'사람에게 따뜻하고 유용한 사람으로 보이고 싶다는 동기가 강해 먼저 채워 주는 쪽은 익숙하지만, 내가 먼저 필요를 말하고 도움을 요청하는 순간에는 불편함이 커지는 편이다.'},{id:'d2_2',type:2,q:'상대의 필요와 감정은 빠르게 읽어도, 내 욕구를 먼저 드러내면 관계 균형이 흔들릴까 조절하게 되어 무엇을 원하는지 즉답이 막히는 경우가 있다.'}],
  3:[{id:'d3_1',type:3,q:'있는 그대로의 나보다, 유능하고 성과 내는 사람으로 보일 때 가치가 확인된다는 동기가 강해서 결과를 통해 존재 가치를 증명하려는 압력이 크게 작동하는 편이다.'},{id:'d3_2',type:3,q:'실패하거나 무능해 보이는 장면이 남을 수 있다고 느끼면, 실제 상황 전부터 긴장과 스트레스가 크게 올라오며 성과 회복 압력이 강해지는 편이다.'}],
  4:[{id:'d4_1',type:4,q:'겉으로 함께 있어도 나만 완전히 이해받지 못한다는 정서적 거리감을 자주 느끼며, 슬픔이나 결핍의 경험을 통해 오히려 내 고유성이 선명해진다고 느끼는 편이다.'},{id:'d4_2',type:4,q:'반복적이고 평탄한 일상만 이어지면 정서적으로 무감해지기 쉽고, 감정의 깊이와 의미가 살아 있는 장면에서 존재감이 또렷해지는 편이다.'}],
  5:[{id:'d5_1',type:5,q:'문제 한가운데 직접 뛰어들기보다 한 걸음 떨어진 자리에서 구조를 관찰하고 파악할 때 더 안전하고 통제 가능하다고 느끼는 편이다.'},{id:'d5_2',type:5,q:'예고 없는 감정 요구나 갑작스러운 침범이 들어오면, 관계를 끊으려는 의도는 없어도 즉시 에너지를 닫고 물러나 정리하려는 반응이 자동으로 나온다.'}],
  6:[{id:'d6_1',type:6,q:'중요한 결정을 내리기 전, 겉으로 드러난 정보보다 숨어 있는 의도와 잠재적 리스크를 먼저 확인해야 안심이 되는 편이며 대비가 부족하면 불안이 크게 올라온다.'},{id:'d6_2',type:6,q:'권위나 시스템을 따를 때 안정감을 느끼면서도, 동시에 그 대상이 정말 신뢰 가능한지 끝까지 검증하고 의심을 거치려는 마음이 함께 작동하는 편이다.'}],
  7:[{id:'d7_1',type:7,q:'불편한 현실이나 무거운 감정에 오래 머물면 에너지가 급격히 떨어져서, 의식적으로든 무의식적으로든 분위기를 바꾸거나 다른 가능성으로 주의를 전환하려는 패턴이 나타난다.'},{id:'d7_2',type:7,q:'선택지가 닫히거나 한 길에 오래 묶이는 상황을 답답하게 느껴, 언제든 방향을 바꿀 수 있는 여지를 남겨둘 때 심리적으로 훨씬 자유롭고 안정된 편이다.'}],
  8:[{id:'d8_1',type:8,q:'내 사람이나 약자가 부당하게 공격받거나 이용당하는 것을 보면, 주도권을 회수하고 보호하려는 반응이 먼저 나온다.'},{id:'d8_2',type:8,q:'인정을 원하는 것처럼 보이는 순간에도 핵심 동기는 칭찬 자체보다, 내 영향력이 무시되지 않고 함부로 통제되지 않는 상태를 확보하려는 데 더 가깝다.'}],
  9:[{id:'d9_1',type:9,q:'관계나 환경과의 연결이 끊기는 상황을 크게 불편해해서, 갈등을 키우지 않으려는 과정에서 내 실제 욕구나 우선순위를 뒤로 미루는 선택을 자주 하게 된다.'},{id:'d9_2',type:9,q:'중요한 갈등이나 결정처럼 긴장도가 높은 장면을 앞두면, 바로 직면하기보다 덜 중요한 일에 몰두해 에너지를 분산시키며 긴장을 낮추려는 반응이 나타나는 편이다.'}]
};

const tb36 = [{id:'tb_3_6_1',type:3,q:'압박이 큰 상황에서 내가 성과를 밀어붙이는 핵심 이유는, 신속한 결과로 유능함과 가치를 입증해 신뢰를 확보하려는 쪽에 더 가깝다.'},{id:'tb_3_6_2',type:6,q:'압박이 큰 상황에서 내가 준비와 점검을 강화하는 핵심 이유는, 예측 불가능한 위험으로부터 나와 팀을 보호할 안전 기반을 확보하려는 쪽에 더 가깝다.'}];
const tb31 = [{id:'tb_3_1_1',type:3,q:'목표 달성이 걸린 상황에서는, 기존 원칙이나 절차도 현실에 맞게 조정해 결과를 내는 편이 더 합리적이라고 느끼는 편이다.'},{id:'tb_3_1_2',type:1,q:'결과가 중요한 상황일수록, 과정의 원칙과 기준을 지키는 것이 우선이며 이를 어긴 성과는 온전한 성공으로 보기 어렵다고 느끼는 편이다.'}];
const tb3sx = [{id:'tb_3_sx_1',type:3,q:'내가 끝까지 목표를 밀어붙이는 핵심 동력은, 유능하고 가치 있는 사람으로 보이는 결과를 만들어 신뢰와 인정을 확보하려는 데 더 가깝다.'},{id:'tb_3_sx_2',q:'내가 한 대상에 깊게 몰입하는 핵심 동력은, 외부 인정보다 몰입 과정의 강한 집중감과 에너지 자체를 끝까지 경험하려는 데 더 가깝다.'}];
const tb71 = [{id:'tb_7_1_1',type:7,q:'상황이 막히고 답답할 때, 문제에 오래 머무르기보다 다른 가능성으로 전환해 에너지를 회복하려는 반응이 먼저 나온다.'},{id:'tb_7_1_2',type:1,q:'상황이 막히고 답답할 때, 불완전한 지점을 바로잡아 기준을 회복해야 비로소 마음이 안정되는 반응이 먼저 나온다.'}];
const tb78 = [{id:'tb_7_8_1',type:7,q:'내 주장을 강하게 펼칠 때의 핵심 배경은, 제한되고 답답한 상태를 벗어나 선택지를 넓히려는 욕구에 더 가깝다.'},{id:'tb_7_8_2',type:8,q:'내 주장을 강하게 펼칠 때의 핵심 배경은, 통제당하거나 영역이 침범되는 상황에서 주도권을 즉시 회수하려는 반응에 더 가깝다.'}];
const tb7wing = [{id:'tb_7w_1',wing:6,q:'새로운 일을 벌일 때도, 가까운 관계의 안정과 안전망이 흔들리지 않는지 먼저 점검해야 마음이 놓이는 편이다.'},{id:'tb_7w_2',wing:8,q:'새로운 일을 추진할 때, 제약이 보여도 주저하기보다 강하게 밀어붙이며 방해가 생기면 정면으로 돌파하는 편이다.'}];

// 1번 vs 8번 타이브레이커: 동기(Why) 기반 – SO 1 / SO 8 오타이핑 감소
const tb18 = [
  { id:'tb_1_8_1', format:'ab', leftType:1, rightType:8, weight:2.2, q:'분노의 근원: 두 문장 중 내 마음을 더 정확히 설명하는 쪽을 고르세요.', a:'나는 일이 "잘못되고 비합리적인 방식"으로 처리될 때 더 분노를 느낀다.', b:'나는 나의 사람이나 약자가 "부당하게 공격받고 이용당할 때" 더 분노를 느낀다.' },
  { id:'tb_1_8_2', format:'ab', leftType:1, rightType:8, weight:2.2, q:'두려움의 핵심: 두 문장 중 더 공감되는 쪽을 고르세요.', a:'나는 나의 판단이나 행동에 "결함이 있거나 틀렸다"는 비판을 받는 것이 더 두렵다.', b:'나는 다른 사람에게 "통제당하거나 약하게 보여 이용당하는" 것이 더 두렵다.' },
  { id:'tb_1_8_3', format:'ab', leftType:1, rightType:8, weight:2.2, q:'추구하는 리더십: 두 문장 중 내가 이끌고 싶은 방향에 더 가까운 쪽을 고르세요.', a:'나는 "가장 올바른 길"을 제시하는 모범이 됨으로써 사람들을 이끌고 싶다.', b:'나는 "강력한 힘"으로 내 사람들을 보호하고 외부의 위협에 맞서 싸우며 이끌고 싶다.' },
  { id:'tb_1_8_4', format:'ab', leftType:1, rightType:8, weight:2.2, q:'자기 인식: 내 안에서 더 자주 느끼는 쪽에 가깝다고 생각되는 것을 고르세요.', a:'나는 내 안의 "내면의 비평가(Inner Critic)" 목소리를 자주 듣는다.', b:'나는 내 안의 "전사(Warrior)"와 같은 강한 의지를 자주 느낀다.' },
  { id:'tb_1_8_5', format:'ab', leftType:1, rightType:8, weight:2.2, q:'"맞선다"의 동기: 어떤 상황에서 더 강한 충동을 느끼는지 고르세요.', a:'누군가 나의 책임 영역에서 비합리적이거나 원칙에 어긋나는 결정을 할 때, 나는 그 "잘못된 질서"를 바로잡아야 한다는 강한 충동을 느낀다.', b:'누군가 나의 통제권을 무시하고 내 사람들에게 부당한 영향을 미치려 할 때, 나는 그 "힘의 침범"에 맞서 나의 영향력을 증명해야 한다는 강한 충동을 느낀다.' }
];

// 전용 타이브레이커가 없는 31개 쌍: 동기·두려움·세계관 차이 기반 전용 질문 (키: 'typeA_typeB')
const tbCustomMap = {
  '1_2': { q: '다음 두 문장 중 자신의 마음을 더 깊이·본능적으로 설명하는 쪽을 선택해 주세요.', a: '나는 다른 사람을 돕거나 조언할 때, 그들이 더 올바르고 나은 길로 가도록 이끄는 것에 대한 책임감을 느낀다. (1번 동기)', b: '나는 다른 사람을 돕거나 조언할 때, 그들과 정서적으로 연결되고 그들에게 필요한 존재가 되는 것에서 만족감을 느낀다. (2번 동기)' },
  '1_4': { q: '다음 두 문장 중 자신의 마음을 더 깊이·본능적으로 설명하는 쪽을 선택해 주세요.', a: '나는 내 안의 부족함이나 결점을 발견하면, 그것을 바로잡고 고쳐야 할 문제로 인식하며 비판적인 자세를 취한다. (1번 동기)', b: '나는 내 안의 부족함이나 결점을 발견하면, 그것을 나의 정체성의 일부로 느끼며 그 감정 속으로 깊이 파고드는 경향이 있다. (4번 동기)' },
  '1_5': { q: '다음 두 문장 중 자신의 마음을 더 깊이·본능적으로 설명하는 쪽을 선택해 주세요.', a: '나는 세상의 무질서함과 부조리를 볼 때, 그것을 개선하고 바로잡기 위해 행동해야 한다는 내적 충동을 느낀다. (1번 동기)', b: '나는 세상의 무질서함과 부조리를 볼 때, 한 걸음 물러나 그것을 이해하고 분석하기 위해 관찰한다. (5번 동기)' },
  '1_6': { q: '다음 두 문장 중 자신의 마음을 더 깊이·본능적으로 설명하는 쪽을 선택해 주세요.', a: "나의 행동 기준은 '무엇이 옳은가'에 대한 나의 내면의 확고한 신념에서 나온다. (1번 동기)", b: "나의 행동 기준은 '무엇이 안전한가'에 대한 끊임없는 질문과 신뢰할 수 있는 외부 지침을 통해 정해진다. (6번 동기)" },
  '1_9': { q: '다음 두 문장 중 자신의 마음을 더 깊이·본능적으로 설명하는 쪽을 선택해 주세요.', a: '나는 불편한 상황이나 잘못된 것을 보면, 내면의 긴장감이 높아지며 그것을 바로잡으려는 에너지가 생긴다. (1번 동기)', b: '나는 불편한 상황이나 잘못된 것을 보면, 갈등을 피하고 내면의 평화를 지키기 위해 그 상황을 외면하거나 잊으려 한다. (9번 동기)' },
  '2_3': { q: '다음 두 문장 중 자신의 마음을 더 깊이·본능적으로 설명하는 쪽을 선택해 주세요.', a: '나는 다른 사람들에게 인정받기 위해, 내가 얼마나 따뜻하고 도움을 주는 사람인지를 보여주는 것이 중요하다. (2번 동기)', b: '나는 다른 사람들에게 인정받기 위해, 내가 얼마나 유능하고 성공한 사람인지를 보여주는 것이 중요하다. (3번 동기)' },
  '2_4': { q: '다음 두 문장 중 자신의 마음을 더 깊이·본능적으로 설명하는 쪽을 선택해 주세요.', a: '나는 관계에서 나의 주된 관심은 상대방의 필요를 채워주고 그들로부터 사랑받는 것이다. (2번 동기)', b: '나는 관계에서 나의 주된 관심은 상대방이 나를 얼마나 깊고 특별하게 이해해주는가이다. (4번 동기)' },
  '2_5': { q: '다음 두 문장 중 자신의 마음을 더 깊이·본능적으로 설명하는 쪽을 선택해 주세요.', a: '나는 사람들과의 관계에서 감정적인 교류와 연결을 통해 에너지를 얻는다. (2번 동기)', b: '나는 사람들과의 관계에서 나의 시간과 에너지가 소모된다고 느끼며, 혼자만의 시간이 반드시 필요하다. (5번 동기)' },
  '2_6': { q: '다음 두 문장 중 자신의 마음을 더 깊이·본능적으로 설명하는 쪽을 선택해 주세요.', a: '내가 사람들에게 친절하고 헌신하는 이유는 그들로부터 사랑받고 거절당하지 않기 위해서이다. (2번 동기)', b: '내가 사람들에게 친절하고 헌신하는 이유는 그들로부터 신뢰를 얻고 안전한 관계를 확보하기 위해서이다. (6번 동기)' },
  '2_7': { q: '다음 두 문장 중 자신의 마음을 더 깊이·본능적으로 설명하는 쪽을 선택해 주세요.', a: '나의 주된 관심은 사람들이며, 그들의 필요를 채워주는 것에서 기쁨을 찾는다. (2번 동기)', b: '나의 주된 관심은 즐거운 경험이며, 새로운 가능성을 탐험하는 것에서 기쁨을 찾는다. (7번 동기)' },
  '2_8': { q: '다음 두 문장 중 자신의 마음을 더 깊이·본능적으로 설명하는 쪽을 선택해 주세요.', a: '나는 다른 사람들을 보살피고 지원함으로써 나의 영향력을 표현한다. (2번 동기)', b: '나는 다른 사람들을 보호하고 통제함으로써 나의 영향력을 표현한다. (8번 동기)' },
  '2_9': { q: '다음 두 문장 중 자신의 마음을 더 깊이·본능적으로 설명하는 쪽을 선택해 주세요.', a: '나는 다른 사람의 의견에 동의할 때, 그 사람과의 관계가 더 가까워질 것을 기대한다. (2번 동기)', b: '나는 다른 사람의 의견에 동의할 때, 그 사람과의 갈등을 피할 수 있을 것을 기대한다. (9번 동기)' },
  '3_4': { q: '다음 두 문장 중 자신의 마음을 더 깊이·본능적으로 설명하는 쪽을 선택해 주세요.', a: '나는 내가 성취한 것과 성공적인 이미지를 통해 나의 가치를 증명하려고 한다. (3번 동기)', b: '나는 내가 얼마나 독특하고 진실한 감정을 가졌는지를 통해 나의 정체성을 찾으려고 한다. (4번 동기)' },
  '3_5': { q: '다음 두 문장 중 자신의 마음을 더 깊이·본능적으로 설명하는 쪽을 선택해 주세요.', a: '나는 전문적인 지식을 쌓는 이유가 그것을 통해 성공을 이루고 최고로 인정받기 위해서이다. (3번 동기)', b: '나는 전문적인 지식을 쌓는 이유가 그것을 통해 세상을 이해하고 유능함을 느끼기 위해서이다. (5번 동기)' },
  '3_7': { q: '다음 두 문장 중 자신의 마음을 더 깊이·본능적으로 설명하는 쪽을 선택해 주세요.', a: '나의 에너지는 주로 목표를 달성하고 성공적인 결과물을 만들어내는 것에 집중된다. (3번 동기)', b: '나의 에너지는 주로 새롭고 즐거운 경험과 가능성을 탐색하는 것에 집중된다. (7번 동기)' },
  '3_8': { q: '다음 두 문장 중 자신의 마음을 더 깊이·본능적으로 설명하는 쪽을 선택해 주세요.', a: '나는 나의 성공과 목표 달성을 위해 다른 사람들의 시선과 인정을 중요하게 생각한다. (3번 동기)', b: '나는 나의 목표를 달성하기 위해 다른 사람들의 시선보다는 나의 의지와 통제력을 더 중요하게 생각한다. (8번 동기)' },
  '3_9': { q: '다음 두 문장 중 자신의 마음을 더 깊이·본능적으로 설명하는 쪽을 선택해 주세요.', a: '나는 일이 원활하게 진행되지 않을 때, 실패한 것처럼 보일까 봐 불안하고 초조해진다. (3번 동기)', b: '나는 일이 원활하게 진행되지 않을 때, 갈등이 생기고 평화가 깨질까 봐 불편하고 회피하고 싶어진다. (9번 동기)' },
  '4_5': { q: '다음 두 문장 중 자신의 마음을 더 깊이·본능적으로 설명하는 쪽을 선택해 주세요.', a: '나는 혼자만의 시간을 가질 때, 주로 나의 내면의 감정과 상상의 세계에 깊이 빠져든다. (4번 동기)', b: '나는 혼자만의 시간을 가질 때, 주로 나의 지적인 관심사와 정보의 세계에 깊이 빠져든다. (5번 동기)' },
  '4_6': { q: '다음 두 문장 중 자신의 마음을 더 깊이·본능적으로 설명하는 쪽을 선택해 주세요.', a: "내가 느끼는 불안감의 근원은 '나는 남들과 다르며, 근본적으로 무언가 결핍되어 있다'는 느낌이다. (4번 동기)", b: "내가 느끼는 불안감의 근원은 '이 세상은 위험하며, 나는 안전한 지침과 보호가 필요하다'는 느낌이다. (6번 동기)" },
  '4_7': { q: '다음 두 문장 중 자신의 마음을 더 깊이·본능적으로 설명하는 쪽을 선택해 주세요.', a: '나는 삶의 깊이와 의미를 추구하며, 슬픔이나 우울함 같은 감정도 나의 중요한 일부라고 생각한다. (4번 동기)', b: '나는 삶의 즐거움과 자유를 추구하며, 슬픔이나 우울함 같은 감정은 되도록 피하려고 한다. (7번 동기)' },
  '4_8': { q: '다음 두 문장 중 자신의 마음을 더 깊이·본능적으로 설명하는 쪽을 선택해 주세요.', a: '나는 상처를 받았을 때, 내면으로 침잠하며 그 고통스러운 감정을 곱씹는 경향이 있다. (4번 동기)', b: '나는 상처를 받았을 때, 그 원인을 찾아 외부로 분노를 표출하고 복수하려는 경향이 있다. (8번 동기)' },
  '4_9': { q: '다음 두 문장 중 자신의 마음을 더 깊이·본능적으로 설명하는 쪽을 선택해 주세요.', a: '나는 나 자신을 남들과는 다른 특별하고 독특한 존재로 인식하며, 평범해지는 것을 꺼린다. (4번 동기)', b: '나는 나 자신을 다른 사람들과 조화를 이루는 평범한 존재로 인식하며, 갈등을 일으키는 것을 꺼린다. (9번 동기)' },
  '5_6': { q: '다음 두 문장 중 자신의 마음을 더 깊이·본능적으로 설명하는 쪽을 선택해 주세요.', a: '나는 불안에 대처하기 위해 정보를 수집하고 분석하여 세상의 작동 원리를 이해하려고 한다. (5번 동기)', b: '나는 불안에 대처하기 위해 권위나 시스템에 의지하여 최악의 시나리오를 대비하고 확인하려고 한다. (6번 동기)' },
  '5_7': { q: '다음 두 문장 중 자신의 마음을 더 깊이·본능적으로 설명하는 쪽을 선택해 주세요.', a: '나의 주된 정신 활동은 관심 있는 주제를 깊이 파고들어 전문 지식을 쌓는 것이다. (5번 동기)', b: '나의 주된 정신 활동은 여러 아이디어들을 빠르게 연결하고 새로운 가능성을 상상하는 것이다. (7번 동기)' },
  '5_8': { q: '다음 두 문장 중 자신의 마음을 더 깊이·본능적으로 설명하는 쪽을 선택해 주세요.', a: '갈등 상황에서 나는 물리적으로나 정신적으로 거리를 두고, 상황을 객관적으로 관찰하고 분석하려 한다. (5번 동기)', b: '갈등 상황에서 나는 그 중심에 뛰어들어, 상황을 통제하고 나의 힘으로 문제를 해결하려 한다. (8번 동기)' },
  '5_9': { q: '다음 두 문장 중 자신의 마음을 더 깊이·본능적으로 설명하는 쪽을 선택해 주세요.', a: '나는 사람들과 거리를 두는 이유가 나의 독립적인 공간과 에너지를 지키기 위해서이다. (5번 동기)', b: '나는 사람들과 거리를 두는 이유가 잠재적인 갈등과 불편함을 피하기 위해서이다. (9번 동기)' },
  '6_7': { q: '다음 두 문장 중 자신의 마음을 더 깊이·본능적으로 설명하는 쪽을 선택해 주세요.', a: '나는 불확실한 미래에 대해 최악의 경우를 먼저 생각하고 대비책을 세우며 불안감을 관리한다. (6번 동기)', b: '나는 불확실한 미래에 대해 가장 즐거운 가능성을 먼저 생각하며 불안감을 잊으려고 한다. (7번 동기)' },
  '6_8': { q: '다음 두 문장 중 자신의 마음을 더 깊이·본능적으로 설명하는 쪽을 선택해 주세요.', a: '나는 위협을 느낄 때, 그 배후에 무엇이 있는지 의심하고 분석하며 불안해한다. (6번 동기)', b: '나는 위협을 느낄 때, 즉시 맞서 싸워 상대를 제압하고 통제하려 한다. (8번 동기)' },
  '6_9': { q: '다음 두 문장 중 자신의 마음을 더 깊이·본능적으로 설명하는 쪽을 선택해 주세요.', a: '나는 결정을 내리기 전에 여러 사람의 의견을 구하고 잠재적 위험을 확인하며 신중하게 행동한다. (6번 동기)', b: '나는 결정을 내려야 할 때, 갈등을 피하기 위해 다른 사람의 의견을 따르거나 결정을 미루는 경향이 있다. (9번 동기)' },
  '7_9': { q: '다음 두 문장 중 자신의 마음을 더 깊이·본능적으로 설명하는 쪽을 선택해 주세요.', a: '나는 불편한 감정이나 상황을 피하기 위해 더 즐겁고 새로운 활동이나 계획을 찾아 나선다. (7번 동기)', b: '나는 불편한 감정이나 상황을 피하기 위해 그 감각을 무디게 만들고 다른 생각이나 활동에 안주한다. (9번 동기)' },
  '8_9': { q: '다음 두 문장 중 자신의 마음을 더 깊이·본능적으로 설명하는 쪽을 선택해 주세요.', a: '나는 갈등을 나의 힘과 의지를 증명하고 상황을 통제할 기회로 본다. (8번 동기)', b: '나는 갈등을 나의 평화를 위협하고 관계를 단절시키는 피해야 할 대상으로 본다. (9번 동기)' }
};

const postTieBreakerMap = {
  '3_6': {
    a: '압박이 커질수록 성과를 먼저 만들어 유능함과 신뢰를 증명하려는 반응이 더 자동적이다.',
    b: '압박이 커질수록 위험 요소를 먼저 점검하고 안전장치를 세우려는 반응이 더 자동적이다.'
  },
  '5_6': {
    a: '요구가 몰릴수록 한 걸음 물러나 관찰하며 자극을 줄여 에너지를 보존하는 쪽이 더 본능적이다.',
    b: '요구가 몰릴수록 위험 신호를 확인하고 확인·재확인을 반복해 불확실성을 줄이는 쪽이 더 본능적이다.'
  },
  '1_7': {
    a: '상황이 어긋나면 즉시 기준을 바로잡고 정렬하려는 반응이 자동으로 먼저 나온다.',
    b: '상황이 막히면 다른 선택지로 전환해 에너지와 분위기를 바꾸려는 반응이 자동으로 먼저 나온다.'
  },
  '7_8': {
    a: '제한되고 답답한 흐름을 깨고 선택지를 넓히는 쪽으로 에너지가 먼저 향한다.',
    b: '통제나 침범을 감지하면 즉시 경계를 세우고 주도권을 회수하려는 반응이 먼저 나온다.'
  },
  '1_8': {
    a: '나는 일이 잘못되고 비합리적으로 처리될 때 더 분노를 느끼고, 올바른 길을 제시하는 모범으로 이끌고 싶다.',
    b: '나는 나의 사람이나 약자가 부당하게 공격받을 때 더 분노를 느끼고, 강한 힘으로 보호하며 맞서 싸우고 싶다.'
  }
};

function renderQuestions(containerId, items, prefix) {
  const root = document.getElementById(containerId);
  root.innerHTML = '';
  items.forEach((item) => {
    const legendId = `${prefix}-legend-${item.id}`;
    const hintId = `${prefix}-hint-${item.id}`;
    if (item.format === 'ab') {
      root.innerHTML += `
        <div class="bg-white p-5 sm:p-7 rounded-xl border border-gray-100 shadow-sm" id="${prefix}-block-${item.id}">
          <fieldset id="${prefix}-fieldset-${item.id}" aria-labelledby="${legendId}">
            <legend id="${legendId}" class="text-[15px] sm:text-base font-medium text-gray-800 mb-2 leading-relaxed">${getQuestionText(item)}</legend>
            <div class="grid gap-3 mt-5">
            <label class="block cursor-pointer">
              <input type="radio" name="${item.id}" value="A" class="sr-only peer" required>
              <div class="rounded-xl border-2 border-gray-200 p-4 text-sm text-gray-700 peer-checked:border-[#4a4540] peer-checked:bg-[#f5f5f0] peer-focus-visible:ring-2 peer-focus-visible:ring-[#4a4540]/30 smooth">
                <span class="inline-block text-xs font-bold text-[#4a4540] mb-1">${pageLang === 'en' ? 'Choose A' : 'A 선택'}</span>
                <div>${getOptionText(item, 'a')}</div>
              </div>
            </label>
            <label class="block cursor-pointer">
              <input type="radio" name="${item.id}" value="B" class="sr-only peer" required>
              <div class="rounded-xl border-2 border-gray-200 p-4 text-sm text-gray-700 peer-checked:border-[#4a4540] peer-checked:bg-[#f5f5f0] peer-focus-visible:ring-2 peer-focus-visible:ring-[#4a4540]/30 smooth">
                <span class="inline-block text-xs font-bold text-[#4a4540] mb-1">${pageLang === 'en' ? 'Choose B' : 'B 선택'}</span>
                <div>${getOptionText(item, 'b')}</div>
              </div>
            </label>
            </div>
          </fieldset>
        </div>`;
      return;
    }

    root.innerHTML += `
      <div class="bg-white p-5 sm:p-7 rounded-xl border border-gray-100 shadow-sm" id="${prefix}-block-${item.id}">
        <fieldset id="${prefix}-fieldset-${item.id}" aria-labelledby="${legendId}" aria-describedby="${hintId}">
        <legend id="${legendId}" class="text-[15px] sm:text-base font-medium text-gray-800 mb-5 leading-relaxed">${getQuestionText(item)}</legend>
        <div id="${hintId}" class="flex justify-between items-center sm:px-2">
          <span class="text-xs text-gray-400 font-medium">${pageLang === 'en' ? 'Not at all' : '거의 아니다'}</span>
          <div class="flex space-x-2 sm:space-x-4">
            ${[1,2,3,4,5,6].map((v) => `
              <div class="relative">
                <input type="radio" name="${item.id}" value="${v}" id="${item.id}-${v}" class="peer sr-only radio-btn">
                <label for="${item.id}-${v}" class="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full border-2 border-gray-200 text-gray-400 cursor-pointer hover:bg-gray-50 peer-focus-visible:ring-2 peer-focus-visible:ring-[#4a4540]/30 smooth font-semibold text-sm bg-white">${v}</label>
              </div>`).join('')}
          </div>
          <span class="text-xs text-gray-400 font-medium">${pageLang === 'en' ? 'Almost always true' : '거의 항상 그렇다'}</span>
        </div>
        <div class="mt-4 text-center">
          <input type="radio" name="${item.id}" value="U" id="${item.id}-U" class="peer sr-only">
          <label for="${item.id}-U" class="inline-flex items-center rounded-full border border-gray-200 px-3 py-1.5 text-xs text-gray-500 cursor-pointer hover:bg-gray-50 peer-checked:border-[#4a4540] peer-checked:bg-[#f5f5f0] peer-checked:text-[#4a4540] peer-focus-visible:ring-2 peer-focus-visible:ring-[#4a4540]/30 smooth">
            ${pageLang === 'en' ? 'Not sure / varies by situation (no scoring)' : '잘 모르겠다 / 상황 따라 다름 (비채점)'}
          </label>
        </div>
        </fieldset>
      </div>`;
  });
}

function toScore(raw) {
  if (raw === 'U' || raw === undefined || raw === null) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function validate(items, prefix, msgId) {
  let ok = true;
  let first = null;
  items.forEach((item) => {
    const block = document.getElementById(`${prefix}-block-${item.id}`);
    const fieldset = document.getElementById(`${prefix}-fieldset-${item.id}`);
    if (!document.querySelector(`input[name="${item.id}"]:checked`)) {
      ok = false;
      block.classList.add('border-red-300','bg-red-50');
      if (fieldset) fieldset.setAttribute('aria-invalid', 'true');
      if (!first) first = block;
    } else {
      block.classList.remove('border-red-300','bg-red-50');
      if (fieldset) fieldset.removeAttribute('aria-invalid');
    }
  });
  const msg = document.getElementById(msgId);
  msg.setAttribute('role', 'alert');
  msg.setAttribute('aria-live', 'polite');
  msg.classList.toggle('hidden', ok);
  if (!ok && first) {
    first.scrollIntoView({behavior:'smooth', block:'center'});
    const firstInput = first.querySelector('input[type="radio"]');
    if (firstInput) firstInput.focus();
  }
  return ok;
}

function setProgress(percent) {
  const bar = document.getElementById('progress-bar');
  const track = document.getElementById('progress-track');
  if (bar) bar.style.width = `${percent}%`;
  if (track) track.setAttribute('aria-valuenow', String(percent));
}

let pdfLibLoadPromise = null;
function loadScriptOnce(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === 'true') {
        resolve();
        return;
      }
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.defer = true;
    script.addEventListener('load', () => {
      script.dataset.loaded = 'true';
      resolve();
    }, { once: true });
    script.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true });
    document.head.appendChild(script);
  });
}

async function ensurePdfLibsLoaded() {
  if (window.html2canvas && window.jspdf && window.jspdf.jsPDF) return;
  if (!pdfLibLoadPromise) {
    pdfLibLoadPromise = Promise.all([
      loadScriptOnce('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'),
      loadScriptOnce('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js')
    ]);
  }
  await pdfLibLoadPromise;
}

function revealTestPageAfterLoad() {
  const main = document.getElementById('test-main-content');
  const skeleton = document.getElementById('test-initial-skeleton');
  if (main) {
    main.classList.remove('opacity-0');
    main.classList.add('opacity-100');
  }
  if (skeleton) {
    skeleton.classList.add('opacity-0');
    setTimeout(() => skeleton.classList.add('hidden'), 320);
  }
}

async function downloadResultPdf() {
  const target = document.getElementById('result-view');
  const btn = document.getElementById('download-pdf-btn');
  if (!target || target.classList.contains('hidden')) return;

  const prev = btn ? btn.innerText : '';
  if (btn) {
    btn.disabled = true;
    btn.innerText = 'PDF 준비 중...';
    btn.classList.add('opacity-60', 'cursor-not-allowed');
  }

  try {
    await ensurePdfLibsLoaded();
    if (!window.html2canvas || !window.jspdf || !window.jspdf.jsPDF) {
      throw new Error('PDF library unavailable');
    }
    if (btn) btn.innerText = 'PDF 생성 중...';
    const canvas = await window.html2canvas(target, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#f8fafc',
      windowWidth: target.scrollWidth
    });
    const imgData = canvas.toDataURL('image/png');
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
    }

    const title = (document.getElementById('res-final')?.innerText || 'result').replace(/\s+/g, '_');
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    pdf.save(`enneagram_${title}_${y}${m}${d}.pdf`);
  } catch (_err) {
    alert('PDF 생성 중 오류가 발생했습니다. 다시 시도해 주세요.');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerText = prev || '결과 PDF 다운로드';
      btn.classList.remove('opacity-60', 'cursor-not-allowed');
    }
  }
}

function scrollToTopSmart() {
  // 1) Always scroll inside current document (works for standalone test.html).
  window.scrollTo({ top: 0, behavior: 'auto' });
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // 2) If embedded in index.html iframe, also move parent viewport to iframe top.
  if (window.parent && window.parent !== window) {
    try {
      const frameEl = window.frameElement;
      if (frameEl && frameEl.getBoundingClientRect) {
        frameEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const rect = frameEl.getBoundingClientRect();
        const parentTop = window.parent.scrollY + rect.top - 16;
        window.parent.scrollTo({ top: Math.max(0, parentTop), behavior: 'smooth' });
      } else {
        window.parent.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (_err) {
      // Ignore cross-context scroll errors safely.
    }
  }
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    if (window.parent && window.parent !== window) {
      try { window.parent.scrollTo({ top: 0, behavior: 'auto' }); } catch (_err) {}
    }
  }, 140);
}

function getPostTieKey(a, b) {
  return [a, b].sort((x, y) => x - y).join('_');
}

function buildPostTieQuestion(typeA, typeB) {
  const key = getPostTieKey(typeA, typeB);
  const preset = postTieBreakerMap[key];
  if (preset) {
    return {
      id: `post_tb_${typeA}_${typeB}`,
      format: 'ab',
      leftType: typeA,
      rightType: typeB,
      q: `${typeA}번 vs ${typeB}번 중 내 자동반응에 더 가까운 쪽을 고르세요.`,
      a: preset.a,
      b: preset.b
    };
  }
  return {
    id: `post_tb_${typeA}_${typeB}`,
    format: 'ab',
    leftType: typeA,
    rightType: typeB,
    q: `${typeA}번 vs ${typeB}번 중, 압박 상황에서 더 자동으로 나오는 반응을 선택해 주세요.`,
    a: (deep[typeA] && deep[typeA][0]) ? deep[typeA][0].q : `${typeA}번 특성이 더 가깝다.`,
    b: (deep[typeB] && deep[typeB][0]) ? deep[typeB][0].q : `${typeB}번 특성이 더 가깝다.`
  };
}

function submitPhase1() {
  if (!validate(q1, 'p1', 'validation-msg-1')) return;
  testState.phase3Question = null;
  testState.pendingResult = null;
  const center = {1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};

  q1.forEach((item) => {
    const sel = document.querySelector(`input[name="${item.id}"]:checked`);
    const raw = sel.value;
    testState.phase1Responses[item.id] = raw;

    if (item.format === 'ab') {
      const t = raw === 'A' ? item.leftType : item.rightType;
      center[t] += TEST_CONFIG.weights.phase1Binary;
      return;
    }

    const score = toScore(raw);
    if (score === null) return;
    if (item.id === 't2') { center[2]+=score; center[3]+=score; center[4]+=score; }
    if (item.id === 't5') { center[5]+=score; center[6]+=score; center[7]+=score; }
    if (item.id === 't8') { center[8]+=score; center[9]+=score; center[1]+=score; }
    if (item.id.startsWith('c')) center[item.type] += score * TEST_CONFIG.weights.phase1Core;
  });

  const ranked = Object.keys(center).map((k)=>({type:parseInt(k,10), score:center[k]})).sort((a,b)=>b.score-a.score);
  const top = ranked[0].score;
  const topType = ranked[0].type;
  let cands = ranked.filter((x)=>x.score>=top*TEST_CONFIG.thresholds.candidateRatio).map((x)=>x.type);
  cands = [...new Set([...cands, topType, topType===1?9:topType-1, topType===9?1:topType+1])];
  if (cands.length < TEST_CONFIG.thresholds.minCandidates) {
    cands = [...new Set([...cands, ...ranked.slice(0, TEST_CONFIG.thresholds.minCandidates).map((x)=>x.type)])];
  }
  const topTypes = ranked.map((x)=>x.type).filter((t)=>cands.includes(t)).slice(0, TEST_CONFIG.thresholds.maxCandidates);

  testState.phase2Questions = [];
  topTypes.forEach((t)=>{ if (deep[t]) testState.phase2Questions = testState.phase2Questions.concat(deep[t]); });

  // 상위 2개 유형 점수 차이가 16% 이하일 때만 해당 쌍에 대한 타이브레이커 1개 발동 (통일 기준)
  const top2Score1 = ranked[0].score;
  const top2Score2 = ranked[1].score;
  const top2Diff = top2Score1 > 0 ? (top2Score1 - top2Score2) / top2Score1 : 0;
  const type1 = ranked[0].type;
  const type2 = ranked[1].type;
  const typeA = Math.min(type1, type2);
  const typeB = Math.max(type1, type2);

  if (top2Diff <= TEST_CONFIG.thresholds.top2TieMargin) {
    if (typeA === 3 && typeB === 6) {
      testState.tie.t36 = { enabled: true, weight: TEST_CONFIG.weights.tieBreaker.near, margin: top2Diff };
      testState.phase2Questions = testState.phase2Questions.concat(tb36);
    } else if (typeA === 1 && typeB === 3) {
      testState.tie.t31 = { enabled: true, weight: TEST_CONFIG.weights.tieBreaker.near, margin: top2Diff };
      testState.phase2Questions = testState.phase2Questions.concat(tb31);
    } else if (typeA === 1 && typeB === 7) {
      testState.tie.t71 = { enabled: true, weight: TEST_CONFIG.weights.tieBreaker.type71Default, margin: top2Diff };
      testState.phase2Questions = testState.phase2Questions.concat(tb71);
    } else if (typeA === 7 && typeB === 8) {
      testState.tie.t78 = { enabled: true, weight: TEST_CONFIG.weights.tieBreaker.type78Default, margin: top2Diff };
      testState.phase2Questions = testState.phase2Questions.concat(tb78);
    } else if (typeA === 1 && typeB === 8) {
      testState.tie.t18 = { enabled: true, weight: TEST_CONFIG.weights.tieBreaker.near, margin: top2Diff };
      testState.phase2Questions = testState.phase2Questions.concat(tb18);
    } else {
      // 그 외 조합: tbCustomMap 전용 질문 사용 (동기·두려움·세계관 기반). 없으면 deep 첫 문항으로 폴백.
      const key = `${typeA}_${typeB}`;
      const custom = tbCustomMap[key];
      const qA = custom ? custom.a : ((deep[typeA] && deep[typeA][0]) ? deep[typeA][0].q : `${typeA}번 특성이 더 가깝다.`);
      const qB = custom ? custom.b : ((deep[typeB] && deep[typeB][0]) ? deep[typeB][0].q : `${typeB}번 특성이 더 가깝다.`);
      const genericTb = [{
        id: `tb_gen_${typeA}_${typeB}`,
        format: 'ab',
        leftType: typeA,
        rightType: typeB,
        weight: TEST_CONFIG.weights.phase2Base,
        q: custom ? custom.q : '다음 두 문장 중 자신에게 더 가까운 쪽을 선택해 주세요.',
        a: qA,
        b: qB
      }];
      testState.tie.tGeneric = { enabled: true, typeA, typeB, weight: TEST_CONFIG.weights.tieBreaker.default };
      testState.phase2Questions = testState.phase2Questions.concat(genericTb);
    }
  }

  const inst = {sp:0,sx:0,so:0};
  q1.filter((q)=>q.inst).forEach((q)=>{
    const score = toScore(testState.phase1Responses[q.id]);
    if (score !== null) inst[q.inst] += score;
  });
  const s3 = center[3];
  const m3top = top>0 ? (top-s3)/top : 1;
  const e3sx = topTypes.includes(3) &&
    inst.sx >= Math.max(inst.sp, inst.so)-TEST_CONFIG.thresholds.tie3sxNearTopInstinctGap &&
    (ranked[0].type===3 || m3top<=TEST_CONFIG.thresholds.tie3sxMargin);
  testState.tie.t3sx = {
    enabled:e3sx,
    weight:m3top<=TEST_CONFIG.thresholds.tieCloseBand?TEST_CONFIG.weights.tieBreaker.close:(m3top<=TEST_CONFIG.thresholds.tie3sxMargin?TEST_CONFIG.weights.tieBreaker.near:TEST_CONFIG.weights.tieBreaker.default),
    margin:m3top
  };
  if (e3sx) testState.phase2Questions = testState.phase2Questions.concat(tb3sx);

  testState.tie.t7wing = {enabled: topTypes.includes(7) || ranked[0].type===7, weight:TEST_CONFIG.weights.tieBreaker.wing7, margin:null};
  if (testState.tie.t7wing.enabled) testState.phase2Questions = testState.phase2Questions.concat(tb7wing);

  document.getElementById('phase1-form').classList.add('hidden');
  document.getElementById('phase2-form').classList.remove('hidden');
  document.getElementById('phase3-form').classList.add('hidden');
  setProgress(100);
  document.getElementById('step-label').innerText = '2단계: 동기 교차 검증';
  document.getElementById('step-counter').innerText = '2 / 2';
  renderQuestions('phase2-container', testState.phase2Questions, 'p2');
  requestAnimationFrame(() => scrollToTopSmart());
}

function submitPhase2() {
  if (!validate(testState.phase2Questions, 'p2', 'validation-msg-2')) return;

  const final = {1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};
  const evidence = {1:[],2:[],3:[],4:[],5:[],6:[],7:[],8:[],9:[]};
  const questionText = {};
  [...q1, ...testState.phase2Questions].forEach((q)=>{ questionText[q.id] = q.q; });
  const addScore = (type, points, qid, txt=null) => {
    final[type] += points;
    evidence[type].push({points, text: txt || questionText[qid] || qid});
  };

  let tb3sxCore = null, tb3sxInstinct = null, tb7w6 = 0, tb7w8 = 0;
  const stressRaw = toScore(testState.phase1Responses.state_2w);
  const recentStress = stressRaw === null ? 3 : stressRaw;

  q1.forEach((q) => {
    if (q.format === 'ab') {
      const choice = testState.phase1Responses[q.id];
      const chosen = choice === 'A' ? q.leftType : q.rightType;
      addScore(chosen, TEST_CONFIG.weights.phase1Binary, q.id, choice === 'A' ? q.a : q.b);
      return;
    }
    const score = toScore(testState.phase1Responses[q.id]);
    if (score === null) return;
    if (q.id === 't2') { addScore(2, score, q.id); addScore(3, score, q.id); addScore(4, score, q.id); }
    if (q.id === 't5') { addScore(5, score, q.id); addScore(6, score, q.id); addScore(7, score, q.id); }
    if (q.id === 't8') { addScore(8, score, q.id); addScore(9, score, q.id); addScore(1, score, q.id); }
    if (q.id.startsWith('c')) addScore(q.type, score * TEST_CONFIG.weights.phase1Core, q.id);
  });

  testState.phase2Questions.forEach((q) => {
    if (q.format === 'ab') {
      const el = document.querySelector(`input[name="${q.id}"]:checked`);
      if (!el) return;
      const choice = el.value;
      let w = TEST_CONFIG.weights.phase2Base;
      if (q.id.startsWith('tb_1_8_') && testState.tie.t18.enabled) w = testState.tie.t18.weight;
      else if (q.id.startsWith('tb_gen_') && testState.tie.tGeneric.enabled) w = testState.tie.tGeneric.weight;
      const chosen = choice === 'A' ? q.leftType : q.rightType;
      addScore(chosen, w, q.id, choice === 'A' ? q.a : q.b);
      return;
    }
    const val = toScore(document.querySelector(`input[name="${q.id}"]:checked`).value);
    if (val === null) return;
    if (q.id === 'tb_3_sx_2') { tb3sxInstinct = val; return; }
    if (q.id === 'tb_7w_1') { tb7w6 = val; return; }
    if (q.id === 'tb_7w_2') { tb7w8 = val; return; }

    let w = q.weight || TEST_CONFIG.weights.phase2Base;
    if (q.id.startsWith('tb_3_6_') && testState.tie.t36.enabled) w = testState.tie.t36.weight;
    else if (q.id.startsWith('tb_3_1_') && testState.tie.t31.enabled) w = testState.tie.t31.weight;
    else if (q.id.startsWith('tb_7_1_') && testState.tie.t71.enabled) w = testState.tie.t71.weight;
    else if (q.id.startsWith('tb_7_8_') && testState.tie.t78.enabled) w = testState.tie.t78.weight;
    else if (q.id === 'tb_3_sx_1' && testState.tie.t3sx.enabled) { w = testState.tie.t3sx.weight; tb3sxCore = val; }
    else if (q.id.startsWith('tb_')) return;

    addScore(q.type, val * w, q.id);
  });

  let sxDamp = 0, sxBoost = 0;
  if (testState.tie.t3sx.enabled && tb3sxCore !== null && tb3sxInstinct !== null) {
    const d = tb3sxInstinct - tb3sxCore;
    if (d > 0) {
      // Stabilize: cap 3-type damping so a single tie-breaker cannot over-flip the core.
      sxDamp = Math.min(d * TEST_CONFIG.corrections.sxDampFactor, final[3] * TEST_CONFIG.corrections.sxDampMaxCoreRatio);
      final[3] = Math.max(0, final[3] - sxDamp);
      sxBoost = Math.min(d * TEST_CONFIG.corrections.sxBoostFactor, TEST_CONFIG.corrections.sxBoostCap);
    }
  }

  if (recentStress >= TEST_CONFIG.thresholds.stressCorrectionStart && final[7] > 0 && final[1] > 0) {
    const stressScale = recentStress - (TEST_CONFIG.thresholds.stressCorrectionStart - 1);
    const margin = Math.abs(final[7] - final[1]);
    if (margin <= TEST_CONFIG.thresholds.stressCorrectionMargin) {
      final[1] = Math.max(0, final[1] - (TEST_CONFIG.corrections.stressType1Damp * stressScale));
      final[7] += (TEST_CONFIG.corrections.stressType7Boost * stressScale);
    }
  }

  const ranked = Object.keys(final).map((k)=>({type:parseInt(k,10), score:final[k]})).sort((a,b)=>b.score-a.score);
  const max = ranked[0].score;
  const sec = ranked[1].score;
  const diff = max > 0 ? (max-sec)/max : 0;
  const totalScore = ranked.reduce((acc, cur) => acc + cur.score, 0);
  const top2Mass = totalScore > 0 ? (ranked[0].score + ranked[1].score) / totalScore : 0;

  if (diff <= TEST_CONFIG.thresholds.postTieBreakDiff && top2Mass >= TEST_CONFIG.thresholds.postTieBreakTop2Mass) {
    const typeA = ranked[0].type;
    const typeB = ranked[1].type;
    testState.phase3Question = buildPostTieQuestion(typeA, typeB);
    testState.pendingResult = { final, evidence, recentStress, tb7w6, tb7w8, sxBoost };
    renderQuestions('phase3-container', [testState.phase3Question], 'p3');
    document.getElementById('phase2-form').classList.add('hidden');
    document.getElementById('phase3-form').classList.remove('hidden');
    document.getElementById('step-label').innerText = '3단계: 최종 타이브레이커';
    document.getElementById('step-counter').innerText = '3 / 3';
    setProgress(100);
    requestAnimationFrame(() => scrollToTopSmart());
    return;
  }

  renderResultFromScores({ final, evidence, recentStress, tb7w6, tb7w8, sxBoost, postTieApplied: false });
}

function submitPhase3() {
  if (!testState.phase3Question) return;
  if (!validate([testState.phase3Question], 'p3', 'validation-msg-3')) return;
  if (!testState.pendingResult) return;

  const choice = document.querySelector(`input[name="${testState.phase3Question.id}"]:checked`).value;
  const boostType = choice === 'A' ? testState.phase3Question.leftType : testState.phase3Question.rightType;
  const boostText = choice === 'A' ? testState.phase3Question.a : testState.phase3Question.b;

  testState.pendingResult.final[boostType] += TEST_CONFIG.weights.postTieBreak;
  testState.pendingResult.evidence[boostType].push({
    points: TEST_CONFIG.weights.postTieBreak,
    text: `[최종 타이브레이커] ${boostText}`
  });

  renderResultFromScores({
    ...testState.pendingResult,
    postTieApplied: true
  });
}

function renderResultFromScores({ final, evidence, recentStress, tb7w6, tb7w8, sxBoost, postTieApplied }) {
  const ranked = Object.keys(final).map((k)=>({type:parseInt(k,10), score:final[k]})).sort((a,b)=>b.score-a.score);
  const core = ranked[0].type;
  const second = ranked[1];
  const max = ranked[0].score;
  const sec = ranked[1].score;
  const diff = max > 0 ? (max-sec)/max : 0;
  const top3 = ranked.slice(0,3);
  const top3Total = top3.reduce((s, x) => s + x.score, 0);
  const top3P1 = top3Total > 0 ? (top3[0].score / top3Total) * 100 : 0;
  const top3P2 = top3Total > 0 ? (top3[1].score / top3Total) * 100 : 0;
  const totalScore = ranked.reduce((acc, cur) => acc + cur.score, 0);
  const top2Mass = totalScore > 0 ? (ranked[0].score + ranked[1].score) / totalScore : 0;

  let confidence = '낮음';
  if (diff >= TEST_CONFIG.thresholds.confidenceHigh) confidence = '높음';
  else if (diff >= TEST_CONFIG.thresholds.confidenceMedium) confidence = '보통';
  if (
    diff >= TEST_CONFIG.thresholds.coreReserveDiff &&
    top3P1 >= TEST_CONFIG.thresholds.confidenceStrongTop3Primary &&
    top3P2 >= TEST_CONFIG.thresholds.confidenceStrongTop3Secondary &&
    top2Mass >= TEST_CONFIG.thresholds.confidenceStrongTop2Mass
  ) confidence = '높음';
  if (max === sec) confidence = '낮음';

  const coreResolved = max !== sec && diff >= TEST_CONFIG.thresholds.coreReserveDiff;

  const inst = {sp:0,sx:0,so:0};
  const instName = {sp:'자기보존', sx:'성적(일대일)', so:'사회적'};
  q1.filter((q)=>q.inst).forEach((q)=>{
    const score = toScore(testState.phase1Responses[q.id]);
    if (score !== null) inst[q.inst] += score;
  });
  if (sxBoost > 0) inst.sx += sxBoost;
  let soPenalty = 0;
  if ([3,6,9].includes(core)) {
    const nonSoMax = Math.max(inst.sp, inst.sx);
    const soLead = inst.so - nonSoMax;
    if (soLead >= TEST_CONFIG.corrections.soPenaltyHighLead) soPenalty = TEST_CONFIG.corrections.soPenaltyHigh;
    else if (soLead >= TEST_CONFIG.corrections.soPenaltyLowLead) soPenalty = TEST_CONFIG.corrections.soPenaltyLow;
    if (soPenalty > 0) inst.so -= soPenalty;
  }

  const instRank = Object.keys(inst).map((k)=>({code:k,name:instName[k],score:inst[k]})).sort((a,b)=>b.score-a.score);
  let instinctCode = instRank[0].code;
  let instinctLabel = instRank[0].name;
  if (instRank[0].score === instRank[1].score) {
    instinctCode = `${instRank[0].code}/${instRank[1].code}`;
    instinctLabel = `${instRank[0].name} & ${instRank[1].name} (공동 1위)`;
  }

  let wing = '활성화 안됨';
  let wingCode = `${core} (순수유형)`;
  let coreDisplay = `${core}번`;
  let phase3Result = null;

  if (!coreResolved) {
    coreDisplay = `${core}번 / ${second.type}번 (코어 보류)`;
    wing = '코어 확정 후 판별 가능';
    wingCode = '판별 보류 (코어 보류)';
  } else {
    const ps = {1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};
    const t2 = toScore(testState.phase1Responses.t2) || 0;
    const t5 = toScore(testState.phase1Responses.t5) || 0;
    const t8 = toScore(testState.phase1Responses.t8) || 0;
    ps[2]+=t2; ps[3]+=t2; ps[4]+=t2; ps[5]+=t5; ps[6]+=t5; ps[7]+=t5; ps[8]+=t8; ps[9]+=t8; ps[1]+=t8;
    for (let i=1;i<=9;i++) ps[i]+=(toScore(testState.phase1Responses[`c${i}`]) || 0)*TEST_CONFIG.weights.phase1Core;
    q1.filter((q)=>q.format==='ab').forEach((q)=>{ const c = testState.phase1Responses[q.id]; const t = c==='A'?q.leftType:q.rightType; ps[t]+=TEST_CONFIG.weights.phase1Binary; });
    if (core === 7 && testState.tie.t7wing.enabled) { ps[6] += tb7w6 * testState.tie.t7wing.weight; ps[8] += tb7w8 * testState.tie.t7wing.weight; }

    const l = core===1?9:core-1;
    const r = core===9?1:core+1;
    const ls = ps[l], rs = ps[r], cs = ps[core];
    if (ls !== rs) {
      const w = ls >= rs ? l : r;
      const ws = Math.max(ls, rs);
      if (ws > 0 && ws >= cs * TEST_CONFIG.thresholds.wingActivationRatio) {
        wing = `${w}번 날개`;
        wingCode = `${core}w${w}`;
      }
    }

    // Phase 3 — 통합 결과 (wing %, instinct %, 27 subtype, formatted)
    try {
      if (typeof window !== 'undefined' && window.TestScoring && window.TestScoring.computeResult) {
        const scoresForResult = {};
        for (let i = 1; i <= 9; i++) scoresForResult[i] = ps[i] || 0;
        phase3Result = window.TestScoring.computeResult({
          coreType: core,
          scores: scoresForResult,
          responses: testState.phase1Responses,
          q1: q1,
        });
      }
    } catch (_e) {
      phase3Result = null;
    }
  }

  document.getElementById('phase2-form').classList.add('hidden');
  document.getElementById('phase3-form').classList.add('hidden');
  document.getElementById('progress-container').classList.add('hidden');
  document.getElementById('result-view').classList.remove('hidden');
  document.getElementById('cta-consulting').classList.add('hidden');

  document.getElementById('res-final').innerText = phase3Result
    ? phase3Result.formatted
    : `${instinctCode} ${wingCode}`;
  document.getElementById('res-instincts').innerText = phase3Result
    ? `27 subtype: ${phase3Result.subtype || '미정'}${phase3Result.countertype ? ' (countertype)' : ''}`
    : `제 1본능: ${instinctLabel}`;
  document.getElementById('res-core').innerText = coreDisplay;
  document.getElementById('res-wing').innerText = wing;
  // Phase 3 신규 placeholder (test.html 에 추가됨, 없으면 null-safe)
  const wingPctEl = document.getElementById('res-wing-pct');
  if (wingPctEl) {
    wingPctEl.innerText = phase3Result && phase3Result.wing && phase3Result.wing.wing
      ? `${phase3Result.wing.pct}% (w${phase3Result.wing.wing})`
      : '활성화 안됨';
  }
  const instPctEl = document.getElementById('res-instinct-pct');
  if (instPctEl && phase3Result) {
    const ip = phase3Result.instinctPct;
    instPctEl.innerText = `sp(${ip.sp}%) sx(${ip.sx}%) so(${ip.so}%)`;
  }
  const subtypeEl = document.getElementById('res-subtype-27');
  if (subtypeEl && phase3Result) {
    subtypeEl.innerText = phase3Result.subtype
      ? `${phase3Result.subtype}${phase3Result.countertype ? ' (countertype)' : ''}`
      : '미정';
  }
  document.getElementById('res-arrows').innerHTML = coreResolved
    ? `<span class="text-blue-600 font-bold">통합(건강) 방향: ${arrowLines[core].growth}번</span><br><span class="text-red-500 font-bold">비통합(스트레스) 방향: ${arrowLines[core].stress}번</span>`
    : '코어 확정 후 확인 가능합니다.';

  const badge = document.getElementById('confidence-badge');
  if (confidence === '높음') { badge.className='absolute top-6 right-6 px-3 py-1 rounded-full text-xs font-bold bg-green-500 text-white'; badge.innerText='신뢰도: 높음'; }
  else if (confidence === '보통') { badge.className='absolute top-6 right-6 px-3 py-1 rounded-full text-xs font-bold bg-yellow-500 text-white'; badge.innerText='신뢰도: 보통'; }
  else { badge.className='absolute top-6 right-6 px-3 py-1 rounded-full text-xs font-bold bg-red-500 text-white'; badge.innerText='신뢰도: 낮음'; document.getElementById('cta-consulting').classList.remove('hidden'); }

  let log = '';
  if (!coreResolved) {
    log = `현재는 <strong>${core}번</strong>과 <strong>${second.type}번</strong>이 매우 근접하여 코어를 보류로 표시합니다.`;
  } else {
    log = `가중치 병합 결과 중심 축은 <strong>${core}번</strong>, 2순위는 <strong>${second.type}번</strong>, 점수 격차는 <strong>${(diff*100).toFixed(1)}%</strong> 입니다.`;
    if (second.type === arrowLines[core].stress) log += `<br><br><span class="text-red-600 text-sm">2순위 ${second.type}번은 현재 스트레스 방향 영향일 수 있습니다.</span>`;
    if (second.type === arrowLines[core].growth) log += `<br><br><span class="text-blue-600 text-sm">2순위 ${second.type}번은 현재 성장 방향 영향일 수 있습니다.</span>`;
    if (testState.tie.t71.enabled) log += `<br><br><span class="text-xs">* 전환형/기준형 경합 타이브레이커 적용</span>`;
    if (testState.tie.t78.enabled) log += `<br><br><span class="text-xs">* 전환형/돌파형 경합 타이브레이커 적용</span>`;
    if (testState.tie.t18.enabled) log += `<br><br><span class="text-xs">* 기준형/돌파형(1-8) 동기 타이브레이커 적용</span>`;
    if (testState.tie.tGeneric.enabled) log += `<br><br><span class="text-xs">* ${testState.tie.tGeneric.typeA}-${testState.tie.tGeneric.typeB}번 공용 타이브레이커 적용</span>`;
    if (testState.tie.t7wing.enabled && core===7) log += `<br><br><span class="text-xs">* 전환형 하위패턴 보정 적용</span>`;
    if (soPenalty > 0) log += `<br><br><span class="text-xs">* 사회적 본능 과대표집 보정 적용 (-${soPenalty.toFixed(1)})</span>`;
    if (recentStress >= TEST_CONFIG.thresholds.stressCorrectionStart) log += `<br><br><span class="text-xs">* 최근 2주 스트레스 보정 적용</span>`;
    if (postTieApplied) log += `<br><br><span class="text-xs">* 최종 타이브레이커 1문항 적용</span>`;
  }
  document.getElementById('res-log').innerHTML = log;

  document.getElementById('res-top3').innerHTML = top3.map((x,i)=>{
    const p = top3Total>0 ? ((x.score/top3Total)*100).toFixed(1) : '0.0';
    const ev = evidence[x.type].sort((a,b)=>b.points-a.points).slice(0,3).map((e)=>`<li class="text-xs text-gray-600 leading-relaxed">• ${e.text}</li>`).join('');
    return `<div class="rounded-xl border border-gray-200 bg-white p-4"><div class="flex items-center justify-between mb-2"><p class="font-semibold text-gray-800">${i+1}. ${x.type}번</p><p class="text-xs font-bold text-[#4a4540]">상대 점유율: ${p}%</p></div><p class="text-xs text-gray-500 mb-1">근거 문항</p><ul class="space-y-1">${ev}</ul></div>`;
  }).join('');

  document.getElementById('download-pdf-btn').onclick = downloadResultPdf;
}

renderQuestions('phase1-container', q1, 'p1');
setProgress(50);
requestAnimationFrame(revealTestPageAfterLoad);

// --- Share Feature ---
function shareTestResult() {
  const finalEl = document.getElementById('res-final');
  const instinctsEl = document.getElementById('res-instincts');
  const badgeEl = document.getElementById('confidence-badge');
  if (!finalEl || !finalEl.innerText) return;

  const typeResult = finalEl.innerText.trim();
  const instincts = instinctsEl ? instinctsEl.innerText.trim() : '';
  const confidence = badgeEl ? badgeEl.innerText.trim() : '';
  const shareUrl = 'https://er-coaching.com/test.html';

  const shareText = [
    `나의 에니어그램 유형: ${typeResult}`,
    instincts ? `${instincts}` : '',
    confidence ? `(${confidence})` : '',
    '',
    'ER 에니어그램 심층 진단으로 알아보기 👇',
    shareUrl
  ].filter(Boolean).join('\n');

  if (navigator.share) {
    navigator.share({
      title: `에니어그램 결과: ${typeResult}`,
      text: shareText,
      url: shareUrl
    }).catch(() => {});
    return;
  }

  // Fallback: copy to clipboard
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(shareText).then(() => {
      showShareToast('결과가 클립보드에 복사되었습니다 ✓');
    }).catch(() => {
      showShareToast('복사 실패. 직접 선택 후 복사해 주세요.');
    });
  } else {
    const ta = document.createElement('textarea');
    ta.value = shareText;
    ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0;';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try { document.execCommand('copy'); showShareToast('결과가 클립보드에 복사되었습니다 ✓'); }
    catch (_) { showShareToast('복사 실패. 직접 선택 후 복사해 주세요.'); }
    document.body.removeChild(ta);
  }
}

function showShareToast(msg) {
  let toast = document.getElementById('share-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'share-toast';
    toast.style.cssText = [
      'position:fixed', 'bottom:24px', 'left:50%', 'transform:translateX(-50%)',
      'background:#3E362E', 'color:#fff', 'padding:10px 20px', 'border-radius:24px',
      'font-size:13px', 'font-weight:600', 'z-index:9999',
      'transition:opacity 0.3s', 'pointer-events:none', 'white-space:nowrap'
    ].join(';');
    document.body.appendChild(toast);
  }
  toast.innerText = msg;
  toast.style.opacity = '1';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.opacity = '0'; }, 2800);
}

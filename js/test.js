const params = new URLSearchParams(window.location.search || '');
const pageLang = params.get('lang') === 'en' ? 'en' : 'ko';
document.documentElement.lang = pageLang === 'en' ? 'en' : 'ko';

const TEST_UI = {
  ko: {
    loadingKicker: '진단 페이지 준비 중',
    title: '적응형 에니어그램 심층 진단',
    subtitle: '먼저 확실히 아닌 유형을 걸러낸 뒤, 남은 후보의 핵심 동기를 좁혀 갑니다.',
    disclaimer: '* 본 진단은 자가탐색 참고용이며, 의학적 또는 임상적 진단을 대체하지 않습니다.',
    elimIntroTitle: '0단계: 확실히 아닌 유형 걸러내기',
    elimIntroDesc: '아래 아홉 가지 중 “이건 정말 내가 아니야”라고 느껴지는 유형만 표시해 주세요. 확신이 없으면 건드리지 않아도 됩니다. 최대 6개까지 제외할 수 있습니다.',
    elimHint: '선택 = 확실히 아님 · 남은 유형만 다음 단계에서 집중적으로 비교합니다.',
    elimSubmit: '이어서 질문 시작',
    elimTooMany: '확실히 아닌 유형은 최대 6개까지 고를 수 있습니다. 적어도 3개 후보는 남겨 주세요.',
    elimMark: '확실히 아님',
    phase1IntroTitle: '1부: 일상적 자동반응 패턴',
    phase1IntroDesc: '불안/압박 상황에서 어떤 대처가 자동으로 나오는지 체크해 주세요.',
    phase1Submit: '2단계로 이동',
    phase2IntroTitle: '1차 분석 완료',
    phase2IntroDesc: '후보 유형 경합을 줄이기 위한 심층 질문입니다.',
    phase2Submit: '결과 보기',
    phase3IntroTitle: '마지막 정밀 감별',
    phase3IntroDesc: '상위 2개 유형이 모두 높게 경합 중입니다. 최종 확정을 위해 아래 문항 1개만 선택해 주세요.',
    phase3Submit: '최종 결과 보기',
    phase4IntroTitle: '최종 하위유형/날개 판별',
    phase4IntroDesc: '확정된 기본 유형에 맞춰 하위유형과 날개를 한 번 더 정밀하게 확인합니다.',
    phase4Submit: '최종 결과 보기',
    requiredAll: '모든 문항에 응답해 주세요.',
    requiredOne: '문항을 선택해 주세요.',
    step1Label: '1단계: 확실히 아닌 유형 제거',
    step2Label: '2단계: 기초 성향 및 본능 파악',
    step3Label: '3단계: 동기 교차 검증',
    step4Label: '4단계: 최종 타이브레이커',
    step5Label: '5단계: 하위유형 및 날개 확정',
    analysisReportTitle: '분석 리포트',
    top3Title: '헷갈릴 수 있는 가까운 유형들',
    consultText: '현재 결과는 1순위/2순위가 근접합니다. 결과지 해석상담에서 핵심 유형, 하위유형, 날개, 신뢰도, 헷갈리는 유형을 함께 정리해 드립니다.',
    consultBtn: '결과지 해석상담 신청',
    shareBtn: '결과 공유하기',
    downloadPdf: '결과 PDF 다운로드',
    restart: '처음부터 다시하기',
    resultDisclaimer: '* 본 결과는 전문 상담사의 임상적 진단을 대체하지 않습니다.',
    pdfPreparing: 'PDF 준비 중...',
    pdfGenerating: 'PDF 생성 중...',
    pdfError: 'PDF 생성 중 오류가 발생했습니다. 다시 시도해 주세요.',
    shareCopied: '결과가 클립보드에 복사되었습니다 ✓',
    shareCopyFail: '복사 실패. 직접 선택 후 복사해 주세요.'
  },
  en: {
    loadingKicker: 'Preparing assessment page',
    title: 'Adaptive Enneagram Assessment',
    subtitle: 'First eliminate types that are clearly not you, then narrow the remaining candidates by core motivation.',
    disclaimer: '* This assessment is for self-exploration and does not replace medical or clinical diagnosis.',
    elimIntroTitle: 'Step 0: Remove types that are clearly not you',
    elimIntroDesc: 'Mark only the types you are sure do not fit. Leave uncertain ones unmarked. You can eliminate up to 6 types.',
    elimHint: 'Selected = clearly not me · Remaining types are compared more carefully next.',
    elimSubmit: 'Continue to questions',
    elimTooMany: 'You can mark at most 6 types as clearly not you. Please keep at least 3 candidates.',
    elimMark: 'Clearly not me',
    phase1IntroTitle: 'Part 1: Everyday automatic response patterns',
    phase1IntroDesc: 'Please rate how your automatic response tends to show up under pressure or uncertainty.',
    phase1Submit: 'Continue to Phase 2',
    phase2IntroTitle: 'Phase 1 analysis complete',
    phase2IntroDesc: 'These follow-up questions help separate close candidate types.',
    phase2Submit: 'View results',
    phase3IntroTitle: 'Final precision check',
    phase3IntroDesc: 'Your top two types are very close. Please answer one final question.',
    phase3Submit: 'See final result',
    phase4IntroTitle: 'Final subtype and wing check',
    phase4IntroDesc: 'Now that the core type is resolved, choose the subtype and wing pattern that fits most closely.',
    phase4Submit: 'See final result',
    requiredAll: 'Please answer every question before continuing.',
    requiredOne: 'Please select one option to continue.',
    step1Label: 'Phase 1: Eliminate clearly-not-me types',
    step2Label: 'Phase 2: Baseline pattern and instinct scan',
    step3Label: 'Phase 3: Cross-check core motivations',
    step4Label: 'Phase 4: Final tie-breaker',
    step5Label: 'Phase 5: Confirm subtype and wing',
    analysisReportTitle: 'Analysis summary',
    top3Title: 'Top 3 relative shares and evidence',
    consultText: 'Your top two results are very close. For clearer typing, we recommend a free 1:1 session.',
    consultBtn: 'Book a free 1:1 session',
    shareBtn: 'Share result',
    downloadPdf: 'Download result PDF',
    restart: 'Start over',
    resultDisclaimer: '* This result does not replace clinical diagnosis by a licensed professional.',
    pdfPreparing: 'Preparing PDF...',
    pdfGenerating: 'Generating PDF...',
    pdfError: 'An error occurred while generating the PDF. Please try again.',
    shareCopied: 'Result copied to clipboard ✓',
    shareCopyFail: 'Copy failed. Please copy manually.'
  }
};

const TYPE_PROMPT_EN = {
  1: 'I am driven to restore what feels right, clear, and principled.',
  2: 'I naturally move toward caring support and relational connection.',
  3: 'I focus on outcomes, competence, and visible effectiveness.',
  4: 'I seek depth, authenticity, and meaning in what I feel.',
  5: 'I step back to observe, analyze, and preserve mental energy.',
  6: 'I scan for risk, verify details, and secure safety first.',
  7: 'I shift toward options, momentum, and possibility under pressure.',
  8: 'I move directly to protect, confront, and reclaim control.',
  9: 'I reduce tension and protect harmony before pushing my preference.'
};

// 인터뷰식 제거 단계용 핵심 동기 스케치 (표면 행동이 아니라 fixation)
const TYPE_ELIMINATION_SKETCHES = {
  1: {
    ko: '옳고 그름의 기준에 맞춰야 마음이 놓인다. 어긋난 것을 보면 긴장이 먼저 올라온다.',
    en: 'I settle only when things match an inner standard of rightness. Misalignment triggers tension first.'
  },
  2: {
    ko: '누군가에게 필요한 존재가 되어야 안전하다. 도움이 안 되면 불안해진다.',
    en: 'I feel secure when I am needed. If my help does not matter, unease rises.'
  },
  3: {
    ko: '유능하고 성과 나는 모습으로 보여야 한다. 실패처럼 보이는 것이 가장 아프다.',
    en: 'I need to look capable and effective. Looking like a failure hits hardest.'
  },
  4: {
    ko: '남과 다른 감정과 결핍이 진짜 나다. 평범해지거나 깊이가 사라지는 것이 두렵다.',
    en: 'My distinct feelings and longing feel like the real me. Becoming ordinary or shallow feels threatening.'
  },
  5: {
    ko: '충분히 알고 준비되기 전에는 나서지 않는다. 에너지와 정보를 지켜야 한다.',
    en: 'I hold back until I know enough. Energy and information must be conserved.'
  },
  6: {
    ko: '위험과 불확실성을 먼저 본다. 믿을 기준과 대비가 있어야 움직인다.',
    en: 'I scan risk and uncertainty first. I move only when I have a trusted guide or backup.'
  },
  7: {
    ko: '답답하고 무거운 감정에 오래 머물기 싫다. 더 나은 가능성과 선택지를 찾는다.',
    en: 'I do not stay long in heavy feelings. I look for better options and possibilities.'
  },
  8: {
    ko: '약해 보이거나 지배당하는 상황을 참기 어렵다. 힘과 주도권을 되찾으려 한다.',
    en: 'I cannot stand feeling weak or controlled. I move to reclaim strength and initiative.'
  },
  9: {
    ko: '갈등과 마찰을 피하고 편안함을 지킨다. 내 주장보다 분위기를 먼저 본다.',
    en: 'I protect comfort and avoid friction. Atmosphere comes before asserting my preference.'
  }
};

function uiText(key) {
  return (TEST_UI[pageLang] && TEST_UI[pageLang][key]) || TEST_UI.ko[key] || key;
}

function localizeStaticTestPage() {
  const map = {
    'loading-kicker': 'loadingKicker',
    'test-title': 'title',
    'test-subtitle': 'subtitle',
    'test-disclaimer': 'disclaimer',
    'elim-intro-title': 'elimIntroTitle',
    'elim-intro-desc': 'elimIntroDesc',
    'elim-hint': 'elimHint',
    'elim-submit-btn': 'elimSubmit',
    'validation-msg-elim': 'elimTooMany',
    'phase1-intro-title': 'phase1IntroTitle',
    'phase1-intro-desc': 'phase1IntroDesc',
    'phase1-submit-btn': 'phase1Submit',
    'phase2-intro-title': 'phase2IntroTitle',
    'phase2-intro-desc': 'phase2IntroDesc',
    'phase2-submit-btn': 'phase2Submit',
    'phase3-intro-title': 'phase3IntroTitle',
    'phase3-intro-desc': 'phase3IntroDesc',
    'phase3-submit-btn': 'phase3Submit',
    'phase4-intro-title': 'phase4IntroTitle',
    'phase4-intro-desc': 'phase4IntroDesc',
    'phase4-submit-btn': 'phase4Submit',
    'validation-msg-1': 'requiredAll',
    'validation-msg-2': 'requiredAll',
    'validation-msg-3': 'requiredOne',
    'validation-msg-4': 'requiredAll',
    'analysis-report-title': 'analysisReportTitle',
    'top3-title': 'top3Title',
    'consult-cta-text': 'consultText',
    'consult-cta-btn': 'consultBtn',
    'share-btn-label': 'shareBtn',
    'download-pdf-btn': 'downloadPdf',
    'restart-test-btn': 'restart',
    'result-disclaimer': 'resultDisclaimer'
  };
  Object.keys(map).forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = uiText(map[id]);
  });
  const stepLabel = document.getElementById('step-label');
  if (stepLabel) stepLabel.textContent = uiText('step1Label');
  const stepCounter = document.getElementById('step-counter');
  if (stepCounter) stepCounter.textContent = '1 / 5';
}

// Minimal English question/option texts (ported from adaptiveQuestionEn in index.html)
const questionTextEn = {
  c1: "Even when others say it is enough, I do not feel settled if my inner standard says it is not done yet.",
  c2: "When I feel someone no longer needs me, a stronger emptiness or anxiety rises than I expected.",
  c3: "After producing a result, it is hard for me to feel this is enough regardless of how others respond.",
  c2_recall: "When the role I can offer in a relationship disappears, I have felt shaken about what I mean to that person.",
  c3_recall: "After making a mistake in a meeting or conversation, I have replayed the scene for days because I may have looked incapable.",
  c4: "Even in happy moments, a sense that something is still missing does not easily disappear.",
  c4_pain: "When a difficult feeling comes up, I tend to stay with it as if it explains something true about me.",
  c4_unique: "Even when I am fitting in well with people, a sense remains that I alone do not fully belong.",
  c5: "After long interaction with people, I first feel the need to recover my energy and thinking space.",
  c6: "Before an important decision, even after checking risks, a thought comes up again that I may still be missing something.",
  c7: "When heavy feelings seem like they will continue, my mind moves to other possibilities or plans even without a conscious decision.",
  c8: "When my people or vulnerable people are treated unfairly, my body reacts first that I need to step in directly.",
  c8_recall: "When I see a power imbalance between people, I tend to step in even if nobody asked me to.",
  c9: "When conflict starts building, the urge to end the discomfort quickly comes before clarifying my position.",
  f_2_3: "Under pressure, which response tends to come out first in me automatically?",
  f_3_6: "When anxiety rises, which first strategy do I rely on more?",
  f_6_8: "When I feel threatened, which response comes first in me?",
  f_1_9: "Right before conflict grows, which response tends to come first?",
  f_5_7: "When I feel drained, which recovery move do I choose first?",
  f_2_8: "When relationship tension rises, which response comes first in me?",
  f_2_3_a: "A. I move closer to the person and try to be more helpful.",
  f_2_3_b: "B. I quickly create visible action or results to stabilize the situation.",
  f_3_6_a: "A. I act quickly and produce results to stabilize the situation.",
  f_3_6_b: "B. I check risks and make backup plans to reduce anxiety.",
  f_6_8_a: "A. I assess the situation and secure standards and backup plans first.",
  f_6_8_b: "B. I step in directly, set boundaries, and reclaim control.",
  f_1_9_a: "A. Tension rises to clarify what is wrong and correct it.",
  f_1_9_b: "B. I move toward keeping the flow smooth so friction does not grow.",
  f_5_7_a: "A. I cut stimulation and retreat quietly to reorganize my energy.",
  f_5_7_b: "B. I switch to new stimulation or a next plan to regain energy.",
  f_2_8_a: "A. I adjust and help more actively to recover the relationship.",
  f_2_8_b: "B. I clarify my position and boundaries and reclaim control.",
  state_2w: "Over the past two weeks, how much pressure and stress have you felt overall? (1=very stable, 6=almost hard to endure)",
  state_defensive: "Over the past two weeks, how much more often than usual have you reacted sensitively or defensively? (1=almost none, 6=almost constantly)",
  state_unusual: "Over the past two weeks, how often have you felt unlike your usual self because the situation demanded a response? (1=not at all, 6=almost always)",
  i_sp_1: "Even in an unfamiliar environment, the first thing I check is whether my body, rest, and daily rhythm can be maintained.",
  i_sp_2: "If I cannot tell where time, energy, or money is leaking, I tend to feel uneasy.",
  i_sp_3: "When making important choices, I tend to consider stability and sustainability of daily life before interest or relationships.",
  i_sx_1: "Rather than maintaining many broad relationships, my energy tends to concentrate on one object or person I feel strongly drawn to.",
  i_sx_2: "When I feel strongly drawn to something, my focus shifts so much that other priorities can temporarily move aside.",
  i_sx_3: "When my heart moves toward a person or pursuit, my energy comes alive when there is strong immersion and clear attraction rather than moderate interest.",
  i_so_1: "When I enter a group, I tend to read fairly quickly who has influence and how the relational flow is moving.",
  i_so_2: "I feel much more stable when my role and contribution point inside a group are clear.",
  i_so_3: "As much as personal comfort or closeness, it matters to me where I stand within a larger flow or group.",
  d1_1: "Even after I decide the work is done, a fresh urge rises to check again whether it truly meets my standard.",
  d1_2: "When something feels off, it keeps catching in my mind even when I try to let it pass.",
  d2_1: "When I feel I am no longer needed in a relationship, I tend to feel more shaken or empty than expected.",
  d2_2: "When the role or care I can offer disappears, I want to confirm what I still mean to that person.",
  d3_1: "My value feels clearer when I have produced visible results or achievement.",
  d3_2: "When I sense the possibility of failing or looking incompetent, tension rises strongly even before the work actually begins.",
  d4_1: "Even when I am with people, I tend to feel distance, as if I am the only one not fully understood.",
  d4_2: "When a repetitive, flat flow lasts too long, I feel emotionally dulled; I feel alive again when emotional depth is present.",
  d5_1: "Rather than jumping into the middle of a situation, I feel settled only after stepping back and grasping the whole picture.",
  d5_2: "When unexpected emotional demands or sudden intrusions come in, my first reaction is to close my energy and step back to sort things out.",
  d6_1: "Before an important decision, I feel settled only after checking hidden risks or missing pieces beyond what is visible.",
  d6_2: "Even when I follow an authority or system, I feel settled only after testing and questioning it to the end.",
  d7_1: "When an uncomfortable reality or heavy feeling lasts too long, my first reaction is to change the atmosphere or turn toward another possibility.",
  d7_2: "When options shrink and I am tied to one direction for a long time, I feel constrained and want to keep another path open.",
  d8_1: "When I sense unfair pressure or intrusion, my first reaction is to regain my side’s strength and initiative rather than step back.",
  d8_2: "I am more sensitive to my influence being ignored or handled carelessly than to not receiving praise.",
  d9_1: "When relational friction may grow, I move first to keep the atmosphere smooth rather than push my preferred direction.",
  d9_2: "At the moment I should face an important conflict or decision, I often find myself doing other tasks first and time has already passed.",
  tb_3_6_1: "As pressure grows, I move more toward producing quick results to prove my competence and reliability.",
  tb_3_6_2: "As pressure grows, I move more toward checking risks and preparing safeguards to reduce uncertainty.",
  tb_5_6_1: "When demands and variables pile up at once, which response feels more automatic for you?",
  tb_5_6_1_a: "A. I need to step back a little and secure some distance so I can sort things out on my own.",
  tb_5_6_1_b: "B. I need to check whether there are missing facts or danger signals before I can relax.",
  tb_5_6_2: "Which of these situations feels harder for you to endure?",
  tb_5_6_2_a: "A. My space and energy getting drained because I keep reacting and staying connected.",
  tb_5_6_2_b: "B. Moving before checking enough and then having a problem surface later.",
  tb_3_1_1: "When achieving the goal matters more, I feel I can adjust existing methods or procedures to fit reality and get the result.",
  tb_3_1_2: "When achieving the goal matters more, I feel the process needs to keep its standards and principles for the result to be right.",
  tb_7_1_1: "When a situation is stuck and frustrating, I try to breathe again by shifting toward another possibility or direction.",
  tb_7_1_2: "When a situation is stuck and frustrating, I feel settled only after identifying what is off and restoring the standard.",
  tb_3_8_1: "When you push hard toward a goal, which motive is closer to what is happening inside?",
  tb_3_8_1_a: "A. I want the result to clearly show my competence and value.",
  tb_3_8_1_b: "B. I want to make my influence and initiative clear so I do not get pushed around.",
  tb_3_8_2: "Which state is harder for you to tolerate?",
  tb_3_8_2_a: "A. Not producing enough and looking weak or incompetent.",
  tb_3_8_2_b: "B. Having someone take control from me or push me around.",
  tb_3_8_3: "When things do not go your way, which feeling tends to sting first?",
  tb_3_8_3_a: "A. That I did not perform well enough to receive the recognition I expected.",
  tb_3_8_3_b: "B. That I lost control of the flow and was being pulled around by someone else.",
  tb_4_5_1: "When you are alone, where does your energy more naturally go?",
  tb_4_5_1_a: "A. I stay with what my feelings and sense of lack are trying to say.",
  tb_4_5_1_b: "B. I organize and explore a topic until it becomes understandable.",
  tb_4_5_2: "When you feel empty or distressed, which response comes first?",
  tb_4_5_2_a: "A. I move deeper into the texture of the feeling and what it means inside me.",
  tb_4_5_2_b: "B. I step back from the feeling and try to make sense of it from a distance.",
  tb_4_5_3: "Which state feels harder for you to tolerate?",
  tb_4_5_3_a: "A. My feelings becoming flat and my sense of who I am becoming unclear.",
  tb_4_5_3_b: "B. Too many people and demands entering my space and overwhelming my mind.",
  tb_4_6_1: "When your inner state becomes unsettled, where do your thoughts go first?",
  tb_4_6_1_a: "A. Why do I feel so lacking, and why can't I be natural like other people?",
  tb_4_6_1_b: "B. Am I missing something, and could something go wrong ahead?",
  tb_4_6_2: "Which state feels harder for you to tolerate?",
  tb_4_6_2_a: "A. Feeling unfilled no matter what is present, and losing clarity about who I am.",
  tb_4_6_2_b: "B. Something I trusted becoming unstable, and not knowing what I can rely on.",
  tb_4_6_3: "When you are deeply shaken, what do you reach for first?",
  tb_4_6_3_a: "A. I try to feel more deeply what my emotions are telling me.",
  tb_4_6_3_b: "B. I look for reliable standards, explanations, and confirmable evidence.",
  tb_6_9_1: "When you need to make a decision, which response is closer to yours?",
  tb_6_9_1_a: "A. I want to check whether there are missed risks or variables before moving.",
  tb_6_9_1_b: "B. I want to delay a little because the decision may create uncomfortable tension or conflict.",
  tb_6_9_2: "Which state feels harder for you to tolerate?",
  tb_6_9_2_a: "A. Deciding without enough checking and having a problem appear later.",
  tb_6_9_2_b: "B. Making a clear decision and having the atmosphere become rough or the relationship uncomfortable.",
  tb_6_9_3: "When you hesitate before a decision, which thought comes first?",
  tb_6_9_3_a: "A. I may be missing something. I need to check a little more.",
  tb_6_9_3_b: "B. If I make this too clear, things may get bigger. I want to let it pass more gently.",
  tb_7_8_1: "When I state my position strongly, the bigger reason is that I want to break a stuck flow and widen the available options.",
  tb_7_8_2: "When I state my position strongly, the bigger reason is that I want to regain initiative in a flow that feels controlling or intrusive.",
  tb_3_sx_1: "When I push a goal through to the end, what matters more is confirming my value and competence through clear results.",
  tb_3_sx_2: "When I become deeply absorbed in one object of attention, what matters more is the strong focus and pull I feel in the process itself.",
  tb_7w_1: "Even when starting something new, I feel settled only after checking the reactions around me and some degree of stability.",
  tb_7w_2: "When starting something new, I tend to push ahead even when I see constraints and make the path while moving.",
  f_6_8_a: "A. I start with verification, alignment, and safeguards.",
  f_6_8_b: "B. I intervene directly to reset the power balance.",
  f_1_9_a: "A. I clarify standards and correct what is off.",
  f_1_9_b: "B. I reduce friction and preserve relational flow.",
  f_5_7_a: "A. I step back, analyze, and minimize stimulation.",
  f_5_7_b: "B. I look for pivots and fresh stimulating options.",
  f_2_8_a: "A. I offer more care to hold the connection.",
  f_2_8_b: "B. I draw firmer boundaries and reclaim control.",
  tb_1_8_1: "Which scene is closer to when your anger rises strongly?",
  tb_1_8_1_a: "A. When work is handled irrationally or against the standard.",
  tb_1_8_1_b: "B. When someone treats my people or a vulnerable person carelessly or forcefully.",
  tb_1_8_2: "Which scene do you monitor more sensitively?",
  tb_1_8_2_a: "A. The possibility that I may be wrong or may have violated a standard.",
  tb_1_8_2_b: "B. The possibility that I may be controlled or treated as easy to push around.",
  tb_1_8_3: "When you lead people, which direction matters more?",
  tb_1_8_3_a: "A. Leading them toward a more correct and ordered direction.",
  tb_1_8_3_b: "B. Protecting them from outside pressure and securing strength.",
  tb_1_4_1: "When you notice something in yourself that feels lacking or wrong, which response is closer to yours?",
  tb_1_4_1_a: "A. I raise the standard and push myself, asking how I can fix this and improve.",
  tb_1_4_1_b: "B. I sink into the feeling of lack, wondering why I cannot be natural like other people.",
  tb_1_4_2: "When uncomfortable or heavy feelings rise inside, which response is more automatic?",
  tb_1_4_2_a: "A. I feel I should not be ruled by these feelings, so I suppress them and try to control myself rationally.",
  tb_1_4_2_b: "B. I feel these emotions reveal something true about me, so I stay with them instead of pushing them away.",
  tb_1_4_3: "When reality falls short of the ideal you want, which feeling rises more strongly?",
  tb_1_4_3_a: "A. Frustration and irritation that things are misaligned and not working as they should.",
  tb_1_4_3_b: "B. Emptiness and sadness that what is beautiful and whole may remain out of reach.",
  tb_1_5_1: "When you watch something inefficient or unreasonable, which response happens first inside you?",
  tb_1_5_1_a: "A. I keep feeling bothered, thinking, \"Why do it that way? It could be corrected like this.\"",
  tb_1_5_1_b: "B. I separate myself from it and observe the structure, thinking, \"So that system works that way.\"",
  tb_1_5_2: "When you step back from emotionally tangled situations, what is the deeper reason?",
  tb_1_5_2_a: "A. I guard against losing objectivity and the right standard of judgment by getting swept up in feelings.",
  tb_1_5_2_b: "B. I protect myself because my energy drains quickly and my private space can feel invaded.",
  tb_1_5_3: "When you dig deeply to know something accurately, what motive is more underneath?",
  tb_1_5_3_a: "A. I want to do it correctly without mistakes and fulfill my role responsibly.",
  tb_1_5_3_b: "B. I want to understand how things work and have a clear map in my mind.",
  tb_3_5_1: "When you feel pressure to prove your ability, which worst-case scenario feels more threatening?",
  tb_3_5_1_a: "A. My results look poor compared with my effort, and people judge me as unsuccessful or lacking value.",
  tb_3_5_1_b: "B. It becomes obvious that I lack real depth in the field, so I am intellectually dismissed as unqualified.",
  tb_3_5_2: "What is the deeper drive behind aggressively filling in knowledge, credentials, or proven results in a field?",
  tb_3_5_2_a: "A. They make me stand out as successful and bring clear praise and recognition from others.",
  tb_3_5_2_b: "B. I feel anxious that I am not prepared enough for the world's demands, so expertise helps me defend myself and connect.",
  tb_5_8_1: "What is the deepest reason you block others' involvement and act independently?",
  tb_5_8_1_a: "A. I need to protect my safe space and prevent my time and energy from being wasted by outside demands.",
  tb_5_8_1_b: "B. I cannot stand handing over my decision-making power or initiative, or being under someone else's control.",
  tb_5_8_2: "In conflict or anger, which trigger most strongly gets under your skin?",
  tb_5_8_2_a: "A. A messy structure or foolish mistakes force me to spend energy I should not have had to spend.",
  tb_5_8_2_b: "B. Someone treats me as easy to push around, invades my territory, or tries to control me through a power imbalance.",
  tb_1_6_1: "When you keep checking your work, which thought is closer to what is happening inside?",
  tb_1_6_1_a: "A. This part is still rough. I need to refine it more properly and thoroughly.",
  tb_1_6_1_b: "B. What if I missed something? There must not be a problem later.",
  tb_1_6_2: "When a supervisor or company rule differs from your view, which inner response is closer?",
  tb_1_6_2_a: "A. That way is irrational and wrong. It needs to be fixed to meet a proper standard.",
  tb_1_6_2_b: "B. I may follow it, but I keep feeling uneasy and doubtful about whether it is really safe to do it that way.",
  tb_1_6_3: "When a situation slips out of your control, which feeling rises most strongly?",
  tb_1_6_3_a: "A. Frustration and anger from work becoming messy and standards breaking down.",
  tb_1_6_3_b: "B. Vague anxiety and worry from unpredictable variables appearing.",
  tb_1_9_1: "When you do not point out a problem because the situation may become uncomfortable, what feeling stays with you?",
  tb_1_9_1_a: "A. I keep simmering inside, thinking, \"It still was not done properly.\"",
  tb_1_9_1_b: "B. I feel relieved that things somehow passed without a bigger scene.",
  tb_1_9_2: "Which situation feels more frustrating and uncomfortable to you?",
  tb_1_9_2_a: "A. Rules and exceptions getting loose, and things running carelessly without responsibility.",
  tb_1_9_2_b: "B. People becoming sharp and tense, with the atmosphere feeling like it may erupt at any time.",
  tb_1_9_3: "When irritation or anger rises in you, what do you unconsciously tend to do?",
  tb_1_9_3_a: "A. I try to suppress it, but the energy leaks out through a stiff voice or cold expression.",
  tb_1_9_3_b: "B. I try to blur the anger itself, acting like nothing happened or shifting my attention elsewhere.",
  tb_6_8_1: "When you confront or push hard against someone, which inner purpose is closer to yours?",
  tb_6_8_1_a: "A. I want to test and confirm whether this person is trustworthy or hiding an agenda.",
  tb_6_8_1_b: "B. I want to make it clear who has power here and warn them not to cross into my territory.",
  tb_6_8_2: "After you strongly unload in a conflict, which pattern happens more often?",
  tb_6_8_2_a: "A. I re-check the situation alone, wondering whether I went too far or whether trouble may come later.",
  tb_6_8_2_b: "B. I feel the situation is now settled and shake it off without much afterthought or worry.",
  tb_6_8_3: "Which situation most often brings out your sharpest reaction?",
  tb_6_8_3_a: "A. I cannot predict how things will unfold, and no one gives a clear answer or takes responsibility.",
  tb_6_8_3_b: "B. Someone tries to push me around, look down on me, or control me as they please.",
  tb_2_4_1: "When a relationship starts to feel awkward or distant, which response is closer to yours?",
  tb_2_4_1_a: "A. I want to care more, adjust more, and restore warmth in the connection.",
  tb_2_4_1_b: "B. I become more sensitive to whether this person truly understands what I feel.",
  tb_2_4_2: "Which state is harder for you to tolerate?",
  tb_2_4_2_a: "A. Feeling like I am no longer needed by that person.",
  tb_2_4_2_b: "B. Being together but feeling that my real feelings are not understood.",
  tb_2_4_3: "When you feel hurt in a relationship, which thought comes first?",
  tb_2_4_3_a: "A. Should I have done more or met their needs better?",
  tb_2_4_3_b: "B. I guess my real feelings are still hard for someone to fully understand.",
  tb_2_6_1: "When you help or take care of someone, which concern is deeper inside you?",
  tb_2_6_1_a: "A. Do they really see me as useful and needed?",
  tb_2_6_1_b: "B. Can this keep us from becoming enemies and make this person more clearly on my side?",
  tb_2_6_2: "Which quiet anxiety is closer to what rises in close relationships?",
  tb_2_6_2_a: "A. If I am no longer needed someday, they may leave me or drift away.",
  tb_2_6_2_b: "B. Even if things look good on the surface, they may not protect me when it matters or may betray me.",
  tb_2_6_3: "When you have been good to someone, what response do you most hope for inside?",
  tb_2_6_3_a: "A. That they treat me differently from others and come closer to me emotionally.",
  tb_2_6_3_b: "B. That they trust me without suspicion and show solid loyalty and support.",
  tb_2_8_1: "When you become very angry and hurt by someone you consider yours, which reason is closer to the core?",
  tb_2_8_1_a: "A. After all I have cared for them and put my heart into them, how could they do this to me?",
  tb_2_8_1_b: "B. I tried to protect and lead them, so how dare they cross my line and ignore my way?",
  tb_2_8_2: "When you deal with people you care about, which attitude is closer to yours?",
  tb_2_8_2_a: "A. I try to notice their detailed feelings and needs, connect deeply, and stay emotionally close.",
  tb_2_8_2_b: "B. I try to keep them inside my circle, protect them from unfair treatment, and lead them firmly.",
  tb_2_8_3: "When you want to influence a relationship or lead things your way, which method do you more often use?",
  tb_2_8_3_a: "A. I subtly make them feel how much effort and devotion I have put in for them.",
  tb_2_8_3_b: "B. I state a clear direction and push through with a firm attitude that does not bend.",
  tb_3_9_1: "When you adjust yourself to a group or atmosphere, which motive is closer underneath?",
  tb_3_9_1_a: "A. What role will make me look most capable and impressive in this situation?",
  tb_3_9_1_b: "B. How can I blend into this atmosphere without standing out or creating friction?",
  tb_3_9_2: "When people pay attention to you, which feeling is more natural inside?",
  tb_3_9_2_a: "A. It can feel burdensome, but I also feel energized by standing out and being recognized.",
  tb_3_9_2_b: "B. I would rather stay quietly in my place, and being watched feels uncomfortable and tiring.",
  tb_3_9_3: "When work feels overwhelming and stress is high, which state do you more often fall into?",
  tb_3_9_3_a: "A. I keep pushing myself under pressure to make it work, even if I overdo it.",
  tb_3_9_3_b: "B. My energy drops as if the switch turns off, and I postpone anything that is not immediately urgent.",
  tb_4_7_1: "When heavy or depressed feelings come in, which automatic response is closer to yours?",
  tb_4_7_1_a: "A. I dig into why I feel this way and stay deeply immersed in the feeling itself.",
  tb_4_7_1_b: "B. I dislike staying in the heavy mood for long, so I quickly look for another thought or activity to refresh myself.",
  tb_4_7_2: "In a plain, repetitive daily routine, which discomfort do you feel more often?",
  tb_4_7_2_a: "A. An empty feeling, as if real meaning and depth have disappeared from life.",
  tb_4_7_2_b: "B. A trapped feeling, as if I am tied to a narrow reality while more new and fun things exist elsewhere.",
  tb_4_7_3: "When you escape reality in your imagination, which content is more common?",
  tb_4_7_3_a: "A. A romantic, deep ideal or feeling that may not be easily fulfilled in real life.",
  tb_4_7_3_b: "B. A new idea or plan that is interesting, curiosity-sparking, and possible to try soon.",
  tb_4_8_1: "When you become forcefully angry and push your demands, which feeling is deeper underneath?",
  tb_4_8_1_a: "A. Even if I look angry, underneath is a deep sense that I was not understood and a fear of seeming lacking.",
  tb_4_8_1_b: "B. I do not feel complex hurt or inferiority; someone crossed a line, so I am exercising my rightful power.",
  tb_4_8_2: "When you compete or clash with others to win, what inner reward are you really seeking?",
  tb_4_8_2_a: "A. I want to prove I am superior to those who rejected or ignored me, compensating for shame and hurt.",
  tb_4_8_2_b: "B. I want to protect my people and territory, making sure no one can control or underestimate me.",
  tb_3_7_1: "When you try to be recognized as useful and sociable, which purpose is closer underneath?",
  tb_3_7_1_a: "A. I feel my value depends on how much I perform and how useful I am, so I need to prove my worth.",
  tb_3_7_1_b: "B. If I am useful, people will like me, and the opportunity network that can help me in a crisis stays alive.",
  tb_3_7_2: "When you stop producing results or stop receiving attention where you are, what is your automatic response?",
  tb_3_7_2_a: "A. I feel deep shame and emptiness, as if my identity has collapsed, and I try hard to recover my successful position.",
  tb_3_7_2_b: "B. If this place is not working, I quickly look for another fun place or opportunity and turn toward other possibilities.",
  tb_5_9_1: "When you want to pull away from people or a situation, which response is closer to yours?",
  tb_5_9_1_a: "A. I want to secure distance before my energy and thinking space get taken over.",
  tb_5_9_1_b: "B. I want to quietly step out before the atmosphere becomes more uncomfortable.",
  tb_5_9_2: "Which state is harder for you to tolerate?",
  tb_5_9_2_a: "A. People and demands keep coming in, invading my space and focus.",
  tb_5_9_2_b: "B. Uncomfortable tension keeps lingering inside the relationship or atmosphere.",
  tb_5_9_3: "When you want distance, which thought comes first?",
  tb_5_9_3_a: "A. Too much is coming in. I need space to step back and sort things out.",
  tb_5_9_3_b: "B. This atmosphere will get heavier if it continues. It is better to let it pass quietly.",
  tb_8_9_1: "When someone tries to direct or control you, which response is closer to yours?",
  tb_8_9_1_a: "A. I think, \"Who are you to tell me what to do?\" and I immediately push back or draw a firm line.",
  tb_8_9_1_b: "B. I may say okay or stay quiet on the outside, but inside I let it pass by and keep my own pace.",
  tb_8_9_2: "When you face conflict that cannot be avoided, what happens to your energy?",
  tb_8_9_2_a: "A. My energy rises and my mind gets clearer, and I want to confront it until it is settled.",
  tb_8_9_2_b: "B. My energy drops and I get tired, and I want to cover it over and move past it quickly.",
  tb_8_9_3: "Which state is harder for you to tolerate?",
  tb_8_9_3_a: "A. Looking easy to push around and losing initiative to other people.",
  tb_8_9_3_b: "B. Loud friction and tension continuing so my mind cannot stay settled."
};

function getQuestionText(item) {
  if (pageLang === 'en' && item.id.startsWith('tb_gen_')) return 'Which of the two sentences below is closer to you?';
  if (pageLang === 'en' && item.qEn) return item.qEn;
  if (pageLang === 'en' && questionTextEn[item.id]) return questionTextEn[item.id];
  return item.q;
}

function getOptionText(item, side) {
  const base = side === 'a' ? item.a : item.b;
  if (pageLang === 'en') {
    if (item.id.startsWith('tb_gen_')) {
      return side === 'a'
        ? `A. ${TYPE_PROMPT_EN[item.leftType] || 'This statement fits me more.'}`
        : `B. ${TYPE_PROMPT_EN[item.rightType] || 'This statement fits me more.'}`;
    }
    const key = `${item.id}_${side}`;
    if (questionTextEn[key]) return questionTextEn[key];
    if (side === 'a' && item.aEn) return item.aEn;
    if (side === 'b' && item.bEn) return item.bEn;
  }
  return base;
}

function getChoiceOptionText(option) {
  const text = pageLang === 'en' ? option.textEn : option.text;
  return text;
}

const arrowLines = {1:{stress:4,growth:7},2:{stress:8,growth:4},3:{stress:9,growth:6},4:{stress:2,growth:1},5:{stress:7,growth:8},6:{stress:3,growth:9},7:{stress:1,growth:5},8:{stress:5,growth:2},9:{stress:6,growth:3}};

const TEST_CONFIG = {
  weights: {
    phase1Core: 1.5,
    phase1CenterChoice: 0.6,
    phase1Binary: 1.8,
    instinctAttentionChoice: 3.0,
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
      wing7: 2.0,
      counterType: 0.75,
      counterInstinct: 0.55
    }
  },
  thresholds: {
    candidateRatio: 0.70,
    minCandidates: 3,
    maxCandidates: 5,
    maxEliminatedTypes: 6,
    eliminationResurrectRatio: 0.90,
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
    wingActivationRatio: 0.85,
    stateAnxietySixRivalMargin: 0.18
  },
  corrections: {
    sxDampFactor: 0.45,
    sxDampMaxCoreRatio: 0.06,
    sxBoostFactor: 0.35,
    sxBoostCap: 1.5,
    stressType1Damp: 1.0,
    stressType7Boost: 0.6,
    stateAnxietyType6Damp: 0.9,
    stateAnxietyType6MaxDampRatio: 0.12,
    stateAnxietyTieWeightBoost: 1.15,
    soPenaltyHighLead: 2,
    soPenaltyLowLead: 1,
    soPenaltyHigh: 2.0,
    soPenaltyLow: 1.0
  }
};

const testState = {
  eliminatedTypes: [],
  eliminationResurrected: [],
  phase1Responses: {},
  phase2Questions: [],
  phase3Question: null,
  phase4Questions: [],
  pendingResult: null,
  responseTiming: {
    startedAt: null,
    firstAnswerAt: {},
    completedAt: null,
    totalSeconds: 0,
    answeredCount: 0,
    avgSecondsPerAnswered: 0
  },
  tie: {
    t36: {enabled:false,weight:0,margin:null},
    t56: {enabled:false,weight:0,margin:null},
    t58: {enabled:false,weight:0,margin:null},
    t59: {enabled:false,weight:0,margin:null},
    t31: {enabled:false,weight:0,margin:null},
    t35: {enabled:false,weight:0,margin:null},
    t37: {enabled:false,weight:0,margin:null},
    t38: {enabled:false,weight:0,margin:null},
    t39: {enabled:false,weight:0,margin:null},
    t45: {enabled:false,weight:0,margin:null},
    t46: {enabled:false,weight:0,margin:null},
    t47: {enabled:false,weight:0,margin:null},
    t48: {enabled:false,weight:0,margin:null},
    t68: {enabled:false,weight:0,margin:null},
    t69: {enabled:false,weight:0,margin:null},
    t3sx: {enabled:false,weight:0,margin:null},
    t71: {enabled:false,weight:0,margin:null},
    t78: {enabled:false,weight:0,margin:null},
    t18: {enabled:false,weight:0,margin:null},
    t14: {enabled:false,weight:0,margin:null},
    t15: {enabled:false,weight:0,margin:null},
    t16: {enabled:false,weight:0,margin:null},
    t19: {enabled:false,weight:0,margin:null},
    t24: {enabled:false,weight:0,margin:null},
    t26: {enabled:false,weight:0,margin:null},
    t28: {enabled:false,weight:0,margin:null},
    t29: {enabled:false,weight:0,margin:null},
    t89: {enabled:false,weight:0,margin:null},
    tGeneric: {enabled:false,typeA:null,typeB:null,weight:0},
    t7wing: {enabled:false,weight:0,margin:null}
  }
};

const q1 = [
  {
    id: 'center_auto_1',
    format: 'abc',
    centerChoice: true,
    q: '갑자기 압박을 받거나 예상 밖의 일이 생겼을 때, 가장 먼저 나오는 반응은?',
    qEn: 'When sudden pressure or an unexpected event hits, which reaction comes up first?',
    options: [
      {
        value: 'heart',
        types: [2, 3, 4],
        text: '순간적으로 창피하거나, 내가 부족한 사람처럼 느껴지는 감정이 먼저 올라온다.',
        textEn: 'A flash of shame comes first — feeling exposed or somehow deficient as a person.'
      },
      {
        value: 'head',
        types: [5, 6, 7],
        text: '무슨 일이 벌어진 건지, 앞으로 어떻게 될지부터 따져야 마음이 움직인다.',
        textEn: 'I need to understand what happened and what comes next before anything else settles.'
      },
      {
        value: 'body',
        types: [8, 9, 1],
        text: '생각하기 전에 이미 방향이 정해진다. 맞설지, 참을지, 물러날지가 반사적으로 나온다.',
        textEn: 'A direction is already set before thinking. Confront, hold, or step back comes reflexively.'
      }
    ]
  },
  {
    id: 'center_auto_2',
    format: 'abc',
    centerChoice: true,
    q: '갈등이 생길 조짐이 보이거나 서로 입장이 부딪힐 때, 가장 먼저 나오는 반응은?',
    qEn: 'When conflict begins to form or positions collide, which reaction comes up first?',
    options: [
      {
        value: 'heart',
        types: [2, 3, 4],
        text: '순간적으로 창피하거나, 관계가 흔들린 것 같은 감정이 먼저 올라온다.',
        textEn: 'Shame or the feeling that the relationship just shifted hits me first.'
      },
      {
        value: 'head',
        types: [5, 6, 7],
        text: '왜 이렇게 됐는지 이유를 알아야 안심되고, 해결 방법부터 찾게 된다.',
        textEn: 'I settle only when I understand why this happened, then look for how to resolve it.'
      },
      {
        value: 'body',
        types: [8, 9, 1],
        text: '상황을 생각하기보다, 본능적으로 밀어붙일지·참을지·무시할지가 먼저 정해진다.',
        textEn: 'Before thinking it through, push forward, hold back, or ignore is already decided instinctively.'
      }
    ]
  },
  {
    id: 'center_auto_3',
    format: 'abc',
    centerChoice: true,
    q: '칭찬이나 좋은 평가를 받았을 때, 가장 먼저 드는 반응은?',
    qEn: 'When you receive praise or a positive evaluation, which reaction comes up first?',
    options: [
      {
        value: 'heart',
        types: [2, 3, 4],
        text: '기쁨보다 먼저, 이 평가에 못 미치는 내가 들통날까 봐 살짝 불편해진다.',
        textEn: 'Before the joy settles, a quiet unease comes — what if the real me falls short of this praise.'
      },
      {
        value: 'head',
        types: [5, 6, 7],
        text: '왜 그런 말을 들었는지 이유를 따져 보고, 앞으로도 유지할 방법을 생각한다.',
        textEn: 'I work out what earned that evaluation, then think about how to keep it going forward.'
      },
      {
        value: 'body',
        types: [8, 9, 1],
        text: '별생각 없이 몸이 먼저 반응한다. 편안해지거나 어색해지며 행동이 달라진다.',
        textEn: 'My body responds before any thought. I ease up or turn awkward, and my behavior shifts.'
      }
    ]
  },
  {
    id: 'center_situation_1',
    format: 'abc',
    centerChoice: true,
    q: '회의나 대화에서 내 의견이 잘 받아들여지지 않았을 때, 가장 먼저 나오는 반응은?',
    qEn: 'When your opinion is not well received in a meeting or conversation, which reaction comes up first?',
    options: [
      {
        value: 'heart',
        types: [2, 3, 4],
        text: '순간적으로 창피하거나, 내가 부족한 사람처럼 느껴지는 감정이 먼저 올라온다.',
        textEn: 'A flash of shame comes first — feeling exposed or somehow lacking as a person.'
      },
      {
        value: 'head',
        types: [5, 6, 7],
        text: '왜 이런 일이 생겼는지 이유부터 찾게 된다.',
        textEn: 'I start looking for why this happened before anything else.'
      },
      {
        value: 'body',
        types: [8, 9, 1],
        text: '본능적으로 밀어붙일지, 참을지, 물러날지가 먼저 정해진다.',
        textEn: 'Instinctively, push harder, hold it in, or step back is already decided.'
      }
    ]
  },
  {
    id: 'center_situation_2',
    format: 'abc',
    centerChoice: true,
    q: '누군가 나를 생각보다 차갑게 대하거나 거절했을 때, 가장 먼저 나오는 반응은?',
    qEn: 'When someone treats you more coldly than expected or rejects you, which reaction comes up first?',
    options: [
      {
        value: 'heart',
        types: [2, 3, 4],
        text: '거절당한 사실보다, 순간적으로 부끄럽거나 내가 잘못된 사람처럼 느껴진다.',
        textEn: 'More than the rejection itself, shame hits first — feeling wrong or exposed as a person.'
      },
      {
        value: 'head',
        types: [5, 6, 7],
        text: '왜 그런 반응이 나왔는지 알아야 진정되고, 앞으로 어떻게 될지 따져 보게 된다.',
        textEn: 'I calm down only after I understand why they reacted that way, then think ahead to what follows.'
      },
      {
        value: 'body',
        types: [8, 9, 1],
        text: '본능적으로 따질지, 버틸지, 거리를 둘지가 먼저 정해진다.',
        textEn: 'Instinctively, confront, hold ground, or create distance is already decided.'
      }
    ]
  },
  {
    id: 'center_situation_3',
    format: 'abc',
    centerChoice: true,
    q: '일이 예상과 다르게 틀어졌을 때, 가장 먼저 나오는 반응은?',
    qEn: 'When things go off track, which reaction comes up first?',
    options: [
      {
        value: 'heart',
        types: [2, 3, 4],
        text: '실패보다 먼저, 내가 잘못된 사람처럼 느껴지는 감각이나 부끄러움이 올라온다.',
        textEn: 'Before the failure itself, shame or feeling somehow wrong as a person rises first.'
      },
      {
        value: 'head',
        types: [5, 6, 7],
        text: '무엇이 잘못됐는지, 앞으로 어떻게 수습할지부터 그려 보게 된다.',
        textEn: 'I map what went wrong and how to handle what comes next before anything else.'
      },
      {
        value: 'body',
        types: [8, 9, 1],
        text: '생각하기 전에 이미 행동이 나온다. 바로 수습에 나서거나, 버티거나, 그 자리를 벗어난다.',
        textEn: 'Action comes before thinking. I jump in to fix it, hold my ground, or leave the scene.'
      }
    ]
  },
  { id:'c1', type:1, q:'남들은 충분하다고 해도, 내 기준에 아직 못 미쳤다고 느끼면 마음이 놓이지 않는 편이다.' },
  { id:'c2', type:2, q:'누군가가 더 이상 나를 필요로 하지 않는다고 느껴질 때, 생각보다 큰 허전함이나 불안이 올라오는 편이다.' },
  { id:'c2_recall', type:2, scoreWeight:0.8, q:'관계에서 내가 해 줄 수 있는 역할이 사라지면, 내가 그 사람에게 어떤 존재인지 확신이 흔들린 적이 있다.' },
  { id:'c3', type:3, q:'결과물을 내놓고 나서, 주변 반응과 상관없이 스스로 이 정도면 됐다고 느끼는 순간이 잘 없는 편이다.' },
  { id:'c3_recall', type:3, scoreWeight:0.8, q:'회의나 대화에서 실수한 뒤, 무능해 보였을까 봐 며칠 동안 그 장면을 반복해서 떠올린 적이 있다.' },
  { id:'c4', type:4, scoreWeight:0.7, q:'행복한 순간에도, 마음 한쪽에는 무언가 충분하지 않다는 느낌이 쉽게 사라지지 않는 편이다.' },
  { id:'c4_pain', type:4, scoreWeight:0.8, q:'힘든 감정이 올라오면 빨리 털어내기보다, 그 감정이 지금의 나를 말해 주는 것 같아 오래 붙들게 되는 편이다.' },
  { id:'c4_unique', type:4, scoreWeight:0.5, q:'사람들과 잘 어울리고 있어도, 마음 한쪽에는 나만 온전히 속하지 못한다는 느낌이 남아 있는 편이다.' },
  { id:'c5', type:5, q:'사람들과 오래 어울리고 나면, 감정을 나누기보다 일단 혼자 있으면서 재충전하고 싶다는 생각이 먼저 드는 편이다.' },
  { id:'c6', type:6, q:'중요한 결정을 앞두고 위험 요소를 확인할 때, 다 확인했어도 혹시 빠진 게 있지 않을까 하는 생각이 한 번 더 올라오는 편이다.' },
  { id:'c7', type:7, q:'무겁거나 답답한 감정이 오래 이어질 것 같으면, 나도 모르게 다른 가능성이나 새로운 계획으로 생각이 옮겨 가는 편이다.' },
  { id:'c8', type:8, q:'내 사람이나 약한 사람이 부당한 대우를 받으면, 옳고 그름을 따지기 전에 내가 직접 나서서 막아야겠다는 충동이 먼저 올라오는 편이다.' },
  { id:'c8_recall', type:8, scoreWeight:0.8, q:'사람들 사이에 힘의 불균형이 보이면, 요청받지 않아도 개입하게 되는 편이다.' },
  { id:'c9', type:9, q:'갈등이 생길 것 같으면, 내 입장을 내세우기보다 이 불편함을 빨리 끝내고 싶다는 마음이 먼저 드는 편이다.' },
  { id:'f_2_3', format:'ab', leftType:2,rightType:3,weight:2.2,q:'압박을 받을 때, 나도 모르게 먼저 나오는 반응은 어느 쪽에 가까운가?',a:'상대에게 더 적극적으로 다가가서 도우려고 한다.',b:'눈에 보이는 결과를 빨리 만들어서 상황을 수습하려고 한다.' },
  { id:'f_3_6', format:'ab', leftType:3,rightType:6,weight:2.2,q:'상황이 흔들리거나 불안정하다고 느껴질 때, 먼저 나오는 반응은 어느 쪽에 가까운가?',a:'빠르게 행동하거나 결과를 만들어서 상황을 안정시키려 한다.',b:'빠진 것이나 위험 요소를 먼저 확인하고 대비책을 세워야 마음이 놓인다.' },
  { id:'f_6_8', format:'ab', leftType:6,rightType:8,weight:2.2,q:'위협을 느낄 때, 먼저 나오는 반응은 어느 쪽에 가까운가?',a:'상황을 파악하고 안전한 기준과 대비책을 먼저 갖추려 한다.',b:'직접 개입하거나 경계를 세워서 주도권을 되찾으려 한다.' },
  { id:'f_1_9', format:'ab', leftType:1,rightType:9,weight:2.2,q:'갈등이 생길 조짐이 보일 때, 나도 모르게 먼저 나오는 반응은 어느 쪽에 가까운가?',a:'무엇이 잘못됐는지 분명히 짚어서 바로잡아야 한다는 긴장이 먼저 올라온다.',b:'마찰이 커지기 전에 상황을 부드럽게 만드는 쪽으로 먼저 움직인다.' },
  { id:'f_5_7', format:'ab', leftType:5,rightType:7,weight:2.2,q:'지치거나 힘이 빠졌을 때, 기운을 되찾기 위해 먼저 택하는 쪽은?',a:'연락과 자극을 끊고, 혼자 조용히 쉬면서 재충전한다.',b:'새로운 일이나 다음 계획으로 눈을 돌리면서 다시 기운을 얻는다.' },
  { id:'f_2_8', format:'ab', leftType:2,rightType:8,weight:2.2,q:'관계가 긴장되거나 상대와 거리가 생겼다고 느낄 때, 먼저 나오는 반응은 어느 쪽에 가까운가?',a:'더 적극적으로 맞추거나 도우면서 관계를 회복하려 한다.',b:'내 위치와 경계를 분명히 하고 주도권을 되찾으려 한다.' },
  { id:'state_2w', state:true, q:'최근 2주 동안, 일상 전반에서 느낀 압박과 스트레스 수준은 어느 정도였나요? (1=매우 안정적이었다, 6=거의 버티기 어려울 정도였다)' },
  { id:'state_defensive', state:true, q:'최근 2주 동안, 평소의 나보다 예민하거나 방어적으로 반응하는 일이 얼마나 늘었나요? (1=거의 없었다, 6=거의 계속 그랬다)' },
  { id:'state_unusual', state:true, q:"최근 2주 동안, 상황에 맞추고 대응하느라 '평소의 나 같지 않다'고 느낀 적이 얼마나 있었나요? (1=전혀 없었다, 6=거의 항상 그랬다)" },
  {
    id:'instinct_attention_1',
    format:'abc',
    instinctChoice:true,
    q:'낯선 장소나 새로운 모임에 들어갔을 때, 가장 먼저 눈에 들어오는 것은?',
    qEn:'When you enter an unfamiliar place or new gathering, what catches your attention first?',
    options:[
      { value:'sp', inst:'sp', text:'어디서 쉬고, 먹고, 이동하고, 몸이 편하게 있을 수 있는지부터 본다.', textEn:'I notice where I can rest, eat, move around, and keep my body comfortable.' },
      { value:'sx', inst:'sx', text:'강하게 끌리는 사람이나 에너지가 쏠리는 대상이 가장 먼저 눈에 들어온다.', textEn:'I first sense who or what has strong pull or concentrated energy.' },
      { value:'so', inst:'so', text:'누가 영향력이 있고, 관계 흐름이 어떻게 움직이는지 먼저 읽는다.', textEn:'I first read who has influence and how the relational flow is moving.' }
    ]
  },
  { id:'i_sp_1', inst:'sp', q:'낯선 곳에서도 몸 상태는 괜찮은지, 쉴 수 있는지, 생활 리듬이 유지될 수 있는지를 가장 먼저 확인하게 된다.' },
  { id:'i_sp_2', inst:'sp', q:'시간, 에너지, 돈이 어디로 새고 있는지 파악이 안 되면 마음이 불편해지는 편이다.' },
  { id:'i_sp_3', inst:'sp', q:'중요한 선택을 할 때, 재미나 관계보다 생활이 안정적으로 유지될 수 있는지를 먼저 따지는 편이다.' },
  { id:'i_sx_1', inst:'sx', q:'여러 사람과 두루 지내는 것보다, 강하게 끌리는 한 사람이나 한 가지 일에 에너지가 쏠리는 편이다.' },
  { id:'i_sx_2', inst:'sx', q:'무언가에 강하게 끌리면 다른 일의 우선순위가 잠시 밀릴 만큼 집중이 한쪽으로 쏠리는 편이다.' },
  { id:'i_sx_3', inst:'sx', q:'사람이나 일에 마음이 움직일 때, 적당한 관심보다 강한 몰입감과 선명한 끌림이 있어야 에너지가 살아나는 편이다.' },
  { id:'i_so_1', inst:'so', q:'어떤 모임에 들어가면, 누가 영향력을 갖고 있고 관계의 흐름이 어떻게 움직이는지 비교적 빨리 읽는 편이다.' },
  { id:'i_so_2', inst:'so', q:'모임이나 조직에서 내 역할과 내가 보탬이 되는 부분이 분명할 때 훨씬 마음이 놓이는 편이다.' },
  { id:'i_so_3', inst:'so', q:'개인적인 편안함이나 친밀함만큼, 내가 속한 집단 안에서 어떤 위치에 있는지도 중요하게 느껴지는 편이다.' }
];

const deep = {
  1:[{id:'d1_1',type:1,q:'일을 다 끝냈다고 스스로 판단한 뒤에도, 정말 기준에 맞게 했는지 확인하고 싶은 충동이 다시 올라오는 편이다.'},{id:'d1_2',type:1,q:'"이건 아닌데" 싶은 느낌이 들면, 그냥 넘기려고 해도 마음 한구석에 계속 걸리는 편이다.'}],
  2:[{id:'d2_1',type:2,q:'관계에서 내가 더 이상 필요한 존재가 아닌 것처럼 느껴지면, 예상보다 크게 흔들리거나 허전해지는 편이다.'},{id:'d2_2',type:2,q:'내가 챙겨 줄 수 있는 역할이 사라지면, 그 사람에게 내가 어떤 존재인지 자꾸 확인하고 싶어진다.'}],
  3:[{id:'d3_1',type:3,q:'내 가치가 가장 분명하게 느껴지는 순간은, 눈에 보이는 결과나 성과를 만들어 냈을 때다.'},{id:'d3_2',type:3,q:'실패하거나 무능해 보일 것 같으면, 일이 시작되기도 전부터 크게 긴장하는 편이다.'}],
  4:[{id:'d4_1',type:4,q:'사람들과 함께 있어도, 나만 완전히 이해받지 못한다는 거리감을 느끼는 편이다.'},{id:'d4_2',type:4,q:'똑같고 무난한 일상이 길어지면 감정이 무뎌지고, 깊은 감정이 느껴질 때에야 비로소 살아 있다는 느낌이 드는 편이다.'}],
  5:[{id:'d5_1',type:5,q:'문제나 상황 한가운데 뛰어들기보다, 한 걸음 물러서서 전체를 파악하고 나서야 마음이 안정되는 편이다.'},{id:'d5_2',type:5,q:'누군가 예고 없이 감정적인 요구를 해 오거나 갑자기 훅 들어오면, 일단 마음의 문을 닫고 한발 물러나게 되는 편이다.'}],
  6:[{id:'d6_1',type:6,q:'중요한 결정을 앞두면, 겉으로 보이는 정보보다 숨은 위험이나 빠진 부분을 먼저 확인해야 마음이 놓이는 편이다.'},{id:'d6_2',type:6,q:'규칙이나 윗사람을 따르더라도, 정말 믿을 만한지 끝까지 따져 봐야 안심되는 편이다.'}],
  7:[{id:'d7_1',type:7,q:'불편한 현실이나 무거운 감정이 길어지면, 분위기를 바꾸거나 다른 가능성으로 시선을 돌리려는 반응이 먼저 나온다.'},{id:'d7_2',type:7,q:'선택지가 줄어들고 한 방향에 오래 묶이는 상황을 답답하게 느껴, 언제든 다른 길을 열어두고 싶어 하는 편이다.'}],
  8:[{id:'d8_1',type:8,q:'부당하게 눌리거나 침범당한다고 느끼면, 물러서기보다 주도권을 되찾아야 한다는 반응이 먼저 올라온다.'},{id:'d8_2',type:8,q:'칭찬을 받지 못하는 것보다, 내 영향력이 무시되거나 함부로 다뤄지는 상황에 더 예민한 편이다.'}],
  9:[{id:'d9_1',type:9,q:'관계에서 마찰이 커질 것 같으면, 내가 원하는 방향을 밀기보다 상황이 부드럽게 유지되도록 먼저 움직이는 편이다.'},{id:'d9_2',type:9,q:'중요한 갈등이나 결정을 직접 다뤄야 할 시점에, 어느새 다른 일에 먼저 손이 가거나 시간이 지나 있는 편이다.'}]
};

const tb36 = [
  {id:'tb_3_6_1',type:3,q:'압박이 커질수록, 나는 빨리 결과를 내서 내 유능함과 신뢰를 증명하려고 하는 편이다.'},
  {id:'tb_3_6_2',type:6,q:'압박이 커질수록, 나는 위험 요소부터 확인하고 대비책을 세워서 불확실함을 줄이려고 하는 편이다.'}
];
const tb56 = [
  {id:'tb_5_6_1',format:'ab',leftType:5,rightType:6,q:'요구와 변수가 한꺼번에 몰릴 때, 내 반응은 어느 쪽에 더 가까운가?',a:'일단 사람과 자극에서 한발 물러나서, 혼자 정리할 시간부터 확보해야 한다.',b:'빠진 정보나 위험 신호가 없는지 먼저 확인해야 마음이 놓인다.'},
  {id:'tb_5_6_2',format:'ab',leftType:5,rightType:6,q:'둘 중 내게 더 견디기 어려운 상황은 어느 쪽에 가까운가?',a:'계속 반응하고 연결되느라 내 공간과 에너지가 바닥나는 것',b:'확인이 덜 된 채 움직였다가 나중에 문제가 터지는 것'}
];
const tb58 = [
  {id:'tb_5_8_1',format:'ab',leftType:5,rightType:8,q:'타인의 개입을 차단하고 철저히 독립적으로 행동하려는 가장 깊은 이유는?',a:'내 시간과 에너지가 쓸데없는 곳에 소모되는 것을 막고, 외부의 요구로부터 나만의 안전한 공간을 지켜내야 직성이 풀리기 때문이다.',b:'남들에게 내 결정권과 주도권을 넘겨주는 것이 싫고, 누군가의 통제나 지시 아래 놓이는 상황 자체를 참을 수 없기 때문이다.'},
  {id:'tb_5_8_2',format:'ab',leftType:5,rightType:8,q:'갈등이나 화가 나는 상황에서, 내 속을 더 뒤집어 놓는 핵심 촉발점은?',a:'구조가 엉망이거나 사람들이 멍청한 실수를 해서, 굳이 안 써도 될 내 에너지가 낭비되고 얽혀 들어가야 할 때 가장 화가 난다.',b:'누군가 나를 만만하게 보거나 힘의 불균형을 이용해 내 영역을 침범하고 통제하려 들 때 가장 화가 난다.'}
];
const tb59 = [
  {id:'tb_5_9_1',format:'ab',leftType:5,rightType:9,q:'사람이나 상황에서 물러나고 싶어질 때, 내 반응은 어느 쪽에 더 가까운가?',a:'내 에너지와 혼자 생각할 여유를 더 뺏기기 전에 거리를 두고 싶어진다.',b:'이 분위기가 더 불편해지기 전에 조용히 빠져 긴장을 낮추고 싶어진다.'},
  {id:'tb_5_9_2',format:'ab',leftType:5,rightType:9,q:'둘 중 내게 더 견디기 어려운 상태는 어느 쪽에 가까운가?',a:'사람과 요구가 계속 들어와 내 공간과 집중이 침범되는 상태',b:'관계 안의 불편한 기류와 긴장이 계속 이어지는 상태'},
  {id:'tb_5_9_3',format:'ab',leftType:5,rightType:9,q:'거리를 두고 싶어질 때, 내 머릿속에 더 먼저 도는 말은 어느 쪽에 가까운가?',a:'이대로 두면 너무 많이 들어온다. 조금 떨어져 정리할 공간이 필요하다.',b:'이대로 두면 분위기가 더 무거워진다. 조용히 지나가게 두는 게 낫다.'}
];
const tb31 = [
  {id:'tb_3_1_1',type:3,q:'목표 달성이 중요할수록, 나는 결과를 내기 위해 기존 방식이나 절차를 현실에 맞게 조정할 수 있다고 느끼는 편이다.'},
  {id:'tb_3_1_2',type:1,q:'목표 달성이 중요할수록, 나는 과정의 기준과 원칙이 지켜져야 결과도 제대로 된 것이라고 느끼는 편이다.'}
];
const tb35 = [
  {id:'tb_3_5_1',format:'ab',leftType:3,rightType:5,q:'누군가에게 내 능력을 증명해야 하는 압박 상황에서, 내가 더 두려워하는 최악의 시나리오는?',a:'내가 들인 노력에 비해 결과가 초라해서, 사람들에게 가치 없거나 실패한 사람으로 평가받고 무대에서 밀려나는 것',b:'내가 이 분야에 대해 사실은 깊이가 없고 무지하다는 사실이 들통나서, 지적으로 무시당하고 부적격자로 판명되는 것'},
  {id:'tb_3_5_2',format:'ab',leftType:3,rightType:5,q:'내가 특정 분야에서 지식, 자격증, 혹은 확실한 성과를 악착같이 채우려는 무의식적 동력은?',a:'그것들이 나를 남들보다 돋보이고 성공한 사람으로 만들어 주어, 타인의 찬사와 인정을 확실하게 가져다주기 때문이다.',b:'세상이 요구하는 것에 비해 내가 충분히 준비되지 않았다는 불안이 커서, 확실한 전문성이 있어야 나를 지키면서 세상과 연결될 수 있다고 느끼기 때문이다.'}
];
const tb37 = [
  {id:'tb_3_7_1',format:'ab',leftType:3,rightType:7,q:'내가 타인에게 유용하고 싹싹한 사람으로 인정받으려 노력할 때, 그 진짜 목적에 더 가까운 것은?',a:'나라는 사람의 가치 자체가 내가 얼마나 성과를 내고 유용한가에 달려 있다고 느끼기 때문에, 쓸모를 증명해야만 내가 가치 있는 존재로 느껴지기 때문이다.',b:'내가 유용한 사람이 되어야 사람들이 나를 좋아하고, 그래야 내가 위기에 처했을 때 도움을 받을 수 있는 든든한 생존 네트워크와 기회가 유지되기 때문이다.'},
  {id:'tb_3_7_2',format:'ab',leftType:3,rightType:7,q:'내가 속한 곳에서 성과를 내지 못하거나 주목받지 못하게 되었을 때, 나의 자동 반응은?',a:'나의 정체성이 무너진 것 같은 깊은 수치심과 공허함을 느낀다. 어떻게든 성과를 회복해 다시 성공한 사람의 위치로 돌아가려고 안간힘을 쓴다.',b:'이곳이 안 되면 나를 반겨줄 다른 재미있는 곳이나 기회를 빠르게 찾아 이동한다. 무거운 실패감에 빠져 있기보다 다른 가능성으로 시선을 돌린다.'}
];
const tb38 = [
  {id:'tb_3_8_1',format:'ab',leftType:3,rightType:8,q:'내가 목표를 강하게 밀어붙일 때, 더 핵심에 가까운 이유는 어느 쪽인가?',a:'결과를 통해 내 유능함과 가치를 분명히 보여 주고 싶어서',b:'누구에게도 밀리지 않고 내 영향력과 주도권을 분명히 하고 싶어서'},
  {id:'tb_3_8_2',format:'ab',leftType:3,rightType:8,q:'둘 중 내게 더 견디기 어려운 상태는 어느 쪽에 가까운가?',a:'성과를 못 내서 존재감이 약해지고 무능해 보이는 상태',b:'내 의사와 상관없이 누군가에게 주도권을 빼앗기고 밀리는 상태'},
  {id:'tb_3_8_3',format:'ab',leftType:3,rightType:8,q:'일이 뜻대로 안 풀릴 때, 더 먼저 찔리는 쪽은 어느 쪽에 가까운가?',a:'내가 충분히 해내지 못해 기대만큼 인정받지 못할 것 같은 느낌',b:'내가 흐름을 장악하지 못하고 남에게 휘둘리고 있다는 느낌'}
];
const tb45 = [
  {id:'tb_4_5_1',format:'ab',leftType:4,rightType:5,q:'혼자 있을 때, 내 에너지가 더 자연스럽게 향하는 쪽은 어느 쪽에 가까운가?',a:'내 감정과 결핍이 무엇을 말하는지 오래 붙들고 느껴 보는 쪽',b:'관심 있는 주제를 체계적으로 정리하고 파고드는 쪽'},
  {id:'tb_4_5_2',format:'ab',leftType:4,rightType:5,q:'힘들거나 공허할 때, 더 자주 먼저 가는 쪽은 어느 쪽에 가까운가?',a:'그 감정을 더 깊이 느끼면서, 왜 이런 마음이 드는지 계속 파고든다',b:'감정에 바로 빠지기보다, 일단 한발 떨어져서 머리로 정리하려 한다'},
  {id:'tb_4_5_3',format:'ab',leftType:4,rightType:5,q:'둘 중 내게 더 견디기 어려운 상태는 어느 쪽에 가까운가?',a:'감정이 밋밋해지고, 내가 누구인지 흐릿해지는 상태',b:'사람과 요구가 너무 많이 들어와 내 공간과 생각이 침범되는 상태'}
];
const tb46 = [
  {id:'tb_4_6_1',format:'ab',leftType:4,rightType:6,q:'마음이 불안정해질 때, 내 생각이 더 먼저 향하는 쪽은 어느 쪽에 가까운가?',a:'나는 왜 이렇게 부족하고, 남들처럼 자연스럽지 못할까',b:'지금 뭔가 놓치고 있는 게 있지 않은가, 앞으로 문제가 생기지 않을까'},
  {id:'tb_4_6_2',format:'ab',leftType:4,rightType:6,q:'둘 중 내게 더 견디기 어려운 상태는 어느 쪽에 가까운가?',a:'무엇을 해도 채워지지 않고, 내가 누구인지 흐릿해지는 상태',b:'믿고 있던 것이 흔들리고, 무엇을 믿어야 할지 확신이 서지 않는 상태'},
  {id:'tb_4_6_3',format:'ab',leftType:4,rightType:6,q:'크게 흔들릴 때, 내가 먼저 의지하게 되는 쪽은 어느 쪽에 가까운가?',a:'지금 내 감정이 무엇을 말하는지 더 깊이 느껴 보려는 쪽',b:'믿을 만한 기준, 설명, 확인 가능한 근거를 찾으려는 쪽'}
];
const tb68 = [
  {id:'tb_6_8_1',format:'ab',leftType:6,rightType:8,q:'누군가에게 강하게 맞서거나 들이받을 때, 내면의 진짜 목적은 어느 쪽에 가까운가?',a:'이 사람이 정말 믿을 만한 사람인지, 숨겨진 의도가 없는지 찔러보고 확인하려는 마음이 크다.',b:'누가 힘을 쥐고 있는지 명확히 하고, 내 영역을 함부로 건드리지 못하게 경고하려는 마음이 크다.'},
  {id:'tb_6_8_2',format:'ab',leftType:6,rightType:8,q:'갈등 상황에서 강하게 한바탕 쏟아내고 났을 때, 내게 더 자주 일어나는 패턴은 어느 쪽인가?',a:'내가 너무 심했나, 이 일로 나중에 문제가 생기거나 보복이 오진 않을까 하고 혼자 상황을 다시 점검하곤 한다.',b:'이제 누가 위인지 상황이 확실히 정리됐다고 느끼며, 별다른 뒤끝이나 걱정 없이 훌훌 털어낸다.'},
  {id:'tb_6_8_3',format:'ab',leftType:6,rightType:8,q:'내 안에서 가장 날 선 반응이 튀어나오게 만드는 상황은 어느 쪽인가?',a:'상황이 어떻게 돌아갈지 예측이 안 되고, 아무도 확실한 답이나 책임을 주지 않을 때',b:'누군가 나를 자기 맘대로 좌지우지하려 들거나, 얕보고 통제하려 들 때'}
];
const tb69 = [
  {id:'tb_6_9_1',format:'ab',leftType:6,rightType:9,q:'결정을 내려야 할 때, 내 반응은 어느 쪽에 더 가까운가?',a:'빠진 위험이나 놓친 변수가 없는지 더 확인하고 싶어진다.',b:'이 결정이 불편한 긴장이나 충돌을 만들 것 같아 조금 더 미루고 싶어진다.'},
  {id:'tb_6_9_2',format:'ab',leftType:6,rightType:9,q:'둘 중 내게 더 견디기 어려운 상태는 어느 쪽에 가까운가?',a:'충분히 확인하지 못한 채 결정해서 나중에 문제가 생기는 것',b:'결정을 분명히 내리면서 분위기가 거칠어지고 관계가 불편해지는 것'},
  {id:'tb_6_9_3',format:'ab',leftType:6,rightType:9,q:'결정을 앞두고 멈칫할 때, 내 머릿속에 더 먼저 도는 말은 어느 쪽에 가까운가?',a:'뭔가 놓친 게 있을 수 있다. 조금 더 확인해야 한다.',b:'이걸 분명히 하면 괜히 일이 커질 수 있다. 조금 더 부드럽게 넘기고 싶다.'}
];
const tb3sx = [{id:'tb_3_sx_1',type:3,q:'내가 목표를 끝까지 밀어붙일 때 더 중요한 것은, 분명한 결과를 통해 내 가치와 유능함을 확인하는 일이다.'},{id:'tb_3_sx_2',q:'내가 한 대상에 깊이 몰입할 때 더 중요한 것은, 그 과정에서 느껴지는 강한 몰입감과 끌림 자체다.'}];
const tb71 = [
  {id:'tb_7_1_1',type:7,q:'상황이 막히고 답답할 때, 나는 다른 가능성이나 새로운 방향으로 전환하면서 숨통을 틔우려는 편이다.'},
  {id:'tb_7_1_2',type:1,q:'상황이 막히고 답답할 때, 나는 무엇이 어긋났는지 바로잡아 기준을 회복해야 마음이 놓이는 편이다.'}
];
const tb78 = [
  {id:'tb_7_8_1',type:7,q:'내 주장을 강하게 내세울 때, 더 큰 이유는 막힌 흐름을 깨고 선택지를 넓히고 싶어서인 편이다.'},
  {id:'tb_7_8_2',type:8,q:'내 주장을 강하게 내세울 때, 더 큰 이유는 통제당하거나 침범당한 흐름에서 주도권을 되찾고 싶어서인 편이다.'}
];
const tb89 = [
  {id:'tb_8_9_1',format:'ab',leftType:8,rightType:9,q:'누군가 내게 이래라저래라 지시하거나 통제하려 할 때, 내 반응은 어느 쪽에 가까운가?',a:'"네가 뭔데?" 하는 마음이 들며 즉시 맞서거나 강하게 선을 긋는다.',b:'겉으로는 알았다고 하거나 침묵하지만, 속으로는 한 귀로 흘리며 내 페이스대로 간다.'},
  {id:'tb_8_9_2',format:'ab',leftType:8,rightType:9,q:'피할 수 없는 갈등과 마주했을 때, 내 몸의 에너지는 어느 쪽에 가까운가?',a:'오히려 에너지가 올라오고 정신이 맑아지며, 끝장을 보거나 승부를 내고 싶어진다.',b:'에너지가 급격히 빠지고 피곤해지며, 어떻게든 이 상황을 빨리 덮고 지나가고 싶어진다.'},
  {id:'tb_8_9_3',format:'ab',leftType:8,rightType:9,q:'둘 중 내게 더 견디기 어려운 상태는 어느 쪽에 가까운가?',a:'내가 만만하게 보여서 남들에게 밀리고 주도권을 뺏기는 상태',b:'시끄러운 마찰과 긴장이 계속 이어져서 내 마음이 평온할 수 없는 상태'}
];
const tb7wing = [{id:'tb_7w_1',wing:6,q:'새로운 일을 시작할 때도, 주변 반응과 안정성을 어느 정도 확인해야 마음이 놓이는 편이다.'},{id:'tb_7w_2',wing:8,q:'새로운 일을 시작할 때, 제약이 보여도 일단 밀어붙이며 진행하면서 길을 만드는 편이다.'}];

const counterTypeQuestions = {
  1: {
    id: 'ct_1_sx',
    type: 1,
    inst: 'sx',
    counterType: true,
    label: 'SX 1',
    q: '기준에 어긋난 상황을 보면 감정을 눌러 넘기기보다, 관계가 거칠어지더라도 바로 지적하고 고쳐야 직성이 풀리는 편이다.',
    qEn: 'When a situation violates a standard, I am more likely to point it out and correct it even if the relationship becomes rough, rather than simply suppressing my reaction.'
  },
  2: {
    id: 'ct_2_sp',
    type: 2,
    inst: 'sp',
    counterType: true,
    label: 'SP 2',
    q: '가까운 관계에서는 나도 아이처럼 예쁨받고 챙김받고 싶은 마음이 있고, 상대가 나를 필요로 하고 아껴 주는 신호에 민감한 편이다.',
    qEn: 'In close relationships, I want to feel especially lovable and worth caring for, and I am sensitive to signs that the other person needs me and cares for me.'
  },
  3: {
    id: 'ct_3_sp',
    type: 3,
    inst: 'sp',
    counterType: true,
    label: 'SP 3',
    q: '성과를 내고 싶어도 그것을 크게 드러내기보다, 꾸준하고 성실한 사람으로 평가받는 쪽을 더 안전하게 느끼는 편이다.',
    qEn: 'Even when I want to achieve, I feel safer being seen as steady and diligent than making my accomplishments highly visible.'
  },
  4: {
    id: 'ct_4_sp',
    type: 4,
    inst: 'sp',
    counterType: true,
    label: 'SP 4',
    q: '힘든 감정을 드러내 도움을 구하기보다, 혼자 견디다가 지친 뒤에야 상태를 알아차리는 편이다.',
    qEn: 'Rather than showing difficult feelings and asking for help, I tend to endure alone and only notice my state after I have become worn out.'
  },
  5: {
    id: 'ct_5_sx',
    type: 5,
    inst: 'sx',
    counterType: true,
    label: 'SX 5',
    q: '평소에는 쉽게 거리를 좁히지 않지만, 아주 드물게 강하게 신뢰가 생긴 대상에게는 예상보다 훨씬 깊이 몰입하는 편이다.',
    qEn: 'I usually do not close distance easily, but on rare occasions when strong trust forms, I can become much more deeply absorbed than expected.'
  },
  6: {
    id: 'ct_6_sx',
    type: 6,
    inst: 'sx',
    counterType: true,
    label: 'SX 6',
    q: '위협을 느끼면 숨기보다, 만만하게 보이지 않기 위해 평소보다 더 강하게 나가거나 먼저 맞서는 편이다.',
    qEn: 'When I feel threatened, I am more likely to come on stronger or confront first so I do not look easy to push around, rather than hiding.'
  },
  7: {
    id: 'ct_7_so',
    type: 7,
    inst: 'so',
    counterType: true,
    label: 'SO 7',
    q: '내가 즐거운 것을 먼저 챙기면 이기적으로 보일까 신경 쓰여, 내 욕구보다 사람들 일이나 더 큰 명분을 우선하는 편이다.',
    qEn: 'I worry that prioritizing my own enjoyment may look selfish, so I tend to put other people’s needs or a larger cause before my own desires.'
  },
  8: {
    id: 'ct_8_so',
    type: 8,
    inst: 'so',
    counterType: true,
    label: 'SO 8',
    q: '내 힘을 굳이 앞세우지는 않아도, 주변 사람이 부당한 대우를 받으면 평소보다 훨씬 강하게 개입하는 편이다.',
    qEn: 'Even if I do not usually put my strength forward, when someone around me is treated unfairly I tend to intervene much more strongly than usual.'
  },
  9: {
    id: 'ct_9_so',
    type: 9,
    inst: 'so',
    counterType: true,
    label: 'SO 9',
    q: '나 자신을 위해 에너지를 쓰기는 어렵지만, 내가 속한 그룹이나 사람들을 위해서라면 내 한계를 넘어서까지 움직이는 편이다.',
    qEn: 'It is hard for me to spend energy for myself, but for my group or people I may keep moving beyond my own limits.'
  }
};

const phase4TypeSets = {
  1: {
    subtype: {
      id: 'p4_1_subtype',
      format: 'abc',
      q: '완벽함에 대한 나의 기준과 잣대는 주로 어디로 향하며, 분노는 어떻게 표현되는가?',
      qEn: 'Where do my standards of perfection mostly point, and how is my anger expressed?',
      options: [
        {
          value: 'sp',
          label: '자기보존 1번 - 걱정/불안',
          labelEn: 'Self-preservation 1 - Worry / anxiety',
          text: "나 스스로가 실수하거나 책임을 다하지 못할까 봐 끊임없이 걱정하며, 나 자신을 향해 가장 엄격하고 가혹하게 기준을 들이댄다. 남들에게 화를 내기보다 '내가 더 잘해야지' 하고 삭인다.",
          textEn: 'I constantly worry that I may make a mistake or fail my responsibilities, and I apply the harshest standards to myself. Instead of getting angry at others, I swallow it and tell myself I must do better.'
        },
        {
          value: 'so',
          label: '사회적 1번 - 완고함/비적응',
          labelEn: 'Social 1 - Rigidity / non-adaptation',
          text: "내가 가진 원칙과 방법이 가장 옳다는 확신이 강하다. 틀린 방식을 따르는 사람이나 시스템을 보면 무의식적으로 '내가 너희에게 올바른 길을 가르쳐 주겠다'는 우월감과 답답함을 동시에 느낀다.",
          textEn: 'I am strongly convinced that my principles and methods are right. When I see people or systems following a wrong way, I feel both frustration and a sense that I should teach them the right path.'
        },
        {
          value: 'sx',
          label: '1:1/성적 1번 - 열정/개혁',
          labelEn: 'One-to-one 1 - Zeal / reform',
          text: '내 주변의 사람이나 환경이 기준에 어긋나는 것을 절대 참지 못한다. 잘못된 것을 보면 분노를 숨기지 않고 거침없이 지적하며, 내 방식대로 상대를 강하게 뜯어고치려(개혁하려) 한다.',
          textEn: 'I cannot tolerate people or environments around me falling below the standard. When I see something wrong, I do not hide my anger; I point it out directly and push strongly to reform it my way.'
        }
      ]
    },
    wing: {
      id: 'p4_1_wing',
      format: 'ab',
      leftWing: 9,
      rightWing: 2,
      q: '원칙을 지키고 바르게 행동하려 할 때, 나의 전반적인 태도와 분위기는?',
      qEn: 'When I try to keep principles and act rightly, which overall attitude fits me more?',
      a: '웬만하면 감정을 드러내지 않고 객관적이고 차분한 태도를 유지하려 한다. 혼자서 묵묵히 원칙을 지키며, 시끄러운 갈등보다는 조용히 정렬된 상태를 선호한다.',
      b: '사람들에게 적극적으로 다가가서 조언하고 가르치는 것을 좋아한다. 차갑기보다는 따뜻하고 인간적인 모습을 보이려 애쓰며, 세상과 타인에게 실제적인 도움을 주고 싶다.',
      aEn: 'I try to stay objective and calm without showing much emotion. I quietly keep principles on my own and prefer a quietly aligned state over noisy conflict.',
      bEn: 'I like actively approaching people to advise and teach. I try to seem warm and human rather than cold, and I want to give practical help to people and the world.'
    }
  },
  2: {
    subtype: {
      id: 'p4_2_subtype',
      format: 'abc',
      q: '사람들에게 사랑받고 필요한 존재가 되기 위해, 내가 무의식적으로 사용하는 전략은?',
      qEn: 'What unconscious strategy do I use to be loved and needed by people?',
      options: [
        {
          value: 'sp',
          label: '자기보존 2번 - 특권',
          labelEn: 'Self-preservation 2 - Privilege',
          text: '어리고 순수한 아이처럼 귀엽고 사랑스러운 모습을 은연중에 어필한다. 내가 남들을 챙기는 만큼, 남들도 나를 예뻐해 주고 내 필요를 알아서 채워주며 특별 대우를 해주길 바란다.',
          textEn: 'I subtly present myself as sweet, innocent, or lovable. As much as I care for others, I want them to cherish me, notice my needs, and give me special treatment.'
        },
        {
          value: 'so',
          label: '사회적 2번 - 야망',
          labelEn: 'Social 2 - Ambition',
          text: "모임이나 조직의 중심에서 유능하고 영향력 있는 사람이 되려 한다. 중요한 사람들과 인맥을 맺고 '우리 그룹에 없어서는 안 될 핵심적인 조력자'로 인정받을 때 가장 만족한다.",
          textEn: 'I try to become competent and influential at the center of a group or organization. I feel most satisfied when I connect with important people and am recognized as an indispensable helper.'
        },
        {
          value: 'sx',
          label: '1:1/성적 2번 - 유혹/공격성',
          labelEn: 'One-to-one 2 - Seduction / aggression',
          text: '특정 대상(또는 소수)과 깊고 치명적인 관계를 맺고 싶어 한다. 상대가 나를 원하게 만들기 위해 매력을 적극적으로 발산하며, 상대가 내 마음을 알아주지 않으면 강하게 밀어붙이거나 통제하려 든다.',
          textEn: 'I want a deep, irresistible bond with a particular person or small circle. I actively use charm so the other person wants me, and if they do not recognize my heart, I may push or control strongly.'
        }
      ]
    },
    wing: {
      id: 'p4_2_wing',
      format: 'ab',
      leftWing: 1,
      rightWing: 3,
      q: '사람들과 관계를 맺고 도움을 줄 때, 내 방식과 태도는 어느 쪽에 더 가까운가?',
      qEn: 'When I relate to people and help them, which style is closer to mine?',
      a: "감정적으로 들뜨기보다 차분하고 객관적인 편이다. 무조건 잘해주기보다 '무엇이 상대에게 정말 올바른 도움인가'를 생각하며 책임감 있고 절도 있게 챙겨준다.",
      b: '밝고 사교적이며 에너지가 넘친다. 사람들에게 매력적이고 능력 있는 사람으로 보이길 원하며, 분위기를 띄우고 인간관계를 넓게 확장하는 데 능숙하다.',
      aEn: 'I am more calm and objective than emotionally effusive. Instead of simply doing everything for someone, I think about what truly helps them rightly and care for them responsibly.',
      bEn: 'I am bright, sociable, and energetic. I want to seem attractive and capable, and I am good at lifting the mood and expanding relationships.'
    }
  },
  3: {
    subtype: {
      id: 'p4_3_subtype',
      format: 'abc',
      q: '나의 가치와 성과를 증명하기 위해, 내가 가장 신경 쓰는 이미지는 무엇인가?',
      qEn: 'To prove my value and achievement, which image do I care about most?',
      options: [
        {
          value: 'sp',
          label: '자기보존 3번 - 안정감/좋은 사람',
          labelEn: 'Self-preservation 3 - Security / good person',
          text: "성공하고 싶지만 잘난 척하는 건 싫다. 나는 '믿을 수 있고 성실하며 자기 일을 묵묵히 잘해내는 좋은 사람'이라는 평가를 받기 위해, 내 성과를 내세우기보단 안정적인 결과를 내는 데 집중한다.",
          textEn: 'I want success, but I dislike showing off. I focus on steady results rather than advertising my achievements so I am seen as reliable, sincere, and quietly competent.'
        },
        {
          value: 'so',
          label: '사회적 3번 - 위신/지위',
          labelEn: 'Social 3 - Prestige / status',
          text: "사람들의 시선과 무대 중앙을 즐긴다. 사회가 인정하는 스펙, 명성, 지위를 얻는 것이 중요하며, 내가 속한 그룹에서 '가장 뛰어나고 화려한 성공의 모델'로 돋보이고 싶다.",
          textEn: 'I enjoy attention and the center stage. Recognized credentials, reputation, and status matter to me, and I want to stand out as a brilliant model of success in my group.'
        },
        {
          value: 'sx',
          label: '1:1/성적 3번 - 매력/가면',
          labelEn: 'One-to-one 3 - Attraction / image',
          text: '특정 대상이나 주변 사람들에게 가장 매력적이고 이상적인 모습으로 비치길 원한다. 상대가 원하는 완벽한 이미지(외모, 매너, 유능함 등)로 나를 자유자재로 바꾸어 상대의 마음을 얻어낸다.',
          textEn: 'I want to appear as the most attractive and ideal version of myself to a particular person or those around me. I can adapt my appearance, manners, and competence to win the other person.'
        }
      ]
    },
    wing: {
      id: 'p4_3_wing',
      format: 'ab',
      leftWing: 2,
      rightWing: 4,
      q: '목표를 향해 달려갈 때, 사람들과 맺는 관계의 방식은 어느 쪽인가?',
      qEn: 'When I move toward a goal, which relational style fits me more?',
      a: "사람들의 호감을 얻고 분위기를 맞추는 데 에너지를 많이 쓴다. 성과도 중요하지만, 주변 사람들과 친밀하게 지내며 '인기 있고 매력적인 스타'로 남고 싶다.",
      b: "인간관계보다는 업무의 완성도와 내 전문성에 훨씬 더 집중한다. 사람 비위를 맞추기보다는 다소 차갑게 보이더라도 '내 분야에서 독보적이고 깊이 있는 실력자'로 인정받고 싶다.",
      aEn: 'I spend a lot of energy gaining people’s goodwill and matching the atmosphere. Results matter, but I also want to remain a popular, attractive star.',
      bEn: 'I focus much more on work quality and expertise than on relationships. Even if I seem a bit cold, I want to be recognized as an irreplaceable expert with depth.'
    }
  },
  4: {
    subtype: {
      id: 'p4_4_subtype',
      format: 'abc',
      q: '나에게 없는 것을 갈망하며 결핍과 슬픔을 느낄 때, 내가 그 고통을 처리하는 방식은?',
      qEn: 'When I long for what I do not have and feel lack or sadness, how do I handle that pain?',
      options: [
        {
          value: 'sp',
          label: '자기보존 4번 - 인내/무모함',
          labelEn: 'Self-preservation 4 - Tenacity / recklessness',
          text: '슬프고 고통스럽더라도 그것을 밖으로 징징대며 티 내는 것은 굴욕적이라고 생각한다. 남몰래 아파하면서도 겉으로는 불평 없이 웃으며, 그 고통을 묵묵히 혼자 견뎌내는 것에 자부심을 느낀다.',
          textEn: 'Even when I am sad or in pain, I find it humiliating to complain or show it. I hurt privately, smile without complaint on the outside, and take pride in quietly enduring the pain alone.'
        },
        {
          value: 'so',
          label: '사회적 4번 - 수치심',
          labelEn: 'Social 4 - Shame',
          text: '나만 빼고 남들은 다 행복하고 온전한 것 같아 비교당하는 느낌과 부끄러움을 자주 느낀다. 내 슬픔과 결핍을 솔직하게 드러냄으로써 누군가가 나를 이해하고 보듬어 주기를 은연중에 바란다.',
          textEn: 'It often feels as if everyone else is happy and whole except me, which brings comparison and shame. By showing my sadness and lack honestly, I quietly hope someone will understand and hold me.'
        },
        {
          value: 'sx',
          label: '1:1/성적 4번 - 경쟁/오만',
          labelEn: 'One-to-one 4 - Competition / arrogance',
          text: '내게 없는 것을 가진 사람들을 보면 슬픔보다 질투와 분노가 치밀어 오른다. 내가 최고가 되거나 남들을 깎아내림으로써 내 우월성을 증명하고 싶으며, 원할 때는 사람들에게 강렬하고 치명적으로 다가간다.',
          textEn: 'When I see people who have what I lack, jealousy and anger rise more than sadness. I want to prove my superiority by becoming the best or cutting others down, and when I want to, I can approach people intensely.'
        }
      ]
    },
    wing: {
      id: 'p4_4_wing',
      format: 'ab',
      leftWing: 3,
      rightWing: 5,
      q: '내 감정과 정체성을 세상에 드러낼 때, 나의 분위기와 태도는?',
      qEn: 'When I reveal my emotions and identity to the world, which mood and attitude fit me more?',
      a: '나의 독특함과 감성을 세련되고 매력적인 방식으로 표현하고 싶다. 어느 정도는 사람들에게 인정받고 돋보이기를 원하며, 외모나 성과 등 현실적인 부분도 꽤 신경 쓰는 편이다.',
      b: '사람들의 시선이나 사회적 인정보다는 나만의 깊은 내면세계를 탐구하는 것이 훨씬 중요하다. 타인과 거리를 두고 혼자만의 동굴에 틀어박혀 지적이고 철학적인 고독에 빠지기를 즐긴다.',
      aEn: 'I want to express my uniqueness and sensitivity in a refined, attractive way. I do want some recognition and visibility, and I care about practical things such as appearance or achievement.',
      bEn: 'Exploring my own deep inner world matters much more than social recognition. I enjoy withdrawing from others into my own cave of intellectual and philosophical solitude.'
    }
  },
  5: {
    subtype: {
      id: 'p4_5_subtype',
      format: 'abc',
      q: '세상의 침범으로부터 내 에너지와 공간을 지키기 위해, 내가 주로 사용하는 생존 전략은?',
      qEn: 'What survival strategy do I use to protect my energy and space from the world’s intrusions?',
      options: [
        {
          value: 'sp',
          label: '자기보존 5번 - 은신처',
          labelEn: 'Self-preservation 5 - Castle / refuge',
          text: '철저하게 나만의 물리적, 심리적 경계를 치고 숨는다. 세상을 관찰만 할 뿐 깊이 엮이려 하지 않으며, 누군가 내 공간에 들어오거나 내 시간과 에너지를 요구하는 것을 극도로 경계한다.',
          textEn: 'I create strict physical and psychological boundaries and hide within them. I observe the world without getting deeply entangled, and I am extremely wary when someone enters my space or asks for my time and energy.'
        },
        {
          value: 'so',
          label: '사회적 5번 - 토템/전문가',
          labelEn: 'Social 5 - Totem / expert',
          text: "단순히 숨어있는 것이 아니라, 내가 가장 가치 있다고 여기는 '전문 지식'이나 '특별한 그룹'에 소속되어 거기서 의미를 찾는다. 대중들과는 거리를 두지만, 소수의 전문가나 지식인 그룹 안에서는 열정적으로 교류한다.",
          textEn: 'I do not simply hide; I seek meaning through specialized knowledge or a special group I consider valuable. I keep distance from the general crowd, but engage passionately with a small circle of experts or thinkers.'
        },
        {
          value: 'sx',
          label: '1:1/성적 5번 - 신뢰/로맨스',
          labelEn: 'One-to-one 5 - Trust / romance',
          text: "평소에는 가장 차갑고 거리를 두지만, 내 모든 것을 보여줘도 될 만큼 '절대적으로 신뢰할 수 있는 단 한 사람(또는 이상)'을 끊임없이 찾는다. 그 대상을 만나면 내 안의 폭발적인 감정과 비밀을 남김없이 쏟아낸다.",
          textEn: 'I may seem cold and distant most of the time, but I keep searching for the one person or ideal I can trust absolutely with everything. When I find that target, I pour out my intense emotions and secrets.'
        }
      ]
    },
    wing: {
      id: 'p4_5_wing',
      format: 'ab',
      leftWing: 4,
      rightWing: 6,
      q: '머릿속으로 정보를 분석하고 거리를 둘 때, 내 일상적인 모습은 어느 쪽인가?',
      qEn: 'When I analyze information and keep distance, which everyday style fits me more?',
      a: '단순한 논리나 과학적 사실을 넘어, 나만의 독특한 세계관이나 미학, 철학적인 상상에 빠지기를 좋아한다. 다소 예민하고 감수성이 있으며 현실과 동떨어진 기인처럼 보일 때가 있다.',
      b: '상상력보다는 실용적이고 체계적인 정보 수집에 더 관심이 많다. 의심이 많고 조심스러우며, 불안을 잠재우기 위해 객관적인 데이터를 분석하고 시스템의 원리를 파악하려 한다.',
      aEn: 'Beyond simple logic or scientific facts, I like immersing myself in my own unique worldview, aesthetics, or philosophical imagination. I can seem sensitive, unconventional, or detached from ordinary reality.',
      bEn: 'I am more interested in practical, systematic information-gathering than imagination. I am cautious and questioning, and I analyze objective data and systems to calm uncertainty.'
    }
  },
  6: {
    subtype: {
      id: 'p4_6_subtype',
      format: 'abc',
      q: '세상의 불확실성과 위협을 느낄 때, 불안을 해소하고 안전해지기 위해 취하는 방식은?',
      qEn: 'When I feel uncertainty and threat, how do I reduce anxiety and become safe?',
      options: [
        {
          value: 'sp',
          label: '자기보존 6번 - 따뜻함',
          labelEn: 'Self-preservation 6 - Warmth',
          text: '사람들에게 친절하고 무해하며 다정한 사람으로 보인다. 적을 만들지 않고 나를 지켜줄 수 있는 강한 보호자나 든든한 내 편을 많이 만들어 안전망을 구축하려 한다.',
          textEn: 'I appear kind, harmless, and warm to people. I try not to make enemies and build a safety net by creating strong protectors or dependable allies who can look out for me.'
        },
        {
          value: 'so',
          label: '사회적 6번 - 의무',
          labelEn: 'Social 6 - Duty',
          text: '믿고 따를 수 있는 명확한 규칙, 매뉴얼, 권위자, 시스템을 찾는다. 모호한 것은 견디기 힘들며, 흑백이 분명한 이념이나 조직에 소속되어 그곳의 규정을 철저히 따르는 것으로 안심한다.',
          textEn: 'I look for clear rules, manuals, authorities, or systems I can trust and follow. Ambiguity is hard to tolerate, and I feel safer belonging to a clear ideology or organization and carefully following its rules.'
        },
        {
          value: 'sx',
          label: '1:1/성적 6번 - 힘/대항',
          labelEn: 'One-to-one 6 - Strength / counterphobia',
          text: "두려움과 위협을 느낄 때 웅크리기보다는 오히려 먼저 맹렬하게 들이받고 공격한다. '최고의 방어는 공격'이라고 생각하며, 상대를 도발하거나 나의 강인함을 과시하여 위험 요소를 제거하려 한다.",
          textEn: 'When I feel fear or threat, I do not shrink back; I strike first and confront fiercely. I think the best defense is offense, and I try to remove danger by provoking others or displaying strength.'
        }
      ]
    },
    wing: {
      id: 'p4_6_wing',
      format: 'ab',
      leftWing: 5,
      rightWing: 7,
      q: '안전망을 확인하고 불안에 대처할 때, 평소에 내가 주로 보이는 태도는?',
      qEn: 'When I check for safety and deal with anxiety, which ordinary attitude fits me more?',
      a: '사람들과 섞이기보다는 조금 떨어져서 독립적으로 상황을 분석하고 위험을 계산한다. 의심이 많아 정보를 끝까지 파고들며, 혼자서 세밀하게 예측하고 방비하는 편이다.',
      b: '불안해질수록 사람들과 대화하고 어울리면서 무거운 분위기를 환기하려 한다. 농담도 잘하고 사교적이며, 함께 어울리며 연대감을 다지는 것으로 긴장을 풀고 마음을 놓는다.',
      aEn: 'Rather than blending with people, I step back and independently analyze the situation and calculate risks. I question deeply, dig into information, and prepare carefully on my own.',
      bEn: 'The more anxious I become, the more I talk and connect with people to lighten the mood. I can be humorous and sociable, and I relax by building solidarity with others.'
    }
  },
  7: {
    subtype: {
      id: 'p4_7_subtype',
      format: 'abc',
      q: '일상의 지루함이나 내면의 결핍을 느낄 때, 내 에너지가 무의식적으로 쏠리는 방향은 어느 쪽인가?',
      qEn: 'When I feel daily boredom or inner lack, where does my energy unconsciously go?',
      options: [
        {
          value: 'sp',
          label: '자기보존 7번 - 실용적 네트워크',
          labelEn: 'Self-preservation 7 - Practical network',
          text: '나와 내 사람들에게 이익이 될 만한 실질적인 기회나 정보를 기가 막히게 찾아낸다. 현실적이고 유용한 네트워크를 만들며, 내 삶의 물질적·경험적 풍요를 확실하게 챙기는 데 에너지를 쓴다.',
          textEn: 'I quickly find practical opportunities or information that benefit me and my people. I build useful networks and spend energy securing material and experiential abundance in my life.'
        },
        {
          value: 'so',
          label: '사회적 7번 - 희생적 이상주의',
          labelEn: 'Social 7 - Sacrificial idealism',
          text: "나 혼자만 쾌락을 좇고 욕심을 부리는 것은 이기적이라는 무의식적인 죄책감이 있다. 그래서 내 욕구를 미루더라도 타인이나 대의를 위해 헌신하며, 책임감 있고 '좋은 사람'으로 남기 위해 에너지를 쓴다.",
          textEn: 'I carry an unconscious guilt that pursuing pleasure or desire just for myself is selfish. So even when I postpone my own desires, I spend energy serving others or a cause and staying responsible and good.'
        },
        {
          value: 'sx',
          label: '1:1/성적 7번 - 본질 갈망과 허무',
          labelEn: 'One-to-one 7 - Longing for essence and disillusionment',
          text: "단순한 재미보다는 사물의 깊은 '본질'과 완벽한 '이상'을 끊임없이 갈망한다. 내가 바라는 이상에 가닿을 수 없는 얄팍한 현실을 볼 때면 '모든 것이 헛되다'는 깊은 허무함과 환멸에 빠지며, 이를 벗어나기 위해 또 다른 강렬한 의미나 본질을 찾아 나선다.",
          textEn: 'More than simple fun, I constantly long for deep essence and a perfect ideal. When shallow reality cannot reach the ideal I want, I fall into emptiness or disillusionment and search for another intense meaning or essence.'
        }
      ]
    },
    wing: {
      id: 'p4_7_wing',
      format: 'ab',
      leftWing: 6,
      rightWing: 8,
      q: '내가 원하는 바를 추진하거나 장애물을 마주했을 때, 나의 전반적인 태도는?',
      qEn: 'When I pursue what I want or face obstacles, which overall attitude fits me more?',
      a: '사람들과 유쾌하게 어울리며 분위기를 부드럽게 만드는 것을 좋아한다. 내심 걱정이나 불안이 있어서, 독단적으로 밀어붙이기보다는 주변 사람들과 타협하고 확인을 거치며 함께 가려 한다.',
      b: '내가 꽂힌 것이 있으면 남의 눈치를 보지 않고 강한 추진력으로 과감하게 밀어붙인다. 내 앞길을 방해받는 것을 극도로 싫어하며, 원하는 것을 쟁취하기 위해 다소 직선적이고 거칠게 부딪히는 것도 감수한다.',
      aEn: 'I like cheerfully connecting with people and softening the mood. Because I have some inner worry or anxiety, I prefer to compromise, check with others, and move together rather than push alone.',
      bEn: 'When I am hooked on something, I push boldly with strong drive without worrying much about others’ reactions. I hate being blocked and will clash directly if needed to get what I want.'
    }
  },
  8: {
    subtype: {
      id: 'p4_8_subtype',
      format: 'abc',
      q: '나의 통제권과 힘을 확인하고, 내 영역을 지켜내는 방식은 어느 쪽에 가장 가까운가?',
      qEn: 'How do I confirm my control and strength and protect my territory?',
      options: [
        {
          value: 'sp',
          label: '자기보존 8번 - 생존/실속',
          labelEn: 'Self-preservation 8 - Survival / practical power',
          text: '불필요하게 시끄러운 싸움은 피하지만, 나만의 확고한 성(영역)을 구축하고 내가 필요한 자원과 만족을 끈질기게 챙긴다. 겉으로 크게 으르렁대지 않아도 속으로는 절대 남에게 호락호락하게 당하지 않는다.',
          textEn: 'I avoid unnecessary noisy fights, but I build my own solid territory and tenaciously secure the resources and satisfaction I need. Even if I do not roar loudly, inside I will never let others take advantage of me.'
        },
        {
          value: 'so',
          label: '사회적 8번 - 연대/보호',
          labelEn: 'Social 8 - Solidarity / protection',
          text: '나 개인의 힘을 과시하기보다는, 부당한 대우를 받는 내 사람(약자)을 보호하고 의리를 지키는 데 내 힘을 쓴다. 내가 이끄는 무리 안에서는 충성스럽고 다정하며, 불의를 보면 동료들과 연대해서 맹렬히 맞서 싸운다.',
          textEn: 'Rather than showing off personal power, I use my strength to protect my people or the vulnerable and keep loyalty. Inside my group I can be loyal and warm, and when I see injustice I fight fiercely in solidarity.'
        },
        {
          value: 'sx',
          label: '1:1/성적 8번 - 장악/도발',
          labelEn: 'One-to-one 8 - Possession / provocation',
          text: '공간의 중심에서 모든 상황과 주도권을 내가 쥐고 있어야 직성이 풀린다. 강렬한 에너지로 굽힘 없이 반항하거나 상대를 도발하며, 기선을 제압하여 상대방을 완전히 내 통제 아래 두려 한다.',
          textEn: 'I feel settled only when I hold the center of the room and the initiative. With intense energy, I resist, provoke, and seize the upper hand so the other person comes under my control.'
        }
      ]
    },
    wing: {
      id: 'p4_8_wing',
      format: 'ab',
      leftWing: 7,
      rightWing: 9,
      q: '내가 리더십을 발휘하거나 힘을 쓸 때, 남들이 느끼는 나의 에너지는 어느 쪽인가?',
      qEn: 'When I lead or use power, which energy do others feel from me?',
      a: '에너지가 밖으로 크게 뻗치며 행동이 빠르고 호탕하다. 규율이나 한계에 얽매이는 것을 비웃으며, 다소 거칠더라도 내가 원하는 크고 새로운 비전을 향해 거침없이 전진한다.',
      b: '평소에는 불필요한 에너지를 쓰지 않고 묵직하게 뒤에서 상황을 관망한다. 하지만 누군가 내 허락 없이 선을 넘거나 내 구역을 침범하면, 숨겨둔 엄청난 힘으로 단번에 상황을 짓눌러버린다.',
      aEn: 'My energy extends outward strongly, and I act quickly and boldly. I laugh at limits and rules, and even if I seem rough, I move straight toward the large new vision I want.',
      bEn: 'Usually I conserve energy and watch from behind with heavy steadiness. But if someone crosses a line or invades my territory without permission, I press the situation down with hidden force.'
    }
  },
  9: {
    subtype: {
      id: 'p4_9_subtype',
      format: 'abc',
      q: '골치 아픈 문제나 갈등을 마주했을 때, 내면의 평온을 지키기 위해 나는 어떻게 회피하는가?',
      qEn: 'When I face a troublesome problem or conflict, how do I avoid it to protect inner peace?',
      options: [
        {
          value: 'sp',
          label: '자기보존 9번 - 일상의 위안',
          labelEn: 'Self-preservation 9 - Everyday comfort',
          text: "맛있는 것을 먹거나, 멍하니 영상을 보거나, 잠을 자는 등 단순하고 반복적인 '소소한 즐거움'에 빠져든다. 신체를 편안하게 만드는 활동에 몰두함으로써 복잡한 현실을 잊고 감각을 마비시킨다.",
          textEn: 'I sink into simple repetitive comforts such as eating something good, zoning out with videos, or sleeping. By focusing on bodily comfort, I forget complicated reality and numb my senses.'
        },
        {
          value: 'so',
          label: '사회적 9번 - 과잉 참여',
          labelEn: 'Social 9 - Over-participation',
          text: '나를 위해 쉴 틈도 없이, 내가 속한 그룹이나 타인의 필요를 챙기느라 엄청나게 바쁘게 움직인다. 모임에 끊임없이 참여하고 헌신함으로써, 정작 직면해야 할 내 진짜 문제와 욕구는 무의식적으로 덮어버린다.',
          textEn: 'Instead of resting for myself, I stay extremely busy meeting the needs of my group or others. By constantly participating and serving, I unconsciously cover over my own real problems and desires.'
        },
        {
          value: 'sx',
          label: '1:1/성적 9번 - 완전한 융합',
          labelEn: 'One-to-one 9 - Complete merging',
          text: '내가 중요하게 생각하는 특정 타인(배우자, 연인, 멘토 등)과 나 자신을 완전히 합쳐버린다. 상대방의 의견, 취향, 목표를 마치 내 것인 양 받아들이며, 갈등을 피하기 위해 나 자신의 독립적인 목소리를 지워버린다.',
          textEn: 'I merge myself completely with a specific important person such as a spouse, partner, or mentor. I take their opinions, tastes, and goals as if they were mine and erase my independent voice to avoid conflict.'
        }
      ]
    },
    wing: {
      id: 'p4_9_wing',
      format: 'ab',
      leftWing: 8,
      rightWing: 1,
      q: '불편한 압박이 들어올 때, 나의 내면에서 일어나는 반응은 어느 쪽인가?',
      qEn: 'When uncomfortable pressure comes in, which inner response fits me more?',
      a: "겉으로는 무던해 보여도 속으로는 꽤 고집이 세고 내 영역이 확실하다. 누가 나를 억지로 통제하거나 조종하려 들면, 대놓고 화를 내진 않아도 '절대 안 움직이는 바위'처럼 버티며 내 페이스를 지켜낸다.",
      b: '예의 바르고 반듯한 태도를 중요하게 여기며, 상황을 이성적이고 매끄럽게 조율하려 애쓴다. 현실이 시끄러워지면 화를 내기보다는, 완벽한 질서와 평화가 있는 나만의 이상적인 내면세계로 도피하곤 한다.',
      aEn: 'Even if I look easygoing, inside I can be very stubborn and have a clear territory. If someone tries to control or manipulate me, I may not openly explode, but I hold my pace like an immovable rock.',
      bEn: 'I value a polite, proper attitude and try to coordinate situations smoothly and rationally. When reality gets noisy, I escape into an ideal inner world of perfect order and peace rather than getting angry.'
    }
  }
};

const SUBTYPE_BEHAVIOR_ITEMS = {
  1: [
    { q: '기준이 어긋난 장면을 본 뒤 실제 반응에 더 가까운 것은?', sp: '겉으로 크게 말하기보다 집에 와서 내가 놓친 것과 내 책임을 다시 점검한다.', so: '사람들이 같은 기준을 따르지 않는 것이 답답해서, 올바른 방식이 무엇인지 설명하게 된다.', sx: '가까운 사람이나 현장에 바로 말하고, 관계가 거칠어져도 고쳐야 한다고 느낀다.' },
    { q: '실수 가능성이 보일 때 더 자주 하는 행동은?', sp: '내가 실수하지 않도록 준비물, 순서, 마감 기준을 반복해서 확인한다.', so: '팀이나 공동체가 기준 없이 움직이면 규칙과 방향을 정리해 주려 한다.', sx: '상대의 태도나 습관이 기준에 어긋나면 직접 지적하고 바꾸도록 압박한다.' },
    { q: '화가 올라온 뒤 남는 패턴에 가까운 것은?', sp: '내가 더 잘했어야 했다는 생각이 오래 남아 스스로를 몰아붙인다.', so: '왜 사람들이 기본을 지키지 않는지 답답해하며 기준을 세우려 한다.', sx: '참다가 넘기는 것보다 즉시 고치게 만들 때 마음이 풀린다.' }
  ],
  2: [
    { q: '관계에서 필요를 느낄 때 실제 행동에 가까운 것은?', sp: '직접 요구하기보다 귀엽거나 약한 신호를 보내 상대가 먼저 알아주길 기다린다.', so: '중요한 사람들과 연결되고 모임에서 필요한 조력자가 되기 위해 움직인다.', sx: '특정 사람이 나를 강하게 원하게 만들려고 매력과 관심을 집중한다.' },
    { q: '서운함이 생겼을 때 더 자주 나타나는 방식은?', sp: '괜찮은 척하지만 속으로는 왜 나를 챙겨주지 않는지 오래 섭섭해한다.', so: '내가 이 그룹에 얼마나 기여했는지 인정받지 못하면 힘이 빠진다.', sx: '상대가 내 마음을 몰라주면 더 가까이 밀고 들어가거나 강하게 확인하려 한다.' },
    { q: '도움이 필요한 사람이 보일 때 자동으로 하는 행동은?', sp: '상대에게 기대고 싶은 마음을 숨긴 채 먼저 다정하게 챙긴다.', so: '조직 안에서 필요한 일을 맡고 사람들을 연결해 영향력을 만든다.', sx: '한 사람에게 집중해 특별한 관계가 되도록 에너지를 쏟는다.' }
  ],
  3: [
    { q: '성과를 보여줘야 할 때 실제로 더 자주 하는 행동은?', sp: '티 내기보다 꾸준하고 성실하게 결과를 내서 믿을 만한 사람으로 보이려 한다.', so: '사람들이 알아볼 수 있는 자리, 스펙, 성과를 분명하게 만들려 한다.', sx: '특정 대상이나 주변 사람이 원하는 이상적 모습에 맞춰 나를 세팅한다.' },
    { q: '실패하거나 부족해 보일 수 있을 때 더 가까운 반응은?', sp: '겉으로 드러내기보다 더 안정적인 결과와 책임감으로 만회하려 한다.', so: '평판이나 지위가 떨어지지 않도록 빠르게 성과 이미지를 회복하려 한다.', sx: '매력, 유능함, 외형, 태도를 조정해 상대가 실망하지 않게 만든다.' },
    { q: '인정을 얻기 위해 반복되는 행동은?', sp: '묵묵히 잘해내는 사람이라는 신뢰를 쌓는다.', so: '무대 중앙이나 공개된 지표에서 뛰어난 사람으로 보이려 한다.', sx: '상대가 바라는 완성형 이미지에 맞춰 나를 바꾼다.' }
  ],
  4: [
    { q: '마음이 힘들 때 고통을 다루는 실제 방식은?', sp: '힘든 일이 있어도 주변에 거의 말하지 않고 혼자 버틴 뒤 나중에 지친다.', so: '나만 뒤처진 느낌이나 비교되는 감정을 말하거나 드러내고 싶어진다.', sx: '부러운 사람을 보면 슬픔보다 경쟁심과 날 선 반응이 먼저 올라온다.' },
    { q: '결핍감이 올라올 때 더 가까운 행동은?', sp: '아픈 티를 내지 않으려고 버티며, 혼자 견디는 데 자존심을 둔다.', so: '내 부족함이나 수치심을 누군가 알아주길 바라며 표현하게 된다.', sx: '내가 밀렸다고 느끼면 이기거나 압도해서 결핍감을 뒤집으려 한다.' },
    { q: '행복하거나 평온한 상황에서도 반복되는 패턴은?', sp: '겉으로는 괜찮아 보여도 혼자만의 고통을 계속 견디고 있다.', so: '다른 사람들은 온전해 보이는데 나만 빠진 것 같다는 감각이 올라온다.', sx: '내게 없는 것을 가진 사람을 보면 비교보다 경쟁 행동으로 반응한다.' }
  ],
  5: [
    { q: '사람과 요구가 한꺼번에 들어올 때 실제 행동은?', sp: '내 공간과 시간을 지키기 위해 문을 닫고 접근을 줄인다.', so: '일반적인 교류보다 전문 지식이나 특별한 그룹 안에서만 연결된다.', sx: '대부분과는 거리를 두지만 깊이 신뢰하는 한 대상에게만 강하게 열린다.' },
    { q: '에너지가 부족할 때 회복 방식은?', sp: '물리적 공간, 루틴, 혼자 있는 시간을 확보한다.', so: '내가 가치 있게 여기는 지식/분야 안에서 의미를 찾는다.', sx: '단 한 사람 또는 이상과 깊이 통하는 느낌을 찾는다.' },
    { q: '관계에서 가까워질 때 반복되는 패턴은?', sp: '상대가 내 시간과 공간을 침범하지 않는지 먼저 본다.', so: '전문성이나 관심사가 맞을 때 제한적으로 가까워진다.', sx: '절대적으로 신뢰할 수 있다고 느끼면 예상보다 깊이 몰입한다.' }
  ],
  6: [
    { q: '불안하거나 위협을 느낄 때 실제로 하는 행동은?', sp: '친절하고 무해하게 보이며 내 편과 보호망을 만든다.', so: '명확한 규칙, 권위, 매뉴얼을 찾아 그대로 따르며 안심한다.', sx: '두려워 보이지 않으려고 먼저 강하게 나가거나 맞선다.' },
    { q: '사람을 믿어야 할 때 더 자주 하는 행동은?', sp: '상대가 나를 지켜줄 수 있는지 따뜻한 관계를 만들어 확인한다.', so: '공식 기준과 책임 구조가 있는지 확인한다.', sx: '상대를 찔러보거나 강하게 반응해 믿을 만한지 시험한다.' },
    { q: '불확실성이 커질 때 에너지가 향하는 곳은?', sp: '안전한 사람들과 일상의 안정망을 확보한다.', so: '규칙과 의무를 분명히 해 모호함을 줄인다.', sx: '위협을 제거하기 위해 먼저 힘을 보여준다.' }
  ],
  7: [
    { q: '욕구와 책임이 부딪힐 때 실제로 더 자주 하는 행동은?', sp: '나와 내 사람에게 이익이 되는 기회와 정보를 빠르게 챙긴다.', so: '내가 하고 싶은 일을 미루고 공동 일정이나 사람들 기대를 먼저 처리한다.', sx: '평범한 재미보다 강렬한 의미와 이상을 줄 대상을 찾아 몰입한다.' },
    { q: '지루함이나 결핍감이 올라올 때 에너지가 향하는 곳은?', sp: '실용적인 네트워크, 자원, 선택지를 넓히는 쪽으로 움직인다.', so: '내 즐거움을 바로 챙기기보다 좋은 사람으로 남기 위해 역할을 맡는다.', sx: '현실이 얕게 느껴지면 더 강한 끌림이나 본질적인 가능성을 찾아간다.' },
    { q: '사람들 앞에서 욕심 있어 보일 수 있을 때 반응은?', sp: '필요한 것을 영리하게 확보하되 내 사람들과 나눌 계산을 한다.', so: '내 욕구를 앞세우는 것이 이기적으로 보일까 봐 먼저 양보하거나 참여한다.', sx: '한 대상이나 아이디어가 이상적으로 느껴지면 현실 조건보다 그 가능성에 빨려 들어간다.' }
  ],
  8: [
    { q: '힘이나 통제권이 걸린 장면에서 실제 행동은?', sp: '시끄럽게 싸우기보다 내 자원과 영역을 조용히 단단하게 확보한다.', so: '사람들 사이에 힘의 불균형이 보이면, 요청받지 않아도 개입하게 된다.', sx: '상대와 공간의 주도권을 내가 쥐기 위해 강하게 밀고 들어간다.' },
    { q: '부당함을 봤을 때 더 가까운 반응은?', sp: '내 생존과 실속에 직접 관련된 영역부터 강하게 지킨다.', so: '내 사람이나 팀이 당하고 있으면 개인 이익과 무관해도 나선다.', sx: '상대가 물러설 때까지 강도를 높이며 기선을 잡는다.' },
    { q: '내 힘을 쓰는 방식에 가까운 것은?', sp: '필요한 자원과 만족을 놓치지 않도록 현실적으로 장악한다.', so: '개인 과시보다 무리 안의 의리와 보호를 위해 쓴다.', sx: '상대에게 강렬한 인상을 남기고 관계의 판을 장악한다.' }
  ],
  9: [
    { q: '내 문제와 욕구를 미루게 될 때 실제 행동은?', sp: '먹기, 영상, 잠, 반복 루틴 같은 몸의 편안함으로 복잡한 문제를 덮는다.', so: '모임 일이 굴러가지 않으면 내 필요를 미루고 빈자리를 메운다.', sx: '중요한 사람의 의견과 목표를 내 것처럼 받아들이며 내 목소리를 줄인다.' },
    { q: '갈등이나 불편한 결정을 피할 때 더 가까운 방식은?', sp: '익숙한 일상 활동에 들어가 감각을 무디게 만든다.', so: '바쁘게 참여하고 돕느라 내 문제를 볼 시간을 없앤다.', sx: '상대와 맞추는 쪽으로 흘러가며 독립적인 입장을 흐린다.' },
    { q: '에너지가 부족해도 계속 하게 되는 행동은?', sp: '몸이 편해지는 작은 습관으로 현실의 압박을 낮춘다.', so: '그룹이나 주변 사람이 필요로 하면 내 한계를 넘겨서라도 움직인다.', sx: '가까운 사람의 리듬에 맞추며 내 우선순위를 뒤로 보낸다.' }
  ]
};

const WING_BEHAVIOR_PROMPTS = {
  1: ['실제로 했던 행동은 잘못된 부분을 고치거나 기준을 세우는 쪽에 가까웠다.', '압박이 있을 때 원칙, 절차, 정확성을 먼저 확인했다.', '관계가 불편해져도 무엇이 옳은지 분명히 하려 했다.'],
  2: ['실제로 했던 행동은 상대의 필요를 먼저 챙기거나 관계를 회복하는 쪽에 가까웠다.', '내 필요보다 상대가 무엇을 원하는지 먼저 살폈다.', '상대에게 필요한 사람이 되기 위해 먼저 움직였다.'],
  3: ['실제로 했던 행동은 결과를 만들거나 유능해 보이도록 역할을 조정하는 쪽에 가까웠다.', '성과나 이미지가 흔들리지 않게 빠르게 만회하려 했다.', '사람들이 기대하는 역할에 맞춰 행동을 바꿨다.'],
  4: ['실제로 했던 행동은 감정의 결이나 빠진 느낌을 오래 붙드는 쪽에 가까웠다.', '불편한 감정을 빨리 넘기기보다 그 의미를 계속 생각했다.', '평범하게 지나가는 것보다 내 고유한 감정이 흐려지는 것이 더 불편했다.'],
  5: ['실제로 했던 행동은 물러나서 생각할 공간과 에너지를 확보하는 쪽에 가까웠다.', '즉시 반응하기보다 정보를 모으고 혼자 정리했다.', '요구가 많아질수록 접촉을 줄이고 내 공간을 지키려 했다.'],
  6: ['실제로 했던 행동은 위험을 확인하고 안전망을 만드는 쪽에 가까웠다.', '다른 사람이 넘어간 부분도 다시 확인했다.', '믿을 만한 사람, 규칙, 대비책을 찾은 뒤 움직였다.'],
  7: ['실제로 했던 행동은 막힌 흐름에서 다른 가능성이나 선택지를 여는 쪽에 가까웠다.', '무거운 분위기에 오래 머물기보다 전환할 계획을 찾았다.', '답답한 제약이 보이면 새 길이나 더 나은 옵션을 떠올렸다.'],
  8: ['실제로 했던 행동은 경계를 세우고 주도권을 되찾는 쪽에 가까웠다.', '누군가 선을 넘는다고 느끼면 직접 개입했다.', '내가 밀린다고 느끼는 순간 힘을 더 분명하게 냈다.'],
  9: ['실제로 했던 행동은 긴장을 낮추고 상황을 부드럽게 지나가게 하는 쪽에 가까웠다.', '분명히 말하기보다 분위기가 거칠어지지 않게 조절했다.', '갈등이 커질 것 같으면 일단 늦추거나 우회했다.']
};

function buildSubtypeBehaviorQuestions(core) {
  const set = phase4TypeSets[core];
  const items = SUBTYPE_BEHAVIOR_ITEMS[core];
  if (!set || !set.subtype) return [];
  if (!items) return [set.subtype];
  return items.map((item, index) => ({
    id: `${set.subtype.id}_behavior_${index + 1}`,
    format: 'abc',
    subtypeChoice: true,
    q: item.q,
    qEn: set.subtype.qEn,
    options: set.subtype.options.map((option) => ({
      ...option,
      text: item[option.value] || option.text,
      textEn: item[`${option.value}En`] || option.textEn
    }))
  }));
}

function buildWingQuestionSet(core) {
  const set = phase4TypeSets[core];
  if (!set || !set.wing) return [];
  const base = set.wing;
  const leftPrompts = WING_BEHAVIOR_PROMPTS[base.leftWing] || [base.a, base.a, base.a];
  const rightPrompts = WING_BEHAVIOR_PROMPTS[base.rightWing] || [base.b, base.b, base.b];
  return [0, 1, 2].map((index) => ({
    id: `${base.id}_behavior_${index + 1}`,
    format: 'ab',
    wingChoice: true,
    leftWing: base.leftWing,
    rightWing: base.rightWing,
    q: index === 0
      ? '다음 중 최근 실제로 했던 행동에 더 가까운 것은?'
      : '압박이 있거나 에너지가 흔들릴 때 더 자주 반복된 행동은?',
    qEn: base.qEn,
    a: leftPrompts[index] || base.a,
    b: rightPrompts[index] || base.b,
    aEn: base.aEn,
    bEn: base.bEn
  }));
}

function resolvePhase4Subtype(subtypeQuestions) {
  const votes = { sp: 0, so: 0, sx: 0 };
  const order = [];
  subtypeQuestions.forEach((question) => {
    if (!question.subtypeChoice) return;
    const value = document.querySelector(`input[name="${question.id}"]:checked`)?.value;
    if (!value || votes[value] === undefined) return;
    votes[value] += 1;
    if (!order.includes(value)) order.push(value);
  });
  const subtypeCode = ['sp', 'so', 'sx'].sort((a, b) => {
    const diff = votes[b] - votes[a];
    if (diff !== 0) return diff;
    const ai = order.includes(a) ? order.indexOf(a) : 99;
    const bi = order.includes(b) ? order.indexOf(b) : 99;
    return ai - bi;
  })[0];
  const option = subtypeQuestions[0]?.options?.find((candidate) => candidate.value === subtypeCode);
  return {
    subtypeCode,
    subtypeLabel: option ? (pageLang === 'en' ? option.labelEn : option.label) : subtypeCode,
    subtypeVotes: votes
  };
}

function resolvePhase4Wing(wingQuestions) {
  const votes = {};
  const evidence = [];
  wingQuestions.forEach((question) => {
    if (!question.wingChoice) return;
    const choice = document.querySelector(`input[name="${question.id}"]:checked`)?.value;
    if (!choice || choice === 'U') return;
    const wing = choice === 'A' ? question.leftWing : question.rightWing;
    votes[wing] = (votes[wing] || 0) + 1;
    evidence.push(choice === 'A' ? getOptionText(question, 'a') : getOptionText(question, 'b'));
  });
  const ranked = Object.keys(votes)
    .map((wing) => ({ wing: Number(wing), count: votes[wing] }))
    .sort((a, b) => b.count - a.count);
  return {
    wingNum: ranked[0] ? ranked[0].wing : null,
    wingVotes: votes,
    wingText: evidence.join(' / ')
  };
}

const tb14 = [
  {id:'tb_1_4_1',format:'ab',leftType:1,rightType:4,q:'내 안에서 마음에 들지 않는 부족함을 발견했을 때, 내 반응은 어느 쪽에 가까운가?',a:'"이걸 어떻게 고치고 나아질 수 있을까?"라며 기준을 높이고 나를 채찍질한다.',b:'"왜 나는 남들처럼 자연스럽지 못할까?"라며 그 결핍감과 우울감 안으로 깊이 빠져든다.'},
  {id:'tb_1_4_2',format:'ab',leftType:1,rightType:4,q:'마음속에 불편하고 무거운 감정이 올라올 때, 내 자동 반응은 어느 쪽에 가까운가?',a:'이런 감정에 휘둘리는 것은 옳지 않다고 느끼며, 감정을 누르고 이성적으로 통제하려 한다.',b:'이 감정이 진짜 나를 보여준다고 느끼며, 일부러 떨쳐내기보다 그 안에 오래 머무르려 한다.'},
  {id:'tb_1_4_3',format:'ab',leftType:1,rightType:4,q:'현실이 내가 바라는 이상적인 모습에 미치지 못할 때, 내 안에 더 강하게 차오르는 감정은 무엇인가?',a:'제대로 굴러가지 않고 어긋나 있는 상황에 대한 답답함과 짜증',b:'아름답고 온전한 것은 결국 가질 수 없다는 깊은 공허함과 상실감'}
];
const tb15 = [
  {id:'tb_1_5_1',format:'ab',leftType:1,rightType:5,q:'비효율적이거나 이치에 맞지 않는 상황을 지켜볼 때, 내 안에서 더 먼저 일어나는 반응은 어느 쪽인가?',a:'"왜 저렇게 하지? 이렇게 고치면 될 텐데" 하며 속으로 계속 답답해하고 신경이 쓰인다.',b:'"저 시스템은 저런 식으로 굴러가는구나" 하며 나와 분리해서 구조 자체를 관찰하게 된다.'},
  {id:'tb_1_5_2',format:'ab',leftType:1,rightType:5,q:'사람들과 감정적으로 얽히는 상황에서 한 걸음 물러설 때, 그 핵심 이유는 어느 쪽인가?',a:'감정에 휘둘려 객관성과 올바른 판단 기준을 잃어버릴까 봐 경계하기 때문이다.',b:'내 에너지가 급격히 소진되고 사적인 공간이 침범당할까 봐 방어하기 때문이다.'},
  {id:'tb_1_5_3',format:'ab',leftType:1,rightType:5,q:'내가 무언가를 깊이 파고들어 정확히 알고자 할 때, 더 밑바탕에 있는 동기는 무엇인가?',a:'실수 없이 올바르게 해내고, 책임감 있게 내 역할을 다하기 위해서다.',b:'세상이 돌아가는 원리를 이해하고, 내 머릿속에 명확한 지도를 갖기 위해서다.'}
];
const tb16 = [
  {id:'tb_1_6_1',format:'ab',leftType:1,rightType:6,q:'일을 처리하면서 계속 점검하고 확인하게 될 때, 내 안에서 일어나는 생각은 어느 쪽에 가까운가?',a:'"이 부분이 여전히 허술해. 더 제대로, 완벽하게 다듬어야 해."',b:'"내가 뭔가 놓친 게 있지 않을까? 나중에 문제가 생기면 안 되는데."'},
  {id:'tb_1_6_2',format:'ab',leftType:1,rightType:6,q:'상사나 회사의 규정이 내 생각과 다를 때, 내 내적 반응은 어느 쪽에 더 가까운가?',a:'"저 방식은 비합리적이고 틀렸어. 기준에 맞게 제대로 뜯어고쳐야 해."',b:'"따르긴 하겠지만, 진짜 저대로 해도 안전한지 계속 의심스럽고 찜찜해."'},
  {id:'tb_1_6_3',format:'ab',leftType:1,rightType:6,q:'상황이 내 통제를 벗어날 때, 가장 크게 올라오는 감정은 무엇인가?',a:'일처리가 엉망이 되고 기준이 무너지는 데서 오는 답답함과 분노',b:'예측할 수 없는 변수들이 튀어나와서 생기는 막연한 불안과 걱정'}
];
const tb19 = [
  {id:'tb_1_9_1',format:'ab',leftType:1,rightType:9,q:'상황이 불편해질까 봐 문제를 지적하지 않고 그냥 넘어갔을 때, 내 안에 남는 감정은 어느 쪽에 더 가까운가?',a:'"결국 제대로 안 됐잖아" 하는 생각에 속으로 계속 부글거리며 신경이 쓰인다.',b:'그래도 어찌어찌 큰 소리 안 나고 무난하게 넘어갔으니 다행이라고 생각한다.'},
  {id:'tb_1_9_2',format:'ab',leftType:1,rightType:9,q:'둘 중 내 마음을 더 답답하고 불편하게 만드는 상황은 어느 쪽인가?',a:'원칙 없이 예외가 남발되고, 무책임하게 대충 굴러가는 상황',b:'사람들이 예민하게 날을 세우고, 언제 터질지 모르는 긴장된 상황'},
  {id:'tb_1_9_3',format:'ab',leftType:1,rightType:9,q:'내 안에서 짜증이나 분노가 올라올 때, 나는 무의식적으로 어떻게 반응하는가?',a:'감정을 억누르려 하지만, 목소리가 굳어지거나 표정이 차가워지는 등 밖으로 에너지가 샌다.',b:'화난 감정 자체를 희미하게 만들려 하며, 아무 일 없는 척 멍해지거나 다른 데로 주의를 돌린다.'}
];

// 1번 vs 8번 타이브레이커: 분노 초점, 경계 초점, 리더십 초점으로 압축
const tb18 = [
  { id:'tb_1_8_1', format:'ab', leftType:1, rightType:8, q:'화가 강하게 올라오는 장면에 더 가까운 쪽을 고르세요.', a:'일이 비합리적이거나 기준에 어긋나게 처리될 때 더 못 견디는 편이다.', b:'누군가 내 사람이나 약자를 함부로 대하거나 밀어붙일 때 더 못 견디는 편이다.' },
  { id:'tb_1_8_2', format:'ab', leftType:1, rightType:8, q:'더 민감하게 경계하는 장면에 가까운 쪽을 고르세요.', a:'내가 틀렸거나 기준을 어겼다는 비판을 받을 가능성', b:'내가 통제당하거나 만만하게 다뤄질 가능성' },
  { id:'tb_1_8_3', format:'ab', leftType:1, rightType:8, q:'내가 사람들을 이끌 때 더 중요하게 여기는 방향에 가까운 쪽을 고르세요.', a:'더 올바르고 정돈된 방향으로 이끄는 것', b:'외부 압력으로부터 지켜내고 힘을 확보하는 것' }
];
const tb24 = [
  {id:'tb_2_4_1',format:'ab',leftType:2,rightType:4,q:'관계가 어색해지거나 멀어진다고 느낄 때, 내 반응은 어느 쪽에 더 가까운가?',a:'내가 더 챙기고 더 맞춰서 다시 따뜻하게 연결을 회복하고 싶어진다.',b:'이 사람이 정말 내 진짜 마음을 이해하고 있는지 더 예민하게 보게 된다.'},
  {id:'tb_2_4_2',format:'ab',leftType:2,rightType:4,q:'둘 중 내게 더 견디기 어려운 상태는 어느 쪽에 가까운가?',a:'내가 더 이상 그 사람에게 필요한 존재가 아닌 것 같은 상태',b:'함께 있어도 내 진짜 마음이 이해되지 않는 상태'},
  {id:'tb_2_4_3',format:'ab',leftType:2,rightType:4,q:'관계에서 상처받았을 때, 내 머릿속에 더 먼저 도는 말은 어느 쪽에 가까운가?',a:'내가 더 잘했어야 했나, 더 채워줬어야 했나',b:'역시 내 진짜 마음은 끝까지 이해받기 어렵구나'}
];
const tb26 = [
  {id:'tb_2_6_1',format:'ab',leftType:2,rightType:6,q:'다른 사람을 돕거나 챙길 때, 내 마음 깊은 곳에서 더 신경 쓰이는 쪽은 어느 것인가?',a:'내가 이 사람에게 정말 쓸모 있고 필요한 존재로 여겨지고 있을까?',b:'내가 이렇게 하면 이 사람과 적이 되지 않고 내 편으로 만들 수 있을까?'},
  {id:'tb_2_6_2',format:'ab',leftType:2,rightType:6,q:'가까운 사람과의 관계에서 은근히 올라오는 불안감은 어느 쪽에 더 가까운가?',a:'언젠가 내가 더 이상 필요 없어지면 나를 떠나거나 멀어질지도 몰라.',b:'겉으로는 좋아 보여도, 결정적인 순간에 나를 지켜주지 않거나 뒤통수를 칠지 몰라.'},
  {id:'tb_2_6_3',format:'ab',leftType:2,rightType:6,q:'내가 누군가에게 잘해줬을 때, 마음속으로 가장 바라는 반응은 무엇인가?',a:'나를 다른 사람들과 다르게 생각해주고, 정서적으로 더 가깝게 다가와 주는 것',b:'나를 의심하지 않고 믿어주며, 나에게 든든한 연대감과 확실한 지지를 보여주는 것'}
];
const tb28 = [
  {id:'tb_2_8_1',format:'ab',leftType:2,rightType:8,q:'내 사람이라고 생각한 사람에게 크게 화가 나고 섭섭해질 때, 그 핵심 이유는 어느 쪽인가?',a:'내가 그동안 얼마나 챙겨주고 마음을 썼는데, 어떻게 나한테 이럴 수 있지?',b:'내가 지켜주고 끌어주려 했는데, 감히 내 선을 넘고 내 방식을 무시해?'},
  {id:'tb_2_8_2',format:'ab',leftType:2,rightType:8,q:'내가 아끼는 사람들을 대할 때, 내 태도는 어느 쪽에 더 가까운가?',a:'그들의 세세한 감정과 필요를 파악하고, 깊이 교감하며 정서적으로 밀착하려 한다.',b:'그들이 억울한 일을 당하지 않게 내 울타리 안에서 확실히 보호하고 끌어주려 한다.'},
  {id:'tb_2_8_3',format:'ab',leftType:2,rightType:8,q:'관계에서 내가 영향력을 행사하거나 상황을 내 뜻대로 이끌고 싶을 때, 주로 쓰는 방식은?',a:'내가 상대를 위해 얼마나 수고하고 헌신하고 있는지 은연중에 느끼게 만든다.',b:'상황을 정리할 명확한 방향을 제시하고, 굽히지 않는 강한 태도로 밀어붙인다.'}
];
const tb29 = [
  {id:'tb_2_9_1',format:'ab',leftType:2,rightType:9,q:'상대에게 맞춰주거나 양보할 때, 더 가까운 속마음은?',a:'내가 필요한 존재이고 관계 안에서 의미 있는 사람으로 남고 싶다.',b:'마찰이 커지지 않고 분위기가 편안하게 유지되면 좋겠다.'},
  {id:'tb_2_9_2',format:'ab',leftType:2,rightType:9,q:'거절이나 거리감이 생겼을 때, 더 먼저 흔들리는 것은?',a:'내가 더 이상 상대에게 특별히 필요하지 않은 사람처럼 느껴지는 것',b:'관계 안의 불편한 긴장이 오래 이어지는 것'},
  {id:'tb_2_9_3',format:'ab',leftType:2,rightType:9,q:'내 필요를 뒤로 미룰 때, 더 자주 일어나는 패턴은?',a:'상대가 나의 헌신과 필요를 알아봐 주기를 은근히 기대한다.',b:'내 필요를 분명히 말하면 분위기가 불편해질 것 같아 흐리게 넘긴다.'}
];
const tb39 = [
  {id:'tb_3_9_1',format:'ab',leftType:3,rightType:9,q:'여러 사람과 있을 때, 상황이나 분위기에 나를 맞추는 밑바탕의 심리는 어느 쪽인가?',a:'이 상황에서 가장 괜찮고 유능해 보이는 역할이 뭘까?',b:'어떻게 해야 튀지 않고 무난하게 이 분위기에 스며들까?'},
  {id:'tb_3_9_2',format:'ab',leftType:3,rightType:9,q:'사람들이 나를 주목할 때, 내 안에서 드는 자연스러운 감정은?',a:'부담스러울 때도 있지만, 속으로는 내가 돋보이고 인정받는 것 같아 에너지가 돈다.',b:'그냥 조용히 내 자리에 있고 싶은데, 시선을 받는 것 자체가 불편하고 피곤하다.'},
  {id:'tb_3_9_3',format:'ab',leftType:3,rightType:9,q:'일이 너무 벅차고 스트레스가 심할 때, 나는 주로 어떤 상태에 빠지는가?',a:'어떻게든 해내야 한다는 압박감에 시달리며 무리해서라도 계속 밀어붙인다.',b:'스위치를 꺼버린 것처럼 에너지가 빠지고, 당장 급한 일이 아니면 미루며 멍해진다.'}
];
const tb47 = [
  {id:'tb_4_7_1',format:'ab',leftType:4,rightType:7,q:'마음이 무겁고 우울한 감정이 밀려올 때, 내 자동 반응은 어느 쪽에 더 가까운가?',a:'왜 이런 기분이 드는지 이유를 파고들며, 그 감정 자체에 깊이 잠겨 머무르는 편이다.',b:'무거운 기분에 오래 머무는 것이 싫어서, 기분을 환기할 다른 생각이나 활동을 빨리 찾는다.'},
  {id:'tb_4_7_2',format:'ab',leftType:4,rightType:7,q:'다람쥐 쳇바퀴 돌듯 반복되는 뻔한 일상 속에서 내가 더 자주 느끼는 불편함은?',a:'삶의 진짜 의미와 깊이가 사라진 것 같아 가슴 한구석이 텅 빈 것 같은 공허함',b:'더 새롭고 재밌는 일들이 많은데, 이 좁은 현실에 묶여 있는 것 같은 갇힌 답답함'},
  {id:'tb_4_7_3',format:'ab',leftType:4,rightType:7,q:'내가 현실을 벗어나 머릿속으로 무언가를 상상할 때, 그 내용은 주로 어느 쪽인가?',a:'현실에서는 쉽게 채워지지 않을, 나만의 낭만적이고 깊이 있는 이상적인 모습이나 감정',b:'내일 당장이라도 시도해 볼 수 있는, 흥미롭고 호기심을 자극하는 새로운 아이디어나 계획'}
];
const tb48 = [
  {id:'tb_4_8_1',format:'ab',leftType:4,rightType:8,q:'내가 누군가에게 강하게 화를 내고 내 요구를 밀어붙일 때, 내면 깊은 곳에 깔려 있는 감정은?',a:'겉으로는 강하게 화를 내지만, 내면에는 결국 나는 이해받지 못했다는 깊은 결핍감과 남들보다 부족해 보이기 싫은 마음이 깔려 있다.',b:'화를 낼 때 내면에 복잡한 상처나 열등감은 없다. 누군가 선을 넘었기 때문에 정당하게 내 권리와 힘을 행사할 뿐이라고 확신한다.'},
  {id:'tb_4_8_2',format:'ab',leftType:4,rightType:8,q:'사람들과 경쟁하거나 부딪혀서 이기려 할 때, 내가 진짜로 얻고자 하는 내적 보상은?',a:'나를 거절하거나 무시했던 사람들보다 내가 더 우월하다는 것을 증명하여, 내 안의 수치심과 상처를 보상받고 싶다.',b:'내 사람들과 내 영역을 지켜내고, 그 누구도 나를 함부로 통제하거나 만만하게 볼 수 없도록 힘의 우위를 확실히 하고 싶다.'}
];

// 전용 타이브레이커가 없는 31개 쌍: 동기·두려움·세계관 차이 기반 전용 질문 (키: 'typeA_typeB')
const tbCustomMap = {
  '1_2': { q: '다음 두 문장 중, 불편하거나 압박이 있을 때 더 자동적으로 가까운 쪽을 고르세요.', a: '사람을 도울 때, 그 사람에게 필요한 존재가 되는 것보다 무엇이 더 바르고 적절한지 바로잡아 주고 싶어지는 편이다.', b: '사람을 도울 때, 무엇이 맞는지 알려주는 것보다 그 사람에게 필요한 존재가 되고 관계가 가까워지는 쪽이 더 중요하다.' },
  '1_4': { q: '다음 두 문장 중, 불편하거나 압박이 있을 때 더 자동적으로 가까운 쪽을 고르세요.', a: '내 부족함을 발견하면, 그것을 고치고 바로잡아야 할 문제로 느끼는 편이다.', b: '내 부족함을 발견하면, 그 감정이 내 정체감과 깊게 연결된다고 느끼는 편이다.' },
  '1_5': { q: '다음 두 문장 중, 불편하거나 압박이 있을 때 더 자동적으로 가까운 쪽을 고르세요.', a: '문제나 부조리를 보면, 개선하거나 바로잡아야 한다는 긴장이 먼저 올라온다.', b: '문제나 부조리를 보면, 일단 물러나 구조를 이해하려는 쪽으로 간다.' },
  '1_6': { q: '다음 두 문장 중, 불편하거나 압박이 있을 때 더 자동적으로 가까운 쪽을 고르세요.', a: '무엇이 옳은지에 대한 내 기준이 행동의 출발점이 되는 편이다.', b: '무엇이 안전한지 확인하는 과정이 행동의 출발점이 되는 편이다.' },
  '1_9': { q: '다음 두 문장 중, 불편하거나 압박이 있을 때 더 자동적으로 가까운 쪽을 고르세요.', a: '불편하거나 잘못된 장면을 보면, 바로잡고 싶다는 긴장이 먼저 올라온다.', b: '불편하거나 잘못된 장면을 보면, 더 커지지 않게 지나가길 바라는 마음이 먼저 올라온다.' },
  '2_4': { q: '다음 두 문장 중, 불편하거나 압박이 있을 때 더 자동적으로 가까운 쪽을 고르세요.', a: '관계에서 더 중요한 것은 상대의 필요를 채우고 사랑받는 것이다.', b: '관계에서 더 중요한 것은 상대가 나를 깊고 특별하게 이해해 주는 것이다.' },
  '2_5': { q: '다음 두 문장 중, 불편하거나 압박이 있을 때 더 자동적으로 가까운 쪽을 고르세요.', a: '사람들과 감정적으로 연결될 때 에너지가 살아나는 편이다.', b: '사람들과 오래 엮이면 에너지가 빠져 혼자 정리할 시간이 필요해지는 편이다.' },
  '2_6': { q: '다음 두 문장 중, 불편하거나 압박이 있을 때 더 자동적으로 가까운 쪽을 고르세요.', a: '사람들에게 잘해줄 때, 관계가 멀어지지 않도록 연결을 지키려는 마음이 더 크다.', b: '사람들에게 잘해줄 때, 신뢰를 쌓아 안전한 관계 기반을 만들려는 마음이 더 크다.' },
  '2_7': { q: '다음 두 문장 중, 불편하거나 압박이 있을 때 더 자동적으로 가까운 쪽을 고르세요.', a: '내 관심은 사람들의 필요와 관계에 더 자주 향한다.', b: '내 관심은 재미있는 경험과 새로운 가능성에 더 자주 향한다.' },
  '2_9': { q: '다음 두 문장 중, 불편하거나 압박이 있을 때 더 자동적으로 가까운 쪽을 고르세요.', a: '다른 사람 의견에 맞출 때, 관계가 더 가까워지길 바라는 마음이 큰 편이다.', b: '다른 사람 의견에 맞출 때, 마찰을 줄이고 조용히 넘어가려는 마음이 큰 편이다.' },
  '3_4': { q: '다음 두 문장 중, 불편하거나 압박이 있을 때 더 자동적으로 가까운 쪽을 고르세요.', a: '눈에 보이는 성취와 결과를 통해 내 가치를 확인하려는 편이다.', b: '내 감정의 진실함과 고유함을 통해 내가 누구인지 확인하려는 편이다.' },
  '3_5': { q: '다음 두 문장 중, 불편하거나 압박이 있을 때 더 자동적으로 가까운 쪽을 고르세요.', a: '지식이나 실력을 쌓을 때, 그것이 분명한 성과와 인정으로 이어지는지가 중요하다.', b: '지식이나 실력을 쌓을 때, 그것을 이해하고 익히는 과정 자체가 더 중요하다.' },
  '3_7': { q: '다음 두 문장 중, 불편하거나 압박이 있을 때 더 자동적으로 가까운 쪽을 고르세요.', a: '내 에너지는 목표를 이루고 결과를 만드는 쪽에 더 자주 모인다.', b: '내 에너지는 새롭고 흥미로운 가능성을 넓히는 쪽에 더 자주 모인다.' },
  '3_8': { q: '다음 두 문장 중, 불편하거나 압박이 있을 때 더 자동적으로 가까운 쪽을 고르세요.', a: '목표를 밀어붙일 때, 다른 사람이 나를 어떻게 평가하는지가 중요한 편이다.', b: '목표를 밀어붙일 때, 다른 사람의 평가보다 내 영향력과 통제감이 더 중요한 편이다.' },
  '3_9': { q: '다음 두 문장 중, 불편하거나 압박이 있을 때 더 자동적으로 가까운 쪽을 고르세요.', a: '일이 잘 풀리지 않으면, 실패해 보일까 봐 불안과 초조가 먼저 올라온다.', b: '일이 잘 풀리지 않으면, 갈등이 커질까 봐 불편하고 피하고 싶어진다.' },
  '4_5': { q: '다음 두 문장 중, 불편하거나 압박이 있을 때 더 자동적으로 가까운 쪽을 고르세요.', a: '혼자 있을 때, 내 감정과 상상 속으로 더 깊이 들어가는 편이다.', b: '혼자 있을 때, 정보와 지적 관심사 속으로 더 깊이 들어가는 편이다.' },
  '4_6': { q: '다음 두 문장 중, 불편하거나 압박이 있을 때 더 자동적으로 가까운 쪽을 고르세요.', a: '불안의 바닥에는 내가 남들과 다르고 어딘가 결핍되어 있다는 느낌이 깔려 있는 편이다.', b: '불안의 바닥에는 세상이 예측하기 어렵고 안전장치가 필요하다는 느낌이 깔려 있는 편이다.' },
  '4_7': { q: '다음 두 문장 중, 불편하거나 압박이 있을 때 더 자동적으로 가까운 쪽을 고르세요.', a: '삶의 깊이와 의미를 위해 불편한 감정도 어느 정도 붙들고 있는 편이다.', b: '삶의 즐거움과 자유를 위해 불편한 감정에서 빨리 벗어나려는 편이다.' },
  '4_8': { q: '다음 두 문장 중, 불편하거나 압박이 있을 때 더 자동적으로 가까운 쪽을 고르세요.', a: '상처를 받으면 내 안으로 더 깊이 들어가 그 감정을 오래 붙드는 편이다.', b: '상처를 받으면 원인을 밖에서 찾고 강하게 맞서는 쪽으로 가는 편이다.' },
  '4_9': { q: '다음 두 문장 중, 불편하거나 압박이 있을 때 더 자동적으로 가까운 쪽을 고르세요.', a: '평범하게 섞이는 것보다, 나만의 다름과 고유함이 더 중요하게 느껴진다.', b: '두드러지기보다, 무리 없이 어울리고 평온한 흐름을 유지하는 쪽이 더 중요하게 느껴진다.' },
  '5_6': { q: '다음 두 문장 중, 불편하거나 압박이 있을 때 더 자동적으로 가까운 쪽을 고르세요.', a: '불안할 때, 정보를 모으고 분석해 이해하려는 쪽으로 간다.', b: '불안할 때, 위험을 확인하고 대비책을 세우는 쪽으로 간다.' },
  '5_8': { q: '다음 두 문장 중, 불편하거나 압박이 있을 때 더 자동적으로 가까운 쪽을 고르세요.', a: '갈등이 생기면, 거리를 두고 관찰하고 분석하려는 편이다.', b: '갈등이 생기면, 직접 들어가 흐름을 바꾸고 통제하려는 편이다.' },
  '5_9': { q: '다음 두 문장 중, 불편하거나 압박이 있을 때 더 자동적으로 가까운 쪽을 고르세요.', a: '사람들과 거리를 둘 때, 내 에너지와 공간을 지키기 위한 경우가 더 많다.', b: '사람들과 거리를 둘 때, 불편한 마찰을 피하고 조용히 넘어가기 위한 경우가 더 많다.' },
  '6_7': { q: '다음 두 문장 중, 불편하거나 압박이 있을 때 더 자동적으로 가까운 쪽을 고르세요.', a: '불확실한 미래를 보면, 먼저 최악의 경우와 대비책을 생각하는 편이다.', b: '불확실한 미래를 보면, 먼저 더 나은 가능성과 탈출구를 떠올리는 편이다.' },
  '6_9': { q: '다음 두 문장 중, 불편하거나 압박이 있을 때 더 자동적으로 가까운 쪽을 고르세요.', a: '결정을 내리기 전, 여러 의견과 잠재 위험을 확인해야 마음이 놓인다.', b: '결정을 내릴 순간이 오면, 갈등을 피하려고 미루거나 남의 흐름을 따르기 쉬운 편이다.' },
  '7_9': { q: '다음 두 문장 중, 불편하거나 압박이 있을 때 더 자동적으로 가까운 쪽을 고르세요.', a: '불편한 상태가 오면, 더 나은 가능성이나 즐거운 계획 쪽으로 빨리 옮겨가려는 편이다.', b: '불편한 상태가 오면, 익숙하고 무난한 활동 속으로 들어가 감각을 무디게 하려는 편이다.' },
  '8_9': { q: '다음 두 문장 중, 불편하거나 압박이 있을 때 더 자동적으로 가까운 쪽을 고르세요.', a: '갈등은 힘을 쓰고 흐름을 바꿔야 하는 장면이 되기 쉽다.', b: '갈등은 평온과 연결을 깨뜨릴 수 있어 가능하면 피하고 싶은 장면이 되기 쉽다.' }
};

const postTieBreakerMap = {
  '3_6': {
    a: '압박이 커질수록, 결과를 빨리 만들어 내 가치를 입증하려는 반응이 먼저 나온다.',
    b: '압박이 커질수록, 위험 요소를 점검해 안전장치를 세우려는 반응이 먼저 나온다.'
  },
  '1_8': {
    a: '일이 비합리적이거나 기준에 어긋나게 처리될 때 더 못 견디는 편이다.',
    b: '내 사람이나 약자가 부당하게 다뤄질 때 더 못 견디는 편이다.'
  },
  '7_8': {
    a: '막힌 흐름을 깨고 선택지를 넓히는 쪽으로 에너지가 먼저 향한다.',
    b: '침범이나 통제를 감지하면 주도권을 되찾는 쪽으로 에너지가 먼저 향한다.'
  }
};

function renderQuestions(containerId, items, prefix) {
  const root = document.getElementById(containerId);
  root.innerHTML = '';
  items.forEach((item) => {
    const legendId = `${prefix}-legend-${item.id}`;
    const hintId = `${prefix}-hint-${item.id}`;
    if (item.format === 'abc') {
      root.innerHTML += `
        <div class="bg-white p-5 sm:p-7 rounded-xl border border-gray-100 shadow-sm" id="${prefix}-block-${item.id}">
          <fieldset id="${prefix}-fieldset-${item.id}" aria-labelledby="${legendId}">
            <legend id="${legendId}" class="text-[15px] sm:text-base font-medium text-gray-800 mb-2 leading-relaxed">${getQuestionText(item)}</legend>
            <div class="grid gap-3 mt-5">
              ${item.options.map((option, idx) => `
                <label class="block cursor-pointer">
                  <input type="radio" name="${item.id}" value="${option.value}" class="sr-only peer" required>
                  <div class="rounded-xl border-2 border-gray-200 p-4 text-sm text-gray-700 peer-checked:border-[#30322D] peer-checked:bg-[#FBFAF5] peer-focus-visible:ring-2 peer-focus-visible:ring-[#30322D]/30 smooth">
                    <span class="inline-block text-xs font-bold text-[#30322D] mb-1">${String.fromCharCode(65 + idx)} ${pageLang === 'en' ? 'choice' : '선택'}</span>
                    <div>${getChoiceOptionText(option)}</div>
                  </div>
                </label>
              `).join('')}
            </div>
          </fieldset>
        </div>`;
      return;
    }
    if (item.format === 'ab') {
      root.innerHTML += `
        <div class="bg-white p-5 sm:p-7 rounded-xl border border-gray-100 shadow-sm" id="${prefix}-block-${item.id}">
          <fieldset id="${prefix}-fieldset-${item.id}" aria-labelledby="${legendId}">
            <legend id="${legendId}" class="text-[15px] sm:text-base font-medium text-gray-800 mb-2 leading-relaxed">${getQuestionText(item)}</legend>
            <div class="grid gap-3 mt-5">
            <label class="block cursor-pointer">
              <input type="radio" name="${item.id}" value="A" class="sr-only peer" required>
              <div class="rounded-xl border-2 border-gray-200 p-4 text-sm text-gray-700 peer-checked:border-[#30322D] peer-checked:bg-[#FBFAF5] peer-focus-visible:ring-2 peer-focus-visible:ring-[#30322D]/30 smooth">
                <span class="inline-block text-xs font-bold text-[#30322D] mb-1">${pageLang === 'en' ? 'Choose A' : 'A 선택'}</span>
                <div>${getOptionText(item, 'a')}</div>
              </div>
            </label>
            <label class="block cursor-pointer">
              <input type="radio" name="${item.id}" value="B" class="sr-only peer" required>
              <div class="rounded-xl border-2 border-gray-200 p-4 text-sm text-gray-700 peer-checked:border-[#30322D] peer-checked:bg-[#FBFAF5] peer-focus-visible:ring-2 peer-focus-visible:ring-[#30322D]/30 smooth">
                <span class="inline-block text-xs font-bold text-[#30322D] mb-1">${pageLang === 'en' ? 'Choose B' : 'B 선택'}</span>
                <div>${getOptionText(item, 'b')}</div>
              </div>
            </label>
            <label class="block cursor-pointer">
              <input type="radio" name="${item.id}" value="U" class="sr-only peer">
              <div class="rounded-xl border-2 border-gray-200 p-3 text-sm text-gray-500 peer-checked:border-[#30322D] peer-checked:bg-[#FBFAF5] peer-focus-visible:ring-2 peer-focus-visible:ring-[#30322D]/30 smooth text-center">
                ${pageLang === 'en' ? 'Neither (no scoring)' : '둘 다 아니다 (비채점)'}
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
                <label for="${item.id}-${v}" class="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full border-2 border-gray-200 text-gray-400 cursor-pointer hover:bg-gray-50 peer-focus-visible:ring-2 peer-focus-visible:ring-[#30322D]/30 smooth font-semibold text-sm bg-white">${v}</label>
              </div>`).join('')}
          </div>
          <span class="text-xs text-gray-400 font-medium">${pageLang === 'en' ? 'Almost always true' : '거의 항상 그렇다'}</span>
        </div>
        <div class="mt-4 text-center">
          <input type="radio" name="${item.id}" value="U" id="${item.id}-U" class="peer sr-only">
          <label for="${item.id}-U" class="inline-flex items-center rounded-full border border-gray-200 px-3 py-1.5 text-xs text-gray-500 cursor-pointer hover:bg-gray-50 peer-checked:border-[#30322D] peer-checked:bg-[#FBFAF5] peer-checked:text-[#30322D] peer-focus-visible:ring-2 peer-focus-visible:ring-[#30322D]/30 smooth">
            ${pageLang === 'en' ? 'Not sure / varies by situation (no scoring)' : '잘 모르겠다 / 상황 따라 다름 (비채점)'}
          </label>
        </div>
        </fieldset>
      </div>`;
  });
  bindResponseTimingForRenderedQuestions(root, items, prefix);
}

function toScore(raw) {
  if (raw === 'U' || raw === undefined || raw === null) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function getIsoNow() {
  return new Date().toISOString();
}

function ensureResponseTimingStarted() {
  if (!testState.responseTiming.startedAt) {
    testState.responseTiming.startedAt = getIsoNow();
  }
}

function recordResponseFirstAnswer(questionId) {
  if (!questionId) return;
  ensureResponseTimingStarted();
  if (!testState.responseTiming.firstAnswerAt[questionId]) {
    testState.responseTiming.firstAnswerAt[questionId] = getIsoNow();
  }
}

function bindResponseTimingForRenderedQuestions(root, items, prefix) {
  if (!root || !items || !items.length) return;
  if (prefix === 'p1') ensureResponseTimingStarted();
  items.forEach((item) => {
    const inputs = root.querySelectorAll ? root.querySelectorAll(`input[name="${item.id}"]`) : [];
    Array.from(inputs || []).forEach((input) => {
      if (input.dataset && input.dataset.responseTimingBound === 'true') return;
      if (input.dataset) input.dataset.responseTimingBound = 'true';
      input.addEventListener('change', () => recordResponseFirstAnswer(item.id));
    });
  });
}

function buildTimingSnapshot(responses) {
  const answeredIds = Object.keys(responses || {}).filter((id) => responses[id] !== undefined && responses[id] !== null && responses[id] !== '');
  const startedAt = testState.responseTiming.startedAt || getIsoNow();
  const completedAt = getIsoNow();
  const startMs = Date.parse(startedAt);
  const endMs = Date.parse(completedAt);
  const totalSeconds = Number.isFinite(startMs) && Number.isFinite(endMs)
    ? Math.max(0, Math.round((endMs - startMs) / 1000))
    : 0;
  const answeredCount = answeredIds.length;
  const avgSecondsPerAnswered = answeredCount > 0
    ? Math.round((totalSeconds / answeredCount) * 10) / 10
    : 0;
  testState.responseTiming.completedAt = completedAt;
  testState.responseTiming.totalSeconds = totalSeconds;
  testState.responseTiming.answeredCount = answeredCount;
  testState.responseTiming.avgSecondsPerAnswered = avgSecondsPerAnswered;
  return {
    startedAt,
    firstAnswerAt: { ...testState.responseTiming.firstAnswerAt },
    completedAt,
    totalSeconds,
    answeredCount,
    avgSecondsPerAnswered
  };
}

function getCenterForType(type) {
  const n = Number(type);
  if ([2, 3, 4].includes(n)) return 'heart';
  if ([5, 6, 7].includes(n)) return 'head';
  if ([8, 9, 1].includes(n)) return 'body';
  return null;
}

function getDominantCenter(centerScore) {
  const entries = Object.entries(centerScore || {}).filter(([, value]) => Number.isFinite(Number(value)));
  if (!entries.length) return null;
  entries.sort((a, b) => Number(b[1]) - Number(a[1]));
  return entries[0][0] || null;
}

function getLikertResponseStats(responses) {
  const values = Object.values(responses || {}).filter((raw) => raw !== 'A' && raw !== 'B' && raw !== 'heart' && raw !== 'head' && raw !== 'body' && raw !== 'sp' && raw !== 'sx' && raw !== 'so');
  const likert = values.filter((raw) => raw !== 'U' && Number.isFinite(Number(raw))).map((raw) => String(raw));
  const unknownCount = values.filter((raw) => raw === 'U').length;
  const totalCount = likert.length + unknownCount;
  const counts = likert.reduce((out, value) => {
    out[value] = (out[value] || 0) + 1;
    return out;
  }, {});
  const maxSameCount = Object.values(counts).reduce((maxValue, count) => Math.max(maxValue, count), 0);
  return {
    likertCount: likert.length,
    unknownCount,
    totalCount,
    straightLineRatio: likert.length ? maxSameCount / likert.length : 0,
    unknownRatio: totalCount ? unknownCount / totalCount : 0
  };
}

function addQualityFlag(flags, code, severity, label, evidence) {
  flags.push({ code, severity, label, evidence });
}

function buildResponseQualitySnapshot({ responses, timings, scoringAxes, ranked, instinctPct, confidence }) {
  const flags = [];
  const responseStats = getLikertResponseStats(responses || {});
  const timing = timings || {};
  const avgSecondsPerAnswered = Number(timing.avgSecondsPerAnswered) || 0;
  const answeredCount = Number(timing.answeredCount) || 0;
  const topType = ranked && ranked[0] ? Number(ranked[0].type) : null;
  const coreCenter = getCenterForType(topType);
  const dominantCenter = getDominantCenter(scoringAxes && scoringAxes.centerScore);
  const centerCoreAligned = !coreCenter || !dominantCenter || coreCenter === dominantCenter;
  const instinctValues = ['sp', 'sx', 'so']
    .map((code) => Number(instinctPct && instinctPct[code]) || 0)
    .sort((a, b) => b - a);
  const instinctTop = instinctValues[0] || 0;
  const instinctSecond = instinctValues[1] || 0;
  const instinctGap = Math.max(0, instinctTop - instinctSecond);

  if (answeredCount >= 20 && avgSecondsPerAnswered > 0 && avgSecondsPerAnswered < 4) {
    addQualityFlag(flags, 'too_fast_total', 'caution', '응답 시간이 매우 짧음', `${answeredCount}문항 평균 ${avgSecondsPerAnswered.toFixed(1)}초`);
  }
  if (responseStats.likertCount >= 8 && responseStats.straightLineRatio >= 0.75) {
    addQualityFlag(flags, 'straight_lining', 'low', '같은 점수 반복이 많음', `리커트 응답의 ${Math.round(responseStats.straightLineRatio * 100)}%가 같은 값입니다.`);
  }
  if (responseStats.totalCount >= 8 && responseStats.unknownRatio >= 0.25) {
    addQualityFlag(flags, 'unknown_overuse', 'caution', '비채점 응답이 많음', `응답 중 ${Math.round(responseStats.unknownRatio * 100)}%가 잘 모르겠다/둘 다 아니다입니다.`);
  }
  if (!centerCoreAligned && confidence !== '높음') {
    addQualityFlag(flags, 'center_core_mismatch', 'caution', '센터 응답과 코어 결과가 충돌함', `센터는 ${dominantCenter}, 코어 ${topType}번은 ${coreCenter} 센터입니다.`);
  }
  if (instinctTop < 35 || instinctGap < 10) {
    addQualityFlag(flags, 'instinct_unclear', 'caution', '본능 점수가 선명하지 않음', `최상위 본능 ${instinctTop}%, 2순위와 차이 ${instinctGap}%`);
  }

  const level = flags.some((flag) => flag.severity === 'low')
    ? 'low'
    : flags.length
      ? 'caution'
      : 'good';

  return {
    level,
    flags,
    metrics: {
      totalSeconds: Number(timing.totalSeconds) || 0,
      avgSecondsPerAnswered,
      answeredCount,
      straightLineRatio: Math.round(responseStats.straightLineRatio * 1000) / 1000,
      unknownRatio: Math.round(responseStats.unknownRatio * 1000) / 1000,
      centerCoreAligned,
      dominantCenter,
      coreCenter,
      instinctGap,
      instinctTop
    }
  };
}

function getCoreResolution(final) {
  const ranked = Object.keys(final).map((k)=>({type:parseInt(k,10), score:final[k]})).sort((a,b)=>b.score-a.score);
  const max = ranked[0].score;
  const sec = ranked[1].score;
  const diff = max > 0 ? (max-sec)/max : 0;
  return {
    ranked,
    core: ranked[0].type,
    coreResolved: max !== sec && diff >= TEST_CONFIG.thresholds.coreReserveDiff
  };
}

function getRecentStatePressure() {
  const values = q1
    .filter((q) => q.state)
    .map((q) => toScore(testState.phase1Responses[q.id]))
    .filter((score) => score !== null);
  if (!values.length) return 3;
  return values.reduce((sum, score) => sum + score, 0) / values.length;
}

function addInstinctScoresFromResponses(responses, instinctScores) {
  q1.forEach((item) => {
    if (item.inst) {
      const score = toScore(responses[item.id]);
      if (score !== null) instinctScores[item.inst] += score;
      return;
    }
    if (item.format === 'abc' && item.instinctChoice) {
      const raw = responses[item.id];
      const option = (item.options || []).find((candidate) => candidate.value === raw);
      const code = option && (option.inst || option.value);
      if (code && Object.prototype.hasOwnProperty.call(instinctScores, code)) {
        const points = Number.isFinite(Number(option.points))
          ? Number(option.points)
          : TEST_CONFIG.weights.instinctAttentionChoice;
        instinctScores[code] += points;
      }
    }
  });
  return instinctScores;
}

function appendQuestionsOnce(target, questions) {
  const existing = new Set(target.map((question) => question.id));
  questions.forEach((question) => {
    if (!existing.has(question.id)) {
      target.push(question);
      existing.add(question.id);
    }
  });
}

function appendStateAnxietyTieBreakersForType6(ranked, topTypes, recentStress) {
  if (recentStress < TEST_CONFIG.thresholds.stressCorrectionStart) return false;
  const scoreByType = ranked.reduce((out, row) => {
    out[row.type] = row.score;
    return out;
  }, {});
  const sixScore = scoreByType[6] || 0;
  const sixRank = ranked.findIndex((row) => row.type === 6);
  if (!sixScore || (sixRank > 2 && !topTypes.includes(6))) return false;

  const pairSpecs = [
    { rival: 1, key: 't16', questions: tb16 },
    { rival: 5, key: 't56', questions: tb56 },
    { rival: 9, key: 't69', questions: tb69 }
  ].map((spec) => {
    const rivalScore = scoreByType[spec.rival] || 0;
    const margin = Math.abs(sixScore - rivalScore) / Math.max(sixScore, rivalScore, 1);
    return { ...spec, rivalScore, margin };
  });

  let selectedPairs = pairSpecs.filter((spec) => (
    spec.rivalScore > 0 &&
    spec.margin <= TEST_CONFIG.thresholds.stateAnxietySixRivalMargin
  ));
  if (!selectedPairs.length) {
    selectedPairs = pairSpecs.sort((a, b) => b.rivalScore - a.rivalScore).slice(0, 1);
  }

  selectedPairs.forEach((spec) => {
    if (testState.tie[spec.key] && !testState.tie[spec.key].enabled) {
      testState.tie[spec.key] = {
        enabled: true,
        weight: (TEST_CONFIG.weights.tieBreaker.near * TEST_CONFIG.corrections.stateAnxietyTieWeightBoost) / Math.max(spec.questions.length, 1),
        margin: spec.margin
      };
      appendQuestionsOnce(testState.phase2Questions, spec.questions);
    }
  });

  return selectedPairs.length > 0;
}

function calculateStateStressAdjustment(final, recentStress) {
  const base = {
    applied: false,
    recentStress,
    type6Damp: 0,
    rivalType: null,
    rivalMargin: null
  };
  if (recentStress < TEST_CONFIG.thresholds.stressCorrectionStart) return base;
  const type6Score = Number(final && final[6]) || 0;
  if (type6Score <= 0) return base;

  const rivals = [1, 5, 9]
    .map((type) => ({ type, score: Number(final[type]) || 0 }))
    .sort((a, b) => b.score - a.score);
  const strongest = rivals[0];
  const margin = Math.abs(type6Score - strongest.score) / Math.max(type6Score, strongest.score, 1);
  if (strongest.score <= 0 || (type6Score < strongest.score && margin > TEST_CONFIG.thresholds.stateAnxietySixRivalMargin)) {
    return { ...base, rivalType: strongest.type, rivalMargin: margin };
  }

  const stressScale = recentStress - (TEST_CONFIG.thresholds.stressCorrectionStart - 1);
  const type6Damp = Math.min(
    type6Score * TEST_CONFIG.corrections.stateAnxietyType6MaxDampRatio,
    stressScale * TEST_CONFIG.corrections.stateAnxietyType6Damp
  );
  if (type6Damp <= 0) return { ...base, rivalType: strongest.type, rivalMargin: margin };
  return {
    applied: true,
    recentStress,
    type6Damp,
    rivalType: strongest.type,
    rivalMargin: margin
  };
}

function applyStateStressAdjustment(final, evidence, recentStress) {
  const adjustment = calculateStateStressAdjustment(final, recentStress);
  if (!adjustment.applied) return adjustment;
  final[6] = Math.max(0, final[6] - adjustment.type6Damp);
  if (evidence && evidence[6]) {
    evidence[6].push({
      points: -adjustment.type6Damp,
      text: '[상태성 불안 보정] 최근 2주 상태 문항이 높아 6번의 위험 확인 반응을 그대로 확정하지 않고 1/5/9 감별 기준으로 보정했습니다.'
    });
  }
  return adjustment;
}

function buildAxisScore(typeScores, groups) {
  return Object.keys(groups).reduce((out, key) => {
    out[key] = groups[key].reduce((sum, type) => sum + (Number(typeScores[type]) || 0), 0);
    return out;
  }, {});
}

function buildScoringAxesSnapshot({ coreTypeScore, instinctScore, stateStressAdjustment }) {
  const coreScores = { ...(coreTypeScore || {}) };
  return {
    centerScore: buildAxisScore(coreScores, {
      body: [8, 9, 1],
      heart: [2, 3, 4],
      head: [5, 6, 7]
    }),
    harmonicScore: buildAxisScore(coreScores, {
      positive: [2, 7, 9],
      reactive: [4, 6, 8],
      competency: [1, 3, 5]
    }),
    hornevianScore: buildAxisScore(coreScores, {
      assertive: [3, 7, 8],
      compliant: [1, 2, 6],
      withdrawn: [4, 5, 9]
    }),
    coreTypeScore: coreScores,
    instinctScore: { ...(instinctScore || {}) },
    stateStressAdjustment: stateStressAdjustment || { applied: false }
  };
}

function scorePhase1Item(item, raw, addScore) {
  if (!item || raw === undefined || raw === null) return;

  if (item.format === 'ab') {
    if (raw === 'U') return;
    const type = raw === 'A' ? item.leftType : item.rightType;
    const text = raw === 'A' ? item.a : item.b;
    addScore(type, TEST_CONFIG.weights.phase1Binary, item.id, text);
    return;
  }

  if (item.format === 'abc' && item.centerChoice) {
    const option = (item.options || []).find((candidate) => candidate.value === raw);
    if (!option || !Array.isArray(option.types)) return;
    const points = Number.isFinite(Number(option.points))
      ? Number(option.points)
      : TEST_CONFIG.weights.phase1CenterChoice;
    const text = getChoiceOptionText(option);
    option.types.forEach((type) => addScore(type, points, item.id, text));
    return;
  }

  if (item.format === 'abc' && item.instinctChoice) return;

  const score = toScore(raw);
  if (score === null) return;
  if (item.triad) {
    item.triad.forEach((type) => addScore(type, score * (item.triadWeight || 1), item.id));
  }
  if (item.id && item.id.startsWith('c')) {
    addScore(item.type, score * TEST_CONFIG.weights.phase1Core * (item.scoreWeight || 1), item.id);
  }
}

function maybeShowPhase4(resultData) {
  const resolution = getCoreResolution(resultData.final);
  const phase4Set = resolution.coreResolved ? phase4TypeSets[resolution.core] : null;
  if (!phase4Set) return false;

  testState.phase4Questions = [
    ...buildSubtypeBehaviorQuestions(resolution.core),
    ...buildWingQuestionSet(resolution.core)
  ];
  testState.pendingResult = resultData;
  renderQuestions('phase4-container', testState.phase4Questions, 'p4');
  document.getElementById('phase1-form').classList.add('hidden');
  document.getElementById('phase2-form').classList.add('hidden');
  document.getElementById('phase3-form').classList.add('hidden');
  document.getElementById('phase4-form').classList.remove('hidden');
  document.getElementById('step-label').innerText = uiText('step5Label');
  document.getElementById('step-counter').innerText = '5 / 5';
  setProgress(100);
  requestAnimationFrame(() => scrollToTopSmart());
  return true;
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
  const report = target.querySelector('.er-premium-report');

  const prev = btn ? btn.innerText : '';
  if (btn) {
    btn.disabled = true;
    btn.innerText = uiText('pdfPreparing');
    btn.classList.add('opacity-60', 'cursor-not-allowed');
  }

  try {
    await ensurePdfLibsLoaded();
    if (!window.html2canvas || !window.jspdf || !window.jspdf.jsPDF) {
      throw new Error('PDF library unavailable');
    }
    if (btn) btn.innerText = uiText('pdfGenerating');
    if (report) {
      report.classList.add('er-pdf-export');
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
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
    alert(uiText('pdfError'));
  } finally {
    if (report) report.classList.remove('er-pdf-export');
    if (btn) {
      btn.disabled = false;
      btn.innerText = prev || uiText('downloadPdf');
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
  const [leftType, rightType] = key.split('_').map((v) => parseInt(v, 10));
  const preset = postTieBreakerMap[key];
  if (preset) {
    return {
      id: `post_tb_${leftType}_${rightType}`,
      format: 'ab',
      leftType,
      rightType,
      q: pageLang === 'en'
        ? `Between Type ${leftType} and Type ${rightType}, which response feels more automatic for you?`
        : `${leftType}번 vs ${rightType}번 중 내 자동반응에 더 가까운 쪽을 고르세요.`,
      a: pageLang === 'en' ? `A. ${preset.aEn || TYPE_PROMPT_EN[leftType]}` : preset.a,
      b: pageLang === 'en' ? `B. ${preset.bEn || TYPE_PROMPT_EN[rightType]}` : preset.b
    };
  }
  return {
    id: `post_tb_${leftType}_${rightType}`,
    format: 'ab',
    leftType,
    rightType,
    q: pageLang === 'en'
      ? `Under pressure, which pattern feels more natural to you?`
      : `${leftType}번 vs ${rightType}번 중, 압박 상황에서 더 자동으로 나오는 반응을 선택해 주세요.`,
    a: pageLang === 'en'
      ? `A. ${TYPE_PROMPT_EN[leftType]}`
      : ((deep[leftType] && deep[leftType][0]) ? deep[leftType][0].q : `${leftType}번 특성이 더 가깝다.`),
    b: pageLang === 'en'
      ? `B. ${TYPE_PROMPT_EN[rightType]}`
      : ((deep[rightType] && deep[rightType][0]) ? deep[rightType][0].q : `${rightType}번 특성이 더 가깝다.`)
  };
}

function renderTypeElimination() {
  const root = document.getElementById('elim-container');
  if (!root) return;
  const markLabel = uiText('elimMark');
  root.innerHTML = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((type) => {
    const sketch = TYPE_ELIMINATION_SKETCHES[type] || {};
    const text = pageLang === 'en' ? (sketch.en || '') : (sketch.ko || '');
    return `
      <label class="block cursor-pointer">
        <input type="checkbox" name="elim-type" value="${type}" class="sr-only peer" data-elim-type="${type}">
        <div class="rounded-xl border-2 border-gray-200 bg-white p-4 peer-checked:border-[#30322D] peer-checked:bg-[#FBFAF5] peer-focus-visible:ring-2 peer-focus-visible:ring-[#30322D]/30 smooth">
          <div class="flex items-start justify-between gap-3">
            <div>
              <span class="inline-block text-xs font-bold text-[#30322D] mb-1">${type}${pageLang === 'en' ? '' : '번'}</span>
              <p class="text-sm text-gray-700 leading-relaxed m-0">${text}</p>
            </div>
            <span class="shrink-0 text-[11px] font-bold tracking-wide text-gray-400 peer-checked:text-[#30322D]">${markLabel}</span>
          </div>
        </div>
      </label>
    `;
  }).join('');
  // peer-checked on sibling span doesn't work across nested structure — sync via change
  root.querySelectorAll('input[name="elim-type"]').forEach((input) => {
    const badge = input.parentElement.querySelector('span.shrink-0');
    const sync = () => {
      if (!badge) return;
      badge.classList.toggle('text-[#30322D]', input.checked);
      badge.classList.toggle('text-gray-400', !input.checked);
    };
    input.addEventListener('change', sync);
    sync();
  });
}

function readEliminatedTypesFromUi() {
  return Array.from(document.querySelectorAll('input[name="elim-type"]:checked'))
    .map((el) => parseInt(el.value, 10))
    .filter((n) => Number.isFinite(n));
}

function selectCandidateTypesWithElimination(ranked, eliminated) {
  const top = ranked[0].score;
  const topType = ranked[0].type;
  let cands = ranked.filter((x) => x.score >= top * TEST_CONFIG.thresholds.candidateRatio).map((x) => x.type);
  cands = [...new Set([...cands, topType, topType === 1 ? 9 : topType - 1, topType === 9 ? 1 : topType + 1])];
  if (cands.length < TEST_CONFIG.thresholds.minCandidates) {
    cands = [...new Set([...cands, ...ranked.slice(0, TEST_CONFIG.thresholds.minCandidates).map((x) => x.type)])];
  }
  let topTypes = ranked.map((x) => x.type).filter((t) => cands.includes(t)).slice(0, TEST_CONFIG.thresholds.maxCandidates);

  const elim = new Set((eliminated || []).map(Number));
  const resurrectRatio = TEST_CONFIG.thresholds.eliminationResurrectRatio;
  const resurrected = [];
  const shouldKeepEliminated = (type) => {
    const index = ranked.findIndex((row) => row.type === type);
    const row = ranked[index];
    if (index === 0 || index === 1) return true;
    if (row && top > 0 && row.score >= top * resurrectRatio) return true;
    return false;
  };

  topTypes = topTypes.filter((type) => {
    if (!elim.has(type)) return true;
    if (shouldKeepEliminated(type)) {
      resurrected.push(type);
      return true;
    }
    return false;
  });

  if (topTypes.length < TEST_CONFIG.thresholds.minCandidates) {
    for (const row of ranked) {
      if (topTypes.includes(row.type)) continue;
      if (elim.has(row.type) && !shouldKeepEliminated(row.type)) continue;
      if (elim.has(row.type) && shouldKeepEliminated(row.type) && !resurrected.includes(row.type)) {
        resurrected.push(row.type);
      }
      topTypes.push(row.type);
      if (topTypes.length >= TEST_CONFIG.thresholds.minCandidates) break;
    }
  }

  return {
    topTypes: topTypes.slice(0, TEST_CONFIG.thresholds.maxCandidates),
    resurrected: [...new Set(resurrected)]
  };
}

function submitTypeElimination() {
  const eliminated = readEliminatedTypesFromUi();
  const maxElim = TEST_CONFIG.thresholds.maxEliminatedTypes;
  const msg = document.getElementById('validation-msg-elim');
  if (eliminated.length > maxElim) {
    if (msg) {
      msg.textContent = uiText('elimTooMany');
      msg.classList.remove('hidden');
    }
    return;
  }
  if (msg) msg.classList.add('hidden');
  testState.eliminatedTypes = eliminated;
  testState.eliminationResurrected = [];

  document.getElementById('phase0-form').classList.add('hidden');
  document.getElementById('phase1-form').classList.remove('hidden');
  document.getElementById('phase2-form').classList.add('hidden');
  document.getElementById('phase3-form').classList.add('hidden');
  document.getElementById('phase4-form').classList.add('hidden');
  document.getElementById('step-label').innerText = uiText('step2Label');
  document.getElementById('step-counter').innerText = '2 / 5';
  setProgress(40);
  requestAnimationFrame(() => scrollToTopSmart());
}

function submitPhase1() {
  if (!validate(q1, 'p1', 'validation-msg-1')) return;
  testState.phase3Question = null;
  testState.phase4Questions = [];
  testState.pendingResult = null;
  const center = {1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};

  q1.forEach((item) => {
    const sel = document.querySelector(`input[name="${item.id}"]:checked`);
    const raw = sel.value;
    testState.phase1Responses[item.id] = raw;
    scorePhase1Item(item, raw, (type, points) => {
      center[type] += points;
    });
  });

  const ranked = Object.keys(center).map((k)=>({type:parseInt(k,10), score:center[k]})).sort((a,b)=>b.score-a.score);
  const top = ranked[0].score;
  const selection = selectCandidateTypesWithElimination(ranked, testState.eliminatedTypes);
  const topTypes = selection.topTypes;
  testState.eliminationResurrected = selection.resurrected;

  testState.phase2Questions = [];
  topTypes.forEach((t)=>{ if (deep[t]) testState.phase2Questions = testState.phase2Questions.concat(deep[t]); });
  topTypes.forEach((t) => {
    if (counterTypeQuestions[t]) testState.phase2Questions.push(counterTypeQuestions[t]);
  });

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
      testState.tie.t36 = { enabled: true, weight: TEST_CONFIG.weights.tieBreaker.near / Math.max(tb36.length, 1), margin: top2Diff };
      testState.phase2Questions = testState.phase2Questions.concat(tb36);
    } else if (typeA === 5 && typeB === 6) {
      testState.tie.t56 = { enabled: true, weight: TEST_CONFIG.weights.tieBreaker.near / Math.max(tb56.length, 1), margin: top2Diff };
      testState.phase2Questions = testState.phase2Questions.concat(tb56);
    } else if (typeA === 5 && typeB === 8) {
      testState.tie.t58 = { enabled: true, weight: TEST_CONFIG.weights.tieBreaker.near / Math.max(tb58.length, 1), margin: top2Diff };
      testState.phase2Questions = testState.phase2Questions.concat(tb58);
    } else if (typeA === 5 && typeB === 9) {
      testState.tie.t59 = { enabled: true, weight: TEST_CONFIG.weights.tieBreaker.near / Math.max(tb59.length, 1), margin: top2Diff };
      testState.phase2Questions = testState.phase2Questions.concat(tb59);
    } else if (typeA === 1 && typeB === 3) {
      testState.tie.t31 = { enabled: true, weight: TEST_CONFIG.weights.tieBreaker.near / Math.max(tb31.length, 1), margin: top2Diff };
      testState.phase2Questions = testState.phase2Questions.concat(tb31);
    } else if (typeA === 1 && typeB === 4) {
      testState.tie.t14 = { enabled: true, weight: TEST_CONFIG.weights.tieBreaker.near / Math.max(tb14.length, 1), margin: top2Diff };
      testState.phase2Questions = testState.phase2Questions.concat(tb14);
    } else if (typeA === 1 && typeB === 5) {
      testState.tie.t15 = { enabled: true, weight: TEST_CONFIG.weights.tieBreaker.near / Math.max(tb15.length, 1), margin: top2Diff };
      testState.phase2Questions = testState.phase2Questions.concat(tb15);
    } else if (typeA === 1 && typeB === 6) {
      testState.tie.t16 = { enabled: true, weight: TEST_CONFIG.weights.tieBreaker.near / Math.max(tb16.length, 1), margin: top2Diff };
      testState.phase2Questions = testState.phase2Questions.concat(tb16);
    } else if (typeA === 1 && typeB === 9) {
      testState.tie.t19 = { enabled: true, weight: TEST_CONFIG.weights.tieBreaker.near / Math.max(tb19.length, 1), margin: top2Diff };
      testState.phase2Questions = testState.phase2Questions.concat(tb19);
    } else if (typeA === 3 && typeB === 5) {
      testState.tie.t35 = { enabled: true, weight: TEST_CONFIG.weights.tieBreaker.near / Math.max(tb35.length, 1), margin: top2Diff };
      testState.phase2Questions = testState.phase2Questions.concat(tb35);
    } else if (typeA === 3 && typeB === 7) {
      testState.tie.t37 = { enabled: true, weight: TEST_CONFIG.weights.tieBreaker.near / Math.max(tb37.length, 1), margin: top2Diff };
      testState.phase2Questions = testState.phase2Questions.concat(tb37);
    } else if (typeA === 3 && typeB === 8) {
      testState.tie.t38 = { enabled: true, weight: TEST_CONFIG.weights.tieBreaker.near / Math.max(tb38.length, 1), margin: top2Diff };
      testState.phase2Questions = testState.phase2Questions.concat(tb38);
    } else if (typeA === 3 && typeB === 9) {
      testState.tie.t39 = { enabled: true, weight: TEST_CONFIG.weights.tieBreaker.near / Math.max(tb39.length, 1), margin: top2Diff };
      testState.phase2Questions = testState.phase2Questions.concat(tb39);
    } else if (typeA === 4 && typeB === 5) {
      testState.tie.t45 = { enabled: true, weight: TEST_CONFIG.weights.tieBreaker.near / Math.max(tb45.length, 1), margin: top2Diff };
      testState.phase2Questions = testState.phase2Questions.concat(tb45);
    } else if (typeA === 4 && typeB === 6) {
      testState.tie.t46 = { enabled: true, weight: TEST_CONFIG.weights.tieBreaker.near / Math.max(tb46.length, 1), margin: top2Diff };
      testState.phase2Questions = testState.phase2Questions.concat(tb46);
    } else if (typeA === 4 && typeB === 7) {
      testState.tie.t47 = { enabled: true, weight: TEST_CONFIG.weights.tieBreaker.near / Math.max(tb47.length, 1), margin: top2Diff };
      testState.phase2Questions = testState.phase2Questions.concat(tb47);
    } else if (typeA === 4 && typeB === 8) {
      testState.tie.t48 = { enabled: true, weight: TEST_CONFIG.weights.tieBreaker.near / Math.max(tb48.length, 1), margin: top2Diff };
      testState.phase2Questions = testState.phase2Questions.concat(tb48);
    } else if (typeA === 6 && typeB === 8) {
      testState.tie.t68 = { enabled: true, weight: TEST_CONFIG.weights.tieBreaker.near / Math.max(tb68.length, 1), margin: top2Diff };
      testState.phase2Questions = testState.phase2Questions.concat(tb68);
    } else if (typeA === 6 && typeB === 9) {
      testState.tie.t69 = { enabled: true, weight: TEST_CONFIG.weights.tieBreaker.near / Math.max(tb69.length, 1), margin: top2Diff };
      testState.phase2Questions = testState.phase2Questions.concat(tb69);
    } else if (typeA === 2 && typeB === 4) {
      testState.tie.t24 = { enabled: true, weight: TEST_CONFIG.weights.tieBreaker.near / Math.max(tb24.length, 1), margin: top2Diff };
      testState.phase2Questions = testState.phase2Questions.concat(tb24);
    } else if (typeA === 2 && typeB === 6) {
      testState.tie.t26 = { enabled: true, weight: TEST_CONFIG.weights.tieBreaker.near / Math.max(tb26.length, 1), margin: top2Diff };
      testState.phase2Questions = testState.phase2Questions.concat(tb26);
    } else if (typeA === 2 && typeB === 8) {
      testState.tie.t28 = { enabled: true, weight: TEST_CONFIG.weights.tieBreaker.near / Math.max(tb28.length, 1), margin: top2Diff };
      testState.phase2Questions = testState.phase2Questions.concat(tb28);
    } else if (typeA === 2 && typeB === 9) {
      testState.tie.t29 = { enabled: true, weight: TEST_CONFIG.weights.tieBreaker.near / Math.max(tb29.length, 1), margin: top2Diff };
      testState.phase2Questions = testState.phase2Questions.concat(tb29);
    } else if (typeA === 1 && typeB === 7) {
      testState.tie.t71 = { enabled: true, weight: TEST_CONFIG.weights.tieBreaker.type71Default / Math.max(tb71.length, 1), margin: top2Diff };
      testState.phase2Questions = testState.phase2Questions.concat(tb71);
    } else if (typeA === 7 && typeB === 8) {
      testState.tie.t78 = { enabled: true, weight: TEST_CONFIG.weights.tieBreaker.type78Default / Math.max(tb78.length, 1), margin: top2Diff };
      testState.phase2Questions = testState.phase2Questions.concat(tb78);
    } else if (typeA === 8 && typeB === 9) {
      testState.tie.t89 = { enabled: true, weight: TEST_CONFIG.weights.tieBreaker.near / Math.max(tb89.length, 1), margin: top2Diff };
      testState.phase2Questions = testState.phase2Questions.concat(tb89);
    } else if (typeA === 1 && typeB === 8) {
      testState.tie.t18 = { enabled: true, weight: TEST_CONFIG.weights.tieBreaker.near / Math.max(tb18.length, 1), margin: top2Diff };
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
        q: pageLang === 'en'
          ? 'Which statement sounds more like your natural pattern?'
          : (custom ? custom.q : '다음 두 문장 중 자신에게 더 가까운 쪽을 선택해 주세요.'),
        a: pageLang === 'en' ? `A. ${TYPE_PROMPT_EN[typeA]}` : qA,
        b: pageLang === 'en' ? `B. ${TYPE_PROMPT_EN[typeB]}` : qB
      }];
      testState.tie.tGeneric = { enabled: true, typeA, typeB, weight: TEST_CONFIG.weights.tieBreaker.default };
      testState.phase2Questions = testState.phase2Questions.concat(genericTb);
    }
  }
  appendStateAnxietyTieBreakersForType6(ranked, topTypes, getRecentStatePressure());

  const inst = {sp:0,sx:0,so:0};
  addInstinctScoresFromResponses(testState.phase1Responses, inst);
  const s3 = center[3];
  const m3top = top>0 ? (top-s3)/top : 1;
  const e3sx = topTypes.includes(3) &&
    inst.sx >= Math.max(inst.sp, inst.so)-TEST_CONFIG.thresholds.tie3sxNearTopInstinctGap &&
    (ranked[0].type===3 || m3top<=TEST_CONFIG.thresholds.tie3sxMargin);
  testState.tie.t3sx = {
    enabled:e3sx,
    weight:(m3top<=TEST_CONFIG.thresholds.tieCloseBand?TEST_CONFIG.weights.tieBreaker.close:(m3top<=TEST_CONFIG.thresholds.tie3sxMargin?TEST_CONFIG.weights.tieBreaker.near:TEST_CONFIG.weights.tieBreaker.default)) * 0.75,
    margin:m3top
  };
  if (e3sx) testState.phase2Questions = testState.phase2Questions.concat(tb3sx);

  testState.tie.t7wing = {enabled: topTypes.includes(7) || ranked[0].type===7, weight:TEST_CONFIG.weights.tieBreaker.wing7, margin:null};
  if (testState.tie.t7wing.enabled) testState.phase2Questions = testState.phase2Questions.concat(tb7wing);

  document.getElementById('phase1-form').classList.add('hidden');
  document.getElementById('phase2-form').classList.remove('hidden');
  document.getElementById('phase3-form').classList.add('hidden');
  document.getElementById('phase4-form').classList.add('hidden');
  setProgress(60);
  document.getElementById('step-label').innerText = uiText('step3Label');
  document.getElementById('step-counter').innerText = '3 / 5';
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
  const counterSignals = {
    1: {sp:0,sx:0,so:0}, 2: {sp:0,sx:0,so:0}, 3: {sp:0,sx:0,so:0},
    4: {sp:0,sx:0,so:0}, 5: {sp:0,sx:0,so:0}, 6: {sp:0,sx:0,so:0},
    7: {sp:0,sx:0,so:0}, 8: {sp:0,sx:0,so:0}, 9: {sp:0,sx:0,so:0}
  };
  const recentStress = getRecentStatePressure();

  q1.forEach((q) => {
    scorePhase1Item(q, testState.phase1Responses[q.id], addScore);
  });

  testState.phase2Questions.forEach((q) => {
    if (q.format === 'ab') {
      const el = document.querySelector(`input[name="${q.id}"]:checked`);
      if (!el) return;
      const choice = el.value;
      if (choice === 'U') return;
      let w = TEST_CONFIG.weights.phase2Base;
      if (q.id.startsWith('tb_1_8_') && testState.tie.t18.enabled) w = testState.tie.t18.weight;
      else if (q.id.startsWith('tb_1_4_') && testState.tie.t14.enabled) w = testState.tie.t14.weight;
      else if (q.id.startsWith('tb_1_5_') && testState.tie.t15.enabled) w = testState.tie.t15.weight;
      else if (q.id.startsWith('tb_1_6_') && testState.tie.t16.enabled) w = testState.tie.t16.weight;
      else if (q.id.startsWith('tb_1_9_') && testState.tie.t19.enabled) w = testState.tie.t19.weight;
      else if (q.id.startsWith('tb_2_4_') && testState.tie.t24.enabled) w = testState.tie.t24.weight;
      else if (q.id.startsWith('tb_2_6_') && testState.tie.t26.enabled) w = testState.tie.t26.weight;
      else if (q.id.startsWith('tb_2_8_') && testState.tie.t28.enabled) w = testState.tie.t28.weight;
      else if (q.id.startsWith('tb_2_9_') && testState.tie.t29.enabled) w = testState.tie.t29.weight;
      else if (q.id.startsWith('tb_3_6') && testState.tie.t36.enabled) w = testState.tie.t36.weight;
      else if (q.id.startsWith('tb_5_6') && testState.tie.t56.enabled) w = testState.tie.t56.weight;
      else if (q.id.startsWith('tb_5_8_') && testState.tie.t58.enabled) w = testState.tie.t58.weight;
      else if (q.id.startsWith('tb_5_9_') && testState.tie.t59.enabled) w = testState.tie.t59.weight;
      else if (q.id.startsWith('tb_3_1_') && testState.tie.t31.enabled) w = testState.tie.t31.weight;
      else if (q.id.startsWith('tb_3_5_') && testState.tie.t35.enabled) w = testState.tie.t35.weight;
      else if (q.id.startsWith('tb_3_7_') && testState.tie.t37.enabled) w = testState.tie.t37.weight;
      else if (q.id.startsWith('tb_3_8_') && testState.tie.t38.enabled) w = testState.tie.t38.weight;
      else if (q.id.startsWith('tb_3_9_') && testState.tie.t39.enabled) w = testState.tie.t39.weight;
      else if (q.id.startsWith('tb_4_5_') && testState.tie.t45.enabled) w = testState.tie.t45.weight;
      else if (q.id.startsWith('tb_4_6_') && testState.tie.t46.enabled) w = testState.tie.t46.weight;
      else if (q.id.startsWith('tb_4_7_') && testState.tie.t47.enabled) w = testState.tie.t47.weight;
      else if (q.id.startsWith('tb_4_8_') && testState.tie.t48.enabled) w = testState.tie.t48.weight;
      else if (q.id.startsWith('tb_6_8_') && testState.tie.t68.enabled) w = testState.tie.t68.weight;
      else if (q.id.startsWith('tb_6_9_') && testState.tie.t69.enabled) w = testState.tie.t69.weight;
      else if (q.id.startsWith('tb_7_1_') && testState.tie.t71.enabled) w = testState.tie.t71.weight;
      else if (q.id.startsWith('tb_7_8_') && testState.tie.t78.enabled) w = testState.tie.t78.weight;
      else if (q.id.startsWith('tb_8_9_') && testState.tie.t89.enabled) w = testState.tie.t89.weight;
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
    if (q.counterType) {
      const coreBoost = val * TEST_CONFIG.weights.tieBreaker.counterType;
      const instinctBoost = val * TEST_CONFIG.weights.tieBreaker.counterInstinct;
      addScore(q.type, coreBoost, q.id);
      counterSignals[q.type][q.inst] += instinctBoost;
      return;
    }

    let w = q.weight || TEST_CONFIG.weights.phase2Base;
    if (q.id.startsWith('tb_3_6') && testState.tie.t36.enabled) w = testState.tie.t36.weight;
    else if (q.id.startsWith('tb_1_4_') && testState.tie.t14.enabled) w = testState.tie.t14.weight;
    else if (q.id.startsWith('tb_1_5_') && testState.tie.t15.enabled) w = testState.tie.t15.weight;
    else if (q.id.startsWith('tb_1_6_') && testState.tie.t16.enabled) w = testState.tie.t16.weight;
    else if (q.id.startsWith('tb_1_9_') && testState.tie.t19.enabled) w = testState.tie.t19.weight;
    else if (q.id.startsWith('tb_2_4_') && testState.tie.t24.enabled) w = testState.tie.t24.weight;
    else if (q.id.startsWith('tb_2_6_') && testState.tie.t26.enabled) w = testState.tie.t26.weight;
    else if (q.id.startsWith('tb_2_8_') && testState.tie.t28.enabled) w = testState.tie.t28.weight;
    else if (q.id.startsWith('tb_2_9_') && testState.tie.t29.enabled) w = testState.tie.t29.weight;
    else if (q.id.startsWith('tb_5_6') && testState.tie.t56.enabled) w = testState.tie.t56.weight;
    else if (q.id.startsWith('tb_5_8_') && testState.tie.t58.enabled) w = testState.tie.t58.weight;
    else if (q.id.startsWith('tb_5_9_') && testState.tie.t59.enabled) w = testState.tie.t59.weight;
    else if (q.id.startsWith('tb_3_1_') && testState.tie.t31.enabled) w = testState.tie.t31.weight;
    else if (q.id.startsWith('tb_3_5_') && testState.tie.t35.enabled) w = testState.tie.t35.weight;
    else if (q.id.startsWith('tb_3_7_') && testState.tie.t37.enabled) w = testState.tie.t37.weight;
    else if (q.id.startsWith('tb_3_8_') && testState.tie.t38.enabled) w = testState.tie.t38.weight;
    else if (q.id.startsWith('tb_3_9_') && testState.tie.t39.enabled) w = testState.tie.t39.weight;
    else if (q.id.startsWith('tb_4_5_') && testState.tie.t45.enabled) w = testState.tie.t45.weight;
    else if (q.id.startsWith('tb_4_6_') && testState.tie.t46.enabled) w = testState.tie.t46.weight;
    else if (q.id.startsWith('tb_4_7_') && testState.tie.t47.enabled) w = testState.tie.t47.weight;
    else if (q.id.startsWith('tb_4_8_') && testState.tie.t48.enabled) w = testState.tie.t48.weight;
    else if (q.id.startsWith('tb_6_8_') && testState.tie.t68.enabled) w = testState.tie.t68.weight;
    else if (q.id.startsWith('tb_6_9_') && testState.tie.t69.enabled) w = testState.tie.t69.weight;
    else if (q.id.startsWith('tb_7_1_') && testState.tie.t71.enabled) w = testState.tie.t71.weight;
    else if (q.id.startsWith('tb_7_8_') && testState.tie.t78.enabled) w = testState.tie.t78.weight;
    else if (q.id.startsWith('tb_8_9_') && testState.tie.t89.enabled) w = testState.tie.t89.weight;
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
  const stateStressAdjustment = applyStateStressAdjustment(final, evidence, recentStress);

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
    testState.pendingResult = { final, evidence, recentStress, stateStressAdjustment, tb7w6, tb7w8, sxBoost, counterSignals };
    renderQuestions('phase3-container', [testState.phase3Question], 'p3');
    document.getElementById('phase2-form').classList.add('hidden');
    document.getElementById('phase3-form').classList.remove('hidden');
    document.getElementById('phase4-form').classList.add('hidden');
    document.getElementById('step-label').innerText = uiText('step4Label');
    document.getElementById('step-counter').innerText = '4 / 5';
    setProgress(80);
    requestAnimationFrame(() => scrollToTopSmart());
    return;
  }

  const resultData = { final, evidence, recentStress, stateStressAdjustment, tb7w6, tb7w8, sxBoost, counterSignals, phase4: null, postTieApplied: false };
  if (maybeShowPhase4(resultData)) return;
  renderResultFromScores(resultData);
}

function submitPhase3() {
  if (!testState.phase3Question) return;
  if (!validate([testState.phase3Question], 'p3', 'validation-msg-3')) return;
  if (!testState.pendingResult) return;

  const choice = document.querySelector(`input[name="${testState.phase3Question.id}"]:checked`).value;
  let postTieApplied = false;
  if (choice === 'A' || choice === 'B') {
    const boostType = choice === 'A' ? testState.phase3Question.leftType : testState.phase3Question.rightType;
    const boostText = choice === 'A' ? testState.phase3Question.a : testState.phase3Question.b;
    testState.pendingResult.final[boostType] += TEST_CONFIG.weights.postTieBreak;
    testState.pendingResult.evidence[boostType].push({
      points: TEST_CONFIG.weights.postTieBreak,
      text: `[최종 타이브레이커] ${boostText}`
    });
    postTieApplied = true;
  }

  const resultData = {
    ...testState.pendingResult,
    postTieApplied
  };
  if (maybeShowPhase4(resultData)) return;
  renderResultFromScores(resultData);
}

function submitPhase4() {
  if (!testState.phase4Questions.length) return;
  if (!validate(testState.phase4Questions, 'p4', 'validation-msg-4')) return;
  if (!testState.pendingResult) return;

  const subtypeResult = resolvePhase4Subtype(testState.phase4Questions.filter((q) => q.subtypeChoice));
  const wingResult = resolvePhase4Wing(testState.phase4Questions.filter((q) => q.wingChoice));

  renderResultFromScores({
    ...testState.pendingResult,
    phase4: {
      subtypeCode: subtypeResult.subtypeCode,
      subtypeLabel: subtypeResult.subtypeLabel,
      subtypeVotes: subtypeResult.subtypeVotes,
      wingNum: wingResult.wingNum,
      wingVotes: wingResult.wingVotes,
      wingText: wingResult.wingText
    }
  });
}

function snapshotAllDiagnosticResponses() {
  const out = { ...testState.phase1Responses };
  const take = (id) => {
    if (!id) return;
    const el = document.querySelector(`input[name="${id}"]:checked`);
    if (el) out[id] = el.value;
  };
  testState.phase2Questions.forEach((q) => take(q.id));
  if (testState.phase3Question) take(testState.phase3Question.id);
  testState.phase4Questions.forEach((q) => take(q.id));
  return out;
}

function escapeReportHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function clampReportPercent(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.min(100, num));
}

function normalizeMetricRows(rows) {
  const max = Math.max(1, ...rows.map((row) => Math.max(0, Number(row.score) || 0)));
  return rows.map((row) => ({
    ...row,
    percent: clampReportPercent((Math.max(0, Number(row.score) || 0) / max) * 100)
  }));
}

function buildInstinctPctFromScores(instinctScores) {
  const maxByInstinct = { sp: 0, sx: 0, so: 0 };
  q1.forEach((question) => {
    if (question.inst && Object.prototype.hasOwnProperty.call(maxByInstinct, question.inst)) {
      maxByInstinct[question.inst] += 6;
      return;
    }
    if (question.format === 'abc' && question.instinctChoice) {
      (question.options || []).forEach((option) => {
        const code = option.inst || option.value;
        if (Object.prototype.hasOwnProperty.call(maxByInstinct, code)) {
          maxByInstinct[code] += Number.isFinite(Number(option.points))
            ? Number(option.points)
            : TEST_CONFIG.weights.instinctAttentionChoice;
        }
      });
    }
  });
  return ['sp', 'sx', 'so'].reduce((out, code) => {
    const max = Math.max(1, maxByInstinct[code] || 0);
    out[code] = Math.round(clampReportPercent((Number(instinctScores[code]) || 0) / max * 100));
    return out;
  }, {});
}

function getFinalSubtypeCode(instinctCode) {
  if (!instinctCode) return 'sp';
  const first = String(instinctCode).split('/')[0].trim();
  return ['sp', 'sx', 'so'].includes(first) ? first : 'sp';
}

function formatReportHeadline(resultData) {
  const core = resultData.core;
  const instCode = getFinalSubtypeCode(resultData.instinctCode);
  const instincts = window.ERDiagnosticReportContent && window.ERDiagnosticReportContent.instincts;
  const instLabel = (instincts && instincts[instCode] && instincts[instCode].label) || instCode;
  const wingPart = resultData.wingNum
    ? `w${resultData.wingNum}`
    : (pageLang === 'en' ? 'core only' : '순수유형');
  if (pageLang === 'en') {
    return `Type ${core} · ${instLabel} · ${wingPart}`;
  }
  return `${core}번 · ${instLabel} · ${wingPart}`;
}

function notifyEmbedResize() {
  if (!window.parent || window.parent === window) return;
  const height = Math.max(
    document.documentElement.scrollHeight || 0,
    document.body ? document.body.scrollHeight : 0,
    document.documentElement.offsetHeight || 0
  );
  try {
    window.parent.postMessage({ type: 'er-test-embed-resize', height }, '*');
  } catch (_err) {
    // cross-origin embed — ignore
  }
}

function scheduleEmbedResize() {
  notifyEmbedResize();
  requestAnimationFrame(notifyEmbedResize);
  setTimeout(notifyEmbedResize, 120);
  setTimeout(notifyEmbedResize, 480);
}

function isTestEmbedded() {
  try {
    return window.parent && window.parent !== window;
  } catch (_err) {
    return false;
  }
}

function buildTestResultSummary(model) {
  return {
    source: 'test',
    finalLabel: model.display && model.display.final ? model.display.final : '',
    coreType: model.core,
    wingLabel: model.display && model.display.wing ? model.display.wing : '',
    subtypeSummary: model.display && model.display.subtype ? model.display.subtype : '',
    instinctSummary: model.instinctCode || '',
    confidence: model.display && model.display.confidence ? model.display.confidence : '',
    reportKey: model.reportKey || ''
  };
}

function persistTestResultSummary(summary) {
  if (!summary) return;
  try {
    sessionStorage.setItem('er_latest_test_result', JSON.stringify(summary));
  } catch (_err) {
    // ignore storage failures
  }
  if (!isTestEmbedded()) return;
  try {
    window.parent.postMessage({ type: 'er-test-result', result: summary }, '*');
  } catch (_err) {
    // ignore cross-origin failures
  }
}

function navigateFromTest(action) {
  if (!action) return;
  if (action.type === 'section') {
    const section = action.section || 'programs';
    const payload = action.payload || {};
    if (isTestEmbedded()) {
      try {
        window.parent.postMessage({ type: 'er-test-navigate', section, payload }, '*');
      } catch (_err) {}
      return;
    }
    const params = new URLSearchParams();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value) !== '') params.set(key, String(value));
    });
    const query = params.toString();
    window.location.href = `${window.location.origin}/#${section}${query ? `?${query}` : ''}`;
    return;
  }
  const payload = action.payload || { track: 'paid', focus: 'identity_session', source: 'test' };
  if (isTestEmbedded()) {
    try {
      window.parent.postMessage({ type: 'er-test-navigate', section: 'apply', payload }, '*');
    } catch (_err) {}
    return;
  }
  const params = new URLSearchParams();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value) !== '') params.set(key, String(value));
  });
  const query = params.toString();
  window.location.href = `${window.location.origin}/#apply${query ? `?${query}` : ''}`;
}

function bindReportApplyNavigation(root) {
  if (!root) return;
  const wireNav = (el, action) => {
    if (!el || !action) return;
    const go = () => navigateFromTest(action);
    el.addEventListener('click', (event) => {
      event.preventDefault();
      go();
    });
    el.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        go();
      }
    });
  };
  root.querySelectorAll('[data-report-program-key]').forEach((el) => {
    const key = el.getAttribute('data-report-program-key');
    if (!key || !window.ERProgramCatalog) return;
    wireNav(el, window.ERProgramCatalog.buildApplyPayload(key));
  });
  root.querySelectorAll('[data-report-section-nav]').forEach((el) => {
    const section = el.getAttribute('data-report-section-nav') || 'programs';
    wireNav(el, {
      type: 'section',
      section,
      payload: { source: 'test', apply_source: 'report_footer' }
    });
  });
}

function buildWingMetrics(core, wingScores) {
  const left = core === 1 ? 9 : core - 1;
  const right = core === 9 ? 1 : core + 1;
  const coreScore = Math.max(1, Number(wingScores && wingScores[core]) || 0);
  return [left, right].map((wing) => {
    const score = Math.max(0, Number(wingScores && wingScores[wing]) || 0);
    return {
      wing,
      label: `${core}w${wing}`,
      score,
      percent: clampReportPercent((score / coreScore) * 100)
    };
  });
}

function buildReportMetricBar(row, options) {
  const label = escapeReportHtml(row.label);
  const caption = row.caption ? `<span class="er-report-metric-caption">${escapeReportHtml(row.caption)}</span>` : '';
  const value = Number.isFinite(Number(row.percent)) ? Number(row.percent).toFixed(0) : '0';
  const active = row.active ? ' is-active' : '';
  const tone = options && options.tone ? options.tone : 'gold';
  return `
    <div class="er-report-metric${active}">
      <div class="er-report-metric-head">
        <span>${label}</span>
        <strong>${value}%</strong>
      </div>
      <div class="er-report-bar-track" aria-hidden="true">
        <span class="er-report-bar er-report-bar-${tone}" style="width:${clampReportPercent(row.percent)}%"></span>
      </div>
      ${caption}
    </div>
  `;
}

function isTruthyReportParam(names) {
  return names.some((name) => {
    const value = params.get(name);
    return value === '1' || value === 'true' || value === 'yes' || value === 'y';
  });
}

function getNumericReportParam(names) {
  for (const name of names) {
    const value = params.get(name);
    if (value === null || value === '') continue;
    const number = Number(value);
    if (Number.isInteger(number) && number >= 1 && number <= 9) return number;
  }
  return null;
}

function getReportAudience() {
  const raw = (params.get('audience') || params.get('reportAudience') || '').trim();
  if (['adult', 'parent', 'child_report', 'coach', 'couple'].includes(raw)) return raw;
  if (isTruthyReportParam(['parent', 'parentContext', 'hasChildren'])) return 'parent';
  if (isTruthyReportParam(['childReport'])) return 'child_report';
  return 'adult';
}

function buildReportListItems(items) {
  return (items || []).map((item) => `<li>${escapeReportHtml(item)}</li>`).join('');
}

function getReportConfidenceDisplay(confidence) {
  if (confidence === '높음') return '높음';
  if (confidence === '낮음') return '확인 필요';
  return '중간 이상';
}

function buildReportSupportSelection(resultData, instinctRows) {
  const supportApi = window.ERReportSupportMaterials;
  if (!supportApi || typeof supportApi.selectSupportMaterials !== 'function') {
    return { materials: [], pendingMaterials: [], recommendedSlots: [], repressedInstinct: { code: null } };
  }
  return supportApi.selectSupportMaterials({
    audience: getReportAudience(),
    adultType: resultData.core,
    coreType: resultData.core,
    childType: getNumericReportParam(['childType', 'childCoreType', 'child']),
    hasChildren: isTruthyReportParam(['hasChildren', 'parent']),
    parentContext: isTruthyReportParam(['parentContext', 'parent']),
    includeChildMaterials: isTruthyReportParam(['includeChildMaterials', 'childMaterials']),
    hasMultipleChildren: isTruthyReportParam(['hasMultipleChildren', 'siblings', 'sibling']),
    needsSiblingMediation: isTruthyReportParam(['needsSiblingMediation', 'siblingConflict']),
    instinctPct: resultData.instinctPct || null,
    instinctRows
  });
}

function getReportCoreTone(coreType) {
  const core = Number(coreType);
  if ([1, 8, 9].includes(core)) return 'body';
  if ([2, 3, 4].includes(core)) return 'heart';
  if ([5, 6, 7].includes(core)) return 'head';
  return 'neutral';
}

function renderSupportMaterialsSection(selection) {
  const materials = selection && Array.isArray(selection.materials) ? selection.materials : [];
  if (!materials.length) return '';
  const cards = materials.map((material) => {
    const isSuppression = Boolean(material.suppressionCode);
    const kicker = isSuppression ? '낮은 본능 보조 해석' : '추천 보조자료';
    const title = material.typeTitle || material.displayName;
    const focus = material.focusAreas && material.focusAreas.length
      ? `<h4>중점적으로 볼 부분</h4><ul>${buildReportListItems(material.focusAreas)}</ul>`
      : '';
    const practice = material.practicePrompts && material.practicePrompts.length
      ? `<h4>바로 적용할 질문</h4><ul>${buildReportListItems(material.practicePrompts)}</ul>`
      : '';
    return `
      <article class="er-report-support-card${isSuppression ? ' is-suppression' : ''}">
        <span>${escapeReportHtml(kicker)}</span>
        <h3>${escapeReportHtml(title)}</h3>
        <p class="er-report-support-source">${escapeReportHtml(material.displayName)}</p>
        <p>${escapeReportHtml(material.reportSummary || '')}</p>
        ${focus}
        ${practice}
      </article>
    `;
  }).join('');
  const repressed = selection.repressedInstinct && selection.repressedInstinct.code
    ? `<p class="er-report-support-intro">현재 결과에서는 <strong>${escapeReportHtml(selection.repressedInstinct.label || selection.repressedInstinct.code)}</strong> 본능이 낮은 본능 보조 해석 기준에 들어왔습니다. 이는 하위유형을 바꾸는 판정이 아니라, 놓치기 쉬운 삶의 영역을 보완하는 안내입니다.</p>`
    : '<p class="er-report-support-intro">아래 자료는 결과지의 핵심 유형과 현재 선택된 맥락에 따라 추가로 참고하면 좋은 보조자료입니다.</p>';

  return `
    <section id="report-support" class="er-report-section er-report-support">
      <div class="er-report-section-head">
        <span>Support Materials</span>
        <h2>결과에 따라 함께 보면 좋은 자료</h2>
      </div>
      ${repressed}
      <div class="er-report-support-grid">${cards}</div>
    </section>
  `;
}

function renderGuidedApplicationSection(model) {
  const c = model.content || {};
  const synthesis = c.synthesis || {};
  const coreName = c.coreName || `${model.core}번`;
  const firstOf = (items, fallback) => (Array.isArray(items) && items[0]) ? items[0] : fallback;
  const relationshipPractice = c.relationship && c.relationship.practice && c.relationship.practice[0]
    ? c.relationship.practice[0]
    : '상대가 원하는 도움의 방식과 내가 주고 싶은 도움의 방식을 구분해 보세요.';
  const careerStrength = c.career && c.career.strength && c.career.strength[0]
    ? c.career.strength[0]
    : '나의 강점이 어떤 장면에서 건강하게 드러나는지 구체적으로 확인해 보세요.';
  const parentingPractice = c.parenting && c.parenting.practice && c.parenting.practice[0]
    ? c.parenting.practice[0]
    : '가까운 사람에게 필요한 반응을 먼저 묻고, 내 자동반응을 조절해 보세요.';
  const primaryWatch = firstOf(
    [
      ...(c.relationship && c.relationship.watch ? c.relationship.watch : []),
      ...(c.career && c.career.watch ? c.career.watch : []),
      ...(c.falseSelf || [])
    ].filter(Boolean),
    '강점이 과해지는 순간에는 내가 지키려는 필요와 두려움을 함께 확인해야 합니다.'
  );
  const recoveryHelp = firstOf(
    c.recovery,
    '압박이 커질수록 혼자 결론내리기보다, 안전한 대화 안에서 내 자동반응을 천천히 확인하는 도움이 필요합니다.'
  );
  const protectedNeed = synthesis.protects || c.motivation || '내가 반복해서 지키려는 핵심 필요를 확인하기';
  const pressurePattern = synthesis.overuses || c.fear || primaryWatch;
  const closePeopleGuide = synthesis.closePeople || relationshipPractice;
  const counselingFocus = synthesis.counseling || recoveryHelp;

  const applicationMap = [
    {
      label: 'Protect',
      title: '내가 지키려는 것',
      body: `${coreName}의 반복 패턴은 약점보다 먼저, 내가 꼭 지키고 싶어 하는 필요를 보여줍니다.`,
      value: protectedNeed
    },
    {
      label: 'Gift',
      title: '건강할 때 드러나는 강점',
      body: '좋은 상태에서 이 성향은 실제 삶과 관계에 분명한 기여로 나타납니다.',
      value: careerStrength
    },
    {
      label: 'Pressure',
      title: '압박에서 과해지는 것',
      body: '스트레스가 커질수록 강점은 굳어지고, 가까운 사람에게는 방어처럼 경험될 수 있습니다.',
      value: pressurePattern
    },
    {
      label: 'Guide',
      title: '가까운 사람이 알아야 할 것',
      body: '나를 고치려 하기보다, 내 자동반응이 켜지는 장면을 함께 읽을 때 변화가 시작됩니다.',
      value: closePeopleGuide
    }
  ];

  const steps = [
    {
      label: 'Self',
      title: '나를 이해하는 단계',
      body: `${coreName}의 동기와 방어를 알면, 반복되는 선택이 막연한 성격 문제가 아니라 해석 가능한 패턴이 됩니다.`,
      bullets: [protectedNeed, pressurePattern]
    },
    {
      label: 'Others',
      title: '타인을 이해하는 단계',
      body: '에니어그램의 실제 가치는 배우자·자녀·동료가 무엇을 지키려 하고 어디서 약해지는지 읽는 데서 시작됩니다.',
      bullets: [relationshipPractice, parentingPractice]
    },
    {
      label: 'Practice',
      title: '관계 안에서 돕는 단계',
      body: '혼자 읽은 통찰은 금방 흐려집니다. 결과지 해석상담과 기본과정은 실제 대화, 갈등, 양육, 리더십 장면에 적용하도록 돕습니다.',
      bullets: [counselingFocus, '가족·팀·사역 현장에서 반복 가능한 적용 루틴 만들기']
    }
  ];

  const cards = steps.map((step) => `
    <article class="er-report-bridge-card">
      <span>${escapeReportHtml(step.label)}</span>
      <h3>${escapeReportHtml(step.title)}</h3>
      <p>${escapeReportHtml(step.body)}</p>
      <ul>${buildReportListItems(step.bullets.filter(Boolean).slice(0, 2))}</ul>
    </article>
  `).join('');
  const applicationMapCards = applicationMap.map((item) => `
    <article class="er-report-application-map-card">
      <span>${escapeReportHtml(item.label)}</span>
      <h3>${escapeReportHtml(item.title)}</h3>
      <p>${escapeReportHtml(item.body)}</p>
      <strong>${escapeReportHtml(item.value)}</strong>
    </article>
  `).join('');

  return `
    <section id="report-application" class="er-report-section er-report-application">
      <div class="er-report-section-head">
        <span>Application</span>
        <h2>이해에서 끝나지 않고, 실제 관계를 돕는 지도</h2>
      </div>
      <div class="er-report-application-hero">
        <p>결과지는 “나는 이런 사람이구나”에서 멈추면 얕아집니다. 다음 단계는 내 성향과 필요, 욕구, 강점을 이해하고, 다른 사람의 성향과 필요, 약점까지 읽어 실제로 돕는 언어를 배우는 것입니다.</p>
      </div>
      <div class="er-report-application-map">${applicationMapCards}</div>
      <div class="er-report-bridge-grid">${cards}</div>
    </section>
  `;
}

const CONSULTATION_QUESTION_MAP = {
  '1_6': [
    '계속 확인하는 이유가 기준 미달을 고치려는 것인가요, 빠진 위험을 막으려는 것인가요?',
    '불확실할 때 분노가 먼저 오나요, 불안이 먼저 오나요?'
  ],
  '2_9': [
    '맞춰주는 이유가 필요한 존재가 되고 싶어서인가요, 마찰을 줄이고 싶어서인가요?',
    '거절이 올 때 존재 의미가 흔들리나요, 긴장이 커지는 것이 부담스럽나요?'
  ],
  '3_6': [
    '압박에서 빠르게 성과를 만들어 안정시키나요, 빠진 위험을 확인해야 안정되나요?',
    '실패 가능성이 보일 때 무능해 보일까 봐 긴장하나요, 대비가 부족할까 봐 긴장하나요?'
  ],
  '3_9': [
    '적응의 목적이 성과/이미지 유지인가요, 마찰 없는 흐름 유지인가요?',
    '압박에서 더 밀어붙이나요, 흐름을 낮추고 미루나요?'
  ],
  '4_7': [
    '무거운 감정이 올라올 때 그 감정 안으로 더 들어가나요, 아니면 다른 가능성으로 전환하나요?',
    '반복적 일상에서 공허함이 먼저 오나요, 갇힘과 지루함이 먼저 오나요?'
  ],
  '5_9': [
    '물러나는 이유가 에너지 보존인가요, 관계 긴장 완충인가요?',
    '침묵할 때 내 공간을 지키는 느낌인가요, 분위기를 덮는 느낌인가요?'
  ],
  '6_8': [
    '강하게 맞설 때 검증하려는 마음인가요, 주도권을 되찾으려는 마음인가요?',
    '갈등 뒤에 재점검이 남나요, 정리됐다는 느낌이 남나요?'
  ],
  '7_9': [
    '불편함을 피할 때 다른 가능성으로 전환하나요, 긴장을 낮추고 흐름을 흐리게 만드나요?',
    '갈등 뒤에 새 계획으로 빨리 이동하나요, 아무 일 없던 것처럼 덮고 싶어지나요?'
  ]
};

function uniqueStrings(items) {
  return Array.from(new Set((items || []).filter(Boolean)));
}

function getTypePairKey(typeA, typeB) {
  const a = Number(typeA);
  const b = Number(typeB);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return [a, b].sort((x, y) => x - y).join('_');
}

function getPairLabel(pairKey) {
  return pairKey ? pairKey.replace('_', '↔') : '';
}

function isTieEnabledForPair(pairKey, tieState) {
  if (!pairKey || !tieState) return false;
  const [a, b] = pairKey.split('_');
  const directKey = `t${a}${b}`;
  if (tieState[directKey] && tieState[directKey].enabled) return true;
  const generic = tieState.tGeneric;
  if (!generic || !generic.enabled) return false;
  return getTypePairKey(generic.typeA, generic.typeB) === pairKey;
}

function getInstinctClarity(instinctPct, responseQuality) {
  const values = ['sp', 'sx', 'so']
    .map((code) => Number(instinctPct && instinctPct[code]) || 0)
    .sort((a, b) => b - a);
  const top = responseQuality && responseQuality.metrics && Number.isFinite(Number(responseQuality.metrics.instinctTop))
    ? Number(responseQuality.metrics.instinctTop)
    : (values[0] || 0);
  const gap = responseQuality && responseQuality.metrics && Number.isFinite(Number(responseQuality.metrics.instinctGap))
    ? Number(responseQuality.metrics.instinctGap)
    : Math.max(0, (values[0] || 0) - (values[1] || 0));
  return { top, gap, clear: top >= 35 && gap >= 10 };
}

function buildConfidenceExplanation({ confidence, diff, core, second, instinctPct, responseQuality, tieState, stateStressAdjustment }) {
  const displayConfidence = getReportConfidenceDisplay(confidence || '보통');
  const label = `해석 신뢰도: ${displayConfidence}`;
  const tone = confidence === '높음' ? 'high' : confidence === '낮음' ? 'low' : 'medium';
  const secondType = second && second.type ? Number(second.type) : null;
  const pairKey = getTypePairKey(core, secondType);
  const pairLabel = getPairLabel(pairKey);
  const reasons = [];
  const consultationQuestions = CONSULTATION_QUESTION_MAP[pairKey]
    ? [...CONSULTATION_QUESTION_MAP[pairKey]]
    : [];
  const gapPct = Math.max(0, (Number(diff) || 0) * 100);
  const quality = responseQuality || {};
  const qualityFlags = Array.isArray(quality.flags) ? quality.flags : [];
  const qualityLabels = qualityFlags.map((flag) => flag.label || flag.code).filter(Boolean);
  const instinctClarity = getInstinctClarity(instinctPct, quality);

  if (secondType) {
    if (gapPct < 8) {
      reasons.push(`${core}번과 ${secondType}번 점수 차이가 ${gapPct.toFixed(1)}%로 근접합니다.`);
    } else if (gapPct >= 20) {
      reasons.push(`${core}번이 ${secondType}번보다 ${gapPct.toFixed(1)}% 앞서 결과가 비교적 선명합니다.`);
    } else {
      reasons.push(`${core}번이 1순위지만 ${secondType}번 영향도 함께 확인할 필요가 있습니다.`);
    }
  }

  reasons.push(instinctClarity.clear
    ? '본능 점수는 비교적 선명합니다.'
    : `본능 점수가 선명하지 않습니다. 1위 본능 ${instinctClarity.top}%, 2순위와 차이 ${instinctClarity.gap}%입니다.`);

  if (quality.metrics && quality.metrics.centerCoreAligned === false) {
    reasons.push('센터 응답과 코어 결과가 충돌합니다. 상담에서 어느 자동반응이 더 반복적인지 확인이 필요합니다.');
  } else if (quality.metrics && quality.metrics.centerCoreAligned === true) {
    reasons.push('센터 응답은 코어 결과와 대체로 일치합니다.');
  }

  if (quality.level === 'low') {
    reasons.push(`응답 품질 체크에서 해석 주의 신호가 있습니다${qualityLabels.length ? `: ${qualityLabels.join(', ')}` : '.'}`);
  } else if (qualityFlags.length) {
    reasons.push(`응답 품질 체크에서 확인할 항목이 있습니다: ${qualityLabels.join(', ')}`);
  } else {
    reasons.push('응답 품질 체크에서 큰 왜곡 신호는 보이지 않습니다.');
  }

  if (pairLabel && isTieEnabledForPair(pairKey, tieState)) {
    reasons.push(`${pairLabel} 감별 문항이 적용되었습니다.`);
  } else if (pairLabel && consultationQuestions.length && tone !== 'high') {
    reasons.push(`${pairLabel} 감별은 상담에서 한 번 더 확인하는 것이 좋습니다.`);
  }

  if (stateStressAdjustment && stateStressAdjustment.applied) {
    reasons.push('최근 스트레스가 6번 관련 불안/확인 반응을 키울 수 있어 상태성 보정을 적용했습니다.');
  }

  if (!consultationQuestions.length) {
    consultationQuestions.push(
      `${core}번 결과가 실제 반복 패턴인지 보려면, 압박이 올 때 먼저 지키려는 것이 무엇인지 확인해 보세요.`
    );
    if (secondType) {
      consultationQuestions.push(`${secondType}번과 헷갈린다면, 그 반응이 오래 반복되는 성향인지 최근 상황 반응인지 구분해 보세요.`);
    }
  }

  const requiresCare = tone === 'low' || quality.level === 'low';
  const summary = requiresCare
    ? '핵심 방향은 보이지만, 가까운 후보와 응답 패턴을 상담에서 함께 확인하면 더 안전합니다.'
    : tone === 'high'
      ? '현재 응답 패턴은 핵심 유형과 보조 지표가 비교적 일관되게 모입니다.'
      : '핵심 방향은 선명하지만, 가까운 후보와 본능·날개 해석은 상담에서 정리하면 더 정확해집니다.';

  return {
    label,
    tone,
    summary,
    requiresCare,
    pairLabel,
    reasons: uniqueStrings(reasons),
    consultationQuestions: uniqueStrings(consultationQuestions).slice(0, 3)
  };
}

function renderConfidenceExplanationSection(explanation) {
  if (!explanation) return '';
  const reasons = (explanation.reasons || [])
    .map((reason) => `<li>${escapeReportHtml(reason)}</li>`)
    .join('');
  const questions = (explanation.consultationQuestions || [])
    .map((question) => `<li>${escapeReportHtml(question)}</li>`)
    .join('');
  return `
    <section id="report-confidence" class="er-report-section er-report-confidence-section is-${escapeReportHtml(explanation.tone || 'medium')}">
      <div class="er-report-section-head">
        <span>Confidence</span>
        <h2>왜 이 결과를 이렇게 해석하는가</h2>
      </div>
      <div class="er-report-confidence-grid">
        <article class="er-report-confidence-status">
          <span>Diagnostic Confidence</span>
          <h3>${escapeReportHtml(explanation.label)}</h3>
          <p>${escapeReportHtml(explanation.summary)}</p>
        </article>
        <article>
          <h3>판정 근거</h3>
          <ul>${reasons}</ul>
        </article>
        <article>
          <h3>상담에서 확인할 질문</h3>
          <ol>${questions}</ol>
        </article>
      </div>
    </section>
  `;
}

function renderExecutiveSummaryCard(model) {
  if (!model) return '';
  const c = model.content || {};
  const topTypes = (model.top3 || [])
    .slice(0, 3)
    .map((item) => `${item.type}번`)
    .join(' / ');
  const questions = model.confidenceExplanation && model.confidenceExplanation.consultationQuestions
    ? model.confidenceExplanation.consultationQuestions.slice(0, 2)
    : [];
  const focusText = questions.length
    ? `상담에서는 ${questions.map((q) => `"${q}"`).join('와 ')}를 함께 확인합니다.`
    : '상담에서는 이 결과가 실제 삶의 반복 장면에서 어떻게 나타나는지 함께 확인합니다.';
  const subtypeLine = c.subtypeLabel || model.display.subtype;
  const wingLine = model.selectedWing
    ? `${model.selectedWing}번 에너지가 핵심 유형의 표현 방식을 바꿉니다.`
    : '날개보다 핵심 유형의 동기가 더 직접적으로 드러납니다.';

  return `
    <section id="report-executive" class="er-report-executive" aria-label="결과 핵심 요약">
      <div class="er-report-executive-head">
        <span>Executive Summary</span>
        <h2>이 결과에서 가장 먼저 볼 것</h2>
        <p>이 결과는 혼자 확정하는 판정이 아니라, 상담에서 실제 삶의 장면과 연결할 때 가장 정확해집니다.</p>
      </div>
      <div class="er-report-executive-grid">
        <article>
          <span>Core Type</span>
          <h3>${escapeReportHtml(model.display.core)} ${escapeReportHtml(c.coreName || '')}</h3>
          <p>${escapeReportHtml(c.motivation || '')}</p>
        </article>
        <article>
          <span>Subtype</span>
          <h3>${escapeReportHtml(subtypeLine)}</h3>
          <p>${escapeReportHtml(c.definition || '')}</p>
        </article>
        <article>
          <span>Wing</span>
          <h3>${escapeReportHtml(model.display.wing)}</h3>
          <p>${escapeReportHtml(wingLine)}</p>
        </article>
        <article>
          <span>Confidence</span>
          <h3>해석 신뢰도: ${escapeReportHtml(model.display.confidence)}</h3>
          <p>${escapeReportHtml(model.confidenceExplanation ? model.confidenceExplanation.summary : '')}</p>
        </article>
      </div>
      <div class="er-report-executive-focus">
        <div>
          <span>Close Types</span>
          <strong>${escapeReportHtml(topTypes || '상담에서 확인')}</strong>
          <p>헷갈릴 수 있는 가까운 유형들입니다.</p>
        </div>
        <div>
          <span>Counseling Focus</span>
          <strong>결과지 해석상담에서 확인할 핵심 질문</strong>
          <p>${escapeReportHtml(focusText)}</p>
        </div>
      </div>
    </section>
  `;
}

function buildReportEvidenceCopy(model) {
  const c = model.content || {};
  const synthesis = c.synthesis || {};
  const top = model.top3 && model.top3[0] ? model.top3[0] : null;
  const second = model.top3 && model.top3[1] ? model.top3[1] : null;
  const topShare = model.top3Total && top ? (top.score / model.top3Total) * 100 : null;
  const secondShare = model.top3Total && second ? (second.score / model.top3Total) * 100 : null;
  const topLine = top && second && Number.isFinite(topShare) && Number.isFinite(secondShare)
    ? `${top.type}번이 가장 앞서지만 ${second.type}번 에너지도 함께 올라왔습니다. 이 차이는 결과를 단정하기보다 실제 삶의 반복 장면에서 함께 확인할 근거입니다.`
    : '점수는 유형 이름을 확정하는 숫자가 아니라, 반복적으로 먼저 켜지는 에너지의 방향을 보여줍니다.';

  return {
    topLine,
    instinctLine: synthesis.instinctSignal || '본능 점수는 이 패턴이 어떤 생활 장면에서 가장 먼저 켜지는지를 보여줍니다.',
    wingLine: synthesis.wingSignal || '날개 점수는 핵심 유형이 밖으로 표현되는 방식을 확인하는 보조 단서입니다.',
    closeTypeLine: synthesis.closeTypeSignal || '가까운 유형들은 상담에서 헷갈릴 수 있는 반응의 이유를 정리하는 단서입니다.'
  };
}

function buildPremiumReportModel(resultData) {
  const contentApi = window.ERDiagnosticReportContent || {};
  const subtypeCode = getFinalSubtypeCode(resultData.instinctCode);
  const selectedWing = resultData.phase4 && resultData.phase4.wingNum
    ? resultData.phase4.wingNum
    : resultData.wingNum;
  const reportContent = contentApi.getContent
    ? contentApi.getContent(resultData.core, subtypeCode, selectedWing)
    : null;
  const fallbackContent = reportContent || {
    heroStatement: '나를 더 진실하게 마주하는 여정',
    coreName: `${resultData.core}번`,
    subtypeLabel: `${subtypeCode} ${resultData.core}번`,
    definition: '진단 결과를 바탕으로 현재 반복 패턴과 회복 방향을 정리합니다.',
    motivation: '나의 중심 동기를 이해하고 싶음',
    fear: '반복되는 반응에 다시 붙들리는 것',
    cycle: [],
    falseSelf: [],
    restoredSelf: [],
    career: { strength: [], watch: [], practice: [] },
    relationship: { strength: [], watch: [], practice: [] },
    parenting: { strength: [], watch: [], practice: [] },
    stress: [],
    recovery: [],
    roadmap: [],
    actionPlan: [],
    nextSteps: [],
    gospel: {}
  };
  const instinctRows = normalizeMetricRows(resultData.instinctMetrics || []).map((row, index) => ({
    ...row,
    active: index === 0 || row.code === subtypeCode
  }));
  const supportMaterials = buildReportSupportSelection(resultData, instinctRows);
  const coreScoreForWing = Math.max(1, Number(resultData.final && resultData.final[resultData.core]) || 0);
  const wingRows = (resultData.wingMetrics || []).map((row) => {
    const percent = Number.isFinite(Number(row.percent))
      ? clampReportPercent(Number(row.percent))
      : clampReportPercent((Math.max(0, Number(row.score) || 0) / coreScoreForWing) * 100);
    return {
      ...row,
      percent,
      active: selectedWing && Number(row.wing) === Number(selectedWing)
    };
  });
  const confidenceExplanation = buildConfidenceExplanation({
    confidence: resultData.confidence,
    diff: resultData.diff,
    core: resultData.core,
    second: resultData.second,
    instinctPct: resultData.instinctPct,
    responseQuality: resultData.responseQuality,
    tieState: resultData.tieState,
    stateStressAdjustment: resultData.stateStressAdjustment
  });

  return {
    ...resultData,
    subtypeCode,
    selectedWing,
    coreTone: getReportCoreTone(resultData.core),
    reportKey: selectedWing ? `${subtypeCode}_${resultData.core}w${selectedWing}` : `${subtypeCode}_${resultData.core}`,
    content: fallbackContent,
    instinctRows,
    wingRows,
    supportMaterials,
    confidenceExplanation,
    display: {
      headline: formatReportHeadline(resultData),
      final: `${subtypeCode} ${resultData.wingCode}`,
      core: resultData.coreDisplay,
      subtype: resultData.phase4
        ? `하위유형: ${resultData.instinctLabel}`
        : `제 1본능: ${resultData.instinctLabel}`,
      wing: resultData.wing,
      confidence: getReportConfidenceDisplay(resultData.confidence),
      stressGrowth: resultData.coreResolved
        ? `통합 방향 ${arrowLines[resultData.core].growth}번 · 스트레스 방향 ${arrowLines[resultData.core].stress}번`
        : '코어 확정 후 확인 가능합니다.'
    }
  };
}

function renderPremiumReport(model) {
  const host = document.getElementById('result-view');
  if (!host) return;
  const c = model.content;
  const langNotice = pageLang === 'en'
    ? '<div class="er-report-lang-notice">프리미엄 결과지는 현재 한국어로 제공됩니다. English report content will be added in a later version.</div>'
    : '';
  const top3Total = model.top3Total || 0;
  const top3Html = (model.top3 || []).map((item, index) => {
    const percent = top3Total > 0 ? (item.score / top3Total) * 100 : 0;
    const evidenceItems = ((model.evidence && model.evidence[item.type]) || [])
      .sort((a, b) => b.points - a.points)
      .slice(0, 2)
      .map((e) => `<li>${escapeReportHtml(e.text)}</li>`)
      .join('');
    return `
      <div class="er-report-toptype">
        <div>
          <span>${index + 1}순위</span>
          <strong>${item.type}번</strong>
        </div>
        <div class="er-report-toptype-score">${percent.toFixed(1)}%</div>
        <div class="er-report-bar-track"><span class="er-report-bar er-report-bar-slate" style="width:${clampReportPercent(percent)}%"></span></div>
        ${evidenceItems ? `<ul>${evidenceItems}</ul>` : ''}
      </div>
    `;
  }).join('');
  const list = (items, limit = Infinity) => (items || []).slice(0, limit).map((item) => `<li>${escapeReportHtml(item)}</li>`).join('');
  const lifeBlock = (data) => {
    if (!data) return '';
    if (Array.isArray(data)) return `<ul>${list(data, 2)}</ul>`;
    const sub = (label, items, limit = 1) => (items && items.length) ? `<h4>${label}</h4><ul>${list(items, limit)}</ul>` : '';
    return `${sub('강점', data.strength)}${sub('함께 살펴볼 점', data.watch)}${sub('오늘부터 이렇게', data.practice)}`;
  };
  const roadmap = (items, limit = Infinity) => (items || []).slice(0, limit).map((item, index) => `
    <li>
      <span>${index + 1}</span>
      <p>${escapeReportHtml(item)}</p>
    </li>
  `).join('');
  const finalCtaProgramKey = 'result_consult';
  const nextSteps = (c.nextSteps || []).map((step, index) => {
    const programKey = step.programKey || '';
    const priceLine = step.priceLabel
      ? `<em class="er-report-next-price">${escapeReportHtml(step.priceLabel)}</em>`
      : '';
    return `
    <article class="er-report-next-card is-clickable${index === 0 ? ' is-primary' : ''}" data-report-program-key="${escapeReportHtml(programKey)}" tabindex="0" role="link" aria-label="${escapeReportHtml(step.program)} 신청">
      <span>${index === 0 ? '가장 추천' : `${step.rank}순위`}</span>
      <h3>${escapeReportHtml(step.program)}</h3>
      ${priceLine}
      <p>${escapeReportHtml(step.reason)}</p>
      <small>${escapeReportHtml(step.outcome)}</small>
      <span class="er-report-next-cta">신청하기</span>
    </article>
  `;
  }).join('');
  const actionRows = (c.actionPlan || []).slice(0, 2).map((item, index) => `
    <label class="er-report-action-row">
      <input type="checkbox" data-report-action="${index}" aria-label="Action Plan ${index + 1}">
      <span>${escapeReportHtml(item)}</span>
    </label>
  `).join('');
  const supportMaterialsHtml = renderSupportMaterialsSection(model.supportMaterials);
  const supportNav = supportMaterialsHtml ? '<a href="#report-support">자료</a>' : '';
  const applicationHtml = renderGuidedApplicationSection(model);
  const confidenceExplanationHtml = renderConfidenceExplanationSection(model.confidenceExplanation);
  const executiveSummaryHtml = renderExecutiveSummaryCard(model);
  const synthesis = c.synthesis || {};
  const evidenceCopy = buildReportEvidenceCopy(model);

  host.innerHTML = `
    <article class="er-premium-report" data-report-key="${escapeReportHtml(model.reportKey)}" data-core-tone="${escapeReportHtml(model.coreTone)}">
      <section class="er-report-hero">
        <div class="er-report-hero-inner">
          <p class="er-report-kicker">ER Enneagram Premium Report</p>
          <p class="er-report-hero-type" id="res-final">${escapeReportHtml(model.display.headline)}</p>
          <h1>${escapeReportHtml(c.heroStatement)}</h1>
          <p>${escapeReportHtml(c.definition)}</p>
          <div class="er-report-hero-answer">
            <span>Core Interpretation</span>
            <strong>${escapeReportHtml(c.motivation)}</strong>
            <small>${escapeReportHtml(c.fear)}</small>
          </div>
          <div class="er-report-hero-badges" aria-label="진단 결과 요약">
            <span id="res-instincts">${escapeReportHtml(c.subtypeLabel || model.display.subtype)}</span>
            <span id="res-wing">${escapeReportHtml(model.display.wing)}</span>
            <span class="er-report-hero-code">${escapeReportHtml(model.display.final)}</span>
          </div>
          <span id="confidence-badge" class="er-report-confidence">${escapeReportHtml(model.display.confidence)}</span>
        </div>
      </section>

      ${langNotice}

      ${executiveSummaryHtml}

      <nav class="er-report-nav" aria-label="결과지 섹션 이동">
        <a href="#report-executive">핵심</a>
        <a href="#report-summary">해석</a>
        <a href="#report-confidence">신뢰</a>
        <a href="#report-evidence">근거</a>
        <a href="#report-pattern">패턴</a>
        <a href="#report-life">삶</a>
        <a href="#report-application">적용</a>
        ${supportNav}
        <a href="#report-growth">회복</a>
        <a href="#report-next">다음</a>
      </nav>

      <section id="report-summary" class="er-report-section">
        <div class="er-report-section-head">
          <span>Overview</span>
          <h2>당신의 결과를 한 문장으로 읽으면</h2>
        </div>
        <article class="er-report-synthesis">
          <span>Personal Synthesis</span>
          <h3>${escapeReportHtml(synthesis.title || c.heroStatement)}</h3>
          <p>${escapeReportHtml(synthesis.paragraph || c.definition)}</p>
          <div class="er-report-synthesis-grid">
            <div><span>무엇을 지키는가</span><strong>${escapeReportHtml(synthesis.protects || c.motivation)}</strong></div>
            <div><span>압박에서 과해지는 것</span><strong>${escapeReportHtml(synthesis.overuses || c.fear)}</strong></div>
            <div><span>가까운 사람이 경험하는 것</span><strong>${escapeReportHtml(synthesis.closePeople || '강점과 방어가 함께 섞인 반복 반응으로 보일 수 있습니다.')}</strong></div>
            <div><span>상담에서 확인할 것</span><strong>${escapeReportHtml(synthesis.counseling || '실제 삶의 반복 장면과 연결해 결과를 확인합니다.')}</strong></div>
          </div>
        </article>
        <div class="er-report-summary-strip">
          <div><span>핵심 유형</span><strong id="res-core">${escapeReportHtml(model.display.core)} ${escapeReportHtml(c.coreName || '')}</strong></div>
          <div><span>하위유형 · 날개</span><strong>${escapeReportHtml(c.subtypeLabel || model.display.subtype)} · ${escapeReportHtml(model.display.wing)}</strong></div>
          <div><span>방향</span><strong id="res-arrows">${escapeReportHtml(model.display.stressGrowth)}</strong></div>
        </div>
      </section>

      ${confidenceExplanationHtml}

      <section id="report-evidence" class="er-report-section er-report-visuals">
        <div class="er-report-section-head">
          <span>Evidence</span>
          <h2>왜 이 결과가 나왔는가</h2>
          <p>${escapeReportHtml(evidenceCopy.topLine)}</p>
        </div>
        <div class="er-report-visual-grid">
          <div class="er-report-panel">
            <h3>내 안에서 가장 강하게 반응한 에너지</h3>
            <p class="er-report-panel-lead">${escapeReportHtml(evidenceCopy.instinctLine)}</p>
            ${model.instinctRows.map((row) => buildReportMetricBar(row, { tone: 'gold' })).join('')}
          </div>
          <div class="er-report-panel">
            <h3>비슷하게 함께 나타나는 성향</h3>
            <p class="er-report-panel-lead">${escapeReportHtml(evidenceCopy.wingLine)}</p>
            ${model.wingRows.map((row) => buildReportMetricBar(row, { tone: 'green' })).join('')}
            <p class="er-report-microcopy">코어 점수 대비 인접 날개 반응의 활성도를 보여줍니다.</p>
          </div>
        </div>
        <div class="er-report-panel">
          <h3 id="top3-title">헷갈릴 수 있는 가까운 유형들</h3>
          <p class="er-report-panel-lead">${escapeReportHtml(evidenceCopy.closeTypeLine)}</p>
          <div id="res-top3" class="er-report-toptypes">${top3Html}</div>
        </div>
      </section>

      <section id="report-pattern" class="er-report-section">
        <div class="er-report-section-head">
          <span>Pattern</span>
          <h2>나의 반복 사이클</h2>
        </div>
        <ol class="er-report-cycle">${roadmap(c.cycle)}</ol>
        <div class="er-report-formation">
          <h3 id="analysis-report-title">형성 이야기</h3>
          <p id="res-log">${escapeReportHtml(c.formation)}</p>
        </div>
        <div class="er-report-toggle-card" data-self-toggle>
          <div class="er-report-toggle-buttons" role="tablist" aria-label="왜곡된 자아와 회복된 자아 보기">
            <button type="button" class="is-active" data-self-mode="false" aria-label="현재 패턴 보기">현재 패턴 보기</button>
            <button type="button" data-self-mode="restored" aria-label="회복 방향 보기">회복 방향 보기</button>
          </div>
          <p class="er-report-toggle-state" aria-live="polite">현재 선택: 현재 패턴 보기</p>
          <div class="er-report-self-panel is-false" data-self-panel="false">
            <h3>왜곡된 자아</h3>
            <ul>${list(c.falseSelf)}</ul>
          </div>
          <div class="er-report-self-panel is-restored hidden" data-self-panel="restored">
            <h3>회복된 자아</h3>
            <ul>${list(c.restoredSelf)}</ul>
          </div>
        </div>
      </section>

      <section id="report-life" class="er-report-section">
        <div class="er-report-section-head">
          <span>Life</span>
          <h2>일, 관계, 양육에서 드러나는 패턴</h2>
        </div>
        <div class="er-report-life-grid">
          <article><h3>일과 커리어</h3>${lifeBlock(c.career)}</article>
          <article><h3>관계에서</h3>${lifeBlock(c.relationship)}</article>
          <article><h3>자녀 양육에서</h3>${lifeBlock(c.parenting)}</article>
          <article><h3>스트레스와 회복 신호</h3><h4>스트레스를 받을 때</h4><ul>${list(c.stress, 2)}</ul><h4>회복으로 가는 길</h4><ul>${list(c.recovery, 2)}</ul></article>
        </div>
      </section>

      ${applicationHtml}

      ${supportMaterialsHtml}

      <section id="report-growth" class="er-report-section er-report-growth">
        <div class="er-report-section-head">
          <span>Restoration</span>
          <h2>변화 로드맵과 오늘의 실천</h2>
        </div>
        <ol class="er-report-roadmap">${roadmap(c.roadmap, 3)}</ol>
        <div class="er-report-action">
          <h3>오늘의 Action Plan</h3>
          ${actionRows}
          <p class="er-report-action-done hidden">작은 순종이 회복의 방향을 만듭니다.</p>
        </div>
        <div class="er-report-gospel">
          <h3>더 깊은 회복으로의 초대</h3>
          <p class="er-report-gospel-intro">아래는 신앙 안에서 더 깊은 회복을 원하는 분을 위한 안내입니다. 부담 없이, 마음이 머무는 문장만 가져가셔도 좋습니다.</p>
          <dl>
            <dt>내려놓아도 되는 거짓 믿음</dt>
            <dd>${escapeReportHtml(c.gospel.falseBelief || '')}</dd>
            <dt>기억하면 좋은 진실</dt>
            <dd>${escapeReportHtml(c.gospel.truth || '')}</dd>
            <dt>마음의 기도</dt>
            <dd>${escapeReportHtml(c.gospel.prayer || '')}</dd>
          </dl>
        </div>
      </section>

      <section id="report-next" class="er-report-section er-report-next">
        <div class="er-report-section-head">
          <span>Next Step</span>
          <h2>혼자 읽고 끝내지 않기 위한 다음 단계</h2>
        </div>
        <div class="er-report-next-rationale">
          <h3>결과지 해석상담이나 기본과정을 추천합니다</h3>
          <p>결과지는 방향을 보여줍니다. 하지만 변화는 실제 관계 장면에서 시작됩니다. 내가 반복해서 피하는 감정, 가까운 사람에게 보이는 반응, 자녀와 배우자 앞에서 자동으로 나오는 말투는 혼자 읽는 것만으로는 잘 보이지 않습니다. 다음 단계는 더 많은 정보가 아니라, 내 패턴을 실제 삶에서 읽는 훈련입니다.</p>
        </div>
        <div class="er-report-next-grid">${nextSteps}</div>
        <div id="experiment-result-panel" class="hidden"></div>
        <div class="er-report-final-cta">
          <h2>${escapeReportHtml(c.gospel.declaration || c.heroStatement)}</h2>
          <p>결과지는 끝이 아니라, 오늘 하나의 작은 회복을 시작하는 지도입니다. 먼저 1시간 결과지 해석상담에서 내 결과가 실제 삶과 어떻게 연결되는지 함께 정리해 보세요.</p>
          <a href="#" class="er-report-final-primary" data-report-program-key="${escapeReportHtml(finalCtaProgramKey)}">결과지 해석상담 신청</a>
          <a href="#" class="er-report-final-secondary" data-report-section-nav="programs">전체 프로그램 보기</a>
          <div class="er-report-tools">
            <button type="button" onclick="shareTestResult()">결과 공유하기</button>
            <button type="button" id="download-pdf-btn" onclick="downloadResultPdf()">결과 PDF 다운로드</button>
            <button type="button" id="restart-test-btn" onclick="location.reload()">처음부터 다시하기</button>
          </div>
          <p id="result-disclaimer">* 본 결과는 전문 상담사의 임상적 진단을 대체하지 않습니다.</p>
        </div>
      </section>
    </article>
  `;
  bindPremiumReportInteractions(model);
  bindReportApplyNavigation(host);
  persistTestResultSummary(buildTestResultSummary(model));
  scheduleEmbedResize();
}

function renderLowConfidenceGate(model) {
  const host = document.getElementById('result-view');
  if (!host) return;
  const qualityFlags = (model.responseQuality && model.responseQuality.flags) || [];
  const hasFlag = (code) => qualityFlags.some((flag) => flag && flag.code === code);
  const stateStressApplied = !!(model.stateStressAdjustment && model.stateStressAdjustment.applied);
  const reasons = ['두세 유형의 점수가 거의 같은 높이로 나온 경우'];
  if (stateStressApplied || Number(model.recentStress) >= TEST_CONFIG.thresholds.stressCorrectionStart) {
    reasons.push('최근 스트레스나 큰 변화로 평소와 다른 상태에서 응답한 경우');
  }
  if (hasFlag('unknown_overuse')) {
    reasons.push("'잘 모르겠다' 같은 중립 응답이 많았던 경우");
  }
  if (reasons.length < 3) {
    reasons.push('응답이 여러 유형의 특징에 고르게 걸쳐 있는 경우');
  }
  host.innerHTML = `
    <article class="er-premium-report er-report-gate">
      <section class="er-report-section er-report-gate-card">
        <div class="er-report-section-head">
          <span>결과 확인 전 안내</span>
          <h2>지금 응답으로는 한 가지 유형으로 단정하기 어렵습니다</h2>
        </div>
        <p class="er-report-gate-lead">이번 응답은 여러 유형에 비슷한 강도로 걸쳐 있어, 해석 신뢰도가 낮게 나왔습니다. 이 상태에서 하나의 유형으로 확정한 결과지를 드리면 잘못된 자기 이해로 이어질 수 있어, 결과지를 바로 보여 드리지 않습니다.</p>
        <div class="er-report-gate-reasons">
          <h3>신뢰도가 낮게 나오는 흔한 이유</h3>
          <ul>${reasons.map((item) => `<li>${escapeReportHtml(item)}</li>`).join('')}</ul>
        </div>
        <div class="er-report-gate-session">
          <h3>타이핑 세션에서 함께 확인해 보세요</h3>
          <p>사전 설문과 1:1 인터뷰로 핵심 유형, 하위유형, 날개를 함께 확인하는 유형(Typing) 상담입니다. 검사 점수만으로 확정하기 어려운 지금 같은 경우에 가장 정확한 다음 단계입니다.</p>
          <a href="#" class="er-report-gate-primary" data-report-program-key="identity_session">타이핑 세션(유형 확인 상담) 신청</a>
          <button type="button" class="er-report-gate-retry" onclick="location.reload()">처음부터 다시 검사하기</button>
        </div>
        <p class="er-report-gate-tip">최근 2주가 평소와 많이 달랐다면, 마음이 안정된 시기의 나를 기준으로 다시 응답해 보세요. 같은 결과가 반복되면 타이핑 세션에서 함께 확인하는 것이 가장 정확합니다.</p>
      </section>
    </article>
  `;
  bindReportApplyNavigation(host);
  scheduleEmbedResize();
}

function bindPremiumReportInteractions(model) {
  document.querySelectorAll('[data-self-toggle]').forEach((card) => {
    const buttons = Array.from(card.querySelectorAll('[data-self-mode]'));
    const panels = Array.from(card.querySelectorAll('[data-self-panel]'));
    const state = card.querySelector('.er-report-toggle-state');
    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const mode = button.getAttribute('data-self-mode');
        buttons.forEach((btn) => btn.classList.toggle('is-active', btn === button));
        panels.forEach((panel) => panel.classList.toggle('hidden', panel.getAttribute('data-self-panel') !== mode));
        if (state) state.textContent = `현재 선택: ${mode === 'restored' ? '회복 방향 보기' : '현재 패턴 보기'}`;
      });
    });
  });

  const storageKey = `er_report_actions_${model.reportKey}`;
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(storageKey) || '{}') || {}; } catch (_err) { saved = {}; }
  const rows = Array.from(document.querySelectorAll('[data-report-action]'));
  const done = document.querySelector('.er-report-action-done');
  function syncDone() {
    const allDone = rows.length > 0 && rows.every((input) => input.checked);
    if (done) done.classList.toggle('hidden', !allDone);
  }
  rows.forEach((input) => {
    const key = input.getAttribute('data-report-action');
    input.checked = saved[key] === true;
    input.addEventListener('change', () => {
      saved[key] = input.checked;
      try { localStorage.setItem(storageKey, JSON.stringify(saved)); } catch (_err) {}
      syncDone();
    });
  });
  syncDone();
}

if (typeof window !== 'undefined') {
  window.buildPremiumReportModel = buildPremiumReportModel;
  window.renderPremiumReport = renderPremiumReport;
}

function renderResultFromScores({ final, evidence, recentStress, stateStressAdjustment, tb7w6, tb7w8, sxBoost, counterSignals, phase4, postTieApplied }) {
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
  const instName = pageLang === 'en'
    ? { sp: 'Self-preservation', sx: 'One-to-one', so: 'Social' }
    : { sp:'자기보존', sx:'성적(일대일)', so:'사회적' };
  addInstinctScoresFromResponses(testState.phase1Responses, inst);
  if (counterSignals && counterSignals[core]) {
    inst.sp += counterSignals[core].sp || 0;
    inst.sx += counterSignals[core].sx || 0;
    inst.so += counterSignals[core].so || 0;
  }
  if (sxBoost > 0) inst.sx += sxBoost;
  let soPenalty = 0;
  if ([3,6,9].includes(core)) {
    const nonSoMax = Math.max(inst.sp, inst.sx);
    const soLead = inst.so - nonSoMax;
    if (soLead >= TEST_CONFIG.corrections.soPenaltyHighLead) soPenalty = TEST_CONFIG.corrections.soPenaltyHigh;
    else if (soLead >= TEST_CONFIG.corrections.soPenaltyLowLead) soPenalty = TEST_CONFIG.corrections.soPenaltyLow;
    if (soPenalty > 0) inst.so -= soPenalty;
  }
  const instinctPct = buildInstinctPctFromScores(inst);

  const instRank = Object.keys(inst).map((k)=>({code:k,name:instName[k],score:inst[k]})).sort((a,b)=>b.score-a.score);
  let instinctCode = instRank[0].code;
  let instinctLabel = instRank[0].name;
  if (instRank[0].score === instRank[1].score) {
    instinctCode = `${instRank[0].code}/${instRank[1].code}`;
    instinctLabel = pageLang === 'en'
      ? `${instRank[0].name} & ${instRank[1].name} (tied for first)`
      : `${instRank[0].name} & ${instRank[1].name} (공동 1위)`;
  }
  if (phase4 && phase4.subtypeCode) {
    instinctCode = phase4.subtypeCode;
    instinctLabel = phase4.subtypeLabel || instName[phase4.subtypeCode] || phase4.subtypeCode;
  }

  let wing = pageLang === 'en' ? 'Not activated' : '활성화 안됨';
  let wingCode = pageLang === 'en' ? `${core} (pure core)` : `${core} (순수유형)`;
  let coreDisplay = pageLang === 'en' ? `Type ${core}` : `${core}번`;
  let wingNum = null;
  let wingMetrics = buildWingMetrics(core, final);

  if (!coreResolved) {
    coreDisplay = pageLang === 'en'
      ? `Type ${core} / Type ${second.type} (core pending)`
      : `${core}번 / ${second.type}번 (코어 보류)`;
    wing = pageLang === 'en' ? 'Available after core confirmation' : '코어 확정 후 판별 가능';
    wingCode = pageLang === 'en' ? 'Pending (core pending)' : '판별 보류 (코어 보류)';
  } else {
    const ps = {1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};
    q1.forEach((q) => {
      scorePhase1Item(q, testState.phase1Responses[q.id], (type, points) => {
        ps[type] += points;
      });
    });
    if (core === 7 && testState.tie.t7wing.enabled) { ps[6] += tb7w6 * testState.tie.t7wing.weight; ps[8] += tb7w8 * testState.tie.t7wing.weight; }
    wingMetrics = buildWingMetrics(core, ps);

    const l = core===1?9:core-1;
    const r = core===9?1:core+1;
    const ls = ps[l], rs = ps[r], cs = ps[core];
    if (ls !== rs) {
      const w = ls >= rs ? l : r;
      const ws = Math.max(ls, rs);
      if (ws > 0 && ws >= cs * TEST_CONFIG.thresholds.wingActivationRatio) {
        wing = pageLang === 'en' ? `Wing ${w}` : `${w}번 날개`;
        wingCode = `${core}w${w}`;
        wingNum = w;
      }
    }
    if (phase4 && phase4.wingNum) {
      wing = pageLang === 'en' ? `Wing ${phase4.wingNum}` : `${phase4.wingNum}번 날개`;
      wingCode = `${core}w${phase4.wingNum}`;
      wingNum = phase4.wingNum;
    }
  }

  document.getElementById('phase2-form').classList.add('hidden');
  document.getElementById('phase3-form').classList.add('hidden');
  document.getElementById('phase4-form').classList.add('hidden');
  document.getElementById('progress-container').classList.add('hidden');
  document.getElementById('result-view').classList.remove('hidden');

  const instinctMetrics = instRank.map((row) => ({
    code: row.code,
    label: instName[row.code],
    score: row.score,
    caption: row.code === getFinalSubtypeCode(instinctCode) ? '결과지의 주 본능' : ''
  }));
  const scoringAxes = buildScoringAxesSnapshot({
    coreTypeScore: final,
    instinctScore: inst,
    stateStressAdjustment
  });
  const allResponses = snapshotAllDiagnosticResponses();
  const responseTiming = buildTimingSnapshot(allResponses);
  const responseQuality = buildResponseQualitySnapshot({
    responses: allResponses,
    timings: responseTiming,
    scoringAxes,
    ranked,
    instinctPct,
    confidence
  });
  const tieSnapshot = JSON.parse(JSON.stringify(testState.tie));
  const premiumModel = buildPremiumReportModel({
    final,
    evidence,
    ranked,
    top3,
    top3Total,
    confidence,
    coreResolved,
    core,
    second,
    diff,
    phase4,
    postTieApplied,
    recentStress,
    stateStressAdjustment,
    scoringAxes,
    responseQuality,
    responseTiming,
    tieState: tieSnapshot,
    instinctCode,
    instinctLabel,
    instinctPct,
    instinctMetrics,
    wingMetrics,
    wing,
    wingCode,
    wingNum,
    coreDisplay,
    responses: allResponses
  });
  if (confidence === '낮음') {
    renderLowConfidenceGate(premiumModel);
  } else {
    renderPremiumReport(premiumModel);
  }

  if (window.ERDiagnosticExperiment && typeof window.ERDiagnosticExperiment.onResultReady === 'function') {
    window.ERDiagnosticExperiment.onResultReady({
      final,
      evidence,
      ranked,
      top3Total,
      confidence,
      coreResolved,
      core,
      second,
      diff,
      phase4,
      postTieApplied,
      recentStress,
      stateStressAdjustment,
      scoringAxes,
      responseQuality,
      responseTiming,
      confidenceExplanation: premiumModel.confidenceExplanation,
      instinctMetrics,
      wingMetrics,
      reportKey: premiumModel.reportKey,
      tieSnapshot,
      responses: premiumModel.responses,
      eliminatedTypes: testState.eliminatedTypes.slice(),
      eliminationResurrected: testState.eliminationResurrected.slice()
    });
  }

  const pdfBtn = document.getElementById('download-pdf-btn');
  if (pdfBtn) pdfBtn.onclick = downloadResultPdf;
}

localizeStaticTestPage();
renderTypeElimination();
renderQuestions('phase1-container', q1, 'p1');
setProgress(20);
if (typeof window !== 'undefined') {
  window.submitTypeElimination = submitTypeElimination;
}
requestAnimationFrame(revealTestPageAfterLoad);

if (typeof window !== 'undefined' && window.parent !== window && typeof ResizeObserver === 'function') {
  const embedResizeObserver = new ResizeObserver(() => notifyEmbedResize());
  embedResizeObserver.observe(document.documentElement);
  if (document.body) embedResizeObserver.observe(document.body);
  scheduleEmbedResize();
}

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

  const shareText = pageLang === 'en'
    ? [
      `My Enneagram result: ${typeResult}`,
      instincts ? `${instincts}` : '',
      confidence ? `(${confidence})` : '',
      '',
      'Try the ER Enneagram assessment 👇',
      shareUrl
    ].filter(Boolean).join('\n')
    : [
      `나의 에니어그램 유형: ${typeResult}`,
      instincts ? `${instincts}` : '',
      confidence ? `(${confidence})` : '',
      '',
      'ER 에니어그램 심층 진단으로 알아보기 👇',
      shareUrl
    ].filter(Boolean).join('\n');

  if (navigator.share) {
    navigator.share({
      title: pageLang === 'en' ? `Enneagram Result: ${typeResult}` : `에니어그램 결과: ${typeResult}`,
      text: shareText,
      url: shareUrl
    }).catch(() => {});
    return;
  }

  // Fallback: copy to clipboard
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(shareText).then(() => {
      showShareToast(uiText('shareCopied'));
    }).catch(() => {
      showShareToast(uiText('shareCopyFail'));
    });
  } else {
    const ta = document.createElement('textarea');
    ta.value = shareText;
    ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0;';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try { document.execCommand('copy'); showShareToast(uiText('shareCopied')); }
    catch (_) { showShareToast(uiText('shareCopyFail')); }
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
      'background:#202219', 'color:#fff', 'padding:10px 20px', 'border-radius:24px',
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

const params = new URLSearchParams(window.location.search || '');
const pageLang = params.get('lang') === 'en' ? 'en' : 'ko';
document.documentElement.lang = pageLang === 'en' ? 'en' : 'ko';

const TEST_UI = {
  ko: {
    loadingKicker: '진단 페이지 준비 중',
    title: '적응형 에니어그램 심층 진단',
    subtitle: '행동 뒤의 핵심 동기를 탐색하고, 2단계 타이브레이커로 경합 유형을 좁힙니다.',
    disclaimer: '* 본 진단은 자가탐색 참고용이며, 의학적 또는 임상적 진단을 대체하지 않습니다.',
    phase1IntroTitle: '1부: 일상적 자동반응 패턴',
    phase1IntroDesc: '불안/압박 상황에서 어떤 대처가 자동으로 나오는지 체크해 주세요.',
    phase1Submit: '2단계로 이동',
    phase2IntroTitle: '1차 분석 완료',
    phase2IntroDesc: '후보 유형 경합을 줄이기 위한 심층 질문입니다.',
    phase2Submit: '결과 보기',
    phase3IntroTitle: '마지막 정밀 감별',
    phase3IntroDesc: '상위 2개 유형이 모두 높게 경합 중입니다. 최종 확정을 위해 아래 문항 1개만 선택해 주세요.',
    phase3Submit: '최종 결과 보기',
    requiredAll: '모든 문항에 응답해 주세요.',
    requiredOne: '문항을 선택해 주세요.',
    step2Label: '2단계: 동기 교차 검증',
    step3Label: '3단계: 최종 타이브레이커',
    analysisReportTitle: '분석 리포트',
    top3Title: '상위 3유형 상대 점유율 및 근거',
    consultText: '현재 결과는 1순위/2순위가 매우 근접한 상태입니다. 더 정확한 확인을 원하시면 무료 1:1 타이핑 세션에서 함께 정리해 드릴게요.',
    consultBtn: '무료 1:1 세션 신청',
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
    subtitle: 'We explore your core motivations and narrow close candidates with a two-step tie-breaker.',
    disclaimer: '* This assessment is for self-exploration and does not replace medical or clinical diagnosis.',
    phase1IntroTitle: 'Part 1: Everyday automatic response patterns',
    phase1IntroDesc: 'Please rate how your automatic response tends to show up under pressure or uncertainty.',
    phase1Submit: 'Continue to Phase 2',
    phase2IntroTitle: 'Phase 1 analysis complete',
    phase2IntroDesc: 'These follow-up questions help separate close candidate types.',
    phase2Submit: 'View results',
    phase3IntroTitle: 'Final precision check',
    phase3IntroDesc: 'Your top two types are very close. Please answer one final question.',
    phase3Submit: 'See final result',
    requiredAll: 'Please answer every question before continuing.',
    requiredOne: 'Please select one option to continue.',
    step2Label: 'Phase 2: Cross-check core motivations',
    step3Label: 'Phase 3: Final tie-breaker',
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

function uiText(key) {
  return (TEST_UI[pageLang] && TEST_UI[pageLang][key]) || TEST_UI.ko[key] || key;
}

function localizeStaticTestPage() {
  const map = {
    'loading-kicker': 'loadingKicker',
    'test-title': 'title',
    'test-subtitle': 'subtitle',
    'test-disclaimer': 'disclaimer',
    'phase1-intro-title': 'phase1IntroTitle',
    'phase1-intro-desc': 'phase1IntroDesc',
    'phase1-submit-btn': 'phase1Submit',
    'phase2-intro-title': 'phase2IntroTitle',
    'phase2-intro-desc': 'phase2IntroDesc',
    'phase2-submit-btn': 'phase2Submit',
    'phase3-intro-title': 'phase3IntroTitle',
    'phase3-intro-desc': 'phase3IntroDesc',
    'phase3-submit-btn': 'phase3Submit',
    'validation-msg-1': 'requiredAll',
    'validation-msg-2': 'requiredAll',
    'validation-msg-3': 'requiredOne',
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
  if (stepLabel && pageLang === 'en') stepLabel.textContent = 'Phase 1: Baseline pattern and instinct scan';
}

// Minimal English question/option texts (ported from adaptiveQuestionEn in index.html)
const questionTextEn = {
  t2: "When I am with other people, I become aware of how I am coming across before I focus on what I actually feel.",
  t5: "When something unexpected happens, I want to step back and secure time to take in the situation before jumping in.",
  t8: "When I see an unfair or oppressive situation, I want to step in directly and change the flow rather than stand back.",
  c1: "When something feels off, I feel driven to fix it and get it right, and I can become strict with myself and others.",
  c2: "When I feel needed in a relationship, my sense of value becomes clearer.",
  c3: "When my sense of worth feels threatened, I shift into performance and image mode to restore credibility.",
  c4: "When life feels too ordinary, I look for emotional depth and personal meaning, even if it delays contentment.",
  c5: "When demands pile up, I pull back to conserve energy, and that distance can make me seem emotionally unavailable.",
  c6: "Before making an important decision, I want to check whether I may have missed any risks before I move ahead.",
  c7: "When discomfort rises, I instinctively open up options and pivot toward possibility, often delaying direct emotional contact.",
  c8: "When I see my people or the vulnerable being treated unfairly or used, my first reaction is to step in directly to protect them and change the situation, rather than back off.",
  c9: "When tension starts building, I would rather let things pass gently than make my position clear and risk the atmosphere turning harsh.",
  f_2_3: "Under pressure, which pattern shows up first for you?",
  f_3_6: "When pressure rises, which response feels more automatic for you?",
  f_6_8: "When you feel threatened, which response is more automatic?",
  f_1_9: "Right before conflict, which response tends to come first?",
  f_5_7: "When your energy is low, which recovery pattern appears first?",
  f_2_8: "When a relationship feels unstable, which reaction is more automatic?",
  f_2_3_a: "A. I first move to care for the other person and hold on to the connection.",
  f_2_3_b: "B. I first move to prove competence and take charge of the situation.",
  f_3_6_a: "A. Even if the information is not fully organized, I move first to create results and get the flow going.",
  f_3_6_b: "B. Even if things slow down a little, I need to check for missed risks and variables before I can move.",
  tb_3_6_1: "Which of these situations feels harder for you to endure?",
  tb_3_6_1_a: "A. Looking unprepared and ending up unable to produce results, so that I seem incompetent.",
  tb_3_6_1_b: "B. Finishing quickly on the surface, only to have a major problem emerge later because I did not check enough.",
  tb_3_6_2: "When the pressure is high, which thought tends to repeat more in your mind?",
  tb_3_6_2_a: "A. I need to show results quickly. If I hesitate, I will fall behind and lose value.",
  tb_3_6_2_b: "B. I may be missing something. If I move without checking, a bigger problem may appear later.",
  tb_5_6_1: "When demands and variables pile up at once, which response feels more automatic for you?",
  tb_5_6_1_a: "A. I need to step back a little and secure some distance so I can sort things out on my own.",
  tb_5_6_1_b: "B. I need to check whether there are missing facts or danger signals before I can relax.",
  tb_5_6_2: "Which of these situations feels harder for you to endure?",
  tb_5_6_2_a: "A. My space and energy getting drained because I keep reacting and staying connected.",
  tb_5_6_2_b: "B. Moving before checking enough and then having a problem surface later.",
  tb_3_1_1: "When a deadline and a standard collide, which do you more often protect first?",
  tb_3_1_1_a: "A. Results and speed first, then I can improve what is rough later.",
  tb_3_1_1_b: "B. Accuracy and standards first, even if the result comes more slowly.",
  tb_3_1_2: "When something goes wrong, which failure feels more piercing to you?",
  tb_3_1_2_a: "A. Not producing enough and looking less competent than I should.",
  tb_3_1_2_b: "B. Getting it done but realizing the process was wrong or inaccurate.",
  tb_7_1_1: "When a situation feels stuck and frustrating, which response is closer to yours?",
  tb_7_1_1_a: "A. I first look for another path or option to change the flow.",
  tb_7_1_1_b: "B. I first look for what is off so I can correct and organize it.",
  tb_7_1_2: "Which state is harder for you to tolerate?",
  tb_7_1_2_a: "A. Being trapped in the same problem with no open options.",
  tb_7_1_2_b: "B. An incorrect or misaligned part remaining unresolved.",
  tb_7_1_3: "In a frustrating situation, which thought comes first?",
  tb_7_1_3_a: "A. If I stay here, I will get more stuck. I need to find another path.",
  tb_7_1_3_b: "B. I cannot just let this pass. I need to correct what is wrong.",
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
  tb_7_8_1: "In a frustrating situation, which feeling is harder for you to tolerate first?",
  tb_7_8_1_a: "A. Feeling trapped with no room to move or choose another path.",
  tb_7_8_1_b: "B. Feeling that someone is trying to stand over me and direct me.",
  tb_7_8_2: "When you push strongly, which motive is closer to what is happening inside?",
  tb_7_8_2_a: "A. I want to break the stuck flow and make room to breathe again.",
  tb_7_8_2_b: "B. I want to stop a line being crossed and avoid being pushed around.",
  tb_7_8_3: "After conflict, which feeling tends to remain longer?",
  tb_7_8_3_a: "A. The frustration that my options still feel too limited or blocked.",
  tb_7_8_3_b: "B. The discomfort that I have not fully recovered my position or control.",
  f_6_8_a: "A. I start with verification, alignment, and safeguards.",
  f_6_8_b: "B. I intervene directly to reset the power balance.",
  f_1_9_a: "A. I clarify standards and correct what is off.",
  f_1_9_b: "B. I reduce friction and preserve relational flow.",
  f_5_7_a: "A. I step back, analyze, and minimize stimulation.",
  f_5_7_b: "B. I look for pivots and fresh stimulating options.",
  f_2_8_a: "A. I offer more care to hold the connection.",
  f_2_8_b: "B. I draw firmer boundaries and reclaim control.",
  tb_1_8_1: "Which feels harder for you to tolerate over time?",
  tb_1_8_1_a: "A. A wrong way of doing things becoming fixed and staying uncorrected.",
  tb_1_8_1_b: "B. Someone pushing into my territory or treating my boundary lightly.",
  tb_1_8_2: "Which fear feels more piercing to you?",
  tb_1_8_2_a: "A. Being exposed as flawed, inaccurate, or not properly put together.",
  tb_1_8_2_b: "B. Being pushed back, looked down on, or controlled because I seem weak.",
  tb_1_8_3: "When you lead people, which state is harder for you to endure?",
  tb_1_8_3_a: "A. Everything getting loose and misaligned because no clear standard is holding.",
  tb_1_8_3_b: "B. Outside pressure pushing in while our side looks weak and easy to override.",
  tb_1_8_4: "Which inner pressure tends to activate first in you?",
  tb_1_8_4_a: "A. I need to correct what is wrong and set it back in order.",
  tb_1_8_4_b: "B. I need to put force behind this right now so I do not get pushed around.",
  tb_1_8_5: "What is the deeper reason you are likely to confront something directly?",
  tb_1_8_5_a: "A. To correct a wrong standard or restore a disordered situation.",
  tb_1_8_5_b: "B. To reclaim a crossed boundary and recover initiative.",
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
  tb_3_7_1: "When pressure rises, which response is closer to yours?",
  tb_3_7_1_a: "A. I want to create results and regain the flow so I can show that I can handle it.",
  tb_3_7_1_b: "B. I want to break the stuck flow and find another possibility or a way to breathe again.",
  tb_3_7_2: "Which state is harder for you to tolerate?",
  tb_3_7_2_a: "A. Being stuck without results and looking incompetent.",
  tb_3_7_2_b: "B. Having options close down and being tied to one frustrating direction.",
  tb_3_7_3: "When work gets blocked, which thought comes first?",
  tb_3_7_3_a: "A. I need to create a result quickly and recover the flow.",
  tb_3_7_3_b: "B. I cannot stay trapped here. I need to find another path first.",
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
    t56: {enabled:false,weight:0,margin:null},
    t59: {enabled:false,weight:0,margin:null},
    t31: {enabled:false,weight:0,margin:null},
    t37: {enabled:false,weight:0,margin:null},
    t38: {enabled:false,weight:0,margin:null},
    t39: {enabled:false,weight:0,margin:null},
    t45: {enabled:false,weight:0,margin:null},
    t46: {enabled:false,weight:0,margin:null},
    t47: {enabled:false,weight:0,margin:null},
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
    t89: {enabled:false,weight:0,margin:null},
    tGeneric: {enabled:false,typeA:null,typeB:null,weight:0},
    t7wing: {enabled:false,weight:0,margin:null}
  }
};

const q1 = [
  { id:'t2', type:2, q:'여러 사람 앞에 있을 때, 내 진짜 감정보다 내가 어떻게 비칠지가 먼저 신경 쓰이는 편이다.' },
  { id:'t5', type:5, q:'예상 밖의 일이 생기면, 바로 뛰어들기보다 한 걸음 물러나 상황을 파악할 시간을 먼저 확보하고 싶어진다.' },
  { id:'t8', type:8, q:'부당하거나 억눌리는 상황을 보면, 물러서기보다 직접 개입해 흐름을 바꾸고 싶어지는 편이다.' },
  { id:'c1', type:1, q:'일을 할 때 스스로 정한 기준과 원칙을 맞추려는 압력이 강한 편이다.' },
  { id:'c2', type:2, q:'관계에서 내가 필요한 사람으로 느껴질 때, 내 가치가 더 또렷해지는 편이다.' },
  { id:'c3', type:3, q:'내가 유능하고 가치 있게 보이는지를 성과로 확인하려는 동기가 강한 편이다.' },
  { id:'c4', type:4, q:'평범하고 무난한 흐름이 길어지면, 내 고유함이 흐려진다고 느끼는 편이다.' },
  { id:'c5', type:5, q:'사람들과 오래 상호작용하면 에너지가 빠르게 소진되어, 혼자 거리를 두고 정리하는 시간이 반드시 필요하다.' },
  { id:'c6', type:6, q:'중요한 결정을 앞두면, 바로 실행하기보다 놓친 위험이 없는지 먼저 확인하고 싶어지는 편이다.' },
  { id:'c7', type:7, q:'분위기가 무겁거나 답답할 때, 그 감정에 머물기보다 새로운 가능성으로 빠르게 전환하려는 반응이 먼저 나온다.' },
  { id:'c8', type:8, q:'내 사람이나 약자가 부당하게 공격받거나 이용당하는 것을 보면, 물러서기보다 직접 개입해 보호하고 판을 바꾸려는 반응이 먼저 나온다.' },
  { id:'c9', type:9, q:'갈등 기류가 생기면, 내 입장을 분명히 하기보다 분위기가 거칠어지지 않게 넘기고 싶어지는 편이다.' },
  { id:'f_2_3', format:'ab', leftType:2,rightType:3,weight:2.2,q:'압박 상황에서 내 안에서 더 자동으로 튀어나오는 패턴에 가까운 쪽을 고르세요.',a:'나는 먼저 상대의 필요를 읽고 돕는 방식으로 관계를 붙잡으려는 반응이 더 먼저 나온다.',b:'나는 먼저 성과와 유능함을 증명해 상황을 장악하려는 반응이 더 먼저 나온다.' },
  { id:'f_3_6', format:'ab', leftType:3,rightType:6,weight:2.2,q:'압박이 커질 때, 내 반응은 어느 쪽에 더 가까운가?',a:'정보가 덜 정리돼도 일단 결과를 만들며 흐름을 잡으려는 쪽으로 먼저 움직인다.',b:'속도가 조금 늦어져도 빠진 위험과 변수부터 확인해야 움직일 수 있다.' },
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
  2:[{id:'d2_1',type:2,q:'관계가 흔들린다고 느껴질수록, 내가 더 따뜻하고 유용하게 움직여 다시 필요한 사람이 되어야 연결이 유지된다고 느끼는 편이다.'},{id:'d2_2',type:2,q:'상대가 원하는 것은 빨리 보이는데, 내가 원하는 것을 먼저 말하는 일은 불편한 편이다.'}],
  3:[{id:'d3_1',type:3,q:'있는 그대로의 나보다, 유능하고 성과 내는 사람으로 보일 때 가치가 확인된다는 동기가 강해서 결과를 통해 존재 가치를 증명하려는 압력이 크게 작동하는 편이다.'},{id:'d3_2',type:3,q:'실패하거나 무능해 보이는 장면이 남을 수 있다고 느끼면, 실제 상황 전부터 긴장과 스트레스가 크게 올라오며 성과 회복 압력이 강해지는 편이다.'}],
  4:[{id:'d4_1',type:4,q:'겉으로 함께 있어도 나만 완전히 이해받지 못한다는 정서적 거리감을 자주 느끼며, 슬픔이나 결핍의 경험을 통해 오히려 내 고유성이 선명해진다고 느끼는 편이다.'},{id:'d4_2',type:4,q:'반복적이고 평탄한 일상만 이어지면 정서적으로 무감해지기 쉽고, 감정의 깊이와 의미가 살아 있는 장면에서 존재감이 또렷해지는 편이다.'}],
  5:[{id:'d5_1',type:5,q:'문제 한가운데 직접 뛰어들기보다 한 걸음 떨어진 자리에서 구조를 관찰하고 파악할 때 더 안전하고 통제 가능하다고 느끼는 편이다.'},{id:'d5_2',type:5,q:'예고 없는 감정 요구나 갑작스러운 침범이 들어오면, 관계를 끊으려는 의도는 없어도 즉시 에너지를 닫고 물러나 정리하려는 반응이 자동으로 나온다.'}],
  6:[{id:'d6_1',type:6,q:'중요한 결정을 내리기 전, 겉으로 드러난 정보보다 숨어 있는 의도와 잠재적 리스크를 먼저 확인해야 안심이 되는 편이며 대비가 부족하면 불안이 크게 올라온다.'},{id:'d6_2',type:6,q:'믿을 만해 보이는 사람이나 시스템도, 정말 신뢰해도 되는지 속으로 계속 점검하는 편이다.'}],
  7:[{id:'d7_1',type:7,q:'불편한 현실이나 무거운 감정에 오래 머물면 에너지가 급격히 떨어져서, 의식적으로든 무의식적으로든 분위기를 바꾸거나 다른 가능성으로 주의를 전환하려는 패턴이 나타난다.'},{id:'d7_2',type:7,q:'선택지가 닫히거나 한 길에 오래 묶이는 상황을 답답하게 느껴, 언제든 방향을 바꿀 수 있는 여지를 남겨둘 때 심리적으로 훨씬 자유롭고 안정된 편이다.'}],
  8:[{id:'d8_1',type:8,q:'내 사람이나 약자가 부당하게 공격받거나 이용당하는 것을 보면, 주도권을 회수하고 보호하려는 반응이 먼저 나온다.'},{id:'d8_2',type:8,q:'인정을 원하는 것처럼 보이는 순간에도 핵심 동기는 칭찬 자체보다, 내 영향력이 무시되지 않고 함부로 통제되지 않는 상태를 확보하려는 데 더 가깝다.'}],
  9:[{id:'d9_1',type:9,q:'관계나 환경의 긴장이 높아지면, 문제를 더 키우지 않기 위해 내 욕구와 우선순위를 뒤로 미루고 일단 부드럽게 지나가게 만드는 선택을 자주 한다.'},{id:'d9_2',type:9,q:'중요한 갈등이나 결정을 앞두면, 그 문제를 바로 다루기보다 다른 일로 넘어가며 잠시 흐리고 싶어지는 편이다.'}]
};

const tb36 = [
  {id:'tb_3_6_1',format:'ab',leftType:3,rightType:6,q:'둘 중 내게 더 견디기 어려운 상황은 어느 쪽에 가까운가?',a:'준비가 덜 되어 보여도, 결과를 못 내 무능해 보이는 것',b:'겉으로는 빨리 해냈어도, 확인 부족으로 큰 문제가 뒤늦게 터지는 것'},
  {id:'tb_3_6_2',format:'ab',leftType:3,rightType:6,q:'압박이 심할 때, 내 머릿속에서 더 자주 반복되는 쪽은 어느 쪽에 가까운가?',a:'빨리 결과를 보여 줘야 한다. 멈칫하면 뒤처지고 가치가 떨어진다.',b:'뭔가 빠뜨린 게 있을 수 있다. 확인 없이 가면 나중에 더 큰 문제가 된다.'}
];
const tb56 = [
  {id:'tb_5_6_1',format:'ab',leftType:5,rightType:6,q:'요구와 변수가 한꺼번에 몰릴 때, 내 반응은 어느 쪽에 더 가까운가?',a:'일단 사람과 자극에서 조금 물러나 혼자 정리할 거리부터 확보해야 한다.',b:'빠진 정보나 위험 신호가 없는지 먼저 확인해야 마음이 놓인다.'},
  {id:'tb_5_6_2',format:'ab',leftType:5,rightType:6,q:'둘 중 내게 더 견디기 어려운 상황은 어느 쪽에 가까운가?',a:'계속 반응하고 연결되느라 내 공간과 에너지가 바닥나는 것',b:'확인이 덜 된 채 움직였다가 나중에 문제가 터지는 것'}
];
const tb59 = [
  {id:'tb_5_9_1',format:'ab',leftType:5,rightType:9,q:'사람이나 상황에서 물러나고 싶어질 때, 내 반응은 어느 쪽에 더 가까운가?',a:'내 에너지와 생각할 공간이 더 잠식되기 전에 거리를 확보하고 싶어진다.',b:'이 분위기가 더 불편해지기 전에 조용히 빠져 긴장을 낮추고 싶어진다.'},
  {id:'tb_5_9_2',format:'ab',leftType:5,rightType:9,q:'둘 중 내게 더 견디기 어려운 상태는 어느 쪽에 가까운가?',a:'사람과 요구가 계속 들어와 내 공간과 집중이 침범되는 상태',b:'관계 안의 불편한 기류와 긴장이 계속 이어지는 상태'},
  {id:'tb_5_9_3',format:'ab',leftType:5,rightType:9,q:'거리를 두고 싶어질 때, 내 머릿속에 더 먼저 도는 말은 어느 쪽에 가까운가?',a:'이대로 두면 너무 많이 들어온다. 조금 떨어져 정리할 공간이 필요하다.',b:'이대로 두면 분위기가 더 무거워진다. 조용히 지나가게 두는 게 낫다.'}
];
const tb31 = [
  {id:'tb_3_1_1',format:'ab',leftType:3,rightType:1,q:'마감과 기준이 충돌할 때, 더 자주 먼저 지키는 쪽은 어느 쪽인가?',a:'일단 결과와 속도',b:'일단 정확성과 기준'},
  {id:'tb_3_1_2',format:'ab',leftType:3,rightType:1,q:'일이 어그러졌을 때 더 먼저 찔리는 쪽은 어느 쪽인가?',a:'충분히 해내지 못해 유능하지 않아 보인 것',b:'제대로 하지 못해 틀리거나 부정확했던 것'}
];
const tb37 = [
  {id:'tb_3_7_1',format:'ab',leftType:3,rightType:7,q:'압박이 커질 때, 내 반응은 어느 쪽에 더 가까운가?',a:'일단 성과를 만들고 흐름을 잡아 내가 해낼 수 있다는 걸 보여 주고 싶어진다.',b:'일단 답답한 흐름을 깨고 다른 가능성이나 숨통 트일 길을 찾고 싶어진다.'},
  {id:'tb_3_7_2',format:'ab',leftType:3,rightType:7,q:'둘 중 내게 더 견디기 어려운 상태는 어느 쪽에 가까운가?',a:'성과 없이 정체되어 내가 무능해 보이는 상태',b:'선택지가 막히고 한 방향에 묶여 답답한 상태'},
  {id:'tb_3_7_3',format:'ab',leftType:3,rightType:7,q:'일이 막힐 때, 내 머릿속에 더 먼저 도는 말은 어느 쪽에 가까운가?',a:'빨리 결과를 만들어 흐름을 회복해야 한다.',b:'이 상태에 갇히면 안 된다. 다른 길부터 찾아야 한다.'}
];
const tb38 = [
  {id:'tb_3_8_1',format:'ab',leftType:3,rightType:8,q:'내가 목표를 강하게 밀어붙일 때, 더 핵심에 가까운 이유는 어느 쪽인가?',a:'결과를 통해 내 유능함과 가치를 분명히 보여 주고 싶어서',b:'누구에게도 밀리지 않고 내 영향력과 주도권을 분명히 하고 싶어서'},
  {id:'tb_3_8_2',format:'ab',leftType:3,rightType:8,q:'둘 중 내게 더 견디기 어려운 상태는 어느 쪽에 가까운가?',a:'성과를 못 내서 존재감이 약해지고 무능해 보이는 상태',b:'내 의사와 상관없이 누군가에게 주도권을 빼앗기고 밀리는 상태'},
  {id:'tb_3_8_3',format:'ab',leftType:3,rightType:8,q:'일이 뜻대로 안 풀릴 때, 더 먼저 찔리는 쪽은 어느 쪽에 가까운가?',a:'내가 충분히 해내지 못해 기대만큼 인정받지 못할 것 같은 느낌',b:'내가 흐름을 장악하지 못하고 남에게 휘둘리고 있다는 느낌'}
];
const tb45 = [
  {id:'tb_4_5_1',format:'ab',leftType:4,rightType:5,q:'혼자 있을 때, 내 에너지가 더 자연스럽게 향하는 쪽은 어느 쪽에 가까운가?',a:'내 감정과 결핍이 무엇을 말하는지 오래 붙들고 느껴 보는 쪽',b:'관심 있는 주제를 이해 가능한 구조로 정리하고 파고드는 쪽'},
  {id:'tb_4_5_2',format:'ab',leftType:4,rightType:5,q:'힘들거나 공허할 때, 더 자주 먼저 가는 쪽은 어느 쪽에 가까운가?',a:'그 감정의 결을 더 느끼고, 왜 이런 마음이 드는지 내 안으로 더 내려간다',b:'감정에 바로 잠기기보다, 일단 거리를 두고 이해 가능한 방식으로 정리하려 한다'},
  {id:'tb_4_5_3',format:'ab',leftType:4,rightType:5,q:'둘 중 내게 더 견디기 어려운 상태는 어느 쪽에 가까운가?',a:'내 감정이 밋밋해지고, 내가 누구인지 흐려지는 상태',b:'사람과 요구가 너무 많이 들어와 내 공간과 생각이 침범되는 상태'}
];
const tb46 = [
  {id:'tb_4_6_1',format:'ab',leftType:4,rightType:6,q:'마음이 불안정해질 때, 내 생각이 더 먼저 향하는 쪽은 어느 쪽에 가까운가?',a:'나는 왜 이렇게 결핍되어 있고, 남들처럼 자연스럽지 못한가',b:'지금 뭔가 놓치고 있는 게 있지 않은가, 앞으로 문제가 생기지 않을까'},
  {id:'tb_4_6_2',format:'ab',leftType:4,rightType:6,q:'둘 중 내게 더 견디기 어려운 상태는 어느 쪽에 가까운가?',a:'아무리 있어도 채워지지 않고, 내가 누구인지 흐려지는 상태',b:'믿고 있던 것이 흔들리고, 무엇을 믿어야 할지 확신이 서지 않는 상태'},
  {id:'tb_4_6_3',format:'ab',leftType:4,rightType:6,q:'크게 흔들릴 때, 내가 더 먼저 붙잡는 쪽은 어느 쪽에 가까운가?',a:'지금 내 감정이 무엇을 말하는지 더 깊이 느껴 보려는 쪽',b:'믿을 만한 기준, 설명, 확인 가능한 근거를 찾으려는 쪽'}
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
const tb3sx = [{id:'tb_3_sx_1',type:3,q:'내가 끝까지 목표를 밀어붙이는 핵심 동력은, 유능하고 가치 있는 사람으로 보이는 결과를 만들어 신뢰와 인정을 확보하려는 데 더 가깝다.'},{id:'tb_3_sx_2',q:'내가 한 대상에 깊게 몰입하는 핵심 동력은, 외부 인정보다 몰입 과정의 강한 집중감과 에너지 자체를 끝까지 경험하려는 데 더 가깝다.'}];
const tb71 = [
  {id:'tb_7_1_1',format:'ab',leftType:7,rightType:1,q:'상황이 막히고 답답할 때, 내 반응은 어느 쪽에 더 가까운가?',a:'일단 다른 길이나 새로운 선택지를 찾아 흐름을 바꾸고 싶어진다.',b:'일단 무엇이 어긋났는지 찾아 바로잡고 정리하고 싶어진다.'},
  {id:'tb_7_1_2',format:'ab',leftType:7,rightType:1,q:'둘 중 내게 더 견디기 어려운 상태는 어느 쪽에 가까운가?',a:'선택지가 막혀 같은 문제 안에 오래 갇혀 있는 상태',b:'틀리거나 어긋난 부분이 그대로 남아 있는 상태'},
  {id:'tb_7_1_3',format:'ab',leftType:7,rightType:1,q:'답답한 상황에서 내 머릿속에 더 먼저 도는 말은 어느 쪽에 가까운가?',a:'이렇게 계속 있으면 더 막힌다. 다른 길부터 찾아야 한다.',b:'이 상태로 넘기면 안 된다. 잘못된 부분부터 바로잡아야 한다.'}
];
const tb78 = [
  {id:'tb_7_8_1',format:'ab',leftType:7,rightType:8,q:'답답한 상황에서 더 먼저 못 견디는 것은 어느 쪽에 가까운가?',a:'선택지가 막혀 움직일 수 없는 느낌',b:'누군가가 내 위에 서서 좌우하려는 느낌'},
  {id:'tb_7_8_2',format:'ab',leftType:7,rightType:8,q:'내가 세게 나갈 때 더 가까운 동기는 어느 쪽인가?',a:'흐름을 깨고 숨통을 트기 위해서',b:'선 넘는 흐름을 끊고 밀리지 않기 위해서'},
  {id:'tb_7_8_3',format:'ab',leftType:7,rightType:8,q:'갈등 후에도 더 오래 남는 것은 어느 쪽에 가까운가?',a:'여전히 선택지가 부족하고 다시 막힐 것 같은 답답함',b:'내가 아직 주도권을 완전히 회수하지 못했다는 찜찜함'}
];
const tb89 = [
  {id:'tb_8_9_1',format:'ab',leftType:8,rightType:9,q:'누군가 내게 이래라저래라 지시하거나 통제하려 할 때, 내 반응은 어느 쪽에 가까운가?',a:'"네가 뭔데?" 하는 마음이 들며 즉시 맞서거나 강하게 선을 긋는다.',b:'겉으로는 알았다고 하거나 침묵하지만, 속으로는 한 귀로 흘리며 내 페이스대로 간다.'},
  {id:'tb_8_9_2',format:'ab',leftType:8,rightType:9,q:'피할 수 없는 갈등과 마주했을 때, 내 몸의 에너지는 어느 쪽에 가까운가?',a:'오히려 에너지가 올라오고 정신이 맑아지며, 끝장을 보거나 승부를 내고 싶어진다.',b:'에너지가 급격히 빠지고 피곤해지며, 어떻게든 이 상황을 빨리 덮고 지나가고 싶어진다.'},
  {id:'tb_8_9_3',format:'ab',leftType:8,rightType:9,q:'둘 중 내게 더 견디기 어려운 상태는 어느 쪽에 가까운가?',a:'내가 만만하게 보여서 남들에게 밀리고 주도권을 뺏기는 상태',b:'시끄러운 마찰과 긴장이 계속 이어져서 내 마음이 평온할 수 없는 상태'}
];
const tb7wing = [{id:'tb_7w_1',wing:6,q:'새로운 일을 벌일 때도, 가까운 관계의 안정과 안전망이 흔들리지 않는지 먼저 점검해야 마음이 놓이는 편이다.'},{id:'tb_7w_2',wing:8,q:'새로운 일을 추진할 때, 제약이 보여도 주저하기보다 강하게 밀어붙이며 방해가 생기면 정면으로 돌파하는 편이다.'}];

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

// 1번 vs 8번 타이브레이커: 동기(Why) 기반 – SO 1 / SO 8 오타이핑 감소
const tb18 = [
  { id:'tb_1_8_1', format:'ab', leftType:1, rightType:8, weight:2.2, q:'더 오래 참기 어려운 쪽은 어느 쪽에 가까운가?', a:'틀린 방식이 그대로 굳어지는 것', b:'누군가가 내 영역을 함부로 넘보는 것' },
  { id:'tb_1_8_2', format:'ab', leftType:1, rightType:8, weight:2.2, q:'더 찔리는 두려움은 어느 쪽에 가까운가?', a:'내가 결함 있거나 부정확한 사람으로 드러나는 것', b:'내가 밀리거나 약하게 보여 통제당하는 것' },
  { id:'tb_1_8_3', format:'ab', leftType:1, rightType:8, weight:2.2, q:'사람들을 이끌 때 내가 더 못 견디는 상태는 어느 쪽에 가까운가?', a:'기준 없이 흐트러져 아무나 제멋대로 움직이는 상태', b:'외부가 쉽게 침범하고 우리 쪽 힘이 약하게 보이는 상태' },
  { id:'tb_1_8_4', format:'ab', leftType:1, rightType:8, weight:2.2, q:'내 안에서 더 자주 먼저 작동하는 압박은 어느 쪽에 가까운가?', a:'잘못된 것을 바로잡아야 한다는 압박', b:'밀리지 않도록 바로 힘을 실어야 한다는 압박' },
  { id:'tb_1_8_5', format:'ab', leftType:1, rightType:8, weight:2.2, q:'내가 직접 맞서게 되는 더 핵심적인 이유는 어느 쪽에 가까운가?', a:'잘못된 기준이나 흐트러진 질서를 바로잡기 위해서', b:'침범당한 경계와 주도권을 회수하기 위해서' }
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

// 전용 타이브레이커가 없는 31개 쌍: 동기·두려움·세계관 차이 기반 전용 질문 (키: 'typeA_typeB')
const tbCustomMap = {
  '1_2': { q: '다음 두 문장 중 자신의 마음을 더 깊이·본능적으로 설명하는 쪽을 선택해 주세요.', a: '나는 다른 사람을 돕거나 조언할 때, 그들이 더 올바르고 나은 길로 가도록 이끄는 것에 대한 책임감을 느낀다. (1번 동기)', b: '나는 다른 사람을 돕거나 조언할 때, 그들과 정서적으로 연결되고 그들에게 필요한 존재가 되는 것에서 만족감을 느낀다. (2번 동기)' },
  '1_4': { q: '내 안의 결점을 마주했을 때 더 자연스러운 반응은 어느 쪽인가?', a: '어떻게든 고쳐서 기준에 맞추려 한다.', b: '그 결핍감과 슬픔 안으로 들어가 내 감정과 의미를 오래 들여다본다.' },
  '1_5': { q: '잘못되거나 틀린 것을 봤을 때 더 익숙한 반응은 어느 쪽인가?', a: '고치고 싶어서 속으로 계속 답답하고 거슬린다.', b: '에너지를 뺏기기 싫어서 신경을 끄고 거리를 둔다.' },
  '1_6': { q: '꼼꼼하게 일처리를 하는 내 마음속 진짜 동기는 어느 쪽에 가까운가?', a: '빈틈없이 깔끔하고 올바르게 완성하고 싶어서', b: '나중에 실수나 문제로 책임을 추궁당할까 봐 불안해서' },
  '1_9': { q: '마음에 안 드는 상황을 마주했을 때 나의 내적 에너지는 어느 쪽인가?', a: '어떻게든 바로잡아야 한다는 쪽으로 에너지가 모이고 팽팽해진다.', b: '굳이 긁어 부스럼 만들지 말자는 쪽으로 에너지가 흩어지고 느슨해진다.' },
  '2_3': { q: '다음 두 문장 중 자신의 마음을 더 깊이·본능적으로 설명하는 쪽을 선택해 주세요.', a: '나는 다른 사람들에게 인정받기 위해, 내가 얼마나 따뜻하고 도움을 주는 사람인지를 보여주는 것이 중요하다. (2번 동기)', b: '나는 다른 사람들에게 인정받기 위해, 내가 얼마나 유능하고 성공한 사람인지를 보여주는 것이 중요하다. (3번 동기)' },
  '2_4': { q: '관계가 흔들릴 때 더 먼저 하는 것은 어느 쪽에 가까운가?', a: '더 챙기고 더 맞춰서 필요한 존재로 연결을 회복하려 한다.', b: '내 진짜 마음을 정말 이해받고 있는지 확인하게 된다.' },
  '2_5': { q: '다음 두 문장 중 자신의 마음을 더 깊이·본능적으로 설명하는 쪽을 선택해 주세요.', a: '나는 사람들과의 관계에서 감정적인 교류와 연결을 통해 에너지를 얻는다. (2번 동기)', b: '나는 사람들과의 관계에서 나의 시간과 에너지가 소모된다고 느끼며, 혼자만의 시간이 반드시 필요하다. (5번 동기)' },
  '2_6': { q: '내가 사람들에게 헌신하는 진짜 동기에 더 가까운 것은?', a: '"네가 없으면 안 돼"라는 느낌을 주어 끊어지지 않는 관계를 만들고 싶어서', b: '나를 공격하지 않고 나를 지켜줄 수 있는 안전한 울타리를 만들고 싶어서' },
  '2_7': { q: '다음 두 문장 중 자신의 마음을 더 깊이·본능적으로 설명하는 쪽을 선택해 주세요.', a: '나의 주된 관심은 사람들이며, 그들의 필요를 채워주는 것에서 기쁨을 찾는다. (2번 동기)', b: '나의 주된 관심은 즐거운 경험이며, 새로운 가능성을 탐험하는 것에서 기쁨을 찾는다. (7번 동기)' },
  '2_8': { q: '갈등 상황에서 내가 주도권을 잡기 위해 은연중에 꺼내는 카드는 어느 쪽에 가까운가?', a: '내가 널 위해 어떻게 해줬는데 하는 내 헌신과 수고', b: '어디 한번 해보자는 건가 하는 내 힘과 단호함' },
  '2_9': { q: '관계가 어색해졌을 때, 내 쪽에서 더 자주 먼저 일어나는 반응은 어느 쪽에 가까운가?', a: '내가 더 챙기고 더 맞춰서라도 다시 필요한 사람으로 연결을 회복하고 싶어진다.', b: '내 입장을 조금 접더라도 이 분위기가 더 거칠어지지 않게 빨리 눌러 두고 싶어진다.' },
  '3_4': { q: '다음 두 문장 중 자신의 마음을 더 깊이·본능적으로 설명하는 쪽을 선택해 주세요.', a: '나는 내가 성취한 것과 성공적인 이미지를 통해 나의 가치를 증명하려고 한다. (3번 동기)', b: '나는 내가 얼마나 독특하고 진실한 감정을 가졌는지를 통해 나의 정체성을 찾으려고 한다. (4번 동기)' },
  '3_5': { q: '다음 두 문장 중 자신의 마음을 더 깊이·본능적으로 설명하는 쪽을 선택해 주세요.', a: '나는 전문적인 지식을 쌓는 이유가 그것을 통해 성공을 이루고 최고로 인정받기 위해서이다. (3번 동기)', b: '나는 전문적인 지식을 쌓는 이유가 그것을 통해 세상을 이해하고 유능함을 느끼기 위해서이다. (5번 동기)' },
  '3_7': { q: '압박이 올 때 더 먼저 붙잡는 것은 어느 쪽에 가까운가?', a: '결과와 성과를 만들어 흐름을 회복하는 것', b: '다른 가능성과 답답함에서 빠져나갈 길을 찾는 것' },
  '3_8': { q: '내가 강하게 나갈 때 더 중요한 것은 어느 쪽에 가까운가?', a: '결과로 내 실력을 증명하는 것', b: '흐름을 장악하고 밀리지 않는 것' },
  '3_9': { q: '다른 사람들에게 맞춰서 행동할 때 나의 진짜 목적은 어느 쪽에 가까운가?', a: '상황에 잘 적응하는 유능한 사람으로 인정받기 위해서', b: '굳이 내 주장을 펴서 긁어 부스럼 만들고 싶지 않아서' },
  '4_5': { q: '혼자 있을 때 더 자연스러운 쪽은 어느 쪽에 가까운가?', a: '내 감정의 의미를 오래 느껴 보는 것', b: '내 관심사를 구조적으로 이해하는 것' },
  '4_6': { q: '불안할 때 더 먼저 떠오르는 것은 어느 쪽에 가까운가?', a: '내 안의 결핍감과 소외감', b: '놓친 위험과 불확실성' },
  '4_7': { q: '내가 결핍이나 부족함을 느낄 때 대처하는 방식은 어느 쪽에 가까운가?', a: '나에게 없는 그 특별한 무언가를 계속 갈망하며, 닿지 못하는 슬픔을 느낀다.', b: '이 결핍을 채워줄 완전히 다른 새롭고 흥미로운 것들로 재빨리 눈을 돌린다.' },
  '4_8': { q: '다음 두 문장 중 자신의 마음을 더 깊이·본능적으로 설명하는 쪽을 선택해 주세요.', a: '나는 상처를 받았을 때, 내면으로 침잠하며 그 고통스러운 감정을 곱씹는 경향이 있다. (4번 동기)', b: '나는 상처를 받았을 때, 그 원인을 찾아 외부로 분노를 표출하고 복수하려는 경향이 있다. (8번 동기)' },
  '4_9': { q: '다음 두 문장 중 자신의 마음을 더 깊이·본능적으로 설명하는 쪽을 선택해 주세요.', a: '나는 나 자신을 남들과는 다른 특별하고 독특한 존재로 인식하며, 평범해지는 것을 꺼린다. (4번 동기)', b: '나는 나 자신을 다른 사람들과 조화를 이루는 평범한 존재로 인식하며, 갈등을 일으키는 것을 꺼린다. (9번 동기)' },
  '5_6': { q: '요구와 변수가 한꺼번에 몰릴 때, 내 반응은 어느 쪽에 더 가까운가?', a: '일단 사람과 자극에서 조금 물러나 혼자 정리할 거리부터 확보해야 한다.', b: '빠진 정보나 위험 신호가 없는지 먼저 확인해야 마음이 놓인다.' },
  '5_7': { q: '다음 두 문장 중 자신의 마음을 더 깊이·본능적으로 설명하는 쪽을 선택해 주세요.', a: '나의 주된 정신 활동은 관심 있는 주제를 깊이 파고들어 전문 지식을 쌓는 것이다. (5번 동기)', b: '나의 주된 정신 활동은 여러 아이디어들을 빠르게 연결하고 새로운 가능성을 상상하는 것이다. (7번 동기)' },
  '5_8': { q: '다음 두 문장 중 자신의 마음을 더 깊이·본능적으로 설명하는 쪽을 선택해 주세요.', a: '갈등 상황에서 나는 물리적으로나 정신적으로 거리를 두고, 상황을 객관적으로 관찰하고 분석하려 한다. (5번 동기)', b: '갈등 상황에서 나는 그 중심에 뛰어들어, 상황을 통제하고 나의 힘으로 문제를 해결하려 한다. (8번 동기)' },
  '5_9': { q: '내가 거리를 둘 때 더 가까운 이유는 어느 쪽인가?', a: '내 공간과 에너지가 더 침범되기 전에 지키기 위해서', b: '불편한 긴장과 무거운 분위기가 더 커지지 않게 하기 위해서' },
  '6_7': { q: '다음 두 문장 중 자신의 마음을 더 깊이·본능적으로 설명하는 쪽을 선택해 주세요.', a: '나는 불확실한 미래에 대해 최악의 경우를 먼저 생각하고 대비책을 세우며 불안감을 관리한다. (6번 동기)', b: '나는 불확실한 미래에 대해 가장 즐거운 가능성을 먼저 생각하며 불안감을 잊으려고 한다. (7번 동기)' },
  '6_8': { q: '강하게 반발하고 맞설 때, 내 행동의 밑바탕에 깔린 감정에 더 가까운 것은?', a: '도대체 무슨 속셈이지 하는 불안과 의심', b: '어디 한번 해보자는 건가 하는 분노와 팽창감' },
  '6_9': { q: '결정을 미루게 될 때, 더 가까운 이유는 어느 쪽인가?', a: '아직 확인이 덜 되어 마음이 안 놓여서', b: '분명히 정하면 불편한 긴장이 생길 것 같아서' },
  '7_9': { q: '다음 두 문장 중 자신의 마음을 더 깊이·본능적으로 설명하는 쪽을 선택해 주세요.', a: '나는 불편한 감정이나 상황을 피하기 위해 더 즐겁고 새로운 활동이나 계획을 찾아 나선다. (7번 동기)', b: '나는 불편한 감정이나 상황을 피하기 위해 그 감각을 무디게 만들고 다른 생각이나 활동에 안주한다. (9번 동기)' },
  '8_9': { q: '누가 나를 통제하려 할 때 더 가까운 반응은 어느 쪽인가?', a: '맞서서 강하게 선을 긋고 밀리지 않으려 한다.', b: '겉으로만 넘기고 속으로는 내 페이스대로 버틴다.' }
};

const postTieBreakerMap = {
  '1_4': {
    a: '둘 다 불편한 상태라면, 완벽해지려다 나 스스로와 주변을 숨 막히게 하고 늘 긴장 상태에 있는 쪽으로 더 자주 빠진다.',
    b: '둘 다 불편한 상태라면, 내 안의 복잡한 감정과 결핍에 빠져 현실의 일상을 무기력하게 놓아버리는 쪽으로 더 자주 빠진다.',
    aEn: 'When both are uncomfortable, I more often get caught in trying to be flawless, making myself and others feel constrained and tense.',
    bEn: 'When both are uncomfortable, I more often sink into complex feelings and lack, losing energy for ordinary daily life.'
  },
  '1_5': {
    a: '둘 다 불편한 상태라면, 너무 높은 기준을 세우고 나와 타인을 통제하려다 뻣뻣해지고 피곤해지는 쪽으로 더 자주 빠진다.',
    b: '둘 다 불편한 상태라면, 현실의 문제를 직접 해결하기보다 머릿속 생각과 분석으로만 도피해 버리는 쪽으로 더 자주 빠진다.',
    aEn: 'When both are uncomfortable, I more often get rigid and exhausted from setting standards too high and trying to control myself or others.',
    bEn: 'When both are uncomfortable, I more often retreat into thoughts and analysis instead of directly dealing with the real problem.'
  },
  '1_6': {
    a: '둘 다 불편한 상태라면, 어떻게든 제대로 해내려다 내 기준에 못 미치는 나 자신과 타인에게 화가 나 있는 쪽으로 더 자주 빠진다.',
    b: '둘 다 불편한 상태라면, 확실해질 때까지 확인하고 의심하느라 결정을 내리지 못하고 에너지를 소진하는 쪽으로 더 자주 빠진다.',
    aEn: 'When both are uncomfortable, I more often get angry at myself and others for falling short of my standard while trying to do things properly.',
    bEn: 'When both are uncomfortable, I more often drain my energy by checking and doubting until things feel certain, unable to decide.'
  },
  '1_9': {
    a: '둘 다 불편한 상태라면, 잘못된 걸 고치려다 혼자 짐을 다 짊어지고 세상이 내 맘 같지 않아 화가 나 있는 쪽으로 더 자주 빠진다.',
    b: '둘 다 불편한 상태라면, 좋은 게 좋은 거라며 묻어두다가 정작 내가 진짜 원하는 게 뭔지 나조차 모르게 되는 쪽으로 더 자주 빠진다.',
    aEn: 'When both are uncomfortable, I more often end up carrying everything myself while trying to fix what is wrong, angry that the world does not work as it should.',
    bEn: 'When both are uncomfortable, I more often bury things to keep them easy, until even I lose track of what I truly want.'
  },
  '3_6': {
    a: '둘 다 손해라면, 불확실성이 남아 있어도 먼저 밀어붙여 결과를 만들고 생기는 문제는 나중에 수습하는 쪽을 더 자주 감수한다.',
    b: '둘 다 손해라면, 기회를 일부 놓치더라도 먼저 확인해 불확실성을 줄이고 확신이 설 때 움직이는 쪽을 더 자주 감수한다.'
  },
  '5_6': {
    a: '둘 다 손해라면, 오해를 사더라도 일단 물러나 내 에너지와 사고 공간을 확보한 뒤 대응하는 쪽을 더 자주 감수한다.',
    b: '둘 다 손해라면, 속도가 늦어지더라도 먼저 확인과 재확인을 거쳐 불확실성을 줄인 뒤 대응하는 쪽을 더 자주 감수한다.'
  },
  '5_9': {
    a: '둘 다 손해라면, 차갑거나 멀게 보이더라도 내 공간과 에너지를 지키기 위해 물러나는 쪽을 더 자주 감수한다.',
    b: '둘 다 손해라면, 내 입장이나 존재감이 흐려지더라도 갈등이 커지지 않게 조용히 물러나는 쪽을 더 자주 감수한다.',
    aEn: 'Even if I seem cold or distant, I more often pull back to protect my space and energy.',
    bEn: 'Even if my position or presence becomes less clear, I more often quietly pull back so conflict does not grow.'
  },
  '1_3': {
    a: '둘 다 손해라면, 성과가 늦어져도 먼저 기준에 맞게 바로잡고 그다음 결과를 내는 쪽을 더 자주 택한다.',
    b: '둘 다 손해라면, 다소 매끄럽지 않아도 먼저 성과를 만들고 부족한 부분은 나중에 보완하는 쪽을 더 자주 택한다.'
  },
  '3_8': {
    a: '둘 다 손해라면, 다소 무리해 보여도 결과를 만들어 내 존재가치를 증명하는 쪽을 더 자주 택한다.',
    b: '둘 다 손해라면, 다소 거칠고 세게 보여도 밀리지 않도록 주도권을 끝까지 지키는 쪽을 더 자주 택한다.'
  },
  '3_7': {
    a: '둘 다 손해라면, 재미가 떨어지더라도 일단 결과를 만들어 내 위치와 유능함을 지키는 쪽을 더 자주 감수한다.',
    b: '둘 다 손해라면, 평가가 조금 흐려져도 일단 막힌 흐름을 바꾸고 더 살아 있는 선택지로 옮겨 가는 쪽을 더 자주 감수한다.',
    aEn: 'Even if it becomes less interesting, I more often create a result first to protect my position and sense of competence.',
    bEn: 'Even if my evaluation becomes less clear, I more often change the stuck flow and move toward a more alive option.'
  },
  '3_9': {
    a: '둘 다 피하고 싶은 상황이라면, 열심히 했는데 아무도 알아주지 않고 그저 평범하고 존재감 없는 사람으로 묻히는 쪽이 더 견디기 힘들다.',
    b: '둘 다 피하고 싶은 상황이라면, 내게 너무 많은 기대와 시선이 집중되어 내 편안한 일상과 쉼을 완전히 뺏기는 쪽이 더 견디기 힘들다.',
    aEn: 'If both are situations I want to avoid, it is harder to work hard and still be unnoticed, buried as an ordinary person with no presence.',
    bEn: 'If both are situations I want to avoid, it is harder to have too many expectations and eyes on me, losing my comfortable routine and rest.'
  },
  '4_5': {
    a: '둘 다 손해라면, 감정의 기복이 커지더라도 내 안의 진짜 느낌을 놓치지 않고 붙들고 있는 쪽을 더 자주 감수한다.',
    b: '둘 다 손해라면, 차갑거나 멀게 보이더라도 거리를 두고 이해 가능한 상태를 먼저 확보하는 쪽을 더 자주 감수한다.'
  },
  '4_6': {
    a: '둘 다 손해라면, 감정이 더 무거워지더라도 내 결핍감과 진짜 마음을 끝까지 붙들고 있는 쪽을 더 자주 감수한다.',
    b: '둘 다 손해라면, 마음이 더 긴장되더라도 위험 요소와 신뢰 가능성을 끝까지 확인하는 쪽을 더 자주 감수한다.'
  },
  '4_7': {
    a: '둘 다 피하고 싶은 상황이라면, 겉으로는 웃고 떠들지만 누구와도 진심으로 연결되지 못한 채 가벼운 사람으로 남는 쪽이 더 견디기 힘들다.',
    b: '둘 다 피하고 싶은 상황이라면, 분위기가 무겁고 우울한 상황에 꼼짝없이 갇혀서 다른 데로 빠져나갈 구멍이 없는 쪽이 더 견디기 힘들다.',
    aEn: 'If both are situations I want to avoid, it is harder to laugh and talk on the outside while never truly connecting with anyone and remaining shallow.',
    bEn: 'If both are situations I want to avoid, it is harder to be stuck in a heavy, depressed situation with no opening to escape elsewhere.'
  },
  '6_9': {
    a: '둘 다 손해라면, 결정이 늦어지더라도 먼저 확인과 재확인을 거쳐 불확실성을 줄이는 쪽을 더 자주 감수한다.',
    b: '둘 다 손해라면, 내 입장이 흐려지더라도 먼저 분위기가 거칠어지지 않게 지나가도록 두는 쪽을 더 자주 감수한다.'
  },
  '6_8': {
    a: '둘 다 불편한 상태라면, 까칠하고 예민해 보인다는 소리를 듣더라도 의심스러운 부분은 끝까지 파헤쳐 확인해야 마음이 놓이는 쪽을 더 자주 감수한다.',
    b: '둘 다 불편한 상태라면, 거칠고 위압적이라는 오해를 사더라도 내가 호락호락하게 밀리지 않는다는 걸 분명히 해야 마음이 놓이는 쪽을 더 자주 감수한다.',
    aEn: 'When both are uncomfortable, I more often keep digging into suspicious parts until I can verify them, even if I seem prickly or oversensitive.',
    bEn: 'When both are uncomfortable, I more often make it clear that I will not be pushed around, even if I seem rough or intimidating.'
  },
  '8_9': {
    a: '둘 다 손해라면, 시끄럽고 거친 싸움이 되더라도 내가 밀리지 않는다는 걸 분명히 보여주는 쪽을 더 자주 감수한다.',
    b: '둘 다 손해라면, 내 입장이 조금 무시되더라도 분위기가 더 험악해지기 전에 조용히 넘기는 쪽을 더 자주 감수한다.',
    aEn: 'Even if it becomes loud and rough, I more often make it clear that I will not be pushed around.',
    bEn: 'Even if my position is somewhat ignored, I more often let it pass quietly before the atmosphere gets harsher.'
  },
  '1_7': {
    a: '둘 다 손해라면, 속도가 늦어져도 어긋난 부분을 바로잡기 전에는 그냥 넘기지 않는 쪽을 더 자주 택한다.',
    b: '둘 다 손해라면, 완벽하게 정리되지 않았어도 더 막히기 전에 방향을 바꾸고 움직이는 쪽을 더 자주 택한다.'
  },
  '7_8': {
    a: '둘 다 손해라면, 가볍게 보인다는 평가를 감수하더라도 더 답답해지기 전에 판을 바꾸고 다른 길을 찾는 쪽을 더 자주 택한다.',
    b: '둘 다 손해라면, 강압적으로 보인다는 오해를 감수하더라도 침범당한 느낌이 들면 바로 밀어붙여 주도권을 되찾는 쪽을 더 자주 택한다.'
  },
  '1_8': {
    a: '둘 다 손해라면, 관계가 다소 불편해져도 잘못된 부분은 바로잡고 기준을 분명히 하는 쪽을 더 자주 감수한다.',
    b: '둘 다 손해라면, 오해를 사더라도 침범당한 느낌이 들면 바로 선을 긋고 주도권을 되찾는 쪽을 더 자주 감수한다.'
  },
  '2_4': {
    a: '둘 다 손해라면, 내 마음을 조금 눌러도 상대에게 더 맞추고 보살피며 관계를 붙잡는 쪽을 더 자주 감수한다.',
    b: '둘 다 손해라면, 관계가 다소 불편해져도 내 진짜 감정과 이해받고 싶은 지점을 붙드는 쪽을 더 자주 감수한다.',
    aEn: 'Even if it costs me, I more often hold back my own feelings, adjust to the other person, and care for them to keep the relationship.',
    bEn: 'Even if it makes the relationship uncomfortable, I more often hold onto my true feelings and the part of me that I want understood.'
  },
  '2_6': {
    a: '둘 다 피하고 싶은 상황이라면, 내가 도와줬는데 상대방이 무덤덤하게 반응해서 나의 존재감이 투명해진 느낌이 더 견디기 힘들다.',
    b: '둘 다 피하고 싶은 상황이라면, 내가 도와줬는데 상대방의 진짜 속마음이 뭔지 나를 어떻게 생각하는지 헷갈리는 느낌이 더 견디기 힘들다.',
    aEn: 'If both are situations I want to avoid, it is harder when I help and the other person responds flatly, making my presence feel invisible.',
    bEn: 'If both are situations I want to avoid, it is harder when I help and I still cannot tell what the other person really thinks of me.'
  },
  '2_8': {
    a: '둘 다 피하고 싶은 상황이라면, 내가 애쓴 만큼 인정받지 못하고 더 이상 너의 도움은 필요 없다며 밀려나는 쪽이 더 견디기 힘들다.',
    b: '둘 다 피하고 싶은 상황이라면, 내 영향력이 미치지 않는 곳에서 누군가가 내 허락 없이 상황을 멋대로 쥐고 흔드는 쪽이 더 견디기 힘들다.',
    aEn: 'If both are situations I want to avoid, it is harder to be pushed away after all my effort, as if my help is no longer needed.',
    bEn: 'If both are situations I want to avoid, it is harder when someone takes control of the situation without my permission beyond my influence.'
  },
  '2_9': {
    a: '관계가 어색해졌을 때, 내가 더 챙기고 더 맞춰서라도 다시 필요한 사람으로 연결을 회복하고 싶어지는 쪽이 더 자동적이다.',
    b: '관계가 어색해졌을 때, 내 입장을 조금 접더라도 이 분위기가 더 거칠어지지 않게 빨리 눌러 두고 싶어지는 쪽이 더 자동적이다.'
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
    btn.innerText = uiText('pdfPreparing');
    btn.classList.add('opacity-60', 'cursor-not-allowed');
  }

  try {
    await ensurePdfLibsLoaded();
    if (!window.html2canvas || !window.jspdf || !window.jspdf.jsPDF) {
      throw new Error('PDF library unavailable');
    }
    if (btn) btn.innerText = uiText('pdfGenerating');
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
      testState.tie.t36 = { enabled: true, weight: TEST_CONFIG.weights.tieBreaker.near / Math.max(tb36.length, 1), margin: top2Diff };
      testState.phase2Questions = testState.phase2Questions.concat(tb36);
    } else if (typeA === 5 && typeB === 6) {
      testState.tie.t56 = { enabled: true, weight: TEST_CONFIG.weights.tieBreaker.near / Math.max(tb56.length, 1), margin: top2Diff };
      testState.phase2Questions = testState.phase2Questions.concat(tb56);
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
  document.getElementById('step-label').innerText = uiText('step2Label');
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
      else if (q.id.startsWith('tb_1_4_') && testState.tie.t14.enabled) w = testState.tie.t14.weight;
      else if (q.id.startsWith('tb_1_5_') && testState.tie.t15.enabled) w = testState.tie.t15.weight;
      else if (q.id.startsWith('tb_1_6_') && testState.tie.t16.enabled) w = testState.tie.t16.weight;
      else if (q.id.startsWith('tb_1_9_') && testState.tie.t19.enabled) w = testState.tie.t19.weight;
      else if (q.id.startsWith('tb_2_4_') && testState.tie.t24.enabled) w = testState.tie.t24.weight;
      else if (q.id.startsWith('tb_2_6_') && testState.tie.t26.enabled) w = testState.tie.t26.weight;
      else if (q.id.startsWith('tb_2_8_') && testState.tie.t28.enabled) w = testState.tie.t28.weight;
      else if (q.id.startsWith('tb_3_6') && testState.tie.t36.enabled) w = testState.tie.t36.weight;
      else if (q.id.startsWith('tb_5_6') && testState.tie.t56.enabled) w = testState.tie.t56.weight;
      else if (q.id.startsWith('tb_5_9_') && testState.tie.t59.enabled) w = testState.tie.t59.weight;
      else if (q.id.startsWith('tb_3_1_') && testState.tie.t31.enabled) w = testState.tie.t31.weight;
      else if (q.id.startsWith('tb_3_7_') && testState.tie.t37.enabled) w = testState.tie.t37.weight;
      else if (q.id.startsWith('tb_3_8_') && testState.tie.t38.enabled) w = testState.tie.t38.weight;
      else if (q.id.startsWith('tb_3_9_') && testState.tie.t39.enabled) w = testState.tie.t39.weight;
      else if (q.id.startsWith('tb_4_5_') && testState.tie.t45.enabled) w = testState.tie.t45.weight;
      else if (q.id.startsWith('tb_4_6_') && testState.tie.t46.enabled) w = testState.tie.t46.weight;
      else if (q.id.startsWith('tb_4_7_') && testState.tie.t47.enabled) w = testState.tie.t47.weight;
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

    let w = q.weight || TEST_CONFIG.weights.phase2Base;
    if (q.id.startsWith('tb_3_6') && testState.tie.t36.enabled) w = testState.tie.t36.weight;
    else if (q.id.startsWith('tb_1_4_') && testState.tie.t14.enabled) w = testState.tie.t14.weight;
    else if (q.id.startsWith('tb_1_5_') && testState.tie.t15.enabled) w = testState.tie.t15.weight;
    else if (q.id.startsWith('tb_1_6_') && testState.tie.t16.enabled) w = testState.tie.t16.weight;
    else if (q.id.startsWith('tb_1_9_') && testState.tie.t19.enabled) w = testState.tie.t19.weight;
    else if (q.id.startsWith('tb_2_4_') && testState.tie.t24.enabled) w = testState.tie.t24.weight;
    else if (q.id.startsWith('tb_2_6_') && testState.tie.t26.enabled) w = testState.tie.t26.weight;
    else if (q.id.startsWith('tb_2_8_') && testState.tie.t28.enabled) w = testState.tie.t28.weight;
    else if (q.id.startsWith('tb_5_6') && testState.tie.t56.enabled) w = testState.tie.t56.weight;
    else if (q.id.startsWith('tb_5_9_') && testState.tie.t59.enabled) w = testState.tie.t59.weight;
    else if (q.id.startsWith('tb_3_1_') && testState.tie.t31.enabled) w = testState.tie.t31.weight;
    else if (q.id.startsWith('tb_3_7_') && testState.tie.t37.enabled) w = testState.tie.t37.weight;
    else if (q.id.startsWith('tb_3_8_') && testState.tie.t38.enabled) w = testState.tie.t38.weight;
    else if (q.id.startsWith('tb_3_9_') && testState.tie.t39.enabled) w = testState.tie.t39.weight;
    else if (q.id.startsWith('tb_4_5_') && testState.tie.t45.enabled) w = testState.tie.t45.weight;
    else if (q.id.startsWith('tb_4_6_') && testState.tie.t46.enabled) w = testState.tie.t46.weight;
    else if (q.id.startsWith('tb_4_7_') && testState.tie.t47.enabled) w = testState.tie.t47.weight;
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
    document.getElementById('step-label').innerText = uiText('step3Label');
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
  const instName = pageLang === 'en'
    ? { sp: 'Self-preservation', sx: 'One-to-one', so: 'Social' }
    : { sp:'자기보존', sx:'성적(일대일)', so:'사회적' };
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
    instinctLabel = pageLang === 'en'
      ? `${instRank[0].name} & ${instRank[1].name} (tied for first)`
      : `${instRank[0].name} & ${instRank[1].name} (공동 1위)`;
  }

  let wing = pageLang === 'en' ? 'Not activated' : '활성화 안됨';
  let wingCode = pageLang === 'en' ? `${core} (pure core)` : `${core} (순수유형)`;
  let coreDisplay = pageLang === 'en' ? `Type ${core}` : `${core}번`;

  if (!coreResolved) {
    coreDisplay = pageLang === 'en'
      ? `Type ${core} / Type ${second.type} (core pending)`
      : `${core}번 / ${second.type}번 (코어 보류)`;
    wing = pageLang === 'en' ? 'Available after core confirmation' : '코어 확정 후 판별 가능';
    wingCode = pageLang === 'en' ? 'Pending (core pending)' : '판별 보류 (코어 보류)';
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
        wing = pageLang === 'en' ? `Wing ${w}` : `${w}번 날개`;
        wingCode = `${core}w${w}`;
      }
    }
  }

  document.getElementById('phase2-form').classList.add('hidden');
  document.getElementById('phase3-form').classList.add('hidden');
  document.getElementById('progress-container').classList.add('hidden');
  document.getElementById('result-view').classList.remove('hidden');
  document.getElementById('cta-consulting').classList.add('hidden');

  document.getElementById('res-final').innerText = `${instinctCode} ${wingCode}`;
  document.getElementById('res-instincts').innerText = pageLang === 'en' ? `Primary instinct: ${instinctLabel}` : `제 1본능: ${instinctLabel}`;
  document.getElementById('res-core').innerText = coreDisplay;
  document.getElementById('res-wing').innerText = wing;
  document.getElementById('res-arrows').innerHTML = coreResolved
    ? (pageLang === 'en'
      ? `<span class="text-blue-600 font-bold">Growth direction: Type ${arrowLines[core].growth}</span><br><span class="text-red-500 font-bold">Stress direction: Type ${arrowLines[core].stress}</span>`
      : `<span class="text-blue-600 font-bold">통합(건강) 방향: ${arrowLines[core].growth}번</span><br><span class="text-red-500 font-bold">비통합(스트레스) 방향: ${arrowLines[core].stress}번</span>`)
    : (pageLang === 'en' ? 'Available after core confirmation.' : '코어 확정 후 확인 가능합니다.');

  const badge = document.getElementById('confidence-badge');
  if (confidence === '높음') { badge.className='absolute top-6 right-6 px-3 py-1 rounded-full text-xs font-bold bg-green-500 text-white'; badge.innerText = pageLang === 'en' ? 'Confidence: High' : '신뢰도: 높음'; }
  else if (confidence === '보통') { badge.className='absolute top-6 right-6 px-3 py-1 rounded-full text-xs font-bold bg-yellow-500 text-white'; badge.innerText = pageLang === 'en' ? 'Confidence: Medium' : '신뢰도: 보통'; }
  else { badge.className='absolute top-6 right-6 px-3 py-1 rounded-full text-xs font-bold bg-red-500 text-white'; badge.innerText = pageLang === 'en' ? 'Confidence: Low' : '신뢰도: 낮음'; document.getElementById('cta-consulting').classList.remove('hidden'); }

  let log = '';
  if (!coreResolved) {
    log = pageLang === 'en'
      ? `Type <strong>${core}</strong> and Type <strong>${second.type}</strong> are extremely close, so core typing is marked as pending.`
      : `현재는 <strong>${core}번</strong>과 <strong>${second.type}번</strong>이 매우 근접하여 코어를 보류로 표시합니다.`;
  } else {
    log = pageLang === 'en'
      ? `Weighted merge result: core axis is <strong>Type ${core}</strong>, runner-up is <strong>Type ${second.type}</strong>, and score gap is <strong>${(diff*100).toFixed(1)}%</strong>.`
      : `가중치 병합 결과 중심 축은 <strong>${core}번</strong>, 2순위는 <strong>${second.type}번</strong>, 점수 격차는 <strong>${(diff*100).toFixed(1)}%</strong> 입니다.`;
    if (second.type === arrowLines[core].stress) log += `<br><br><span class="text-red-600 text-sm">2순위 ${second.type}번은 현재 스트레스 방향 영향일 수 있습니다.</span>`;
    if (second.type === arrowLines[core].growth) log += `<br><br><span class="text-blue-600 text-sm">2순위 ${second.type}번은 현재 성장 방향 영향일 수 있습니다.</span>`;
    if (testState.tie.t71.enabled) log += `<br><br><span class="text-xs">* 전환형/기준형 경합 타이브레이커 적용</span>`;
    if (testState.tie.t78.enabled) log += `<br><br><span class="text-xs">* 전환형/돌파형 경합 타이브레이커 적용</span>`;
    if (testState.tie.t89.enabled) log += `<br><br><span class="text-xs">* 능동저항형/수동버팀형(8-9) 동기 타이브레이커 적용</span>`;
    if (testState.tie.t18.enabled) log += `<br><br><span class="text-xs">* 기준형/돌파형(1-8) 동기 타이브레이커 적용</span>`;
    if (testState.tie.t14.enabled) log += `<br><br><span class="text-xs">* 자기교정형/정서침잠형(1-4) 동기 타이브레이커 적용</span>`;
    if (testState.tie.t15.enabled) log += `<br><br><span class="text-xs">* 수정정렬형/분석철수형(1-5) 동기 타이브레이커 적용</span>`;
    if (testState.tie.t16.enabled) log += `<br><br><span class="text-xs">* 기준정렬형/불확실검증형(1-6) 동기 타이브레이커 적용</span>`;
    if (testState.tie.t19.enabled) log += `<br><br><span class="text-xs">* 기준긴장형/평온완충형(1-9) 동기 타이브레이커 적용</span>`;
    if (testState.tie.t56.enabled) log += `<br><br><span class="text-xs">* 관찰형/검증형(5-6) 동기 타이브레이커 적용</span>`;
    if (testState.tie.t59.enabled) log += `<br><br><span class="text-xs">* 자원보호형/긴장완충형(5-9) 동기 타이브레이커 적용</span>`;
    if (testState.tie.t31.enabled) log += `<br><br><span class="text-xs">* 성과형/기준형(3-1) 동기 타이브레이커 적용</span>`;
    if (testState.tie.t37.enabled) log += `<br><br><span class="text-xs">* 성과회복형/전환탈출형(3-7) 동기 타이브레이커 적용</span>`;
    if (testState.tie.t38.enabled) log += `<br><br><span class="text-xs">* 성과형/돌파형(3-8) 동기 타이브레이커 적용</span>`;
    if (testState.tie.t39.enabled) log += `<br><br><span class="text-xs">* 돋보임적응형/무난동화형(3-9) 동기 타이브레이커 적용</span>`;
    if (testState.tie.t45.enabled) log += `<br><br><span class="text-xs">* 정서몰입형/관찰형(4-5) 동기 타이브레이커 적용</span>`;
    if (testState.tie.t46.enabled) log += `<br><br><span class="text-xs">* 정서결핍형/검증형(4-6) 동기 타이브레이커 적용</span>`;
    if (testState.tie.t47.enabled) log += `<br><br><span class="text-xs">* 결핍침잠형/전환환기형(4-7) 동기 타이브레이커 적용</span>`;
    if (testState.tie.t68.enabled) log += `<br><br><span class="text-xs">* 검증공격형/경계장악형(6-8) 동기 타이브레이커 적용</span>`;
    if (testState.tie.t69.enabled) log += `<br><br><span class="text-xs">* 검증형/완충형(6-9) 동기 타이브레이커 적용</span>`;
    if (testState.tie.t24.enabled) log += `<br><br><span class="text-xs">* 필요확인형/정서공명형(2-4) 동기 타이브레이커 적용</span>`;
    if (testState.tie.t26.enabled) log += `<br><br><span class="text-xs">* 필요존재형/안전연대형(2-6) 동기 타이브레이커 적용</span>`;
    if (testState.tie.t28.enabled) log += `<br><br><span class="text-xs">* 정서부채형/주도권장악형(2-8) 동기 타이브레이커 적용</span>`;
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
    return `<div class="rounded-xl border border-gray-200 bg-white p-4"><div class="flex items-center justify-between mb-2"><p class="font-semibold text-gray-800">${i+1}. ${pageLang === 'en' ? `Type ${x.type}` : `${x.type}번`}</p><p class="text-xs font-bold text-[#4a4540]">${pageLang === 'en' ? `Relative share: ${p}%` : `상대 점유율: ${p}%`}</p></div><p class="text-xs text-gray-500 mb-1">${pageLang === 'en' ? 'Evidence items' : '근거 문항'}</p><ul class="space-y-1">${ev}</ul></div>`;
  }).join('');

  document.getElementById('download-pdf-btn').onclick = downloadResultPdf;
}

localizeStaticTestPage();
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

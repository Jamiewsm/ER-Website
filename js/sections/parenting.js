// Parenting 상위 메뉴 전용 랜딩·가이드 섹션을 렌더링하는 함수
// 고객 여정: 아이 이해 → 부모 자기이해 → 부모-자녀 차이 → 상황별 실천 가이드

// 무료 양육 아티클 — 인스타 콘텐츠를 웹 자산으로. 일부는 docs/parent_resources 실제 자료와 연결.
const PARENTING_ARTICLES = [
    {
        t: '아이의 스트레스 신호', i: 'fas fa-heart-pulse', tag: '관찰',
        body: [
            '아이마다 스트레스를 드러내는 방식이 다릅니다. 어떤 아이는 말과 행동이 많아지고, 어떤 아이는 입을 닫고 혼자 있으려 합니다. 같은 "괜찮아"라는 말도 아이에 따라 전혀 다른 신호일 수 있습니다.',
            '문제 행동을 고치려 하기 전에, 그 행동이 어떤 불편을 말하고 있는지 먼저 읽어보세요. 신호를 알아차리는 것만으로도 부모의 첫 반응이 달라집니다.'
        ],
        link: { label: '아이 관찰 체크리스트 보기', href: 'docs/parent_resources/child_type_checklist.html' }
    },
    {
        t: '아이에게 하지 말아야 할 말', i: 'fas fa-ban', tag: '대화',
        body: [
            '"왜 너만 그래?", "형은 안 그러는데" 같은 비교와 단정은 행동을 바꾸기보다 "나는 늘 부족하다"는 메시지로 남습니다.',
            '바꾸고 싶은 행동이 있다면, 아이의 존재가 아니라 구체적인 상황과 다음 행동을 짚어 말해 주세요.'
        ],
        link: { label: '부모 양육성향 특징 자료 보기', href: 'docs/parent_resources/mom_type_summary.html' }
    },
    {
        t: '칭찬과 훈육', i: 'fas fa-star', tag: '동기',
        body: [
            '칭찬은 결과가 아니라 시도와 과정에 할 때 자신감으로 이어집니다. "100점이라서 대단해"보다 "어려운데 끝까지 해봤구나"가 다음 도전을 만듭니다.',
            '훈육도 마찬가지입니다. 감정을 쏟아내는 대신, 무엇이 문제였고 다음엔 어떻게 할지를 함께 정리할 때 아이가 배웁니다.'
        ],
        link: { label: '아이 관찰 체크리스트 보기', href: 'docs/parent_resources/child_type_checklist.html' }
    },
    {
        t: '사춘기 자녀와의 대화', i: 'fas fa-comment', tag: '사춘기',
        body: [
            '사춘기 아이의 침묵은 거절이 아니라, 자기만의 공간을 지키려는 신호일 때가 많습니다. 다가가려 할수록 더 문을 닫는 것처럼 보일 수 있습니다.',
            '대답을 재촉하기보다, 혼자 정리할 시간을 먼저 허용하고 짧게 곁을 지켜 주세요. 대화는 타이밍이 절반입니다.'
        ],
        link: { label: '아이 관찰 체크리스트 보기', href: 'docs/parent_resources/child_type_checklist.html' }
    },
    {
        t: '부모의 스마트폰 사용', i: 'fas fa-mobile-screen', tag: '습관',
        body: [
            '아이는 부모의 말보다 부모가 화면을 보는 시간을 더 오래 기억합니다. "스마트폰 그만"이라는 말의 설득력은 부모의 손에서 나옵니다.',
            '규칙을 정할 때 아이만의 규칙이 아니라 가족 공통의 약속으로 만들면, 통제가 아니라 함께 지키는 일이 됩니다.'
        ],
        link: { label: '부모 양육성향 특징 자료 보기', href: 'docs/parent_resources/mom_type_summary.html' }
    },
    {
        t: '스킨십과 경계', i: 'fas fa-hand', tag: '경계',
        body: [
            '어릴 때 좋아하던 포옹을 사춘기 아이가 거절하는 것은 거리감이 아니라 경계의 발달입니다. 거절을 존중받은 아이가 더 안전하게 다가옵니다.',
            '신체 접촉은 아이의 속도에 맞추고, 거절을 서운함으로 받지 않도록 부모의 마음을 먼저 다독여 주세요.'
        ],
        link: { label: '아이 관찰 체크리스트 보기', href: 'docs/parent_resources/child_type_checklist.html' }
    },
    {
        t: '공부 동기', i: 'fas fa-book-open', tag: '동기',
        body: [
            '동기는 잔소리로 만들어지지 않습니다. 아이가 무엇을 중요하게 느끼는지에 따라 효과적인 말이 다릅니다. 인정이 중요한 아이와 자유가 중요한 아이에게 같은 말은 통하지 않습니다.',
            '성적이라는 결과보다, 아이가 스스로 정한 작은 목표와 그 과정을 함께 봐주는 것이 더 오래 갑니다.'
        ],
        link: { label: '아이 관찰 체크리스트 보기', href: 'docs/parent_resources/child_type_checklist.html' }
    },
    {
        t: '돈에 관한 부모의 언어', i: 'fas fa-coins', tag: '가치',
        body: [
            '용돈과 소비를 두고 하는 부모의 말에는 불안, 통제, 인정 욕구가 함께 담깁니다. 아이는 돈에 대한 태도를 부모의 말투에서 먼저 배웁니다.',
            '제한을 둘 때도 이유와 기준을 함께 말해 주면, 돈은 다툼의 주제가 아니라 함께 배우는 주제가 됩니다.'
        ],
        link: { label: '부모 양육성향 특징 자료 보기', href: 'docs/parent_resources/mom_type_summary.html' }
    }
];

function openParentingArticle(index) {
    const a = PARENTING_ARTICLES[index];
    if (!a) return;
    const existing = document.getElementById('parenting-article-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'parenting-article-modal';
    modal.className = 'fixed inset-0 z-[90] flex items-end md:items-center justify-center p-4 bg-black/40 backdrop-blur-sm';
    modal.innerHTML = `
        <div class="bg-white rounded-[2rem] w-full max-w-xl max-h-[82vh] overflow-y-auto shadow-2xl animate-fade-in-up">
            <div class="sticky top-0 bg-white rounded-t-[2rem] px-6 pt-6 pb-4 border-b border-gray-100 flex items-start justify-between gap-3">
                <div>
                    <span class="text-er-accent font-bold text-[10px] tracking-widest uppercase">${a.tag}</span>
                    <h3 class="text-lg font-bold text-er-dark mt-0.5 break-keep">${a.t}</h3>
                </div>
                <button onclick="document.getElementById('parenting-article-modal').remove()" class="shrink-0 w-9 h-9 rounded-full bg-er-base flex items-center justify-center text-gray-500 hover:bg-er-dark hover:text-white transition-colors">
                    <i class="fas fa-times text-sm"></i>
                </button>
            </div>
            <div class="p-6">
                ${a.body.map(p => `<p class="text-sm text-gray-700 leading-relaxed break-keep mb-3">${p}</p>`).join('')}
                ${a.link ? `<a href="${a.link.href}" class="inline-flex items-center gap-2 text-xs font-bold text-er-accent hover:text-er-dark transition-colors">${a.link.label} <i class="fas fa-arrow-right text-[10px]"></i></a>` : ''}
                <div class="mt-6 rounded-2xl bg-er-base/60 border border-gray-100 p-5">
                    <p class="text-xs text-gray-600 break-keep mb-3">우리 아이의 반응이 유난히 이해하기 어렵다면, 행동 뒤에 있는 핵심 욕구를 먼저 확인해 보세요.</p>
                    <a href="child-type-test/child-type-test.html" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-er-dark text-white text-xs font-bold hover:bg-gray-800 transition-colors">
                        아이 유형검사 시작하기 <i class="fas fa-arrow-right text-[10px]"></i>
                    </a>
                </div>
            </div>
        </div>
    `;
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    document.body.appendChild(modal);
}

function renderParenting(payload = null) {
    const problems = [
        ['여러 번 말해야 움직이는 아이 때문에 지칩니다.', 'fas fa-bullhorn'],
        ['아이가 예민하게 반응하는 이유를 모르겠습니다.', 'fas fa-bolt'],
        ['칭찬해도 자신감이 생기지 않습니다.', 'fas fa-comment-dots'],
        ['대화를 시작하면 결국 잔소리가 됩니다.', 'fas fa-comments'],
        ['같은 상황에서 부모와 아이가 전혀 다르게 반응합니다.', 'fas fa-arrows-left-right'],
        ['좋은 부모가 되고 싶지만 자꾸 익숙한 방식으로 화를 냅니다.', 'fas fa-fire']
    ];

    const lenses = [
        ['CHILD', '아이의 핵심 욕구와 반응', '아이가 무엇을 가장 중요하게 느끼는지, 스트레스 상황에서 어떻게 반응하는지, 사랑과 불안을 어떤 방식으로 표현하는지 읽습니다.', 'fas fa-child-reaching'],
        ['PARENT', '부모의 자동적인 양육 패턴', '아이를 대할 때 나도 모르게 나오는 반응 — 재촉, 통제, 회피, 대신 해결 — 이 어디서 오는지 함께 살핍니다.', 'fas fa-user'],
        ['RELATIONSHIP', '두 성향이 만날 때 반복되는 갈등', '같은 행동도 부모와 아이의 성향 조합에 따라 전혀 다른 갈등으로 이어집니다. 그 반복 구조를 해석합니다.', 'fas fa-people-arrows']
    ];

    const childReads = [
        '아이의 핵심 성향',
        '스트레스 상황에서의 반응',
        '감정을 표현하는 방식',
        '칭찬과 훈육에 반응하는 방식',
        '아이가 가장 중요하게 느끼는 욕구',
        '자기보존·관계·사회적 욕구의 차이'
    ];

    const parentQuestions = [
        '나는 아이를 왜 재촉하는가.',
        '아이가 말을 듣지 않을 때 왜 유난히 화가 나는가.',
        '나는 갈등을 피하는 부모인가, 통제하려는 부모인가.',
        '인정받는 아이로 키우려는 마음이 앞서는가.',
        '아이의 불안을 지나치게 대신 해결해 주는가.'
    ];

    const parentMiniCheck = [
        '아이가 천천히 하면 내가 먼저 답답해서 끼어든다.',
        '아이가 말을 듣지 않으면 유난히 화가 난다.',
        '갈등이 생기면 빨리 끝내려고 먼저 양보하는 편이다.',
        '아이가 잘했을 때 과정보다 결과부터 칭찬한다.',
        '아이가 불안해하면 내가 먼저 나서서 해결해 준다.',
        '아이에게 인정받는 사람이 되라고 자주 말한다.'
    ];

    const combos = [
        {
            parent: '원칙을 중시하는 부모',
            child: '자유롭게 탐색하는 아이',
            tension: '부모는 아이의 즉흥성을 무책임으로 받아들이고, 아이는 부모의 반복적인 지적을 "나는 늘 부족하다"는 메시지로 받아들일 수 있습니다.',
            parentShift: '결과보다 시도와 탐색 과정을 먼저 인정하기',
            childShift: '선택의 자유와 함께 구체적인 책임 범위를 정하기'
        },
        {
            parent: '갈등을 피하는 부모',
            child: '강하게 요구하는 아이',
            tension: '부모는 아이를 달래며 상황을 빨리 끝내려 하고, 아이는 더 강하게 말해야 자신의 요구가 전달된다고 배울 수 있습니다.',
            parentShift: '회피하거나 즉시 양보하지 않고 경계를 분명히 말하기',
            childShift: '요구의 강도보다 감정과 필요를 언어로 표현하도록 돕기'
        },
        {
            parent: '인정을 중요하게 여기는 부모',
            child: '조용히 혼자 있고 싶은 아이',
            tension: '부모는 아이의 침묵을 거리감이나 거절로 느끼고, 아이는 다가오는 관심을 부담으로 받아들여 더 문을 닫을 수 있습니다.',
            parentShift: '반응을 재촉하지 않고 혼자 회복할 시간을 먼저 허용하기',
            childShift: '말이 어려울 땐 짧은 신호로라도 상태를 알리도록 돕기'
        },
        {
            parent: '확실히 통제하려는 부모',
            child: '예민하게 반응하는 아이',
            tension: '부모는 분명히 하려고 강하게 지시하고, 아이는 그 강도에 압도되어 더 위축되거나 갑자기 폭발할 수 있습니다.',
            parentShift: '지시의 강도를 낮추고 선택지를 함께 제시하기',
            childShift: '압도될 때 "잠깐 멈추고 싶다"고 신호 보내도록 돕기'
        },
        {
            parent: '성취로 사랑을 표현하는 부모',
            child: '관계가 더 중요한 아이',
            tension: '부모는 결과와 성취로 마음을 표현하고, 아이는 "있는 그대로는 부족한가"라고 느낄 수 있습니다.',
            parentShift: '성취와 무관하게 존재 자체를 인정하는 말 늘리기',
            childShift: '잘하는 것과 좋아하는 것을 부모와 함께 나누도록 돕기'
        },
        {
            parent: '불안을 대신 해결하는 부모',
            child: '스스로 해보려는 아이',
            tension: '부모는 빨리 도와 불안을 줄이려 하고, 아이는 "나는 혼자 못 한다"는 메시지를 학습할 수 있습니다.',
            parentShift: '바로 개입하지 않고 먼저 시도할 시간을 주기',
            childShift: '도움이 필요할 때 구체적으로 요청하는 법 배우기'
        }
    ];

    const situations = [
        '아이가 숙제를 미룰 때',
        '아이가 방문을 닫고 말하지 않을 때',
        '형제자매가 싸울 때',
        '아이가 거짓말했을 때',
        '스마트폰을 내려놓지 않을 때',
        '성적이 떨어졌을 때',
        '친구에게 거절당했을 때',
        '사춘기 아이가 신체 접촉을 거절할 때'
    ];

    const ladder = [
        ['무료', '시작은 가볍게', '인스타그램 콘텐츠, 웹 양육 아티클, 간단한 부모 양육성향 체크, 아이 핵심 욕구 미니 체크리스트.', null, null],
        ['입문', '우리 아이 유형검사', '부모의 관찰을 통해 아이의 반복적인 동기와 반응 패턴을 탐색합니다. 결과는 아이를 하나의 유형으로 단정하는 진단이 아니라, 부모가 아이를 더 세밀하게 관찰하도록 돕는 이해의 가설입니다.', '아이 유형검사 시작하기', "link:child-type-test/child-type-test.html"],
        ['핵심', '부모–자녀 맞춤 리포트', '아이의 성향 가설, 핵심 욕구, 스트레스 반응, 부모의 양육성향, 주요 갈등 지점, 상황별 도움이 되는 말과 피해야 할 반응, 관계 회복 실천 과제를 담은 맞춤 리포트.', '맞춤 가이드 신청하기', "apply:parenting"],
        ['프리미엄', '부모–자녀 맞춤 해석상담', '검사 결과 검토, 오진 가능성 점검, 실제 갈등 사례 분석, 부모의 자동반응 탐색, 가정별 실천계획 수립.', '해석상담 신청하기', "apply:parenting"],
        ['심화', '4주 Parenting 과정', '1주 부모인 나 이해하기, 2주 아이의 핵심 욕구와 불안, 3주 부모–아이 갈등 조합 분석, 4주 상황별 대화와 훈육 계획 만들기.', '4주 과정 알아보기', "link:parenting-workshop.html?apply_source=parenting"]
    ];

    const ladderCta = (label, action) => {
        if (!label || !action) return '';
        const [kind, target] = action.split(/:(.*)/s);
        const onClick = kind === 'link'
            ? `window.location.href='${target}'`
            : `renderSection('apply', { track: 'paid', focus: '${target}', apply_source: 'parenting' })`;
        return `<button onclick="${onClick}" class="mt-4 inline-flex items-center gap-2 text-xs font-bold text-er-accent hover:text-er-dark transition-colors">${label} <i class="fas fa-arrow-right text-[10px]"></i></button>`;
    };

    return `
        <div class="bg-er-base min-h-screen">
            <section class="bg-er-dark text-white py-16 md:py-20 px-6 relative overflow-hidden rounded-b-[3rem]">
                <div class="absolute inset-0 bg-pattern opacity-5 pointer-events-none"></div>
                <div class="absolute top-[-20%] right-[-10%] w-[420px] h-[420px] bg-er-accent/20 rounded-full blur-[110px] pointer-events-none"></div>
                <div class="relative z-10 max-w-4xl mx-auto text-center">
                    <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] md:text-xs font-bold tracking-widest uppercase text-er-accentLight mb-6">ER Parenting</span>
                    <h2 class="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-[1.3] break-keep mb-5">
                        아이를 바꾸기 전에,<br>아이를 바라보는 방법부터 달라져야 합니다.
                    </h2>
                    <p class="text-gray-300 text-sm md:text-base max-w-2xl mx-auto break-keep leading-relaxed">
                        아이마다 사랑을 느끼는 방식, 불안을 표현하는 방식, 동기를 얻는 방식이 다릅니다. ER Parenting은 아이의 성향만 분석하지 않습니다. 부모와 아이의 차이, 반복되는 갈등, 실제 양육 상황을 함께 살펴봅니다.
                    </p>
                    <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <button onclick="renderSection('parenting', { focus: 'child' })" class="w-full sm:w-auto px-7 py-3.5 bg-white text-er-dark rounded-full font-bold shadow-lg hover:-translate-y-0.5 transition-all active:scale-95">
                            우리 아이 이해하기
                        </button>
                        <button onclick="renderSection('parenting', { focus: 'guide' })" class="w-full sm:w-auto px-7 py-3.5 bg-white/10 text-white border border-white/20 rounded-full font-bold hover:bg-white/20 transition-all active:scale-95">
                            부모–자녀 맞춤 가이드 보기
                        </button>
                    </div>
                </div>
            </section>

            <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
                <!-- 부모가 겪는 문제 -->
                <section class="mt-14 md:mt-20">
                    <div class="text-center mb-8">
                        <span class="text-er-accent font-bold text-xs tracking-widest uppercase">Real Moments</span>
                        <h3 class="text-xl md:text-2xl font-bold text-er-dark mt-2 break-keep">이런 순간이 반복되고 있나요?</h3>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${problems.map(([t, i]) => `
                            <div class="bg-white rounded-2xl p-5 border border-white/40 shadow-soft floating-card flex items-start gap-3">
                                <div class="shrink-0 w-9 h-9 rounded-xl bg-er-base text-er-accent flex items-center justify-center"><i class="${i}"></i></div>
                                <p class="text-sm text-gray-700 leading-relaxed break-keep">${t}</p>
                            </div>
                        `).join('')}
                    </div>
                    <p class="mt-6 text-center text-xs text-gray-400 break-keep">이 중 하나라도 "우리 이야기"라면, 아이만의 문제가 아닐 수 있습니다.</p>
                </section>

                <!-- 분석 구조 -->
                <section class="mt-16 md:mt-24">
                    <div class="text-center mb-8">
                        <span class="text-er-accent font-bold text-xs tracking-widest uppercase">How We Read</span>
                        <h3 class="text-xl md:text-2xl font-bold text-er-dark mt-2 break-keep">아이만 보지 않습니다</h3>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
                        ${lenses.map(([tag, title, desc, icon]) => `
                            <div class="bg-white rounded-3xl p-6 border border-white/40 shadow-soft floating-card">
                                <div class="flex items-center justify-between mb-4">
                                    <span class="px-2.5 py-1 rounded-full bg-er-base text-er-accent text-[10px] font-bold tracking-[0.15em]">${tag}</span>
                                    <div class="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-400"><i class="${icon}"></i></div>
                                </div>
                                <h4 class="text-base font-bold text-er-dark mb-2 break-keep">${title}</h4>
                                <p class="text-xs text-gray-500 leading-relaxed break-keep">${desc}</p>
                            </div>
                        `).join('')}
                    </div>
                    <p class="mt-7 text-center text-sm text-gray-600 max-w-2xl mx-auto break-keep">
                        ER Parenting은 세 가지를 함께 살펴, 가족에게 실제로 적용할 수 있는 대화와 행동 가이드를 제공합니다.
                    </p>
                </section>

                <!-- ① 우리 아이 이해하기 -->
                <section id="parenting-child" class="mt-16 md:mt-24 scroll-mt-24">
                    <div class="rounded-[2rem] bg-white border border-white/40 shadow-soft p-7 md:p-10">
                        <span class="text-er-accent font-bold text-xs tracking-widest uppercase">① 아이를 이해합니다</span>
                        <h3 class="text-xl md:text-2xl font-bold text-er-dark mt-2 mb-5 break-keep">우리 아이 이해하기</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                            ${childReads.map(t => `
                                <div class="flex items-center gap-3 rounded-xl bg-er-base/60 px-4 py-3">
                                    <i class="fas fa-check text-er-accent text-xs"></i>
                                    <span class="text-sm text-gray-700 break-keep">${t}</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="rounded-2xl bg-er-base/50 border border-gray-100 p-5">
                            <p class="text-xs text-gray-500 leading-relaxed break-keep">
                                결과는 아이를 하나의 유형으로 단정하는 진단이 아니라, 부모가 아이를 더 세밀하게 관찰하도록 돕는 이해의 가설입니다.
                            </p>
                            <a href="child-type-test/child-type-test.html" class="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-er-dark text-white text-xs font-bold hover:bg-gray-800 transition-colors">
                                아이 유형검사 시작하기 <i class="fas fa-arrow-right text-[10px]"></i>
                            </a>
                        </div>
                    </div>
                </section>

                <!-- ② 부모인 나 이해하기 -->
                <section id="parenting-parent" class="mt-12 md:mt-16 scroll-mt-24">
                    <div class="rounded-[2rem] bg-white border border-white/40 shadow-soft p-7 md:p-10">
                        <span class="text-er-accent font-bold text-xs tracking-widest uppercase">② 부모인 나를 이해합니다</span>
                        <h3 class="text-xl md:text-2xl font-bold text-er-dark mt-2 mb-3 break-keep">부모 양육성향 이해하기</h3>
                        <p class="text-sm text-gray-600 break-keep mb-5">대부분의 양육 서비스는 아이만 분석하지만, 실제 양육 반응은 부모의 성향에서도 나옵니다. 아이를 대하는 나의 자동반응과 양육 패턴을 함께 살핍니다.</p>
                        <ul class="space-y-2.5 mb-6">
                            ${parentQuestions.map(q => `
                                <li class="flex items-start gap-3 text-sm text-gray-700 break-keep">
                                    <i class="fas fa-circle-question text-er-accent text-xs mt-1"></i><span>${q}</span>
                                </li>
                            `).join('')}
                        </ul>

                        <div class="rounded-2xl bg-er-base/40 border border-gray-100 p-5 md:p-6 mb-5">
                            <h4 class="text-sm font-bold text-er-dark mb-1 break-keep">1분 부모 양육성향 체크</h4>
                            <p class="text-xs text-gray-500 break-keep mb-4">점수도 결과도 없습니다. 해당되는 항목에 체크하며, 그 반응이 어디서 오는지 관찰해 보세요.</p>
                            <div class="space-y-2.5">
                                ${parentMiniCheck.map((q, idx) => `
                                    <label for="parent-check-${idx}" class="flex items-start gap-3 cursor-pointer rounded-xl px-3 py-2.5 hover:bg-white/70 transition-colors">
                                        <input type="checkbox" id="parent-check-${idx}" class="mt-0.5 h-4 w-4 shrink-0 accent-er-accent">
                                        <span class="text-sm text-gray-700 break-keep">${q}</span>
                                    </label>
                                `).join('')}
                            </div>
                            <p class="mt-4 text-xs text-gray-500 break-keep">정답은 없습니다. 체크가 많은 항목일수록, 그 반응이 어디서 오는지 검사와 상담에서 더 깊이 살펴볼 수 있습니다.</p>
                            <a href="docs/parent_resources/mom_type_summary.html" class="mt-3 inline-flex items-center gap-2 text-xs font-bold text-er-accent hover:text-er-dark transition-colors">부모 양육성향 특징 자료 보기 <i class="fas fa-arrow-right text-[10px]"></i></a>
                        </div>

                        <div class="rounded-2xl bg-er-base/50 border border-gray-100 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <p class="text-xs text-gray-500 break-keep">부모 양육성향 검사는 준비 중입니다. 먼저 상담을 통해 나의 양육 패턴을 함께 짚어볼 수 있습니다.</p>
                            <button onclick="renderSection('apply', { track: 'paid', focus: 'parenting', apply_source: 'parenting' })" class="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-er-dark text-er-dark text-xs font-bold hover:bg-er-dark hover:text-white transition-colors">
                                양육 상담 신청 <i class="fas fa-arrow-right text-[10px]"></i>
                            </button>
                        </div>
                    </div>
                </section>

                <!-- ③ 부모–자녀 맞춤 가이드 -->
                <section id="parenting-guide" class="mt-16 md:mt-24 scroll-mt-24">
                    <div class="text-center mb-8">
                        <span class="text-er-accent font-bold text-xs tracking-widest uppercase">③ 부모와 아이의 차이를 이해합니다</span>
                        <h3 class="text-xl md:text-2xl font-bold text-er-dark mt-2 break-keep">부모–자녀 맞춤 가이드</h3>
                        <p class="mt-2 text-sm text-gray-500 max-w-2xl mx-auto break-keep">같은 행동도 부모와 아이의 성향 조합에 따라 전혀 다른 갈등으로 이어질 수 있습니다. 대표적인 조합 몇 가지를 예로 보여드립니다.</p>
                    </div>
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        ${combos.map(c => `
                            <div class="bg-white rounded-3xl p-6 border border-white/40 shadow-soft floating-card flex flex-col">
                                <div class="flex flex-wrap items-center gap-2 mb-4">
                                    <span class="px-2.5 py-1 rounded-full bg-er-base text-er-dark text-[11px] font-bold break-keep">${c.parent}</span>
                                    <i class="fas fa-xmark text-gray-300 text-xs"></i>
                                    <span class="px-2.5 py-1 rounded-full bg-er-accentLight/40 text-er-dark text-[11px] font-bold break-keep">${c.child}</span>
                                </div>
                                <p class="text-xs text-gray-600 leading-relaxed break-keep mb-4 flex-grow">${c.tension}</p>
                                <div class="space-y-2 pt-3 border-t border-gray-100">
                                    <p class="text-[11px] text-gray-500 break-keep"><span class="font-bold text-er-accent">부모</span> · ${c.parentShift}</p>
                                    <p class="text-[11px] text-gray-500 break-keep"><span class="font-bold text-er-accent">아이</span> · ${c.childShift}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <div class="mt-8 rounded-[2rem] bg-white border border-white/40 shadow-soft p-7 md:p-9">
                        <h4 class="text-base md:text-lg font-bold text-er-dark mb-2 break-keep">그래서, 이 상황에서는 어떻게 말할까요?</h4>
                        <p class="text-xs text-gray-500 break-keep mb-5">유형명으로 끝내지 않습니다. 상황마다 아이가 느낄 가능성, 부모의 자동 반응, 갈등을 악화시키는 말 대신 쓸 수 있는 말과 행동을 정리합니다.</p>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-6">
                            ${situations.map(s => `<div class="rounded-xl bg-er-base/60 px-3 py-2.5 text-[11px] text-gray-600 text-center break-keep">${s}</div>`).join('')}
                        </div>
                        <div class="flex flex-col sm:flex-row gap-3">
                            <button onclick="renderSection('apply', { track: 'paid', focus: 'parenting', apply_source: 'parenting' })" class="flex-1 py-3 rounded-full bg-er-dark text-white text-xs font-bold hover:bg-gray-800 transition-colors">부모–자녀 맞춤 가이드 신청하기</button>
                            <button onclick="renderSection('apply', { track: 'paid', focus: 'parenting', apply_source: 'parenting' })" class="flex-1 py-3 rounded-full border border-gray-200 text-gray-600 text-xs font-bold hover:bg-er-dark hover:text-white hover:border-transparent transition-colors">검사 결과 해석상담 신청하기</button>
                        </div>
                    </div>
                </section>

                <!-- 무료 정보·예시 -->
                <section class="mt-16 md:mt-24">
                    <div class="text-center mb-8">
                        <span class="text-er-accent font-bold text-xs tracking-widest uppercase">Free Resources</span>
                        <h3 class="text-xl md:text-2xl font-bold text-er-dark mt-2 break-keep">먼저 읽어보는 양육 이야기</h3>
                    </div>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                        ${PARENTING_ARTICLES.map((a, idx) => `
                            <button type="button" onclick="openParentingArticle(${idx})" class="bg-white rounded-2xl p-5 border border-white/40 shadow-soft floating-card text-center hover:border-er-accent/40 transition-colors group">
                                <div class="w-10 h-10 rounded-xl bg-er-base text-er-accent flex items-center justify-center mx-auto mb-3 group-hover:bg-er-accent group-hover:text-white transition-colors"><i class="${a.i}"></i></div>
                                <p class="text-xs font-bold text-gray-700 break-keep">${a.t}</p>
                                <span class="mt-2 inline-block text-[10px] font-bold text-er-accent">읽어보기 <i class="fas fa-arrow-right text-[8px]"></i></span>
                            </button>
                        `).join('')}
                    </div>
                    <div class="mt-7 rounded-2xl bg-er-dark text-white p-6 text-center">
                        <p class="text-sm break-keep">우리 아이의 반응이 유난히 이해하기 어렵다면, 행동 뒤에 있는 핵심 욕구를 먼저 확인해 보세요.</p>
                        <a href="child-type-test/child-type-test.html" class="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-er-dark text-xs font-bold hover:-translate-y-0.5 transition-all">
                            아이 유형검사 시작하기 <i class="fas fa-arrow-right text-[10px]"></i>
                        </a>
                    </div>
                </section>

                <!-- 상품 계단 -->
                <section id="parenting-program" class="mt-16 md:mt-24 scroll-mt-24">
                    <div class="text-center mb-8">
                        <span class="text-er-accent font-bold text-xs tracking-widest uppercase">Step by Step</span>
                        <h3 class="text-xl md:text-2xl font-bold text-er-dark mt-2 break-keep">한 걸음씩 함께합니다</h3>
                        <p class="mt-2 text-sm text-gray-500 break-keep">무료 자료부터 4주 심화 과정까지, 지금 필요한 만큼만 선택할 수 있습니다.</p>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${ladder.map(([stage, title, desc, cta, action]) => `
                            <div class="bg-white rounded-3xl p-6 border border-white/40 shadow-soft floating-card flex flex-col">
                                <span class="self-start px-2.5 py-1 rounded-full bg-er-base text-er-accent text-[10px] font-bold tracking-wider uppercase mb-3">${stage}</span>
                                <h4 class="text-base font-bold text-er-dark mb-2 break-keep">${title}</h4>
                                <p class="text-xs text-gray-500 leading-relaxed break-keep flex-grow">${desc}</p>
                                ${ladderCta(cta, action)}
                            </div>
                        `).join('')}
                    </div>
                </section>

                <!-- 포지셔닝 + 전용 CTA -->
                <section class="mt-16 md:mt-24">
                    <div class="rounded-[2.5rem] bg-er-dark text-white p-8 md:p-12 text-center relative overflow-hidden">
                        <div class="absolute inset-0 bg-pattern opacity-5 pointer-events-none"></div>
                        <div class="relative z-10">
                            <h3 class="text-xl md:text-2xl font-bold break-keep mb-3">에니어그램은 ER의 방법이고, 부모가 얻는 결과는 따로 있습니다.</h3>
                            <p class="text-gray-300 text-sm max-w-2xl mx-auto break-keep">아이를 덜 오해하고, 부모가 덜 화내고, 대화가 끊어지지 않고, 아이에게 맞는 말과 경계를 찾는 것 — 반복되는 가족 갈등을 이해하는 데서 변화가 시작됩니다.</p>
                            <div class="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                                <a href="child-type-test/child-type-test.html" class="px-5 py-3.5 rounded-full bg-white text-er-dark text-sm font-bold hover:-translate-y-0.5 transition-all">아이 유형검사 시작하기</a>
                                <button onclick="renderSection('apply', { track: 'paid', focus: 'parenting', apply_source: 'parenting' })" class="px-5 py-3.5 rounded-full bg-white/10 border border-white/20 text-white text-sm font-bold hover:bg-white/20 transition-all">검사 결과 해석상담 신청하기</button>
                                <button onclick="renderSection('apply', { track: 'paid', focus: 'parenting', apply_source: 'parenting' })" class="px-5 py-3.5 rounded-full bg-white/10 border border-white/20 text-white text-sm font-bold hover:bg-white/20 transition-all">부모–자녀 맞춤 가이드 신청하기</button>
                                <button onclick="window.location.href='parenting-workshop.html?apply_source=parenting'" class="px-5 py-3.5 rounded-full bg-white/10 border border-white/20 text-white text-sm font-bold hover:bg-white/20 transition-all">4주 Parenting 과정 알아보기</button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    `;
}

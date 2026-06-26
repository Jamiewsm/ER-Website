function renderHome() {
    const stories = Array.isArray(publicTestimonials?.stories) ? publicTestimonials.stories : [];
    const findStory = (matcher, fallback) => stories.find((story) => matcher(story)) || fallback;
    const fallbackStory = { quote: 'ER은 각 사람과 공동체의 실제 이야기를 먼저 듣고, 맞는 회복의 방향을 함께 정리합니다.', person: 'ER', meta: '상담 사례' };

    const parentingStory = findStory(
        (story) => /양육/.test(story.tag || '') || /우리 아이|자녀 양육/.test(story.meta || ''),
        fallbackStory
    );
    const coupleStory = findStory(
        (story) => /부부/.test(story.tag || '') || /부부/.test(story.meta || ''),
        fallbackStory
    );
    const teamStory = findStory(
        (story) => /선교·사역/.test(story.tag || '') || /리더십|사역 현장/.test(story.meta || ''),
        fallbackStory
    );

    const initials = (name) => {
        const cleaned = String(name || 'ER').replace(/\s+/g, '');
        return cleaned.slice(0, 2).toUpperCase();
    };

    const basicCourseDays = (() => {
        const diff = Date.parse('2026-06-24T23:59:59-07:00') - Date.now();
        if (!Number.isFinite(diff) || diff <= 0) return '7/5 마감';
        return `얼리버드 D-${Math.ceil(diff / 86400000)}`;
    })();

    const benefits = [
        { icon: 'fa-regular fa-gem', title: '에니어그램 전문성', text: '검증된 이론과 실전 경험' },
        { icon: 'fa-solid fa-people-group', title: '따뜻한 온라인 커뮤니티', text: '함께 성장하는 안전한 공간' },
        { icon: 'fa-regular fa-calendar-check', title: '일상 속 변화와 실천', text: '작은 변화가 만드는 큰 성장' }
    ];

    const stats = [
        { value: '400+', label: '누적인원' },
        { value: '98%', label: '만족도' },
        { value: '10년+', label: '전문가 경험' },
        { value: '4.9/5', label: '후기 평점' }
    ];

    const programCards = [
        {
            badge: '인기',
            title: '에니어그램 기본과정 8주',
            text: '나와 타인을 이해하는 첫 번째 여정',
            price: '$300',
            image: 'background.png',
            position: 'center',
            button: '자세히 보기',
            action: "window.location.href='/basic-course.html'"
        },
        {
            badge: '추천',
            title: 'Enneagram for Parenting',
            text: '부모의 반응 패턴과 아이의 기질을 이해하는 4주 과정',
            price: '$120',
            image: 'home-parent-child-photo.jpg',
            position: 'center top',
            button: '양육 여정 보기',
            action: "renderSection('parenting')",
            button2: '4주 과정 신청',
            action2: "renderSection('apply', { track: 'paid', focus: 'parenting_workshop', apply_source: 'home_hero' })"
        },
        {
            badge: '테스트',
            title: '무료 에니어그램 검사',
            text: '내 반복 패턴을 먼저 정리하는 10분 테스트',
            price: '무료',
            image: 'hands and green.png',
            position: 'center',
            button: '검사하기',
            action: "renderSection('test')"
        },
        {
            badge: '상담',
            title: '결과지 해석상담',
            text: '결과지를 함께 읽으며 핵심 유형·하위유형·날개·신뢰도 정리',
            price: '$50',
            image: 'home-couple-photo.jpg',
            position: 'center top',
            button: '상담 신청하기',
            action: "renderSection('apply', { track: 'paid', focus: 'result_consult' })"
        }
    ];

    const testimonials = [
        {
            quote: '제 자녀를 같은 방식으로 양육하면 된다고 생각했는데, 아이마다 필요한 반응이 달라 계속 부딪혔습니다. 상담을 통해 부모의 반응 패턴과 아이들의 기질 차이를 함께 이해하면서, 각 아이에게 맞는 양육 언어를 적용할 수 있게 되었습니다.',
            person: parentingStory.person || '김OO 님',
            label: '에니어그램 기본과정 수강',
            avatar: '김'
        },
        {
            quote: '아내와의 차이를 자꾸 문제로 해석하다 보니 대화가 반복해서 막혔습니다. 부부가 함께 심리를 배우며 서로의 기질 차이를 이해하게 되었고, 상대를 바꾸려 하기보다 존중하는 대화 방식으로 전환할 수 있었습니다.',
            person: coupleStory.person || '이OO 님',
            label: '심화과정 수강',
            avatar: '이'
        },
        {
            quote: '제 성향이 왜 상황마다 달라 보이는지 스스로도 설명하기 어려웠습니다. 상담을 통해 고유한 강점과 약점 패턴을 분리해서 보게 되었고, 사역 현장에서 제 리더십과 소통 방식을 더 명확하게 조정할 수 있었습니다.',
            person: teamStory.person || '박OO 님',
            label: '개인 상담 진행',
            avatar: '박'
        }
    ];

    const footerBenefits = [
        { icon: 'fa-solid fa-shield-halved', title: '안전한 환경', text: '검증된 전문가와 안전한 공간에서' },
        { icon: 'fa-regular fa-clipboard', title: '체계적인 시스템', text: '검증된 프로그램과 단계별 학습' },
        { icon: 'fa-brands fa-pagelines', title: '지속적인 지원', text: '수료 후에도 계속되는 커뮤니티와 지원' },
        { icon: 'fa-solid fa-hand-holding-dollar', title: '합리적인 가격', text: '가치 있는 변화의 여정을 합리적인 가격으로' }
    ];

    const restorationCards = [
        {
            eyebrow: '부모와 자녀',
            title: '아이를 바꾸기 전에, 아이를 이해하는 눈이 필요합니다',
            text: '아이의 행동 뒤에는 각자의 두려움과 욕구가 있고, 부모의 반응 뒤에도 익숙한 패턴이 있습니다.',
            image: 'home-parent-child-photo.jpg',
            position: 'center top',
            caption: '행동보다 마음을 이해하는 부모교육',
            points: ['부모의 유형과 양육 패턴', '자녀의 기질과 반응 이해', '반복되는 부모-자녀 갈등 분석'],
            action: "renderSection('parenting')"
        },
        {
            eyebrow: '부부와 가정',
            title: '판단을 멈추고, 긍휼과 은혜로 다시 연결되기',
            text: '부부 갈등은 한 번의 사건보다 말투와 침묵, 통제와 회피, 인정 욕구가 반복되며 만들어지는 패턴일 때가 많습니다.',
            image: 'home-couple-photo.jpg',
            position: 'center top',
            caption: '상대를 고치려는 자리에서, 이해하는 자리로',
            points: ['같은 문제로 반복되는 갈등 이해', '배우자의 방어기제를 자극하지 않는 대화', '복음 안에서 안전한 관계 다시 세우기'],
            action: "renderSection('apply', { track: 'paid', focus: 'couple', apply_source: 'home_relationship_couple' })"
        },
        {
            eyebrow: '사역팀과 리더십',
            title: '강점과 소통 방식을 이해하고, 복음 안에서 진정한 연합으로',
            text: '사역 현장의 오해는 헌신이 부족해서가 아니라, 일하는 동기와 방식의 차이에서 비롯될 때가 많습니다.',
            image: 'home-team-photo.jpg',
            position: 'center top',
            caption: '강점과 소통 방식을 이해할 때, 팀은 경쟁이 아니라 동역을 배웁니다',
            points: ['사역자의 강점과 리더십 스타일', '팀 안의 소통 방식과 의사결정 패턴', '오해를 줄이는 협업 언어 만들기'],
            action: "renderSection('apply', { track: 'org', focus: 'team', apply_source: 'home_relationship_team' })"
        }
    ];

    const recommendationItems = [
        '깨어진 관계로 고통 중에 계신 분',
        '배우자와의 관계를 더 건강히 세우고 싶은 분',
        '아이의 기질을 이해하고 맞춤육아를 하고 싶은 분',
        '하나님이 창조하신 진짜 나를 발견하고 성장하고 싶은 분'
    ];

    return `
        <div class="bg-[#f4efe6] text-[#202219]">
            <section class="relative overflow-hidden bg-[#fbfaf5]">
                <div class="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_12%_12%,rgba(236,229,211,0.75),transparent_34%),linear-gradient(90deg,#fbfaf5_0%,#fbfaf5_43%,rgba(251,250,245,0)_70%)]"></div>
                <div class="relative mx-auto grid min-h-[720px] max-w-[1520px] lg:grid-cols-[minmax(0,0.95fr)_minmax(520px,1.05fr)]">
                    <div class="relative z-10 px-6 pb-10 pt-10 sm:px-10 sm:pt-14 lg:px-12 lg:pb-16 lg:pt-20 xl:px-14">
                        <div class="inline-flex items-center gap-2 rounded-full bg-[#f0f3e8] px-4 py-2 text-xs font-bold text-[#667554] shadow-sm">
                            <i class="fa-brands fa-pagelines text-[11px]" aria-hidden="true"></i>
                            나를 이해하고, 관계를 회복하는 시간
                        </div>

                        <h1 class="mt-6 max-w-3xl text-[2.18rem] font-black leading-[1.14] tracking-[-0.02em] text-[#202219] break-keep sm:mt-8 sm:text-5xl lg:text-[3.05rem] xl:text-[3.35rem]">
                            나는 왜 이렇게 반응하고,<br>
                            <span class="text-[#68785a]">사랑하는 사람은 왜 그렇게 행동할까요?</span>
                        </h1>

                        <p class="mt-4 max-w-2xl text-base font-medium leading-[1.75] text-[#5f6258] break-keep sm:mt-6 sm:text-lg">
                            ER은 에니어그램과 회복의 관점으로 더 나은 관계와 건강한 나를 만드는 여정을 함께합니다.
                        </p>

                        <div class="mt-5 max-w-2xl rounded-2xl border border-[#d8cbb7] bg-[#fffdf8]/95 p-4 text-left shadow-[0_16px_32px_rgba(63,50,33,0.12)] sm:hidden">
                            <div class="flex items-start justify-between gap-3">
                                <div class="min-w-0">
                                    <span class="inline-flex rounded-full bg-[#eef3e6] px-2.5 py-1 text-[10px] font-black text-[#657453] ring-1 ring-[#dce7cd]">특별 혜택</span>
                                    <p class="mt-2 text-xl font-black leading-tight tracking-[-0.01em] text-[#202219] break-keep">7월 기본과정 모집 중</p>
                                    <p class="mt-1 text-xs font-bold text-[#6f6b60] break-keep">${basicCourseDays} · 정원 10명 · 선착순 마감</p>
                                </div>
                                <button onclick="renderSection('apply', { track: 'paid', focus: 'enneagram_basic_july', apply_source: 'home_hero_offer_mobile' })" class="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-[#3a332b] px-4 text-xs font-extrabold text-white shadow-[0_10px_20px_rgba(58,51,43,0.16)] transition-all active:scale-95">신청</button>
                            </div>
                        </div>

                        <div class="mt-6 grid max-w-3xl gap-3 sm:mt-8 sm:grid-cols-3 sm:gap-4">
                            ${benefits.map((item) => `
                                <div class="flex items-start gap-2.5 sm:gap-3">
                                    <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f4efe6] text-[#68785a] ring-1 ring-[#e8dfcf] sm:h-11 sm:w-11">
                                        <i class="${item.icon} text-base" aria-hidden="true"></i>
                                    </span>
                                    <span>
                                        <span class="block text-sm font-extrabold text-[#2c2e26] break-keep">${item.title}</span>
                                        <span class="mt-1 block text-xs font-medium text-[#858174] break-keep sm:block">${item.text}</span>
                                    </span>
                                </div>
                            `).join('')}
                        </div>

                        <div class="mt-7 flex max-w-2xl flex-col gap-3 sm:mt-9 sm:flex-row">
                            <button onclick="renderSection('programs', { tab: 'individual' })" class="inline-flex min-h-[3.4rem] flex-1 items-center justify-center gap-2 rounded-lg bg-[#657453] px-6 py-4 text-sm font-extrabold text-white shadow-[0_18px_36px_rgba(101,116,83,0.18)] transition-all hover:-translate-y-0.5 hover:bg-[#566647] active:scale-95">
                                나에게 맞는 프로그램 찾기
                                <i class="fas fa-arrow-right text-xs opacity-80" aria-hidden="true"></i>
                            </button>
                            <button onclick="renderSection('test')" class="inline-flex min-h-[3.4rem] flex-1 items-center justify-center gap-2 rounded-lg border border-[#ded6c8] bg-white/80 px-6 py-4 text-sm font-extrabold text-[#202219] shadow-sm transition-all hover:border-[#7f8b68] hover:bg-white active:scale-95">
                                무료 에니어그램 검사
                                <i class="far fa-clipboard text-xs text-[#68785a]" aria-hidden="true"></i>
                            </button>
                        </div>
                    </div>

                    <div class="relative min-h-[360px] overflow-hidden sm:min-h-[500px] lg:min-h-[720px]">
                        <img src="background.png" alt="" class="absolute inset-0 h-full w-full object-cover" style="object-position:center; filter:saturate(1.03) contrast(0.98) brightness(1.04);">
                        <div class="absolute inset-y-0 left-0 hidden w-1/2 bg-gradient-to-r from-[#fbfaf5] via-[#fbfaf5]/70 to-transparent lg:block"></div>
                        <div class="absolute inset-0 bg-gradient-to-t from-[#f4efe6]/20 via-transparent to-white/10"></div>

                        <div class="absolute right-5 top-6 hidden max-w-[240px] rounded-2xl bg-white/88 p-5 text-center shadow-2xl shadow-black/10 ring-1 ring-white/70 backdrop-blur-md sm:block lg:right-8 lg:top-28">
                            <p class="text-[11px] font-bold text-[#6c6b60]">지금 시작하면 특별한 혜택!</p>
                            <p class="mt-4 text-xl font-black text-[#202219]">7월 기본과정 모집</p>
                            <p class="mt-1 text-sm font-bold text-[#68785a]">${basicCourseDays} · 정원 10명</p>
                            <button onclick="renderSection('apply', { track: 'paid', focus: 'enneagram_basic_july', apply_source: 'home_hero_offer' })" class="mt-5 w-full rounded-lg bg-[#657453] px-4 py-3 text-xs font-extrabold text-white transition-colors hover:bg-[#566647]">신청하기</button>
                        </div>
                    </div>
                </div>
            </section>

            <section class="relative z-10 mx-auto -mt-8 max-w-[1480px] px-4 sm:px-6 lg:px-8">
                <div class="grid overflow-hidden rounded-2xl border border-[#e7ddcd] bg-white/88 shadow-xl shadow-[#6b5f4b]/8 backdrop-blur md:grid-cols-4">
                    ${stats.map((stat, index) => `
                        <div class="px-6 py-6 text-center ${index > 0 ? 'md:border-l md:border-[#ebe2d4]' : ''}">
                            <p class="text-2xl font-black text-[#68785a]">${stat.value}</p>
                            <p class="mt-1 text-xs font-semibold text-[#6f7068]">${stat.label}</p>
                        </div>
                    `).join('')}
                </div>
            </section>

            <section class="mx-auto max-w-[1480px] px-4 pt-6 sm:px-6 lg:px-8 lg:pt-8">
                <div class="rounded-2xl border border-[#e2d8c8] bg-[#faf7f0] p-5 shadow-sm sm:p-8 lg:p-10">
                    <div class="grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-end">
                        <div>
                            <div class="flex items-center gap-4">
                                <div class="h-px w-24 bg-[#dfd6c2]"></div>
                            </div>
                            <p class="mt-6 text-sm font-black text-[#657453]">회복의 도구, 에니어그램</p>
                            <h2 class="mt-3 max-w-xl text-3xl font-black leading-tight tracking-[-0.02em] text-[#30322d] break-keep sm:text-4xl">
                                같은 자리에서 반복되는 갈등을<br>
                                <span class="text-[#657453]">다른 시선으로 봅니다</span>
                            </h2>
                            <p class="mt-5 max-w-2xl text-sm font-medium leading-8 text-[#65675f] break-keep sm:text-base">
                                ER은 갈등을 단순한 성격 차이로만 설명하지 않습니다. 그 안에 숨어 있는 두려움, 욕구, 방어 방식, 상처와 관계 패턴을 복음 안에서 조명하고 회복의 방향을 함께 찾아갑니다.
                            </p>
                        </div>

                        <div class="rounded-2xl border border-[#e0d5c3] bg-[#f4efe6] p-5 sm:p-6">
                            <h3 class="text-lg font-black text-[#30322d] break-keep">이런 분께 추천합니다</h3>
                            <div class="mt-4 grid gap-3 sm:grid-cols-2">
                                ${recommendationItems.map((item) => `
                                    <div class="flex items-start gap-3 rounded-xl bg-[#fffdf8]/80 p-3 ring-1 ring-[#e7dcc9]">
                                        <span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e7efdc] text-[10px] text-[#657453]">
                                            <i class="fas fa-check" aria-hidden="true"></i>
                                        </span>
                                        <p class="text-sm font-bold leading-6 text-[#44473f] break-keep">${item}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <div class="mt-8 grid gap-6 lg:grid-cols-3">
                        ${restorationCards.map((card) => `
                            <article class="group rounded-2xl border border-[#dfd4c4] bg-[#fffdf8] p-4 shadow-[0_16px_45px_rgba(84,72,52,0.07)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(84,72,52,0.12)]">
                                <div class="rounded-[1.15rem] bg-[#f0eadf] p-2 ring-1 ring-[#e5dac8]">
                                    <div class="aspect-[16/10] overflow-hidden rounded-xl bg-[#e8dfd1]">
                                        <img src="${card.image}" alt="" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]" style="object-position:${card.position}; filter:saturate(0.96) brightness(1.04);">
                                    </div>
                                </div>
                                <div class="px-2 pb-2 pt-5">
                                    <p class="inline-flex rounded-full bg-[#eef3e6] px-3 py-1 text-xs font-black text-[#657453] ring-1 ring-[#dce5ce]">${card.eyebrow}</p>
                                    <p class="mt-4 rounded-xl bg-[#f4efe6] px-3.5 py-3 text-sm font-extrabold leading-6 text-[#536149] break-keep">${card.caption}</p>
                                    <h3 class="mt-4 text-xl font-black leading-snug tracking-[-0.01em] text-[#30322d] break-keep">${card.title}</h3>
                                    <p class="mt-3 text-sm font-medium leading-7 text-[#65675f] break-keep">${card.text}</p>
                                    <ul class="mt-5 space-y-2.5">
                                        ${card.points.map((point) => `
                                            <li class="flex items-start gap-2 text-sm font-semibold text-[#44473f] break-keep">
                                                <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#8a956f]"></span>
                                                <span>${point}</span>
                                            </li>
                                        `).join('')}
                                    </ul>
                                    <button onclick="${card.action}" class="mt-6 inline-flex min-h-[2.95rem] w-full items-center justify-center gap-2 rounded-xl bg-[#657453] px-5 py-3 text-sm font-extrabold text-[#fffdf8] shadow-[0_14px_28px_rgba(101,116,83,0.16)] transition-all hover:-translate-y-0.5 hover:bg-[#566647]">
                                        상담/워크숍 문의
                                        <i class="fas fa-arrow-right text-xs opacity-80" aria-hidden="true"></i>
                                    </button>
                                </div>
                            </article>
                        `).join('')}
                    </div>
                </div>
            </section>

            <section class="mx-auto max-w-[1480px] px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pb-16">
                <div class="rounded-2xl border border-[#e2d8c8] bg-[#fffdf8] p-5 shadow-sm sm:p-8 lg:p-10">
                    <div class="grid gap-10 lg:grid-cols-[minmax(0,1.28fr)_minmax(410px,0.88fr)] lg:gap-12">
                        <div>
                            <p class="text-sm font-black text-[#657453]">ER의 대표 프로그램</p>
                            <h2 class="mt-3 text-2xl font-black tracking-[-0.02em] text-[#30322d] break-keep sm:text-3xl lg:text-[2rem]">당신의 변화를 위한 맞춤 여정</h2>
                            <p class="mt-3 text-sm font-semibold leading-7 text-[#6f7068] break-keep">검증된 프로그램으로 더 나은 나와 관계를 만들어보세요.</p>

                            <div class="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                ${programCards.map((card) => `
                                    <article class="group flex min-h-[24rem] flex-col rounded-2xl border border-[#e2d8c8] bg-[#fbf8f1] p-4 shadow-[0_14px_40px_rgba(94,77,47,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(94,77,47,0.11)]">
                                        <div class="rounded-2xl bg-[#f0eadf] p-2 ring-1 ring-[#e5dac8]">
                                            <div class="relative aspect-[1.45] overflow-hidden rounded-xl bg-[#e8dfd1]">
                                                <img src="${card.image}" alt="" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]" style="object-position:${card.position}; filter:saturate(0.95) brightness(1.08);">
                                                <span class="absolute left-3 top-3 rounded-full bg-[#657453] px-3 py-1 text-[10px] font-black text-[#fffdf8] shadow-sm">${card.badge}</span>
                                            </div>
                                        </div>
                                        <div class="flex flex-1 flex-col pt-5">
                                            <h3 class="text-[1.05rem] font-black leading-snug tracking-[-0.01em] text-[#30322d] break-keep">${card.title}</h3>
                                            <p class="mt-3 text-sm font-medium leading-7 text-[#696a62] break-keep">${card.text}</p>
                                            <div class="mt-auto pt-6">
                                                <p class="text-lg font-black text-[#30322d]">${card.price}</p>
                                                <button onclick="${card.action}" class="mt-4 inline-flex min-h-[2.9rem] w-full items-center justify-center rounded-xl border border-[#dccfbc] bg-[#fffdf8] px-4 py-3 text-sm font-extrabold text-[#30322d] transition-all hover:border-[#657453] hover:bg-[#657453] hover:text-[#fffdf8]">${card.button}</button>
                                                ${card.button2 ? `<button onclick="${card.action2}" class="mt-2 inline-flex min-h-[2.9rem] w-full items-center justify-center rounded-xl bg-[#657453] px-4 py-3 text-sm font-extrabold text-[#fffdf8] transition-all hover:bg-[#566647]">${card.button2}</button>` : ''}
                                            </div>
                                        </div>
                                    </article>
                                `).join('')}
                            </div>

                            <div class="mt-9 text-center">
                                <button onclick="renderSection('programs', { tab: 'individual' })" class="inline-flex min-h-[3.6rem] min-w-[18rem] items-center justify-center gap-3 rounded-xl bg-[#657453] px-9 py-4 text-base font-black text-[#fffdf8] shadow-[0_18px_36px_rgba(101,116,83,0.18)] transition-all hover:-translate-y-0.5 hover:bg-[#566647]">
                                    전체 프로그램 보기
                                    <i class="fas fa-arrow-right text-sm" aria-hidden="true"></i>
                                </button>
                            </div>
                        </div>

                        <div class="lg:border-l lg:border-[#e2d8c8] lg:pl-12">
                            <p class="text-sm font-black text-[#7a766a]">함께한 사람들의 이야기</p>
                            <h2 class="mt-3 text-2xl font-black tracking-[-0.02em] text-[#30322d] break-keep sm:text-3xl lg:text-[2rem]">변화를 경험한 사람들의 진솔한 후기</h2>

                            <div class="mt-7 space-y-5">
                                ${testimonials.map((item) => `
                                    <article class="relative rounded-2xl border border-[#e2d8c8] bg-[#fbf8f1] p-5 pr-16 shadow-[0_14px_38px_rgba(94,77,47,0.06)] sm:p-6 sm:pr-20">
                                        <div class="absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#f1eadf] text-3xl font-black leading-none text-[#cabc9e]">
                                            &rdquo;
                                        </div>
                                        <p class="text-sm font-bold leading-8 text-[#3e4039] break-keep">“${item.quote}”</p>
                                        <div class="mt-5 flex items-end justify-between gap-4 border-t border-[#eadfce] pt-4">
                                            <p class="text-sm font-extrabold text-[#6f7068] break-keep">${item.person} <span class="mx-2 text-[#cfc5b6]">|</span> ${item.label}</p>
                                            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e7efdc] text-sm font-black text-[#657453] ring-4 ring-[#fffdf8]">${item.avatar}</div>
                                        </div>
                                    </article>
                                `).join('')}
                            </div>

                            <div class="mt-5 flex items-center justify-center gap-4 text-[#b8ad9d]" aria-hidden="true">
                                <i class="fas fa-chevron-left text-xs"></i>
                                <span class="h-2.5 w-2.5 rounded-full bg-[#657453]"></span>
                                <span class="h-2.5 w-2.5 rounded-full bg-[#d9d1c5]"></span>
                                <i class="fas fa-chevron-right text-xs"></i>
                            </div>
                        </div>
                    </div>

                    <div class="mt-10 overflow-hidden rounded-2xl border border-[#d8cbb8] bg-[#657453] text-[#fffdf8] shadow-[0_24px_60px_rgba(101,116,83,0.18)]">
                        <div class="relative min-h-[21rem] px-6 py-10 sm:px-10 lg:px-20 lg:py-14">
                            <img src="green and seat.png" alt="" class="absolute inset-0 h-full w-full object-cover" style="object-position:center right; filter:saturate(0.94) brightness(0.92);">
                            <div class="absolute inset-0 bg-gradient-to-r from-[#30451f] via-[#3f5530]/88 to-[#30451f]/12"></div>
                            <div class="relative max-w-xl">
                                <h2 class="text-3xl font-black leading-tight tracking-[-0.02em] break-keep sm:text-4xl">지금, 당신의 변화를 시작하세요</h2>
                                <p class="mt-5 text-base font-bold leading-8 text-[#fffdf8]/88 break-keep">작은 용기가 큰 변화를 만듭니다.<br>ER이 당신의 여정을 함께할게요.</p>
                                <div class="mt-8 flex flex-col gap-3 sm:flex-row">
                                    <button onclick="renderSection('apply', { track: 'paid' })" class="inline-flex min-h-[3.5rem] min-w-[14rem] items-center justify-center rounded-xl bg-[#fffdf8] px-8 py-4 text-sm font-black text-[#30322d] shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5 hover:bg-[#f5efe5]">상담 신청하기</button>
                                    <button onclick="renderSection('test')" class="inline-flex min-h-[3.5rem] min-w-[14rem] items-center justify-center rounded-xl border border-[#fffdf8]/42 bg-[#fffdf8]/5 px-8 py-4 text-sm font-black text-[#fffdf8] transition-all hover:-translate-y-0.5 hover:bg-[#fffdf8]/12">무료 검사로 시작하기</button>
                                </div>
                            </div>
                        </div>

                        <div class="grid gap-0 bg-[#fffdf8] text-[#30322d] sm:grid-cols-2 lg:grid-cols-4">
                            ${footerBenefits.map((item, index) => `
                                <div class="flex items-start gap-4 px-6 py-6 ${index > 0 ? 'lg:border-l lg:border-[#ebe2d4]' : ''}">
                                    <span class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#f2eedf] text-xl text-[#657453]">
                                        <i class="${item.icon}" aria-hidden="true"></i>
                                    </span>
                                    <span>
                                        <span class="block text-base font-black break-keep">${item.title}</span>
                                        <span class="mt-1.5 block text-sm font-medium leading-relaxed text-[#73756b] break-keep">${item.text}</span>
                                    </span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    `;
}

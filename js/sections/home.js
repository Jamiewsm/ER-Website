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
        { value: '12,500+', label: '누적 수강생' },
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
            action: "window.location.href='/basic-course.html'"
        },
        {
            badge: '추천',
            title: 'Enneagram for Parenting',
            text: '부모의 반응 패턴과 아이의 욕구를 이해하는 4주 과정',
            price: '$120',
            image: 'living room.png',
            position: 'center',
            action: "window.location.href='/parenting-workshop.html'"
        },
        {
            badge: '테스트',
            title: '무료 에니어그램 검사',
            text: '내 반복 패턴을 먼저 정리하는 10분 테스트',
            price: '무료',
            image: 'hands and green.png',
            position: 'center',
            action: "renderSection('test')"
        },
        {
            badge: '상담',
            title: '1:1 개인 상담',
            text: '전문 상담사와 함께하는 맞춤 상담',
            price: '$150부터',
            image: 'green and seat.png',
            position: 'center',
            action: "renderSection('apply', { track: 'paid', focus: 'individual' })"
        }
    ];

    const testimonials = [
        { story: parentingStory, label: '에니어그램 기본과정 수강' },
        { story: coupleStory, label: '심화과정 수강' },
        { story: teamStory, label: '개인 상담 진행' }
    ];

    const footerBenefits = [
        { icon: 'fa-solid fa-shield-halved', title: '안전한 환경', text: '검증된 전문가와 안전한 공간에서' },
        { icon: 'fa-regular fa-clipboard', title: '체계적인 시스템', text: '검증된 프로그램과 단계별 학습' },
        { icon: 'fa-brands fa-pagelines', title: '지속적인 지원', text: '수료 후에도 계속되는 커뮤니티와 지원' },
        { icon: 'fa-solid fa-hand-holding-dollar', title: '합리적인 가격', text: '가치 있는 변화의 여정을 합리적인 가격으로' }
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

            <section class="mx-auto grid max-w-[1480px] gap-4 px-4 pb-12 pt-6 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8 lg:pb-16">
                <div class="rounded-2xl border border-[#e7ddcd] bg-white p-6 shadow-sm sm:p-8 lg:p-10">
                    <div class="text-center">
                        <p class="text-xs font-extrabold uppercase tracking-[0.22em] text-[#68785a]">ER의 대표 프로그램</p>
                        <h2 class="mt-3 text-2xl font-black tracking-[-0.01em] text-[#202219] break-keep sm:text-3xl">당신의 변화를 위한 맞춤 여정</h2>
                        <p class="mt-2 text-sm font-medium text-[#78776d] break-keep">검증된 프로그램으로 더 나은 나와 관계를 만들어보세요.</p>
                    </div>

                    <div class="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4 lg:grid-cols-2">
                        ${programCards.map((card) => `
                            <article class="overflow-hidden rounded-xl border border-[#e6dece] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                                <div class="relative aspect-[4/3] overflow-hidden bg-[#f2ede2]">
                                    <img src="${card.image}" alt="" class="h-full w-full object-cover transition-transform duration-500 hover:scale-105" style="object-position:${card.position}; filter:saturate(0.95) brightness(1.08);">
                                    <span class="absolute left-3 top-3 rounded-full bg-[#eef1df] px-3 py-1 text-[10px] font-extrabold text-[#667554]">${card.badge}</span>
                                </div>
                                <div class="p-4">
                                    <h3 class="text-sm font-black text-[#202219] break-keep">${card.title}</h3>
                                    <p class="mt-2 min-h-[2.55rem] text-xs font-medium leading-relaxed text-[#73756b] break-keep">${card.text}</p>
                                    <p class="mt-4 text-sm font-black text-[#202219]">${card.price}</p>
                                    <button onclick="${card.action}" class="mt-3 w-full rounded-lg border border-[#ded6c8] bg-[#fffdf8] px-4 py-2.5 text-xs font-extrabold text-[#202219] transition-colors hover:border-[#7f8b68] hover:bg-[#657453] hover:text-white">자세히 보기</button>
                                </div>
                            </article>
                        `).join('')}
                    </div>

                    <div class="mt-7 text-center">
                        <button onclick="renderSection('programs', { tab: 'individual' })" class="inline-flex min-h-[3rem] items-center justify-center gap-2 rounded-lg bg-[#657453] px-8 py-3 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(101,116,83,0.16)] transition-all hover:-translate-y-0.5 hover:bg-[#566647]">
                            전체 프로그램 보기
                            <i class="fas fa-arrow-right text-xs" aria-hidden="true"></i>
                        </button>
                    </div>
                </div>

                <div class="space-y-4">
                    <div class="rounded-2xl border border-[#e7ddcd] bg-white p-6 shadow-sm sm:p-8 lg:p-10">
                        <div class="text-center">
                            <p class="text-xs font-extrabold uppercase tracking-[0.2em] text-[#7a766a]">함께한 사람들의 이야기</p>
                            <h2 class="mt-3 text-2xl font-black tracking-[-0.01em] text-[#202219] break-keep sm:text-3xl">변화를 경험한 사람들의 진솔한 후기</h2>
                        </div>

                        <div class="mt-8 grid gap-4 md:grid-cols-3 lg:grid-cols-3">
                            ${testimonials.map(({ story, label }) => `
                                <article class="rounded-xl border border-[#e9e0d2] bg-[#fffdf8] p-5 shadow-sm">
                                    <div class="text-right text-3xl font-black leading-none text-[#d8d0bf]">”</div>
                                    <p class="-mt-2 text-sm font-semibold leading-relaxed text-[#34362f] break-keep">“${story.quote}”</p>
                                    <div class="mt-5 flex items-center gap-3">
                                        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eef1df] text-[11px] font-black text-[#667554]">${initials(story.person)}</div>
                                        <div>
                                            <p class="text-xs font-black text-[#202219]">${story.person}</p>
                                            <p class="text-[10px] font-semibold text-[#878477]">${label}</p>
                                        </div>
                                    </div>
                                </article>
                            `).join('')}
                        </div>
                    </div>

                    <div class="overflow-hidden rounded-2xl border border-[#7d886b]/25 bg-[#657453] text-white shadow-[0_24px_60px_rgba(101,116,83,0.18)]">
                        <div class="relative px-6 py-9 text-center sm:px-10">
                            <div class="absolute inset-0 opacity-45" style="background-image:url('green and seat.png'); background-size:cover; background-position:center;"></div>
                            <div class="absolute inset-0 bg-[rgba(95,112,78,0.78)]"></div>
                            <div class="relative">
                                <h2 class="text-2xl font-black tracking-[-0.01em] break-keep sm:text-3xl">지금, 당신의 변화를 시작하세요</h2>
                                <p class="mt-3 text-sm font-medium leading-relaxed text-white/82 break-keep">작은 용기가 큰 변화를 만듭니다.<br>ER이 당신의 여정을 함께할게요.</p>
                                <div class="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                                    <button onclick="renderSection('apply', { track: 'paid' })" class="inline-flex min-h-[3rem] items-center justify-center rounded-lg bg-[#fffdf8] px-8 py-3 text-sm font-extrabold text-[#667554] transition-all hover:-translate-y-0.5 hover:bg-white">상담 신청하기</button>
                                    <button onclick="renderSection('test')" class="inline-flex min-h-[3rem] items-center justify-center rounded-lg border border-white/35 bg-white/5 px-8 py-3 text-sm font-extrabold text-white transition-all hover:-translate-y-0.5 hover:bg-white/12">무료 검사로 시작하기</button>
                                </div>
                            </div>
                        </div>

                        <div class="grid gap-0 bg-[#fffdf8] text-[#202219] md:grid-cols-4">
                            ${footerBenefits.map((item, index) => `
                                <div class="flex items-start gap-3 px-5 py-5 ${index > 0 ? 'md:border-l md:border-[#ebe2d4]' : ''}">
                                    <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f2eedf] text-[#68785a]">
                                        <i class="${item.icon}" aria-hidden="true"></i>
                                    </span>
                                    <span>
                                        <span class="block text-sm font-black break-keep">${item.title}</span>
                                        <span class="mt-1 block text-xs font-medium leading-relaxed text-[#73756b] break-keep">${item.text}</span>
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

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
    const churchStory = findStory(
        (story) => /교회·공동체|공동체/.test(story.tag || '') || /공동체/.test(story.meta || ''),
        fallbackStory
    );

    const landingCards = [
        {
            eyebrow: 'Parenting',
            title: '우리 아이가 달라졌어요',
            summary: '모든 아이들은 다릅니다. 하나님이 만드신 나와 아이만의 고유한 아름다움을 이해할 때, 그리고 아이가 세상과 부모와 관계하는 방식이 이해되어질 때, 비로소 아이의 욕구가 해결되어질 수 있습니다. ER이 도와드립니다.',
            quote: parentingStory.quote,
            person: parentingStory.person,
            meta: parentingStory.meta,
            icon: 'fas fa-child-reaching',
            accentClass: 'from-[#fff9f1] via-white to-[#f9efe0]',
            iconClass: 'bg-[#f1debf] text-[#8a6848]',
            primaryAction: "renderSection('apply', { track: 'paid', focus: 'parenting' })",
            secondaryAction: "renderSection('programs', { tab: 'individual' })"
        },
        {
            eyebrow: 'Couple',
            title: '우리 부부가 달라졌어요',
            summary: '남편을 도대체 이해할 수가 없어요!<br>달라도 너무 달라서 힘들어요!<br>대화하지 않은 지 이미 오래되었어요!<br>이제는 그냥 아이들 때문에 살아요.<br><br>ER을 통해 부부 안에 부어주시는 하나님의 소망을 경험하세요.',
            quote: coupleStory.quote,
            person: coupleStory.person,
            meta: coupleStory.meta,
            icon: 'fas fa-heart',
            accentClass: 'from-[#fff4f5] via-white to-[#f7ebe8]',
            iconClass: 'bg-[#f5d9dd] text-[#9c5c68]',
            primaryAction: "renderSection('apply', { track: 'paid', focus: 'couple' })",
            secondaryAction: "renderSection('programs', { tab: 'individual' })"
        },
        {
            eyebrow: 'Team',
            title: '우리 팀이 달라졌어요',
            summary: '팀 안에서 각 사람이 가진 강점과 약점은 다 다릅니다. 생각하는 방식과 소통하는 구조도 다름을 인정해야 합니다. ER은 팀의 목적과 팀원 개인의 강점을 분석하여, 모두가 살아나는 최선의 시너지를 만들어드립니다.',
            quote: teamStory.quote,
            person: teamStory.person,
            meta: teamStory.meta,
            icon: 'fas fa-users',
            accentClass: 'from-[#f5f8ff] via-white to-[#eef2fb]',
            iconClass: 'bg-[#dfe6f8] text-[#5c6f9f]',
            primaryAction: "renderSection('apply', { track: 'org', focus: 'team' })",
            secondaryAction: "renderSection('programs', { tab: 'business' })"
        },
        {
            eyebrow: 'Church',
            title: '우리 교회가 달라졌어요',
            summary: '많은 사역자들이 성도들과의 관계와 사역적 스트레스로 번아웃 속에 살아가고 있습니다. 사역자에게 필요한 것은 하나님이 내게 주신 은사와 기름부으심을 이해하고, 내게 맡겨진 양떼를 이해하는 것입니다. ER은 사역자들이 하나님이 맡기신 양떼들을 이해하고 섬길 수 있는 교육을 제공하고, 번아웃에서 나오는 건강한 지름길을 제시합니다.',
            quote: churchStory.quote,
            person: churchStory.person,
            meta: churchStory.meta,
            icon: 'fas fa-church',
            accentClass: 'from-[#f8f6ff] via-white to-[#f1ecfb]',
            iconClass: 'bg-[#e8e0f7] text-[#6f5c95]',
            primaryAction: "renderSection('apply', { track: 'org', focus: 'church' })",
            secondaryAction: "renderSection('programs', { tab: 'church' })"
        }
    ];


    return `
        <div class="bg-er-base">
            <section class="relative overflow-hidden px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                <div class="absolute inset-x-0 top-0 h-[760px] md:h-[720px] lg:h-[760px] pointer-events-none">
                    <img src="https://images.unsplash.com/photo-1758024836397-2c9c698087f0?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=70&w=2200" alt="" class="h-full w-full object-cover opacity-100" style="object-position: center 68%; filter: saturate(0.96) contrast(0.96) brightness(1.01);">
                    <div class="absolute inset-0" style="background: linear-gradient(180deg, rgba(247, 238, 228, 0.66) 0%, rgba(247, 238, 228, 0.34) 44%, rgba(247, 238, 228, 0.70) 100%);"></div>
                    <div class="absolute inset-0" style="background: radial-gradient(circle at 50% 13%, rgba(255, 251, 246, 0.78) 0%, rgba(255, 251, 246, 0.40) 33%, rgba(247, 238, 228, 0.06) 100%);"></div>
                </div>

                <div class="max-w-6xl mx-auto relative z-10">
                    <div class="max-w-5xl mx-auto text-center">
                        <span class="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.28em] text-er-primary shadow-soft">
                            <span class="h-2 w-2 rounded-full bg-er-accent"></span>
                            Enneagram for Restoration
                        </span>
                        <h1 class="mt-6 text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] xl:text-[3.45rem] font-extrabold tracking-normal text-er-dark leading-[1.14] break-keep">
                            나는 왜 이렇게 반응하고,<br>
                            사랑하는 사람은 왜 그렇게 행동할까요?
                        </h1>
                        <p class="mt-6 text-sm sm:text-[15px] md:text-base text-er-dark/75 leading-[1.85] break-keep max-w-3xl mx-auto font-medium tracking-normal">
                            ER은 에니어그램을 복음의 회복 이야기 안에서 다루며,<br class="hidden md:block">
                            나와 타인의 반복되는 패턴을 이해하고<br class="hidden md:block">
                            더 자유롭고 건강한 사랑으로 자라가도록 돕습니다.
                        </p>
                    </div>

                    <div class="mt-12 grid gap-5 md:grid-cols-2 animate-fade-in-up" style="animation-delay:0.08s;">
                        ${landingCards.map((card) => `
                            <article class="group rounded-[2rem] border border-white/60 bg-gradient-to-br ${card.accentClass} p-6 md:p-7 shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card">
                                <div class="flex items-start justify-between gap-4">
                                    <div>
                                        <span class="inline-flex rounded-full bg-white/85 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-er-primary shadow-sm">${card.eyebrow}</span>
                                        <h2 class="mt-4 text-2xl md:text-3xl font-extrabold text-er-dark break-keep">${card.title}</h2>
                                    </div>
                                    <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${card.iconClass} shadow-sm">
                                        <i class="${card.icon} text-lg"></i>
                                    </div>
                                </div>

                                <p class="mt-4 text-sm md:text-base text-gray-600 leading-relaxed break-keep">${card.summary}</p>

                                <div class="mt-6 rounded-[1.5rem] border border-white/70 bg-white/85 p-5 shadow-sm">
                                    <p class="text-[10px] font-bold uppercase tracking-[0.22em] text-er-accent">후기 하이라이트</p>
                                    <p class="mt-3 text-sm text-gray-600 leading-relaxed break-keep">“${card.quote}”</p>
                                    <div class="mt-4 border-t border-gray-100 pt-3">
                                        <p class="text-sm font-bold text-er-dark">${card.person}</p>
                                        <p class="text-[11px] uppercase tracking-[0.18em] text-gray-400">${card.meta}</p>
                                    </div>
                                </div>

                                <div class="mt-6 flex flex-wrap gap-3">
                                    <button onclick="${card.primaryAction}" class="inline-flex items-center justify-center rounded-full bg-er-dark px-5 py-3 text-sm font-bold text-white shadow-lg shadow-er-dark/15 transition-all hover:-translate-y-0.5 hover:bg-gray-800">
                                        ER팀과 상담해보세요
                                    </button>
                                    <button onclick="${card.secondaryAction}" class="inline-flex items-center justify-center rounded-full border border-er-accent/30 bg-white px-5 py-3 text-sm font-bold text-er-dark transition-colors hover:border-er-accent hover:bg-er-accentLight/40">
                                        자세한 내용 보기
                                    </button>
                                </div>
                            </article>
                        `).join('')}
                    </div>
                </div>
            </section>

            <section class="bg-er-base px-4 sm:px-6 lg:px-8 py-16 md:py-20">
                <div class="max-w-4xl mx-auto">
                    <div class="rounded-[2.5rem] bg-er-dark p-8 md:p-12 text-white shadow-card text-center">
                        <span class="inline-flex rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-er-accent">Start Here</span>
                        <h3 class="mt-5 text-2xl md:text-4xl font-bold break-keep leading-tight">
                            어디서부터 시작해야 할지 모르시나요?
                        </h3>
                        <p class="mt-4 text-sm md:text-base text-gray-200 leading-relaxed break-keep max-w-xl mx-auto">
                            10분 진단으로 내 반응 패턴을 먼저 정리하면, 상담이 훨씬 가벼워집니다.
                        </p>
                        <div class="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                            <button onclick="renderSection('test')" class="inline-flex items-center justify-center rounded-full bg-er-accent px-7 py-4 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-er-accentDark">
                                무료 진단 시작하기
                            </button>
                            <button onclick="renderSection('programs', { tab: 'individual' })" class="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/5 px-7 py-4 text-sm font-bold text-white transition-colors hover:bg-white/10">
                                프로그램 둘러보기
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    `;
}

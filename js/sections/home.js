function renderHome() {
    const erSite = window.ER_STRINGS || {};
    const founder = Array.isArray(erSite?.coaches?.list) && erSite.coaches.list.length
        ? erSite.coaches.list[0]
        : {
            name: '손지영 대표',
            role: '대표 · Founder',
            photo: 'son-profile-picture.png',
            bio: '에니어그램과 기독교 세계관을 통합적으로 적용해 개인·가정·공동체의 회복을 돕습니다.',
            specialties: ['개인 자기 이해 코칭', '부부·가정 회복', '사역자·선교사 돌봄', '에니어그램 강사 양성'],
            certs: ['Enneagram Spectrum Advanced Certification', 'IEA Accredited Instructor', 'SOIM GLTC Instructor', 'DTS Counseling'],
            locations: 'Korea · USA'
        };
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

    const guideCards = [
        {
            label: '서비스 안내',
            title: '프로그램 전체 보기',
            desc: '개인·가정, 교회·기관, 기업·팀 프로그램 구성을 한 번에 확인합니다.',
            action: "renderSection('programs', { tab: 'individual' })"
        },
        {
            label: '회복 이야기',
            title: '후기와 변화 보기',
            desc: '실제 사례와 카테고리별 변화 패턴을 더 보고 싶다면 여기서 이어집니다.',
            action: "renderSection('community')"
        },
        {
            label: 'ER 소개',
            title: '대표와 사역 방향 보기',
            desc: 'ER이 어떤 배경과 철학으로 사역하는지 짧고 명확하게 확인합니다.',
            action: "renderSection('about')"
        },
        {
            label: '진단 테스트',
            title: '먼저 진단해 보기',
            desc: '상담 전에 현재 패턴을 스스로 정리해 보고 싶다면 진단 테스트로 시작합니다.',
            action: "renderSection('test')"
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
                    <div class="max-w-5xl mx-auto text-center animate-fade-in-up">
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

            <section class="bg-white px-4 sm:px-6 lg:px-8 py-12 md:py-14 border-y border-er-accentLight/50">
                <div class="max-w-6xl mx-auto">
                    <div class="rounded-[2.25rem] bg-er-dark p-7 md:p-8 text-white shadow-card">
                        <div class="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                            <div>
                                <span class="inline-flex rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-er-accent">First Conversation</span>
                                <h3 class="mt-4 text-2xl md:text-3xl font-bold break-keep">아직 무엇이 문제인지 정확히 말로 정리되지 않아도 괜찮습니다.</h3>
                                <div class="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-gray-200">
                                    <span class="rounded-full border border-white/15 bg-white/5 px-3 py-1.5">Korea · USA 기준 운영</span>
                                    <span class="rounded-full border border-white/15 bg-white/5 px-3 py-1.5">24시간 내 1차 응답</span>
                                    <span class="rounded-full border border-white/15 bg-white/5 px-3 py-1.5">개인·가정 / 교회·기관 분리 안내</span>
                                </div>
                            </div>
                            <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                                <button onclick="renderSection('apply', { track: 'paid' })" class="inline-flex items-center justify-center rounded-full bg-white px-5 py-3.5 text-sm font-bold text-er-dark transition-colors hover:bg-er-accentLight">
                                    개인·가정 상담 신청
                                </button>
                                <button onclick="renderSection('apply', { track: 'org' })" class="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-5 py-3.5 text-sm font-bold text-white transition-colors hover:bg-white/15">
                                    교회·기관 상담 신청
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section class="bg-white px-4 sm:px-6 lg:px-8 py-16 md:py-20">
                <div class="max-w-6xl mx-auto grid gap-8 lg:grid-cols-[0.82fr_1.18fr] items-center">
                    <div class="relative mx-auto w-full max-w-sm">
                        <div class="rounded-[2.5rem] border border-white/70 bg-er-base/70 p-5 shadow-card">
                            <div class="aspect-[0.95] overflow-hidden rounded-[2rem] bg-gray-200">
                                <img src="${founder.photo}" alt="${founder.name}" class="h-full w-full object-cover object-top" onerror="this.src='https://via.placeholder.com/720x760?text=ER'">
                            </div>
                        </div>
                        <div class="absolute -bottom-4 left-6 rounded-2xl border border-white/70 bg-white/90 px-4 py-3 shadow-soft">
                            <p class="text-[10px] font-bold uppercase tracking-[0.22em] text-er-accent">Founder</p>
                            <p class="mt-1 text-base font-bold text-er-dark">${founder.name}</p>
                            <p class="text-xs text-gray-500">${founder.locations || 'Korea · USA'}</p>
                        </div>
                    </div>

                    <div>
                        <span class="text-[11px] font-bold uppercase tracking-[0.26em] text-er-accent">Who You Meet</span>
                        <h3 class="mt-4 text-2xl md:text-4xl font-bold text-er-dark break-keep">선택 뒤에는, 삶의 현장을 이해하는 사람이 함께합니다.</h3>
                        <p class="mt-4 text-sm md:text-base text-gray-600 leading-relaxed break-keep">
                            ${founder.bio}
                        </p>

                        <div class="mt-8 grid gap-4 md:grid-cols-2">
                            <div class="rounded-[1.75rem] border border-er-accentLight bg-er-base/55 p-5 shadow-soft">
                                <p class="text-[10px] font-bold uppercase tracking-[0.22em] text-er-accent">Specialties</p>
                                <div class="mt-3 flex flex-wrap gap-2">
                                    ${(founder.specialties || []).map((item) => `
                                        <span class="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm">${item}</span>
                                    `).join('')}
                                </div>
                            </div>
                            <div class="rounded-[1.75rem] border border-er-accentLight bg-er-base/55 p-5 shadow-soft">
                                <p class="text-[10px] font-bold uppercase tracking-[0.22em] text-er-accent">Credentials</p>
                                <div class="mt-3 flex flex-wrap gap-2">
                                    ${(founder.certs || []).slice(0, 4).map((item) => `
                                        <span class="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm">${item}</span>
                                    `).join('')}
                                </div>
                            </div>
                        </div>

                        <div class="mt-8 flex flex-wrap gap-3">
                            <button onclick="renderSection('about')" class="inline-flex items-center justify-center rounded-full border border-er-accent/30 bg-white px-5 py-3 text-sm font-bold text-er-dark transition-colors hover:border-er-accent hover:bg-er-accentLight/40">
                                ER 소개 보기
                            </button>
                            <button onclick="renderSection('coaches')" class="inline-flex items-center justify-center rounded-full border border-er-accent/30 bg-white px-5 py-3 text-sm font-bold text-er-dark transition-colors hover:border-er-accent hover:bg-er-accentLight/40">
                                코치 소개 보기
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <section class="bg-er-base px-4 sm:px-6 lg:px-8 py-16 md:py-20">
                <div class="max-w-6xl mx-auto">
                    <div class="text-center max-w-3xl mx-auto">
                        <h3 class="text-2xl md:text-4xl font-bold text-er-dark break-keep">상담 전에 필요한 내용만 먼저 확인해보세요.</h3>
                        <p class="mt-4 text-sm md:text-base text-gray-600 leading-relaxed break-keep">
                            프로그램 안내, 실제 후기, 진단 테스트, ER 소개 가운데 필요한 메뉴만 바로 보실 수 있습니다.
                        </p>
                    </div>

                    <div class="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        ${guideCards.map((card) => `
                            <div class="rounded-[2rem] border border-white/65 bg-white/80 p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
                                <span class="inline-flex rounded-full bg-er-base px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-er-accent">${card.label}</span>
                                <h4 class="mt-4 text-lg font-bold text-er-dark break-keep">${card.title}</h4>
                                <p class="mt-3 text-sm text-gray-500 leading-relaxed break-keep">${card.desc}</p>
                                <button onclick="${card.action}" class="mt-5 inline-flex items-center gap-2 text-sm font-bold text-er-dark transition-colors hover:text-er-accent">
                                    바로 보기 <i class="fas fa-arrow-right text-[11px]"></i>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </section>
        </div>
    `;
}

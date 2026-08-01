function showProgramTestimonials(filterKey) {
    const storyTagMap = {
        parenting: ['양육상담'],
        couple: ['부부관계'],
        personal: ['자기이해', '자기성찰'],
        ministry: ['선교·사역'],
        church: ['부부관계', '선교·사역'],
        leadership: ['자기성찰', '선교·사역'],
        training: ['자기이해', '자기성찰']
    };
    const stories = Array.isArray(publicTestimonials?.stories) ? publicTestimonials.stories : [];
    const allowedTags = storyTagMap[filterKey] || null;
    const filtered = allowedTags ? stories.filter(s => allowedTags.includes(s.tag)) : stories;
    const visible = filtered.length ? filtered : stories;

    const existing = document.getElementById('program-testimonials-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'program-testimonials-modal';
    modal.className = 'fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/40 backdrop-blur-sm';
    modal.innerHTML = `
        <div class="bg-white rounded-[2rem] w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl animate-fade-in-up">
            <div class="sticky top-0 bg-white rounded-t-[2rem] px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                    <span class="text-er-accent font-bold text-[10px] tracking-widest uppercase">함께한 이야기</span>
                    <h3 class="text-lg font-bold text-er-dark mt-0.5">마음에 머무는 이야기</h3>
                </div>
                <button onclick="document.getElementById('program-testimonials-modal').remove()" class="flex h-11 w-11 items-center justify-center rounded-full bg-er-base text-gray-500 transition-colors hover:bg-er-dark hover:text-white" aria-label="후기 닫기">
                    <i class="fas fa-times text-sm"></i>
                </button>
            </div>
            <div class="p-6 grid gap-4">
                ${visible.map(item => `
                    <div class="bg-er-base rounded-2xl p-5 border border-white/40">
                        <div class="flex items-center justify-between gap-3 mb-3">
                            <span class="inline-flex px-2.5 py-1 rounded-full bg-white text-er-accent text-[10px] font-bold uppercase tracking-[0.15em]">${item.tag}</span>
                            <div class="flex text-er-accent text-[10px] gap-0.5">
                                <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
                            </div>
                        </div>
                        <p class="text-gray-600 italic text-sm leading-relaxed break-keep mb-4">${item.quote}</p>
                        <div class="pt-3 border-t border-gray-200">
                            <p class="text-sm font-bold text-gray-900">${item.person}</p>
                            <p class="text-[11px] text-gray-400 uppercase tracking-[0.15em]">${item.meta}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    document.body.appendChild(modal);
}

function renderBusinessHandoff(destination = 'programs') {
    const isContact = destination === 'contact';
    const businessHref = isContact
        ? 'https://business.er-coaching.com/contact'
        : 'https://business.er-coaching.com/programs';
    const businessLabel = isContact ? 'ER Business에 문의하기' : 'ER Business 프로그램 보기';

    return `
        <div class="min-h-screen bg-er-base px-4 py-20">
            <section class="mx-auto max-w-3xl rounded-[2.5rem] border border-er-sand/60 bg-er-surface p-8 text-center shadow-soft md:p-12">
                <span class="inline-flex rounded-full bg-er-greenTint px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-er-green">ER Business</span>
                <h2 class="mt-5 text-2xl font-bold text-er-ink md:text-4xl break-keep">기업·팀 서비스는 독립된<br class="hidden sm:block"> ER Business에서 안내합니다.</h2>
                <p class="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-er-body md:text-base break-keep">
                    기업교육, 팀 워크숍과 조직 컨설팅은 Business 전용 사이트로 통합되었습니다. 이곳 ER Coaching은 개인·가정과 교회·사역 공동체의 회복에 집중합니다.
                </p>
                <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                    <a href="${businessHref}" class="inline-flex min-h-12 items-center justify-center rounded-full bg-er-green px-7 py-3 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-er-greenDark">
                        ${businessLabel} <span class="ml-2" aria-hidden="true">↗</span>
                    </a>
                    <button type="button" onclick="renderSection('programs', { tab: 'church' })" class="inline-flex min-h-12 items-center justify-center rounded-full border border-er-sand bg-white px-7 py-3 text-sm font-bold text-er-ink transition-colors hover:border-er-green hover:text-er-green">
                        교회·사역 프로그램 보기
                    </button>
                </div>
            </section>
        </div>
    `;
}

function openProgramApply() {
    const isChurchProgram = state.programFilter === 'church';
    renderSection('apply', isChurchProgram
        ? { track: 'org', focus: 'church' }
        : { track: 'paid' });
}

function updateProgramView(filterType) {
    if (filterType !== 'individual' && filterType !== 'church') {
        filterType = 'individual';
    }
    state.programFilter = filterType;

    document.querySelectorAll('[id^="tab-"]').forEach(btn => {
        const isActive = btn.id === `tab-${filterType}`;
        btn.className = isActive
            ? "inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-full px-5 text-xs font-bold transition-all duration-300 md:text-sm bg-white text-er-dark shadow-md scale-105"
            : "inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-full px-5 text-xs font-bold transition-all duration-300 md:text-sm bg-white/10 text-gray-300 hover:bg-white/20";
    });

    const introEl = document.getElementById('program-intro');
    const problemCardsEl = document.getElementById('program-problem-cards');
    const cardsEl = document.getElementById('program-cards');
    const primaryCtaEl = document.getElementById('program-primary-cta');

    const data = {
        individual: {
            title: '관계·부부 코칭',
            desc: '',
            problems: [
                { t: '우리 부부가 달라졌어요', d: '부부의 차이와 충돌 지점을 구조적으로 해석해, 반복되는 갈등을 대화 가능한 관계로 전환합니다.', i: 'fas fa-heart', f: 'couple' },
                { t: '하나님이 창조하신 나의 모습 회복하기', d: '나의 original design, 강점, 거짓말, 취약점을 함께 짚어보고, 삶과 관계 안에서 은사와 소명을 발견하며, 서로 다른 유형의 사람들을 이해하고 소통하는 코칭을 진행합니다.', i: 'fas fa-compass', f: 'personal' },
                { t: '아이와의 갈등이 반복돼요', d: '아이와 부모의 기질·반응 차이, 반복되는 양육 갈등은 Parenting 여정에서 더 깊이 다룹니다.', i: 'fas fa-child-reaching', to: 'parenting' }
            ],
            cards: [
                { b: 'Step 1', t: '결과지 해석상담', d: '1시간 결과지 해석\n핵심 유형 + 하위유형 + 날개 + 신뢰도 + 헷갈리는 유형 정리', p: '$50', o: '혼자 읽고 끝내지 않고 실제 삶의 장면과 연결', i: 'fas fa-file-signature', applyFocus: 'result_consult' },
                { b: 'Step 2', t: '개별 코칭 (1회 세션)', d: '60분 실전 코칭\n관계·감정의 막힌 지점을 뚫어내는 적용 코칭', p: '$80 / 1회', o: '실제 관계 장면에서 반응 패턴 교정과 실행 계획 수립', i: 'fas fa-route' },
                { b: 'Step 3', t: '회복 코칭 프로그램', d: (typeof window !== 'undefined' && window.ERProgramCatalog) ? window.ERProgramCatalog.getRecoveryPackageCopy() : '4회 패키지: $300 (회당 $75)\n8회 패키지: $480 (회당 $60 · 가장 많이 선택)', p: '8회 $480 · 가장 많이 선택', o: '감정·관계·실행 루틴까지 이어지는 지속적 변화 정착', i: 'fas fa-layer-group', featured: true, applyFocus: 'recovery_journey_8' }
            ]
        },
        church: {
            title: '교회·사역팀 프로그램',
            desc: '교회·선교단체·사역팀의 공동체 회복을 돕습니다. 목회자·선교사 개인은 지원 원칙에 따라 별도 안내해 드립니다.',
            problems: [
                { t: '공동체 갈등 회복', d: '서로 다른 동기와 소통 방식을 이해하고, 오해와 갈등을 복음 안에서 다룰 수 있는 공통 언어를 세웁니다.', i: 'fas fa-people-group', f: 'church' },
                { t: '사역자 소진 돌봄', d: '정서적 소진과 관계 피로를 살피고, 회복의 리듬과 건강한 역할 분담을 함께 정리합니다.', i: 'fas fa-hand-holding-heart', f: 'ministry' },
                { t: '사역 리더십과 동역 정렬', d: '리더와 사역팀의 의사결정·소통 패턴을 점검하고, 은사와 역할을 존중하는 동역의 흐름을 설계합니다.', i: 'fas fa-comments', f: 'leadership' }
            ],
            cards: [
                { b: '워크숍', t: '기본 워크숍 (2시간)', d: '유형 이해 + 관계 패턴 진단 + 적용 가이드', p: '$500부터', o: '결과: 공동체 갈등을 다루는 공통 언어 정리', i: 'fas fa-chalkboard-teacher', applyFocus: 'church' },
                { b: '집중', t: '집중 워크숍 (6시간)', d: '사역팀·리더 분석 + 갈등 구조 해석 + 적용 설계', p: '$1,800부터', o: '결과: 교회 리더와 사역팀의 소통·의사결정 원칙 정리', i: 'fas fa-users-cog', applyFocus: 'church' },
                { b: '후속', t: '리더 디브리핑 패키지', d: '리더 디브리핑 + 소그룹 가이드 + 4주 후속 코호트', p: '맞춤 견적', o: '결과: 워크숍 이후 현장 적용이 끊기지 않게 유지', i: 'fas fa-file-signature', applyFocus: 'church' }
            ]
        }
    };

    const selected = data[filterType];
    if (!selected || !selected.cards) return;

    if (primaryCtaEl) {
        primaryCtaEl.textContent = filterType === 'church'
            ? '교회·사역팀 프로그램 문의'
            : '상담 신청';
    }

    if (introEl) {
        const ministryNotice = filterType === 'church'
            ? `<div class="mt-3 flex flex-col sm:flex-row items-center justify-center gap-2 text-xs">
                    <span class="text-gray-500 break-keep">목회자·선교사 본인은 무료/감면 사역지원 트랙으로 안내드립니다.</span>
                    <button onclick="renderSection('support')" class="inline-flex min-h-11 items-center font-bold text-er-accent transition-colors hover:text-er-dark whitespace-nowrap">
                        사역지원 보기 <i class="fas fa-arrow-right text-[10px]"></i>
                    </button>
                </div>`
            : '';
        introEl.innerHTML = `
            <h3 class="text-lg font-bold text-er-dark mb-1">${selected.title}</h3>
            ${selected.desc ? `<p class="text-xs text-gray-500 break-keep">${selected.desc}</p>` : ''}
            ${ministryNotice}
        `;
    }

    if (problemCardsEl) {
        problemCardsEl.innerHTML = (selected.problems || []).map(p => `
            <div class="bg-er-surface rounded-2xl p-5 border border-er-sand/60 shadow-soft floating-card">
                <div class="w-10 h-10 rounded-xl bg-er-base text-er-accent flex items-center justify-center mb-3">
                    <i class="${p.i}"></i>
                </div>
                <h4 class="text-sm md:text-base font-bold text-er-dark mb-2 break-keep">${p.t}</h4>
                <p class="text-xs text-gray-600 leading-relaxed break-keep">${p.d}</p>
                ${p.to
                    ? `<button onclick="renderSection('${p.to}')" class="mt-2 inline-flex min-h-11 items-center gap-1 text-xs font-bold text-er-accent transition-colors hover:text-er-dark">Parenting에서 자세히 보기 <i class="fas fa-arrow-right text-[10px]"></i></button>`
                    : `<button onclick="showProgramTestimonials('${p.f || ''}')" class="mt-2 inline-flex min-h-11 items-center gap-1 text-xs font-bold text-er-accent transition-colors hover:text-er-dark">후기 보기 <i class="fas fa-comment-dots text-[10px]"></i></button>`}
            </div>
        `).join('');
    }

    if (cardsEl) {
        cardsEl.innerHTML = selected.cards.map(c => `
            <div class="bg-er-surface rounded-2xl p-6 border ${c.featured ? 'border-er-green shadow-card ring-1 ring-er-green/30' : 'border-er-sand/60 shadow-sm'} hover:shadow-card transition-all group flex flex-col h-full relative">
                ${c.featured ? `<span class="absolute -top-3 right-4 px-3 py-1 rounded-full bg-er-accent text-white text-[10px] font-bold tracking-wide">가장 많이 선택</span>` : ''}
                <div class="flex items-center justify-between mb-4">
                    <span class="px-2.5 py-1 rounded-full bg-er-base text-er-accent text-[10px] font-bold uppercase tracking-wider">${c.b}</span>
                    <div class="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-er-dark group-hover:text-white transition-colors text-sm">
                        <i class="${c.i}"></i>
                    </div>
                </div>
                <h4 class="text-base font-bold text-gray-900 mb-2">${c.t}</h4>
                <p class="text-gray-500 text-xs leading-relaxed mb-4 flex-grow break-keep whitespace-pre-line">${c.d}</p>
                <p class="text-sm font-extrabold text-er-dark mb-5">${c.p || ''}</p>
                <p class="text-[11px] text-gray-500 mb-5 break-keep"><span class="font-bold text-er-dark">기대 효과:</span> ${c.o || ''}</p>
                <button onclick="renderSection('apply', { track: '${filterType === 'church' ? 'org' : 'paid'}'${c.applyFocus ? `, focus: '${c.applyFocus}', source: 'programs'` : ''} })" class="min-h-11 w-full rounded-xl px-4 ${c.featured ? 'bg-er-accent text-white border border-transparent shadow-md hover:bg-er-accentDark hover:-translate-y-0.5' : 'border border-gray-200 text-gray-600 hover:bg-er-dark hover:text-white hover:border-transparent'} font-bold text-xs transition-all">
                    신청/문의
                </button>
            </div>
        `).join('');
    }
}

function renderPrograms() {
    if (state.currentPayload?.tab === 'business' || state.programFilter === 'business') {
        return renderBusinessHandoff();
    }

    return `
        <div class="bg-er-base min-h-screen">
            <div class="bg-er-dark text-white py-16 px-6 relative overflow-hidden rounded-b-[3rem]">
                <div class="absolute inset-0 bg-pattern opacity-5 pointer-events-none"></div>
                <div class="relative z-10 max-w-7xl mx-auto text-center">
                    <h2 class="text-2xl md:text-4xl font-bold mb-3">코칭·프로그램 안내</h2>
                    <p class="text-gray-300 text-sm md:text-base max-w-xl mx-auto break-keep">관계·부부 코칭과 교회·사역팀 프로그램을 통해 개인의 회복이 가정과 공동체로 이어지도록 돕습니다. 자녀 양육은 Parenting 메뉴에서 따로 안내합니다.</p>
                    
                    <div class="mt-8 flex justify-start md:justify-center gap-2 overflow-x-auto pb-2 -mx-6 px-6 md:mx-0 md:px-0 scrollbar-hide">
                        ${['individual:관계·부부', 'church:교회·사역팀'].map(item => {
                            const [key, label] = item.split(':');
                            const isActive = state.programFilter === key;
                            return `<button onclick="updateProgramView('${key}')" id="tab-${key}" 
                                class="inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-full px-5 text-xs font-bold transition-all duration-300 md:text-sm ${isActive ? 'bg-white text-er-dark shadow-md scale-105' : 'bg-white/10 text-gray-300 hover:bg-white/20'}">
                                ${label}
                            </button>`
                        }).join('')}
                    </div>
                </div>
            </div>

            <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 pb-20">
                <div id="program-intro" class="mb-6 text-center bg-er-surface rounded-2xl p-6 shadow-soft max-w-2xl mx-auto border border-er-sand/60 animate-fade-in-up floating-card">
                    </div>

                <div class="mb-4 text-center">
                    <h3 class="text-lg md:text-xl font-bold text-er-dark">이런 문제를 함께 다룹니다</h3>
                    <p class="mt-1 text-xs text-gray-500 break-keep">내 상황에 맞는 구체적인 주제로 코칭/프로그램을 선택할 수 있습니다.</p>
                </div>
                <div id="program-problem-cards" class="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                </div>
                
                <div id="program-cards" class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    </div>

                <div class="mt-20">
                    <div class="text-center mb-10">
                        <span class="text-er-accent font-bold text-xs tracking-widest uppercase">Process</span>
                        <h3 class="text-xl md:text-2xl font-bold text-er-dark mt-2">진행 과정</h3>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 max-w-4xl mx-auto">
                        <div class="bg-er-surface p-6 md:p-8 rounded-3xl text-center shadow-soft relative group floating-card border border-er-sand/50">
                            <div class="absolute top-1/2 -right-4 hidden md:block text-gray-200 z-10"><i class="fas fa-chevron-right text-xl"></i></div>
                            <div class="w-12 h-12 bg-er-base text-er-accent rounded-2xl flex items-center justify-center text-xl mx-auto mb-4 group-hover:scale-110 transition-transform"><i class="far fa-file-alt"></i></div>
                            <h4 class="font-bold text-base mb-1">1. 신청서 작성</h4>
                            <p class="text-xs text-gray-500 break-keep">현재 상황과 니즈를 파악합니다.</p>
                        </div>
                        <div class="bg-er-surface p-6 md:p-8 rounded-3xl text-center shadow-soft relative group floating-card border border-er-sand/50">
                            <div class="absolute top-1/2 -right-4 hidden md:block text-gray-200 z-10"><i class="fas fa-chevron-right text-xl"></i></div>
                            <div class="w-12 h-12 bg-er-base text-er-accent rounded-2xl flex items-center justify-center text-xl mx-auto mb-4 group-hover:scale-110 transition-transform"><i class="far fa-comments"></i></div>
                            <h4 class="font-bold text-base mb-1">2. 사전 인터뷰</h4>
                            <p class="text-xs text-gray-500 break-keep">코치와 상담을 통해 방향을 설정합니다.</p>
                        </div>
                        <div class="bg-er-surface p-6 md:p-8 rounded-3xl text-center shadow-soft group floating-card border border-er-sand/50">
                            <div class="w-12 h-12 bg-er-base text-er-accent rounded-2xl flex items-center justify-center text-xl mx-auto mb-4 group-hover:scale-110 transition-transform"><i class="fas fa-chalkboard-teacher"></i></div>
                            <h4 class="font-bold text-base mb-1">3. 코칭/강의</h4>
                            <p class="text-xs text-gray-500 break-keep">맞춤형 커리큘럼으로 진행됩니다.</p>
                        </div>
                    </div>
                    <div class="text-center mt-10">
                        <button id="program-primary-cta" onclick="openProgramApply()" class="bg-er-dark text-white px-8 py-3.5 rounded-full font-bold shadow-soft hover:bg-gray-800 hover:-translate-y-0.5 transition-all text-sm w-full sm:w-auto">
                            ${state.programFilter === 'church' ? '교회·사역팀 프로그램 문의' : '상담 신청'}
                        </button>
                    </div>
                </div>

                <aside class="mt-12 rounded-[2rem] border border-er-sand/60 bg-er-greenTint/40 p-6 text-center shadow-soft md:p-8">
                    <h3 class="text-lg font-bold text-er-ink">기업·팀 교육을 찾고 계신가요?</h3>
                    <p class="mx-auto mt-2 max-w-2xl text-sm text-er-body break-keep">일반 기업교육과 조직 컨설팅은 독립된 ER Business에서 안내합니다.</p>
                    <a href="https://business.er-coaching.com/programs" class="mt-5 inline-flex min-h-11 items-center justify-center rounded-full border border-er-green/30 bg-white px-6 py-3 text-sm font-bold text-er-green transition-colors hover:border-er-green hover:bg-er-surface">
                        ER Business 프로그램 보기 <span class="ml-2" aria-hidden="true">↗</span>
                    </a>
                </aside>

                <div class="mt-16 rounded-[2rem] bg-er-surface border border-er-sand/60 p-6 md:p-8 shadow-soft animate-fade-in-up">
                    <div class="flex items-center justify-between gap-3 mb-4">
                        <h3 class="text-lg font-bold text-er-dark">가격 및 진행 정책</h3>
                        <span class="text-[11px] text-gray-400">USD 기준 안내</span>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        ${[
                            ['USD 기준', '모든 서비스 가격은 USD 기준으로 안내됩니다. 국가별 결제 수단과 환율에 따라 최종 청구 금액이 달라질 수 있습니다.', null],
                            ['사역지원 트랙', '목회자·선교사 대상 무료/감면 원칙은 유지됩니다. 사역지원은 별도 심사 후 배정됩니다.', { label: '사역지원 보기', section: 'support' }],
                            ['패키지 우선', '단회보다 4회/8회 패키지 전환율이 높고 변화 유지에 유리합니다. 초기 상담 후 최적 트랙을 제안합니다.', null]
                        ].map(([title, desc, link]) => `
                            <div class="rounded-2xl border border-er-sand/50 bg-er-base/60 p-5">
                                <h4 class="text-sm font-bold text-er-dark">${title}</h4>
                                <p class="mt-2 text-xs text-gray-500 break-keep">${desc}</p>
                                ${link ? `<button onclick="renderSection('${link.section}')" class="mt-2 inline-flex min-h-11 items-center gap-1 text-xs font-bold text-er-accent transition-colors hover:text-er-dark">${link.label} <i class="fas fa-arrow-right text-[10px]"></i></button>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="mt-16 rounded-[2rem] bg-er-surface border border-er-sand/60 p-6 md:p-8 shadow-soft animate-fade-in-up">
                    <div class="flex items-center justify-between gap-3 mb-4">
                        <h3 class="text-lg font-bold text-er-dark">프로그램 자료</h3>
                        <span class="text-[11px] text-gray-400">Teaching Materials</span>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        ${[
                            ['워크북 자료', '개인/그룹 진행 시 바로 활용할 수 있는 실습 시트와 안내 자료'],
                            ['강의 슬라이드', '교회·선교단체 대상 프로그램에 사용하는 핵심 강의 자료 모음'],
                            ['진행 가이드', '회기별 운영 순서와 질문 프롬프트를 담은 코치용 가이드']
                        ].map(([title, desc]) => `
                            <div class="rounded-2xl border border-er-sand/50 bg-er-base/60 p-5">
                                <h4 class="text-sm font-bold text-er-dark">${title}</h4>
                                <p class="mt-2 text-xs text-gray-500 break-keep">${desc}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

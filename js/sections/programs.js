function showProgramTestimonials(filterKey) {
    const storyTagMap = {
        parenting: ['양육상담'],
        couple: ['부부관계'],
        personal: ['자기이해', '자기성찰'],
        ministry: ['선교·사역'],
        church: ['부부관계', '선교·사역'],
        team: ['자기성찰', '자기이해'],
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
                <button onclick="document.getElementById('program-testimonials-modal').remove()" class="w-9 h-9 rounded-full bg-er-base flex items-center justify-center text-gray-500 hover:bg-er-dark hover:text-white transition-colors">
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

function updateProgramView(filterType) {
    state.programFilter = filterType;

    document.querySelectorAll('[id^="tab-"]').forEach(btn => {
        const isActive = btn.id === `tab-${filterType}`;
        btn.className = isActive
            ? "whitespace-nowrap px-5 py-2.5 rounded-full text-xs md:text-sm font-bold transition-all duration-300 bg-white text-er-dark shadow-md scale-105"
            : "whitespace-nowrap px-5 py-2.5 rounded-full text-xs md:text-sm font-bold transition-all duration-300 bg-white/10 text-gray-300 hover:bg-white/20";
    });

    const introEl = document.getElementById('program-intro');
    const problemCardsEl = document.getElementById('program-problem-cards');
    const cardsEl = document.getElementById('program-cards');

    const data = {
        individual: {
            title: '개인/가정 코칭',
            desc: '',
            problems: [
                { t: '우리 아이가 달라졌어요', d: '아이와 부모의 서로 다른 기질·반응 패턴을 분석하고, 갈등을 줄이는 맞춤 양육 코칭을 제공합니다.', i: 'fas fa-child-reaching', f: 'parenting' },
                { t: '우리 부부가 달라졌어요', d: '부부의 차이와 충돌 지점을 구조적으로 해석해, 반복되는 갈등을 대화 가능한 관계로 전환합니다.', i: 'fas fa-heart', f: 'couple' },
                { t: '하나님이 창조하신 나의 모습 회복하기', d: '나의 original design, 강점, 거짓말, 취약점을 함께 짚어보고, 직장·사회관계에서 강점에 맞는 일을 찾으며, 관계에서 잘 맞거나 맞지 않을 수 있는 유형의 사람들을 이해하고 소통하는 코칭을 진행합니다.', i: 'fas fa-compass', f: 'personal' }
            ],
            cards: [
                { b: 'Step 1', t: '유형(Typing) 상담', d: '90분 심층 세션\n사전 설문 + 인터뷰 기반 타이핑 + 핵심 동기/방어패턴 진단', p: '$100', o: '반복되는 삶의 패턴과 무의식적 방어기제 구조화', i: 'fas fa-fingerprint' },
                { b: 'Step 2', t: '개별 코칭 (1회 세션)', d: '60분 실전 코칭\n관계·감정의 막힌 지점을 뚫어내는 적용 코칭', p: '$80 / 1회', o: '실제 관계 장면에서 반응 패턴 교정과 실행 계획 수립', i: 'fas fa-route' },
                { b: 'Step 3', t: '회복 코칭 프로그램', d: (typeof window !== 'undefined' && window.ERProgramCatalog) ? window.ERProgramCatalog.getRecoveryPackageCopy() : '4회 패키지: $300 (회당 $75)\n8회 패키지: $480 (회당 $60 · 가장 많이 선택)', p: '8회 $480 · 가장 많이 선택', o: '감정·관계·실행 루틴까지 이어지는 지속적 변화 정착', i: 'fas fa-layer-group', featured: true, applyFocus: 'recovery_journey_8' }
            ]
        },
        church: {
            title: '기관/교회 프로그램',
            desc: '목회자·선교사 개인은 지원 원칙에 따라 별도 안내해 드리며, 기관 프로그램은 규모와 목적에 맞춰 맞춤 제안으로 진행합니다.',
            problems: [
                { t: '공동체 갈등 회복', d: '리더와 구성원 사이의 반복 갈등을 공통 언어로 정리하고, 실제 적용안을 함께 설계합니다.', i: 'fas fa-people-group', f: 'church' },
                { t: '사역자 소진 돌봄', d: '정서적 소진과 관계 피로를 다루며, 회복 루틴과 팀 내 건강한 역할 분담을 코칭합니다.', i: 'fas fa-hand-holding-heart', f: 'ministry' },
                { t: '리더십 소통 재정렬', d: '의사결정과 소통 방식의 충돌 지점을 점검해, 팀 운영 흐름이 끊기지 않도록 돕습니다.', i: 'fas fa-comments', f: 'leadership' }
            ],
            cards: [
                { b: '워크숍', t: '기본 워크숍 (2시간)', d: '유형 이해 + 관계 패턴 진단 + 적용 가이드', p: '$500부터', o: '결과: 공동체 갈등 언어를 공통 프레임으로 정렬', i: 'fas fa-chalkboard-teacher' },
                { b: '집중', t: '집중 워크숍 (6시간)', d: '팀/리더 분석 + 갈등 구조 해석 + 적용 설계', p: '$1,800부터', o: '결과: 리더십 팀의 소통/의사결정 규칙 재설계', i: 'fas fa-users-cog' },
                { b: '후속', t: '리더 디브리핑 패키지', d: '리더 디브리핑 + 소그룹 가이드 + 4주 후속 코호트', p: '맞춤 견적', o: '결과: 워크숍 이후 현장 적용이 끊기지 않게 유지', i: 'fas fa-file-signature' }
            ]
        },
        business: {
            title: '기업/팀 프로그램',
            desc: '성격 설명이 아니라 팀 커뮤니케이션, 갈등 비용, 협업 효율을 개선하는 운영 언어로 설계합니다.',
            problems: [
                { t: '팀 소통 충돌 해결', d: '업무 스타일 차이로 생기는 오해를 줄이고, 협업 속도를 높이는 소통 규칙을 설계합니다.', i: 'fas fa-users', f: 'team' },
                { t: '리더십 의사결정 정렬', d: '리더-팀 간 피드백 단절을 줄이고 의사결정 흐름이 막히지 않도록 구조를 재정비합니다.', i: 'fas fa-diagram-project', f: 'leadership' },
                { t: '배치·역할 적합성 개선', d: '강점과 동기 기반으로 역할을 조정해, 사람-업무 미스매치로 인한 비용을 줄입니다.', i: 'fas fa-briefcase', f: 'team' }
            ],
            cards: [
                { b: '팀', t: '인지 다양성 워크숍', d: '역할 적합성·소통 패턴·갈등 비용 진단', p: '$2,000–$5,000', o: '결과: 팀 충돌 원인을 가시화해 실행 합의 도출', i: 'fas fa-sitemap' },
                { b: '인사', t: '채용·배치 자문', d: '유형 기반 역할 매칭 + 팀 구조 제안', p: '맞춤 견적', o: '결과: 채용/배치 미스매치로 인한 비용 감소', i: 'fas fa-briefcase' },
                { b: '자문', t: '리더십 커뮤니케이션 스프린트', d: '리더십 커뮤니케이션 프레임 재설계', p: '$5,000부터', o: '결과: 리더-팀 간 피드백/협업 속도 향상', i: 'fas fa-chart-line' }
            ]
        }
    };

    const selected = data[filterType];
    if (!selected || !selected.cards) return;

    if (introEl) {
        const ministryNotice = filterType === 'church'
            ? `<div class="mt-3 flex flex-col sm:flex-row items-center justify-center gap-2 text-xs">
                    <span class="text-gray-500 break-keep">목회자·선교사 본인은 무료/감면 사역지원 트랙으로 안내드립니다.</span>
                    <button onclick="renderSection('support')" class="font-bold text-er-accent hover:text-er-dark transition-colors whitespace-nowrap">
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
            <div class="bg-white rounded-2xl p-5 border border-white/40 shadow-soft floating-card">
                <div class="w-10 h-10 rounded-xl bg-er-base text-er-accent flex items-center justify-center mb-3">
                    <i class="${p.i}"></i>
                </div>
                <h4 class="text-sm md:text-base font-bold text-er-dark mb-2 break-keep">${p.t}</h4>
                <p class="text-xs text-gray-600 leading-relaxed break-keep">${p.d}</p>
                <button onclick="showProgramTestimonials('${p.f || ''}')" class="mt-3 text-xs font-bold text-er-accent hover:text-er-dark transition-colors">
                    후기 보기 <i class="fas fa-comment-dots text-[10px]"></i>
                </button>
            </div>
        `).join('');
    }

    if (cardsEl) {
        cardsEl.innerHTML = selected.cards.map(c => `
            <div class="bg-white rounded-2xl p-6 border ${c.featured ? 'border-er-accent shadow-card ring-1 ring-er-accent/30' : 'border-gray-100 shadow-sm'} hover:shadow-card transition-all group flex flex-col h-full relative">
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
                <button onclick="renderSection('apply', { track: '${filterType === 'church' ? 'org' : 'paid'}'${c.applyFocus ? `, focus: '${c.applyFocus}', source: 'programs'` : ''} })" class="w-full py-2.5 rounded-xl ${c.featured ? 'bg-er-accent text-white border border-transparent shadow-md hover:bg-er-accentDark hover:-translate-y-0.5' : 'border border-gray-200 text-gray-600 hover:bg-er-dark hover:text-white hover:border-transparent'} font-bold text-xs transition-all">
                    신청/문의
                </button>
            </div>
        `).join('');
    }
}

function renderPrograms() {
    return `
        <div class="bg-er-base min-h-screen">
            <div class="bg-er-dark text-white py-16 px-6 relative overflow-hidden rounded-b-[3rem]">
                <div class="absolute inset-0 bg-pattern opacity-5 pointer-events-none"></div>
                <div class="relative z-10 max-w-7xl mx-auto text-center">
                    <h2 class="text-2xl md:text-4xl font-bold mb-3">서비스 안내</h2>
                    <p class="text-gray-300 text-sm md:text-base max-w-xl mx-auto break-keep">개인·가정 코칭부터 기관·교회·기업/팀 프로그램까지, 지금 필요한 회복 여정을 안내합니다.</p>
                    
                    <div class="mt-8 flex justify-start md:justify-center gap-2 overflow-x-auto pb-2 -mx-6 px-6 md:mx-0 md:px-0 scrollbar-hide">
                        ${['individual:개인/가정', 'church:기관/교회', 'business:기업/팀'].map(item => {
                            const [key, label] = item.split(':');
                            const isActive = state.programFilter === key;
                            return `<button onclick="updateProgramView('${key}')" id="tab-${key}" 
                                class="whitespace-nowrap px-5 py-2.5 rounded-full text-xs md:text-sm font-bold transition-all duration-300 ${isActive ? 'bg-white text-er-dark shadow-md scale-105' : 'bg-white/10 text-gray-300 hover:bg-white/20'}">
                                ${label}
                            </button>`
                        }).join('')}
                    </div>
                </div>
            </div>

            <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 pb-20">
                <div id="program-intro" class="mb-6 text-center bg-white rounded-2xl p-6 shadow-soft max-w-2xl mx-auto border border-white/40 animate-fade-in-up floating-card">
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
                        <div class="bg-white p-6 md:p-8 rounded-3xl text-center shadow-soft relative group floating-card">
                            <div class="absolute top-1/2 -right-4 hidden md:block text-gray-200 z-10"><i class="fas fa-chevron-right text-xl"></i></div>
                            <div class="w-12 h-12 bg-er-base text-er-accent rounded-2xl flex items-center justify-center text-xl mx-auto mb-4 group-hover:scale-110 transition-transform"><i class="far fa-file-alt"></i></div>
                            <h4 class="font-bold text-base mb-1">1. 신청서 작성</h4>
                            <p class="text-xs text-gray-500 break-keep">현재 상황과 니즈를 파악합니다.</p>
                        </div>
                        <div class="bg-white p-6 md:p-8 rounded-3xl text-center shadow-soft relative group floating-card">
                            <div class="absolute top-1/2 -right-4 hidden md:block text-gray-200 z-10"><i class="fas fa-chevron-right text-xl"></i></div>
                            <div class="w-12 h-12 bg-er-base text-er-accent rounded-2xl flex items-center justify-center text-xl mx-auto mb-4 group-hover:scale-110 transition-transform"><i class="far fa-comments"></i></div>
                            <h4 class="font-bold text-base mb-1">2. 사전 인터뷰</h4>
                            <p class="text-xs text-gray-500 break-keep">코치와 상담을 통해 방향을 설정합니다.</p>
                        </div>
                        <div class="bg-white p-6 md:p-8 rounded-3xl text-center shadow-soft group floating-card">
                            <div class="w-12 h-12 bg-er-base text-er-accent rounded-2xl flex items-center justify-center text-xl mx-auto mb-4 group-hover:scale-110 transition-transform"><i class="fas fa-chalkboard-teacher"></i></div>
                            <h4 class="font-bold text-base mb-1">3. 코칭/강의</h4>
                            <p class="text-xs text-gray-500 break-keep">맞춤형 커리큘럼으로 진행됩니다.</p>
                        </div>
                    </div>
                    <div class="text-center mt-10">
                        <button onclick="renderSection('apply', { track: 'paid' })" class="bg-er-dark text-white px-8 py-3.5 rounded-full font-bold shadow-soft hover:bg-gray-800 hover:-translate-y-0.5 transition-all text-sm w-full sm:w-auto">
                            상담 신청
                        </button>
                    </div>
                </div>

                <div class="mt-16 rounded-[2rem] bg-white border border-white/40 p-6 md:p-8 shadow-soft animate-fade-in-up">
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
                            <div class="rounded-2xl border border-gray-100 bg-er-base/50 p-5">
                                <h4 class="text-sm font-bold text-er-dark">${title}</h4>
                                <p class="mt-2 text-xs text-gray-500 break-keep">${desc}</p>
                                ${link ? `<button onclick="renderSection('${link.section}')" class="mt-3 text-xs font-bold text-er-accent hover:text-er-dark transition-colors">${link.label} <i class="fas fa-arrow-right text-[10px]"></i></button>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="mt-16 rounded-[2rem] bg-white border border-white/40 p-6 md:p-8 shadow-soft animate-fade-in-up">
                    <div class="flex items-center justify-between gap-3 mb-4">
                        <h3 class="text-lg font-bold text-er-dark">프로그램 자료</h3>
                        <span class="text-[11px] text-gray-400">Teaching Materials</span>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        ${[
                            ['워크북 자료', '개인/그룹 진행 시 바로 활용할 수 있는 실습 시트와 안내 자료'],
                            ['강의 슬라이드', '교회·기관 대상 프로그램에 사용하는 핵심 강의 자료 모음'],
                            ['진행 가이드', '회기별 운영 순서와 질문 프롬프트를 담은 코치용 가이드']
                        ].map(([title, desc]) => `
                            <div class="rounded-2xl border border-gray-100 bg-er-base/50 p-5">
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

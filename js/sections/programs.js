// ER Section: Programs + updateProgramView
function renderPrograms() {
    return `
        <div class="bg-[#FAF9F7] min-h-screen">
            <div class="bg-gray-900 text-white py-20 px-6 relative overflow-hidden rounded-b-[3rem]">
                <div class="absolute inset-0 bg-pattern opacity-10 pointer-events-none"></div>
                <div class="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[80px] z-0 pointer-events-none"></div>

                <div class="relative z-10 max-w-7xl mx-auto text-center">
                    <span class="text-gray-400 font-bold text-[10px] tracking-[0.3em] uppercase block mb-4">Programs</span>
                    <h2 class="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">서비스 안내</h2>
                    <p class="text-gray-400 text-base md:text-lg max-w-xl mx-auto break-keep font-light">개인·가정 코칭부터 기관·기업 프로그램까지,<br class="hidden sm:block">지금 필요한 회복 여정을 안내합니다.</p>
                    
                    <div class="mt-12 flex justify-start md:justify-center gap-3 overflow-x-auto pb-4 -mx-6 px-6 md:mx-0 md:px-0 scrollbar-hide">
                        ${['individual:개인/가정', 'church:기관/교회', 'business:기업/팀'].map(item => {
                            const [key, label] = item.split(':');
                            const isActive = state.programFilter === key;
                            return `<button onclick="updateProgramView('${key}')" id="tab-${key}" 
                                class="whitespace-nowrap px-6 py-3 rounded-full text-xs md:text-sm font-bold transition-all duration-300 ${isActive ? 'bg-white text-gray-900 shadow-lg scale-105' : 'bg-white/10 border border-white/20 text-gray-300 hover:bg-white/20'}">
                                ${label}
                            </button>`
                        }).join('')}
                    </div>
                </div>
            </div>

            <div class="max-w-[1000px] mx-auto px-5 sm:px-6 lg:px-8 -mt-8 relative z-20 pb-24">
                <div id="program-intro" class="mb-10 text-center bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 shadow-sm max-w-3xl mx-auto border border-white animate-fade-in-up">
                </div>

                <div class="mb-6 text-center">
                    <h3 class="text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight">이런 문제를 다룹니다</h3>
                    <p class="mt-2 text-sm text-gray-500 break-keep font-light">내 상황에 맞는 구체적인 주제로 코칭을 선택할 수 있습니다.</p>
                </div>
                <div id="program-problem-cards" class="mb-12 grid grid-cols-1 md:grid-cols-3 gap-5">
                </div>
                
                <div id="program-cards" class="grid grid-cols-1 md:grid-cols-3 gap-6">
                </div>

                <div class="mt-24">
                    <div class="text-center mb-12">
                        <span class="text-gray-400 font-bold text-[10px] tracking-[0.3em] uppercase block mb-3">Process</span>
                        <h3 class="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">진행 과정</h3>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto relative">
                        <div class="hidden md:block absolute top-[40%] left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent z-0"></div>
                        ${[
                            {n: '1', t: '신청서 작성', d: '현재 상황과 니즈를 파악합니다.', i: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>'},
                            {n: '2', t: '사전 인터뷰', d: '코치와 방향을 섬세하게 설정합니다.', i: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>'},
                            {n: '3', t: '코칭 및 피드백', d: '맞춤형 커리큘럼으로 진행됩니다.', i: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>'}
                        ].map(step => `
                            <div class="bg-white p-8 rounded-[2rem] text-center shadow-sm border border-gray-100 relative group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg z-10 block">
                                <div class="w-14 h-14 bg-gray-50 text-gray-900 border border-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-gray-900 group-hover:text-white transition-colors duration-300 shadow-sm">${step.i}</div>
                                <span class="bg-gray-100 text-gray-500 font-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-widest mb-3 inline-block">Step ${step.n}</span>
                                <h4 class="font-bold text-lg text-gray-900 mb-2">${step.t}</h4>
                                <p class="text-sm text-gray-500 break-keep font-light">${step.d}</p>
                            </div>
                        `).join('')}
                    </div>
                    <div class="text-center mt-12">
                        <button onclick="renderSection('apply', { track: 'paid' })" class="bg-gray-900 text-white px-10 py-4 rounded-full font-bold shadow-md hover:shadow-xl hover:bg-gray-800 hover:-translate-y-1 transition-all text-sm flex items-center gap-2 mx-auto">
                            상담 신청 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                        </button>
                    </div>
                </div>

                <div class="mt-24 rounded-[2.5rem] bg-white border border-gray-100 p-8 md:p-10 shadow-sm">
                    <div class="flex items-center justify-between gap-3 mb-8">
                        <h3 class="text-2xl font-extrabold text-gray-900 tracking-tight">가격 및 진행 정책</h3>
                        <span class="text-[11px] text-gray-400 font-bold uppercase tracking-widest">USD Base</span>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        ${[
                            ['USD 기준 반영', '모든 서비스 가격은 USD 기준으로 안내됩니다. 국가별 결제 수단과 환율에 따라 최종 청구 금액이 달라질 수 있습니다.'],
                            ['무료 사역 지원 트랙', '목회자·선교사 대상 무료/감면 원칙은 동일하게 유지됩니다. 사역지원은 별도 심사 후 배정됩니다.'],
                            ['패키지 기반 깊은 변화', '단회보다 4회/8회 패키지 전환율이 높고 변화 유지에 강력합니다. 초기 상담 후 최적 트랙을 제안합니다.']
                        ].map(([title, desc]) => `
                            <div class="rounded-2xl bg-[#FAF9F7] p-6 border border-gray-50">
                                <h4 class="text-base font-bold text-gray-900 mb-3">${title}</h4>
                                <p class="text-sm text-gray-500 break-keep font-light leading-relaxed">${desc}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function updateProgramView(filterType) {
    state.programFilter = filterType;
    
    // Tab styling update
    document.querySelectorAll('[id^="tab-"]').forEach(btn => {
        const isActive = btn.id === `tab-${filterType}`;
        btn.className = isActive 
            ? "whitespace-nowrap px-6 py-3 rounded-full text-xs md:text-sm font-bold transition-all duration-300 bg-white text-gray-900 shadow-lg scale-105"
            : "whitespace-nowrap px-6 py-3 rounded-full text-xs md:text-sm font-bold transition-all duration-300 bg-white/10 border border-white/20 text-gray-300 hover:bg-white/20";
    });

    const introEl = document.getElementById('program-intro');
    const problemCardsEl = document.getElementById('program-problem-cards');
    const cardsEl = document.getElementById('program-cards');

    const svgArrowRight = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`;

    // Map feature tags to sleek SVG icons
    const iconMap = {
        'fas fa-child-reaching': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>',
        'fas fa-heart': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>',
        'fas fa-compass': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>',
        'fas fa-people-group': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
        'fas fa-hand-holding-heart': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>',
        'fas fa-comments': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
        'fas fa-users': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>',
        'fas fa-diagram-project': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>',
        'fas fa-briefcase': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>',
        'fas fa-fingerprint': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><circle cx="12" cy="12" r="3"></circle></svg>',
        'fas fa-route': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 16 16 12 12 8"></polyline><line x1="8" y1="12" x2="16" y2="12"></line></svg>',
        'fas fa-layer-group': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>',
        'fas fa-chalkboard-teacher': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="14" rx="2" ry="2"></rect><line x1="3" y1="17" x2="21" y2="17"></line><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>',
        'fas fa-users-cog': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>',
        'fas fa-file-signature': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M16 13H8"></path><path d="M16 17H8"></path><path d="M10 9H8"></path></svg>',
        'fas fa-sitemap': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="10" y="3" width="4" height="4"></rect><rect x="3" y="17" width="4" height="4"></rect><rect x="17" y="17" width="4" height="4"></rect><path d="M12 7v5M5 12h14M5 12v5M19 12v5"></path></svg>',
        'fas fa-chart-line': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>'
    };

    const data = {
        individual: {
            title: '개인/가정 코칭',
            desc: '',
            problems: [
                { t: '우리 아이가 달라졌어요', d: '아이와 부모의 서로 다른 기질과 패턴을 분석해, 갈등을 줄이는 맞춤 양육 코칭을 진행합니다.', i: 'fas fa-child-reaching', f: 'parenting' },
                { t: '우리 부부가 달라졌어요', d: '부부의 방식 차이를 구조적으로 파악해, 반복되는 긴장을 대화 가능한 깊은 관계로 연결합니다.', i: 'fas fa-heart', f: 'couple' },
                { t: '나를 이해하는 회복 세션', d: '직장이나 사회관계에서 반복되는 내 반응의 뿌리를 진단하고 건강한 회복 루트를 함께 설계합니다.', i: 'fas fa-compass', f: 'personal' }
            ],
            cards: [
                { b: 'Step 1', t: '정체성 발견 세션', d: '90분 심층 세션\n사전 검사 기반 동기 진단 및 방어 패턴 해석', p: '$100', o: '반복되는 삶의 패턴과 무의식적 방어를 언어화', i: 'fas fa-fingerprint' },
                { b: 'Step 2', t: '개별 코칭 (1회 세션)', d: '60분 실전 코칭\n관계·감정의 막힌 지점을 섬세하게 파악하는 코칭', p: '$80 / 1회', o: '실제 일상의 관계 장면에서 교정 방향 및 실행 도출', i: 'fas fa-route' },
                { b: 'Step 3', t: '회복 여정 패키지', d: '4회 코칭: $260\n8회 코칭: $600', p: '', o: '인지에서 끝나는 것이 아닌 삶에 흡수되는 변화 루틴', i: 'fas fa-layer-group', featured: true }
            ]
        },
        church: {
            title: '기관/교회 프로그램',
            desc: '목회자·선교사님 대상으로는 지원 원칙에 따라 별도 혜택을 안내해 드립니다. 기관 성격에 맞춰 맞춤 설계됩니다.',
            problems: [
                { t: '공동체 갈등 회복', d: '다양한 구성원의 충돌을 공통 언어로 정리하고, 조화로운 협업과 적용안을 함께 구성합니다.', i: 'fas fa-people-group', f: 'church' },
                { t: '사역자 소진 돌봄', d: '오랜 사역으로 지친 심신과 소진 패턴을 안전하게 다루고, 건강한 역할 분담 경계를 나눕니다.', i: 'fas fa-hand-holding-heart', f: 'ministry' },
                { t: '리더십 소통 재정렬', d: '의사결정과 피드백 과정에서 막히는 흐름을 점검해 원활한 소통 구조가 흐르도록 돕습니다.', i: 'fas fa-comments', f: 'leadership' }
            ],
            cards: [
                { b: '워크숍', t: '퍼스트 스텝 (2시간)', d: '팀 유형 이해 + 갈등 패턴 인식 및 기초 가이드', p: '$500부터', o: '공동체의 성격을 객관화하고 공통의 회복 프레임 확보', i: 'fas fa-chalkboard-teacher' },
                { b: '집중반', t: '팀 딥다이브 (6시간)', d: '리더 분석 + 팀 갈등 구조 분석 및 실제 적용 전략', p: '$1,800부터', o: '복잡하게 얽힌 소통 규칙을 건강한 방식으로 재정립', i: 'fas fa-users-cog' },
                { b: '코호트', t: '리더 후속 패키지', d: '리더 디브리핑 세션 + 현장 적용 4주 코호트 관리', p: '맞춤 제안', o: '워크숍에서 얻은 인사이트가 증발하지 않고 정착', i: 'fas fa-file-signature' }
            ]
        },
        business: {
            title: '기업/팀 프로그램',
            desc: '단순한 성격유형 설명이 아닙니다. 갈등 비용 감소, 협업 생산성 향상을 위한 조직 커뮤니케이션 언어로 접근합니다.',
            problems: [
                { t: '팀 소통 효율 극대화', d: '서로 다른 소통 방식과 오해 비용을 줄이고, 투명하고 직접적인 피드백 규칙을 세팅합니다.', i: 'fas fa-users', f: 'team' },
                { t: '리더십 피드백 동기화', d: '리더와 실무진 사이의 병목을 진단하고 의사결정 속도가 느려지지 않도록 조직 구조를 풉니다.', i: 'fas fa-diagram-project', f: 'leadership' },
                { t: '역할 적합성 설계', d: '타고난 강점 및 동기를 기반으로 한 배치 조율로 구성원의 몰입을 높이고 리소스를 절감합니다.', i: 'fas fa-briefcase', f: 'team' }
            ],
            cards: [
                { b: '진단', t: '인지 다양성 워크숍', d: '조직 역할 진단 · 커뮤니케이션 병목 확인 · 실행 합의', p: '$2,000–$5,000', o: '보이지 않았던 충돌 원인을 가시화하고 개선 과제 도출', i: 'fas fa-sitemap' },
                { b: '인사', t: '채용 및 역할 자문', d: '직무 매칭 데이터 기반 자문 및 팀 빌딩 전략 컨설팅', p: '맞춤 제안', o: '부적합 채용·배치로 인한 누수 비용 선제적 차단', i: 'fas fa-briefcase' },
                { b: 'C레벨', t: '리더십 스프린트', d: '조직장 커뮤니케이션 프레임 재구성 압축 코칭 트랙', p: '$5,000부터', o: '탑다운 의사결정의 명확성 확보 및 협업 유연성 극대화', i: 'fas fa-chart-line' }
            ]
        },
        
    };
    const selected = data[filterType];
    if (!selected || !selected.cards) return;

    if(introEl) {
        introEl.innerHTML = `
            <h3 class="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight">${selected.title}</h3>
            ${selected.desc ? `<p class="text-sm text-gray-500 break-keep font-light">${selected.desc}</p>` : ''}
        `;
    }

    if(problemCardsEl) {
        const problems = selected.problems || [];
        problemCardsEl.innerHTML = problems.map((p) => `
            <div class="bg-white rounded-[2rem] p-7 border border-gray-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div class="w-12 h-12 rounded-2xl bg-gray-50 text-gray-900 flex items-center justify-center mb-5 border border-gray-100 shadow-sm">
                    ${iconMap[p.i] || `<i class="${p.i}"></i>`}
                </div>
                <h4 class="text-lg font-bold text-gray-900 mb-3 break-keep">${p.t}</h4>
                <p class="text-sm text-gray-500 leading-relaxed break-keep font-light">${p.d}</p>
                <button onclick="renderSection('community', { story: '${p.f || ''}' })" class="mt-5 text-sm font-bold text-gray-900 inline-flex items-center gap-1 hover:gap-2 transition-all">
                    상담 후기 보기 ${svgArrowRight}
                </button>
            </div>
        `).join('');
    }

    if(cardsEl) {
        cardsEl.innerHTML = selected.cards.map(c => `
            <div class="bg-white rounded-[2.5rem] p-8 border ${c.featured ? 'border-gray-900 shadow-xl ring-2 ring-gray-900/5' : 'border-gray-100 shadow-sm'} hover:shadow-xl transition-all duration-300 group flex flex-col h-full relative">
                ${c.featured ? `<span class="absolute -top-3 right-6 px-4 py-1.5 rounded-full bg-gray-900 text-white text-[10px] font-bold tracking-widest shadow-md">가장 많이 선택</span>` : ''}
                <div class="flex items-center justify-between mb-6">
                    <span class="px-3.5 py-1.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-widest">${c.b}</span>
                    <div class="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-900 group-hover:bg-gray-900 group-hover:text-white transition-colors duration-300 shadow-sm">
                        ${iconMap[c.i] || `<i class="${c.i}"></i>`}
                    </div>
                </div>
                <h4 class="text-xl font-extrabold text-gray-900 mb-2 tracking-tight">${c.t}</h4>
                <p class="text-gray-500 text-sm leading-relaxed mb-6 flex-grow break-keep whitespace-pre-line font-light">${c.d}</p>
                <p class="text-lg font-black text-gray-900 mb-6">${c.p || ''}</p>
                <div class="bg-[#FAF9F7] rounded-2xl p-4 mb-6">
                    <p class="text-xs text-gray-500 break-keep font-medium"><span class="font-bold text-gray-900 mr-1">Impact:</span> ${c.o || ''}</p>
                </div>
                <button onclick="renderSection('apply', { track: '${filterType === 'church' ? 'org' : 'paid'}' })" class="w-full py-3.5 rounded-2xl ${c.featured ? 'bg-gray-900 text-white' : 'border border-gray-200 text-gray-700 hover:bg-gray-900 hover:text-white hover:border-transparent'} font-bold text-sm transition-all shadow-sm">
                    신청 문의하기
                </button>
            </div>
        `).join('');
    }
}


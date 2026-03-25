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
                            ['USD 기준', '모든 서비스 가격은 USD 기준으로 안내됩니다. 국가별 결제 수단과 환율에 따라 최종 청구 금액이 달라질 수 있습니다.'],
                            ['사역지원 트랙', '목회자·선교사 대상 무료/감면 원칙은 유지됩니다. 사역지원은 별도 심사 후 배정됩니다.'],
                            ['패키지 우선', '단회보다 4회/8회 패키지 전환율이 높고 변화 유지에 유리합니다. 초기 상담 후 최적 트랙을 제안합니다.']
                        ].map(([title, desc]) => `
                            <div class="rounded-2xl border border-gray-100 bg-er-base/50 p-5">
                                <h4 class="text-sm font-bold text-er-dark">${title}</h4>
                                <p class="mt-2 text-xs text-gray-500 break-keep">${desc}</p>
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

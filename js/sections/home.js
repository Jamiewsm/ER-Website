// ER Section: Home
function renderHome() {
    const svgArrowRight = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`;
    const svgCheck = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    const svgChart = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>`;
    const svgStar = `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" class="text-gray-300"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;

    return `
        <div class="bg-[#FAF9F7]">
            <section class="relative overflow-hidden min-h-[88vh] flex flex-col justify-center">
                <div class="absolute inset-0 bg-pattern z-0 pointer-events-none opacity-40"></div>
                <div class="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-white rounded-full blur-[120px] z-0 pointer-events-none"></div>

                <div class="max-w-[1100px] mx-auto px-5 sm:px-6 z-10 py-16 md:py-24">
                    <div class="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        <div class="text-center lg:text-left animate-fade-in-up order-2 lg:order-1">
                            <div class="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-gray-100 shadow-sm mb-8">
                                <span class="w-1.5 h-1.5 rounded-full bg-gray-900 animate-pulse"></span>
                                <span class="text-[10px] md:text-[11px] font-bold tracking-[0.25em] uppercase text-gray-500">Enneagram for Restoration</span>
                            </div>

                            <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] tracking-tight font-extrabold text-gray-900 mb-6 leading-[1.15] break-keep">
                                삶 속에서 반복되는<br>내면과 관계의 갈등,<br><span class="text-gray-400">에니어그램으로 풉니다.</span>
                            </h1>

                            <p class="mt-4 text-base md:text-lg text-gray-500 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0 break-keep font-light">
                                성격을 분석하는 데 머물지 않고, 하나님이 개인에게 주신 고유한 디자인을 회복합니다. 부부, 자녀 양육, 워크숍까지 최고 수준의 에니어그램 코칭이 함께합니다.
                            </p>

                            <div class="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto lg:mx-0 justify-center lg:justify-start">
                                <button onclick="renderSection('apply', { track: 'paid' })" class="px-8 py-4 bg-gray-900 text-white rounded-full text-sm font-semibold shadow-md hover:shadow-xl hover:bg-gray-800 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3">
                                    상담 및 코칭 신청 ${svgArrowRight}
                                </button>
                                <button onclick="renderSection('programs', { tab: 'individual' })" class="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-full text-sm font-semibold hover:bg-gray-50 transition-all active:scale-95">
                                    프로그램 안내
                                </button>
                            </div>

                            <div class="mt-14 pt-8 border-t border-gray-200/60 flex flex-col items-center lg:items-start gap-3 text-xs text-gray-400 font-medium">
                                <div class="flex items-center gap-2"><div class="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">${svgCheck}</div> 전문 코칭 및 상담 윤리를 철저히 준수합니다.</div>
                                <div class="flex items-center gap-2"><div class="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">${svgCheck}</div> 목회자와 선교사 가족에게는 무료 코칭을 지원합니다.</div>
                            </div>
                        </div>

                        <div class="relative order-1 lg:order-2 flex justify-center animate-fade-in mb-8 md:mb-0">
                            <div class="relative w-full max-w-[420px] bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white transition-all duration-500 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)]">
                                <div class="absolute -top-6 -left-6 bg-white p-4 rounded-3xl shadow-lg border border-gray-100 flex items-center gap-4 animate-float z-20">
                                    <div class="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white">
                                        ${svgChart}
                                    </div>
                                    <div class="pr-2">
                                        <p class="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">Restoration</p>
                                        <p class="text-sm font-extrabold text-gray-900 tracking-tight">개인·가정·공동체</p>
                                    </div>
                                </div>

                                <div class="absolute top-6 right-6 flex gap-2">
                                    <div class="w-2.5 h-2.5 rounded-full bg-gray-200"></div>
                                    <div class="w-2.5 h-2.5 rounded-full bg-gray-200"></div>
                                </div>

                                <div class="chart-container mt-6">
                                    <canvas id="heroChart"></canvas>
                                </div>

                                <div id="hero-chart-labels" class="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3 text-[10px] md:text-[11px] font-medium text-gray-500"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Vision Section -->
            <section class="py-20 md:py-32 px-5 bg-white">
                <div class="max-w-[800px] mx-auto text-center">
                    <span class="text-gray-400 font-bold text-[10px] tracking-[0.3em] uppercase block mb-6">Vision & Mission</span>
                    <h2 class="text-3xl md:text-5xl font-extrabold text-gray-900 break-keep leading-tight tracking-tight">
                        나의 Original Design을 알 때,<br class="hidden md:block">
                        비로소 타인의 모습이 보입니다.
                    </h2>
                </div>
            </section>

            <!-- Who We Serve -->
            <section class="py-20 md:py-28 px-5 bg-[#FAF9F7]">
                <div class="max-w-[1000px] mx-auto">
                    <div class="text-center mb-16">
                        <span class="text-gray-400 font-bold text-[10px] tracking-[0.3em] uppercase block mb-4">Who We Serve</span>
                        <p class="text-base md:text-lg text-gray-500 max-w-2xl mx-auto break-keep font-light">개인의 자기 이해에서 공동체의 관계 회복에 이르기까지, 각 현장에 맞는 회복의 여정을 함께 만들어 갑니다.</p>
                    </div>
                    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        ${[
                            { title: '개인', body: '자기 이해, 감정 패턴, 소명 탐색을 돕습니다.' },
                            { title: '가정', body: '부부와 부모-자녀 관계의 갈등을 풉니다.' },
                            { title: '교회', body: '사역자와 리더, 공동체의 소진을 돌봅니다.' },
                            { title: '협력 기관', body: '교육, 워크숍, 파트너십으로 연결합니다.' }
                        ].map(item => `
                            <div class="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                                <h3 class="text-xl font-bold text-gray-900 mb-3">${item.title}</h3>
                                <p class="text-sm text-gray-500 leading-relaxed break-keep font-light">${item.body}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </section>

            <!-- Programs -->
            <section class="py-20 md:py-28 px-5 bg-white">
                <div class="max-w-[1000px] mx-auto">
                    <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
                        <div>
                            <span class="text-gray-400 font-bold text-[10px] tracking-[0.3em] uppercase block mb-3">Programs</span>
                            <h2 class="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight break-keep">대표 프로그램 3가지</h2>
                            <p class="mt-4 text-sm md:text-base text-gray-500 max-w-lg break-keep font-light">복잡한 선택 대신, 가장 시작하기 좋은 3개 트랙으로 구성했습니다.</p>
                        </div>
                        <button onclick="renderSection('programs', { tab: 'individual' })" class="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200/80 bg-gray-50 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors shrink-0">
                            서비스 상세 보기 ${svgArrowRight}
                        </button>
                    </div>
                    <div class="grid gap-6 md:grid-cols-3">
                        ${[
                            { tag: 'Step 1', title: '정체성 발견 세션', body: '90분 만에 발견하는 핵심 동기 · $100\n심층 인터뷰 + 방어 패턴 분석' },
                            { tag: 'Step 2', title: '개별 코칭 (1회 세션)', body: '60분 실전 코칭 · $80 / 1회\n관계·감정의 막힌 지점을 풀어냅니다' },
                            { tag: 'Step 3', title: '회복 여정 패키지 (8회)', body: '8회 패키지 · $600\n뿌리부터 바뀌는 지속적 변화 코스' }
                        ].map(item => `
                            <div class="bg-[#FAF9F7] rounded-[2.5rem] p-8 border border-gray-100 transition-all duration-300 hover:shadow-xl hover:bg-white hover:-translate-y-1 group">
                                <span class="inline-flex px-3.5 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 text-[10px] font-bold uppercase tracking-widest shadow-sm">${item.tag}</span>
                                <h3 class="text-2xl font-bold text-gray-900 mt-6 mb-4 tracking-tight">${item.title}</h3>
                                <p class="text-sm text-gray-500 leading-relaxed break-keep mb-8 whitespace-pre-line font-light group-hover:text-gray-600">${item.body}</p>
                                <button onclick="renderSection('apply', { track: 'paid' })" class="text-sm font-bold text-gray-900 inline-flex items-center gap-1 hover:gap-2 transition-all">신청하기 ${svgArrowRight}</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </section>

            <!-- Testimonials & Stats -->
            <section class="py-20 md:py-32 px-5 bg-[#FAF9F7]">
                <div class="max-w-[1000px] mx-auto">
                    <div class="text-center mb-16">
                        <span class="text-gray-400 font-bold text-[10px] tracking-[0.3em] uppercase block mb-4">Impact</span>
                        <h2 class="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight break-keep mb-6">회복이 남긴 변화</h2>
                        <p class="text-base md:text-lg text-gray-500 max-w-2xl mx-auto break-keep font-light">성장과 치유가 실제 삶 속에서 어떻게 나타나고 있는지 요약했습니다.</p>
                    </div>
                    
                    <div class="grid gap-4 md:grid-cols-4 mb-20">
                        ${[
                            ['45%', '개인·가정 지원 비중'],
                            ['25%', '교회·사역자 지원 비중'],
                            ['15%', '조직·협력 프로그램'],
                            ['10%', '강사 양성·교육']
                        ].map(([value, label]) => `
                            <div class="rounded-[2rem] bg-white p-8 text-center shadow-sm border border-gray-100">
                                <p class="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tighter mb-2">${value}</p>
                                <p class="text-sm text-gray-400 font-medium break-keep">${label}</p>
                            </div>
                        `).join('')}
                    </div>

                    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        ${publicTestimonials.stories.slice(0,6).map((item) => `
                            <div class="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
                                <div class="flex items-center justify-between mb-6">
                                    <span class="inline-flex px-3 py-1 rounded-full bg-gray-50 text-gray-500 text-[10px] font-bold tracking-widest uppercase border border-gray-100">${item.tag}</span>
                                    <div class="flex gap-0.5">
                                        ${svgStar}${svgStar}${svgStar}${svgStar}${svgStar}
                                    </div>
                                </div>
                                <p class="text-gray-600 font-light text-[15px] leading-relaxed break-keep mb-8">"${item.quote}"</p>
                                <div class="pt-5 border-t border-gray-100">
                                    <p class="text-sm font-bold text-gray-900">${item.person}</p>
                                    <p class="text-[11px] text-gray-400 font-medium mt-0.5">${item.meta}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </section>

            <!-- Support CTA -->
            <section class="py-20 md:py-28 px-5 bg-white">
                <div class="max-w-[1000px] mx-auto text-center">
                    <span class="text-gray-400 font-bold text-[10px] tracking-[0.3em] uppercase block mb-6">Support</span>
                    <h2 class="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight break-keep mb-8">여러분의 후원이<br class="hidden sm:block">무료 코칭 트랙을 유지하게 합니다</h2>
                    <p class="text-base text-gray-500 mb-10 max-w-xl mx-auto font-light leading-relaxed">목회자·선교사에게는 후원을 통해 전면 무료 코칭을 제공하고 있습니다. 협력과 기도로 디자인 회복의 과정에 동참해 주세요.</p>
                    <button onclick="renderSection('apply', { track: 'support' })" class="inline-flex items-center justify-center rounded-full bg-gray-900 px-8 py-4 text-sm font-bold text-white hover:bg-gray-800 transition-all shadow-md active:scale-95 gap-2">
                        후원 및 협력 문의하기 ${svgArrowRight}
                    </button>
                </div>
            </section>
        </div>
    `;
}


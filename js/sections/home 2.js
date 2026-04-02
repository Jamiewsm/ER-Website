// ER Section: Home
function renderHome() {
    return `
        <div class="bg-er-base">
            <section class="relative overflow-hidden min-h-[88vh] flex flex-col justify-center">
                <div class="absolute inset-0 bg-pattern z-0 pointer-events-none"></div>
                <div class="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-er-accent/10 rounded-full blur-[100px] z-0 pointer-events-none animate-pulse"></div>
                <div class="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-50/60 rounded-full blur-[80px] z-0 pointer-events-none"></div>

                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-12 md:py-20">
                    <div class="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                        <div class="text-center lg:text-left animate-fade-in-up order-2 lg:order-1">
                            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 border border-er-accent/20 backdrop-blur-sm shadow-sm mb-6">
                                <span class="w-2 h-2 rounded-full bg-er-accent animate-pulse"></span>
                                <span class="text-[10px] md:text-xs font-bold tracking-widest uppercase text-er-primary">Enneagram for Restoration</span>
                            </div>

                            <h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-tight font-extrabold text-er-dark mb-6 leading-[1.22] break-keep">
                                삶 속에서 반복되는 내면의 갈등과 관계 문제를<br class="hidden md:block">에니어그램을 통해 해석하고 회복을 돕습니다.
                            </h1>

                            <p class="mt-2 text-base md:text-lg text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto lg:mx-0 break-keep font-medium">
                                ER은 여러분의 성격을 분석하는 데서 멈추지 않고, 하나님이 각각의 개인에게 주신 아름다운 본모습(오리지널 디자인)을 발견하고 회복될 수 있도록 돕기 위해 존재합니다. 개인, 부부, 자녀 양육을 비롯한 관계 코칭 뿐 아니라, 에니어그램으로 진정한 성장을 이루고 싶은 분들을 위한 전문 프로그램, 각종 비즈니스와 기관 워크숍까지, 최고 수준의 에니어그램 전문가 및 코치들이 함께 합니다.
                            </p>

                            <div class="grid sm:grid-cols-2 gap-3 md:gap-4 max-w-3xl mx-auto lg:mx-0">
                                <button onclick="renderSection('apply', { track: 'paid' })" class="px-6 py-4 bg-er-dark text-white rounded-full font-bold shadow-lg shadow-er-dark/20 hover:bg-gray-800 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-2">
                                    상담 및 코칭 신청 <i class="fas fa-arrow-right text-xs opacity-70"></i>
                                </button>
                                <button onclick="renderSection('programs', { tab: 'individual' })" class="px-6 py-4 bg-white/90 backdrop-blur-sm text-er-dark border border-white/60 rounded-full font-bold shadow-sm hover:bg-white hover:border-er-accent/50 transition-all active:scale-95">
                                    서비스 안내
                                </button>
                            </div>

                            <div class="mt-10 md:mt-12 pt-6 border-t border-er-dark/5 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs md:text-sm text-gray-500 font-medium">
                                <div class="w-full text-left text-gray-600 font-semibold">ER은</div>
                                <div class="flex items-center gap-2"><div class="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-[10px]"><i class="fas fa-check"></i></div> 한국, 미국, 아시아 등 국제적인 기반 위에서 활동합니다. (가격은 USD를 기준으로 합니다)</div>
                                <div class="flex items-center gap-2"><div class="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-[10px]"><i class="fas fa-check"></i></div> 코칭 및 상담 윤리를 준수합니다.</div>
                                <div class="flex items-center gap-2"><div class="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-[10px]"><i class="fas fa-check"></i></div> 목회자와 선교사 및 가족분들에게는 무료로 서비스를 지원합니다.</div>
                            </div>
                        </div>

                        <div class="relative order-1 lg:order-2 flex justify-center animate-fade-in mb-6 md:mb-0">
                            <div class="relative w-full max-w-[380px] md:max-w-lg glass rounded-[2.5rem] p-6 md:p-8 shadow-card floating-card hover:shadow-glow duration-500">
                                <div class="absolute -top-5 -left-4 md:-top-6 md:-left-8 bg-white p-3 md:p-4 rounded-2xl shadow-soft border border-white/60 flex items-center gap-3 animate-float z-20">
                                    <div class="w-10 h-10 md:w-12 md:h-12 bg-er-accent rounded-full flex items-center justify-center text-white font-bold text-lg shadow-inner">
                                        <i class="fas fa-chart-pie"></i>
                                    </div>
                                    <div class="text-left pr-2">
                                        <p class="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-wider">Restoration in Motion</p>
                                        <p class="text-sm md:text-base font-extrabold text-er-dark">개인 · 가정 · 공동체</p>
                                    </div>
                                </div>

                                <div class="absolute top-4 right-4 flex gap-1.5">
                                    <div class="w-2 h-2 rounded-full bg-red-300/50"></div>
                                    <div class="w-2 h-2 rounded-full bg-yellow-300/50"></div>
                                    <div class="w-2 h-2 rounded-full bg-green-300/50"></div>
                                </div>

                                <div class="chart-container">
                                    <canvas id="heroChart"></canvas>
                                </div>

                                <div id="hero-chart-labels" class="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] md:text-[11px]"></div>
                            </div>

                            <div class="absolute inset-0 bg-gradient-to-tr from-er-accent/20 to-transparent rounded-full blur-3xl -z-10 transform scale-110"></div>
                        </div>
                    </div>
                </div>
            </section>

            <section class="py-12 md:py-14 px-4 sm:px-6 lg:px-8 bg-white">
                <div class="max-w-5xl mx-auto">
                    <div class="rounded-[2.25rem] bg-er-base/70 border border-white/40 shadow-soft p-8 md:p-10 text-center floating-card">
                        <span class="text-er-accent font-bold text-xs tracking-widest uppercase">Vision & Mission</span>
                        <h2 class="mt-4 text-2xl md:text-4xl font-bold text-er-dark break-keep">
                            나의 Original Design을 알 때,<br class="hidden md:block">
                            비로소 타인의 Original Design이 보입니다.
                        </h2>
                    </div>
                </div>
            </section>

            <section class="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div class="max-w-6xl mx-auto">
                    <div class="text-center mb-10">
                        <span class="text-er-accent font-bold text-xs tracking-widest uppercase">Who We Serve</span>
                        <p class="mt-4 text-sm md:text-base text-gray-500 max-w-2xl mx-auto break-keep">개인의 자기 이해에서 공동체의 관계 회복에 이르기까지, 각 현장에 맞는 회복의 여정을 함께 만들어 갑니다.</p>
                    </div>
                    <div class="grid gap-6 md:grid-cols-4">
                        ${[
                            { title: '개인', body: '자기 이해, 감정 패턴, 소명 탐색을 돕습니다.' },
                            { title: '가정', body: '부부와 부모-자녀 관계의 갈등을 풀고 회복을 돕습니다.' },
                            { title: '교회', body: '사역자와 리더, 공동체의 소진과 갈등을 함께 다룹니다.' },
                            { title: '협력 기관', body: '교육, 워크숍, 파트너십 프로그램으로 연결합니다.' }
                        ].map(item => `
                            <div class="bg-white rounded-[2rem] p-6 border border-white/40 shadow-soft floating-card">
                                <h3 class="text-lg font-bold text-er-dark mb-2">${item.title}</h3>
                                <p class="text-sm text-gray-500 leading-relaxed break-keep">${item.body}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </section>

            <section class="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-er-base">
                <div class="max-w-6xl mx-auto">
                    <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
                        <div>
                        <span class="text-er-accent font-bold text-xs tracking-widest uppercase">대표 서비스</span>
                        <h2 class="text-2xl md:text-4xl font-bold text-er-dark mt-3 break-keep">대표 프로그램 3가지</h2>
                        <p class="mt-3 text-sm md:text-base text-gray-500 max-w-2xl break-keep">복잡한 선택 대신, 가장 효과적인 3개 트랙으로 시작할 수 있도록 구성했습니다.</p>
                    </div>
                        <button onclick="renderSection('programs', { tab: 'individual' })" class="inline-flex items-center justify-center gap-2 rounded-full border border-er-accent/30 bg-white px-5 py-3 text-sm font-bold text-er-dark hover:border-er-accent hover:bg-er-accentLight/40 transition-colors">
                            서비스 상세 보기 <i class="fas fa-arrow-right text-xs"></i>
                        </button>
                    </div>
                    <div class="grid gap-6 md:grid-cols-3">
                        ${[
                            { tag: 'Step 1', title: '정체성 발견 세션', body: '90분 만에 발견하는 나의 핵심 동기 · $100\n심층 인터뷰 + 핵심 동기/방어 패턴 분석' },
                            { tag: 'Step 2', title: '개별 코칭 (1회 세션)', body: '60분 실전 코칭 · $80 / 1회\n관계·감정의 막힌 지점을 풀어내는 적용 코칭' },
                            { tag: 'Step 3', title: '회복 여정 패키지 (8회)', body: '8회 패키지 · $600\n뿌리부터 바뀌는 지속적 변화 코스' }
                        ].map(item => `
                            <div class="bg-white rounded-[2rem] p-7 border border-white/40 shadow-soft floating-card">
                                <span class="inline-flex px-3 py-1 rounded-full bg-er-base text-er-accent text-[10px] font-bold uppercase tracking-[0.2em]">${item.tag}</span>
                                <h3 class="text-xl font-bold text-er-dark mt-5 mb-3">${item.title}</h3>
                                <p class="text-sm text-gray-500 leading-relaxed break-keep mb-6 whitespace-pre-line">${item.body}</p>
                                <button onclick="renderSection('apply', { track: 'paid' })" class="text-sm font-bold text-er-dark hover:text-er-accent transition-colors">상담 및 코칭 신청</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </section>

            <section class="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div class="max-w-6xl mx-auto">
                    <div class="text-center mb-10">
                        <span class="text-er-accent font-bold text-xs tracking-widest uppercase">함께한 이야기</span>
                        <h2 class="text-2xl md:text-4xl font-bold text-er-dark mt-3 break-keep">회복이 남긴 변화</h2>
                        <p class="mt-3 text-sm md:text-base text-gray-500 max-w-2xl mx-auto break-keep">사역이 어떤 자리로 흘러가고 있는지, 주요 지표와 방향을 한눈에 정리했습니다.</p>
                    </div>
                    <div class="grid gap-5 md:grid-cols-4 mb-8">
                        ${[
                            ['45%', '개인·가정 지원 비중'],
                            ['25%', '교회·사역자 지원 비중'],
                            ['15%', '조직·협력 프로그램 비중'],
                            ['10%', '강사 양성·교육 비중']
                        ].map(([value, label]) => `
                            <div class="rounded-[2rem] border border-white/40 bg-er-base p-6 text-center shadow-soft floating-card">
                                <p class="text-3xl md:text-4xl font-extrabold text-er-dark">${value}</p>
                                <p class="mt-2 text-sm text-gray-500 break-keep">${label}</p>
                            </div>
                        `).join('')}
                    </div>
                    <div class="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-start">
                        <div class="bg-white/70 rounded-[2rem] p-6 md:p-8 shadow-soft floating-card">
                            <h3 class="font-bold text-base text-gray-800 mb-6 flex items-center gap-2">
                                <i class="fas fa-chart-pie text-er-accent"></i> 은혜가 흘러간 자리
                            </h3>
                            <p class="text-xs text-gray-500 mb-4 break-keep">상담과 교육 요청이 집중되는 주요 영역을 기준으로 사역 방향을 조정합니다.</p>
                            <div class="chart-container h-64 md:h-72" style="overflow:hidden">
                                <canvas id="impactChart"></canvas>
                            </div>
                        </div>
                        <div class="bg-er-dark text-white rounded-[2rem] p-6 md:p-8 shadow-card floating-card">
                            <span class="inline-flex px-3 py-1 rounded-full bg-white/10 text-[10px] font-bold uppercase tracking-[0.2em] text-er-accent">사역의 방향</span>
                            <h3 class="text-2xl font-bold mt-5 mb-4 break-keep">반복적으로 나타난 변화의 방향</h3>
                            <div class="space-y-4">
                                ${publicTestimonials.impactThemes.map((item) => `
                                    <div class="rounded-2xl border border-white/10 bg-white/5 p-4 transition-all duration-300 hover:-translate-y-1">
                                        <div class="flex items-start gap-3">
                                            <i class="fas fa-check-circle text-er-accent mt-0.5"></i>
                                            <div>
                                                <h4 class="text-sm font-bold text-white mb-1">${item.title}</h4>
                                                <p class="text-sm leading-relaxed text-gray-300 break-keep">${item.summary}</p>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section class="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-er-base">
                <div class="max-w-6xl mx-auto">
                    <div class="text-center mb-10">
                        <span class="text-er-accent font-bold text-xs tracking-widest uppercase">함께한 이야기</span>
                        <h2 class="text-2xl md:text-4xl font-bold text-er-dark mt-3 break-keep">마음에 머무는 이야기</h2>
                        <p class="mt-3 text-sm md:text-base text-gray-500 max-w-2xl mx-auto break-keep">실제 후기를 바탕으로, 회복이 삶과 관계 안에 어떻게 스며들었는지 차분하게 담았습니다.</p>
                    </div>
                    <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        ${publicTestimonials.stories.map((item) => `
                            <div class="bg-white rounded-[2rem] p-6 md:p-7 border border-white/40 shadow-soft floating-card">
                                <div class="flex items-center justify-between gap-3 mb-4">
                                    <span class="inline-flex px-3 py-1 rounded-full bg-er-base text-er-accent text-[10px] font-bold uppercase tracking-[0.2em]">${item.tag}</span>
                                    <div class="flex text-er-accent text-[10px]">
                                        <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
                                    </div>
                                </div>
                                <p class="text-gray-600 italic text-sm leading-relaxed break-keep mb-6">${item.quote}</p>
                                <div class="pt-4 border-t border-gray-100">
                                    <p class="text-sm font-bold text-gray-900">${item.person}</p>
                                    <p class="text-[11px] text-gray-400 uppercase tracking-[0.18em]">${item.meta}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </section>

            <section class="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div class="max-w-6xl mx-auto">
                    <div class="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] items-start">
                        <div>
                            <span class="text-er-accent font-bold text-xs tracking-widest uppercase">동역과 후원</span>
                            <h2 class="text-2xl md:text-4xl font-bold text-er-dark mt-3 break-keep">여러분의 후원으로 더 많은 개인과 공동체를 섬길 수 있습니다</h2>
                            <p class="mt-3 text-sm md:text-base text-gray-500 break-keep">
                                ER은 후원과 파트너십, 기도와 연결을 통해 더 많은 개인과 공동체를 섬기고, 더 넓은 현장으로 회복의 기회를 나누고자 합니다.
                            </p>
                        </div>
                        <div class="grid gap-4 md:grid-cols-3">
                            ${[
                                ['후원', '프로그램 운영, 자료 개발, 참여자 지원을 위한 재정 후원'],
                                ['협력', '교회·기관·공동체와 함께하는 교육 및 회복 프로그램'],
                                ['연결', '필요한 사람을 소개하고 사역 소식을 함께 나누는 참여']
                            ].map(([title, body]) => `
                                <div class="rounded-[2rem] bg-er-base p-6 border border-white/40 shadow-soft floating-card">
                                    <h3 class="text-lg font-bold text-er-dark mb-2">${title}</h3>
                                    <p class="text-sm text-gray-500 leading-relaxed break-keep">${body}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="mt-8 rounded-[2rem] bg-er-dark text-white p-7 md:p-8 shadow-card floating-card flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                        <div>
                            <h3 class="text-xl font-bold mb-2 break-keep">후원은 사역을 넓히고, 협력은 회복의 통로를 만듭니다.</h3>
                            <p class="text-sm text-gray-300 break-keep">후원 여부와 관계없이 먼저 필요한 상담과 프로그램을 안내하며, 협력 요청은 상황에 맞게 개별적으로 연결합니다.</p>
                        </div>
                        <button onclick="renderSection('apply', { track: 'support' })" class="shrink-0 inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-bold text-er-dark hover:bg-er-accentLight transition-colors">
                            후원·협력 신청하기
                        </button>
                    </div>
                </div>
            </section>

            <section class="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-er-base">
                <div class="max-w-5xl mx-auto">
                    <div class="text-center mb-10">
                        <span class="text-er-accent font-bold text-xs tracking-widest uppercase">FAQ</span>
                        <h2 class="text-2xl md:text-4xl font-bold text-er-dark mt-3">자주 묻는 질문</h2>
                    </div>
                    <div class="grid gap-4">
                        ${[
                            ['유료 서비스와 사역지원은 어떻게 다른가요?', '개인·가정·기관 서비스는 유료로 운영되며, 목회자·선교사 대상 사역지원은 심사를 통해 무료 또는 감면으로 안내합니다.'],
                            ['어떤 분들을 주로 섬기나요?', '개인과 부부, 가정은 물론 목회자와 선교사, 교회 리더, 협력 기관 등 회복과 관계의 도움이 필요한 다양한 현장을 섬깁니다.'],
                            ['공개 사이트의 로그인은 누구를 위한 기능인가요?', '기존 참여자와 코치, 운영상 연결된 사용자를 위한 보조 경로입니다. 처음 방문하신 분은 프로그램 안내와 상담 문의를 먼저 이용하시면 됩니다.'],
                            ['협력 프로그램은 어떻게 진행되나요?', '기관과 교회의 필요를 먼저 듣고, 목적과 대상에 맞춰 코칭, 강의, 워크숍의 형식으로 개별 설계합니다.']
                        ].map(([question, answer]) => `
                            <div class="bg-white rounded-[1.75rem] border border-white/40 p-6 shadow-soft floating-card">
                                <h3 class="text-base md:text-lg font-bold text-er-dark mb-2 break-keep">${question}</h3>
                                <p class="text-sm text-gray-500 leading-relaxed break-keep">${answer}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </section>

            <section class="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div class="max-w-6xl mx-auto">
                    <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
                        <div>
                            <span class="text-er-accent font-bold text-xs tracking-widest uppercase">사역 소식</span>
                            <h2 class="text-2xl md:text-4xl font-bold text-er-dark mt-3 break-keep">최근 소식과 모집 안내</h2>
                            <p class="mt-3 text-sm md:text-base text-gray-500 max-w-2xl break-keep">진행 중인 과정과 새롭게 열리는 안내는 이곳에서 따로 모아 전합니다.</p>
                        </div>
                        <button onclick="openNotices()" class="inline-flex items-center justify-center gap-2 rounded-full border border-er-accent/30 bg-er-base px-5 py-3 text-sm font-bold text-er-dark hover:border-er-accent hover:bg-er-accentLight/40 transition-colors">
                            공지사항 전체 보기 <i class="fas fa-arrow-right text-xs"></i>
                        </button>
                    </div>
                    <div class="grid gap-5 md:grid-cols-2">
                        ${state.notices.slice(0, 2).map(n => `
                            <div onclick="openNotice('${n.id}')" class="bg-er-base rounded-[2rem] p-6 border border-white/40 shadow-soft floating-card cursor-pointer">
                                <div class="flex items-center gap-2 mb-3">
                                    <span class="inline-block px-2 py-1 rounded-full text-[10px] font-bold ${n.tag === '모집중' ? 'bg-er-accent/10 text-er-accent' : 'bg-white text-gray-500'}">${n.tag}</span>
                                    <span class="text-[11px] text-gray-400">${(n.published_at || '').replaceAll('-','.')}</span>
                                </div>
                                <h3 class="text-lg font-bold text-er-dark mb-2 break-keep">${n.title}</h3>
                                <p class="text-sm text-gray-500 break-keep">${n.summary}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </section>
        </div>
    `;
}

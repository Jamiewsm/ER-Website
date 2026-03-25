// ER Section: Static pages — Privacy, Terms, Resources
function renderPrivacy() {
    return `
        <div class="bg-white min-h-screen py-16 px-4 sm:px-6 lg:px-8">
            <div class="max-w-4xl mx-auto">
                <div class="mb-10">
                    <span class="text-er-accent font-bold text-xs tracking-widest uppercase">Privacy</span>
                    <h2 class="text-3xl md:text-4xl font-bold text-er-dark mt-3">개인정보를 다루는 마음</h2>
                    <p class="mt-3 text-sm text-gray-500 break-keep">공개 사이트의 신청과 로그인 과정에서 받은 정보를 어떤 태도로 다루는지 차분히 안내합니다.</p>
                </div>
                <div class="space-y-4 text-sm text-gray-600 leading-relaxed">
                    <div class="rounded-2xl bg-er-base/60 border border-white/30 p-6 shadow-soft floating-card">ER은 신청서, 로그인, 문의 과정에서 이름, 연락처, 이메일, 제출 메시지와 같은 최소한의 정보를 받습니다.</div>
                    <div class="rounded-2xl bg-er-base/60 border border-white/30 p-6 shadow-soft floating-card">받은 정보는 상담 안내, 협력 응답, 운영상 필요한 계정 확인 목적에만 사용합니다.</div>
                    <div class="rounded-2xl bg-er-base/60 border border-white/30 p-6 shadow-soft floating-card">법적 보관 의무가 없는 한, 운영 목적이 끝난 정보는 정리 대상이 됩니다. 더 자세한 정책은 추후 별도 문서로 정리할 예정입니다.</div>
                </div>
            </div>
        </div>
    `;
}

function renderTerms() {
    return `
        <div class="bg-er-base min-h-screen py-16 px-4 sm:px-6 lg:px-8">
            <div class="max-w-4xl mx-auto">
                <div class="mb-10">
                    <span class="text-er-accent font-bold text-xs tracking-widest uppercase">Terms</span>
                    <h2 class="text-3xl md:text-4xl font-bold text-er-dark mt-3">이곳을 이용하는 기본 안내</h2>
                    <p class="mt-3 text-sm text-gray-500 break-keep">공개 사이트와 운영 포털을 이용하실 때 알아두시면 좋은 기본 원칙을 짧게 정리했습니다.</p>
                </div>
                <div class="space-y-4 text-sm text-gray-600 leading-relaxed">
                    <div class="rounded-2xl bg-white border border-white/40 p-6 shadow-soft floating-card">공개 사이트의 정보는 ER의 사역과 참여 방법을 소개하기 위한 목적입니다.</div>
                    <div class="rounded-2xl bg-white border border-white/40 p-6 shadow-soft floating-card">운영 포털과 코치 앱은 승인된 코치와 기존 참여자를 위한 내부 기능이며, 일반 방문자는 공개 안내와 문의 경로를 먼저 이용합니다.</div>
                    <div class="rounded-2xl bg-white border border-white/40 p-6 shadow-soft floating-card">프로그램 일정과 구성, 제공 방식은 대상과 협력 구조에 따라 달라질 수 있습니다.</div>
                </div>
            </div>
        </div>
    `;
}

function renderResources() {
    return `
        <div class="bg-er-base min-h-screen py-16 px-4">
            <div class="max-w-4xl mx-auto">
                <div class="text-center mb-12 animate-fade-in-up">
                    <h2 class="text-2xl md:text-3xl font-bold text-gray-900">자료실 (Resources)</h2>
                    <p class="mt-2 text-sm text-gray-500">회복을 위한 전문 지식과 추천 자료를 모았습니다.</p>
                </div>

                <div class="space-y-6 animate-fade-in-up" style="animation-delay: 0.1s;">
                    
                    <div onclick="renderSection('types_guide')" class="group bg-white rounded-[2rem] p-6 md:p-8 shadow-soft floating-card cursor-pointer relative overflow-hidden border border-white/40">
                        <div class="absolute top-0 right-0 w-48 h-48 bg-er-accent/10 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-er-accent/20 transition-all"></div>
                        
                        <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                            <div class="w-14 h-14 rounded-2xl bg-er-base flex items-center justify-center text-2xl text-er-dark shadow-inner shrink-0">
                                <i class="fas fa-fingerprint"></i>
                            </div>
                            <div class="flex-grow">
                                <div class="flex flex-wrap items-center gap-2 mb-2">
                                    <span class="px-2 py-0.5 bg-er-accent/10 text-er-accent text-[9px] font-bold rounded uppercase">Featured</span>
                                    <h3 class="text-lg md:text-xl font-bold text-gray-900 group-hover:text-er-accent transition-colors">9가지 유형별 회복의 길</h3>
                                </div>
                                <p class="text-gray-600 text-sm leading-relaxed break-keep">
                                    단순한 성격 분류를 넘어, 각 유형이 붙잡히기 쉬운 지점과 회복을 향해 걸어갈 수 있는 길을 소개합니다.
                                </p>
                            </div>
                            <div class="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 group-hover:bg-er-dark group-hover:text-white group-hover:border-transparent transition-all self-end md:self-center">
                                <i class="fas fa-arrow-right text-sm"></i>
                            </div>
                        </div>
                    </div>

                    <div class="grid md:grid-cols-2 gap-4 md:gap-6">
                        <div class="bg-er-dark text-white rounded-[2rem] p-6 md:p-8 flex flex-col justify-between shadow-card floating-card">
                            <div>
                                <div class="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4 text-lg"><i class="fas fa-clipboard-check"></i></div>
                                <h3 class="text-lg font-bold mb-1">에니어그램 적응형 테스트</h3>
                                <p class="text-gray-300 text-xs md:text-sm break-keep">약식 테스트를 통해 현재의 핵심 동기와 관계 패턴을 살펴보세요.</p>
                            </div>
                            <button onclick="renderSection('test')" class="mt-6 w-full py-3 bg-white text-er-dark rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors">
                                테스트 시작하기
                            </button>
                        </div>

                        <div class="bg-white rounded-[2rem] p-6 md:p-8 shadow-soft border border-white/40 floating-card">
                            <div class="flex items-center gap-2 mb-5">
                                <i class="fas fa-book text-er-accent text-lg"></i>
                                <h3 class="text-lg font-bold text-gray-900">추천 도서</h3>
                            </div>
                            <ul class="space-y-4">
                                <li class="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                                    <span class="text-gray-300 font-serif italic text-base mt-0.5">01</span>
                                    <div>
                                        <h4 class="text-sm font-bold text-gray-800">에니어그램의 지혜</h4>
                                        <p class="text-xs text-gray-500">Don Richard Riso &middot; 필독서</p>
                                    </div>
                                </li>
                                <li class="flex items-start gap-3">
                                    <span class="text-gray-300 font-serif italic text-base mt-0.5">02</span>
                                    <div>
                                        <h4 class="text-sm font-bold text-gray-800">내면의 감옥에서 벗어나라</h4>
                                        <p class="text-xs text-gray-500">Richard Rohr &middot; 영성/치유</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}


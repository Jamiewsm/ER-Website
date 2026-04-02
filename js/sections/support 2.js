function renderSupport() {
    return `
        <div class="bg-er-base min-h-screen py-16 md:py-20 px-4 sm:px-6 lg:px-8">
            <div class="max-w-6xl mx-auto">
                <div class="text-center mb-12 animate-fade-in-up">
                    <span class="text-er-accent font-bold text-xs tracking-widest uppercase">사역지원</span>
                    <h2 class="text-3xl md:text-5xl font-bold text-er-dark mt-3 break-keep">목회자·선교사 사역지원 트랙</h2>
                    <p class="mt-4 text-sm md:text-base text-gray-500 max-w-3xl mx-auto break-keep">
                        ER은 목회자·선교사를 위한 무료/감면 원칙을 유지합니다. 사역지원 신청은 심사형으로 운영되며, 후원금은 해당 트랙의 접근성을 지키는 데 우선 사용됩니다.
                    </p>
                </div>

                <div class="grid gap-4 md:grid-cols-5 mb-10 animate-fade-in-up">
                    ${[
                        ['300명+', '지금까지 섬긴 인원'],
                        ['350회+', '누적 세션 수'],
                        ['10곳', '협력 교회·기관'],
                        ['7명', '함께하는 코치'],
                        ['20명+', '훈련 참가자'],
                    ].map(([value, label]) => `
                        <div class="rounded-[2rem] bg-white border border-white/40 p-6 text-center shadow-soft floating-card">
                            <div class="text-2xl md:text-3xl font-extrabold text-er-dark">${value}</div>
                            <div class="mt-2 text-xs md:text-sm text-gray-500 break-keep">${label}</div>
                        </div>
                    `).join('')}
                </div>

                <div class="grid gap-6 lg:grid-cols-[1fr_1fr] animate-fade-in-up">
                    <div class="rounded-[2rem] bg-white border border-white/40 p-7 shadow-soft floating-card">
                        <h3 class="text-xl font-bold text-er-dark mb-4">사역지원 운영 방식</h3>
                        <div class="grid gap-4">
                            ${[
                                ['지원 대상', '목회자·선교사(개인) 중심으로 무료/감면을 적용합니다.'],
                                ['운영 방식', '월별 지원 슬롯 한도 내에서 심사 후 배정합니다.'],
                                ['후원 사용처', '사역지원 세션과 코치 운영비, 필수 자료 제공에 우선 사용합니다.'],
                            ].map(([title, body]) => `
                                <div class="rounded-2xl bg-er-base/60 border border-white/30 p-5 shadow-soft floating-card">
                                    <h4 class="font-bold text-er-dark mb-2">${title}</h4>
                                    <p class="text-sm text-gray-600 break-keep">${body}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="rounded-[2rem] bg-er-dark text-white p-7 shadow-card floating-card">
                        <h3 class="text-xl font-bold mb-4">후원이 사용되는 곳</h3>
                        <div class="space-y-4 text-sm text-gray-200">
                            <div class="rounded-2xl bg-white/10 border border-white/10 p-4">1. 목회자와 선교사, 그리고 회복이 시급한 분들의 접근성을 지키는 데 사용됩니다.</div>
                            <div class="rounded-2xl bg-white/10 border border-white/10 p-4">2. 상담과 교육, 훈련 프로그램이 더 정성스럽게 이어지도록 돕습니다.</div>
                            <div class="rounded-2xl bg-white/10 border border-white/10 p-4">3. 협력 공동체와 코치 훈련 네트워크가 넓어지도록 뒷받침합니다.</div>
                        </div>
                        <p class="mt-4 text-xs text-gray-300 break-keep">후원은 현재 개별 안내 방식으로 운영되며, 세액공제 영수증은 제공되지 않을 수 있습니다.</p>
                        <button onclick="renderSection('apply', { track: 'support' })" class="mt-6 w-full rounded-full bg-white py-3 text-sm font-bold text-er-dark hover:bg-er-accentLight transition-colors">
                            후원·협력 문의
                        </button>
                    </div>
                </div>

                <div class="mt-10 rounded-[2rem] bg-white border border-white/40 p-7 shadow-soft animate-fade-in-up">
                    <h3 class="text-xl font-bold text-er-dark mb-4">함께 지키는 운영 원칙</h3>
                    <div class="grid gap-4 md:grid-cols-3 text-sm text-gray-600">
                        <div class="rounded-2xl bg-er-base/60 p-5 border border-white/30 shadow-soft floating-card">후원 여부와 관계없이 먼저 필요를 듣고 적절한 연결을 돕습니다.</div>
                        <div class="rounded-2xl bg-er-base/60 p-5 border border-white/30 shadow-soft floating-card">협력 요청은 목적과 대상, 현장에 맞추어 개별적으로 설계합니다.</div>
                        <div class="rounded-2xl bg-er-base/60 p-5 border border-white/30 shadow-soft floating-card">공개 사이트는 안내 창구로, 운영 포털은 내부 도구로 분리해 운영합니다.</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

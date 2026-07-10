function renderSupport() {
    return `
        <div class="bg-er-base min-h-screen">
            <section class="bg-er-dark text-white py-14 md:py-20 px-6 relative overflow-hidden rounded-b-[3rem]">
                <div class="absolute top-[-20%] right-[-10%] w-[420px] h-[420px] bg-er-green/20 rounded-full blur-[110px] pointer-events-none"></div>
                <div class="max-w-6xl mx-auto relative z-10 text-center">
                    <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] md:text-xs font-bold tracking-widest uppercase text-er-greenTint mb-5">Ministry Support</span>
                    <h2 class="font-display text-3xl md:text-5xl font-extrabold tracking-[-0.03em] break-keep">사역지원과 후원</h2>
                    <p class="mt-4 text-sm md:text-base text-white/80 max-w-2xl mx-auto break-keep leading-relaxed">
                        목회자·선교사 본인은 무료/감면 사역지원을 신청하시고, 사역을 함께 세워주시는 분은 후원·협력으로 동참하실 수 있습니다.
                    </p>
                </div>
            </section>

            <div class="px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <div class="max-w-6xl mx-auto">
                <div class="grid gap-6 lg:grid-cols-[1fr_1fr] animate-fade-in-up">
                    <div class="rounded-[2rem] bg-er-surface border border-er-sand/60 p-7 shadow-soft floating-card flex flex-col">
                        <div class="mb-3">
                            <span class="inline-block rounded-full bg-er-greenTint text-er-green text-[11px] font-bold uppercase tracking-widest px-3 py-1">받는 분 — 목회자·선교사</span>
                        </div>
                        <h3 class="text-xl font-bold text-er-inkSoft mb-4">사역지원 신청</h3>
                        <div class="grid gap-4 flex-1">
                            ${[
                                ['지원 대상', '목회자·선교사(개인) 중심으로 무료/감면을 적용합니다.'],
                                ['운영 방식', '월별 지원 슬롯 한도 내에서 심사 후 배정합니다.'],
                                ['후원 사용처', '사역지원 세션과 코치 운영비, 필수 자료 제공에 우선 사용합니다.'],
                            ].map(([title, body]) => `
                                <div class="rounded-2xl bg-er-base/60 border border-er-sand/50 p-5">
                                    <h4 class="font-bold text-er-inkSoft mb-2">${title}</h4>
                                    <p class="text-sm text-er-body break-keep">${body}</p>
                                </div>
                            `).join('')}
                        </div>
                        <button onclick="renderSection('apply', { track: 'ministry' })" class="mt-6 w-full rounded-full bg-er-green py-3 text-sm font-bold text-white hover:bg-er-greenDark transition-colors shadow-md hover:-translate-y-0.5">
                            사역지원 신청하기
                        </button>
                    </div>
                    <div class="rounded-[2rem] bg-er-dark text-white p-7 shadow-card floating-card flex flex-col border border-er-greenDeep/30">
                        <div class="mb-3">
                            <span class="inline-block rounded-full bg-white/15 text-er-greenTint text-[11px] font-bold uppercase tracking-widest px-3 py-1">주는 분 — 후원·협력</span>
                        </div>
                        <h3 class="text-xl font-bold mb-4">후원이 사용되는 곳</h3>
                        <div class="space-y-4 text-sm text-white/85 flex-1">
                            <div class="rounded-2xl bg-white/10 border border-white/10 p-4">1. 목회자와 선교사, 그리고 회복이 시급한 분들의 접근성을 지키는 데 사용됩니다.</div>
                            <div class="rounded-2xl bg-white/10 border border-white/10 p-4">2. 상담과 교육, 훈련 프로그램이 더 정성스럽게 이어지도록 돕습니다.</div>
                            <div class="rounded-2xl bg-white/10 border border-white/10 p-4">3. 협력 공동체와 코치 훈련 네트워크가 넓어지도록 뒷받침합니다.</div>
                        </div>
                        <p class="mt-4 text-xs text-white/70 break-keep">후원은 현재 개별 안내 방식으로 운영되며, 세액공제 영수증은 제공되지 않을 수 있습니다.</p>
                        <button onclick="renderSection('apply', { track: 'support' })" class="mt-6 w-full rounded-full border border-white/40 bg-transparent py-3 text-sm font-bold text-white hover:bg-white/10 transition-colors">
                            후원·협력 문의하기
                        </button>
                    </div>
                </div>

                <div class="mt-10 text-center text-xs text-er-muted animate-fade-in-up">
                    <p class="break-keep">ER의 운영 원칙과 협력 구조에 대한 자세한 안내는 <button onclick="renderSection('about')" class="font-bold text-er-green hover:text-er-greenDark transition-colors">ER 소개</button>에서 확인하실 수 있습니다.</p>
                </div>
            </div>
            </div>
        </div>
    `;
}

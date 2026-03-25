// ER Section: Support
function renderSupport() {
    const svgHeart = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;

    return `
        <div class="bg-[#FAF9F7] min-h-screen py-24 px-5">
            <div class="max-w-[1000px] mx-auto">
                <div class="text-center mb-16 animate-fade-in-up">
                    <span class="text-gray-400 font-bold text-[10px] tracking-[0.3em] uppercase block mb-4">Support Track</span>
                    <h2 class="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">목회자·선교사 사역지원 트랙</h2>
                    <p class="text-gray-500 text-sm md:text-base max-w-xl mx-auto break-keep font-light">
                        ER은 목회자·선교사를 위한 특별 지원 원칙을 유지합니다. 사역지원 신청은 심사형으로 운영되며, 커뮤니티의 후원은 이들의 회복 접근성을 지키는 데 가장 먼저 사용됩니다.
                    </p>
                </div>

                <div class="grid gap-6 md:grid-cols-5 mb-24 animate-fade-in-up">
                    ${[
                        ['300+', '섬긴 인원'],
                        ['350+', '누적 세션 수'],
                        ['10+', '협력 기관'],
                        ['7+', '전문 코치'],
                        ['20+', '훈련 참가자'],
                    ].map(([value, label]) => `
                        <div class="rounded-[2rem] bg-white border border-gray-100 p-8 text-center shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
                            <div class="absolute inset-0 bg-gray-50 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-0"></div>
                            <div class="relative z-10">
                                <div class="text-3xl md:text-4xl font-black text-gray-900 mb-2">${value}</div>
                                <div class="text-xs text-gray-500 break-keep font-medium uppercase tracking-widest">${label}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] mb-20 animate-fade-in-up">
                    <div class="rounded-[2.5rem] bg-white border border-gray-100 p-8 md:p-10 shadow-sm flex flex-col justify-center">
                        <h3 class="text-2xl font-extrabold text-gray-900 mb-8 tracking-tight">사역지원 운영 방식</h3>
                        <div class="grid gap-5">
                            ${[
                                ['지원 대상 우선순위', '우선적으로 목회자와 선교사 개인을 위한 긴급/회복 과정에 무료 및 감면을 적용합니다.'],
                                ['운영 및 배정 방식', '월별로 할당된 사역지원 코칭 슬롯 한도 내에서 팀 심사 후 순차 배정됩니다.'],
                                ['투명한 후원금 사용', '사역지원 대상자의 필수 세션 비용, 전문 코치 운영비, 그리고 자체 실습 자료 개발에 사용됩니다.'],
                            ].map(([title, body]) => `
                                <div class="rounded-2xl bg-[#FAF9F7] border border-gray-50 p-6 flex flex-col justify-center">
                                    <h4 class="font-bold text-gray-900 mb-2 text-base">${title}</h4>
                                    <p class="text-sm text-gray-500 break-keep font-light leading-relaxed">${body}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="rounded-[2.5rem] bg-gray-900 text-white p-8 md:p-10 shadow-xl relative overflow-hidden group">
                        <div class="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] bg-white/5 rounded-full blur-[60px] z-0 pointer-events-none group-hover:bg-white/10 transition-colors duration-700"></div>
                        <div class="relative z-10 flex flex-col h-full">
                            <span class="inline-flex px-3.5 py-1 rounded-full bg-white/10 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-300 mb-4 border border-white/10 self-start">Where It Goes</span>
                            <h3 class="text-2xl font-extrabold mt-2 mb-8 tracking-tight">후원이 사용되는 곳</h3>
                            <div class="space-y-4 text-sm text-gray-300 font-light flex-grow">
                                <div class="rounded-2xl border border-white/10 bg-white/5 p-5 flex items-start gap-4">
                                    <div class="text-gray-400 font-black text-xl w-6">1</div>
                                    <div class="leading-relaxed">목회자와 선교사, 그리고 <span class="text-white font-bold">회복이 시급한 분들의 접근성</span>을 지키는 데 일차적으로 사용됩니다.</div>
                                </div>
                                <div class="rounded-2xl border border-white/10 bg-white/5 p-5 flex items-start gap-4">
                                    <div class="text-gray-400 font-black text-xl w-6">2</div>
                                    <div class="leading-relaxed">일회성이 아닌 의미 있는 과정이 되도록 상담과 <span class="text-white font-bold">기반 교육, 훈련 자료 제작</span>을 돕습니다.</div>
                                </div>
                                <div class="rounded-2xl border border-white/10 bg-white/5 p-5 flex items-start gap-4">
                                    <div class="text-gray-400 font-black text-xl w-6">3</div>
                                    <div class="leading-relaxed">더 넓은 회복의 망을 제공하기 위한 <span class="text-white font-bold">협력 공동체와 코치 네트워크 확장</span>을 뒷받침합니다.</div>
                                </div>
                            </div>
                            <p class="mt-8 text-[11px] text-gray-400 break-keep font-medium mb-6">※ 개인 후원은 현재 안내 계좌 이체 방식으로 운영되며, 아직 세액공제 영수증은 발급되지 않습니다.</p>
                            <button onclick="renderSection('apply', { track: 'support' })" class="w-full rounded-2xl bg-white py-4 text-sm font-bold text-gray-900 hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm">
                                ${svgHeart} 후원·협력 문의하기
                            </button>
                        </div>
                    </div>
                </div>

                <div class="rounded-[2.5rem] bg-white border border-gray-100 p-8 md:p-10 shadow-sm animate-fade-in-up">
                    <h3 class="text-2xl font-extrabold text-gray-900 mb-8 tracking-tight text-center">함께 지키는 운영 원칙</h3>
                    <div class="grid gap-6 md:grid-cols-3">
                        ${[
                            '후원금 전액은 일선 목회자와 선교사들의 회복 과정을 무료로 지원하는 트랙을 여는 데 온전히 투입됩니다.',
                            '연합 및 협력 요청은 단체의 성격과 회복 목적, 그리고 현장의 상황에 맞추어 매우 신중하고 개별적으로 설계합니다.',
                            '퍼블릭 사이트는 철저히 안내 창구로 활용되며 개인 보호를 위해 실제 운영 포털은 내부 도구로 완전히 분리해 운영합니다.'
                        ].map(principle => `
                            <div class="rounded-2xl bg-[#FAF9F7] p-6 border border-gray-50 shadow-sm hover:-translate-y-1 transition-transform">
                                <p class="text-sm text-gray-500 font-light leading-relaxed break-keep pr-2 mt-1">${principle}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
}


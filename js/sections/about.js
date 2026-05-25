function renderAbout() {
    return `
        <div class="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
            <div class="max-w-6xl mx-auto">
                <div class="text-center mb-16 md:mb-24 animate-fade-in-up">
                    <h2 class="text-xs font-bold tracking-[0.3em] text-er-accent mb-4 md:mb-5">
                        ABOUT ER
                    </h2>
                    <h3 class="text-2xl md:text-4xl font-bold text-er-dark leading-snug mb-8 break-keep">
                        ER은 개인의 회복이<br>
                        가정과 공동체의 회복으로 이어지도록 돕습니다.
                    </h3>
                    <div class="flex justify-center items-center gap-3">
                        <span class="w-8 h-px bg-er-accent/30"></span>
                        <span class="w-1.5 h-1.5 rounded-full bg-er-accent/50"></span>
                        <span class="w-8 h-px bg-er-accent/30"></span>
                    </div>
                </div>      

                <div class="bg-er-base/70 rounded-[2.5rem] p-8 md:p-12 shadow-soft mb-16 md:mb-20 animate-fade-in-up border border-white/40">
                    <div class="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 md:gap-10 items-start">
                        <div class="space-y-5">
                            <div class="bg-white rounded-2xl border border-white/40 shadow-soft p-5 md:p-6 floating-card">
                                <h4 class="font-bold text-er-dark text-base md:text-lg mb-2">ER 사역의 시작</h4>
                                <p class="text-sm text-gray-600 leading-relaxed break-keep">
                                    ER은 중동 선교와 캠퍼스 사역의 현장에서 목회자와 선교사, 사역 공동체가 겪는 소진과 관계의 어려움을 가까이에서 보며,
                                    자기 이해의 회복이 관계의 회복으로 이어지고, 그 회복이 공동체의 건강으로 확장되어야 한다는 문제의식에서 시작되었습니다.
                                </p>
                            </div>
                            <div class="grid sm:grid-cols-2 gap-4">
                                <div class="p-5 bg-white rounded-2xl border border-white/40 shadow-soft floating-card">
                                    <h4 class="font-bold text-er-dark text-sm mb-2">우리가 지향하는 회복</h4>
                                    <p class="text-xs text-gray-500 break-keep">자기 이해와 정서의 회복, 관계의 회복, 공동체 돌봄이 자연스럽게 이어지는 회복을 지향합니다.</p>
                                </div>
                                <div class="p-5 bg-white rounded-2xl border border-white/40 shadow-soft floating-card">
                                    <h4 class="font-bold text-er-dark text-sm mb-2">운영 방식</h4>
                                    <p class="text-xs text-gray-500 break-keep">코치와 협력자, 파트너 공동체와 함께 후원과 협력 기반의 사역으로 운영합니다.</p>
                                </div>
                                <div class="p-5 bg-white rounded-2xl border border-white/40 shadow-soft floating-card">
                                    <h4 class="font-bold text-er-dark text-sm mb-2">핵심 접근</h4>
                                    <p class="text-xs text-gray-500 break-keep">기독교 세계관과 에니어그램을 통합적으로 적용하여 개인과 공동체를 함께 돌봅니다.</p>
                                </div>
                                <div class="p-5 bg-white rounded-2xl border border-white/40 shadow-soft floating-card">
                                    <h4 class="font-bold text-er-dark text-sm mb-2">협력 구조</h4>
                                    <p class="text-xs text-gray-500 break-keep">교회와 기관, 사역자, 훈련 중인 코치들과 함께 프로그램을 설계하고 운영합니다.</p>
                                </div>
                            </div>
                        </div>

                        <div class="space-y-4">
                            <div class="bg-white rounded-2xl border border-white/40 shadow-soft p-5 md:p-6 floating-card">
                                <p class="text-[10px] tracking-widest text-er-accent font-bold uppercase mb-3">How We Work</p>
                                <div class="space-y-3 text-sm text-gray-600">
                                    <div class="flex items-start gap-3">
                                        <i class="fas fa-check-circle text-er-accent mt-0.5"></i>
                                        <span class="break-keep">ER은 사역의 목적과 참여 대상, 후원과 협력의 길을 투명하게 안내하는 회복 사역입니다.</span>
                                    </div>
                                    <div class="flex items-start gap-3">
                                        <i class="fas fa-check-circle text-er-accent mt-0.5"></i>
                                        <span class="break-keep">후원 여부와 관계없이 먼저 필요를 듣고, 각 사람과 공동체에 맞는 회복의 방향을 함께 찾습니다.</span>
                                    </div>
                                    <div class="flex items-start gap-3">
                                        <i class="fas fa-check-circle text-er-accent mt-0.5"></i>
                                        <span class="break-keep">파트너 교회와 기관, 코치 네트워크와 함께 각 지역과 공동체에 맞는 프로그램을 연결합니다.</span>
                                    </div>
                                </div>
                            </div>
                            <div class="grid sm:grid-cols-2 gap-4">
                                <div class="p-4 bg-white rounded-2xl border border-white/40 shadow-soft floating-card">
                                    <h4 class="font-bold text-er-dark text-xs md:text-sm mb-1">Partner Ministries</h4>
                                    <p class="text-xs text-gray-500 break-keep">교회와 기관이 지역의 회복 과제를 함께 다루도록 연결합니다.</p>
                                </div>
                                <div class="p-4 bg-white rounded-2xl border border-white/40 shadow-soft floating-card">
                                    <h4 class="font-bold text-er-dark text-xs md:text-sm mb-1">Qualified Collaborators</h4>
                                    <p class="text-xs text-gray-500 break-keep">검증된 코치와 교육 협력자가 프로그램을 함께 설계합니다.</p>
                                </div>
                                <div class="p-4 bg-white rounded-2xl border border-white/40 shadow-soft floating-card">
                                    <h4 class="font-bold text-er-dark text-xs md:text-sm mb-1">Support-Based Operations</h4>
                                    <p class="text-xs text-gray-500 break-keep">후원과 협력이 더 많은 개인과 공동체에게 회복 기회를 넓힙니다.</p>
                                </div>
                                <div class="p-4 bg-white rounded-2xl border border-white/40 shadow-soft floating-card">
                                    <h4 class="font-bold text-er-dark text-xs md:text-sm mb-1">Public Trust</h4>
                                    <p class="text-xs text-gray-500 break-keep">사역의 목적과 방향을 공개적으로 설명해 신뢰를 쌓습니다.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mt-16 rounded-[2.5rem] bg-er-dark p-8 md:p-10 text-white shadow-card animate-fade-in-up">
                    <div class="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
                        <div>
                            <span class="text-[10px] tracking-widest text-er-accent font-bold uppercase">Next Step</span>
                            <h3 class="mt-3 text-xl md:text-2xl font-bold break-keep">ER이 어떻게 일하는지 보셨다면, 함께할 코치를 만나보세요.</h3>
                            <p class="mt-3 text-sm md:text-[15px] text-gray-300 leading-relaxed break-keep">
                                손지영 대표를 비롯해 7명의 코치 프로필과 자격, 전문 분야는 코치 소개 페이지에서 확인하실 수 있습니다.
                            </p>
                        </div>
                        <div class="flex flex-col sm:flex-row lg:flex-col gap-3">
                            <button onclick="renderSection('coaches')" class="inline-flex items-center justify-center rounded-full bg-er-accent px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-er-accentDark">
                                코치 소개 보기
                            </button>
                            <button onclick="renderSection('programs', { tab: 'individual' })" class="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/5 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10">
                                프로그램 보기
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

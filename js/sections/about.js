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

                <div class="animate-fade-in-up">
                    <h3 class="text-xl md:text-2xl font-bold text-center text-er-dark mb-3">함께하는 코치진</h3>
                    <p class="text-center text-sm text-gray-500 mb-8 break-keep">ER은 한 사람을 소개하는 사이트가 아니라, 코치와 협력자 네트워크가 함께 운영하는 회복 사역입니다.</p>
                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
                        ${['김수잔', '서초윤', '정익훈', '정경하', '주찬미', '임효조', '최다영'].map(name => `
                            <div class="bg-white rounded-2xl p-5 text-center shadow-soft border border-white/40 floating-card">
                                <div class="w-14 h-14 mx-auto bg-gray-50 rounded-full flex items-center justify-center text-lg font-bold text-gray-400 mb-3">
                                    ${name.substring(0,1)}
                                </div>
                                <h4 class="font-bold text-gray-900 text-sm">${name}</h4>
                                <p class="text-[10px] text-er-accent mt-1 uppercase tracking-wide">Collaborator</p>
                            </div>
                        `).join('')}
                        <div class="bg-gray-50 rounded-2xl p-5 flex flex-col items-center justify-center text-center border border-dashed border-gray-300 cursor-pointer hover:bg-gray-100 transition-colors" onclick="renderSection('notices')">
                            <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-300 mb-2 shadow-sm"><i class="fas fa-plus"></i></div>
                            <p class="text-[10px] text-gray-500 font-medium">전문가 과정<br>모집 중</p>
                        </div>
                    </div>
                </div>

                <div class="mt-16 bg-white rounded-[2.5rem] p-8 md:p-10 shadow-soft border border-white/40 animate-fade-in-up">
                    <div class="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] items-center">
                        <div class="relative group flex flex-col items-center text-center">
                            <div class="relative mb-4">
                                <div class="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden shadow-card bg-gray-200 ring-4 ring-white">
                                    <img src="son-profile-picture.png" alt="Jiyoung Son" class="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" onerror="this.src='https://via.placeholder.com/300x300?text=Profile';">
                                </div>
                                <div class="absolute -inset-3 rounded-full border border-er-accent/20 pointer-events-none"></div>
                            </div>
                            <p class="text-[10px] tracking-widest text-er-accent font-bold uppercase">Founder</p>
                            <h3 class="text-2xl font-extrabold text-er-dark mt-2">손지영</h3>
                        </div>

                        <div>
                            <h3 class="text-xl md:text-2xl font-bold text-er-dark mb-4 break-keep">Founder 소개</h3>
                            <p class="text-sm md:text-base text-gray-500 leading-relaxed break-keep mb-5">
                                손지영 대표는 에니어그램과 기독교 세계관을 통합적으로 적용하여 개인과 공동체의 회복을 돕는 비전을 품고 ER을 시작했습니다.
                            </p>
                            <div class="grid sm:grid-cols-2 gap-4">
                                <div class="p-4 bg-er-base rounded-2xl border border-white/30 shadow-soft floating-card">
                                    <h4 class="font-bold text-er-dark text-xs md:text-sm mb-1">Enneagram Spectrum Advanced Certification</h4>
                                    <p class="text-xs text-gray-500">Dr. Wagner (International Enneagram Association)</p>
                                </div>
                                <div class="p-4 bg-er-base rounded-2xl border border-white/30 shadow-soft floating-card">
                                    <h4 class="font-bold text-er-dark text-xs md:text-sm mb-1">IEA Accredited Professional</h4>
                                    <p class="text-xs text-gray-500">국제 에니어그램 협회 인증 전문가</p>
                                </div>
                                <div class="p-4 bg-er-base rounded-2xl border border-white/30 shadow-soft floating-card">
                                    <h4 class="font-bold text-er-dark text-xs md:text-sm mb-1">SOIM GLTC Instructor</h4>
                                    <p class="text-xs text-gray-500">소임 글로벌 리더십 트레이닝 강사</p>
                                </div>
                                <div class="p-4 bg-er-base rounded-2xl border border-white/30 shadow-soft floating-card">
                                    <h4 class="font-bold text-er-dark text-xs md:text-sm mb-1">DTS Counseling</h4>
                                    <p class="text-xs text-gray-500">Dallas Theological Seminary 석사 과정</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ER Section: About
function renderAbout() {
    const svgCheck = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>`;

    return `
        <div class="py-24 px-5 bg-white relative overflow-hidden min-h-screen">
            <div class="max-w-[1000px] mx-auto">
                <div class="text-center mb-20 md:mb-28 animate-fade-in-up">
                    <h2 class="text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase mb-6">
                        About ER
                    </h2>
                    <h3 class="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-10 tracking-tight break-keep">
                        개인의 회복이<br>
                        가정과 공동체의 회복으로 이어집니다.
                    </h3>
                    <div class="flex justify-center items-center gap-4">
                        <span class="w-12 h-[1px] bg-gray-200"></span>
                        <span class="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                        <span class="w-12 h-[1px] bg-gray-200"></span>
                    </div>
                </div>      

                <div class="bg-[#FAF9F7] rounded-[2.5rem] p-10 md:p-14 shadow-sm mb-20 md:mb-28 animate-fade-in-up border border-gray-100">
                    <div class="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 md:gap-14 items-start">
                        <div class="space-y-6">
                            <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 hover:shadow-md transition-shadow">
                                <h4 class="font-extrabold text-gray-900 text-xl md:text-2xl mb-4 tracking-tight">ER 사역의 시작</h4>
                                <p class="text-base text-gray-600 leading-relaxed font-light break-keep">
                                    ER은 중동 선교와 캠퍼스 사역의 현장에서 목회자와 선교사, 사역 공동체가 겪는 소진과 관계의 어려움을 가까이에서 보며,
                                    자기 이해의 회복이 관계의 회복으로 이어지고, 그 회복이 공동체의 건강으로 확장되어야 한다는 문제의식에서 시작되었습니다.
                                </p>
                            </div>
                            <div class="grid sm:grid-cols-2 gap-5">
                                <div class="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:-translate-y-1 transition-transform duration-300">
                                    <h4 class="font-bold text-gray-900 text-sm mb-3">우리가 지향하는 회복</h4>
                                    <p class="text-xs text-gray-500 font-light break-keep leading-relaxed">자기 이해와 정서의 회복, 관계의 회복, 공동체 돌봄이 자연스럽게 이어지는 회복을 지향합니다.</p>
                                </div>
                                <div class="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:-translate-y-1 transition-transform duration-300">
                                    <h4 class="font-bold text-gray-900 text-sm mb-3">운영 방식</h4>
                                    <p class="text-xs text-gray-500 font-light break-keep leading-relaxed">코치와 협력자, 파트너 공동체와 함께 후원과 협력 기반의 사역으로 운영합니다.</p>
                                </div>
                                <div class="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:-translate-y-1 transition-transform duration-300">
                                    <h4 class="font-bold text-gray-900 text-sm mb-3">핵심 접근</h4>
                                    <p class="text-xs text-gray-500 font-light break-keep leading-relaxed">기독교 세계관과 에니어그램을 통합적으로 적용하여 개인과 공동체를 함께 돌봅니다.</p>
                                </div>
                                <div class="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:-translate-y-1 transition-transform duration-300">
                                    <h4 class="font-bold text-gray-900 text-sm mb-3">협력 구조</h4>
                                    <p class="text-xs text-gray-500 font-light break-keep leading-relaxed">교회와 기관, 사역자, 훈련 중인 코치들과 함께 프로그램을 설계하고 운영합니다.</p>
                                </div>
                            </div>
                        </div>

                        <div class="space-y-6">
                            <div class="bg-gray-900 rounded-3xl p-8 md:p-10 shadow-xl relative overflow-hidden group text-white">
                                <div class="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] bg-white/5 rounded-full blur-[60px] z-0 pointer-events-none group-hover:bg-white/10 transition-colors duration-700"></div>
                                <div class="relative z-10">
                                    <p class="text-[10px] tracking-[0.2em] text-gray-400 font-bold uppercase mb-6 inline-flex px-3 py-1 border border-white/20 rounded-full">How We Work</p>
                                    <div class="space-y-5 text-sm font-light text-gray-300">
                                        <div class="flex items-start gap-4">
                                            <div class="mt-0.5 text-white/60">${svgCheck}</div>
                                            <span class="break-keep leading-relaxed text-gray-300">ER은 사역의 목적과 참여 대상, 후원과 협력의 길을 <span class="text-white font-bold">투명하게 안내하는</span> 회복 사역입니다.</span>
                                        </div>
                                        <div class="flex items-start gap-4">
                                            <div class="mt-0.5 text-white/60">${svgCheck}</div>
                                            <span class="break-keep leading-relaxed text-gray-300">목회자·선교사는 <span class="text-white font-bold">무료 지원</span>으로, 개인·기업은 <span class="text-white font-bold">정식 코칭</span>으로 현장의 필요를 채웁니다.</span>
                                        </div>
                                        <div class="flex items-start gap-4">
                                            <div class="mt-0.5 text-white/60">${svgCheck}</div>
                                            <span class="break-keep leading-relaxed text-gray-300">파트너 교회와 기관, 네트워크가 모여 각 지역에 <span class="text-white font-bold">맞는 프로그램</span>을 연결합니다.</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="grid sm:grid-cols-2 gap-5">
                                <div class="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm cursor-default hover:shadow-md transition-shadow">
                                    <h4 class="font-bold text-gray-900 text-xs md:text-sm mb-2">Partner Ministries</h4>
                                    <p class="text-[11px] font-light text-gray-500 break-keep leading-relaxed">교회와 기관이 지역의 회복 과제를 함께 다루도록 돕습니다.</p>
                                </div>
                                <div class="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm cursor-default hover:shadow-md transition-shadow">
                                    <h4 class="font-bold text-gray-900 text-xs md:text-sm mb-2">Collaborators</h4>
                                    <p class="text-[11px] font-light text-gray-500 break-keep leading-relaxed">검증된 전문가와 코치진이 깊이 있는 프로그램을 설계합니다.</p>
                                </div>
                                <div class="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm cursor-default hover:shadow-md transition-shadow">
                                    <h4 class="font-bold text-gray-900 text-xs md:text-sm mb-2">Support-Based</h4>
                                    <p class="text-[11px] font-light text-gray-500 break-keep leading-relaxed">지속 가능한 후원과 연결이 회복의 기회를 폭넓게 제공합니다.</p>
                                </div>
                                <div class="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm cursor-default hover:shadow-md transition-shadow">
                                    <h4 class="font-bold text-gray-900 text-xs md:text-sm mb-2">Public Trust</h4>
                                    <p class="text-[11px] font-light text-gray-500 break-keep leading-relaxed">사역의 방향과 예산 활용을 투명하고 공개적으로 안내합니다.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="animate-fade-in-up mb-28">
                    <h3 class="text-2xl md:text-3xl font-extrabold text-center text-gray-900 mb-4 tracking-tight">함께하는 코치진</h3>
                    <p class="text-center text-sm font-light text-gray-500 mb-10 max-w-2xl mx-auto break-keep">ER은 한 사람을 소개하는 사이트가 아니라, 전문 코치와 협력자 네트워크가 함께 운영하고 지탱하는 회복 커뮤니티입니다.</p>
                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 md:gap-6">
                        ${['김수잔', '서초윤', '정익훈', '정경하', '주찬미', '임효조', '최다영'].map(name => `
                            <div class="bg-white rounded-[2rem] p-6 text-center shadow-sm border border-gray-100 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                                <div class="w-16 h-16 mx-auto bg-[#FAF9F7] border border-gray-50 rounded-full flex items-center justify-center text-xl font-black text-gray-300 mb-4">
                                    ${name.substring(0,1)}
                                </div>
                                <h4 class="font-bold text-gray-900 text-sm md:text-base">${name}</h4>
                                <p class="text-[9px] text-gray-400 mt-1 uppercase tracking-widest font-bold">Collaborator</p>
                            </div>
                        `).join('')}
                        <div class="bg-[#FAF9F7] rounded-[2rem] p-6 flex flex-col items-center justify-center text-center border border-dashed border-gray-200 cursor-pointer hover:bg-white hover:shadow-sm hover:border-gray-300 transition-all duration-300 group" onclick="renderSection('notices')">
                            <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-300 mb-3 shadow-sm group-hover:scale-110 group-active:scale-95 transition-transform"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></div>
                            <p class="text-[10px] text-gray-500 font-bold uppercase tracking-widest">전문가 과정<br>모집 중</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-[3rem] p-10 md:p-14 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 animate-fade-in-up relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-64 h-64 bg-gray-50 rounded-full blur-[80px] -z-10"></div>
                    <div class="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] items-center">
                        <div class="flex flex-col items-center text-center">
                            <div class="relative mb-6">
                                <div class="w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden shadow-lg bg-gray-100 ring-8 ring-white z-10 relative">
                                    <img src="son-profile-picture.png" alt="Jiyoung Son" class="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700" onerror="this.src='https://via.placeholder.com/300x300?text=Profile';">
                                </div>
                                <div class="absolute -inset-4 rounded-full border border-gray-100 pointer-events-none z-0"></div>
                            </div>
                            <p class="text-[10px] tracking-[0.3em] text-gray-400 font-bold uppercase">Founder</p>
                            <h3 class="text-3xl font-black text-gray-900 mt-2 tracking-tight">손지영 <span class="text-lg font-medium text-gray-400 ml-1">사모</span></h3>
                        </div>

                        <div>
                            <h3 class="text-xl md:text-2xl font-extrabold text-gray-900 mb-5 tracking-tight break-keep">설립자 소개</h3>
                            <p class="text-sm md:text-base text-gray-600 font-light leading-relaxed break-keep mb-8">
                                손지영 사모는 에니어그램과 기독교 세계관을 깊이 있게 통합하여, 표면적인 문제 해결을 넘어 개인과 공동체의 근원적 회복을 돕는 비전을 품고 본 커뮤니티를 설립했습니다. 중동과 캠퍼스 사역 현장에서 쌓은 풍부한 이해를 바탕으로 실질적인 회복 모델을 구축하고 있습니다.
                            </p>
                            <div class="grid sm:grid-cols-2 gap-4">
                                <div class="p-5 bg-[#FAF9F7] rounded-2xl border border-gray-50 hover:bg-white hover:shadow-sm transition-all duration-300">
                                    <h4 class="font-bold text-gray-900 text-xs md:text-sm mb-1.5 leading-snug">Enneagram Spectrum Advanced Certification</h4>
                                    <p class="text-[11px] text-gray-500 font-medium">Dr. Wagner (Intl. Enneagram Association)</p>
                                </div>
                                <div class="p-5 bg-[#FAF9F7] rounded-2xl border border-gray-50 hover:bg-white hover:shadow-sm transition-all duration-300">
                                    <h4 class="font-bold text-gray-900 text-xs md:text-sm mb-1.5 leading-snug">IEA Accredited Professional</h4>
                                    <p class="text-[11px] text-gray-500 font-medium">국제 에니어그램 협회 인증 전문가</p>
                                </div>
                                <div class="p-5 bg-[#FAF9F7] rounded-2xl border border-gray-50 hover:bg-white hover:shadow-sm transition-all duration-300">
                                    <h4 class="font-bold text-gray-900 text-xs md:text-sm mb-1.5 leading-snug">SOIM GLTC Instructor</h4>
                                    <p class="text-[11px] text-gray-500 font-medium">소임 글로벌 리더십 트레이닝 강사</p>
                                </div>
                                <div class="p-5 bg-[#FAF9F7] rounded-2xl border border-gray-50 hover:bg-white hover:shadow-sm transition-all duration-300">
                                    <h4 class="font-bold text-gray-900 text-xs md:text-sm mb-1.5 leading-snug">DTS Counseling</h4>
                                    <p class="text-[11px] text-gray-500 font-medium">Dallas Theological Seminary 석사 과정</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}


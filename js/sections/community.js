// ER Section: Community
function renderCommunity() {
    const storyFilter = state.currentPayload?.story || '';
    const stories = Array.isArray(publicTestimonials.stories) ? publicTestimonials.stories : [];
    const storyTagMap = {
        parenting: ['가정 회복', '부부·공동체'],
        couple: ['부부·공동체', '가정 회복'],
        personal: ['자기 이해', '자기 수용', '상담 깊이'],
        ministry: ['선교·사역'],
        church: ['부부·공동체', '선교·사역'],
        team: ['부부·공동체', '상담 깊이'],
        leadership: ['부부·공동체', '상담 깊이'],
        training: ['상담 깊이', '자기 이해']
    };
    const allowedTags = storyTagMap[storyFilter] || null;
    const filteredStories = storyFilter && allowedTags
        ? stories.filter((item) => allowedTags.includes(item.tag))
        : stories;
    const visibleStories = filteredStories.length ? filteredStories : stories;

    const svgChartPie = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>`;
    const svgCheckCircle = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;

    return `
        <div class="bg-[#FAF9F7] min-h-screen py-24 px-5">
            <div class="max-w-[1000px] mx-auto">
                <div class="text-center mb-16 animate-fade-in-up">
                    <span class="text-gray-400 font-bold text-[10px] tracking-[0.3em] uppercase block mb-4">Community Stories</span>
                    <h2 class="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">회복 이야기와 변화의 기록</h2>
                    <p class="text-gray-500 text-sm md:text-base max-w-xl mx-auto break-keep font-light">이 섹션은 실제 회복 사례와 후기, 카테고리별 변화 패턴을 담습니다. 커뮤니티의 연결이 가져오는 변화를 확인하세요.</p>
                </div>

                <div class="grid gap-6 md:grid-cols-4 mb-20 animate-fade-in-up">
                    ${[
                        ['300+', '연결된 참여자'],
                        ['350+', '상담·코칭 세션'],
                        ['10+', '협력 교회·기관'],
                        ['20+', '훈련 참여자']
                    ].map(([value, label]) => `
                        <div class="rounded-[2rem] border border-gray-100 bg-white p-8 text-center shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
                            <div class="absolute inset-0 bg-gray-50 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-0"></div>
                            <div class="relative z-10">
                                <p class="text-3xl md:text-4xl font-black text-gray-900 mb-2">${value}</p>
                                <p class="text-xs text-gray-500 break-keep font-medium uppercase tracking-widest">${label}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="mb-8 flex flex-col items-center animate-fade-in-up">
                    <h3 class="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Categories</h3>
                    <div class="flex flex-wrap justify-center gap-2 max-w-2xl">
                        ${['개인 회복', '부부·가정', '목회자·선교사', '교회 공동체', '리더십·팀', '훈련 참여자'].map((tag) => `
                            <span class="px-4 py-2 rounded-full text-xs font-bold bg-white border border-gray-100 text-gray-500 shadow-sm">${tag}</span>
                        `).join('')}
                    </div>
                </div>

                <div class="mb-10 flex flex-wrap justify-center items-center gap-3 animate-fade-in-up">
                    ${storyFilter ? `
                        <span class="inline-flex px-4 py-1.5 rounded-full bg-gray-900 text-white text-[10px] font-bold uppercase tracking-widest shadow-md">Filtered View</span>
                        <button onclick="renderSection('community')" class="inline-flex px-4 py-1.5 rounded-full border border-gray-200 bg-white text-[10px] font-bold text-gray-500 hover:text-gray-900 hover:border-gray-900 transition-all shadow-sm">
                            Clear Filter
                        </button>
                    ` : ''}
                </div>

                <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-24 animate-fade-in-up">
                    ${visibleStories.map((item) => `
                        <div class="rounded-[2.5rem] bg-white border border-gray-100 p-8 shadow-sm flex flex-col h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                            <span class="inline-flex self-start px-3 py-1 rounded-full bg-[#FAF9F7] border border-gray-50 text-gray-600 text-[10px] font-bold tracking-widest uppercase mb-5">${item.tag || 'Story'}</span>
                            <p class="text-sm text-gray-700 leading-relaxed break-keep font-light flex-grow">"${item.quote || ''}"</p>
                            <div class="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between">
                                <p class="text-sm font-bold text-gray-900">${item.person || ''}</p>
                                <p class="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">${item.meta || ''}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="grid lg:grid-cols-2 gap-8 mb-20 animate-fade-in-up">
                    <div class="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <h3 class="font-extrabold text-xl text-gray-900 mb-6 flex items-center gap-3 tracking-tight">
                            <div class="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-900 border border-gray-100">${svgChartPie}</div>
                            은혜가 흘러간 자리
                        </h3>
                        <p class="text-sm text-gray-500 mb-8 break-keep font-light leading-relaxed">상담과 교육 요청이 집중되는 주요 영역을 파악하여 커뮤니티의 우선순위와 협력 방향을 유연하게 조정합니다.</p>
                        <div class="chart-container h-64 w-full bg-[#FAF9F7] rounded-2xl border border-gray-50 p-4">
                            <canvas id="impactChart"></canvas>
                        </div>
                    </div>

                    <div class="bg-gray-900 text-white p-8 md:p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                        <div class="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] bg-white/5 rounded-full blur-[60px] z-0 pointer-events-none group-hover:bg-white/10 transition-colors duration-700"></div>
                        <div class="relative z-10">
                            <span class="inline-flex px-3.5 py-1 rounded-full bg-white/10 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-300 mb-4 border border-white/10">Directions</span>
                            <h3 class="text-2xl font-extrabold mt-2 mb-8 break-keep tracking-tight">반복적으로 나타난 변화의 방향</h3>
                            <div class="space-y-4">
                                ${publicTestimonials.impactThemes.map((item) => `
                                    <div class="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition-colors duration-300 backdrop-blur-sm">
                                        <div class="flex items-start gap-4">
                                            <div class="mt-0.5 text-white/50">${svgCheckCircle}</div>
                                            <div>
                                                <h4 class="text-base font-bold text-white mb-1.5">${item.title}</h4>
                                                <p class="text-xs leading-relaxed text-gray-400 break-keep font-light">${item.summary}</p>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="animate-fade-in-up" style="animation-delay: 0.1s;">
                    <div class="text-center mb-10">
                        <span class="text-gray-400 font-bold text-[10px] tracking-[0.3em] uppercase block mb-3">Philosophy</span>
                        <h3 class="text-2xl font-extrabold text-gray-900 tracking-tight">사역을 운영하는 방식</h3>
                    </div>
                    <div class="grid sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
                        ${[
                            ['협력 기반의 연대', '교회와 기관, 전문 코치와 협력자가 함께 건강한 사역의 구조를 세워 갑니다.'],
                            ['안전한 접근성', '자발적인 후원과 연대를 통해 더 많은 이들이 양질의 회복 과정에 참여하도록 돕습니다.'],
                            ['빠른 해결보다 깊은 형성', '증상의 단기적 완화보다 삶의 기저를 다지는 지속 가능한 루틴의 형성을 추구합니다.'],
                            ['신뢰와 투명성', '사역의 목적, 구체적인 운영 방향, 참여 과정을 직관적이고 투명하게 공개합니다.'],
                        ].map(([title, desc]) => `
                            <div class="bg-white rounded-[2rem] p-7 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                                <h4 class="font-bold text-gray-900 mb-3 text-lg">${title}</h4>
                                <p class="text-sm text-gray-500 break-keep font-light leading-relaxed">${desc}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
}


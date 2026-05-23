function renderCommunity() {
    const storyFilter = state.currentPayload?.story || '';
    const stories = Array.isArray(publicTestimonials.stories) ? publicTestimonials.stories : [];
    const storyTagMap = {
        parenting: ['양육상담'],
        couple: ['부부관계'],
        personal: ['자기이해', '자기성찰'],
        ministry: ['선교·사역'],
        church: ['부부관계', '선교·사역'],
        team: ['자기성찰', '자기이해'],
        leadership: ['자기성찰', '선교·사역'],
        training: ['자기이해', '자기성찰']
    };
    const allowedTags = storyTagMap[storyFilter] || null;
    const filteredStories = storyFilter && allowedTags
        ? stories.filter((item) => allowedTags.includes(item.tag))
        : stories;
    const visibleStories = filteredStories.length ? filteredStories : stories;
    return `
        <div class="bg-white min-h-screen py-16 px-4">
            <div class="max-w-6xl mx-auto">
                <div class="text-center mb-12 animate-fade-in-up">
                    <span class="text-er-accent font-bold text-xs tracking-widest uppercase">함께한 이야기</span>
                    <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mt-2">회복 이야기와 변화의 기록</h2>
                    <p class="mt-2 text-sm text-gray-500 break-keep">이 섹션은 실제 회복 사례와 후기, 카테고리별 변화 패턴을 담습니다. 후원/운영 정책은 사역지원 섹션에서 별도로 안내합니다.</p>
                </div>

                <div class="grid gap-5 md:grid-cols-4 mb-10 animate-fade-in-up">
                    ${[
                        ['300명+', '지금까지 연결된 참여자'],
                        ['350회+', '누적 상담·코칭 세션'],
                        ['10곳', '협력 교회·기관'],
                        ['20명+', '훈련·교육 참여자']
                    ].map(([value, label]) => `
                        <div class="rounded-[2rem] border border-white/40 bg-er-base p-6 text-center shadow-soft floating-card">
                            <p class="text-3xl md:text-4xl font-extrabold text-er-dark">${value}</p>
                            <p class="mt-2 text-sm text-gray-500 break-keep">${label}</p>
                        </div>
                    `).join('')}
                </div>

                <div class="mb-10 animate-fade-in-up">
                    <h3 class="text-lg font-bold text-gray-900 mb-4">회복 이야기 카테고리</h3>
                    <div class="flex flex-wrap gap-2">
                        ${['자기이해', '자기성찰', '부부관계', '양육상담', '선교·사역', '리더십·팀'].map((tag) => `
                            <span class="px-3 py-1.5 rounded-full text-xs font-bold bg-white border border-gray-100 text-gray-600">${tag}</span>
                        `).join('')}
                    </div>
                </div>

                <div class="mb-5 flex flex-wrap items-center gap-2 animate-fade-in-up">
                    ${storyFilter ? `
                        <span class="inline-flex px-3 py-1 rounded-full bg-er-base text-er-accent text-xs font-bold">선택된 후기 보기</span>
                        <button onclick="renderSection('community')" class="inline-flex px-3 py-1 rounded-full border border-gray-200 text-xs font-medium text-gray-600 hover:text-er-dark hover:border-er-accent transition-colors">
                            전체 후기 보기
                        </button>
                    ` : ''}
                </div>

                <div class="grid gap-5 md:grid-cols-2 lg:grid-cols-3 mb-10 animate-fade-in-up">
                    ${visibleStories.map((item) => `
                        <div class="rounded-[2rem] bg-white border border-white/40 p-6 shadow-soft floating-card">
                            <span class="inline-flex px-2.5 py-1 rounded-full bg-er-base text-er-accent text-[10px] font-bold tracking-wider">${item.tag || '후기'}</span>
                            <p class="mt-4 text-sm text-gray-700 leading-relaxed break-keep">${item.quote || ''}</p>
                            <div class="mt-4 pt-3 border-t border-gray-100">
                                <p class="text-sm font-bold text-gray-900">${item.person || ''}</p>
                                <p class="text-[11px] text-gray-400 uppercase tracking-[0.18em]">${item.meta || ''}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 mb-10">
                    <div class="bg-white/70 rounded-[2rem] p-6 md:p-8 shadow-soft animate-fade-in-up floating-card">
                        <h3 class="font-bold text-base text-gray-800 mb-6 flex items-center gap-2">
                            <i class="fas fa-chart-pie text-er-accent"></i> 은혜가 흘러간 자리
                        </h3>
                        <p class="text-xs text-gray-500 mb-4 break-keep">상담과 교육 요청이 집중되는 주요 영역을 기준으로 사역의 우선순위와 협력 방향을 조정합니다.</p>
                        <div class="chart-container h-64">
                            <canvas id="impactChart"></canvas>
                        </div>
                    </div>

                    <div class="bg-er-dark text-white p-6 md:p-8 rounded-[2rem] shadow-card floating-card animate-fade-in-up" style="animation-delay: 0.1s;">
                        <span class="inline-flex px-3 py-1 rounded-full bg-white/10 text-[10px] font-bold uppercase tracking-[0.2em] text-er-accent">사역의 방향</span>
                        <h3 class="text-2xl font-bold mt-5 mb-4 break-keep">반복적으로 나타난 변화의 방향</h3>
                        <div class="space-y-4">
                            ${publicTestimonials.impactThemes.map((item) => `
                                <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
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

                <div class="grid md:grid-cols-3 gap-6 animate-fade-in-up" style="animation-delay: 0.2s;">
                    <div class="md:col-span-3">
                        <h3 class="text-lg font-bold text-gray-900 mb-4">이 사역을 운영하는 방식</h3>
                        <div class="grid md:grid-cols-2 gap-4">
                            ${[
                                ['협력 기반의 사역', '교회와 기관, 코치와 협력자와 함께 사역의 구조를 세워 갑니다.'],
                                ['후원과 접근성', '후원과 협력을 통해 더 많은 개인과 공동체가 이 사역에 접근할 수 있도록 운영합니다.'],
                                ['빠른 해결보다 형성', '단기 해결보다 지속 가능한 회복과 형성의 과정을 중요하게 여깁니다.'],
                                ['신뢰와 투명성', '사역의 목적과 운영 방향, 참여 경로를 공개적으로 설명하는 사이트를 지향합니다.'],
                            ].map(([title, desc]) => `
                                <div class="bg-white/70 rounded-2xl p-5 border border-white/30 shadow-soft floating-card">
                                    <h4 class="font-bold text-gray-900 mb-2">${title}</h4>
                                    <p class="text-sm text-gray-500 break-keep">${desc}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

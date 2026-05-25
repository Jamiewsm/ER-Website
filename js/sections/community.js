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
                    <span class="text-er-accent font-bold text-xs tracking-widest uppercase">Stories</span>
                    <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mt-2">먼저 회복을 경험한 분들의 이야기</h2>
                    <p class="mt-2 text-sm text-gray-500 break-keep max-w-xl mx-auto">실제 회복 사례와 카테고리별 변화 패턴을 함께 모아 두었습니다.</p>
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

                <div class="rounded-[2.5rem] bg-er-base p-8 md:p-10 shadow-soft animate-fade-in-up" style="animation-delay: 0.2s;">
                    <div class="text-center max-w-2xl mx-auto mb-8">
                        <span class="text-[11px] font-bold uppercase tracking-[0.26em] text-er-accent">Next Step</span>
                        <h3 class="mt-3 text-xl md:text-2xl font-bold text-er-dark break-keep">내 경우는 어디에 가까운가요?</h3>
                        <p class="mt-3 text-sm text-gray-600 break-keep">관심 영역을 선택하면 ER이 다루는 프로그램으로 이어집니다.</p>
                    </div>
                    <div class="grid gap-3 md:grid-cols-4">
                        ${[
                            { label: '양육', desc: '부모-아이 기질 차이', icon: 'fas fa-child-reaching', tab: 'individual' },
                            { label: '부부', desc: '반복 갈등·대화 회복', icon: 'fas fa-heart', tab: 'individual' },
                            { label: '팀', desc: '소통·역할 정렬', icon: 'fas fa-users', tab: 'business' },
                            { label: '교회', desc: '공동체·리더십', icon: 'fas fa-church', tab: 'church' },
                        ].map((card) => `
                            <button onclick="renderSection('programs', { tab: '${card.tab}' })" class="text-left rounded-2xl bg-white border border-white/40 p-5 shadow-soft hover:-translate-y-1 hover:shadow-card transition-all">
                                <div class="w-10 h-10 rounded-xl bg-er-base text-er-accent flex items-center justify-center mb-3">
                                    <i class="${card.icon}"></i>
                                </div>
                                <h4 class="text-sm font-bold text-er-dark">${card.label}</h4>
                                <p class="mt-1 text-xs text-gray-500 break-keep">${card.desc}</p>
                            </button>
                        `).join('')}
                    </div>
                    <div class="mt-8 text-center">
                        <button onclick="renderSection('test')" class="inline-flex items-center gap-2 rounded-full bg-er-dark px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-gray-800">
                            먼저 진단 테스트 해보기 <i class="fas fa-arrow-right text-[11px]"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

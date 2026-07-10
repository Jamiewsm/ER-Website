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
        <div class="bg-er-base min-h-screen">
            <section class="bg-er-dark text-white py-14 md:py-20 px-6 relative overflow-hidden rounded-b-[3rem]">
                <div class="absolute top-[-20%] right-[-10%] w-[420px] h-[420px] bg-er-green/20 rounded-full blur-[110px] pointer-events-none"></div>
                <div class="max-w-6xl mx-auto relative z-10 text-center">
                    <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] md:text-xs font-bold tracking-widest uppercase text-er-greenTint mb-5">Stories</span>
                    <h2 class="font-display text-2xl md:text-4xl font-extrabold tracking-[-0.03em] break-keep">먼저 회복을 경험한 분들의 이야기</h2>
                    <p class="mt-4 text-sm md:text-base text-white/80 break-keep max-w-xl mx-auto leading-relaxed">실제 회복 사례와 카테고리별 변화 패턴을 함께 모아 두었습니다.</p>
                </div>
            </section>

            <div class="px-4 sm:px-6 py-12 md:py-16">
            <div class="max-w-6xl mx-auto">
                <div class="grid gap-5 md:grid-cols-4 mb-10 animate-fade-in-up">
                    ${[
                        ['400+', '지금까지 연결된 참여자'],
                        ['350회+', '누적 상담·코칭 세션'],
                        ['10곳', '협력 교회·기관'],
                        ['100+', '훈련·교육 참여자']
                    ].map(([value, label]) => `
                        <div class="rounded-[2rem] border border-er-sand/60 bg-er-surface p-6 text-center shadow-soft floating-card">
                            <p class="text-3xl md:text-4xl font-extrabold text-er-greenDeep tabular-nums">${value}</p>
                            <p class="mt-2 text-sm text-er-muted break-keep">${label}</p>
                        </div>
                    `).join('')}
                </div>

                <div class="mb-10 animate-fade-in-up">
                    <h3 class="text-lg font-bold text-er-inkSoft mb-4">회복 이야기 카테고리</h3>
                    <div class="flex flex-wrap gap-2">
                        ${['자기이해', '자기성찰', '부부관계', '양육상담', '선교·사역', '리더십·팀'].map((tag) => `
                            <span class="px-3 py-1.5 rounded-full text-xs font-bold bg-er-greenTint text-er-inkSoft border border-er-sand/40">${tag}</span>
                        `).join('')}
                    </div>
                </div>

                <div class="mb-5 flex flex-wrap items-center gap-2 animate-fade-in-up">
                    ${storyFilter ? `
                        <span class="inline-flex px-3 py-1 rounded-full bg-er-greenTint text-er-green text-xs font-bold">선택된 후기 보기</span>
                        <button onclick="renderSection('community')" class="inline-flex px-3 py-1 rounded-full border border-er-sand text-xs font-medium text-er-body hover:text-er-green hover:border-er-green transition-colors">
                            전체 후기 보기
                        </button>
                    ` : ''}
                </div>

                <div class="grid gap-5 md:grid-cols-2 lg:grid-cols-3 mb-10 animate-fade-in-up">
                    ${visibleStories.map((item) => `
                        <div class="rounded-[2rem] bg-er-surface border border-er-sand/60 p-6 shadow-soft floating-card">
                            <span class="inline-flex px-2.5 py-1 rounded-full bg-er-greenTint text-er-green text-[10px] font-bold tracking-wider">${item.tag || '후기'}</span>
                            <p class="mt-4 text-sm text-er-body leading-relaxed break-keep">${item.quote || ''}</p>
                            <div class="mt-4 pt-3 border-t border-er-sand/50">
                                <p class="text-sm font-bold text-er-inkSoft">${item.person || ''}</p>
                                <p class="text-[11px] text-er-muted uppercase tracking-[0.18em]">${item.meta || ''}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 mb-10">
                    <div class="bg-er-surface rounded-[2rem] p-6 md:p-8 shadow-soft animate-fade-in-up floating-card border border-er-sand/60">
                        <h3 class="font-bold text-base text-er-inkSoft mb-6 flex items-center gap-2">
                            <i class="fas fa-chart-pie text-er-green"></i> 은혜가 흘러간 자리
                        </h3>
                        <p class="text-xs text-er-muted mb-4 break-keep">상담과 교육 요청이 집중되는 주요 영역을 기준으로 사역의 우선순위와 협력 방향을 조정합니다.</p>
                        <div class="chart-container h-64">
                            <canvas id="impactChart"></canvas>
                        </div>
                    </div>

                    <div class="bg-er-dark text-white p-6 md:p-8 rounded-[2rem] shadow-card floating-card animate-fade-in-up border border-er-greenDeep/30" style="animation-delay: 0.1s;">
                        <span class="inline-flex px-3 py-1 rounded-full bg-white/10 text-[10px] font-bold uppercase tracking-[0.2em] text-er-greenTint">사역의 방향</span>
                        <h3 class="text-2xl font-bold mt-5 mb-4 break-keep">반복적으로 나타난 변화의 방향</h3>
                        <div class="space-y-4">
                            ${publicTestimonials.impactThemes.map((item) => `
                                <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
                                    <div class="flex items-start gap-3">
                                        <i class="fas fa-check-circle text-er-greenTint mt-0.5"></i>
                                        <div>
                                            <h4 class="text-sm font-bold text-white mb-1">${item.title}</h4>
                                            <p class="text-sm leading-relaxed text-white/75 break-keep">${item.summary}</p>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <div class="rounded-[2.5rem] bg-er-surface border border-er-sand/60 p-8 md:p-10 shadow-soft animate-fade-in-up" style="animation-delay: 0.2s;">
                    <div class="text-center max-w-2xl mx-auto mb-8">
                        <span class="text-[11px] font-bold uppercase tracking-[0.26em] text-er-green">Next Step</span>
                        <h3 class="mt-3 text-xl md:text-2xl font-bold text-er-inkSoft break-keep">내 경우는 어디에 가까운가요?</h3>
                        <p class="mt-3 text-sm text-er-body break-keep">관심 영역을 선택하면 ER이 다루는 프로그램으로 이어집니다.</p>
                    </div>
                    <div class="grid gap-3 md:grid-cols-4">
                        ${[
                            { label: '양육', desc: '부모-아이 기질 차이', icon: 'fas fa-child-reaching', tab: 'individual' },
                            { label: '부부', desc: '반복 갈등·대화 회복', icon: 'fas fa-heart', tab: 'individual' },
                            { label: '팀', desc: '소통·역할 정렬', icon: 'fas fa-users', tab: 'business' },
                            { label: '교회', desc: '공동체·리더십', icon: 'fas fa-church', tab: 'church' },
                        ].map((card) => `
                            <button onclick="renderSection('programs', { tab: '${card.tab}' })" class="text-left rounded-2xl bg-er-base/60 border border-er-sand/50 p-5 shadow-soft hover:-translate-y-1 hover:border-er-green/40 hover:bg-er-greenTint/30 transition-all">
                                <div class="w-10 h-10 rounded-xl bg-er-greenTint text-er-green flex items-center justify-center mb-3">
                                    <i class="${card.icon}"></i>
                                </div>
                                <h4 class="text-sm font-bold text-er-inkSoft">${card.label}</h4>
                                <p class="mt-1 text-xs text-er-muted break-keep">${card.desc}</p>
                            </button>
                        `).join('')}
                    </div>
                    <div class="mt-8 text-center">
                        <button onclick="renderSection('test')" class="inline-flex items-center gap-2 rounded-full bg-er-green px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-er-greenDark">
                            먼저 프리미엄 검사 해보기 <i class="fas fa-arrow-right text-[11px]"></i>
                        </button>
                    </div>
                </div>
            </div>
            </div>
        </div>
    `;
}

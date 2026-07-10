// ER Section: Coaches — public coach profile page
function renderCoaches() {
    const ER = window.ER_STRINGS || {};
    const C = ER.coaches || {};
    const list = C.list || [];

    const svgCross = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-80"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
    const svgCert = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-70"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>`;
    const svgPin = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-70 mr-1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;

    const coachCards = list.map(coach => {
        const specialtyTags = (coach.specialties || [])
            .map(s => `<span class="inline-flex items-center px-3.5 py-1.5 rounded-full bg-er-greenTint text-er-inkSoft text-[13px] font-medium tracking-wide">${s}</span>`)
            .join('');

        const certTags = (coach.certs || [])
            .map(c => `<span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-er-sand/60 bg-er-base/80 text-er-body text-[13px] font-medium tracking-wide">${svgCert}${c}</span>`)
            .join('');

        const ministryBadge = coach.ministry
            ? `<span class="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-md text-[11px] font-semibold tracking-widest uppercase">
                ${svgCross}${C.ministryBadge || '사역지원 전담'}
               </span>`
            : '';

        const ctaTrack = coach.ministry ? 'ministry' : 'paid';
        const ctaLabel = coach.ministry ? (C.ctaMinistry || '사역지원 신청하기') : (C.ctaApply || '상담 신청하기');

        const photoEl = coach.photo
            ? `<img src="${coach.photo}" alt="${coach.name}" class="w-full h-full object-cover transition-transform duration-700 hover:scale-105" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\'w-full h-full flex items-center justify-center bg-er-base\'><i class=\'fas fa-user text-4xl text-er-muted\' aria-hidden=\'true\'></i></div>'">`
            : `<div class="w-full h-full flex items-center justify-center bg-er-base"><i class="fas fa-user text-4xl text-er-muted" aria-hidden="true"></i></div>`;

        return `
        <div class="bg-er-surface rounded-[2.5rem] p-3 md:p-4 shadow-soft floating-card border border-er-sand/60 transition-all duration-300 hover:shadow-card hover:-translate-y-1 group">
            <div class="flex flex-col md:flex-row gap-6 md:gap-8">
                <div class="md:w-[280px] shrink-0">
                    <div class="w-full aspect-[4/5] overflow-hidden rounded-[2rem] bg-er-base border border-er-sand/50 relative shadow-inner">
                        <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        ${photoEl}
                    </div>
                </div>
                <div class="flex-1 py-4 md:py-8 pr-4 md:pr-8 flex flex-col">
                    <div class="flex flex-wrap items-start justify-between gap-4 mb-6">
                        <div>
                            <div class="flex flex-wrap items-center gap-2 mb-3">
                                ${ministryBadge}
                            </div>
                            <h3 class="text-3xl font-extrabold text-er-inkSoft tracking-tight">${coach.name}</h3>
                            <p class="text-base text-er-muted font-medium mt-1">${coach.role}</p>
                            ${coach.locations ? `<p class="flex items-center text-sm text-er-muted mt-2 font-medium">${svgPin}${coach.locations}</p>` : ''}
                        </div>
                        <button onclick="renderSection('apply', { track: '${ctaTrack}' })"
                            class="shrink-0 px-6 py-3 rounded-full bg-er-green text-white text-sm font-semibold hover:bg-er-greenDark transition-all shadow-md hover:shadow-lg active:scale-95 inline-flex items-center gap-2">
                            ${ctaLabel}
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                        </button>
                    </div>

                    <p class="text-base text-er-body leading-relaxed break-keep font-light mb-8 max-w-2xl">${coach.bio}</p>

                    <div class="flex flex-col gap-6 mt-auto">
                        ${coach.specialties && coach.specialties.length ? `
                        <div>
                            <p class="text-[11px] font-bold text-er-muted uppercase tracking-[0.2em] mb-3">${C.specialtyLabel || '전문 분야'}</p>
                            <div class="flex flex-wrap gap-2.5">${specialtyTags}</div>
                        </div>` : ''}

                        ${coach.certs && coach.certs.length ? `
                        <div>
                            <p class="text-[11px] font-bold text-er-muted uppercase tracking-[0.2em] mb-3">${C.certLabel || '자격'}</p>
                            <div class="flex flex-wrap gap-2.5">${certTags}</div>
                        </div>` : ''}
                    </div>

                    ${coach.ministry ? `
                    <div class="mt-8 pt-5 border-t border-er-sand/50 flex items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-er-muted"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                        <p class="text-xs text-er-muted break-keep">${C.ministryDesc || '목회자·선교사 무료 코칭 트랙을 담당합니다.'}</p>
                    </div>` : ''}
                </div>
            </div>
        </div>`;
    }).join('');

    const emptyState = list.length === 0
        ? `<div class="text-center py-20 border border-dashed border-er-sand rounded-3xl bg-er-surface/80">
            <svg class="w-12 h-12 text-er-muted mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            <p class="text-er-muted font-medium">코치 소개가 준비 중입니다.</p>
           </div>`
        : '';

    return `
    <section class="min-h-screen bg-er-base">
        <div class="bg-er-dark text-white py-14 md:py-20 px-6 relative overflow-hidden rounded-b-[3rem]">
            <div class="absolute top-[-20%] right-[-10%] w-[420px] h-[420px] bg-er-green/20 rounded-full blur-[110px] pointer-events-none"></div>
            <div class="max-w-[1000px] mx-auto relative z-10 text-center">
                <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] md:text-xs font-bold tracking-widest uppercase text-er-greenTint mb-5">Coaches</span>
                <h1 class="font-display text-3xl md:text-5xl font-extrabold tracking-[-0.03em] break-keep leading-tight">
                    ${C.title || '회복의 여정을 함께할 코치를 소개합니다'}
                </h1>
                <p class="text-white/80 break-keep leading-relaxed text-base md:text-lg max-w-2xl mx-auto font-light mt-4">
                    ${C.desc || '주님을 사랑하는 사람들이 여러분의 여정을 함께 걷습니다.'}
                </p>
            </div>
        </div>

        <div class="max-w-[1000px] mx-auto px-5 sm:px-6 pt-10 pb-24">
            <div class="mb-10 rounded-2xl bg-er-surface border border-er-sand/60 shadow-soft px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in-up">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-er-greenTint text-er-green flex items-center justify-center shrink-0">
                        ${svgCross}
                    </div>
                    <span class="text-er-body font-medium text-sm break-keep">목회자·선교사와 그 가족에게는 <span class="font-bold text-er-inkSoft">무료 코칭</span>을 제공합니다.</span>
                </div>
                <button onclick="renderSection('support')" class="shrink-0 px-4 py-2 rounded-lg bg-er-green text-white text-sm font-semibold hover:bg-er-greenDark transition-colors">
                    무료 지원 알아보기
                </button>
            </div>

            <div class="flex flex-col gap-10">
                ${coachCards}
                ${emptyState}
            </div>

            <div class="mt-16 animate-fade-in-up">
                <div class="text-center mb-8">
                    <span class="text-[11px] font-bold uppercase tracking-[0.26em] text-er-green">Collaborators</span>
                    <h3 class="mt-3 text-xl md:text-2xl font-bold text-er-inkSoft break-keep">함께하는 협력 코치진</h3>
                    <p class="mt-3 text-sm text-er-muted break-keep max-w-xl mx-auto">ER은 한 사람의 사역이 아닙니다. 코치와 협력자 네트워크가 함께 회복의 여정을 만들어 갑니다.</p>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
                    ${['김수잔', '서초윤', '정익훈', '정경하', '주찬미', '임효조', '최다영'].map(name => `
                        <div class="bg-er-surface rounded-2xl p-5 text-center shadow-soft border border-er-sand/60 floating-card">
                            <div class="w-14 h-14 mx-auto bg-er-greenTint rounded-full flex items-center justify-center text-lg font-bold text-er-green mb-3">
                                ${name.substring(0,1)}
                            </div>
                            <h4 class="font-bold text-er-inkSoft text-sm">${name}</h4>
                            <p class="text-[10px] text-er-green mt-1 uppercase tracking-wide">Collaborator</p>
                        </div>
                    `).join('')}
                    <div class="bg-er-base/60 rounded-2xl p-5 flex flex-col items-center justify-center text-center border border-dashed border-er-sand cursor-pointer hover:bg-er-greenTint/40 transition-colors" onclick="renderSection('coach_training')">
                        <div class="w-10 h-10 bg-er-surface rounded-full flex items-center justify-center text-er-muted mb-2 shadow-sm border border-er-sand/50"><i class="fas fa-plus"></i></div>
                        <p class="text-[10px] text-er-muted font-medium">전문가 과정<br>모집 중</p>
                    </div>
                </div>
            </div>
        </div>
    </section>`;
}

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
            .map(s => `<span class="inline-flex items-center px-3.5 py-1.5 rounded-full bg-gray-100 text-gray-700 text-[13px] font-medium tracking-wide transition-colors hover:bg-gray-200">${s}</span>`)
            .join('');

        const certTags = (coach.certs || [])
            .map(c => `<span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-gray-200 text-gray-700 text-[13px] font-medium tracking-wide transition-colors hover:border-gray-300 bg-white shadow-sm">${svgCert}${c}</span>`)
            .join('');

        const ministryBadge = coach.ministry
            ? `<span class="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-900 border border-gray-900 text-white rounded-md text-[11px] font-semibold tracking-widest uppercase">
                ${svgCross}${C.ministryBadge || '사역지원 전담'}
               </span>`
            : '';

        const ctaTrack = coach.ministry ? 'ministry' : 'paid';
        const ctaLabel = coach.ministry ? (C.ctaMinistry || '사역지원 신청하기') : (C.ctaApply || '상담 신청하기');

        const photoEl = coach.photo
            ? `<img src="${coach.photo}" alt="${coach.name}" class="w-full h-full object-cover transition-transform duration-700 hover:scale-105" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\'w-full h-full flex items-center justify-center bg-gray-50\'><i class=\'fas fa-user text-4xl text-gray-300\' aria-hidden=\'true\'></i></div>'">`
            : `<div class="w-full h-full flex items-center justify-center bg-gray-50"><i class="fas fa-user text-4xl text-gray-300" aria-hidden="true"></i></div>`;

        return `
        <div class="bg-white rounded-[2.5rem] p-3 md:p-4 shadow-soft floating-card border border-white/60 transition-all duration-300 hover:shadow-card hover:-translate-y-1 group">
            <div class="flex flex-col md:flex-row gap-6 md:gap-8">
                <!-- Photo -->
                <div class="md:w-[280px] shrink-0">
                    <div class="w-full aspect-[4/5] overflow-hidden rounded-[2rem] bg-gray-50 border border-gray-100 relative shadow-inner">
                        <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        ${photoEl}
                    </div>
                </div>
                <!-- Info -->
                <div class="flex-1 py-4 md:py-8 pr-4 md:pr-8 flex flex-col">
                    <div class="flex flex-wrap items-start justify-between gap-4 mb-6">
                        <div>
                            <div class="flex flex-wrap items-center gap-2 mb-3">
                                ${ministryBadge}
                            </div>
                            <h3 class="text-3xl font-extrabold text-er-dark tracking-tight">${coach.name}</h3>
                            <p class="text-base text-gray-500 font-medium mt-1">${coach.role}</p>
                            ${coach.locations ? `<p class="flex items-center text-sm text-gray-400 mt-2 font-medium">${svgPin}${coach.locations}</p>` : ''}
                        </div>
                        <button onclick="renderSection('apply', { track: '${ctaTrack}' })"
                            class="shrink-0 px-6 py-3 rounded-full bg-er-dark text-white text-sm font-semibold hover:bg-gray-800 transition-all shadow-md hover:shadow-lg active:scale-95 inline-flex items-center gap-2">
                            ${ctaLabel}
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                        </button>
                    </div>

                    <p class="text-base text-gray-600 leading-relaxed break-keep font-light mb-8 max-w-2xl">${coach.bio}</p>

                    <div class="flex flex-col gap-6 mt-auto">
                        ${coach.specialties && coach.specialties.length ? `
                        <div>
                            <p class="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">${C.specialtyLabel || '전문 분야'}</p>
                            <div class="flex flex-wrap gap-2.5">${specialtyTags}</div>
                        </div>` : ''}

                        ${coach.certs && coach.certs.length ? `
                        <div>
                            <p class="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">${C.certLabel || '자격'}</p>
                            <div class="flex flex-wrap gap-2.5">${certTags}</div>
                        </div>` : ''}
                    </div>

                    ${coach.ministry ? `
                    <div class="mt-8 pt-5 border-t border-gray-100 flex items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                        <p class="text-xs text-gray-500 break-keep">${C.ministryDesc || '목회자·선교사 무료 코칭 트랙을 담당합니다.'}</p>
                    </div>` : ''}
                </div>
            </div>
        </div>`;
    }).join('');

    const emptyState = list.length === 0
        ? `<div class="text-center py-20 border border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
            <svg class="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            <p class="text-gray-500 font-medium">코치 소개가 준비 중입니다.</p>
           </div>`
        : '';

    return `
    <section class="min-h-screen bg-er-base pt-12 pb-24">
        <div class="max-w-[1000px] mx-auto px-5 sm:px-6">

            <!-- Header -->
            <div class="mb-14 animate-fade-in-up text-center" style="animation-fill-mode:both">
                <h1 class="text-4xl md:text-5xl font-extrabold text-er-dark tracking-tight break-keep leading-tight mb-4">
                    ${C.title || '회복의 여정을 함께할 코치를 소개합니다'}
                </h1>
                <p class="text-gray-600 break-keep leading-relaxed text-base md:text-lg max-w-2xl mx-auto font-light">
                    ${C.desc || '주님을 사랑하는 사람들이 여러분의 여정을 함께 걷습니다.'}
                </p>
            </div>

            <!-- Ministry Support Notice (Minimalist) -->
            <div class="mb-12 rounded-2xl bg-white border border-gray-200/60 shadow-sm px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in-up" style="animation-delay:0.1s;animation-fill-mode:both">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-er-base flex items-center justify-center shrink-0">
                        ${svgCross}
                    </div>
                    <span class="text-gray-700 font-medium text-sm break-keep">목회자·선교사와 그 가족에게는 <span class="font-bold text-er-dark">무료 코칭</span>을 제공합니다.</span>
                </div>
                <button onclick="renderSection('support')" class="shrink-0 px-4 py-2 rounded-lg bg-gray-50 text-gray-700 text-sm font-semibold hover:bg-gray-100 transition-colors border border-gray-200/60">
                    무료 지원 알아보기
                </button>
            </div>

            <!-- Coach List -->
            <div class="flex flex-col gap-10">
                ${coachCards}
                ${emptyState}
            </div>

        </div>
    </section>`;
}

// ER Section: Coach Training
function renderCoachTraining() {
    return `
        <div class="bg-er-base min-h-screen">
            <section class="bg-er-dark text-white py-14 md:py-20 px-6 relative overflow-hidden rounded-b-[3rem]">
                <div class="absolute top-[-20%] right-[-10%] w-[420px] h-[420px] bg-er-green/20 rounded-full blur-[110px] pointer-events-none"></div>
                <div class="max-w-6xl mx-auto relative z-10 text-center">
                    <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] md:text-xs font-bold tracking-widest uppercase text-er-greenTint mb-5">전체 훈련 여정</span>
                    <h2 class="font-display text-3xl md:text-5xl font-extrabold tracking-[-0.03em] break-keep">ER 전문가 과정</h2>
                    <p class="mt-4 text-sm md:text-base text-white/80 max-w-3xl mx-auto break-keep leading-relaxed">
                        전문가 과정은 별도의 한 기수나 8주 과정 이름이 아닙니다. 에니어그램 기본과정, 심화성장 101, 1년 코칭스쿨까지 이어지는 전체 훈련 여정을 뜻합니다.
                    </p>
                    <div class="mt-6 inline-flex flex-wrap items-center justify-center gap-2">
                        <span class="inline-flex items-center px-3 py-1 rounded-full border border-er-greenTint/40 text-er-greenTint text-[11px] font-bold tracking-wide">등록 민간자격</span>
                        <span class="inline-flex items-center px-3 py-1 rounded-full border border-white/20 text-white/90 text-[11px] font-semibold tracking-wide">ER에니어그램전문가 2급 · 1급</span>
                    </div>
                </div>
            </section>

            <div class="px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <div class="max-w-6xl mx-auto">
                <section aria-labelledby="er-cert-title" class="rounded-[2rem] bg-er-surface border border-er-sand/60 p-6 md:p-8 shadow-soft animate-fade-in-up mb-8">
                    <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                        <div>
                            <p class="text-[10px] font-bold tracking-[0.18em] uppercase text-er-green">Registered Private Qualification</p>
                            <h3 id="er-cert-title" class="mt-2 text-xl md:text-2xl font-bold text-er-inkSoft break-keep">ER에니어그램전문가</h3>
                            <p class="mt-2 text-sm text-er-body leading-relaxed break-keep max-w-2xl">등록 민간자격(제 2026-008332호). 발급기관은 에니어그램 포 레스토레이션입니다. 국가 공인자격이 아니며, 과정 수료만으로 자동 발급되지 않습니다.</p>
                        </div>
                        <div class="rounded-2xl border border-er-green/30 bg-er-greenTint/40 px-5 py-4 min-w-[16rem]">
                            <p class="text-[10px] font-bold tracking-wider uppercase text-er-green">민간자격 등록번호</p>
                            <p class="mt-1 font-display text-lg md:text-xl font-extrabold text-er-inkSoft tracking-tight">제 2026-008332호</p>
                        </div>
                    </div>

                    <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <article class="rounded-2xl bg-er-base/60 border border-er-sand/50 p-5">
                            <div class="flex items-center justify-between gap-3">
                                <h4 class="text-base font-bold text-er-inkSoft break-keep">ER에니어그램전문가 2급</h4>
                                <span class="shrink-0 px-2.5 py-1 rounded-full border border-er-green/30 text-er-green text-[10px] font-bold">2급</span>
                            </div>
                            <p class="mt-3 text-sm text-er-body leading-relaxed break-keep">기본과정 수료 후 2급 검정에 응시해 취득합니다.</p>
                        </article>
                        <article class="rounded-2xl bg-er-base/60 border border-er-sand/50 p-5">
                            <div class="flex items-center justify-between gap-3">
                                <h4 class="text-base font-bold text-er-inkSoft break-keep">ER에니어그램전문가 1급</h4>
                                <span class="shrink-0 px-2.5 py-1 rounded-full border border-er-green/30 text-er-green text-[10px] font-bold">1급</span>
                            </div>
                            <p class="mt-3 text-sm text-er-body leading-relaxed break-keep">2급 + 심화성장 101 + 1년 코치훈련 이수 후 1급 검정에 응시합니다.</p>
                        </article>
                    </div>

                    <div class="mt-5 rounded-2xl bg-er-greenTint border border-er-green/20 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-er-body">
                        <p class="break-keep leading-relaxed">비용·환불·발급기관·공인 아님 고지 등 표시의무 상세는 자격 전용 페이지에 모아 두었습니다.</p>
                        <a href="/enneagram-certification/" class="shrink-0 inline-flex px-4 py-2 rounded-full bg-er-green text-white font-bold hover:bg-er-greenDark transition-colors">
                            자격 안내 자세히 보기
                        </a>
                    </div>
                </section>

                <div class="rounded-[2rem] bg-er-surface border border-er-sand/60 p-6 md:p-8 shadow-soft animate-fade-in-up mb-8">
                    <h3 class="text-lg font-bold text-er-inkSoft mb-4">과정 흐름</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        ${[
                            ['1단계', '에니어그램 기본과정 8주', '에니어그램 핵심 이론과 ER 관점을 배우고, 실제 적용의 기초를 세웁니다. 수료 후 2급 검정에 응시할 수 있습니다.'],
                            ['2단계', '심화성장 101 (필수)', '1급 과정 지원을 위한 필수 심화입니다. 102 이후 과목은 선택으로 이어집니다.'],
                            ['3단계', '1년 코칭스쿨', '2급 자격과 101 수료 후 지원합니다. 이수 후 1급 검정에 응시할 수 있습니다.']
                        ].map(([step, title, body]) => `
                            <div class="rounded-2xl bg-er-base/60 border border-er-sand/50 p-5">
                                <p class="text-[10px] font-bold tracking-wider text-er-green uppercase">${step}</p>
                                <h4 class="text-base font-bold text-er-inkSoft mt-2 mb-2 break-keep">${title}</h4>
                                <p class="text-xs text-er-body leading-relaxed break-keep">${body}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
                    ${[
                        {
                            b: '핵심 코스',
                            t: '에니어그램 기본과정 8주',
                            d: [
                                '에니어그램 핵심 이론 + ER 핵심 관점 정리',
                                '강의, 과제, 나눔을 통한 실제 적용 훈련',
                                '수료 후 2급 검정 응시 가능'
                            ],
                            o: '나와 타인을 해석하고 돕는 기본 프레임 확보',
                            i: 'fas fa-graduation-cap'
                        },
                        {
                            b: '필수 심화',
                            t: '심화성장 101',
                            d: [
                                '기본과정 수료자 대상 필수 심화',
                                '하위유형·고착을 깊이 다루는 참여형 수업',
                                '102 이후 과목은 선택 심화로 이어짐'
                            ],
                            o: '1급 과정 지원을 위한 심화 기반 확보',
                            i: 'fas fa-book-reader'
                        },
                        {
                            b: '심화 코스',
                            t: '1년 코칭스쿨',
                            d: [
                                'A. Formation / B. ER 전문 강사 / C. 코칭 스킬 / D. 통합 실습',
                                '4개 트랙은 선택이 아닌 필수(의무) 과정',
                                '이수 후 ER에니어그램전문가 1급 검정 응시 가능'
                            ],
                            o: '정식 코치로 사역할 수 있는 통합 역량 형성',
                            i: 'fas fa-layer-group'
                        }
                    ].map(c => `
                        <div class="bg-er-surface rounded-2xl p-6 border border-er-sand/60 shadow-soft floating-card flex flex-col h-full">
                            <div class="flex items-center justify-between mb-4">
                                <span class="px-2.5 py-1 rounded-full bg-er-greenTint text-er-green text-[10px] font-bold uppercase tracking-wider">${c.b}</span>
                                <div class="w-8 h-8 rounded-full bg-er-base text-er-green flex items-center justify-center text-sm">
                                    <i class="${c.i}"></i>
                                </div>
                            </div>
                            <h3 class="text-base font-bold text-er-inkSoft mb-2">${c.t}</h3>
                            <ul class="text-er-body text-xs leading-relaxed mb-4 flex-grow break-keep space-y-2">
                                ${c.d.map((line) => `<li class="flex items-start gap-2"><span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-er-green"></span><span>${line}</span></li>`).join('')}
                            </ul>
                            <p class="text-[11px] text-er-muted break-keep"><span class="font-bold text-er-inkSoft">예상 결과:</span> ${c.o}</p>
                        </div>
                    `).join('')}
                </div>

                <div class="mt-10 rounded-[2rem] bg-er-surface border border-er-sand/60 p-6 md:p-8 shadow-soft animate-fade-in-up">
                    <h3 class="text-lg font-bold text-er-inkSoft mb-3">1년 코칭스쿨 의무 트랙 (요약)</h3>
                    <div class="grid md:grid-cols-2 gap-4 text-sm text-er-body mb-4">
                        ${[
                            ['A. Formation Track', '개인 회복/성장, 월 1회 Formation Lab, N번 보고서, 연말 리트릿 연계'],
                            ['B. ER 전문 강사 트랙', '복음적 재해석 역량, 격주 스터디, 독서/요약/강의법 훈련'],
                            ['C. 코칭 스킬 트랙', '월 1회 Coaching Lab, 이론·윤리·경계선·롤플레잉 기반 실전 훈련'],
                            ['D. 통합 실습 트랙', '강의/상담 참관, 옵저베이션 보고서, 코티칭, 스터디 리딩']
                        ].map(([title, body]) => `
                        <div class="rounded-2xl bg-er-base/60 border border-er-sand/50 p-5">
                            <p class="font-bold text-er-inkSoft mb-2">${title}</p>
                            <p>${body}</p>
                        </div>`).join('')}
                    </div>
                    <h4 class="text-base font-bold text-er-inkSoft mb-3">한 달 운영 샘플 (주 1회 모임 구조)</h4>
                    <div class="grid md:grid-cols-2 gap-4 text-sm text-er-body">
                        <div class="rounded-2xl bg-er-base/60 border border-er-sand/50 p-5">
                            <p>1) Formation Lab 월 1회</p>
                            <p>2) 스터디 모임 격주 1회</p>
                            <p>3) Coaching Lab 월 1회</p>
                            <p>4) 실습/참관: 기회별 진행</p>
                        </div>
                        <div class="rounded-2xl bg-er-base/60 border border-er-sand/50 p-5">
                            <p>5) 연중 소임 강의법 학기 수료</p>
                            <p>6) 연 1~2회 리트릿</p>
                            <p>7) 개인 과제: N번 보고서/스터디 보고서/코칭랩 과제/실습 보고서/연간 독서 3권</p>
                        </div>
                    </div>
                    <p class="mt-4 text-xs text-er-muted break-keep">연말 리트릿에서 한 해를 정리하고, 다음 해 개인 훈련 목표를 수립합니다.</p>
                    <div class="mt-6 rounded-2xl bg-er-greenTint/50 border border-er-sand/60 p-5">
                        <p class="text-sm text-er-body leading-relaxed break-keep">전문가 과정 전체를 별도 기수로 모집하거나 별도 신청을 받지 않습니다. 시작을 원하시면 현재 모집 중인 에니어그램 기본과정부터 확인해 주세요.</p>
                        <a href="/basic-course.html" class="mt-4 inline-flex px-6 py-3 rounded-full bg-er-green text-white text-sm font-bold hover:bg-er-greenDark transition-all">
                            현재 기본과정 안내 보기
                        </a>
                    </div>
                </div>
            </div>
            </div>
        </div>
    `;
}

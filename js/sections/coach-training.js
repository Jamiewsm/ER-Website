// ER Section: Coach Training
function renderCoachTraining() {
    return `
        <div class="bg-er-base min-h-screen">
            <section class="bg-er-dark text-white py-14 md:py-20 px-6 relative overflow-hidden rounded-b-[3rem]">
                <div class="absolute top-[-20%] right-[-10%] w-[420px] h-[420px] bg-er-green/20 rounded-full blur-[110px] pointer-events-none"></div>
                <div class="max-w-6xl mx-auto relative z-10 text-center">
                    <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] md:text-xs font-bold tracking-widest uppercase text-er-greenTint mb-5">코치양성</span>
                    <h2 class="font-display text-3xl md:text-5xl font-extrabold tracking-[-0.03em] break-keep">전문가 양성반</h2>
                    <p class="mt-4 text-sm md:text-base text-white/80 max-w-3xl mx-auto break-keep leading-relaxed">
                        전문가 양성반은 <strong class="text-white">에니어그램 8주 기본과정</strong>으로 시작해 스터디, 코칭스쿨까지 이어지는 ER 전문가 여정입니다.
                    </p>
                </div>
            </section>

            <div class="px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <div class="max-w-6xl mx-auto">
                <div class="rounded-[2rem] bg-er-surface border border-er-sand/60 p-6 md:p-8 shadow-soft animate-fade-in-up mb-8">
                    <h3 class="text-lg font-bold text-er-inkSoft mb-4">과정 흐름</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        ${[
                            ['1단계', '에니어그램 8주 기본과정', '에니어그램 핵심 이론과 ER 관점을 배우고, 실제 적용의 기초를 세웁니다.'],
                            ['2단계', '팔로우업 스터디', '기본과정 수료 후 자유롭게 스터디에 참여할 수 있습니다. (격주 운영)'],
                            ['3단계', '1년 코칭스쿨', '기본과정 수료 + 스터디 2개월 이상 참여 시 지원 가능']
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
                            t: '에니어그램 8주 기본과정',
                            d: [
                                '에니어그램 핵심 이론 + ER 핵심 관점 정리',
                                '강의, 과제, 나눔을 통한 실제 적용 훈련',
                                '수료 후 스터디 참여 자격 부여'
                            ],
                            o: '나와 타인을 해석하고 돕는 기본 프레임 확보',
                            i: 'fas fa-graduation-cap'
                        },
                        {
                            b: '팔로우업',
                            t: '스터디 모임',
                            d: [
                                '기본과정 수료자 대상 자유 참여',
                                '격주 스터디 + 요약/정리 과제',
                                '최소 2개월 이상 참여 시 코칭스쿨 지원 가능'
                            ],
                            o: '학습 지속성과 현장 적용 감각 강화',
                            i: 'fas fa-book-reader'
                        },
                        {
                            b: '심화 코스',
                            t: '1년 코칭스쿨',
                            d: [
                                'A. Formation / B. ER 전문 강사 / C. 코칭 스킬 / D. 통합 실습',
                                '4개 트랙은 선택이 아닌 필수(의무) 과정',
                                '월별 랩, 과제, 참관/실습, 연말 리트릿 포함'
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
                            <p class="text-[11px] text-er-muted mb-5 break-keep"><span class="font-bold text-er-inkSoft">예상 결과:</span> ${c.o}</p>
                            <button onclick="renderSection('apply', { track: 'paid' })" class="w-full py-2.5 rounded-xl border border-er-sand text-er-body font-bold text-xs hover:bg-er-green hover:text-white hover:border-transparent transition-all">
                                신청/문의
                            </button>
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
                    <div class="mt-6">
                        <button onclick="renderSection('apply', { track: 'paid' })" class="px-6 py-3 rounded-full bg-er-green text-white text-sm font-bold hover:bg-er-greenDark transition-all">
                            코치양성 문의하기
                        </button>
                    </div>
                </div>
            </div>
            </div>
        </div>
    `;
}

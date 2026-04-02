// ER Section: Coach Training
function renderCoachTraining() {
    return `
        <div class="bg-er-base min-h-screen py-16 md:py-20 px-4 sm:px-6 lg:px-8">
            <div class="max-w-6xl mx-auto">
                <div class="text-center mb-12 animate-fade-in-up">
                    <span class="text-er-accent font-bold text-xs tracking-widest uppercase">코치양성</span>
                    <h2 class="text-3xl md:text-5xl font-bold text-er-dark mt-3 break-keep">전문가 양성반</h2>
                    <p class="mt-4 text-sm md:text-base text-gray-500 max-w-3xl mx-auto break-keep">
                        8주 전문가 양성반이 시작점입니다. 수료 후 스터디에 참여할 수 있고, 스터디 2개월 이상 참여 시 1년 코칭스쿨 지원 자격이 열립니다.
                    </p>
                </div>

                <div class="rounded-[2rem] bg-white border border-white/40 p-6 md:p-8 shadow-soft animate-fade-in-up mb-8">
                    <h3 class="text-lg font-bold text-er-dark mb-4">과정 흐름</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        ${[
                            ['1단계', '8주 전문가 양성반', '에니어그램 핵심 이론과 ER 관점을 배우고, 실제 적용의 기초를 세웁니다.'],
                            ['2단계', '팔로우업 스터디', '양성반 수료자는 자유롭게 스터디에 참여할 수 있습니다. (격주 운영)'],
                            ['3단계', '1년 코칭스쿨', '양성반 수료 + 스터디 2개월 이상 참여 시 지원 가능']
                        ].map(([step, title, body]) => `
                            <div class="rounded-2xl bg-er-base/60 border border-white/30 p-5">
                                <p class="text-[10px] font-bold tracking-wider text-er-accent uppercase">${step}</p>
                                <h4 class="text-base font-bold text-er-dark mt-2 mb-2 break-keep">${title}</h4>
                                <p class="text-xs text-gray-600 leading-relaxed break-keep">${body}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
                    ${[
                        {
                            b: '핵심 코스',
                            t: '8주 전문가 양성반',
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
                                '양성반 수료자 대상 자유 참여',
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
                        <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft floating-card flex flex-col h-full">
                            <div class="flex items-center justify-between mb-4">
                                <span class="px-2.5 py-1 rounded-full bg-er-base text-er-accent text-[10px] font-bold uppercase tracking-wider">${c.b}</span>
                                <div class="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
                                    <i class="${c.i}"></i>
                                </div>
                            </div>
                            <h3 class="text-base font-bold text-gray-900 mb-2">${c.t}</h3>
                            <ul class="text-gray-600 text-xs leading-relaxed mb-4 flex-grow break-keep space-y-2">
                                ${c.d.map((line) => `<li class="flex items-start gap-2"><span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-er-accent"></span><span>${line}</span></li>`).join('')}
                            </ul>
                            <p class="text-[11px] text-gray-500 mb-5 break-keep"><span class="font-bold text-er-dark">예상 결과:</span> ${c.o}</p>
                            <button onclick="renderSection('apply', { track: 'paid' })" class="w-full py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs hover:bg-er-dark hover:text-white hover:border-transparent transition-all">
                                신청/문의
                            </button>
                        </div>
                    `).join('')}
                </div>

                <div class="mt-10 rounded-[2rem] bg-white border border-white/40 p-6 md:p-8 shadow-soft animate-fade-in-up">
                    <h3 class="text-lg font-bold text-er-dark mb-3">1년 코칭스쿨 의무 트랙 (요약)</h3>
                    <div class="grid md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                        <div class="rounded-2xl bg-er-base/50 border border-white/30 p-5">
                            <p class="font-bold text-er-dark mb-2">A. Formation Track</p>
                            <p>개인 회복/성장, 월 1회 Formation Lab, N번 보고서, 연말 리트릿 연계</p>
                        </div>
                        <div class="rounded-2xl bg-er-base/50 border border-white/30 p-5">
                            <p class="font-bold text-er-dark mb-2">B. ER 전문 강사 트랙</p>
                            <p>복음적 재해석 역량, 격주 스터디, 독서/요약/강의법 훈련</p>
                        </div>
                        <div class="rounded-2xl bg-er-base/50 border border-white/30 p-5">
                            <p class="font-bold text-er-dark mb-2">C. 코칭 스킬 트랙</p>
                            <p>월 1회 Coaching Lab, 이론·윤리·경계선·롤플레잉 기반 실전 훈련</p>
                        </div>
                        <div class="rounded-2xl bg-er-base/50 border border-white/30 p-5">
                            <p class="font-bold text-er-dark mb-2">D. 통합 실습 트랙</p>
                            <p>강의/상담 참관, 옵저베이션 보고서, 코티칭, 스터디 리딩</p>
                        </div>
                    </div>
                    <h4 class="text-base font-bold text-er-dark mb-3">한 달 운영 샘플 (주 1회 모임 구조)</h4>
                    <div class="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div class="rounded-2xl bg-er-base/50 border border-white/30 p-5">
                            <p>1) Formation Lab 월 1회</p>
                            <p>2) 스터디 모임 격주 1회</p>
                            <p>3) Coaching Lab 월 1회</p>
                            <p>4) 실습/참관: 기회별 진행</p>
                        </div>
                        <div class="rounded-2xl bg-er-base/50 border border-white/30 p-5">
                            <p>5) 연중 소임 강의법 학기 수료</p>
                            <p>6) 연 1~2회 리트릿</p>
                            <p>7) 개인 과제: N번 보고서/스터디 보고서/코칭랩 과제/실습 보고서/연간 독서 3권</p>
                        </div>
                    </div>
                    <p class="mt-4 text-xs text-gray-500 break-keep">연말 리트릿에서 한 해를 정리하고, 다음 해 개인 훈련 목표를 수립합니다.</p>
                    <div class="mt-6">
                        <button onclick="renderSection('apply', { track: 'paid' })" class="px-6 py-3 rounded-full bg-er-dark text-white text-sm font-bold hover:bg-gray-800 transition-all">
                            코치양성 문의하기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}


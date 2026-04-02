function renderApply(payload = null) {
    const fromTest = payload?.source === 'test';
    const track = payload?.track || (fromTest ? 'paid' : 'paid');
    const isSupportTrack = track === 'support';
    const isMinistryTrack = track === 'ministry';
    const isOrgTrack = track === 'org';
    const submitSource = fromTest ? 'test' : track;
    const testSummary = state.latestTestResult
        ? `약식 테스트 결과: ${state.latestTestResult.finalLabel}, 코어 ${state.latestTestResult.coreType}번, 날개 ${state.latestTestResult.wingLabel}, 하위유형 ${state.latestTestResult.subtypeSummary}, 본능 ${state.latestTestResult.instinctSummary}`
        : "";

    const trackTitle = isSupportTrack
        ? '후원·협력 문의'
        : isMinistryTrack
            ? '사역지원 신청'
            : isOrgTrack
                ? '기관/교회 프로그램 문의'
                : '상담 및 코칭 신청';
    const trackDesc = isSupportTrack
        ? '후원 및 협력 관련 문의를 남겨 주세요.'
        : isMinistryTrack
            ? '목회자·선교사 사역지원(무료/감면) 신청을 남겨 주세요.'
            : isOrgTrack
                ? '교회/기관/기업 프로그램 문의를 남겨 주세요.'
                : '신청 내용을 남겨주세요.';
    const categoryOptions = isSupportTrack
        ? ['후원 문의', '협력 파트너십 문의', '공동 프로그램 제안', '기타 협력 문의']
        : isMinistryTrack
            ? ['목회자 사역지원 신청', '선교사 사역지원 신청', '긴급 지원 요청', '기타 사역지원 문의']
            : isOrgTrack
                ? ['교회 워크숍 문의', '기관 프로그램 문의', '기업/팀 워크숍 문의', '리더 디브리핑 문의']
                : ['정체성 발견 세션 ($100)', '개별 코칭 1회 ($80)', '회복 여정 4회 ($260)', '회복 여정 8회 ($600)', '부부 코칭 1회 ($220)'];

    return `
        <div class="bg-er-base min-h-screen py-20 px-4">
            <div class="max-w-2xl mx-auto">
                <div class="text-center mb-10 animate-fade-in-up">
                    <h2 class="text-3xl font-bold text-gray-900">${trackTitle}</h2>
                    <p class="mt-3 text-gray-500 text-sm">${trackDesc}</p>
                </div>
                
                <div class="bg-white rounded-3xl shadow-card floating-card p-8 md:p-10 animate-fade-in-up border border-white/40" style="animation-delay: 0.1s;">
                    ${fromTest ? `
                        <div class="mb-6 p-4 rounded-2xl border border-er-accent/30 bg-er-accent/10">
                            <p class="text-sm font-bold text-er-dark mb-1">테스트 후 추천 트랙</p>
                            <p class="text-xs text-gray-600 break-keep">약식 테스트 결과를 바탕으로 정체성 발견 세션에서 현재 패턴과 회복 방향을 구체적으로 정리해 드립니다.</p>
                        </div>
                    ` : isSupportTrack ? `
                        <div class="mb-6 p-4 rounded-2xl border border-er-accent/30 bg-er-accent/10">
                            <p class="text-sm font-bold text-er-dark mb-1">후원·협력 전용 창구</p>
                            <p class="text-xs text-gray-600 break-keep">후원 문의, 교회·기관 파트너십, 공동 프로그램 협력 요청을 이곳에 남겨주세요. 현재 후원은 개별 안내로 진행됩니다.</p>
                        </div>
                    ` : isMinistryTrack ? `
                        <div class="mb-6 p-4 rounded-2xl border border-er-accent/30 bg-er-accent/10">
                            <p class="text-sm font-bold text-er-dark mb-1">사역지원 신청 안내</p>
                            <p class="text-xs text-gray-600 break-keep">목회자·선교사 대상 무료/감면 사역지원 트랙은 심사 후 배정됩니다.</p>
                        </div>
                    ` : isOrgTrack ? `
                        <div class="mb-6 p-4 rounded-2xl border border-er-accent/30 bg-er-accent/10">
                            <p class="text-sm font-bold text-er-dark mb-1">기관/교회 프로그램 안내</p>
                            <p class="text-xs text-gray-600 break-keep">프로그램 규모와 대상에 따라 맞춤 견적으로 안내드립니다.</p>
                        </div>
                    ` : ""}

                    <div class="flex items-center justify-between mb-8 px-4 relative">
                        <div class="absolute top-1/2 left-0 w-full h-px bg-gray-100 -z-10"></div>
                        <div class="bg-white px-2"><span class="w-8 h-8 rounded-full bg-er-dark text-white flex items-center justify-center text-sm font-bold shadow-lg">1</span></div>
                        <div class="bg-white px-2"><span class="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-sm font-bold">2</span></div>
                        <div class="bg-white px-2"><span class="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-sm font-bold">3</span></div>
                    </div>

                    <form id="apply-form" class="space-y-6" onsubmit="handleApplySubmit(event, '${submitSource}')">
                        
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-2">이름</label>
                            <input type="text" name="name" required class="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-er-accent focus:border-transparent outline-none transition-all" placeholder="성함을 남겨주세요">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-2">연락받으실 곳</label>
                            <input type="text" name="contact" required class="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-er-accent focus:border-transparent outline-none transition-all" placeholder="010-0000-0000 또는 이메일">
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-bold text-gray-700 mb-2">거주 국가</label>
                                <input type="text" name="country" class="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-er-accent focus:border-transparent outline-none transition-all" placeholder="예: USA, Korea, Canada">
                            </div>
                            <div>
                                <label class="block text-sm font-bold text-gray-700 mb-2">희망 시간대</label>
                                <input type="text" name="preferred_time" class="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-er-accent focus:border-transparent outline-none transition-all" placeholder="예: Weekday PM (Dallas)">
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-2">희망하는 세션</label>
                            <div class="relative">
                                <select name="category" class="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 appearance-none focus:ring-2 focus:ring-er-accent focus:border-transparent outline-none transition-all text-gray-600">
                                    ${categoryOptions.map((opt, idx) => `<option ${idx === 0 ? 'selected' : ''}>${opt}</option>`).join('')}
                                </select>
                                <div class="absolute right-4 top-3.5 text-gray-400 pointer-events-none"><i class="fas fa-chevron-down"></i></div>
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-2">나누고 싶은 이야기</label>
                            <textarea name="message" rows="4" class="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-er-accent focus:border-transparent outline-none transition-all resize-none" placeholder="지금의 고민이나 바라는 도움을 편하게 적어주세요.">${fromTest && testSummary ? `${testSummary}\n정체성 발견 세션 신청합니다.` : ""}</textarea>
                        </div>

                        <div class="bg-er-base/50 p-4 rounded-xl flex gap-3 items-start">
                            <i class="fas fa-info-circle text-er-primary mt-0.5"></i>
                            <p class="text-xs text-gray-500 leading-relaxed">
                                ${isSupportTrack
                                    ? '후원금은 목회자·선교사 사역지원 트랙의 접근성을 유지하는 데 우선 사용됩니다. 후원은 개별 안내 방식으로 연결됩니다.'
                                    : isMinistryTrack
                                        ? '사역지원 트랙은 월별 슬롯 기반으로 운영됩니다. 접수 후 심사 및 일정 가능 여부를 안내드립니다.'
                                        : isOrgTrack
                                            ? '기관/교회/기업 프로그램은 요구사항과 일정에 따라 맞춤 제안으로 안내됩니다.'
                                            : 'ER의 모든 세션은 USD 기준으로 운영됩니다. 최종 결제 금액은 결제 수단 및 환율에 따라 달라질 수 있습니다.'}
                                접수 후 24시간 이내에 담당자가 연락드립니다.
                            </p>
                        </div>

                        <div class="bg-gray-50 border border-gray-200 rounded-xl p-4">
                            <p class="text-xs text-gray-500 mb-2">보안 확인</p>
                            <div id="apply-turnstile-widget" class="min-h-[65px]"></div>
                            <input type="hidden" name="turnstile_token" id="apply-turnstile-token" value="">
                        </div>
                        
                        <button id="apply-submit-btn" type="submit" class="w-full py-4 bg-er-dark text-white rounded-xl font-bold shadow-lg hover:bg-gray-800 transition-all hover:-translate-y-1">
                            신청하기
                        </button>
                    </form>
                </div>
            </div>
        </div>
    `;
}

// ER Section: Apply form + Thank you
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

    const svgChevron = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
    const svgInfo = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;

    return `
        <div class="bg-[#FAF9F7] min-h-screen py-24 px-5">
            <div class="max-w-[700px] mx-auto">
                <div class="text-center mb-14 animate-fade-in-up">
                    <h2 class="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">${trackTitle}</h2>
                    <p class="mt-4 text-gray-500 text-sm font-light">${trackDesc}</p>
                </div>
                
                <div class="bg-white rounded-[2.5rem] shadow-sm p-10 md:p-14 animate-fade-in-up border border-gray-100" style="animation-delay: 0.1s;">
                    ${fromTest ? `
                        <div class="mb-8 p-5 rounded-2xl border border-gray-100 bg-[#FAF9F7]">
                            <p class="text-sm font-bold text-gray-900 mb-1.5">테스트 후 추천 트랙</p>
                            <p class="text-xs text-gray-500 break-keep font-light leading-relaxed">약식 테스트 결과를 바탕으로 정체성 발견 세션에서 현재 패턴과 회복 방향을 구체적으로 정리해 드립니다.</p>
                        </div>
                    ` : isSupportTrack ? `
                        <div class="mb-8 p-5 rounded-2xl border border-gray-100 bg-[#FAF9F7]">
                            <p class="text-sm font-bold text-gray-900 mb-1.5">후원·협력 전용 창구</p>
                            <p class="text-xs text-gray-500 break-keep font-light leading-relaxed">후원 문의, 교회·기관 파트너십, 공동 프로그램 협력 요청을 이곳에 남겨주세요. 현재 후원은 개별 안내로 진행됩니다.</p>
                        </div>
                    ` : isMinistryTrack ? `
                        <div class="mb-8 p-5 rounded-2xl border border-gray-100 bg-[#FAF9F7]">
                            <p class="text-sm font-bold text-gray-900 mb-1.5">사역지원 신청 안내</p>
                            <p class="text-xs text-gray-500 break-keep font-light leading-relaxed">목회자·선교사 대상 무료/감면 사역지원 트랙은 심사 후 배정됩니다.</p>
                        </div>
                    ` : isOrgTrack ? `
                        <div class="mb-8 p-5 rounded-2xl border border-gray-100 bg-[#FAF9F7]">
                            <p class="text-sm font-bold text-gray-900 mb-1.5">기관/교회 프로그램 안내</p>
                            <p class="text-xs text-gray-500 break-keep font-light leading-relaxed">프로그램 규모와 대상에 따라 맞춤 견적으로 안내드립니다.</p>
                        </div>
                    ` : ""}

                    <form id="apply-form" class="space-y-7" onsubmit="handleApplySubmit(event, '${submitSource}')">
                        
                        <div>
                            <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">이름</label>
                            <input type="text" name="name" required class="w-full bg-[#FAF9F7] border border-gray-100 rounded-2xl py-4 px-5 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all placeholder-gray-400 text-gray-900 font-medium text-sm hover:border-gray-300" placeholder="성함을 남겨주세요">
                        </div>
                        
                        <div>
                            <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">연락받으실 곳</label>
                            <input type="text" name="contact" required class="w-full bg-[#FAF9F7] border border-gray-100 rounded-2xl py-4 px-5 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all placeholder-gray-400 text-gray-900 font-medium text-sm hover:border-gray-300" placeholder="010-0000-0000 또는 이메일">
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">거주 국가</label>
                                <input type="text" name="country" class="w-full bg-[#FAF9F7] border border-gray-100 rounded-2xl py-4 px-5 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all placeholder-gray-400 text-gray-900 font-medium text-sm hover:border-gray-300" placeholder="예: USA, Korea">
                            </div>
                            <div>
                                <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">희망 시간대</label>
                                <input type="text" name="preferred_time" class="w-full bg-[#FAF9F7] border border-gray-100 rounded-2xl py-4 px-5 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all placeholder-gray-400 text-gray-900 font-medium text-sm hover:border-gray-300" placeholder="예: Weekday PM (Dallas)">
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">분류</label>
                            <div class="relative">
                                <select name="category" class="w-full bg-[#FAF9F7] border border-gray-100 rounded-2xl py-4 px-5 appearance-none focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all hover:border-gray-300 text-gray-900 font-medium text-sm">
                                    ${categoryOptions.map((opt, idx) => `<option ${idx === 0 ? 'selected' : ''} value="${opt}">${opt}</option>`).join('')}
                                </select>
                                <div class="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">${svgChevron}</div>
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">남기실 말씀</label>
                            <textarea name="message" rows="5" class="w-full bg-[#FAF9F7] border border-gray-100 rounded-2xl py-4 px-5 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all resize-none placeholder-gray-400 text-gray-900 font-medium text-sm hover:border-gray-300" placeholder="고민이나 바라는 점, 문의사항을 편하게 적어주세요.">${fromTest && testSummary ? `${testSummary}\n\n정체성 발견 세션을 신청합니다.` : ""}</textarea>
                        </div>

                        <div class="bg-gray-900 text-white p-5 rounded-2xl flex gap-4 items-start shadow-xl">
                            <div class="mt-0.5 text-gray-400">${svgInfo}</div>
                            <p class="text-xs font-light leading-relaxed">
                                ${isSupportTrack
                                    ? '후원금은 사역지원 트랙의 회복 접근성을 지키는 데 가장 먼저 쓰입니다. 구체적인 후원 방식은 남겨주신 연락처로 안내해 드립니다.'
                                    : isMinistryTrack
                                        ? '사역지원 트랙은 월별 배정 슬롯에 맞춰 심사 후 진행됩니다. 신청서 확인 후 진행 여부와 일정을 상세히 안내해 드립니다.'
                                        : isOrgTrack
                                            ? '기관, 교회, 기업 프로그램의 경우 대상과 규모, 목적에 따라 가장 적합한 방향을 기획하여 맞춤형 견적으로 제안해 드립니다.'
                                            : 'ER의 모든 세션 비용은 USD를 기준으로 안내됩니다. 실제 결제 금액은 선택하신 결제 수단 및 당시 환율에 따라 조금씩 차이가 있을 수 있습니다.'}
                                <br><br>작성해주신 내용은 안전하게 전달되며, 24시간 내에 코디네이터가 직접 연락을 드립니다.
                            </p>
                        </div>

                        <div class="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Security Check</p>
                            <div id="apply-turnstile-widget" class="min-h-[65px]"></div>
                            <input type="hidden" name="turnstile_token" id="apply-turnstile-token" value="">
                        </div>
                        
                        <button id="apply-submit-btn" type="submit" class="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold shadow-md hover:bg-black hover:shadow-lg transition-all hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-gray-200 mt-2">
                            신청서 제출하기
                        </button>
                    </form>
                </div>
            </div>
        </div>
    `;
}

function renderThankYou() {
    return `
        <div class="min-h-screen flex items-center justify-center bg-[#FAF9F7] px-5 py-24">
            <div class="bg-white rounded-[2.5rem] shadow-sm p-12 max-w-[420px] w-full text-center animate-fade-in-up border border-gray-100">
                <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-900 mx-auto mb-8 shadow-sm border border-gray-100">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                </div>
                <h2 class="text-2xl font-extrabold text-gray-900 mb-4 tracking-tight">소중한 이야기를<br>잘 받았습니다</h2>
                <p class="text-gray-500 mb-10 leading-relaxed text-sm font-light break-keep">
                    귀한 마음을 나누어 주셔서 진심으로 감사합니다.<br>
                    남겨주신 연락처로 24시간 이내에 안내해 드리겠습니다.
                </p>
                <div class="flex flex-col gap-3">
                    <button onclick="renderSection('home')" class="w-full py-4 rounded-2xl bg-gray-900 text-white hover:bg-black transition-all hover:-translate-y-1 font-bold shadow-md text-sm">
                        홈으로 돌아가기
                    </button>
                </div>
            </div>
        </div>
    `;
}


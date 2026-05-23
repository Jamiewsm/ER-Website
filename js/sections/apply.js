function renderApply(payload = null) {
    const fromTest = payload?.source === 'test';
    const focus = String(payload?.focus || '').trim();
    const focusConfig = {
        parenting: {
            track: 'paid',
            title: '자녀 양육 코칭 상담',
            desc: '부모와 아이의 반응 패턴, 반복되는 충돌 장면, 집에서 바로 적용할 양육 언어를 함께 정리합니다.',
            bannerTitle: '자녀 양육 상담 안내',
            bannerBody: '아이만 바꾸려 하기보다 부모와 아이의 기질 차이를 함께 읽고, 실제 집 안 대화 장면에 적용하는 방향으로 안내합니다.',
            category: '자녀 양육 코칭 문의',
            message: '자녀 양육 문제를 함께 정리받고 싶습니다.'
        },
        couple: {
            track: 'paid',
            title: '부부 코칭 상담',
            desc: '부부의 차이와 오해, 반복되는 갈등 패턴을 함께 정리하고 실제 대화 방식을 설계합니다.',
            bannerTitle: '부부 관계 상담 안내',
            bannerBody: '서로의 다름을 문제로만 보지 않고, 반복되는 갈등 구조를 이해하고 대화 가능한 관계로 전환하는 방향을 함께 찾습니다.',
            category: '부부 코칭 1회 ($220)',
            message: '부부 관계 코칭을 원합니다.'
        },
        team: {
            track: 'org',
            title: '기업/팀 프로그램 문의',
            desc: '팀 소통, 역할 충돌, 갈등 비용, 리더십 정렬 문제를 남겨 주시면 맞춤형 워크숍 방향을 제안합니다.',
            bannerTitle: '팀 워크숍 문의 안내',
            bannerBody: '성격 설명에서 끝나지 않고, 팀 소통 규칙과 역할 적합성, 리더십 커뮤니케이션까지 연결하는 방식으로 설계합니다.',
            category: '기업/팀 워크숍 문의',
            message: '우리 팀의 소통과 역할 정렬 문제를 상담하고 싶습니다.'
        },
        church: {
            track: 'org',
            title: '교회 프로그램 문의',
            desc: '사역자 소진, 공동체 갈등, 리더십 소통 문제를 교회 현장에 맞는 워크숍과 후속 코칭으로 제안합니다.',
            bannerTitle: '교회 공동체 회복 문의 안내',
            bannerBody: '교회의 규모와 현재 고민, 리더 구성과 일정에 맞춰 공동체 회복 프로그램과 리더십 워크숍 방향을 함께 정리합니다.',
            category: '교회 워크숍 문의',
            message: '우리 교회의 공동체/리더십 회복을 위한 상담을 원합니다.'
        }
    };

    const selectedFocus = focusConfig[focus] || null;
    const requestedTrack = payload?.track || (fromTest ? 'paid' : 'paid');
    const track = selectedFocus?.track || requestedTrack;
    const isSupportTrack = track === 'support';
    const isMinistryTrack = track === 'ministry';
    const isOrgTrack = track === 'org';
    const submitSource = fromTest ? 'test' : (focus ? `${track}:${focus}` : track);
    const testSummary = state.latestTestResult
        ? `약식 테스트 결과: ${state.latestTestResult.finalLabel}, 코어 ${state.latestTestResult.coreType}번, 날개 ${state.latestTestResult.wingLabel}, 하위유형 ${state.latestTestResult.subtypeSummary}, 본능 ${state.latestTestResult.instinctSummary}`
        : '';

    const trackTitle = selectedFocus?.title || (
        isSupportTrack
            ? '후원·협력 문의'
            : isMinistryTrack
                ? '사역지원 신청'
                : isOrgTrack
                    ? '기관/교회 프로그램 문의'
                    : '상담 및 코칭 신청'
    );
    const trackDesc = selectedFocus?.desc || (
        isSupportTrack
            ? '후원 및 협력 관련 문의를 남겨 주세요.'
            : isMinistryTrack
                ? '목회자·선교사 사역지원(무료/감면) 신청을 남겨 주세요.'
                : isOrgTrack
                    ? '교회/기관/기업 프로그램 문의를 남겨 주세요.'
                    : '신청 내용을 남겨주세요.'
    );

    const categoryOptions = isSupportTrack
        ? ['후원 문의', '협력 파트너십 문의', '공동 프로그램 제안', '기타 협력 문의']
        : isMinistryTrack
            ? ['목회자 사역지원 신청', '선교사 사역지원 신청', '긴급 지원 요청', '기타 사역지원 문의']
            : isOrgTrack
                ? ['교회 워크숍 문의', '기관 프로그램 문의', '기업/팀 워크숍 문의', '리더 디브리핑 문의']
                : ['정체성 발견 세션 ($100)', '개별 코칭 1회 ($80)', '자녀 양육 코칭 문의', '회복 여정 4회 ($260)', '회복 여정 8회 ($600)', '부부 코칭 1회 ($220)'];
    const selectedCategory = selectedFocus && categoryOptions.includes(selectedFocus.category)
        ? selectedFocus.category
        : categoryOptions[0];
    const seededMessage = fromTest && testSummary
        ? `${testSummary}\n${selectedFocus?.message || '정체성 발견 세션 신청합니다.'}`
        : (selectedFocus?.message || '');
    const bannerTitle = selectedFocus?.bannerTitle || (
        fromTest
            ? '테스트 후 추천 트랙'
            : isSupportTrack
                ? '후원·협력 전용 창구'
                : isMinistryTrack
                    ? '사역지원 신청 안내'
                    : isOrgTrack
                        ? '기관/교회 프로그램 안내'
                        : ''
    );
    const bannerBody = selectedFocus?.bannerBody || (
        fromTest
            ? '약식 테스트 결과를 바탕으로 정체성 발견 세션에서 현재 패턴과 회복 방향을 구체적으로 정리해 드립니다.'
            : isSupportTrack
                ? '후원 문의, 교회·기관 파트너십, 공동 프로그램 협력 요청을 이곳에 남겨주세요. 현재 후원은 개별 안내로 진행됩니다.'
                : isMinistryTrack
                    ? '목회자·선교사 대상 무료/감면 사역지원 트랙은 심사 후 배정됩니다.'
                    : isOrgTrack
                        ? '프로그램 규모와 대상에 따라 맞춤 견적으로 안내드립니다.'
                        : ''
    );

    return `
        <div class="bg-er-base min-h-screen py-20 px-4">
            <div class="max-w-2xl mx-auto">
                <div class="text-center mb-10 animate-fade-in-up">
                    <h2 class="text-3xl font-bold text-gray-900">${trackTitle}</h2>
                    <p class="mt-3 text-gray-500 text-sm break-keep">${trackDesc}</p>
                </div>
                
                <div class="bg-white rounded-3xl shadow-card floating-card p-8 md:p-10 animate-fade-in-up border border-white/40" style="animation-delay: 0.1s;">
                    ${bannerTitle ? `
                        <div class="mb-6 p-4 rounded-2xl border border-er-accent/30 bg-er-accent/10">
                            <p class="text-sm font-bold text-er-dark mb-1">${bannerTitle}</p>
                            <p class="text-xs text-gray-600 break-keep">${bannerBody}</p>
                        </div>
                    ` : ''}

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
                                    ${categoryOptions.map((opt) => `<option ${opt === selectedCategory ? 'selected' : ''}>${opt}</option>`).join('')}
                                </select>
                                <div class="absolute right-4 top-3.5 text-gray-400 pointer-events-none"><i class="fas fa-chevron-down"></i></div>
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-2">나누고 싶은 이야기</label>
                            <textarea name="message" rows="4" class="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-er-accent focus:border-transparent outline-none transition-all resize-none" placeholder="지금의 고민이나 바라는 도움을 편하게 적어주세요.">${seededMessage}</textarea>
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

function renderThankYou() {
    return `
        <div class="min-h-screen flex items-center justify-center bg-er-base px-6">
            <div class="bg-white rounded-[2rem] shadow-card floating-card p-10 max-w-sm w-full text-center animate-fade-in-up border border-white/40">
                <div class="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-500 text-2xl mx-auto mb-6">
                    <i class="fas fa-check"></i>
                </div>
                <h2 class="text-xl font-bold text-gray-900 mb-2">소중한 이야기를 잘 받았습니다</h2>
                <p class="text-gray-500 mb-8 leading-relaxed text-xs break-keep">
                    마음을 나누어 주셔서 감사합니다.<br>
                    남겨주신 연락처로 곧 정성껏 연락드리겠습니다.
                </p>
                <button onclick="renderSection('home')" class="w-full py-3 rounded-xl bg-er-dark text-white hover:bg-gray-800 transition-colors font-bold shadow-md text-sm">
                    처음 화면으로 돌아가기
                </button>
            </div>
        </div>
    `;
}

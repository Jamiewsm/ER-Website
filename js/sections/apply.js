function isParentingWorkshopFocus(focus) {
    const normalizedFocus = String(focus || '').trim();
    return normalizedFocus === 'parenting_workshop' || normalizedFocus === 'parents_workshop';
}

function isJulyBasicCourseFocus(focus) {
    const normalizedFocus = String(focus || '').trim();
    return normalizedFocus === 'enneagram_basic_july'
        || normalizedFocus === 'basic_course_july'
        || normalizedFocus === 'enneagram_basic';
}

function isJulyBasicRecruitmentOpen() {
    if (typeof window !== 'undefined' && window.ERProgramCatalog && typeof window.ERProgramCatalog.isJulyBasicRecruitmentOpen === 'function') {
        return window.ERProgramCatalog.isJulyBasicRecruitmentOpen();
    }
    return Date.now() <= Date.parse('2026-07-05T23:59:59-07:00');
}

function getPaidApplyCategoryOptions() {
    if (typeof window !== 'undefined' && window.ERProgramCatalog && typeof window.ERProgramCatalog.getPaidCategoryOptions === 'function') {
        return window.ERProgramCatalog.getPaidCategoryOptions();
    }
    return [
        '테스트 결과지 해석상담 ($50)',
        '유형(Typing) 상담 ($100)',
        '개별 코칭 1회 ($80)',
        '에니어그램 8주 기본과정 ($300)',
        '자녀 양육 코칭 문의',
        '회복 코칭 4회 ($300)',
        '회복 코칭 8회 ($480)',
        '부부 코칭 1회 ($220)',
        'Enneagram for Parenting 4주 ($120)'
    ];
}

function hydrateLatestTestResult() {
    if (state.latestTestResult) return;
    try {
        const raw = sessionStorage.getItem('er_latest_test_result');
        if (raw) state.latestTestResult = JSON.parse(raw);
    } catch (_err) {
        // ignore parse failures
    }
}

function hydrateChildTypeTestResult() {
    try {
        const raw = sessionStorage.getItem('er_child_type_result');
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed?.source === 'child_type_test' ? parsed : null;
    } catch (_err) {
        return null;
    }
}

function formatChildTypeTestSummary(summary) {
    if (!summary) return '';
    const top = Array.isArray(summary.topTypes)
        ? summary.topTypes.filter((t) => t !== summary.coreType).map((t) => `${t}번`).join(', ')
        : '';
    const parts = [
        `부모 관찰형 검사 결과: ${summary.finalLabel}`,
        `코어 ${summary.coreType}번${summary.coreTitle ? ` (${summary.coreTitle})` : ''}`,
        `날개 ${summary.wingLabel}`,
        `본능 ${summary.instinctSummary} (${summary.subtypeSummary})`,
        `점수 확신도 ${summary.confidenceLabel}`,
        `관찰 신뢰도 ${summary.reliabilityLabel}`,
    ];
    if (top) parts.push(`보조 후보 ${top}`);
    if (summary.selectedSituations?.length) {
        parts.push(`관찰 상황 ${summary.selectedSituations.length}건`);
    }
    return parts.join(', ');
}

function renderParentingWorkshopApply(submitSource) {
    return `
        <div class="parenting-apply-page min-h-screen bg-er-base px-4 pb-12 pt-6 md:px-6 md:py-10">
            <div class="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[minmax(270px,0.84fr)_minmax(430px,1fr)] lg:items-start">
                <section class="parenting-apply-intro overflow-hidden rounded-lg border border-er-accentLight bg-er-dark text-white">
                    <img
                        src="/assets/er-visual/hero-home.jpg"
                        alt=""
                        class="parenting-apply-photo h-28 w-full object-cover sm:h-36 lg:h-64"
                    />
                    <div class="p-5 sm:p-6">
                        <h1 class="text-[1.7rem] font-bold leading-tight sm:text-3xl">Enneagram for Parenting</h1>
                        <p class="mt-2 text-lg font-semibold text-white">4주 워크샵 신청</p>
                        <div class="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-white/20 pt-4 text-sm">
                            <p><span class="block text-[11px] text-white/60">진행</span>온라인 Zoom</p>
                            <p><span class="block text-[11px] text-white/60">시간</span>총 10시간</p>
                            <p><span class="block text-[11px] text-white/60">참가비</span>$120</p>
                            <p><span class="block text-[11px] text-white/60">모집</span>소규모 선착순</p>
                        </div>
                        <p class="mt-5 text-sm leading-relaxed text-white/80 break-keep">
                            신청 내용을 남겨주시면 일정과 참여 안내를 보내드립니다.
                        </p>
                    </div>
                </section>

                <section class="rounded-lg border border-er-accentLight bg-white p-5 shadow-soft sm:p-7">
                    <h2 class="text-lg font-bold text-er-dark">신청 정보</h2>
                    <p class="mb-6 mt-2 text-sm leading-relaxed text-er-primary break-keep">
                        아래 내용을 남겨주시면 담당자가 확인 후 연락드립니다.
                    </p>

                    <form id="apply-form" class="space-y-5" onsubmit="handleApplySubmit(event, '${submitSource}', { focus: 'parenting_workshop' })">
                        <input type="hidden" name="category" value="Enneagram for Parenting 4주 ($120)">

                        <div>
                            <label class="mb-2 block text-sm font-bold text-gray-700">이름</label>
                            <input type="text" name="name" required class="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-er-accent" placeholder="성함을 남겨주세요">
                        </div>

                        <div>
                            <label class="mb-2 block text-sm font-bold text-gray-700">연락받으실 곳</label>
                            <input type="text" name="contact" required class="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-er-accent" placeholder="전화번호 또는 이메일">
                        </div>

                        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label class="mb-2 block text-sm font-bold text-gray-700">거주 국가 <span class="font-normal text-gray-400">(선택)</span></label>
                                <input type="text" name="country" class="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-er-accent" placeholder="예: USA, Korea">
                            </div>
                            <div>
                                <label class="mb-2 block text-sm font-bold text-gray-700">희망 시간대 <span class="font-normal text-gray-400">(선택)</span></label>
                                <input type="text" name="preferred_time" class="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-er-accent" placeholder="예: Dallas PM">
                            </div>
                        </div>

                        <div>
                            <label class="mb-2 block text-sm font-bold text-gray-700">전하고 싶은 내용 <span class="font-normal text-gray-400">(선택)</span></label>
                            <textarea name="message" rows="3" class="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-er-accent" placeholder="전하고 싶은 내용이 있으시면 편하게 남겨주세요."></textarea>
                        </div>

                        <div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
                            <p class="mb-1 text-xs font-bold text-gray-600">보안 확인</p>
                            <p class="mb-2 text-[11px] text-gray-500 break-keep">스팸 방지를 위해 확인을 완료한 뒤 신청 버튼을 눌러 주세요.</p>
                            <p id="apply-turnstile-status" class="mb-2 hidden text-xs text-gray-500 break-keep" role="status" aria-live="polite"></p>
                            <div id="apply-turnstile-widget" class="min-h-[70px] w-full"></div>
                            <button type="button" id="apply-turnstile-retry" class="mt-2 hidden w-full rounded-lg border border-er-accent/40 py-2 text-xs font-bold text-er-dark hover:bg-er-accentLight/30" onclick="initApplyTurnstile()">
                                보안 확인 다시 불러오기
                            </button>
                            <input type="hidden" name="turnstile_token" id="apply-turnstile-token" value="">
                        </div>

                        <p id="apply-submit-status" class="hidden rounded-lg px-4 py-3 text-sm break-keep" role="status" aria-live="polite"></p>
                        <button id="apply-submit-btn" type="submit" data-default-label="4주 워크샵 신청하기" data-loading-label="접수 중..." class="w-full rounded-lg bg-er-dark py-4 font-bold text-white shadow-md transition-colors hover:bg-gray-800">
                            4주 워크샵 신청하기
                        </button>
                    </form>

                    <p class="mt-6 border-t border-gray-100 pt-5 text-center text-xs text-er-primary">
                        신청 전 문의
                        <a href="mailto:restoration.son@gmail.com" class="ml-2 font-bold underline">Email</a>
                        <span class="mx-2 text-er-muted">|</span>
                        <a href="https://www.instagram.com/er_parenting/" target="_blank" rel="noopener noreferrer" class="font-bold underline">Instagram</a>
                    </p>
                </section>
            </div>
        </div>
    `;
}

function renderJulyBasicCourseApply(submitSource) {
    return `
        <div class="course-apply-page min-h-screen bg-er-base px-4 pb-12 pt-6 md:px-6 md:py-10">
            <div class="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[minmax(300px,0.92fr)_minmax(430px,1fr)] lg:items-start">
                <section class="overflow-hidden rounded-lg border border-er-accentLight bg-white shadow-soft">
                    <div class="grid gap-0 md:grid-cols-[0.78fr_1fr] lg:grid-cols-1">
                        <div class="course-apply-poster-wrap bg-[#FBFAF5]">
                            <img
                                src="/assets/er-visual/enneagram-basic-july-2026.jpg"
                                alt="에니어그램 8주 기본과정 안내 이미지"
                                class="course-apply-poster h-48 w-full object-cover object-top sm:h-60 md:h-full lg:h-[28rem]"
                            />
                        </div>
                        <div class="p-5 sm:p-6">
                            <h1 class="text-[1.65rem] font-bold leading-tight text-er-dark sm:text-3xl">에니어그램 8주 기본과정</h1>
                            <p class="mt-2 text-base font-semibold leading-relaxed text-er-primary break-keep">
                                관계 속에서 드러나는 나를 이해하는 시간
                            </p>
                            <p class="mt-4 text-sm leading-relaxed text-gray-600 break-keep">
                                내 안의 패턴을 이해하고, 하나님 안에서 본래의 나로 회복되는 여정을 시작합니다.
                            </p>
                            <div class="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-er-accentLight pt-4 text-sm text-er-dark">
                                <p><span class="block text-[11px] text-er-muted">기간</span>2026년 7월 개강 · 8주</p>
                                <p><span class="block text-[11px] text-er-muted">방식</span>온라인 Zoom</p>
                                <p><span class="block text-[11px] text-er-muted">구성</span>교재 + 강의 + 1:1 멘토링</p>
                                <p><span class="block text-[11px] text-er-muted">정원</span>최대 10명</p>
                                <p class="col-span-2"><span class="block text-[11px] text-er-muted">수강료 (USD)</span>$300 <span class="text-xs text-er-muted">· 6/24까지 얼리버드 $270 · PayPal·Zelle</span></p>
                            </div>
                            <a href="/basic-course.html" class="mt-4 inline-block text-xs font-bold text-er-dark underline">과정 상세 안내 보기 →</a>
                        </div>
                    </div>
                </section>

                <section class="rounded-lg border border-er-accentLight bg-white p-5 shadow-soft sm:p-7">
                    <h2 class="text-lg font-bold text-er-dark">기본과정 신청 정보</h2>
                    <p class="mb-6 mt-2 text-sm leading-relaxed text-er-primary break-keep">
                        아래 내용을 남겨주시면 접수 후 담당자 확인을 거쳐 등록·결제 안내 메일(USD, PayPal·Zelle)을 보내드립니다.
                    </p>

                    <form id="apply-form" class="space-y-5" onsubmit="handleApplySubmit(event, '${submitSource}', { focus: 'enneagram_basic_july' })">
                        <input type="hidden" name="category" value="에니어그램 8주 기본과정 ($300)">

                        <div>
                            <label class="mb-2 block text-sm font-bold text-gray-700">이름</label>
                            <input type="text" name="name" required class="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-er-accent" placeholder="성함을 남겨주세요">
                        </div>

                        <div>
                            <label class="mb-2 block text-sm font-bold text-gray-700">연락받으실 곳</label>
                            <input type="text" name="contact" required class="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-er-accent" placeholder="전화번호 또는 이메일">
                        </div>

                        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label class="mb-2 block text-sm font-bold text-gray-700">거주 국가 <span class="font-normal text-gray-400">(선택)</span></label>
                                <input type="text" name="country" class="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-er-accent" placeholder="예: USA, Korea">
                            </div>
                            <div>
                                <label class="mb-2 block text-sm font-bold text-gray-700">희망 시간대 <span class="font-normal text-gray-400">(선택)</span></label>
                                <input type="text" name="preferred_time" class="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-er-accent" placeholder="예: Dallas PM">
                            </div>
                        </div>

                        <div>
                            <label class="mb-2 block text-sm font-bold text-gray-700">에니어그램을 어느 정도 접해보셨나요?</label>
                            <div class="relative">
                                <select name="enneagram_experience" required class="w-full appearance-none rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-700 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-er-accent">
                                    <option value="" disabled selected>선택해 주세요</option>
                                    <option>처음 접합니다</option>
                                    <option>책이나 글을 읽어본 적이 있습니다</option>
                                    <option>강의를 들어본 적이 있습니다</option>
                                    <option>코칭 또는 타이핑을 받아본 적이 있습니다</option>
                                    <option>어느 정도 공부해본 경험이 있습니다</option>
                                </select>
                                <div class="pointer-events-none absolute right-4 top-3.5 text-gray-400"><i class="fas fa-chevron-down"></i></div>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label class="mb-2 block text-sm font-bold text-gray-700">어디서 알게 되셨나요?</label>
                                <div class="relative">
                                    <select name="referral_source" required class="w-full appearance-none rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-700 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-er-accent">
                                        <option value="" disabled selected>선택해 주세요</option>
                                        <option>인스타그램</option>
                                        <option>유튜브·영상</option>
                                        <option>웹사이트·검색</option>
                                        <option>지인 소개</option>
                                        <option>교회·사역자 소개</option>
                                        <option>ER 강의·세미나·워크샵</option>
                                        <option>기타</option>
                                    </select>
                                    <div class="pointer-events-none absolute right-4 top-3.5 text-gray-400"><i class="fas fa-chevron-down"></i></div>
                                </div>
                            </div>
                            <div>
                                <label class="mb-2 block text-sm font-bold text-gray-700">소개해 주신 분 <span class="font-normal text-gray-400">(선택)</span></label>
                                <input type="text" name="referral_name" class="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-er-accent" placeholder="지인·사역자 소개인 경우">
                            </div>
                        </div>

                        <div>
                            <label class="mb-2 block text-sm font-bold text-gray-700">전하고 싶은 내용 <span class="font-normal text-gray-400">(선택)</span></label>
                            <textarea name="message" rows="3" class="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-er-accent" placeholder="신청 동기나 궁금한 점을 편하게 적어주세요."></textarea>
                        </div>

                        <label class="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 cursor-pointer">
                            <input type="checkbox" name="covenant_agree" required class="mt-0.5 h-4 w-4 shrink-0 accent-[#657453]">
                            <span class="text-xs leading-relaxed text-gray-600 break-keep">수업과 멘토링에서 나눈 개인 이야기를 외부에 공유하지 않으며, 서로 존중하는 안전한 공동체를 만드는 데 협력하고, 강의와 멘토링에 성실히 참여하겠습니다.</span>
                        </label>

                        <div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
                            <p class="mb-1 text-xs font-bold text-gray-600">보안 확인</p>
                            <p class="mb-2 text-[11px] text-gray-500 break-keep">스팸 방지를 위해 확인을 완료한 뒤 신청 버튼을 눌러 주세요.</p>
                            <p id="apply-turnstile-status" class="mb-2 hidden text-xs text-gray-500 break-keep" role="status" aria-live="polite"></p>
                            <div id="apply-turnstile-widget" class="min-h-[70px] w-full"></div>
                            <button type="button" id="apply-turnstile-retry" class="mt-2 hidden w-full rounded-lg border border-er-accent/40 py-2 text-xs font-bold text-er-dark hover:bg-er-accentLight/30" onclick="initApplyTurnstile()">
                                보안 확인 다시 불러오기
                            </button>
                            <input type="hidden" name="turnstile_token" id="apply-turnstile-token" value="">
                        </div>

                        <p id="apply-submit-status" class="hidden rounded-lg px-4 py-3 text-sm break-keep" role="status" aria-live="polite"></p>
                        <button id="apply-submit-btn" type="submit" data-default-label="에니어그램 8주 기본과정 신청하기" data-loading-label="접수 중..." class="w-full rounded-lg bg-er-dark py-4 font-bold text-white shadow-md transition-colors hover:bg-gray-800">
                            에니어그램 8주 기본과정 신청하기
                        </button>
                    </form>

                    <p class="mt-6 border-t border-gray-100 pt-5 text-center text-xs text-er-primary">
                        신청 전 문의
                        <a href="mailto:json@er-coaching.com" class="ml-2 font-bold underline">Email</a>
                        <span class="mx-2 text-er-muted">|</span>
                        <a href="https://www.instagram.com/er_official_Korea/" target="_blank" rel="noopener noreferrer" class="font-bold underline">Instagram</a>
                    </p>
                </section>
            </div>
        </div>
    `;
}

function renderJulyBasicCourseClosed() {
    return `
        <div class="course-apply-page min-h-screen bg-er-base px-4 pb-12 pt-6 md:px-6 md:py-10">
            <div class="mx-auto max-w-xl">
                <section class="overflow-hidden rounded-lg border border-er-accentLight bg-white p-6 shadow-soft sm:p-8 text-center">
                    <span class="inline-flex rounded-full bg-er-greenTint px-3 py-1 text-[11px] font-bold text-er-green ring-1 ring-[#dce7cd]">모집 마감</span>
                    <h1 class="mt-4 text-[1.65rem] font-bold leading-tight text-er-dark sm:text-3xl break-keep">2026년 7월 기본과정은 개강했습니다</h1>
                    <p class="mt-4 text-sm leading-relaxed text-er-primary break-keep">
                        A반·B반 총 <strong>13명</strong>이 함께합니다.<br>
                        A반 <strong>7월 7일(월)</strong> · B반 <strong>7월 10일(목)</strong> 개강
                    </p>
                    <p class="mt-3 text-sm leading-relaxed text-gray-600 break-keep">
                        이번 기수 모집은 마감되었습니다. 과정 소개와 다음 기수 소식은 아래에서 확인하실 수 있습니다.
                    </p>
                    <div class="mt-8 grid gap-3">
                        <a href="/basic-course.html" class="w-full rounded-lg bg-er-dark py-3.5 text-sm font-bold text-white transition-colors hover:bg-gray-800">과정 안내 보기</a>
                        <button type="button" onclick="renderSection('home')" class="w-full rounded-lg border border-er-accentLight py-3.5 text-sm font-bold text-er-dark transition-colors hover:bg-er-accentLight/30">ER 홈으로</button>
                        <a href="mailto:json@er-coaching.com?subject=다음%20기본과정%20알림%20요청" class="w-full rounded-lg border border-er-accentLight py-3.5 text-sm font-bold text-er-dark transition-colors hover:bg-er-accentLight/30">다음 기수 알림 문의</a>
                    </div>
                </section>
            </div>
        </div>
    `;
}

function renderApply(payload = null) {
    hydrateLatestTestResult();
    const fromTest = payload?.source === 'test';
    const fromChildTypeTest = payload?.apply_source === 'child_type_test';
    const childTypeResult = fromChildTypeTest ? hydrateChildTypeTestResult() : null;
    let focus = String(payload?.focus || '').trim();
    if (focus === 'parents_workshop') focus = 'parenting_workshop';
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
        parenting_workshop: {
            track: 'paid',
            title: 'Enneagram for Parenting 4주 워크샵 신청',
            desc: '나를 알고, 아이를 이해하는 4주 자녀양육 워크샵(온라인 Zoom) 신청을 남겨 주세요.',
            bannerTitle: 'Enneagram for Parenting — 심화 워크샵',
            bannerBody: '에니어그램 입문 과정이 아닌 심화 과정입니다. 6월 셋째 주–7월 둘째 주, 소규모 선착순 모집($120). 일정은 인원 확정 후 안내드립니다.',
            category: 'Enneagram for Parenting 4주 ($120)',
            message: 'Enneagram for Parenting 4주 워크샵 신청합니다.'
        },
        enneagram_basic_july: {
            track: 'paid',
            title: '에니어그램 8주 기본과정 신청',
            desc: '7-8월 온라인 기본과정 신청을 남겨 주세요.',
            bannerTitle: '에니어그램 8주 기본과정',
            bannerBody: '9가지 유형의 핵심 동기와 패턴을 배우고, 관계와 회복의 관점으로 삶에 적용하는 온라인 과정입니다.',
            category: '에니어그램 8주 기본과정 ($300)',
            message: '에니어그램 8주 기본과정 신청합니다.'
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
        },
        identity_session: {
            track: 'paid',
            title: '유형(Typing) 상담 신청',
            desc: '90분 심층 세션에서 사전 설문·인터뷰 기반 타이핑과 핵심 동기·방어 패턴을 함께 정리합니다.',
            bannerTitle: '테스트 후 추천 — Typing 상담',
            bannerBody: '약식 테스트 결과를 바탕으로, 인터뷰 기반 타이핑으로 코어·날개·하위유형을 함께 확인합니다.',
            category: '유형(Typing) 상담 ($100)',
            message: '유형(Typing) 상담 신청합니다.'
        },
        result_consult: {
            track: 'paid',
            title: '테스트 결과지 해석상담 신청',
            desc: '결과지를 함께 읽으며 핵심 유형, 하위유형, 날개, 신뢰도, 헷갈리는 유형을 1시간 동안 정리합니다. (1시간 $50)',
            bannerTitle: '프리미엄 테스트 후 추천 — 결과지 해석상담',
            bannerBody: '결과지는 방향을 보여줍니다. 상담에서는 이 결과가 실제 삶의 반복 장면과 어떻게 연결되는지 함께 확인하고, 다음 적용 방향을 정리합니다. (1시간 $50)',
            category: '테스트 결과지 해석상담 ($50)',
            message: '테스트 결과지 해석상담 신청합니다.'
        },
        coaching_single: {
            track: 'paid',
            title: '개별 코칭 1회 신청',
            desc: '60분 실전 코칭으로 관계·감정의 막힌 지점을 실제 장면에 적용합니다.',
            bannerTitle: '개별 코칭 신청',
            bannerBody: '결과지에서 읽은 패턴을 일상 관계 장면에 바로 연결하는 1회 세션입니다.',
            category: '개별 코칭 1회 ($80)',
            message: '개별 코칭 1회 신청합니다.'
        },
        recovery_journey_4: {
            track: 'paid',
            title: '회복 코칭 프로그램 (4회) 신청',
            desc: '4회 집중 코스로 패턴 인식부터 실행 루틴까지 이어갑니다. 회당 $75 (단회 $80 대비 소폭 할인).',
            bannerTitle: '회복 코칭 4회',
            bannerBody: '짧은 기간에 집중적으로 회복 방향을 정착시키고 싶을 때 추천합니다.',
            category: '회복 코칭 4회 ($300)',
            message: '회복 코칭 4회 프로그램 신청합니다.'
        },
        recovery_journey_8: {
            track: 'paid',
            title: '회복 코칭 프로그램 (8회) 신청',
            desc: '8회 심화 코스로 감정·관계·실행 루틴까지 이어지는 지속적 변화를 돕습니다. 회당 $60.',
            bannerTitle: '회복 코칭 8회 — 가장 많이 선택',
            bannerBody: '단회 대비 가장 경제적이며, 회복이 습관으로 정착하기 좋은 프로그램입니다.',
            category: '회복 코칭 8회 ($480)',
            message: '회복 코칭 8회 프로그램 신청합니다.'
        }
    };

    const selectedFocus = focusConfig[focus] || null;
    // 아이 유형검사에서 넘어온 부모에게는 성인 테스트용 카피 대신 양육 문맥 카피를 노출(상품·가격·category 무변경).
    const childResultFocus = fromChildTypeTest ? {
        title: '아이 유형검사 결과 해석상담',
        desc: '아이 관찰 결과를 함께 읽으며 상위 후보, 본능 성향, 부모의 관찰 편향 가능성, 그리고 아이에게 맞는 양육 방향을 1시간 동안 정리합니다.',
        bannerTitle: '아이 검사 후 추천 — 결과 해석상담',
        bannerBody: '아이 유형검사는 방향을 보여줍니다. 해석상담에서는 점수와 상위 후보, 부모의 관찰 편향 가능성을 함께 검토하고 아이에게 맞는 양육 언어와 다음 적용을 정리합니다. (1시간 $50)'
    } : null;
    const requestedTrack = payload?.track || (fromTest ? 'paid' : 'paid');
    const track = selectedFocus?.track || requestedTrack;
    const isSupportTrack = track === 'support';
    const isMinistryTrack = track === 'ministry';
    const isOrgTrack = track === 'org';
    const applyAttribution = fromTest ? 'test' : (fromChildTypeTest ? 'child_type_test' : (payload?.apply_source || ''));
    const submitSource = typeof buildApplySubmitSource === 'function'
        ? buildApplySubmitSource(track, focus, applyAttribution)
        : (fromTest ? 'test' : (focus ? `${track}:${focus}` : track));
    if (isParentingWorkshopFocus(focus)) {
        return renderParentingWorkshopApply(submitSource);
    }
    if (isJulyBasicCourseFocus(focus)) {
        if (!isJulyBasicRecruitmentOpen()) return renderJulyBasicCourseClosed();
        return renderJulyBasicCourseApply(submitSource);
    }
    const testSummary = fromTest && state.latestTestResult
        ? `약식 테스트 결과: ${state.latestTestResult.finalLabel}, 코어 ${state.latestTestResult.coreType}번, 날개 ${state.latestTestResult.wingLabel}, 하위유형 ${state.latestTestResult.subtypeSummary}, 본능 ${state.latestTestResult.instinctSummary}`
        : (fromChildTypeTest && childTypeResult ? formatChildTypeTestSummary(childTypeResult) : '');

    const trackTitle = childResultFocus?.title || selectedFocus?.title || (
        isSupportTrack
            ? '후원·협력 문의'
            : isMinistryTrack
                ? '사역지원 신청'
                : isOrgTrack
                    ? '기관/교회 프로그램 문의'
                    : '상담 및 코칭 신청'
    );
    const trackDesc = childResultFocus?.desc || selectedFocus?.desc || (
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
                : getPaidApplyCategoryOptions();
    const defaultPaidCategory = '테스트 결과지 해석상담 ($50)';
    const selectedCategory = selectedFocus && categoryOptions.includes(selectedFocus.category)
        ? selectedFocus.category
        : defaultPaidCategory;
    const seededMessage = (fromTest || fromChildTypeTest) && testSummary
        ? `${testSummary}\n${selectedFocus?.message || '유형(Typing) 상담 신청합니다.'}`
        : (selectedFocus?.message || '');
    const bannerTitle = childResultFocus?.bannerTitle || selectedFocus?.bannerTitle || (
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
    const bannerBody = childResultFocus?.bannerBody || selectedFocus?.bannerBody || (
        fromTest
            ? '약식 테스트 결과를 바탕으로 유형(Typing) 상담에서 현재 패턴과 회복 방향을 구체적으로 정리해 드립니다.'
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
                            <p class="text-xs font-bold text-gray-600 mb-1">보안 확인</p>
                            <p class="text-[11px] text-gray-500 mb-2 break-keep">스팸 방지를 위해 아래 확인을 완료한 뒤 신청하기를 눌러 주세요.</p>
                            <p id="apply-turnstile-status" class="text-xs text-gray-500 mb-2 break-keep hidden" role="status" aria-live="polite"></p>
                            <div id="apply-turnstile-widget" class="min-h-[70px] w-full"></div>
                            <button type="button" id="apply-turnstile-retry" class="hidden mt-2 w-full py-2 rounded-lg border border-er-accent/40 text-er-dark text-xs font-bold hover:bg-er-accentLight/30" onclick="initApplyTurnstile()">
                                보안 확인 다시 불러오기
                            </button>
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

function renderThankYou(payload = null) {
    if (isParentingWorkshopFocus(payload?.focus)) {
        return `
            <div class="min-h-screen bg-er-base px-4 py-14">
                <div class="mx-auto max-w-md rounded-lg border border-er-accentLight bg-white p-8 text-center shadow-soft">
                    <div class="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-xl text-green-600">
                        <i class="fas fa-check"></i>
                    </div>
                    <h2 class="mb-3 text-xl font-bold text-er-dark">신청이 접수되었습니다</h2>
                    <p class="text-sm leading-relaxed text-er-primary break-keep">
                        남겨주신 연락처로 일정과 참여 안내를 보내드리겠습니다.<br>
                        보통 24시간 이내에 연락드립니다.
                    </p>
                    <div class="mt-8 grid gap-3">
                        <button onclick="renderSection('home')" class="w-full rounded-lg bg-er-dark py-3 text-sm font-bold text-white transition-colors hover:bg-gray-800">
                            ER 홈페이지로 돌아가기
                        </button>
                        <a href="https://www.instagram.com/er_parenting/" target="_blank" rel="noopener noreferrer" class="w-full rounded-lg border border-er-accentLight py-3 text-sm font-bold text-er-dark transition-colors hover:bg-er-accentLight/30">
                            Instagram 보기
                        </a>
                    </div>
                </div>
            </div>
        `;
    }
    if (isJulyBasicCourseFocus(payload?.focus)) {
        return `
            <div class="min-h-screen bg-er-base px-4 py-14">
                <div class="mx-auto max-w-md rounded-lg border border-er-accentLight bg-white p-8 text-center shadow-soft">
                    <div class="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-xl text-green-600">
                        <i class="fas fa-check"></i>
                    </div>
                    <h2 class="mb-3 text-xl font-bold text-er-dark">기본과정 신청이 접수되었습니다</h2>
                    <p class="text-sm leading-relaxed text-er-primary break-keep">
                        접수가 완료되었습니다. 담당자 확인 후 <strong>24시간 이내</strong> 등록·결제 안내 메일(USD, PayPal·Zelle)을 보내드립니다.<br>
                        자리 확정은 <strong>입금 확인 순</strong>이며, 확인 후 사전 성찰 설문 링크를 보내드립니다.
                    </p>
                    <div class="mt-8 grid gap-3">
                        <button onclick="renderSection('home')" class="w-full rounded-lg bg-er-dark py-3 text-sm font-bold text-white transition-colors hover:bg-gray-800">
                            ER 홈페이지로 돌아가기
                        </button>
                        <a href="https://www.instagram.com/er_official_Korea/" target="_blank" rel="noopener noreferrer" class="w-full rounded-lg border border-er-accentLight py-3 text-sm font-bold text-er-dark transition-colors hover:bg-er-accentLight/30">
                            Instagram 보기
                        </a>
                    </div>
                </div>
            </div>
        `;
    }
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

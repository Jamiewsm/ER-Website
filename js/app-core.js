// ER App: Core routing — parseSectionHash, renderSection, toggleMobileMenu
// --- Core Functions ---
function parseSectionHash() {
    const rawHash = window.location.hash.replace(/^#/, '').trim();
    if (!rawHash) return { sectionId: 'home', payload: null };

    const [rawSectionId, rawQuery = ''] = rawHash.split('?');
    const params = new URLSearchParams(rawQuery);
    const payload = {};
    params.forEach((value, key) => {
        payload[key] = value;
    });

    return {
        sectionId: rawSectionId || 'home',
        payload: Object.keys(payload).length ? payload : null
    };
}

function buildSectionHash(sectionId, payload = null) {
    const params = new URLSearchParams();
    if (payload && typeof payload === 'object') {
        Object.entries(payload).forEach(([key, value]) => {
            if (key === 'applicationReceipt') return;
            if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
        });
    }
    const query = params.toString();
    return `#${sectionId || 'home'}${query ? `?${query}` : ''}`;
}

function syncSectionHash(sectionId, payload = null, replaceHash = false) {
    const nextHash = buildSectionHash(sectionId, payload);
    if (window.location.hash === nextHash) return;
    if (replaceHash) {
        history.replaceState(null, '', nextHash);
    } else {
        window.location.hash = nextHash;
    }
}

function redirectPortalSection(sectionId, payload = null, replace = false) {
    if (['login', 'mypage', 'portal', 'education'].includes(sectionId)) {
        openPortalEntry(replace);
        return true;
    }
    const coachTabs = {
        coach: 'dashboard', coach_portal: 'dashboard', coach_tasks: 'training',
        coach_materials: 'resources', coach_schedule: 'calendar', coach_notes: 'reports',
        coach_mentoring: 'practicum'
    };
    if (!Object.prototype.hasOwnProperty.call(coachTabs, sectionId)) return false;
    openCoachApp((sectionId === 'coach' || sectionId === 'coach_portal') && payload?.tab
        ? payload.tab : coachTabs[sectionId], replace);
    return true;
}

function restoreSiteAdminReturn() {
    const params = new URLSearchParams(window.location.search || '');
    const sectionId = params.get('site_admin');
    if (sectionId !== 'coach_admin' && sectionId !== 'notices') return null;
    params.delete('site_admin');
    const query = params.toString();
    history.replaceState(null, '', window.location.pathname + (query ? '?' + query : '') + buildSectionHash(sectionId));
    return { sectionId, payload: null };
}

function renderSection(sectionId, payload = null, options = {}) {
    if (redirectPortalSection(sectionId, payload)) return;
    // 신학적 기초는 정적 /theology/ 가 SSOT. 해시 북마크는 그곳으로 넘긴다.
    if (sectionId === 'theology') {
        const dest = typeof theologyStaticUrl === 'function' ? theologyStaticUrl(payload) : '/theology/';
        window.location.replace(dest);
        return;
    }
    const { syncHash = true, replaceHash = false } = options;
    const previousSection = state.currentSection;
    const activeFocus = String(payload?.focus || '').trim();
    const isParentingFocus = activeFocus === 'parenting_workshop' || activeFocus === 'parents_workshop';
    const isBasicCourseFocus = (
        activeFocus === 'enneagram_basic_july'
        || activeFocus === 'basic_course_july'
        || activeFocus === 'enneagram_basic_october'
        || activeFocus === 'basic_course_october'
        || activeFocus === 'enneagram_basic'
    );
    const isFocusedApplyJourney = (
        sectionId === 'apply' || sectionId === 'thankyou'
    ) && (
        isParentingFocus || isBasicCourseFocus
    );
    const isParentingFocusedView = (
        sectionId === 'apply' || sectionId === 'thankyou'
    ) && isParentingFocus;
    document.body.classList.toggle('parenting-focused-apply', isParentingFocusedView);
    document.body.classList.toggle('course-focused-apply', isFocusedApplyJourney);
    // Preserve 진단 iframe across navigation: detach before main.innerHTML replaces DOM.
    if (previousSection === 'test' && sectionId !== 'test') {
        const iframe = document.getElementById('adaptive-test-iframe');
        if (iframe) {
            state.testIframeEl = iframe;
            state.testIframeLang = adaptiveLang;
            iframe.remove();
        }
    }
    if (sectionId === 'programs' && payload?.tab) {
        state.programFilter = payload.tab;
    }
    state.currentSection = sectionId;
    state.currentPayload = payload;
    const main = document.getElementById('main-content');
    
    // Close mobile menu
    closeMobileMenu();
    closeDesktopNavMenus();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'auto' }); 

    let html = '';
    switch(sectionId) {
        case 'home': html = renderHome(); break;
        case 'about': html = renderAbout(); break;
        case 'coaches': html = renderCoaches(); break;
        case 'programs': html = renderPrograms(); break;
        case 'parenting': html = renderParenting(payload); break;
        case 'coach_training': html = renderCoachTraining(); break;
        case 'community': html = renderCommunity(); break;
        case 'resources': html = renderResources(); break;
        case 'support': html = renderSupport(); break;
        case 'privacy': html = renderPrivacy(); break;
        case 'terms': html = renderTerms(); break;
        case 'test': html = renderTest(); break;
        case 'notices': html = renderNotices(); break;
        case 'notice_detail': html = renderNoticeDetail(payload); break;
        case 'types_guide': html = renderTypesGuide(); break; 
        case 'apply': html = renderApply(payload); break;
        case 'coach_admin': html = renderCoachAdmin(); break;
        case 'thankyou': html = renderThankYou(payload); break;
        default: html = renderHome();
    }

    main.innerHTML = html;
    if (sectionId !== 'home' && typeof closeParentsWorkshopPromo === 'function') {
        closeParentsWorkshopPromo();
    }
    const sectionLabels = {
        home: '홈', about: 'ER 소개', test: '내러티브 테스트', types_guide: '유형 안내',
        programs: '서비스 안내', parenting: 'Parenting', coaches: '코치진 소개',
        coach_training: 'ER 전문가 과정', community: '회복 이야기', resources: '자료실',
        support: '장학 후원', apply: '신청', thankyou: '접수 안내', notices: '공지사항',
        notice_detail: '공지 상세', privacy: '개인정보처리방침', terms: '이용약관', coach_admin: '코치 승인'
    };
    const sectionLabel = Object.prototype.hasOwnProperty.call(sectionLabels, sectionId) ? sectionLabels[sectionId] : sectionLabels.home;
    document.title = sectionLabel === sectionLabels.home
        ? 'ER 에니어그램 | 기독교·성경적 에니어그램 교육과 코칭'
        : sectionLabel + ' | ER';
    // Announce section change to screen readers via dedicated live region
    const srStatus = document.getElementById('sr-status');
    if (srStatus) {
        srStatus.textContent = sectionLabel + ' 페이지로 이동했습니다';
        setTimeout(() => { srStatus.textContent = ''; }, 1000);
    }
    if (syncHash) syncSectionHash(sectionId, payload, replaceHash);
    
    // Post-render actions
    if(sectionId === 'programs') updateProgramView(state.programFilter);
    if(sectionId === 'parenting' && payload?.focus) {
        setTimeout(() => {
            const el = document.getElementById('parenting-' + payload.focus);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 60);
    }
    if (sectionId === 'apply') setTimeout(() => initApplyTurnstile(), 50);
    // 홈에는 공지 목록이 없으므로 응답을 기다린 뒤 홈 DOM을 다시 만들지 않는다.
    if((sectionId === 'notices' || sectionId === 'notice_detail') && !state.noticesLoaded) {
        setTimeout(async () => {
            await loadNotices();
            if (state.currentSection === sectionId) {
                renderSection(sectionId, payload, { syncHash: false });
            }
        }, 0);
    }
    if(sectionId === 'coach_admin') setTimeout(() => {
        loadCoachAdminUsers();
        if (typeof loadProgramApplications === 'function') loadProgramApplications();
    }, 0);
    if (sectionId === 'test') setTimeout(() => mountAdaptiveTestIframe(), 0);
}

let navigationEventsReady = false;

function closeDesktopNavMenus(restoreFocus = false) {
    document.querySelectorAll?.('.desktop-nav-trigger').forEach((trigger) => {
        const wasOpen = trigger.getAttribute('aria-expanded') === 'true';
        trigger.setAttribute('aria-expanded', 'false');
        document.getElementById(trigger.getAttribute('aria-controls'))?.classList.add('hidden');
        if (wasOpen && restoreFocus) trigger.focus();
    });
}

function ensureNavigationEvents() {
    if (navigationEventsReady) return;
    navigationEventsReady = true;
    const closeOutsideDesktopMenus = (event) => {
        document.querySelectorAll('.desktop-nav-trigger').forEach((trigger) => {
            if (!trigger.parentElement.contains(event.target)) {
                trigger.setAttribute('aria-expanded', 'false');
                document.getElementById(trigger.getAttribute('aria-controls'))?.classList.add('hidden');
            }
        });
    };
    document.addEventListener('click', closeOutsideDesktopMenus);
    document.addEventListener('focusin', closeOutsideDesktopMenus);
    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        const desktopOpen = [...document.querySelectorAll('.desktop-nav-trigger')].some((trigger) => trigger.getAttribute('aria-expanded') === 'true');
        const mobileOpen = document.getElementById('mobile-menu') && !document.getElementById('mobile-menu').classList.contains('hidden');
        if (!desktopOpen && !mobileOpen) return;
        event.preventDefault();
        closeDesktopNavMenus(true);
        if (mobileOpen) {
            closeMobileMenu();
            document.getElementById('mobile-menu-toggle')?.focus();
        }
    });
}

function toggleDesktopNav(trigger) {
    const panel = document.getElementById(trigger.getAttribute('aria-controls'));
    if (!panel) return;
    ensureNavigationEvents();
    const willOpen = trigger.getAttribute('aria-expanded') !== 'true';
    closeDesktopNavMenus();
    if (willOpen) {
        panel.classList.remove('hidden');
        trigger.setAttribute('aria-expanded', 'true');
    }
}

function closeMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const backdrop = document.getElementById('mobile-menu-backdrop');
    const trigger = document.getElementById('mobile-menu-toggle');
    if (trigger) {
        trigger.setAttribute('aria-expanded', 'false');
        trigger.setAttribute('aria-label', '메뉴 열기');
    }
    if (menu) menu.classList.add('hidden');
    if (backdrop) {
        backdrop.classList.add('hidden');
        backdrop.setAttribute('aria-hidden', 'true');
    }
    if (document.body && document.body.classList && typeof document.body.classList.remove === 'function') {
        document.body.classList.remove('mobile-menu-open');
    }
}

function openMobileMenu() {
    ensureNavigationEvents();
    const menu = document.getElementById('mobile-menu');
    const backdrop = document.getElementById('mobile-menu-backdrop');
    const trigger = document.getElementById('mobile-menu-toggle');
    if (trigger) {
        trigger.setAttribute('aria-expanded', 'true');
        trigger.setAttribute('aria-label', '메뉴 닫기');
    }
    if (menu) menu.classList.remove('hidden');
    if (backdrop) {
        backdrop.classList.remove('hidden');
        backdrop.setAttribute('aria-hidden', 'false');
    }
    if (document.body && document.body.classList && typeof document.body.classList.add === 'function') {
        document.body.classList.add('mobile-menu-open');
    }
    collapseMobileNavGroups();
}

function collapseMobileNavGroups() {
    document.querySelectorAll('.mobile-nav-panel').forEach((panel) => {
        panel.classList.add('hidden');
        panel.setAttribute('aria-hidden', 'true');
    });
    document.querySelectorAll('.mobile-nav-trigger').forEach((trigger) => {
        trigger.setAttribute('aria-expanded', 'false');
        const chevron = trigger.querySelector('.mobile-nav-chevron');
        if (chevron) chevron.classList.remove('rotate-180');
    });
}

function toggleMobileNavGroup(panelId, triggerEl) {
    const panel = document.getElementById(panelId);
    if (!panel || !triggerEl) return;
    const willOpen = panel.classList.contains('hidden');
    collapseMobileNavGroups();
    if (willOpen) {
        panel.classList.remove('hidden');
        panel.setAttribute('aria-hidden', 'false');
        triggerEl.setAttribute('aria-expanded', 'true');
        const chevron = triggerEl.querySelector('.mobile-nav-chevron');
        if (chevron) chevron.classList.add('rotate-180');
    }
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (!menu) return;
    if (menu.classList.contains('hidden')) openMobileMenu();
    else closeMobileMenu();
}

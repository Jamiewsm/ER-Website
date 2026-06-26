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

function renderSection(sectionId, payload = null, options = {}) {
    const { syncHash = true, replaceHash = false } = options;
    const previousSection = state.currentSection;
    const activeFocus = String(payload?.focus || '').trim();
    const isParentingFocus = activeFocus === 'parenting_workshop' || activeFocus === 'parents_workshop';
    const isJulyBasicFocus = (
        activeFocus === 'enneagram_basic_july'
        || activeFocus === 'basic_course_july'
        || activeFocus === 'enneagram_basic'
    );
    const isFocusedApplyJourney = (
        sectionId === 'apply' || sectionId === 'thankyou'
    ) && (
        isParentingFocus || isJulyBasicFocus
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
        case 'mypage': html = renderMyPage(); break;
        case 'coach_portal': html = renderCoachPortal(); break;
        case 'coach_admin': html = renderCoachAdmin(); break;
        case 'coach_tasks': html = renderCoachTasks(); break;
        case 'coach_materials': html = renderCoachMaterials(); break;
        case 'coach_schedule': html = renderCoachSchedule(); break;
        case 'coach_notes': html = renderCoachNotes(); break;
        case 'coach_mentoring': html = renderCoachMentoring(); break;
        case 'thankyou': html = renderThankYou(payload); break;
        default: html = renderHome();
    }

    main.innerHTML = html;
    if (sectionId !== 'home' && typeof closeParentsWorkshopPromo === 'function') {
        closeParentsWorkshopPromo();
    }
    // Announce section change to screen readers via dedicated live region
    const srStatus = document.getElementById('sr-status');
    if (srStatus) {
        const sectionLabels = {
            home: '홈',
            about: 'ER 소개',
            test: '프리미엄 검사',
            types_guide: '유형 안내',
            programs: '서비스 안내',
            parenting: 'Parenting',
            coaches: 'ER 대표 소개',
            coach_training: '전문가 양성반',
            community: '회복 이야기',
            support: '사역지원',
            apply: '신청',
            notices: '공지사항',
            coach_portal: '코치 포털',
            coach_admin: '코치 승인',
            coach_tasks: '훈련 보고서',
            coach_materials: '자료실',
            coach_schedule: '주간 일정',
            coach_notes: '일정 세션 노트',
            coach_mentoring: '멘토링 허브',
        };
        srStatus.textContent = (sectionLabels[sectionId] || sectionId) + ' 페이지로 이동했습니다';
        setTimeout(() => { srStatus.textContent = ''; }, 1000);
    }
    if (syncHash) syncSectionHash(sectionId, payload, replaceHash);
    
    // Post-render actions
    if (sectionId === 'home') {
        setTimeout(() => initCharts('home'), 100);
    }
    if(sectionId === 'community') setTimeout(() => initCharts('community'), 100);
    if(sectionId === 'programs') updateProgramView(state.programFilter);
    if(sectionId === 'parenting' && payload?.focus) {
        setTimeout(() => {
            const el = document.getElementById('parenting-' + payload.focus);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 60);
    }
    if (sectionId === 'apply') setTimeout(() => initApplyTurnstile(), 50);
    if((sectionId === 'home' || sectionId === 'notices' || sectionId === 'notice_detail') && !state.noticesLoaded) {
        setTimeout(async () => {
            await loadNotices();
            if (state.currentSection === sectionId) {
                renderSection(sectionId, payload, { syncHash: false });
            }
        }, 0);
    }
    if(sectionId === 'coach_portal') setTimeout(() => loadCoachPortalDashboard(), 0);
    if(sectionId === 'coach_admin') setTimeout(() => {
        loadCoachAdminUsers();
        if (typeof loadProgramApplications === 'function') loadProgramApplications();
    }, 0);
    if(sectionId === 'coach_tasks') setTimeout(() => loadCoachTasks(), 0);
    if(sectionId === 'coach_materials') setTimeout(() => loadCoachMaterials(), 0);
    if(sectionId === 'coach_schedule') setTimeout(() => loadCoachSchedules(), 0);
    if(sectionId === 'coach_notes') setTimeout(() => loadCoachNotes(), 0);
    if(sectionId === 'coach_mentoring') setTimeout(() => loadCoachMentoringHub(), 0);
    if (sectionId === 'test') setTimeout(() => mountAdaptiveTestIframe(), 0);
}

function closeMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const backdrop = document.getElementById('mobile-menu-backdrop');
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
    const menu = document.getElementById('mobile-menu');
    const backdrop = document.getElementById('mobile-menu-backdrop');
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

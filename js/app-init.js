// ER App: App initialization — DOM events, hashchange, Supabase init
// --- Initialization ---
function runAppInit() {
    window.addEventListener('scroll', () => {
        const nav = document.getElementById('navbar');
        if(window.scrollY > 20) {
            nav.classList.add('shadow-sm', 'bg-white/95');
            nav.classList.remove('bg-white/80');
        } else {
            nav.classList.remove('shadow-sm', 'bg-white/95');
            nav.classList.add('bg-white/80');
        }
    });
    const authModal = document.getElementById('auth-modal');
    if (authModal) {
        authModal.addEventListener('click', (event) => {
            if (event.target === authModal) closeAuthModal();
        });
        var closeBtn = document.getElementById('auth-modal-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                if (typeof closeAuthModal === 'function') closeAuthModal();
                else authModal.classList.add('hidden');
            });
        }
    }
    document.addEventListener('click', (event) => {
        const modal = document.getElementById('coach-schedule-modal');
        if (modal && !modal.classList.contains('hidden') && event.target === modal) {
            closeScheduleModal();
        }
    });
    document.addEventListener('click', (event) => {
        const modal = document.getElementById('coach-schedule-day-modal');
        if (modal && !modal.classList.contains('hidden') && event.target === modal) {
            closeCoachScheduleDayModal();
        }
    });
    document.addEventListener('click', (event) => {
        const modal = document.getElementById('coach-material-modal');
        if (modal && !modal.classList.contains('hidden') && event.target === modal) {
            closeCoachMaterialModal();
        }
    });
    document.addEventListener('click', (event) => {
        const modal = document.getElementById('coach-typing-practicum-modal');
        if (modal && !modal.classList.contains('hidden') && event.target === modal) {
            closeCoachTypingPracticumModal();
        }
    });
    document.addEventListener('click', (event) => {
        const modal = document.getElementById('coach-task-modal');
        if (modal && !modal.classList.contains('hidden') && event.target === modal) {
            closeCoachTaskModal();
        }
    });
    document.addEventListener('click', (event) => {
        const modal = document.getElementById('coach-note-modal');
        if (modal && !modal.classList.contains('hidden') && event.target === modal) {
            closeCoachNoteModal();
        }
    });

    window.addEventListener('hashchange', () => {
        const route = parseSectionHash();
        const nextPayload = JSON.stringify(route.payload || null);
        const currentPayload = JSON.stringify(state.currentPayload || null);
        if (state.currentSection === route.sectionId && nextPayload === currentPayload) return;
        renderSection(route.sectionId, route.payload, { syncHash: false });
    });

    (async function init() {
        const entryRoute = parseSectionHash();
        // 옛 북마크를 뒤로 가기로 다시 열며 반복 이동하지 않도록 현재 기록을 교체한다.
        if (redirectPortalSection(entryRoute.sectionId, entryRoute.payload, true)) return;
        try {
            if (typeof initializeSupabase === 'function') await initializeSupabase();
        } catch (e) {
            if (window.console && window.console.error) window.console.error('initializeSupabase error', e);
        }
        const initialRoute = restoreSiteAdminReturn() || parseSectionHash();
        try {
            renderSection(initialRoute.sectionId, initialRoute.payload, { syncHash: false });
        } catch (e) {
            if (window.console && window.console.error) window.console.error('renderSection error', e);
            try { renderSection('home', null, { syncHash: false }); } catch (_) {}
        }
        const schedulePrefetch = window.requestIdleCallback
            ? (cb) => window.requestIdleCallback(cb, { timeout: 1200 })
            : (cb) => setTimeout(cb, 900);
        schedulePrefetch(() => {
            try { prefetchTestAssets(); } catch (_) {}
        });
    })();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAppInit);
} else {
    runAppInit();
}

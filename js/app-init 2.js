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
    const desktopAuthBtn = document.getElementById('desktop-auth-btn');
    if (desktopAuthBtn) {
        desktopAuthBtn.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            if (typeof handleDesktopAuthClick === 'function') {
                handleDesktopAuthClick(event);
                return;
            }
            if (typeof openAuthModal === 'function') {
                openAuthModal();
                return;
            }
            var modal = document.getElementById('auth-modal');
            if (modal) modal.classList.remove('hidden');
        });
    }
    const mobileAuthBtn = document.getElementById('mobile-auth-btn');
    if (mobileAuthBtn) {
        mobileAuthBtn.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            if (typeof toggleLogin === 'function') {
                toggleLogin();
                return;
            }
            var modal = document.getElementById('auth-modal');
            if (modal) modal.classList.remove('hidden');
        });
    }
    document.addEventListener('click', (event) => {
        const menu = document.getElementById('desktop-account-menu');
        const button = document.getElementById('desktop-auth-btn');
        if (!menu || !button || menu.classList.contains('hidden')) return;
        if (menu.contains(event.target) || button.contains(event.target)) return;
        closeDesktopAccountMenu();
    });
    document.addEventListener('click', (event) => {
        const modal = document.getElementById('coach-schedule-modal');
        if (modal && !modal.classList.contains('hidden') && event.target === modal) {
            closeScheduleModal();
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
        try {
            if (typeof initializeSupabase === 'function') await initializeSupabase();
        } catch (e) {
            if (window.console && window.console.error) window.console.error('initializeSupabase error', e);
        }
        const initialRoute = parseSectionHash();
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

// ER Section: Test embed helpers + renderTest
function handleExternalFormIframeLoad(iframeId, skeletonId) {
    const iframe = document.getElementById(iframeId);
    const skeleton = document.getElementById(skeletonId);
    if (iframe) {
        iframe.classList.remove('opacity-0');
        iframe.classList.add('opacity-100');
    }
    if (skeleton) {
        skeleton.classList.add('opacity-0');
        setTimeout(() => skeleton.classList.add('hidden'), 280);
    }
}
if (typeof window !== 'undefined') window.handleExternalFormIframeLoad = handleExternalFormIframeLoad;

function applyAdaptiveTestIframeHeight(height) {
    const iframe = document.getElementById('adaptive-test-iframe');
    const slot = document.getElementById('adaptive-test-iframe-slot');
    const nextHeight = Math.max(720, Math.ceil(Number(height) || 0));
    if (iframe) {
        iframe.style.height = `${nextHeight}px`;
        iframe.style.minHeight = `${nextHeight}px`;
    }
    if (slot) {
        slot.style.minHeight = `${nextHeight}px`;
    }
}

function restoreSavedTestResult() {
    if (state.latestTestResult) return;
    try {
        const raw = sessionStorage.getItem('er_latest_test_result');
        if (raw) state.latestTestResult = JSON.parse(raw);
    } catch (_err) {
        // ignore parse failures
    }
}

if (typeof window !== 'undefined') {
    window.addEventListener('message', (event) => {
        const data = event && event.data;
        if (!data || !data.type) return;
        if (data.type === 'er-test-embed-resize') {
            applyAdaptiveTestIframeHeight(data.height);
            return;
        }
        if (data.type === 'er-test-result' && data.result) {
            state.latestTestResult = data.result;
            try {
                sessionStorage.setItem('er_latest_test_result', JSON.stringify(data.result));
            } catch (_err) {}
            return;
        }
        if (data.type === 'er-test-navigate' && typeof renderSection === 'function') {
            if (data.result) state.latestTestResult = data.result;
            const section = data.section || 'apply';
            const payload = data.payload || null;
            renderSection(section, payload);
        }
    });
    restoreSavedTestResult();
}

function mountAdaptiveTestIframe() {
    const slot = document.getElementById('adaptive-test-iframe-slot');
    const skeleton = document.getElementById('adaptive-test-skeleton');
    if (!slot) return;

    const isKo = adaptiveLang !== 'en';
    const langParam = isKo ? 'ko' : 'en';
    const title = isKo ? '적응형 에니어그램 심층 진단' : 'Adaptive Enneagram Typing Assessment';
    const src = `test.html?v=${ADAPTIVE_TEST_EMBED_VERSION}&lang=${langParam}`;

    const canReuse =
        state.testIframeEl &&
        state.testIframeEl.isConnected === false &&
        state.testIframeLang === adaptiveLang;

    if (canReuse) {
        slot.appendChild(state.testIframeEl);
        handleExternalFormIframeLoad('adaptive-test-iframe', 'adaptive-test-skeleton');
        return;
    }

    if (state.testIframeEl) {
        try {
            state.testIframeEl.remove();
        } catch (_) { /* noop */ }
        state.testIframeEl = null;
        state.testIframeLang = null;
    }

    if (skeleton) {
        skeleton.classList.remove('hidden', 'opacity-0');
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'adaptive-test-iframe';
    iframe.src = src;
    iframe.title = title;
    iframe.className =
        'w-full min-h-[720px] opacity-0 transition-opacity duration-500';
    iframe.setAttribute('scrolling', 'yes');
    iframe.loading = 'lazy';
    iframe.addEventListener('load', function onAdaptiveTestIframeLoad() {
        iframe.removeEventListener('load', onAdaptiveTestIframeLoad);
        handleExternalFormIframeLoad('adaptive-test-iframe', 'adaptive-test-skeleton');
    });
    slot.appendChild(iframe);
    state.testIframeEl = iframe;
    state.testIframeLang = adaptiveLang;
}

function prefetchTestAssets() {
    const head = document.head || document.getElementsByTagName('head')[0];
    if (!head) return;
    const ensureLink = (rel, href, asValue) => {
        if (!href || document.querySelector(`link[rel="${rel}"][href="${href}"]`)) return;
        const link = document.createElement('link');
        link.rel = rel;
        link.href = href;
        if (asValue) link.as = asValue;
        head.appendChild(link);
    };
    const v = ADAPTIVE_TEST_EMBED_VERSION;
    ensureLink('prefetch', `test.html?v=${v}&lang=ko`, 'document');
    ensureLink('prefetch', `test.html?v=${v}&lang=en`, 'document');
    ensureLink('prefetch', 'js/test.js', 'script');
    ensureLink('prefetch', 'css/test.css', 'style');
}
if (typeof window !== 'undefined') window.prefetchTestAssets = prefetchTestAssets;

function renderTest() {
    const isKo = adaptiveLang !== 'en';
    return `
        <div class="max-w-5xl mx-auto px-4 sm:px-6 py-8">
            <div class="mb-4 flex items-center justify-end gap-2">
                <button
                    onclick="setAdaptiveTestLanguage('ko')"
                    class="px-3 py-1.5 rounded-full text-xs font-bold border transition ${isKo ? 'bg-er-dark text-white border-er-dark' : 'bg-white text-gray-600 border-gray-200 hover:border-er-accent hover:text-er-dark'}"
                >한국어 테스트</button>
                <button
                    onclick="setAdaptiveTestLanguage('en')"
                    class="px-3 py-1.5 rounded-full text-xs font-bold border transition ${!isKo ? 'bg-er-dark text-white border-er-dark' : 'bg-white text-gray-600 border-gray-200 hover:border-er-accent hover:text-er-dark'}"
                >English Test</button>
            </div>
            <div class="relative bg-white rounded-3xl border border-gray-100 shadow-soft overflow-hidden">
                <div id="adaptive-test-skeleton" class="absolute inset-0 z-10 bg-er-base/80 backdrop-blur-[1px] transition-opacity duration-300">
                    <div class="h-full p-5 md:p-8">
                        <div class="w-full h-full rounded-2xl border border-er-accent/20 bg-white/70 p-5 md:p-7">
                            <div class="flex items-center gap-2 mb-6">
                                <span class="w-2 h-2 rounded-full bg-er-accent animate-pulse"></span>
                                <span class="text-xs font-bold tracking-wider text-er-primary">진단 페이지 불러오는 중</span>
                            </div>
                            <div class="space-y-4 animate-pulse">
                                <div class="h-6 w-2/3 rounded-lg bg-er-accentLight"></div>
                                <div class="h-4 w-5/6 rounded-lg bg-er-accentLight/80"></div>
                                <div class="h-4 w-3/4 rounded-lg bg-er-accentLight/80"></div>
                                <div class="h-24 w-full rounded-2xl bg-white border border-er-accent/10"></div>
                                <div class="h-24 w-full rounded-2xl bg-white border border-er-accent/10"></div>
                                <div class="h-24 w-full rounded-2xl bg-white border border-er-accent/10"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="adaptive-test-iframe-slot" class="relative w-full min-h-[720px]"></div>
            </div>

            <div class="mt-8 grid md:grid-cols-2 gap-4">
                <div class="bg-white rounded-2xl border border-gray-100 p-5 shadow-soft">
                    <h3 class="text-sm font-bold text-er-dark mb-2">진단 안내 자료</h3>
                    <p class="text-xs text-gray-500 break-keep">테스트 전후 해석 방법과 정식 타이핑 세션 연결 흐름을 한눈에 확인할 수 있습니다.</p>
                </div>
                <div class="bg-er-base rounded-2xl border border-white/40 p-5 shadow-soft">
                    <h3 class="text-sm font-bold text-er-dark mb-2">추천 읽을거리</h3>
                    <ul class="space-y-1 text-xs text-gray-600">
                        <li>에니어그램의 지혜 (Don Richard Riso)</li>
                        <li>내면의 감옥에서 벗어나라 (Richard Rohr)</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
}


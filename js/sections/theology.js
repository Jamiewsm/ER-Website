// ER Section: Theology — 정적 /theology/ 가 정식 문서. SPA 해시(#theology)는 그곳으로 넘긴다.
function theologyStaticUrl(payload = null) {
    const focus = String(payload?.focus || '').trim();
    const allowed = new Set(['scripture', 'design', 'fixation', 'restoration', 'calling']);
    if (focus && allowed.has(focus)) return `/theology/#theology-${focus}`;
    return '/theology/';
}

function renderTheology(payload = null) {
    const dest = theologyStaticUrl(payload);
    if (typeof window !== 'undefined' && window.location) {
        window.location.replace(dest);
    }
    return `
        <div class="bg-er-base min-h-screen px-4 py-16 sm:px-6">
            <div class="mx-auto max-w-xl text-base leading-relaxed text-er-body break-keep">
                <p>신학적 기초 문서로 이동합니다.</p>
                <p class="mt-4"><a href="${dest}" class="font-bold text-er-green underline underline-offset-4">ER의 신학적 기초 열기</a></p>
            </div>
        </div>
    `;
}

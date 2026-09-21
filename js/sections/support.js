// Public account details only; no online payment or contribution intake.
function scholarshipButtonStyle() {
    return 'inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-er-sand bg-er-surface px-6 py-3 text-sm font-bold text-er-inkSoft transition-colors hover:bg-er-greenTint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-er-green focus-visible:ring-offset-2';
}

function renderScholarshipGivingPanel() {
    const { bank, us, receiptNotice } = window.ER_SCHOLARSHIP_SUPPORT;
    return `<section id="scholarship-giving-panel" aria-labelledby="scholarship-accounts-title" class="scroll-mt-24 rounded-[2rem] border border-er-sand bg-er-surface p-6 shadow-soft sm:p-8">
        <p class="mb-3 flex items-center gap-2 text-xs font-bold text-er-green"><i class="fas fa-heart text-er-heart" aria-hidden="true"></i> 사역자 반액 장학 후원</p>
        <h2 id="scholarship-accounts-title" class="text-2xl font-bold leading-snug text-er-inkSoft break-keep">후원 계좌 안내</h2>
        <p class="mt-3 text-sm leading-relaxed text-er-body break-keep">배움의 길을 함께 열어 주시는 마음에 감사드립니다.</p>
        <dl class="mt-8 divide-y divide-er-sand">
            <div class="pb-6">
                <dt class="text-sm font-bold text-er-green">한국 · ${escapeHtml(bank.name)}</dt>
                <dd class="mt-3 break-all text-xl font-bold tabular-nums text-er-inkSoft sm:text-2xl">${escapeHtml(bank.number)}</dd>
                <dd class="mt-2 text-sm text-er-body">예금주: ${escapeHtml(bank.holder)}</dd>
            </div>
            <div class="pt-6">
                <dt class="text-sm font-bold text-er-green">미국 · ${escapeHtml(us.methods)}</dt>
                <dd class="mt-3 break-all text-xl font-bold tabular-nums text-er-inkSoft sm:text-2xl">${escapeHtml(us.address)}</dd>
                <dd class="mt-2 text-sm text-er-body">수취인: ${escapeHtml(us.holder)}</dd>
            </div>
        </dl>
        <p class="mt-7 text-sm leading-relaxed text-er-body">송금 메모에 <strong>‘후원’</strong>을 꼭 적어 주세요.</p>
        <p class="mt-4 text-xs leading-relaxed text-er-muted break-keep">${escapeHtml(receiptNotice)}</p>
        <a href="mailto:hello@er-coaching.com?subject=ER%20장학%20후원%20문의" class="mt-5 inline-flex min-h-11 items-center text-sm font-bold text-er-green underline underline-offset-4">후원 문의: hello@er-coaching.com</a>
    </section>`;
}

async function shareScholarshipPage() {
    const url = new URL('/#support', window.location.origin).href;
    const status = document.getElementById('scholarship-share-status');
    try {
        if (navigator.share) {
            await navigator.share({ title: '하나님이 하시는 일에, 기쁨으로 함께', text: '90명 이상의 수강생과 나눈 배움의 기쁨. ER 사역자 반액 장학에 함께해 주세요.', url });
            if (status) status.textContent = '나눔에 함께해 주셔서 감사합니다.';
        } else {
            await navigator.clipboard.writeText(url);
            if (status) status.textContent = '후원 페이지 주소를 복사했습니다.';
        }
    } catch (error) {
        if (status && error.name !== 'AbortError') status.textContent = `이 주소를 복사해 나눠 주세요: ${url}`;
    }
}

function renderSupport() {
    return `<div class="min-h-screen bg-er-base px-4 pb-16 pt-10 sm:px-6 md:pb-24 md:pt-16 lg:px-8">
        <div class="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
            <div>
                <p class="mb-5 text-xs font-bold tracking-[0.08em] text-er-green">ER 장학 동행</p>
                <h1 class="font-display text-4xl font-extrabold leading-[1.25] tracking-[-0.03em] text-er-ink break-keep md:text-5xl">하나님이 하시는 일에,<br>기쁨으로 함께</h1>
                <p class="mt-6 max-w-xl text-lg leading-relaxed text-er-body break-keep">섬기는 이들의 회복이, 또 다른 섬김으로 이어지도록. 하나님께서 열어가시는 배움과 회복의 여정에 여러분을 초대합니다.</p>
                <button type="button" onclick="document.getElementById('scholarship-giving-panel').scrollIntoView({ block: 'start' })" class="${scholarshipButtonStyle()} mt-6 lg:hidden">후원 계좌 보기</button>
                <section class="mt-10 border-y border-er-sand py-8" aria-labelledby="scholarship-story-title">
                    <h2 id="scholarship-story-title" class="text-2xl font-bold leading-snug text-er-inkSoft break-keep">하나님이 일하시는 것을 보았습니다</h2>
                    <p class="mt-4 max-w-xl text-base leading-relaxed text-er-body break-keep">목회자와 선교사, 사역자와 사모님들을 섬기며 많은 눈물과 감동, 그리고 회복의 순간을 만났습니다. 그 자리에서 하나님이 일하시는 것을 보았습니다.</p>
                    <p class="mt-4 max-w-xl text-base leading-relaxed text-er-body break-keep">그래서 <strong>이분들의 배움을 재정적으로 섬기는 일은 ER이 세워진 목적 가운데 하나</strong>입니다. 하나님께서 앞으로도 ER을 그렇게 사용하시리라 믿습니다.</p>
                    <p class="mt-6 text-sm leading-relaxed text-er-body break-keep">하나님께서 놀랍게 길을 열어주셔서, 한국과 미국에서 이만큼의 장학을 나눌 수 있었습니다.</p>
                    <dl class="mt-5 grid grid-cols-2 gap-5 border-t border-er-sand pt-6">
                        <div><dt class="text-xs text-er-muted">장학으로 함께한 수강생</dt><dd class="mt-2 font-display text-3xl font-bold tracking-tight text-er-greenDeep">90명 이상</dd></div>
                        <div><dt class="text-xs text-er-muted">누적 장학 지원</dt><dd class="mt-2 font-display text-3xl font-bold tracking-tight text-er-greenDeep"><span class="text-base">약</span> 1,100<span class="text-lg">만 원</span></dd></div>
                    </dl>
                    <p class="mt-3 text-xs leading-relaxed text-er-muted">ER이 수강료 감면을 통해 나눈 장학 지원입니다.</p>
                    <p class="mt-5 max-w-xl text-base leading-relaxed text-er-body break-keep">이 만남과 배움의 길을 열어주신 하나님께 감사드립니다. 여러분과 함께 이 기쁨을 이어가고 싶습니다.</p>
                </section>
                <section class="mt-8" aria-labelledby="scholarship-purpose-title">
                    <h2 id="scholarship-purpose-title" class="text-2xl font-bold text-er-inkSoft break-keep">한 사람의 배움, 섬김의 자리로</h2>
                    <p class="mt-4 max-w-xl text-base leading-relaxed text-er-body break-keep">한 사람의 배움이 가정과 교회, 사역의 자리에서 사랑과 회복으로 이어지기를 소망합니다. 후원은 기본과정·심화과정·코치트레이닝에 참여하는 <strong>목회자·선교사·사역자·사모의 반액 장학</strong>에 사용됩니다.</p>
                    <dl class="mt-5 space-y-5 text-sm leading-relaxed text-er-body">
                        <div><dt class="font-bold text-er-inkSoft">기본과정</dt><dd class="mt-1">자신을 이해하고 돌아보는 배움의 시작을 지원합니다.</dd></div>
                        <div><dt class="font-bold text-er-inkSoft">심화과정</dt><dd class="mt-1">배운 내용을 더 깊이 살피고 삶에 적용하는 배움을 지원합니다.</dd></div>
                        <div><dt class="font-bold text-er-inkSoft">코치트레이닝</dt><dd class="mt-1">다른 사람의 배움과 회복에 동행하기 위한 훈련을 지원합니다.</dd></div>
                    </dl>
                </section>
            </div>
            <div class="lg:pt-2">${renderScholarshipGivingPanel()}</div>
        </div>
        <div class="mx-auto mt-12 max-w-6xl border-t border-er-sand pt-8">
            <div class="grid gap-8 md:grid-cols-2 md:gap-16">
                <section aria-labelledby="scholarship-trust-title">
                    <h2 id="scholarship-trust-title" class="text-xl font-bold text-er-inkSoft">보내주신 마음을 소중히 잇겠습니다</h2>
                    <p class="mt-3 max-w-xl text-sm leading-relaxed text-er-body break-keep">후원금은 안내한 장학 목적에 맞게 사용하고, 사용 현황은 개인이 드러나지 않는 전체 집계로 안내하겠습니다. 장학을 받는 분의 이름이나 개인 사정은 공개하지 않습니다.</p>
                    <details class="mt-4 border-b border-er-sand pb-4"><summary class="min-h-11 cursor-pointer py-3 text-sm font-bold text-er-green">장학이나 사역지원을 신청하고 싶어요</summary><p class="text-sm leading-relaxed text-er-body">참여를 원하시는 과정과 상황을 문의해 주세요.</p><a href="#apply?track=ministry" class="mt-2 inline-flex min-h-11 items-center text-sm font-bold text-er-green underline underline-offset-4">장학·사역지원 문의하기</a></details>
                </section>
                <section aria-labelledby="scholarship-share-title">
                    <h2 id="scholarship-share-title" class="text-xl font-bold text-er-inkSoft">이 기쁨을 함께 나눠 주세요</h2>
                    <p class="mt-3 max-w-xl text-sm leading-relaxed text-er-body break-keep">사역자의 배움에 마음을 함께할 교회나 이웃에게 이 이야기를 전해 주세요.</p>
                    <button type="button" onclick="shareScholarshipPage()" class="${scholarshipButtonStyle()} mt-4">이 이야기를 나눠 주세요</button>
                    <p id="scholarship-share-status" role="status" class="mt-2 break-all text-xs text-er-muted"></p>
                </section>
            </div>
        </div>
    </div>`;
}

// Keep previously shared inquiry URLs useful without collecting donor information.
function renderScholarshipInquiry() {
    return `<div class="min-h-screen bg-er-base px-6 py-16"><div class="mx-auto max-w-xl">
        <h1 class="font-display text-3xl font-extrabold text-er-ink">장학 후원 문의</h1>
        <p class="mt-5 leading-relaxed text-er-body break-keep">후원에 관해 궁금한 내용은 이메일로 연락해 주세요.</p>
        <a href="mailto:hello@er-coaching.com?subject=ER%20장학%20후원%20문의" class="${scholarshipButtonStyle()} mt-6">이메일로 문의하기</a>
        <p class="mt-3 break-all text-sm text-er-muted">hello@er-coaching.com</p>
        <a href="#support" class="mt-6 inline-flex min-h-11 items-center text-sm font-bold text-er-green underline underline-offset-4">후원 계좌 보기</a>
    </div></div>`;
}

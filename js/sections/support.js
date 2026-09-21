// Public account details only; no online payment or contribution intake.
function scholarshipButtonStyle(primary = false) {
    if (primary) return 'inline-flex min-h-11 items-center justify-center rounded-full bg-er-green px-7 py-3.5 text-sm font-bold text-white transition-colors hover:bg-er-greenDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-er-green focus-visible:ring-offset-2';
    return 'inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-er-sand bg-er-surface px-6 py-3 text-sm font-bold text-er-inkSoft transition-colors hover:bg-er-greenTint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-er-green focus-visible:ring-offset-2';
}

// Keep the hash router unchanged while moving keyboard focus with the reader.
function scrollToScholarshipSection(id) {
    const section = document.getElementById(id);
    if (!section) return;
    section.focus({ preventScroll: true });
    section.scrollIntoView({ block: 'start', behavior: 'instant' });
}

function renderScholarshipGivingPanel() {
    const { bank, us, receiptNotice } = window.ER_SCHOLARSHIP_SUPPORT;
    return `<section id="scholarship-giving-panel" tabindex="-1" aria-labelledby="scholarship-accounts-title" class="scroll-mt-24 rounded-[2rem] border border-er-sand bg-er-surface p-6 shadow-soft sm:p-8">
        <p class="mb-3 flex items-center gap-2 text-xs font-bold text-er-green"><i class="fas fa-heart text-er-heart" aria-hidden="true"></i> 사역자 반액 장학 후원</p>
        <h2 id="scholarship-accounts-title" class="text-2xl font-bold leading-snug text-er-inkSoft break-keep">계좌로 일시후원하기</h2>
        <p class="mt-3 text-sm leading-relaxed text-er-body break-keep">원하시는 때에, 편안한 금액으로 함께해 주세요. 아래 계좌나 송금 서비스에서 직접 보내실 수 있습니다.</p>
        <dl class="mt-8 grid gap-6 sm:grid-cols-2">
            <div class="border-t border-er-sand pt-6">
                <dt class="text-sm font-bold text-er-green">한국 · ${escapeHtml(bank.name)}</dt>
                <dd class="mt-3 break-all text-xl font-bold tabular-nums text-er-inkSoft sm:text-2xl">${escapeHtml(bank.number)}</dd>
                <dd class="mt-2 text-sm text-er-body">예금주: ${escapeHtml(bank.holder)}</dd>
            </div>
            <div class="border-t border-er-sand pt-6">
                <dt class="text-sm font-bold text-er-green">미국 · ${escapeHtml(us.methods)}</dt>
                <dd class="mt-3 break-all text-xl font-bold tabular-nums text-er-inkSoft sm:text-2xl">${escapeHtml(us.address)}</dd>
                <dd class="mt-2 text-sm text-er-body">수취인: ${escapeHtml(us.holder)}</dd>
            </div>
        </dl>
        <p class="mt-7 text-sm leading-relaxed text-er-body">송금 메모에 <strong>‘후원’</strong>을 꼭 적어 주세요.</p>
        <p class="mt-4 text-xs leading-relaxed text-er-muted break-keep">${escapeHtml(receiptNotice)}</p>
        <a href="mailto:hello@er-coaching.com?subject=ER%20장학%20후원%20수령%20확인서%20요청" class="mt-5 inline-flex min-h-11 items-center text-sm font-bold text-er-green underline underline-offset-4">수령 확인서·후원 문의: hello@er-coaching.com</a>
    </section>`;
}

async function shareScholarshipPage() {
    const url = new URL('/#support', window.location.origin).href;
    const status = document.getElementById('scholarship-share-status');
    try {
        if (navigator.share) {
            await navigator.share({ title: '사역자를 돌보는 일이 공동체를 돌보는 일이 되도록', text: '한 사람의 배움과 회복이 섬김의 자리로 이어지도록. 사역자 반액 장학에 함께해 주세요.', url });
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
    const { receiptNotice } = window.ER_SCHOLARSHIP_SUPPORT;
    return `<div class="min-h-screen bg-er-base px-4 pb-16 sm:px-6 md:pb-24 lg:px-8">
        <section class="mx-auto grid max-w-6xl items-center gap-10 py-12 md:py-20 lg:grid-cols-[1.5fr_1fr] lg:gap-16" aria-labelledby="scholarship-hero-title">
            <div>
                <p class="mb-5 text-sm font-bold text-er-green">ER 사역지원 · 반액 장학</p>
                <h1 id="scholarship-hero-title" class="font-display text-4xl font-extrabold leading-[1.25] tracking-[-0.03em] text-er-ink break-keep md:text-5xl">사역자를 돌보는 일이<br>공동체를 돌보는 일이 되도록</h1>
                <p class="mt-6 max-w-xl text-lg leading-relaxed text-er-body break-keep">많은 사람의 삶을 돌보는 사역자에게도, 자신의 삶과 관계를 돌아볼 자리가 필요합니다.</p>
                <p class="mt-4 max-w-xl text-base leading-relaxed text-er-body break-keep">경제적 부담이 배움의 문턱이 되지 않도록, 목회자·선교사·사역자·사모의 <strong>기본과정·심화과정·코치트레이닝 수강료 절반을 장학으로 지원합니다.</strong></p>
                <p class="mt-4 max-w-xl text-base leading-relaxed text-er-body break-keep">한 사람의 배움과 회복이 섬김의 자리로 이어지도록, 기쁨으로 함께해 주세요.</p>
                <div class="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                    <button type="button" onclick="scrollToScholarshipSection('scholarship-giving-panel')" class="${scholarshipButtonStyle(true)}">사역지원에 함께하기</button>
                    <button type="button" onclick="scrollToScholarshipSection('scholarship-how')" class="min-h-11 text-sm font-bold text-er-green underline underline-offset-4">장학 지원 과정 보기</button>
                </div>
                <p class="mt-3 text-sm text-er-muted">계좌를 통한 일시후원으로 참여하실 수 있습니다.</p>
            </div>
            <img src="assets/er-visual/hero-home.jpg" alt="햇살이 들어오는 창가에 놓인 편안한 의자" width="1920" height="2880" class="h-64 w-full rounded-[2rem] object-cover object-bottom sm:h-80 lg:h-[32rem]">
        </section>

        <div class="mx-auto max-w-3xl">
            <section class="border-t border-er-sand py-12 md:py-20" aria-labelledby="scholarship-why-title">
                <h2 id="scholarship-why-title" class="text-2xl font-bold leading-snug text-er-inkSoft break-keep">돌보는 사람에게도 돌봄이 필요합니다</h2>
                <div class="mt-6 max-w-xl space-y-4 text-base leading-relaxed text-er-body break-keep">
                    <p>사역자는 설교하고, 가르치고, 상담하며 다른 사람의 기쁨과 아픔을 함께합니다. 그 과정에서 자신의 마음과 관계를 돌아보는 시간은 뒤로 밀리기 쉽습니다.</p>
                    <p>잠시 멈추어 자신을 이해하고, 관계 안에서 반복되는 반응을 살피며, 하나님 앞에서 삶과 소명을 다시 바라볼 시간이 필요할 수 있습니다.</p>
                    <p>그 배움을 원하면서도 비용 때문에 망설이는 분들이 있습니다. 반액 장학은 그분들이 배움을 시작하고 이어갈 수 있도록 함께하는 방법입니다.</p>
                </div>
            </section>

            <section class="border-t border-er-sand py-12 md:py-20" aria-labelledby="scholarship-purpose-title">
                <h2 id="scholarship-purpose-title" class="text-2xl font-bold leading-snug text-er-inkSoft break-keep">여러분의 후원은 한 사람에게 이런 자리를 엽니다</h2>
                <dl class="mt-8 grid gap-x-10 gap-y-8 sm:grid-cols-2">
                    <div><dt class="text-lg font-bold text-er-inkSoft">자신을 돌아볼 자리</dt><dd class="mt-3 text-base leading-relaxed text-er-body break-keep">다른 사람을 돌보느라 미뤄 두었던 자신의 생각과 감정, 삶의 패턴을 천천히 살펴봅니다.</dd></div>
                    <div><dt class="text-lg font-bold text-er-inkSoft">관계를 새롭게 이해할 자리</dt><dd class="mt-3 text-base leading-relaxed text-er-body break-keep">가족과 공동체 안에서 반복되는 반응을 이해하고, 서로를 대하는 새로운 길을 배웁니다.</dd></div>
                    <div><dt class="text-lg font-bold text-er-inkSoft">삶과 소명을 다시 바라볼 자리</dt><dd class="mt-3 text-base leading-relaxed text-er-body break-keep">하나님 앞에서 지금의 삶을 정직하게 돌아보고, 자신에게 맡겨진 관계와 소명을 살펴봅니다.</dd></div>
                    <div><dt class="text-lg font-bold text-er-inkSoft">부담을 덜고 배움을 이어갈 자리</dt><dd class="mt-3 text-base leading-relaxed text-er-body break-keep">수강료의 절반을 장학으로 지원해, 기본과정에서 심화과정과 코치트레이닝으로 이어지는 배움의 부담을 덜어드립니다.</dd></div>
                </dl>
            </section>

            <section id="scholarship-how" tabindex="-1" class="scroll-mt-24 border-t border-er-sand py-12 md:py-20" aria-labelledby="scholarship-how-title">
                <h2 id="scholarship-how-title" class="text-2xl font-bold leading-snug text-er-inkSoft break-keep">장학 지원은 이렇게 연결됩니다</h2>
                <ol class="mt-8 space-y-7">
                    <li class="flex gap-5"><span class="pt-1 text-sm font-bold tabular-nums text-er-green" aria-hidden="true">01</span><div><h3 class="text-lg font-bold text-er-inkSoft break-keep">참여하고 싶은 과정의 장학을 문의합니다</h3><p class="mt-2 max-w-xl text-base leading-relaxed text-er-body break-keep">목회자·선교사·사역자·사모님께서 기본과정, 심화과정 또는 코치트레이닝 참여를 문의합니다.</p></div></li>
                    <li class="flex gap-5"><span class="pt-1 text-sm font-bold tabular-nums text-er-green" aria-hidden="true">02</span><div><h3 class="text-lg font-bold text-er-inkSoft break-keep">과정과 장학 적용 내용을 안내받습니다</h3><p class="mt-2 max-w-xl text-base leading-relaxed text-er-body break-keep">참여를 희망하는 과정과 상황을 나누고, 등록 전에 장학 적용 여부와 수강료를 안내받습니다.</p></div></li>
                    <li class="flex gap-5"><span class="pt-1 text-sm font-bold tabular-nums text-er-green" aria-hidden="true">03</span><div><h3 class="text-lg font-bold text-er-inkSoft break-keep">반액 장학으로 배움을 이어갑니다</h3><p class="mt-2 max-w-xl text-base leading-relaxed text-er-body break-keep">안내받은 과정에 참여해 자신과 관계를 이해하는 배움을 시작합니다. 후원은 이 장학 지원이 이어지는 데 사용됩니다.</p></div></li>
                </ol>
                <a href="mailto:hello@er-coaching.com?subject=ER%20반액%20장학%20문의" class="mt-6 inline-flex min-h-11 items-center text-sm font-bold text-er-green underline underline-offset-4">반액 장학 문의하기</a>
            </section>

            <section class="border-t border-er-sand py-12 md:py-20" aria-labelledby="scholarship-story-title">
                <h2 id="scholarship-story-title" class="text-2xl font-bold leading-snug text-er-inkSoft break-keep">하나님이 일하시는 것을 보았습니다</h2>
                <div class="mt-6 max-w-xl space-y-4 text-base leading-relaxed text-er-body break-keep">
                    <p>목회자와 선교사, 사역자와 사모님들을 섬기며 많은 눈물과 감동, 그리고 회복의 순간을 만났습니다. 그 자리에서 하나님이 일하시는 것을 보았습니다.</p>
                    <p>그래서 이분들의 배움을 재정적으로 섬기는 일은 ER이 세워진 목적 가운데 하나입니다. 하나님께서 앞으로도 ER을 그렇게 사용하시리라 믿습니다.</p>
                    <p>하나님께서 놀랍게 길을 열어주셔서, 지금까지 한국과 미국에서 90명 이상의 수강생에게 약 1,100만 원의 장학 지원을 나눌 수 있었습니다.</p>
                </div>
                <dl class="mt-8 grid grid-cols-2 gap-5 border-y border-er-sand py-6">
                    <div><dt class="text-sm text-er-muted">장학으로 함께한 수강생</dt><dd class="mt-2 text-3xl font-bold tabular-nums text-er-greenDeep">90명 이상</dd></div>
                    <div><dt class="text-sm text-er-muted">누적 장학 지원</dt><dd class="mt-2 text-3xl font-bold tabular-nums text-er-greenDeep"><span class="text-base">약</span> 1,100<span class="text-lg">만 원</span></dd></div>
                </dl>
                <p class="mt-3 text-sm leading-relaxed text-er-muted">ER이 수강료 감면을 통해 나눈 누적 장학 지원입니다.</p>
                <p class="mt-6 max-w-xl text-base leading-relaxed text-er-body break-keep">이 만남과 배움의 길을 열어주신 하나님께 감사드립니다. 여러분과 함께 이 기쁨을 이어가고 싶습니다.</p>
                <button type="button" onclick="scrollToScholarshipSection('scholarship-giving-panel')" class="${scholarshipButtonStyle(true)} mt-6">사역지원에 함께하기</button>
            </section>

            <section class="border-t border-er-sand py-12 md:py-20" aria-labelledby="scholarship-trust-title">
                <h2 id="scholarship-trust-title" class="text-2xl font-bold leading-snug text-er-inkSoft break-keep">후원금은 한 사람의 배움에 사용됩니다</h2>
                <div class="mt-6 max-w-xl space-y-4 text-base leading-relaxed text-er-body break-keep">
                    <p>ER의 일반 교육과 코칭 프로그램은 유료로 운영됩니다. 이 페이지를 통해 보내주시는 후원은 <strong>기본과정·심화과정·코치트레이닝에 참여하는 목회자·선교사·사역자·사모의 반액 장학</strong>을 위한 것입니다.</p>
                    <p>보내주신 마음은 안내한 장학 목적에 맞게 사용하고, 사용 현황은 개인이 드러나지 않는 전체 집계로 안내하겠습니다.</p>
                    <p>장학을 받는 분의 이름과 개인 사정은 공개하지 않습니다. 배움의 이야기를 나눌 때에도 당사자가 동의한 범위를 지키겠습니다.</p>
                </div>
                <div class="mt-10">${renderScholarshipGivingPanel()}</div>
            </section>

            <section class="border-t border-er-sand py-12 md:py-20" aria-labelledby="scholarship-faq-title">
                <h2 id="scholarship-faq-title" class="text-2xl font-bold leading-snug text-er-inkSoft break-keep">자주 묻는 질문</h2>
                <div class="mt-6 divide-y divide-er-sand">
                    <details class="py-4"><summary class="min-h-11 cursor-pointer py-3 font-bold text-er-inkSoft break-keep">누가 반액 장학을 받을 수 있나요?</summary><p class="max-w-xl pb-3 text-base leading-relaxed text-er-body break-keep">기본과정·심화과정·코치트레이닝에 참여하는 목회자·선교사·사역자·사모를 지원합니다. 참여를 원하시는 과정과 상황을 이메일로 문의해 주세요.</p></details>
                    <details class="py-4"><summary class="min-h-11 cursor-pointer py-3 font-bold text-er-inkSoft break-keep">어느 정도의 수강료를 지원하나요?</summary><p class="max-w-xl pb-3 text-base leading-relaxed text-er-body break-keep">반액 장학은 해당 과정 수강료의 50%를 지원합니다. 나머지 수강료는 참여자가 부담하며, 장학 적용 내용은 등록 전에 안내받으실 수 있습니다.</p></details>
                    <details class="py-4"><summary class="min-h-11 cursor-pointer py-3 font-bold text-er-inkSoft break-keep">일반 프로그램과 장학 후원은 어떻게 연결되나요?</summary><p class="max-w-xl pb-3 text-base leading-relaxed text-er-body break-keep">일반 프로그램은 유료로 운영됩니다. 장학 후원은 사역자가 해당 과정에 참여할 때 수강료 부담을 덜어드리는 데 사용됩니다.</p></details>
                    <details class="py-4"><summary class="min-h-11 cursor-pointer py-3 font-bold text-er-inkSoft break-keep">어떻게 후원할 수 있나요?</summary><p class="max-w-xl pb-3 text-base leading-relaxed text-er-body break-keep">한국에서는 안내된 카카오뱅크 계좌로, 미국에서는 안내된 수취 정보로 Zelle 또는 Venmo를 통해 직접 송금하실 수 있습니다. 송금 메모에 ‘후원’을 적어 주세요.</p></details>
                    <details class="py-4"><summary class="min-h-11 cursor-pointer py-3 font-bold text-er-inkSoft break-keep">장학을 받는 분의 이야기가 공개되나요?</summary><p class="max-w-xl pb-3 text-base leading-relaxed text-er-body break-keep">개인의 이름과 사정은 공개하지 않습니다. 후기는 실제 참여자가 공개에 동의한 경우에만, 동의한 범위 안에서 소개합니다.</p></details>
                    <details class="py-4"><summary class="min-h-11 cursor-pointer py-3 font-bold text-er-inkSoft break-keep">기부금영수증을 받을 수 있나요?</summary><p class="max-w-xl pb-3 text-base leading-relaxed text-er-body break-keep">현재 안내드리는 증빙은 입금 내역을 확인한 후 보내드리는 후원금 수령 확인서입니다. 소득·세액공제용 기부금영수증이 아닙니다.</p><p class="max-w-xl pb-3 text-sm leading-relaxed text-er-muted break-keep">${escapeHtml(receiptNotice)}</p></details>
                </div>
            </section>

            <section class="border-t border-er-sand pt-12 md:pt-20" aria-labelledby="scholarship-vision-title">
                <h2 id="scholarship-vision-title" class="font-display text-3xl font-extrabold leading-snug tracking-[-0.03em] text-er-ink break-keep">한 사람의 회복이<br>그 사람에게서 끝나지 않기를</h2>
                <div class="mt-6 max-w-xl space-y-4 text-base leading-relaxed text-er-body break-keep">
                    <p>누군가를 계속 돌보는 사람에게도 자신을 돌아볼 자리가 필요합니다.</p>
                    <p>한 사람이 하나님 앞에서 자신의 삶을 정직하게 돌아보고 관계와 소명을 새롭게 살아갈 때, 그 배움이 가정과 교회, 사역 공동체에도 좋은 열매로 이어지기를 소망합니다.</p>
                    <p>그 한 사람의 배움과 회복을 위해, 하나님이 하시는 일에 기쁨으로 함께해 주세요.</p>
                </div>
                <button type="button" onclick="scrollToScholarshipSection('scholarship-giving-panel')" class="${scholarshipButtonStyle(true)} mt-8">사역지원에 함께하기</button>
                <p class="mt-3 text-sm text-er-muted">계좌를 통한 일시후원으로 참여하실 수 있습니다.</p>
                <div class="mt-10 border-t border-er-sand pt-6">
                    <p class="max-w-xl text-sm leading-relaxed text-er-body break-keep">사역자의 배움에 마음을 함께할 교회나 이웃에게 이 이야기를 전해 주세요.</p>
                    <button type="button" onclick="shareScholarshipPage()" class="${scholarshipButtonStyle()} mt-4">이 이야기를 나눠 주세요</button>
                    <p id="scholarship-share-status" role="status" class="mt-2 break-all text-sm text-er-muted"></p>
                </div>
            </section>
        </div>
    </div>`;
}

// Keep previously shared inquiry URLs useful without collecting donor information.
function renderScholarshipInquiry() {
    return `<div class="min-h-screen bg-er-base px-6 py-16"><div class="mx-auto max-w-xl">
        <h1 class="font-display text-3xl font-extrabold text-er-ink">장학 후원 문의</h1>
        <p class="mt-5 leading-relaxed text-er-body break-keep">후원에 관해 궁금한 내용은 이메일로 연락해 주세요.</p>
        <a href="mailto:hello@er-coaching.com?subject=ER%20장학%20후원%20수령%20확인서%20요청" class="${scholarshipButtonStyle()} mt-6">이메일로 문의·수령 확인서 요청</a>
        <p class="mt-3 break-all text-sm text-er-muted">hello@er-coaching.com</p>
        <a href="#support" class="mt-6 inline-flex min-h-11 items-center text-sm font-bold text-er-green underline underline-offset-4">후원 계좌 보기</a>
    </div></div>`;
}

// Scholarship giving uses bank apps; this page never verifies or initiates a payment.
var scholarshipSelection = { region: 'KR', frequency: 'once', amount: '' };

function getScholarshipPaymentConfig(region = 'KR') {
    const config = window.ER_SCHOLARSHIP_SUPPORT || {};
    const method = region === 'US' ? config.zelle : config.bank;
    const commonReady = config.acceptingContributions === true
        && typeof config.recipientName === 'string' && config.recipientName.trim()
        && typeof config.receiptNotice === 'string' && config.receiptNotice.trim();
    const detailsReady = method?.confirmed === true && typeof method.holder === 'string' && method.holder.trim()
        && (region === 'US'
            ? typeof method.address === 'string' && method.address.trim()
            : typeof method.name === 'string' && method.name.trim()
                && typeof method.number === 'string' && method.number.trim());
    return { config, method, ready: Boolean(commonReady && detailsReady) };
}

function parseScholarshipAmount(raw, region) {
    const value = String(raw ?? '').trim();
    const valid = region === 'US' ? /^\d+(?:\.\d{1,2})?$/.test(value) : /^\d+$/.test(value);
    if (!valid) return null;
    const amount = Number(value);
    const max = region === 'US' ? 100000 : 100000000;
    return Number.isFinite(amount) && amount > 0 && amount <= max ? amount : null;
}

function formatScholarshipAmount(amount, region) {
    return region === 'US' ? `$${amount.toLocaleString('en-US', { maximumFractionDigits: 2 })} USD`
        : `${amount.toLocaleString('ko-KR')}원`;
}

function scholarshipButtonStyle(primary = false) {
    return `inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-er-green focus-visible:ring-offset-2 ${primary
        ? 'bg-er-green text-white hover:bg-er-greenDark disabled:cursor-not-allowed disabled:opacity-60'
        : 'border border-er-sand bg-er-surface text-er-inkSoft hover:bg-er-greenTint'}`;
}

function renderScholarshipGivingPanel() {
    const { region, frequency } = scholarshipSelection;
    const { ready } = getScholarshipPaymentConfig(region);
    const amounts = region === 'US' ? [10, 30, 50] : [10000, 30000, 50000];
    return `
        <div id="scholarship-giving-panel" class="scroll-mt-24 rounded-[2rem] border border-er-sand bg-er-surface p-6 shadow-soft sm:p-8">
            <p class="mb-3 flex items-center gap-2 text-xs font-bold text-er-green"><i class="fas fa-heart text-er-heart" aria-hidden="true"></i> 사역자 반액 장학 후원</p>
            <h2 class="text-2xl font-bold leading-snug text-er-inkSoft break-keep">배움의 길을 함께 열어 주세요</h2>
            <p class="mt-3 text-sm leading-relaxed text-er-body break-keep">여러분의 참여는 한 사람의 배움을 이어가는 힘이 됩니다. 마음에 맞는 방법과 금액으로 함께해 주세요.</p>
            <form class="mt-6 space-y-6" onsubmit="showScholarshipTransfer(event)">
                <div>
                    <label for="scholarship-region" class="mb-2 block text-sm font-bold text-er-inkSoft">후원 방법</label>
                    <select id="scholarship-region" class="min-h-11 w-full rounded-xl border border-er-sand bg-er-base px-4 py-3 text-er-body" onchange="changeScholarshipRegion(this.value)">
                        <option value="KR" ${region === 'KR' ? 'selected' : ''}>한국 · 계좌이체 (원)</option>
                        <option value="US" ${region === 'US' ? 'selected' : ''}>미국 · Zelle (USD)</option>
                    </select>
                </div>
                <fieldset>
                    <legend class="mb-2 text-sm font-bold text-er-inkSoft">참여 방식</legend>
                    <div class="grid grid-cols-2 gap-2">
                        ${[['once', '한 번 함께하기'], ['monthly', '매월 함께하기']].map(([value, label]) => `
                            <label class="cursor-pointer">
                                <input type="radio" name="scholarship-frequency" value="${value}" ${frequency === value ? 'checked' : ''} class="peer sr-only" onchange="changeScholarshipFrequency(this.value)">
                                <span class="flex min-h-11 items-center justify-center rounded-xl border border-er-sand px-3 py-3 text-sm font-semibold text-er-body peer-checked:border-er-green peer-checked:bg-er-greenTint peer-checked:text-er-greenDeep peer-focus-visible:ring-2 peer-focus-visible:ring-er-green">${label}</span>
                            </label>`).join('')}
                    </div>
                    <p id="scholarship-frequency-note" class="mt-3 text-xs leading-relaxed text-er-muted">${scholarshipFrequencyNote()}</p>
                </fieldset>
                <div>
                    <label for="scholarship-amount" class="mb-2 block text-sm font-bold text-er-inkSoft">후원 금액 ${region === 'US' ? '(USD)' : '(원)'}</label>
                    <div class="mb-3 grid grid-cols-3 gap-2">
                        ${amounts.map(amount => `<button type="button" onclick="selectScholarshipAmount(${amount})" class="min-h-11 rounded-xl border border-er-sand px-2 text-sm font-semibold text-er-body hover:border-er-green hover:bg-er-greenTint">${formatScholarshipAmount(amount, region)}</button>`).join('')}
                    </div>
                    <input id="scholarship-amount" name="amount" type="text" inputmode="${region === 'US' ? 'decimal' : 'numeric'}" autocomplete="off" required maxlength="12" value="${escapeHtml(scholarshipSelection.amount)}" placeholder="원하시는 금액을 입력하세요" class="min-h-11 w-full rounded-xl border border-er-sand bg-er-base px-4 py-3 text-er-body" oninput="scholarshipSelection.amount = this.value; hideScholarshipTransfer()" aria-describedby="scholarship-amount-error">
                    <p id="scholarship-amount-error" role="alert" class="mt-2 text-sm text-red-700"></p>
                </div>
                ${!ready ? '<p class="text-sm leading-relaxed text-er-body break-keep">후원 접수를 준비하고 있습니다. 시작 일정이나 참여 방법은 아래 문의 창구로 연락해 주세요.</p>' : ''}
                <button type="submit" ${ready ? '' : 'disabled'} class="${scholarshipButtonStyle(true)} w-full">${ready ? '입금 방법 확인하기' : '후원 접수 준비 중'}</button>
                <p class="text-xs leading-relaxed text-er-muted break-keep">송금은 은행 앱에서 직접 진행합니다. 이 페이지에서 자동으로 결제되거나 출금되지 않습니다.</p>
            </form>
            <div id="scholarship-transfer" class="hidden mt-6 border-t border-er-sand pt-6" tabindex="-1"></div>
            <a href="#apply?track=support" class="mt-5 flex min-h-11 items-center justify-center text-sm font-bold text-er-green underline underline-offset-4">장학 후원 문의하기</a>
        </div>`;
}

function scholarshipFrequencyNote() {
    if (scholarshipSelection.frequency === 'once') return '한 번의 참여도 감사히 모아 사역자의 반액 장학을 이어갑니다.';
    return scholarshipSelection.region === 'US'
        ? 'Zelle 예약 송금 지원 여부는 이용 은행에서 확인해 주세요. 예약과 해지는 은행 앱에서 직접 관리합니다.'
        : '매월 후원은 은행 앱에서 자동이체를 설정해 주세요. 금액 변경과 해지도 은행 앱에서 직접 관리합니다.';
}

function changeScholarshipRegion(region) {
    scholarshipSelection = { region: region === 'US' ? 'US' : 'KR', frequency: scholarshipSelection.frequency, amount: '' };
    const panel = document.getElementById('scholarship-giving-panel');
    if (panel) panel.outerHTML = renderScholarshipGivingPanel();
    document.getElementById('scholarship-region')?.focus();
}

function changeScholarshipFrequency(frequency) {
    scholarshipSelection.frequency = frequency === 'monthly' ? 'monthly' : 'once';
    const note = document.getElementById('scholarship-frequency-note');
    if (note) note.textContent = scholarshipFrequencyNote();
    hideScholarshipTransfer();
}

function hideScholarshipTransfer() {
    const transfer = document.getElementById('scholarship-transfer');
    if (transfer) { transfer.classList.add('hidden'); transfer.innerHTML = ''; }
    const error = document.getElementById('scholarship-amount-error');
    if (error) error.textContent = '';
}

function selectScholarshipAmount(amount) {
    const input = document.getElementById('scholarship-amount');
    if (!input) return;
    input.value = String(amount);
    scholarshipSelection.amount = String(amount);
    hideScholarshipTransfer();
    input.focus();
}

function showScholarshipTransfer(event) {
    event.preventDefault();
    const { region, frequency } = scholarshipSelection;
    const { ready, config, method } = getScholarshipPaymentConfig(region);
    if (!ready) return;
    const input = document.getElementById('scholarship-amount');
    const amount = parseScholarshipAmount(input?.value, region);
    if (amount === null) {
        document.getElementById('scholarship-amount-error').textContent = region === 'US'
            ? '0보다 크고 100,000 이하인 금액을 입력해 주세요. 센트는 소수점 두 자리까지 입력할 수 있습니다.'
            : '1원부터 100,000,000원까지 숫자로 입력해 주세요.';
        input?.focus();
        return;
    }
    scholarshipSelection.amount = String(amount);
    const address = region === 'US' ? method.address : method.number;
    const transfer = document.getElementById('scholarship-transfer');
    transfer.innerHTML = `
        <h3 class="text-lg font-bold text-er-inkSoft">${frequency === 'monthly' ? '매월 ' : ''}${formatScholarshipAmount(amount, region)} 함께하기</h3>
        <dl class="mt-4 space-y-3 text-sm text-er-body">
            <div><dt class="text-er-muted">후원금 수령 주체</dt><dd class="mt-1 break-keep">${escapeHtml(config.recipientName)}</dd></div>
            <div><dt class="text-er-muted">${region === 'US' ? 'Zelle 수취인' : escapeHtml(method.name) + ' 예금주'}</dt><dd class="mt-1">${escapeHtml(method.holder)}</dd></div>
        </dl>
        <label for="scholarship-transfer-address" class="mt-4 block text-xs text-er-muted">${region === 'US' ? 'Zelle 등록 이메일 또는 미국 전화번호' : '계좌번호'}</label>
        <input id="scholarship-transfer-address" readonly value="${escapeHtml(address)}" class="mt-1 min-h-11 w-full rounded-xl border border-er-sand bg-er-base px-3 text-sm text-er-inkSoft" onclick="this.select()">
        <button type="button" onclick="copyScholarshipAddress()" class="${scholarshipButtonStyle()} mt-3 w-full">${region === 'US' ? 'Zelle 수취 정보 복사' : '계좌번호 복사'}</button>
        <p id="scholarship-copy-status" role="status" class="mt-2 text-xs text-er-muted"></p>
        <ol class="mt-5 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-er-body">
            <li>${region === 'US' ? '이용하시는 미국 은행 앱의 Zelle 메뉴를 엽니다.' : '이용하시는 은행 앱에서 계좌이체를 엽니다.'}</li>
            <li>위 입금처를 입력하고, 표시되는 수취인 이름을 확인합니다.</li>
            <li>${formatScholarshipAmount(amount, region)}을 송금합니다. 메모를 남길 수 있다면 ‘ER 장학’을 적어 주세요.</li>
        </ol>
        ${frequency === 'monthly' ? `<p class="mt-4 text-sm leading-relaxed text-er-body">${scholarshipFrequencyNote()}</p>` : ''}
        <p class="mt-4 text-xs leading-relaxed text-er-muted break-keep">${escapeHtml(config.receiptNotice)}</p>
        <a href="#apply?track=support&intent=transfer&region=${region}" class="${scholarshipButtonStyle()} mt-5 w-full">송금 후 입금 확인 요청하기</a>
        <p class="mt-3 text-xs leading-relaxed text-er-muted break-keep">확인 요청은 선택 사항입니다. 실제 입금 여부는 담당자가 확인하며, 요청만으로 입금이 확정되지는 않습니다.</p>`;
    transfer.classList.remove('hidden');
    transfer.focus();
}

async function copyScholarshipAddress() {
    const input = document.getElementById('scholarship-transfer-address');
    const status = document.getElementById('scholarship-copy-status');
    if (!input || !status) return;
    try {
        await navigator.clipboard.writeText(input.value);
        status.textContent = '복사했습니다. 은행 앱에서 수취인 이름을 확인해 주세요.';
    } catch (_error) {
        input.focus(); input.select();
        status.textContent = '자동 복사가 지원되지 않습니다. 선택된 정보를 직접 복사해 주세요.';
    }
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
                <button type="button" onclick="document.getElementById('scholarship-giving-panel').scrollIntoView({ block: 'start' })" class="${scholarshipButtonStyle()} mt-6 lg:hidden">함께하는 방법 보기</button>
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

function renderScholarshipInquiry(payload) {
    if (window.ER_SCHOLARSHIP_SUPPORT?.inquiriesEnabled !== true) {
        return `<div class="min-h-screen bg-er-base px-6 py-16"><div class="mx-auto max-w-xl">
            <h1 class="font-display text-3xl font-extrabold text-er-ink">장학 후원 문의하기</h1>
            <p class="mt-5 leading-relaxed text-er-body break-keep">마음을 함께해 주셔서 감사합니다. 온라인 문의 접수를 준비하는 동안에는 이메일로 연락해 주세요.</p>
            <a href="mailto:hello@er-coaching.com?subject=ER%20장학%20후원%20문의" class="${scholarshipButtonStyle(true)} mt-6">이메일로 문의하기</a>
            <p class="mt-3 break-all text-sm text-er-muted">hello@er-coaching.com</p>
            <a href="#support" class="mt-6 inline-flex min-h-11 items-center text-sm font-bold text-er-green underline underline-offset-4">후원 이야기로 돌아가기</a>
        </div></div>`;
    }
    const region = payload?.region === 'US' || payload?.region === 'KR' ? payload.region : scholarshipSelection.region;
    const transfer = payload?.intent === 'transfer' && getScholarshipPaymentConfig(region).ready;
    const title = transfer ? '입금 확인 요청하기' : '장학 후원 문의하기';
    const inputClass = 'mt-2 min-h-11 w-full rounded-xl border border-er-sand bg-er-base px-4 py-3 text-er-body';
    return `<div class="min-h-screen bg-er-base px-4 py-12 sm:px-6">
        <div class="mx-auto max-w-xl">
            <a href="#support" class="inline-flex min-h-11 items-center text-sm font-bold text-er-green underline underline-offset-4">후원 이야기로 돌아가기</a>
            <h1 class="mt-5 font-display text-3xl font-extrabold leading-snug text-er-ink break-keep">${title}</h1>
            <p class="mt-4 text-sm leading-relaxed text-er-body break-keep">${transfer ? '담당자가 실제 입금을 확인한 뒤 남겨주신 연락처로 안내드립니다. 이 요청만으로 입금이 확정되지는 않습니다.' : '사역자 반액 장학에 함께하는 방법을 안내해 드립니다.'}</p>
            <form id="apply-form" class="mt-8 space-y-5" onsubmit="submitScholarshipInquiry(event, ${transfer})">
                <input type="hidden" name="category" value="${transfer ? '장학 후원 입금 확인 요청' : '장학 후원 문의'}">
                <input type="hidden" name="message" id="scholarship-inquiry-message">
                <div><label for="scholarship-name" class="text-sm font-bold text-er-inkSoft">${transfer ? '입금자 이름' : '이름'}</label><input id="scholarship-name" name="name" required maxlength="100" autocomplete="name" class="${inputClass}"></div>
                <div><label for="scholarship-contact" class="text-sm font-bold text-er-inkSoft">연락받으실 이메일 또는 전화번호</label><input id="scholarship-contact" name="contact" required maxlength="200" class="${inputClass}"></div>
                ${transfer ? `<div class="grid gap-4 sm:grid-cols-2">
                    <div><label for="scholarship-inquiry-region" class="text-sm font-bold text-er-inkSoft">송금 방법</label><select id="scholarship-inquiry-region" name="support_region" class="${inputClass}" onchange="document.getElementById('scholarship-inquiry-amount').value = ''">${['KR', 'US'].filter(value => getScholarshipPaymentConfig(value).ready).map(value => `<option value="${value}" ${region === value ? 'selected' : ''}>${value === 'US' ? 'Zelle · USD' : '한국 계좌이체 · 원'}</option>`).join('')}</select></div>
                    <div><label for="scholarship-date" class="text-sm font-bold text-er-inkSoft">송금일</label><input id="scholarship-date" name="support_date" type="date" required class="${inputClass}"></div>
                    <div class="sm:col-span-2"><label for="scholarship-inquiry-amount" class="text-sm font-bold text-er-inkSoft">실제로 송금한 금액</label><input id="scholarship-inquiry-amount" name="support_amount" inputmode="decimal" required maxlength="12" value="${escapeHtml(region === scholarshipSelection.region ? scholarshipSelection.amount : '')}" class="${inputClass}"></div>
                </div>` : ''}
                <div><label for="scholarship-note" class="text-sm font-bold text-er-inkSoft">${transfer ? '남기실 말씀 (선택)' : '문의 내용'}</label><textarea id="scholarship-note" name="support_note" rows="4" ${transfer ? '' : 'required'} maxlength="2000" class="${inputClass}"></textarea><p class="mt-2 text-xs leading-relaxed text-er-muted">카드번호, 계좌 비밀번호, 주민등록번호는 적지 마세요.</p></div>
                <label class="flex items-start gap-3 text-sm leading-relaxed text-er-body"><input type="checkbox" name="privacy_agree" required class="mt-1 h-5 w-5 shrink-0"><span>문의 응대와 입금 확인을 위해 이름, 연락처 및 입력한 내용을 처리하는 데 동의합니다. <a href="#privacy" target="_blank" rel="noopener" class="font-bold text-er-green underline underline-offset-4">개인정보 처리방침</a></span></label>
                <div><div id="apply-turnstile-widget"></div><p id="apply-turnstile-status" class="hidden"></p><button id="apply-turnstile-retry" type="button" onclick="initApplyTurnstile()" class="hidden min-h-11 text-sm font-bold text-er-green underline">보안 확인 다시 불러오기</button><input type="hidden" name="turnstile_token" id="apply-turnstile-token" value=""></div>
                <p id="apply-submit-status" role="status" class="hidden"></p>
                <button id="apply-submit-btn" type="submit" data-default-label="${title}" data-loading-label="접수 중…" class="${scholarshipButtonStyle(true)} w-full">${title}</button>
            </form>
            <p class="mt-6 text-sm text-er-muted">문의가 접수되지 않으면 <a href="mailto:hello@er-coaching.com" class="font-bold text-er-green underline">hello@er-coaching.com</a>으로 연락해 주세요.</p>
        </div>
    </div>`;
}

async function submitScholarshipInquiry(event, transfer) {
    event.preventDefault();
    const form = event.target;
    if (window.ER_SCHOLARSHIP_SUPPORT?.inquiriesEnabled !== true || form.dataset.submitting === 'true' || !form.reportValidity()) return;
    const data = new FormData(form);
    const lines = ['목적: 기본과정·심화과정·코치트레이닝 사역자 반액 장학', '개인정보 처리 동의: 동의함'];
    if (transfer) {
        const region = data.get('support_region') === 'US' ? 'US' : 'KR';
        if (!getScholarshipPaymentConfig(region).ready) {
            setApplySubmitStatus('선택하신 방법의 후원 접수가 아직 시작되지 않았습니다. 문의 창구로 연락해 주세요.', 'error');
            return;
        }
        const amount = parseScholarshipAmount(data.get('support_amount'), region);
        if (amount === null) {
            setApplySubmitStatus('송금 방법과 실제 송금한 금액을 확인해 주세요.', 'error');
            return;
        }
        lines.push('처리 구분: 입금 확인 요청 (미확인·후원자 입력)', `송금 방법: ${region === 'US' ? 'Zelle' : '한국 계좌이체'}`,
            `송금액: ${formatScholarshipAmount(amount, region)}`, `송금일: ${data.get('support_date')}`);
    }
    const note = String(data.get('support_note') || '').trim();
    if (note) lines.push(`남기신 말씀: ${note}`);
    document.getElementById('scholarship-inquiry-message').value = lines.join('\n');
    form.dataset.submitting = 'true';
    try {
        await handleApplySubmit(event, transfer ? 'support:scholarship-transfer' : 'support:scholarship', { scholarshipInquiry: true, transferRequest: transfer });
    } finally {
        form.dataset.submitting = 'false';
    }
}

function renderScholarshipInquiryThankYou(payload) {
    const transfer = payload.transferRequest === true || payload.transferRequest === 'true';
    return `<div class="min-h-screen bg-er-base px-6 py-16"><div class="mx-auto max-w-lg">
        <h1 class="font-display text-3xl font-extrabold leading-snug text-er-ink break-keep">${transfer ? '입금 확인 요청을 받았습니다' : '장학 후원 문의를 받았습니다'}</h1>
        <p class="mt-5 text-base leading-relaxed text-er-body break-keep">마음을 함께해 주셔서 감사합니다. ${transfer ? '실제 입금 내역을 확인한 뒤' : '문의 내용을 확인한 뒤'} 남겨주신 연락처로 안내드리겠습니다.</p>
        ${transfer ? '<p class="mt-4 text-sm leading-relaxed text-er-muted break-keep">이 화면은 요청 접수 안내이며, 입금 확인서나 기부금영수증이 아닙니다.</p>' : ''}
        <a href="#support" class="${scholarshipButtonStyle(true)} mt-8">후원 이야기로 돌아가기</a>
    </div></div>`;
}

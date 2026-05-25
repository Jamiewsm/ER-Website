// ER Section: Notices — list, detail, editor, skeleton helpers
function renderListSkeleton(itemCount = 3) {
    return Array.from({ length: itemCount }).map(() => `
        <div class="border border-gray-100 rounded-2xl p-4 animate-pulse bg-white">
            <div class="flex items-center justify-between gap-3">
                <div class="h-4 w-44 rounded bg-er-accentLight/80"></div>
                <div class="h-5 w-16 rounded-full bg-gray-100"></div>
            </div>
            <div class="mt-3 h-3 w-5/6 rounded bg-gray-100"></div>
            <div class="mt-2 h-3 w-2/3 rounded bg-gray-100"></div>
        </div>
    `).join('');
}

function renderMetricSkeleton(itemCount = 4) {
    return Array.from({ length: itemCount }).map(() => `
        <div class="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
            <div class="h-3 w-24 rounded bg-gray-100"></div>
            <div class="mt-3 h-8 w-12 rounded bg-er-accentLight/80"></div>
        </div>
    `).join('');
}

function renderDetailSkeleton() {
    return `
        <div class="animate-pulse">
            <div class="h-5 w-48 rounded bg-er-accentLight/80"></div>
            <div class="mt-3 h-3 w-40 rounded bg-gray-100"></div>
            <div class="mt-4 h-20 w-full rounded-xl bg-white border border-gray-100"></div>
            <div class="mt-3 h-20 w-full rounded-xl bg-white border border-gray-100"></div>
        </div>
    `;
}
function normalizeParentingNoticeHtml(html) {
    const pdf =
        typeof PARENTING_MOBILE_BROCHURE_PDF !== 'undefined'
            ? PARENTING_MOBILE_BROCHURE_PDF
            : '/parenting-workshop/mobile-brochure.pdf';
    let out = String(html || '');
    out = out.replace(
        /href="\/parents-brochure\.html[^"]*"/gi,
        `href="${pdf}" target="_blank" rel="noopener noreferrer"`
    );
    const escaped = pdf.replace(/\//g, '\\/');
    out = out.replace(
        new RegExp(`href="${escaped}"(?![^>]*target=)`, 'gi'),
        `href="${pdf}" target="_blank" rel="noopener noreferrer"`
    );
    return out;
}

function formatNoticeBody(body, bodyIsHtml) {
    if (bodyIsHtml) return normalizeParentingNoticeHtml(body || '');
    let normalized = String(body || '').replace(/\r\n/g, '\n').trim();
    if (!normalized) return '';
    const compressed = !normalized.includes('\n') && normalized.length > 220;
    if (compressed) {
        normalized = normalized
            .replace(/([.!?])\s*/g, '$1\n')
            .replace(/(?:\s|^)(기간)(?=[0-9가-힣])/g, '\n$1: ')
            .replace(/(?:\s|^)(대상)(?=[0-9가-힣])/g, '\n$1: ')
            .replace(/(?:\s|^)(지원마감)(?=[0-9가-힣])/g, '\n$1: ');
    }
    normalized = normalized.replace(/\n{2,}/g, '\n');
    return `<p class="mb-0">${escapeHtml(normalized).replace(/\n/g, '<br>')}</p>`;
}

function looksLikeHtml(value) {
    return /<\/?[a-z][\s\S]*>/i.test(String(value || ''));
}

function stripHtmlToText(value) {
    const temp = document.createElement('div');
    const htmlWithBreaks = String(value || '')
        .replace(/<\s*br\s*\/?>/gi, '\n')
        .replace(/<\s*\/(span|strong|em|b|i)\s*>/gi, ' ')
        .replace(/<\s*\/(p|div|li|h1|h2|h3|h4|h5|h6)\s*>/gi, '\n');
    temp.innerHTML = htmlWithBreaks;
    return (temp.textContent || temp.innerText || '')
        .replace(/\r\n/g, '\n')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n[ \t]+/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

function normalizeNoticeRecord(row) {
    return {
        ...row,
        body_is_html: Boolean(row.body_is_html) || looksLikeHtml(row.body),
        program_period: row.program_period || '',
        program_target: row.program_target || '',
        apply_deadline: row.apply_deadline || ''
    };
}

/** Route id from hash (#notice_detail?id=4) — matches numeric id or Supabase legacy_key */
function findPublicNoticeByRouteId(routeId) {
    const key = String(routeId || '').trim();
    if (!key) return null;
    return state.notices.find(
        (row) => String(row.id) === key || String(row.legacy_key ?? '') === key
    ) || null;
}

function getNoticeLegacyKey(notice) {
    if (notice == null) return '';
    return String(notice.legacy_key != null ? notice.legacy_key : notice.id);
}

function getBundledPublicNotices() {
    const items = (typeof contentData !== 'undefined' && contentData.notices) ? contentData.notices : [];
    return items.map((item) => ({
        id: item.id,
        legacy_key: item.id,
        tag: item.tag || '안내',
        title: item.title || '',
        summary: item.summary || '',
        body: item.body || '',
        body_is_html: true,
        published_at: item.date || '',
        program_period: item.program_period || '',
        program_target: item.program_target || '',
        apply_deadline: item.apply_deadline || ''
    }));
}

function mergePublicNotices(remoteRows, bundledRows) {
    const merged = [...remoteRows];
    const legacyKeys = new Set(
        remoteRows
            .map((row) => (row.legacy_key != null ? String(row.legacy_key) : ''))
            .filter(Boolean)
    );
    bundledRows.forEach((bundled) => {
        const key = String(bundled.legacy_key ?? bundled.id);
        if (legacyKeys.has(key)) return;
        merged.push(bundled);
    });
    return merged;
}

async function loadNotices(force = false) {
    if (!force && state.noticesLoaded) return;
    const bundled = getBundledPublicNotices();
    const client = window.supabaseClient;
    if (!client) {
        state.notices = mergePublicNotices([], bundled);
        state.noticesLoaded = true;
        return;
    }
    const { data, error } = await client
        .from('public_notices')
        .select('id, legacy_key, tag, title, summary, body, body_is_html, published_at, program_period, program_target, apply_deadline')
        .order('published_at', { ascending: false })
        .order('created_at', { ascending: false });
    const remote = (!error && Array.isArray(data)) ? data.map(normalizeNoticeRecord) : [];
    state.notices = mergePublicNotices(remote, bundled);
    state.noticesLoaded = true;
}

async function reloadNoticesView(payload) {
    await loadNotices(true);
    renderSection(state.currentSection === 'notice_detail' ? 'notice_detail' : 'notices', payload, { syncHash: false });
}

function openNoticeEditor(mode, id = null) {
    if (!canManageNotices()) return;
    if (mode === 'edit') {
        const notice = findPublicNoticeByRouteId(id);
        if (!notice) return;
        state.noticeEditor = {
            open: true,
            mode: 'edit',
            noticeId: notice.id,
            tag: notice.tag || '안내',
            title: notice.title || '',
            summary: notice.summary || '',
            body: notice.body_is_html ? stripHtmlToText(notice.body) : (notice.body || ''),
            published_at: notice.published_at || new Date().toISOString().slice(0, 10),
            program_period: notice.program_period || '',
            program_target: notice.program_target || '',
            apply_deadline: notice.apply_deadline || ''
        };
        renderSection('notices', null, { syncHash: false });
        return;
    }
    state.noticeEditor = {
        open: true,
        mode: 'create',
        noticeId: null,
        tag: '안내',
        title: '',
        summary: '',
        body: '',
        published_at: new Date().toISOString().slice(0, 10),
        program_period: '',
        program_target: '',
        apply_deadline: ''
    };
    renderSection('notices', null, { syncHash: false });
}

function closeNoticeEditor() {
    if (!state.noticeEditor.open) return;
    state.noticeEditor.open = false;
    renderSection('notices', null, { syncHash: false });
}

function setNoticeEditorField(field, value) {
    if (!state.noticeEditor || typeof state.noticeEditor !== 'object') return;
    state.noticeEditor[field] = value;
}

async function submitNoticeEditor(event) {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();
    try {
        if (!canManageNotices()) return;
        const title = String(state.noticeEditor.title || '').trim();
        const body = String(state.noticeEditor.body || '').trim();
        if (!title) {
            alert('공지 제목을 입력해 주세요.');
            return;
        }
        if (!body) {
            alert('본문을 입력해 주세요.');
            return;
        }
        const client = window.supabaseClient;
        if (!client) {
            alert('Supabase 연결이 필요합니다.');
            return;
        }
        const payload = {
            tag: String(state.noticeEditor.tag || '안내').trim() || '안내',
            title,
            summary: String(state.noticeEditor.summary || '').trim(),
            body,
            body_is_html: false,
            published_at: String(state.noticeEditor.published_at || '').trim() || new Date().toISOString().slice(0, 10),
            program_period: String(state.noticeEditor.program_period || '').trim(),
            program_target: String(state.noticeEditor.program_target || '').trim(),
            apply_deadline: String(state.noticeEditor.apply_deadline || '').trim()
        };
        let error = null;
        if (state.noticeEditor.mode === 'edit' && state.noticeEditor.noticeId) {
            const out = await client
                .from('public_notices')
                .update(payload)
                .eq('id', state.noticeEditor.noticeId);
            error = out.error;
        } else {
            const out = await client.from('public_notices').insert([{
                ...payload,
                created_by: state.user?.id || null
            }]);
            error = out.error;
        }
        if (error) {
            console.error('NOTICE_SAVE_ERROR', error);
            alert(`공지 저장 실패: ${error.message}`);
            return;
        }
        state.noticeEditor.open = false;
        await reloadNoticesView();
    } catch (err) {
        console.error('NOTICE_SAVE_FATAL', err);
        alert(`공지 저장 중 오류가 발생했습니다: ${err?.message || err}`);
    }
}

function renderNoticeEditor() {
    if (!canManageNotices() || !state.noticeEditor.open) return '';
    const editorTitle = state.noticeEditor.mode === 'edit' ? '공지 수정' : '새 공지 작성';
    return `
        <div class="mb-6 bg-er-base border border-er-accent/20 rounded-3xl p-5 md:p-6 animate-fade-in-up">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-base font-bold text-er-dark">${editorTitle}</h3>
                <button type="button" onclick="closeNoticeEditor()" class="px-3 py-1.5 rounded-full text-xs font-bold border border-gray-200 text-gray-700 hover:bg-gray-50">닫기</button>
            </div>
            <form onsubmit="submitNoticeEditor(event)" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input required value="${escapeHtml(state.noticeEditor.title)}" oninput="setNoticeEditorField('title', this.value)" placeholder="공지 제목" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm bg-white">
                    <input value="${escapeHtml(state.noticeEditor.tag)}" oninput="setNoticeEditorField('tag', this.value)" placeholder="태그 (예: 안내, 모집중)" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm bg-white">
                </div>
                <input value="${escapeHtml(state.noticeEditor.summary)}" oninput="setNoticeEditorField('summary', this.value)" placeholder="요약 문구" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm bg-white">
                <textarea required oninput="setNoticeEditorField('body', this.value)" rows="7" placeholder="공지 본문" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm bg-white">${escapeHtml(state.noticeEditor.body)}</textarea>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input value="${escapeHtml(state.noticeEditor.program_period)}" oninput="setNoticeEditorField('program_period', this.value)" placeholder="기간 (예: 8주)" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm bg-white">
                    <input value="${escapeHtml(state.noticeEditor.apply_deadline)}" oninput="setNoticeEditorField('apply_deadline', this.value)" placeholder="지원마감 (예: 2025.01.15)" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm bg-white">
                </div>
                <textarea oninput="setNoticeEditorField('program_target', this.value)" rows="3" placeholder="대상" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm bg-white">${escapeHtml(state.noticeEditor.program_target)}</textarea>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <input type="date" value="${escapeHtml(state.noticeEditor.published_at)}" onchange="setNoticeEditorField('published_at', this.value)" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm bg-white">
                    <button type="submit" class="px-6 py-2.5 rounded-full text-xs font-bold bg-er-dark text-white">저장하기</button>
                </div>
            </form>
        </div>
    `;
}

async function deleteNotice(id) {
    if (!canManageNotices()) return;
    const notice = findPublicNoticeByRouteId(id);
    if (!notice) return;
    if (!confirm(`"${notice.title}" 공지를 삭제할까요?`)) return;
    const client = window.supabaseClient;
    if (!client) {
        alert('Supabase 연결이 필요합니다.');
        return;
    }
    const { error } = await client.from('public_notices').delete().eq('id', notice.id);
    if (error) {
        alert(`공지 삭제 실패: ${error.message}`);
        return;
    }
    await reloadNoticesView();
}

if (typeof window !== 'undefined') {
    window.openNoticeEditor = openNoticeEditor;
    window.closeNoticeEditor = closeNoticeEditor;
    window.setNoticeEditorField = setNoticeEditorField;
    window.submitNoticeEditor = submitNoticeEditor;
    window.deleteNotice = deleteNotice;
}

function renderNotices() {
    const items = [...state.notices].sort((a, b) => {
        const left = a.published_at || '';
        const right = b.published_at || '';
        return left < right ? 1 : -1;
    });
    const manageButton = canManageNotices()
        ? `<button onclick="openNoticeEditor('create')" class="px-3 py-1.5 bg-er-dark text-white rounded-full text-xs font-bold hover:bg-gray-800">새 공지</button>`
        : `<div class="w-16"></div>`;
    return `
        <div class="bg-white min-h-screen py-16">
            <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="mb-8 flex items-center justify-between gap-4 animate-fade-in-up">
                    <button onclick="renderSection('community')" class="px-3 py-1.5 bg-gray-50 rounded-full text-xs font-medium text-gray-600 hover:text-er-dark border border-gray-100">
                        <i class="fas fa-arrow-left mr-1"></i> 함께한 이야기로
                    </button>
                    <h2 class="text-xl font-bold text-gray-900">공지사항</h2>
                    ${manageButton}
                </div>
                ${renderNoticeEditor()}

                <div class="space-y-3 animate-fade-in-up" style="animation-delay:0.1s;">
                    ${!state.noticesLoaded ? renderListSkeleton(3) : items.map(n => `
                        <div onclick="openNotice('${n.legacy_key != null ? n.legacy_key : n.id}')" class="group bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-card hover:-translate-y-0.5 transition-all cursor-pointer">
                            <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
                                <div class="min-w-0">
                                    <div class="flex items-center gap-2 mb-1.5">
                                        <span class="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${n.tag === '모집중' ? 'bg-er-accent/10 text-er-accent' : 'bg-gray-100 text-gray-500'}">${n.tag}</span>
                                        <span class="text-[10px] text-gray-400">${(n.published_at || '').replaceAll('-','.')}</span>
                                    </div>
                                    <h3 class="text-sm md:text-base font-bold text-gray-900 truncate group-hover:text-er-accent transition-colors">${n.title}</h3>
                                    <p class="text-xs text-gray-500 mt-1 line-clamp-1">${n.summary ?? ''}</p>
                                </div>
                                <div class="hidden md:flex shrink-0 items-center gap-2">
                                    ${canManageNotices() ? `
                                        <button type="button" onclick="event.stopPropagation(); openNoticeEditor('edit', '${n.id}')" class="px-2 py-1 rounded-full text-[11px] font-bold border border-er-accent/40 text-er-dark hover:bg-er-accentLight/30">수정</button>
                                        <button type="button" onclick="event.stopPropagation(); deleteNotice('${n.id}')" class="px-2 py-1 rounded-full text-[11px] font-bold border border-red-200 text-red-600 hover:bg-red-50">삭제</button>
                                    ` : ''}
                                    <div class="w-8 h-8 rounded-full border border-gray-200 items-center justify-center text-gray-400 group-hover:bg-er-dark group-hover:text-white group-hover:border-transparent transition-all ${canManageNotices() ? 'flex' : 'hidden md:flex'}">
                                        <i class="fas fa-arrow-right text-xs"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function renderNoticeDetail(payload) {
    const id = String(payload?.id || '');
    const n = findPublicNoticeByRouteId(id);

    if (!n) {
        if (!state.noticesLoaded) {
            return `
                <div class="bg-er-base min-h-screen py-16 px-4">
                    <div class="max-w-3xl mx-auto">
                        <div class="bg-white rounded-[2rem] shadow-card p-6 md:p-10 border border-gray-100">
                            ${renderDetailSkeleton()}
                        </div>
                    </div>
                </div>
            `;
        }
        return `<div class="p-10 text-center">공지를 찾을 수 없습니다.<br><button class="mt-4 btn" onclick="renderSection('notices')">돌아가기</button></div>`;
    }

    const legacyKey = getNoticeLegacyKey(n);
    const isParentingNotice = legacyKey === '4';
    const isMagazineNotice = legacyKey === '3';
    const applyOnclick = isParentingNotice
        ? "renderSection('apply', { track: 'paid', focus: 'parenting_workshop', apply_source: 'notice' })"
        : "renderSection('apply', { track: 'paid' })";
    const applyLabel = isParentingNotice ? '워크샵 신청하기' : '상담 신청하기';
    const brochurePdf =
        typeof PARENTING_MOBILE_BROCHURE_PDF !== 'undefined'
            ? PARENTING_MOBILE_BROCHURE_PDF
            : '/parenting-workshop/mobile-brochure.pdf';
    const parentingLinks = `
        <a href="/parenting-workshop.html?apply_source=${isMagazineNotice ? 'magazine' : 'notice'}" class="px-6 py-2.5 border border-er-accent/40 text-er-dark rounded-full text-sm font-bold hover:bg-er-accentLight/30 transition-all w-full md:w-auto text-center">워크샵 안내</a>
        <a href="${brochurePdf}" target="_blank" rel="noopener noreferrer" class="px-6 py-2.5 border border-er-accent/40 text-er-dark rounded-full text-sm font-bold hover:bg-er-accentLight/30 transition-all w-full md:w-auto text-center">모바일 브로셔</a>`;
    const brochureCta = (isParentingNotice || isMagazineNotice) ? parentingLinks : '';
    const footerHint = isMagazineNotice
        ? '창간호 하이라이트를 보셨다면 워크샵 안내·브로셔 PDF를 확인해 보세요.'
        : (isParentingNotice ? '워크샵 안내·모바일 브로셔(PDF)를 보거나 바로 신청할 수 있습니다.' : '문의하거나 신청하시겠어요?');

    return `
        <div class="bg-er-base min-h-screen py-16 px-4">
            <div class="max-w-3xl mx-auto">
                <div class="mb-4 flex items-center justify-between">
                    <button onclick="openNotices()" class="px-3 py-1.5 bg-white rounded-full text-xs font-medium text-gray-600 shadow-sm border border-gray-100">
                        <i class="fas fa-arrow-left mr-1"></i> 목록
                    </button>
                    <span class="text-[10px] text-gray-400">${(n.published_at || '').replaceAll('-','.')}</span>
                </div>

                <div class="bg-white rounded-[2rem] shadow-card p-6 md:p-10 border border-gray-100 animate-fade-in-up">
                    <div class="flex flex-wrap items-center gap-2 mb-4">
                        <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold ${n.tag === '모집중' ? 'bg-er-accent/10 text-er-accent' : 'bg-gray-100 text-gray-500'}">${n.tag}</span>
                        <h1 class="text-xl md:text-2xl font-bold text-gray-900 w-full md:w-auto break-keep">${n.title}</h1>
                    </div>
                    <div class="h-px bg-gray-100 my-6"></div>
                    <div class="prose prose-sm max-w-none text-gray-600">
                        ${formatNoticeBody(n.body, n.body_is_html)}
                    </div>
                    ${(n.program_period || n.program_target || n.apply_deadline) ? `
                        <div class="mt-8 grid gap-3">
                            ${n.program_period ? `<div class="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"><p class="text-[11px] font-bold text-gray-500 mb-1">기간</p><p class="text-sm text-gray-700 break-keep">${escapeHtml(n.program_period)}</p></div>` : ''}
                            ${n.program_target ? `<div class="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"><p class="text-[11px] font-bold text-gray-500 mb-1">대상</p><p class="text-sm text-gray-700 break-keep">${escapeHtml(n.program_target)}</p></div>` : ''}
                            ${n.apply_deadline ? `<div class="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"><p class="text-[11px] font-bold text-gray-500 mb-1">지원마감</p><p class="text-sm text-gray-700 break-keep">${escapeHtml(n.apply_deadline)}</p></div>` : ''}
                        </div>
                    ` : ''}
                    ${canManageNotices() ? `
                        <div class="mt-6 flex gap-2">
                            <button onclick="openNoticeEditor('edit', '${n.id}')" class="px-3 py-1.5 rounded-full text-xs font-bold border border-er-accent/40 text-er-dark hover:bg-er-accentLight/30">공지 수정</button>
                            <button onclick="deleteNotice('${n.id}')" class="px-3 py-1.5 rounded-full text-xs font-bold border border-red-200 text-red-600 hover:bg-red-50">공지 삭제</button>
                        </div>
                    ` : ''}
                    
                    <div class="mt-10 p-5 bg-er-base rounded-2xl border border-er-primary/10 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                        <div>
                            <p class="text-sm font-bold text-er-dark">${footerHint}</p>
                        </div>
                        <div class="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                            ${brochureCta}
                            <button onclick="${applyOnclick}" class="px-6 py-2.5 bg-er-dark text-white rounded-full text-sm font-bold shadow-soft hover:bg-gray-800 transition-all w-full md:w-auto">
                                ${applyLabel}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}


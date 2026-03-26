// ER App: Helper functions — formatting, access control, file utils
// --- Helper Functions ---
function openNotices() { renderSection('notices'); }
function openNotice(id) { renderSection('notice_detail', { id }); }
function openCoachApp() { window.open(COACH_APP_URL, '_blank', 'noopener,noreferrer'); }

function escapeHtml(value) {
    return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function formatDateTime(value) {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

function normalizeExternalLink(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    if (/^https?:\/\//i.test(raw) || /^zoommtg:\/\//i.test(raw)) return raw;
    if (/^www\./i.test(raw)) return `https://${raw}`;
    if (/^(?:[\w-]+\.)*zoom\.us\/\S+/i.test(raw)) return `https://${raw}`;
    return '';
}

function renderScheduleLocation(location) {
    const raw = String(location || '').trim();
    if (!raw) return '-';
    const href = normalizeExternalLink(raw);
    if (!href) return escapeHtml(raw);
    return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" class="text-er-accent underline underline-offset-2 break-all hover:text-er-accentDark transition-colors">${escapeHtml(raw)}</a>`;
}

function formatDateTimeInZone(value, timeZone, locale = 'ko-KR') {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat(locale, {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).format(date);
}

function getDateKeyInZone(value, timeZone) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(date);
}

function formatDateLabelInZone(value, timeZone, locale = 'ko-KR') {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat(locale, {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        weekday: 'short'
    }).format(date);
}

function formatTimeLabelInZone(value, timeZone, locale = 'ko-KR') {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat(locale, {
        timeZone,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    }).format(date);
}

function getKoreanTimePartsInZone(value, timeZone) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    const parts = new Intl.DateTimeFormat('ko-KR', {
        timeZone,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    }).formatToParts(date);
    const dayPeriod = parts.find((p) => p.type === 'dayPeriod')?.value || '';
    const hour = parts.find((p) => p.type === 'hour')?.value || '';
    const minute = parts.find((p) => p.type === 'minute')?.value || '';
    return { dayPeriod, hour, minute };
}

function formatZoneRange(startAt, endAt, zoneName, timeZone) {
    const startKey = getDateKeyInZone(startAt, timeZone);
    const endKey = getDateKeyInZone(endAt, timeZone);
    const startDate = formatDateLabelInZone(startAt, timeZone, 'ko-KR');
    const endDate = formatDateLabelInZone(endAt, timeZone, 'ko-KR');
    const startParts = getKoreanTimePartsInZone(startAt, timeZone);
    const endParts = getKoreanTimePartsInZone(endAt, timeZone);
    if (!startParts || !endParts) return `${zoneName}: -`;

    const startFullTime = `${startParts.dayPeriod} ${startParts.hour}:${startParts.minute}`;
    const endFullTime = `${endParts.dayPeriod} ${endParts.hour}:${endParts.minute}`;
    const endShortTime = `${endParts.hour}:${endParts.minute}`;

    if (startKey && startKey === endKey) {
        const endTime = startParts.dayPeriod === endParts.dayPeriod ? endShortTime : endFullTime;
        return `${zoneName}: ${startDate} ${startFullTime} - ${endTime}`;
    }
    return `${zoneName}: ${startDate} ${startFullTime} - ${endDate} ${endFullTime}`;
}

function formatScheduleDualRange(startAt, endAt) {
    return {
        kr: formatZoneRange(startAt, endAt, '한국', 'Asia/Seoul'),
        ct: formatZoneRange(startAt, endAt, '달라스', 'America/Chicago')
    };
}

function formatCoachScheduleTypeLabel(value) {
    const labels = {
        study: 'Study 트랙',
        training: 'Coaching 트랙',
        study_track: 'Study 트랙',
        spiritual_formation_track: 'Spiritual Formation 트랙',
        coaching_track: 'Coaching 트랙',
        practicum_track: 'Practicum 트랙'
    };
    return labels[String(value || '').trim()] || String(value || '일정');
}

function toIsoOrNull(localValue) {
    if (!localValue) return null;
    const date = new Date(localValue);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function toLocalDatetimeInputValue(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function getFileSizeLabel(sizeBytes) {
    if (!sizeBytes || sizeBytes < 1) return '-';
    if (sizeBytes < 1024 * 1024) return `${Math.round(sizeBytes / 1024)}KB`;
    return `${(sizeBytes / (1024 * 1024)).toFixed(1)}MB`;
}

function getCoachCalendarMonthStart() {
    const now = new Date();
    if (!state.coachCalendarMonth) {
        return new Date(now.getFullYear(), now.getMonth(), 1);
    }
    const month = new Date(state.coachCalendarMonth);
    if (Number.isNaN(month.getTime())) return new Date(now.getFullYear(), now.getMonth(), 1);
    return new Date(month.getFullYear(), month.getMonth(), 1);
}

function changeCoachCalendarMonth(offset) {
    const month = getCoachCalendarMonthStart();
    month.setMonth(month.getMonth() + Number(offset || 0));
    state.coachCalendarMonth = month.toISOString();
    loadCoachPortalDashboard();
}

function renderCoachCalendar(monthStart, schedules) {
    const labelEl = document.getElementById('coach-calendar-month-label');
    const gridEl = document.getElementById('coach-calendar-grid');
    if (!gridEl) return;
    if (labelEl) {
        labelEl.textContent = `${monthStart.getFullYear()}.${String(monthStart.getMonth() + 1).padStart(2, '0')}`;
    }

    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const monthIndex = monthStart.getMonth();
    const firstWeekday = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1).getDay();
    const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
    const counts = {};

    (schedules || []).forEach((item) => {
        const d = new Date(item.start_at);
        if (Number.isNaN(d.getTime())) return;
        if (d.getMonth() !== monthIndex || d.getFullYear() !== monthStart.getFullYear()) return;
        const key = d.getDate();
        counts[key] = (counts[key] || 0) + 1;
    });

    let cells = '';
    for (let i = 0; i < 42; i += 1) {
        const day = i - firstWeekday + 1;
        if (day < 1 || day > daysInMonth) {
            cells += `<div class="h-16 rounded-xl border border-transparent bg-gray-50/50"></div>`;
            continue;
        }
        const c = counts[day] || 0;
        cells += `
            <button type="button" onclick="renderSection('coach_schedule')" class="h-16 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 text-left p-2 flex flex-col justify-between">
                <span class="text-xs font-semibold text-gray-700">${day}</span>
                ${c ? `<span class="text-[10px] px-1.5 py-0.5 rounded-full bg-er-accentLight text-er-dark font-bold self-start">${c}건</span>` : '<span class="text-[10px] text-gray-300">-</span>'}
            </button>
        `;
    }

    gridEl.innerHTML = `
        <div class="grid grid-cols-7 gap-2 mb-2">
            ${dayNames.map((d) => `<div class="text-center text-xs font-bold text-gray-400">${d}</div>`).join('')}
        </div>
        <div class="grid grid-cols-7 gap-2">${cells}</div>
    `;
}

const ALLOWED_UPLOAD_EXTENSIONS = new Set([
    'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'csv', 'zip', 'hwp', 'hwpx',
    'png', 'jpg', 'jpeg', 'webp', 'gif',
    'mp4', 'mov', 'mp3', 'wav', 'm4a'
]);
const MAX_UPLOAD_SIZE_BYTES = 100 * 1024 * 1024; // 100MB

function getFileExtension(name) {
    const value = String(name || '');
    const idx = value.lastIndexOf('.');
    if (idx < 0) return '';
    return value.slice(idx + 1).toLowerCase();
}

function buildSafeStorageFileName(originalName) {
    const raw = String(originalName || 'file');
    const dotIndex = raw.lastIndexOf('.');
    const base = dotIndex >= 0 ? raw.slice(0, dotIndex) : raw;
    const ext = dotIndex >= 0 ? raw.slice(dotIndex + 1).toLowerCase() : '';

    const safeBase = base
        .normalize('NFKD')
        .replace(/[^\w.-]+/g, '_')
        .replace(/_+/g, '_')
        .replace(/^[_\-.]+|[_\-.]+$/g, '') || 'file';

    const safeExt = ext.replace(/[^a-z0-9]+/g, '');
    return safeExt ? `${safeBase}.${safeExt}` : safeBase;
}

function validateUploadFile(file) {
    if (!file) return { ok: false, reason: '파일이 없습니다.' };
    const ext = getFileExtension(file.name);
    if (!ALLOWED_UPLOAD_EXTENSIONS.has(ext)) {
        return { ok: false, reason: `지원하지 않는 파일 형식입니다: .${ext || 'unknown'}` };
    }
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
        return { ok: false, reason: `파일이 너무 큽니다 (최대 100MB): ${file.name}` };
    }
    return { ok: true };
}

function ensureCoachAccess() {
    if (!state.user) {
        openAuthModal();
        return false;
    }
    if (!state.isCoach) {
        renderSection('mypage');
        return false;
    }
    return true;
}

function isHeadCoach() {
    return !!(state.isCoach && state.coachProfile?.role === 'head_coach');
}

function canManageNotices() {
    const email = (state.user?.email || '').toLowerCase();
    return email === NOTICE_ADMIN_EMAIL || isHeadCoach();
}

async function loadCoachPortalDashboard() {
    if (!ensureCoachAccess() || !supabaseClient) return;
    const monthStart = getCoachCalendarMonthStart();
    state.coachCalendarMonth = monthStart.toISOString();
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);
    const [taskRes, scheduleRes, materialRes, noteRes] = await Promise.all([
        supabaseClient.from('coach_tasks').select('id, title, due_at, status').order('created_at', { ascending: false }).limit(5),
        supabaseClient.from('coach_schedules').select('id, title, start_at, end_at, schedule_type').gte('end_at', new Date().toISOString()).order('start_at', { ascending: true }).limit(5),
        supabaseClient.from('coach_materials').select('id').limit(1000),
        supabaseClient.from('coach_session_notes').select('id, schedule_id, title, note_body, attachment_name, created_at').order('created_at', { ascending: false }).limit(5)
    ]);
    const { data: calendarSchedules } = await supabaseClient
        .from('coach_schedules')
        .select('id, title, start_at, end_at, schedule_type')
        .gte('start_at', monthStart.toISOString())
        .lt('start_at', monthEnd.toISOString())
        .order('start_at', { ascending: true });
    const tasks = taskRes.data || [];
    const schedules = scheduleRes.data || [];
    const materialCount = materialRes.data ? materialRes.data.length : 0;
    const notes = noteRes.data || [];
    renderCoachCalendar(monthStart, calendarSchedules || []);

    const summaryEl = document.getElementById('coach-portal-summary');
    if (summaryEl) {
        summaryEl.innerHTML = `
            <button type="button" onclick="renderSection('coach_tasks')" class="text-left bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-soft transition-shadow">
                <p class="text-xs text-gray-400">최근 보고서</p>
                <p class="text-3xl font-bold text-er-dark mt-2">${tasks.length}</p>
            </button>
            <button type="button" onclick="renderSection('coach_schedule')" class="text-left bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-soft transition-shadow">
                <p class="text-xs text-gray-400">다가오는 일정</p>
                <p class="text-3xl font-bold text-er-dark mt-2">${schedules.length}</p>
            </button>
            <button type="button" onclick="renderSection('coach_materials')" class="text-left bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-soft transition-shadow">
                <p class="text-xs text-gray-400">공유 자료 수</p>
                <p class="text-3xl font-bold text-er-dark mt-2">${materialCount}</p>
            </button>
            <button type="button" onclick="renderSection('coach_notes')" class="text-left bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-soft transition-shadow">
                <p class="text-xs text-gray-400">최근 세션 노트</p>
                <p class="text-3xl font-bold text-er-dark mt-2">${notes.length}</p>
            </button>
        `;
    }

    const tasksEl = document.getElementById('coach-portal-tasks');
    if (tasksEl) {
        tasksEl.innerHTML = tasks.length
            ? tasks.map((task) => `
                <button type="button" onclick="openCoachTaskFromDashboard('${task.id}')" class="w-full text-left p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                    <p class="font-semibold text-gray-800">${escapeHtml(task.title)}</p>
                    <p class="text-xs text-gray-500 mt-1">마감: ${formatDateTime(task.due_at)} · 상태: ${escapeHtml(task.status)}</p>
                </button>
            `).join('')
            : '<p class="text-sm text-gray-500">등록된 보고서가 없습니다.</p>';
    }

    const schedulesEl = document.getElementById('coach-portal-schedules');
    if (schedulesEl) {
        schedulesEl.innerHTML = schedules.length
            ? schedules.map((item) => {
                const dual = formatScheduleDualRange(item.start_at, item.end_at);
                return `
                <button type="button" onclick="renderSection('coach_schedule')" class="w-full text-left p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                    <p class="font-semibold text-gray-800">${escapeHtml(item.title)}</p>
                    <p class="text-xs text-gray-500 mt-1">${escapeHtml(formatCoachScheduleTypeLabel(item.schedule_type))}</p>
                    <p class="text-xs text-gray-500 mt-1">${escapeHtml(dual.kr)}</p>
                    <p class="text-xs text-gray-500 mt-1">${escapeHtml(dual.ct)}</p>
                </button>
            `;
            }).join('')
            : '<p class="text-sm text-gray-500">다가오는 일정이 없습니다.</p>';
    }

    const notesEl = document.getElementById('coach-portal-notes');
    if (notesEl) {
        notesEl.innerHTML = notes.length
            ? notes.map((note) => `
                <button type="button" onclick="viewCoachNoteDetail('${note.id}', true)" class="w-full text-left p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                    <p class="font-semibold text-gray-800">${escapeHtml(note.title)}</p>
                    <p class="text-xs text-gray-500 mt-1 line-clamp-2 break-keep">${escapeHtml(note.note_body || '')}</p>
                    <p class="text-xs text-gray-500 mt-1">등록: ${formatDateTime(note.created_at)}${note.attachment_name ? ` · 첨부: ${escapeHtml(note.attachment_name)}` : ''}</p>
                </button>
            `).join('')
            : '<p class="text-sm text-gray-500">등록된 세션 노트가 없습니다.</p>';
    }
}

async function loadCoachAdminUsers() {
    if (!ensureCoachAccess() || !isHeadCoach() || !supabaseClient) return;
    const listEl = document.getElementById('coach-admin-users-list');
    if (listEl) listEl.innerHTML = renderListSkeleton(4);

    const { data, error } = await supabaseClient.rpc('admin_list_coach_candidates');
    if (error) {
        if (listEl) listEl.innerHTML = `<p class="text-red-500 text-xs">가입자 목록 로딩 실패: ${escapeHtml(error.message)}</p>`;
        return;
    }

    state.coachAdminUsers = data || [];
    if (!listEl) return;
    if (!state.coachAdminUsers.length) {
        listEl.innerHTML = '<p class="text-sm text-gray-500">가입한 사용자가 없습니다.</p>';
        return;
    }

    listEl.innerHTML = state.coachAdminUsers.map((item) => {
        const isCurrentUser = item.user_id === state.user?.id;
        const isActiveCoach = !!item.is_coach;
        const roleLabel = item.role === 'head_coach' ? '헤드 코치' : (isActiveCoach ? '코치' : '일반 계정');
        const statusLabel = isActiveCoach
            ? '활성 코치'
            : (item.display_name ? '비활성 코치' : '승인 대기');
        const actionButton = isActiveCoach
            ? `<button onclick="disableCoachCandidate('${item.user_id}')" ${isCurrentUser ? 'disabled' : ''} class="px-3 py-1.5 rounded-full text-[11px] font-bold border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed">비활성화</button>`
            : `<button onclick="approveCoachCandidate('${item.user_id}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold bg-er-dark text-white">코치 승인</button>`;

        return `
            <div class="border border-gray-100 rounded-2xl p-4">
                <div class="flex flex-wrap items-start justify-between gap-3">
                    <div class="min-w-0">
                        <p class="font-bold text-gray-900 break-all">${escapeHtml(item.email || '-')}</p>
                        <p class="text-xs text-gray-500 mt-1">
                            이름: ${escapeHtml(item.display_name || '-')} · 권한: ${escapeHtml(roleLabel)} · 상태: ${escapeHtml(statusLabel)}
                        </p>
                        <p class="text-xs text-gray-400 mt-1">가입일: ${formatDateTime(item.created_at)}</p>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        ${item.role === 'head_coach' ? '<span class="px-3 py-1.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">헤드 코치</span>' : ''}
                        ${actionButton}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}


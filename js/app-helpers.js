// ER App: Helper functions — formatting, access control, file utils
// --- Helper Functions ---
function openNotices() { renderSection('notices'); }
function openNotice(id) { renderSection('notice_detail', { id }); }
function openCoachApp(hashTab) {
    var base = String(typeof COACH_APP_URL !== 'undefined' ? COACH_APP_URL : '').replace(/#.*$/, '');
    var raw = String(hashTab || '').replace(/^#/, '').trim().toLowerCase();
    var allowed = ['dashboard', 'training', 'mentoring', 'calendar', 'resources'];
    var suffix = allowed.indexOf(raw) !== -1 ? ('#' + raw) : '';
    var target = base + suffix;
    var isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '') || window.matchMedia('(max-width: 1024px)').matches;
    if (isMobile) {
        window.location.href = target || COACH_APP_URL;
        return;
    }
    window.open(target || COACH_APP_URL, '_blank', 'noopener,noreferrer');
}

/** ISO 주차 키 (YYYY-WW), 멘토링 주간 데이터와 동일 규칙 */
function getIsoWeekKey(value) {
    var date = value instanceof Date ? new Date(value.getTime()) : new Date(value || Date.now());
    if (Number.isNaN(date.getTime())) date = new Date();
    date.setHours(0, 0, 0, 0);
    var day = date.getDay();
    var diff = day === 0 ? -6 : 1 - day;
    var thursday = new Date(date);
    thursday.setDate(date.getDate() + diff + 3);
    var yearStart = new Date(thursday.getFullYear(), 0, 1);
    var weekNo = Math.ceil((((thursday - yearStart) / 86400000) + 1) / 7);
    return thursday.getFullYear() + '-' + String(weekNo).padStart(2, '0');
}

function getLocalMonday(value) {
    var d = value instanceof Date ? new Date(value.getTime()) : new Date(value || Date.now());
    if (Number.isNaN(d.getTime())) d = new Date();
    d.setHours(0, 0, 0, 0);
    var day = d.getDay();
    var diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d;
}

function parseLocalYmd(ymd) {
    var p = String(ymd || '').trim().split('-');
    if (p.length !== 3) return null;
    var y = parseInt(p[0], 10);
    var mo = parseInt(p[1], 10) - 1;
    var day = parseInt(p[2], 10);
    if (!y || mo < 0 || !day) return null;
    var d = new Date(y, mo, day, 12, 0, 0, 0);
    return Number.isNaN(d.getTime()) ? null : d;
}

/** DB week_key: 2026-C01 … (코치앱과 동일, ER_EXPERT_COHORT_MENTORING) */
function getExpertCohortMentoringWeekKey(value) {
    var cfg = typeof ER_EXPERT_COHORT_MENTORING !== 'undefined' ? ER_EXPERT_COHORT_MENTORING : window.ER_EXPERT_COHORT_MENTORING;
    if (!cfg || !cfg.week1Monday) return getIsoWeekKey(value);
    var lastWeek = Math.max(1, Math.min(52, Number(cfg.lastWeek) || 8));
    var keyYear = Number(cfg.keyYear) || null;
    var w1 = parseLocalYmd(cfg.week1Monday);
    if (!w1) return getIsoWeekKey(value);
    var w1Mon = getLocalMonday(w1);
    var d = value instanceof Date ? new Date(value.getTime()) : new Date(value || Date.now());
    if (Number.isNaN(d.getTime())) d = new Date();
    var monday = getLocalMonday(d);
    var n = Math.floor((monday.getTime() - w1Mon.getTime()) / (7 * 86400000)) + 1;
    if (n < 1) n = 1;
    if (n > lastWeek) n = lastWeek;
    var y = keyYear || w1Mon.getFullYear();
    return y + '-C' + String(n).padStart(2, '0');
}

function mentoringWeekKeysForFetch(weekKey) {
    var c = String(weekKey || getExpertCohortMentoringWeekKey()).trim();
    var leg = getIsoWeekKey();
    return c === leg ? [c] : [c, leg];
}

function dedupeMentoringRowsByMentee(rows, cohortWeekKey) {
    var c = String(cohortWeekKey || '').trim();
    var byId = {};
    (rows || []).forEach(function (row) {
        var id = String(row.mentee_id || '');
        var ex = byId[id];
        if (!ex) {
            byId[id] = row;
            return;
        }
        var rowIsC = String(row.week_key || '') === c;
        var exIsC = String(ex.week_key || '') === c;
        if (rowIsC && !exIsC) byId[id] = row;
    });
    return Object.keys(byId).map(function (k) {
        return byId[k];
    });
}

function formatWeekLabel(weekKey) {
    var key = String(weekKey || '').trim();
    if (!key) key = getExpertCohortMentoringWeekKey();
    var cohort = key.match(/^(\d{4})-C(\d{1,2})$/i);
    if (cohort) {
        var n = parseInt(cohort[2], 10);
        var cfg = typeof ER_EXPERT_COHORT_MENTORING !== 'undefined' ? ER_EXPERT_COHORT_MENTORING : window.ER_EXPERT_COHORT_MENTORING;
        var last = Math.max(1, Math.min(52, Number(cfg && cfg.lastWeek) || 8));
        if (n >= last) return '양성반 ' + last + '주차 (막주)';
        return '양성반 ' + n + '주차';
    }
    var parts = key.split('-');
    if (parts.length === 2 && /^\d{4}$/.test(parts[0]) && /^\d{2}$/.test(parts[1])) {
        return '기존 코드 ' + parts[0] + '-' + parts[1] + ' (앱에서 갱신 후 저장)';
    }
    return key;
}

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
    return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center rounded-full bg-er-dark px-3 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-er-accentDark">Join</a>`;
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
        practicum_track: 'Practicum 트랙',
        er_ministry: 'ER 사역',
        other: '기타'
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
    if (state.currentSection === 'coach_schedule' && typeof loadCoachSchedules === 'function') {
        loadCoachSchedules();
        return;
    }
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
        const dayKey = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const onClick = state.currentSection === 'coach_schedule'
            ? `openCoachScheduleDayModal('${dayKey}')`
            : `renderSection('coach_schedule')`;
        cells += `
            <button type="button" onclick="${onClick}" class="h-16 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 text-left p-2 flex flex-col justify-between">
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

function canManageCoachAdmin() {
    const email = (state.user?.email || '').toLowerCase();
    return email === NOTICE_ADMIN_EMAIL || isHeadCoach();
}

function canManageNotices() {
    const email = (state.user?.email || '').toLowerCase();
    return email === NOTICE_ADMIN_EMAIL || isHeadCoach();
}

async function loadCoachPortalDashboard() {
    if (!ensureCoachAccess() || !supabaseClient) return;
    const embeddedFrame = document.getElementById('coach-portal-embed-frame');
    if (embeddedFrame) {
        const requestedTab = String(state.currentPayload?.tab || 'dashboard').toLowerCase();
        if (typeof setDesktopCoachEmbedTab === 'function') {
            setDesktopCoachEmbedTab(requestedTab);
        } else {
            const base = (typeof window.COACH_APP_URL === 'string' && window.COACH_APP_URL) ? window.COACH_APP_URL : 'https://coach.er-coaching.com';
            embeddedFrame.src = `${base.replace(/\/$/, '')}/#${requestedTab}`;
        }
        return;
    }
    const monthStart = getCoachCalendarMonthStart();
    state.coachCalendarMonth = monthStart.toISOString();
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);
    const [taskRes, scheduleRes, materialRes, noteRes] = await Promise.all([
        supabaseClient.from('coach_tasks').select('id, title, due_at, status, created_at, created_by').order('created_at', { ascending: false }).limit(40),
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
    let tasks = taskRes.data || [];
    const authorIds = [...new Set(tasks.map((t) => t.created_by).filter(Boolean))];
    if (authorIds.length) {
        const pr = await supabaseClient.from('coach_profiles').select('user_id, display_name').in('user_id', authorIds);
        if (!pr.error && pr.data) {
            const map = Object.fromEntries(pr.data.map((p) => [p.user_id, p.display_name]));
            tasks = tasks.map((t) => Object.assign({}, t, { author_display_name: map[t.created_by] || '코치' }));
        }
    }
    const peerBannerEl = document.getElementById('coach-peer-reports-banner');
    if (peerBannerEl && state.user) {
        const cutoff = Date.now() - 14 * 86400000;
        const peerTasks = tasks.filter((t) => t.created_at && String(t.created_by) !== String(state.user.id) && new Date(t.created_at).getTime() >= cutoff)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        if (peerTasks.length) {
            const top = peerTasks[0];
            peerBannerEl.classList.remove('hidden');
            peerBannerEl.innerHTML = `
                <div class="flex flex-col gap-1 pr-2">
                    <p class="text-sm font-bold text-er-dark">다른 코치의 새 보고서 ${peerTasks.length}건 (최근 14일)</p>
                    <p class="text-xs text-gray-600 break-keep">최신: ${escapeHtml(top.author_display_name || '코치')} — ${escapeHtml(top.title)}</p>
                    <p class="text-[11px] text-er-accent font-bold">탭하면 전체 보고서 목록으로 이동합니다</p>
                </div>`;
            peerBannerEl.onclick = function () { renderSection('coach_tasks'); };
            peerBannerEl.onkeydown = function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    renderSection('coach_tasks');
                }
            };
        } else {
            peerBannerEl.classList.add('hidden');
            peerBannerEl.innerHTML = '';
            peerBannerEl.onclick = null;
            peerBannerEl.onkeydown = null;
        }
    }
    const tasksPreview = tasks.slice(0, 5);
    const schedules = scheduleRes.data || [];
    const materialCount = materialRes.data ? materialRes.data.length : 0;
    const notes = noteRes.data || [];
    renderCoachCalendar(monthStart, calendarSchedules || []);

    const summaryEl = document.getElementById('coach-portal-summary');
    if (summaryEl) {
        summaryEl.innerHTML = `
            <button type="button" onclick="renderSection('coach_tasks')" class="text-left bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-soft transition-shadow">
                <p class="text-xs text-gray-400">전체 보고서(최근)</p>
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
        tasksEl.innerHTML = tasksPreview.length
            ? tasksPreview.map((task) => `
                <button type="button" onclick="openCoachTaskFromDashboard('${task.id}')" class="w-full text-left p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                    <p class="font-semibold text-gray-800">${escapeHtml(task.title)}</p>
                    <p class="text-xs text-gray-500 mt-1">${task.author_display_name ? escapeHtml(task.author_display_name) + ' · ' : ''}마감: ${formatDateTime(task.due_at)} · 상태: ${escapeHtml(task.status)}</p>
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

    if (isHeadCoach()) {
        await loadCoachAdminOverview();
    }
}

async function loadCoachAdminOverview() {
    const sectionEl = document.getElementById('coach-admin-overview-section');
    const listEl = document.getElementById('coach-admin-overview-list');
    if (!sectionEl || !listEl) return;
    if (!canManageCoachAdmin() || !supabaseClient) {
        sectionEl.classList.add('hidden');
        return;
    }

    sectionEl.classList.remove('hidden');
    listEl.innerHTML = renderListSkeleton(4);

    const settled = await Promise.allSettled([
        supabaseClient.from('coach_profiles').select('user_id, display_name, role, is_active'),
        supabaseClient.from('coach_tasks').select('id, created_by'),
        supabaseClient.from('coach_schedules').select('id, created_by'),
        supabaseClient.from('coach_session_notes').select('id, uploaded_by'),
        supabaseClient.from('coach_training_progress').select('id, coach_user_id, completion_percent'),
        supabaseClient.from('coach_mentoring_followups').select('id, coach_user_id, status')
    ]);

    const profilesRes = settled[0].status === 'fulfilled' ? settled[0].value : null;
    if (!profilesRes || profilesRes.error) {
        listEl.innerHTML = `<p class="text-red-500 text-xs">관리자 통계 로딩 실패: ${escapeHtml(profilesRes?.error?.message || 'coach_profiles 조회 실패')}</p>`;
        return;
    }

    const tasks = settled[1].status === 'fulfilled' && !settled[1].value.error ? (settled[1].value.data || []) : [];
    const schedules = settled[2].status === 'fulfilled' && !settled[2].value.error ? (settled[2].value.data || []) : [];
    const notes = settled[3].status === 'fulfilled' && !settled[3].value.error ? (settled[3].value.data || []) : [];
    const training = settled[4].status === 'fulfilled' && !settled[4].value.error ? (settled[4].value.data || []) : [];
    const followups = settled[5].status === 'fulfilled' && !settled[5].value.error ? (settled[5].value.data || []) : [];

    const activeCoaches = (profilesRes.data || []).filter((p) => p.is_active);
    const rows = activeCoaches.map((coach) => {
        const userId = coach.user_id;
        const taskCount = tasks.filter((t) => t.created_by === userId).length;
        const scheduleCount = schedules.filter((s) => s.created_by === userId).length;
        const noteCount = notes.filter((n) => n.uploaded_by === userId).length;
        const coachTraining = training.filter((t) => t.coach_user_id === userId);
        const avgProgress = coachTraining.length
            ? Math.round(coachTraining.reduce((sum, item) => sum + Number(item.completion_percent || 0), 0) / coachTraining.length)
            : null;
        const coachFollowups = followups.filter((f) => f.coach_user_id === userId);
        const openFollowups = coachFollowups.filter((f) => String(f.status || '').toLowerCase() !== 'done').length;
        return {
            name: coach.display_name || '이름 미등록',
            role: coach.role === 'head_coach' ? '헤드 코치' : '코치',
            taskCount,
            scheduleCount,
            noteCount,
            avgProgress,
            openFollowups
        };
    });

    if (!rows.length) {
        listEl.innerHTML = '<p class="text-sm text-gray-500">활성 코치 데이터가 없습니다.</p>';
        return;
    }

    listEl.innerHTML = rows.map((row) => `
        <div class="border border-gray-100 rounded-2xl p-4">
            <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <p class="font-bold text-gray-900">${escapeHtml(row.name)}</p>
                    <p class="text-xs text-gray-500 mt-1">${escapeHtml(row.role)}</p>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                    <div class="rounded-xl bg-gray-50 px-3 py-2">
                        <p class="text-gray-400">보고서</p>
                        <p class="text-base font-bold text-er-dark">${row.taskCount}</p>
                    </div>
                    <div class="rounded-xl bg-gray-50 px-3 py-2">
                        <p class="text-gray-400">일정</p>
                        <p class="text-base font-bold text-er-dark">${row.scheduleCount}</p>
                    </div>
                    <div class="rounded-xl bg-gray-50 px-3 py-2">
                        <p class="text-gray-400">노트</p>
                        <p class="text-base font-bold text-er-dark">${row.noteCount}</p>
                    </div>
                    <div class="rounded-xl bg-gray-50 px-3 py-2">
                        <p class="text-gray-400">훈련진행</p>
                        <p class="text-base font-bold text-er-dark">${row.avgProgress === null ? '-' : `${row.avgProgress}%`}</p>
                    </div>
                    <div class="rounded-xl bg-gray-50 px-3 py-2">
                        <p class="text-gray-400">멘토링 후속</p>
                        <p class="text-base font-bold ${row.openFollowups > 0 ? 'text-amber-700' : 'text-er-dark'}">${row.openFollowups}</p>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

async function loadCoachAdminUsers() {
    if (!ensureCoachAccess() || !canManageCoachAdmin() || !supabaseClient) return;
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

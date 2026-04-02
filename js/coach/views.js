// ER Coach: Portal view renderers
function renderCoachPortal() {
    if (!state.user) return renderCoachAccessDenied('로그인 후 코치 포털을 사용할 수 있습니다.');
    if (!state.isCoach) return renderCoachAccessDenied();
    const coachAppUrl = typeof window.COACH_APP_URL === 'string' && window.COACH_APP_URL
        ? window.COACH_APP_URL
        : 'https://coach.er-coaching.com';
    const adminButton = state.coachProfile?.role === 'head_coach'
        ? `<button onclick="renderSection('coach_admin')" class="px-4 py-2 rounded-full text-xs font-bold bg-white border border-gray-200 text-gray-700">코치 승인</button>`
        : '';
    return `
        <div class="bg-er-base min-h-screen py-8 md:py-10 px-4 sm:px-6 lg:px-8">
            <div class="max-w-7xl mx-auto space-y-5">
                <div class="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-soft">
                    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <p class="text-xs tracking-[0.2em] text-er-accent font-bold uppercase">Coach Portal</p>
                            <h2 class="text-2xl md:text-3xl font-bold text-er-dark mt-1">코치 포털 (데스크탑)</h2>
                            <p class="text-sm text-gray-500 mt-2">${state.coachProfile?.display_name || state.user.email || ''}님, 코치앱과 동일한 기능(훈련·멘토링·일정·자료)을 여기서 바로 사용하세요.</p>
                        </div>
                        <div class="flex flex-wrap gap-2 items-center">
                            ${adminButton}
                            <button data-desktop-embed-tab="dashboard" onclick="setDesktopCoachEmbedTab('dashboard')" class="px-4 py-2 rounded-full text-xs font-bold bg-er-dark text-white">홈</button>
                            <button data-desktop-embed-tab="training" onclick="setDesktopCoachEmbedTab('training')" class="px-4 py-2 rounded-full text-xs font-bold bg-white border border-gray-200 text-gray-700">훈련</button>
                            <button data-desktop-embed-tab="mentoring" onclick="setDesktopCoachEmbedTab('mentoring')" class="px-4 py-2 rounded-full text-xs font-bold bg-white border border-gray-200 text-gray-700">멘토링</button>
                            <button data-desktop-embed-tab="calendar" onclick="setDesktopCoachEmbedTab('calendar')" class="px-4 py-2 rounded-full text-xs font-bold bg-white border border-gray-200 text-gray-700">일정</button>
                            <button data-desktop-embed-tab="resources" onclick="setDesktopCoachEmbedTab('resources')" class="px-4 py-2 rounded-full text-xs font-bold bg-white border border-gray-200 text-gray-700">자료</button>
                            <a href="${coachAppUrl}" target="_blank" rel="noopener noreferrer" class="px-4 py-2 rounded-full text-xs font-bold bg-white border border-er-accent/30 text-er-dark">새 창에서 열기</a>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-3xl border border-gray-100 shadow-soft p-3 md:p-4">
                    <iframe
                        id="coach-portal-embed-frame"
                        title="ER Coach App Desktop Embed"
                        src="${coachAppUrl}/#dashboard"
                        loading="lazy"
                        class="w-full rounded-2xl border border-gray-100"
                        style="height:calc(100vh - 260px); min-height:780px;"
                    ></iframe>
                </div>
            </div>
        </div>
    `;
}

function renderCoachAdmin() {
    if (!state.user) return renderCoachAccessDenied('로그인 후 코치 승인 기능을 사용할 수 있습니다.');
    if (!state.isCoach || state.coachProfile?.role !== 'head_coach') {
        return renderCoachAccessDenied('헤드 코치만 코치 승인 기능을 사용할 수 있습니다.');
    }
    return `
        <div class="bg-white min-h-screen py-10 px-4 sm:px-6 lg:px-8">
            <div class="max-w-6xl mx-auto space-y-6">
                <div class="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 class="text-2xl font-bold text-er-dark">코치 승인</h2>
                        <p class="text-sm text-gray-500 mt-1">가입한 계정을 코치로 승인하거나 비활성화할 수 있습니다.</p>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="renderSection('coach_portal')" class="px-4 py-2 rounded-full text-xs font-bold bg-gray-100 text-gray-700">대시보드</button>
                        <button onclick="loadCoachAdminUsers()" class="px-4 py-2 rounded-full text-xs font-bold bg-er-dark text-white">새로고침</button>
                    </div>
                </div>
                <div class="bg-white border border-gray-100 rounded-3xl p-6">
                    <h3 class="text-base font-bold text-er-dark mb-4">가입자 목록</h3>
                    <div id="coach-admin-users-list" class="space-y-3 text-sm text-gray-500">${renderListSkeleton(4)}</div>
                </div>
            </div>
        </div>
    `;
}

function renderCoachTasks() {
    if (!state.user) return renderCoachAccessDenied('로그인 후 훈련 기록 기능을 사용할 수 있습니다.');
    if (!state.isCoach) return renderCoachAccessDenied();
    return `
        <div class="bg-white min-h-screen py-10 px-4 sm:px-6 lg:px-8">
            <div class="max-w-6xl mx-auto space-y-6">
                <div class="flex flex-wrap items-center justify-between gap-3">
                    <h2 class="text-2xl font-bold text-er-dark">훈련 관리</h2>
                    <div class="flex gap-2">
                        <button onclick="renderSection('coach_portal')" class="px-4 py-2 rounded-full text-xs font-bold bg-gray-100 text-gray-700">대시보드</button>
                        <button id="coach-task-toggle-btn" onclick="openCoachTaskModal()" class="px-4 py-2 rounded-full text-xs font-bold border border-er-dark text-er-dark bg-white">훈련 기록 등록</button>
                        <button onclick="loadCoachTasks()" class="px-4 py-2 rounded-full text-xs font-bold bg-er-dark text-white">새로고침</button>
                    </div>
                </div>
                <div class="bg-white border border-gray-100 rounded-3xl p-6">
                    <div class="flex items-center justify-between gap-3 mb-4">
                        <h3 class="text-base font-bold text-er-dark">Typing 보고서</h3>
                        <button onclick="openCoachTypingPracticumModal()" class="px-4 py-2 rounded-full text-xs font-bold bg-er-dark text-white">이번 달 보고서 제출</button>
                    </div>
                    <div id="coach-typing-practicum-list" class="space-y-3 text-sm text-gray-500">${renderListSkeleton(3)}</div>
                    <div id="coach-typing-practicum-detail" class="hidden mt-6 border border-gray-100 rounded-2xl p-4 md:p-5 bg-gray-50/50"></div>
                </div>
                <div class="bg-white border border-gray-100 rounded-3xl p-6">
                    <h3 class="text-base font-bold text-er-dark mb-4">훈련 기록 목록</h3>
                    <div id="coach-tasks-list" class="space-y-3 text-sm text-gray-500">${renderListSkeleton(4)}</div>
                    <div id="coach-task-detail" class="hidden mt-6 border border-gray-100 rounded-2xl p-4 md:p-5 bg-gray-50/50"></div>
                </div>
            </div>
        </div>
        <div id="coach-typing-practicum-modal" class="hidden fixed inset-0 z-[80] bg-black/50 px-4">
            <div class="min-h-full flex items-center justify-center">
                <div class="w-full max-w-3xl bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-2xl relative">
                    <button type="button" onclick="closeCoachTypingPracticumModal()" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100" aria-label="닫기">
                        <i class="fas fa-times text-sm"></i>
                    </button>
                    <form id="coach-typing-practicum-form" onsubmit="submitCoachTypingPracticum(event)" class="space-y-4">
                        <div class="flex items-center justify-between gap-3">
                            <h3 id="coach-typing-practicum-form-title" class="text-base font-bold text-er-dark">Typing 보고서 제출</h3>
                            <button type="button" id="coach-typing-practicum-cancel-btn" onclick="resetCoachTypingPracticumForm()" class="hidden px-3 py-1.5 rounded-full text-[11px] font-bold border border-gray-200 text-gray-700 hover:bg-gray-50">수정 취소</button>
                        </div>
                        <input type="hidden" name="report_id" value="">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input name="participant_name" required maxlength="80" placeholder="외부인 이름" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm">
                            <select name="participant_gender" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm">
                                <option value="">성별 선택</option>
                                <option value="남">남</option>
                                <option value="여">여</option>
                                <option value="기타">기타</option>
                            </select>
                            <select name="enneagram_base" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm">
                                <option value="">기본유형 선택</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                                <option value="6">6</option>
                                <option value="7">7</option>
                                <option value="8">8</option>
                                <option value="9">9</option>
                            </select>
                            <select name="subtype_primary" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm">
                                <option value="">하위유형 선택</option>
                                <option value="SP">SP</option>
                                <option value="SO">SO</option>
                                <option value="SX">SX</option>
                            </select>
                            <select name="wing" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm">
                                <option value="">윙 선택</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                                <option value="6">6</option>
                                <option value="7">7</option>
                                <option value="8">8</option>
                                <option value="9">9</option>
                            </select>
                            <input name="session_date" type="date" required class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm">
                            <input name="session_time_text" type="time" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm">
                            <input name="youtube_url" type="url" required placeholder="YouTube 링크" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm md:col-span-2">
                        </div>
                        <textarea name="report_body" rows="4" placeholder="보고서 본문 요약 (첨부가 없으면 필수)" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"></textarea>
                        <div class="space-y-2">
                            <input name="file" type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.png,.jpg,.jpeg,.webp,.hwp,.hwpx,.zip" class="w-full rounded-xl border border-dashed border-gray-300 bg-white px-4 py-3 text-xs">
                            <label class="hidden items-center gap-2 text-xs text-gray-500" id="coach-typing-practicum-remove-attachment-row">
                                <input name="remove_attachment" type="checkbox" value="true">
                                <span>기존 첨부 삭제</span>
                            </label>
                        </div>
                        <div id="coach-typing-practicum-review-field" class="${state.coachProfile?.role === 'head_coach' ? '' : 'hidden'}">
                            <select name="review_status" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm">
                                <option value="pending">리뷰 대기</option>
                                <option value="selected">리뷰 선정</option>
                                <option value="reviewed">피드백 완료</option>
                            </select>
                        </div>
                        <p class="text-xs text-gray-500">월 1회 외부인 1명 세션을 기록하고, 보고서는 첨부 파일 또는 본문 텍스트 중 하나로 제출합니다.</p>
                        <button id="coach-typing-practicum-submit-btn" type="submit" class="px-6 py-2 rounded-full text-xs font-bold bg-er-dark text-white">Typing 보고서 저장</button>
                    </form>
                </div>
            </div>
        </div>
        <div id="coach-task-modal" class="hidden fixed inset-0 z-[80] bg-black/50 px-4">
            <div class="min-h-full flex items-center justify-center">
                <div class="w-full max-w-2xl bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-2xl relative">
                    <button type="button" onclick="closeCoachTaskModal()" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100" aria-label="닫기">
                        <i class="fas fa-times text-sm"></i>
                    </button>
                    <form id="coach-task-form" onsubmit="submitCoachTask(event)" class="space-y-4">
                        <div class="flex items-center justify-between gap-3">
                            <h3 id="coach-task-form-title" class="text-base font-bold text-er-dark">새 훈련 기록 등록</h3>
                            <button type="button" id="coach-task-cancel-btn" onclick="resetCoachTaskForm()" class="hidden px-3 py-1.5 rounded-full text-[11px] font-bold border border-gray-200 text-gray-700 hover:bg-gray-50">수정 취소</button>
                        </div>
                        <input type="hidden" name="task_id" value="">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input name="title" required maxlength="120" placeholder="훈련 기록 제목" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm">
                            <input name="due_at" type="datetime-local" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm">
                            <input name="week_label" placeholder="주차 (예: 2026-W10)" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm">
                            <select name="status" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm">
                                <option value="published">게시</option>
                                <option value="draft">임시저장</option>
                                <option value="archived">보관</option>
                            </select>
                        </div>
                        <textarea name="description" rows="3" placeholder="훈련 기록 설명" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"></textarea>
                        <input name="files" type="file" multiple accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv,.zip,.hwp,.hwpx,.png,.jpg,.jpeg,.webp,.gif,.mp4,.mov,.mp3,.wav,.m4a" class="w-full rounded-xl border border-dashed border-gray-300 bg-white px-4 py-3 text-xs">
                        <button id="coach-task-submit-btn" type="submit" class="px-6 py-2 rounded-full text-xs font-bold bg-er-dark text-white">훈련 기록 저장</button>
                    </form>
                </div>
            </div>
        </div>
    `;
}

function renderCoachMaterials() {
    if (!state.user) return renderCoachAccessDenied('로그인 후 자료실 기능을 사용할 수 있습니다.');
    if (!state.isCoach) return renderCoachAccessDenied();
    return `
        <div class="bg-white min-h-screen py-10 px-4 sm:px-6 lg:px-8">
            <div class="max-w-6xl mx-auto space-y-6">
                <div class="flex flex-wrap items-center justify-between gap-3">
                    <h2 class="text-2xl font-bold text-er-dark">코치 자료실</h2>
                    <div class="flex gap-2">
                        <button onclick="renderSection('coach_portal')" class="px-4 py-2 rounded-full text-xs font-bold bg-gray-100 text-gray-700">대시보드</button>
                        <button id="coach-material-toggle-btn" onclick="openCoachMaterialModal()" class="px-4 py-2 rounded-full text-xs font-bold border border-er-dark text-er-dark bg-white">자료 업로드</button>
                        <button onclick="loadCoachMaterials()" class="px-4 py-2 rounded-full text-xs font-bold bg-er-dark text-white">새로고침</button>
                    </div>
                </div>
                <div class="bg-white border border-gray-100 rounded-3xl p-6">
                    <h3 class="text-base font-bold text-er-dark mb-4">자료 카테고리</h3>
                    <div id="coach-materials-list" class="space-y-3 text-sm text-gray-500">${renderListSkeleton(4)}</div>
                    <div id="coach-material-detail" class="hidden mt-6 border border-gray-100 rounded-2xl p-4 md:p-5 bg-gray-50/50"></div>
                </div>
                <div id="coach-material-modal" class="hidden fixed inset-0 z-[80] bg-black/50 px-4">
                    <div class="min-h-full flex items-center justify-center">
                        <div class="w-full max-w-2xl bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-2xl relative">
                            <button type="button" onclick="closeCoachMaterialModal()" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100" aria-label="닫기">
                                <i class="fas fa-times text-sm"></i>
                            </button>
                            <form id="coach-material-form" onsubmit="submitCoachMaterial(event)" class="space-y-4">
                                <div class="flex items-center justify-between gap-3">
                                    <h3 id="coach-material-form-title" class="text-base font-bold text-er-dark">자료 업로드</h3>
                                    <button type="button" id="coach-material-cancel-btn" onclick="resetCoachMaterialForm()" class="hidden px-3 py-1.5 rounded-full text-[11px] font-bold border border-gray-200 text-gray-700 hover:bg-gray-50">수정 취소</button>
                                </div>
                                <input type="hidden" name="material_id" value="">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input name="title" required maxlength="120" placeholder="자료 제목" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm">
                                    <select name="category_main" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm">
                                        <option value="general">일반</option>
                                        <option value="study_track">Study 트랙</option>
                                        <option value="spiritual_formation_track">Spiritual Formation 트랙</option>
                                        <option value="coaching_track">Coaching 트랙</option>
                                        <option value="practicum_track">Practicum 트랙</option>
                                        <option value="reference">참고자료</option>
                                    </select>
                                    <input name="category_folder" placeholder="폴더명 (선택, 예: Week1)" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm md:col-span-2">
                                    <input name="category" value="general" class="hidden">
                                </div>
                                <textarea name="description" rows="3" placeholder="자료 설명" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"></textarea>
                                <input name="file" type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv,.zip,.hwp,.hwpx,.png,.jpg,.jpeg,.webp,.gif,.mp4,.mov,.mp3,.wav,.m4a" class="w-full rounded-xl border border-dashed border-gray-300 bg-white px-4 py-3 text-xs">
                                <button id="coach-material-submit-btn" type="submit" class="px-6 py-2 rounded-full text-xs font-bold bg-er-dark text-white">자료 업로드</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderCoachSchedule() {
    if (!state.user) return renderCoachAccessDenied('로그인 후 일정 관리 기능을 사용할 수 있습니다.');
    if (!state.isCoach) return renderCoachAccessDenied();
    return `
        <div class="bg-white min-h-screen py-10 px-4 sm:px-6 lg:px-8">
            <div class="max-w-6xl mx-auto space-y-6">
                <div class="flex flex-wrap items-center justify-between gap-3">
                    <h2 class="text-2xl font-bold text-er-dark">주간 일정</h2>
                    <div class="flex gap-2">
                        <button onclick="renderSection('coach_portal')" class="px-4 py-2 rounded-full text-xs font-bold bg-gray-100 text-gray-700">대시보드</button>
                        <button onclick="loadCoachSchedules()" class="px-4 py-2 rounded-full text-xs font-bold bg-er-dark text-white">새로고침</button>
                    </div>
                </div>
                <div class="bg-white border border-gray-100 rounded-3xl p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-base font-bold text-er-dark">월간 일정 캘린더</h3>
                        <div class="flex items-center gap-2">
                            <button onclick="changeCoachCalendarMonth(-1)" class="w-8 h-8 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50"><i class="fas fa-chevron-left text-xs"></i></button>
                            <p id="coach-calendar-month-label" class="text-sm font-semibold text-gray-700 min-w-[88px] text-center">-</p>
                            <button onclick="changeCoachCalendarMonth(1)" class="w-8 h-8 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50"><i class="fas fa-chevron-right text-xs"></i></button>
                        </div>
                    </div>
                    <div id="coach-calendar-grid" class="text-sm text-gray-500 mb-6">${renderListSkeleton(2)}</div>
                </div>
                <div class="bg-white border border-gray-100 rounded-3xl p-6">
                    <div class="flex items-center justify-between gap-3 mb-4">
                        <h3 class="text-base font-bold text-er-dark">다가오는 일정</h3>
                        <button onclick="openScheduleModal()" class="px-4 py-2 rounded-full text-xs font-bold bg-er-dark text-white">일정등록</button>
                    </div>
                    <div id="coach-schedules-list" class="space-y-3 text-sm text-gray-500">${renderListSkeleton(4)}</div>
                </div>
            </div>
        </div>
        <div id="coach-schedule-modal" class="hidden fixed inset-0 z-[80] bg-black/50 px-4">
            <div class="min-h-full flex items-center justify-center">
                <div class="w-full max-w-2xl bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-2xl relative">
                    <button type="button" onclick="closeScheduleModal()" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100" aria-label="닫기">
                        <i class="fas fa-times text-sm"></i>
                    </button>
                    <h3 class="text-base font-bold text-er-dark mb-4">일정 등록</h3>
                    <form onsubmit="submitCoachSchedule(event)" class="space-y-4">
                        <input type="hidden" name="schedule_id">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input name="title" required maxlength="120" placeholder="일정 제목" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm">
                            <select name="schedule_type" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm">
                                <option value="study_track">Study 트랙</option>
                                <option value="spiritual_formation_track">Spiritual Formation 트랙</option>
                                <option value="coaching_track">Coaching 트랙</option>
                                <option value="practicum_track">Practicum 트랙</option>
                                <option value="er_ministry">ER 사역</option>
                                <option value="other">기타</option>
                            </select>
                            <input name="start_at" type="datetime-local" required class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm">
                            <input name="end_at" type="datetime-local" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm">
                            <input name="location" placeholder="장소 / 온라인 링크" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm md:col-span-2">
                        </div>
                        <textarea name="notes" rows="2" placeholder="메모" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"></textarea>
                        <button type="submit" class="px-6 py-2 rounded-full text-xs font-bold bg-er-dark text-white">일정 저장</button>
                    </form>
                </div>
            </div>
        </div>
        <div id="coach-schedule-day-modal" class="hidden fixed inset-0 z-[80] bg-black/50 px-4">
            <div class="min-h-full flex items-center justify-center">
                <div class="w-full max-w-3xl bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-2xl relative">
                    <button type="button" onclick="closeCoachScheduleDayModal()" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100" aria-label="닫기">
                        <i class="fas fa-times text-sm"></i>
                    </button>
                    <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <div>
                            <h3 id="coach-schedule-day-title" class="text-base font-bold text-er-dark">선택한 날짜 일정</h3>
                            <p class="text-xs text-gray-500 mt-1">이 날짜의 일정을 확인하고 바로 추가/수정할 수 있습니다.</p>
                        </div>
                        <button type="button" onclick="openScheduleModalForSelectedDay()" class="px-4 py-2 rounded-full text-xs font-bold bg-er-dark text-white">이 날짜에 일정등록</button>
                    </div>
                    <div id="coach-schedule-day-list" class="space-y-3 text-sm text-gray-500">${renderListSkeleton(2)}</div>
                </div>
            </div>
        </div>
    `;
}

function renderCoachNotes() {
    if (!state.user) return renderCoachAccessDenied('로그인 후 일정 세션 노트 기능을 사용할 수 있습니다.');
    if (!state.isCoach) return renderCoachAccessDenied();
    return `
        <div class="bg-white min-h-screen py-10 px-4 sm:px-6 lg:px-8">
            <div class="max-w-6xl mx-auto space-y-6">
                <div class="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 class="text-2xl font-bold text-er-dark">일정 세션 노트</h2>
                        <p class="text-sm text-gray-500 mt-2 max-w-3xl">코치 앱 <strong>자료</strong> 탭의 세션 노트와 같은 데이터입니다. <strong>캘린더에 등록된 훈련·스터디 일정</strong>을 선택해 그 모임에 대한 메모·첨부를 남깁니다.</p>
                        <p class="text-sm text-gray-500 mt-1 max-w-3xl">멘티와의 멘토링 주간 보고·후속 과제는 <button type="button" onclick="renderSection('coach_mentoring')" class="text-er-accent font-bold underline-offset-2 hover:underline">멘토링 허브</button>에서 확인하세요.</p>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        <button onclick="renderSection('coach_portal')" class="px-4 py-2 rounded-full text-xs font-bold bg-gray-100 text-gray-700">대시보드</button>
                        <button onclick="renderSection('coach_mentoring')" class="px-4 py-2 rounded-full text-xs font-bold border border-gray-200 text-gray-700 bg-white">멘토링 허브</button>
                        <button id="coach-note-toggle-btn" onclick="openCoachNoteModal()" class="px-4 py-2 rounded-full text-xs font-bold border border-er-dark text-er-dark bg-white">세션 노트 등록</button>
                        <button onclick="loadCoachNotes()" class="px-4 py-2 rounded-full text-xs font-bold bg-er-dark text-white">새로고침</button>
                    </div>
                </div>
                <div class="bg-white border border-gray-100 rounded-3xl p-6">
                    <h3 class="text-base font-bold text-er-dark mb-4">세션 노트 목록</h3>
                    <div id="coach-notes-list" class="space-y-3 text-sm text-gray-500">${renderListSkeleton(4)}</div>
                    <div id="coach-note-detail" class="hidden mt-6 border border-gray-100 rounded-2xl p-4 md:p-5 bg-gray-50/50"></div>
                </div>
            </div>
        </div>
        <div id="coach-note-modal" class="hidden fixed inset-0 z-[80] bg-black/50 px-4">
            <div class="min-h-full flex items-center justify-center">
                <div class="w-full max-w-2xl bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-2xl relative">
                    <button type="button" onclick="closeCoachNoteModal()" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100" aria-label="닫기">
                        <i class="fas fa-times text-sm"></i>
                    </button>
                    <form id="coach-note-form" onsubmit="submitCoachNote(event)" class="space-y-4">
                        <h3 class="text-base font-bold text-er-dark">일정 세션 노트 등록</h3>
                        <p class="text-xs text-gray-500">일정은 주간 일정 화면에서 관리합니다. 목록에 없으면 먼저 일정을 등록해 주세요.</p>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <select name="schedule_id" required class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm">
                                <option value="">연결할 일정을 선택해 주세요</option>
                            </select>
                            <input name="title" required maxlength="120" placeholder="노트 제목" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm">
                        </div>
                        <textarea name="note_body" rows="4" required placeholder="이 일정에서 다룬 내용, 과제, 인사이트 등을 정리해 주세요." class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"></textarea>
                        <input name="file" type="file" accept=".pdf,.doc,.docx,.txt,.csv,.png,.jpg,.jpeg,.webp,.gif,.mp4,.mov,.mp3,.wav,.m4a" class="w-full rounded-xl border border-dashed border-gray-300 bg-white px-4 py-3 text-xs">
                        <button type="submit" class="px-6 py-2 rounded-full text-xs font-bold bg-er-dark text-white">세션 노트 저장</button>
                    </form>
                </div>
            </div>
        </div>
    `;
}

function renderCoachMentoring() {
    if (!state.user) return renderCoachAccessDenied('로그인 후 멘토링 허브를 이용할 수 있습니다.');
    if (!state.isCoach) return renderCoachAccessDenied();
    return `
        <div class="bg-white min-h-screen py-10 px-4 sm:px-6 lg:px-8">
            <div class="max-w-6xl mx-auto space-y-6">
                <div class="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 class="text-2xl font-bold text-er-dark">멘토링 허브</h2>
                        <p class="text-sm text-gray-500 mt-1">멘티·후속 과제·주간 체크리스트·훈련 진행률을 코치 앱 <strong>멘토링</strong> 탭과 같은 데이터로 다룹니다. 캘린더 일정에 붙는 메모는 코치 앱 <strong>자료</strong> 탭의 세션 노트와 같으며, <button type="button" onclick="renderSection('coach_notes')" class="text-er-accent font-bold underline-offset-2 hover:underline">일정 세션 노트</button> 화면에서도 작성할 수 있습니다.</p>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        <button onclick="renderSection('coach_portal')" class="px-4 py-2 rounded-full text-xs font-bold bg-gray-100 text-gray-700">대시보드</button>
                        <button onclick="openCoachApp('mentoring')" class="px-4 py-2 rounded-full text-xs font-bold bg-er-dark text-white">앱 · 멘토링</button>
                        <button onclick="openCoachApp('training')" class="px-4 py-2 rounded-full text-xs font-bold border border-er-dark text-er-dark bg-white">앱 · 훈련</button>
                        <button onclick="loadCoachMentoringHub()" class="px-4 py-2 rounded-full text-xs font-bold bg-gray-800 text-white">새로고침</button>
                    </div>
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="border border-gray-100 rounded-3xl p-6">
                        <h3 class="text-base font-bold text-er-dark mb-3">이번 달 훈련 진행</h3>
                        <div id="coach-hub-training" class="text-sm text-gray-500">${renderListSkeleton(3)}</div>
                    </div>
                    <div class="border border-gray-100 rounded-3xl p-6">
                        <h3 class="text-base font-bold text-er-dark mb-3">멘티 (${escapeHtml(formatWeekLabel(getExpertCohortMentoringWeekKey()))})</h3>
                        <div id="coach-hub-mentees" class="text-sm text-gray-500">${renderListSkeleton(3)}</div>
                    </div>
                    <div class="border border-gray-100 rounded-3xl p-6 lg:col-span-2">
                        <h3 class="text-base font-bold text-er-dark mb-3">멘토링 후속 과제</h3>
                        <div id="coach-hub-followups" class="text-sm text-gray-500">${renderListSkeleton(2)}</div>
                    </div>
                    <div class="border border-gray-100 rounded-3xl p-6 lg:col-span-2">
                        <h3 class="text-base font-bold text-er-dark mb-3">이번 주 체크리스트 · 인사이트</h3>
                        <div id="coach-hub-weekly" class="text-sm text-gray-500">${renderListSkeleton(2)}</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ER Coach: Portal view renderers
function renderCoachPortal() {
    if (!state.user) return renderCoachAccessDenied('로그인 후 코치 포털을 사용할 수 있습니다.');
    if (!state.isCoach) return renderCoachAccessDenied();
    const adminButton = state.coachProfile?.role === 'head_coach'
        ? `<button onclick="renderSection('coach_admin')" class="px-4 py-2 rounded-full text-xs font-bold bg-white border border-gray-200 text-gray-700">코치 승인</button>`
        : '';
    return `
        <div class="bg-er-base min-h-screen py-10 md:py-14 px-4 sm:px-6 lg:px-8">
            <div class="max-w-6xl mx-auto space-y-6">
                <div class="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-soft">
                    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <p class="text-xs tracking-[0.2em] text-er-accent font-bold uppercase">Coach Portal</p>
                            <h2 class="text-2xl md:text-3xl font-bold text-er-dark mt-1">코치 전용 대시보드</h2>
                            <p class="text-sm text-gray-500 mt-2">${state.coachProfile?.display_name || state.user.email || ''}님, 이번 주 일정을 확인하고 보고서를 관리하세요.</p>
                        </div>
                        <div class="flex flex-wrap gap-2">
                            ${adminButton}
                            <button onclick="openCoachApp()" class="px-4 py-2 rounded-full text-xs font-bold bg-white border border-er-accent/30 text-er-dark">Coach App</button>
                            <button onclick="renderSection('coach_tasks')" class="px-4 py-2 rounded-full text-xs font-bold bg-er-dark text-white">보고서 관리</button>
                            <button onclick="renderSection('coach_notes')" class="px-4 py-2 rounded-full text-xs font-bold bg-white border border-gray-200 text-gray-700">세션 노트</button>
                            <button onclick="renderSection('coach_materials')" class="px-4 py-2 rounded-full text-xs font-bold bg-white border border-gray-200 text-gray-700">자료실</button>
                            <button onclick="renderSection('coach_schedule')" class="px-4 py-2 rounded-full text-xs font-bold bg-white border border-gray-200 text-gray-700">주간 일정</button>
                        </div>
                    </div>
                </div>
                <div id="coach-portal-summary" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    ${renderMetricSkeleton(4)}
                </div>
                <div class="bg-white rounded-3xl border border-gray-100 p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="font-bold text-er-dark">월간 일정 캘린더</h3>
                        <div class="flex items-center gap-2">
                            <button onclick="changeCoachCalendarMonth(-1)" class="w-8 h-8 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50"><i class="fas fa-chevron-left text-xs"></i></button>
                            <p id="coach-calendar-month-label" class="text-sm font-semibold text-gray-700 min-w-[88px] text-center">-</p>
                            <button onclick="changeCoachCalendarMonth(1)" class="w-8 h-8 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50"><i class="fas fa-chevron-right text-xs"></i></button>
                        </div>
                    </div>
                    <div id="coach-calendar-grid" class="text-sm text-gray-500">${renderListSkeleton(2)}</div>
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div class="bg-white rounded-3xl border border-gray-100 p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="font-bold text-er-dark">최근 보고서</h3>
                            <button onclick="renderSection('coach_tasks')" class="text-xs text-er-accent font-bold">전체 보기</button>
                        </div>
                        <div id="coach-portal-tasks" class="space-y-2 text-sm text-gray-500">${renderListSkeleton(2)}</div>
                    </div>
                    <div class="bg-white rounded-3xl border border-gray-100 p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="font-bold text-er-dark">이번 주 일정</h3>
                            <button onclick="renderSection('coach_schedule')" class="text-xs text-er-accent font-bold">전체 보기</button>
                        </div>
                        <div id="coach-portal-schedules" class="space-y-2 text-sm text-gray-500">${renderListSkeleton(2)}</div>
                    </div>
                    <div class="bg-white rounded-3xl border border-gray-100 p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="font-bold text-er-dark">최근 세션 노트</h3>
                            <button onclick="renderSection('coach_notes')" class="text-xs text-er-accent font-bold">전체 보기</button>
                        </div>
                        <div id="coach-portal-notes" class="space-y-2 text-sm text-gray-500">${renderListSkeleton(2)}</div>
                    </div>
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
    if (!state.user) return renderCoachAccessDenied('로그인 후 보고서 관리 기능을 사용할 수 있습니다.');
    if (!state.isCoach) return renderCoachAccessDenied();
    return `
        <div class="bg-white min-h-screen py-10 px-4 sm:px-6 lg:px-8">
            <div class="max-w-6xl mx-auto space-y-6">
                <div class="flex flex-wrap items-center justify-between gap-3">
                    <h2 class="text-2xl font-bold text-er-dark">보고서 관리</h2>
                    <div class="flex gap-2">
                        <button onclick="renderSection('coach_portal')" class="px-4 py-2 rounded-full text-xs font-bold bg-gray-100 text-gray-700">대시보드</button>
                        <button id="coach-task-toggle-btn" onclick="toggleCoachComposer('task')" class="px-4 py-2 rounded-full text-xs font-bold border border-er-dark text-er-dark bg-white">보고서 등록</button>
                        <button onclick="loadCoachTasks()" class="px-4 py-2 rounded-full text-xs font-bold bg-er-dark text-white">새로고침</button>
                    </div>
                </div>
                <div class="bg-white border border-gray-100 rounded-3xl p-6">
                    <h3 class="text-base font-bold text-er-dark mb-4">보고서 목록</h3>
                    <div id="coach-tasks-list" class="space-y-3 text-sm text-gray-500">${renderListSkeleton(4)}</div>
                    <div id="coach-task-detail" class="hidden mt-6 border border-gray-100 rounded-2xl p-4 md:p-5 bg-gray-50/50"></div>
                </div>
                <div id="coach-task-composer" class="hidden bg-er-base border border-er-accent/20 rounded-3xl p-6 md:p-8 space-y-4">
                    <form id="coach-task-form" onsubmit="submitCoachTask(event)" class="space-y-4">
                        <div class="flex items-center justify-between gap-3">
                            <h3 id="coach-task-form-title" class="text-base font-bold text-er-dark">새 보고서 등록</h3>
                            <button type="button" id="coach-task-cancel-btn" onclick="resetCoachTaskForm()" class="hidden px-3 py-1.5 rounded-full text-[11px] font-bold border border-gray-200 text-gray-700 hover:bg-gray-50">수정 취소</button>
                        </div>
                        <input type="hidden" name="task_id" value="">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input name="title" required maxlength="120" placeholder="보고서 제목" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm">
                            <input name="due_at" type="datetime-local" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm">
                            <input name="week_label" placeholder="주차 (예: 2026-W10)" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm">
                            <select name="status" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm">
                                <option value="published">게시</option>
                                <option value="draft">임시저장</option>
                                <option value="archived">보관</option>
                            </select>
                        </div>
                        <textarea name="description" rows="3" placeholder="보고서 설명" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"></textarea>
                        <input name="files" type="file" multiple accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv,.zip,.hwp,.hwpx,.png,.jpg,.jpeg,.webp,.gif,.mp4,.mov,.mp3,.wav,.m4a" class="w-full rounded-xl border border-dashed border-gray-300 bg-white px-4 py-3 text-xs">
                        <button id="coach-task-submit-btn" type="submit" class="px-6 py-2 rounded-full text-xs font-bold bg-er-dark text-white">보고서 저장</button>
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
                        <button id="coach-material-toggle-btn" onclick="toggleCoachComposer('material')" class="px-4 py-2 rounded-full text-xs font-bold border border-er-dark text-er-dark bg-white">자료 업로드</button>
                        <button onclick="loadCoachMaterials()" class="px-4 py-2 rounded-full text-xs font-bold bg-er-dark text-white">새로고침</button>
                    </div>
                </div>
                <div class="bg-white border border-gray-100 rounded-3xl p-6">
                    <h3 class="text-base font-bold text-er-dark mb-4">자료 목록</h3>
                    <div id="coach-materials-list" class="space-y-3 text-sm text-gray-500">${renderListSkeleton(4)}</div>
                    <div id="coach-material-detail" class="hidden mt-6 border border-gray-100 rounded-2xl p-4 md:p-5 bg-gray-50/50"></div>
                </div>
                <div id="coach-material-composer" class="hidden bg-er-base border border-er-accent/20 rounded-3xl p-6 md:p-8 space-y-4">
                    <form id="coach-material-form" onsubmit="submitCoachMaterial(event)" class="space-y-4">
                        <div class="flex items-center justify-between gap-3">
                            <h3 id="coach-material-form-title" class="text-base font-bold text-er-dark">자료 업로드</h3>
                            <button type="button" id="coach-material-cancel-btn" onclick="resetCoachMaterialForm()" class="hidden px-3 py-1.5 rounded-full text-[11px] font-bold border border-gray-200 text-gray-700 hover:bg-gray-50">수정 취소</button>
                        </div>
                        <input type="hidden" name="material_id" value="">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input name="title" required maxlength="120" placeholder="자료 제목" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm">
                            <select name="category" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm">
                                <option value="general">일반</option>
                                <option value="study_track">Study 트랙</option>
                                <option value="spiritual_formation_track">Spiritual Formation 트랙</option>
                                <option value="coaching_track">Coaching 트랙</option>
                                <option value="practicum_track">Practicum 트랙</option>
                                <option value="reference">참고자료</option>
                            </select>
                        </div>
                        <textarea name="description" rows="3" placeholder="자료 설명" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"></textarea>
                        <input name="file" type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv,.zip,.hwp,.hwpx,.png,.jpg,.jpeg,.webp,.gif,.mp4,.mov,.mp3,.wav,.m4a" class="w-full rounded-xl border border-dashed border-gray-300 bg-white px-4 py-3 text-xs">
                        <button id="coach-material-submit-btn" type="submit" class="px-6 py-2 rounded-full text-xs font-bold bg-er-dark text-white">자료 업로드</button>
                    </form>
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
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input name="title" required maxlength="120" placeholder="일정 제목" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm">
                            <select name="schedule_type" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm">
                                <option value="study_track">Study 트랙</option>
                                <option value="spiritual_formation_track">Spiritual Formation 트랙</option>
                                <option value="coaching_track">Coaching 트랙</option>
                                <option value="practicum_track">Practicum 트랙</option>
                            </select>
                            <input name="start_at" type="datetime-local" required class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm">
                            <input name="end_at" type="datetime-local" required class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm">
                            <input name="location" placeholder="장소 / 온라인 링크" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm md:col-span-2">
                        </div>
                        <textarea name="notes" rows="2" placeholder="메모" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"></textarea>
                        <button type="submit" class="px-6 py-2 rounded-full text-xs font-bold bg-er-dark text-white">일정 저장</button>
                    </form>
                </div>
            </div>
        </div>
    `;
}

function renderCoachNotes() {
    if (!state.user) return renderCoachAccessDenied('로그인 후 세션 노트 기능을 사용할 수 있습니다.');
    if (!state.isCoach) return renderCoachAccessDenied();
    return `
        <div class="bg-white min-h-screen py-10 px-4 sm:px-6 lg:px-8">
            <div class="max-w-6xl mx-auto space-y-6">
                <div class="flex flex-wrap items-center justify-between gap-3">
                    <h2 class="text-2xl font-bold text-er-dark">세션 노트</h2>
                    <div class="flex gap-2">
                        <button onclick="renderSection('coach_portal')" class="px-4 py-2 rounded-full text-xs font-bold bg-gray-100 text-gray-700">대시보드</button>
                        <button id="coach-note-toggle-btn" onclick="toggleCoachComposer('note')" class="px-4 py-2 rounded-full text-xs font-bold border border-er-dark text-er-dark bg-white">세션 노트 업로드</button>
                        <button onclick="loadCoachNotes()" class="px-4 py-2 rounded-full text-xs font-bold bg-er-dark text-white">새로고침</button>
                    </div>
                </div>
                <div class="bg-white border border-gray-100 rounded-3xl p-6">
                    <h3 class="text-base font-bold text-er-dark mb-4">노트 목록</h3>
                    <div id="coach-notes-list" class="space-y-3 text-sm text-gray-500">${renderListSkeleton(4)}</div>
                    <div id="coach-note-detail" class="hidden mt-6 border border-gray-100 rounded-2xl p-4 md:p-5 bg-gray-50/50"></div>
                </div>
                <div id="coach-note-composer" class="hidden bg-er-base border border-er-accent/20 rounded-3xl p-6 md:p-8 space-y-4">
                    <form id="coach-note-form" onsubmit="submitCoachNote(event)" class="space-y-4">
                        <h3 class="text-base font-bold text-er-dark">세션 노트 업로드</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <select name="schedule_id" required class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm">
                                <option value="">일정을 선택해 주세요</option>
                            </select>
                            <input name="title" required maxlength="120" placeholder="노트 제목" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm">
                        </div>
                        <textarea name="note_body" rows="4" required placeholder="세션 메모 / follow-up / 요약" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"></textarea>
                        <input name="file" type="file" accept=".pdf,.doc,.docx,.txt,.csv,.png,.jpg,.jpeg,.webp,.gif,.mp4,.mov,.mp3,.wav,.m4a" class="w-full rounded-xl border border-dashed border-gray-300 bg-white px-4 py-3 text-xs">
                        <button type="submit" class="px-6 py-2 rounded-full text-xs font-bold bg-er-dark text-white">노트 저장</button>
                    </form>
                </div>
            </div>
        </div>
    `;
}


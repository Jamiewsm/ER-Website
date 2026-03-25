// ER Coach: Tasks — CRUD operations
function findCoachAdminUser(userId) {
    return (state.coachAdminUsers || []).find((item) => item.user_id === userId) || null;
}

async function approveCoachCandidate(userId) {
    if (!ensureCoachAccess() || !isHeadCoach() || !supabaseClient) return;
    const target = findCoachAdminUser(userId);
    if (!target) {
        alert('대상 사용자를 다시 불러와 주세요.');
        return;
    }

    const suggestedName = target.display_name || target.email?.split('@')[0] || '';
    const displayName = prompt('코치 이름을 입력해 주세요.', suggestedName);
    if (displayName === null) return;

    const { error } = await supabaseClient.rpc('admin_upsert_coach_profile', {
        p_user_id: userId,
        p_display_name: String(displayName || '').trim(),
        p_role: target.role === 'head_coach' ? 'head_coach' : 'coach',
        p_is_active: true
    });

    if (error) {
        alert(`코치 승인 실패: ${error.message}`);
        return;
    }

    await loadCoachAdminUsers();
    await loadCoachProfile();
    alert('코치 승인 처리가 완료되었습니다.');
}

async function disableCoachCandidate(userId) {
    if (!ensureCoachAccess() || !isHeadCoach() || !supabaseClient) return;
    if (userId === state.user?.id) {
        alert('현재 로그인한 헤드 코치는 여기서 비활성화할 수 없습니다.');
        return;
    }
    if (!confirm('이 코치를 비활성화할까요? 로그인은 유지되지만 코치 포털 접근은 막힙니다.')) return;

    const { error } = await supabaseClient.rpc('admin_disable_coach_profile', {
        p_user_id: userId
    });

    if (error) {
        alert(`코치 비활성화 실패: ${error.message}`);
        return;
    }

    await loadCoachAdminUsers();
    alert('코치가 비활성화되었습니다.');
}

function openCoachTaskFromDashboard(taskId) {
    renderSection('coach_tasks');
    setTimeout(() => viewCoachTaskDetail(taskId), 120);
}

async function populateCoachNoteScheduleOptions(selectedScheduleId = '') {
    if (!ensureCoachAccess() || !supabaseClient) return;
    const selectEl = document.querySelector('#coach-note-form select[name="schedule_id"]');
    if (!selectEl) return;

    const { data, error } = await supabaseClient
        .from('coach_schedules')
        .select('id, title, start_at, end_at')
        .order('start_at', { ascending: false })
        .limit(100);

    if (error) {
        selectEl.innerHTML = '<option value="">일정 로딩 실패</option>';
        return;
    }

    const options = (data || []).map((item) => {
        const selected = String(selectedScheduleId) === String(item.id) ? 'selected' : '';
        return `<option value="${item.id}" ${selected}>${escapeHtml(item.title)} · ${escapeHtml(formatDateTime(item.start_at))}</option>`;
    }).join('');

    selectEl.innerHTML = `<option value="">일정을 선택해 주세요</option>${options}`;
    if (!selectedScheduleId && data?.length) {
        selectEl.value = data[0].id;
    }
}

async function loadCoachNotes() {
    if (!ensureCoachAccess() || !supabaseClient) return;
    const listEl = document.getElementById('coach-notes-list');
    if (listEl) listEl.innerHTML = renderListSkeleton(4);
    await populateCoachNoteScheduleOptions();

    const { data: notes, error } = await supabaseClient
        .from('coach_session_notes')
        .select('id, schedule_id, title, note_body, attachment_path, attachment_name, attachment_size_bytes, created_at, uploaded_by')
        .order('created_at', { ascending: false })
        .limit(50);

    if (error) {
        if (listEl) listEl.innerHTML = `<p class="text-red-500 text-xs">세션 노트 로딩 실패: ${escapeHtml(error.message)}</p>`;
        return;
    }

    const scheduleIds = [...new Set((notes || []).map((item) => item.schedule_id).filter(Boolean))];
    let scheduleMap = {};
    if (scheduleIds.length) {
        const { data: schedules } = await supabaseClient
            .from('coach_schedules')
            .select('id, title, start_at, end_at')
            .in('id', scheduleIds);
        scheduleMap = Object.fromEntries((schedules || []).map((item) => [item.id, item]));
    }

    if (listEl) {
        state.coachListCounts.notes = (notes || []).length;
        listEl.innerHTML = (notes || []).length
            ? notes.map((note) => {
                const schedule = scheduleMap[note.schedule_id];
                return `
                    <div class="border border-gray-100 rounded-2xl p-4">
                        <div class="flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <button type="button" onclick="viewCoachNoteDetail('${note.id}')" class="text-left font-bold text-gray-900 hover:text-er-accent transition-colors">${escapeHtml(note.title)}</button>
                                <p class="text-xs text-gray-400 mt-1">${escapeHtml(schedule?.title || '연결된 일정 없음')} · ${formatDateTime(note.created_at)}</p>
                            </div>
                            <div class="flex gap-2">
                                <button onclick="viewCoachNoteDetail('${note.id}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold border border-gray-200 text-gray-700 hover:bg-gray-50">보기</button>
                                ${note.attachment_path ? `<button onclick="downloadCoachNoteAttachment('${encodeURIComponent(note.attachment_path || '')}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold border border-gray-200 text-gray-700 hover:bg-gray-50">첨부 다운로드</button>` : ''}
                                ${state.user && (note.uploaded_by === state.user.id || isHeadCoach())
                                    ? `<button onclick="deleteCoachNote('${note.id}','${encodeURIComponent(note.attachment_path || '')}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold border border-red-200 text-red-600 hover:bg-red-50">삭제</button>`
                                    : ''}
                            </div>
                        </div>
                        <p class="text-xs text-gray-500 mt-2 break-keep">${escapeHtml(note.note_body || '')}</p>
                    </div>
                `;
            }).join('')
            : '<p class="text-sm text-gray-500">등록된 세션 노트가 없습니다.</p>';
    }

    setCoachComposerVisibility('note', !(notes || []).length);
}

async function viewCoachNoteDetail(noteId, fromDashboard = false) {
    if (!ensureCoachAccess() || !supabaseClient) return;
    if (fromDashboard && state.currentSection !== 'coach_notes') {
        renderSection('coach_notes');
        setTimeout(() => viewCoachNoteDetail(noteId, false), 120);
        return;
    }

    const detailEl = document.getElementById('coach-note-detail');
    if (!detailEl) return;
    detailEl.classList.remove('hidden');
    detailEl.innerHTML = renderDetailSkeleton();

    const { data: note, error } = await supabaseClient
        .from('coach_session_notes')
        .select('id, schedule_id, title, note_body, attachment_path, attachment_name, attachment_size_bytes, created_at, uploaded_by')
        .eq('id', noteId)
        .maybeSingle();

    if (error || !note) {
        detailEl.innerHTML = `<p class="text-xs text-red-500">세션 노트 상세 로딩 실패: ${escapeHtml(error?.message || 'not found')}</p>`;
        return;
    }

    const { data: schedule } = await supabaseClient
        .from('coach_schedules')
        .select('id, title, start_at, end_at, location')
        .eq('id', note.schedule_id)
        .maybeSingle();

    const scheduleStartLabel = schedule ? escapeHtml(formatDateTime(schedule.start_at)) : '';
    const scheduleLocationLabel = schedule && schedule.location ? ` · ${renderScheduleLocation(schedule.location)}` : '';

    detailEl.innerHTML = `
        <div class="flex items-start justify-between gap-3">
            <div>
                <h4 class="text-base font-bold text-gray-900">${escapeHtml(note.title)}</h4>
                <p class="text-xs text-gray-500 mt-1">등록: ${formatDateTime(note.created_at)}</p>
                <p class="text-xs text-gray-500 mt-1">일정: ${escapeHtml(schedule?.title || '연결된 일정 없음')}</p>
                <p class="text-xs text-gray-400 mt-1">${schedule ? `${scheduleStartLabel}${scheduleLocationLabel}` : ''}</p>
            </div>
            <div class="flex gap-2">
                ${note.attachment_path ? `<button onclick="downloadCoachNoteAttachment('${encodeURIComponent(note.attachment_path || '')}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold border border-gray-200 text-gray-700 hover:bg-gray-50">첨부 다운로드</button>` : ''}
                ${state.user && (note.uploaded_by === state.user.id || isHeadCoach()) ? `<button onclick="deleteCoachNote('${note.id}','${encodeURIComponent(note.attachment_path || '')}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold border border-red-200 text-red-600 hover:bg-red-50">삭제</button>` : ''}
            </div>
        </div>
        <div class="mt-4 p-3 rounded-xl border border-gray-100 bg-white text-sm text-gray-700 break-keep">${escapeHtml(note.note_body || '-')}</div>
        ${note.attachment_name ? `<p class="mt-4 text-xs text-gray-500">첨부: ${escapeHtml(note.attachment_name)} · ${getFileSizeLabel(note.attachment_size_bytes)}</p>` : '<p class="mt-4 text-xs text-gray-500">첨부파일이 없습니다.</p>'}
    `;
}

async function submitCoachNote(event) {
    event.preventDefault();
    if (!ensureCoachAccess() || !supabaseClient) return;
    const form = event.target;
    const formData = new FormData(form);
    const schedule_id = String(formData.get('schedule_id') || '').trim();
    const title = String(formData.get('title') || '').trim();
    const note_body = String(formData.get('note_body') || '').trim();
    const file = form.querySelector('input[name="file"]')?.files?.[0];

    if (!schedule_id || !title || !note_body) {
        alert('일정, 제목, 노트 내용을 모두 입력해 주세요.');
        return;
    }

    let attachment_path = null;
    let attachment_name = null;
    let attachment_mime_type = null;
    let attachment_size_bytes = null;

    if (file) {
        const check = validateUploadFile(file);
        if (!check.ok) {
            alert(check.reason);
            return;
        }
        const safeName = `${Date.now()}_${buildSafeStorageFileName(file.name)}`;
        const storagePath = `${schedule_id}/${safeName}`;
        const uploadRes = await supabaseClient.storage.from('coach-session-notes').upload(storagePath, file, {
            upsert: false,
            contentType: file.type || undefined
        });
        if (uploadRes.error) {
            alert(`첨부 업로드 실패: ${uploadRes.error.message}`);
            return;
        }
        attachment_path = storagePath;
        attachment_name = file.name;
        attachment_mime_type = file.type || null;
        attachment_size_bytes = file.size || null;
    }

    const { data: inserted, error } = await supabaseClient
        .from('coach_session_notes')
        .insert([{
            schedule_id,
            title,
            note_body,
            attachment_path,
            attachment_name,
            attachment_mime_type,
            attachment_size_bytes,
            uploaded_by: state.user.id
        }])
        .select('id')
        .single();

    if (error || !inserted?.id) {
        alert(`세션 노트 저장 실패: ${error?.message || 'unknown error'}`);
        return;
    }

    form.reset();
    await populateCoachNoteScheduleOptions();
    await loadCoachNotes();
    setCoachComposerVisibility('note', state.coachListCounts.notes === 0);
    await viewCoachNoteDetail(inserted.id);
    alert('세션 노트가 저장되었습니다.');
}

async function downloadCoachNoteAttachment(encodedStoragePath) {
    if (!ensureCoachAccess() || !supabaseClient) return;
    const path = decodeURIComponent(String(encodedStoragePath || ''));
    if (!path) return;
    const { data, error } = await supabaseClient.storage.from('coach-session-notes').createSignedUrl(path, 60);
    if (error || !data?.signedUrl) {
        alert(`첨부 다운로드 링크 생성 실패: ${error?.message || 'unknown error'}`);
        return;
    }
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
}

async function deleteCoachNote(noteId, encodedAttachmentPath) {
    if (!ensureCoachAccess() || !supabaseClient) return;
    if (!confirm('이 세션 노트를 삭제할까요?')) return;

    const { data: existing, error: existingError } = await supabaseClient
        .from('coach_session_notes')
        .select('id, uploaded_by, attachment_path')
        .eq('id', noteId)
        .maybeSingle();
    if (existingError || !existing) {
        alert(`세션 노트 조회 실패: ${existingError?.message || 'not found'}`);
        return;
    }
    if (!state.user || (existing.uploaded_by !== state.user.id && !isHeadCoach())) {
        alert('업로드한 본인 또는 관리자만 삭제할 수 있습니다.');
        return;
    }

    const attachmentPath = decodeURIComponent(String(encodedAttachmentPath || existing.attachment_path || ''));
    if (attachmentPath) {
        await supabaseClient.storage.from('coach-session-notes').remove([attachmentPath]);
    }

    const { error } = await supabaseClient
        .from('coach_session_notes')
        .delete()
        .eq('id', noteId);
    if (error) {
        alert(`세션 노트 삭제 실패: ${error.message}`);
        return;
    }

    const detailEl = document.getElementById('coach-note-detail');
    if (detailEl) {
        detailEl.classList.add('hidden');
        detailEl.innerHTML = '';
    }
    await loadCoachNotes();
    alert('세션 노트가 삭제되었습니다.');
}

async function loadCoachTasks() {
    if (!ensureCoachAccess() || !supabaseClient) return;
    const listEl = document.getElementById('coach-tasks-list');
    if (listEl) listEl.innerHTML = renderListSkeleton(4);

    const { data: tasks, error } = await supabaseClient
        .from('coach_tasks')
        .select('id, title, description, due_at, week_label, status, created_at, coach_task_files(id)')
        .order('created_at', { ascending: false })
        .limit(30);

    if (error) {
        if (listEl) listEl.innerHTML = `<p class="text-red-500 text-xs">보고서 로딩 실패: ${escapeHtml(error.message)}</p>`;
        return;
    }

    if (listEl) {
        state.coachListCounts.tasks = (tasks || []).length;
        listEl.innerHTML = (tasks || []).length
            ? tasks.map((task) => `
                <div class="border border-gray-100 rounded-2xl p-4">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                        <h4 class="font-bold text-gray-900">${escapeHtml(task.title)}</h4>
                        <span class="text-[11px] px-2 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-600">${escapeHtml(task.status || '-')}</span>
                    </div>
                    <p class="text-xs text-gray-500 mt-2 break-keep">${escapeHtml(task.description || '-')}</p>
                    <p class="text-xs text-gray-400 mt-2">주차: ${escapeHtml(task.week_label || '-')} · 마감: ${formatDateTime(task.due_at)} · 첨부: ${(task.coach_task_files || []).length}개</p>
                    <div class="mt-3 flex gap-2">
                        <button onclick="viewCoachTaskDetail('${task.id}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold border border-gray-200 text-gray-700 hover:bg-gray-50">상세 보기</button>
                        <button onclick="editCoachTask('${task.id}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold bg-er-dark text-white">수정</button>
                        <button onclick="deleteCoachTask('${task.id}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold border border-red-200 text-red-600 hover:bg-red-50">삭제</button>
                    </div>
                </div>
            `).join('')
            : '<p class="text-sm text-gray-500">등록된 보고서가 없습니다.</p>';
    }

    setCoachComposerVisibility('task', !(tasks || []).length);
}

async function viewCoachTaskDetail(taskId) {
    if (!ensureCoachAccess() || !supabaseClient) return;
    const detailEl = document.getElementById('coach-task-detail');
    if (!detailEl) return;
    detailEl.classList.remove('hidden');
    detailEl.innerHTML = renderDetailSkeleton();

    const { data: task, error } = await supabaseClient
        .from('coach_tasks')
        .select('id, title, description, due_at, week_label, status, created_at')
        .eq('id', taskId)
        .maybeSingle();

    if (error || !task) {
        detailEl.innerHTML = `<p class="text-xs text-red-500">보고서 상세 로딩 실패: ${escapeHtml(error?.message || 'not found')}</p>`;
        return;
    }

    const { data: files } = await supabaseClient
        .from('coach_task_files')
        .select('id, original_name, size_bytes, storage_path, created_at')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });

    detailEl.innerHTML = `
        <div class="flex items-start justify-between gap-3">
            <div>
                <h4 class="text-base font-bold text-gray-900">${escapeHtml(task.title)}</h4>
                <p class="text-xs text-gray-500 mt-1">상태: ${escapeHtml(task.status || '-')} · 주차: ${escapeHtml(task.week_label || '-')}</p>
                <p class="text-xs text-gray-500 mt-1">마감: ${formatDateTime(task.due_at)} · 등록: ${formatDateTime(task.created_at)}</p>
            </div>
            <div class="flex gap-2">
                <button onclick="editCoachTask('${task.id}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold bg-er-dark text-white">이 보고서 수정</button>
                <button onclick="deleteCoachTask('${task.id}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold border border-red-200 text-red-600 hover:bg-red-50">삭제</button>
            </div>
        </div>
        <div class="mt-4 p-3 rounded-xl border border-gray-100 bg-white text-sm text-gray-700 break-keep">${escapeHtml(task.description || '-')}</div>
        <div class="mt-4">
            <h5 class="text-sm font-bold text-gray-800 mb-2">첨부파일</h5>
            <div class="space-y-2">
                ${(files || []).length ? files.map((file) => `
                    <div class="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-gray-100 bg-white">
                        <div class="min-w-0">
                            <p class="text-xs font-semibold text-gray-800 truncate">${escapeHtml(file.original_name || '-')}</p>
                            <p class="text-[11px] text-gray-500">${getFileSizeLabel(file.size_bytes)} · ${formatDateTime(file.created_at)}</p>
                        </div>
                        <button onclick="downloadCoachTaskFile('${encodeURIComponent(file.storage_path || '')}')" class="shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold border border-gray-200 text-gray-700 hover:bg-gray-50">다운로드</button>
                    </div>
                `).join('') : '<p class="text-xs text-gray-500">첨부파일이 없습니다.</p>'}
            </div>
        </div>
    `;
}

async function editCoachTask(taskId) {
    if (!ensureCoachAccess() || !supabaseClient) return;
    const { data: task, error } = await supabaseClient
        .from('coach_tasks')
        .select('id, title, description, due_at, week_label, status')
        .eq('id', taskId)
        .maybeSingle();

    if (error || !task) {
        alert(`수정 데이터 로딩 실패: ${error?.message || 'not found'}`);
        return;
    }

    const form = document.getElementById('coach-task-form');
    if (!form) return;
    setCoachComposerVisibility('task', true);
    form.querySelector('input[name="task_id"]').value = task.id;
    form.querySelector('input[name="title"]').value = task.title || '';
    form.querySelector('input[name="due_at"]').value = toLocalDatetimeInputValue(task.due_at);
    form.querySelector('input[name="week_label"]').value = task.week_label || '';
    form.querySelector('select[name="status"]').value = task.status || 'published';
    form.querySelector('textarea[name="description"]').value = task.description || '';

    const titleEl = document.getElementById('coach-task-form-title');
    if (titleEl) titleEl.textContent = '보고서 수정';
    const submitBtn = document.getElementById('coach-task-submit-btn');
    if (submitBtn) submitBtn.textContent = '보고서 수정 저장';
    const cancelBtn = document.getElementById('coach-task-cancel-btn');
    if (cancelBtn) cancelBtn.classList.remove('hidden');

    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    await viewCoachTaskDetail(task.id);
}

function resetCoachTaskForm() {
    const form = document.getElementById('coach-task-form');
    if (!form) return;
    form.reset();
    form.querySelector('input[name="task_id"]').value = '';
    const titleEl = document.getElementById('coach-task-form-title');
    if (titleEl) titleEl.textContent = '새 보고서 등록';
    const submitBtn = document.getElementById('coach-task-submit-btn');
    if (submitBtn) submitBtn.textContent = '보고서 저장';
    const cancelBtn = document.getElementById('coach-task-cancel-btn');
    if (cancelBtn) cancelBtn.classList.add('hidden');
    setCoachComposerVisibility('task', state.coachListCounts.tasks === 0);
}

async function deleteCoachTask(taskId) {
    if (!ensureCoachAccess() || !supabaseClient) return;
    if (!confirm('이 보고서를 삭제할까요? 첨부파일도 함께 삭제됩니다.')) return;

    const { data: files } = await supabaseClient
        .from('coach_task_files')
        .select('storage_path')
        .eq('task_id', taskId);

    const paths = (files || []).map((f) => f.storage_path).filter(Boolean);
    if (paths.length) {
        await supabaseClient.storage.from('coach-task-files').remove(paths);
    }

    const { error } = await supabaseClient
        .from('coach_tasks')
        .delete()
        .eq('id', taskId);

    if (error) {
        alert(`보고서 삭제 실패: ${error.message}`);
        return;
    }

    const detailEl = document.getElementById('coach-task-detail');
    if (detailEl) {
        detailEl.classList.add('hidden');
        detailEl.innerHTML = '';
    }
    resetCoachTaskForm();
    await loadCoachTasks();
    alert('보고서가 삭제되었습니다.');
}

async function loadCoachMaterials() {
    if (!ensureCoachAccess() || !supabaseClient) return;
    const listEl = document.getElementById('coach-materials-list');
    if (listEl) listEl.innerHTML = renderListSkeleton(4);

    const { data, error } = await supabaseClient
        .from('coach_materials')
        .select('id, title, category, description, original_name, size_bytes, storage_path, created_at, uploaded_by')
        .order('created_at', { ascending: false })
        .limit(40);

    if (error) {
        if (listEl) listEl.innerHTML = `<p class="text-red-500 text-xs">자료 로딩 실패: ${escapeHtml(error.message)}</p>`;
        return;
    }

    if (listEl) {
        state.coachListCounts.materials = (data || []).length;
        listEl.innerHTML = (data || []).length
            ? data.map((item) => `
                <div class="border border-gray-100 rounded-2xl p-4">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <button type="button" onclick="viewCoachMaterialDetail('${item.id}')" class="text-left font-bold text-gray-900 hover:text-er-accent transition-colors">${escapeHtml(item.title)}</button>
                            <p class="text-xs text-gray-400 mt-1">${escapeHtml(item.category)} · ${escapeHtml(item.original_name || '')} · ${getFileSizeLabel(item.size_bytes)}</p>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="viewCoachMaterialDetail('${item.id}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold border border-gray-200 text-gray-700 hover:bg-gray-50">보기</button>
                            <button onclick="downloadCoachMaterial('${encodeURIComponent(item.storage_path || '')}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold border border-gray-200 text-gray-700 hover:bg-gray-50">다운로드</button>
                            ${state.user && (item.uploaded_by === state.user.id || isHeadCoach())
                                ? `<button onclick="startEditCoachMaterial('${item.id}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold border border-er-accent/40 text-er-dark hover:bg-er-accentLight/40">수정</button>
                                   <button onclick="deleteCoachMaterial('${item.id}','${encodeURIComponent(item.storage_path || '')}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold border border-red-200 text-red-600 hover:bg-red-50">삭제</button>`
                                : ''}
                        </div>
                    </div>
                    <p class="text-xs text-gray-500 mt-2 break-keep">${escapeHtml(item.description || '-')}</p>
                </div>
            `).join('')
            : '<p class="text-sm text-gray-500">업로드된 자료가 없습니다.</p>';
    }

    setCoachComposerVisibility('material', !(data || []).length);
}

async function viewCoachMaterialDetail(materialId) {
    if (!ensureCoachAccess() || !supabaseClient) return;
    const detailEl = document.getElementById('coach-material-detail');
    if (!detailEl) return;
    detailEl.classList.remove('hidden');
    detailEl.innerHTML = renderDetailSkeleton();

    const { data: item, error } = await supabaseClient
        .from('coach_materials')
        .select('id, title, category, description, original_name, size_bytes, storage_path, created_at, uploaded_by')
        .eq('id', materialId)
        .maybeSingle();

    if (error || !item) {
        detailEl.innerHTML = `<p class="text-xs text-red-500">자료 상세 로딩 실패: ${escapeHtml(error?.message || 'not found')}</p>`;
        return;
    }

    const { data: signed, error: signedError } = await supabaseClient.storage
        .from('coach-materials')
        .createSignedUrl(item.storage_path, 300);

    const signedUrl = signed?.signedUrl || '';
    const ext = getFileExtension(item.original_name || '');
    let previewHtml = '<p class="text-xs text-gray-500">미리보기를 지원하지 않는 형식입니다. 다운로드를 이용해 주세요.</p>';
    if (signedUrl && ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)) {
        previewHtml = `<img src="${signedUrl}" alt="${escapeHtml(item.title)}" class="max-h-80 w-auto rounded-xl border border-gray-100">`;
    } else if (signedUrl && ext === 'pdf') {
        previewHtml = `<iframe src="${signedUrl}" class="w-full h-96 rounded-xl border border-gray-100 bg-white"></iframe>`;
    } else if (signedUrl && ['mp4', 'mov'].includes(ext)) {
        previewHtml = `<video src="${signedUrl}" controls class="max-h-80 rounded-xl border border-gray-100 bg-black"></video>`;
    } else if (signedUrl && ['mp3', 'wav', 'm4a'].includes(ext)) {
        previewHtml = `<audio src="${signedUrl}" controls class="w-full"></audio>`;
    }

    const canManage = Boolean(state.user && (item.uploaded_by === state.user.id || isHeadCoach()));
    detailEl.innerHTML = `
        <div class="flex items-start justify-between gap-3">
            <div>
                <h4 class="text-base font-bold text-gray-900">${escapeHtml(item.title)}</h4>
                <p class="text-xs text-gray-500 mt-1">${escapeHtml(item.category)} · ${escapeHtml(item.original_name || '-')} · ${getFileSizeLabel(item.size_bytes)} · ${formatDateTime(item.created_at)}</p>
            </div>
            <div class="flex gap-2">
                <button onclick="openCoachMaterial('${encodeURIComponent(item.storage_path || '')}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold border border-gray-200 text-gray-700 hover:bg-gray-50">새 창 보기</button>
                <button onclick="downloadCoachMaterial('${encodeURIComponent(item.storage_path || '')}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold border border-gray-200 text-gray-700 hover:bg-gray-50">다운로드</button>
                ${canManage ? `<button onclick="startEditCoachMaterial('${item.id}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold border border-er-accent/40 text-er-dark hover:bg-er-accentLight/40">수정</button>` : ''}
            </div>
        </div>
        <div class="mt-4 p-3 rounded-xl border border-gray-100 bg-white text-sm text-gray-700 break-keep">${escapeHtml(item.description || '-')}</div>
        <div class="mt-4">${signedError ? `<p class="text-xs text-red-500">미리보기 링크 생성 실패: ${escapeHtml(signedError.message)}</p>` : previewHtml}</div>
    `;
}


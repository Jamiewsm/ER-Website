// ER Coach: Schedule — CRUD, modal, calendar
function resetCoachScheduleForm(dayKey = '') {
    const form = document.querySelector('#coach-schedule-modal form');
    if (!form) return;
    form.reset();
    if (form.schedule_id) form.schedule_id.value = '';
    if (form.schedule_type) form.schedule_type.value = 'study_track';
    const titleEl = document.querySelector('#coach-schedule-modal h3');
    const submitEl = form.querySelector('button[type="submit"]');
    if (titleEl) titleEl.textContent = '일정 등록';
    if (submitEl) submitEl.textContent = '일정 저장';
    if (dayKey && form.start_at && !form.start_at.value) {
        form.start_at.value = `${dayKey}T18:00`;
        if (form.end_at) form.end_at.value = `${dayKey}T19:00`;
    }
}

function openScheduleModal(schedule = null, dayKey = '') {
    const modal = document.getElementById('coach-schedule-modal');
    if (!modal) return;
    resetCoachScheduleForm(dayKey);
    const form = modal.querySelector('form');
    if (schedule && form) {
        if (form.schedule_id) form.schedule_id.value = schedule.id || '';
        if (form.title) form.title.value = schedule.title || '';
        if (form.schedule_type) form.schedule_type.value = schedule.schedule_type || 'study_track';
        if (form.start_at) form.start_at.value = toLocalDatetimeInputValue(schedule.start_at);
        if (form.end_at) form.end_at.value = toLocalDatetimeInputValue(schedule.end_at);
        if (form.location) form.location.value = schedule.location || '';
        if (form.notes) form.notes.value = schedule.notes || '';
        const titleEl = modal.querySelector('h3');
        const submitEl = form.querySelector('button[type="submit"]');
        if (titleEl) titleEl.textContent = '일정 수정';
        if (submitEl) submitEl.textContent = '일정 수정 저장';
    }
    modal.classList.remove('hidden');
}

function closeScheduleModal() {
    const modal = document.getElementById('coach-schedule-modal');
    if (!modal) return;
    modal.classList.add('hidden');
}

function openScheduleModalForSelectedDay() {
    if (!state.coachSelectedDate) return;
    closeCoachScheduleDayModal();
    openScheduleModal(null, state.coachSelectedDate);
}

function closeCoachScheduleDayModal() {
    const modal = document.getElementById('coach-schedule-day-modal');
    if (!modal) return;
    modal.classList.add('hidden');
}

function getCoachScheduleById(scheduleId) {
    return (state.coachSchedules || []).find((item) => String(item.id) === String(scheduleId))
        || (state.coachCalendarSchedules || []).find((item) => String(item.id) === String(scheduleId))
        || null;
}

function startEditCoachSchedule(scheduleId) {
    const schedule = getCoachScheduleById(scheduleId);
    if (!schedule) return;
    closeCoachScheduleDayModal();
    openScheduleModal(schedule);
}

function openCoachScheduleDayModal(dayKey) {
    if (!ensureCoachAccess()) return;
    const modal = document.getElementById('coach-schedule-day-modal');
    const titleEl = document.getElementById('coach-schedule-day-title');
    const listEl = document.getElementById('coach-schedule-day-list');
    if (!modal || !titleEl || !listEl) return;
    state.coachSelectedDate = String(dayKey || '');
    titleEl.textContent = `${state.coachSelectedDate} 일정`;

    const schedules = [...(state.coachSchedules || []), ...(state.coachCalendarSchedules || [])]
        .filter((item, index, arr) => arr.findIndex((row) => String(row.id) === String(item.id)) === index)
        .filter((item) => getDateKeyInZone(item.start_at, 'Asia/Seoul') === state.coachSelectedDate)
        .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());

    listEl.innerHTML = schedules.length
        ? schedules.map((item) => {
            const dual = formatScheduleDualRange(item.start_at, item.end_at);
            return `
                <div class="border border-gray-100 rounded-2xl p-4">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <h4 class="font-bold text-gray-900">${escapeHtml(item.title)}</h4>
                            <p class="text-xs text-gray-500 mt-1">${escapeHtml(formatCoachScheduleTypeLabel(item.schedule_type))}</p>
                        </div>
                        <div class="flex items-center gap-2">
                            ${item.location ? renderScheduleLocation(item.location) : ''}
                            <button onclick="startEditCoachSchedule('${item.id}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold border border-gray-200 text-gray-700 hover:bg-gray-50">수정</button>
                            <button onclick="deleteCoachSchedule('${item.id}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold border border-red-200 text-red-600 hover:bg-red-50">삭제</button>
                        </div>
                    </div>
                    <p class="text-xs text-gray-500 mt-2">${escapeHtml(dual.kr)}</p>
                    <p class="text-xs text-gray-500 mt-1">${escapeHtml(dual.ct)}</p>
                    <p class="text-xs text-gray-400 mt-1 break-keep">${escapeHtml(item.notes || '')}</p>
                </div>
            `;
        }).join('')
        : '<p class="text-sm text-gray-500">선택한 날짜에 등록된 일정이 없습니다.</p>';

    modal.classList.remove('hidden');
}

function openCoachTaskModal() {
    const modal = document.getElementById('coach-task-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
}

function closeCoachTaskModal() {
    const modal = document.getElementById('coach-task-modal');
    if (!modal) return;
    modal.classList.add('hidden');
}

function openCoachNoteModal() {
    const modal = document.getElementById('coach-note-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
}

function closeCoachNoteModal() {
    const modal = document.getElementById('coach-note-modal');
    if (!modal) return;
    modal.classList.add('hidden');
}

async function submitCoachTask(event) {
    event.preventDefault();
    if (!ensureCoachAccess() || !supabaseClient) return;
    const form = event.target;
    const formData = new FormData(form);
    const taskId = String(formData.get('task_id') || '').trim();
    const title = String(formData.get('title') || '').trim();
    const description = String(formData.get('description') || '').trim();
    const due_at = toIsoOrNull(String(formData.get('due_at') || '').trim());
    const week_label = String(formData.get('week_label') || '').trim();
    const status = String(formData.get('status') || 'published');
    const files = form.querySelector('input[name="files"]')?.files || [];

    let task = null;
    let taskError = null;
    if (taskId) {
        const updateRes = await supabaseClient
            .from('coach_tasks')
            .update({ title, description, due_at, week_label, status })
            .eq('id', taskId)
            .select('id')
            .single();
        task = updateRes.data;
        taskError = updateRes.error;
    } else {
        const insertRes = await supabaseClient
            .from('coach_tasks')
            .insert([{ title, description, due_at, week_label, status, created_by: state.user.id }])
            .select('id')
            .single();
        task = insertRes.data;
        taskError = insertRes.error;
    }

    if (taskError || !task?.id) {
        alert(`훈련 기록 저장 실패: ${taskError?.message || 'unknown error'}`);
        return;
    }

    for (const file of files) {
        const check = validateUploadFile(file);
        if (!check.ok) {
            alert(`${file.name}\n${check.reason}`);
            continue;
        }
        const safeName = `${Date.now()}_${buildSafeStorageFileName(file.name)}`;
        const storagePath = `${task.id}/${safeName}`;
        const uploadRes = await supabaseClient.storage.from('coach-task-files').upload(storagePath, file, {
            upsert: false,
            contentType: file.type || undefined
        });
        if (uploadRes.error) {
            alert(`파일 업로드 실패(${file.name}): ${uploadRes.error.message}`);
            continue;
        }
        await supabaseClient.from('coach_task_files').insert([{
            task_id: task.id,
            storage_path: storagePath,
            original_name: file.name,
            mime_type: file.type || null,
            size_bytes: file.size || null,
            uploaded_by: state.user.id
        }]);
    }

    resetCoachTaskForm();
    await loadCoachTasks();
    closeCoachTaskModal();
    await viewCoachTaskDetail(task.id);
    alert(taskId ? '훈련 기록이 수정되었습니다.' : '훈련 기록이 저장되었습니다.');
}

async function downloadCoachTaskFile(encodedStoragePath) {
    if (!ensureCoachAccess() || !supabaseClient) return;
    const path = decodeURIComponent(String(encodedStoragePath || ''));
    if (!path) return;
    const { data, error } = await supabaseClient.storage.from('coach-task-files').createSignedUrl(path, 60);
    if (error || !data?.signedUrl) {
        alert(`다운로드 링크 생성 실패: ${error?.message || 'unknown error'}`);
        return;
    }
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
}

async function submitCoachMaterial(event) {
    event.preventDefault();
    if (!ensureCoachAccess() || !supabaseClient) return;
    const form = event.target;
    const formData = new FormData(form);
    const materialId = String(formData.get('material_id') || '').trim();
    const title = String(formData.get('title') || '').trim();
    const description = String(formData.get('description') || '').trim();
    const categoryMain = String(formData.get('category_main') || formData.get('category') || 'general').trim() || 'general';
    const categoryFolder = String(formData.get('category_folder') || '').trim();
    const category = categoryFolder ? `${categoryMain}/${categoryFolder}` : categoryMain;
    if (form.category) form.category.value = category;
    const file = form.querySelector('input[name="file"]')?.files?.[0];
    if (!materialId && !file) {
        alert('업로드할 파일을 선택해 주세요.');
        return;
    }
    if (file) {
        const check = validateUploadFile(file);
        if (!check.ok) {
            alert(check.reason);
            return;
        }
    }

    if (materialId) {
        const { data: existing, error: existingError } = await supabaseClient
            .from('coach_materials')
            .select('id, uploaded_by, storage_path, original_name, mime_type, size_bytes')
            .eq('id', materialId)
            .maybeSingle();
        if (existingError || !existing) {
            alert(`수정 대상 조회 실패: ${existingError?.message || 'not found'}`);
            return;
        }
        if (!state.user || (existing.uploaded_by !== state.user.id && !isHeadCoach())) {
            alert('업로드한 본인 또는 관리자만 수정할 수 있습니다.');
            return;
        }

        let nextStoragePath = existing.storage_path;
        let nextOriginalName = existing.original_name;
        let nextMimeType = existing.mime_type;
        let nextSizeBytes = existing.size_bytes;
        if (file) {
            const safeName = `${Date.now()}_${buildSafeStorageFileName(file.name)}`;
            nextStoragePath = `${category}/${safeName}`;
            const uploadRes = await supabaseClient.storage.from('coach-materials').upload(nextStoragePath, file, {
                upsert: false,
                contentType: file.type || undefined
            });
            if (uploadRes.error) {
                alert(`자료 업로드 실패: ${uploadRes.error.message}`);
                return;
            }
            nextOriginalName = file.name;
            nextMimeType = file.type || null;
            nextSizeBytes = file.size || null;
        }

        const { error } = await supabaseClient
            .from('coach_materials')
            .update({
                title,
                description,
                category,
                storage_path: nextStoragePath,
                original_name: nextOriginalName,
                mime_type: nextMimeType,
                size_bytes: nextSizeBytes
            })
            .eq('id', materialId);
        if (error) {
            alert(`자료 수정 실패: ${error.message}`);
            return;
        }
        if (file && existing.storage_path && existing.storage_path !== nextStoragePath) {
            await supabaseClient.storage.from('coach-materials').remove([existing.storage_path]);
        }
        resetCoachMaterialForm();
        await loadCoachMaterials();
        closeCoachMaterialModal();
        alert('자료가 수정되었습니다.');
        return;
    }

    const safeName = `${Date.now()}_${buildSafeStorageFileName(file.name)}`;
    const storagePath = `${category}/${safeName}`;
    const uploadRes = await supabaseClient.storage.from('coach-materials').upload(storagePath, file, {
        upsert: false,
        contentType: file.type || undefined
    });
    if (uploadRes.error) {
        alert(`자료 업로드 실패: ${uploadRes.error.message}`);
        return;
    }

    const { error } = await supabaseClient.from('coach_materials').insert([{
        title,
        description,
        category,
        storage_path: storagePath,
        original_name: file.name,
        mime_type: file.type || null,
        size_bytes: file.size || null,
        uploaded_by: state.user.id
    }]);
    if (error) {
        alert(`자료 메타데이터 저장 실패: ${error.message}`);
        return;
    }

    resetCoachMaterialForm();
    await loadCoachMaterials();
    closeCoachMaterialModal();
    alert('자료가 업로드되었습니다.');
}

async function deleteCoachMaterial(materialId, encodedStoragePath) {
    if (!ensureCoachAccess() || !supabaseClient) return;
    if (!confirm('이 자료를 삭제할까요?')) return;

    const storagePath = decodeURIComponent(String(encodedStoragePath || ''));
    if (storagePath) {
        await supabaseClient.storage.from('coach-materials').remove([storagePath]);
    }

    const { error } = await supabaseClient
        .from('coach_materials')
        .delete()
        .eq('id', materialId);

    if (error) {
        alert(`자료 삭제 실패: ${error.message}`);
        return;
    }

    const detailEl = document.getElementById('coach-material-detail');
    if (detailEl) {
        detailEl.classList.add('hidden');
        detailEl.innerHTML = '';
    }
    await loadCoachMaterials();
    alert('자료가 삭제되었습니다.');
}

async function submitCoachSchedule(event) {
    event.preventDefault();
    if (!ensureCoachAccess() || !supabaseClient) return;
    const form = event.target;
    const formData = new FormData(form);
    const scheduleId = String(formData.get('schedule_id') || '').trim();
    const title = String(formData.get('title') || '').trim();
    const schedule_type = String(formData.get('schedule_type') || 'study_track');
    const start_at = toIsoOrNull(String(formData.get('start_at') || '').trim());
    const rawEndAt = String(formData.get('end_at') || '').trim();
    const end_at = rawEndAt
        ? toIsoOrNull(rawEndAt)
        : (start_at ? new Date(new Date(start_at).getTime() + 60 * 60 * 1000).toISOString() : null);
    const location = String(formData.get('location') || '').trim();
    const notes = String(formData.get('notes') || '').trim();

    if (!start_at || !end_at) {
        alert('일정 시작/종료 시간을 확인해 주세요.');
        return;
    }

    const payload = {
        title,
        schedule_type,
        start_at,
        end_at,
        location,
        notes
    };
    const query = scheduleId
        ? supabaseClient.from('coach_schedules').update(payload).eq('id', scheduleId)
        : supabaseClient.from('coach_schedules').insert([{ ...payload, created_by: state.user.id }]);
    const { error } = await query;

    if (error) {
        alert(`일정 저장 실패: ${error.message}`);
        return;
    }

    form.reset();
    closeScheduleModal();
    await loadCoachSchedules();
    if (state.coachSelectedDate) openCoachScheduleDayModal(state.coachSelectedDate);
    alert(scheduleId ? '일정이 수정되었습니다.' : '일정이 등록되었습니다.');
}

document.addEventListener('change', (event) => {
    const startInput = event.target.closest('#coach-schedule-modal input[name="start_at"]');
    if (!startInput) return;
    const form = startInput.form;
    const endInput = form?.querySelector('input[name="end_at"]');
    if (!endInput || endInput.value || !startInput.value) return;
    const startDate = new Date(startInput.value);
    if (Number.isNaN(startDate.getTime())) return;
    endInput.value = toLocalDatetimeInputValue(new Date(startDate.getTime() + 60 * 60 * 1000));
});

if (typeof window !== 'undefined') {
    window.openScheduleModal = openScheduleModal;
    window.openScheduleModalForSelectedDay = openScheduleModalForSelectedDay;
    window.closeCoachScheduleDayModal = closeCoachScheduleDayModal;
    window.openCoachScheduleDayModal = openCoachScheduleDayModal;
    window.startEditCoachSchedule = startEditCoachSchedule;
    window.openCoachTaskModal = openCoachTaskModal;
    window.closeCoachTaskModal = closeCoachTaskModal;
    window.openCoachNoteModal = openCoachNoteModal;
    window.closeCoachNoteModal = closeCoachNoteModal;
}

async function deleteCoachSchedule(scheduleId) {
    if (!ensureCoachAccess() || !supabaseClient) return;
    if (!confirm('이 일정을 삭제할까요?')) return;

    const { error } = await supabaseClient
        .from('coach_schedules')
        .delete()
        .eq('id', scheduleId);

    if (error) {
        alert(`일정 삭제 실패: ${error.message}`);
        return;
    }

    await loadCoachSchedules();
    if (state.coachSelectedDate) openCoachScheduleDayModal(state.coachSelectedDate);
    alert('일정이 삭제되었습니다.');
}

async function downloadCoachMaterial(encodedStoragePath) {
    if (!ensureCoachAccess() || !supabaseClient) return;
    const path = decodeURIComponent(String(encodedStoragePath || ''));
    if (!path) return;
    const { data, error } = await supabaseClient.storage.from('coach-materials').createSignedUrl(path, 60);
    if (error || !data?.signedUrl) {
        alert(`다운로드 링크 생성 실패: ${error?.message || 'unknown error'}`);
        return;
    }
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
}

async function openCoachMaterial(encodedStoragePath) {
    if (!ensureCoachAccess() || !supabaseClient) return;
    const path = decodeURIComponent(String(encodedStoragePath || ''));
    if (!path) return;
    const { data, error } = await supabaseClient.storage.from('coach-materials').createSignedUrl(path, 300);
    if (error || !data?.signedUrl) {
        alert(`보기 링크 생성 실패: ${error?.message || 'unknown error'}`);
        return;
    }
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
}

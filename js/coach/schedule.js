// ER Coach: Schedule — CRUD, modal, calendar
function openScheduleModal() {
    const modal = document.getElementById('coach-schedule-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
}

function closeScheduleModal() {
    const modal = document.getElementById('coach-schedule-modal');
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
        alert(`보고서 저장 실패: ${taskError?.message || 'unknown error'}`);
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
    setCoachComposerVisibility('task', !taskId && state.coachListCounts.tasks === 0);
    await viewCoachTaskDetail(task.id);
    alert(taskId ? '보고서가 수정되었습니다.' : '보고서가 저장되었습니다.');
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
    const category = String(formData.get('category') || 'general');
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
        setCoachComposerVisibility('material', state.coachListCounts.materials === 0);
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
    setCoachComposerVisibility('material', state.coachListCounts.materials === 0);
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
    const formData = new FormData(event.target);
    const title = String(formData.get('title') || '').trim();
    const schedule_type = String(formData.get('schedule_type') || 'study_track');
    const start_at = toIsoOrNull(String(formData.get('start_at') || '').trim());
    const end_at = toIsoOrNull(String(formData.get('end_at') || '').trim());
    const location = String(formData.get('location') || '').trim();
    const notes = String(formData.get('notes') || '').trim();

    if (!start_at || !end_at) {
        alert('일정 시작/종료 시간을 확인해 주세요.');
        return;
    }

    const { error } = await supabaseClient.from('coach_schedules').insert([{
        title,
        schedule_type,
        start_at,
        end_at,
        location,
        notes,
        created_by: state.user.id
    }]);

    if (error) {
        alert(`일정 저장 실패: ${error.message}`);
        return;
    }

    event.target.reset();
    closeScheduleModal();
    await loadCoachSchedules();
    alert('일정이 등록되었습니다.');
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


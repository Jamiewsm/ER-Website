// ER Coach: Materials — CRUD operations
function resetCoachMaterialForm() {
    const form = document.getElementById('coach-material-form');
    if (!form) return;
    form.reset();
    form.material_id.value = '';
    const titleEl = document.getElementById('coach-material-form-title');
    const submitEl = document.getElementById('coach-material-submit-btn');
    const cancelEl = document.getElementById('coach-material-cancel-btn');
    if (titleEl) titleEl.textContent = '자료 업로드';
    if (submitEl) submitEl.textContent = '자료 업로드';
    if (cancelEl) cancelEl.classList.add('hidden');
}

async function startEditCoachMaterial(materialId) {
    if (!ensureCoachAccess() || !supabaseClient) return;
    const form = document.getElementById('coach-material-form');
    if (!form) return;
    const { data: item, error } = await supabaseClient
        .from('coach_materials')
        .select('id, title, category, description, uploaded_by')
        .eq('id', materialId)
        .maybeSingle();
    if (error || !item) {
        alert(`자료 조회 실패: ${error?.message || 'not found'}`);
        return;
    }
    if (!state.user || (item.uploaded_by !== state.user.id && !isHeadCoach())) {
        alert('업로드한 본인 또는 관리자만 수정할 수 있습니다.');
        return;
    }
    form.material_id.value = item.id;
    form.title.value = item.title || '';
    form.category.value = item.category || 'general';
    form.description.value = item.description || '';
    const titleEl = document.getElementById('coach-material-form-title');
    const submitEl = document.getElementById('coach-material-submit-btn');
    const cancelEl = document.getElementById('coach-material-cancel-btn');
    if (titleEl) titleEl.textContent = '자료 수정';
    if (submitEl) submitEl.textContent = '자료 수정 저장';
    if (cancelEl) cancelEl.classList.remove('hidden');
    setCoachComposerVisibility('material', true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function loadCoachSchedules() {
    if (!ensureCoachAccess() || !supabaseClient) return;
    const listEl = document.getElementById('coach-schedules-list');
    if (listEl) listEl.innerHTML = renderListSkeleton(4);

    const { data, error } = await supabaseClient
        .from('coach_schedules')
        .select('id, title, schedule_type, start_at, end_at, location, notes')
        .gte('end_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('start_at', { ascending: true })
        .limit(60);

    if (error) {
        if (listEl) listEl.innerHTML = `<p class="text-red-500 text-xs">일정 로딩 실패: ${escapeHtml(error.message)}</p>`;
        return;
    }

    if (listEl) {
        listEl.innerHTML = (data || []).length
            ? data.map((item) => {
                const dual = formatScheduleDualRange(item.start_at, item.end_at);
                return `
                <div class="border border-gray-100 rounded-2xl p-4">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                        <h4 class="font-bold text-gray-900">${escapeHtml(item.title)}</h4>
                        <div class="flex items-center gap-2">
                            <span class="text-[11px] px-2 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-600">${escapeHtml(formatCoachScheduleTypeLabel(item.schedule_type))}</span>
                            <button onclick="deleteCoachSchedule('${item.id}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold border border-red-200 text-red-600 hover:bg-red-50">삭제</button>
                        </div>
                    </div>
                    <p class="text-xs text-gray-500 mt-2">${escapeHtml(dual.kr)}</p>
                    <p class="text-xs text-gray-500 mt-1">${escapeHtml(dual.ct)}</p>
                    <p class="text-xs text-gray-400 mt-1">${renderScheduleLocation(item.location)}</p>
                    <p class="text-xs text-gray-400 mt-1 break-keep">${escapeHtml(item.notes || '')}</p>
                </div>
            `;
            }).join('')
            : '<p class="text-sm text-gray-500">등록된 일정이 없습니다.</p>';
    }
}


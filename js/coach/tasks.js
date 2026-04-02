// ER Coach: Tasks — CRUD operations
function canManageCoachTaskRecord(task) {
    if (!task || !state.user) return false;
    if (typeof isHeadCoach === 'function' && isHeadCoach()) return true;
    if (!task.created_by) return false;
    return String(task.created_by) === String(state.user.id);
}

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

    selectEl.innerHTML = `<option value="">연결할 일정을 선택해 주세요</option>${options}`;
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

}

function getCoachPostCommentKey(postKind, postId) {
    return `${String(postKind || '')}:${String(postId || '')}`;
}

function canManageCoachPostComment(comment) {
    if (!comment || !state.user) return false;
    return String(comment.created_by || '') === String(state.user.id || '') || isHeadCoach();
}

function formatCoachCommentTime(value) {
    return value ? formatDateTime(value) : '-';
}

async function fetchCoachPostComments(postKind, postId) {
    const { data, error } = await supabaseClient
        .from('coach_post_comments')
        .select('id, post_kind, post_id, comment_body, created_by, author_name, created_at, updated_at')
        .eq('post_kind', String(postKind || ''))
        .eq('post_id', String(postId || ''))
        .order('created_at', { ascending: true })
        .limit(200);
    if (error) {
        const msg = String(error.message || '').toLowerCase();
        if (String(error.code || '') === '42P01' || String(error.code || '') === 'PGRST205' || msg.includes('does not exist')) {
            return [];
        }
        throw error;
    }
    if (!state.coachPostComments) state.coachPostComments = {};
    state.coachPostComments[getCoachPostCommentKey(postKind, postId)] = data || [];
    return data || [];
}

async function createCoachPostComment(postKind, postId, commentBody) {
    const body = String(commentBody || '').trim();
    if (!body) throw new Error('댓글 내용을 입력해 주세요.');
    const { error } = await supabaseClient
        .from('coach_post_comments')
        .insert([{
            post_kind: String(postKind || ''),
            post_id: String(postId || ''),
            comment_body: body,
            created_by: state.user.id,
            author_name: state.coachProfile?.display_name || state.user.email || '코치'
        }]);
    if (error) throw error;
}

async function updateCoachPostComment(commentId, commentBody) {
    const body = String(commentBody || '').trim();
    if (!body) throw new Error('댓글 내용을 입력해 주세요.');
    const { error } = await supabaseClient
        .from('coach_post_comments')
        .update({ comment_body: body, updated_at: new Date().toISOString() })
        .eq('id', commentId);
    if (error) throw error;
}

async function deleteCoachPostComment(commentId) {
    const { error } = await supabaseClient
        .from('coach_post_comments')
        .delete()
        .eq('id', commentId);
    if (error) throw error;
}

function reopenCoachPostDetail(postKind, postId) {
    if (String(postKind || '') === 'typing_practicum_report') {
        return viewCoachTypingPracticumDetail(postId);
    }
    return viewCoachNoteDetail(postId);
}

function resetCoachPostCommentForm(postKind, postId) {
    const form = document.getElementById('coach-post-comment-form');
    if (!form) return;
    form.reset();
    if (form.comment_id) form.comment_id.value = '';
    const submitBtn = document.getElementById('coach-post-comment-submit');
    const cancelBtn = document.getElementById('coach-post-comment-cancel');
    if (submitBtn) submitBtn.textContent = '댓글 등록';
    if (cancelBtn) cancelBtn.classList.add('hidden');
    form.dataset.postKind = String(postKind || 'note');
    form.dataset.postId = String(postId || '');
}

function resetCoachNoteCommentForm(noteId) {
    resetCoachPostCommentForm('note', noteId);
}

function startEditCoachPostComment(postKind, postId, commentId) {
    const comments = (state.coachPostComments && state.coachPostComments[getCoachPostCommentKey(postKind, postId)]) || [];
    const comment = comments.find((item) => String(item.id) === String(commentId));
    const form = document.getElementById('coach-post-comment-form');
    if (!comment || !form) return;
    if (form.comment_id) form.comment_id.value = comment.id;
    if (form.comment_body) form.comment_body.value = comment.comment_body || '';
    const submitBtn = document.getElementById('coach-post-comment-submit');
    const cancelBtn = document.getElementById('coach-post-comment-cancel');
    if (submitBtn) submitBtn.textContent = '댓글 수정';
    if (cancelBtn) cancelBtn.classList.remove('hidden');
    form.dataset.postKind = String(postKind || 'note');
    form.dataset.postId = String(postId);
    form.comment_body?.focus();
}

async function submitCoachPostComment(event) {
    event.preventDefault();
    if (!ensureCoachAccess() || !supabaseClient) return;
    const form = event.target;
    const postKind = String(form.dataset.postKind || 'note').trim();
    const postId = String(form.dataset.postId || '').trim();
    const commentId = String(form.comment_id?.value || '').trim();
    const body = String(form.comment_body?.value || '').trim();
    if (!postId) return;
    if (!body) {
        alert('댓글 내용을 입력해 주세요.');
        return;
    }
    const submitBtn = document.getElementById('coach-post-comment-submit');
    const originalLabel = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = commentId ? '수정 중...' : '등록 중...';
    }
    try {
        if (commentId) {
            await updateCoachPostComment(commentId, body);
        } else {
            await createCoachPostComment(postKind, postId, body);
        }
        await reopenCoachPostDetail(postKind, postId);
        alert(commentId ? '댓글이 수정되었습니다.' : '댓글이 등록되었습니다.');
    } catch (error) {
        alert(`댓글 저장 실패: ${error.message || error}`);
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalLabel || '댓글 등록';
        }
    }
}

async function handleDeleteCoachPostComment(postKind, postId, commentId) {
    if (!ensureCoachAccess() || !supabaseClient) return;
    if (!confirm('이 댓글을 삭제할까요?')) return;
    try {
        await deleteCoachPostComment(commentId);
        await reopenCoachPostDetail(postKind, postId);
        alert('댓글이 삭제되었습니다.');
    } catch (error) {
        alert(`댓글 삭제 실패: ${error.message || error}`);
    }
}

function renderCoachPostCommentsSection(postKind, postId, comments) {
    const listHtml = comments.length
        ? comments.map((comment) => `
            <div class="rounded-2xl border border-gray-100 bg-white p-4">
                <div class="flex items-start justify-between gap-3">
                    <div>
                        <p class="text-sm font-semibold text-gray-900">${escapeHtml(comment.author_name || '코치')}</p>
                        <p class="text-[11px] text-gray-400 mt-1">${escapeHtml(formatCoachCommentTime(comment.created_at))}${comment.updated_at && comment.updated_at !== comment.created_at ? ' · 수정됨' : ''}</p>
                    </div>
                    ${canManageCoachPostComment(comment) ? `
                        <div class="flex gap-2">
                            <button type="button" onclick="startEditCoachPostComment('${escapeHtml(postKind)}','${escapeHtml(String(postId))}','${escapeHtml(comment.id)}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold border border-gray-200 text-gray-700 hover:bg-gray-50">수정</button>
                            <button type="button" onclick="handleDeleteCoachPostComment('${escapeHtml(postKind)}','${escapeHtml(String(postId))}','${escapeHtml(comment.id)}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold border border-red-200 text-red-600 hover:bg-red-50">삭제</button>
                        </div>
                    ` : ''}
                </div>
                <p class="mt-3 text-sm text-gray-700 break-keep">${escapeHtml(comment.comment_body || '')}</p>
            </div>
        `).join('')
        : '<p class="text-sm text-gray-500">아직 댓글이 없습니다.</p>';

    return `
        <div class="mt-6 rounded-2xl border border-gray-100 bg-er-base/30 p-4">
            <div class="flex items-center justify-between gap-3 mb-4">
                <h5 class="text-sm font-bold text-er-dark">댓글</h5>
                <span class="text-xs text-gray-400">${comments.length}개</span>
            </div>
            <div class="space-y-3">${listHtml}</div>
            <form id="coach-post-comment-form" data-post-kind="${escapeHtml(postKind)}" data-post-id="${escapeHtml(String(postId))}" onsubmit="submitCoachPostComment(event)" class="mt-4 space-y-3">
                <input type="hidden" name="comment_id" value="">
                <textarea name="comment_body" rows="3" placeholder="댓글을 입력해 주세요." class="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-er-accent/30"></textarea>
                <div class="flex gap-2">
                    <button id="coach-post-comment-submit" type="submit" class="px-4 py-2 rounded-full text-xs font-bold bg-er-dark text-white">댓글 등록</button>
                    <button id="coach-post-comment-cancel" type="button" onclick="resetCoachPostCommentForm('${escapeHtml(postKind)}','${escapeHtml(String(postId))}')" class="hidden px-4 py-2 rounded-full text-xs font-bold border border-gray-200 text-gray-700 hover:bg-gray-50">수정 취소</button>
                </div>
            </form>
        </div>
    `;
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
    let comments = [];
    try {
        comments = await fetchCoachPostComments('note', note.id);
    } catch (commentError) {
        console.error('coach note comments load failed', commentError);
    }

    const scheduleStartLabel = schedule ? escapeHtml(formatDateTime(schedule.start_at)) : '';
    const scheduleLocationLabel = schedule && schedule.location ? ` ${renderScheduleLocation(schedule.location)}` : '';

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
        ${renderCoachPostCommentsSection('note', note.id, comments)}
    `;
    resetCoachNoteCommentForm(note.id);
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
    closeCoachNoteModal();
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

function getCoachTypingPracticumReport(reportId) {
    return (state.coachTypingPracticumReports || []).find((item) => String(item.id) === String(reportId)) || null;
}

function canManageCoachTypingPracticum(report) {
    if (!report || !state.user) return false;
    return String(report.coach_user_id || '') === String(state.user.id || '') || isHeadCoach();
}

function formatCoachTypingPracticumReviewStatus(value) {
    const key = String(value || '').toLowerCase();
    if (key === 'selected') return '리뷰 선정';
    if (key === 'reviewed') return '피드백 완료';
    return '리뷰 대기';
}

function closeCoachTypingPracticumModal() {
    const modal = document.getElementById('coach-typing-practicum-modal');
    if (modal) modal.classList.add('hidden');
}

function toggleCoachTypingPracticumAttachmentRow(showRow) {
    const row = document.getElementById('coach-typing-practicum-remove-attachment-row');
    if (!row) return;
    row.classList.toggle('hidden', !showRow);
    row.classList.toggle('flex', !!showRow);
    const checkbox = row.querySelector('input[name="remove_attachment"]');
    if (checkbox && !showRow) checkbox.checked = false;
}

function resetCoachTypingPracticumForm() {
    const form = document.getElementById('coach-typing-practicum-form');
    if (!form) return;
    form.reset();
    form.querySelector('input[name="report_id"]').value = '';
    form.dataset.attachmentPath = '';
    form.dataset.attachmentName = '';
    const titleEl = document.getElementById('coach-typing-practicum-form-title');
    if (titleEl) titleEl.textContent = 'Typing 보고서 제출';
    const submitBtn = document.getElementById('coach-typing-practicum-submit-btn');
    if (submitBtn) submitBtn.textContent = 'Typing 보고서 저장';
    const cancelBtn = document.getElementById('coach-typing-practicum-cancel-btn');
    if (cancelBtn) cancelBtn.classList.add('hidden');
    toggleCoachTypingPracticumAttachmentRow(false);
}

function openCoachTypingPracticumModal(reportId = '') {
    if (!ensureCoachAccess() || !supabaseClient) return;
    const modal = document.getElementById('coach-typing-practicum-modal');
    const form = document.getElementById('coach-typing-practicum-form');
    if (!modal || !form) return;
    resetCoachTypingPracticumForm();
    modal.classList.remove('hidden');

    const report = reportId ? getCoachTypingPracticumReport(reportId) : null;
    if (!report) return;
    form.querySelector('input[name="report_id"]').value = report.id || '';
    form.querySelector('input[name="participant_name"]').value = report.participant_name || '';
    form.querySelector('select[name="participant_gender"]').value = report.participant_gender || '';
    form.querySelector('select[name="enneagram_base"]').value = report.enneagram_base || '';
    form.querySelector('select[name="subtype_primary"]').value = report.subtype_primary || '';
    form.querySelector('select[name="wing"]').value = report.wing || '';
    form.querySelector('input[name="session_date"]').value = report.session_date || '';
    form.querySelector('input[name="session_time_text"]').value = report.session_time_text || '';
    form.querySelector('input[name="youtube_url"]').value = report.youtube_url || '';
    form.querySelector('textarea[name="report_body"]').value = report.report_body || '';
    if (form.querySelector('select[name="review_status"]')) {
        form.querySelector('select[name="review_status"]').value = report.review_status || 'pending';
    }
    form.dataset.attachmentPath = report.attachment_path || '';
    form.dataset.attachmentName = report.attachment_name || '';
    toggleCoachTypingPracticumAttachmentRow(Boolean(report.attachment_path));

    const titleEl = document.getElementById('coach-typing-practicum-form-title');
    if (titleEl) titleEl.textContent = 'Typing 보고서 수정';
    const submitBtn = document.getElementById('coach-typing-practicum-submit-btn');
    if (submitBtn) submitBtn.textContent = 'Typing 보고서 수정 저장';
    const cancelBtn = document.getElementById('coach-typing-practicum-cancel-btn');
    if (cancelBtn) cancelBtn.classList.remove('hidden');
}

async function loadCoachTypingPracticumReports() {
    if (!ensureCoachAccess() || !supabaseClient) return;
    const listEl = document.getElementById('coach-typing-practicum-list');
    if (listEl) listEl.innerHTML = renderListSkeleton(3);

    const { data, error } = await supabaseClient
        .from('coach_typing_practicum_reports')
        .select('id, coach_user_id, coach_display_name, month_key, participant_name, participant_gender, enneagram_base, subtype_primary, wing, session_date, session_time_text, youtube_url, report_body, attachment_path, attachment_name, attachment_size_bytes, review_status, created_at, updated_at')
        .order('session_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(24);

    if (error) {
        const lower = String(error.message || '').toLowerCase();
        if (String(error.code || '') === '42P01' || String(error.code || '') === 'PGRST205' || lower.includes('does not exist')) {
            if (listEl) listEl.innerHTML = '<p class="text-sm text-gray-500">Typing 보고서 테이블이 아직 준비되지 않았습니다.</p>';
            state.coachTypingPracticumReports = [];
            return;
        }
        if (listEl) listEl.innerHTML = `<p class="text-red-500 text-xs">Typing 보고서 로딩 실패: ${escapeHtml(error.message)}</p>`;
        state.coachTypingPracticumReports = [];
        return;
    }

    state.coachTypingPracticumReports = data || [];
    if (listEl) {
        listEl.innerHTML = (data || []).length
            ? (data || []).map((report) => {
                const canManage = canManageCoachTypingPracticum(report);
                const typeLabel = [report.enneagram_base ? `기본유형 ${report.enneagram_base}` : '', report.subtype_primary || '', report.wing ? `w${report.wing}` : ''].filter(Boolean).join(' · ');
                const reportLabel = report.attachment_path ? '첨부 보고서' : (report.report_body ? '본문 보고서' : '보고서 없음');
                return `
                    <div class="border border-gray-100 rounded-2xl p-4">
                        <div class="flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <button type="button" onclick="viewCoachTypingPracticumDetail('${report.id}')" class="text-left font-bold text-gray-900 hover:text-er-accent transition-colors">${escapeHtml(report.participant_name || 'Typing 보고서')}</button>
                                <p class="text-xs text-gray-400 mt-1">${escapeHtml(report.coach_display_name || '코치')} · ${escapeHtml(report.month_key || '-')} · ${escapeHtml(report.session_date || '-')} ${escapeHtml(report.session_time_text || '')}</p>
                            </div>
                            <span class="text-[11px] px-2 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-600">${escapeHtml(formatCoachTypingPracticumReviewStatus(report.review_status))}</span>
                        </div>
                        <p class="text-xs text-gray-500 mt-2 break-keep">${escapeHtml(typeLabel || '유형 정보 미입력')} · ${escapeHtml(reportLabel)}</p>
                        <div class="mt-3 flex gap-2">
                            <button onclick="viewCoachTypingPracticumDetail('${report.id}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold border border-gray-200 text-gray-700 hover:bg-gray-50">상세 보기</button>
                            ${canManage ? `<button onclick="openCoachTypingPracticumModal('${report.id}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold bg-er-dark text-white">수정</button>` : ''}
                            ${canManage ? `<button onclick="deleteCoachTypingPracticum('${report.id}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold border border-red-200 text-red-600 hover:bg-red-50">삭제</button>` : ''}
                        </div>
                    </div>
                `;
            }).join('')
            : '<p class="text-sm text-gray-500">등록된 Typing 보고서가 없습니다.</p>';
    }
}

async function viewCoachTypingPracticumDetail(reportId) {
    if (!ensureCoachAccess() || !supabaseClient) return;
    const detailEl = document.getElementById('coach-typing-practicum-detail');
    if (!detailEl) return;
    detailEl.classList.remove('hidden');
    detailEl.innerHTML = renderDetailSkeleton();

    const { data: report, error } = await supabaseClient
        .from('coach_typing_practicum_reports')
        .select('id, coach_user_id, coach_display_name, month_key, participant_name, participant_gender, enneagram_base, subtype_primary, wing, session_date, session_time_text, youtube_url, report_body, attachment_path, attachment_name, attachment_size_bytes, review_status, created_at, updated_at')
        .eq('id', reportId)
        .maybeSingle();

    if (error || !report) {
        detailEl.innerHTML = `<p class="text-xs text-red-500">Typing 보고서 상세 로딩 실패: ${escapeHtml(error?.message || 'not found')}</p>`;
        return;
    }

    let comments = [];
    try {
        comments = await fetchCoachPostComments('typing_practicum_report', report.id);
    } catch (commentError) {
        console.error('typing practicum comments load failed', commentError);
    }

    let signedUrl = '';
    if (report.attachment_path) {
        const { data: signed, error: signedError } = await supabaseClient.storage
            .from('coach-typing-practicum')
            .createSignedUrl(report.attachment_path, 300);
        if (!signedError) signedUrl = signed?.signedUrl || '';
    }

    const canManage = canManageCoachTypingPracticum(report);
    const typeLabel = [report.participant_gender || '-', report.enneagram_base ? `기본유형 ${report.enneagram_base}` : '', report.subtype_primary ? `하위유형 ${report.subtype_primary}` : '', report.wing ? `윙 ${report.wing}` : ''].filter(Boolean).join(' · ');
    detailEl.innerHTML = `
        <div class="flex items-start justify-between gap-3">
            <div>
                <h4 class="text-base font-bold text-gray-900">${escapeHtml(report.participant_name || 'Typing 보고서')}</h4>
                <p class="text-xs text-gray-500 mt-1">${escapeHtml(report.coach_display_name || '코치')} · ${escapeHtml(report.month_key || '-')} · ${escapeHtml(report.session_date || '-')} ${escapeHtml(report.session_time_text || '')}</p>
                <p class="text-xs text-gray-500 mt-1">${escapeHtml(typeLabel || '-')}</p>
                <p class="text-xs text-gray-400 mt-1">상태: ${escapeHtml(formatCoachTypingPracticumReviewStatus(report.review_status))} · 업데이트: ${formatDateTime(report.updated_at)}</p>
            </div>
            <div class="flex gap-2">
                ${report.youtube_url ? `<a href="${escapeHtml(report.youtube_url)}" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 rounded-full text-[11px] font-bold border border-gray-200 text-gray-700 hover:bg-gray-50">영상 열기</a>` : ''}
                ${report.attachment_path ? `<button onclick="downloadCoachTypingPracticumAttachment('${encodeURIComponent(report.attachment_path || '')}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold border border-gray-200 text-gray-700 hover:bg-gray-50">첨부 다운로드</button>` : ''}
                ${canManage ? `<button onclick="openCoachTypingPracticumModal('${report.id}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold bg-er-dark text-white">수정</button>` : ''}
            </div>
        </div>
        <div class="mt-4 p-3 rounded-xl border border-gray-100 bg-white text-sm text-gray-700 break-keep">${escapeHtml(report.report_body || '첨부 파일로만 제출되었습니다.')}</div>
        ${report.attachment_name ? `<p class="mt-4 text-xs text-gray-500">첨부: ${escapeHtml(report.attachment_name)} · ${getFileSizeLabel(report.attachment_size_bytes)}</p>` : '<p class="mt-4 text-xs text-gray-500">첨부파일이 없습니다.</p>'}
        ${signedUrl && report.attachment_name && /\.pdf$/i.test(report.attachment_name) ? `<iframe src="${signedUrl}" class="mt-4 w-full h-96 rounded-xl border border-gray-100 bg-white"></iframe>` : ''}
        ${renderCoachPostCommentsSection('typing_practicum_report', report.id, comments)}
    `;
    resetCoachPostCommentForm('typing_practicum_report', report.id);
}

async function submitCoachTypingPracticum(event) {
    event.preventDefault();
    if (!ensureCoachAccess() || !supabaseClient) return;
    const form = event.target;
    const formData = new FormData(form);
    const reportId = String(formData.get('report_id') || '').trim();
    const participant_name = String(formData.get('participant_name') || '').trim();
    const session_date = String(formData.get('session_date') || '').trim();
    const youtube_url = String(formData.get('youtube_url') || '').trim();
    const report_body = String(formData.get('report_body') || '').trim();
    const file = form.querySelector('input[name="file"]')?.files?.[0];
    const removeAttachment = String(formData.get('remove_attachment') || '') === 'true';
    const month_key = session_date ? session_date.slice(0, 7) : '';
    if (!participant_name || !session_date || !youtube_url) {
        alert('이름, 세션 날짜, YouTube 링크를 입력해 주세요.');
        return;
    }

    const existing = reportId ? getCoachTypingPracticumReport(reportId) : null;
    let attachment_path = existing?.attachment_path || '';
    let attachment_name = existing?.attachment_name || '';
    let attachment_mime_type = existing?.attachment_mime_type || null;
    let attachment_size_bytes = existing?.attachment_size_bytes || null;

    if (removeAttachment && attachment_path) {
        await supabaseClient.storage.from('coach-typing-practicum').remove([attachment_path]);
        attachment_path = '';
        attachment_name = '';
        attachment_mime_type = null;
        attachment_size_bytes = null;
    }

    if (file) {
        const check = validateUploadFile(file);
        if (!check.ok) {
            alert(check.reason);
            return;
        }
        const safeName = `${Date.now()}_${buildSafeStorageFileName(file.name)}`;
        const ownerKey = existing?.coach_user_id || state.user.id;
        const storagePath = `${ownerKey}/${month_key}/${safeName}`;
        const uploadRes = await supabaseClient.storage.from('coach-typing-practicum').upload(storagePath, file, {
            upsert: false,
            contentType: file.type || undefined
        });
        if (uploadRes.error) {
            alert(`첨부 업로드 실패: ${uploadRes.error.message}`);
            return;
        }
        if (existing?.attachment_path && existing.attachment_path !== attachment_path) {
            await supabaseClient.storage.from('coach-typing-practicum').remove([existing.attachment_path]);
        }
        attachment_path = storagePath;
        attachment_name = file.name;
        attachment_mime_type = file.type || null;
        attachment_size_bytes = file.size || null;
    }

    if (!report_body && !attachment_path) {
        alert('보고서 본문을 입력하거나 첨부 파일을 올려 주세요.');
        return;
    }

    const payload = {
        coach_user_id: existing?.coach_user_id || state.user.id,
        coach_display_name: state.coachProfile?.display_name || state.user.email || '코치',
        month_key,
        participant_name,
        participant_gender: String(formData.get('participant_gender') || '').trim() || null,
        enneagram_base: String(formData.get('enneagram_base') || '').trim() || null,
        subtype_primary: String(formData.get('subtype_primary') || '').trim() || null,
        wing: String(formData.get('wing') || '').trim() || null,
        session_date,
        session_time_text: String(formData.get('session_time_text') || '').trim() || null,
        youtube_url,
        report_body: report_body || null,
        attachment_path: attachment_path || null,
        attachment_name: attachment_name || null,
        attachment_mime_type,
        attachment_size_bytes,
        review_status: String(formData.get('review_status') || existing?.review_status || 'pending').trim() || 'pending',
        updated_at: new Date().toISOString()
    };

    let resultId = reportId;
    if (reportId) {
        const { error } = await supabaseClient
            .from('coach_typing_practicum_reports')
            .update(payload)
            .eq('id', reportId);
        if (error) {
            alert(`Typing 보고서 저장 실패: ${error.message}`);
            return;
        }
    } else {
        const { data: inserted, error } = await supabaseClient
            .from('coach_typing_practicum_reports')
            .insert([payload])
            .select('id')
            .single();
        if (error || !inserted?.id) {
            alert(`Typing 보고서 저장 실패: ${error?.message || 'unknown error'}`);
            return;
        }
        resultId = inserted.id;
    }

    resetCoachTypingPracticumForm();
    closeCoachTypingPracticumModal();
    await loadCoachTypingPracticumReports();
    if (resultId) await viewCoachTypingPracticumDetail(resultId);
    alert('Typing 보고서가 저장되었습니다.');
}

async function downloadCoachTypingPracticumAttachment(encodedStoragePath) {
    if (!ensureCoachAccess() || !supabaseClient) return;
    const path = decodeURIComponent(String(encodedStoragePath || ''));
    if (!path) return;
    const { data, error } = await supabaseClient.storage.from('coach-typing-practicum').createSignedUrl(path, 60);
    if (error || !data?.signedUrl) {
        alert(`첨부 다운로드 링크 생성 실패: ${error?.message || 'unknown error'}`);
        return;
    }
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
}

async function deleteCoachTypingPracticum(reportId) {
    if (!ensureCoachAccess() || !supabaseClient) return;
    const existing = getCoachTypingPracticumReport(reportId);
    if (!existing) {
        alert('삭제할 Typing 보고서를 다시 불러와 주세요.');
        return;
    }
    if (!canManageCoachTypingPracticum(existing)) {
        alert('본인 제출 또는 헤드 코치만 삭제할 수 있습니다.');
        return;
    }
    if (!confirm('이 Typing 보고서를 삭제할까요?')) return;

    if (existing.attachment_path) {
        await supabaseClient.storage.from('coach-typing-practicum').remove([existing.attachment_path]);
    }
    const { error } = await supabaseClient
        .from('coach_typing_practicum_reports')
        .delete()
        .eq('id', reportId);
    if (error) {
        alert(`Typing 보고서 삭제 실패: ${error.message}`);
        return;
    }

    const detailEl = document.getElementById('coach-typing-practicum-detail');
    if (detailEl) {
        detailEl.classList.add('hidden');
        detailEl.innerHTML = '';
    }
    await loadCoachTypingPracticumReports();
    alert('Typing 보고서가 삭제되었습니다.');
}

async function loadCoachTasks() {
    if (!ensureCoachAccess() || !supabaseClient) return;
    const listEl = document.getElementById('coach-tasks-list');
    if (listEl) listEl.innerHTML = renderListSkeleton(4);
    await loadCoachTypingPracticumReports();

    const { data: tasksRaw, error } = await supabaseClient
        .from('coach_tasks')
        .select('id, title, description, due_at, week_label, status, created_at, created_by, coach_task_files(id)')
        .order('created_at', { ascending: false })
        .limit(80);

    if (error) {
        if (listEl) listEl.innerHTML = `<p class="text-red-500 text-xs">훈련 기록 로딩 실패: ${escapeHtml(error.message)}</p>`;
        return;
    }

    let tasks = tasksRaw || [];
    const authorIds = [...new Set(tasks.map((t) => t.created_by).filter(Boolean))];
    if (authorIds.length) {
        const pr = await supabaseClient.from('coach_profiles').select('user_id, display_name').in('user_id', authorIds);
        if (!pr.error && pr.data) {
            const map = Object.fromEntries(pr.data.map((p) => [p.user_id, p.display_name]));
            tasks = tasks.map((t) => Object.assign({}, t, { author_display_name: map[t.created_by] || '코치' }));
        }
    }

    if (listEl) {
        state.coachListCounts.tasks = tasks.length;
        listEl.innerHTML = tasks.length
            ? tasks.map((task) => {
                const canEdit = canManageCoachTaskRecord(task);
                const who = task.author_display_name ? `작성: ${escapeHtml(task.author_display_name)} · ` : '';
                return `
                <div class="border border-gray-100 rounded-2xl p-4">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                        <h4 class="font-bold text-gray-900">${escapeHtml(task.title)}</h4>
                        <span class="text-[11px] px-2 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-600">${escapeHtml(task.status || '-')}</span>
                    </div>
                    <p class="text-xs text-gray-500 mt-2 break-keep">${escapeHtml(task.description || '-')}</p>
                    <p class="text-xs text-gray-400 mt-2">${who}주차: ${escapeHtml(task.week_label || '-')} · 마감: ${formatDateTime(task.due_at)} · 첨부: ${(task.coach_task_files || []).length}개</p>
                    <div class="mt-3 flex gap-2 flex-wrap">
                        <button onclick="viewCoachTaskDetail('${task.id}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold border border-gray-200 text-gray-700 hover:bg-gray-50">상세 보기</button>
                        ${canEdit ? `
                        <button onclick="editCoachTask('${task.id}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold bg-er-dark text-white">수정</button>
                        <button onclick="deleteCoachTask('${task.id}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold border border-red-200 text-red-600 hover:bg-red-50">삭제</button>
                        ` : '<span class="text-[11px] text-gray-400 self-center">수정·삭제는 작성자 또는 수석 코치만</span>'}
                    </div>
                </div>
            `;
            }).join('')
            : '<p class="text-sm text-gray-500">등록된 훈련 기록이 없습니다.</p>';
    }
}

async function viewCoachTaskDetail(taskId) {
    if (!ensureCoachAccess() || !supabaseClient) return;
    const detailEl = document.getElementById('coach-task-detail');
    if (!detailEl) return;
    detailEl.classList.remove('hidden');
    detailEl.innerHTML = renderDetailSkeleton();

    const { data: task, error } = await supabaseClient
        .from('coach_tasks')
        .select('id, title, description, due_at, week_label, status, created_at, created_by')
        .eq('id', taskId)
        .maybeSingle();

    if (error || !task) {
        detailEl.innerHTML = `<p class="text-xs text-red-500">훈련 기록 상세 로딩 실패: ${escapeHtml(error?.message || 'not found')}</p>`;
        return;
    }

    let authorLabel = '';
    if (task.created_by) {
        const pr = await supabaseClient.from('coach_profiles').select('display_name').eq('user_id', task.created_by).maybeSingle();
        if (!pr.error && pr.data) authorLabel = pr.data.display_name || '';
    }
    const canEdit = canManageCoachTaskRecord(task);

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
                ${authorLabel ? `<p class="text-xs text-gray-500 mt-1">작성 코치: ${escapeHtml(authorLabel)}</p>` : ''}
            </div>
            <div class="flex gap-2 flex-wrap justify-end">
                ${canEdit ? `
                <button onclick="editCoachTask('${task.id}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold bg-er-dark text-white">이 기록 수정</button>
                <button onclick="deleteCoachTask('${task.id}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold border border-red-200 text-red-600 hover:bg-red-50">삭제</button>
                ` : '<span class="text-[11px] text-gray-400 text-right">수정·삭제는 작성자 또는 수석 코치만 가능합니다</span>'}
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
        .select('id, title, description, due_at, week_label, status, created_by')
        .eq('id', taskId)
        .maybeSingle();

    if (error || !task) {
        alert(`수정 데이터 로딩 실패: ${error?.message || 'not found'}`);
        return;
    }
    if (!canManageCoachTaskRecord(task)) {
        alert('본인이 작성한 보고서만 수정할 수 있습니다. (수석 코치는 예외)');
        return;
    }

    const form = document.getElementById('coach-task-form');
    if (!form) return;
    openCoachTaskModal();
    form.querySelector('input[name="task_id"]').value = task.id;
    form.querySelector('input[name="title"]').value = task.title || '';
    form.querySelector('input[name="due_at"]').value = toLocalDatetimeInputValue(task.due_at);
    form.querySelector('input[name="week_label"]').value = task.week_label || '';
    form.querySelector('select[name="status"]').value = task.status || 'published';
    form.querySelector('textarea[name="description"]').value = task.description || '';

    const titleEl = document.getElementById('coach-task-form-title');
    if (titleEl) titleEl.textContent = '훈련 기록 수정';
    const submitBtn = document.getElementById('coach-task-submit-btn');
    if (submitBtn) submitBtn.textContent = '훈련 기록 수정 저장';
    const cancelBtn = document.getElementById('coach-task-cancel-btn');
    if (cancelBtn) cancelBtn.classList.remove('hidden');
    await viewCoachTaskDetail(task.id);
}

function resetCoachTaskForm() {
    const form = document.getElementById('coach-task-form');
    if (!form) return;
    form.reset();
    form.querySelector('input[name="task_id"]').value = '';
    const titleEl = document.getElementById('coach-task-form-title');
    if (titleEl) titleEl.textContent = '새 훈련 기록 등록';
    const submitBtn = document.getElementById('coach-task-submit-btn');
    if (submitBtn) submitBtn.textContent = '훈련 기록 저장';
    const cancelBtn = document.getElementById('coach-task-cancel-btn');
    if (cancelBtn) cancelBtn.classList.add('hidden');
}

async function deleteCoachTask(taskId) {
    if (!ensureCoachAccess() || !supabaseClient) return;
    const { data: taskRow } = await supabaseClient.from('coach_tasks').select('id, created_by').eq('id', taskId).maybeSingle();
    if (!canManageCoachTaskRecord(taskRow || {})) {
        alert('본인이 작성한 보고서만 삭제할 수 있습니다. (수석 코치는 예외)');
        return;
    }
    if (!confirm('이 훈련 기록을 삭제할까요? 첨부파일도 함께 삭제됩니다.')) return;

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
        alert(`훈련 기록 삭제 실패: ${error.message}`);
        return;
    }

    const detailEl = document.getElementById('coach-task-detail');
    if (detailEl) {
        detailEl.classList.add('hidden');
        detailEl.innerHTML = '';
    }
    resetCoachTaskForm();
    await loadCoachTasks();
    alert('훈련 기록이 삭제되었습니다.');
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
            ? renderCoachMaterialCategoryTree(data || [])
            : '<p class="text-sm text-gray-500">업로드된 자료가 없습니다.</p>';
    }
}

function renderCoachMaterialCategoryTree(items) {
    if (!state.coachMaterialCategoryExpanded) state.coachMaterialCategoryExpanded = {};
    if (!state.coachMaterialFolderExpanded) state.coachMaterialFolderExpanded = {};

    const tree = {};
    items.forEach((item) => {
        const parsed = splitMaterialCategoryPath(item.category);
        const category = parsed.main || 'general';
        const folder = parsed.folder || '기본';
        if (!tree[category]) tree[category] = {};
        if (!tree[category][folder]) tree[category][folder] = [];
        tree[category][folder].push(item);
    });

    const categories = Object.keys(tree).sort((a, b) => a.localeCompare(b, 'ko'));
    return categories.map((category, categoryIndex) => {
        const encodedCategory = encodeURIComponent(category);
        if (state.coachMaterialCategoryExpanded[category] === undefined) {
            state.coachMaterialCategoryExpanded[category] = categoryIndex === 0;
        }
        const catOpen = Boolean(state.coachMaterialCategoryExpanded[category]);
        const folders = Object.keys(tree[category]).sort((a, b) => a.localeCompare(b, 'ko'));
        const total = folders.reduce((sum, folder) => sum + tree[category][folder].length, 0);
        return `
            <div class="border border-gray-100 rounded-2xl p-4">
                <button type="button" onclick="toggleCoachMaterialCategory('${encodedCategory}')" class="w-full flex items-center justify-between text-left">
                    <div>
                        <p class="text-[11px] uppercase tracking-[0.14em] text-er-accent font-bold">Category</p>
                        <h4 class="font-bold text-gray-900 mt-1">${escapeHtml(formatCoachMaterialCategoryLabel(category))}</h4>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-xs px-2 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-600">${total}개</span>
                        <span class="text-sm text-gray-500">${catOpen ? '−' : '+'}</span>
                    </div>
                </button>
                <div class="${catOpen ? 'mt-4 space-y-3' : 'hidden'}">
                    ${folders.map((folder, folderIndex) => {
                        const folderKey = `${category}__${folder}`;
                        const encodedFolderKey = encodeURIComponent(folderKey);
                        if (state.coachMaterialFolderExpanded[folderKey] === undefined) {
                            state.coachMaterialFolderExpanded[folderKey] = folderIndex === 0;
                        }
                        const folderOpen = Boolean(state.coachMaterialFolderExpanded[folderKey]);
                        const folderItems = tree[category][folder];
                        return `
                            <div class="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
                                <button type="button" onclick="toggleCoachMaterialFolder('${encodedFolderKey}')" class="w-full flex items-center justify-between text-left">
                                    <p class="text-sm font-semibold text-gray-800">${escapeHtml(folder)}</p>
                                    <div class="flex items-center gap-2">
                                        <span class="text-[11px] px-2 py-1 rounded-full bg-white border border-gray-200 text-gray-600">${folderItems.length}개</span>
                                        <span class="text-xs text-gray-500">${folderOpen ? '−' : '+'}</span>
                                    </div>
                                </button>
                                <div class="${folderOpen ? 'mt-3 space-y-2' : 'hidden'}">
                                    ${folderItems.map((item) => renderCoachMaterialRow(item)).join('')}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }).join('');
}

function renderCoachMaterialRow(item) {
    const canManage = Boolean(state.user && (item.uploaded_by === state.user.id || isHeadCoach()));
    return `
        <div class="rounded-xl border border-gray-100 bg-white p-3">
            <div class="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <button type="button" onclick="viewCoachMaterialDetail('${item.id}')" class="text-left font-semibold text-gray-900 hover:text-er-accent transition-colors">${escapeHtml(item.title)}</button>
                    <p class="text-xs text-gray-400 mt-1">${escapeHtml(item.original_name || '')} · ${getFileSizeLabel(item.size_bytes)}</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="viewCoachMaterialDetail('${item.id}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold border border-gray-200 text-gray-700 hover:bg-gray-50">보기</button>
                    <button onclick="downloadCoachMaterial('${encodeURIComponent(item.storage_path || '')}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold border border-gray-200 text-gray-700 hover:bg-gray-50">다운로드</button>
                    ${canManage
                        ? `<button onclick="startEditCoachMaterial('${item.id}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold border border-er-accent/40 text-er-dark hover:bg-er-accentLight/40">수정</button>
                           <button onclick="deleteCoachMaterial('${item.id}','${encodeURIComponent(item.storage_path || '')}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold border border-red-200 text-red-600 hover:bg-red-50">삭제</button>`
                        : ''}
                </div>
            </div>
            <p class="text-xs text-gray-500 mt-2 break-keep">${escapeHtml(item.description || '-')}</p>
        </div>
    `;
}

function formatCoachMaterialCategoryLabel(value) {
    const raw = String(value || 'general').trim();
    const labels = {
        general: '일반',
        study_track: 'Study 트랙',
        spiritual_formation_track: 'Spiritual Formation 트랙',
        coaching_track: 'Coaching 트랙',
        practicum_track: 'Practicum 트랙',
        reference: '참고자료'
    };
    return labels[raw] || raw;
}

function toggleCoachMaterialCategory(encodedCategory) {
    const category = decodeURIComponent(String(encodedCategory || ''));
    if (!category) return;
    if (!state.coachMaterialCategoryExpanded) state.coachMaterialCategoryExpanded = {};
    state.coachMaterialCategoryExpanded[category] = !Boolean(state.coachMaterialCategoryExpanded[category]);
    loadCoachMaterials();
}

function toggleCoachMaterialFolder(encodedFolderKey) {
    const folderKey = decodeURIComponent(String(encodedFolderKey || ''));
    if (!folderKey) return;
    if (!state.coachMaterialFolderExpanded) state.coachMaterialFolderExpanded = {};
    state.coachMaterialFolderExpanded[folderKey] = !Boolean(state.coachMaterialFolderExpanded[folderKey]);
    loadCoachMaterials();
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

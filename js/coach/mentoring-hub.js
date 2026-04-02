// 데스크톱 코치 포털: 코치 앱과 동일 DB의 멘토링·훈련 요약 (읽기 중심)
async function loadCoachMentoringHub() {
    if (!ensureCoachAccess() || !supabaseClient) return;
    const uid = state.user.id;
    const weekKey = getExpertCohortMentoringWeekKey();
    const weekKeys = mentoringWeekKeysForFetch(weekKey);
    const monthKey = new Date().toISOString().slice(0, 7);

    const trainingEl = document.getElementById('coach-hub-training');
    const menteesEl = document.getElementById('coach-hub-mentees');
    const followEl = document.getElementById('coach-hub-followups');
    const weeklyEl = document.getElementById('coach-hub-weekly');

    const [tpRes, menRes, fuRes, clRes, insRes] = await Promise.all([
        supabaseClient.from('coach_training_progress').select('track_key, required_count, completed_count, month_key').eq('coach_user_id', uid).eq('month_key', monthKey),
        supabaseClient.from('coach_mentees').select('id, display_name, risk_level, next_session_at, enneagram_core, enneagram_wing, subtype_primary').eq('coach_user_id', uid).eq('is_active', true).order('display_name'),
        supabaseClient.from('coach_mentoring_followups').select('id, title, summary, due_at, status, updated_at').eq('coach_user_id', uid).order('updated_at', { ascending: false }).limit(40),
        supabaseClient.from('coach_mentoring_weekly_checklists').select('mentee_id, week_key, check_type_confirmed, check_homework_reviewed, memo, updated_at').eq('coach_user_id', uid).in('week_key', weekKeys),
        supabaseClient.from('coach_mentee_insights').select('mentee_id, week_key, key_pattern, suggested_focus, urgency_level, updated_at').eq('coach_user_id', uid).in('week_key', weekKeys),
    ]);

    if (trainingEl) {
        if (tpRes.error) {
            trainingEl.innerHTML = `<p class="text-red-500 text-xs">${escapeHtml(tpRes.error.message)}</p>`;
        } else {
            const rows = tpRes.data || [];
            trainingEl.innerHTML = rows.length
                ? rows.map((r) => `
                    <div class="border border-gray-100 rounded-xl p-3 mb-2">
                        <p class="font-semibold text-gray-900">${escapeHtml(r.track_key || '-')}</p>
                        <p class="text-xs text-gray-500 mt-1">목표 ${r.required_count ?? '-'} · 완료 ${r.completed_count ?? '-'}</p>
                    </div>`).join('')
                : '<p class="text-sm text-gray-500">이번 달 훈련 진행 행이 없습니다.</p>';
        }
    }

    if (menteesEl) {
        if (menRes.error) {
            menteesEl.innerHTML = `<p class="text-red-500 text-xs">${escapeHtml(menRes.error.message)}</p>`;
        } else {
            const rows = menRes.data || [];
            menteesEl.innerHTML = rows.length
                ? rows.map((m) => {
                    const eg = [m.enneagram_core, m.subtype_primary, m.enneagram_wing].filter(Boolean).join(' · ') || '-';
                    return `
                    <div class="border border-gray-100 rounded-xl p-3 mb-2">
                        <p class="font-semibold text-gray-900">${escapeHtml(m.display_name || '멘티')}</p>
                        <p class="text-xs text-gray-500 mt-1">유형 ${escapeHtml(eg)} · 위험도 ${escapeHtml(m.risk_level || '-')}</p>
                        <p class="text-xs text-gray-400 mt-1">다음: ${formatDateTime(m.next_session_at)}</p>
                    </div>`;
                }).join('')
                : '<p class="text-sm text-gray-500">등록된 멘티가 없습니다.</p>';
        }
    }

    if (followEl) {
        if (fuRes.error) {
            followEl.innerHTML = `<p class="text-red-500 text-xs">${escapeHtml(fuRes.error.message)}</p>`;
        } else {
            const rows = fuRes.data || [];
            followEl.innerHTML = rows.length
                ? rows.map((f) => `
                    <div class="border border-gray-100 rounded-xl p-3 mb-2 flex flex-wrap items-start justify-between gap-2">
                        <div class="min-w-0">
                            <p class="font-semibold text-gray-900">${escapeHtml(f.title || '후속')}</p>
                            <p class="text-xs text-gray-500 mt-1 break-keep">${escapeHtml(f.summary || '-')}</p>
                            <p class="text-xs text-gray-400 mt-1">상태 ${escapeHtml(f.status || '-')} · 마감 ${formatDateTime(f.due_at)}</p>
                        </div>
                        <div class="flex gap-1 shrink-0">
                            <button type="button" onclick="setDesktopFollowupStatus('${f.id}','done')" class="px-2 py-1 rounded-full text-[10px] font-bold bg-er-dark text-white">완료</button>
                            <button type="button" onclick="setDesktopFollowupStatus('${f.id}','pending')" class="px-2 py-1 rounded-full text-[10px] font-bold border border-gray-200 text-gray-700">대기</button>
                        </div>
                    </div>`).join('')
                : '<p class="text-sm text-gray-500">후속 과제가 없습니다.</p>';
        }
    }

    if (weeklyEl) {
        if (clRes.error && insRes.error) {
            weeklyEl.innerHTML = `<p class="text-red-500 text-xs">${escapeHtml(clRes.error.message || insRes.error.message)}</p>`;
        } else {
            const cl = clRes.error ? [] : dedupeMentoringRowsByMentee(clRes.data || [], weekKey);
            const ins = insRes.error ? [] : dedupeMentoringRowsByMentee(insRes.data || [], weekKey);
            let html = '';
            if (cl.length) {
                html += '<p class="text-xs font-bold text-gray-700 mb-2">주간 체크리스트</p>';
                html += cl.map((c) => `
                    <div class="border border-gray-100 rounded-xl p-3 mb-2 text-xs text-gray-600">
                        멘티 ID <span class="font-mono">${escapeHtml(String(c.mentee_id).slice(0, 8))}…</span>
                        · 유형확인 ${c.check_type_confirmed ? '✓' : '—'} · 과제검토 ${c.check_homework_reviewed ? '✓' : '—'}
                        <p class="mt-1 text-gray-500 break-keep">${escapeHtml((c.memo || '').slice(0, 200))}${(c.memo || '').length > 200 ? '…' : ''}</p>
                    </div>`).join('');
            }
            if (ins.length) {
                html += '<p class="text-xs font-bold text-gray-700 mb-2 mt-4">주간 인사이트</p>';
                html += ins.map((i) => `
                    <div class="border border-gray-100 rounded-xl p-3 mb-2 text-xs text-gray-600">
                        <p><strong>패턴</strong> ${escapeHtml(i.key_pattern || '-')}</p>
                        <p class="mt-1"><strong>제안 초점</strong> ${escapeHtml(i.suggested_focus || '-')}</p>
                        <p class="text-gray-400 mt-1">긴급도 ${escapeHtml(i.urgency_level || '-')} · ${formatDateTime(i.updated_at)}</p>
                    </div>`).join('');
            }
            weeklyEl.innerHTML = html || '<p class="text-sm text-gray-500">이번 주 체크리스트·인사이트가 없습니다. Coach App에서 작성할 수 있습니다.</p>';
        }
    }
}

async function setDesktopFollowupStatus(followupId, status) {
    if (!ensureCoachAccess() || !supabaseClient) return;
    const { error } = await supabaseClient
        .from('coach_mentoring_followups')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', followupId);
    if (error) {
        alert(`상태 변경 실패: ${error.message}`);
        return;
    }
    await loadCoachMentoringHub();
}

if (typeof window !== 'undefined') {
    window.loadCoachMentoringHub = loadCoachMentoringHub;
    window.setDesktopFollowupStatus = setDesktopFollowupStatus;
}

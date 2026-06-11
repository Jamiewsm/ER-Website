// 헤드 코치용 프로그램 신청 목록·상태·후속 메일 발송

const PROGRAM_APPLICATION_STATUS_LABELS = {
  received: '접수',
  contacted: '연락 완료',
  payment_pending: '결제 대기',
  confirmed: '등록 확정',
  waitlisted: '대기',
  cancelled: '취소'
};

function formatProgramApplicationStatus(status) {
  return PROGRAM_APPLICATION_STATUS_LABELS[status] || status || '-';
}

async function loadProgramApplications() {
  if (!ensureCoachAccess() || !canManageCoachAdmin() || !supabaseClient) return;
  const listEl = document.getElementById('coach-admin-applications-list');
  if (listEl) listEl.innerHTML = renderListSkeleton(4);

  const { data, error } = await supabaseClient.rpc('admin_list_program_applications', {
    p_program_key: 'enneagram_basic_july',
    p_limit: 100
  });

  if (error) {
    if (listEl) {
      listEl.innerHTML = `<p class="text-red-500 text-xs">신청 목록 로딩 실패: ${escapeHtml(error.message)}</p>`;
    }
    return;
  }

  state.programApplications = data || [];
  if (!listEl) return;

  if (!state.programApplications.length) {
    listEl.innerHTML = '<p class="text-sm text-gray-500">7월 기본과정 신청이 아직 없습니다.</p>';
    return;
  }

  listEl.innerHTML = state.programApplications.map((row) => {
    const status = row.status || 'received';
    const statusOptions = Object.keys(PROGRAM_APPLICATION_STATUS_LABELS).map((key) => {
      const selected = key === status ? 'selected' : '';
      return `<option value="${key}" ${selected}>${PROGRAM_APPLICATION_STATUS_LABELS[key]}</option>`;
    }).join('');

    return `
      <div class="border border-gray-100 rounded-2xl p-4 space-y-3" data-application-id="${escapeHtml(row.id)}">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="font-bold text-gray-900">${escapeHtml(row.name || '-')}</p>
            <p class="text-xs text-gray-500 mt-1 break-all">연락처: ${escapeHtml(row.contact || '-')}</p>
            <p class="text-xs text-gray-500 mt-1">유입: ${escapeHtml(row.apply_source || row.source || '-')}</p>
            <p class="text-xs text-gray-400 mt-1">접수: ${formatDateTime(row.created_at)}</p>
          </div>
          <span class="px-3 py-1 rounded-full text-[11px] font-bold bg-er-base text-er-dark border border-er-accentLight">
            ${escapeHtml(formatProgramApplicationStatus(status))}
          </span>
        </div>
        ${row.message ? `<pre class="text-xs text-gray-600 whitespace-pre-wrap font-sans bg-gray-50 rounded-xl p-3 max-h-32 overflow-y-auto">${escapeHtml(row.message)}</pre>` : ''}
        <div class="flex flex-wrap gap-2 items-center">
          <select onchange="updateProgramApplicationStatus('${row.id}', this.value)" class="rounded-xl border border-gray-200 px-3 py-2 text-xs">
            ${statusOptions}
          </select>
          <button type="button" onclick="sendProgramApplicationEmail('${row.id}', 'registration')" class="px-3 py-1.5 rounded-full text-[11px] font-bold border border-gray-200 text-gray-700 hover:bg-gray-50">결제 안내 메일</button>
          <button type="button" onclick="sendProgramApplicationEmail('${row.id}', 'pre_survey')" class="px-3 py-1.5 rounded-full text-[11px] font-bold border border-er-accent/40 text-er-dark hover:bg-er-accentLight/30">사전 성찰 메일</button>
          <button type="button" onclick="sendProgramApplicationEmail('${row.id}', 'graduation')" class="px-3 py-1.5 rounded-full text-[11px] font-bold border border-gray-200 text-gray-500 hover:bg-gray-50">수료·양성반 안내</button>
        </div>
      </div>
    `;
  }).join('');
}

async function updateProgramApplicationStatus(applicationId, status) {
  if (!ensureCoachAccess() || !canManageCoachAdmin() || !supabaseClient) return;

  const { error } = await supabaseClient.rpc('admin_update_program_application_status', {
    p_id: applicationId,
    p_status: status
  });

  if (error) {
    alert('상태 변경 실패: ' + error.message);
    await loadProgramApplications();
    return;
  }

  if (status === 'confirmed') {
    const send = confirm('등록 확정으로 변경했습니다. 사전 성찰 설문 메일을 지금 보낼까요?');
    if (send) await sendProgramApplicationEmail(applicationId, 'pre_survey');
  }

  await loadProgramApplications();
}

async function sendProgramApplicationEmail(applicationId, event) {
  if (!ensureCoachAccess() || !canManageCoachAdmin() || !supabaseClient) return;

  const config = window.SUPABASE_CONFIG || {};
  const { data: sessionData } = await supabaseClient.auth.getSession();
  const token = sessionData?.session?.access_token;
  if (!token || !config.url) {
    alert('로그인 세션이 필요합니다.');
    return;
  }

  try {
    const response = await fetch(config.url + '/functions/v1/notify-program-application', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      },
      body: JSON.stringify({ application_id: applicationId, event })
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'HTTP ' + response.status);
    }

    alert('메일 발송 요청이 완료되었습니다.');
    await loadProgramApplications();
  } catch (err) {
    alert('메일 발송 실패: ' + (err instanceof Error ? err.message : String(err)));
  }
}

window.loadProgramApplications = loadProgramApplications;
window.updateProgramApplicationStatus = updateProgramApplicationStatus;
window.sendProgramApplicationEmail = sendProgramApplicationEmail;

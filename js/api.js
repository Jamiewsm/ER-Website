// ER-Website: Apply form / Turnstile and submit-application API (depends on config.js; uses global state, renderSection)
var applyTurnstileWidgetId = null;
var applyTurnstileInitTimer = null;

function setApplyTurnstileStatus(message, tone) {
  var el = document.getElementById('apply-turnstile-status');
  var retryBtn = document.getElementById('apply-turnstile-retry');
  if (!el) return;
  if (!message) {
    el.classList.add('hidden');
    el.textContent = '';
    if (retryBtn) retryBtn.classList.add('hidden');
    return;
  }
  el.classList.remove('hidden');
  el.textContent = message;
  el.className = 'text-xs mb-2 break-keep ' + (
    tone === 'error'
      ? 'text-red-600'
      : tone === 'success'
        ? 'text-green-700'
        : 'text-gray-500'
  );
  if (retryBtn) {
    retryBtn.classList.toggle('hidden', tone !== 'error');
  }
}

function clearApplyTurnstileInitTimer() {
  if (applyTurnstileInitTimer !== null) {
    clearInterval(applyTurnstileInitTimer);
    applyTurnstileInitTimer = null;
  }
}

function mountApplyTurnstileWidget() {
  var container = document.getElementById('apply-turnstile-widget');
  var tokenInput = document.getElementById('apply-turnstile-token');
  var sitekey = (window.TURNSTILE_SITE_KEY || '').trim();
  if (!container || !tokenInput) return false;

  if (!sitekey) {
    setApplyTurnstileStatus('보안 확인 설정이 없습니다. 잠시 후 다시 시도하거나 이메일로 문의해 주세요.', 'error');
    return false;
  }

  if (!window.turnstile || typeof window.turnstile.render !== 'function') {
    return false;
  }

  tokenInput.value = '';
  container.innerHTML = '';
  if (applyTurnstileWidgetId !== null) {
    try { window.turnstile.remove(applyTurnstileWidgetId); } catch (_e) {}
    applyTurnstileWidgetId = null;
  }

  try {
    applyTurnstileWidgetId = window.turnstile.render('#apply-turnstile-widget', {
      sitekey: sitekey,
      theme: 'light',
      size: 'flexible',
      callback: function (token) {
        tokenInput.value = token;
        setApplyTurnstileStatus('보안 확인이 완료되었습니다. 아래 신청하기를 눌러 주세요.', 'success');
      },
      'expired-callback': function () {
        tokenInput.value = '';
        setApplyTurnstileStatus('보안 확인이 만료되었습니다. 다시 완료해 주세요.', 'error');
      },
      'error-callback': function () {
        tokenInput.value = '';
        setApplyTurnstileStatus('보안 확인을 표시하지 못했습니다. 아래 버튼으로 다시 시도해 주세요.', 'error');
      }
    });
    setApplyTurnstileStatus('', null);
    return true;
  } catch (err) {
    setApplyTurnstileStatus('보안 확인을 표시하지 못했습니다. 새로고침 후 다시 시도해 주세요.', 'error');
    return false;
  }
}

function initApplyTurnstile() {
  clearApplyTurnstileInitTimer();
  var container = document.getElementById('apply-turnstile-widget');
  var tokenInput = document.getElementById('apply-turnstile-token');
  if (!container || !tokenInput) return;

  setApplyTurnstileStatus('보안 확인을 불러오는 중입니다…', null);

  function attemptMount() {
    if (mountApplyTurnstileWidget()) {
      clearApplyTurnstileInitTimer();
      return true;
    }
    return false;
  }

  if (window.turnstile && typeof window.turnstile.ready === 'function') {
    window.turnstile.ready(attemptMount);
  }

  var attempts = 0;
  applyTurnstileInitTimer = setInterval(function () {
    if (attemptMount()) return;
    attempts += 1;
    if (attempts >= 80) {
      clearApplyTurnstileInitTimer();
      setApplyTurnstileStatus(
        '보안 확인 창이 보이지 않으면 광고 차단을 끄거나 페이지를 새로고침한 뒤, 아래 「다시 불러오기」를 눌러 주세요.',
        'error'
      );
    }
  }, 100);
}

window.initApplyTurnstile = initApplyTurnstile;

async function handleApplySubmit(event, source) {
  if (source === undefined) source = 'website';
  event.preventDefault();
  var config = window.SUPABASE_CONFIG;
  if (!config || !config.url) {
    alert('제출 기능 초기화에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    return;
  }

  var form = event.target;
  var formData = new FormData(form);
  var name = (formData.get('name') || '').toString().trim();
  var contact = (formData.get('contact') || '').toString().trim();
  var country = (formData.get('country') || '').toString().trim();
  var preferredTime = (formData.get('preferred_time') || '').toString().trim();
  var category = (formData.get('category') || '').toString().trim();
  var rawMessage = (formData.get('message') || '').toString().trim();
  var extraLines = [];
  if (country) extraLines.push('거주 국가: ' + country);
  if (preferredTime) extraLines.push('희망 시간대: ' + preferredTime);
  var message = extraLines.length
    ? (extraLines.join('\n') + (rawMessage ? '\n\n' + rawMessage : ''))
    : rawMessage;
  var turnstileToken = (formData.get('turnstile_token') || '').toString().trim();
  if (!turnstileToken && window.turnstile && applyTurnstileWidgetId !== null) {
    try {
      var liveToken = window.turnstile.getResponse(applyTurnstileWidgetId);
      if (liveToken) turnstileToken = String(liveToken).trim();
    } catch (_e) {}
  }
  var submitBtn = document.getElementById('apply-submit-btn');
  if (!name || !contact || !category) {
    alert('이름, 연락처, 신청 분야를 확인해 주세요.');
    return;
  }
  if (!turnstileToken) {
    alert('「보안 확인」 체크를 완료해 주세요. 확인 창이 보이지 않으면 「다시 불러오기」를 눌러 주세요.');
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = '제출 중...';
  }

  var payload = {
    name: name,
    contact: contact,
    category: category,
    message: message,
    source: source,
    user_id: (window.state && window.state.user) ? window.state.user.id : null,
    turnstile_token: turnstileToken
  };
  try {
    var response = await fetch(config.url + '/functions/v1/submit-application', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      var errorText = await response.text();
      throw new Error(errorText || 'HTTP ' + response.status);
    }

    if (typeof renderSection === 'function') renderSection('thankyou');
  } catch (err) {
    var msg = err instanceof Error ? err.message : String(err);
    alert('제출에 실패했습니다: ' + msg);
    if (window.turnstile && applyTurnstileWidgetId !== null) {
      try { window.turnstile.reset(applyTurnstileWidgetId); } catch (_e) {}
    }
    var tokenInput = document.getElementById('apply-turnstile-token');
    if (tokenInput) tokenInput.value = '';
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = '신청하기';
    }
  }
}

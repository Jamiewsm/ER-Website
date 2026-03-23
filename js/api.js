// ER-Website: Apply form / Turnstile and submit-application API (depends on config.js; uses global state, renderSection)
var applyTurnstileWidgetId = null;

function initApplyTurnstile() {
  var container = document.getElementById('apply-turnstile-widget');
  var tokenInput = document.getElementById('apply-turnstile-token');
  if (!container || !tokenInput || !window.turnstile) return;

  tokenInput.value = '';
  if (applyTurnstileWidgetId !== null) {
    try { window.turnstile.remove(applyTurnstileWidgetId); } catch (_e) {}
    applyTurnstileWidgetId = null;
  }

  applyTurnstileWidgetId = window.turnstile.render('#apply-turnstile-widget', {
    sitekey: (window.TURNSTILE_SITE_KEY || ''),
    theme: 'light',
    callback: function (token) { tokenInput.value = token; },
    'expired-callback': function () { tokenInput.value = ''; },
    'error-callback': function () { tokenInput.value = ''; }
  });
}

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
  var submitBtn = document.getElementById('apply-submit-btn');
  if (!name || !contact || !category) {
    alert('이름, 연락처, 신청 분야를 확인해 주세요.');
    return;
  }
  if (!turnstileToken) {
    alert('보안 확인을 완료해 주세요.');
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
      window.turnstile.reset(applyTurnstileWidgetId);
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = '신청서 제출하기';
    }
  }
}

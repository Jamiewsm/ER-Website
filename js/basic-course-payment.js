// PayPal 결제 완료 리턴 페이지 — 주문 캡처 후 감사 화면
(function initBasicCoursePayPalReturn() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token') || '';
  const cancelled = params.get('outcome') === 'cancelled' || params.get('cancelled') === '1';

  const statusEl = document.getElementById('payment-status');
  const detailEl = document.getElementById('payment-detail');
  const config = window.SUPABASE_CONFIG || {};

  if (cancelled) {
    if (statusEl) statusEl.textContent = '결제가 취소되었습니다';
    if (detailEl) {
      detailEl.innerHTML = '다시 결제하시려면 결제 안내 메일의 PayPal 버튼을 이용해 주세요. 문의: <a href="mailto:json@er-coaching.com">json@er-coaching.com</a>';
    }
    return;
  }

  if (!token) {
    if (statusEl) statusEl.textContent = '결제 정보를 찾을 수 없습니다';
    if (detailEl) detailEl.textContent = '결제 안내 메일의 링크로 다시 시도해 주세요.';
    return;
  }

  if (!config.url) {
    if (statusEl) statusEl.textContent = '결제 확인 중…';
    if (detailEl) detailEl.textContent = '잠시만 기다려 주세요. 완료되면 담당자가 등록을 확정합니다.';
    return;
  }

  fetch(config.url + '/functions/v1/capture-paypal-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: config.anonKey || window.__ER_SUPABASE_ANON_KEY || ''
    },
    body: JSON.stringify({ token })
  })
    .then(async (response) => {
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'capture_failed');
      }
      if (data.waitlisted) {
        if (statusEl) statusEl.textContent = '결제는 완료되었으나 정원이 가득 찼습니다';
        if (detailEl) {
          detailEl.innerHTML = '입금은 확인되었습니다. 대기 목록으로 안내드리며, <a href="mailto:json@er-coaching.com">json@er-coaching.com</a> 으로 연락 주시면 순서를 안내해 드립니다.';
        }
        return;
      }
      if (statusEl) statusEl.textContent = '결제가 완료되었습니다';
      if (detailEl) {
        detailEl.innerHTML = '등록이 확정되었습니다. 곧 <strong>사전 성찰 설문</strong> 링크를 이메일로 보내드립니다. 스팸함도 확인해 주세요.';
      }
    })
    .catch((err) => {
      if (statusEl) statusEl.textContent = '결제 확인 중입니다';
      if (detailEl) {
        detailEl.innerHTML = 'PayPal에서 결제가 완료되었다면 등록은 곧 확정됩니다. 10분 후에도 메일이 없으면 <a href="mailto:json@er-coaching.com">json@er-coaching.com</a> 으로 연락 주세요.';
      }
      console.error('paypal capture return failed', err);
    });
})();

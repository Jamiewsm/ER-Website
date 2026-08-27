// 프로그램 신청·등록 안내 메일 HTML 템플릿
import type { BasicCourseManualPaymentInfo } from './program-pricing.ts';

export type BasicCoursePricingInfo = {
  earlyBirdDeadline: string;
  regularPriceUsd: number;
  earlyBirdPriceUsd: number;
};

export type BasicCourseCheckoutPricingInfo = BasicCoursePricingInfo & {
  amountUsd: number;
  isEarlyBird: boolean;
};

export function adminApplicationNoticeHtml(input: {
  name: string;
  contact: string;
  programKey: string;
  category: string;
  message: string;
  source: string;
  applicationId: string;
}): string {
  const lines = [
    `<p><strong>신규 신청</strong> (${escapeHtml(input.programKey)})</p>`,
    `<p>이름: ${escapeHtml(input.name)}<br>연락처: ${escapeHtml(input.contact)}<br>분야: ${escapeHtml(input.category)}</p>`,
    `<p>유입: ${escapeHtml(input.source || '-')}</p>`,
    `<pre style="white-space:pre-wrap;font-family:inherit">${escapeHtml(input.message || '(없음)')}</pre>`,
    `<p style="color:#666;font-size:12px">ID: ${escapeHtml(input.applicationId)}</p>`,
  ];
  return wrapEmail('ER 신규 프로그램 신청', lines.join('\n'));
}

export function applicantReceivedHtml(input: {
  name: string;
  programLabel: string;
}): string {
  return wrapEmail(
    '신청이 접수되었습니다',
    `
      <p>${escapeHtml(input.name)}님, 안녕하세요.</p>
      <p><strong>${escapeHtml(input.programLabel)}</strong> 신청이 정상적으로 접수되었습니다.</p>
      <p>담당자가 확인 후 <strong>24시간 이내</strong> 등록·결제 안내 메일을 보내드립니다. 스팸함도 한번 확인해 주세요.</p>
      <p>급한 문의는 <a href="mailto:json@er-coaching.com">json@er-coaching.com</a> 으로 연락 주세요.</p>
      <p style="color:#666;font-size:13px">Enneagram for Restoration</p>
    `,
  );
}

export function basicCourseApplicantReceivedHtml(input: {
  name: string;
  programLabel: string;
}): string {
  return wrapEmail(
    '신청이 접수되었습니다',
    `
      <p>${escapeHtml(input.name)}님, 안녕하세요.</p>
      <p><strong>${escapeHtml(input.programLabel)}</strong> 신청이 정상적으로 접수되었습니다.</p>
      <p>담당자 확인 후 <strong>24시간 이내</strong> 등록·결제 안내 메일(USD, PayPal·Zelle 등)을 보내드립니다.</p>
      <p style="font-size:14px;color:#666">자리 확정은 <strong>입금 확인 순</strong>입니다 (정원 8명).</p>
      <p>급한 문의는 <a href="mailto:json@er-coaching.com">json@er-coaching.com</a> 으로 연락 주세요.</p>
      <p style="color:#666;font-size:13px">Enneagram for Restoration</p>
    `,
  );
}

export function basicCourseRegistrationHtml(input: {
  name: string;
  pricing: BasicCourseCheckoutPricingInfo;
  payment: BasicCourseManualPaymentInfo;
}): string {
  const p = input.pricing;
  const methods = buildManualPaymentMethodsHtml(input.payment);
  return wrapEmail(
    '10월 기본과정 등록·결제 안내',
    `
      <p>${escapeHtml(input.name)}님, 안녕하세요.</p>
      <p><strong>ER 성경적 에니어그램 기본과정 8주 (2026년 10월 기수)</strong> 신청을 환영합니다.</p>
      <h3 style="margin:24px 0 8px;font-size:16px">결제 금액 (USD)</h3>
      <p style="font-size:18px;margin:8px 0"><strong>$${p.amountUsd}</strong>${p.isEarlyBird ? ` <span style="font-size:14px;color:#666">(얼리버드 · ${escapeHtml(p.earlyBirdDeadline)}까지)</span>` : ''}</p>
      <ul style="font-size:14px;line-height:1.6">
        <li>정가: $${p.regularPriceUsd}</li>
        <li>얼리버드: $${p.earlyBirdPriceUsd} (${escapeHtml(p.earlyBirdDeadline)}까지 입금 완료 시)</li>
      </ul>
      <p><strong>자리 확정은 입금 확인 순</strong>입니다 (정원 8명).</p>
      <h3 style="margin:24px 0 8px;font-size:16px">결제 방법</h3>
      <ul style="font-size:14px;line-height:1.7">${methods}</ul>
      <p style="font-size:13px;color:#666;margin-top:12px">송금 시 메모·메시지에 <strong>${escapeHtml(input.payment.memoHint)}</strong> 를 적어 주시면 확인이 빠릅니다.</p>
      <p style="font-size:14px;margin-top:16px">입금 후 <a href="mailto:json@er-coaching.com">json@er-coaching.com</a> 으로 송금 완료를 알려 주시거나, PayPal·Zelle 알림을 기다려 주세요.</p>
      <h3 style="margin:24px 0 8px;font-size:16px">환불 규정 요약</h3>
      <ul style="font-size:14px;line-height:1.6">
        <li>개강 전 — 전액 환불</li>
        <li>1주차 참여 후, 2주차 시작 전 — 전액 환불 (첫 주 안심 보장)</li>
        <li>2주차~4주차 시작 전 — 50% 환불</li>
        <li>4주차 시작 후 — 환불 불가 (다음 기수 1회 이월 가능)</li>
        <li>폐강 시 — 전액 환불</li>
      </ul>
      <p style="color:#666;font-size:13px">입금이 확인되면 등록이 확정되며, 사전 성찰 설문(약 15–20분) 링크를 보내드립니다.</p>
    `,
  );
}

function buildManualPaymentMethodsHtml(payment: BasicCourseManualPaymentInfo): string {
  const items: string[] = [];
  if (payment.paypalEmail) {
    items.push(
      `<li><strong>PayPal</strong> — <code>${escapeHtml(payment.paypalEmail)}</code> 로 USD 송금 (가능하면 Friends &amp; Family)</li>`,
    );
  }
  if (payment.zelleEmail) {
    items.push(`<li><strong>Zelle</strong> — 이메일 <code>${escapeHtml(payment.zelleEmail)}</code></li>`);
  }
  if (payment.zellePhone) {
    items.push(`<li><strong>Zelle</strong> — 전화번호 <code>${escapeHtml(payment.zellePhone)}</code></li>`);
  }
  if (payment.bankInstructions) {
    const bankHtml = escapeHtml(payment.bankInstructions).replace(/\n/g, '<br>');
    items.push(`<li><strong>은행 송금</strong><br>${bankHtml}</li>`);
  }
  if (!items.length) {
    items.push(
      '<li>PayPal·Zelle·은행 송금 안내는 <a href="mailto:json@er-coaching.com">json@er-coaching.com</a> 으로 문의해 주세요.</li>',
    );
  }
  return items.join('\n');
}

export function basicCoursePreSurveyHtml(input: {
  name: string;
  preSurveyUrl: string;
}): string {
  return wrapEmail(
    '기본과정 사전 성찰 설문 안내',
    `
      <p>${escapeHtml(input.name)}님, 등록이 확정되었습니다. 감사합니다.</p>
      <p>8주 여정을 준비하기 위해 <strong>사전 성찰 설문</strong>(약 15–20분)을 부탁드립니다. 개인적인 이야기를 천천히 돌아보시는 시간입니다.</p>
      <p style="margin:24px 0"><a href="${escapeHtml(input.preSurveyUrl)}" style="display:inline-block;padding:12px 20px;background:#3E362E;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold">사전 성찰 설문 작성하기</a></p>
      <p style="font-size:14px">링크가 열리지 않으면 아래 주소를 복사해 브라우저에 붙여넣어 주세요.<br><code>${escapeHtml(input.preSurveyUrl)}</code></p>
      <p style="color:#666;font-size:13px">설문은 외부에 공유되지 않으며, 멘토링 준비에만 사용됩니다.</p>
    `,
  );
}

export function basicCourseGraduationUpsellHtml(input: {
  name: string;
  expertCohortLabel: string;
  applyUrl: string;
  testimonialUrl: string;
}): string {
  return wrapEmail(
    '기본과정 수료를 축하드립니다',
    `
      <p>${escapeHtml(input.name)}님, 8주 기본과정을 마치신 것을 진심으로 축하합니다.</p>
      <p>이제 에니어그램을 <strong>나와 타인을 돕는 도구</strong>로 더 깊이 쓰고 싶다면, 다음 단계로 <strong>${escapeHtml(input.expertCohortLabel)}</strong> 을 안내드립니다.</p>
      <p style="margin:24px 0"><a href="${escapeHtml(input.applyUrl)}" style="display:inline-block;padding:12px 20px;background:#B89170;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold">전문가 양성반 안내·신청</a></p>
      <p>수료 경험을 나눠 주시면 다음 기수 분들에게 큰 도움이 됩니다.<br>
      <a href="${escapeHtml(input.testimonialUrl)}">수료 후기 남기기</a></p>
    `,
  );
}

function wrapEmail(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head>
<body style="font-family:'Pretendard',-apple-system,sans-serif;color:#3E362E;line-height:1.6;max-width:560px;margin:0 auto;padding:24px">
${bodyHtml}
</body></html>`;
}

function escapeHtml(value: string): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

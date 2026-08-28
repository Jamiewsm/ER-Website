// 프로그램 신청·등록 안내 메일 HTML 템플릿
import type { BasicCourseManualPaymentInfo } from './program-pricing.ts';

export type BasicCoursePricingInfo = {
  overseasPriceUsd: number;
  bankTransferPriceKrw: number;
};

export type BasicCourseCheckoutPricingInfo = BasicCoursePricingInfo & {
  amountUsd: number;
  amountKrw: number;
};

export function adminApplicationNoticeHtml(input: {
  name: string;
  contact: string;
  programKey: string;
  category: string;
  message: string;
  source: string;
  applicationId: string;
  cohortKey?: string;
  paymentRegion?: string;
  paymentPreference?: string;
  installmentPreference?: string;
}): string {
  const lines = [
    `<p><strong>신규 신청</strong> (${escapeHtml(input.programKey)})</p>`,
    input.cohortKey ? `<p>기수: ${escapeHtml(input.cohortKey)}</p>` : '',
    `<p>이름: ${escapeHtml(input.name)}<br>연락처: ${escapeHtml(input.contact)}<br>분야: ${escapeHtml(input.category)}</p>`,
    input.paymentRegion || input.paymentPreference || input.installmentPreference
      ? `<p>결제 선호: ${escapeHtml([input.paymentRegion, input.paymentPreference, input.installmentPreference].filter(Boolean).join(' · '))}</p>`
      : '',
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
  paymentRegion?: string;
  paymentPreference?: string;
  pricing: BasicCoursePricingInfo;
  payment: BasicCourseManualPaymentInfo;
}): string {
  const isKorea = input.paymentRegion === 'KR';
  const priceCopy = isKorea
    ? `한국 계좌이체 <strong>₩${formatKrw(input.pricing.bankTransferPriceKrw)}</strong>`
    : `미국 Zelle·Venmo <strong>$${input.pricing.overseasPriceUsd}</strong>`;
  const methods = isKorea
    ? buildKoreanPaymentMethodsHtml(input.payment)
    : buildUsPaymentMethodsHtml(input.payment, input.paymentPreference);
  return wrapEmail(
    '신청이 접수되었습니다',
    `
      <p>${escapeHtml(input.name)}님, 안녕하세요.</p>
      <p><strong>${escapeHtml(input.programLabel)}</strong> 신청이 정상적으로 접수되었습니다.</p>
      <p>${priceCopy}</p>
      <h3 style="margin:24px 0 8px;font-size:16px">결제 안내</h3>
      <ul style="font-size:14px;line-height:1.7">${methods}</ul>
      <p style="font-size:13px;color:#666;margin-top:12px">송금 시 메모·입금자명에 <strong>${escapeHtml(input.payment.memoHint)}</strong> 또는 신청자 이름을 적어 주세요.</p>
      <p>결제가 확인되면 등록이 확정되며, 담당자가 후속 안내를 보내드립니다.</p>
      <p style="font-size:14px;color:#666">정원은 8명이며, 등록 절차는 담당자가 개별 안내합니다.</p>
      <p>급한 문의는 <a href="mailto:json@er-coaching.com">json@er-coaching.com</a> 으로 연락 주세요.</p>
      <p style="color:#666;font-size:13px">Enneagram for Restoration</p>
    `,
  );
}

export function basicCourseRegistrationHtml(input: {
  name: string;
  pricing: BasicCourseCheckoutPricingInfo;
  payment: BasicCourseManualPaymentInfo;
  paymentRegion: 'KR' | 'OVERSEAS';
  paymentPreference?: string;
  installmentPreference?: string;
}): string {
  const p = input.pricing;
  const isKorea = input.paymentRegion === 'KR';
  const amount = isKorea ? `₩${formatKrw(p.amountKrw)}` : `$${p.amountUsd}`;
  const methods = isKorea
    ? buildKoreanPaymentMethodsHtml(input.payment)
    : buildUsPaymentMethodsHtml(input.payment, input.paymentPreference);
  const preferenceCopy = paymentPreferenceLabel(input.paymentPreference);
  const installmentCopy = installmentPreferenceCopy(input.installmentPreference);
  return wrapEmail(
    '10월 기본과정 등록·결제 안내',
    `
      <p>${escapeHtml(input.name)}님, 안녕하세요.</p>
      <p><strong>ER 성경적 에니어그램 기본과정 8주 (2026년 10월 기수)</strong> 신청을 환영합니다.</p>
      <h3 style="margin:24px 0 8px;font-size:16px">결제 금액 (${isKorea ? 'KRW' : 'USD'})</h3>
      <p style="font-size:18px;margin:8px 0"><strong>${amount}</strong></p>
      <ul style="font-size:14px;line-height:1.6">
        ${isKorea
          ? `<li>한국 계좌이체: ₩${formatKrw(p.bankTransferPriceKrw)}</li>`
          : `<li>미국 Zelle·Venmo: $${p.overseasPriceUsd}</li>`}
        ${preferenceCopy ? `<li>신청 시 선택한 희망 수단: ${escapeHtml(preferenceCopy)}</li>` : ''}
      </ul>
      <p>정원은 8명이며, 결제가 확인되면 등록이 확정됩니다.</p>
      <h3 style="margin:24px 0 8px;font-size:16px">결제 방법</h3>
      <ul style="font-size:14px;line-height:1.7">${methods}</ul>
      <p style="font-size:13px;color:#666;margin-top:12px">송금 시 메모·메시지에 <strong>${escapeHtml(input.payment.memoHint)}</strong> 를 적어 주시면 확인이 빠릅니다.</p>
      ${installmentCopy ? `<p style="font-size:14px;margin-top:16px">${escapeHtml(installmentCopy)}</p>` : ''}
      <p style="font-size:14px;margin-top:16px">결제 후 <a href="mailto:json@er-coaching.com">json@er-coaching.com</a> 으로 완료를 알려 주시거나 결제 알림을 기다려 주세요.</p>
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

function buildUsPaymentMethodsHtml(payment: BasicCourseManualPaymentInfo, preference?: string): string {
  const items: string[] = [];
  const includeZelle = !preference || preference === 'zelle';
  const includeVenmo = !preference || preference === 'venmo';
  if (includeZelle && payment.zelleEmail) {
    items.push(`<li><strong>Zelle</strong> — 이메일 <code>${escapeHtml(payment.zelleEmail)}</code></li>`);
  }
  if (includeZelle && payment.zellePhone) {
    items.push(`<li><strong>Zelle</strong> — 전화번호 <code>${escapeHtml(payment.zellePhone)}</code></li>`);
  }
  if (includeVenmo && payment.venmoHandle) {
    items.push(`<li><strong>Venmo</strong> — <code>${escapeHtml(payment.venmoHandle)}</code></li>`);
  }
  if (!items.length) {
    items.push(
      `<li>${preference === 'venmo' ? 'Venmo' : preference === 'zelle' ? 'Zelle' : 'Zelle·Venmo'} 수취 정보는 <a href="mailto:json@er-coaching.com">json@er-coaching.com</a> 으로 문의해 주세요.</li>`,
    );
  }
  return items.join('\n');
}

function buildKoreanPaymentMethodsHtml(payment: BasicCourseManualPaymentInfo): string {
  const items: string[] = [];
  if (payment.krBankInstructions) {
    const bankHtml = escapeHtml(payment.krBankInstructions).replace(/\n/g, '<br>');
    items.push(`<li><strong>원화 계좌이체 ₩450,000</strong><br>${bankHtml}</li>`);
  }
  if (!items.length) {
    items.push('<li><strong>원화 계좌이체 ₩450,000</strong> 계좌 정보는 이 메일에 회신하거나 <a href="mailto:json@er-coaching.com">json@er-coaching.com</a> 으로 문의해 주세요.</li>');
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

export function basicCourseGraduationHtml(input: {
  name: string;
  testimonialUrl: string;
}): string {
  return wrapEmail(
    '기본과정 수료를 축하드립니다',
    `
      <p>${escapeHtml(input.name)}님, 8주 기본과정을 마치신 것을 진심으로 축하합니다.</p>
      <p><strong>ER 전문가 과정</strong>은 별도의 다음 기수 이름이 아니라, 지금 수료하신 에니어그램 기본과정에 팔로우업 스터디와 1년 코칭스쿨이 이어지는 전체 훈련 여정을 뜻합니다.</p>
      <p>스터디와 코칭스쿨 참여 안내는 수료자의 준비 단계와 운영 일정에 맞춰 별도로 전해 드립니다.</p>
      <p>수료 경험을 나눠 주시면 다음 기수 분들에게 큰 도움이 됩니다.<br>
      <a href="${escapeHtml(input.testimonialUrl)}">수료 후기 남기기</a></p>
    `,
  );
}

function paymentPreferenceLabel(value?: string): string {
  const labels: Record<string, string> = {
    kr_bank: '한국 원화 계좌이체',
    zelle: 'Zelle',
    venmo: 'Venmo',
  };
  return labels[String(value || '')] || '';
}

function installmentPreferenceCopy(value: string | undefined): string {
  if (value === 'split_consult') {
    return 'ER 자체 2회 분납을 요청하셨습니다. 승인 여부와 납부 일정을 담당자가 별도로 회신드립니다.';
  }
  return '';
}

function formatKrw(value: number): string {
  return Math.round(Number(value) || 0).toLocaleString('ko-KR');
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

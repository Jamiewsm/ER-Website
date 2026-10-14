// 프로그램 신청·등록 안내 메일 HTML 템플릿
import type { BasicCourseManualPaymentInfo, BasicCourseOctoberPricing, GrowthCoursePricing } from './program-pricing.ts';

export type BasicCourseCheckoutPricingInfo = BasicCourseOctoberPricing;
export type CoursePricingInfo = BasicCourseOctoberPricing | GrowthCoursePricing;

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
  pricing?: CoursePricingInfo;
}): string {
  const lines = [
    `<p><strong>신규 신청</strong> (${escapeHtml(input.programKey)})</p>`,
    input.cohortKey ? `<p>기수: ${escapeHtml(input.cohortKey)}</p>` : '',
    `<p>이름: ${escapeHtml(input.name)}<br>연락처: ${escapeHtml(input.contact)}<br>분야: ${escapeHtml(input.category)}</p>`,
    input.paymentRegion || input.paymentPreference || input.installmentPreference
      ? `<p>결제 선호: ${escapeHtml([input.paymentRegion, input.paymentPreference, input.installmentPreference].filter(Boolean).join(' · '))}</p>`
      : '',
    input.pricing
      ? `<p>안내 금액: <strong>${input.paymentRegion === 'KR' ? `₩${formatKrw(input.pricing.amountKrw)}` : `$${input.pricing.amountUsd}`}</strong></p>${ministryDiscountHtml(input.pricing, input.paymentRegion === 'KR')}`
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

export function scholarshipInquiryReceivedHtml(input: {
  name: string;
  transferRequest: boolean;
}): string {
  const title = input.transferRequest ? '장학 후원 입금 확인 요청을 받았습니다' : '장학 후원 문의를 받았습니다';
  return wrapEmail(title, `
    <p>${escapeHtml(input.name)}님, 마음을 함께해 주셔서 감사합니다.</p>
    <p>${input.transferRequest ? '실제 입금 내역을 확인한 뒤' : '문의 내용을 확인한 뒤'} 남겨주신 연락처로 안내드리겠습니다.</p>
    <p>이 메일은 요청 접수 안내이며, 입금 확인서나 기부금영수증이 아닙니다.</p>
    <p>추가로 전하실 내용은 이 메일에 답장해 주세요.</p>
  `);
}

export function basicCourseApplicantReceivedHtml(input: {
  name: string;
  programLabel: string;
  paymentRegion?: string;
  paymentPreference?: string;
  installmentPreference?: string;
  pricing: BasicCourseCheckoutPricingInfo;
  payment: BasicCourseManualPaymentInfo;
}): string {
  return programApplicationConfirmationHtml(input);
}

export function basicCourseRegistrationHtml(input: {
  name: string;
  pricing: BasicCourseCheckoutPricingInfo;
  payment: BasicCourseManualPaymentInfo;
  paymentRegion: 'KR' | 'OVERSEAS';
  paymentPreference?: string;
  installmentPreference?: string;
}): string {
  return programApplicationConfirmationHtml({
    ...input,
    programLabel: 'ER 성경적 에니어그램 기본과정 8주 (2026년 10월 기수)',
  });
}

// 접수와 관리자 복구 발송이 같은 금액·절차를 안내하도록 한 본문을 사용한다.
export function programApplicationConfirmationHtml(input: {
  name: string;
  programLabel: string;
  pricing: CoursePricingInfo;
  payment: BasicCourseManualPaymentInfo;
  paymentRegion?: string;
  paymentPreference?: string;
  installmentPreference?: string;
}): string {
  const p = input.pricing;
  const isGrowth = 'installmentMonths' in p;
  const isKorea = isGrowth || input.paymentRegion === 'KR';
  const amount = isKorea ? `₩${formatKrw(p.amountKrw)}` : `$${p.amountUsd}`;
  const methods = isKorea
    ? buildKoreanPaymentMethodsHtml(input.payment, p.amountKrw)
    : buildUsPaymentMethodsHtml(input.payment, input.paymentPreference);
  const installment = isGrowth
    ? `3개월 과정이며, 월 ₩${formatKrw(p.monthlyAmountKrw)}씩 3회 분납할 수 있습니다. 총 납부액은 ₩${formatKrw(p.amountKrw)}입니다.`
    : installmentPreferenceCopy(input.installmentPreference);
  const courseDetails = isGrowth
    ? '수업 일정과 반 배정은 담당자가 확인 후 안내해 드립니다.'
    : '반당 학생 정원은 7명이며, 10월에는 A·B반 운영을 준비하고 있습니다. 수업 일정과 반 배정은 담당자가 안내해 드립니다.';
  return wrapEmail(
    '신청 접수 및 등록 안내',
    `
      <p>${escapeHtml(input.name)}님, 안녕하세요.</p>
      <p><strong>${escapeHtml(input.programLabel)}</strong> 신청이 정상적으로 접수되었습니다.<br>수강료와 등록 절차를 다음과 같이 안내해 드립니다.</p>
      <h2>수강료 안내</h2>
      <table role="presentation" width="100%" style="border-collapse:collapse;background:#f5f7f6;border:1px solid #e2e8e4">
        <tr><td style="padding:18px 20px">총 납부 금액 (${isKorea ? 'KRW' : 'USD'})<br><strong style="font-size:24px;color:#17634b">${amount}</strong></td></tr>
      </table>
      ${ministryDiscountHtml(p, isKorea)}
      ${installment ? `<p>${escapeHtml(installment)}</p>` : ''}
      <h2>결제 방법</h2>
      <ul>${methods}</ul>
      <p>송금 메모 또는 입금자명에 <strong>${escapeHtml(input.payment.memoHint)}</strong> 또는 신청자 이름을 적어 주십시오.</p>
      <h2>등록 절차</h2>
      <ol>
        <li>위 안내에 따라 수강료를 납부해 주십시오.</li>
        <li>담당자가 결제 내역과 수강 가능 여부를 확인한 뒤 등록을 확정합니다.</li>
        <li>등록이 확정되면 수업 참여 방법과 후속 안내를 보내드립니다.</li>
      </ol>
      <p>${courseDetails}</p>
      ${isGrowth ? '' : `<h2>환불 규정</h2>
      <ul>
        <li>개강 전 또는 1주차 참여 후 2주차 시작 전에는 전액 환불됩니다.</li>
        <li>2주차부터 4주차 시작 전까지는 50% 환불됩니다.</li>
        <li>4주차 시작 후에는 환불이 불가하며, 다음 기수로 1회 이월할 수 있습니다.</li>
        <li>폐강 시에는 전액 환불됩니다.</li>
      </ul>`}
      <p style="margin-top:28px">문의 사항이나 결제 완료 안내는 이 메일에 회신하시거나<br><a href="mailto:json@er-coaching.com">json@er-coaching.com</a>으로 보내 주십시오.</p>
      <p>감사합니다.<br>Enneagram for Restoration</p>
    `,
  );
}

function ministryDiscountHtml(pricing: CoursePricingInfo, isKorea: boolean): string {
  if (!pricing.ministryDiscountRate) return '';
  const regular = isKorea ? `₩${formatKrw(pricing.bankTransferPriceKrw)}` : `$${pricing.overseasPriceUsd}`;
  return `<p>사역자 ${pricing.ministryDiscountRate * 100}% 할인 적용 · 정가 <s>${regular}</s></p>`;
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

function buildKoreanPaymentMethodsHtml(payment: BasicCourseManualPaymentInfo, amountKrw: number): string {
  const items: string[] = [];
  if (payment.krBankInstructions) {
    const bankHtml = escapeHtml(payment.krBankInstructions).replace(/\n/g, '<br>');
    items.push(`<li><strong>원화 계좌이체 ₩${formatKrw(amountKrw)}</strong><br>${bankHtml}</li>`);
  }
  if (!items.length) {
    items.push(`<li><strong>원화 계좌이체 ₩${formatKrw(amountKrw)}</strong> 계좌 정보는 이 메일에 회신하거나 <a href="mailto:json@er-coaching.com">json@er-coaching.com</a> 으로 문의해 주세요.</li>`);
  }
  return items.join('\n');
}

export function basicCourseGraduationHtml(input: {
  name: string;
  testimonialUrl: string;
}): string {
  return wrapEmail(
    '기본과정 수료를 축하드립니다',
    `
      <p>${escapeHtml(input.name)}님, 8주 기본과정을 마치신 것을 진심으로 축하합니다.</p>
      <p><strong>ER 전문가 과정</strong>은 기본과정 수료 후 2급 검정 및 심화성장101, 이후 전문가 1급 과정인 코치 트레이닝으로 이어집니다.</p>
      <p>심화성장101은 기본과정 수료자가 신청할 수 있습니다. 2027년 코치 트레이닝 2기는 2급 자격 소지와 심화성장101 이수를 모두 갖춘 분이 지원할 수 있습니다. 상세 일정과 신청 안내는 별도로 전해 드립니다.</p>
      <p>수료 경험을 나눠 주시면 다음 기수 분들에게 큰 도움이 됩니다.<br>
      <a href="${escapeHtml(input.testimonialUrl)}">수료 후기 남기기</a></p>
    `,
  );
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
  return `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title>
<style>p{margin:0 0 18px}h2{margin:30px 0 12px;font-size:17px;color:#1b3329}ul,ol{margin:0 0 18px;padding-left:22px}li{margin:0 0 8px}a{color:#17634b}code{overflow-wrap:anywhere}</style></head>
<body style="margin:0;background:#f4f6f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Malgun Gothic',sans-serif;color:#27352e;font-size:15px;line-height:1.8">
<table role="presentation" width="100%" style="border-collapse:collapse"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" style="max-width:600px;border-collapse:collapse;background:#ffffff;border:1px solid #e2e8e4">
<tr><td style="padding:28px 24px 20px;border-bottom:3px solid #238162"><strong style="font-size:18px;color:#17634b">Enneagram for Restoration</strong></td></tr>
<tr><td style="padding:28px 24px"><h1 style="font-size:22px;line-height:1.5;margin:0 0 26px;color:#1b3329">${escapeHtml(title)}</h1>${bodyHtml}</td></tr>
<tr><td style="padding:18px 24px;border-top:1px solid #e2e8e4;font-size:12px;color:#66766b">ER · Enneagram for Restoration<br><a href="https://er-coaching.com">er-coaching.com</a></td></tr>
</table></td></tr></table></body></html>`;
}

function escapeHtml(value: string): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

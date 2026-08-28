// 2026년 10월 기본과정 결제수단별 가격·기수·수동 결제 규칙
// program_key는 무중단 호환을 위해 july 값을 유지하고 실제 기수는 cohort_key로 분리한다.

export const BASIC_COURSE_PROGRAM_KEY = 'enneagram_basic_july';
export const BASIC_COURSE_OCTOBER_2026_COHORT_KEY = 'enneagram_basic_2026_10';
export const BASIC_COURSE_MAX_SEATS = 8;

/** @deprecated 기존 Edge Function 호환용 */
export const BASIC_COURSE_JULY_KEY = BASIC_COURSE_PROGRAM_KEY;
/** @deprecated 기존 Edge Function 호환용 */
export const BASIC_COURSE_JULY_MAX_SEATS = BASIC_COURSE_MAX_SEATS;

export type BasicCourseOctoberPricing = {
  overseasPriceUsd: number;
  bankTransferPriceKrw: number;
  onlinePaymentPriceKrw: number;
  amountUsd: number;
  amountKrw: number;
  isKoreanOnlinePayment: boolean;
};

export function basicCourseOctoberPricing(paymentPreference?: string): BasicCourseOctoberPricing {
  const overseasPriceUsd = 330;
  const bankTransferPriceKrw = 450000;
  const onlinePaymentPriceKrw = 470000;
  const isKoreanOnlinePayment = ['kr_card', 'kakao_pay', 'naver_pay']
    .includes(String(paymentPreference || ''));
  return {
    overseasPriceUsd,
    bankTransferPriceKrw,
    onlinePaymentPriceKrw,
    amountUsd: overseasPriceUsd,
    amountKrw: isKoreanOnlinePayment ? onlinePaymentPriceKrw : bankTransferPriceKrw,
    isKoreanOnlinePayment,
  };
}

/** @deprecated 기존 Edge Function 호환용 */
export function basicCourseJulyPricing(paymentPreference?: string): BasicCourseOctoberPricing {
  return basicCourseOctoberPricing(paymentPreference);
}

export function basicCourseOctoberProductName(): string {
  return 'ER 성경적 에니어그램 기본과정 8주 (2026년 10월)';
}

/** @deprecated 기존 Edge Function 호환용 */
export function basicCourseJulyProductName(): string {
  return basicCourseOctoberProductName();
}

export function siteBaseUrl(): string {
  return (Deno.env.get('ER_SITE_URL') || 'https://er-coaching.com').replace(/\/$/, '');
}

export type BasicCourseManualPaymentInfo = {
  paypalEmail: string;
  zelleEmail: string;
  zellePhone: string;
  krBankInstructions: string;
  krCheckoutUrl: string;
  memoHint: string;
};

const BASIC_COURSE_PAYPAL_EMAIL_DEFAULT = 'json@er-coaching.com';
const BASIC_COURSE_ZELLE_EMAIL_DEFAULT = 'campus.12000@gmail.com';

/** Supabase Edge Function secrets — 등록·결제 안내 메일에 사용 */
export function basicCourseManualPaymentFromEnv(name: string): BasicCourseManualPaymentInfo {
  const safeName = String(name || '').trim() || '신청자';
  return {
    paypalEmail: (Deno.env.get('BASIC_COURSE_PAYPAL_EMAIL') || BASIC_COURSE_PAYPAL_EMAIL_DEFAULT).trim(),
    zelleEmail: (Deno.env.get('BASIC_COURSE_ZELLE_EMAIL') || BASIC_COURSE_ZELLE_EMAIL_DEFAULT).trim(),
    zellePhone: (Deno.env.get('BASIC_COURSE_ZELLE_PHONE') || '').trim(),
    krBankInstructions: (
      Deno.env.get('BASIC_COURSE_KR_BANK_INSTRUCTIONS')
      || Deno.env.get('BASIC_COURSE_BANK_INSTRUCTIONS')
      || ''
    ).trim(),
    krCheckoutUrl: (Deno.env.get('BASIC_COURSE_KR_CHECKOUT_URL') || '').trim(),
    memoHint: `ER Basic October - ${safeName}`,
  };
}

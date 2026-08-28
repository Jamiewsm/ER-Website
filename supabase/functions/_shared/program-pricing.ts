// 2026년 10월 기본과정 지역별 가격·기수·수동 결제 규칙
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
  amountUsd: number;
  amountKrw: number;
};

export function basicCourseOctoberPricing(): BasicCourseOctoberPricing {
  const overseasPriceUsd = 330;
  const bankTransferPriceKrw = 450000;
  return {
    overseasPriceUsd,
    bankTransferPriceKrw,
    amountUsd: overseasPriceUsd,
    amountKrw: bankTransferPriceKrw,
  };
}

/** @deprecated 기존 Edge Function 호환용 */
export function basicCourseJulyPricing(_paymentPreference?: string): BasicCourseOctoberPricing {
  return basicCourseOctoberPricing();
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
  zelleEmail: string;
  zellePhone: string;
  venmoHandle: string;
  krBankInstructions: string;
  memoHint: string;
};

const BASIC_COURSE_ZELLE_EMAIL_DEFAULT = 'campus.12000@gmail.com';
const BASIC_COURSE_KR_BANK_INSTRUCTIONS_DEFAULT = '카카오뱅크 3333-37-8817302\n입금자명: 신청자 이름';

/** Supabase Edge Function secrets — 등록·결제 안내 메일에 사용 */
export function basicCourseManualPaymentFromEnv(name: string): BasicCourseManualPaymentInfo {
  const safeName = String(name || '').trim() || '신청자';
  return {
    zelleEmail: (Deno.env.get('BASIC_COURSE_ZELLE_EMAIL') || BASIC_COURSE_ZELLE_EMAIL_DEFAULT).trim(),
    zellePhone: (Deno.env.get('BASIC_COURSE_ZELLE_PHONE') || '').trim(),
    venmoHandle: (Deno.env.get('BASIC_COURSE_VENMO_HANDLE') || '').trim(),
    krBankInstructions: (
      Deno.env.get('BASIC_COURSE_KR_BANK_INSTRUCTIONS')
      || Deno.env.get('BASIC_COURSE_BANK_INSTRUCTIONS')
      || BASIC_COURSE_KR_BANK_INSTRUCTIONS_DEFAULT
    ).trim(),
    memoHint: `ER Basic October - ${safeName}`,
  };
}

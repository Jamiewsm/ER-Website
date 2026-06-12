// 프로그램별 USD 수강료·얼리버드 규칙

export const BASIC_COURSE_JULY_KEY = 'enneagram_basic_july';
export const BASIC_COURSE_JULY_MAX_SEATS = 10;

/** 2026-06-24 23:59:59 America/Los_Angeles (PDT, UTC-7) */
export const BASIC_COURSE_JULY_EARLY_BIRD_END_MS = Date.parse('2026-06-25T06:59:59.000Z');

export type BasicCourseJulyPricing = {
  regularPriceUsd: number;
  earlyBirdPriceUsd: number;
  earlyBirdDeadlineLabel: string;
  amountUsd: number;
  isEarlyBird: boolean;
};

export function basicCourseJulyPricing(nowMs = Date.now()): BasicCourseJulyPricing {
  const regularPriceUsd = 300;
  const earlyBirdPriceUsd = 270;
  const isEarlyBird = nowMs <= BASIC_COURSE_JULY_EARLY_BIRD_END_MS;
  return {
    regularPriceUsd,
    earlyBirdPriceUsd,
    earlyBirdDeadlineLabel: '2026년 6월 24일(수)',
    amountUsd: isEarlyBird ? earlyBirdPriceUsd : regularPriceUsd,
    isEarlyBird,
  };
}

export function basicCourseJulyProductName(): string {
  return 'ER 성경적 에니어그램 기본과정 8주 (2026년 7월)';
}

export function siteBaseUrl(): string {
  return (Deno.env.get('ER_SITE_URL') || 'https://er-coaching.com').replace(/\/$/, '');
}

export type BasicCourseManualPaymentInfo = {
  paypalEmail: string;
  zelleEmail: string;
  zellePhone: string;
  bankInstructions: string;
  memoHint: string;
};

const BASIC_COURSE_PAYPAL_EMAIL_DEFAULT = 'json@er-coaching.com';
const BASIC_COURSE_ZELLE_EMAIL_DEFAULT = 'campus.12000@gmail.com';

/** Supabase Edge Function secrets — 등록·결제 안내 메일에 사용 (미설정 시 아래 기본값) */
export function basicCourseManualPaymentFromEnv(name: string): BasicCourseManualPaymentInfo {
  const safeName = String(name || '').trim() || '신청자';
  return {
    paypalEmail: (Deno.env.get('BASIC_COURSE_PAYPAL_EMAIL') || BASIC_COURSE_PAYPAL_EMAIL_DEFAULT).trim(),
    zelleEmail: (Deno.env.get('BASIC_COURSE_ZELLE_EMAIL') || BASIC_COURSE_ZELLE_EMAIL_DEFAULT).trim(),
    zellePhone: (Deno.env.get('BASIC_COURSE_ZELLE_PHONE') || '').trim(),
    bankInstructions: (Deno.env.get('BASIC_COURSE_BANK_INSTRUCTIONS') || '').trim(),
    memoHint: `ER Basic July - ${safeName}`,
  };
}

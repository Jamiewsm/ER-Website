import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'node:test';

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
}

const migration = read('supabase/migrations/20260827135419_october_basic_course_cohort_payment_metadata.sql');
const submit = read('supabase/functions/submit-application/index.ts');
const notify = read('supabase/functions/notify-program-application/index.ts');
const templates = read('supabase/functions/_shared/email-templates.ts');
const pricing = read('supabase/functions/_shared/program-pricing.ts');

test('October migration adds cohort, region-aware payment, and email delivery metadata', () => {
  for (const column of [
    'cohort_key',
    'payment_region',
    'payment_currency',
    'payment_preference',
    'installment_preference',
    'payment_amount_krw',
    'receipt_email_sent_at',
    'registration_email_sent_at',
    'graduation_email_sent_at',
  ]) {
    assert.match(migration, new RegExp(`ADD COLUMN IF NOT EXISTS ${column}`));
  }
  assert.match(migration, /enneagram_basic_2026_10/);
  assert.match(migration, /REVOKE ALL ON TABLE public\.program_applications FROM anon, authenticated/);
});

test('cohort admin RPCs require head coach and serialize seat reservation', () => {
  assert.match(migration, /admin_list_program_applications_by_cohort/);
  assert.match(migration, /admin_prepare_program_application_registration/);
  assert.match(migration, /PERFORM public\.require_head_coach\(\)/);
  assert.match(migration, /pg_advisory_xact_lock/);
  assert.match(migration, /status IN \('payment_pending', 'confirmed'\)/);
  assert.match(migration, /SET search_path = ''/);
  assert.match(migration, /GRANT EXECUTE[^;]+TO authenticated/);
});

test('submit application persists cohort/payment metadata and records successful receipt mail', () => {
  assert.match(submit, /cohort_key: cohortKey/);
  assert.match(submit, /payment_region: paymentRegion/);
  assert.match(submit, /payment_currency: paymentCurrency/);
  assert.match(submit, /payment_preference: paymentPreference/);
  assert.match(submit, /installment_preference: installmentPreference/);
  assert.match(submit, /receipt_email_sent_at/);
  assert.match(submit, /basicCourseApplicantReceivedHtml/);
  assert.match(submit, /basicCourseManualPaymentFromEnv\(name\)/);
  assert.match(submit, /'kr_bank', 'zelle', 'venmo'/);
  assert.doesNotMatch(submit, /'kr_card'|'kakao_pay'|'naver_pay'|'paypal'|'card_installment'/);
});

test('registration mail chooses KRW or USD and reserves seats before sending', () => {
  assert.match(notify, /admin_prepare_program_application_registration/);
  assert.match(notify, /paymentRegion === 'KR'/);
  assert.match(notify, /pricing\.amountKrw/);
  assert.match(notify, /pricing\.amountUsd/);
  assert.match(notify, /registration_email_sent_at/);
  assert.match(notify, /seats_full/);
  assert.match(pricing, /bankTransferPriceKrw = 450000/);
  assert.match(pricing, /overseasPriceUsd = 330/);
  assert.doesNotMatch(pricing, /earlyBird|470000|420000|380000|paypalEmail|krCheckoutUrl/);
  assert.match(pricing, /카카오뱅크 3333-37-8817302/);
  assert.match(pricing, /BASIC_COURSE_VENMO_HANDLE/);
  assert.match(templates, /원화 계좌이체 ₩450,000/);
  assert.match(templates, /Zelle·Venmo/);
  assert.match(templates, /Venmo/);
  assert.doesNotMatch(templates, /PayPal|카카오페이|네이버페이|신용카드|₩470,000/);
});

test('migration accepts only bank transfer, Zelle, Venmo, and manual split consultation', () => {
  assert.match(migration, /payment_preference IN \('kr_bank', 'zelle', 'venmo'\)/);
  assert.match(migration, /installment_preference IN \('full', 'split_consult'\)/);
  assert.doesNotMatch(migration, /'kr_card'|'kakao_pay'|'naver_pay'|'paypal'|'card_installment'|₩470,000/);
  assert.match(migration, /한국 계좌이체 ₩450,000 · 미국 Zelle·Venmo \$330/);
});

test('application intake stays open independently of the visible seat count', () => {
  assert.doesNotMatch(submit, /BASIC_COURSE_MAX_SEATS|waitlisted|seats_full/);
  assert.match(submit, /status: 'received'/);
  assert.match(migration, /status = 'waitlisted'/);
});

test('graduation mail has no standalone expert cohort application link', () => {
  assert.match(templates, /ER 전문가 과정/);
  assert.match(templates, /기본과정에 팔로우업 스터디와 1년 코칭스쿨/);
  assert.doesNotMatch(templates, /전문가 양성반 안내·신청/);
  assert.doesNotMatch(notify, /EXPERT_COHORT_APPLY_URL|expertCohortLabel|applyUrl/);
});

test('notice migration replaces the old recruiting notice with an informational journey only', () => {
  assert.match(migration, /title = 'ER 전문가 과정 안내'/);
  assert.match(migration, /전체 과정 안내 보기/);
  assert.doesNotMatch(migration, />문의·신청하기<|>양성반 안내 보기</);
  assert.match(migration, /focus=enneagram_basic_october/);
});

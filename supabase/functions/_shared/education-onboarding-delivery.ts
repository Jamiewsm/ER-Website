// 영속 발송 선점과 직전 자격 확인으로 중복·취소 후 안내 메일을 막는다.
import { buildEducationOnboardingEmail, educationPortalUrl, type OnboardingKind, type OnboardingDelivery } from './education-onboarding-email.ts';
import { sendResendEmail } from './resend.ts';

type OnboardingClient = { rpc: (name: string, args: Record<string, unknown>) => PromiseLike<{ data: unknown; error: unknown }> };
type DeliverySettings = { apiKey: string; from: string; replyTo: string; portalUrl: string };
type DeliveryResponse = { ok?: boolean; error?: string; message?: string; email?: { id?: string; delivery_id?: string; skipped?: boolean; reason?: string } };

export function onboardingDeliverySettings(): DeliverySettings {
  const apiKey = Deno.env.get('RESEND_API_KEY') || '';
  if (!apiKey) throw new Error('email_not_configured');
  return {
    apiKey,
    from: Deno.env.get('APPLICATION_FROM_EMAIL') || 'ER <enrollment@er-coaching.com>',
    replyTo: Deno.env.get('APPLICATION_REPLY_TO') || 'json@er-coaching.com',
    portalUrl: educationPortalUrl(Deno.env.get('EDUCATION_PORTAL_URL') || ''),
  };
}

export async function deliverEducationOnboardingEmail(client: OnboardingClient, applicationId: string, kind: OnboardingKind, actor: string | null, settings: DeliverySettings) {
  const result = (status: number, body: DeliveryResponse) => ({ status, body });
  const { data, error } = await client.rpc('edu_claim_onboarding_email', {
    p_application_id: applicationId, p_kind: kind, p_actor: actor,
  });
  if (error || !data) return result(500, { error: 'email_delivery_claim_failed' });
  const claim = data as OnboardingDelivery;
  if (!claim.ok) {
    if (claim.reason === 'already_sent') return result(200, { ok: true, email: { skipped: true, reason: 'already_sent', delivery_id: claim.delivery_id } });
    return result(409, { error: claim.reason || 'onboarding_not_ready' });
  }
  const deliveryId = claim.delivery_id;
  if (!deliveryId) return result(500, { error: 'email_delivery_claim_failed' });
  const markUncertain = async (reason: string) => {
    try {
      await client.rpc('edu_finish_onboarding_email', { p_delivery_id: deliveryId, p_provider_id: null, p_error: reason });
    } catch { /* 선점은 자동 만료되지 않아 기록 실패에도 재발송이 차단된다. */ }
  };

  // 선점 이후의 제출·등록 취소도 발송 직전에 다시 확인한다.
  let eligibility;
  try { eligibility = await client.rpc('edu_check_onboarding_email', { p_delivery_id: deliveryId }); }
  catch { eligibility = { data: null, error: true }; }
  if (eligibility.error || !eligibility.data) {
    await markUncertain('eligibility_check_failed');
    return result(500, { error: 'email_eligibility_check_failed' });
  }
  const current = eligibility.data as OnboardingDelivery;
  if (!current.ok) {
    await markUncertain('ineligible_before_send');
    return result(409, { error: current.reason || 'onboarding_not_ready' });
  }

  let providerId: string;
  try {
    if (!current.recipient || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(current.recipient)) throw new Error('invalid_recipient');
    const email = buildEducationOnboardingEmail(current, kind, settings.portalUrl);
    const sent = await sendResendEmail({
      apiKey: settings.apiKey, from: settings.from, replyTo: settings.replyTo,
      to: current.recipient, ...email, idempotencyKey: `education-onboarding/${deliveryId}`,
    });
    if (sent.skipped || !sent.id) throw new Error('provider_result_missing');
    providerId = sent.id;
  } catch {
    await markUncertain('provider_delivery_uncertain');
    return result(502, {
      error: 'email_delivery_uncertain',
      message: '메일 발송 결과를 확인하지 못했습니다. 중복 발송을 막기 위해 재발송을 차단했습니다. 운영자가 발송 기록을 확인해 주세요.',
    });
  }

  try {
    const saved = await client.rpc('edu_finish_onboarding_email', { p_delivery_id: deliveryId, p_provider_id: providerId, p_error: null });
    if (saved.error) throw saved.error;
  } catch {
    return result(500, {
      error: 'email_sent_record_failed',
      message: '메일은 발송되었지만 완료 기록을 저장하지 못했습니다. 재발송하기 전에 운영자가 발송 기록을 확인해 주세요.',
      email: { id: providerId, delivery_id: deliveryId },
    });
  }
  return result(200, { ok: true, email: { id: providerId, delivery_id: deliveryId } });
}

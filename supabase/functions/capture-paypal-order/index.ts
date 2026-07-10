// PayPal 결제 완료 리턴 URL — 주문 캡처·등록 확정
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { confirmProgramPayment } from '../_shared/confirm-program-payment.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { BASIC_COURSE_JULY_KEY } from '../_shared/program-pricing.ts';
import { capturePayPalOrder, paypalCredentialsFromEnv } from '../_shared/paypal.ts';

type CapturePayload = {
  paypal_order_id?: string;
  token?: string;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const credentials = paypalCredentialsFromEnv();
  if (!credentials) {
    return new Response(JSON.stringify({ error: 'paypal_not_configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = (await req.json()) as CapturePayload;
    const orderId = String(body.paypal_order_id || body.token || '').trim();
    if (!orderId) {
      return new Response(JSON.stringify({ error: 'missing_order_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: app } = await supabase
      .from('program_applications')
      .select('id, status, paypal_capture_id')
      .eq('paypal_order_id', orderId)
      .maybeSingle();

    if (!app) {
      return new Response(JSON.stringify({ error: 'application_not_found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (app.status === 'confirmed' && app.paypal_capture_id) {
      return new Response(JSON.stringify({ ok: true, confirmed: true, duplicate: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const capture = await capturePayPalOrder({ credentials, orderId });
    if (capture.status !== 'COMPLETED' || !capture.captureId) {
      return new Response(JSON.stringify({ error: 'capture_not_completed', status: capture.status }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const applicationId = capture.customId || String(app.id);
    const result = await confirmProgramPayment(supabase, {
      applicationId,
      programKey: BASIC_COURSE_JULY_KEY,
      provider: 'paypal',
      externalId: capture.captureId,
      amountUsd: capture.amountUsd,
      currency: capture.currency,
      customerEmail: capture.payerEmail,
      paymentMethod: 'paypal',
      paypalOrderId: capture.orderId,
      paypalCaptureId: capture.captureId,
      rawMetadata: { source: 'capture_return' },
    });

    return new Response(JSON.stringify({ ok: true, ...result }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : 'internal_error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

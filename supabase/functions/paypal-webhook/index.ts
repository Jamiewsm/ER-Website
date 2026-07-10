// PayPal webhook — 결제 캡처 완료 시 등록 확정
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { confirmProgramPayment } from '../_shared/confirm-program-payment.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { BASIC_COURSE_JULY_KEY } from '../_shared/program-pricing.ts';
import {
  capturePayPalOrder,
  parsePayPalWebhookCapture,
  paypalCredentialsFromEnv,
  verifyPayPalWebhook,
} from '../_shared/paypal.ts';

type PayPalWebhookEvent = {
  event_type?: string;
  resource?: Record<string, unknown>;
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

  const payload = await req.text();
  const webhookId = (Deno.env.get('PAYPAL_WEBHOOK_ID') || '').trim();

  if (webhookId) {
    const valid = await verifyPayPalWebhook({
      credentials,
      webhookId,
      headers: req.headers,
      body: payload,
    });
    if (!valid) {
      return new Response(JSON.stringify({ error: 'invalid_signature' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } else {
    console.warn('PAYPAL_WEBHOOK_ID not set — skipping signature verification');
  }

  let event: PayPalWebhookEvent;
  try {
    event = JSON.parse(payload) as PayPalWebhookEvent;
  } catch {
    return new Response(JSON.stringify({ error: 'invalid_payload' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const eventType = String(event.event_type || '');
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const supabase = createClient(supabaseUrl, serviceKey);

  if (eventType === 'CHECKOUT.ORDER.APPROVED') {
    const orderId = String(event.resource?.id || '');
    if (!orderId) {
      return new Response(JSON.stringify({ error: 'missing_order_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    try {
      const capture = await capturePayPalOrder({ credentials, orderId });
      if (capture.status !== 'COMPLETED' || !capture.captureId) {
        return new Response(JSON.stringify({ ok: true, capture_status: capture.status }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const applicationId = capture.customId;
      if (!applicationId) {
        return new Response(JSON.stringify({ error: 'missing_custom_id' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

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
        rawMetadata: { event_type: eventType, capture },
      });

      return new Response(JSON.stringify({ ok: true, ...result }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (err) {
      console.error(err);
      return new Response(JSON.stringify({ error: 'capture_failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
    const resource = event.resource || {};
    const capture = parsePayPalWebhookCapture(resource);
    if (!capture?.captureId) {
      return new Response(JSON.stringify({ error: 'invalid_capture_resource' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let applicationId = capture.customId;
    if (!applicationId && capture.orderId) {
      const { data: appRow } = await supabase
        .from('program_applications')
        .select('id')
        .eq('paypal_order_id', capture.orderId)
        .maybeSingle();
      applicationId = appRow?.id ? String(appRow.id) : '';
    }

    if (!applicationId) {
      return new Response(JSON.stringify({ error: 'missing_application_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    try {
      const result = await confirmProgramPayment(supabase, {
        applicationId,
        programKey: BASIC_COURSE_JULY_KEY,
        provider: 'paypal',
        externalId: capture.captureId,
        amountUsd: capture.amountUsd,
        currency: capture.currency,
        customerEmail: capture.payerEmail,
        paymentMethod: 'paypal',
        paypalOrderId: capture.orderId || null,
        paypalCaptureId: capture.captureId,
        rawMetadata: { event_type: eventType, resource },
      });

      return new Response(JSON.stringify({ ok: true, ...result }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'confirm_failed';
      return new Response(JSON.stringify({ error: message }), {
        status: message === 'application_not_found' ? 404 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  return new Response(JSON.stringify({ ok: true, ignored: eventType || 'unknown' }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});

// PayPal Checkout Orders API v2 — OAuth·주문·캡처·웹훅 검증

export type PayPalMode = 'sandbox' | 'live';

export type PayPalCredentials = {
  clientId: string;
  clientSecret: string;
  mode: PayPalMode;
};

export type PayPalOrder = {
  id: string;
  status: string;
  approveUrl: string | null;
};

export type PayPalCapture = {
  orderId: string;
  captureId: string;
  status: string;
  amountUsd: number;
  currency: string;
  customId: string;
  payerEmail: string;
};

export function paypalApiBase(mode: PayPalMode): string {
  return mode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
}

export function paypalModeFromEnv(): PayPalMode {
  const mode = (Deno.env.get('PAYPAL_MODE') || 'sandbox').trim().toLowerCase();
  return mode === 'live' ? 'live' : 'sandbox';
}

export function paypalCredentialsFromEnv(): PayPalCredentials | null {
  const clientId = (Deno.env.get('PAYPAL_CLIENT_ID') || '').trim();
  const clientSecret = (Deno.env.get('PAYPAL_CLIENT_SECRET') || '').trim();
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret, mode: paypalModeFromEnv() };
}

export function isPayPalConfigured(): boolean {
  return paypalCredentialsFromEnv() !== null;
}

let cachedToken: { value: string; expiresAtMs: number } | null = null;

export async function getPayPalAccessToken(credentials: PayPalCredentials): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAtMs > now + 30_000) {
    return cachedToken.value;
  }

  const auth = btoa(`${credentials.clientId}:${credentials.clientSecret}`);
  const response = await fetch(`${paypalApiBase(credentials.mode)}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const body = await response.json();
  if (!response.ok) {
    console.error('paypal token failed', body);
    throw new Error(body?.error_description || body?.error || 'paypal_token_failed');
  }

  const expiresIn = Number(body.expires_in || 300);
  cachedToken = {
    value: String(body.access_token),
    expiresAtMs: now + expiresIn * 1000,
  };
  return cachedToken.value;
}

export async function createPayPalOrder(input: {
  credentials: PayPalCredentials;
  amountUsd: number;
  productName: string;
  applicationId: string;
  programKey: string;
  returnUrl: string;
  cancelUrl: string;
}): Promise<PayPalOrder> {
  const token = await getPayPalAccessToken(input.credentials);
  const amountValue = input.amountUsd.toFixed(2);

  const response = await fetch(`${paypalApiBase(input.credentials.mode)}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: input.applicationId,
          custom_id: input.applicationId,
          description: input.productName,
          amount: {
            currency_code: 'USD',
            value: amountValue,
          },
        },
      ],
      application_context: {
        brand_name: 'ER Coaching',
        locale: 'en-US',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: input.returnUrl,
        cancel_url: input.cancelUrl,
      },
    }),
  });

  const body = await response.json();
  if (!response.ok) {
    console.error('paypal create order failed', body);
    throw new Error(body?.message || 'paypal_create_order_failed');
  }

  const links = Array.isArray(body.links) ? body.links : [];
  const approve = links.find((link: { rel?: string }) => link.rel === 'approve');

  return {
    id: String(body.id),
    status: String(body.status || ''),
    approveUrl: approve?.href ? String(approve.href) : null,
  };
}

export async function capturePayPalOrder(input: {
  credentials: PayPalCredentials;
  orderId: string;
}): Promise<PayPalCapture> {
  const token = await getPayPalAccessToken(input.credentials);
  const response = await fetch(
    `${paypalApiBase(input.credentials.mode)}/v2/checkout/orders/${encodeURIComponent(input.orderId)}/capture`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );

  const body = await response.json();
  if (!response.ok) {
    console.error('paypal capture failed', body);
    throw new Error(body?.message || 'paypal_capture_failed');
  }

  return parsePayPalCaptureBody(body);
}

export function parsePayPalCaptureBody(body: Record<string, unknown>): PayPalCapture {
  const purchaseUnits = Array.isArray(body.purchase_units) ? body.purchase_units : [];
  const unit = (purchaseUnits[0] || {}) as Record<string, unknown>;
  const payments = (unit.payments || {}) as Record<string, unknown>;
  const captures = Array.isArray(payments.captures) ? payments.captures : [];
  const capture = (captures[0] || {}) as Record<string, unknown>;
  const amount = (capture.amount || {}) as Record<string, unknown>;
  const payer = (body.payer || {}) as Record<string, unknown>;
  const payerEmail = String(payer.email_address || '');

  return {
    orderId: String(body.id || ''),
    captureId: String(capture.id || ''),
    status: String(capture.status || body.status || ''),
    amountUsd: Number(amount.value || 0),
    currency: String(amount.currency_code || 'USD').toLowerCase(),
    customId: String(unit.custom_id || unit.reference_id || ''),
    payerEmail,
  };
}

export function parsePayPalWebhookCapture(resource: Record<string, unknown>): PayPalCapture | null {
  const amount = (resource.amount || {}) as Record<string, unknown>;
  const related = (resource.supplementary_data || {}) as Record<string, unknown>;
  const relatedIds = (related.related_ids || {}) as Record<string, unknown>;

  const captureId = String(resource.id || '');
  if (!captureId) return null;

  return {
    orderId: String(relatedIds.order_id || ''),
    captureId,
    status: String(resource.status || 'COMPLETED'),
    amountUsd: Number(amount.value || 0),
    currency: String(amount.currency_code || 'USD').toLowerCase(),
    customId: String(resource.custom_id || ''),
    payerEmail: String(resource.payer?.email_address || ''),
  };
}

export async function verifyPayPalWebhook(input: {
  credentials: PayPalCredentials;
  webhookId: string;
  headers: Headers;
  body: string;
}): Promise<boolean> {
  if (!input.webhookId) return false;

  const transmissionId = input.headers.get('paypal-transmission-id') || '';
  const transmissionTime = input.headers.get('paypal-transmission-time') || '';
  const certUrl = input.headers.get('paypal-cert-url') || '';
  const authAlgo = input.headers.get('paypal-auth-algo') || '';
  const transmissionSig = input.headers.get('paypal-transmission-sig') || '';

  if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) {
    return false;
  }

  const token = await getPayPalAccessToken(input.credentials);
  const response = await fetch(
    `${paypalApiBase(input.credentials.mode)}/v1/notifications/verify-webhook-signature`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        auth_algo: authAlgo,
        cert_url: certUrl,
        transmission_id: transmissionId,
        transmission_sig: transmissionSig,
        transmission_time: transmissionTime,
        webhook_id: input.webhookId,
        webhook_event: JSON.parse(input.body),
      }),
    },
  );

  const result = await response.json();
  return response.ok && result.verification_status === 'SUCCESS';
}

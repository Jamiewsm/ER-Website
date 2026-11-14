// Resend API 발송 헬퍼

// 기존 type=email 폼의 단일 주소 구문. 문자열 전체를 검사하며 주소를 추출하지 않는다.
// https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address
export function isValidEmailAddress(value: string): boolean {
  return /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(value);
}

function isValidReplyToEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

export async function sendResendEmail(input: {
  apiKey: string;
  from: string;
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  idempotencyKey?: string;
}): Promise<{ id?: string; skipped?: boolean }> {
  if (!input.apiKey) {
    console.warn('RESEND_API_KEY missing — email skipped:', input.subject);
    return { skipped: true };
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      'Content-Type': 'application/json',
      ...(input.idempotencyKey ? { 'Idempotency-Key': input.idempotencyKey } : {}),
    },
    body: JSON.stringify({
      from: input.from,
      to: Array.isArray(input.to) ? input.to : [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
      reply_to: input.replyTo && isValidReplyToEmail(input.replyTo) ? input.replyTo : undefined,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Resend error ${response.status}: ${text}`);
  }

  const data = await response.json();
  return { id: data.id };
}

export function extractEmailFromContact(contact: string): string | null {
  const trimmed = String(contact || '').trim();
  const match = trimmed.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match ? match[0] : null;
}

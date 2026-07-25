// ER Business 문의 접수 — Cloudflare Email Routing으로 restoration.son@gmail.com 전달
export const INQUIRY_TO = "restoration.son@gmail.com";
export const INQUIRY_FROM = "hello@er-coaching.com";

export type OutboundEmail = {
  from: string;
  to: string;
  raw: string;
};

export type InquiryEmailBinding = {
  send(message: OutboundEmail): Promise<void>;
};

type InquiryPayload = {
  company?: string;
  name?: string;
  role?: string;
  email?: string;
  phone?: string;
  teamSize?: string;
  timing?: string;
  format?: string;
  budget?: string;
  challenge?: string;
  outcome?: string;
  privacyConsent?: boolean | string;
  website?: string;
};

function trim(value: unknown, max = 500) {
  return String(value ?? "")
    .replace(/\r\n/g, "\n")
    .trim()
    .slice(0, max);
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(value);
}

function encodeUtf8Base64(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

export function buildRawMessage({
  from,
  to,
  replyTo,
  subject,
  text,
}: {
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  text: string;
}) {
  const encodedSubject = `=?UTF-8?B?${encodeUtf8Base64(subject)}?=`;
  const encodedBody = encodeUtf8Base64(`${text}\n`).match(/.{1,76}/g)?.join("\r\n") ?? "";

  return [
    `From: ER Business <${from}>`,
    `To: ${to}`,
    `Reply-To: ${replyTo}`,
    `Subject: ${encodedSubject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    encodedBody,
  ].join("\r\n");
}

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export async function handleContactRequest(
  request: Request,
  email: InquiryEmailBinding,
): Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        Allow: "POST, OPTIONS",
      },
    });
  }

  if (request.method !== "POST") {
    return json(405, { error: "method_not_allowed" });
  }

  let payload: InquiryPayload;
  try {
    payload = (await request.json()) as InquiryPayload;
  } catch {
    return json(400, { error: "invalid_json" });
  }

  // Honeypot — bots that fill hidden fields are rejected quietly.
  if (trim(payload.website, 200)) {
    return json(200, { ok: true });
  }

  const company = trim(payload.company, 80);
  const name = trim(payload.name, 40);
  const role = trim(payload.role, 80);
  const emailAddress = trim(payload.email, 120);
  const phone = trim(payload.phone, 30);
  const teamSize = trim(payload.teamSize, 40);
  const timing = trim(payload.timing, 80);
  const format = trim(payload.format, 80);
  const budget = trim(payload.budget, 100);
  const challenge = trim(payload.challenge, 360);
  const outcome = trim(payload.outcome, 220);
  const privacyConsent =
    payload.privacyConsent === true ||
    payload.privacyConsent === "true" ||
    payload.privacyConsent === "on";

  if (!company || !name || !role || !emailAddress || !teamSize || !challenge) {
    return json(400, { error: "missing_required_fields" });
  }

  if (!isEmail(emailAddress)) {
    return json(400, { error: "invalid_email" });
  }

  if (!privacyConsent) {
    return json(400, { error: "privacy_consent_required" });
  }

  const subject = `[ER Business 제안 요청] ${company} · ${name}`;
  const text = [
    "ER Business 기업교육·조직 컨설팅 문의",
    "",
    `회사·기관명: ${company}`,
    `담당자: ${name}`,
    `담당 역할: ${role}`,
    `회신 이메일: ${emailAddress}`,
    `연락처: ${phone || "미기재"}`,
    `팀 규모: ${teamSize}`,
    `희망 일정: ${timing || "협의 필요"}`,
    `진행 방식·지역: ${format || "협의 필요"}`,
    `예산 범위: ${budget || "협의 필요"}`,
    "개인정보 처리 동의: 동의함",
    "",
    "[현재 가장 큰 고민]",
    challenge,
    "",
    "[기대하는 변화]",
    outcome || "미기재",
    "",
    `출처: ${new URL(request.url).origin}/contact`,
  ].join("\n");

  try {
    await email.send({
      from: INQUIRY_FROM,
      to: INQUIRY_TO,
      raw: buildRawMessage({
        from: INQUIRY_FROM,
        to: INQUIRY_TO,
        replyTo: emailAddress,
        subject,
        text,
      }),
    });
  } catch (error) {
    console.error("business inquiry email failed", error);
    return json(502, { error: "email_send_failed" });
  }

  return json(200, { ok: true });
}

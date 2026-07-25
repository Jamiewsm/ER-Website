// ER Business 문의 API 단위 테스트
import assert from "node:assert/strict";
import test from "node:test";
import {
  INQUIRY_FROM,
  INQUIRY_TO,
  handleContactRequest,
} from "../worker/contact.ts";

function validPayload(overrides = {}) {
  return {
    company: "테스트기업",
    name: "김담당",
    role: "HR",
    email: "lead@example.com",
    phone: "010-1234-5678",
    teamSize: "10–29명",
    timing: "2026년 10월",
    format: "온라인",
    budget: "협의",
    challenge: "팀 소통이 반복해서 어긋납니다.",
    outcome: "공통 언어를 만들고 싶습니다.",
    privacyConsent: true,
    website: "",
    ...overrides,
  };
}

test("contact API rejects missing required fields", async () => {
  const response = await handleContactRequest(
    new Request("https://business.er-coaching.com/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validPayload({ company: "" })),
    }),
    { async send() {} },
  );

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: "missing_required_fields" });
});

test("contact API quietly accepts honeypot spam", async () => {
  let sent = 0;
  const response = await handleContactRequest(
    new Request("https://business.er-coaching.com/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validPayload({ website: "https://spam.example" })),
    }),
    {
      async send() {
        sent += 1;
      },
    },
  );

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(sent, 0);
});

test("contact API sends inquiry email to restoration.son@gmail.com", async () => {
  /** @type {{ from: string, to: string, raw: string } | null} */
  let message = null;

  const response = await handleContactRequest(
    new Request("https://business.er-coaching.com/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validPayload()),
    }),
    {
      async send(nextMessage) {
        message = nextMessage;
      },
    },
  );

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  assert.ok(message);
  assert.equal(message.from, INQUIRY_FROM);
  assert.equal(message.to, INQUIRY_TO);
  assert.match(message.raw, /Reply-To: lead@example\.com/);
  assert.match(message.raw, /Content-Transfer-Encoding: base64/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const emailTemplates = readFileSync(path.join(root, 'supabase/functions/_shared/email-templates.ts'), 'utf8');
const notifyFn = readFileSync(path.join(root, 'supabase/functions/notify-program-application/index.ts'), 'utf8');
const paymentPage = readFileSync(path.join(root, 'basic-course-payment.html'), 'utf8');
const paymentJs = readFileSync(path.join(root, 'js/basic-course-payment.js'), 'utf8');

test('registration email template supports PayPal checkout button', () => {
  assert.match(emailTemplates, /paypalCheckoutUrl/);
  assert.match(emailTemplates, /PayPal로 \$.* 결제하기/);
  assert.doesNotMatch(emailTemplates, /Friends &amp; Family/);
});

test('notify-program-application creates PayPal order when configured', () => {
  assert.match(notifyFn, /createPayPalOrder/);
  assert.match(notifyFn, /isPayPalConfigured/);
  assert.match(notifyFn, /paypalCheckoutUrl/);
});

test('paypal return page calls capture edge function', () => {
  assert.match(paymentPage, /basic-course-payment\.js/);
  assert.match(paymentJs, /capture-paypal-order/);
  assert.match(paymentJs, /token/);
});

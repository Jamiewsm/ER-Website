import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const html = readFileSync(new URL('../oauth-consent.html', import.meta.url), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script, 'bridge script exists');

function run(search) {
  let redirected;
  const status = { textContent: '' };
  runInNewContext(script, {
    URL, URLSearchParams,
    location: { search, replace: (url) => { redirected = url; } },
    document: { getElementById: () => status },
  });
  return { redirected, status: status.textContent };
}

test('bridge forwards only a valid authorization ID to the fixed coach origin', () => {
  const output = run('?authorization_id=valid_oauth_id_123&redirect_uri=https://evil.example');
  const url = new URL(output.redirected);
  assert.equal(url.origin, 'https://coach.er-coaching.com');
  assert.equal(url.pathname, '/oauth-consent');
  assert.equal(url.search, '?authorization_id=valid_oauth_id_123');
});

test('bridge does not redirect without a valid authorization ID', () => {
  assert.equal(run('?authorization_id=%2F%2Fevil.example').redirected, undefined);
  assert.match(run('').status, /유효한 연결 요청이 없습니다/);
});

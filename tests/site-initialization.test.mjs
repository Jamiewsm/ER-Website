// 인증 응답이 늦어도 공개 화면을 표시하고 사용자의 탐색과 폼을 보존하는지 검증한다.
import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../js/app-init.js', import.meta.url), 'utf8');
function app(section = 'home', restored = null) {
  let finish;
  const auth = new Promise(resolve => { finish = resolve; });
  let current = section;
  const renders = [], scheduled = [];
  let restores = 0;
  const context = {
    window: { location: { search: restored ? '?site_admin=' + restored : '' }, addEventListener() {} },
    document: { readyState: 'loading', getElementById: () => null, addEventListener() {} },
    state: { currentSection: 'home', currentPayload: null },
    parseSectionHash: () => ({ sectionId: current, payload: null }),
    redirectPortalSection: () => false,
    restoreSiteAdminReturn() { restores += 1; return restored ? { sectionId: restored, payload: null } : null; },
    initializeSupabase: () => auth,
    renderSection(id) { renders.push(id); context.state.currentSection = id; },
    setTimeout(fn) { scheduled.push(fn); }, URLSearchParams,
  };
  vm.createContext(context);
  vm.runInContext(source, context);
  context.runAppInit();
  return { context, renders, finish, get restores() { return restores; }, navigate(id) { current = id; context.renderSection(id); } };
}

test('public content is visible while authentication is still pending', () => {
  const a = app('apply');
  assert.deepEqual(a.renders, ['apply']);
});
test('authentication completion does not rebuild an active public form', async () => {
  const a = app('home');
  a.navigate('apply');
  a.finish();
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(a.renders, ['home', 'apply']);
});
test('site admin entry waits for authentication and retains the admin return route', async () => {
  const a = app('home', 'coach_admin');
  assert.deepEqual(a.renders, []);
  a.finish();
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(a.renders, ['coach_admin']);
});
test('OAuth callback URL is not rewritten before the auth SDK has read it', async () => {
  const a = app('access_token=synthetic-callback-only', 'coach_admin');
  assert.equal(a.restores, 0, 'restoring the route would erase the callback hash');
  a.finish();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(a.restores, 1);
  assert.deepEqual(a.renders, ['coach_admin']);
});
test('leaving an admin entry while auth is pending does not pull the visitor back', async () => {
  const a = app('coach_admin');
  a.navigate('parenting');
  a.finish();
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(a.renders, ['parenting']);
});

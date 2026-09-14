// 포털 직접 진입과 기존 사이트 관리자 인증 경로를 검증합니다.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const html = read('index.html');

function createApp({ user = null, isCoach = false, search = '', hash = '' } = {}) {
  const navigations = [];
  const replacements = [];
  const historyChanges = [];
  const nodes = new Map();
  for (const id of ['main-content', 'sr-status', 'auth-modal', 'auth-message', 'auth-email', 'auth-password', 'auth-google-btn', 'desktop-auth-btn', 'mobile-auth-btn', 'mobile-header-auth-btn']) {
    const classes = new Set(['hidden']);
    nodes.set(id, {
      innerHTML: '', textContent: '', value: '', disabled: false,
      classList: { add: (name) => classes.add(name), remove: (name) => classes.delete(name), contains: (name) => classes.has(name) }
    });
  }
  const state = { user, isCoach, coachProfile: isCoach ? { role: 'head_coach' } : null, currentSection: 'home' };
  const location = { origin: 'https://er-coaching.com', pathname: '/', search, hash, assign: (url) => navigations.push(url), replace: (url) => replacements.push(url) };
  const context = {
    state, URLSearchParams, NOTICE_ADMIN_EMAIL: 'admin@example.com',
    window: { state, location, COACH_APP_URL: 'https://coach.er-coaching.com', scrollTo() {} },
    document: { getElementById: (id) => nodes.get(id) || null, body: { classList: { toggle() {}, remove() {} } } },
    history: { replaceState: (_state, _title, url) => historyChanges.push(url) },
    setTimeout() {},
    renderListSkeleton: () => '<span>loading</span>',
    renderNotices: () => '<h1>공지사항</h1>',
    renderHome: () => '<h1>ER</h1>'
  };
  vm.createContext(context);
  for (const source of ['js/auth.js', 'js/app-helpers.js', 'js/coach-portal.js', 'js/sections/account.js', 'js/coach/views.js', 'js/app-core.js']) {
    vm.runInContext(read(source), context);
  }
  return { context, nodes, navigations, replacements, historyChanges };
}

test('desktop and mobile portal links work directly without a modal or JavaScript login', () => {
  for (const id of ['desktop-auth-btn', 'mobile-auth-btn', 'mobile-header-auth-btn']) {
    const anchor = html.match(new RegExp('<a\\b[^>]*id="' + id + '"[^>]*>'))?.[0];
    assert.ok(anchor, id + ' must be a native link');
    assert.match(anchor, /href="https:\/\/coach\.er-coaching\.com\/education\.html"/);
    assert.doesNotMatch(anchor, /target=|onclick=|aria-expanded=/);
  }
  assert.doesNotMatch(html, /id="portal-entry-modal"|id="desktop-account-menu"|마이페이지/);
  assert.doesNotMatch(read('js/app-init.js'), /desktop-auth-btn|mobile-header-auth-btn|mobile-auth-btn/);
});

test('portal entry and former mypage helpers ignore website authentication state', () => {
  for (const user of [null, { id: 'student' }, { id: 'coach' }]) {
    const app = createApp({ user, isCoach: user?.id === 'coach' });
    app.context.openPortalEntry();
    app.context.toggleLogin();
    app.context.openMyAccount();
    app.context.updateAuthButtons();
    assert.deepEqual(app.navigations, Array(3).fill('https://coach.er-coaching.com/education.html'));
    assert.equal(app.nodes.get('auth-modal').classList.contains('hidden'), true);
    for (const id of ['desktop-auth-btn', 'mobile-auth-btn', 'mobile-header-auth-btn']) {
      assert.equal(app.nodes.get(id).href, 'https://coach.er-coaching.com/education.html');
    }
  }
});

test('bookmarked login, mypage and education routes go to the default portal', () => {
  for (const section of ['login', 'mypage', 'portal', 'education']) {
    const app = createApp();
    app.context.renderSection(section);
    assert.deepEqual(app.navigations, ['https://coach.er-coaching.com/education.html']);
    assert.equal(app.nodes.get('main-content').innerHTML, '');
  }
});

test('legacy coach links retain their destination without website login or iframe', () => {
  const routes = { coach: 'dashboard', coach_portal: 'dashboard', coach_tasks: 'training', coach_materials: 'resources', coach_schedule: 'calendar', coach_notes: 'reports', coach_mentoring: 'practicum' };
  for (const [section, tab] of Object.entries(routes)) {
    const app = createApp();
    app.context.renderSection(section);
    assert.deepEqual(app.navigations, ['https://coach.er-coaching.com#' + tab]);
    assert.equal(app.nodes.get('main-content').innerHTML, '');
  }
  assert.doesNotMatch(read('js/coach/views.js'), /<iframe|coach-portal-embed-frame/);
});

test('initial legacy redirects replace history so the back button does not loop', () => {
  const app = createApp();
  assert.equal(app.context.redirectPortalSection('mypage', null, true), true);
  assert.equal(app.context.redirectPortalSection('coach_schedule', null, true), true);
  assert.deepEqual(app.replacements, ['https://coach.er-coaching.com/education.html', 'https://coach.er-coaching.com#calendar']);
  assert.deepEqual(app.navigations, []);
});

test('coach destinations only accept supported tabs and always stay on the configured portal', () => {
  const app = createApp();
  app.context.renderSection('coach_portal', { tab: 'calendar' });
  app.context.renderSection('coach_portal', { tab: 'https://untrusted.example/' });
  app.context.openCoachApp('mentoring');
  app.context.openCoachPortalFromMenu();
  app.context.openCoachAppFromMenu();
  assert.deepEqual(app.navigations, [
    'https://coach.er-coaching.com#calendar', 'https://coach.er-coaching.com',
    'https://coach.er-coaching.com#practicum', 'https://coach.er-coaching.com', 'https://coach.er-coaching.com'
  ]);
});

test('site administrator route keeps login, permission checks and management actions', () => {
  const anonymous = createApp();
  anonymous.context.renderSection('coach_admin', null, { syncHash: false });
  assert.match(anonymous.nodes.get('main-content').innerHTML, /openAuthModal\(\).*관리자 로그인/s);
  assert.deepEqual(anonymous.navigations, []);

  const student = createApp({ user: { id: 'student' } });
  student.context.renderSection('coach_admin', null, { syncHash: false });
  assert.match(student.nodes.get('main-content').innerHTML, /관리자\/헤드 코치만/);
  assert.doesNotMatch(student.nodes.get('main-content').innerHTML, /id="coach-admin-users-list"/);

  const admin = createApp({ user: { id: 'head' }, isCoach: true });
  admin.context.renderSection('coach_admin', null, { syncHash: false });
  assert.match(admin.nodes.get('main-content').innerHTML, /id="coach-admin-applications-list"/);
  assert.match(admin.nodes.get('main-content').innerHTML, /id="coach-admin-users-list"/);
  assert.match(admin.nodes.get('main-content').innerHTML, /공지 관리/);
  assert.match(admin.nodes.get('main-content').innerHTML, /handleLogout\(\)/);
  assert.match(html, /onclick="openSiteAdmin\(\)"/);
});

test('Google authentication keeps administrator return routes within the website', async () => {
  for (const section of ['coach_admin', 'notices']) {
    const app = createApp();
    app.context.state.currentSection = section;
    const requests = [];
    app.context.window.supabaseClient = { auth: { signInWithOAuth: async (request) => {
      requests.push(request);
      return { data: { url: 'https://accounts.google.com/example' } };
    } } };
    await app.context.handleGoogleLogin();
    assert.equal(requests[0].options.redirectTo, 'https://er-coaching.com/?site_admin=' + section);
    assert.equal(requests[0].options.skipBrowserRedirect, true);
    assert.deepEqual(app.navigations, ['https://accounts.google.com/example']);
  }
});

test('administrator OAuth return restores only allowlisted routes and removes the one-time parameter', () => {
  for (const section of ['coach_admin', 'notices']) {
    const app = createApp({ search: '?utm_source=test&site_admin=' + section });
    const route = app.context.restoreSiteAdminReturn();
    assert.equal(route.sectionId, section);
    assert.deepEqual(app.historyChanges, ['/?utm_source=test#' + section]);
  }
  const app = createApp({ search: '?site_admin=https://untrusted.example/' });
  assert.equal(app.context.restoreSiteAdminReturn(), null);
  assert.deepEqual(app.historyChanges, []);
  assert.deepEqual(app.navigations, []);
});

test('administrator email login returns to management instead of the removed mypage', async () => {
  const app = createApp({ user: { id: 'head' }, isCoach: true });
  app.nodes.get('auth-email').value = 'head@example.com';
  app.nodes.get('auth-password').value = 'example-password';
  app.context.window.supabaseClient = { auth: { signInWithPassword: async () => ({ data: { session: { user: { id: 'head' } } } }) } };
  app.context.loadCoachProfile = async () => {};
  await app.context.handleEmailAuth('login');
  assert.equal(app.context.state.currentSection, 'coach_admin');
  assert.match(app.nodes.get('main-content').innerHTML, /coach-admin-applications-list/);
  assert.deepEqual(app.navigations, []);
});

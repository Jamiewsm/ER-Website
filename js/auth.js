// ER-Website: Auth (depends on config.js, supabase-client.js; uses global state, renderSection)
function isSupabaseConfigured() {
  return Boolean(window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.url && window.SUPABASE_CONFIG.anonKey);
}

async function loadCoachProfile() {
  if (!window.state) return;
  var s = window.state;
  s.coachProfileLoading = true;
  s.isCoach = false;
  s.coachProfile = null;
  updateAuthButtons();
  if (!window.supabaseClient || !s.user || !s.user.id) {
    s.coachProfileLoading = false;
    updateAuthButtons();
    return;
  }
  try {
    var res = await window.supabaseClient
      .from('coach_profiles')
      .select('user_id, display_name, role, is_active')
      .eq('user_id', s.user.id)
      .maybeSingle();
    if (!res.error && res.data && res.data.is_active) {
      s.isCoach = true;
      s.coachProfile = res.data;
    }
  } finally {
    s.coachProfileLoading = false;
    updateAuthButtons();
  }
}

function updateAuthButtons() {
  if (!window.state) return;
  var state = window.state;
  var desktopBtn = document.getElementById('desktop-auth-btn');
  var desktopMenu = document.getElementById('desktop-account-menu');
  var coachBtn = document.getElementById('desktop-account-coach-btn');
  var coachAppBtn = document.getElementById('desktop-account-app-btn');
  var mobileBtn = document.getElementById('mobile-auth-btn');
  var mobileLabel = !state.user ? '기존 참여자 로그인' : (state.isCoach ? '코치 포털' : '마이페이지');
  if (mobileBtn) mobileBtn.innerHTML = '<i class="far fa-user mr-2"></i> ' + mobileLabel;
  if (desktopBtn) {
    desktopBtn.innerHTML = '<i class="' + (state.user ? 'fas fa-user-check' : 'far fa-user') + '"></i>';
    desktopBtn.classList.toggle('text-er-dark', Boolean(state.user));
    desktopBtn.setAttribute('aria-expanded', 'false');
  }
  if (desktopMenu) desktopMenu.classList.add('hidden');
  if (coachBtn) coachBtn.classList.toggle('hidden', !state.isCoach);
  if (coachAppBtn) coachAppBtn.classList.toggle('hidden', !state.isCoach);
}

function closeDesktopAccountMenu() {
  var menu = document.getElementById('desktop-account-menu');
  var button = document.getElementById('desktop-auth-btn');
  if (menu) menu.classList.add('hidden');
  if (button) button.setAttribute('aria-expanded', 'false');
}

function openDesktopAccountMenu() {
  var menu = document.getElementById('desktop-account-menu');
  var button = document.getElementById('desktop-auth-btn');
  if (!menu || !button) return;
  menu.classList.remove('hidden');
  button.setAttribute('aria-expanded', 'true');
}

function handleDesktopAuthClick(event) {
  if (event) event.stopPropagation();
  if (!window.state) {
    if (typeof toggleLogin === 'function') toggleLogin();
    else if (typeof openAuthModal === 'function') openAuthModal();
    return;
  }
  if (!window.state.user) {
    toggleLogin();
    return;
  }
  var menu = document.getElementById('desktop-account-menu');
  if (!menu) {
    if (typeof renderSection === 'function') renderSection(window.state.isCoach ? 'coach_portal' : 'mypage');
    return;
  }
  var shouldOpen = menu.classList.contains('hidden');
  closeDesktopAccountMenu();
  if (shouldOpen) openDesktopAccountMenu();
}
if (typeof window !== 'undefined') { window.handleDesktopAuthClick = handleDesktopAuthClick; }

async function handleLogoutFromMenu() {
  closeDesktopAccountMenu();
  await handleLogout();
}

function setAuthMessage(message, isError) {
  if (isError === undefined) isError = false;
  var messageEl = document.getElementById('auth-message');
  if (!messageEl) return;
  if (!message) {
    messageEl.className = 'mt-4 text-xs hidden';
    messageEl.textContent = '';
    return;
  }
  messageEl.className = 'mt-4 text-xs ' + (isError ? 'text-red-500' : 'text-green-600');
  messageEl.textContent = message;
}

function setAuthButtonsDisabled(disabled) {
  ['auth-login-btn', 'auth-signup-btn', 'auth-google-btn'].forEach(function (id) {
    var btn = document.getElementById(id);
    if (btn) btn.disabled = disabled;
  });
}

function openAuthModal() {
  var modal = document.getElementById('auth-modal');
  if (!modal) return;
  setAuthMessage('');
  modal.classList.remove('hidden');
}
if (typeof window !== 'undefined') { window.openAuthModal = openAuthModal; }

function closeAuthModal() {
  var modal = document.getElementById('auth-modal');
  if (!modal) return;
  modal.classList.add('hidden');
}
if (typeof window !== 'undefined') { window.closeAuthModal = closeAuthModal; }

async function initializeSupabase() {
  if (!isSupabaseConfigured()) {
    updateAuthButtons();
    return;
  }
  if (!window.supabaseClient) return;
  var sessionRes = await window.supabaseClient.auth.getSession();
  if (window.state) window.state.user = (sessionRes && sessionRes.data && sessionRes.data.session) ? sessionRes.data.session.user : null;
  await loadCoachProfile();
  updateAuthButtons();
  if (window.state && (window.state.currentSection === 'mypage' || String(window.state.currentSection).indexOf('coach_') === 0)) {
    if (typeof renderSection === 'function') renderSection(window.state.currentSection, window.state.currentPayload, { syncHash: false });
  }
  window.supabaseClient.auth.onAuthStateChange(async function (_event, session) {
    if (window.state) window.state.user = session ? session.user : null;
    await loadCoachProfile();
    updateAuthButtons();
    if (window.state && (window.state.currentSection === 'mypage' || String(window.state.currentSection).indexOf('coach_') === 0)) {
      if (typeof renderSection === 'function') renderSection(window.state.currentSection, window.state.currentPayload, { syncHash: false });
    }
  });
}

async function handleEmailAuth(mode) {
  if (!window.supabaseClient) return;
  var emailEl = document.getElementById('auth-email');
  var passwordEl = document.getElementById('auth-password');
  var email = emailEl ? emailEl.value.trim() : '';
  var password = passwordEl ? passwordEl.value : '';
  if (!email || !password) {
    setAuthMessage('이메일과 비밀번호를 입력해 주세요.', true);
    return;
  }
  setAuthButtonsDisabled(true);
  setAuthMessage('');
  var result = mode === 'signup'
    ? await window.supabaseClient.auth.signUp({ email: email, password: password })
    : await window.supabaseClient.auth.signInWithPassword({ email: email, password: password });
  setAuthButtonsDisabled(false);
  if (result.error) {
    setAuthMessage(result.error.message, true);
    return;
  }
  if (mode === 'signup' && (!result.data || !result.data.session)) {
    setAuthMessage('회원가입 완료. 이메일 인증 후 로그인해 주세요.');
    return;
  }
  await loadCoachProfile();
  closeAuthModal();
  if (typeof renderSection === 'function' && window.state) renderSection(window.state.isCoach ? 'coach_portal' : 'mypage');
}

async function handleGoogleLogin() {
  if (!window.supabaseClient) return;
  setAuthButtonsDisabled(true);
  var redirectUrl = window.location.origin + window.location.pathname;
  var out = await window.supabaseClient.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: redirectUrl, skipBrowserRedirect: true }
  });
  if (out.error) {
    setAuthButtonsDisabled(false);
    setAuthMessage(out.error.message, true);
    return;
  }
  if (!out.data || !out.data.url) {
    setAuthButtonsDisabled(false);
    setAuthMessage('Google 로그인 URL을 생성하지 못했습니다.', true);
    return;
  }
  window.location.assign(out.data.url);
}

async function handleLogout() {
  if (!window.supabaseClient) {
    if (window.state) {
      window.state.user = null;
      window.state.isCoach = false;
      window.state.coachProfile = null;
    }
    updateAuthButtons();
    if (typeof renderSection === 'function') renderSection('home');
    return;
  }
  await window.supabaseClient.auth.signOut();
  if (window.state) {
    window.state.user = null;
    window.state.isCoach = false;
    window.state.coachProfile = null;
  }
  updateAuthButtons();
  if (typeof renderSection === 'function') renderSection('home');
}

async function toggleLogin() {
  if (!isSupabaseConfigured()) {
    alert('Supabase 설정이 필요합니다. index.html의 __ER_SUPABASE_URL / __ER_SUPABASE_ANON_KEY를 먼저 설정해 주세요.');
    return;
  }
  closeDesktopAccountMenu();
  if (window.state && window.state.user) {
    if (typeof loadCoachProfile === 'function') {
      try {
        await loadCoachProfile();
      } catch (_) {}
    }
    if (typeof renderSection === 'function') renderSection(window.state.isCoach ? 'coach_portal' : 'mypage');
  } else {
    openAuthModal();
  }
}
if (typeof window !== 'undefined') { window.toggleLogin = toggleLogin; }

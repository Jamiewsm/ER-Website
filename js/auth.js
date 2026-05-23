// ER-Website: Auth (depends on config.js, supabase-client.js; uses global state, renderSection)
function isSupabaseConfigured() {
  return Boolean(window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.url && window.SUPABASE_CONFIG.anonKey);
}

var coachProfileLoadPromise = null;
var coachProfileLoadToken = 0;
var COACH_PROFILE_TIMEOUT_MS = 7000;

function withAuthTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise(function (_resolve, reject) {
      setTimeout(function () {
        reject(new Error('인증 응답이 지연되고 있습니다. 다시 시도해 주세요.'));
      }, timeoutMs || 12000);
    })
  ]);
}

function shouldOpenCoachAppOnMobile() {
  var ua = navigator.userAgent || '';
  return /Android|iPhone|iPad|iPod/i.test(ua) || window.matchMedia('(max-width: 1024px)').matches;
}

function shouldRefreshAccountSection() {
  if (!window.state) return false;
  var current = String(window.state.currentSection || '');
  return current === 'mypage' || current.indexOf('coach_') === 0;
}

function refreshCurrentAccountSection() {
  if (!shouldRefreshAccountSection()) return;
  if (typeof renderSection !== 'function' || !window.state) return;
  renderSection(window.state.currentSection, window.state.currentPayload, { syncHash: false });
}

function withTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise(function (_resolve, reject) {
      setTimeout(function () {
        reject(new Error('coach profile lookup timeout'));
      }, timeoutMs);
    })
  ]);
}

async function loadCoachProfile() {
  if (!window.state) return;
  var s = window.state;
  if (coachProfileLoadPromise) return coachProfileLoadPromise;
  var currentUserId = s.user && s.user.id ? s.user.id : null;
  var loadToken = ++coachProfileLoadToken;

  if (!window.supabaseClient || !currentUserId) {
    s.coachProfileLoading = false;
    s.isCoach = false;
    s.coachProfile = null;
    coachProfileLoadPromise = null;
    updateAuthButtons();
    refreshCurrentAccountSection();
    return;
  }

  // 같은 로그인 사용자 프로필을 다시 불러올 때는 잠깐 isCoach를 지우지 않는다.
  // (지우면 refreshCurrentAccountSection이 코치 화면을 접근 거부로 다시 그려 승인 직후 튕김처럼 보임)
  var keepCoachUi = s.coachProfile && s.coachProfile.user_id === currentUserId && s.isCoach;
  s.coachProfileLoading = true;
  if (!keepCoachUi) {
    s.isCoach = false;
    s.coachProfile = null;
  }
  updateAuthButtons();
  if (!keepCoachUi) {
    refreshCurrentAccountSection();
  }

  coachProfileLoadPromise = (async function () {
    try {
      var res = await withTimeout(
        window.supabaseClient
          .from('coach_profiles')
          .select('user_id, display_name, role, is_active')
          .eq('user_id', currentUserId)
          .maybeSingle(),
        COACH_PROFILE_TIMEOUT_MS
      );
      if (loadToken !== coachProfileLoadToken) return;
      if (!res.error && res.data && res.data.is_active) {
        s.isCoach = true;
        s.coachProfile = res.data;
      } else {
        s.isCoach = false;
        s.coachProfile = null;
      }
    } catch (_error) {
      if (loadToken !== coachProfileLoadToken) return;
      s.isCoach = false;
      s.coachProfile = null;
    } finally {
      if (loadToken === coachProfileLoadToken) {
        s.coachProfileLoading = false;
        updateAuthButtons();
        refreshCurrentAccountSection();
      }
      coachProfileLoadPromise = null;
    }
  })();
  return coachProfileLoadPromise;
}

function updateAuthButtons() {
  if (!window.state) return;
  var state = window.state;
  var desktopBtn = document.getElementById('desktop-auth-btn');
  var desktopMenu = document.getElementById('desktop-account-menu');
  var coachBtn = document.getElementById('desktop-account-coach-btn');
  var coachAppBtn = document.getElementById('desktop-account-app-btn');
  var mobileBtn = document.getElementById('mobile-auth-btn');
  var mobileHeaderBtn = document.getElementById('mobile-header-auth-btn');
  var mobileLabel = !state.user ? '기존 참여자 로그인' : (state.isCoach ? '코치 포털' : '마이페이지');
  if (mobileBtn) mobileBtn.innerHTML = '<i class="far fa-user mr-2"></i> ' + mobileLabel;
  if (mobileHeaderBtn) {
    mobileHeaderBtn.innerHTML = '<i class="' + (state.user ? 'fas fa-user-check' : 'far fa-user') + '"></i>';
    mobileHeaderBtn.classList.toggle('text-er-dark', Boolean(state.user));
    mobileHeaderBtn.classList.toggle('text-gray-400', !state.user);
  }
  if (desktopBtn) {
    desktopBtn.innerHTML = '<i class="' + (state.user ? 'fas fa-user-check' : 'far fa-user') + '"></i>';
    desktopBtn.classList.toggle('text-er-dark', Boolean(state.user));
    desktopBtn.setAttribute('aria-expanded', 'false');
  }
  if (desktopMenu) desktopMenu.classList.add('hidden');
  if (coachBtn) coachBtn.classList.toggle('hidden', !state.isCoach);
  if (coachAppBtn) coachAppBtn.classList.add('hidden');
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

async function switchWebsiteAccount() {
  closeDesktopAccountMenu();
  await handleLogout();
  openAuthModal();
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
  setAuthButtonsDisabled(false);
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
  if (window.state && window.state.user) {
    loadCoachProfile();
  } else {
    if (window.state) {
      window.state.isCoach = false;
      window.state.coachProfile = null;
      window.state.coachProfileLoading = false;
    }
  }
  updateAuthButtons();
  refreshCurrentAccountSection();
  window.supabaseClient.auth.onAuthStateChange(async function (_event, session) {
    if (window.state) window.state.user = session ? session.user : null;
    coachProfileLoadToken += 1;
    coachProfileLoadPromise = null;
    if (window.state && window.state.user) {
      loadCoachProfile();
    } else if (window.state) {
      window.state.isCoach = false;
      window.state.coachProfile = null;
      window.state.coachProfileLoading = false;
    }
    updateAuthButtons();
    refreshCurrentAccountSection();
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
  closeAuthModal();
  await loadCoachProfile();
  if (window.state && window.state.isCoach && shouldOpenCoachAppOnMobile() && typeof openCoachApp === 'function') {
    openCoachApp();
    return;
  }
  if (typeof renderSection === 'function' && window.state) renderSection('mypage');
}

async function handleGoogleLogin() {
  if (!window.supabaseClient) return;
  var googleBtn = document.getElementById('auth-google-btn');
  if (googleBtn && googleBtn.disabled) return;
  setAuthButtonsDisabled(true);
  try {
    var redirectUrl = window.location.origin + window.location.pathname;
    var out = await withAuthTimeout(window.supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectUrl, skipBrowserRedirect: true }
    }), 12000);
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
  } catch (error) {
    setAuthButtonsDisabled(false);
    setAuthMessage((error && error.message) || 'Google 로그인 중 오류가 발생했습니다.', true);
  }
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
    if (typeof loadCoachProfile === 'function') await loadCoachProfile();
    if (window.state && window.state.isCoach && shouldOpenCoachAppOnMobile() && typeof openCoachApp === 'function') {
      openCoachApp();
      return;
    }
    if (typeof renderSection === 'function') renderSection('mypage');
  } else {
    openAuthModal();
  }
}
if (typeof window !== 'undefined') { window.toggleLogin = toggleLogin; }
if (typeof window !== 'undefined') { window.switchWebsiteAccount = switchWebsiteAccount; }

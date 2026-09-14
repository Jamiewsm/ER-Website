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

function shouldRefreshAccountSection() {
  if (!window.state) return false;
  var current = String(window.state.currentSection || '');
  return current === 'coach_admin' || current === 'notices' || current === 'notice_detail';
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
  ['desktop-auth-btn', 'mobile-auth-btn', 'mobile-header-auth-btn'].forEach(function (id) {
    var link = document.getElementById(id);
    if (link) link.href = coachPortalHref('/education.html');
  });
}

async function switchWebsiteAccount() {
  await handleLogout();
  openSiteAdmin();
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
  if (typeof renderSection === 'function' && window.state) {
    var section = String(window.state.currentSection || '');
    renderSection(section === 'notices' || section === 'notice_detail' ? section : 'coach_admin', window.state.currentPayload);
  }
}

async function handleGoogleLogin() {
  if (!window.supabaseClient) return;
  var googleBtn = document.getElementById('auth-google-btn');
  if (googleBtn && googleBtn.disabled) return;
  setAuthButtonsDisabled(true);
  try {
    var returnSection = window.state && (window.state.currentSection === 'notices' || window.state.currentSection === 'notice_detail')
      ? 'notices' : 'coach_admin';
    var redirectUrl = window.location.origin + window.location.pathname + '?site_admin=' + returnSection;
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

function coachPortalHref(path) {
  var base = String(window.COACH_APP_URL || 'https://coach.er-coaching.com').replace(/\/$/, '');
  return base + (path || '');
}

function openPortalEntry(replace = false) {
  window.location[replace ? 'replace' : 'assign'](coachPortalHref('/education.html'));
}
if (typeof window !== 'undefined') { window.openPortalEntry = openPortalEntry; }

function openSiteAdmin() {
  if (typeof renderSection === 'function') renderSection('coach_admin');
}
if (typeof window !== 'undefined') { window.openSiteAdmin = openSiteAdmin; }

function toggleLogin() {
  openPortalEntry();
}
if (typeof window !== 'undefined') { window.toggleLogin = toggleLogin; }
if (typeof window !== 'undefined') { window.switchWebsiteAccount = switchWebsiteAccount; }

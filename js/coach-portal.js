// ER-Website: Coach portal UI helpers (composer visibility, account menu actions)
function getCoachComposerMeta(kind) {
  var map = {
    task: { openText: '보고서 등록', closeText: '등록 창 닫기' },
    material: { openText: '자료 업로드', closeText: '업로드 창 닫기' },
    note: { openText: '세션 노트 업로드', closeText: '업로드 창 닫기' }
  };
  return map[kind] || { openText: '업로드', closeText: '닫기' };
}

function setCoachComposerVisibility(kind, visible) {
  var composer = document.getElementById('coach-' + kind + '-composer');
  var button = document.getElementById('coach-' + kind + '-toggle-btn');
  if (!composer || !button) return;
  composer.classList.toggle('hidden', !visible);
  var meta = getCoachComposerMeta(kind);
  button.textContent = visible ? meta.closeText : meta.openText;
}

function toggleCoachComposer(kind, forceVisible) {
  var composer = document.getElementById('coach-' + kind + '-composer');
  if (!composer) return;
  var nextVisible = typeof forceVisible === 'boolean' ? forceVisible : composer.classList.contains('hidden');
  setCoachComposerVisibility(kind, nextVisible);
}

function openMyAccount() {
  if (typeof closeDesktopAccountMenu === 'function') closeDesktopAccountMenu();
  if (typeof renderSection === 'function') renderSection('mypage');
  if (window.state && window.state.user && typeof loadCoachProfile === 'function') {
    loadCoachProfile();
  }
}

async function openCoachPortalFromMenu() {
  if (typeof closeDesktopAccountMenu === 'function') closeDesktopAccountMenu();
  if (window.state && window.state.user && typeof loadCoachProfile === 'function') {
    await loadCoachProfile();
  }
  if (!window.state || !window.state.user) {
    if (typeof toggleLogin === 'function') toggleLogin();
    return;
  }
  if (!window.state.isCoach) {
    if (typeof renderSection === 'function') renderSection('mypage');
    return;
  }
  var isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '') || window.matchMedia('(max-width: 1024px)').matches;
  if (isMobile && typeof openCoachApp === 'function') {
    openCoachApp();
    return;
  }
  if (typeof renderSection === 'function') renderSection('coach_portal');
}

function openCoachAppFromMenu() {
  if (typeof closeDesktopAccountMenu === 'function') closeDesktopAccountMenu();
  if (typeof openCoachApp === 'function') openCoachApp();
}

if (typeof window !== 'undefined') {
  function setDesktopCoachEmbedTab(tab) {
    var frame = document.getElementById('coach-portal-embed-frame');
    if (!frame) return;
    var allowed = ['dashboard', 'training', 'mentoring', 'calendar', 'resources'];
    var nextTab = allowed.indexOf(String(tab || '').toLowerCase()) >= 0 ? String(tab).toLowerCase() : 'dashboard';
    var base = typeof window.COACH_APP_URL === 'string' && window.COACH_APP_URL
      ? window.COACH_APP_URL
      : 'https://coach.er-coaching.com';
    frame.src = base.replace(/\/$/, '') + '/#' + nextTab;

    document.querySelectorAll('[data-desktop-embed-tab]').forEach(function (button) {
      var active = button.getAttribute('data-desktop-embed-tab') === nextTab;
      button.classList.toggle('bg-er-dark', active);
      button.classList.toggle('text-white', active);
      button.classList.toggle('bg-white', !active);
      button.classList.toggle('border', !active);
      button.classList.toggle('border-gray-200', !active);
      button.classList.toggle('text-gray-700', !active);
    });
  }

  window.setDesktopCoachEmbedTab = setDesktopCoachEmbedTab;
  window.openMyAccount = openMyAccount;
  window.openCoachPortalFromMenu = openCoachPortalFromMenu;
  window.openCoachAppFromMenu = openCoachAppFromMenu;
}

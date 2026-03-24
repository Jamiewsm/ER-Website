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
}

async function openCoachPortalFromMenu() {
  if (typeof closeDesktopAccountMenu === 'function') closeDesktopAccountMenu();
  if (window.state && window.state.user && typeof loadCoachProfile === 'function') {
    try {
      await loadCoachProfile();
    } catch (_) {}
  }
  if (window.state && window.state.coachProfileLoading) return;
  if (!window.state || !window.state.user) {
    if (typeof toggleLogin === 'function') toggleLogin();
    return;
  }
  if (typeof renderSection === 'function') {
    renderSection(window.state.isCoach ? 'coach_portal' : 'mypage');
  }
}

function openCoachAppFromMenu() {
  if (typeof closeDesktopAccountMenu === 'function') closeDesktopAccountMenu();
  if (typeof openCoachApp === 'function') openCoachApp();
}

if (typeof window !== 'undefined') {
  window.openMyAccount = openMyAccount;
  window.openCoachPortalFromMenu = openCoachPortalFromMenu;
  window.openCoachAppFromMenu = openCoachAppFromMenu;
}

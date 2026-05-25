// Home season banner — Enneagram for Parenting (no fullscreen popup)
(function () {
  var BANNER_ID = 'parenting-season-banner';
  var STORAGE_KEY = 'er_parenting_season_banner_dismissed_date';
  var LEGACY_POPUP_KEY = 'er_parents_workshop_promo_dismissed_date';

  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function isBannerDismissedToday() {
    try {
      return localStorage.getItem(STORAGE_KEY) === todayKey();
    } catch (_e) {
      return false;
    }
  }

  /** X or navigate away from home: hide until next full render — no localStorage */
  function closeParentingSeasonBanner() {
    var el = document.getElementById(BANNER_ID);
    if (el) el.remove();
  }

  /** “오늘 하루 이 안내 숨기기” only */
  function dismissParentingSeasonBannerToday() {
    try {
      localStorage.setItem(STORAGE_KEY, todayKey());
      localStorage.removeItem(LEGACY_POPUP_KEY);
    } catch (_e) {}
    closeParentingSeasonBanner();
  }

  function renderParentingSeasonBanner() {
    if (isBannerDismissedToday()) return '';
    if (/[?&]no_promo=1/.test(window.location.search || '')) return '';

    return `
      <div id="${BANNER_ID}" class="psb-wrap" role="region" aria-labelledby="psb-title">
        <article class="psb-card">
          <button type="button" class="psb-close" onclick="closeParentingSeasonBanner()" aria-label="닫기 (새로고침 시 다시 표시)">
            <i class="fas fa-times text-sm" aria-hidden="true"></i>
          </button>
          <header class="psb-head">
            <span class="psb-badge">모집중</span>
            <span class="psb-eyebrow">4주 자녀양육 심화</span>
          </header>
          <h2 id="psb-title" class="psb-title">Enneagram for Parenting</h2>
          <p class="psb-sub">나를 알고, 아이를 이해하는</p>
          <p class="psb-lead">양육의 변화는 부모의 자기이해에서 시작됩니다.</p>
          <ul class="psb-meta" aria-label="워크샵 안내">
            <li>4주 · 주 1회</li>
            <li>6월–7월 · Zoom</li>
            <li>소규모 선착순</li>
            <li>참가비 $120</li>
          </ul>
          <p class="psb-note">에니어그램 입문이 아닌, 유형을 어느 정도 알고 계신 부모님을 위한 심화 과정입니다.</p>
          <div class="psb-actions">
            <button type="button" class="psb-btn psb-btn--primary" onclick="parentingBannerGoDetail()">워크샵 안내 보기</button>
            <button type="button" class="psb-btn psb-btn--secondary" onclick="parentingBannerGoApply()">바로 신청하기</button>
          </div>
          <button type="button" class="psb-dismiss" onclick="dismissParentingSeasonBannerToday()">오늘 하루 이 안내 숨기기</button>
        </article>
      </div>
    `;
  }

  function parentingBannerGoDetail() {
    window.location.href = '/parenting-workshop.html?apply_source=home_banner';
  }

  function parentingBannerGoApply() {
    if (typeof renderSection === 'function') {
      renderSection('apply', { track: 'paid', focus: 'parenting_workshop', apply_source: 'home_banner' });
    } else {
      window.location.href = '/#apply?track=paid&focus=parenting_workshop&apply_source=home_banner';
    }
  }

  function maybeShowParentsWorkshopPromo() {}

  function closeParentsWorkshopPromo() {
    closeParentingSeasonBanner();
  }

  window.renderParentingSeasonBanner = renderParentingSeasonBanner;
  window.closeParentingSeasonBanner = closeParentingSeasonBanner;
  window.dismissParentingSeasonBannerToday = dismissParentingSeasonBannerToday;
  window.parentingBannerGoDetail = parentingBannerGoDetail;
  window.parentingBannerGoApply = parentingBannerGoApply;
  window.maybeShowParentsWorkshopPromo = maybeShowParentsWorkshopPromo;
  window.closeParentsWorkshopPromo = closeParentsWorkshopPromo;
  window.dismissParentsWorkshopPromoToday = dismissParentingSeasonBannerToday;
})();

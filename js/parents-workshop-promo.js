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
    if (typeof window.renderUpcomingProgramsBanner === 'function') {
      return window.renderUpcomingProgramsBanner();
    }
    return '';
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

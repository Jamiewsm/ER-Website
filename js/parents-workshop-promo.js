// Parenting 4주 워크샵 시즌 배너 — 현재 공개 모집 없음 (no-op stub)
(function () {
  function renderParentingSeasonBanner() {
    return '';
  }

  function closeParentingSeasonBanner() {}
  function dismissParentingSeasonBannerToday() {}
  function parentingBannerGoDetail() {
    window.location.href = '/parenting-seminar.html?apply_source=home_banner';
  }
  function parentingBannerGoApply() {
    if (typeof renderSection === 'function') {
      renderSection('apply', { track: 'paid', focus: 'parenting_seminar', apply_source: 'home_banner' });
    } else {
      window.location.href = '/#apply?track=paid&focus=parenting_seminar&apply_source=home_banner';
    }
  }
  function maybeShowParentsWorkshopPromo() {}
  function closeParentsWorkshopPromo() {}

  window.renderParentingSeasonBanner = renderParentingSeasonBanner;
  window.closeParentingSeasonBanner = closeParentingSeasonBanner;
  window.dismissParentingSeasonBannerToday = dismissParentingSeasonBannerToday;
  window.parentingBannerGoDetail = parentingBannerGoDetail;
  window.parentingBannerGoApply = parentingBannerGoApply;
  window.maybeShowParentsWorkshopPromo = maybeShowParentsWorkshopPromo;
  window.closeParentsWorkshopPromo = closeParentsWorkshopPromo;
  window.dismissParentsWorkshopPromoToday = dismissParentingSeasonBannerToday;
})();

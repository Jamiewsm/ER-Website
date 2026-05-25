// Home season banner — Enneagram for Parenting (no fullscreen popup)
(function () {
  var BANNER_ID = 'parenting-season-banner';
  var STORAGE_KEY = 'er_parenting_season_banner_dismissed_date';

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

  function dismissParentingSeasonBannerToday() {
    try {
      localStorage.setItem(STORAGE_KEY, todayKey());
    } catch (_e) {}
    var el = document.getElementById(BANNER_ID);
    if (el) el.remove();
  }

  function renderParentingSeasonBanner() {
    if (isBannerDismissedToday()) return '';
    if (/[?&]no_promo=1/.test(window.location.search || '')) return '';

    return `
      <div id="${BANNER_ID}" class="mt-10 max-w-3xl mx-auto animate-fade-in-up" style="animation-delay:0.05s;">
        <article class="relative overflow-hidden rounded-[1.75rem] border border-white/70 bg-gradient-to-br from-[#fff9f1] via-white to-[#f3e8da] p-5 sm:p-6 shadow-soft">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="min-w-0 flex-1">
              <span class="inline-flex rounded-full bg-[#c47a5a] text-white text-[10px] font-bold px-3 py-1">모집중 · 4주 워크샵</span>
              <h2 class="mt-3 text-lg sm:text-xl font-extrabold text-er-dark leading-snug break-keep">
                Enneagram for Parenting
              </h2>
              <p class="mt-1 text-sm font-semibold text-er-primary break-keep">나를 알고, 아이를 이해하는 자녀양육 심화 과정</p>
              <p class="mt-2 text-sm text-gray-600 leading-relaxed break-keep">
                양육의 변화는 부모의 자기이해에서 시작됩니다. 6월–7월 온라인 Zoom · 소규모 선착순 · $120
              </p>
            </div>
            <button type="button" onclick="dismissParentingSeasonBannerToday()" class="shrink-0 w-8 h-8 rounded-full bg-white/90 text-gray-400 hover:text-er-dark border border-gray-100 flex items-center justify-center" aria-label="배너 닫기">
              <i class="fas fa-times text-sm"></i>
            </button>
          </div>
          <div class="mt-4 flex flex-col sm:flex-row gap-2.5">
            <button type="button" onclick="parentingBannerGoDetail()" class="flex-1 py-3 rounded-full bg-er-dark text-white text-sm font-bold shadow-soft hover:bg-gray-800 transition-all">
              워크샵 안내 보기
            </button>
            <button type="button" onclick="parentingBannerGoApply()" class="flex-1 py-3 rounded-full border border-er-accent/50 bg-white text-er-dark text-sm font-bold hover:bg-er-accentLight/40 transition-colors">
              바로 신청하기
            </button>
          </div>
          <button type="button" onclick="dismissParentingSeasonBannerToday()" class="mt-3 text-xs text-er-muted hover:text-er-dark underline underline-offset-2 break-keep">
            오늘 하루 이 안내 숨기기
          </button>
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

  /** @deprecated Fullscreen promo removed — kept for compatibility */
  function maybeShowParentsWorkshopPromo() {}

  function closeParentsWorkshopPromo() {
    dismissParentingSeasonBannerToday();
  }

  window.renderParentingSeasonBanner = renderParentingSeasonBanner;
  window.dismissParentingSeasonBannerToday = dismissParentingSeasonBannerToday;
  window.parentingBannerGoDetail = parentingBannerGoDetail;
  window.parentingBannerGoApply = parentingBannerGoApply;
  window.maybeShowParentsWorkshopPromo = maybeShowParentsWorkshopPromo;
  window.closeParentsWorkshopPromo = closeParentsWorkshopPromo;
  window.dismissParentsWorkshopPromoToday = dismissParentingSeasonBannerToday;
})();

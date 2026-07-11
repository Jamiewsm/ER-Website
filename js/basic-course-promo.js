// 홈 히어로 — 다가오는 프로그램 컴팩트 안내 (9월 Parenting · 10월 기본과정)
(function () {
  var STORAGE_KEY = 'er_upcoming_programs_banner_dismissed_date';

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

  function dismissUpcomingProgramsBannerToday() {
    try {
      localStorage.setItem(STORAGE_KEY, todayKey());
    } catch (_e) {}
    var el = document.getElementById('upcoming-programs-compact');
    if (el) el.remove();
    var desktop = document.getElementById('upcoming-programs-compact-desktop');
    if (desktop) desktop.remove();
  }

  function renderUpcomingProgramsBanner() {
    if (isBannerDismissedToday()) return '';
    if (/[?&]no_promo=1/.test(window.location.search || '')) return '';

    return `
      <div id="upcoming-programs-compact" class="mt-5 max-w-2xl rounded-2xl border border-[#d8cbb7] bg-er-surface/95 p-4 text-left shadow-[0_16px_32px_rgba(63,50,33,0.12)]">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <span class="inline-flex rounded-full bg-er-greenTint px-2.5 py-1 text-[10px] font-black text-er-green ring-1 ring-[#dce7cd]">모집 예정</span>
            <p class="mt-2 text-lg font-black leading-tight tracking-[-0.01em] text-er-ink break-keep sm:text-xl">9월 Parenting · 10월 에니어그램 8주 기본과정</p>
            <p class="mt-1 text-xs font-bold text-[#6f6b60] break-keep">일정 확정 후 공지 · 인스타 @er_official_Korea</p>
          </div>
          <button type="button" onclick="dismissUpcomingProgramsBannerToday()" class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#e0d5c8] bg-white text-[#6f6b60] hover:bg-[#f4efe6]" aria-label="오늘 하루 숨기기">
            <i class="fas fa-times text-xs" aria-hidden="true"></i>
          </button>
        </div>
        <div class="mt-3 flex flex-wrap gap-2">
          <button type="button" onclick="upcomingBannerGoParenting()" class="inline-flex h-10 items-center justify-center rounded-xl bg-er-green px-4 text-xs font-extrabold text-white shadow-[0_8px_16px_rgba(101,116,83,0.18)] hover:bg-er-greenDark active:scale-95">Parenting</button>
          <button type="button" onclick="upcomingBannerGoBasicCourse()" class="inline-flex h-10 items-center justify-center rounded-xl border border-[#c8d4b8] bg-white px-4 text-xs font-extrabold text-er-ink hover:bg-er-greenTint active:scale-95">기본과정</button>
        </div>
      </div>
    `;
  }

  function renderUpcomingProgramsDesktopCard() {
    if (isBannerDismissedToday()) return '';
    if (/[?&]no_promo=1/.test(window.location.search || '')) return '';

    return `
      <div id="upcoming-programs-compact-desktop" class="absolute right-5 top-6 hidden max-w-[240px] rounded-2xl bg-white/88 p-5 text-center shadow-2xl shadow-black/10 ring-1 ring-white/70 backdrop-blur-md sm:block lg:right-8 lg:top-28">
        <p class="text-[11px] font-bold text-[#6c6b60]">모집 예정</p>
        <p class="mt-3 text-lg font-black text-er-ink break-keep">9월 Parenting</p>
        <p class="mt-1 text-sm font-bold text-[#68785a] break-keep">10월 8주 기본과정</p>
        <button type="button" onclick="upcomingBannerGoParenting()" class="mt-4 w-full rounded-lg bg-er-green px-4 py-2.5 text-xs font-extrabold text-white hover:bg-er-greenDark">안내 보기</button>
      </div>
    `;
  }

  function upcomingBannerGoParenting() {
    window.location.href = '/parenting-workshop.html?apply_source=home_hero_offer';
  }

  function upcomingBannerGoBasicCourse() {
    window.location.href = '/basic-course.html?apply_source=home_hero_offer';
  }

  function upcomingBannerGoBasicInterest() {
    window.location.href = 'mailto:json@er-coaching.com?subject=' + encodeURIComponent('10월 에니어그램 8주 기본과정 알림 신청');
  }

  function renderBasicCourseSeasonBanner() {
    return renderUpcomingProgramsBanner();
  }

  window.renderUpcomingProgramsBanner = renderUpcomingProgramsBanner;
  window.renderUpcomingProgramsDesktopCard = renderUpcomingProgramsDesktopCard;
  window.dismissUpcomingProgramsBannerToday = dismissUpcomingProgramsBannerToday;
  window.upcomingBannerGoParenting = upcomingBannerGoParenting;
  window.upcomingBannerGoBasicCourse = upcomingBannerGoBasicCourse;
  window.upcomingBannerGoBasicInterest = upcomingBannerGoBasicInterest;
  window.renderBasicCourseSeasonBanner = renderBasicCourseSeasonBanner;
})();

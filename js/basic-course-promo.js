// 홈 히어로 — 다가오는 ER 프로그램(9월 Parenting · 10월 기본과정) 배너
(function () {
  var BANNER_ID = 'upcoming-programs-banner';
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

  function closeUpcomingProgramsBanner() {
    var el = document.getElementById(BANNER_ID);
    if (el) el.remove();
  }

  function dismissUpcomingProgramsBannerToday() {
    try {
      localStorage.setItem(STORAGE_KEY, todayKey());
    } catch (_e) {}
    closeUpcomingProgramsBanner();
  }

  function renderUpcomingProgramsBanner() {
    if (isBannerDismissedToday()) return '';
    if (/[?&]no_promo=1/.test(window.location.search || '')) return '';

    return `
      <div id="${BANNER_ID}" class="psb-wrap" role="region" aria-labelledby="upb-title">
        <article class="psb-card">
          <button type="button" class="psb-close" onclick="closeUpcomingProgramsBanner()" aria-label="닫기 (새로고침 시 다시 표시)">
            <i class="fas fa-times text-sm" aria-hidden="true"></i>
          </button>
          <header class="psb-head">
            <span class="psb-badge">모집 예정</span>
            <span class="psb-eyebrow">2026년 하반기</span>
          </header>
          <h2 id="upb-title" class="psb-title">다가오는 ER 프로그램</h2>
          <p class="psb-sub">9월 Parenting 세미나 · 10월 에니어그램 기본과정</p>
          <p class="psb-lead">지금 진행 중인 7월 기본과정과 별도로, 가을 프로그램 모집을 준비하고 있습니다.</p>
          <ul class="psb-meta" aria-label="9월 Parenting 세미나">
            <li>9월 · Parenting 세미나</li>
            <li>부모의 자기이해와 아이 이해</li>
            <li>온라인 · 소규모</li>
          </ul>
          <ul class="psb-meta psb-meta--second" aria-label="10월 에니어그램 기본과정">
            <li>10월 · 기본과정 8주</li>
            <li>관계 속에서 드러나는 나</li>
            <li>주 1회 · Zoom</li>
          </ul>
          <p class="psb-note">일정·모집 안내는 공지사항과 인스타그램(@er_official_Korea)에서 먼저 알려 드립니다.</p>
          <div class="psb-actions">
            <button type="button" class="psb-btn psb-btn--primary" onclick="upcomingBannerGoParenting()">Parenting 안내</button>
            <button type="button" class="psb-btn psb-btn--secondary" onclick="upcomingBannerGoBasicInterest()">기본과정 알림 신청</button>
          </div>
          <button type="button" class="psb-dismiss" onclick="dismissUpcomingProgramsBannerToday()">오늘 하루 이 안내 숨기기</button>
        </article>
      </div>
    `;
  }

  function upcomingBannerGoParenting() {
    window.location.href = '/parenting-workshop.html?apply_source=home_banner';
  }

  function upcomingBannerGoBasicInterest() {
    window.location.href = 'mailto:json@er-coaching.com?subject=' + encodeURIComponent('10월 에니어그램 기본과정 알림 신청') + '&body=' + encodeURIComponent('10월 기본과정 모집 안내를 받고 싶습니다.\n\n이름:\n연락처:\n');
  }

  function renderBasicCourseSeasonBanner() {
    return renderUpcomingProgramsBanner();
  }

  function closeBasicCourseSeasonBanner() {
    closeUpcomingProgramsBanner();
  }

  function dismissBasicCourseSeasonBannerToday() {
    dismissUpcomingProgramsBannerToday();
  }

  window.renderUpcomingProgramsBanner = renderUpcomingProgramsBanner;
  window.closeUpcomingProgramsBanner = closeUpcomingProgramsBanner;
  window.dismissUpcomingProgramsBannerToday = dismissUpcomingProgramsBannerToday;
  window.upcomingBannerGoParenting = upcomingBannerGoParenting;
  window.upcomingBannerGoBasicInterest = upcomingBannerGoBasicInterest;
  window.renderBasicCourseSeasonBanner = renderBasicCourseSeasonBanner;
  window.closeBasicCourseSeasonBanner = closeBasicCourseSeasonBanner;
  window.dismissBasicCourseSeasonBannerToday = dismissBasicCourseSeasonBannerToday;
})();

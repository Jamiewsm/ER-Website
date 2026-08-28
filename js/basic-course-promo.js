// 홈 히어로 — 10월 에니어그램 기본과정 8주 모집 배너
(function () {
  var BANNER_ID = 'basic-course-season-banner';
  var STORAGE_KEY = 'er_basic_course_banner_dismissed_date';

  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function isRecruitmentOpen() {
    if (window.ERProgramCatalog && typeof window.ERProgramCatalog.isBasicCourseRecruitmentOpen === 'function') {
      return window.ERProgramCatalog.isBasicCourseRecruitmentOpen();
    }
    if (window.ERProgramCatalog && typeof window.ERProgramCatalog.isJulyBasicRecruitmentOpen === 'function') {
      return window.ERProgramCatalog.isJulyBasicRecruitmentOpen();
    }
    return Date.now() <= Date.parse('2026-09-28T23:59:59-07:00');
  }

  function isBannerDismissedToday() {
    try {
      return localStorage.getItem(STORAGE_KEY) === todayKey();
    } catch (_e) {
      return false;
    }
  }

  function closeBasicCourseSeasonBanner() {
    var el = document.getElementById(BANNER_ID);
    if (el) el.remove();
  }

  function dismissBasicCourseSeasonBannerToday() {
    try {
      localStorage.setItem(STORAGE_KEY, todayKey());
    } catch (_e) {}
    closeBasicCourseSeasonBanner();
  }

  function renderBasicCourseSeasonBanner() {
    if (!isRecruitmentOpen()) return '';
    if (isBannerDismissedToday()) return '';
    if (/[?&]no_promo=1/.test(window.location.search || '')) return '';

    return `
      <div id="${BANNER_ID}" class="psb-wrap" role="region" aria-labelledby="bcb-title">
        <article class="psb-card">
          <button type="button" class="psb-close" onclick="closeBasicCourseSeasonBanner()" aria-label="닫기 (새로고침 시 다시 표시)">
            <i class="fas fa-times text-sm" aria-hidden="true"></i>
          </button>
          <header class="psb-head">
            <span class="psb-badge">모집중</span>
            <span class="psb-eyebrow">2026년 10월 첫주 개강</span>
          </header>
          <h2 id="bcb-title" class="psb-title">에니어그램 기본과정 8주</h2>
          <p class="psb-sub">관계 속에서 드러나는 나를 이해하는 시간</p>
          <p class="psb-lead">하나님 안에서 본래의 나로 회복되는 8주 여정입니다.</p>
          <ul class="psb-meta" aria-label="기본과정 안내">
            <li>8주 · 주 1회</li>
            <li>온라인 Zoom</li>
            <li>정원 8명</li>
            <li>한국 ₩450,000부터 · 해외 $330</li>
          </ul>
          <p class="psb-note">한국 계좌이체 ₩450,000, 카드·카카오페이·네이버페이 ₩470,000, 해외 $330. 신청 후 지역별 결제 안내 메일을 보내드립니다.</p>
          <div class="psb-actions">
            <button type="button" class="psb-btn psb-btn--primary" onclick="basicCourseBannerGoDetail()">과정 안내 보기</button>
            <button type="button" class="psb-btn psb-btn--secondary" onclick="basicCourseBannerGoApply()">바로 신청하기</button>
          </div>
          <button type="button" class="psb-dismiss" onclick="dismissBasicCourseSeasonBannerToday()">오늘 하루 이 안내 숨기기</button>
        </article>
      </div>
    `;
  }

  function basicCourseBannerGoDetail() {
    window.location.href = '/basic-course.html?apply_source=home_banner';
  }

  function basicCourseBannerGoApply() {
    if (typeof renderSection === 'function') {
      renderSection('apply', { track: 'paid', focus: 'enneagram_basic_october', apply_source: 'home_banner' });
    } else {
      window.location.href = '/#apply?track=paid&focus=enneagram_basic_october&apply_source=home_banner';
    }
  }

  window.renderBasicCourseSeasonBanner = renderBasicCourseSeasonBanner;
  window.closeBasicCourseSeasonBanner = closeBasicCourseSeasonBanner;
  window.dismissBasicCourseSeasonBannerToday = dismissBasicCourseSeasonBannerToday;
  window.basicCourseBannerGoDetail = basicCourseBannerGoDetail;
  window.basicCourseBannerGoApply = basicCourseBannerGoApply;
})();

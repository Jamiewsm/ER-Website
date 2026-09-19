// ER-Website: Supabase and app config (loaded before supabase-client.js)
window.__ER_SUPABASE_URL = "https://osdynbadhtfgoxilgmpy.supabase.co";
window.__ER_SUPABASE_ANON_KEY = "sb_publishable_6nGgC4tWri28HiI-w2H1Pg_E9_KIcHe";

window.SUPABASE_CONFIG = {
  url: window.__ER_SUPABASE_URL || "",
  anonKey: window.__ER_SUPABASE_ANON_KEY || ""
};
window.COACH_APP_URL = "https://coach.er-coaching.com";
window.ER_SOCIAL = {
  // 메인 푸터·문의에는 두 계정 모두 노출. 맥락별 기본값은 아래 필드 사용.
  // @er_parenting — 양육 (구독자 더 많음, 활성)
  // @er_official_Korea — 코칭·사역 공식 (신규, 방향성 정리 중)
  instagram: "https://www.instagram.com/er_official_Korea/",
  instagramHandle: "er_official_Korea",
  instagramParenting: "https://www.instagram.com/er_parenting/",
  instagramParentingHandle: "er_parenting",
  accounts: [
    {
      id: "parenting",
      handle: "er_parenting",
      url: "https://www.instagram.com/er_parenting/",
      label: "양육"
    },
    {
      id: "official",
      handle: "er_official_Korea",
      url: "https://www.instagram.com/er_official_Korea/",
      label: "공식"
    }
  ]
};
/** 코치앱과 동일: 멘토링 주간 week_key는 양성반 1~8주차 (CoachPortal EXPERT_COHORT_MENTORING) */
window.ER_EXPERT_COHORT_MENTORING = {
  week1Monday: "2026-02-23",
  lastWeek: 8,
  keyYear: 2026,
};
window.TURNSTILE_SITE_KEY = "0x4AAAAAACmAr1w7-5BNiCHZ";

// Scholarship transfer instructions. Enable only after the receiving arrangement is confirmed.
// Public recipient details only: never put credentials or donor data in this config.
window.ER_SCHOLARSHIP_SUPPORT = {
  inquiriesEnabled: false, // Enable after the scholarship receipt email is deployed and verified.
  acceptingContributions: false,
  recipientName: '',
  receiptNotice: '',
  bank: { confirmed: false, name: '', number: '', holder: '' },
  zelle: { confirmed: false, address: '', holder: '' }
};

// ER-Website: Supabase and app config (loaded before supabase-client.js)
window.__ER_SUPABASE_URL = "https://osdynbadhtfgoxilgmpy.supabase.co";
window.__ER_SUPABASE_ANON_KEY = "sb_publishable_6nGgC4tWri28HiI-w2H1Pg_E9_KIcHe";

window.SUPABASE_CONFIG = {
  url: window.__ER_SUPABASE_URL || "",
  anonKey: window.__ER_SUPABASE_ANON_KEY || ""
};
window.COACH_APP_URL = "https://coach.er-coaching.com";
/** 코치앱과 동일: 멘토링 주간 week_key는 양성반 1~8주차 (CoachPortal EXPERT_COHORT_MENTORING) */
window.ER_EXPERT_COHORT_MENTORING = {
  week1Monday: "2026-02-23",
  lastWeek: 8,
  keyYear: 2026,
};
window.TURNSTILE_SITE_KEY = "0x4AAAAAACmAr1w7-5BNiCHZ";

// ER App: State, constants, content data
// --- State Management ---
const SUPABASE_CONFIG = window.SUPABASE_CONFIG || {};
const COACH_APP_URL = window.COACH_APP_URL || "";
const TURNSTILE_SITE_KEY = window.TURNSTILE_SITE_KEY || "";
const state = {
    currentSection: 'home',
    currentPayload: null,
    user: null, 
    isCoach: false,
    coachProfile: null,
    coachProfileLoading: false,
    notices: [],
    noticesLoaded: false,
    noticeEditor: {
        open: false,
        mode: 'create',
        noticeId: null,
        tag: '안내',
        title: '',
        summary: '',
        body: '',
        published_at: '',
        program_period: '',
        program_target: '',
        apply_deadline: ''
    },
    coachAdminUsers: [],
    coachCalendarMonth: null,
    coachSchedules: [],
    coachCalendarSchedules: [],
    coachSelectedDate: null,
    coachListCounts: {
        tasks: 0,
        materials: 0,
        notes: 0
    },
    programFilter: 'individual',
    latestTestResult: null,
    /** Detached iframe node when leaving 진단 테스트 (same SPA session reuse). */
    testIframeEl: null,
    testIframeLang: null
};
window.state = state;

const ADAPTIVE_TEST_EMBED_VERSION = '20260521-result-hero-scroll-v1';

const ER = typeof window !== 'undefined' && window.ER_STRINGS ? window.ER_STRINGS : {};
const contentData = {
    stats: {
        labels: (ER.contentData && ER.contentData.stats && ER.contentData.stats.labels) ? ER.contentData.stats.labels.slice() : ['개인/가정', '목회자', '기업/조직', '강사양성', '청소년'],
        data: [45, 25, 15, 10, 5],
    },
    types: {
        labels: (ER.contentData && ER.contentData.types && ER.contentData.types.labels) ? ER.contentData.types.labels.slice() : ['1번 올바른 사람', '2번 아낌없이 주는 사람', '3번 열매맺는 사람', '4번 독창적인 사람', '5번 지혜로운 사람', '6번 충실한 사람', '7번 열정적인 사람', '8번 보호하는 사람', '9번 조화로운 사람'],
        data: [8, 9, 8, 7, 6, 8, 7, 8, 9] 
    },
    notices: (ER.contentData && ER.contentData.notices) ? ER.contentData.notices : []
};
const NOTICE_ADMIN_EMAIL = 'campus.12000@gmail.com';
state.notices = (contentData.notices || []).map((item) => ({
    id: item.id,
    tag: item.tag || '안내',
    title: item.title || '',
    summary: item.summary || '',
    body: item.body || '',
    body_is_html: true,
    published_at: item.date || '',
    program_period: '',
    program_target: '',
    apply_deadline: ''
}));



const publicTestimonials = (ER.publicTestimonials) ? ER.publicTestimonials : { impactThemes: [], stories: [] };

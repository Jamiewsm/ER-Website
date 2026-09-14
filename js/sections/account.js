// 사이트 관리 화면의 인증 및 권한 안내를 렌더링합니다.
function renderCoachAccessDenied(message = '코치 계정만 접근할 수 있습니다.') {
    const authenticated = Boolean(state.user);
    return `
        <div class="max-w-xl mx-auto px-4 py-20">
            <div class="bg-white p-10 rounded-[2rem] shadow-soft border border-gray-100 text-center">
                <div class="w-16 h-16 bg-red-50 rounded-full mx-auto flex items-center justify-center text-red-400 mb-4">
                    <i class="fas fa-lock"></i>
                </div>
                <h3 class="text-lg font-bold text-er-dark mb-2">${authenticated ? '접근 권한이 없습니다' : '사이트 관리'}</h3>
                <p class="text-sm text-gray-500 mb-6 break-keep">${message}</p>
                <button onclick="${authenticated ? 'switchWebsiteAccount()' : 'openAuthModal()'}" class="min-h-11 px-6 py-2 bg-er-dark text-white rounded-full text-sm font-bold">${authenticated ? '계정 전환' : '관리자 로그인'}</button>
                <a href="${coachPortalHref('/education.html')}" class="inline-flex min-h-11 items-center px-6 py-2 text-sm font-bold text-er-dark">포털로 이동</a>
            </div>
        </div>
    `;
}

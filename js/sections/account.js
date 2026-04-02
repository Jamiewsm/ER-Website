// ER Section: My Page + Coach Access Denied
function renderMyPage() {
    if (!state.user) {
        return `
            <div class="max-w-md mx-auto px-4 py-20">
                <div class="bg-white p-10 rounded-[2rem] shadow-soft text-center border border-gray-100">
                    <div class="w-20 h-20 bg-gray-50 rounded-full mx-auto flex items-center justify-center text-2xl text-gray-300 mb-4">
                        <i class="fas fa-user"></i>
                    </div>
                    <p class="text-gray-500 mb-6 text-sm">로그인 후 마이페이지를 확인할 수 있습니다.</p>
                    <button onclick="toggleLogin()" class="px-6 py-2 bg-er-dark text-white rounded-full text-xs font-bold">로그인하기</button>
                </div>
            </div>
        `;
    }

    const userEmail = state.user.email || '-';
    const coachBadge = state.coachProfileLoading
        ? `<span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100"><i class="fas fa-spinner fa-spin"></i> 권한 확인 중</span>`
        : state.isCoach
        ? `<span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-100"><i class="fas fa-check-circle"></i> 코치 계정</span>`
        : `<span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-gray-50 text-gray-600 border border-gray-100">일반 계정</span>`;
    return `
        <div class="max-w-md mx-auto px-4 py-20">
            <div class="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <h2 class="text-xl font-bold text-gray-900">My Page</h2>
                <button onclick="handleLogout()" class="text-xs text-gray-400 hover:text-red-500 transition-colors">로그아웃</button>
            </div>
            <div class="bg-white p-10 rounded-[2rem] shadow-soft text-center border border-gray-100">
                <div class="w-20 h-20 bg-gray-50 rounded-full mx-auto flex items-center justify-center text-2xl text-gray-300 mb-4">
                    <i class="fas fa-user"></i>
                </div>
                <p class="text-gray-800 mb-1 text-sm font-semibold">${userEmail}</p>
                <p class="text-gray-500 mb-3 text-sm">인증된 계정으로 로그인되어 있습니다.</p>
                <div class="mb-6">${coachBadge}</div>
                <div class="flex flex-col gap-2">
                    ${state.isCoach ? `<button onclick="openCoachPortalFromMenu()" class="px-6 py-2 bg-er-dark text-white rounded-full text-xs font-bold">코치 포털 열기</button>` : ''}
                    <button onclick="switchWebsiteAccount()" class="px-6 py-2 bg-white text-er-dark rounded-full text-xs font-bold border border-er-accent/30">계정 전환</button>
                    <button onclick="renderSection('home')" class="px-6 py-2 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">홈으로</button>
                </div>
            </div>
        </div>
    `;
}

function renderCoachAccessDenied(message = '코치 계정만 접근할 수 있습니다.') {
    return `
        <div class="max-w-xl mx-auto px-4 py-20">
            <div class="bg-white p-10 rounded-[2rem] shadow-soft border border-gray-100 text-center">
                <div class="w-16 h-16 bg-red-50 rounded-full mx-auto flex items-center justify-center text-red-400 mb-4">
                    <i class="fas fa-lock"></i>
                </div>
                <h3 class="text-lg font-bold text-er-dark mb-2">접근 권한이 없습니다</h3>
                <p class="text-sm text-gray-500 mb-6 break-keep">${message}</p>
                <button onclick="renderSection('mypage')" class="px-6 py-2 bg-er-dark text-white rounded-full text-xs font-bold">마이페이지로</button>
            </div>
        </div>
    `;
}

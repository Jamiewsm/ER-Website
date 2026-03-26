// ER Section: Types Guide
function renderTypesGuide() {
    const types = [
        { id: 1, name: "1번 올바른 사람 (The Reformer)", color: "border-red-200", bg: "bg-red-50", desc: "올바름을 추구하며 실수를 두려워합니다.", healing: "불완전함을 수용하는 연습, 괜찮아!" },
        { id: 2, name: "2번 아낌없이 주는 사람 (The Helper)", color: "border-orange-200", bg: "bg-orange-50", desc: "사랑받기 위해 타인을 돕습니다.", healing: "내면의 욕구를 돌보는 연습" },
        { id: 3, name: "3번 열매맺는 사람 (The Achiever)", color: "border-yellow-200", bg: "bg-yellow-50", desc: "성공을 통해 가치를 증명하려 합니다.", healing: "사람들의 인정보다, 내가 좋아하는 것을 찾기" },
        { id: 4, name: "4번 독창적인 사람 (The Individualist)", color: "border-purple-200", bg: "bg-purple-50", desc: "독특함과 깊이를 추구합니다.", healing: "감정의 균형과 일상성 회복" },
        { id: 5, name: "5번 지혜로운 사람 (The Investigator)", color: "border-blue-200", bg: "bg-blue-50", desc: "지식을 통해 유능함을 추구합니다.", healing: "신체 감각 깨우기와 연결" },
        { id: 6, name: "6번 충실한 사람 (The Loyalist)", color: "border-indigo-200", bg: "bg-indigo-50", desc: "안전을 위해 대비하고 의심합니다.", healing: "내면의 신뢰와 용기 회복" },
        { id: 7, name: "7번 열정적인 사람 (The Enthusiast)", color: "border-green-200", bg: "bg-green-50", desc: "새로운 경험과 즐거움을 쫓습니다.", healing: "현재의 고요함에 머무르기" },
        { id: 8, name: "8번 보호하는 사람 (The Challenger)", color: "border-pink-200", bg: "bg-pink-50", desc: "강함을 통해 통제하려 합니다.", healing: "연약함을 드러내는 용기" },
        { id: 9, name: "9번 조화로운 사람 (The Peacemaker)", color: "border-gray-200", bg: "bg-gray-50", desc: "평화를 위해 갈등을 회피합니다.", healing: "자기 목소리 내는 연습" }
    ];

    return `
        <div class="min-h-screen bg-gray-50 py-16 px-4">
            <div class="max-w-6xl mx-auto">
                <div class="mb-8 flex items-center justify-between animate-fade-in-up">
                    <button onclick="renderSection('test')" class="px-3 py-1.5 bg-white rounded-full text-xs font-medium text-gray-600 shadow-sm flex items-center gap-1 transition-all">
                        <i class="fas fa-arrow-left"></i> 진단 테스트로
                    </button>
                    <h2 class="text-lg font-bold text-gray-900">9가지 유형별 회복의 길</h2>
                    <div class="w-12"></div>
                </div>

                <div class="mb-6 rounded-2xl bg-white border border-gray-100 p-4 text-sm text-gray-600 break-keep animate-fade-in-up">
                    각 유형은 단순한 성격 분류가 아니라 회복의 방향을 안내하는 지도입니다. 유형별 설명과 회복 경로를 참고해 현재의 패턴을 점검해 보세요.
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-in-up" style="animation-delay: 0.1s;">
                    ${types.map((t, idx) => `
                        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">
                            <div class="h-1.5 w-full ${t.bg.replace('bg-', 'bg-').replace('50', '400')}"></div>
                            <div class="p-5">
                                <div class="flex items-center justify-between mb-3">
                                    <h3 class="text-base font-bold text-gray-800 relative z-10">${t.name.split('(')[0]}</h3>
                                    <span class="text-3xl font-serif font-bold text-gray-100 group-hover:text-er-accent/20 transition-colors">${t.id}</span>
                                </div>
                                <p class="text-[10px] text-gray-400 font-serif italic mb-3 -mt-4">${t.name.split('(')[1].replace(')','')}</p>
                                <p class="text-gray-600 text-xs leading-relaxed mb-5 min-h-[2.5em] break-keep">${t.desc}</p>
                                
                                <div class="bg-gray-50 rounded-xl p-3 border border-gray-100 group-hover:bg-er-base transition-colors">
                                    <div class="flex items-start gap-2">
                                        <i class="fas fa-seedling text-er-accent mt-0.5 text-xs"></i>
                                        <div>
                                            <p class="text-[9px] text-gray-400 font-bold tracking-wider">회복의 길</p>
                                            <p class="text-xs text-gray-800 font-medium mt-0.5 break-keep">${t.healing}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="mt-12 text-center pb-10">
                    <button onclick="renderSection('apply', { track: 'paid' })" class="bg-er-dark text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-gray-800 transition-colors text-sm">
                        전문가 상담 신청하기
                    </button>
                </div>
            </div>
        </div>
    `;
}


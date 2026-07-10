// ER Section: Types Guide
function renderTypesGuide() {
    const typeDetails = {
        1: {
            title: "에니어그램 1번: 올바른 사람 (The Right Person)",
            oneLine: "나는 틀리고 싶지 않다. 그래서 나는 올바르게 살아야 한다.",
            coreSummary: "세상을 바르게 만들고 싶은 사람",
            basicTraits: [
                "옳고 그름에 민감함",
                "기준이 높고 책임감이 강함",
                "실수에 예민하고 스스로를 엄격하게 봄",
                "분노가 있지만 잘 드러내지 않음"
            ],
            subtypes: [
                {
                    name: "자기보존 1번 (SP1)",
                    subtitle: "걱정형",
                    catch: "혹시 잘못되면 어떡하지...",
                    traits: [
                        "늘 대비하고 준비함",
                        "불안과 걱정이 많음",
                        "자기비판이 매우 강함",
                        "겉으로는 온화하고 착해 보임"
                    ],
                    core: "완벽해야 안전하다",
                    relationStress: [
                        "혼자 책임을 많이 짐",
                        "속으로 억울함이 쌓임",
                        "작은 실수에도 자신을 심하게 비난"
                    ],
                    jobs: ["회계, 재무, 감사", "품질관리(QA), 데이터 검증", "행정, 공공기관", "연구 / 분석 직무"],
                    jobReason: "리스크를 줄이고 안정성을 만드는 능력",
                    growth: ["이 정도면 충분하다를 배우기", "불안이 아닌 신뢰로 살아가기"]
                },
                {
                    name: "성적(일대일) 1번 (SX1)",
                    subtitle: "열정형 / 개혁가",
                    catch: "이건 반드시 바로잡아야 해!",
                    traits: [
                        "분노를 밖으로 표현",
                        "강한 신념과 추진력",
                        "사람과 세상을 바꾸려는 열정",
                        "직설적이고 강한 에너지"
                    ],
                    core: "나는 옳고, 이건 바뀌어야 한다",
                    relationStress: [
                        "상대를 바꾸려는 압박",
                        "비판이 직접적으로 나감",
                        "갈등을 피하지 않음"
                    ],
                    jobs: ["변호사, 인권/정의 관련 직업", "컨설턴트, 조직개선", "창업 / 혁신 프로젝트", "리더십, 운동/캠페인"],
                    jobReason: "틀린 것을 그냥 두지 못하는 에너지",
                    growth: ["내가 항상 옳은 것은 아니다 인정", "사람을 바꾸기보다 이해하기"]
                },
                {
                    name: "사회적 1번 (SO1)",
                    subtitle: "원칙형 / 시스템형",
                    catch: "이 공동체는 올바르게 돌아가야 한다",
                    traits: [
                        "규칙, 질서, 시스템 중시",
                        "감정보다 원칙 중심",
                        "책임감 매우 강함",
                        "모범적인 역할을 하려 함"
                    ],
                    core: "나는 기준이 되어야 한다",
                    relationStress: [
                        "융통성이 부족해 보일 수 있음",
                        "사람보다 규칙을 우선시",
                        "꼰대처럼 보일 위험"
                    ],
                    jobs: ["공공 리더십, 행정", "조직 운영 / 정책 설계", "교육, 교수, 훈련", "기업 시스템/운영 관리"],
                    jobReason: "질서와 기준을 세우는 능력",
                    growth: ["규칙보다 사람을 보는 연습", "유연함과 따뜻함 회복"]
                }
            ],
            quickSummary: [
                { subtype: "자기보존", core: "걱정, 안정", career: "정확성/관리" },
                { subtype: "성적(일대일)", core: "열정, 개혁", career: "변화/리더십" },
                { subtype: "사회적", core: "원칙, 질서", career: "시스템/조직" }
            ],
            gospelRecovery: {
                originalDesign: "올바르고 선한 존재",
                falseSelf: "완벽해야 가치 있다",
                restoration: [
                    "나는 이미 하나님 안에서 옳다",
                    "완벽을 증명하는 삶이 아니라 자유롭게 살아가는 삶으로 이동"
                ]
            },
            closing: "1번은 완벽해지려는 사람이 아니라, 이미 충분한데 그걸 믿지 못했던 사람입니다."
        }
    };

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

    function openTypeDetail(typeId) {
        const detail = typeDetails[typeId];

        if (!detail) {
            window.alert('해당 유형의 상세 설명은 준비 중입니다.');
            return;
        }

        const existing = document.getElementById('type-detail-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'type-detail-modal';
        modal.className = 'fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/40 backdrop-blur-sm';
        modal.innerHTML = `
            <div class="bg-er-surface rounded-[2rem] w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl animate-fade-in-up border border-er-sand/60">
                <div class="sticky top-0 bg-er-surface rounded-t-[2rem] px-6 pt-6 pb-4 border-b border-er-sand/50 flex items-center justify-between">
                    <div>
                        <span class="text-er-green font-bold text-[10px] tracking-widest uppercase">Type Detail</span>
                        <h3 class="text-lg font-bold text-er-inkSoft mt-0.5">${detail.title}</h3>
                    </div>
                    <button onclick="document.getElementById('type-detail-modal').remove()" class="w-9 h-9 rounded-full bg-er-base flex items-center justify-center text-er-muted hover:bg-er-green hover:text-white transition-colors">
                        <i class="fas fa-times text-sm"></i>
                    </button>
                </div>
                <div class="p-6 grid gap-4">
                    <div class="rounded-2xl border border-er-sand/50 bg-er-base/60 p-4">
                        <p class="text-[11px] font-bold text-er-muted tracking-[0.15em] uppercase mb-2">한 문장 핵심</p>
                        <p class="text-sm text-er-body break-keep leading-relaxed">${detail.oneLine}</p>
                    </div>
                    <div class="rounded-2xl border border-er-sand/50 bg-er-surface p-4">
                        <p class="text-[11px] font-bold text-er-muted tracking-[0.15em] uppercase mb-2">기본 특징</p>
                        <ul class="space-y-2">
                            ${detail.basicTraits.map(item => `<li class="text-sm text-er-body break-keep leading-relaxed">• ${item}</li>`).join('')}
                        </ul>
                        <p class="mt-3 text-sm text-er-inkSoft font-semibold break-keep">핵심: ${detail.coreSummary}</p>
                    </div>
                    <div class="rounded-2xl border border-er-sand/50 bg-er-surface p-4">
                        <p class="text-[11px] font-bold text-er-muted tracking-[0.15em] uppercase mb-3">하위유형별 상세</p>
                        <div class="grid gap-3">
                            ${detail.subtypes.map(item => `
                                <div class="rounded-xl border border-er-sand/40 bg-er-base/55 p-4">
                                    <p class="text-sm font-bold text-er-dark">${item.name} · ${item.subtitle}</p>
                                    <p class="mt-1 text-sm text-gray-700 break-keep leading-relaxed">"${item.catch}"</p>
                                    <p class="mt-2 text-xs font-bold text-gray-500 tracking-wide">특징</p>
                                    <ul class="mt-1 space-y-1">
                                        ${item.traits.map(row => `<li class="text-sm text-gray-700 break-keep leading-relaxed">• ${row}</li>`).join('')}
                                    </ul>
                                    <p class="mt-2 text-sm text-er-dark font-semibold break-keep">핵심: ${item.core}</p>
                                    <p class="mt-3 text-xs font-bold text-gray-500 tracking-wide">관계/스트레스</p>
                                    <ul class="mt-1 space-y-1">
                                        ${item.relationStress.map(row => `<li class="text-sm text-gray-700 break-keep leading-relaxed">• ${row}</li>`).join('')}
                                    </ul>
                                    <p class="mt-3 text-xs font-bold text-gray-500 tracking-wide">잘 맞는 직업</p>
                                    <ul class="mt-1 space-y-1">
                                        ${item.jobs.map(row => `<li class="text-sm text-gray-700 break-keep leading-relaxed">• ${row}</li>`).join('')}
                                    </ul>
                                    <p class="mt-2 text-sm text-gray-700 break-keep"><span class="font-bold">이유:</span> ${item.jobReason}</p>
                                    <p class="mt-3 text-xs font-bold text-gray-500 tracking-wide">성장 방향</p>
                                    <ul class="mt-1 space-y-1">
                                        ${item.growth.map(row => `<li class="text-sm text-gray-700 break-keep leading-relaxed">• ${row}</li>`).join('')}
                                    </ul>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="rounded-2xl border border-er-sand/50 bg-er-surface p-4">
                        <p class="text-[11px] font-bold text-er-muted tracking-[0.15em] uppercase mb-3">한눈에 정리</p>
                        <div class="overflow-x-auto">
                            <table class="w-full text-sm">
                                <thead>
                                    <tr class="text-left text-gray-500">
                                        <th class="pb-2">하위유형</th>
                                        <th class="pb-2">핵심</th>
                                        <th class="pb-2">직업 방향</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${detail.quickSummary.map(row => `
                                        <tr class="border-t border-gray-100">
                                            <td class="py-2 text-gray-800">${row.subtype}</td>
                                            <td class="py-2 text-gray-700">${row.core}</td>
                                            <td class="py-2 text-gray-700">${row.career}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="rounded-2xl border border-er-sand/50 bg-er-surface p-4">
                        <p class="text-[11px] font-bold text-er-muted tracking-[0.15em] uppercase mb-2">복음적 회복</p>
                        <p class="text-sm text-er-body break-keep leading-relaxed"><span class="font-bold">Original Design:</span> ${detail.gospelRecovery.originalDesign}</p>
                        <p class="mt-1 text-sm text-er-body break-keep leading-relaxed"><span class="font-bold">False Self:</span> ${detail.gospelRecovery.falseSelf}</p>
                        <ul class="mt-2 space-y-1">
                            ${detail.gospelRecovery.restoration.map(item => `<li class="text-sm text-er-body break-keep leading-relaxed">• ${item}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="rounded-2xl border border-er-green/25 bg-er-greenTint/50 p-4">
                        <p class="text-sm text-er-inkSoft font-semibold break-keep">한 줄 마무리</p>
                        <p class="mt-1 text-sm text-er-body break-keep leading-relaxed">${detail.closing}</p>
                    </div>
                </div>
            </div>
        `;
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
        document.body.appendChild(modal);
    }

    if (typeof window !== 'undefined') {
        window.openTypeDetail = openTypeDetail;
    }

    return `
        <div class="min-h-screen bg-er-base">
            <section class="bg-er-dark text-white py-12 md:py-16 px-6 relative overflow-hidden rounded-b-[3rem]">
                <div class="absolute top-[-20%] right-[-10%] w-[360px] h-[360px] bg-er-green/20 rounded-full blur-[110px] pointer-events-none"></div>
                <div class="max-w-6xl mx-auto relative z-10">
                    <button onclick="renderSection('test')" class="mb-5 px-3 py-1.5 bg-white/10 border border-white/15 rounded-full text-xs font-medium text-white/90 flex items-center gap-1 transition-all hover:bg-white/20 w-fit">
                        <i class="fas fa-arrow-left"></i> 프리미엄 검사로
                    </button>
                    <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] font-bold tracking-widest uppercase text-er-greenTint mb-4">Types Guide</span>
                    <h2 class="font-display text-2xl md:text-4xl font-extrabold tracking-[-0.03em] break-keep">9가지 유형별 회복의 길</h2>
                    <p class="mt-3 text-sm text-white/80 break-keep max-w-2xl leading-relaxed">각 유형은 단순한 성격 분류가 아니라 회복의 방향을 안내하는 지도입니다. 유형별 설명과 회복 경로를 참고해 현재의 패턴을 점검해 보세요.</p>
                </div>
            </section>

            <div class="max-w-6xl mx-auto px-4 py-10">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-in-up">
                    ${types.map((t) => `
                        <div class="bg-er-surface rounded-2xl shadow-soft border border-er-sand/60 overflow-hidden hover:shadow-card transition-all duration-300 group">
                            <div class="h-1.5 w-full ${t.bg.replace('bg-', 'bg-').replace('50', '400')}"></div>
                            <div class="p-5">
                                <div class="flex items-center justify-between mb-3">
                                    <h3 class="text-base font-bold text-er-inkSoft relative z-10">${t.name.split('(')[0]}</h3>
                                    <span class="text-3xl font-bold text-er-sand group-hover:text-er-green/30 transition-colors tabular-nums">${t.id}</span>
                                </div>
                                <p class="text-[10px] text-er-muted mb-3 -mt-4">${t.name.split('(')[1].replace(')','')}</p>
                                <p class="text-er-body text-xs leading-relaxed mb-5 min-h-[2.5em] break-keep">${t.desc}</p>
                                
                                <div class="bg-er-base/60 rounded-xl p-3 border border-er-sand/40 group-hover:bg-er-greenTint/35 transition-colors">
                                    <div class="flex items-start gap-2">
                                        <i class="fas fa-seedling text-er-green mt-0.5 text-xs"></i>
                                        <div>
                                            <p class="text-[9px] text-er-muted font-bold tracking-wider">회복의 길</p>
                                            <p class="text-xs text-er-inkSoft font-medium mt-0.5 break-keep">${t.healing}</p>
                                        </div>
                                    </div>
                                </div>
                                <button onclick="openTypeDetail(${t.id})" class="mt-4 w-full py-2.5 rounded-xl border border-er-sand text-er-body font-bold text-xs hover:bg-er-green hover:text-white hover:border-transparent transition-all">
                                    자세히 알아보기
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="mt-12 text-center pb-10">
                    <button onclick="renderSection('apply', { track: 'paid' })" class="bg-er-green text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-er-greenDark transition-colors text-sm">
                        전문가 상담 신청하기
                    </button>
                </div>
            </div>
        </div>
    `;
}


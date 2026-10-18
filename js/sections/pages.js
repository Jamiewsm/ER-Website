// ER Section: Static pages — Privacy, Terms, Resources
function renderPrivacy() {
    return `
        <div class="bg-white min-h-screen py-16 px-4 sm:px-6 lg:px-8">
            <div class="max-w-4xl mx-auto">
                <div class="mb-10">
                    <span class="text-er-accent font-bold text-xs tracking-widest uppercase">Privacy</span>
                    <h2 class="text-3xl md:text-4xl font-bold text-er-dark mt-3">개인정보 안내</h2>
                    <p class="mt-3 text-sm text-gray-500 break-keep">공개 웹사이트의 상담·과정 신청과 문의에 적용되는 안내입니다. 계정과 교육포털에는 가입 시 제공하는 별도 안내도 적용됩니다.</p>
                </div>
                <div class="space-y-4 text-sm text-gray-600 leading-relaxed">
                    <section class="rounded-2xl bg-er-base/60 border border-er-sand/50 p-6 shadow-soft">
                        <h3 class="mb-2 font-bold text-er-ink">받는 정보</h3>
                        <p>이름, 연락처·이메일, 신청 분야와 작성하신 메시지를 받습니다. 과정에 따라 전화번호·카카오톡 ID, 거주 국가·희망 시간, 에니어그램 경험·소개 경로, 결제 지역·수단·입금자명, 사역 정보나 대리 신청자의 이름·연락처·관계를 추가로 받습니다. 각 폼에서 필수로 표시된 항목은 접수에 필요하며, 선택 항목은 비워 두실 수 있습니다.</p>
                    </section>
                    <section class="rounded-2xl bg-er-base/60 border border-er-sand/50 p-6 shadow-soft">
                        <h3 class="mb-2 font-bold text-er-ink">사용 목적과 처리 서비스</h3>
                        <p>신청 접수, 담당자 응답, 일정·등록·납부 확인과 접수·운영 안내에 사용합니다. 신청 정보 저장에는 Supabase, 운영자 알림과 접수 안내 메일 발송에는 Resend, 스팸 방지에는 Cloudflare Turnstile을 사용합니다. 메일 처리에는 이메일 주소와 안내 내용이, 보안 확인에는 토큰과 요청 IP 등이 전달됩니다.</p>
                    </section>
                    <section class="rounded-2xl bg-er-base/60 border border-er-sand/50 p-6 shadow-soft">
                        <h3 class="mb-2 font-bold text-er-ink">보관과 권리 요청</h3>
                        <p>신청 처리와 필요한 운영 기록 확인을 위해 보관합니다. 보관 여부와 삭제 가능 범위를 확인하거나 열람·정정·삭제·처리 중단을 요청하려면 <a href="mailto:hello@er-coaching.com" class="font-bold text-er-green underline underline-offset-2">hello@er-coaching.com</a>으로 연락해 주세요. 본인 확인 후 처리 가능 범위와 제한 사유를 안내합니다. 메시지에는 비밀번호나 불필요한 민감 정보를 적지 말아 주세요.</p>
                    </section>
                </div>
            </div>
        </div>
    `;
}

function renderTerms() {
    return `
        <div class="bg-er-base min-h-screen py-16 px-4 sm:px-6 lg:px-8">
            <div class="max-w-4xl mx-auto">
                <div class="mb-10">
                    <span class="text-er-accent font-bold text-xs tracking-widest uppercase">Terms</span>
                    <h2 class="text-3xl md:text-4xl font-bold text-er-dark mt-3">이곳을 이용하는 기본 안내</h2>
                    <p class="mt-3 text-sm text-gray-500 break-keep">공개 사이트와 운영 포털을 이용하실 때 알아두시면 좋은 기본 원칙을 짧게 정리했습니다.</p>
                </div>
                <div class="space-y-4 text-sm text-gray-600 leading-relaxed">
                    <div class="rounded-2xl bg-er-surface border border-er-sand/50 p-6 shadow-soft floating-card">공개 사이트의 정보는 ER의 사역과 참여 방법을 소개하기 위한 목적입니다.</div>
                    <div class="rounded-2xl bg-er-surface border border-er-sand/50 p-6 shadow-soft floating-card">운영 포털과 코치 앱은 승인된 코치와 기존 참여자를 위한 내부 기능이며, 일반 방문자는 공개 안내와 문의 경로를 먼저 이용합니다.</div>
                    <div class="rounded-2xl bg-er-surface border border-er-sand/50 p-6 shadow-soft floating-card">프로그램 일정과 구성, 제공 방식은 대상과 협력 구조에 따라 달라질 수 있습니다.</div>
                </div>
            </div>
        </div>
    `;
}

function renderResources() {
    return `
        <div class="bg-er-base min-h-screen py-16 px-4">
            <div class="max-w-4xl mx-auto">
                <div class="text-center mb-12 animate-fade-in-up">
                    <h2 class="text-2xl md:text-3xl font-bold text-gray-900">자료실 (Resources)</h2>
                    <p class="mt-2 text-sm text-gray-500">회복을 위한 전문 지식과 추천 자료를 모았습니다.</p>
                </div>

                <div class="space-y-6 animate-fade-in-up" style="animation-delay: 0.1s;">

                    <div class="grid md:grid-cols-2 gap-4 md:gap-6">
                        <div onclick="openNotice(3)" class="group bg-gradient-to-br from-[#fff9f1] via-white to-[#f3e8da] rounded-[2rem] p-6 md:p-7 shadow-soft floating-card cursor-pointer border border-white/60 relative overflow-hidden">
                            <span class="inline-flex rounded-full bg-er-accent/15 text-er-accent text-[9px] font-bold px-2.5 py-0.5 uppercase">Magazine</span>
                            <h3 class="mt-3 text-lg font-bold text-er-dark break-keep group-hover:text-er-accent transition-colors">ER 매거진 창간호</h3>
                            <p class="mt-2 text-sm text-gray-600 leading-relaxed break-keep">이번 호 하이라이트 — <strong>Parenting</strong>과 양육의 자기이해. 전체 PDF 전에 웹에서 읽는 짧은 글.</p>
                            <span class="mt-4 inline-flex items-center gap-2 text-xs font-bold text-er-dark">창간호 읽기 <i class="fas fa-arrow-right text-[10px]"></i></span>
                        </div>
                        <div onclick="window.location.href='/parenting-workshop.html?apply_source=magazine'" class="group bg-er-surface rounded-[2rem] p-6 md:p-7 shadow-soft floating-card cursor-pointer border border-er-sand/60 relative overflow-hidden">
                            <span class="inline-flex rounded-full bg-[#c47a5a] text-white text-[9px] font-bold px-2.5 py-0.5">모집중</span>
                            <h3 class="mt-3 text-lg font-bold text-er-dark break-keep">Enneagram for Parenting</h3>
                            <p class="mt-2 text-sm text-gray-600 leading-relaxed break-keep">매거진 주제와 이어지는 4주 심화 워크샵 — 6월–7월, Zoom, $120</p>
                            <span class="mt-4 inline-flex items-center gap-2 text-xs font-bold text-er-accent">워크샵 안내 <i class="fas fa-arrow-right text-[10px]"></i></span>
                        </div>
                    </div>
                    
                    <div onclick="renderSection('types_guide')" class="group bg-er-surface rounded-[2rem] p-6 md:p-8 shadow-soft floating-card cursor-pointer relative overflow-hidden border border-er-sand/60">
                        <div class="absolute top-0 right-0 w-48 h-48 bg-er-accent/10 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-er-accent/20 transition-all"></div>
                        
                        <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                            <div class="w-14 h-14 rounded-2xl bg-er-base flex items-center justify-center text-2xl text-er-dark shadow-inner shrink-0">
                                <i class="fas fa-fingerprint"></i>
                            </div>
                            <div class="flex-grow">
                                <div class="flex flex-wrap items-center gap-2 mb-2">
                                    <span class="px-2 py-0.5 bg-er-accent/10 text-er-accent text-[9px] font-bold rounded uppercase">Featured</span>
                                    <h3 class="text-lg md:text-xl font-bold text-gray-900 group-hover:text-er-accent transition-colors">9가지 유형별 회복의 길</h3>
                                </div>
                                <p class="text-gray-600 text-sm leading-relaxed break-keep">
                                    단순한 성격 분류를 넘어, 각 유형이 붙잡히기 쉬운 지점과 회복을 향해 걸어갈 수 있는 길을 소개합니다.
                                </p>
                            </div>
                            <div class="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 group-hover:bg-er-dark group-hover:text-white group-hover:border-transparent transition-all self-end md:self-center">
                                <i class="fas fa-arrow-right text-sm"></i>
                            </div>
                        </div>
                    </div>

                    <div class="grid md:grid-cols-2 gap-4 md:gap-6">
                        <div class="bg-er-dark text-white rounded-[2rem] p-6 md:p-8 flex flex-col justify-between shadow-card floating-card">
                            <div>
                                <div class="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4 text-lg"><i class="fas fa-clipboard-check"></i></div>
                                <h3 class="text-lg font-bold mb-1">에니어그램 적응형 테스트</h3>
                                <p class="text-gray-300 text-xs md:text-sm break-keep">약식 테스트를 통해 현재의 핵심 동기와 관계 패턴을 살펴보세요.</p>
                            </div>
                            <button onclick="renderSection('test')" class="mt-6 w-full py-3 bg-white text-er-dark rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors">
                                테스트 시작하기
                            </button>
                        </div>

                        <div class="bg-er-surface rounded-[2rem] p-6 md:p-8 shadow-soft border border-er-sand/60 floating-card">
                            <div class="flex items-center gap-2 mb-5">
                                <i class="fas fa-book text-er-accent text-lg"></i>
                                <h3 class="text-lg font-bold text-gray-900">추천 도서</h3>
                            </div>
                            <ul class="space-y-4">
                                <li class="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                                    <span class="text-gray-300 font-serif italic text-base mt-0.5">01</span>
                                    <div>
                                        <h4 class="text-sm font-bold text-gray-800">에니어그램의 지혜</h4>
                                        <p class="text-xs text-gray-500">Don Richard Riso &middot; 필독서</p>
                                    </div>
                                </li>
                                <li class="flex items-start gap-3">
                                    <span class="text-gray-300 font-serif italic text-base mt-0.5">02</span>
                                    <div>
                                        <h4 class="text-sm font-bold text-gray-800">내면의 감옥에서 벗어나라</h4>
                                        <p class="text-xs text-gray-500">Richard Rohr &middot; 영성/치유</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}


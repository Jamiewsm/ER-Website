// ER 전문가 과정의 2026–2027 교육 여정과 지원 조건을 안내한다.
function renderCoachTraining() {
    return `
        <div class="bg-er-base min-h-screen">
            <section class="bg-er-dark text-white py-14 md:py-20 px-6 rounded-b-[3rem]">
                <div class="max-w-4xl mx-auto">
                    <h2 class="font-display text-3xl md:text-5xl font-extrabold tracking-[-0.03em] leading-snug break-keep">배움을 삶으로, 회복을 돌봄으로</h2>
                    <p class="mt-5 text-white/80 max-w-xl break-keep leading-relaxed">ER 전문가 과정은 기본과정에서 시작해 심화 성장과 코치 트레이닝으로 이어지는 교육 여정입니다. 수료 후에는 자신의 배움과 사역에 맞는 다음 과정을 선택할 수 있습니다.</p>
                </div>
            </section>

            <div class="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16 space-y-12">
                <section aria-labelledby="education-pathway-title">
                    <h3 id="education-pathway-title" class="text-2xl font-bold text-er-inkSoft break-keep">교육 과정 한눈에 보기</h3>
                    <ol class="mt-6 divide-y divide-er-sand text-er-body">
                        <li class="py-5"><strong class="text-er-inkSoft">기본과정 8주 수료</strong><p class="mt-2 leading-relaxed break-keep">분기별로 열리는 기본과정에서 자기 이해와 회복의 기초를 세웁니다.</p></li>
                        <li class="py-5"><strong class="text-er-inkSoft">2급 검정과 심화성장101</strong><p class="mt-2 leading-relaxed break-keep">기본과정 수료 후 두 과정을 병행할 수 있습니다. 심화성장101 참여에 2급 자격은 필요하지 않습니다.</p></li>
                        <li class="py-5"><strong class="text-er-inkSoft">2급 자격 + 심화성장101 수료 → 1급 과정 지원</strong><p class="mt-2 leading-relaxed break-keep">두 조건을 갖추면 2027년 코치 트레이닝 2기인 1급 과정에 지원할 수 있습니다.</p></li>
                    </ol>
                    <p class="mt-4 text-sm text-er-muted leading-relaxed break-keep">과정 수료와 검정 합격·자격 발급은 별도로 확인합니다. 수강만으로 자격이 자동 부여되지는 않습니다.</p>
                </section>

                <section aria-labelledby="education-basic-title" class="bg-er-surface border border-er-sand/50 rounded-[2rem] p-6 md:p-8">
                    <h3 id="education-basic-title" class="text-2xl font-bold text-er-inkSoft break-keep">성경적 에니어그램 기본과정</h3>
                    <p class="mt-3 text-er-body leading-relaxed break-keep">8주 동안 같은 클래스에서 강의와 나눔, 1:1 멘토링을 통해 배움을 일상에 연결합니다.</p>
                    <dl class="mt-6 space-y-4 text-sm text-er-body">
                        <div><dt class="font-bold text-er-inkSoft">운영</dt><dd class="mt-1 leading-relaxed">분기별 개설 · 클래스당 학생 7명, 멘토 별도 · 필요에 따라 분반 가능</dd></div>
                        <div><dt class="font-bold text-er-inkSoft">2026년 10월 기수</dt><dd class="mt-1 leading-relaxed">최소 2개 클래스 운영을 계획하고 있습니다. 분반과 요일·시간은 아직 확정되지 않았으며 참여자와 조율해 안내합니다.</dd></div>
                        <div><dt class="font-bold text-er-inkSoft">수강료</dt><dd class="mt-1">한국 ₩450,000 · 미국 $330</dd></div>
                    </dl>
                    <a href="/basic-course.html" class="mt-6 inline-flex items-center min-h-11 text-er-green font-bold underline underline-offset-4 hover:text-er-greenDark">현재 기본과정 안내 보기</a>
                </section>

                <section aria-labelledby="education-exam-title" class="bg-er-surface border border-er-sand/50 rounded-[2rem] p-6 md:p-8">
                    <h3 id="education-exam-title" class="text-2xl font-bold text-er-inkSoft break-keep">2급 검정시험</h3>
                    <p class="mt-3 text-er-body leading-relaxed break-keep">기본과정 수료자가 배운 내용을 확인하는 온라인 검정입니다.</p>
                    <dl class="mt-6 space-y-4 text-sm text-er-body">
                        <div><dt class="font-bold text-er-inkSoft">응시 대상</dt><dd class="mt-1">기본과정 수료자</dd></div>
                        <div><dt class="font-bold text-er-inkSoft">일정</dt><dd class="mt-1 leading-relaxed">2026년 9월 말 온라인 시행 예정 · 정확한 날짜는 미정이며 확정 후 안내합니다.</dd></div>
                        <div><dt class="font-bold text-er-inkSoft">시험과 준비</dt><dd class="mt-1 leading-relaxed">에니어그램 기본 개념, 고착, 동기를 다루는 객관식 시험입니다. 준비용 문제집을 제공할 예정입니다.</dd></div>
                        <div><dt class="font-bold text-er-inkSoft">응시료</dt><dd class="mt-1">₩30,000</dd></div>
                    </dl>
                </section>

                <section aria-labelledby="education-growth-title" class="bg-er-surface border border-er-sand/50 rounded-[2rem] p-6 md:p-8">
                    <h3 id="education-growth-title" class="text-2xl font-bold text-er-inkSoft break-keep">심화성장101</h3>
                    <p class="mt-3 text-er-body leading-relaxed break-keep">기존 스터디를 심화성장101로 이어갑니다. 유형별 하위유형의 차이와 역유형, 각 번호의 고착을 깊이 살펴보고 참여와 나눔으로 실제적인 배움을 추구합니다.</p>
                    <dl class="mt-6 space-y-4 text-sm text-er-body">
                        <div><dt class="font-bold text-er-inkSoft">참여 대상</dt><dd class="mt-1 leading-relaxed">기본과정 수료자 · 2급 검정 준비와 병행 가능</dd></div>
                        <div><dt class="font-bold text-er-inkSoft">일정과 방식</dt><dd class="mt-1 leading-relaxed">2026년 10월~12월 · 주 1회, 회당 약 2시간 · 참여형 수업</dd><dd class="mt-1 leading-relaxed">멤버 확정 후 요일과 시간을 정합니다.</dd></div>
                        <div><dt class="font-bold text-er-inkSoft">수강료</dt><dd class="mt-1">총 ₩150,000 · 월 ₩50,000씩 3회 납부</dd></div>
                        <div><dt class="font-bold text-er-inkSoft">장학 안내</dt><dd class="mt-1 leading-relaxed">전임사역자 및 사모에게는 수강료 50% 장학 혜택을 받을 수 있습니다.</dd></div>
                    </dl>
                </section>

                <section aria-labelledby="education-training-title" class="bg-er-surface border border-er-sand/50 rounded-[2rem] p-6 md:p-8">
                    <h3 id="education-training-title" class="text-2xl font-bold text-er-inkSoft break-keep">2027 코치 트레이닝 2기 · 1급 과정</h3>
                    <p class="mt-3 text-er-body leading-relaxed break-keep">기독교적 관점에서 에니어그램으로 타인의 회복을 돕는 전문 회복사역자를 양성합니다. 자기 이해와 관계 성장을 넘어 다른 사람을 돕는 역량을 기릅니다.</p>
                    <dl class="mt-6 space-y-4 text-sm text-er-body">
                        <div><dt class="font-bold text-er-inkSoft">지원 조건</dt><dd class="mt-1">2급 자격 취득과 심화성장101 수료</dd></div>
                        <div><dt class="font-bold text-er-inkSoft">기간</dt><dd class="mt-1 leading-relaxed">2027년 2월~12월 · 실제 교육 9개월, 전체 일정 11개월</dd><dd class="mt-1 leading-relaxed">1학기 2~4월 · 2학기 6~8월 · 3학기 10~12월 · 5월·9월 방학</dd></div>
                        <div><dt class="font-bold text-er-inkSoft">모임</dt><dd class="mt-1 leading-relaxed">주 1회 온라인 · 전문 강사 트랙 월 2회, Formation 월 1회, 코칭 스킬 월 1회 · 통합 실습은 기회별 진행</dd></div>
                        <div><dt class="font-bold text-er-inkSoft">트랙 내용</dt><dd class="mt-1 leading-relaxed">전문 강사: 에니어그램 전문성 강화 · Formation: 자기성찰 나눔과 기도 · 코칭: 외부 특강 중심 회복코치 교육 · 실습: 멘토링, 타이핑 세션, 코칭, 심화성장반 리딩 및 강의</dd></div><div><dt class="font-bold text-er-inkSoft">수강료</dt><dd class="mt-1 leading-relaxed">총 ₩1,200,000 · 월 ₩100,000씩 12회 분납 가능</dd><dd class="mt-1 leading-relaxed text-er-muted">12회는 납부 횟수이며 교육 기간과는 다릅니다.</dd></div>
                        <div><dt class="font-bold text-er-inkSoft">장학 안내</dt><dd class="mt-1 leading-relaxed">전임사역자 및 사모에게는 수강료 50% 장학 혜택을 받을 수 있습니다.</dd></div>
                    </dl>
                </section>

                <section aria-labelledby="education-parenting-title">
                    <h3 id="education-parenting-title" class="text-2xl font-bold text-er-inkSoft break-keep">앞으로 개설할 심화성장 과목</h3>
                    <p class="mt-4 max-w-xl text-er-body leading-relaxed break-keep">앞으로 Parenting(자녀양육), 부부관계, 목회와 사역, 리더십 등 삶의 여러 영역에 적용하는 심화성장 과목을 개설할 예정입니다. 선택하여 참여하는 성장 과정의 예시이며, 구체적인 개설 일정과 내용은 확정 후 안내합니다. 기존 스터디 참여자는 심화성장101 재참여를 선택하거나 쉬었다가 이후 합류할 수도 있습니다.</p>
                </section>
            </div>
        </div>
    `;
}

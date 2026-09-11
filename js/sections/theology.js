function renderTheology() {
    return `
        <div class="bg-er-base min-h-screen">
            <header class="rounded-b-[3rem] bg-er-greenDark px-4 py-12 text-white sm:px-6 md:py-16 lg:px-8">
                <div class="mx-auto max-w-3xl">
                    <a href="#about" class="mb-5 inline-flex min-h-11 items-center text-sm underline underline-offset-4 hover:text-er-greenTint">ER 소개</a>
                    <h1 class="font-display text-3xl font-extrabold leading-snug tracking-[-0.03em] break-keep md:text-4xl">ER의 신학적 기초</h1>
                    <p class="mt-5 max-w-xl text-base leading-relaxed break-keep">정체성, 고착, 회복과 부르심에 대한 우리의 신학적 기초</p>
                </div>
            </header>
            <article aria-label="ER의 신학적 기초 본문" class="mx-auto max-w-3xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
                <div class="mx-auto max-w-xl space-y-6 text-base leading-relaxed text-er-body break-keep">
                    <p>ER(Enneagram for Restoration)은 성경적 인간 이해에서 출발하여 에니어그램이 관찰한 기질과 성격의 패턴을 분별하고 재해석합니다. 에니어그램은 자신을 이해하는 데 도움을 줄 수 있지만, 인간의 정체성과 구원, 변화와 삶의 목적에 대한 최종적인 답은 아닙니다.</p>
                    <p>ER의 중심에는 예수 그리스도와 복음이 있습니다. 우리는 하나님께서 각 사람에게 주신 고유성을 이해하고, 그리스도 안에서 회복된 삶이 하나님과 이웃을 사랑하는 열매로 이어지도록 돕습니다.</p>
                    <nav aria-label="신학적 기초 목차" class="py-4">
                        <p class="mb-2 text-sm font-semibold text-er-muted">이 페이지의 내용</p>
                        <ol>
                            <li><button type="button" onclick="renderSection('theology', { focus: 'scripture' })" class="inline-flex min-h-11 items-center py-2 font-semibold text-er-green underline underline-offset-4 hover:text-er-greenDark">1. 우리의 신학적 기준</button></li>
                            <li><button type="button" onclick="renderSection('theology', { focus: 'design' })" class="inline-flex min-h-11 items-center py-2 font-semibold text-er-green underline underline-offset-4 hover:text-er-greenDark">2. 하나님께서 주신 고유성</button></li>
                            <li><button type="button" onclick="renderSection('theology', { focus: 'fixation' })" class="inline-flex min-h-11 items-center py-2 font-semibold text-er-green underline underline-offset-4 hover:text-er-greenDark">3. 기질과 고착의 차이</button></li>
                            <li><button type="button" onclick="renderSection('theology', { focus: 'restoration' })" class="inline-flex min-h-11 items-center py-2 font-semibold text-er-green underline underline-offset-4 hover:text-er-greenDark">4. 그리스도 안에서의 회복</button></li>
                            <li><button type="button" onclick="renderSection('theology', { focus: 'calling' })" class="inline-flex min-h-11 items-center py-2 font-semibold text-er-green underline underline-offset-4 hover:text-er-greenDark">5. 회복된 삶의 열매</button></li>
                        </ol>
                    </nav>
                    <section aria-labelledby="theology-scripture" class="space-y-5 border-t border-er-sand pt-10 md:pt-12">
                        <h2 id="theology-scripture" tabindex="-1" class="scroll-mt-28 text-2xl font-bold leading-snug text-er-inkSoft break-keep">1. 우리의 신학적 기준</h2>
                        <p>ER은 구약과 신약 성경을 하나님의 말씀으로 믿으며, 인간의 정체성, 죄, 구원과 변화에 관한 우리의 이해를 판단하는 최종적인 기준으로 받아들입니다.</p>
                        <p>심리학과 에니어그램을 포함한 인간의 연구와 관찰은 유익한 통찰을 제공할 수 있습니다. 그러나 그러한 통찰은 성경과 동등한 권위를 갖지 않으며, 성경적 세계관 안에서 검토되고 분별되어야 합니다.</p>
                        <p>따라서 ER은 에니어그램의 모든 전제와 영성적 설명을 그대로 받아들이지 않습니다. 에니어그램 자체를 기독교적 계시나 성경적 인간론으로 주장하지 않으며, 인간의 구원과 변화에 관한 주장이 복음과 충돌할 때 성경의 가르침을 따릅니다.</p>
                        <p><strong class="font-semibold text-er-inkSoft">에니어그램은 기질과 고착을 살펴보는 지도이며, 성경은 진리를 분별하는 기준입니다. 그리스도는 구속의 중심이며, 성령께서는 변화와 성화의 주체이십니다.</strong></p>
                    </section>
                    <section aria-labelledby="theology-design" class="space-y-5 border-t border-er-sand pt-10 md:pt-12">
                        <h2 id="theology-design" tabindex="-1" class="scroll-mt-28 text-2xl font-bold leading-snug text-er-inkSoft break-keep">2. 하나님께서 주신 고유성</h2>
                        <p>인간의 이야기는 고착이나 결핍에서 시작하지 않습니다. 성경은 인간이 하나님의 형상대로 창조되었다고 선언합니다(창세기 1:26–27). 우리의 가장 근본적인 정체성은 에니어그램의 번호나 성격 유형이 아니라 하나님의 형상을 지닌 존재라는 데 있습니다.</p>
                        <p>우리는 하나님께 알려지고 사랑받으며 그분과 관계하도록 지음받았습니다. 하나님은 각 사람에게 고유한 기질과 가능성, 은사를 주셨으며, 그것을 통해 하나님을 사랑하고 이웃을 섬기며 세상 가운데 하나님의 선하심과 아름다움을 드러내도록 부르셨습니다.</p>
                        <h3 class="pt-4 text-xl font-bold leading-snug text-er-inkSoft break-keep">Original Design</h3>
                        <p><strong class="font-semibold text-er-inkSoft">Original Design은 하나님께서 각 사람에게 창조적으로 주신 고유한 기질과 가능성, 은사와 방향성이며, 그것을 통해 하나님을 사랑하고 이웃을 섬기며 하나님의 선하심과 아름다움을 세상 가운데 드러내도록 하신 창조적 의도를 의미합니다.</strong></p>
                        <p>Original Design은 단순한 능력이나 장점만을 뜻하지 않습니다. 하나님께서 한 사람에게 주신 기질적 방향성과 고유성, 은사와 가능성을 포괄하는 ER의 신학적 개념입니다.</p>
                        <h3 class="pt-4 text-xl font-bold leading-snug text-er-inkSoft break-keep">Original Design과 에니어그램 유형</h3>
                        <p>ER은 에니어그램의 아홉 유형을 인간의 다양한 기질 가운데 반복적으로 관찰되는 큰 패턴을 기술하는 지도로 이해합니다. 유형을 통해 각 사람의 Original Design이 지닌 기질적 측면을 살펴볼 수 있지만, 한 사람 전체의 Original Design을 유형 하나로 설명할 수는 없습니다.</p>
                        <p>이는 하나님께서 인간을 정확히 아홉 종류로 창조하셨다는 뜻이 아닙니다. 같은 유형 안에서도 하위유형과 날개, 기질의 강도, 가족과 문화, 삶의 경험과 선택에 따라 매우 다양한 모습이 나타납니다. 이러한 유형과 기질에 관한 설명은 ER이 채택한 작업모델이며, 성경이 직접 가르치는 창조 분류나 과학적으로 확정된 사실로 제시하지 않습니다.</p>
                        <p>에니어그램은 우리가 누구인지 결정하지 않습니다. 우리의 정체성은 우리를 창조하시고 아시며 그리스도 안에서 구속하시는 하나님과의 관계 안에서 발견됩니다.</p>
                    </section>
                    <section aria-labelledby="theology-fixation" class="space-y-5 border-t border-er-sand pt-10 md:pt-12">
                        <h2 id="theology-fixation" tabindex="-1" class="scroll-mt-28 text-2xl font-bold leading-snug text-er-inkSoft break-keep">3. 기질과 고착의 차이</h2>
                        <p>하나님께서 주신 기질 자체가 곧 고착은 아닙니다. 정의를 추구하는 힘, 사람을 사랑하고 돌보는 능력, 목표를 이루어내는 추진력, 깊이 있는 감수성, 지혜와 통찰, 신중함과 책임감, 기쁨과 가능성을 보는 눈, 용기와 힘, 평화와 수용의 능력은 아름답게 사용될 수 있습니다.</p>
                        <p>그러나 인간은 죄로 하나님을 거역했고, 하나님과의 관계가 깨어졌습니다. 타락은 우리의 행동뿐 아니라 생각과 욕망, 감정과 관계, 자신과 세상을 바라보는 방식에도 영향을 미쳤습니다.</p>
                        <h3 class="pt-4 text-xl font-bold leading-snug text-er-inkSoft break-keep">감정은 우리를 이해하는 신호입니다</h3>
                        <p>우리는 깨어진 세상에서 두려움과 수치심, 분노를 경험합니다. ER은 이러한 감정 자체를 곧 죄라고 규정하지 않습니다. 감정은 무엇이 위협받고 있는지, 어디에 상처와 어려움이 있는지 알려주는 중요한 신호가 될 수 있습니다.</p>
                        <p>문제는 감정과 욕망이 왜곡되고 거짓된 믿음과 결합하여 우리의 사고와 행동을 지배할 때입니다. 우리는 하나님이 아닌 다른 것에서 사랑과 가치, 안전과 자유를 확보하려 하며 특정한 자기보호 전략을 반복하게 됩니다.</p>
                        <ul class="list-disc space-y-3 pl-6 marker:text-er-green">
                            <li>“완벽해야 가치가 있다.”</li>
                            <li>“필요한 사람이 되어야 사랑받는다.”</li>
                            <li>“충분히 알아야 안전하다.”</li>
                            <li>“모든 위험에 대비해야 한다.”</li>
                            <li>“고통을 피해야 자유롭다.”</li>
                            <li>“약한 모습을 보여서는 안 된다.”</li>
                        </ul>
                        <p>인간은 상처와 거짓의 피해자이기만 한 것은 아닙니다. 우리는 거짓을 믿고 붙들며, 왜곡된 욕망에 따라 선택하는 책임 있는 존재이기도 합니다.</p>
                        <h3 class="pt-4 text-xl font-bold leading-snug text-er-inkSoft break-keep">Original Design과 고착은 같지 않습니다</h3>
                        <p><strong class="font-semibold text-er-inkSoft">ER에서 고착(Fixation)은 하나님께서 주신 기질적 방향성이 타락한 인간 조건 속에서 두려움과 욕망, 거짓된 믿음과 자기보호 전략에 결합하여 반복적이고 자동적인 사고·감정·행동의 방식으로 굳어진 상태를 의미합니다.</strong></p>
                        <p>예를 들어 정의와 바름에 민감한 사람은 실제로 세상 가운데 좋은 일을 할 수 있습니다. 그러나 그 행동의 깊은 곳에서 “내가 바로잡지 않으면 안 된다”는 두려움과 통제 욕구가 작동할 수도 있습니다.</p>
                        <p>겉으로 보이는 행동만으로는 그 사람의 내적 동기를 알 수 없습니다. 따라서 ER은 회복을 단순히 장점을 살리고 단점을 없애는 것으로 설명하지 않습니다. 상대방의 동기를 단정하기보다 함께 탐색하며, 더 깊은 질문을 던집니다.</p>
                        <p><strong class="font-semibold text-er-inkSoft">이 좋은 기질과 능력은 지금 무엇에 의해 움직이고 있는가?</strong></p>
                    </section>
                    <section aria-labelledby="theology-restoration" class="space-y-5 border-t border-er-sand pt-10 md:pt-12">
                        <h2 id="theology-restoration" tabindex="-1" class="scroll-mt-28 text-2xl font-bold leading-snug text-er-inkSoft break-keep">4. 그리스도 안에서의 회복</h2>
                        <p>에니어그램과 자기인식은 반복되는 패턴을 발견하도록 도울 수 있지만, 인간을 구원하거나 성화시키는 궁극적인 근원은 아닙니다. 우리의 근본적인 문제는 자신을 충분히 알지 못하는 데 있지 않고 죄와 하나님과의 깨어진 관계에 있습니다.</p>
                        <p>우리는 하나님의 은혜로, 예수 그리스도를 믿는 믿음을 통해 구원받습니다. 그리스도의 십자가와 부활은 죄인을 하나님과 화목하게 하며, 우리는 그리스도 안에서 새로운 정체성을 받습니다.</p>
                        <p><strong class="font-semibold text-er-inkSoft">우리는 고착을 극복해서 하나님의 사랑을 받는 것이 아닙니다. 그리스도 안에서 받아들여졌기 때문에 자신의 고착을 정직하게 바라보고 변화의 길을 걸을 수 있습니다.</strong></p>
                        <h3 class="pt-4 text-xl font-bold leading-snug text-er-inkSoft break-keep">진리와 회개 그리고 성령의 성화</h3>
                        <p>회복 과정에서 우리는 자신이 오래도록 사실이라고 믿어 온 것을 다시 질문합니다. 성경은 하나님이 누구신지, 그리스도 안에서 우리가 누구인지, 사랑과 가치와 안전이 어디에서 오는지를 가르칩니다.</p>
                        <p>우리는 말씀과 성령의 조명 가운데 자신이 붙들어 온 거짓과 죄, 왜곡된 욕망을 인정하고, 회개와 믿음으로 하나님을 신뢰하며 새로운 순종을 배워 갑니다. 죄에 속한 욕망과 행동은 회개하고 버려야 하며, 하나님께서 주신 기질과 능력은 사랑과 섬김을 향하도록 새로워져야 합니다.</p>
                        <p>이 변화는 부정적인 생각을 긍정적인 생각으로 바꾸는 자기확언이 아닙니다. 성령께서는 말씀의 진리로 우리의 믿음과 욕망, 동기를 새롭게 하시며, 하나님을 신뢰하는 새로운 선택과 실천이 삶의 열매로 이어지도록 이끄십니다.</p>
                        <p>성화는 기술을 정확히 적용하여 자신을 완성하는 공식이 아닙니다. 말씀과 기도, 예배와 공동체, 관계와 일상의 순종 가운데 성령께서 평생에 걸쳐 이루어 가시는 과정입니다. 그 안에서 우리는 반복해서 자신을 돌아보고 회개하며 믿음으로 응답합니다.</p>
                        <h3 class="pt-4 text-xl font-bold leading-snug text-er-inkSoft break-keep">Restoration</h3>
                        <p><strong class="font-semibold text-er-inkSoft">ER에서 회복(Restoration)은 하나님께서 주신 Original Design이 죄와 거짓, 왜곡된 욕망과 고착의 지배로부터 점점 자유로워지고, 성령 안에서 동기와 방향이 새롭게 되어 그리스도를 닮은 방식으로 열매 맺어 가는 과정입니다.</strong></p>
                        <p>회복은 성격을 제거하거나 다른 유형의 사람이 되는 것을 뜻하지 않습니다. 또한 내면 깊은 곳에 숨어 있는 죄 없는 완벽한 자아를 발견하는 과정도 아닙니다.</p>
                        <ul class="list-disc space-y-3 pl-6 marker:text-er-green">
                            <li>1번은 정의에 대한 감각을 잃는 것이 아니라 그 힘을 자기의와 통제가 아닌 사랑과 겸손 안에서 사용할 수 있습니다.</li>
                            <li>2번은 사람을 사랑하는 능력을 버리는 것이 아니라 인정받기 위한 사랑에서 자유로워져 이웃을 사랑할 수 있습니다.</li>
                            <li>5번은 깊이 생각하고 관찰하는 능력을 버리는 것이 아니라 그 지혜를 관계와 공동체 안으로 내어놓을 수 있습니다.</li>
                            <li>7번은 기쁨과 가능성을 보는 힘을 잃는 것이 아니라 고통을 회피하지 않으면서도 소망을 살아낼 수 있습니다.</li>
                        </ul>
                        <p>이 예들은 사람 전체를 유형 하나로 규정하는 설명이 아닙니다. 같은 기질적 선물도 그것을 움직이는 동기와 방향에 따라 다르게 사용될 수 있음을 보여줍니다.</p>
                    </section>
                    <section aria-labelledby="theology-calling" class="space-y-5 border-t border-er-sand pt-10 md:pt-12">
                        <h2 id="theology-calling" tabindex="-1" class="scroll-mt-28 text-2xl font-bold leading-snug text-er-inkSoft break-keep">5. 회복된 삶의 열매</h2>
                        <p><strong class="font-semibold text-er-inkSoft">회복의 목표는 그리스도를 닮아가는 것입니다. 하나님께서 주신 고유한 기질은 그 사랑을 각자의 삶에서 드러내는 통로가 됩니다.</strong></p>
                        <p>그리스도를 닮는다고 모든 사람이 동일한 성격이 되는 것은 아닙니다. 성령께서는 각 사람의 고유성을 지우시는 것이 아니라 정화하고 새롭게 하셔서, 그 고유성을 통해 그리스도의 성품이 다양한 방식으로 나타나게 하십니다.</p>
                        <p>회복은 나를 더 잘 이해하거나 더 건강하고 만족스러운 자신이 되는 데서 끝나지 않습니다. 하나님께서 주신 힘과 지혜, 사랑과 창조성, 감수성과 용기는 다시 하나님과 이웃을 향해 흘러갑니다.</p>
                        <p>그래서 ER의 질문은 “나는 얼마나 건강한 유형이 되었는가?”에서 더 나아갑니다.</p>
                        <p><strong class="font-semibold text-er-inkSoft">하나님께서 내게 주신 것이 이제 누구를 살리고 있는가?</strong></p>
                        <p>우리는 하나님과의 관계 안에서 그분을 신뢰하고, 가족과 공동체를 살리며, 맡겨진 일을 충실히 감당하고, 삶의 자리에서 하나님의 선하심과 아름다움을 드러내도록 부름받았습니다.</p>
                        <h3 class="pt-4 text-xl font-bold leading-snug text-er-inkSoft break-keep">ER이 추구하는 회복</h3>
                        <p>ER은 에니어그램을 통해 각 사람에게 주신 Original Design의 기질적 측면과 그것이 고착 속에서 어떻게 왜곡되어 사용되는지를 살펴봅니다. 우리의 구원은 예수 그리스도 안에 있으며, 성령께서는 복음의 진리로 우리를 새롭게 하십니다. ER은 그 회복이 하나님과 이웃을 사랑하는 삶, 부르심과 섬김의 열매로 이어지도록 돕습니다.</p>
                    </section>
                </div>
            </article>
        </div>
    `;
}

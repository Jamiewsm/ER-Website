// ER 프리미엄 결과지 조합 화학 카드 런타임 데이터
(function () {
  'use strict';

  const REPORT_CHEMISTRY_CARDS = {
    sx_7_w8: {
      schema_version: 1,
      combination_key: 'sx_7_w8',
      core: 7,
      dominant_instinct: 'sx',
      secondary_instinct: 'so',
      blind_instinct: 'sp',
      wing: 8,
      status: 'gold_sample',
      identity_sentence: '강렬한 몰입과 주도권 속에서 살아 있음을 느끼되, 현실의 무게와 반복 앞에서는 자주 다음 가능성으로 넘어가려는 사람',
      display: {
        one_page_title: '이 조합만의 화학',
        one_page_body: [
          '이 조합은 강렬한 몰입을 통해 살아 있음을 느끼는 sx7의 에너지에, 직접 판을 만들고 밀고 나가려는 8번 날개의 주도성이 더해진 모습입니다. 그래서 단순히 가능성을 상상하는 데 머물지 않고, 사람을 움직이고 상황을 열어젖히려는 힘으로 나타날 수 있습니다.',
          '동시에 사회적 본능이 보조로 작동하면, 이 추진력은 개인적 즐거움만이 아니라 좋은 영향력과 공동체적 의미를 향하기도 합니다. 하지만 자기보존 감각이 약할 때 몸, 돈, 일정, 생활의 한계는 뒤로 밀리고, 현실의 반복과 마무리가 시작되는 순간 마음은 다시 다음 가능성을 찾기 쉽습니다.',
          '회복은 열정을 줄이는 데 있지 않습니다. 꿈과 실행 사이의 틈을 인정하고, 한 관계와 한 약속과 한 일의 마무리 안에 조금 더 머무르는 데서 이 사람의 자유는 더 깊어집니다.'
        ],
        pull_quote: '더 많이 밀어붙이는 힘보다, 지금 느껴지는 답답함과 지루함을 견디는 용기가 이 사람의 자유를 더 깊게 만듭니다.',
        bullets: [
          '강렬한 가능성에 끌리지만, 움직이기 시작하면 주도권을 먼저 잡으려 합니다.',
          '사람들에게 좋은 영향력을 주고 싶지만, 자기 한계는 늦게 알아차릴 수 있습니다.',
          '현실의 반복과 마무리 앞에서 다음 가능성으로 넘어가려는 충동을 느끼기 쉽습니다.'
        ]
      }
    }
  };

  function getChemistryCard(key) {
    return REPORT_CHEMISTRY_CARDS[key] || null;
  }

  const api = { cards: REPORT_CHEMISTRY_CARDS, get: getChemistryCard };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') window.ERReportChemistry = api;
})();

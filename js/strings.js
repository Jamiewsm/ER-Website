/**
 * ER-Website: 단일 문구 데이터 (한곳에서 수정 가능)
 * index.html / main.js 등에서 window.ER_STRINGS 로 참조
 */
(function () {
  'use strict';

  var S = {
    nav: {
      news: '사역소식',
      about: 'ER 소개',
      programs: '프로그램',
      coaches: 'ER 대표 소개',
      resources: '자료실',
      community: '함께한 이야기',
      support: '후원하기',
      apply: '상담 신청',
      menuOpen: '메뉴 열기',
      login: '기존 참여자 로그인',
      loginTitle: '기존 참여자 로그인 또는 마이페이지',
      mypage: '마이페이지',
      coachPortal: 'Coach Portal',
      coachApp: 'Coach App',
      logout: '로그아웃'
    },
    footer: {
      tagline: 'Original Design을 회복하고 공동체를 치유하는 여정.',
      description: '기독교적 에니어그램의 통합적 접근을 통해\n하나님이 창조하신 나의 은사와 부르심을 다시 만납니다.',
      contact: 'Contact',
      partnership: 'Partnership',
      mail: '문의 메일',
      inquiry: '상담·협력 문의',
      place: 'Korea | USA',
      hours: 'Mon–Fri 10:00 – 17:00',
      resources: '자료실',
      community: '함께한 이야기',
      support: '후원하기',
      privacy: 'Privacy',
      terms: 'Terms',
      copyright: '© 2025 ER (Enneagram for Restoration).'
    },
    auth: {
      title: '로그인 / 회원가입',
      subtitle: 'Supabase 인증으로 안전하게 로그인합니다.',
      email: '이메일',
      password: '비밀번호',
      login: '로그인',
      signup: '회원가입',
      or: '또는',
      google: 'Google로 계속하기',
      closeLabel: '로그인 창 닫기',
      emailPlaceholder: 'you@example.com',
      passwordPlaceholder: '6자 이상 입력'
    },
    common: {
      ctaApply: '상담 신청하기',
      ctaInquiry: '문의 신청하기',
      ctaSupport: '후원·협력 신청하기',
      backHome: '홈으로',
      backToHome: '처음 화면으로 돌아가기',
      mypage: '마이페이지',
      dashboard: '대시보드',
      viewAll: '전체 보기',
      loading: '불러오는 중...',
      submit: '신청하기',
      coachAccount: '코치 계정',
      normalAccount: '일반 계정',
      logout: '로그아웃',
      loginRequired: '로그인하기',
      toMypage: '마이페이지로'
    },

    contentData: {
      stats: { labels: ['개인/가정', '목회자', '기업/조직', '강사양성', '청소년'] },
      types: { labels: ['1번 올바른 사람', '2번 아낌없이 주는 사람', '3번 열매맺는 사람', '4번 독창적인 사람', '5번 지혜로운 사람', '6번 충실한 사람', '7번 열정적인 사람', '8번 보호하는 사람', '9번 조화로운 사람'] },
      notices: [
        { id: 4, tag: '모집중', title: 'Enneagram for Parenting — 6월 4주 과정 모집', date: '2026-06-01', summary: '에니어그램으로 부모와 아이의 기질 차이를 이해하고 실제 양육 언어로 적용하는 4주 집중 과정', body: '<p class="text-gray-600 leading-relaxed break-keep">아이를 바꾸려 하기 전에, 부모와 아이의 기질 차이를 먼저 이해해야 합니다. Enneagram for Parenting 4주 과정은 양육 현장에서 반복되는 충돌 장면을 에니어그램 관점으로 해석하고, 집에서 바로 적용할 수 있는 양육 언어를 함께 정리합니다.</p><div class="mt-6 grid gap-3"><div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"><span class="text-xs font-bold text-gray-500 w-20">기간</span><span class="text-sm text-gray-700">2026년 6월 · 4주</span></div><div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"><span class="text-xs font-bold text-gray-500 w-20">대상</span><span class="text-sm text-gray-700 break-keep">자녀 양육에서 반복되는 충돌과 오해를 줄이고 싶은 부모·양육자</span></div><div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"><span class="text-xs font-bold text-gray-500 w-20">구성</span><span class="text-sm text-gray-700 break-keep">주 1회 · 강의 + 부모 자기 이해 + 아이 기질 해석 + 실제 적용</span></div></div>' },
        { id: 3, tag: '발행', title: 'ER 매거진 창간호 발행', date: '2026-05-24', summary: 'ER 의 회복 사역 이야기와 인사이트를 담은 매거진 첫 호가 나왔습니다.', body: '<p class="text-gray-600 leading-relaxed break-keep">ER 매거진 창간호가 나왔습니다. 회복의 여정에서 만난 분들의 이야기와, 에니어그램과 기독교 세계관을 통합한 사역의 인사이트를 한 권에 담았습니다. 자세한 안내는 곧 업데이트 됩니다.</p>' },
        { id: 1, tag: '모집중', title: 'SOIM 에니어그램 전문가반 5기 모집', date: '2025-01-15', summary: '온라인 8주 과정 강의과 1:1 멘토링', body: '<p class="text-gray-600 leading-relaxed break-keep">에니어그램을 "아는 단계"에서 끝내지 않고, 삶과 현장에 적용하는 단계까지 함께 갑니다. 전문가반 5기에서는 기초 이론부터 적용까지 매주 심화 수업과 과제로 훈련하고, 1:1 멘토링과 강의 피드백을 통해 실제 강의·코칭 현장에서 자신 있게 사용할 수 있도록 돕습니다. 수료 후에는 (선택사항) 스터디 그룹과 코칭 실습으로 이어지며, 정식 코치 활동을 준비할 수 있습니다.</p><div class="mt-6 grid gap-3"><div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"><span class="text-xs font-bold text-gray-500 w-20">기간</span><span class="text-sm text-gray-700">8주</span></div><div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"><span class="text-xs font-bold text-gray-500 w-20">대상</span><span class="text-sm text-gray-700 break-keep">에니어그램을 단순한 성격 이해를 넘어, <br> 기독교 세계관 안에서 "자기 이해와 타인 돌봄"(코칭·강의)에 <br> 실제로 적용하고자 하는 분</span></div><div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"><span class="text-xs font-bold text-gray-500 w-20">지원마감</span><span class="text-sm text-gray-700">2025.01.15</span></div></div>' },
        { id: 2, tag: '안내', title: '홈페이지 리뉴얼 안내', date: '2024-12-20', summary: '리뉴얼 진행 중이며 일부 기능은 준비 중입니다.', body: '<p class="text-gray-600 leading-relaxed break-keep">ER 홈페이지는 더 나은 정보 제공을 위해 리뉴얼 중입니다. 일부 메뉴와 기능(로그인/공지 확장 등)은 순차적으로 업데이트됩니다.</p>' }
      ]
    },

    publicTestimonials: {
      impactThemes: [
        { title: '자기 이해의 회복', summary: '유형을 맞히는 수준을 넘어, 하나님이 주신 기질과 나의 반복 패턴을 더 깊이 이해하게 되었다는 후기가 반복되었습니다.', source: '서울 · 휴스턴 · 카자흐스탄 후기' },
        { title: '부부와 가족 관계의 변화', summary: '배우자와 자녀를 더 잘 이해하게 되었고, 갈등과 오해를 줄이는 실제 언어를 배웠다는 반응이 많았습니다.', source: '보스턴 · 중앙아시아 · 아프리카 사역 후기' },
        { title: '사역자와 선교사의 돌봄', summary: '사역과 육아, 선교 현장의 분주함 속에서 자신을 성찰하고 하나님 안에서 위로와 회복을 경험했다는 간증이 이어졌습니다.', source: '샌안토니오 · 아프리카 후기' },
        { title: '강의와 멘토링의 깊이', summary: '단순 검사가 아니라 강의, 숙제, 멘토링, 상담을 통해 삶에 적용되는 이해와 치유를 경험했다는 평가가 많았습니다.', source: '부산 · 달라스 · 캘리포니아 후기' }
      ],
      stories: [
        { tag: '자기이해', quote: '유형을 안다고 생각했지만 감정 반응의 뿌리가 늘 헷갈렸습니다. 상담에서 혼동되는 유형을 구분하는 질문을 따라가며 제 핵심 동기를 더 선명하게 정리했고, 이후 중요한 관계와 선택에서 스스로를 설명하는 기준이 생겼습니다.', person: '', meta: '부산 · 개인 상담' },
        { tag: '선교·사역', quote: '제 성향이 왜 상황마다 달라 보이는지 스스로도 설명하기 어려웠습니다. 상담을 통해 고유한 강점과 반복되는 고착 패턴을 분리해서 보게 되었고, 사역 현장에서 제 리더십과 소통 방식을 더 명확하게 조정할 수 있었습니다.', person: '', meta: '중앙아시아 · 사역 현장' },
        { tag: '자기성찰', quote: '문제가 성품의 이슈인지, 유형의 비통합 반응인지 구분이 안 되어 자주 자책했습니다. 상담 이후 비통합으로 내려갈 때의 신호를 먼저 알아차리게 되었고, 말과 행동을 점검하는 실제 루틴이 생겨 관계 갈등이 줄었습니다.', person: '', meta: '서울 · 코칭 사역' },
        { tag: '부부관계', quote: '아내와의 차이를 자꾸 문제로 해석하다 보니 대화가 반복해서 막혔습니다. 부부가 함께 상담을 받으며 서로의 기질 차이를 이해하게 되었고, 상대를 바꾸려 하기보다 존중하는 대화 방식으로 전환할 수 있었습니다.', person: '', meta: '보스턴 · 부부 상담' },
        { tag: '교회·공동체', quote: '담임 목사님을 좀 더 이해하게 되었고, 다른 사역자들과의 관계도 훨씬 개선되었습니다. 무엇보다 이해되지 않았던 몇몇 성도들의 행동이 이해되어지고, 내가 어떻게 섬겨야 할지 배우는 귀한 시간이었습니다. 또한 내 안의 깊은 갈등과 갈망을 하나님 앞에서 더 깊이 이해하고, 번아웃이 아닌 영적 성장에 필요한 것이 무엇인지 이해하게 되었습니다. 좀 더 일찍 알았더라면.. 더 많은 사람을 품었을 수 있었을 텐데 라는 생각이 들었습니다.', person: '', meta: '휴스턴 · 교회사역' },
        { tag: '양육상담', quote: '세 자녀를 같은 방식으로 양육하면 된다고 생각했는데, 아이마다 필요한 반응이 달라 계속 부딪혔습니다. 상담을 통해 부모의 반응 패턴과 아이들의 기질 차이를 함께 이해하면서, 각 아이에게 맞는 양육 언어를 적용할 수 있게 되었습니다.', person: '', meta: '달라스 · 자녀 양육' },
        { tag: '부부관계', quote: '결혼 생활에서 아내의 반응을 이해하지 못해 오해가 쌓이고 있었습니다. 상담과 강의를 통해 기질의 다름을 우열이 아닌 차이로 받아들이게 되었고, 갈등 상황에서도 상대 강점을 먼저 보는 대화로 바뀌었습니다.', person: '', meta: '달라스 · 부부 관계' }
      ]
    },

    home: {
      badge: 'Enneagram Coaching',
      headline: '사람과 공동체의 회복을 돕습니다.',
      sub: 'ER은 기독교 세계관과 에니어그램을 통합적으로 이해하고 적용하여, 개인과 가정, 교회와 공동체가 하나님이 지으신 본래 모습을 다시 발견하고 건강한 관계와 소명을 회복하도록 돕습니다.',
      ctaApply: '상담 신청하기',
      ctaPrograms: '프로그램 보기',
      ctaSupport: '사역지원 후원하기',
      principle1: '전문 코칭 서비스 원칙',
      principle2: '목회자·선교사 무료 사역지원 원칙',
      principle3: '협력 네트워크 기반 운영',
      restorationInMotion: 'Restoration in Motion',
      approachLabel: 'Approach',
      approach: '삶 가까이 머무는 회복 코칭',
      modelLabel: 'Model',
      model: '목회·선교 현장을 섬기는 사역지원',
      visionLabel: 'Vision & Mission',
      visionQuote: '나의 Original Design을 알 때,\n비로소 타인의 Original Design이 보입니다.',
      whoWeServeLabel: 'Who We Serve',
      whoWeServeDesc: '개인의 자기 이해에서 공동체의 관계 회복에 이르기까지, 각 현장에 맞는 회복의 여정을 함께 만들어 갑니다.',
      whoWeServe: [
        { title: '개인', body: '자기 이해, 감정 패턴, 소명 탐색을 돕습니다.' },
        { title: '가정', body: '부부와 부모-자녀 관계의 갈등을 풀고 회복을 돕습니다.' },
        { title: '교회', body: '사역자와 리더, 공동체의 소진과 갈등을 함께 다룹니다.' },
        { title: '협력 기관', body: '교육, 워크숍, 파트너십 프로그램으로 연결합니다.' }
      ],
      programsLabel: '맞춤형 프로그램',
      programsTitle: '맞춤형 프로그램',
      programsDesc: '개인의 회복에서 공동체의 성장까지, 당신에게 가장 적합한 솔루션을 제안합니다.',
      programsCta: '프로그램 전체 보기',
      programTags: [
        { tag: 'Care', title: '개인·가정 회복', body: '자기 이해, 부부 관계, 자녀 양육 등 일상과 관계의 회복을 돕습니다.' },
        { tag: 'Church', title: '교회·사역자 지원', body: '소진, 갈등, 리더십 회복을 위한 코칭과 워크숍을 제공합니다.' },
        { tag: 'Training', title: '교육·강사 양성', body: '에니어그램과 회복 관점을 실제 교육과 현장 적용으로 연결합니다.' }
      ],
      statsLabels: [['45%', '개인·가정 지원 비중'], ['25%', '교회·사역자 지원 비중'], ['15%', '조직·협력 프로그램 비중'], ['10%', '강사 양성·교육 비중']],
      communityLabel: '함께한 이야기',
      communityTitle: '회복이 남긴 변화',
      communityDesc: '사역이 어떤 자리로 흘러가고 있는지, 주요 지표와 방향을 한눈에 정리했습니다.',
      chartTitle: '은혜가 흘러간 자리',
      chartDesc: '상담과 교육 요청이 집중되는 주요 영역을 기준으로 사역 방향을 조정합니다.',
      impactLabel: '사역의 방향',
      impactTitle: '반복적으로 나타난 변화의 방향',
      storiesLabel: '함께한 이야기',
      storiesTitle: '마음에 머무는 이야기',
      storiesDesc: '실제 후기를 바탕으로, 회복이 삶과 관계 안에 어떻게 스며들었는지 차분하게 담았습니다.',
      individualScope: '개인 · 가정 · 교회 · 공동체'
    },

    programs: {
      sectionLabel: '맞춤형 프로그램',
      sectionTitle: '맞춤형 프로그램',
      sectionDesc: '개인의 회복에서 공동체의 성장까지, 당신에게 가장 적합한 솔루션을 제안합니다.',
      view: {
        individual: {
          title: '나와 가정을 위한 회복',
          desc: '나의 성격 유형을 이해하고, 가장 가까운 가족과의 관계를 건강하게 세워가는 과정입니다.',
          cards: [
            { b: 'Basic', t: '자기 이해와 유형 찾기', d: '에니어그램 검사와 상담을 통해 나의 고유한 성격 유형을 발견합니다.', i: 'fas fa-fingerprint' },
            { b: 'Relationship', t: '부부 관계 회복 코칭', d: '서로의 다름을 이해하고 갈등의 고리를 끊어 친밀함을 회복합니다.', i: 'fas fa-heart' },
            { b: 'Family', t: '자녀 양육 코칭', d: '자녀의 기질을 이해하고 그에 맞는 맞춤형 양육 방식을 코칭합니다.', i: 'fas fa-child' }
          ]
        },
        church: {
          title: '목회자와 교회를 위한 쉼',
          desc: '사역의 현장에서 지친 영혼을 돌보고, 소명을 재확인하는 시간입니다.',
          cards: [
            { b: 'Rest', t: '목회자 번아웃 코칭', d: '탈진한 사역자를 위한 쉼과 회복, 내면의 힘을 기르는 과정입니다.', i: 'fas fa-cross' },
            { b: 'Calling', t: '소명 재발견 워크숍', d: '하나님이 주신 은사와 기질을 통해 사역의 방향성을 재점검합니다.', i: 'fas fa-compass' },
            { b: 'Community', t: '리더십 수련회', d: '당회, 교사, 소그룹 리더들을 위한 맞춤형 수련회 프로그램을 제공합니다.', i: 'fas fa-users' }
          ]
        },
        business: {
          title: '건강한 조직 문화와 성과',
          desc: '구성원의 강점을 발견하고, 효과적인 소통과 협업을 돕습니다.',
          cards: [
            { b: 'HR', t: '강점 기반 채용/배치', d: '구성원의 성격 유형에 따른 직무 적합성을 분석하여 최적의 팀을 구성합니다.', i: 'fas fa-briefcase' },
            { b: 'Comm', t: '조직 소통/갈등 해결', d: '성격 유형별 의사소통 방식을 이해하여 갈등을 줄이고 협업을 증진합니다.', i: 'fas fa-handshake' },
            { b: 'Team', t: '팀 시너지 워크숍', d: '서로의 다름을 시너지로 바꾸는 체험형 팀빌딩 프로그램입니다.', i: 'fas fa-layer-group' }
          ]
        },
        training: {
          title: '에니어그램 전문가 양성',
          desc: '에니어그램의 지혜를 깊이 있게 배우고, 타인을 돕는 전문가로 성장하는 과정입니다.',
          cards: [
            { b: 'Certification', t: '전문 강사 양성반', d: '에니어그램 이론과 실제, 강의 스킬을 습득하는 8주 전문가 과정입니다.', i: 'fas fa-chalkboard' },
            { b: 'Study', t: '심화 스터디 그룹', d: '유형별 심층 탐구 및 임상 사례 연구를 소그룹으로 진행합니다.', i: 'fas fa-book-reader' },
            { b: 'Practicum', t: '인턴십 과정', d: '실제 상담 사례에 대한 수퍼비전과 전문가의 피드백을 받습니다.', i: 'fas fa-user-md' }
          ]
        }
      }
    },

    about: {
      steps: [
        { title: '1. 신청 및 접수', desc: '현재 상황과 니즈를 파악합니다.' },
        { title: '2. 사전 인터뷰', desc: '코치와 상담을 통해 방향을 설정합니다.' },
        { title: '3. 코칭/강의', desc: '맞춤형 커리큘럼으로 진행됩니다.' }
      ],
      ctaExpert: '전문가 상담 신청하기'
    },

    community: {
      label: '함께한 이야기',
      title: '사역의 변화와 방향',
      desc: 'ER이 어떤 자리들을 섬기고 있으며, 어떤 변화의 방향을 꾸준히 만들어 가는지 지표 중심으로 정리했습니다.',
      stats: [['300명+', '지금까지 연결된 참여자'], ['350회+', '누적 상담·코칭 세션'], ['10곳', '협력 교회·기관'], ['20명+', '훈련·교육 참여자']],
      chartTitle: '은혜가 흘러간 자리',
      chartDesc: '상담과 교육 요청이 집중되는 주요 영역을 기준으로 사역의 우선순위와 협력 방향을 조정합니다.',
      impactLabel: '사역의 방향',
      impactTitle: '반복적으로 나타난 변화의 방향',
      howWeOperate: '이 사역을 운영하는 방식',
      operateItems: [
        ['협력 기반의 사역', '교회와 기관, 코치와 협력자와 함께 사역의 구조를 세워 갑니다.'],
        ['사역지원 후원', '후원금은 목회자·선교사를 위한 무료 코칭 트랙을 유지하는 데 우선 사용됩니다.'],
        ['빠른 해결보다 형성', '단기 해결보다 지속 가능한 회복과 형성의 과정을 중요하게 여깁니다.'],
        ['신뢰와 투명성', '사역의 목적과 운영 방향, 참여 경로를 공개적으로 설명하는 사이트를 지향합니다.']
      ]
    },

    support: {
      label: '후원하기',
      title: '목회자·선교사의 회복 코칭을 함께 후원해 주세요',
      desc: 'ER의 개인·가정·기업 코칭은 유료 서비스로 운영됩니다. 그러나 목회자와 선교사에게는 무료로 회복 코칭을 제공합니다. 여러분의 후원이 이 무료 사역지원 트랙을 지속할 수 있게 합니다.',
      stats: [['300명+', '지금까지 섬긴 인원'], ['350회+', '누적 세션 수'], ['10곳', '협력 교회·기관'], ['7명', '함께하는 코치'], ['20명+', '훈련 참가자']],
      howToGive: '함께 마음을 보내는 방법',
      howToGiveItems: [
        ['후원 문의', '프로그램 운영과 자료 개발, 필요한 참여자 연결을 위한 후원 안내를 개별적으로 드립니다.'],
        ['교회·기관 협력', '회복 프로그램과 워크숍, 훈련 과정을 함께 기획하고 운영할 수 있습니다.'],
        ['기도와 소개', '도움이 필요한 개인과 공동체를 연결하고 사역 소식을 함께 나누는 방식으로 동참할 수 있습니다.']
      ],
      whereUsed: '후원이 사용되는 곳',
      whereUsedItems: [
        '1. 목회자와 선교사, 그리고 회복이 시급한 분들의 접근성을 지키는 데 사용됩니다.',
        '2. 상담과 교육, 훈련 프로그램이 더 정성스럽게 이어지도록 돕습니다.',
        '3. 협력 공동체와 코치 훈련 네트워크가 넓어지도록 뒷받침합니다.'
      ],
      whereUsedNote: '현재 후원은 온라인 결제가 아닌 개별 안내 방식으로 진행됩니다.',
      ctaSupport: '후원·협력 신청하기',
      principlesTitle: '후원 운영 원칙',
      principles: [
        '후원금은 목회자·선교사 무료 코칭 트랙에 우선 사용됩니다.',
        '일반 개인·가정·기업 서비스는 유료로 운영됩니다.',
        '협력 파트너십과 공동 프로그램은 현장에 맞게 개별 설계합니다.'
      ]
    },

    apply: {
      title: '상담 신청하기',
      titleSupport: '후원·협력 신청하기',
      desc: '상담과 프로그램 참여를 원하시면 신청 내용을 남겨주세요.',
      descSupport: '후원, 파트너십, 교회·기관 협력을 원하시면 신청 내용을 남겨주세요.',
      testBannerTitle: '약식 테스트 후 이어지는 이야기',
      testBannerDesc: '정식 타이핑 세션(무료)으로 더 깊은 자기 이해와 관계 이해를 함께 살펴봅니다.',
      supportBannerTitle: '후원·협력 전용 창구',
      supportBannerDesc: '후원 문의, 교회·기관 파트너십, 공동 프로그램 협력 요청을 이곳에 남겨주세요. 현재 후원은 개별 안내로 진행됩니다.',
      nameLabel: '이름',
      namePlaceholder: '성함을 남겨주세요',
      contactLabel: '연락받으실 곳',
      contactPlaceholder: '010-0000-0000 또는 이메일',
      categoryLabel: '어떤 마음으로 찾아오셨나요?',
      messageLabel: '나누고 싶은 이야기',
      messagePlaceholder: '지금의 고민이나 바라는 도움을 편하게 적어주세요.',
      securityNote: '보안 확인',
      infoNote: 'ER의 개인·가정·기업 코칭은 유료 서비스입니다. 목회자·선교사를 위한 무료 사역지원 트랙은 별도 심사 후 안내드립니다. 접수 후 24시간 이내에 담당 코치가 연락드립니다.',
      submitBtn: '신청하기',
      categoryOptions: ['개인/가정 코칭 (부부, 자녀)', '교회/사역자 회복 프로그램', '비즈니스/조직 워크숍', '강사 양성 과정', '기타 문의'],
      categoryOptionsSupport: ['후원 문의', '교회/기관 협력 문의', '공동 프로그램 제안', '기타 협력 문의'],
      optionTyping: '정식 타이핑 세션 (무료)'
    },

    thankyou: {
      title: '소중한 이야기를 잘 받았습니다',
      desc: '마음을 나누어 주셔서 감사합니다.\n남겨주신 연락처로 곧 정성껏 연락드리겠습니다.'
    },

    mypage: {
      loginPrompt: '로그인 후 마이페이지를 확인할 수 있습니다.',
      title: 'My Page',
      authenticated: '인증된 계정으로 로그인되어 있습니다.',
      coachPortal: 'Coach Portal',
      coachApp: 'Coach App'
    },
    coach: {
      accessDenied: '접근 권한이 없습니다',
      coachOnly: '코치 계정만 접근할 수 있습니다.',
      loginRequired: '로그인 후 코치 포털을 사용할 수 있습니다.',
      headCoachOnly: '헤드 코치만 코치 승인 기능을 사용할 수 있습니다.',
      dashboardTitle: '코치 전용 대시보드',
      approveBtn: '코치 승인',
      reports: '보고서 관리',
      notes: '세션 노트',
      materials: '자료실',
      schedule: '주간 일정',
      calendarTitle: '월간 일정 캘린더',
      recentReports: '최근 보고서',
      thisWeekSchedule: '이번 주 일정',
      recentNotes: '최근 세션 노트'
    },

    privacy: {
      label: 'Privacy',
      title: '개인정보를 다루는 마음',
      desc: '공개 사이트의 신청과 로그인 과정에서 받은 정보를 어떤 태도로 다루는지 차분히 안내합니다.',
      items: [
        'ER은 신청서, 로그인, 문의 과정에서 이름, 연락처, 이메일, 제출 메시지와 같은 최소한의 정보를 받습니다.',
        '받은 정보는 상담 안내, 협력 응답, 운영상 필요한 계정 확인 목적에만 사용합니다.',
        '법적 보관 의무가 없는 한, 운영 목적이 끝난 정보는 정리 대상이 됩니다. 더 자세한 정책은 추후 별도 문서로 정리할 예정입니다.'
      ]
    },
    terms: {
      label: 'Terms',
      title: '이곳을 이용하는 기본 안내',
      desc: '공개 사이트와 운영 포털을 이용하실 때 알아두시면 좋은 기본 원칙을 짧게 정리했습니다.'
    },

    resources: { label: '자료실', noticesTitle: '공지·소식', typesGuideTitle: '유형 가이드' },

    coaches: {
      label: 'ER 대표 소개',
      title: '회복의 여정을 함께하는 대표와 협력자를 소개합니다',
      desc: '에니어그램과 기독교 세계관을 통합적으로 적용해 개인·가정·공동체의 회복을 함께 걸어갑니다.',
      ministryBadge: '사역지원 전담',
      ministryDesc: '목회자·선교사 무료 코칭 트랙을 담당합니다.',
      ctaApply: '상담 신청하기',
      ctaMinistry: '사역지원 신청하기',
      certLabel: '자격',
      specialtyLabel: '전문 분야',
      list: [
        {
          id: 'coach-son',
          name: '손지영 대표',
          role: '대표 · Founder',
          photo: 'son-profile-picture.png',
          bio: '손지영 대표는 오랫동안 중동 선교와 캠퍼스 사역 현장에서 목회자·선교사와 공동체를 섬겨 왔으며, 두 자녀를 양육하는 엄마로서 가정의 실제 고민을 함께 다룹니다. ER 소개에 담긴 비전처럼 에니어그램과 기독교 세계관을 통합적으로 적용해 개인과 공동체의 회복을 돕고 있습니다.',
          specialties: ['개인 자기 이해 코칭', '부부·가정 회복', '사역자·선교사 돌봄', '에니어그램 강사 양성'],
          certs: ['Enneagram Spectrum Advanced Certification', 'IEA Accredited Instructor', 'SOIM GLTC Instructor', 'DTS Counseling'],
          ministry: true,
          locations: 'Korea · USA'
        }
      ]
    },
    notices: { allNotices: '전체 공지', backToList: '목록으로' },

    adaptiveUi: {
      ko: {
        title: '적응형 에니어그램 심층 진단',
        subtitle: '행동(열매)의 이면에 숨겨진 근원적 동기(뿌리)를 탐색합니다.<br>1차 응답을 분석하여 유력한 후보 유형을 좁히고, <span class="font-bold text-[#bfa68a]">맞춤형 심층 질문</span>을 통해 진짜 나를 찾아갑니다.',
        step1: '1단계: 기초 성향 및 하위 본능 파악',
        phase1Title: '1부: 일상적 태도 및 관계 패턴',
        phase1Desc: '극단적인 상황이 아닌, 편안한 상태에서의 본인 모습을 떠올리며 평가해 주세요.',
        required: '모든 문항에 빠짐없이 응답해 주십시오.',
        next: '분석 및 2단계 진입',
        phase2Title: '1차 알고리즘 분석 완료',
        phase2Desc: '회원님의 1차 응답을 바탕으로 <strong>유력한 후보 유형들</strong>이 도출되었습니다.<br>이 유형들을 최종적으로 구별하기 위한 심층 동기 질문을 드립니다.',
        submit: '최종 결과 확인하기',
        report: '분석 리포트',
        lowConf: '현재 결과는 <strong>1순위/2순위가 매우 근접</strong>한 상태입니다. 더 정확한 확인을 원하시면 아래의 <strong>무료 1:1 타이핑 세션</strong>에서 함께 정리해 드릴게요.',
        cta: '전문가 1:1 타이핑 세션 신청하기',
        restart: '처음부터 다시하기',
        notAtAll: '전혀 아니다',
        very: '매우 그렇다',
        core: 'Core Type',
        wing: 'Wing',
        arrows: 'Stress & Growth',
        instinctsPrefix: '제 1본능: ',
        tieArrows: '코어 유형 확정 후 확인 가능합니다.',
        growthDir: '통합(건강) 방향',
        stressDir: '비통합(스트레스) 방향',
        forcedA: 'A 선택',
        forcedB: 'B 선택',
        top3Title: '상위 3유형 확률 및 근거',
        top3Evidence: '근거 문항',
        top3Percent: '추정 확률'
      },
      en: {
        title: 'Adaptive Enneagram Typing Assessment',
        subtitle: 'This assessment explores the core motivations beneath your observable behavior.<br>Using your first-round responses, it narrows likely type candidates and applies <span class="font-bold text-[#bfa68a]">targeted follow-up questions</span> for a more precise typing result.',
        step1: 'Step 1: Baseline Pattern & Instinct',
        phase1Title: 'Part 1: Everyday Relational and Behavioral Patterns',
        phase1Desc: 'Please answer based on your usual, settled state rather than unusually stressful situations.',
        required: 'Please answer every question before continuing.',
        next: 'Analyze and Continue to Step 2',
        phase2Title: 'Phase 1 Analysis Complete',
        phase2Desc: 'Based on your first-round responses, we identified <strong>top candidate types</strong>.<br>Next, we use deeper motivation items to differentiate them more accurately.',
        submit: 'View Final Result',
        report: 'Analysis Summary',
        lowConf: 'Your top two types are currently very close. If you want a clearer result, join a free 1:1 typing session and we will clarify it together.',
        cta: 'Book a Free 1:1 Typing Session',
        restart: 'Start Over',
        notAtAll: 'Not at all',
        very: 'Very true',
        core: 'Core Type',
        wing: 'Wing',
        arrows: 'Stress & Growth',
        instinctsPrefix: 'Primary instinct: ',
        tieArrows: 'Available once core type is clarified.',
        growthDir: 'Growth direction',
        stressDir: 'Stress direction',
        forcedA: 'Choose A',
        forcedB: 'Choose B',
        top3Title: 'Top 3 Type Probabilities & Evidence',
        top3Evidence: 'Evidence items',
        top3Percent: 'Estimated probability'
      }
    }
  };

  if (typeof window !== 'undefined') {
    window.ER_STRINGS = S;
  }
})();

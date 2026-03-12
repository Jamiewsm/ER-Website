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
                published_at: ''
            },
            coachAdminUsers: [],
            coachCalendarMonth: null,
            coachListCounts: {
                tasks: 0,
                materials: 0,
                notes: 0
            },
            programFilter: 'individual',
            latestTestResult: null
        };
        window.state = state;

        const ER = typeof window !== 'undefined' && window.ER_STRINGS ? window.ER_STRINGS : {};
        const contentData = {
            stats: {
                labels: (ER.contentData && ER.contentData.stats && ER.contentData.stats.labels) ? ER.contentData.stats.labels.slice() : ['개인/가정', '목회자', '기업/조직', '강사양성', '청소년'],
                data: [45, 25, 15, 10, 5],
            },
            types: {
                labels: (ER.contentData && ER.contentData.types && ER.contentData.types.labels) ? ER.contentData.types.labels.slice() : ['1번 올바른 사람', '2번 아낌없이 주는 사람', '3번 효율적인 사람', '4번 독창적인 사람', '5번 지혜로운 사람', '6번 충실한 사람', '7번 열정적인 사람', '8번 강한 사람', '9번 조화로운 사람'],
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
            published_at: item.date || ''
        }));

        

        const publicTestimonials = (ER.publicTestimonials) ? ER.publicTestimonials : { impactThemes: [], stories: [] };

        // Adaptive Test State/Data
        let adaptivePhase1Responses = {};
        let adaptiveTopCandidates = [];
        let adaptivePhase2QuestionsData = [];
        let adaptiveTieBreakerMeta = { enabled: false, weight: 0, margin: null };
        let adaptiveTieBreaker31Meta = { enabled: false, weight: 0, margin: null };
        let adaptiveTieBreaker3SXMeta = { enabled: false, weight: 0, margin: null };
        let adaptiveTieBreaker71Meta = { enabled: false, weight: 0, margin: null };
        let adaptiveTieBreaker78Meta = { enabled: false, weight: 0, margin: null };
        let adaptiveTieBreaker7WingMeta = { enabled: false, weight: 0, margin: null };
        let adaptiveLang = 'ko';
        const adaptiveArrowLines = {
            1: { stress: 4, growth: 7 },
            2: { stress: 8, growth: 4 },
            3: { stress: 9, growth: 6 },
            4: { stress: 2, growth: 1 },
            5: { stress: 7, growth: 8 },
            6: { stress: 3, growth: 9 },
            7: { stress: 1, growth: 5 },
            8: { stress: 5, growth: 2 },
            9: { stress: 6, growth: 3 }
        };

        const adaptivePhase1Questions = [
            { id: 't2', type: 2, q: "관계가 어색해지거나 평가받는 느낌이 들면, 나는 내 진짜 감정보다 상대가 원하는 모습으로 조율하고, 그 대가로 내 욕구가 뒤로 밀린다." },
            { id: 't5', type: 5, q: "불확실한 상황에서 나는 먼저 머릿속 시뮬레이션과 정보 정리에 들어가고, 그 대가로 즉각적인 참여와 감정 교류가 줄어든다." },
            { id: 't8', type: 8, q: "통제당하거나 밀린다고 느끼면 나는 즉시 경계선을 세우고 주도권을 잡으려 하며, 그 대가로 관계 긴장이 커질 때가 있다." },
            { id: 'c1', type: 1, q: "무언가가 어긋나 보이면 나는 바로잡아야 마음이 놓이고, 그 대가로 나와 타인 모두에게 엄격해질 때가 있다." },
            { id: 'c2', type: 2, q: "관계가 멀어질까 불안할 때 나는 먼저 돕고 챙기며 연결을 붙잡고, 그 대가로 서운함을 표현하지 못하고 쌓아두곤 한다." },
            { id: 'c3', type: 3, q: "가치가 흔들릴 때 나는 성과와 이미지 최적화로 신뢰를 확보하려 하고, 그 대가로 감정·피로 신호를 무시할 때가 있다." },
            { id: 'c4', type: 4, q: "비슷해 보이거나 평범해질 때 나는 나만의 의미와 감정 깊이를 더 찾고, 그 대가로 현재의 만족이 늦어진다." },
            { id: 'c5', type: 5, q: "요구가 많아지면 나는 거리를 두고 에너지를 보존하며, 그 대가로 관계가 차갑게 느껴질 수 있다." },
            { id: 'c6', type: 6, q: "위험 신호를 느끼면 나는 확인·재확인과 대안 시나리오를 늘리고, 그 대가로 결정 속도가 느려질 때가 있다." },
            { id: 'c7', type: 7, q: "답답함이나 불편한 감정이 올라오면 나는 가능한 선택지를 늘리고 분위기를 전환하며, 그 대가로 어려운 감정 직면이 미뤄진다." },
            { id: 'c8', type: 8, q: "힘의 불균형을 감지하면 나는 정면으로 개입해 판을 주도하려 하고, 그 대가로 타인이 압박을 느끼기도 한다." },
            { id: 'c9', type: 9, q: "갈등 조짐이 보이면 나는 평화를 위해 내 우선순위를 뒤로 미루고, 그 대가로 중요한 결정을 지연시킬 때가 있다." },
            { id: 'f_2_3', format: 'ab', leftType: 2, rightType: 3, weight: 2.2, q: "압박 상황에서 더 자동으로 나오는 쪽을 고르세요.", a: "A. 먼저 상대를 챙겨 관계를 붙잡는다.", b: "B. 먼저 성과와 유능함을 증명한다." },
            { id: 'f_3_6', format: 'ab', leftType: 3, rightType: 6, weight: 2.2, q: "불안할 때 더 자동으로 나오는 쪽을 고르세요.", a: "A. 결과를 내서 인정받는 쪽으로 몰입한다.", b: "B. 리스크를 점검하고 대비를 강화한다." },
            { id: 'f_6_8', format: 'ab', leftType: 6, rightType: 8, weight: 2.2, q: "위협을 느낄 때 더 자동으로 나오는 쪽을 고르세요.", a: "A. 확인·협의·안전장치부터 만든다.", b: "B. 바로 개입해 힘의 균형을 바꾼다." },
            { id: 'f_1_9', format: 'ab', leftType: 1, rightType: 9, weight: 2.2, q: "갈등 직전 더 자동으로 나오는 쪽을 고르세요.", a: "A. 기준을 분명히 하고 바로잡는다.", b: "B. 마찰을 줄이고 흐름을 유지한다." },
            { id: 'f_5_7', format: 'ab', leftType: 5, rightType: 7, weight: 2.2, q: "에너지가 떨어질 때 더 자동으로 나오는 쪽을 고르세요.", a: "A. 물러나 분석하고 최소 반응한다.", b: "B. 전환점과 새로운 자극을 찾는다." },
            { id: 'f_2_8', format: 'ab', leftType: 2, rightType: 8, weight: 2.2, q: "관계가 흔들릴 때 더 자동으로 나오는 쪽을 고르세요.", a: "A. 더 도우며 연결을 붙잡는다.", b: "B. 선을 긋고 주도권을 회수한다." },
            { id: 'state_2w', q: "최근 2주 기준으로, 내 일상은 전반적으로 얼마나 압박/스트레스 상태였나요? (1=매우 안정, 5=매우 높은 압박)" },
            { id: 'i_sp_1', inst: 'sp', q: "나는 안전, 재정, 생활 리듬(수면/식사/체력)을 먼저 정비해야 관계와 일이 안정된다고 느낀다." },
            { id: 'i_sp_2', inst: 'sp', q: "시간·돈·에너지 낭비가 생기면 마음이 크게 흔들리고, 효율 회복이 우선순위가 된다." },
            { id: 'i_sx_1', inst: 'sx', q: "넓은 네트워킹보다 강한 1:1 몰입 관계나 대상이 있을 때 삶의 에너지가 급격히 올라간다." },
            { id: 'i_sx_2', inst: 'sx', q: "중요하다고 느낀 대상에는 단기간에 강하게 몰입하고, 강도 높은 연결을 원한다." },
            { id: 'i_so_1', inst: 'so', q: "집단 안에서 영향력 구조, 역할, 소속의 위치를 빠르게 읽고 그 흐름에 맞춰 움직인다." },
            { id: 'i_so_2', inst: 'so', q: "개인 만족보다 공동체 기여·평판·역할의 지속성이 더 중요하다고 느낄 때가 많다." }
        ];

        const adaptiveDeepMotivations = {
            1: [
                { id: 'd1_1', type: 1, q: "무언가를 할 때 '이것이 최선인가? 더 제대로 해야 하지 않나?'라며 스스로의 행동을 점검하고 기준을 맞추려는 내면의 목소리가 자주 들리는 편이다." },
                { id: 'd1_2', type: 1, q: "나는 속으로 '이건 이렇게 해야 해'라는 정답을 정해놓고, 나 자신이나 타인이 그 기준에 미치지 못할 때 자주 답답함을 느낀다." }
            ],
            2: [
                { id: 'd2_1', type: 2, q: "관계 불안을 느끼면 나는 먼저 도움·배려를 제공해 유대를 묶으려 하고, 그 대가로 거절·요청을 직접 말하지 못하는 편이다." },
                { id: 'd2_2', type: 2, q: "상대 필요를 읽는 속도는 빠르지만, 내 필요를 분명히 말하는 순간 미묘한 수치심이나 미안함이 올라온다." }
            ],
            3: [
                { id: 'd3_1', type: 3, q: "압박이 오면 나는 즉시 목표·성과 지표 중심으로 재정렬하고, 그 대가로 내 감정 상태나 관계 피로를 뒤로 미루는 편이다." },
                { id: 'd3_2', type: 3, q: "나는 존재 자체보다 '유능한 결과물'로 평가받을 때 안전하다고 느끼며, 효율과 이미지 관리를 자동으로 최적화한다." }
            ],
            4: [
                { id: 'd4_1', type: 4, q: "사람들에게 온전히 이해받지 못한다는 묘한 소외감을 종종 느끼며, 나의 슬픔이나 결핍마저도 나만의 특별함이라고 여기는 경향이 있다." },
                { id: 'd4_2', type: 4, q: "무미건조하고 평범한 일상보다는, 감정이 깊이 요동치고 의미가 담긴 상황에서 비로소 내가 살아있음을 강하게 느끼곤 한다." }
            ],
            5: [
                { id: 'd5_1', type: 5, q: "나는 세상이나 사람들과 직접 부딪히기보다, 한 발짝 떨어져서 적당한 거리를 두고 관찰자 모드로 있을 때 가장 안전하다고 느낀다." },
                { id: 'd5_2', type: 5, q: "누군가 나에게 갑작스러운 감정적 반응을 요구하거나 내 지적 영역을 침범하면, 무의식적으로 에너지를 차단하고 물러서게 된다." }
            ],
            6: [
                { id: 'd6_1', type: 6, q: "애매함이 커질수록 나는 위험 시나리오를 늘려 점검하고, 그 대가로 확신 전까지 행동이 늦어질 때가 있다." },
                { id: 'd6_2', type: 6, q: "권위를 따르며 안전을 얻고 싶지만, 동시에 허점을 찾기 위해 질문·검증을 반복하는 이중 반응이 있다." }
            ],
            7: [
                { id: 'd7_1', type: 7, q: "부정적인 감정이나 복잡하고 불편한 현실에 직면하는 것이 피곤하게 느껴져서, 나도 모르게 분위기를 환기하거나 흥미로운 다른 일들로 주의를 돌리려는 패턴이 있다." },
                { id: 'd7_2', type: 7, q: "어떤 한 가지에 얽매이거나 제한당하는 것을 꽤 답답해하며, 항상 다양한 가능성과 선택지를 열어두어야 마음이 편하다." }
            ],
            8: [
                { id: 'd8_1', type: 8, q: "힘의 역학에서 밀린다고 느끼면 나는 즉시 압력을 올리거나 판을 재구성하며, 그 대가로 충돌 강도가 높아질 수 있다." },
                { id: 'd8_2', type: 8, q: "내가 원하는 것은 호감 자체보다 약해 보이지 않는 존중과 영향력이며, 필요시 직접적 표현을 주저하지 않는다." }
            ],
            9: [
                { id: 'd9_1', type: 9, q: "나는 나와 타인, 혹은 환경과의 '연결감'이 끊어지는 것을 두려워하며, 내 안의 평화를 유지하기 위해 종종 내 진짜 분노나 욕구를 억누르곤 한다." },
                { id: 'd9_2', type: 9, q: "중요한 갈등 상황이나 결정을 마주할 때, 직면하는 스트레스를 피하기 위해 덜 중요한 사소한 일들에 몰두하며 에너지를 분산시키는 패턴이 있다." }
            ]
        };

        const adaptiveTieBreaker36 = [
            { id: 'tb_3_6_1', type: 3, q: "내가 유능하게 일을 처리하고 성과를 내는 것은, 궁극적으로 '사람들의 인정과 사랑받을 만한 존재가 되기 위함'에 더 가깝다." },
            { id: 'tb_3_6_2', type: 6, q: "내가 열심히 일하고 대비하는 것은, 궁극적으로 '예측 불가능한 상황에서 나를 보호하고 안전한 지지 기반을 확보하기 위함'에 더 가깝다." }
        ];
        const adaptiveTieBreaker31 = [
            { id: 'tb_3_1_1', type: 3, q: "내가 목표를 성취하려는 가장 큰 이유는, 결과를 통해 나의 유능함과 가치를 인정받기 위해서인 경우가 많다." },
            { id: 'tb_3_1_2', type: 1, q: "내가 목표를 끝까지 밀어붙이는 가장 큰 이유는, 올바른 기준에 맞게 바로잡고 완성해야 마음이 편해지기 때문이다." }
        ];
        const adaptiveTieBreaker3SX = [
            { id: 'tb_3_sx_1', type: 3, q: "내가 기어코 목표를 달성하려는 가장 큰 이유는, 그것을 해냈을 때 사람들에게 가치 있는 사람으로 인정받고 나의 유능함을 증명할 수 있기 때문이다." },
            { id: 'tb_3_sx_2', q: "내가 무언가에 무섭게 몰두하여 끝을 보려는 가장 큰 이유는, 타인의 인정보다는 그 과정에서 느끼는 강렬한 몰입감과 성취해냈다는 내적 쾌감이 더 크기 때문이다." }
        ];
        const adaptiveTieBreaker71 = [
            { id: 'tb_7_1_1', type: 7, q: "압박이 커질수록 나는 기준을 강화하기보다, 선택지를 넓히고 가능성을 찾아 숨통을 트는 쪽이 더 자동적이다." },
            { id: 'tb_7_1_2', type: 1, q: "압박이 커질수록 나는 가능성 확장보다, 기준을 세우고 오류를 바로잡는 쪽이 더 자동적이다." }
        ];
        const adaptiveTieBreaker78 = [
            { id: 'tb_7_8_1', type: 7, q: "나는 '막힘을 뚫는 방식'으로 전환·아이디어·속도(7)를 더 자주 사용한다." },
            { id: 'tb_7_8_2', type: 8, q: "나는 '막힘을 뚫는 방식'으로 힘의 재배치·직접 개입·주도권 회수(8)를 더 자주 사용한다." }
        ];
        const adaptiveTieBreaker7Wing = [
            { id: 'tb_7w_1', wing: 6, q: "7번 패턴일 때, 나는 현실 리스크 점검·안전장치·신뢰 가능한 구조(7w6)에 더 끌린다." },
            { id: 'tb_7w_2', wing: 8, q: "7번 패턴일 때, 나는 독립성·강한 추진·직접 압박 돌파(7w8)에 더 끌린다." }
        ];

        const adaptiveQuestionEn = {
            t2: "When I feel evaluated in relationships, I adjust to how I want to be seen, and my own needs get pushed to the background.",
            t5: "In uncertain situations, I go into analysis first, and immediate emotional engagement tends to drop.",
            t8: "When I feel controlled or overpowered, I quickly draw a line and move to regain control, even if tension rises.",
            c1: "When something feels off, I feel driven to fix it and get it right, and I can become strict with myself and others.",
            c2: "When connection feels shaky, I tend to secure the bond by helping first, while my own needs stay unspoken.",
            c3: "When my sense of worth feels threatened, I shift into performance and image mode to restore credibility.",
            c4: "When life feels too ordinary, I look for emotional depth and personal meaning, even if it delays contentment.",
            c5: "When demands pile up, I pull back to conserve energy, and that distance can make me seem emotionally unavailable.",
            c6: "When risk is in the air, I double-check assumptions and run contingency scenarios, which can slow decisions.",
            c7: "When discomfort rises, I instinctively open up options and pivot toward possibility, often delaying direct emotional contact.",
            c8: "When I sense a power imbalance, I step in directly to reset control, even if the intensity escalates.",
            c9: "When conflict starts building, I tend to prioritize peace over preference and postpone hard decisions.",
            f_2_3: "Under pressure, which pattern shows up first for you?",
            f_3_6: "When anxiety rises, which pattern comes online first?",
            f_6_8: "When you feel threatened, which response is more automatic?",
            f_1_9: "Right before conflict, which response tends to come first?",
            f_5_7: "When your energy is low, which recovery pattern appears first?",
            f_2_8: "When a relationship feels unstable, which reaction is more automatic?",
            state_2w: "Over the last two weeks, how much pressure or stress have you been under overall? (1 = very stable, 5 = very high pressure)",
            i_sp_1: "I feel most stable when basics like safety, money, sleep, and physical rhythm are in order.",
            i_sp_2: "Waste of time, money, or energy unsettles me quickly, and restoring order becomes urgent.",
            i_sx_1: "A deep one-on-one bond energizes me more than broad social connection.",
            i_sx_2: "When something matters to me, I lock in with strong intensity and focus.",
            i_so_1: "In groups, I quickly track status, role, and influence dynamics.",
            i_so_2: "Contribution, role continuity, and belonging often matter more to me than private comfort.",
            d1_1: "I often hear an inner pressure asking, “Is this the best version? Can this be done more correctly?”",
            d1_2: "I carry a strong internal standard, and I feel tension when I or others fall short of it.",
            d2_1: "When relational anxiety rises, I secure attachment by giving first, while delaying direct requests for what I need.",
            d2_2: "I read others' needs quickly, but naming my own can trigger subtle shame or guilt.",
            d3_1: "Under pressure, I reorganize around goals and measurable outcomes, often sidelining emotional signals.",
            d3_2: "I feel safer being valued for visible competence than for simply being who I am.",
            d4_1: "I often feel fundamentally misunderstood, and even painful emotions can feel tied to my identity.",
            d4_2: "I feel most alive in emotionally meaningful moments, not in flat, routine flow.",
            d5_1: "I feel safest when I can step back, observe, and understand before engaging.",
            d5_2: "When emotional demands are sudden or intrusive, I instinctively withdraw to protect my energy.",
            d6_1: "As ambiguity increases, I expand risk checks and verification, which can delay action.",
            d6_2: "I seek safety through systems and authority while also testing them for hidden weakness.",
            d7_1: "When reality feels heavy, I move toward reframing, options, and lighter momentum.",
            d7_2: "Too much limitation feels suffocating; I relax when multiple paths remain open.",
            d8_1: "When I feel overpowered, I increase pressure and move to reclaim control, even at relational cost.",
            d8_2: "What I need most is not approval but respect for my impact, boundaries, and agency.",
            d9_1: "To preserve peace and connection, I can mute my real anger or desires without fully noticing.",
            d9_2: "At major conflict or decision points, I may diffuse tension by shifting into less urgent tasks.",
            tb_3_6_1: "When I push for performance, the core motive is proving competence and securing recognition.",
            tb_3_6_2: "When I push for preparation, the core motive is building safety and a reliable base.",
            tb_3_1_1: "My strongest achievement drive is usually about proving value through results.",
            tb_3_1_2: "My strongest achievement drive is usually about getting things right by principle.",
            tb_3_sx_1: "When I push to achieve, the core motive is to be seen as competent and valuable.",
            tb_3_sx_2: "When I push intensely, the deeper reward is immersion and internal charge more than recognition.",
            tb_7_1_1: "Under pressure, I more often expand options and chase possibility.",
            tb_7_1_2: "Under pressure, I more often tighten standards and correct what is wrong.",
            tb_7_8_1: "When blocked, I break through by reframing, alternatives, and momentum (7).",
            tb_7_8_2: "When blocked, I break through through direct force, confrontation, and control reset (8).",
            tb_7w_1: "In a 7 pattern, I lean toward risk checks, safety planning, and trusted structure (7w6).",
            tb_7w_2: "In a 7 pattern, I lean toward independence, assertive drive, and direct push-through (7w8).",
            f_2_3_a: "A. I first support the other person to preserve connection.",
            f_2_3_b: "B. I first prove competence through visible performance.",
            f_3_6_a: "A. I immerse in delivering results to secure recognition.",
            f_3_6_b: "B. I strengthen risk checks and safety preparation first.",
            f_6_8_a: "A. I start with verification, alignment, and safeguards.",
            f_6_8_b: "B. I intervene directly to reset the power balance.",
            f_1_9_a: "A. I clarify standards and correct what is off.",
            f_1_9_b: "B. I reduce friction and preserve relational flow.",
            f_5_7_a: "A. I step back, analyze, and minimize stimulation.",
            f_5_7_b: "B. I look for pivots and fresh stimulating options.",
            f_2_8_a: "A. I offer more care to hold the connection.",
            f_2_8_b: "B. I draw firmer boundaries and reclaim control."
        };

        const adaptiveUi = (ER.adaptiveUi && ER.adaptiveUi.ko && ER.adaptiveUi.en) ? ER.adaptiveUi : { ko: {}, en: {} };

        function adaptiveText(key) {
            return adaptiveUi[adaptiveLang][key];
        }

        function adaptiveQuestionText(item) {
            if (adaptiveLang === 'en' && adaptiveQuestionEn[item.id]) return adaptiveQuestionEn[item.id];
            return item.q;
        }

        function adaptiveOptionText(item, side) {
            const value = side === 'a' ? item.a : item.b;
            if (adaptiveLang === 'en') {
                const key = `${item.id}_${side}`;
                if (adaptiveQuestionEn[key]) return adaptiveQuestionEn[key];
            }
            return value;
        }

        function setAdaptiveTestLanguage(lang) {
            adaptiveLang = lang === 'en' ? 'en' : 'ko';
            renderSection('test');
        }
        if (typeof window !== 'undefined') window.setAdaptiveTestLanguage = setAdaptiveTestLanguage;

        // --- Core Functions ---
        function parseSectionHash() {
            const rawHash = window.location.hash.replace(/^#/, '').trim();
            if (!rawHash) return { sectionId: 'home', payload: null };

            const [rawSectionId, rawQuery = ''] = rawHash.split('?');
            const params = new URLSearchParams(rawQuery);
            const payload = {};
            params.forEach((value, key) => {
                payload[key] = value;
            });

            return {
                sectionId: rawSectionId || 'home',
                payload: Object.keys(payload).length ? payload : null
            };
        }

        function buildSectionHash(sectionId, payload = null) {
            const params = new URLSearchParams();
            if (payload && typeof payload === 'object') {
                Object.entries(payload).forEach(([key, value]) => {
                    if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
                });
            }
            const query = params.toString();
            return `#${sectionId || 'home'}${query ? `?${query}` : ''}`;
        }

        function syncSectionHash(sectionId, payload = null, replaceHash = false) {
            const nextHash = buildSectionHash(sectionId, payload);
            if (window.location.hash === nextHash) return;
            if (replaceHash) {
                history.replaceState(null, '', nextHash);
            } else {
                window.location.hash = nextHash;
            }
        }

        function renderSection(sectionId, payload = null, options = {}) {
            const { syncHash = true, replaceHash = false } = options;
            state.currentSection = sectionId;
            state.currentPayload = payload;
            const main = document.getElementById('main-content');
            
            // Close mobile menu
            document.getElementById('mobile-menu').classList.add('hidden');
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'auto' }); 

            let html = '';
            switch(sectionId) {
                case 'home': html = renderHome(); break;
                case 'about': html = renderAbout(); break;
                case 'programs': html = renderPrograms(); break;
                case 'community': html = renderCommunity(); break;
                case 'resources': html = renderResources(); break;
                case 'support': html = renderSupport(); break;
                case 'privacy': html = renderPrivacy(); break;
                case 'terms': html = renderTerms(); break;
                case 'test': html = renderTest(); break;
                case 'notices': html = renderNotices(); break;
                case 'notice_detail': html = renderNoticeDetail(payload); break;
                case 'types_guide': html = renderTypesGuide(); break; 
                case 'apply': html = renderApply(payload); break;
                case 'mypage': html = renderMyPage(); break;
                case 'coach_portal': html = renderCoachPortal(); break;
                case 'coach_admin': html = renderCoachAdmin(); break;
                case 'coach_tasks': html = renderCoachTasks(); break;
                case 'coach_materials': html = renderCoachMaterials(); break;
                case 'coach_schedule': html = renderCoachSchedule(); break;
                case 'coach_notes': html = renderCoachNotes(); break;
                case 'thankyou': html = renderThankYou(); break;
                default: html = renderHome();
            }

            main.innerHTML = html;
            if (syncHash) syncSectionHash(sectionId, payload, replaceHash);
            
            // Post-render actions
            if(sectionId === 'home') setTimeout(() => initCharts('home'), 100);
            if(sectionId === 'community') setTimeout(() => initCharts('community'), 100);
            if(sectionId === 'programs') updateProgramView(state.programFilter);
            if(sectionId === 'apply') setTimeout(() => initApplyTurnstile(), 0);
            if((sectionId === 'home' || sectionId === 'notices' || sectionId === 'notice_detail') && !state.noticesLoaded) {
                setTimeout(async () => {
                    await loadNotices();
                    if (state.currentSection === sectionId) {
                        renderSection(sectionId, payload, { syncHash: false });
                    }
                }, 0);
            }
            if(sectionId === 'coach_portal') setTimeout(() => loadCoachPortalDashboard(), 0);
            if(sectionId === 'coach_admin') setTimeout(() => loadCoachAdminUsers(), 0);
            if(sectionId === 'coach_tasks') setTimeout(() => loadCoachTasks(), 0);
            if(sectionId === 'coach_materials') setTimeout(() => loadCoachMaterials(), 0);
            if(sectionId === 'coach_schedule') setTimeout(() => loadCoachSchedules(), 0);
            if(sectionId === 'coach_notes') setTimeout(() => loadCoachNotes(), 0);
        }

        function toggleMobileMenu() {
            const menu = document.getElementById('mobile-menu');
            menu.classList.toggle('hidden');
        }

        // --- View Components (Renderers) ---

        // ✨ UPGRADED HOME DESIGN
        function renderHome() {
            return `
                <div class="bg-er-base">
                    <section class="relative overflow-hidden min-h-[88vh] flex flex-col justify-center">
                        <div class="absolute inset-0 bg-pattern z-0 pointer-events-none"></div>
                        <div class="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-er-accent/10 rounded-full blur-[100px] z-0 pointer-events-none animate-pulse"></div>
                        <div class="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-50/60 rounded-full blur-[80px] z-0 pointer-events-none"></div>

                        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-12 md:py-20">
                            <div class="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                                <div class="text-center lg:text-left animate-fade-in-up order-2 lg:order-1">
                                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 border border-er-accent/20 backdrop-blur-sm shadow-sm mb-6">
                                        <span class="w-2 h-2 rounded-full bg-er-accent animate-pulse"></span>
                                        <span class="text-[10px] md:text-xs font-bold tracking-widest uppercase text-er-primary">Non-profit Ministry</span>
                                    </div>

                                    <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight font-extrabold text-er-dark mb-6 leading-[1.12] break-keep">
                                        사람과 공동체의 회복을 돕습니다.
                                    </h1>

                                    <p class="mt-2 text-base md:text-lg text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto lg:mx-0 break-keep font-medium">
                                        ER은 기독교 세계관과 에니어그램을 통합적으로 이해하고 적용하여, 개인과 가정, 교회와 공동체가 하나님이 지으신 본래 모습을 다시 발견하고 건강한 관계와 소명을 회복하도록 돕습니다.
                                    </p>

                                    <div class="grid sm:grid-cols-3 gap-3 md:gap-4 max-w-3xl mx-auto lg:mx-0">
                                        <button onclick="renderSection('apply')" class="px-6 py-4 bg-er-dark text-white rounded-full font-bold shadow-lg shadow-er-dark/20 hover:bg-gray-800 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-2">
                                            상담 신청하기 <i class="fas fa-arrow-right text-xs opacity-70"></i>
                                        </button>
                                        <button onclick="renderSection('programs')" class="px-6 py-4 bg-white/90 backdrop-blur-sm text-er-dark border border-white/60 rounded-full font-bold shadow-sm hover:bg-white hover:border-er-accent/50 transition-all active:scale-95">
                                            프로그램 보기
                                        </button>
                                        <button onclick="renderSection('apply', { source: 'support' })" class="px-6 py-4 bg-er-accent text-white rounded-full font-bold shadow-sm hover:bg-er-accentDark transition-all active:scale-95">
                                            후원·협력 신청하기
                                        </button>
                                    </div>

                                    <div class="mt-10 md:mt-12 pt-6 border-t border-er-dark/5 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs md:text-sm text-gray-500 font-medium">
                                        <div class="flex items-center gap-2"><div class="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-[10px]"><i class="fas fa-check"></i></div> 사역 중심 운영 원칙</div>
                                        <div class="flex items-center gap-2"><div class="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-[10px]"><i class="fas fa-check"></i></div> 후원 여부와 무관한 참여 안내</div>
                                        <div class="flex items-center gap-2"><div class="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-[10px]"><i class="fas fa-check"></i></div> 협력 네트워크 기반 운영</div>
                                    </div>
                                </div>

                                <div class="relative order-1 lg:order-2 flex justify-center animate-fade-in mb-6 md:mb-0">
                                    <div class="relative w-full max-w-[380px] md:max-w-lg glass rounded-[2.5rem] p-6 md:p-8 shadow-card floating-card hover:shadow-glow duration-500">
                                        <div class="absolute -top-5 -left-4 md:-top-6 md:-left-8 bg-white p-3 md:p-4 rounded-2xl shadow-soft border border-white/60 flex items-center gap-3 animate-float z-20">
                                            <div class="w-10 h-10 md:w-12 md:h-12 bg-er-accent rounded-full flex items-center justify-center text-white font-bold text-lg shadow-inner">
                                                <i class="fas fa-chart-pie"></i>
                                            </div>
                                            <div class="text-left pr-2">
                                                <p class="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-wider">Restoration in Motion</p>
                                                <p class="text-sm md:text-base font-extrabold text-er-dark">개인 · 가정 · 교회 · 공동체</p>
                                            </div>
                                        </div>

                                        <div class="absolute top-4 right-4 flex gap-1.5">
                                            <div class="w-2 h-2 rounded-full bg-red-300/50"></div>
                                            <div class="w-2 h-2 rounded-full bg-yellow-300/50"></div>
                                            <div class="w-2 h-2 rounded-full bg-green-300/50"></div>
                                        </div>

                                        <div class="chart-container">
                                            <canvas id="heroChart"></canvas>
                                        </div>

                                        <div class="grid grid-cols-2 gap-3 mt-4">
                                            <div class="rounded-2xl bg-white/80 border border-white/70 px-4 py-3">
                                                <p class="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-1">Approach</p>
                                                <p class="text-sm font-semibold text-er-dark">삶 가까이 머무는 회복 코칭</p>
                                            </div>
                                            <div class="rounded-2xl bg-white/80 border border-white/70 px-4 py-3">
                                                <p class="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-1">Model</p>
                                                <p class="text-sm font-semibold text-er-dark">따뜻한 후원과 협력의 흐름</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="absolute inset-0 bg-gradient-to-tr from-er-accent/20 to-transparent rounded-full blur-3xl -z-10 transform scale-110"></div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section class="py-12 md:py-14 px-4 sm:px-6 lg:px-8 bg-white">
                        <div class="max-w-5xl mx-auto">
                            <div class="rounded-[2.25rem] bg-er-base/70 border border-white/40 shadow-soft p-8 md:p-10 text-center floating-card">
                                <span class="text-er-accent font-bold text-xs tracking-widest uppercase">Vision & Mission</span>
                                <h2 class="mt-4 text-2xl md:text-4xl font-bold text-er-dark break-keep">
                                    나의 Original Design을 알 때,<br class="hidden md:block">
                                    비로소 타인의 Original Design이 보입니다.
                                </h2>
                            </div>
                        </div>
                    </section>

                    <section class="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-white">
                        <div class="max-w-6xl mx-auto">
                            <div class="text-center mb-10">
                                <span class="text-er-accent font-bold text-xs tracking-widest uppercase">Who We Serve</span>
                                <p class="mt-4 text-sm md:text-base text-gray-500 max-w-2xl mx-auto break-keep">개인의 자기 이해에서 공동체의 관계 회복에 이르기까지, 각 현장에 맞는 회복의 여정을 함께 만들어 갑니다.</p>
                            </div>
                            <div class="grid gap-6 md:grid-cols-4">
                                ${[
                                    { title: '개인', body: '자기 이해, 감정 패턴, 소명 탐색을 돕습니다.' },
                                    { title: '가정', body: '부부와 부모-자녀 관계의 갈등을 풀고 회복을 돕습니다.' },
                                    { title: '교회', body: '사역자와 리더, 공동체의 소진과 갈등을 함께 다룹니다.' },
                                    { title: '협력 기관', body: '교육, 워크숍, 파트너십 프로그램으로 연결합니다.' }
                                ].map(item => `
                                    <div class="bg-white rounded-[2rem] p-6 border border-white/40 shadow-soft floating-card">
                                        <h3 class="text-lg font-bold text-er-dark mb-2">${item.title}</h3>
                                        <p class="text-sm text-gray-500 leading-relaxed break-keep">${item.body}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </section>

                    <section class="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-er-base">
                        <div class="max-w-6xl mx-auto">
                            <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
                                <div>
                                    <span class="text-er-accent font-bold text-xs tracking-widest uppercase">맞춤형 프로그램</span>
                                    <h2 class="text-2xl md:text-4xl font-bold text-er-dark mt-3 break-keep">맞춤형 프로그램</h2>
                                    <p class="mt-3 text-sm md:text-base text-gray-500 max-w-2xl break-keep">개인의 회복에서 공동체의 성장까지, 당신에게 가장 적합한 솔루션을 제안합니다.</p>
                                </div>
                                <button onclick="renderSection('programs')" class="inline-flex items-center justify-center gap-2 rounded-full border border-er-accent/30 bg-white px-5 py-3 text-sm font-bold text-er-dark hover:border-er-accent hover:bg-er-accentLight/40 transition-colors">
                                    프로그램 전체 보기 <i class="fas fa-arrow-right text-xs"></i>
                                </button>
                            </div>
                            <div class="grid gap-6 md:grid-cols-3">
                                ${[
                                    { tag: 'Care', title: '개인·가정 회복', body: '자기 이해, 부부 관계, 자녀 양육 등 일상과 관계의 회복을 돕습니다.' },
                                    { tag: 'Church', title: '교회·사역자 지원', body: '소진, 갈등, 리더십 회복을 위한 코칭과 워크숍을 제공합니다.' },
                                    { tag: 'Training', title: '교육·강사 양성', body: '에니어그램과 회복 관점을 실제 교육과 현장 적용으로 연결합니다.' }
                                ].map(item => `
                                    <div class="bg-white rounded-[2rem] p-7 border border-white/40 shadow-soft floating-card">
                                        <span class="inline-flex px-3 py-1 rounded-full bg-er-base text-er-accent text-[10px] font-bold uppercase tracking-[0.2em]">${item.tag}</span>
                                        <h3 class="text-xl font-bold text-er-dark mt-5 mb-3">${item.title}</h3>
                                        <p class="text-sm text-gray-500 leading-relaxed break-keep mb-6">${item.body}</p>
                                        <button onclick="renderSection('apply')" class="text-sm font-bold text-er-dark hover:text-er-accent transition-colors">문의 신청하기</button>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </section>

                    <section class="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-white">
                        <div class="max-w-6xl mx-auto">
                            <div class="text-center mb-10">
                                <span class="text-er-accent font-bold text-xs tracking-widest uppercase">함께한 이야기</span>
                                <h2 class="text-2xl md:text-4xl font-bold text-er-dark mt-3 break-keep">회복이 남긴 변화</h2>
                                <p class="mt-3 text-sm md:text-base text-gray-500 max-w-2xl mx-auto break-keep">사역이 어떤 자리로 흘러가고 있는지, 주요 지표와 방향을 한눈에 정리했습니다.</p>
                            </div>
                            <div class="grid gap-5 md:grid-cols-4 mb-8">
                                ${[
                                    ['45%', '개인·가정 지원 비중'],
                                    ['25%', '교회·사역자 지원 비중'],
                                    ['15%', '조직·협력 프로그램 비중'],
                                    ['10%', '강사 양성·교육 비중']
                                ].map(([value, label]) => `
                                    <div class="rounded-[2rem] border border-white/40 bg-er-base p-6 text-center shadow-soft floating-card">
                                        <p class="text-3xl md:text-4xl font-extrabold text-er-dark">${value}</p>
                                        <p class="mt-2 text-sm text-gray-500 break-keep">${label}</p>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                                <div class="bg-white/70 rounded-[2rem] p-6 md:p-8 shadow-soft floating-card">
                                    <h3 class="font-bold text-base text-gray-800 mb-6 flex items-center gap-2">
                                        <i class="fas fa-chart-pie text-er-accent"></i> 은혜가 흘러간 자리
                                    </h3>
                                    <p class="text-xs text-gray-500 mb-4 break-keep">상담과 교육 요청이 집중되는 주요 영역을 기준으로 사역 방향을 조정합니다.</p>
                                    <div class="chart-container h-64 md:h-72">
                                        <canvas id="impactChart"></canvas>
                                    </div>
                                </div>
                                <div class="bg-er-dark text-white rounded-[2rem] p-6 md:p-8 shadow-card floating-card">
                                    <span class="inline-flex px-3 py-1 rounded-full bg-white/10 text-[10px] font-bold uppercase tracking-[0.2em] text-er-accent">사역의 방향</span>
                                    <h3 class="text-2xl font-bold mt-5 mb-4 break-keep">반복적으로 나타난 변화의 방향</h3>
                                    <div class="space-y-4">
                                        ${publicTestimonials.impactThemes.map((item) => `
                                            <div class="rounded-2xl border border-white/10 bg-white/5 p-4 transition-all duration-300 hover:-translate-y-1">
                                                <div class="flex items-start gap-3">
                                                    <i class="fas fa-check-circle text-er-accent mt-0.5"></i>
                                                    <div>
                                                        <h4 class="text-sm font-bold text-white mb-1">${item.title}</h4>
                                                        <p class="text-sm leading-relaxed text-gray-300 break-keep">${item.summary}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section class="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-er-base">
                        <div class="max-w-6xl mx-auto">
                            <div class="text-center mb-10">
                                <span class="text-er-accent font-bold text-xs tracking-widest uppercase">함께한 이야기</span>
                                <h2 class="text-2xl md:text-4xl font-bold text-er-dark mt-3 break-keep">마음에 머무는 이야기</h2>
                                <p class="mt-3 text-sm md:text-base text-gray-500 max-w-2xl mx-auto break-keep">실제 후기를 바탕으로, 회복이 삶과 관계 안에 어떻게 스며들었는지 차분하게 담았습니다.</p>
                            </div>
                            <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                                ${publicTestimonials.stories.map((item) => `
                                    <div class="bg-white rounded-[2rem] p-6 md:p-7 border border-white/40 shadow-soft floating-card">
                                        <div class="flex items-center justify-between gap-3 mb-4">
                                            <span class="inline-flex px-3 py-1 rounded-full bg-er-base text-er-accent text-[10px] font-bold uppercase tracking-[0.2em]">${item.tag}</span>
                                            <div class="flex text-er-accent text-[10px]">
                                                <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
                                            </div>
                                        </div>
                                        <p class="text-gray-600 italic text-sm leading-relaxed break-keep mb-6">"${item.quote}"</p>
                                        <div class="pt-4 border-t border-gray-100">
                                            <p class="text-sm font-bold text-gray-900">${item.person}</p>
                                            <p class="text-[11px] text-gray-400 uppercase tracking-[0.18em]">${item.meta}</p>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </section>

                    <section class="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-white">
                        <div class="max-w-6xl mx-auto">
                            <div class="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] items-start">
                                <div>
                                    <span class="text-er-accent font-bold text-xs tracking-widest uppercase">동역과 후원</span>
                                    <h2 class="text-2xl md:text-4xl font-bold text-er-dark mt-3 break-keep">여러분의 후원으로 더 많은 개인과 공동체를 섬길 수 있습니다</h2>
                                    <p class="mt-3 text-sm md:text-base text-gray-500 break-keep">
                                        ER은 후원과 파트너십, 기도와 연결을 통해 더 많은 개인과 공동체를 섬기고, 더 넓은 현장으로 회복의 기회를 나누고자 합니다.
                                    </p>
                                </div>
                                <div class="grid gap-4 md:grid-cols-3">
                                    ${[
                                        ['후원', '프로그램 운영, 자료 개발, 참여자 지원을 위한 재정 후원'],
                                        ['협력', '교회·기관·공동체와 함께하는 교육 및 회복 프로그램'],
                                        ['연결', '필요한 사람을 소개하고 사역 소식을 함께 나누는 참여']
                                    ].map(([title, body]) => `
                                        <div class="rounded-[2rem] bg-er-base p-6 border border-white/40 shadow-soft floating-card">
                                            <h3 class="text-lg font-bold text-er-dark mb-2">${title}</h3>
                                            <p class="text-sm text-gray-500 leading-relaxed break-keep">${body}</p>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                            <div class="mt-8 rounded-[2rem] bg-er-dark text-white p-7 md:p-8 shadow-card floating-card flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                                <div>
                                    <h3 class="text-xl font-bold mb-2 break-keep">후원은 사역을 넓히고, 협력은 회복의 통로를 만듭니다.</h3>
                                    <p class="text-sm text-gray-300 break-keep">후원 여부와 관계없이 먼저 필요한 상담과 프로그램을 안내하며, 협력 요청은 상황에 맞게 개별적으로 연결합니다.</p>
                                </div>
                                <button onclick="renderSection('apply', { source: 'support' })" class="shrink-0 inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-bold text-er-dark hover:bg-er-accentLight transition-colors">
                                    후원·협력 신청하기
                                </button>
                            </div>
                        </div>
                    </section>

                    <section class="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-er-base">
                        <div class="max-w-5xl mx-auto">
                            <div class="text-center mb-10">
                                <span class="text-er-accent font-bold text-xs tracking-widest uppercase">FAQ</span>
                                <h2 class="text-2xl md:text-4xl font-bold text-er-dark mt-3">자주 묻는 질문</h2>
                            </div>
                            <div class="grid gap-4">
                                ${[
                                    ['상담은 후원자만 신청할 수 있나요?', '아닙니다. ER은 후원 여부와 관계없이 상담과 프로그램 문의를 받고 있습니다. 후원은 사역의 지속을 돕는 자발적인 참여입니다.'],
                                    ['어떤 분들을 주로 섬기나요?', '개인과 부부, 가정은 물론 목회자와 선교사, 교회 리더, 협력 기관 등 회복과 관계의 도움이 필요한 다양한 현장을 섬깁니다.'],
                                    ['공개 사이트의 로그인은 누구를 위한 기능인가요?', '기존 참여자와 코치, 운영상 연결된 사용자를 위한 보조 경로입니다. 처음 방문하신 분은 프로그램 안내와 상담 문의를 먼저 이용하시면 됩니다.'],
                                    ['협력 프로그램은 어떻게 진행되나요?', '기관과 교회의 필요를 먼저 듣고, 목적과 대상에 맞춰 코칭, 강의, 워크숍의 형식으로 개별 설계합니다.']
                                ].map(([question, answer]) => `
                                    <div class="bg-white rounded-[1.75rem] border border-white/40 p-6 shadow-soft floating-card">
                                        <h3 class="text-base md:text-lg font-bold text-er-dark mb-2 break-keep">${question}</h3>
                                        <p class="text-sm text-gray-500 leading-relaxed break-keep">${answer}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </section>

                    <section class="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-white">
                        <div class="max-w-6xl mx-auto">
                            <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
                                <div>
                                    <span class="text-er-accent font-bold text-xs tracking-widest uppercase">사역 소식</span>
                                    <h2 class="text-2xl md:text-4xl font-bold text-er-dark mt-3 break-keep">최근 소식과 모집 안내</h2>
                                    <p class="mt-3 text-sm md:text-base text-gray-500 max-w-2xl break-keep">진행 중인 과정과 새롭게 열리는 안내는 이곳에서 따로 모아 전합니다.</p>
                                </div>
                                <button onclick="openNotices()" class="inline-flex items-center justify-center gap-2 rounded-full border border-er-accent/30 bg-er-base px-5 py-3 text-sm font-bold text-er-dark hover:border-er-accent hover:bg-er-accentLight/40 transition-colors">
                                    공지사항 전체 보기 <i class="fas fa-arrow-right text-xs"></i>
                                </button>
                            </div>
                            <div class="grid gap-5 md:grid-cols-2">
                                ${state.notices.slice(0, 2).map(n => `
                                    <div onclick="openNotice('${n.id}')" class="bg-er-base rounded-[2rem] p-6 border border-white/40 shadow-soft floating-card cursor-pointer">
                                        <div class="flex items-center gap-2 mb-3">
                                            <span class="inline-block px-2 py-1 rounded-full text-[10px] font-bold ${n.tag === '모집중' ? 'bg-er-accent/10 text-er-accent' : 'bg-white text-gray-500'}">${n.tag}</span>
                                            <span class="text-[11px] text-gray-400">${(n.published_at || '').replaceAll('-','.')}</span>
                                        </div>
                                        <h3 class="text-lg font-bold text-er-dark mb-2 break-keep">${n.title}</h3>
                                        <p class="text-sm text-gray-500 break-keep">${n.summary}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </section>
                </div>
            `;
        }

        function renderAbout() {
            return `
                <div class="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
                    <div class="max-w-6xl mx-auto">
                        <div class="text-center mb-16 md:mb-24 animate-fade-in-up">
                            <h2 class="text-xs font-bold tracking-[0.3em] text-er-accent mb-4 md:mb-5">
                                ABOUT ER
                            </h2>
                            <h3 class="text-2xl md:text-4xl font-bold text-er-dark leading-snug mb-8 break-keep">
                                ER은 개인의 회복이<br>
                                가정과 공동체의 회복으로 이어지도록 돕습니다.
                            </h3>
                            <div class="flex justify-center items-center gap-3">
                                <span class="w-8 h-px bg-er-accent/30"></span>
                                <span class="w-1.5 h-1.5 rounded-full bg-er-accent/50"></span>
                                <span class="w-8 h-px bg-er-accent/30"></span>
                            </div>
                        </div>      

                        <div class="bg-er-base/70 rounded-[2.5rem] p-8 md:p-12 shadow-soft mb-16 md:mb-20 animate-fade-in-up border border-white/40">
                            <div class="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 md:gap-10 items-start">
                                <div class="space-y-5">
                                    <div class="bg-white rounded-2xl border border-white/40 shadow-soft p-5 md:p-6 floating-card">
                                        <h4 class="font-bold text-er-dark text-base md:text-lg mb-2">ER 사역의 시작</h4>
                                        <p class="text-sm text-gray-600 leading-relaxed break-keep">
                                            ER은 중동 선교와 캠퍼스 사역의 현장에서 목회자와 선교사, 사역 공동체가 겪는 소진과 관계의 어려움을 가까이에서 보며,
                                            자기 이해의 회복이 관계의 회복으로 이어지고, 그 회복이 공동체의 건강으로 확장되어야 한다는 문제의식에서 시작되었습니다.
                                        </p>
                                    </div>
                                    <div class="grid sm:grid-cols-2 gap-4">
                                        <div class="p-5 bg-white rounded-2xl border border-white/40 shadow-soft floating-card">
                                            <h4 class="font-bold text-er-dark text-sm mb-2">우리가 지향하는 회복</h4>
                                            <p class="text-xs text-gray-500 break-keep">자기 이해와 정서의 회복, 관계의 회복, 공동체 돌봄이 자연스럽게 이어지는 회복을 지향합니다.</p>
                                        </div>
                                        <div class="p-5 bg-white rounded-2xl border border-white/40 shadow-soft floating-card">
                                            <h4 class="font-bold text-er-dark text-sm mb-2">운영 방식</h4>
                                            <p class="text-xs text-gray-500 break-keep">코치와 협력자, 파트너 공동체와 함께 후원과 협력 기반의 사역으로 운영합니다.</p>
                                        </div>
                                        <div class="p-5 bg-white rounded-2xl border border-white/40 shadow-soft floating-card">
                                            <h4 class="font-bold text-er-dark text-sm mb-2">핵심 접근</h4>
                                            <p class="text-xs text-gray-500 break-keep">기독교 세계관과 에니어그램을 통합적으로 적용하여 개인과 공동체를 함께 돌봅니다.</p>
                                        </div>
                                        <div class="p-5 bg-white rounded-2xl border border-white/40 shadow-soft floating-card">
                                            <h4 class="font-bold text-er-dark text-sm mb-2">협력 구조</h4>
                                            <p class="text-xs text-gray-500 break-keep">교회와 기관, 사역자, 훈련 중인 코치들과 함께 프로그램을 설계하고 운영합니다.</p>
                                        </div>
                                    </div>
                                </div>

                                <div class="space-y-4">
                                    <div class="bg-white rounded-2xl border border-white/40 shadow-soft p-5 md:p-6 floating-card">
                                        <p class="text-[10px] tracking-widest text-er-accent font-bold uppercase mb-3">How We Work</p>
                                        <div class="space-y-3 text-sm text-gray-600">
                                            <div class="flex items-start gap-3">
                                                <i class="fas fa-check-circle text-er-accent mt-0.5"></i>
                                                <span class="break-keep">ER은 사역의 목적과 참여 대상, 후원과 협력의 길을 투명하게 안내하는 회복 사역입니다.</span>
                                            </div>
                                            <div class="flex items-start gap-3">
                                                <i class="fas fa-check-circle text-er-accent mt-0.5"></i>
                                                <span class="break-keep">후원 여부와 관계없이 먼저 필요를 듣고, 각 사람과 공동체에 맞는 회복의 방향을 함께 찾습니다.</span>
                                            </div>
                                            <div class="flex items-start gap-3">
                                                <i class="fas fa-check-circle text-er-accent mt-0.5"></i>
                                                <span class="break-keep">파트너 교회와 기관, 코치 네트워크와 함께 각 지역과 공동체에 맞는 프로그램을 연결합니다.</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="grid sm:grid-cols-2 gap-4">
                                        <div class="p-4 bg-white rounded-2xl border border-white/40 shadow-soft floating-card">
                                            <h4 class="font-bold text-er-dark text-xs md:text-sm mb-1">Partner Ministries</h4>
                                            <p class="text-xs text-gray-500 break-keep">교회와 기관이 지역의 회복 과제를 함께 다루도록 연결합니다.</p>
                                        </div>
                                        <div class="p-4 bg-white rounded-2xl border border-white/40 shadow-soft floating-card">
                                            <h4 class="font-bold text-er-dark text-xs md:text-sm mb-1">Qualified Collaborators</h4>
                                            <p class="text-xs text-gray-500 break-keep">검증된 코치와 교육 협력자가 프로그램을 함께 설계합니다.</p>
                                        </div>
                                        <div class="p-4 bg-white rounded-2xl border border-white/40 shadow-soft floating-card">
                                            <h4 class="font-bold text-er-dark text-xs md:text-sm mb-1">Support-Based Operations</h4>
                                            <p class="text-xs text-gray-500 break-keep">후원과 협력이 더 많은 개인과 공동체에게 회복 기회를 넓힙니다.</p>
                                        </div>
                                        <div class="p-4 bg-white rounded-2xl border border-white/40 shadow-soft floating-card">
                                            <h4 class="font-bold text-er-dark text-xs md:text-sm mb-1">Public Trust</h4>
                                            <p class="text-xs text-gray-500 break-keep">사역의 목적과 방향을 공개적으로 설명해 신뢰를 쌓습니다.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="animate-fade-in-up">
                            <h3 class="text-xl md:text-2xl font-bold text-center text-er-dark mb-3">함께하는 코치진</h3>
                            <p class="text-center text-sm text-gray-500 mb-8 break-keep">ER은 한 사람을 소개하는 사이트가 아니라, 코치와 협력자 네트워크가 함께 운영하는 회복 사역입니다.</p>
                            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
                                ${['김수잔', '서초윤', '정익훈', '정경하', '주찬미', '임효조', '최다영'].map(name => `
                                    <div class="bg-white rounded-2xl p-5 text-center shadow-soft border border-white/40 floating-card">
                                        <div class="w-14 h-14 mx-auto bg-gray-50 rounded-full flex items-center justify-center text-lg font-bold text-gray-400 mb-3">
                                            ${name.substring(0,1)}
                                        </div>
                                        <h4 class="font-bold text-gray-900 text-sm">${name}</h4>
                                        <p class="text-[10px] text-er-accent mt-1 uppercase tracking-wide">Collaborator</p>
                                    </div>
                                `).join('')}
                                <div class="bg-gray-50 rounded-2xl p-5 flex flex-col items-center justify-center text-center border border-dashed border-gray-300 cursor-pointer hover:bg-gray-100 transition-colors" onclick="renderSection('notices')">
                                    <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-300 mb-2 shadow-sm"><i class="fas fa-plus"></i></div>
                                    <p class="text-[10px] text-gray-500 font-medium">전문가 과정<br>모집 중</p>
                                </div>
                            </div>
                        </div>

                        <div class="mt-16 bg-white rounded-[2.5rem] p-8 md:p-10 shadow-soft border border-white/40 animate-fade-in-up">
                            <div class="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] items-center">
                                <div class="relative group flex flex-col items-center text-center">
                                    <div class="relative mb-4">
                                        <div class="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden shadow-card bg-gray-200 ring-4 ring-white">
                                            <img src="son-profile-picture.png" alt="Jiyoung Son" class="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" onerror="this.src='https://via.placeholder.com/300x300?text=Profile';">
                                        </div>
                                        <div class="absolute -inset-3 rounded-full border border-er-accent/20 pointer-events-none"></div>
                                    </div>
                                    <p class="text-[10px] tracking-widest text-er-accent font-bold uppercase">Founder</p>
                                    <h3 class="text-2xl font-extrabold text-er-dark mt-2">손지영</h3>
                                </div>

                                <div>
                                    <h3 class="text-xl md:text-2xl font-bold text-er-dark mb-4 break-keep">설립자 소개</h3>
                                    <p class="text-sm md:text-base text-gray-500 leading-relaxed break-keep mb-5">
                                        손지영 사모는 에니어그램과 기독교 세계관을 통합적으로 적용하여 개인과 공동체의 회복을 돕는 비전을 품고 ER을 시작했습니다.
                                    </p>
                                    <div class="grid sm:grid-cols-2 gap-4">
                                        <div class="p-4 bg-er-base rounded-2xl border border-white/30 shadow-soft floating-card">
                                            <h4 class="font-bold text-er-dark text-xs md:text-sm mb-1">Enneagram Spectrum Advanced Certification</h4>
                                            <p class="text-xs text-gray-500">Dr. Wagner (International Enneagram Association)</p>
                                        </div>
                                        <div class="p-4 bg-er-base rounded-2xl border border-white/30 shadow-soft floating-card">
                                            <h4 class="font-bold text-er-dark text-xs md:text-sm mb-1">IEA Accredited Professional</h4>
                                            <p class="text-xs text-gray-500">국제 에니어그램 협회 인증 전문가</p>
                                        </div>
                                        <div class="p-4 bg-er-base rounded-2xl border border-white/30 shadow-soft floating-card">
                                            <h4 class="font-bold text-er-dark text-xs md:text-sm mb-1">SOIM GLTC Instructor</h4>
                                            <p class="text-xs text-gray-500">소임 글로벌 리더십 트레이닝 강사</p>
                                        </div>
                                        <div class="p-4 bg-er-base rounded-2xl border border-white/30 shadow-soft floating-card">
                                            <h4 class="font-bold text-er-dark text-xs md:text-sm mb-1">DTS Counseling</h4>
                                            <p class="text-xs text-gray-500">Dallas Theological Seminary 석사 과정</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        function renderPrograms() {
            return `
                <div class="bg-er-base min-h-screen">
                    <div class="bg-er-dark text-white py-16 px-6 relative overflow-hidden rounded-b-[3rem]">
                        <div class="absolute inset-0 bg-pattern opacity-5 pointer-events-none"></div>
                        <div class="relative z-10 max-w-7xl mx-auto text-center">
                            <h2 class="text-2xl md:text-4xl font-bold mb-3">맞춤형 프로그램</h2>
                            <p class="text-gray-300 text-sm md:text-base max-w-xl mx-auto break-keep">개인의 회복에서 공동체의 성장까지, 당신에게 가장 적합한 솔루션을 제안합니다.</p>
                            
                            <div class="mt-8 flex justify-start md:justify-center gap-2 overflow-x-auto pb-2 -mx-6 px-6 md:mx-0 md:px-0 scrollbar-hide">
                                ${['individual:개인/가정', 'church:사역/교회', 'business:비즈니스', 'training:강사양성'].map(item => {
                                    const [key, label] = item.split(':');
                                    const isActive = state.programFilter === key;
                                    return `<button onclick="updateProgramView('${key}')" id="tab-${key}" 
                                        class="whitespace-nowrap px-5 py-2.5 rounded-full text-xs md:text-sm font-bold transition-all duration-300 ${isActive ? 'bg-white text-er-dark shadow-md scale-105' : 'bg-white/10 text-gray-300 hover:bg-white/20'}">
                                        ${label}
                                    </button>`
                                }).join('')}
                            </div>
                        </div>
                    </div>

                    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 pb-20">
                        <div id="program-intro" class="mb-6 text-center bg-white rounded-2xl p-6 shadow-soft max-w-2xl mx-auto border border-white/40 animate-fade-in-up floating-card">
                            </div>
                        
                        <div id="program-cards" class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            </div>

                        <div class="mt-20">
                            <div class="text-center mb-10">
                                <span class="text-er-accent font-bold text-xs tracking-widest uppercase">Process</span>
                                <h3 class="text-xl md:text-2xl font-bold text-er-dark mt-2">진행 과정</h3>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 max-w-4xl mx-auto">
                                <div class="bg-white p-6 md:p-8 rounded-3xl text-center shadow-soft relative group floating-card">
                                    <div class="absolute top-1/2 -right-4 hidden md:block text-gray-200 z-10"><i class="fas fa-chevron-right text-xl"></i></div>
                                    <div class="w-12 h-12 bg-er-base text-er-accent rounded-2xl flex items-center justify-center text-xl mx-auto mb-4 group-hover:scale-110 transition-transform"><i class="far fa-file-alt"></i></div>
                                    <h4 class="font-bold text-base mb-1">1. 신청서 작성</h4>
                                    <p class="text-xs text-gray-500 break-keep">현재 상황과 니즈를 파악합니다.</p>
                                </div>
                                <div class="bg-white p-6 md:p-8 rounded-3xl text-center shadow-soft relative group floating-card">
                                    <div class="absolute top-1/2 -right-4 hidden md:block text-gray-200 z-10"><i class="fas fa-chevron-right text-xl"></i></div>
                                    <div class="w-12 h-12 bg-er-base text-er-accent rounded-2xl flex items-center justify-center text-xl mx-auto mb-4 group-hover:scale-110 transition-transform"><i class="far fa-comments"></i></div>
                                    <h4 class="font-bold text-base mb-1">2. 사전 인터뷰</h4>
                                    <p class="text-xs text-gray-500 break-keep">코치와 상담을 통해 방향을 설정합니다.</p>
                                </div>
                                <div class="bg-white p-6 md:p-8 rounded-3xl text-center shadow-soft group floating-card">
                                    <div class="w-12 h-12 bg-er-base text-er-accent rounded-2xl flex items-center justify-center text-xl mx-auto mb-4 group-hover:scale-110 transition-transform"><i class="fas fa-chalkboard-teacher"></i></div>
                                    <h4 class="font-bold text-base mb-1">3. 코칭/강의</h4>
                                    <p class="text-xs text-gray-500 break-keep">맞춤형 커리큘럼으로 진행됩니다.</p>
                                </div>
                            </div>
                            <div class="text-center mt-10">
                                <button onclick="renderSection('apply')" class="bg-er-dark text-white px-8 py-3.5 rounded-full font-bold shadow-soft hover:bg-gray-800 hover:-translate-y-0.5 transition-all text-sm w-full sm:w-auto">
                                    상담 신청하기
                                </button>
                            </div>
                        </div>

                        <div class="mt-16 rounded-[2rem] bg-white border border-white/40 p-6 md:p-8 shadow-soft animate-fade-in-up">
                            <div class="flex items-center justify-between gap-3 mb-4">
                                <h3 class="text-lg font-bold text-er-dark">프로그램 자료</h3>
                                <span class="text-[11px] text-gray-400">Teaching Materials</span>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                ${[
                                    ['워크북 자료', '개인/그룹 진행 시 바로 활용할 수 있는 실습 시트와 안내 자료'],
                                    ['강의 슬라이드', '교회·기관 대상 프로그램에 사용하는 핵심 강의 자료 모음'],
                                    ['진행 가이드', '회기별 운영 순서와 질문 프롬프트를 담은 코치용 가이드']
                                ].map(([title, desc]) => `
                                    <div class="rounded-2xl border border-gray-100 bg-er-base/50 p-5">
                                        <h4 class="text-sm font-bold text-er-dark">${title}</h4>
                                        <p class="mt-2 text-xs text-gray-500 break-keep">${desc}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        function renderCommunity() {
            return `
                <div class="bg-white min-h-screen py-16 px-4">
                    <div class="max-w-6xl mx-auto">
                        <div class="text-center mb-12 animate-fade-in-up">
                            <span class="text-er-accent font-bold text-xs tracking-widest uppercase">함께한 이야기</span>
                            <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mt-2">사역의 변화와 방향</h2>
                            <p class="mt-2 text-sm text-gray-500 break-keep">ER이 어떤 자리들을 섬기고 있으며, 어떤 변화의 방향을 꾸준히 만들어 가는지 지표 중심으로 정리했습니다.</p>
                        </div>

                        <div class="grid gap-5 md:grid-cols-4 mb-10 animate-fade-in-up">
                            ${[
                                ['300명+', '지금까지 연결된 참여자'],
                                ['350회+', '누적 상담·코칭 세션'],
                                ['10곳', '협력 교회·기관'],
                                ['20명+', '훈련·교육 참여자']
                            ].map(([value, label]) => `
                                <div class="rounded-[2rem] border border-white/40 bg-er-base p-6 text-center shadow-soft floating-card">
                                    <p class="text-3xl md:text-4xl font-extrabold text-er-dark">${value}</p>
                                    <p class="mt-2 text-sm text-gray-500 break-keep">${label}</p>
                                </div>
                            `).join('')}
                        </div>

                        <div class="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 mb-10">
                            <div class="bg-white/70 rounded-[2rem] p-6 md:p-8 shadow-soft animate-fade-in-up floating-card">
                                <h3 class="font-bold text-base text-gray-800 mb-6 flex items-center gap-2">
                                    <i class="fas fa-chart-pie text-er-accent"></i> 은혜가 흘러간 자리
                                </h3>
                                <p class="text-xs text-gray-500 mb-4 break-keep">상담과 교육 요청이 집중되는 주요 영역을 기준으로 사역의 우선순위와 협력 방향을 조정합니다.</p>
                                <div class="chart-container h-64">
                                    <canvas id="impactChart"></canvas>
                                </div>
                            </div>

                            <div class="bg-er-dark text-white p-6 md:p-8 rounded-[2rem] shadow-card floating-card animate-fade-in-up" style="animation-delay: 0.1s;">
                                <span class="inline-flex px-3 py-1 rounded-full bg-white/10 text-[10px] font-bold uppercase tracking-[0.2em] text-er-accent">사역의 방향</span>
                                <h3 class="text-2xl font-bold mt-5 mb-4 break-keep">반복적으로 나타난 변화의 방향</h3>
                                <div class="space-y-4">
                                    ${publicTestimonials.impactThemes.map((item) => `
                                        <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
                                            <div class="flex items-start gap-3">
                                                <i class="fas fa-check-circle text-er-accent mt-0.5"></i>
                                                <div>
                                                    <h4 class="text-sm font-bold text-white mb-1">${item.title}</h4>
                                                    <p class="text-sm leading-relaxed text-gray-300 break-keep">${item.summary}</p>
                                                </div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>

                        <div class="grid md:grid-cols-3 gap-6 animate-fade-in-up" style="animation-delay: 0.2s;">
                            <div class="md:col-span-3">
                                <h3 class="text-lg font-bold text-gray-900 mb-4">이 사역을 운영하는 방식</h3>
                                <div class="grid md:grid-cols-2 gap-4">
                                    ${[
                                        ['협력 기반의 사역', '교회와 기관, 코치와 협력자와 함께 사역의 구조를 세워 갑니다.'],
                                        ['후원과 접근성', '후원과 협력을 통해 더 많은 개인과 공동체가 이 사역에 접근할 수 있도록 운영합니다.'],
                                        ['빠른 해결보다 형성', '단기 해결보다 지속 가능한 회복과 형성의 과정을 중요하게 여깁니다.'],
                                        ['신뢰와 투명성', '사역의 목적과 운영 방향, 참여 경로를 공개적으로 설명하는 사이트를 지향합니다.'],
                                    ].map(([title, desc]) => `
                                        <div class="bg-white/70 rounded-2xl p-5 border border-white/30 shadow-soft floating-card">
                                            <h4 class="font-bold text-gray-900 mb-2">${title}</h4>
                                            <p class="text-sm text-gray-500 break-keep">${desc}</p>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        function renderSupport() {
            return `
                <div class="bg-er-base min-h-screen py-16 md:py-20 px-4 sm:px-6 lg:px-8">
                    <div class="max-w-6xl mx-auto">
                        <div class="text-center mb-12 animate-fade-in-up">
                            <span class="text-er-accent font-bold text-xs tracking-widest uppercase">동역과 후원</span>
                            <h2 class="text-3xl md:text-5xl font-bold text-er-dark mt-3 break-keep">여러분의 후원으로 더 많은 개인과 공동체를 섬길 수 있습니다</h2>
                            <p class="mt-4 text-sm md:text-base text-gray-500 max-w-3xl mx-auto break-keep">
                                ER은 중동 선교와 캠퍼스 사역의 경험을 바탕으로, 목회자와 선교사를 비롯해 회복이 필요한 개인과 공동체를 섬겨 왔습니다.
                                후원 문의와 협력 요청은 더 많은 이들이 이 사역에 연결되도록 돕고, 더 넓은 현장으로 회복의 기회를 잇는 통로가 됩니다.
                            </p>
                        </div>

                        <div class="grid gap-4 md:grid-cols-5 mb-10 animate-fade-in-up">
                            ${[
                                ['300명+', '지금까지 섬긴 인원'],
                                ['350회+', '누적 세션 수'],
                                ['10곳', '협력 교회·기관'],
                                ['7명', '함께하는 코치'],
                                ['20명+', '훈련 참가자'],
                            ].map(([value, label]) => `
                                <div class="rounded-[2rem] bg-white border border-white/40 p-6 text-center shadow-soft floating-card">
                                    <div class="text-2xl md:text-3xl font-extrabold text-er-dark">${value}</div>
                                    <div class="mt-2 text-xs md:text-sm text-gray-500 break-keep">${label}</div>
                                </div>
                            `).join('')}
                        </div>

                        <div class="grid gap-6 lg:grid-cols-[1fr_1fr] animate-fade-in-up">
                            <div class="rounded-[2rem] bg-white border border-white/40 p-7 shadow-soft floating-card">
                                <h3 class="text-xl font-bold text-er-dark mb-4">함께 마음을 보태는 방법</h3>
                                <div class="grid gap-4">
                                    ${[
                                        ['후원 문의', '프로그램 운영과 자료 개발, 필요한 참여자 연결을 위한 후원 안내를 개별적으로 드립니다.'],
                                        ['교회·기관 협력', '회복 프로그램과 워크숍, 훈련 과정을 함께 기획하고 운영할 수 있습니다.'],
                                        ['기도와 소개', '도움이 필요한 개인과 공동체를 연결하고 사역 소식을 함께 나누는 방식으로 동참할 수 있습니다.'],
                                    ].map(([title, body]) => `
                                        <div class="rounded-2xl bg-er-base/60 border border-white/30 p-5 shadow-soft floating-card">
                                            <h4 class="font-bold text-er-dark mb-2">${title}</h4>
                                            <p class="text-sm text-gray-600 break-keep">${body}</p>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                            <div class="rounded-[2rem] bg-er-dark text-white p-7 shadow-card floating-card">
                                <h3 class="text-xl font-bold mb-4">후원이 사용되는 곳</h3>
                                <div class="space-y-4 text-sm text-gray-200">
                                    <div class="rounded-2xl bg-white/10 border border-white/10 p-4">1. 목회자와 선교사, 그리고 회복이 시급한 분들의 접근성을 지키는 데 사용됩니다.</div>
                                    <div class="rounded-2xl bg-white/10 border border-white/10 p-4">2. 상담과 교육, 훈련 프로그램이 더 정성스럽게 이어지도록 돕습니다.</div>
                                    <div class="rounded-2xl bg-white/10 border border-white/10 p-4">3. 협력 공동체와 코치 훈련 네트워크가 넓어지도록 뒷받침합니다.</div>
                                </div>
                                <p class="mt-4 text-xs text-gray-300 break-keep">현재 후원은 온라인 결제가 아닌 개별 안내 방식으로 진행됩니다.</p>
                                <button onclick="renderSection('apply', { source: 'support' })" class="mt-6 w-full rounded-full bg-white py-3 text-sm font-bold text-er-dark hover:bg-er-accentLight transition-colors">
                                    후원·협력 신청하기
                                </button>
                            </div>
                        </div>

                        <div class="mt-10 rounded-[2rem] bg-white border border-white/40 p-7 shadow-soft animate-fade-in-up">
                            <h3 class="text-xl font-bold text-er-dark mb-4">함께 지키는 운영 원칙</h3>
                            <div class="grid gap-4 md:grid-cols-3 text-sm text-gray-600">
                                <div class="rounded-2xl bg-er-base/60 p-5 border border-white/30 shadow-soft floating-card">후원 여부와 관계없이 먼저 필요를 듣고 적절한 연결을 돕습니다.</div>
                                <div class="rounded-2xl bg-er-base/60 p-5 border border-white/30 shadow-soft floating-card">협력 요청은 목적과 대상, 현장에 맞추어 개별적으로 설계합니다.</div>
                                <div class="rounded-2xl bg-er-base/60 p-5 border border-white/30 shadow-soft floating-card">공개 사이트는 안내 창구로, 운영 포털은 내부 도구로 분리해 운영합니다.</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        function renderPrivacy() {
            return `
                <div class="bg-white min-h-screen py-16 px-4 sm:px-6 lg:px-8">
                    <div class="max-w-4xl mx-auto">
                        <div class="mb-10">
                            <span class="text-er-accent font-bold text-xs tracking-widest uppercase">Privacy</span>
                            <h2 class="text-3xl md:text-4xl font-bold text-er-dark mt-3">개인정보를 다루는 마음</h2>
                            <p class="mt-3 text-sm text-gray-500 break-keep">공개 사이트의 신청과 로그인 과정에서 받은 정보를 어떤 태도로 다루는지 차분히 안내합니다.</p>
                        </div>
                        <div class="space-y-4 text-sm text-gray-600 leading-relaxed">
                            <div class="rounded-2xl bg-er-base/60 border border-white/30 p-6 shadow-soft floating-card">ER은 신청서, 로그인, 문의 과정에서 이름, 연락처, 이메일, 제출 메시지와 같은 최소한의 정보를 받습니다.</div>
                            <div class="rounded-2xl bg-er-base/60 border border-white/30 p-6 shadow-soft floating-card">받은 정보는 상담 안내, 협력 응답, 운영상 필요한 계정 확인 목적에만 사용합니다.</div>
                            <div class="rounded-2xl bg-er-base/60 border border-white/30 p-6 shadow-soft floating-card">법적 보관 의무가 없는 한, 운영 목적이 끝난 정보는 정리 대상이 됩니다. 더 자세한 정책은 추후 별도 문서로 정리할 예정입니다.</div>
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
                            <div class="rounded-2xl bg-white border border-white/40 p-6 shadow-soft floating-card">공개 사이트의 정보는 ER의 사역과 참여 방법을 소개하기 위한 목적입니다.</div>
                            <div class="rounded-2xl bg-white border border-white/40 p-6 shadow-soft floating-card">운영 포털과 코치 앱은 승인된 코치와 기존 참여자를 위한 내부 기능이며, 일반 방문자는 공개 안내와 문의 경로를 먼저 이용합니다.</div>
                            <div class="rounded-2xl bg-white border border-white/40 p-6 shadow-soft floating-card">프로그램 일정과 구성, 제공 방식은 대상과 협력 구조에 따라 달라질 수 있습니다.</div>
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
                            
                            <div onclick="renderSection('types_guide')" class="group bg-white rounded-[2rem] p-6 md:p-8 shadow-soft floating-card cursor-pointer relative overflow-hidden border border-white/40">
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

                                <div class="bg-white rounded-[2rem] p-6 md:p-8 shadow-soft border border-white/40 floating-card">
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

        function renderTest() {
            const isKo = adaptiveLang !== 'en';
            const langParam = isKo ? 'ko' : 'en';
            const version = '20260305-motive-v4';
            const title = isKo ? '적응형 에니어그램 심층 진단' : 'Adaptive Enneagram Typing Assessment';
            const cacheBuster = Date.now();
            return `
                <div class="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                    <div class="mb-4 flex items-center justify-end gap-2">
                        <button
                            onclick="setAdaptiveTestLanguage('ko')"
                            class="px-3 py-1.5 rounded-full text-xs font-bold border transition ${isKo ? 'bg-er-dark text-white border-er-dark' : 'bg-white text-gray-600 border-gray-200 hover:border-er-accent hover:text-er-dark'}"
                        >한국어 테스트</button>
                        <button
                            onclick="setAdaptiveTestLanguage('en')"
                            class="px-3 py-1.5 rounded-full text-xs font-bold border transition ${!isKo ? 'bg-er-dark text-white border-er-dark' : 'bg-white text-gray-600 border-gray-200 hover:border-er-accent hover:text-er-dark'}"
                        >English Test</button>
                    </div>
                    <div class="bg-white rounded-3xl border border-gray-100 shadow-soft overflow-hidden">
                        <iframe
                            src="test.html?v=${version}&lang=${langParam}&_=${cacheBuster}"
                            title="${title}"
                            class="w-full min-h-[2500px] md:min-h-[2800px]"
                            loading="lazy"
                        ></iframe>
                    </div>

                    <div class="mt-8 grid md:grid-cols-2 gap-4">
                        <div class="bg-white rounded-2xl border border-gray-100 p-5 shadow-soft">
                            <h3 class="text-sm font-bold text-er-dark mb-2">진단 안내 자료</h3>
                            <p class="text-xs text-gray-500 break-keep">테스트 전후 해석 방법과 정식 타이핑 세션 연결 흐름을 한눈에 확인할 수 있습니다.</p>
                        </div>
                        <div class="bg-er-base rounded-2xl border border-white/40 p-5 shadow-soft">
                            <h3 class="text-sm font-bold text-er-dark mb-2">추천 읽을거리</h3>
                            <ul class="space-y-1 text-xs text-gray-600">
                                <li>에니어그램의 지혜 (Don Richard Riso)</li>
                                <li>내면의 감옥에서 벗어나라 (Richard Rohr)</li>
                            </ul>
                        </div>
                    </div>
                </div>
            `;
        }
        function formatNoticeBody(body, bodyIsHtml) {
            if (bodyIsHtml) return body || '';
            let normalized = String(body || '').replace(/\r\n/g, '\n').trim();
            if (!normalized) return '';
            const compressed = !normalized.includes('\n') && normalized.length > 220;
            if (compressed) {
                normalized = normalized
                    .replace(/([.!?])\s*/g, '$1\n')
                    .replace(/(?:\s|^)(기간)(?=[0-9가-힣])/g, '\n$1: ')
                    .replace(/(?:\s|^)(대상)(?=[0-9가-힣])/g, '\n$1: ')
                    .replace(/(?:\s|^)(지원마감)(?=[0-9가-힣])/g, '\n$1: ');
            }
            return normalized
                .split(/\n{2,}/)
                .map((paragraph) => `<p class="mb-4 last:mb-0">${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`)
                .join('');
        }

        function looksLikeHtml(value) {
            return /<\/?[a-z][\s\S]*>/i.test(String(value || ''));
        }

        function stripHtmlToText(value) {
            const temp = document.createElement('div');
            const htmlWithBreaks = String(value || '')
                .replace(/<\s*br\s*\/?>/gi, '\n')
                .replace(/<\s*\/(span|strong|em|b|i)\s*>/gi, ' ')
                .replace(/<\s*\/(p|div|li|h1|h2|h3|h4|h5|h6)\s*>/gi, '\n');
            temp.innerHTML = htmlWithBreaks;
            return (temp.textContent || temp.innerText || '')
                .replace(/\r\n/g, '\n')
                .replace(/[ \t]+\n/g, '\n')
                .replace(/\n[ \t]+/g, '\n')
                .replace(/\n{3,}/g, '\n\n')
                .trim();
        }

        function normalizeNoticeRecord(row) {
            return {
                ...row,
                body_is_html: Boolean(row.body_is_html) || looksLikeHtml(row.body)
            };
        }

        async function loadNotices(force = false) {
            if (!force && state.noticesLoaded) return;
            const client = window.supabaseClient;
            if (!client) {
                state.noticesLoaded = true;
                return;
            }
            const { data, error } = await client
                .from('public_notices')
                .select('id, tag, title, summary, body, body_is_html, published_at')
                .order('published_at', { ascending: false })
                .order('created_at', { ascending: false });
            if (!error && Array.isArray(data) && data.length) {
                state.notices = data.map(normalizeNoticeRecord);
            }
            state.noticesLoaded = true;
        }

        async function reloadNoticesView(payload) {
            await loadNotices(true);
            renderSection(state.currentSection === 'notice_detail' ? 'notice_detail' : 'notices', payload, { syncHash: false });
        }

        function openNoticeEditor(mode, id = null) {
            if (!canManageNotices()) return;
            if (mode === 'edit') {
                const notice = state.notices.find((x) => String(x.id) === String(id));
                if (!notice) return;
                state.noticeEditor = {
                    open: true,
                    mode: 'edit',
                    noticeId: notice.id,
                    tag: notice.tag || '안내',
                    title: notice.title || '',
                    summary: notice.summary || '',
                    body: notice.body_is_html ? stripHtmlToText(notice.body) : (notice.body || ''),
                    published_at: notice.published_at || new Date().toISOString().slice(0, 10)
                };
                renderSection('notices', null, { syncHash: false });
                return;
            }
            state.noticeEditor = {
                open: true,
                mode: 'create',
                noticeId: null,
                tag: '안내',
                title: '',
                summary: '',
                body: '',
                published_at: new Date().toISOString().slice(0, 10)
            };
            renderSection('notices', null, { syncHash: false });
        }

        function closeNoticeEditor() {
            if (!state.noticeEditor.open) return;
            state.noticeEditor.open = false;
            renderSection('notices', null, { syncHash: false });
        }

        function setNoticeEditorField(field, value) {
            if (!state.noticeEditor || typeof state.noticeEditor !== 'object') return;
            state.noticeEditor[field] = value;
        }

        async function submitNoticeEditor(event) {
            event.preventDefault();
            if (!canManageNotices()) return;
            const title = String(state.noticeEditor.title || '').trim();
            const body = String(state.noticeEditor.body || '').trim();
            if (!title) {
                alert('공지 제목을 입력해 주세요.');
                return;
            }
            if (!body) {
                alert('본문을 입력해 주세요.');
                return;
            }
            const client = window.supabaseClient;
            if (!client) {
                alert('Supabase 연결이 필요합니다.');
                return;
            }
            const payload = {
                tag: String(state.noticeEditor.tag || '안내').trim() || '안내',
                title,
                summary: String(state.noticeEditor.summary || '').trim(),
                body,
                body_is_html: false,
                published_at: String(state.noticeEditor.published_at || '').trim() || new Date().toISOString().slice(0, 10)
            };
            let error = null;
            if (state.noticeEditor.mode === 'edit' && state.noticeEditor.noticeId) {
                const out = await client
                    .from('public_notices')
                    .update(payload)
                    .eq('id', state.noticeEditor.noticeId);
                error = out.error;
            } else {
                const out = await client.from('public_notices').insert([{
                    ...payload,
                    created_by: state.user?.id || null
                }]);
                error = out.error;
            }
            if (error) {
                alert(`공지 저장 실패: ${error.message}`);
                return;
            }
            state.noticeEditor.open = false;
            await reloadNoticesView();
        }

        function renderNoticeEditor() {
            if (!canManageNotices() || !state.noticeEditor.open) return '';
            const editorTitle = state.noticeEditor.mode === 'edit' ? '공지 수정' : '새 공지 작성';
            return `
                <div class="mb-6 bg-er-base border border-er-accent/20 rounded-3xl p-5 md:p-6 animate-fade-in-up">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-base font-bold text-er-dark">${editorTitle}</h3>
                        <button type="button" onclick="closeNoticeEditor()" class="px-3 py-1.5 rounded-full text-xs font-bold border border-gray-200 text-gray-700 hover:bg-gray-50">닫기</button>
                    </div>
                    <form onsubmit="submitNoticeEditor(event)" class="space-y-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input required value="${escapeHtml(state.noticeEditor.title)}" oninput="setNoticeEditorField('title', this.value)" placeholder="공지 제목" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm bg-white">
                            <input value="${escapeHtml(state.noticeEditor.tag)}" oninput="setNoticeEditorField('tag', this.value)" placeholder="태그 (예: 안내, 모집중)" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm bg-white">
                        </div>
                        <input value="${escapeHtml(state.noticeEditor.summary)}" oninput="setNoticeEditorField('summary', this.value)" placeholder="요약 문구" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm bg-white">
                        <textarea required oninput="setNoticeEditorField('body', this.value)" rows="7" placeholder="공지 본문" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm bg-white">${escapeHtml(state.noticeEditor.body)}</textarea>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                            <input type="date" value="${escapeHtml(state.noticeEditor.published_at)}" onchange="setNoticeEditorField('published_at', this.value)" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm bg-white">
                            <button type="submit" class="px-6 py-2.5 rounded-full text-xs font-bold bg-er-dark text-white">저장하기</button>
                        </div>
                    </form>
                </div>
            `;
        }

        async function deleteNotice(id) {
            if (!canManageNotices()) return;
            const notice = state.notices.find((x) => String(x.id) === String(id));
            if (!notice) return;
            if (!confirm(`"${notice.title}" 공지를 삭제할까요?`)) return;
            const client = window.supabaseClient;
            if (!client) {
                alert('Supabase 연결이 필요합니다.');
                return;
            }
            const { error } = await client.from('public_notices').delete().eq('id', notice.id);
            if (error) {
                alert(`공지 삭제 실패: ${error.message}`);
                return;
            }
            await reloadNoticesView();
        }

        function renderNotices() {
            const items = [...state.notices].sort((a, b) => {
                const left = a.published_at || '';
                const right = b.published_at || '';
                return left < right ? 1 : -1;
            });
            const manageButton = canManageNotices()
                ? `<button onclick="openNoticeEditor('create')" class="px-3 py-1.5 bg-er-dark text-white rounded-full text-xs font-bold hover:bg-gray-800">새 공지</button>`
                : `<div class="w-16"></div>`;
            return `
                <div class="bg-white min-h-screen py-16">
                    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div class="mb-8 flex items-center justify-between gap-4 animate-fade-in-up">
                            <button onclick="renderSection('community')" class="px-3 py-1.5 bg-gray-50 rounded-full text-xs font-medium text-gray-600 hover:text-er-dark border border-gray-100">
                                <i class="fas fa-arrow-left mr-1"></i> 함께한 이야기로
                            </button>
                            <h2 class="text-xl font-bold text-gray-900">공지사항</h2>
                            ${manageButton}
                        </div>
                        ${renderNoticeEditor()}

                        <div class="space-y-3 animate-fade-in-up" style="animation-delay:0.1s;">
                            ${items.map(n => `
                                <div onclick="openNotice('${n.id}')" class="group bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-card hover:-translate-y-0.5 transition-all cursor-pointer">
                                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
                                        <div class="min-w-0">
                                            <div class="flex items-center gap-2 mb-1.5">
                                                <span class="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${n.tag === '모집중' ? 'bg-er-accent/10 text-er-accent' : 'bg-gray-100 text-gray-500'}">${n.tag}</span>
                                                <span class="text-[10px] text-gray-400">${(n.published_at || '').replaceAll('-','.')}</span>
                                            </div>
                                            <h3 class="text-sm md:text-base font-bold text-gray-900 truncate group-hover:text-er-accent transition-colors">${n.title}</h3>
                                            <p class="text-xs text-gray-500 mt-1 line-clamp-1">${n.summary ?? ''}</p>
                                        </div>
                                        <div class="hidden md:flex shrink-0 items-center gap-2">
                                            ${canManageNotices() ? `
                                                <button type="button" onclick="event.stopPropagation(); openNoticeEditor('edit', '${n.id}')" class="px-2 py-1 rounded-full text-[11px] font-bold border border-er-accent/40 text-er-dark hover:bg-er-accentLight/30">수정</button>
                                                <button type="button" onclick="event.stopPropagation(); deleteNotice('${n.id}')" class="px-2 py-1 rounded-full text-[11px] font-bold border border-red-200 text-red-600 hover:bg-red-50">삭제</button>
                                            ` : ''}
                                            <div class="w-8 h-8 rounded-full border border-gray-200 items-center justify-center text-gray-400 group-hover:bg-er-dark group-hover:text-white group-hover:border-transparent transition-all ${canManageNotices() ? 'flex' : 'hidden md:flex'}">
                                                <i class="fas fa-arrow-right text-xs"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        }
        
        function renderNoticeDetail(payload) {
            const id = String(payload?.id || '');
            const n = state.notices.find(x => String(x.id) === id);

            if (!n) return `<div class="p-10 text-center">공지를 찾을 수 없습니다.<br><button class="mt-4 btn" onclick="renderSection('notices')">돌아가기</button></div>`;

            return `
                <div class="bg-er-base min-h-screen py-16 px-4">
                    <div class="max-w-3xl mx-auto">
                        <div class="mb-4 flex items-center justify-between">
                            <button onclick="openNotices()" class="px-3 py-1.5 bg-white rounded-full text-xs font-medium text-gray-600 shadow-sm border border-gray-100">
                                <i class="fas fa-arrow-left mr-1"></i> 목록
                            </button>
                            <span class="text-[10px] text-gray-400">${(n.published_at || '').replaceAll('-','.')}</span>
                        </div>

                        <div class="bg-white rounded-[2rem] shadow-card p-6 md:p-10 border border-gray-100 animate-fade-in-up">
                            <div class="flex flex-wrap items-center gap-2 mb-4">
                                <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold ${n.tag === '모집중' ? 'bg-er-accent/10 text-er-accent' : 'bg-gray-100 text-gray-500'}">${n.tag}</span>
                                <h1 class="text-xl md:text-2xl font-bold text-gray-900 w-full md:w-auto break-keep">${n.title}</h1>
                            </div>
                            <div class="h-px bg-gray-100 my-6"></div>
                            <div class="prose prose-sm max-w-none text-gray-600">
                                ${formatNoticeBody(n.body, n.body_is_html)}
                            </div>
                            ${canManageNotices() ? `
                                <div class="mt-6 flex gap-2">
                                    <button onclick="openNoticeEditor('edit', '${n.id}')" class="px-3 py-1.5 rounded-full text-xs font-bold border border-er-accent/40 text-er-dark hover:bg-er-accentLight/30">공지 수정</button>
                                    <button onclick="deleteNotice('${n.id}')" class="px-3 py-1.5 rounded-full text-xs font-bold border border-red-200 text-red-600 hover:bg-red-50">공지 삭제</button>
                                </div>
                            ` : ''}
                            
                            <div class="mt-10 p-5 bg-er-base rounded-2xl border border-er-primary/10 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                                <div>
                                    <p class="text-sm font-bold text-er-dark">문의하거나 신청하시겠어요?</p>
                                </div>
                                <button onclick="renderSection('apply')" class="px-6 py-2.5 bg-er-dark text-white rounded-full text-sm font-bold shadow-soft hover:bg-gray-800 transition-all w-full md:w-auto">
                                    문의 신청하기
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        function renderTypesGuide() {
            const types = [
                { id: 1, name: "1번 올바른 사람 (The Reformer)", color: "border-red-200", bg: "bg-red-50", desc: "올바름을 추구하며 실수를 두려워합니다.", healing: "불완전함을 수용하는 연습, 괜찮아!" },
                { id: 2, name: "2번 아낌없이 주는 사람 (The Helper)", color: "border-orange-200", bg: "bg-orange-50", desc: "사랑받기 위해 타인을 돕습니다.", healing: "내면의 욕구를 돌보는 연습" },
                { id: 3, name: "3번 성공하는 사람 (The Achiever)", color: "border-yellow-200", bg: "bg-yellow-50", desc: "성공을 통해 가치를 증명하려 합니다.", healing: "사람들의 인정말고, 내가 좋아하는거 찾기" },
                { id: 4, name: "4번 독창적인 사람 (The Individualist)", color: "border-purple-200", bg: "bg-purple-50", desc: "독특함과 깊이를 추구합니다.", healing: "감정의 균형과 일상성 회복" },
                { id: 5, name: "5번 지혜로운 사람 (The Investigator)", color: "border-blue-200", bg: "bg-blue-50", desc: "지식을 통해 유능함을 추구합니다.", healing: "신체 감각 깨우기와 연결" },
                { id: 6, name: "6번 충실한 사람 (The Loyalist)", color: "border-indigo-200", bg: "bg-indigo-50", desc: "안전을 위해 대비하고 의심합니다.", healing: "내면의 신뢰와 용기 회복" },
                { id: 7, name: "7번 명량한 사람 (The Enthusiast)", color: "border-green-200", bg: "bg-green-50", desc: "새로운 경험과 즐거움을 쫓습니다.", healing: "현재의 고요함에 머무르기" },
                { id: 8, name: "8번 강한 사람 (The Challenger)", color: "border-pink-200", bg: "bg-pink-50", desc: "강함을 통해 통제하려 합니다.", healing: "연약함을 드러내는 용기" },
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
                                                    <p class="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Healing Path</p>
                                                    <p class="text-xs text-gray-800 font-medium mt-0.5 break-keep">${t.healing}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="mt-12 text-center pb-10">
                            <button onclick="renderSection('apply')" class="bg-er-dark text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-gray-800 transition-colors text-sm">
                                전문가 상담 신청하기
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        function renderApply(payload = null) {
            const fromTest = payload?.source === 'test';
            const fromSupport = payload?.source === 'support';
            const testSummary = state.latestTestResult
                ? `약식 테스트 결과: ${state.latestTestResult.finalLabel}, 코어 ${state.latestTestResult.coreType}번, 날개 ${state.latestTestResult.wingLabel}, 하위유형 ${state.latestTestResult.subtypeSummary}, 본능 ${state.latestTestResult.instinctSummary}`
                : "";

            return `
                <div class="bg-er-base min-h-screen py-20 px-4">
                    <div class="max-w-2xl mx-auto">
                        <div class="text-center mb-10 animate-fade-in-up">
                            <h2 class="text-3xl font-bold text-gray-900">${fromSupport ? '후원·협력 신청하기' : '상담 신청하기'}</h2>
                            <p class="mt-3 text-gray-500 text-sm">${fromSupport ? '후원, 파트너십, 교회·기관 협력을 원하시면 신청 내용을 남겨주세요.' : '상담과 프로그램 참여를 원하시면 신청 내용을 남겨주세요.'}</p>
                        </div>
                        
                        <div class="bg-white rounded-3xl shadow-card floating-card p-8 md:p-10 animate-fade-in-up border border-white/40" style="animation-delay: 0.1s;">
                            ${fromTest ? `
                                <div class="mb-6 p-4 rounded-2xl border border-er-accent/30 bg-er-accent/10">
                                    <p class="text-sm font-bold text-er-dark mb-1">약식 테스트 후 이어지는 이야기</p>
                                    <p class="text-xs text-gray-600 break-keep">정식 타이핑 세션(무료)으로 더 깊은 자기 이해와 관계 이해를 함께 살펴봅니다.</p>
                                </div>
                            ` : fromSupport ? `
                                <div class="mb-6 p-4 rounded-2xl border border-er-accent/30 bg-er-accent/10">
                                    <p class="text-sm font-bold text-er-dark mb-1">후원·협력 전용 창구</p>
                                    <p class="text-xs text-gray-600 break-keep">후원 문의, 교회·기관 파트너십, 공동 프로그램 협력 요청을 이곳에 남겨주세요. 현재 후원은 개별 안내로 진행됩니다.</p>
                                </div>
                            ` : ""}

                            <div class="flex items-center justify-between mb-8 px-4 relative">
                                <div class="absolute top-1/2 left-0 w-full h-px bg-gray-100 -z-10"></div>
                                <div class="bg-white px-2"><span class="w-8 h-8 rounded-full bg-er-dark text-white flex items-center justify-center text-sm font-bold shadow-lg">1</span></div>
                                <div class="bg-white px-2"><span class="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-sm font-bold">2</span></div>
                                <div class="bg-white px-2"><span class="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-sm font-bold">3</span></div>
                            </div>

                            <form id="apply-form" class="space-y-6" onsubmit="handleApplySubmit(event, ${fromTest ? `'test'` : `'website'`})">
                                
                                <div>
                                    <label class="block text-sm font-bold text-gray-700 mb-2">이름</label>
                                    <input type="text" name="name" required class="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-er-accent focus:border-transparent outline-none transition-all" placeholder="성함을 남겨주세요">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-bold text-gray-700 mb-2">연락받으실 곳</label>
                                    <input type="text" name="contact" required class="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-er-accent focus:border-transparent outline-none transition-all" placeholder="010-0000-0000 또는 이메일">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-bold text-gray-700 mb-2">어떤 마음으로 찾아오셨나요?</label>
                                    <div class="relative">
                                        <select name="category" class="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 appearance-none focus:ring-2 focus:ring-er-accent focus:border-transparent outline-none transition-all text-gray-600">
                                            ${fromTest ? '<option selected>정식 타이핑 세션 (무료)</option>' : ""}
                                            ${fromSupport ? `
                                                <option selected>후원 문의</option>
                                                <option>교회/기관 협력 문의</option>
                                                <option>공동 프로그램 제안</option>
                                                <option>기타 협력 문의</option>
                                            ` : `
                                                <option>개인/가정 코칭 (부부, 자녀)</option>
                                                <option>교회/사역자 회복 프로그램</option>
                                                <option>비즈니스/조직 워크숍</option>
                                                <option>강사 양성 과정</option>
                                                <option>기타 문의</option>
                                            `}
                                        </select>
                                        <div class="absolute right-4 top-3.5 text-gray-400 pointer-events-none"><i class="fas fa-chevron-down"></i></div>
                                    </div>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-bold text-gray-700 mb-2">나누고 싶은 이야기</label>
                                    <textarea name="message" rows="4" class="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-er-accent focus:border-transparent outline-none transition-all resize-none" placeholder="지금의 고민이나 바라는 도움을 편하게 적어주세요.">${fromTest && testSummary ? `${testSummary}\n정식 타이핑 세션(무료) 신청합니다.` : ""}</textarea>
                                </div>

                                <div class="bg-er-base/50 p-4 rounded-xl flex gap-3 items-start">
                                    <i class="fas fa-info-circle text-er-primary mt-0.5"></i>
                                    <p class="text-xs text-gray-500 leading-relaxed">
                                        ER은 후원과 협력으로 운영되는 회복 사역입니다.
                                        코칭과 상담은 후원 여부와 관계없이 안내되며,
                                        후원은 사역을 응원하는 자발적인 선택으로 현재 개별 안내를 통해 연결됩니다. 접수 후 24시간 이내에 담당 코치 또는 운영 담당자가 연락드립니다.
                                    </p>
                                </div>

                                <div class="bg-gray-50 border border-gray-200 rounded-xl p-4">
                                    <p class="text-xs text-gray-500 mb-2">보안 확인</p>
                                    <div id="apply-turnstile-widget" class="min-h-[65px]"></div>
                                    <input type="hidden" name="turnstile_token" id="apply-turnstile-token" value="">
                                </div>
                                
                                <button id="apply-submit-btn" type="submit" class="w-full py-4 bg-er-dark text-white rounded-xl font-bold shadow-lg hover:bg-gray-800 transition-all hover:-translate-y-1">
                                    신청하기
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            `;
        }

        function renderThankYou() {
            return `
                <div class="min-h-screen flex items-center justify-center bg-er-base px-6">
                    <div class="bg-white rounded-[2rem] shadow-card floating-card p-10 max-w-sm w-full text-center animate-fade-in-up border border-white/40">
                        <div class="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-500 text-2xl mx-auto mb-6">
                            <i class="fas fa-check"></i>
                        </div>
                        <h2 class="text-xl font-bold text-gray-900 mb-2">소중한 이야기를 잘 받았습니다</h2>
                        <p class="text-gray-500 mb-8 leading-relaxed text-xs break-keep">
                            마음을 나누어 주셔서 감사합니다.<br>
                            남겨주신 연락처로 곧 정성껏 연락드리겠습니다.
                        </p>
                        <button onclick="renderSection('home')" class="w-full py-3 rounded-xl bg-er-dark text-white hover:bg-gray-800 transition-colors font-bold shadow-md text-sm">
                            처음 화면으로 돌아가기
                        </button>
                    </div>
                </div>
            `;
        }

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
            const coachBadge = state.isCoach
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
                            ${state.isCoach ? `<button onclick="renderSection('coach_portal')" class="px-6 py-2 bg-er-dark text-white rounded-full text-xs font-bold">Coach Portal</button>` : ''}
                            ${state.isCoach ? `<button onclick="openCoachApp()" class="px-6 py-2 bg-white text-er-dark rounded-full text-xs font-bold border border-er-accent/30">Coach App</button>` : ''}
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

        function renderCoachPortal() {
            if (!state.user) return renderCoachAccessDenied('로그인 후 코치 포털을 사용할 수 있습니다.');
            if (!state.isCoach) return renderCoachAccessDenied();
            const adminButton = state.coachProfile?.role === 'head_coach'
                ? `<button onclick="renderSection('coach_admin')" class="px-4 py-2 rounded-full text-xs font-bold bg-white border border-gray-200 text-gray-700">코치 승인</button>`
                : '';
            return `
                <div class="bg-er-base min-h-screen py-10 md:py-14 px-4 sm:px-6 lg:px-8">
                    <div class="max-w-6xl mx-auto space-y-6">
                        <div class="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-soft">
                            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div>
                                    <p class="text-xs tracking-[0.2em] text-er-accent font-bold uppercase">Coach Portal</p>
                                    <h2 class="text-2xl md:text-3xl font-bold text-er-dark mt-1">코치 전용 대시보드</h2>
                                    <p class="text-sm text-gray-500 mt-2">${state.coachProfile?.display_name || state.user.email || ''}님, 이번 주 일정을 확인하고 보고서를 관리하세요.</p>
                                </div>
                                <div class="flex flex-wrap gap-2">
                                    ${adminButton}
                                    <button onclick="openCoachApp()" class="px-4 py-2 rounded-full text-xs font-bold bg-white border border-er-accent/30 text-er-dark">Coach App</button>
                                    <button onclick="renderSection('coach_tasks')" class="px-4 py-2 rounded-full text-xs font-bold bg-er-dark text-white">보고서 관리</button>
                                    <button onclick="renderSection('coach_notes')" class="px-4 py-2 rounded-full text-xs font-bold bg-white border border-gray-200 text-gray-700">세션 노트</button>
                                    <button onclick="renderSection('coach_materials')" class="px-4 py-2 rounded-full text-xs font-bold bg-white border border-gray-200 text-gray-700">자료실</button>
                                    <button onclick="renderSection('coach_schedule')" class="px-4 py-2 rounded-full text-xs font-bold bg-white border border-gray-200 text-gray-700">주간 일정</button>
                                </div>
                            </div>
                        </div>
                        <div id="coach-portal-summary" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                            <div class="bg-white rounded-2xl border border-gray-100 p-5">불러오는 중...</div>
                            <div class="bg-white rounded-2xl border border-gray-100 p-5">불러오는 중...</div>
                            <div class="bg-white rounded-2xl border border-gray-100 p-5">불러오는 중...</div>
                            <div class="bg-white rounded-2xl border border-gray-100 p-5">불러오는 중...</div>
                        </div>
                        <div class="bg-white rounded-3xl border border-gray-100 p-6">
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="font-bold text-er-dark">월간 일정 캘린더</h3>
                                <div class="flex items-center gap-2">
                                    <button onclick="changeCoachCalendarMonth(-1)" class="w-8 h-8 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50"><i class="fas fa-chevron-left text-xs"></i></button>
                                    <p id="coach-calendar-month-label" class="text-sm font-semibold text-gray-700 min-w-[88px] text-center">-</p>
                                    <button onclick="changeCoachCalendarMonth(1)" class="w-8 h-8 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50"><i class="fas fa-chevron-right text-xs"></i></button>
                                </div>
                            </div>
                            <div id="coach-calendar-grid" class="text-sm text-gray-500">불러오는 중...</div>
                        </div>
                        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div class="bg-white rounded-3xl border border-gray-100 p-6">
                                <div class="flex items-center justify-between mb-4">
                                    <h3 class="font-bold text-er-dark">최근 보고서</h3>
                                    <button onclick="renderSection('coach_tasks')" class="text-xs text-er-accent font-bold">전체 보기</button>
                                </div>
                                <div id="coach-portal-tasks" class="space-y-2 text-sm text-gray-500">불러오는 중...</div>
                            </div>
                            <div class="bg-white rounded-3xl border border-gray-100 p-6">
                                <div class="flex items-center justify-between mb-4">
                                    <h3 class="font-bold text-er-dark">이번 주 일정</h3>
                                    <button onclick="renderSection('coach_schedule')" class="text-xs text-er-accent font-bold">전체 보기</button>
                                </div>
                                <div id="coach-portal-schedules" class="space-y-2 text-sm text-gray-500">불러오는 중...</div>
                            </div>
                            <div class="bg-white rounded-3xl border border-gray-100 p-6">
                                <div class="flex items-center justify-between mb-4">
                                    <h3 class="font-bold text-er-dark">최근 세션 노트</h3>
                                    <button onclick="renderSection('coach_notes')" class="text-xs text-er-accent font-bold">전체 보기</button>
                                </div>
                                <div id="coach-portal-notes" class="space-y-2 text-sm text-gray-500">불러오는 중...</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        function renderCoachAdmin() {
            if (!state.user) return renderCoachAccessDenied('로그인 후 코치 승인 기능을 사용할 수 있습니다.');
            if (!state.isCoach || state.coachProfile?.role !== 'head_coach') {
                return renderCoachAccessDenied('헤드 코치만 코치 승인 기능을 사용할 수 있습니다.');
            }
            return `
                <div class="bg-white min-h-screen py-10 px-4 sm:px-6 lg:px-8">
                    <div class="max-w-6xl mx-auto space-y-6">
                        <div class="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 class="text-2xl font-bold text-er-dark">코치 승인</h2>
                                <p class="text-sm text-gray-500 mt-1">가입한 계정을 코치로 승인하거나 비활성화할 수 있습니다.</p>
                            </div>
                            <div class="flex gap-2">
                                <button onclick="renderSection('coach_portal')" class="px-4 py-2 rounded-full text-xs font-bold bg-gray-100 text-gray-700">대시보드</button>
                                <button onclick="loadCoachAdminUsers()" class="px-4 py-2 rounded-full text-xs font-bold bg-er-dark text-white">새로고침</button>
                            </div>
                        </div>
                        <div class="bg-white border border-gray-100 rounded-3xl p-6">
                            <h3 class="text-base font-bold text-er-dark mb-4">가입자 목록</h3>
                            <div id="coach-admin-users-list" class="space-y-3 text-sm text-gray-500">불러오는 중...</div>
                        </div>
                    </div>
                </div>
            `;
        }

        function renderCoachTasks() {
            if (!state.user) return renderCoachAccessDenied('로그인 후 보고서 관리 기능을 사용할 수 있습니다.');
            if (!state.isCoach) return renderCoachAccessDenied();
            return `
                <div class="bg-white min-h-screen py-10 px-4 sm:px-6 lg:px-8">
                    <div class="max-w-6xl mx-auto space-y-6">
                        <div class="flex flex-wrap items-center justify-between gap-3">
                            <h2 class="text-2xl font-bold text-er-dark">보고서 관리</h2>
                            <div class="flex gap-2">
                                <button onclick="renderSection('coach_portal')" class="px-4 py-2 rounded-full text-xs font-bold bg-gray-100 text-gray-700">대시보드</button>
                                <button id="coach-task-toggle-btn" onclick="toggleCoachComposer('task')" class="px-4 py-2 rounded-full text-xs font-bold border border-er-dark text-er-dark bg-white">보고서 등록</button>
                                <button onclick="loadCoachTasks()" class="px-4 py-2 rounded-full text-xs font-bold bg-er-dark text-white">새로고침</button>
                            </div>
                        </div>
                        <div class="bg-white border border-gray-100 rounded-3xl p-6">
                            <h3 class="text-base font-bold text-er-dark mb-4">보고서 목록</h3>
                            <div id="coach-tasks-list" class="space-y-3 text-sm text-gray-500">불러오는 중...</div>
                            <div id="coach-task-detail" class="hidden mt-6 border border-gray-100 rounded-2xl p-4 md:p-5 bg-gray-50/50"></div>
                        </div>
                        <div id="coach-task-composer" class="hidden bg-er-base border border-er-accent/20 rounded-3xl p-6 md:p-8 space-y-4">
                            <form id="coach-task-form" onsubmit="submitCoachTask(event)" class="space-y-4">
                                <div class="flex items-center justify-between gap-3">
                                    <h3 id="coach-task-form-title" class="text-base font-bold text-er-dark">새 보고서 등록</h3>
                                    <button type="button" id="coach-task-cancel-btn" onclick="resetCoachTaskForm()" class="hidden px-3 py-1.5 rounded-full text-[11px] font-bold border border-gray-200 text-gray-700 hover:bg-gray-50">수정 취소</button>
                                </div>
                                <input type="hidden" name="task_id" value="">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input name="title" required maxlength="120" placeholder="보고서 제목" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm">
                                    <input name="due_at" type="datetime-local" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm">
                                    <input name="week_label" placeholder="주차 (예: 2026-W10)" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm">
                                    <select name="status" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm">
                                        <option value="published">게시</option>
                                        <option value="draft">임시저장</option>
                                        <option value="archived">보관</option>
                                    </select>
                                </div>
                                <textarea name="description" rows="3" placeholder="보고서 설명" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"></textarea>
                                <input name="files" type="file" multiple accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv,.zip,.hwp,.hwpx,.png,.jpg,.jpeg,.webp,.gif,.mp4,.mov,.mp3,.wav,.m4a" class="w-full rounded-xl border border-dashed border-gray-300 bg-white px-4 py-3 text-xs">
                                <button id="coach-task-submit-btn" type="submit" class="px-6 py-2 rounded-full text-xs font-bold bg-er-dark text-white">보고서 저장</button>
                            </form>
                        </div>
                    </div>
                </div>
            `;
        }

        function renderCoachMaterials() {
            if (!state.user) return renderCoachAccessDenied('로그인 후 자료실 기능을 사용할 수 있습니다.');
            if (!state.isCoach) return renderCoachAccessDenied();
            return `
                <div class="bg-white min-h-screen py-10 px-4 sm:px-6 lg:px-8">
                    <div class="max-w-6xl mx-auto space-y-6">
                        <div class="flex flex-wrap items-center justify-between gap-3">
                            <h2 class="text-2xl font-bold text-er-dark">코치 자료실</h2>
                            <div class="flex gap-2">
                                <button onclick="renderSection('coach_portal')" class="px-4 py-2 rounded-full text-xs font-bold bg-gray-100 text-gray-700">대시보드</button>
                                <button id="coach-material-toggle-btn" onclick="toggleCoachComposer('material')" class="px-4 py-2 rounded-full text-xs font-bold border border-er-dark text-er-dark bg-white">자료 업로드</button>
                                <button onclick="loadCoachMaterials()" class="px-4 py-2 rounded-full text-xs font-bold bg-er-dark text-white">새로고침</button>
                            </div>
                        </div>
                        <div class="bg-white border border-gray-100 rounded-3xl p-6">
                            <h3 class="text-base font-bold text-er-dark mb-4">자료 목록</h3>
                            <div id="coach-materials-list" class="space-y-3 text-sm text-gray-500">불러오는 중...</div>
                            <div id="coach-material-detail" class="hidden mt-6 border border-gray-100 rounded-2xl p-4 md:p-5 bg-gray-50/50"></div>
                        </div>
                        <div id="coach-material-composer" class="hidden bg-er-base border border-er-accent/20 rounded-3xl p-6 md:p-8 space-y-4">
                            <form id="coach-material-form" onsubmit="submitCoachMaterial(event)" class="space-y-4">
                                <div class="flex items-center justify-between gap-3">
                                    <h3 id="coach-material-form-title" class="text-base font-bold text-er-dark">자료 업로드</h3>
                                    <button type="button" id="coach-material-cancel-btn" onclick="resetCoachMaterialForm()" class="hidden px-3 py-1.5 rounded-full text-[11px] font-bold border border-gray-200 text-gray-700 hover:bg-gray-50">수정 취소</button>
                                </div>
                                <input type="hidden" name="material_id" value="">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input name="title" required maxlength="120" placeholder="자료 제목" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm">
                                    <select name="category" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm">
                                        <option value="general">일반</option>
                                        <option value="study_track">Study 트랙</option>
                                        <option value="spiritual_formation_track">Spiritual Formation 트랙</option>
                                        <option value="coaching_track">Coaching 트랙</option>
                                        <option value="practicum_track">Practicum 트랙</option>
                                        <option value="reference">참고자료</option>
                                    </select>
                                </div>
                                <textarea name="description" rows="3" placeholder="자료 설명" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"></textarea>
                                <input name="file" type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv,.zip,.hwp,.hwpx,.png,.jpg,.jpeg,.webp,.gif,.mp4,.mov,.mp3,.wav,.m4a" class="w-full rounded-xl border border-dashed border-gray-300 bg-white px-4 py-3 text-xs">
                                <button id="coach-material-submit-btn" type="submit" class="px-6 py-2 rounded-full text-xs font-bold bg-er-dark text-white">자료 업로드</button>
                            </form>
                        </div>
                    </div>
                </div>
            `;
        }

        function renderCoachSchedule() {
            if (!state.user) return renderCoachAccessDenied('로그인 후 일정 관리 기능을 사용할 수 있습니다.');
            if (!state.isCoach) return renderCoachAccessDenied();
            return `
                <div class="bg-white min-h-screen py-10 px-4 sm:px-6 lg:px-8">
                    <div class="max-w-6xl mx-auto space-y-6">
                        <div class="flex flex-wrap items-center justify-between gap-3">
                            <h2 class="text-2xl font-bold text-er-dark">주간 일정</h2>
                            <div class="flex gap-2">
                                <button onclick="renderSection('coach_portal')" class="px-4 py-2 rounded-full text-xs font-bold bg-gray-100 text-gray-700">대시보드</button>
                                <button onclick="loadCoachSchedules()" class="px-4 py-2 rounded-full text-xs font-bold bg-er-dark text-white">새로고침</button>
                            </div>
                        </div>
                        <div class="bg-white border border-gray-100 rounded-3xl p-6">
                            <div class="flex items-center justify-between gap-3 mb-4">
                                <h3 class="text-base font-bold text-er-dark">다가오는 일정</h3>
                                <button onclick="openScheduleModal()" class="px-4 py-2 rounded-full text-xs font-bold bg-er-dark text-white">일정등록</button>
                            </div>
                            <div id="coach-schedules-list" class="space-y-3 text-sm text-gray-500">불러오는 중...</div>
                        </div>
                    </div>
                </div>
                <div id="coach-schedule-modal" class="hidden fixed inset-0 z-[80] bg-black/50 px-4">
                    <div class="min-h-full flex items-center justify-center">
                        <div class="w-full max-w-2xl bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-2xl relative">
                            <button type="button" onclick="closeScheduleModal()" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100" aria-label="닫기">
                                <i class="fas fa-times text-sm"></i>
                            </button>
                            <h3 class="text-base font-bold text-er-dark mb-4">일정 등록</h3>
                            <form onsubmit="submitCoachSchedule(event)" class="space-y-4">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input name="title" required maxlength="120" placeholder="일정 제목" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm">
                                    <select name="schedule_type" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm">
                                        <option value="study_track">Study 트랙</option>
                                        <option value="spiritual_formation_track">Spiritual Formation 트랙</option>
                                        <option value="coaching_track">Coaching 트랙</option>
                                        <option value="practicum_track">Practicum 트랙</option>
                                    </select>
                                    <input name="start_at" type="datetime-local" required class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm">
                                    <input name="end_at" type="datetime-local" required class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm">
                                    <input name="location" placeholder="장소 / 온라인 링크" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm md:col-span-2">
                                </div>
                                <textarea name="notes" rows="2" placeholder="메모" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"></textarea>
                                <button type="submit" class="px-6 py-2 rounded-full text-xs font-bold bg-er-dark text-white">일정 저장</button>
                            </form>
                        </div>
                    </div>
                </div>
            `;
        }

        function renderCoachNotes() {
            if (!state.user) return renderCoachAccessDenied('로그인 후 세션 노트 기능을 사용할 수 있습니다.');
            if (!state.isCoach) return renderCoachAccessDenied();
            return `
                <div class="bg-white min-h-screen py-10 px-4 sm:px-6 lg:px-8">
                    <div class="max-w-6xl mx-auto space-y-6">
                        <div class="flex flex-wrap items-center justify-between gap-3">
                            <h2 class="text-2xl font-bold text-er-dark">세션 노트</h2>
                            <div class="flex gap-2">
                                <button onclick="renderSection('coach_portal')" class="px-4 py-2 rounded-full text-xs font-bold bg-gray-100 text-gray-700">대시보드</button>
                                <button id="coach-note-toggle-btn" onclick="toggleCoachComposer('note')" class="px-4 py-2 rounded-full text-xs font-bold border border-er-dark text-er-dark bg-white">세션 노트 업로드</button>
                                <button onclick="loadCoachNotes()" class="px-4 py-2 rounded-full text-xs font-bold bg-er-dark text-white">새로고침</button>
                            </div>
                        </div>
                        <div class="bg-white border border-gray-100 rounded-3xl p-6">
                            <h3 class="text-base font-bold text-er-dark mb-4">노트 목록</h3>
                            <div id="coach-notes-list" class="space-y-3 text-sm text-gray-500">불러오는 중...</div>
                            <div id="coach-note-detail" class="hidden mt-6 border border-gray-100 rounded-2xl p-4 md:p-5 bg-gray-50/50"></div>
                        </div>
                        <div id="coach-note-composer" class="hidden bg-er-base border border-er-accent/20 rounded-3xl p-6 md:p-8 space-y-4">
                            <form id="coach-note-form" onsubmit="submitCoachNote(event)" class="space-y-4">
                                <h3 class="text-base font-bold text-er-dark">세션 노트 업로드</h3>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <select name="schedule_id" required class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm">
                                        <option value="">일정을 선택해 주세요</option>
                                    </select>
                                    <input name="title" required maxlength="120" placeholder="노트 제목" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm">
                                </div>
                                <textarea name="note_body" rows="4" required placeholder="세션 메모 / follow-up / 요약" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"></textarea>
                                <input name="file" type="file" accept=".pdf,.doc,.docx,.txt,.csv,.png,.jpg,.jpeg,.webp,.gif,.mp4,.mov,.mp3,.wav,.m4a" class="w-full rounded-xl border border-dashed border-gray-300 bg-white px-4 py-3 text-xs">
                                <button type="submit" class="px-6 py-2 rounded-full text-xs font-bold bg-er-dark text-white">노트 저장</button>
                            </form>
                        </div>
                    </div>
                </div>
            `;
        }

        // --- Helper Functions ---
        function openNotices() { renderSection('notices'); }
        function openNotice(id) { renderSection('notice_detail', { id }); }
        function openCoachApp() { window.open(COACH_APP_URL, '_blank', 'noopener,noreferrer'); }

        function escapeHtml(value) {
            return String(value || '')
                .replaceAll('&', '&amp;')
                .replaceAll('<', '&lt;')
                .replaceAll('>', '&gt;')
                .replaceAll('"', '&quot;')
                .replaceAll("'", '&#39;');
        }

        function formatDateTime(value) {
            if (!value) return '-';
            const date = new Date(value);
            if (Number.isNaN(date.getTime())) return '-';
            return new Intl.DateTimeFormat('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date);
        }

        function normalizeExternalLink(value) {
            const raw = String(value || '').trim();
            if (!raw) return '';
            if (/^https?:\/\//i.test(raw) || /^zoommtg:\/\//i.test(raw)) return raw;
            if (/^www\./i.test(raw)) return `https://${raw}`;
            if (/^(?:[\w-]+\.)*zoom\.us\/\S+/i.test(raw)) return `https://${raw}`;
            return '';
        }

        function renderScheduleLocation(location) {
            const raw = String(location || '').trim();
            if (!raw) return '-';
            const href = normalizeExternalLink(raw);
            if (!href) return escapeHtml(raw);
            return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" class="text-er-accent underline underline-offset-2 break-all hover:text-er-accentDark transition-colors">${escapeHtml(raw)}</a>`;
        }

        function formatDateTimeInZone(value, timeZone, locale = 'ko-KR') {
            if (!value) return '-';
            const date = new Date(value);
            if (Number.isNaN(date.getTime())) return '-';
            return new Intl.DateTimeFormat(locale, {
                timeZone,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                weekday: 'short',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }).format(date);
        }

        function getDateKeyInZone(value, timeZone) {
            const date = new Date(value);
            if (Number.isNaN(date.getTime())) return '';
            return new Intl.DateTimeFormat('en-CA', {
                timeZone,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).format(date);
        }

        function formatDateLabelInZone(value, timeZone, locale = 'ko-KR') {
            const date = new Date(value);
            if (Number.isNaN(date.getTime())) return '-';
            return new Intl.DateTimeFormat(locale, {
                timeZone,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                weekday: 'short'
            }).format(date);
        }

        function formatTimeLabelInZone(value, timeZone, locale = 'ko-KR') {
            const date = new Date(value);
            if (Number.isNaN(date.getTime())) return '-';
            return new Intl.DateTimeFormat(locale, {
                timeZone,
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            }).format(date);
        }

        function getKoreanTimePartsInZone(value, timeZone) {
            const date = new Date(value);
            if (Number.isNaN(date.getTime())) return null;
            const parts = new Intl.DateTimeFormat('ko-KR', {
                timeZone,
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            }).formatToParts(date);
            const dayPeriod = parts.find((p) => p.type === 'dayPeriod')?.value || '';
            const hour = parts.find((p) => p.type === 'hour')?.value || '';
            const minute = parts.find((p) => p.type === 'minute')?.value || '';
            return { dayPeriod, hour, minute };
        }

        function formatZoneRange(startAt, endAt, zoneName, timeZone) {
            const startKey = getDateKeyInZone(startAt, timeZone);
            const endKey = getDateKeyInZone(endAt, timeZone);
            const startDate = formatDateLabelInZone(startAt, timeZone, 'ko-KR');
            const endDate = formatDateLabelInZone(endAt, timeZone, 'ko-KR');
            const startParts = getKoreanTimePartsInZone(startAt, timeZone);
            const endParts = getKoreanTimePartsInZone(endAt, timeZone);
            if (!startParts || !endParts) return `${zoneName}: -`;

            const startFullTime = `${startParts.dayPeriod} ${startParts.hour}:${startParts.minute}`;
            const endFullTime = `${endParts.dayPeriod} ${endParts.hour}:${endParts.minute}`;
            const endShortTime = `${endParts.hour}:${endParts.minute}`;

            if (startKey && startKey === endKey) {
                const endTime = startParts.dayPeriod === endParts.dayPeriod ? endShortTime : endFullTime;
                return `${zoneName}: ${startDate} ${startFullTime} - ${endTime}`;
            }
            return `${zoneName}: ${startDate} ${startFullTime} - ${endDate} ${endFullTime}`;
        }

        function formatScheduleDualRange(startAt, endAt) {
            return {
                kr: formatZoneRange(startAt, endAt, '한국', 'Asia/Seoul'),
                ct: formatZoneRange(startAt, endAt, '달라스', 'America/Chicago')
            };
        }

        function formatCoachScheduleTypeLabel(value) {
            const labels = {
                study: 'Study 트랙',
                training: 'Coaching 트랙',
                study_track: 'Study 트랙',
                spiritual_formation_track: 'Spiritual Formation 트랙',
                coaching_track: 'Coaching 트랙',
                practicum_track: 'Practicum 트랙'
            };
            return labels[String(value || '').trim()] || String(value || '일정');
        }

        function toIsoOrNull(localValue) {
            if (!localValue) return null;
            const date = new Date(localValue);
            return Number.isNaN(date.getTime()) ? null : date.toISOString();
        }

        function toLocalDatetimeInputValue(value) {
            if (!value) return '';
            const date = new Date(value);
            if (Number.isNaN(date.getTime())) return '';
            const pad = (n) => String(n).padStart(2, '0');
            const year = date.getFullYear();
            const month = pad(date.getMonth() + 1);
            const day = pad(date.getDate());
            const hours = pad(date.getHours());
            const minutes = pad(date.getMinutes());
            return `${year}-${month}-${day}T${hours}:${minutes}`;
        }

        function getFileSizeLabel(sizeBytes) {
            if (!sizeBytes || sizeBytes < 1) return '-';
            if (sizeBytes < 1024 * 1024) return `${Math.round(sizeBytes / 1024)}KB`;
            return `${(sizeBytes / (1024 * 1024)).toFixed(1)}MB`;
        }

        function getCoachCalendarMonthStart() {
            const now = new Date();
            if (!state.coachCalendarMonth) {
                return new Date(now.getFullYear(), now.getMonth(), 1);
            }
            const month = new Date(state.coachCalendarMonth);
            if (Number.isNaN(month.getTime())) return new Date(now.getFullYear(), now.getMonth(), 1);
            return new Date(month.getFullYear(), month.getMonth(), 1);
        }

        function changeCoachCalendarMonth(offset) {
            const month = getCoachCalendarMonthStart();
            month.setMonth(month.getMonth() + Number(offset || 0));
            state.coachCalendarMonth = month.toISOString();
            loadCoachPortalDashboard();
        }

        function renderCoachCalendar(monthStart, schedules) {
            const labelEl = document.getElementById('coach-calendar-month-label');
            const gridEl = document.getElementById('coach-calendar-grid');
            if (!gridEl) return;
            if (labelEl) {
                labelEl.textContent = `${monthStart.getFullYear()}.${String(monthStart.getMonth() + 1).padStart(2, '0')}`;
            }

            const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
            const monthIndex = monthStart.getMonth();
            const firstWeekday = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1).getDay();
            const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
            const counts = {};

            (schedules || []).forEach((item) => {
                const d = new Date(item.start_at);
                if (Number.isNaN(d.getTime())) return;
                if (d.getMonth() !== monthIndex || d.getFullYear() !== monthStart.getFullYear()) return;
                const key = d.getDate();
                counts[key] = (counts[key] || 0) + 1;
            });

            let cells = '';
            for (let i = 0; i < 42; i += 1) {
                const day = i - firstWeekday + 1;
                if (day < 1 || day > daysInMonth) {
                    cells += `<div class="h-16 rounded-xl border border-transparent bg-gray-50/50"></div>`;
                    continue;
                }
                const c = counts[day] || 0;
                cells += `
                    <button type="button" onclick="renderSection('coach_schedule')" class="h-16 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 text-left p-2 flex flex-col justify-between">
                        <span class="text-xs font-semibold text-gray-700">${day}</span>
                        ${c ? `<span class="text-[10px] px-1.5 py-0.5 rounded-full bg-er-accentLight text-er-dark font-bold self-start">${c}건</span>` : '<span class="text-[10px] text-gray-300">-</span>'}
                    </button>
                `;
            }

            gridEl.innerHTML = `
                <div class="grid grid-cols-7 gap-2 mb-2">
                    ${dayNames.map((d) => `<div class="text-center text-xs font-bold text-gray-400">${d}</div>`).join('')}
                </div>
                <div class="grid grid-cols-7 gap-2">${cells}</div>
            `;
        }

        const ALLOWED_UPLOAD_EXTENSIONS = new Set([
            'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'csv', 'zip', 'hwp', 'hwpx',
            'png', 'jpg', 'jpeg', 'webp', 'gif',
            'mp4', 'mov', 'mp3', 'wav', 'm4a'
        ]);
        const MAX_UPLOAD_SIZE_BYTES = 100 * 1024 * 1024; // 100MB

        function getFileExtension(name) {
            const value = String(name || '');
            const idx = value.lastIndexOf('.');
            if (idx < 0) return '';
            return value.slice(idx + 1).toLowerCase();
        }

        function buildSafeStorageFileName(originalName) {
            const raw = String(originalName || 'file');
            const dotIndex = raw.lastIndexOf('.');
            const base = dotIndex >= 0 ? raw.slice(0, dotIndex) : raw;
            const ext = dotIndex >= 0 ? raw.slice(dotIndex + 1).toLowerCase() : '';

            const safeBase = base
                .normalize('NFKD')
                .replace(/[^\w.-]+/g, '_')
                .replace(/_+/g, '_')
                .replace(/^[_\-.]+|[_\-.]+$/g, '') || 'file';

            const safeExt = ext.replace(/[^a-z0-9]+/g, '');
            return safeExt ? `${safeBase}.${safeExt}` : safeBase;
        }

        function validateUploadFile(file) {
            if (!file) return { ok: false, reason: '파일이 없습니다.' };
            const ext = getFileExtension(file.name);
            if (!ALLOWED_UPLOAD_EXTENSIONS.has(ext)) {
                return { ok: false, reason: `지원하지 않는 파일 형식입니다: .${ext || 'unknown'}` };
            }
            if (file.size > MAX_UPLOAD_SIZE_BYTES) {
                return { ok: false, reason: `파일이 너무 큽니다 (최대 100MB): ${file.name}` };
            }
            return { ok: true };
        }

        function ensureCoachAccess() {
            if (!state.user) {
                openAuthModal();
                return false;
            }
            if (!state.isCoach) {
                renderSection('mypage');
                return false;
            }
            return true;
        }

        function isHeadCoach() {
            return !!(state.isCoach && state.coachProfile?.role === 'head_coach');
        }

        function canManageNotices() {
            const email = (state.user?.email || '').toLowerCase();
            return email === NOTICE_ADMIN_EMAIL || isHeadCoach();
        }

        async function loadCoachPortalDashboard() {
            if (!ensureCoachAccess() || !supabaseClient) return;
            const monthStart = getCoachCalendarMonthStart();
            state.coachCalendarMonth = monthStart.toISOString();
            const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);
            const [taskRes, scheduleRes, materialRes, noteRes] = await Promise.all([
                supabaseClient.from('coach_tasks').select('id, title, due_at, status').order('created_at', { ascending: false }).limit(5),
                supabaseClient.from('coach_schedules').select('id, title, start_at, end_at, schedule_type').gte('end_at', new Date().toISOString()).order('start_at', { ascending: true }).limit(5),
                supabaseClient.from('coach_materials').select('id').limit(1000),
                supabaseClient.from('coach_session_notes').select('id, schedule_id, title, note_body, attachment_name, created_at').order('created_at', { ascending: false }).limit(5)
            ]);
            const { data: calendarSchedules } = await supabaseClient
                .from('coach_schedules')
                .select('id, title, start_at, end_at, schedule_type')
                .gte('start_at', monthStart.toISOString())
                .lt('start_at', monthEnd.toISOString())
                .order('start_at', { ascending: true });
            const tasks = taskRes.data || [];
            const schedules = scheduleRes.data || [];
            const materialCount = materialRes.data ? materialRes.data.length : 0;
            const notes = noteRes.data || [];
            renderCoachCalendar(monthStart, calendarSchedules || []);

            const summaryEl = document.getElementById('coach-portal-summary');
            if (summaryEl) {
                summaryEl.innerHTML = `
                    <button type="button" onclick="renderSection('coach_tasks')" class="text-left bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-soft transition-shadow">
                        <p class="text-xs text-gray-400">최근 보고서</p>
                        <p class="text-3xl font-bold text-er-dark mt-2">${tasks.length}</p>
                    </button>
                    <button type="button" onclick="renderSection('coach_schedule')" class="text-left bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-soft transition-shadow">
                        <p class="text-xs text-gray-400">다가오는 일정</p>
                        <p class="text-3xl font-bold text-er-dark mt-2">${schedules.length}</p>
                    </button>
                    <button type="button" onclick="renderSection('coach_materials')" class="text-left bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-soft transition-shadow">
                        <p class="text-xs text-gray-400">공유 자료 수</p>
                        <p class="text-3xl font-bold text-er-dark mt-2">${materialCount}</p>
                    </button>
                    <button type="button" onclick="renderSection('coach_notes')" class="text-left bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-soft transition-shadow">
                        <p class="text-xs text-gray-400">최근 세션 노트</p>
                        <p class="text-3xl font-bold text-er-dark mt-2">${notes.length}</p>
                    </button>
                `;
            }

            const tasksEl = document.getElementById('coach-portal-tasks');
            if (tasksEl) {
                tasksEl.innerHTML = tasks.length
                    ? tasks.map((task) => `
                        <button type="button" onclick="openCoachTaskFromDashboard('${task.id}')" class="w-full text-left p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                            <p class="font-semibold text-gray-800">${escapeHtml(task.title)}</p>
                            <p class="text-xs text-gray-500 mt-1">마감: ${formatDateTime(task.due_at)} · 상태: ${escapeHtml(task.status)}</p>
                        </button>
                    `).join('')
                    : '<p class="text-sm text-gray-500">등록된 보고서가 없습니다.</p>';
            }

            const schedulesEl = document.getElementById('coach-portal-schedules');
            if (schedulesEl) {
                schedulesEl.innerHTML = schedules.length
                    ? schedules.map((item) => {
                        const dual = formatScheduleDualRange(item.start_at, item.end_at);
                        return `
                        <button type="button" onclick="renderSection('coach_schedule')" class="w-full text-left p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                            <p class="font-semibold text-gray-800">${escapeHtml(item.title)}</p>
                            <p class="text-xs text-gray-500 mt-1">${escapeHtml(formatCoachScheduleTypeLabel(item.schedule_type))}</p>
                            <p class="text-xs text-gray-500 mt-1">${escapeHtml(dual.kr)}</p>
                            <p class="text-xs text-gray-500 mt-1">${escapeHtml(dual.ct)}</p>
                        </button>
                    `;
                    }).join('')
                    : '<p class="text-sm text-gray-500">다가오는 일정이 없습니다.</p>';
            }

            const notesEl = document.getElementById('coach-portal-notes');
            if (notesEl) {
                notesEl.innerHTML = notes.length
                    ? notes.map((note) => `
                        <button type="button" onclick="viewCoachNoteDetail('${note.id}', true)" class="w-full text-left p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                            <p class="font-semibold text-gray-800">${escapeHtml(note.title)}</p>
                            <p class="text-xs text-gray-500 mt-1 line-clamp-2 break-keep">${escapeHtml(note.note_body || '')}</p>
                            <p class="text-xs text-gray-500 mt-1">등록: ${formatDateTime(note.created_at)}${note.attachment_name ? ` · 첨부: ${escapeHtml(note.attachment_name)}` : ''}</p>
                        </button>
                    `).join('')
                    : '<p class="text-sm text-gray-500">등록된 세션 노트가 없습니다.</p>';
            }
        }

        async function loadCoachAdminUsers() {
            if (!ensureCoachAccess() || !isHeadCoach() || !supabaseClient) return;
            const listEl = document.getElementById('coach-admin-users-list');
            if (listEl) listEl.innerHTML = '불러오는 중...';

            const { data, error } = await supabaseClient.rpc('admin_list_coach_candidates');
            if (error) {
                if (listEl) listEl.innerHTML = `<p class="text-red-500 text-xs">가입자 목록 로딩 실패: ${escapeHtml(error.message)}</p>`;
                return;
            }

            state.coachAdminUsers = data || [];
            if (!listEl) return;
            if (!state.coachAdminUsers.length) {
                listEl.innerHTML = '<p class="text-sm text-gray-500">가입한 사용자가 없습니다.</p>';
                return;
            }

            listEl.innerHTML = state.coachAdminUsers.map((item) => {
                const isCurrentUser = item.user_id === state.user?.id;
                const isActiveCoach = !!item.is_coach;
                const roleLabel = item.role === 'head_coach' ? '헤드 코치' : (isActiveCoach ? '코치' : '일반 계정');
                const statusLabel = isActiveCoach
                    ? '활성 코치'
                    : (item.display_name ? '비활성 코치' : '승인 대기');
                const actionButton = isActiveCoach
                    ? `<button onclick="disableCoachCandidate('${item.user_id}')" ${isCurrentUser ? 'disabled' : ''} class="px-3 py-1.5 rounded-full text-[11px] font-bold border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed">비활성화</button>`
                    : `<button onclick="approveCoachCandidate('${item.user_id}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold bg-er-dark text-white">코치 승인</button>`;

                return `
                    <div class="border border-gray-100 rounded-2xl p-4">
                        <div class="flex flex-wrap items-start justify-between gap-3">
                            <div class="min-w-0">
                                <p class="font-bold text-gray-900 break-all">${escapeHtml(item.email || '-')}</p>
                                <p class="text-xs text-gray-500 mt-1">
                                    이름: ${escapeHtml(item.display_name || '-')} · 권한: ${escapeHtml(roleLabel)} · 상태: ${escapeHtml(statusLabel)}
                                </p>
                                <p class="text-xs text-gray-400 mt-1">가입일: ${formatDateTime(item.created_at)}</p>
                            </div>
                            <div class="flex flex-wrap gap-2">
                                ${item.role === 'head_coach' ? '<span class="px-3 py-1.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">헤드 코치</span>' : ''}
                                ${actionButton}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function findCoachAdminUser(userId) {
            return (state.coachAdminUsers || []).find((item) => item.user_id === userId) || null;
        }

        async function approveCoachCandidate(userId) {
            if (!ensureCoachAccess() || !isHeadCoach() || !supabaseClient) return;
            const target = findCoachAdminUser(userId);
            if (!target) {
                alert('대상 사용자를 다시 불러와 주세요.');
                return;
            }

            const suggestedName = target.display_name || target.email?.split('@')[0] || '';
            const displayName = prompt('코치 이름을 입력해 주세요.', suggestedName);
            if (displayName === null) return;

            const { error } = await supabaseClient.rpc('admin_upsert_coach_profile', {
                p_user_id: userId,
                p_display_name: String(displayName || '').trim(),
                p_role: target.role === 'head_coach' ? 'head_coach' : 'coach',
                p_is_active: true
            });

            if (error) {
                alert(`코치 승인 실패: ${error.message}`);
                return;
            }

            await loadCoachAdminUsers();
            await loadCoachProfile();
            alert('코치 승인 처리가 완료되었습니다.');
        }

        async function disableCoachCandidate(userId) {
            if (!ensureCoachAccess() || !isHeadCoach() || !supabaseClient) return;
            if (userId === state.user?.id) {
                alert('현재 로그인한 헤드 코치는 여기서 비활성화할 수 없습니다.');
                return;
            }
            if (!confirm('이 코치를 비활성화할까요? 로그인은 유지되지만 코치 포털 접근은 막힙니다.')) return;

            const { error } = await supabaseClient.rpc('admin_disable_coach_profile', {
                p_user_id: userId
            });

            if (error) {
                alert(`코치 비활성화 실패: ${error.message}`);
                return;
            }

            await loadCoachAdminUsers();
            alert('코치가 비활성화되었습니다.');
        }

        function openCoachTaskFromDashboard(taskId) {
            renderSection('coach_tasks');
            setTimeout(() => viewCoachTaskDetail(taskId), 120);
        }

        async function populateCoachNoteScheduleOptions(selectedScheduleId = '') {
            if (!ensureCoachAccess() || !supabaseClient) return;
            const selectEl = document.querySelector('#coach-note-form select[name="schedule_id"]');
            if (!selectEl) return;

            const { data, error } = await supabaseClient
                .from('coach_schedules')
                .select('id, title, start_at, end_at')
                .order('start_at', { ascending: false })
                .limit(100);

            if (error) {
                selectEl.innerHTML = '<option value="">일정 로딩 실패</option>';
                return;
            }

            const options = (data || []).map((item) => {
                const selected = String(selectedScheduleId) === String(item.id) ? 'selected' : '';
                return `<option value="${item.id}" ${selected}>${escapeHtml(item.title)} · ${escapeHtml(formatDateTime(item.start_at))}</option>`;
            }).join('');

            selectEl.innerHTML = `<option value="">일정을 선택해 주세요</option>${options}`;
            if (!selectedScheduleId && data?.length) {
                selectEl.value = data[0].id;
            }
        }

        async function loadCoachNotes() {
            if (!ensureCoachAccess() || !supabaseClient) return;
            const listEl = document.getElementById('coach-notes-list');
            if (listEl) listEl.innerHTML = '불러오는 중...';
            await populateCoachNoteScheduleOptions();

            const { data: notes, error } = await supabaseClient
                .from('coach_session_notes')
                .select('id, schedule_id, title, note_body, attachment_path, attachment_name, attachment_size_bytes, created_at, uploaded_by')
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) {
                if (listEl) listEl.innerHTML = `<p class="text-red-500 text-xs">세션 노트 로딩 실패: ${escapeHtml(error.message)}</p>`;
                return;
            }

            const scheduleIds = [...new Set((notes || []).map((item) => item.schedule_id).filter(Boolean))];
            let scheduleMap = {};
            if (scheduleIds.length) {
                const { data: schedules } = await supabaseClient
                    .from('coach_schedules')
                    .select('id, title, start_at, end_at')
                    .in('id', scheduleIds);
                scheduleMap = Object.fromEntries((schedules || []).map((item) => [item.id, item]));
            }

            if (listEl) {
                state.coachListCounts.notes = (notes || []).length;
                listEl.innerHTML = (notes || []).length
                    ? notes.map((note) => {
                        const schedule = scheduleMap[note.schedule_id];
                        return `
                            <div class="border border-gray-100 rounded-2xl p-4">
                                <div class="flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                        <button type="button" onclick="viewCoachNoteDetail('${note.id}')" class="text-left font-bold text-gray-900 hover:text-er-accent transition-colors">${escapeHtml(note.title)}</button>
                                        <p class="text-xs text-gray-400 mt-1">${escapeHtml(schedule?.title || '연결된 일정 없음')} · ${formatDateTime(note.created_at)}</p>
                                    </div>
                                    <div class="flex gap-2">
                                        <button onclick="viewCoachNoteDetail('${note.id}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold border border-gray-200 text-gray-700 hover:bg-gray-50">보기</button>
                                        ${note.attachment_path ? `<button onclick="downloadCoachNoteAttachment('${encodeURIComponent(note.attachment_path || '')}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold border border-gray-200 text-gray-700 hover:bg-gray-50">첨부 다운로드</button>` : ''}
                                        ${state.user && (note.uploaded_by === state.user.id || isHeadCoach())
                                            ? `<button onclick="deleteCoachNote('${note.id}','${encodeURIComponent(note.attachment_path || '')}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold border border-red-200 text-red-600 hover:bg-red-50">삭제</button>`
                                            : ''}
                                    </div>
                                </div>
                                <p class="text-xs text-gray-500 mt-2 break-keep">${escapeHtml(note.note_body || '')}</p>
                            </div>
                        `;
                    }).join('')
                    : '<p class="text-sm text-gray-500">등록된 세션 노트가 없습니다.</p>';
            }

            setCoachComposerVisibility('note', !(notes || []).length);
        }

        async function viewCoachNoteDetail(noteId, fromDashboard = false) {
            if (!ensureCoachAccess() || !supabaseClient) return;
            if (fromDashboard && state.currentSection !== 'coach_notes') {
                renderSection('coach_notes');
                setTimeout(() => viewCoachNoteDetail(noteId, false), 120);
                return;
            }

            const detailEl = document.getElementById('coach-note-detail');
            if (!detailEl) return;
            detailEl.classList.remove('hidden');
            detailEl.innerHTML = '불러오는 중...';

            const { data: note, error } = await supabaseClient
                .from('coach_session_notes')
                .select('id, schedule_id, title, note_body, attachment_path, attachment_name, attachment_size_bytes, created_at, uploaded_by')
                .eq('id', noteId)
                .maybeSingle();

            if (error || !note) {
                detailEl.innerHTML = `<p class="text-xs text-red-500">세션 노트 상세 로딩 실패: ${escapeHtml(error?.message || 'not found')}</p>`;
                return;
            }

            const { data: schedule } = await supabaseClient
                .from('coach_schedules')
                .select('id, title, start_at, end_at, location')
                .eq('id', note.schedule_id)
                .maybeSingle();

            const scheduleStartLabel = schedule ? escapeHtml(formatDateTime(schedule.start_at)) : '';
            const scheduleLocationLabel = schedule && schedule.location ? ` · ${renderScheduleLocation(schedule.location)}` : '';

            detailEl.innerHTML = `
                <div class="flex items-start justify-between gap-3">
                    <div>
                        <h4 class="text-base font-bold text-gray-900">${escapeHtml(note.title)}</h4>
                        <p class="text-xs text-gray-500 mt-1">등록: ${formatDateTime(note.created_at)}</p>
                        <p class="text-xs text-gray-500 mt-1">일정: ${escapeHtml(schedule?.title || '연결된 일정 없음')}</p>
                        <p class="text-xs text-gray-400 mt-1">${schedule ? `${scheduleStartLabel}${scheduleLocationLabel}` : ''}</p>
                    </div>
                    <div class="flex gap-2">
                        ${note.attachment_path ? `<button onclick="downloadCoachNoteAttachment('${encodeURIComponent(note.attachment_path || '')}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold border border-gray-200 text-gray-700 hover:bg-gray-50">첨부 다운로드</button>` : ''}
                        ${state.user && (note.uploaded_by === state.user.id || isHeadCoach()) ? `<button onclick="deleteCoachNote('${note.id}','${encodeURIComponent(note.attachment_path || '')}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold border border-red-200 text-red-600 hover:bg-red-50">삭제</button>` : ''}
                    </div>
                </div>
                <div class="mt-4 p-3 rounded-xl border border-gray-100 bg-white text-sm text-gray-700 break-keep">${escapeHtml(note.note_body || '-')}</div>
                ${note.attachment_name ? `<p class="mt-4 text-xs text-gray-500">첨부: ${escapeHtml(note.attachment_name)} · ${getFileSizeLabel(note.attachment_size_bytes)}</p>` : '<p class="mt-4 text-xs text-gray-500">첨부파일이 없습니다.</p>'}
            `;
        }

        async function submitCoachNote(event) {
            event.preventDefault();
            if (!ensureCoachAccess() || !supabaseClient) return;
            const form = event.target;
            const formData = new FormData(form);
            const schedule_id = String(formData.get('schedule_id') || '').trim();
            const title = String(formData.get('title') || '').trim();
            const note_body = String(formData.get('note_body') || '').trim();
            const file = form.querySelector('input[name="file"]')?.files?.[0];

            if (!schedule_id || !title || !note_body) {
                alert('일정, 제목, 노트 내용을 모두 입력해 주세요.');
                return;
            }

            let attachment_path = null;
            let attachment_name = null;
            let attachment_mime_type = null;
            let attachment_size_bytes = null;

            if (file) {
                const check = validateUploadFile(file);
                if (!check.ok) {
                    alert(check.reason);
                    return;
                }
                const safeName = `${Date.now()}_${buildSafeStorageFileName(file.name)}`;
                const storagePath = `${schedule_id}/${safeName}`;
                const uploadRes = await supabaseClient.storage.from('coach-session-notes').upload(storagePath, file, {
                    upsert: false,
                    contentType: file.type || undefined
                });
                if (uploadRes.error) {
                    alert(`첨부 업로드 실패: ${uploadRes.error.message}`);
                    return;
                }
                attachment_path = storagePath;
                attachment_name = file.name;
                attachment_mime_type = file.type || null;
                attachment_size_bytes = file.size || null;
            }

            const { data: inserted, error } = await supabaseClient
                .from('coach_session_notes')
                .insert([{
                    schedule_id,
                    title,
                    note_body,
                    attachment_path,
                    attachment_name,
                    attachment_mime_type,
                    attachment_size_bytes,
                    uploaded_by: state.user.id
                }])
                .select('id')
                .single();

            if (error || !inserted?.id) {
                alert(`세션 노트 저장 실패: ${error?.message || 'unknown error'}`);
                return;
            }

            form.reset();
            await populateCoachNoteScheduleOptions();
            await loadCoachNotes();
            setCoachComposerVisibility('note', state.coachListCounts.notes === 0);
            await viewCoachNoteDetail(inserted.id);
            alert('세션 노트가 저장되었습니다.');
        }

        async function downloadCoachNoteAttachment(encodedStoragePath) {
            if (!ensureCoachAccess() || !supabaseClient) return;
            const path = decodeURIComponent(String(encodedStoragePath || ''));
            if (!path) return;
            const { data, error } = await supabaseClient.storage.from('coach-session-notes').createSignedUrl(path, 60);
            if (error || !data?.signedUrl) {
                alert(`첨부 다운로드 링크 생성 실패: ${error?.message || 'unknown error'}`);
                return;
            }
            window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
        }

        async function deleteCoachNote(noteId, encodedAttachmentPath) {
            if (!ensureCoachAccess() || !supabaseClient) return;
            if (!confirm('이 세션 노트를 삭제할까요?')) return;

            const { data: existing, error: existingError } = await supabaseClient
                .from('coach_session_notes')
                .select('id, uploaded_by, attachment_path')
                .eq('id', noteId)
                .maybeSingle();
            if (existingError || !existing) {
                alert(`세션 노트 조회 실패: ${existingError?.message || 'not found'}`);
                return;
            }
            if (!state.user || (existing.uploaded_by !== state.user.id && !isHeadCoach())) {
                alert('업로드한 본인 또는 관리자만 삭제할 수 있습니다.');
                return;
            }

            const attachmentPath = decodeURIComponent(String(encodedAttachmentPath || existing.attachment_path || ''));
            if (attachmentPath) {
                await supabaseClient.storage.from('coach-session-notes').remove([attachmentPath]);
            }

            const { error } = await supabaseClient
                .from('coach_session_notes')
                .delete()
                .eq('id', noteId);
            if (error) {
                alert(`세션 노트 삭제 실패: ${error.message}`);
                return;
            }

            const detailEl = document.getElementById('coach-note-detail');
            if (detailEl) {
                detailEl.classList.add('hidden');
                detailEl.innerHTML = '';
            }
            await loadCoachNotes();
            alert('세션 노트가 삭제되었습니다.');
        }

        async function loadCoachTasks() {
            if (!ensureCoachAccess() || !supabaseClient) return;
            const listEl = document.getElementById('coach-tasks-list');
            if (listEl) listEl.innerHTML = '불러오는 중...';

            const { data: tasks, error } = await supabaseClient
                .from('coach_tasks')
                .select('id, title, description, due_at, week_label, status, created_at, coach_task_files(id)')
                .order('created_at', { ascending: false })
                .limit(30);

            if (error) {
                if (listEl) listEl.innerHTML = `<p class="text-red-500 text-xs">보고서 로딩 실패: ${escapeHtml(error.message)}</p>`;
                return;
            }

            if (listEl) {
                state.coachListCounts.tasks = (tasks || []).length;
                listEl.innerHTML = (tasks || []).length
                    ? tasks.map((task) => `
                        <div class="border border-gray-100 rounded-2xl p-4">
                            <div class="flex flex-wrap items-center justify-between gap-2">
                                <h4 class="font-bold text-gray-900">${escapeHtml(task.title)}</h4>
                                <span class="text-[11px] px-2 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-600">${escapeHtml(task.status || '-')}</span>
                            </div>
                            <p class="text-xs text-gray-500 mt-2 break-keep">${escapeHtml(task.description || '-')}</p>
                            <p class="text-xs text-gray-400 mt-2">주차: ${escapeHtml(task.week_label || '-')} · 마감: ${formatDateTime(task.due_at)} · 첨부: ${(task.coach_task_files || []).length}개</p>
                            <div class="mt-3 flex gap-2">
                                <button onclick="viewCoachTaskDetail('${task.id}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold border border-gray-200 text-gray-700 hover:bg-gray-50">상세 보기</button>
                                <button onclick="editCoachTask('${task.id}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold bg-er-dark text-white">수정</button>
                                <button onclick="deleteCoachTask('${task.id}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold border border-red-200 text-red-600 hover:bg-red-50">삭제</button>
                            </div>
                        </div>
                    `).join('')
                    : '<p class="text-sm text-gray-500">등록된 보고서가 없습니다.</p>';
            }

            setCoachComposerVisibility('task', !(tasks || []).length);
        }

        async function viewCoachTaskDetail(taskId) {
            if (!ensureCoachAccess() || !supabaseClient) return;
            const detailEl = document.getElementById('coach-task-detail');
            if (!detailEl) return;
            detailEl.classList.remove('hidden');
            detailEl.innerHTML = '불러오는 중...';

            const { data: task, error } = await supabaseClient
                .from('coach_tasks')
                .select('id, title, description, due_at, week_label, status, created_at')
                .eq('id', taskId)
                .maybeSingle();

            if (error || !task) {
                detailEl.innerHTML = `<p class="text-xs text-red-500">보고서 상세 로딩 실패: ${escapeHtml(error?.message || 'not found')}</p>`;
                return;
            }

            const { data: files } = await supabaseClient
                .from('coach_task_files')
                .select('id, original_name, size_bytes, storage_path, created_at')
                .eq('task_id', taskId)
                .order('created_at', { ascending: false });

            detailEl.innerHTML = `
                <div class="flex items-start justify-between gap-3">
                    <div>
                        <h4 class="text-base font-bold text-gray-900">${escapeHtml(task.title)}</h4>
                        <p class="text-xs text-gray-500 mt-1">상태: ${escapeHtml(task.status || '-')} · 주차: ${escapeHtml(task.week_label || '-')}</p>
                        <p class="text-xs text-gray-500 mt-1">마감: ${formatDateTime(task.due_at)} · 등록: ${formatDateTime(task.created_at)}</p>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="editCoachTask('${task.id}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold bg-er-dark text-white">이 보고서 수정</button>
                        <button onclick="deleteCoachTask('${task.id}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold border border-red-200 text-red-600 hover:bg-red-50">삭제</button>
                    </div>
                </div>
                <div class="mt-4 p-3 rounded-xl border border-gray-100 bg-white text-sm text-gray-700 break-keep">${escapeHtml(task.description || '-')}</div>
                <div class="mt-4">
                    <h5 class="text-sm font-bold text-gray-800 mb-2">첨부파일</h5>
                    <div class="space-y-2">
                        ${(files || []).length ? files.map((file) => `
                            <div class="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-gray-100 bg-white">
                                <div class="min-w-0">
                                    <p class="text-xs font-semibold text-gray-800 truncate">${escapeHtml(file.original_name || '-')}</p>
                                    <p class="text-[11px] text-gray-500">${getFileSizeLabel(file.size_bytes)} · ${formatDateTime(file.created_at)}</p>
                                </div>
                                <button onclick="downloadCoachTaskFile('${encodeURIComponent(file.storage_path || '')}')" class="shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold border border-gray-200 text-gray-700 hover:bg-gray-50">다운로드</button>
                            </div>
                        `).join('') : '<p class="text-xs text-gray-500">첨부파일이 없습니다.</p>'}
                    </div>
                </div>
            `;
        }

        async function editCoachTask(taskId) {
            if (!ensureCoachAccess() || !supabaseClient) return;
            const { data: task, error } = await supabaseClient
                .from('coach_tasks')
                .select('id, title, description, due_at, week_label, status')
                .eq('id', taskId)
                .maybeSingle();

            if (error || !task) {
                alert(`수정 데이터 로딩 실패: ${error?.message || 'not found'}`);
                return;
            }

            const form = document.getElementById('coach-task-form');
            if (!form) return;
            setCoachComposerVisibility('task', true);
            form.querySelector('input[name="task_id"]').value = task.id;
            form.querySelector('input[name="title"]').value = task.title || '';
            form.querySelector('input[name="due_at"]').value = toLocalDatetimeInputValue(task.due_at);
            form.querySelector('input[name="week_label"]').value = task.week_label || '';
            form.querySelector('select[name="status"]').value = task.status || 'published';
            form.querySelector('textarea[name="description"]').value = task.description || '';

            const titleEl = document.getElementById('coach-task-form-title');
            if (titleEl) titleEl.textContent = '보고서 수정';
            const submitBtn = document.getElementById('coach-task-submit-btn');
            if (submitBtn) submitBtn.textContent = '보고서 수정 저장';
            const cancelBtn = document.getElementById('coach-task-cancel-btn');
            if (cancelBtn) cancelBtn.classList.remove('hidden');

            form.scrollIntoView({ behavior: 'smooth', block: 'start' });
            await viewCoachTaskDetail(task.id);
        }

        function resetCoachTaskForm() {
            const form = document.getElementById('coach-task-form');
            if (!form) return;
            form.reset();
            form.querySelector('input[name="task_id"]').value = '';
            const titleEl = document.getElementById('coach-task-form-title');
            if (titleEl) titleEl.textContent = '새 보고서 등록';
            const submitBtn = document.getElementById('coach-task-submit-btn');
            if (submitBtn) submitBtn.textContent = '보고서 저장';
            const cancelBtn = document.getElementById('coach-task-cancel-btn');
            if (cancelBtn) cancelBtn.classList.add('hidden');
            setCoachComposerVisibility('task', state.coachListCounts.tasks === 0);
        }

        async function deleteCoachTask(taskId) {
            if (!ensureCoachAccess() || !supabaseClient) return;
            if (!confirm('이 보고서를 삭제할까요? 첨부파일도 함께 삭제됩니다.')) return;

            const { data: files } = await supabaseClient
                .from('coach_task_files')
                .select('storage_path')
                .eq('task_id', taskId);

            const paths = (files || []).map((f) => f.storage_path).filter(Boolean);
            if (paths.length) {
                await supabaseClient.storage.from('coach-task-files').remove(paths);
            }

            const { error } = await supabaseClient
                .from('coach_tasks')
                .delete()
                .eq('id', taskId);

            if (error) {
                alert(`보고서 삭제 실패: ${error.message}`);
                return;
            }

            const detailEl = document.getElementById('coach-task-detail');
            if (detailEl) {
                detailEl.classList.add('hidden');
                detailEl.innerHTML = '';
            }
            resetCoachTaskForm();
            await loadCoachTasks();
            alert('보고서가 삭제되었습니다.');
        }

        async function loadCoachMaterials() {
            if (!ensureCoachAccess() || !supabaseClient) return;
            const listEl = document.getElementById('coach-materials-list');
            if (listEl) listEl.innerHTML = '불러오는 중...';

            const { data, error } = await supabaseClient
                .from('coach_materials')
                .select('id, title, category, description, original_name, size_bytes, storage_path, created_at, uploaded_by')
                .order('created_at', { ascending: false })
                .limit(40);

            if (error) {
                if (listEl) listEl.innerHTML = `<p class="text-red-500 text-xs">자료 로딩 실패: ${escapeHtml(error.message)}</p>`;
                return;
            }

            if (listEl) {
                state.coachListCounts.materials = (data || []).length;
                listEl.innerHTML = (data || []).length
                    ? data.map((item) => `
                        <div class="border border-gray-100 rounded-2xl p-4">
                            <div class="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <button type="button" onclick="viewCoachMaterialDetail('${item.id}')" class="text-left font-bold text-gray-900 hover:text-er-accent transition-colors">${escapeHtml(item.title)}</button>
                                    <p class="text-xs text-gray-400 mt-1">${escapeHtml(item.category)} · ${escapeHtml(item.original_name || '')} · ${getFileSizeLabel(item.size_bytes)}</p>
                                </div>
                                <div class="flex gap-2">
                                    <button onclick="viewCoachMaterialDetail('${item.id}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold border border-gray-200 text-gray-700 hover:bg-gray-50">보기</button>
                                    <button onclick="downloadCoachMaterial('${encodeURIComponent(item.storage_path || '')}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold border border-gray-200 text-gray-700 hover:bg-gray-50">다운로드</button>
                                    ${state.user && (item.uploaded_by === state.user.id || isHeadCoach())
                                        ? `<button onclick="startEditCoachMaterial('${item.id}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold border border-er-accent/40 text-er-dark hover:bg-er-accentLight/40">수정</button>
                                           <button onclick="deleteCoachMaterial('${item.id}','${encodeURIComponent(item.storage_path || '')}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold border border-red-200 text-red-600 hover:bg-red-50">삭제</button>`
                                        : ''}
                                </div>
                            </div>
                            <p class="text-xs text-gray-500 mt-2 break-keep">${escapeHtml(item.description || '-')}</p>
                        </div>
                    `).join('')
                    : '<p class="text-sm text-gray-500">업로드된 자료가 없습니다.</p>';
            }

            setCoachComposerVisibility('material', !(data || []).length);
        }

        async function viewCoachMaterialDetail(materialId) {
            if (!ensureCoachAccess() || !supabaseClient) return;
            const detailEl = document.getElementById('coach-material-detail');
            if (!detailEl) return;
            detailEl.classList.remove('hidden');
            detailEl.innerHTML = '불러오는 중...';

            const { data: item, error } = await supabaseClient
                .from('coach_materials')
                .select('id, title, category, description, original_name, size_bytes, storage_path, created_at, uploaded_by')
                .eq('id', materialId)
                .maybeSingle();

            if (error || !item) {
                detailEl.innerHTML = `<p class="text-xs text-red-500">자료 상세 로딩 실패: ${escapeHtml(error?.message || 'not found')}</p>`;
                return;
            }

            const { data: signed, error: signedError } = await supabaseClient.storage
                .from('coach-materials')
                .createSignedUrl(item.storage_path, 300);

            const signedUrl = signed?.signedUrl || '';
            const ext = getFileExtension(item.original_name || '');
            let previewHtml = '<p class="text-xs text-gray-500">미리보기를 지원하지 않는 형식입니다. 다운로드를 이용해 주세요.</p>';
            if (signedUrl && ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)) {
                previewHtml = `<img src="${signedUrl}" alt="${escapeHtml(item.title)}" class="max-h-80 w-auto rounded-xl border border-gray-100">`;
            } else if (signedUrl && ext === 'pdf') {
                previewHtml = `<iframe src="${signedUrl}" class="w-full h-96 rounded-xl border border-gray-100 bg-white"></iframe>`;
            } else if (signedUrl && ['mp4', 'mov'].includes(ext)) {
                previewHtml = `<video src="${signedUrl}" controls class="max-h-80 rounded-xl border border-gray-100 bg-black"></video>`;
            } else if (signedUrl && ['mp3', 'wav', 'm4a'].includes(ext)) {
                previewHtml = `<audio src="${signedUrl}" controls class="w-full"></audio>`;
            }

            const canManage = Boolean(state.user && (item.uploaded_by === state.user.id || isHeadCoach()));
            detailEl.innerHTML = `
                <div class="flex items-start justify-between gap-3">
                    <div>
                        <h4 class="text-base font-bold text-gray-900">${escapeHtml(item.title)}</h4>
                        <p class="text-xs text-gray-500 mt-1">${escapeHtml(item.category)} · ${escapeHtml(item.original_name || '-')} · ${getFileSizeLabel(item.size_bytes)} · ${formatDateTime(item.created_at)}</p>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="openCoachMaterial('${encodeURIComponent(item.storage_path || '')}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold border border-gray-200 text-gray-700 hover:bg-gray-50">새 창 보기</button>
                        <button onclick="downloadCoachMaterial('${encodeURIComponent(item.storage_path || '')}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold border border-gray-200 text-gray-700 hover:bg-gray-50">다운로드</button>
                        ${canManage ? `<button onclick="startEditCoachMaterial('${item.id}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold border border-er-accent/40 text-er-dark hover:bg-er-accentLight/40">수정</button>` : ''}
                    </div>
                </div>
                <div class="mt-4 p-3 rounded-xl border border-gray-100 bg-white text-sm text-gray-700 break-keep">${escapeHtml(item.description || '-')}</div>
                <div class="mt-4">${signedError ? `<p class="text-xs text-red-500">미리보기 링크 생성 실패: ${escapeHtml(signedError.message)}</p>` : previewHtml}</div>
            `;
        }

        function resetCoachMaterialForm() {
            const form = document.getElementById('coach-material-form');
            if (!form) return;
            form.reset();
            form.material_id.value = '';
            const titleEl = document.getElementById('coach-material-form-title');
            const submitEl = document.getElementById('coach-material-submit-btn');
            const cancelEl = document.getElementById('coach-material-cancel-btn');
            if (titleEl) titleEl.textContent = '자료 업로드';
            if (submitEl) submitEl.textContent = '자료 업로드';
            if (cancelEl) cancelEl.classList.add('hidden');
        }

        async function startEditCoachMaterial(materialId) {
            if (!ensureCoachAccess() || !supabaseClient) return;
            const form = document.getElementById('coach-material-form');
            if (!form) return;
            const { data: item, error } = await supabaseClient
                .from('coach_materials')
                .select('id, title, category, description, uploaded_by')
                .eq('id', materialId)
                .maybeSingle();
            if (error || !item) {
                alert(`자료 조회 실패: ${error?.message || 'not found'}`);
                return;
            }
            if (!state.user || (item.uploaded_by !== state.user.id && !isHeadCoach())) {
                alert('업로드한 본인 또는 관리자만 수정할 수 있습니다.');
                return;
            }
            form.material_id.value = item.id;
            form.title.value = item.title || '';
            form.category.value = item.category || 'general';
            form.description.value = item.description || '';
            const titleEl = document.getElementById('coach-material-form-title');
            const submitEl = document.getElementById('coach-material-submit-btn');
            const cancelEl = document.getElementById('coach-material-cancel-btn');
            if (titleEl) titleEl.textContent = '자료 수정';
            if (submitEl) submitEl.textContent = '자료 수정 저장';
            if (cancelEl) cancelEl.classList.remove('hidden');
            setCoachComposerVisibility('material', true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        async function loadCoachSchedules() {
            if (!ensureCoachAccess() || !supabaseClient) return;
            const listEl = document.getElementById('coach-schedules-list');
            if (listEl) listEl.innerHTML = '불러오는 중...';

            const { data, error } = await supabaseClient
                .from('coach_schedules')
                .select('id, title, schedule_type, start_at, end_at, location, notes')
                .gte('end_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
                .order('start_at', { ascending: true })
                .limit(60);

            if (error) {
                if (listEl) listEl.innerHTML = `<p class="text-red-500 text-xs">일정 로딩 실패: ${escapeHtml(error.message)}</p>`;
                return;
            }

            if (listEl) {
                listEl.innerHTML = (data || []).length
                    ? data.map((item) => {
                        const dual = formatScheduleDualRange(item.start_at, item.end_at);
                        return `
                        <div class="border border-gray-100 rounded-2xl p-4">
                            <div class="flex flex-wrap items-center justify-between gap-2">
                                <h4 class="font-bold text-gray-900">${escapeHtml(item.title)}</h4>
                                <div class="flex items-center gap-2">
                                    <span class="text-[11px] px-2 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-600">${escapeHtml(formatCoachScheduleTypeLabel(item.schedule_type))}</span>
                                    <button onclick="deleteCoachSchedule('${item.id}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold border border-red-200 text-red-600 hover:bg-red-50">삭제</button>
                                </div>
                            </div>
                            <p class="text-xs text-gray-500 mt-2">${escapeHtml(dual.kr)}</p>
                            <p class="text-xs text-gray-500 mt-1">${escapeHtml(dual.ct)}</p>
                            <p class="text-xs text-gray-400 mt-1">${renderScheduleLocation(item.location)}</p>
                            <p class="text-xs text-gray-400 mt-1 break-keep">${escapeHtml(item.notes || '')}</p>
                        </div>
                    `;
                    }).join('')
                    : '<p class="text-sm text-gray-500">등록된 일정이 없습니다.</p>';
            }
        }

        function openScheduleModal() {
            const modal = document.getElementById('coach-schedule-modal');
            if (!modal) return;
            modal.classList.remove('hidden');
        }

        function closeScheduleModal() {
            const modal = document.getElementById('coach-schedule-modal');
            if (!modal) return;
            modal.classList.add('hidden');
        }

        async function submitCoachTask(event) {
            event.preventDefault();
            if (!ensureCoachAccess() || !supabaseClient) return;
            const form = event.target;
            const formData = new FormData(form);
            const taskId = String(formData.get('task_id') || '').trim();
            const title = String(formData.get('title') || '').trim();
            const description = String(formData.get('description') || '').trim();
            const due_at = toIsoOrNull(String(formData.get('due_at') || '').trim());
            const week_label = String(formData.get('week_label') || '').trim();
            const status = String(formData.get('status') || 'published');
            const files = form.querySelector('input[name="files"]')?.files || [];

            let task = null;
            let taskError = null;
            if (taskId) {
                const updateRes = await supabaseClient
                    .from('coach_tasks')
                    .update({ title, description, due_at, week_label, status })
                    .eq('id', taskId)
                    .select('id')
                    .single();
                task = updateRes.data;
                taskError = updateRes.error;
            } else {
                const insertRes = await supabaseClient
                    .from('coach_tasks')
                    .insert([{ title, description, due_at, week_label, status, created_by: state.user.id }])
                    .select('id')
                    .single();
                task = insertRes.data;
                taskError = insertRes.error;
            }

            if (taskError || !task?.id) {
                alert(`보고서 저장 실패: ${taskError?.message || 'unknown error'}`);
                return;
            }

            for (const file of files) {
                const check = validateUploadFile(file);
                if (!check.ok) {
                    alert(`${file.name}\n${check.reason}`);
                    continue;
                }
                const safeName = `${Date.now()}_${buildSafeStorageFileName(file.name)}`;
                const storagePath = `${task.id}/${safeName}`;
                const uploadRes = await supabaseClient.storage.from('coach-task-files').upload(storagePath, file, {
                    upsert: false,
                    contentType: file.type || undefined
                });
                if (uploadRes.error) {
                    alert(`파일 업로드 실패(${file.name}): ${uploadRes.error.message}`);
                    continue;
                }
                await supabaseClient.from('coach_task_files').insert([{
                    task_id: task.id,
                    storage_path: storagePath,
                    original_name: file.name,
                    mime_type: file.type || null,
                    size_bytes: file.size || null,
                    uploaded_by: state.user.id
                }]);
            }

            resetCoachTaskForm();
            await loadCoachTasks();
            setCoachComposerVisibility('task', !taskId && state.coachListCounts.tasks === 0);
            await viewCoachTaskDetail(task.id);
            alert(taskId ? '보고서가 수정되었습니다.' : '보고서가 저장되었습니다.');
        }

        async function downloadCoachTaskFile(encodedStoragePath) {
            if (!ensureCoachAccess() || !supabaseClient) return;
            const path = decodeURIComponent(String(encodedStoragePath || ''));
            if (!path) return;
            const { data, error } = await supabaseClient.storage.from('coach-task-files').createSignedUrl(path, 60);
            if (error || !data?.signedUrl) {
                alert(`다운로드 링크 생성 실패: ${error?.message || 'unknown error'}`);
                return;
            }
            window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
        }

        async function submitCoachMaterial(event) {
            event.preventDefault();
            if (!ensureCoachAccess() || !supabaseClient) return;
            const form = event.target;
            const formData = new FormData(form);
            const materialId = String(formData.get('material_id') || '').trim();
            const title = String(formData.get('title') || '').trim();
            const description = String(formData.get('description') || '').trim();
            const category = String(formData.get('category') || 'general');
            const file = form.querySelector('input[name="file"]')?.files?.[0];
            if (!materialId && !file) {
                alert('업로드할 파일을 선택해 주세요.');
                return;
            }
            if (file) {
                const check = validateUploadFile(file);
                if (!check.ok) {
                    alert(check.reason);
                    return;
                }
            }

            if (materialId) {
                const { data: existing, error: existingError } = await supabaseClient
                    .from('coach_materials')
                    .select('id, uploaded_by, storage_path, original_name, mime_type, size_bytes')
                    .eq('id', materialId)
                    .maybeSingle();
                if (existingError || !existing) {
                    alert(`수정 대상 조회 실패: ${existingError?.message || 'not found'}`);
                    return;
                }
                if (!state.user || (existing.uploaded_by !== state.user.id && !isHeadCoach())) {
                    alert('업로드한 본인 또는 관리자만 수정할 수 있습니다.');
                    return;
                }

                let nextStoragePath = existing.storage_path;
                let nextOriginalName = existing.original_name;
                let nextMimeType = existing.mime_type;
                let nextSizeBytes = existing.size_bytes;
                if (file) {
                    const safeName = `${Date.now()}_${buildSafeStorageFileName(file.name)}`;
                    nextStoragePath = `${category}/${safeName}`;
                    const uploadRes = await supabaseClient.storage.from('coach-materials').upload(nextStoragePath, file, {
                        upsert: false,
                        contentType: file.type || undefined
                    });
                    if (uploadRes.error) {
                        alert(`자료 업로드 실패: ${uploadRes.error.message}`);
                        return;
                    }
                    nextOriginalName = file.name;
                    nextMimeType = file.type || null;
                    nextSizeBytes = file.size || null;
                }

                const { error } = await supabaseClient
                    .from('coach_materials')
                    .update({
                        title,
                        description,
                        category,
                        storage_path: nextStoragePath,
                        original_name: nextOriginalName,
                        mime_type: nextMimeType,
                        size_bytes: nextSizeBytes
                    })
                    .eq('id', materialId);
                if (error) {
                    alert(`자료 수정 실패: ${error.message}`);
                    return;
                }
                if (file && existing.storage_path && existing.storage_path !== nextStoragePath) {
                    await supabaseClient.storage.from('coach-materials').remove([existing.storage_path]);
                }
                resetCoachMaterialForm();
                await loadCoachMaterials();
                setCoachComposerVisibility('material', state.coachListCounts.materials === 0);
                alert('자료가 수정되었습니다.');
                return;
            }

            const safeName = `${Date.now()}_${buildSafeStorageFileName(file.name)}`;
            const storagePath = `${category}/${safeName}`;
            const uploadRes = await supabaseClient.storage.from('coach-materials').upload(storagePath, file, {
                upsert: false,
                contentType: file.type || undefined
            });
            if (uploadRes.error) {
                alert(`자료 업로드 실패: ${uploadRes.error.message}`);
                return;
            }

            const { error } = await supabaseClient.from('coach_materials').insert([{
                title,
                description,
                category,
                storage_path: storagePath,
                original_name: file.name,
                mime_type: file.type || null,
                size_bytes: file.size || null,
                uploaded_by: state.user.id
            }]);
            if (error) {
                alert(`자료 메타데이터 저장 실패: ${error.message}`);
                return;
            }

            resetCoachMaterialForm();
            await loadCoachMaterials();
            setCoachComposerVisibility('material', state.coachListCounts.materials === 0);
            alert('자료가 업로드되었습니다.');
        }

        async function deleteCoachMaterial(materialId, encodedStoragePath) {
            if (!ensureCoachAccess() || !supabaseClient) return;
            if (!confirm('이 자료를 삭제할까요?')) return;

            const storagePath = decodeURIComponent(String(encodedStoragePath || ''));
            if (storagePath) {
                await supabaseClient.storage.from('coach-materials').remove([storagePath]);
            }

            const { error } = await supabaseClient
                .from('coach_materials')
                .delete()
                .eq('id', materialId);

            if (error) {
                alert(`자료 삭제 실패: ${error.message}`);
                return;
            }

            const detailEl = document.getElementById('coach-material-detail');
            if (detailEl) {
                detailEl.classList.add('hidden');
                detailEl.innerHTML = '';
            }
            await loadCoachMaterials();
            alert('자료가 삭제되었습니다.');
        }

        async function submitCoachSchedule(event) {
            event.preventDefault();
            if (!ensureCoachAccess() || !supabaseClient) return;
            const formData = new FormData(event.target);
            const title = String(formData.get('title') || '').trim();
            const schedule_type = String(formData.get('schedule_type') || 'study_track');
            const start_at = toIsoOrNull(String(formData.get('start_at') || '').trim());
            const end_at = toIsoOrNull(String(formData.get('end_at') || '').trim());
            const location = String(formData.get('location') || '').trim();
            const notes = String(formData.get('notes') || '').trim();

            if (!start_at || !end_at) {
                alert('일정 시작/종료 시간을 확인해 주세요.');
                return;
            }

            const { error } = await supabaseClient.from('coach_schedules').insert([{
                title,
                schedule_type,
                start_at,
                end_at,
                location,
                notes,
                created_by: state.user.id
            }]);

            if (error) {
                alert(`일정 저장 실패: ${error.message}`);
                return;
            }

            event.target.reset();
            closeScheduleModal();
            await loadCoachSchedules();
            alert('일정이 등록되었습니다.');
        }

        async function deleteCoachSchedule(scheduleId) {
            if (!ensureCoachAccess() || !supabaseClient) return;
            if (!confirm('이 일정을 삭제할까요?')) return;

            const { error } = await supabaseClient
                .from('coach_schedules')
                .delete()
                .eq('id', scheduleId);

            if (error) {
                alert(`일정 삭제 실패: ${error.message}`);
                return;
            }

            await loadCoachSchedules();
            alert('일정이 삭제되었습니다.');
        }

        async function downloadCoachMaterial(encodedStoragePath) {
            if (!ensureCoachAccess() || !supabaseClient) return;
            const path = decodeURIComponent(String(encodedStoragePath || ''));
            if (!path) return;
            const { data, error } = await supabaseClient.storage.from('coach-materials').createSignedUrl(path, 60);
            if (error || !data?.signedUrl) {
                alert(`다운로드 링크 생성 실패: ${error?.message || 'unknown error'}`);
                return;
            }
            window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
        }

        async function openCoachMaterial(encodedStoragePath) {
            if (!ensureCoachAccess() || !supabaseClient) return;
            const path = decodeURIComponent(String(encodedStoragePath || ''));
            if (!path) return;
            const { data, error } = await supabaseClient.storage.from('coach-materials').createSignedUrl(path, 300);
            if (error || !data?.signedUrl) {
                alert(`보기 링크 생성 실패: ${error?.message || 'unknown error'}`);
                return;
            }
            window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
        }

        function updateProgramView(filterType) {
            state.programFilter = filterType;
            
            // Tab styling update
            document.querySelectorAll('[id^="tab-"]').forEach(btn => {
                const isActive = btn.id === `tab-${filterType}`;
                btn.className = isActive 
                    ? "whitespace-nowrap px-5 py-2.5 rounded-full text-xs md:text-sm font-bold transition-all duration-300 bg-white text-er-dark shadow-md scale-105"
                    : "whitespace-nowrap px-5 py-2.5 rounded-full text-xs md:text-sm font-bold transition-all duration-300 bg-white/10 text-gray-300 hover:bg-white/20";
            });

            const introEl = document.getElementById('program-intro');
            const cardsEl = document.getElementById('program-cards');
            
            const data = (ER.programs && ER.programs.view) ? ER.programs.view : {};
            const selected = data[filterType];
            if (!selected || !selected.cards) return;

            if(introEl) {
                introEl.innerHTML = `
                    <h3 class="text-lg font-bold text-er-dark mb-1">${selected.title}</h3>
                    <p class="text-xs text-gray-500 break-keep">${selected.desc}</p>
                `;
            }

            if(cardsEl) {
                cardsEl.innerHTML = selected.cards.map(c => `
                    <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-card transition-all group flex flex-col h-full">
                        <div class="flex items-center justify-between mb-4">
                            <span class="px-2.5 py-1 rounded-full bg-er-base text-er-accent text-[10px] font-bold uppercase tracking-wider">${c.b}</span>
                            <div class="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-er-dark group-hover:text-white transition-colors text-sm">
                                <i class="${c.i}"></i>
                            </div>
                        </div>
                        <h4 class="text-base font-bold text-gray-900 mb-2">${c.t}</h4>
                        <p class="text-gray-500 text-xs leading-relaxed mb-6 flex-grow break-keep">${c.d}</p>
                        <button onclick="renderSection('apply')" class="w-full py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs hover:bg-er-dark hover:text-white hover:border-transparent transition-all">
                            문의 신청하기
                        </button>
                    </div>
                `).join('');
            }
        }

        // --- Adaptive Test Logic ---
        function renderAdaptiveQuestions(containerId, questions, prefix) {
            const container = document.getElementById(containerId);
            if (!container) return;

            container.innerHTML = '';
            questions.forEach((item) => {
                const qText = adaptiveQuestionText(item);
                const aText = item.format === 'ab' ? adaptiveOptionText(item, 'a') : '';
                const bText = item.format === 'ab' ? adaptiveOptionText(item, 'b') : '';
                const html = item.format === 'ab'
                    ? `
                        <div class="bg-white p-5 sm:p-7 rounded-xl border border-gray-100 shadow-sm" id="${prefix}-block-${item.id}">
                            <p class="text-[15px] sm:text-base font-medium text-gray-800 mb-5 leading-relaxed">${qText}</p>
                            <div class="grid gap-3">
                                <label class="block cursor-pointer">
                                    <input type="radio" name="${item.id}" value="A" class="sr-only peer">
                                    <div class="rounded-xl border-2 border-gray-200 p-4 text-sm text-gray-700 peer-checked:border-[#4a4540] peer-checked:bg-[#f5f5f0] smooth-transition">
                                        <span class="inline-block text-xs font-bold text-[#4a4540] mb-1">${adaptiveText('forcedA')}</span>
                                        <div>${aText}</div>
                                    </div>
                                </label>
                                <label class="block cursor-pointer">
                                    <input type="radio" name="${item.id}" value="B" class="sr-only peer">
                                    <div class="rounded-xl border-2 border-gray-200 p-4 text-sm text-gray-700 peer-checked:border-[#4a4540] peer-checked:bg-[#f5f5f0] smooth-transition">
                                        <span class="inline-block text-xs font-bold text-[#4a4540] mb-1">${adaptiveText('forcedB')}</span>
                                        <div>${bText}</div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    `
                    : `
                        <div class="bg-white p-5 sm:p-7 rounded-xl border border-gray-100 shadow-sm" id="${prefix}-block-${item.id}">
                            <p class="text-[15px] sm:text-base font-medium text-gray-800 mb-5 leading-relaxed">${qText}</p>
                            <div class="flex justify-between items-center sm:px-2">
                                <span class="text-xs text-gray-400 font-medium">${adaptiveText('notAtAll')}</span>
                                <div class="flex space-x-2 sm:space-x-4">
                                    ${[1, 2, 3, 4, 5].map((val) => `
                                        <div class="relative">
                                            <input type="radio" name="${item.id}" value="${val}" id="${item.id}-${val}" class="peer sr-only radio-btn">
                                            <label for="${item.id}-${val}" class="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full border-2 border-gray-200 text-gray-400 cursor-pointer peer-hover:border-[#bfa68a] hover:bg-gray-50 smooth-transition font-semibold text-sm bg-white">
                                                ${val}
                                            </label>
                                        </div>
                                    `).join('')}
                                </div>
                                <span class="text-xs text-gray-400 font-medium">${adaptiveText('very')}</span>
                            </div>
                        </div>
                    `;
                container.innerHTML += html;
            });
        }

        function validateAdaptiveForm(questions, prefix, errorMsgId) {
            let isValid = true;
            let firstErrorElement = null;

            questions.forEach((item) => {
                const block = document.getElementById(`${prefix}-block-${item.id}`);
                if (!document.querySelector(`input[name="${item.id}"]:checked`)) {
                    isValid = false;
                    if (block) {
                        block.classList.add('border-red-300', 'bg-red-50');
                        if (!firstErrorElement) firstErrorElement = block;
                    }
                } else if (block) {
                    block.classList.remove('border-red-300', 'bg-red-50');
                }
            });

            const errorMsg = document.getElementById(errorMsgId);
            if (!isValid) {
                if (errorMsg) errorMsg.classList.remove('hidden');
                if (firstErrorElement) firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else if (errorMsg) {
                errorMsg.classList.add('hidden');
            }

            return isValid;
        }

        function initAdaptiveTest() {
            const phase1Container = document.getElementById('phase1-container');
            if (!phase1Container) return;
            adaptivePhase1Responses = {};
            adaptiveTopCandidates = [];
            adaptivePhase2QuestionsData = [];
            adaptiveTieBreakerMeta = { enabled: false, weight: 0, margin: null };
            adaptiveTieBreaker31Meta = { enabled: false, weight: 0, margin: null };
            adaptiveTieBreaker3SXMeta = { enabled: false, weight: 0, margin: null };
            adaptiveTieBreaker71Meta = { enabled: false, weight: 0, margin: null };
            adaptiveTieBreaker78Meta = { enabled: false, weight: 0, margin: null };
            adaptiveTieBreaker7WingMeta = { enabled: false, weight: 0, margin: null };
            renderAdaptiveQuestions('phase1-container', adaptivePhase1Questions, 'p1');
        }

        function submitPhase1() {
            if (!validateAdaptiveForm(adaptivePhase1Questions, 'p1', 'validation-msg-1')) return;

            let centerScores = { 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0 };

            adaptivePhase1Questions.forEach((item) => {
                const selected = document.querySelector(`input[name="${item.id}"]:checked`);
                if (!selected) return;
                const rawValue = selected.value;
                adaptivePhase1Responses[item.id] = rawValue;

                if (item.format === 'ab') {
                    const chosenType = rawValue === 'A' ? item.leftType : item.rightType;
                    centerScores[chosenType] += item.weight || 2.0;
                    return;
                }

                const score = parseInt(rawValue, 10);

                if (item.id === 't2') { centerScores[2] += score; centerScores[3] += score; centerScores[4] += score; }
                if (item.id === 't5') { centerScores[5] += score; centerScores[6] += score; centerScores[7] += score; }
                if (item.id === 't8') { centerScores[8] += score; centerScores[9] += score; centerScores[1] += score; }

                if (item.id.startsWith('c')) {
                    centerScores[item.type] += score * 1.5;
                }
            });

            const sortedCandidates = Object.keys(centerScores)
                .map((k) => ({ type: parseInt(k, 10), score: centerScores[k] }))
                .sort((a, b) => b.score - a.score);

            const topScore = sortedCandidates[0].score;
            const topType = sortedCandidates[0].type;
            const adjacentTypes = [topType === 1 ? 9 : topType - 1, topType === 9 ? 1 : topType + 1];

            let candidateTypes = sortedCandidates
                .filter((c) => c.score >= topScore * 0.70)
                .map((c) => c.type);

            candidateTypes = [...new Set([...candidateTypes, topType, ...adjacentTypes])];

            if (candidateTypes.length < 3) {
                candidateTypes = [...new Set([...candidateTypes, ...sortedCandidates.slice(0, 3).map((c) => c.type)])];
            }

            adaptiveTopCandidates = sortedCandidates
                .map((c) => c.type)
                .filter((type) => candidateTypes.includes(type))
                .slice(0, 5);

            adaptivePhase2QuestionsData = [];
            adaptiveTopCandidates.forEach((type) => {
                if (adaptiveDeepMotivations[type]) {
                    adaptivePhase2QuestionsData = adaptivePhase2QuestionsData.concat(adaptiveDeepMotivations[type]);
                }
            });

            // 3/6 혼동 보정: top3 동시 포함 또는 점수 근접(<=8%)일 때만 타이브레이커 발동
            const score3 = centerScores[3];
            const score6 = centerScores[6];
            const max36 = Math.max(score3, score6);
            const margin36 = max36 > 0 ? Math.abs(score3 - score6) / max36 : 1;
            const top3Types = sortedCandidates.slice(0, 3).map((c) => c.type);
            const hasBothTop3 = top3Types.includes(3) && top3Types.includes(6);
            const hasBothCandidates = adaptiveTopCandidates.includes(3) && adaptiveTopCandidates.includes(6);
            const shouldEnableTieBreaker = hasBothCandidates && (hasBothTop3 || margin36 <= 0.08);

            if (shouldEnableTieBreaker) {
                adaptivePhase2QuestionsData = adaptivePhase2QuestionsData.concat(adaptiveTieBreaker36);
                // 근접할수록 가중치 상향 (2.0~2.5)
                let tbWeight = 2.0;
                if (margin36 <= 0.03) tbWeight = 2.5;
                else if (margin36 <= 0.08) tbWeight = 2.25;
                adaptiveTieBreakerMeta = { enabled: true, weight: tbWeight, margin: margin36 };
            } else {
                adaptiveTieBreakerMeta = { enabled: false, weight: 0, margin: margin36 };
            }

            // 3/1 혼동 보정: top3 동시 포함 또는 점수 근접(<=10%)일 때 발동
            const score1 = centerScores[1];
            const max31 = Math.max(score3, score1);
            const margin31 = max31 > 0 ? Math.abs(score3 - score1) / max31 : 1;
            const hasBoth31Top3 = top3Types.includes(3) && top3Types.includes(1);
            const hasBoth31Candidates = adaptiveTopCandidates.includes(3) && adaptiveTopCandidates.includes(1);
            const shouldEnable31TieBreaker = hasBoth31Candidates && (hasBoth31Top3 || margin31 <= 0.10);
            if (shouldEnable31TieBreaker) {
                adaptivePhase2QuestionsData = adaptivePhase2QuestionsData.concat(adaptiveTieBreaker31);
                let tb31Weight = 2.0;
                if (margin31 <= 0.04) tb31Weight = 2.5;
                else if (margin31 <= 0.10) tb31Weight = 2.25;
                adaptiveTieBreaker31Meta = { enabled: true, weight: tb31Weight, margin: margin31 };
            } else {
                adaptiveTieBreaker31Meta = { enabled: false, weight: 0, margin: margin31 };
            }

            // 3/SX 혼동 보정: 3번 후보 + SX 상위 + 3번 점수가 상위권일 때 발동
            const instinctSums = { sp: 0, sx: 0, so: 0 };
            adaptivePhase1Questions.filter((q) => q.inst).forEach((q) => {
                const score = parseInt(adaptivePhase1Responses[q.id] || '0', 10);
                instinctSums[q.inst] += score;
            });
            const sxSum = instinctSums.sx;
            const spSum = instinctSums.sp;
            const soSum = instinctSums.so;
            const sxTopOrNearTop = sxSum >= Math.max(spSum, soSum) - 1;
            const margin3ToTop = topScore > 0 ? (topScore - score3) / topScore : 1;
            const shouldEnable3SXTieBreaker =
                adaptiveTopCandidates.includes(3) &&
                sxTopOrNearTop &&
                (sortedCandidates[0].type === 3 || margin3ToTop <= 0.10);
            if (shouldEnable3SXTieBreaker) {
                adaptivePhase2QuestionsData = adaptivePhase2QuestionsData.concat(adaptiveTieBreaker3SX);
                let tb3SXWeight = 2.0;
                if (margin3ToTop <= 0.03) tb3SXWeight = 2.5;
                else if (margin3ToTop <= 0.10) tb3SXWeight = 2.25;
                adaptiveTieBreaker3SXMeta = { enabled: true, weight: tb3SXWeight, margin: margin3ToTop };
            } else {
                adaptiveTieBreaker3SXMeta = { enabled: false, weight: 0, margin: margin3ToTop };
            }

            // 7/1 혼동 보정
            const score7 = centerScores[7];
            const max71 = Math.max(score7, score1);
            const margin71 = max71 > 0 ? Math.abs(score7 - score1) / max71 : 1;
            const hasBoth71Top3 = top3Types.includes(7) && top3Types.includes(1);
            const hasBoth71Candidates = adaptiveTopCandidates.includes(7) && adaptiveTopCandidates.includes(1);
            const enable71 = hasBoth71Candidates && (hasBoth71Top3 || margin71 <= 0.12);
            if (enable71) {
                adaptivePhase2QuestionsData = adaptivePhase2QuestionsData.concat(adaptiveTieBreaker71);
                adaptiveTieBreaker71Meta = { enabled: true, weight: margin71 <= 0.05 ? 2.6 : 2.3, margin: margin71 };
            } else {
                adaptiveTieBreaker71Meta = { enabled: false, weight: 0, margin: margin71 };
            }

            // 7/8 혼동 보정
            const score8 = centerScores[8];
            const max78 = Math.max(score7, score8);
            const margin78 = max78 > 0 ? Math.abs(score7 - score8) / max78 : 1;
            const hasBoth78Top3 = top3Types.includes(7) && top3Types.includes(8);
            const hasBoth78Candidates = adaptiveTopCandidates.includes(7) && adaptiveTopCandidates.includes(8);
            const enable78 = hasBoth78Candidates && (hasBoth78Top3 || margin78 <= 0.12);
            if (enable78) {
                adaptivePhase2QuestionsData = adaptivePhase2QuestionsData.concat(adaptiveTieBreaker78);
                adaptiveTieBreaker78Meta = { enabled: true, weight: margin78 <= 0.05 ? 2.6 : 2.3, margin: margin78 };
            } else {
                adaptiveTieBreaker78Meta = { enabled: false, weight: 0, margin: margin78 };
            }

            // 7w6 / 7w8 날개 보정 (7번이 후보일 때)
            const wingCue = adaptiveTopCandidates.includes(7) || topType === 7;
            if (wingCue) {
                adaptivePhase2QuestionsData = adaptivePhase2QuestionsData.concat(adaptiveTieBreaker7Wing);
                adaptiveTieBreaker7WingMeta = { enabled: true, weight: 2.2, margin: null };
            } else {
                adaptiveTieBreaker7WingMeta = { enabled: false, weight: 0, margin: null };
            }

            document.getElementById('phase1-form').classList.add('hidden');
            document.getElementById('phase2-form').classList.remove('hidden');
            document.getElementById('progress-bar').style.width = '100%';
            document.getElementById('step-label').innerText = adaptiveLang === 'en'
                ? 'Step 2: Motivational Cross-Validation'
                : '2단계: 동기 교차 검증 (심층 인터뷰)';
            document.getElementById('step-counter').innerText = '2 / 2';

            renderAdaptiveQuestions('phase2-container', adaptivePhase2QuestionsData, 'p2');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function submitPhase2() {
            if (!validateAdaptiveForm(adaptivePhase2QuestionsData, 'p2', 'validation-msg-2')) return;

            let finalTypeScores = { 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0 };
            let tb3sxCore = null;
            let tb3sxInstinct = null;
            let tb7w6 = 0;
            let tb7w8 = 0;
            const recentStress = parseInt(adaptivePhase1Responses.state_2w || '3', 10);
            const typeEvidence = { 1:[], 2:[], 3:[], 4:[], 5:[], 6:[], 7:[], 8:[], 9:[] };
            const questionLookup = {};
            [...adaptivePhase1Questions, ...adaptivePhase2QuestionsData].forEach((q) => {
                questionLookup[q.id] = adaptiveQuestionText(q);
            });
            const addTypeScore = (type, points, qid, customText = null) => {
                finalTypeScores[type] += points;
                typeEvidence[type].push({
                    id: qid,
                    points,
                    text: customText || questionLookup[qid] || qid
                });
            };

            adaptivePhase1Questions.forEach((q) => {
                if (q.format === 'ab') {
                    const choice = adaptivePhase1Responses[q.id];
                    const chosenType = choice === 'A' ? q.leftType : q.rightType;
                    const label = choice === 'A' ? q.a : q.b;
                    addTypeScore(chosenType, q.weight || 2.0, q.id, label);
                    return;
                }

                const score = parseInt(adaptivePhase1Responses[q.id] || '0', 10);
                if (q.id === 't2') {
                    addTypeScore(2, score, q.id);
                    addTypeScore(3, score, q.id);
                    addTypeScore(4, score, q.id);
                }
                if (q.id === 't5') {
                    addTypeScore(5, score, q.id);
                    addTypeScore(6, score, q.id);
                    addTypeScore(7, score, q.id);
                }
                if (q.id === 't8') {
                    addTypeScore(8, score, q.id);
                    addTypeScore(9, score, q.id);
                    addTypeScore(1, score, q.id);
                }
                if (q.id.startsWith('c')) {
                    addTypeScore(q.type, score * 1.5, q.id);
                }
            });

            adaptivePhase2QuestionsData.forEach((q) => {
                const val = parseInt(document.querySelector(`input[name="${q.id}"]:checked`).value, 10);
                if (q.id === 'tb_3_sx_2') {
                    tb3sxInstinct = val;
                    return;
                }
                if (q.id === 'tb_7w_1') {
                    tb7w6 = val;
                    return;
                }
                if (q.id === 'tb_7w_2') {
                    tb7w8 = val;
                    return;
                }

                let weight = q.weight || 2.0;
                if (q.id.startsWith('tb_3_6_') && adaptiveTieBreakerMeta.enabled) {
                    weight = adaptiveTieBreakerMeta.weight;
                } else if (q.id.startsWith('tb_3_1_') && adaptiveTieBreaker31Meta.enabled) {
                    weight = adaptiveTieBreaker31Meta.weight;
                } else if (q.id.startsWith('tb_7_1_') && adaptiveTieBreaker71Meta.enabled) {
                    weight = adaptiveTieBreaker71Meta.weight;
                } else if (q.id.startsWith('tb_7_8_') && adaptiveTieBreaker78Meta.enabled) {
                    weight = adaptiveTieBreaker78Meta.weight;
                } else if (q.id === 'tb_3_sx_1' && adaptiveTieBreaker3SXMeta.enabled) {
                    weight = adaptiveTieBreaker3SXMeta.weight;
                    tb3sxCore = val;
                } else if (q.id.startsWith('tb_')) {
                    return;
                }

                addTypeScore(q.type, val * weight, q.id);
            });

            // 3 vs SX 보정: 인정보다 몰입/내적쾌감 동기가 높을 때 3번 점수를 미세 감쇠
            let threeVsSxDampApplied = 0;
            let threeVsSxBoostApplied = 0;
            if (
                adaptiveTieBreaker3SXMeta.enabled &&
                tb3sxCore !== null &&
                tb3sxInstinct !== null
            ) {
                const delta3sx = tb3sxInstinct - tb3sxCore;
                if (delta3sx > 0) {
                    const damp = delta3sx * 0.9; // 과보정 방지를 위한 완만한 감쇠
                    finalTypeScores[3] -= damp;
                    threeVsSxDampApplied = damp;
                    threeVsSxBoostApplied = delta3sx * 0.8; // 본능 산출 시 sx 보정 반영
                }
            }

            // 최근 2주 스트레스 보정: 높은 압박 상태에서 7의 스트레스 방향(1) 과상승 완충
            if (recentStress >= 4 && finalTypeScores[7] > 0 && finalTypeScores[1] > 0) {
                const stressScale = recentStress - 3; // 1~2
                const margin71 = Math.abs(finalTypeScores[7] - finalTypeScores[1]);
                if (margin71 <= 6.0) {
                    const damp1 = 1.0 * stressScale;
                    const boost7 = 0.6 * stressScale;
                    finalTypeScores[1] = Math.max(0, finalTypeScores[1] - damp1);
                    finalTypeScores[7] += boost7;
                }
            }

            const rankedTypes = Object.keys(finalTypeScores)
                .map((t) => ({ type: parseInt(t, 10), score: finalTypeScores[t] }))
                .sort((a, b) => b.score - a.score);

            const coreType = rankedTypes[0].type;
            const secondPlace = rankedTypes[1];
            const stressDir = adaptiveArrowLines[coreType].stress;
            const growthDir = adaptiveArrowLines[coreType].growth;

            const maxScore = rankedTypes[0].score;
            const secScore = rankedTypes[1].score;
            const diffRatio = maxScore > 0 ? (maxScore - secScore) / maxScore : 0;

            let confidence = '낮음';
            if (diffRatio >= 0.20) confidence = '높음';
            else if (diffRatio >= 0.08) confidence = '보통';

            const isTie = (maxScore === secScore);
            if (isTie) confidence = '낮음';
            const coreResolved = !isTie && confidence !== '낮음';

            const instSum = { sp: 0, sx: 0, so: 0 };
            const instNames = adaptiveLang === 'en'
                ? { sp: 'Self-Preservation', sx: 'One-to-One', so: 'Social' }
                : { sp: '자기보존', sx: '성적(일대일)', so: '사회적' };

            adaptivePhase1Questions.filter((q) => q.inst).forEach((q) => {
                instSum[q.inst] += parseInt(adaptivePhase1Responses[q.id] || '0', 10);
            });

            if (threeVsSxBoostApplied > 0) {
                instSum.sx += threeVsSxBoostApplied;
            }

            let adjustedSO = false;
            if ([3, 6, 9].includes(coreType)) {
                instSum.so -= 2.5;
                adjustedSO = true;
            }

            const rankedInstincts = Object.keys(instSum)
                .map((k) => ({ code: k, name: instNames[k], score: instSum[k] }))
                .sort((a, b) => b.score - a.score);

            let bestInstinctCode = rankedInstincts[0].code;
            let bestInstinctName = rankedInstincts[0].name;

            if (rankedInstincts[0].score === rankedInstincts[1].score) {
                bestInstinctCode = `${rankedInstincts[0].code}/${rankedInstincts[1].code}`;
                bestInstinctName = adaptiveLang === 'en'
                    ? `${rankedInstincts[0].name} & ${rankedInstincts[1].name} (tied for first)`
                    : `${rankedInstincts[0].name} & ${rankedInstincts[1].name} (공동 1위)`;
            }

            let coreDisplay = adaptiveLang === 'en'
                ? `Type ${coreType}`
                : `${coreType}번`;
            let wingNum = '없음';
            let wingStr = adaptiveLang === 'en' ? `${coreType} (core-dominant)` : `${coreType} (순수유형)`;

            if (!coreResolved) {
                coreDisplay = adaptiveLang === 'en'
                    ? `Type ${coreType} / Type ${secondPlace.type} (provisional)`
                    : `${coreType}번 / ${secondPlace.type}번 (코어 보류)`;
                wingStr = adaptiveLang === 'en' ? 'pending (core provisional)' : '판별 보류 (코어 보류)';
                wingNum = adaptiveLang === 'en' ? 'available after core is resolved' : '코어 확정 후 판별 가능';
            } else {
                let phase1TypeScores = { 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0 };
                const t2 = parseInt(adaptivePhase1Responses.t2 || '0', 10);
                const t5 = parseInt(adaptivePhase1Responses.t5 || '0', 10);
                const t8 = parseInt(adaptivePhase1Responses.t8 || '0', 10);

                phase1TypeScores[2] += t2; phase1TypeScores[3] += t2; phase1TypeScores[4] += t2;
                phase1TypeScores[5] += t5; phase1TypeScores[6] += t5; phase1TypeScores[7] += t5;
                phase1TypeScores[8] += t8; phase1TypeScores[9] += t8; phase1TypeScores[1] += t8;

                for (let i = 1; i <= 9; i++) {
                    phase1TypeScores[i] += parseInt(adaptivePhase1Responses[`c${i}`] || '0', 10) * 1.5;
                }
                adaptivePhase1Questions.filter((q) => q.format === 'ab').forEach((q) => {
                    const choice = adaptivePhase1Responses[q.id];
                    const chosenType = choice === 'A' ? q.leftType : q.rightType;
                    phase1TypeScores[chosenType] += (q.weight || 2.0);
                });

                const leftW = coreType === 1 ? 9 : coreType - 1;
                const rightW = coreType === 9 ? 1 : coreType + 1;

                const leftScore = phase1TypeScores[leftW];
                const rightScore = phase1TypeScores[rightW];
                const corePhase1Score = phase1TypeScores[coreType];
                if (coreType === 7 && adaptiveTieBreaker7WingMeta.enabled) {
                    phase1TypeScores[6] += tb7w6 * adaptiveTieBreaker7WingMeta.weight;
                    phase1TypeScores[8] += tb7w8 * adaptiveTieBreaker7WingMeta.weight;
                }

                const higherWing = leftScore >= rightScore ? leftW : rightW;
                const higherWingScore = Math.max(leftScore, rightScore);

                if (leftScore === rightScore) {
                    wingNum = '없음';
                    wingStr = adaptiveLang === 'en' ? `${coreType} (core-dominant)` : `${coreType} (순수유형)`;
                } else if (higherWingScore > 0 && higherWingScore >= corePhase1Score * 0.85) {
                    wingNum = higherWing;
                    wingStr = `${coreType}w${wingNum}`;
                }
            }

            document.getElementById('phase2-form').classList.add('hidden');
            document.getElementById('progress-container').classList.add('hidden');
            document.getElementById('result-view').classList.remove('hidden');
            document.getElementById('cta-consulting').classList.add('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });

            document.getElementById('res-final').innerText = `${bestInstinctCode} ${wingStr}`;
            document.getElementById('res-instincts').innerText = `${adaptiveText('instinctsPrefix')}${bestInstinctName}`;
            document.getElementById('res-core').innerText = coreDisplay;
            document.getElementById('res-wing').innerText = wingNum === '없음'
                ? (adaptiveLang === 'en' ? 'No clear wing activation' : '활성화 안됨')
                : (!coreResolved ? wingNum : (adaptiveLang === 'en' ? `Wing ${wingNum}` : `${wingNum}번 날개`));
            if (coreResolved) {
                document.getElementById('res-arrows').innerHTML = `
                    <span class="text-blue-600 font-bold">${adaptiveText('growthDir')}: ${growthDir}${adaptiveLang === 'en' ? '' : '번'}</span><br>
                    <span class="text-red-500 font-bold">${adaptiveText('stressDir')}: ${stressDir}${adaptiveLang === 'en' ? '' : '번'}</span>
                `;
            } else {
                document.getElementById('res-arrows').innerText = adaptiveText('tieArrows');
            }

            const top3 = rankedTypes.slice(0, 3);
            const top3Total = top3.reduce((sum, item) => sum + item.score, 0);
            const top3Html = top3.map((item, idx) => {
                const prob = top3Total > 0 ? ((item.score / top3Total) * 100).toFixed(1) : '0.0';
                const evidences = typeEvidence[item.type]
                    .sort((a, b) => b.points - a.points)
                    .slice(0, 3)
                    .map((ev) => `<li class="text-xs text-gray-600 leading-relaxed">• ${ev.text}</li>`)
                    .join('');
                return `
                    <div class="rounded-xl border border-gray-200 bg-white p-4">
                        <div class="flex items-center justify-between mb-2">
                            <p class="font-semibold text-gray-800">${idx + 1}. ${adaptiveLang === 'en' ? `Type ${item.type}` : `${item.type}번`}</p>
                            <p class="text-xs font-bold text-er-dark">${adaptiveText('top3Percent')}: ${prob}%</p>
                        </div>
                        <p class="text-xs text-gray-500 mb-1">${adaptiveText('top3Evidence')}</p>
                        <ul class="space-y-1">${evidences}</ul>
                    </div>
                `;
            }).join('');
            const top3Container = document.getElementById('res-top3');
            if (top3Container) top3Container.innerHTML = top3Html;

            const badge = document.getElementById('confidence-badge');
            if (confidence === '높음') {
                badge.className = 'absolute top-6 right-6 px-3 py-1 rounded-full text-xs font-bold bg-green-500 text-white border border-green-400 shadow-sm';
                badge.innerText = adaptiveLang === 'en' ? 'Confidence: High' : '신뢰도: 높음';
            } else if (confidence === '보통') {
                badge.className = 'absolute top-6 right-6 px-3 py-1 rounded-full text-xs font-bold bg-yellow-500 text-white border border-yellow-400 shadow-sm';
                badge.innerText = adaptiveLang === 'en' ? 'Confidence: Medium' : '신뢰도: 보통';
            } else {
                badge.className = 'absolute top-6 right-6 px-3 py-1 rounded-full text-xs font-bold bg-red-500 text-white border border-red-400 shadow-sm';
                badge.innerText = adaptiveLang === 'en' ? 'Confidence: Low' : '신뢰도: 낮음';
                document.getElementById('cta-consulting').classList.remove('hidden');
            }

            let logMsg = '';
            if (!coreResolved) {
                logMsg = adaptiveLang === 'en'
                    ? `Your top two candidates are currently very close: <strong>Type ${coreType}</strong> and <strong>Type ${secondPlace.type}</strong>. We are showing both as provisional core candidates.`
                    : `현재는 <strong>${coreType}번</strong>과 <strong>${secondPlace.type}번</strong>이 매우 근접하여, 코어를 1순위/2순위 동시 후보로 표시합니다.`;
            } else {
                logMsg = adaptiveLang === 'en'
                    ? `Based on weighted integration of behavior and motivation, your primary pattern is <strong>Type ${coreType}</strong>.<br>The runner-up is Type ${secondPlace.type}, with a score margin of <strong>${(diffRatio * 100).toFixed(1)}%</strong>.`
                    : `전체 문항에 대한 가중치 병합 결과, 귀하의 행동과 동기를 가장 강력하게 설명하는 중심 축은 <strong>${coreType}번 유형</strong>으로 판별되었습니다.<br>2순위 경합 유형은 ${secondPlace.type}번이었으며, 1순위와의 심층 동기 점수 격차는 <strong>${(diffRatio * 100).toFixed(1)}%</strong> 입니다.`;
                if (secondPlace.type === stressDir) {
                    logMsg += adaptiveLang === 'en'
                        ? `<br><br><span class="text-red-600 text-sm">Type ${stressDir} as a runner-up may reflect stress-direction activation right now.</span>`
                        : `<br><br><span class="text-red-600 text-sm">2순위 ${stressDir}번은 현재 스트레스 방향(비통합) 영향일 수 있습니다.</span>`;
                } else if (secondPlace.type === growthDir) {
                    logMsg += adaptiveLang === 'en'
                        ? `<br><br><span class="text-blue-600 text-sm">Type ${growthDir} as a runner-up may reflect growth-direction development right now.</span>`
                        : `<br><br><span class="text-blue-600 text-sm">2순위 ${growthDir}번은 현재 성장 방향(통합) 영향일 수 있습니다.</span>`;
                }
                if (adjustedSO) {
                    logMsg += adaptiveLang === 'en'
                        ? `<br><br><span class="text-[#bfa68a] text-xs">* For core Types 3/6/9, a -2.5 correction was applied to Social-instinct scoring to reduce possible over-selection bias on socially weighted items.</span>`
                        : `<br><br><span class="text-[#bfa68a] text-xs">* ${coreType}번은 사회성 관련 문항에서 과대표집이 발생할 수 있어, 사회적 본능(SO)에 -2.5 보정치가 적용되었습니다.</span>`;
                }
                if (adaptiveTieBreakerMeta.enabled) {
                    const marginPct = ((adaptiveTieBreakerMeta.margin ?? 0) * 100).toFixed(1);
                    logMsg += adaptiveLang === 'en'
                        ? `<br><br><span class="text-[#4a4540] text-xs">* 3 vs 6 tie-breaker was activated (base margin ${marginPct}%, weight x${adaptiveTieBreakerMeta.weight.toFixed(2)}).</span>`
                        : `<br><br><span class="text-[#4a4540] text-xs">* 3번/6번 혼동 보정 타이브레이커가 적용되었습니다 (1차 점수차 ${marginPct}%, 가중치 x${adaptiveTieBreakerMeta.weight.toFixed(2)}).</span>`;
                }
                if (adaptiveTieBreaker31Meta.enabled) {
                    const marginPct31 = ((adaptiveTieBreaker31Meta.margin ?? 0) * 100).toFixed(1);
                    logMsg += adaptiveLang === 'en'
                        ? `<br><br><span class="text-[#4a4540] text-xs">* 3 vs 1 tie-breaker was activated (base margin ${marginPct31}%, weight x${adaptiveTieBreaker31Meta.weight.toFixed(2)}).</span>`
                        : `<br><br><span class="text-[#4a4540] text-xs">* 3번/1번 혼동 보정 타이브레이커가 적용되었습니다 (1차 점수차 ${marginPct31}%, 가중치 x${adaptiveTieBreaker31Meta.weight.toFixed(2)}).</span>`;
                }
                if (adaptiveTieBreaker3SXMeta.enabled) {
                    const marginPct3sx = ((adaptiveTieBreaker3SXMeta.margin ?? 0) * 100).toFixed(1);
                    const dampTxt = threeVsSxDampApplied > 0 ? threeVsSxDampApplied.toFixed(2) : '0.00';
                    logMsg += adaptiveLang === 'en'
                        ? `<br><br><span class="text-[#4a4540] text-xs">* 3 vs SX tie-breaker was activated (3-to-top margin ${marginPct3sx}%, weight x${adaptiveTieBreaker3SXMeta.weight.toFixed(2)}, Type 3 damp ${dampTxt}).</span>`
                        : `<br><br><span class="text-[#4a4540] text-xs">* 3번/SX 혼동 보정 타이브레이커가 적용되었습니다 (3번-상위점수 차 ${marginPct3sx}%, 가중치 x${adaptiveTieBreaker3SXMeta.weight.toFixed(2)}, 3번 감쇠 ${dampTxt}).</span>`;
                }
                if (adaptiveTieBreaker71Meta.enabled) {
                    logMsg += adaptiveLang === 'en'
                        ? `<br><br><span class="text-[#4a4540] text-xs">* 7 vs 1 tie-breaker was activated (weight x${adaptiveTieBreaker71Meta.weight.toFixed(2)}).</span>`
                        : `<br><br><span class="text-[#4a4540] text-xs">* 7번/1번 전용 타이브레이커가 적용되었습니다 (가중치 x${adaptiveTieBreaker71Meta.weight.toFixed(2)}).</span>`;
                }
                if (adaptiveTieBreaker78Meta.enabled) {
                    logMsg += adaptiveLang === 'en'
                        ? `<br><br><span class="text-[#4a4540] text-xs">* 7 vs 8 tie-breaker was activated (weight x${adaptiveTieBreaker78Meta.weight.toFixed(2)}).</span>`
                        : `<br><br><span class="text-[#4a4540] text-xs">* 7번/8번 전용 타이브레이커가 적용되었습니다 (가중치 x${adaptiveTieBreaker78Meta.weight.toFixed(2)}).</span>`;
                }
                if (adaptiveTieBreaker7WingMeta.enabled && coreType === 7) {
                    logMsg += adaptiveLang === 'en'
                        ? `<br><br><span class="text-[#4a4540] text-xs">* 7w6 vs 7w8 wing tie-breaker was applied.</span>`
                        : `<br><br><span class="text-[#4a4540] text-xs">* 7w6 / 7w8 날개 보정 문항이 적용되었습니다.</span>`;
                }
                if (recentStress >= 4) {
                    logMsg += adaptiveLang === 'en'
                        ? `<br><br><span class="text-[#4a4540] text-xs">* Two-week stress correction was applied to reduce temporary stress-direction inflation.</span>`
                        : `<br><br><span class="text-[#4a4540] text-xs">* 최근 2주 스트레스 보정이 적용되어, 일시적 스트레스 방향 과상승을 완충했습니다.</span>`;
                }
            }

            document.getElementById('res-log').innerHTML = logMsg;
        }
        // --- Chart Logic ---
        function initCharts(sectionId) {
            Chart.defaults.font.family = "'Pretendard', sans-serif";
            Chart.defaults.color = '#9CA3AF';

            const renderImpactChart = () => {
                const impactCtx = document.getElementById('impactChart');
                if (!impactCtx) return;

                new Chart(impactCtx.getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: contentData.stats.labels,
                        datasets: [{
                            label: '케이스 분포 (%)',
                            data: contentData.stats.data,
                            backgroundColor: '#BFA68A',
                            borderRadius: 4,
                            barThickness: 20
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            y: { beginAtZero: true, grid: { display: false }, ticks: { display: false } },
                            x: { grid: { display: false }, ticks: { font: { size: 10 } } }
                        }
                    }
                });
            };
            
            if (sectionId === 'home') {
                const ctx = document.getElementById('heroChart');
                if(!ctx) return;
                
                new Chart(ctx.getContext('2d'), {
                    type: 'polarArea',
                    data: {
                        labels: contentData.types.labels,
                        datasets: [{ 
                            data: contentData.types.data, 
                            backgroundColor: [
                                'rgba(95, 155, 115, 0.92)',   // 1 – 그린 (세이지)
                                'rgba(200, 130, 150, 0.92)',   // 2 – 로즈
                                'rgba(205, 160, 95, 0.92)',    // 3 – 골드/앰버
                                'rgba(135, 110, 175, 0.92)',   // 4 – 바이올렛 (1번과 명확히 구분)
                                'rgba(95, 135, 180, 0.92)',    // 5 – 블루
                                'rgba(95, 160, 165, 0.92)',    // 6 – 틸
                                'rgba(225, 165, 135, 0.92)',   // 7 – 피치/코랄
                                'rgba(170, 100, 85, 0.92)',    // 8 – 테라코타
                                'rgba(180, 155, 125, 0.92)'    // 9 – 웜 샌드 (녹/보라와 구분)
                            ],
                            borderWidth: 2.5,
                            borderColor: '#fdf7f1',
                            hoverOffset: 4
                        }]
                    },
                    options: { 
                        responsive: true, 
                        maintainAspectRatio: false, 
                        layout: { padding: 10 },
                        plugins: { 
                            legend: { display: false },
                            tooltip: {
                                backgroundColor: 'rgba(44, 42, 41, 0.9)',
                                padding: 10,
                                cornerRadius: 8,
                                titleFont: { size: 12 },
                                bodyFont: { size: 10 },
                                callbacks: {
                                    title: (items) => items[0].label,
                                    label: () => ''
                                }
                            }
                        }, 
                        scales: { 
                            r: { 
                                ticks: { display: false }, 
                                grid: { color: '#f3f4f6', lineWidth: 1 },
                                pointLabels: { display: false } 
                            } 
                        } 
                    }
                });
                renderImpactChart();
            } else if (sectionId === 'community') {
                renderImpactChart();
            }
        }

        // --- Initialization ---
        function runAppInit() {
            window.addEventListener('scroll', () => {
                const nav = document.getElementById('navbar');
                if(window.scrollY > 20) {
                    nav.classList.add('shadow-sm', 'bg-white/95');
                    nav.classList.remove('bg-white/80');
                } else {
                    nav.classList.remove('shadow-sm', 'bg-white/95');
                    nav.classList.add('bg-white/80');
                }
            });
            const authModal = document.getElementById('auth-modal');
            if (authModal) {
                authModal.addEventListener('click', (event) => {
                    if (event.target === authModal) closeAuthModal();
                });
                var closeBtn = document.getElementById('auth-modal-close-btn');
                if (closeBtn) {
                    closeBtn.addEventListener('click', function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        if (typeof closeAuthModal === 'function') closeAuthModal();
                        else authModal.classList.add('hidden');
                    });
                }
            }
            const desktopAuthBtn = document.getElementById('desktop-auth-btn');
            if (desktopAuthBtn) {
                desktopAuthBtn.addEventListener('click', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    if (typeof handleDesktopAuthClick === 'function') {
                        handleDesktopAuthClick(event);
                        return;
                    }
                    if (typeof openAuthModal === 'function') {
                        openAuthModal();
                        return;
                    }
                    var modal = document.getElementById('auth-modal');
                    if (modal) modal.classList.remove('hidden');
                });
            }
            const mobileAuthBtn = document.getElementById('mobile-auth-btn');
            if (mobileAuthBtn) {
                mobileAuthBtn.addEventListener('click', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    if (typeof toggleLogin === 'function') {
                        toggleLogin();
                        return;
                    }
                    var modal = document.getElementById('auth-modal');
                    if (modal) modal.classList.remove('hidden');
                });
            }
            document.addEventListener('click', (event) => {
                const menu = document.getElementById('desktop-account-menu');
                const button = document.getElementById('desktop-auth-btn');
                if (!menu || !button || menu.classList.contains('hidden')) return;
                if (menu.contains(event.target) || button.contains(event.target)) return;
                closeDesktopAccountMenu();
            });
            document.addEventListener('click', (event) => {
                const modal = document.getElementById('coach-schedule-modal');
                if (modal && !modal.classList.contains('hidden') && event.target === modal) {
                    closeScheduleModal();
                }
            });

            window.addEventListener('hashchange', () => {
                const route = parseSectionHash();
                const nextPayload = JSON.stringify(route.payload || null);
                const currentPayload = JSON.stringify(state.currentPayload || null);
                if (state.currentSection === route.sectionId && nextPayload === currentPayload) return;
                renderSection(route.sectionId, route.payload, { syncHash: false });
            });

            (async function init() {
                try {
                    if (typeof initializeSupabase === 'function') await initializeSupabase();
                } catch (e) {
                    if (window.console && window.console.error) window.console.error('initializeSupabase error', e);
                }
                const initialRoute = parseSectionHash();
                try {
                    renderSection(initialRoute.sectionId, initialRoute.payload, { syncHash: false });
                } catch (e) {
                    if (window.console && window.console.error) window.console.error('renderSection error', e);
                    try { renderSection('home', null, { syncHash: false }); } catch (_) {}
                }
            })();
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', runAppInit);
        } else {
            runAppInit();
        }

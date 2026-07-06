// ER App: Adaptive test logic — phases, scoring, rendering
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
                            <div class="rounded-xl border-2 border-gray-200 p-4 text-sm text-gray-700 peer-checked:border-[#30322D] peer-checked:bg-[#FBFAF5] smooth-transition">
                                <span class="inline-block text-xs font-bold text-[#30322D] mb-1">${adaptiveText('forcedA')}</span>
                                <div>${aText}</div>
                            </div>
                        </label>
                        <label class="block cursor-pointer">
                            <input type="radio" name="${item.id}" value="B" class="sr-only peer">
                            <div class="rounded-xl border-2 border-gray-200 p-4 text-sm text-gray-700 peer-checked:border-[#30322D] peer-checked:bg-[#FBFAF5] smooth-transition">
                                <span class="inline-block text-xs font-bold text-[#30322D] mb-1">${adaptiveText('forcedB')}</span>
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
                                    <label for="${item.id}-${val}" class="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full border-2 border-gray-200 text-gray-400 cursor-pointer peer-hover:border-[#657453] hover:bg-gray-50 smooth-transition font-semibold text-sm bg-white">
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
                ? `<br><br><span class="text-[#657453] text-xs">* For core Types 3/6/9, a -2.5 correction was applied to Social-instinct scoring to reduce possible over-selection bias on socially weighted items.</span>`
                : `<br><br><span class="text-[#657453] text-xs">* ${coreType}번은 사회성 관련 문항에서 과대표집이 발생할 수 있어, 사회적 본능(SO)에 -2.5 보정치가 적용되었습니다.</span>`;
        }
        if (adaptiveTieBreakerMeta.enabled) {
            const marginPct = ((adaptiveTieBreakerMeta.margin ?? 0) * 100).toFixed(1);
            logMsg += adaptiveLang === 'en'
                ? `<br><br><span class="text-[#30322D] text-xs">* 3 vs 6 tie-breaker was activated (base margin ${marginPct}%, weight x${adaptiveTieBreakerMeta.weight.toFixed(2)}).</span>`
                : `<br><br><span class="text-[#30322D] text-xs">* 3번/6번 혼동 보정 타이브레이커가 적용되었습니다 (1차 점수차 ${marginPct}%, 가중치 x${adaptiveTieBreakerMeta.weight.toFixed(2)}).</span>`;
        }
        if (adaptiveTieBreaker31Meta.enabled) {
            const marginPct31 = ((adaptiveTieBreaker31Meta.margin ?? 0) * 100).toFixed(1);
            logMsg += adaptiveLang === 'en'
                ? `<br><br><span class="text-[#30322D] text-xs">* 3 vs 1 tie-breaker was activated (base margin ${marginPct31}%, weight x${adaptiveTieBreaker31Meta.weight.toFixed(2)}).</span>`
                : `<br><br><span class="text-[#30322D] text-xs">* 3번/1번 혼동 보정 타이브레이커가 적용되었습니다 (1차 점수차 ${marginPct31}%, 가중치 x${adaptiveTieBreaker31Meta.weight.toFixed(2)}).</span>`;
        }
        if (adaptiveTieBreaker3SXMeta.enabled) {
            const marginPct3sx = ((adaptiveTieBreaker3SXMeta.margin ?? 0) * 100).toFixed(1);
            const dampTxt = threeVsSxDampApplied > 0 ? threeVsSxDampApplied.toFixed(2) : '0.00';
            logMsg += adaptiveLang === 'en'
                ? `<br><br><span class="text-[#30322D] text-xs">* 3 vs SX tie-breaker was activated (3-to-top margin ${marginPct3sx}%, weight x${adaptiveTieBreaker3SXMeta.weight.toFixed(2)}, Type 3 damp ${dampTxt}).</span>`
                : `<br><br><span class="text-[#30322D] text-xs">* 3번/SX 혼동 보정 타이브레이커가 적용되었습니다 (3번-상위점수 차 ${marginPct3sx}%, 가중치 x${adaptiveTieBreaker3SXMeta.weight.toFixed(2)}, 3번 감쇠 ${dampTxt}).</span>`;
        }
        if (adaptiveTieBreaker71Meta.enabled) {
            logMsg += adaptiveLang === 'en'
                ? `<br><br><span class="text-[#30322D] text-xs">* 7 vs 1 tie-breaker was activated (weight x${adaptiveTieBreaker71Meta.weight.toFixed(2)}).</span>`
                : `<br><br><span class="text-[#30322D] text-xs">* 7번/1번 전용 타이브레이커가 적용되었습니다 (가중치 x${adaptiveTieBreaker71Meta.weight.toFixed(2)}).</span>`;
        }
        if (adaptiveTieBreaker78Meta.enabled) {
            logMsg += adaptiveLang === 'en'
                ? `<br><br><span class="text-[#30322D] text-xs">* 7 vs 8 tie-breaker was activated (weight x${adaptiveTieBreaker78Meta.weight.toFixed(2)}).</span>`
                : `<br><br><span class="text-[#30322D] text-xs">* 7번/8번 전용 타이브레이커가 적용되었습니다 (가중치 x${adaptiveTieBreaker78Meta.weight.toFixed(2)}).</span>`;
        }
        if (adaptiveTieBreaker7WingMeta.enabled && coreType === 7) {
            logMsg += adaptiveLang === 'en'
                ? `<br><br><span class="text-[#30322D] text-xs">* 7w6 vs 7w8 wing tie-breaker was applied.</span>`
                : `<br><br><span class="text-[#30322D] text-xs">* 7w6 / 7w8 날개 보정 문항이 적용되었습니다.</span>`;
        }
        if (recentStress >= 4) {
            logMsg += adaptiveLang === 'en'
                ? `<br><br><span class="text-[#30322D] text-xs">* Two-week stress correction was applied to reduce temporary stress-direction inflation.</span>`
                : `<br><br><span class="text-[#30322D] text-xs">* 최근 2주 스트레스 보정이 적용되어, 일시적 스트레스 방향 과상승을 완충했습니다.</span>`;
        }
    }

    document.getElementById('res-log').innerHTML = logMsg;
}

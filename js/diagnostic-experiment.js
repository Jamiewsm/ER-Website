/**
 * 결과의 선택형 평가와 별도 실명 진단 실험 제출을 관리한다.
 * - 실명·동의 후 테스트 시작, 완료 후 자기평가와 함께 Supabase에 제출
 * - 사이트 오픈 전 소수 초대용. 일반 공개 시 URL 제거·정책 재검토 권장.
 */
(function () {
  var EXP_QUERY = "experiment";
  var EXP_STORAGE_KEY = "er_experiment_mode";
  var CONSENT_VERSION = "2026-09-21-choice-only";

  function safeSessionStorage() {
    try {
      return window.sessionStorage;
    } catch (e) {
      return null;
    }
  }

  function isTruthyExperimentValue(raw) {
    if (raw == null) return false;
    var v = String(raw).trim().toLowerCase();
    return v === "" || v === "1" || v === "true" || v === "yes" || v === "on";
  }

  function isExperimentMode() {
    try {
      var params = new URLSearchParams(window.location.search || "");
      var hasQuery = params.has(EXP_QUERY);
      var raw = params.get(EXP_QUERY);
      var fromQuery = hasQuery && isTruthyExperimentValue(raw);
      var storage = safeSessionStorage();
      if (storage && hasQuery) {
        if (fromQuery) storage.setItem(EXP_STORAGE_KEY, "1");
        else storage.removeItem(EXP_STORAGE_KEY);
      }
      var fromStorage = storage ? storage.getItem(EXP_STORAGE_KEY) === "1" : false;
      return fromQuery || fromStorage;
    } catch (e) {
      return false;
    }
  }

  function langEn() {
    return document.documentElement.lang === "en";
  }

  function txt(ko, en) {
    return langEn() ? en : ko;
  }

  function getMeta() {
    return window.__ER_DIAGNOSTIC_EXPERIMENT__ || null;
  }

  function setMeta(partial) {
    window.__ER_DIAGNOSTIC_EXPERIMENT__ = Object.assign(
      {},
      window.__ER_DIAGNOSTIC_EXPERIMENT__ || {},
      partial
    );
  }

  function hideAssessmentForGate() {
    ["phase0-form", "phase1-form", "phase2-form", "phase3-form", "phase4-form", "result-view", "progress-container"].forEach(function (id) {
      var element = document.getElementById(id);
      if (element) element.classList.add("hidden");
    });
  }

  function showGate() {
    var gate = document.getElementById("experiment-gate");
    var closed = document.getElementById("experiment-closed");
    if (gate) gate.classList.remove("hidden");
    if (closed) closed.classList.add("hidden");
    hideAssessmentForGate();
  }

  function showClosedMessage() {
    var closed = document.getElementById("experiment-closed");
    var gate = document.getElementById("experiment-gate");
    if (closed) closed.classList.remove("hidden");
    if (gate) gate.classList.add("hidden");
    hideAssessmentForGate();
  }

  function hideGateShowTest() {
    var gate = document.getElementById("experiment-gate");
    if (gate) gate.classList.add("hidden");
    if (typeof window.resumeAssessmentAfterGate === "function") {
      window.resumeAssessmentAfterGate();
      return;
    }
    var phase0 = document.getElementById("phase0-form");
    var phase1 = document.getElementById("phase1-form");
    var progress = document.getElementById("progress-container");
    if (phase0) phase0.classList.remove("hidden");
    if (phase1) phase1.classList.add("hidden");
    if (progress) progress.classList.remove("hidden");
  }

  function bindGate() {
    var btn = document.getElementById("experiment-gate-start");
    var nameEl = document.getElementById("experiment-participant-name");
    var consentEl = document.getElementById("experiment-consent");
    var errEl = document.getElementById("experiment-gate-error");
    if (!btn || !nameEl || !consentEl) return;
    if (btn.dataset.bound === "true") return;
    btn.dataset.bound = "true";

    btn.addEventListener("click", function () {
      var name = (nameEl.value || "").trim();
      if (name.length < 1) {
        if (errEl) {
          errEl.textContent = txt("이름을 입력해 주세요.", "Please enter your name.");
          errEl.classList.remove("hidden");
        }
        return;
      }
      if (name.length > 200) {
        if (errEl) {
          errEl.textContent = txt("이름이 너무 깁니다.", "Name is too long.");
          errEl.classList.remove("hidden");
        }
        return;
      }
      if (!consentEl.checked) {
        if (errEl) {
          errEl.textContent = txt(
            "검사 자료 저장에 동의해 주세요.",
            "Please confirm consent to store responses."
          );
          errEl.classList.remove("hidden");
        }
        return;
      }
      if (errEl) errEl.classList.add("hidden");

      setMeta({
        participantName: name,
        consentAccepted: true,
        consentVersion: CONSENT_VERSION,
        startedAt: new Date().toISOString(),
      });
      hideGateShowTest();
      if (pendingExperimentResult) {
        var result = pendingExperimentResult;
        pendingExperimentResult = null;
        onResultReady(result);
      }
    });
  }

  var SURVEY_VERSION = "result-feedback-v1";
  var FEEDBACK_CONSENT_VERSION = "2026-09-28-feedback-v1";
  var PARTS = ["core", "subtype", "wing", "description"];
  var DIFFICULTIES = ["words", "context", "multiple", "none_fit", "length", "none"];
  var feedbackStates = Object.create(null);
  var activeFeedback = null;
  var pendingExperimentResult = null;

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function allowedChoices(values, allowed) {
    return allowed.filter(function (value) { return Array.isArray(values) && values.includes(value); });
  }

  function normalizeFeedback(detail) {
    detail = detail || {};
    var deferred = detail.deferred === true;
    var rating = !deferred && Number.isInteger(detail.rating) && detail.rating >= 1 && detail.rating <= 5 ? detail.rating : null;
    var matching = allowedChoices(detail.matching_parts, PARTS);
    var difficulties = allowedChoices(detail.difficulties, DIFFICULTIES);
    return {
      survey_version: SURVEY_VERSION,
      rating: rating,
      deferred: deferred,
      matching_parts: matching,
      mismatching_parts: allowedChoices(detail.mismatching_parts, PARTS).filter(function (part) { return !matching.includes(part); }),
      difficulties: difficulties.includes("none") ? ["none"] : difficulties,
    };
  }

  function legacySelfAssessment(detail) {
    return detail.deferred || detail.rating === 3 || detail.rating === null ? "ambiguous" : detail.rating >= 4 ? "correct" : "incorrect";
  }

  function validType(value) {
    return Number.isInteger(value) && value >= 1 && value <= 9;
  }

  function publicResult(payload) {
    var metadata = payload.assessmentMetadata || {};
    var core = payload.coreResolved === true && validType(payload.core) ? payload.core : null;
    var phase4 = payload.phase4 || {};
    var subtype = String(phase4.subtypeCode || "").split("_")[0];
    var wing = phase4.wingNum;
    var candidates = metadata.reviewedCandidates || (payload.screening || {}).candidates || [];
    return {
      core: core,
      core_resolved: core !== null,
      subtype: core && ["sp", "sx", "so"].includes(subtype) ? subtype : null,
      wing: core && [core === 1 ? 9 : core - 1, core === 9 ? 1 : core + 1].includes(wing) ? wing : null,
      candidate_types: Array.isArray(candidates) ? candidates.filter(function (value, index) { return validType(value) && candidates.indexOf(value) === index; }) : [],
    };
  }

  function buildPublicFeedbackPayload(payload, detail, token) {
    var metadata = payload.assessmentMetadata || {};
    var versions = metadata.versions || {};
    var feedback = normalizeFeedback(detail);
    var result = publicResult(payload);
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(metadata.attemptId || "") ||
      !Number.isInteger(metadata.revision) || metadata.revision < 0 || metadata.revision > 2147483647 ||
      metadata.variant !== "word" ||
      result.candidate_types.length < 3 || result.candidate_types.length > 4 ||
      !["assessment", "instructions", "questions", "scoring", "report"].every(function (key) { return typeof versions[key] === "string" && /^[A-Za-z0-9._-]{1,64}$/.test(versions[key]); })) {
      throw new Error("feedback_metadata_missing");
    }
    if ((feedback.rating === null && !feedback.deferred) || detail.consent !== true || !token) throw new Error("feedback_incomplete");
    return {
      attempt_id: metadata.attemptId,
      revision: metadata.revision,
      result: result,
      versions: { assessment: versions.assessment, instructions: versions.instructions, questions: versions.questions, scoring: versions.scoring, report: versions.report, survey: SURVEY_VERSION },
      variant: "word",
      rating: feedback.rating,
      deferred: feedback.deferred,
      matching_parts: feedback.matching_parts,
      mismatching_parts: feedback.mismatching_parts,
      difficulties: feedback.difficulties,
      consent_version: FEEDBACK_CONSENT_VERSION,
      consent_accepted: true,
      turnstile_token: token,
    };
  }

  function setFeedbackStatus(state, message) {
    state.message = message;
    if (activeFeedback && activeFeedback.state === state) activeFeedback.status.textContent = message;
  }

  function syncFeedbackState(state) {
    if (!activeFeedback || activeFeedback.state !== state) return;
    var view = activeFeedback;
    view.submit.disabled = state.submitting || state.sent || state.conflict;
    view.fields.disabled = state.submitting || state.sent;
    if (view.retry) view.retry.disabled = state.submitting || state.sent;
    [view.intro, view.fields, view.submit, view.securityGroup].forEach(function (element) {
      if (element) element.hidden = state.sent;
    });
    view.status.textContent = state.message;
  }

  function clearWidget(view) {
    view.token = "";
    view.widgetGeneration += 1;
    if (view.widgetId !== null && window.turnstile && typeof window.turnstile.remove === "function") {
      try { window.turnstile.remove(view.widgetId); } catch (e) { /* 이미 제거된 위젯은 다음 렌더에서 대체한다. */ }
    }
    view.widgetId = null;
  }

  function mountFeedbackTurnstile(view) {
    if (activeFeedback !== view || view.experiment || view.state.sent || view.state.submitting || view.widgetId !== null) return;
    var sitekey = String(window.TURNSTILE_SITE_KEY || "").trim();
    if (!sitekey || !window.turnstile || typeof window.turnstile.render !== "function") {
      view.security.textContent = txt("보안 확인을 불러오지 못했습니다. 잠시 후 보안 확인 다시 시도를 눌러 주세요.", "Security verification is unavailable. Try security verification again shortly.");
      return;
    }
    var generation = ++view.widgetGeneration;
    function current() { return activeFeedback === view && view.widgetGeneration === generation && !view.state.sent; }
    view.security.textContent = txt("보안 확인을 완료해 주세요.", "Please complete security verification.");
    try {
      view.widgetId = window.turnstile.render(view.widget, {
        sitekey: sitekey, action: "assessment-feedback", theme: "light", size: "compact",
        callback: function (token) {
          if (!current()) return;
          view.token = typeof token === "string" ? token : "";
          view.security.textContent = txt("보안 확인이 완료되었습니다.", "Security verification completed.");
        },
        "expired-callback": function () {
          if (!current()) return;
          view.token = "";
          view.security.textContent = txt("보안 확인이 만료되었습니다. 보안 확인 다시 시도를 눌러 주세요.", "Security verification expired. Try security verification again.");
        },
        "error-callback": function () {
          if (!current()) return;
          view.token = "";
          view.security.textContent = txt("보안 확인에 실패했습니다. 보안 확인 다시 시도를 눌러 주세요.", "Security verification failed. Try security verification again.");
        },
      });
    } catch (e) {
      clearWidget(view);
      view.security.textContent = txt("보안 확인을 표시하지 못했습니다. 다시 시도해 주세요.", "Unable to display security verification. Please try again.");
    }
  }

  function resetFeedbackTurnstile(view) {
    clearWidget(view);
    view.widget.innerHTML = "";
    mountFeedbackTurnstile(view);
  }

  function checkboxMarkup(id, label, checked) {
    return '<label><input type="checkbox" id="' + id + '"' + (checked ? ' checked' : '') + '><span>' + label + '</span></label>';
  }

  function mountResultUi(payload, experiment) {
    var host = document.getElementById("experiment-result-panel");
    if (!host) return;
    if (activeFeedback) clearWidget(activeFeedback);
    var metadata = payload.assessmentMetadata || {};
    var key = (experiment ? "experiment:" : "public:") + (metadata.attemptId || "legacy") + ":" + (metadata.revision || 0);
    var state = feedbackStates[key];
    if (!state) {
      var sent = false;
      try { var storage = safeSessionStorage(); sent = storage && storage.getItem("er_feedback_sent:" + key) === "1"; } catch (e) { /* 저장소 없이도 현재 화면의 중복 제출은 차단한다. */ }
      state = feedbackStates[key] = { payload: payload, rating: null, deferred: false, matching_parts: [], mismatching_parts: [], difficulties: [], consent: false, knownCore: "", knownSubtype: "", knownWing: "", sent: !!sent, submitting: false, conflict: false, message: sent ? txt("제출되었습니다. 감사합니다.", "Submitted. Thank you.") : "" };
    }
    var partNames = { core: txt("유형", "Core type"), subtype: txt("하위유형", "Subtype"), wing: txt("날개", "Wing"), description: txt("결과 설명", "Result description") };
    var difficultyNames = { words: txt("단어의 뜻", "Word meanings"), context: txt("상황을 떠올리기", "Recalling a situation"), multiple: txt("여러 답이 비슷함", "Several answers fit"), none_fit: txt("맞는 답이 없음", "No answer fits"), length: txt("검사 길이", "Test length"), none: txt("어려움 없음", "No difficulty") };
    var ratingNames = [txt("전혀 비슷하지 않다", "Not at all similar"), txt("별로 비슷하지 않다", "Not very similar"), txt("어느 정도 비슷하다", "Somewhat similar"), txt("많이 비슷하다", "Very similar"), txt("매우 비슷하다", "Extremely similar")];
    host.classList.remove("hidden");
    host.innerHTML = '<section class="er-result-feedback" aria-labelledby="feedback-title">' +
      '<div id="feedback-intro"><h3 id="feedback-title">' + txt("이 결과는 나와 얼마나 비슷한가요?", "How much does this result resemble you?") + '</h3>' +
      '<p>' + txt("평가는 선택사항입니다. 제출하지 않아도 결과와 상담 안내를 이용할 수 있습니다.", "Feedback is optional. Your results and consultation information remain available without submitting.") + '</p>' +
      '<p>' + (experiment ? txt("제출하기를 누르면 이름, 검사 응답과 결과, 선택한 평가가 저장됩니다. 검사 개선에 사용하며 삭제는 운영자에게 요청할 수 있습니다.", "Submitting saves your name, answers, results, and selected feedback for test improvement. You may request deletion from the operator.") : txt("이름·연락처·원래 검사 답변은 보내지 않습니다. 선택형 평가, 결과 요약과 검사·평가 버전만 익명으로 저장해 검사 개선에 사용합니다.", "We do not send your name, contact details, or original answers. Only selected feedback, the result summary, and test/survey versions are stored anonymously to improve the test.")) + '</p>' +
      '</div><fieldset id="feedback-fields"><legend class="sr-only">' + txt("결과 평가", "Result feedback") + '</legend>' +
      '<fieldset><legend>' + txt("나와 비슷한 정도", "How similar it feels") + '</legend><div class="er-feedback-options er-feedback-rating">' +
      ratingNames.map(function (label, i) { var value = i + 1; return '<label><input type="radio" name="assessment-feedback-rating" id="feedback-rating-' + value + '" value="' + value + '"' + (state.rating === value ? ' checked' : '') + '><span>' + value + ' · ' + label + '</span></label>'; }).join('') +
      '<label><input type="radio" name="assessment-feedback-rating" id="feedback-rating-deferred" value="deferred"' + (state.deferred ? ' checked' : '') + '><span>' + txt("아직 판단하기 어렵다", "Not ready to judge") + '</span></label></div></fieldset>' +
      ['matching_parts', 'mismatching_parts'].map(function (field) { return '<fieldset><legend>' + (field === 'matching_parts' ? txt("비슷하게 느낀 부분 (선택)", "Parts that fit (optional)") : txt("다르게 느낀 부분 (선택)", "Parts that differ (optional)")) + '</legend><div class="er-feedback-options er-feedback-parts">' + PARTS.map(function (part) { return checkboxMarkup('feedback-' + field + '-' + part, partNames[part], state[field].includes(part)); }).join('') + '</div></fieldset>'; }).join('') +
      '<fieldset><legend>' + txt("답하기 어려웠던 점 (선택)", "What was difficult to answer (optional)") + '</legend><div class="er-feedback-options">' + DIFFICULTIES.map(function (item) { return checkboxMarkup('feedback-difficulties-' + item, difficultyNames[item], state.difficulties.includes(item)); }).join('') + '</div></fieldset>' +
      (experiment ? '<fieldset><legend>' + txt("이전에 상담에서 안내받은 유형(본인 기억) · 선택", "Type discussed in a previous consultation (your recollection) · optional") + '</legend><div class="er-feedback-parts">' +
        '<label for="experiment-known-core">' + txt("유형", "Core type") + '</label><select id="experiment-known-core"><option value="">' + txt("선택 안 함", "Not selected") + '</option>' + [1,2,3,4,5,6,7,8,9].map(function (core) { return '<option value="' + core + '">' + core + '</option>'; }).join('') + '</select>' +
        '<label for="experiment-known-subtype">' + txt("하위유형", "Subtype") + '</label><select id="experiment-known-subtype"><option value="">' + txt("선택 안 함", "Not selected") + '</option><option value="sp">' + txt("자본 · 자기보존", "Self-preservation") + '</option><option value="sx">' + txt("성본 · 일대일", "One-to-one") + '</option><option value="so">' + txt("사본 · 사회적", "Social") + '</option></select>' +
        '<label for="experiment-known-wing">' + txt("날개", "Wing") + '</label><select id="experiment-known-wing"></select></div></fieldset>' : '') +
      '<label class="er-feedback-consent"><input type="checkbox" id="feedback-consent"' + (state.consent ? ' checked' : '') + '><span>' + txt("위 내용을 읽었으며 검사 개선을 위한 자료 저장에 동의합니다.", "I have read the above and consent to storing this data for test improvement.") + '</span></label></fieldset>' +
      (experiment ? '' : '<div id="feedback-security" class="er-feedback-turnstile"><div id="feedback-turnstile-widget"></div><p id="feedback-security-status" role="status" aria-live="polite"></p><button id="feedback-security-retry" type="button">' + txt("보안 확인 다시 시도", "Retry security verification") + '</button></div>') +
      '<button type="button" id="experiment-submit-btn" class="er-test-primary er-feedback-submit">' + txt("평가 제출하기", "Submit feedback") + '</button><p id="experiment-submit-status" class="er-feedback-status" role="status" aria-live="polite"></p></section>';

    var view = activeFeedback = { host: host, state: state, key: key, experiment: experiment, intro: document.getElementById("feedback-intro"), submit: document.getElementById("experiment-submit-btn"), fields: document.getElementById("feedback-fields"), status: document.getElementById("experiment-submit-status"), securityGroup: document.getElementById("feedback-security"), widget: document.getElementById("feedback-turnstile-widget"), security: document.getElementById("feedback-security-status"), retry: document.getElementById("feedback-security-retry"), widgetId: null, widgetGeneration: 0, token: "" };
    [1,2,3,4,5,"deferred"].forEach(function (value) {
      document.getElementById("feedback-rating-" + value).addEventListener("change", function (event) {
        if (!event.target.checked) return;
        state.deferred = value === "deferred";
        state.rating = state.deferred ? null : value;
      });
    });
    ["matching_parts", "mismatching_parts", "difficulties"].forEach(function (field) {
      (field === "difficulties" ? DIFFICULTIES : PARTS).forEach(function (value) {
        document.getElementById("feedback-" + field + "-" + value).addEventListener("change", function (event) {
          state[field] = state[field].filter(function (item) { return item !== value; });
          if (event.target.checked) state[field].push(value);
          if (!event.target.checked) return;
          if (field === "difficulties") {
            state.difficulties = value === "none" ? ["none"] : state.difficulties.filter(function (item) { return item !== "none"; });
            DIFFICULTIES.forEach(function (item) { document.getElementById("feedback-difficulties-" + item).checked = state.difficulties.includes(item); });
          } else {
            var other = field === "matching_parts" ? "mismatching_parts" : "matching_parts";
            state[other] = state[other].filter(function (item) { return item !== value; });
            document.getElementById("feedback-" + other + "-" + value).checked = false;
          }
        });
      });
    });
    document.getElementById("feedback-consent").addEventListener("change", function (event) { state.consent = event.target.checked; });
    if (experiment) bindReportedType(state);
    else {
      view.retry.addEventListener("click", function () { if (!state.submitting && !state.sent) resetFeedbackTurnstile(view); });
      mountFeedbackTurnstile(view);
    }
    view.submit.addEventListener("click", function () { return submitFeedback(view); });
    syncFeedbackState(state);
  }

  function bindReportedType(state) {
    var core = document.getElementById("experiment-known-core");
    var subtype = document.getElementById("experiment-known-subtype");
    var wing = document.getElementById("experiment-known-wing");
    function updateWings() {
      var value = Number(state.knownCore);
      wing.disabled = !value;
      wing.innerHTML = '<option value="">' + txt("선택 안 함", "Not selected") + '</option>' + (value ? [value === 1 ? 9 : value - 1, value === 9 ? 1 : value + 1].map(function (item) { return '<option value="' + value + 'w' + item + '">' + item + '</option>'; }).join('') : '');
      wing.value = state.knownWing;
    }
    core.value = state.knownCore;
    subtype.value = state.knownSubtype;
    updateWings();
    core.addEventListener("change", function () { state.knownCore = core.value; state.knownWing = ""; updateWings(); });
    subtype.addEventListener("change", function () { state.knownSubtype = subtype.value; });
    wing.addEventListener("change", function () { state.knownWing = wing.value; });
  }

  async function submitFeedback(view) {
    var state = view.state;
    if (activeFeedback !== view || state.submitting || state.sent || state.conflict) return;
    var detail = normalizeFeedback(state);
    if (detail.rating === null && !detail.deferred) return setFeedbackStatus(state, txt("비슷한 정도 또는 판단하기 어려움을 선택해 주세요.", "Select a rating or not ready to judge."));
    if (!state.consent) return setFeedbackStatus(state, txt("자료 저장에 동의한 뒤 제출해 주세요.", "Please consent to data storage before submitting."));
    var meta = getMeta();
    if (view.experiment && (!meta || !String(meta.participantName || "").trim() || meta.consentAccepted !== true)) return setFeedbackStatus(state, txt("이름과 저장 동의 정보가 없습니다. 처음 화면에서 다시 확인해 주세요.", "Name or consent information is missing. Please confirm it on the first screen."));
    if (!view.experiment && !view.token) return setFeedbackStatus(state, txt("보안 확인을 완료한 뒤 제출해 주세요.", "Complete security verification before submitting."));
    if (!window.supabaseClient) return setFeedbackStatus(state, txt("저장 서버에 연결되지 않았습니다. 잠시 후 다시 시도해 주세요.", "Storage is unavailable. Please try again shortly."));
    state.submitting = true;
    setFeedbackStatus(state, txt("제출 중…", "Submitting…"));
    syncFeedbackState(state);
    try {
      var response;
      if (view.experiment) {
        response = await window.supabaseClient.from("diagnostic_experiment_sessions").insert(buildRow(meta, state.payload, legacySelfAssessment(detail), null, state.knownCore, state.knownSubtype, state.knownWing, detail));
        if (!response || response.error) throw new Error("feedback_save_failed");
      } else {
        var body = buildPublicFeedbackPayload(state.payload, state, view.token);
        view.token = "";
        response = await window.supabaseClient.functions.invoke("submit-assessment-feedback", { body: body });
        if (!response || response.error || !response.data || response.data.saved !== true) {
          var code = response && response.data && response.data.error;
          var context = response && response.error && response.error.context;
          if (!code && context && typeof context.clone === "function") {
            try { code = (await context.clone().json()).error; } catch (e) { /* 응답 본문을 읽지 못해도 실패로 처리한다. */ }
          }
          throw new Error(code === "revision_conflict" ? code : "feedback_save_failed");
        }
      }
      state.sent = true;
      try { var storage = safeSessionStorage(); if (storage) storage.setItem("er_feedback_sent:" + view.key, "1"); } catch (e) { /* 서버의 시도·회차 중복 검사와 현재 화면 상태를 유지한다. */ }
      setFeedbackStatus(state, txt("제출되었습니다. 감사합니다.", "Submitted. Thank you."));
      if (activeFeedback && activeFeedback.state === state && !view.experiment) {
        clearWidget(activeFeedback);
        activeFeedback.security.textContent = "";
      }
    } catch (error) {
      state.conflict = !!(error && error.message === "revision_conflict");
      setFeedbackStatus(state, state.conflict ? txt("이 결과에 대한 평가는 이미 저장되어 변경할 수 없습니다. 후보를 재검토해 새 결과를 만든 경우 다시 평가할 수 있습니다.", "Feedback for this result was already saved and cannot be changed. You can rate a new result after reviewing the candidates.") : error && error.message === "feedback_metadata_missing" ? txt("검사 정보가 없어 평가를 저장할 수 없습니다. 결과는 계속 확인할 수 있습니다.", "Test metadata is missing, so feedback cannot be saved. Your result remains available.") : txt("제출하지 못했습니다. 선택한 내용은 유지됩니다. 잠시 후 다시 시도해 주세요.", "Submission failed. Your selections are preserved. Please try again shortly."));
    } finally {
      state.submitting = false;
      syncFeedbackState(state);
      if (!state.sent && !state.conflict && activeFeedback && activeFeedback.state === state && !view.experiment) resetFeedbackTurnstile(activeFeedback);
    }
  }

  function roundPercent(value) {
    if (!Number.isFinite(value)) return 0;
    return Number(value.toFixed(2));
  }

  function buildTieBreakersUsed(tieSnapshot) {
    var tie = tieSnapshot || {};
    return Object.keys(tie)
      .filter(function (key) {
        return tie[key] && tie[key].enabled === true;
      })
      .map(function (key) {
        var item = tie[key] || {};
        var out = { key: key };
        if (Number.isFinite(Number(item.weight))) out.weight = Number(item.weight);
        if (item.margin !== undefined && item.margin !== null) out.margin = item.margin;
        if (item.typeA !== undefined && item.typeA !== null) out.typeA = item.typeA;
        if (item.typeB !== undefined && item.typeB !== null) out.typeB = item.typeB;
        return out;
      });
  }

  function buildExperimentAnalyticsPayload(payload) {
    var ranked = payload.ranked || [];
    var top3Total = payload.top3Total || 0;
    var phase4 = payload.phase4 || null;
    var second = payload.second || ranked[1] || null;

    var analytics = {
      result: {
        core: payload.coreResolved === false ? null : payload.core || null,
        subtype: (function () {
          if (!(phase4 && phase4.subtypeCode)) return null;
          var code = String(phase4.subtypeCode).trim().toLowerCase();
          if (/^(sp|sx|so)_[1-9]$/.test(code)) return code;
          if (/^(sp|sx|so)$/.test(code) && payload.core) return code + '_' + payload.core;
          return phase4.subtypeCode;
        })(),
        wing: phase4 && phase4.wingNum ? phase4.wingNum : null,
        confidence: payload.confidence || payload.confidenceLabel || null,
        coreResolved: !!payload.coreResolved,
        reportKey: payload.reportKey || null,
      },
      rankedTop3: ranked.slice(0, 3).map(function (x) {
        return {
          type: x.type,
          score: x.score,
          share: top3Total > 0 ? roundPercent((x.score / top3Total) * 100) : 0,
        };
      }),
      topPair: {
        first: ranked[0] ? ranked[0].type : payload.core || null,
        second: second ? second.type : null,
        diff: payload.diff !== undefined ? payload.diff : null,
      },
      responseQuality: payload.responseQuality || null,
      scoringAxes: payload.scoringAxes || null,
      eliminatedTypes: payload.eliminatedTypes || [],
      eliminationResurrected: payload.eliminationResurrected || [],
      tieBreakersUsed: buildTieBreakersUsed(payload.tieSnapshot),
      stateStressAdjustment: payload.stateStressAdjustment || null,
      phase4Result: phase4,
      timings: payload.responseTiming || null,
    };
    if (payload.assessmentVersion === "word-narrative-v2") {
      analytics.assessmentVersion = payload.assessmentVersion;
      analytics.screening = payload.screening || null;
    }
    if (payload.assessmentMetadata) analytics.assessmentMetadata = clone(payload.assessmentMetadata);
    return analytics;
  }

  function buildRow(meta, payload, selfAssessment, selfNote, knownCore, knownSubtype, knownWing, feedbackDetail) {
    var ranked = payload.ranked || [];
    var top3 = ranked.slice(0, 3).map(function (x) {
      var total = payload.top3Total || 0;
      var pct = total > 0 ? ((x.score / total) * 100).toFixed(2) : "0";
      return { type: x.type, score: x.score, relative_pct: pct };
    });
    // 이전 호출이 주관식 내용을 넘겨도 새 제출에는 포함하지 않는다.
    knownCore = /^[1-9]$/.test(String(knownCore || '')) ? String(knownCore) : null;
    knownSubtype = ['sp', 'so', 'sx'].includes(knownSubtype) ? knownSubtype : null;
    // Analyzer expects combined instinct/core codes (e.g. so_4), matching fixture + countertype audit.
    if (knownSubtype && knownCore) knownSubtype = knownSubtype + '_' + knownCore;
    var coreNumber = Number(knownCore);
    var validWings = coreNumber ? [coreNumber + 'w' + (coreNumber === 1 ? 9 : coreNumber - 1), coreNumber + 'w' + (coreNumber === 9 ? 1 : coreNumber + 1)] : [];
    knownWing = validWings.includes(knownWing) ? knownWing : null;

    var detail = normalizeFeedback(feedbackDetail);
    return {
      participant_name: String(meta.participantName || "").trim(),
      consent_version: meta.consentVersion || CONSENT_VERSION,
      consent_accepted: !!meta.consentAccepted,
      lang: payload.pageLang || (langEn() ? "en" : "ko"),
      started_at: meta.startedAt || null,
      completed_at: new Date().toISOString(),
      responses: payload.responses || {},
      scores: payload.final || {},
      top3: top3,
      result_summary: {
        res_final: payload.resFinalText || "",
        res_core: payload.coreDisplay || "",
        res_wing: payload.wingDisplay || "",
        res_instinct: payload.instinctLine || "",
        confidence: payload.confidenceLabel || "",
        core: payload.core,
        second_type: payload.second ? payload.second.type : null,
        diff_ratio: payload.diff,
        core_resolved: payload.coreResolved,
        phase4: payload.phase4 || null,
        response_quality: payload.responseQuality || null,
        confidence_explanation: payload.confidenceExplanation || null,
        scoring_axes: payload.scoringAxes || null,
        experiment_payload: buildExperimentAnalyticsPayload(payload),
        feedback_detail: Object.assign({}, detail, {
          comparison_source: "participant_report",
          reported_type: { core: knownCore || null, subtype: knownSubtype || null, wing: knownWing || null },
        }),
      },
      tie_break_log: {
        tie: payload.tieSnapshot || {},
        post_tie_applied: !!payload.postTieApplied,
        recent_stress: payload.recentStress,
        response_timing: payload.responseTiming || null,
        state_stress_adjustment: payload.stateStressAdjustment || null,
      },
      evidence: payload.evidence || {},
      self_assessment: feedbackDetail && (detail.rating !== null || detail.deferred) ? legacySelfAssessment(detail) : selfAssessment,
      self_reported_core: knownCore || null,
      self_reported_subtype: knownSubtype || null,
      self_reported_wing: knownWing || null,
      self_note: null,
      user_agent: String(navigator.userAgent || "").slice(0, 500),
    };
  }

  function onResultReady(payload) {
    var experiment = isExperimentMode();
    var meta = getMeta();
    if (experiment && (!meta || !meta.participantName || meta.consentAccepted !== true)) {
      pendingExperimentResult = clone(payload || {});
      return;
    }

    var finalEl = document.getElementById("res-final");
    var coreEl = document.getElementById("res-core");
    var wingEl = document.getElementById("res-wing");
    var instEl = document.getElementById("res-instincts");
    var badgeEl = document.getElementById("confidence-badge");

    var enriched = Object.assign({}, clone(payload || {}), {
      pageLang: document.documentElement.lang === "en" ? "en" : "ko",
      resFinalText: finalEl ? finalEl.innerText.trim() : "",
      coreDisplay: coreEl ? coreEl.innerText.trim() : "",
      wingDisplay: wingEl ? wingEl.innerText.trim() : "",
      instinctLine: instEl ? instEl.innerText.trim() : "",
      confidenceLabel: badgeEl ? badgeEl.innerText.trim() : "",
    });

    mountResultUi(enriched, experiment);
  }

  function init() {
    if (!isExperimentMode()) {
      var closed = document.getElementById("experiment-closed");
      var gate = document.getElementById("experiment-gate");
      if (closed) closed.classList.add("hidden");
      if (gate) gate.classList.add("hidden");
      return;
    }
    var meta = getMeta();
    if (meta && meta.consentAccepted === true) return;
    showGate();
    bindGate();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
  window.addEventListener("load", init);
  setTimeout(init, 0);

  window.onERAssessmentFeedbackTurnstileReady = function () { if (activeFeedback) mountFeedbackTurnstile(activeFeedback); };

  window.ERDiagnosticExperiment = {
    isExperimentMode: isExperimentMode,
    onResultReady: onResultReady,
    onAssessmentReview: function () {
      pendingExperimentResult = null;
      if (!activeFeedback) return;
      clearWidget(activeFeedback);
      activeFeedback.host.classList.add("hidden");
      activeFeedback = null;
    },
    _test: {
      buildExperimentAnalyticsPayload: buildExperimentAnalyticsPayload,
      buildRow: buildRow,
      buildPublicFeedbackPayload: buildPublicFeedbackPayload,
      normalizeFeedback: normalizeFeedback,
    },
  };
})();

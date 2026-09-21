/**
 * ER 진단 실험 모드 (?experiment=1)
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
    });
  }

  function mountResultUi(payload) {
    var host = document.getElementById("experiment-result-panel");
    if (!host) return;

    host.classList.remove("hidden");
    host.innerHTML =
      '<div class="rounded-2xl border border-amber-200 bg-amber-50/80 p-6 space-y-4">' +
      '<p class="text-sm font-bold text-amber-900">' +
      txt("실험 데이터 제출", "Submit experiment data") +
      "</p>" +
      '<p class="text-xs text-amber-800/90 leading-relaxed">' +
      txt(
        "결과가 본인과 얼마나 잘 맞는지 선택해 주세요. 제출하기를 누르면 이름, 검사 응답과 결과, 선택한 평가가 저장됩니다. 자료는 검사 개선에만 사용하며, 삭제를 원하시면 운영자에게 요청할 수 있습니다.",
        "Please rate how well the result fits you, then submit. Clicking Submit saves your name, answers, results, and selected feedback. Data is used only to improve scoring; you may request deletion from the operator."
      ) +
      "</p>" +
      '<div class="space-y-2">' +
      '<p class="text-xs font-semibold text-gray-700">' +
      txt("이 결과가 나에게", "This result feels") +
      "</p>" +
      '<label class="flex items-center gap-2 text-sm text-gray-800 cursor-pointer">' +
      '<input type="radio" name="experiment-self" value="correct" class="accent-[#30322D]">' +
      txt("맞는 편이다", "Mostly accurate") +
      "</label>" +
      '<label class="flex items-center gap-2 text-sm text-gray-800 cursor-pointer">' +
      '<input type="radio" name="experiment-self" value="ambiguous" class="accent-[#30322D]">' +
      txt("애매하다", "Unclear / mixed") +
      "</label>" +
      '<label class="flex items-center gap-2 text-sm text-gray-800 cursor-pointer">' +
      '<input type="radio" name="experiment-self" value="incorrect" class="accent-[#30322D]">' +
      txt("맞지 않는 편이다", "Mostly inaccurate") +
      "</label>" +
      "</div>" +
      '<div class="grid gap-3 sm:grid-cols-3">' +
      '<div>' +
      '<label for="experiment-known-core" class="text-xs font-semibold text-gray-700">' +
      txt("상담에서 확인한 기본 유형", "Counsel-confirmed core type") +
      "</label>" +
      '<select id="experiment-known-core" class="mt-1 w-full rounded-xl border border-gray-200 p-3 text-sm">' +
      '<option value="">' + txt('기본 유형 선택 안 함', 'Core type not selected') + '</option>' +
      Array.from({ length: 9 }, function (_, i) { return '<option value="' + (i + 1) + '">' + txt((i + 1) + '번', 'Type ' + (i + 1)) + '</option>'; }).join('') +
      '</select>' +
      "</div>" +
      '<div>' +
      '<label for="experiment-known-subtype" class="text-xs font-semibold text-gray-700">' +
      txt("상담에서 확인한 하위유형", "Counsel-confirmed subtype") +
      "</label>" +
      '<select id="experiment-known-subtype" class="mt-1 w-full rounded-xl border border-gray-200 p-3 text-sm">' +
      '<option value="">' + txt('하위유형 선택 안 함', 'Subtype not selected') + '</option>' +
      ['sp', 'so', 'sx'].map(function (code) { var names = { sp: txt('자기보존', 'Self-preservation'), so: txt('사회적', 'Social'), sx: txt('성적(일대일)', 'One-to-one') }; return '<option value="' + code + '">' + names[code] + '</option>'; }).join('') +
      '</select>' +
      "</div>" +
      '<div>' +
      '<label for="experiment-known-wing" class="text-xs font-semibold text-gray-700">' +
      txt("상담에서 확인한 날개", "Counsel-confirmed wing") +
      "</label>" +
      '<select id="experiment-known-wing" class="mt-1 w-full rounded-xl border border-gray-200 p-3 text-sm" disabled>' +
      '<option value="">' + txt('기본 유형을 먼저 선택해 주세요', 'Select a core type first') + '</option>' +
      '</select>' +
      "</div>" +
      "</div>" +
      '<button type="button" id="experiment-submit-btn" class="w-full sm:w-auto bg-[#30322D] hover:bg-[#202219] text-white font-bold py-3 px-8 rounded-full text-sm">' +
      txt("제출하기", "Submit") +
      "</button>" +
      '<p id="experiment-submit-status" class="text-xs text-gray-600 min-h-[1.25rem]"></p>' +
      "</div>";

    var coreSelect = document.getElementById("experiment-known-core");
    var wingSelect = document.getElementById("experiment-known-wing");
    if (coreSelect && wingSelect) coreSelect.addEventListener("change", function () {
      var core = Number(coreSelect.value);
      wingSelect.disabled = !core;
      wingSelect.innerHTML = '<option value="">' + txt('날개 선택 안 함', 'Wing not selected') + '</option>' +
        (core ? [core === 1 ? 9 : core - 1, core === 9 ? 1 : core + 1].map(function (wing) {
          return '<option value="' + core + 'w' + wing + '">' + txt(wing + '번 날개', 'Wing ' + wing) + '</option>';
        }).join('') : '');
    });

    var statusEl = document.getElementById("experiment-submit-status");
    var submitBtn = document.getElementById("experiment-submit-btn");

    submitBtn.addEventListener("click", async function () {
      var selfEl = document.querySelector('input[name="experiment-self"]:checked');
      if (!selfEl) {
        if (statusEl)
          statusEl.textContent = txt(
            "결과가 나와 얼마나 잘 맞는지 선택해 주세요.",
            "Please select how well the result fits."
          );
        return;
      }
      var knownCore = ((document.getElementById("experiment-known-core") || {}).value || "").trim();
      var knownSubtype = ((document.getElementById("experiment-known-subtype") || {}).value || "").trim();
      var knownWing = ((document.getElementById("experiment-known-wing") || {}).value || "").trim();
      var meta = getMeta();
      var participantName = meta && typeof meta.participantName === "string"
        ? meta.participantName.trim()
        : "";
      if (!meta || !participantName) {
        if (statusEl)
          statusEl.textContent = txt(
            "세션 정보가 없습니다. 페이지를 새로고침한 뒤 다시 시도해 주세요.",
            "Session lost. Refresh and try again."
          );
        return;
      }
      if (meta.consentAccepted !== true) {
        if (statusEl)
          statusEl.textContent = txt(
            "저장 동의 정보가 없습니다. 페이지를 새로고침한 뒤 이름과 동의 체크 후 다시 진행해 주세요.",
            "Consent information is missing. Refresh, enter your name, confirm consent, and try again."
          );
        return;
      }

      if (!window.supabaseClient) {
        if (statusEl)
          statusEl.textContent = txt(
            "저장 서버에 연결되지 않았습니다. 설정을 확인해 주세요.",
            "Storage is not configured."
          );
        return;
      }

      submitBtn.disabled = true;
      if (statusEl) statusEl.textContent = txt("제출 중…", "Submitting…");

      var row = buildRow(
        Object.assign({}, meta, { participantName: participantName, consentAccepted: true }),
        payload,
        selfEl.value,
        null,
        knownCore.slice(0, 30),
        knownSubtype.slice(0, 30),
        knownWing.slice(0, 30)
      );
      var res = await window.supabaseClient
        .from("diagnostic_experiment_sessions")
        .insert(row);

      if (res.error) {
        console.error("diagnostic experiment submit failed", res.error);
        submitBtn.disabled = false;
        if (statusEl)
          statusEl.textContent =
            txt("제출 실패: ", "Failed: ") + (res.error.message || String(res.error));
        return;
      }

      if (statusEl)
        statusEl.textContent = txt(
          "제출되었습니다. 감사합니다.",
          "Submitted. Thank you."
        );
    });
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
        core: payload.core || null,
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
        feedback_detail: {
          confirmed_type: {
            core: knownCore || null,
            subtype: knownSubtype || null,
            wing: knownWing || null,
          },
          accurate_parts: null,
          inaccurate_parts: null,
          consultation_check: null,
        },
      },
      tie_break_log: {
        tie: payload.tieSnapshot || {},
        post_tie_applied: !!payload.postTieApplied,
        recent_stress: payload.recentStress,
        response_timing: payload.responseTiming || null,
        state_stress_adjustment: payload.stateStressAdjustment || null,
      },
      evidence: payload.evidence || {},
      self_assessment: selfAssessment,
      self_reported_core: knownCore || null,
      self_reported_subtype: knownSubtype || null,
      self_reported_wing: knownWing || null,
      self_note: null,
      user_agent: String(navigator.userAgent || "").slice(0, 500),
    };
  }

  function onResultReady(payload) {
    if (!isExperimentMode()) return;
    var meta = getMeta();
    if (!meta || !meta.participantName) return;

    var finalEl = document.getElementById("res-final");
    var coreEl = document.getElementById("res-core");
    var wingEl = document.getElementById("res-wing");
    var instEl = document.getElementById("res-instincts");
    var badgeEl = document.getElementById("confidence-badge");

    var enriched = Object.assign({}, payload, {
      pageLang: document.documentElement.lang === "en" ? "en" : "ko",
      resFinalText: finalEl ? finalEl.innerText.trim() : "",
      coreDisplay: coreEl ? coreEl.innerText.trim() : "",
      wingDisplay: wingEl ? wingEl.innerText.trim() : "",
      instinctLine: instEl ? instEl.innerText.trim() : "",
      confidenceLabel: badgeEl ? badgeEl.innerText.trim() : "",
    });

    mountResultUi(enriched);
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

  window.ERDiagnosticExperiment = {
    isExperimentMode: isExperimentMode,
    onResultReady: onResultReady,
    _test: {
      buildExperimentAnalyticsPayload: buildExperimentAnalyticsPayload,
      buildRow: buildRow,
    },
  };
})();

"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { contactApiPath } from "../site-config";

type SubmitState = "idle" | "submitting" | "success" | "error";

function value(data: FormData, name: string) {
  return String(data.get(name) ?? "").trim();
}

export function ContactForm() {
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [statusMessage, setStatusMessage] = useState("");

  async function submitInquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const data = new FormData(form);

    setSubmitState("submitting");
    setStatusMessage("문의 내용을 전달하고 있습니다.");

    try {
      const response = await fetch(contactApiPath, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company: value(data, "company"),
          name: value(data, "name"),
          role: value(data, "role"),
          email: value(data, "email"),
          phone: value(data, "phone"),
          teamSize: value(data, "teamSize"),
          timing: value(data, "timing"),
          format: value(data, "format"),
          budget: value(data, "budget"),
          challenge: value(data, "challenge"),
          outcome: value(data, "outcome"),
          privacyConsent: data.get("privacyConsent") === "on",
          website: value(data, "website"),
        }),
      });

      const result = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok || !result.ok) {
        throw new Error(result.error || `HTTP ${response.status}`);
      }

      form.reset();
      setSubmitState("success");
      setStatusMessage(
        "제안 요청이 전달되었습니다. 확인 후 회신드리겠습니다.",
      );
    } catch {
      setSubmitState("error");
      setStatusMessage(
        "지금은 전달하지 못했습니다. 잠시 후 다시 시도하거나 hello@er-coaching.com으로 직접 메일을 보내주세요.",
      );
    }
  }

  return (
    <form className="contact-form" onSubmit={submitInquiry} noValidate={false}>
      <div className="form-grid">
        <label>
          <span>회사·기관명 *</span>
          <input
            name="company"
            autoComplete="organization"
            maxLength={80}
            required
          />
        </label>
        <label>
          <span>담당자 이름 *</span>
          <input name="name" autoComplete="name" maxLength={40} required />
        </label>
        <label>
          <span>담당 역할 *</span>
          <input
            name="role"
            autoComplete="organization-title"
            placeholder="예: HR 담당자, 팀 리더"
            maxLength={80}
            required
          />
        </label>
        <label>
          <span>회신 이메일 *</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            maxLength={120}
            required
          />
        </label>
        <label>
          <span>연락처</span>
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            maxLength={30}
          />
        </label>
        <label>
          <span>팀 규모 *</span>
          <select name="teamSize" defaultValue="" required>
            <option value="" disabled>
              선택해 주세요
            </option>
            <option>10명 미만</option>
            <option>10–29명</option>
            <option>30–99명</option>
            <option>100명 이상</option>
            <option>아직 미정</option>
          </select>
        </label>
        <label>
          <span>희망 일정</span>
          <input
            name="timing"
            placeholder="예: 2026년 10월, 협의 가능"
            maxLength={80}
          />
        </label>
        <label>
          <span>진행 방식·지역</span>
          <select name="format" defaultValue="">
            <option value="">협의 필요</option>
            <option>온라인</option>
            <option>한국 오프라인</option>
            <option>미국 오프라인</option>
            <option>온·오프라인 혼합</option>
          </select>
        </label>
      </div>

      <label>
        <span>현재 가장 큰 고민 *</span>
        <textarea
          name="challenge"
          rows={6}
          maxLength={360}
          placeholder="지금 팀에서 반복되는 문제와 참여 대상을 알려주세요."
          required
        />
      </label>

      <label>
        <span>기대하는 변화</span>
        <textarea
          name="outcome"
          rows={4}
          maxLength={220}
          placeholder="프로그램 이후 무엇이 달라지기를 기대하시나요?"
        />
      </label>

      <label>
        <span>예산 범위</span>
        <input
          name="budget"
          placeholder="선택 입력 · 아직 정해지지 않았다면 비워두세요."
          maxLength={100}
        />
      </label>

      <label className="consent-field">
        <input name="privacyConsent" type="checkbox" required />
        <span>
          문의 답변을 위한 개인정보 처리에 동의합니다.{" "}
          <Link href="/privacy">개인정보처리방침 보기</Link>
        </span>
      </label>

      <label className="honeypot-field" aria-hidden="true">
        <span>웹사이트</span>
        <input
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </label>

      <p className="form-mail-note" id="inquiry-submit-note">
        제출하면 문의 내용이 ER Business로 바로 전달됩니다. 구성원의 진단
        결과나 민감한 조직 자료는 이 단계에서 보내지 마세요.
      </p>

      <p
        className={`form-compose-status${submitState === "error" ? " is-error" : ""}${submitState === "success" ? " is-success" : ""}`}
        aria-live="polite"
      >
        {statusMessage}
      </p>

      <button
        className="button button-lime form-submit"
        type="submit"
        disabled={submitState === "submitting"}
        aria-describedby="inquiry-submit-note"
      >
        {submitState === "submitting"
          ? "전달 중…"
          : "제안 요청 보내기"}{" "}
        <span aria-hidden="true">→</span>
      </button>
    </form>
  );
}

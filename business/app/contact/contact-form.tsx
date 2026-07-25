"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { businessEmail } from "../site-config";

function value(data: FormData, name: string) {
  return String(data.get(name) ?? "").trim();
}

function fitEncoded(valueToFit: string, budget: number) {
  let result = "";

  for (const character of valueToFit) {
    const candidate = `${result}${character}`;
    if (encodeURIComponent(candidate).length > budget) {
      return `${result}…`;
    }
    result = candidate;
  }

  return result;
}

export function ContactForm() {
  const [composeStatus, setComposeStatus] = useState("");

  async function openEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const company = value(data, "company");
    const name = value(data, "name");
    const subject = encodeURIComponent(
      `[ER Business 제안 요청] ${fitEncoded(company, 72)} · ${fitEncoded(name, 45)}`,
    );
    const fullBody = [
      "ER Business 기업교육·조직 컨설팅 문의",
      "",
      `회사·기관명: ${company}`,
      `담당자: ${name}`,
      `담당 역할: ${value(data, "role")}`,
      `회신 이메일: ${value(data, "email")}`,
      `연락처: ${value(data, "phone") || "미기재"}`,
      `팀 규모: ${value(data, "teamSize")}`,
      `희망 일정: ${value(data, "timing") || "협의 필요"}`,
      `진행 방식·지역: ${value(data, "format") || "협의 필요"}`,
      `예산 범위: ${value(data, "budget") || "협의 필요"}`,
      "개인정보 처리 동의: 동의함",
      "",
      "[현재 가장 큰 고민]",
      value(data, "challenge"),
      "",
      "[기대하는 변화]",
      value(data, "outcome") || "미기재",
    ].join("\n");
    const fullMailto = `mailto:${businessEmail}?subject=${subject}&body=${encodeURIComponent(fullBody)}`;

    if (fullMailto.length <= 1800) {
      setComposeStatus("이메일 작성 화면을 여는 중입니다.");
      window.location.href = fullMailto;
      return;
    }

    let copied = false;
    try {
      await navigator.clipboard?.writeText(fullBody);
      copied = true;
    } catch {
      copied = false;
    }

    const compactBody = [
      copied
        ? "전체 문의를 복사했습니다. 이 문장을 지우고 메일 본문에 붙여넣어 주세요."
        : "문의 요약입니다. 필요한 세부 내용을 아래에 추가해 주세요.",
      "",
      `회사·기관명: ${fitEncoded(company, 72)}`,
      `담당자: ${fitEncoded(name, 45)}`,
      `담당 역할: ${fitEncoded(value(data, "role"), 60)}`,
      `회신 이메일: ${fitEncoded(value(data, "email"), 120)}`,
      `팀 규모: ${fitEncoded(value(data, "teamSize"), 45)}`,
      `현재 고민: ${fitEncoded(value(data, "challenge"), 250)}`,
      `기대 변화: ${fitEncoded(value(data, "outcome") || "미기재", 135)}`,
      "개인정보 처리 동의: 동의함",
    ].join("\n");

    setComposeStatus(
      copied
        ? "전체 문의 내용을 복사했습니다. 열린 메일 본문에 붙여넣어 주세요."
        : "요약된 문의로 이메일 작성 화면을 엽니다. 필요한 내용을 덧붙여 주세요.",
    );
    window.location.href = `mailto:${businessEmail}?subject=${subject}&body=${encodeURIComponent(compactBody)}`;
  }

  return (
    <form className="contact-form" onSubmit={openEmail}>
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

      <p className="form-mail-note" id="email-compose-note">
        버튼을 누르면 기기의 이메일 작성 화면이 열립니다. 메일을 보내야
        문의가 전달됩니다. 구성원의 진단 결과나 민감한 조직 자료는 이
        단계에서 보내지 마세요. 내용이 길면 전체 문의를 클립보드에 복사해
        메일 본문에 붙여넣도록 안내합니다.
      </p>

      <p className="form-compose-status" aria-live="polite">
        {composeStatus}
      </p>

      <button
        className="button button-lime form-submit"
        type="submit"
        aria-describedby="email-compose-note"
      >
        이메일 작성 화면 열기 <span aria-hidden="true">↗</span>
      </button>
    </form>
  );
}

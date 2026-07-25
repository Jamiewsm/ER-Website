import { ContactForm } from "./contact-form";
import { InternalHero } from "../components/internal-hero";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import {
  businessEmail,
  createPageMetadata,
  legalOperator,
} from "../site-config";

const description =
  "ER Business 기업교육·조직 컨설팅 제안 요청. 팀 규모와 현재 과제를 알려주시면 적합한 프로그램 범위를 함께 확인합니다.";

export const metadata = createPageMetadata({
  title: "제안 요청",
  description,
  path: "/contact",
});

const nextSteps = [
  {
    number: "01",
    title: "문의 내용 확인",
    body: "팀 규모, 참여 대상, 현재 반복되는 문제를 먼저 확인합니다.",
  },
  {
    number: "02",
    title: "초기 대화",
    body: "ER Business가 적합한 파트너인지, 어떤 변화가 필요한지 함께 정리합니다.",
  },
  {
    number: "03",
    title: "맞춤 제안",
    body: "필요한 프로그램, 진행 방식, 산출물, 일정과 비용을 제안서로 안내합니다.",
  },
];

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <InternalHero
          eyebrow="START THE CONVERSATION"
          title="우리 팀의 문제를 사람의 언어로 다시 읽어보세요."
          description="자세한 진단이 아니어도 괜찮습니다. 지금 가장 반복되는 문제와 원하는 변화만 알려주세요. 프로그램을 먼저 판매하기보다 ER Business가 적합한 파트너인지부터 함께 확인합니다."
        />

        <section className="page-section contact-layout">
          <div className="contact-intro">
            <p className="eyebrow">PROJECT INQUIRY</p>
            <h2>제안에 필요한 정보만 받습니다.</h2>
            <p>
              문의 단계에서는 구성원 개인의 진단 결과나 민감한 조직 자료가
              필요하지 않습니다. 참여 대상과 현재 과제를 중심으로 적어
              주세요.
            </p>

            <div className="direct-contact">
              <span>직접 이메일</span>
              <a href={`mailto:${businessEmail}`}>{businessEmail}</a>
              <p>
                폼 제출이 어려우면 위 주소로 회사명, 팀 규모, 현재 고민을
                보내주세요. 문의는 운영 메일로 전달됩니다.
              </p>
            </div>
          </div>
          <ContactForm />
        </section>

        <section className="contact-steps">
          <div className="page-section-heading">
            <p className="eyebrow">WHAT HAPPENS NEXT</p>
            <h2>문의 후에는 이렇게 진행됩니다.</h2>
          </div>
          <ol>
            {nextSteps.map((step) => (
              <li key={step.number}>
                <span>{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="operator-note">
          <p>
            운영: {legalOperator.name} · 대표 {legalOperator.representative}
          </p>
          <p>{legalOperator.address}</p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

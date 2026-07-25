import { InquiryCta } from "../components/inquiry-cta";
import { InternalHero } from "../components/internal-hero";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { processSteps } from "../content";
import { createPageMetadata } from "../site-config";

const description =
  "사람을 유형에 가두지 않고 개인의 동기와 강점을 팀의 소통, 역할, 실행 방식으로 번역하는 ER Business의 관점.";

export const metadata = createPageMetadata({
  title: "ER의 관점",
  description,
  path: "/about",
});

const principles = [
  {
    number: "01",
    title: "유형보다 맥락을 먼저 봅니다.",
    body: "같은 성향도 역할과 환경에 따라 다르게 나타납니다. 개인의 반응만 보지 않고 업무 요구와 팀의 상호작용을 함께 살핍니다.",
  },
  {
    number: "02",
    title: "판단보다 대화를 돕습니다.",
    body: "진단 결과를 낙인이나 평가 등급으로 사용하지 않습니다. 서로의 관점을 설명하고 질문할 수 있는 공통 언어로 활용합니다.",
  },
  {
    number: "03",
    title: "통찰보다 실행을 남깁니다.",
    body: "유형을 발견하는 즐거움에서 끝내지 않습니다. 다음 회의와 피드백에서 바로 사용할 팀 규칙과 대화 도구를 함께 만듭니다.",
  },
];

const credentials = [
  "IEA Accredited Instructor",
  "Enneagram Spectrum 공인 트레이너",
  "SOIM 글로벌 리더십 강사",
  "Arizona State University 심리학 석사 과정",
  "《The Redeemed Enneagram》 저자",
];

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <InternalHero
          eyebrow="ABOUT ER BUSINESS"
          title="사람을 유형으로 설명하는 데서 멈추지 않습니다."
          description="ER Business는 개인의 동기와 강점을 팀이 함께 일하는 방식으로 번역합니다. 사람에 대한 이해가 역할, 피드백, 회의와 의사결정에서 실제로 쓰이도록 돕습니다."
        />

        <section className="page-section about-view">
          <div className="about-statement">
            <p className="eyebrow">OUR POINT OF VIEW</p>
            <h2>
              행동을 태도의 문제로 판단하기 전에,
              <br />
              그 사람이 무엇을 중요하게 보는지 읽습니다.
            </h2>
            <p>
              ER Business는 누가 옳은지를 가르는 대신, 각자가 무엇을
              지키려 하고 어떤 조건에서 강점을 발휘하는지 살펴봅니다. 그
              이해를 조직이 사용할 수 있는 역할과 운영의 언어로 바꿉니다.
            </p>
          </div>

          <div className="principle-list">
            {principles.map((principle) => (
              <article key={principle.number}>
                <span>{principle.number}</span>
                <div>
                  <h3>{principle.title}</h3>
                  <p>{principle.body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="about-method">
          <div className="page-section-heading">
            <p className="eyebrow light">THE ER METHOD</p>
            <h2>이해를 실행으로 옮기는 다섯 단계</h2>
          </div>
          <ol>
            {processSteps.map((step) => (
              <li key={step.step}>
                <span>{step.step}</span>
                <div>
                  <p>{step.title}</p>
                  <h3>{step.korean}</h3>
                  <p>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="page-section leader-profile">
          <div className="leader-monogram" aria-hidden="true">
            <span>SY</span>
            <small>LEAD FACILITATOR</small>
          </div>
          <div className="leader-copy">
            <p className="eyebrow">LEADERSHIP</p>
            <h2>손지영 대표</h2>
            <p className="leader-role">ER 대표 · 강사 · Head Coach</p>
            <p>
              에니어그램과 코칭을 바탕으로 개인의 동기와 강점을 조직의
              소통, 역할, 실행 방식에 연결합니다. 구성원을 유형에 가두기보다
              실제 업무 맥락에서 더 나은 질문과 협업 규칙을 찾는 데 초점을
              둡니다.
            </p>
            <ul className="credential-list">
              {credentials.map((credential) => (
                <li key={credential}>{credential}</li>
              ))}
            </ul>
            <p className="business-cert">
              ER의 운영 사업자는 대한민국 정부 인증 여성기업입니다.
            </p>
          </div>
        </section>

        <section className="ethics-section">
          <p className="eyebrow">ETHICAL USE</p>
          <h2>진단은 사람을 결정하는 단독 기준이 아닙니다.</h2>
          <p>
            에니어그램과 성향 진단은 의료·심리 진단을 대체하지 않으며,
            채용·해고·승진을 위한 단독 평가 도구로 사용하지 않습니다.
            인터뷰, 업무 역량, 경험, 조직 맥락과 함께 더 나은 대화와 성장을
            돕는 보조 프레임으로 사용합니다.
          </p>
        </section>

        <InquiryCta />
      </main>
      <SiteFooter />
    </>
  );
}

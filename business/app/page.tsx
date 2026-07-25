import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "ER Business | 사람을 이해하면, 팀의 성과가 달라집니다",
  },
  description:
    "개인의 동기·성향·강점을 팀의 소통, 역할 배치, 업무 실행으로 연결하는 기업교육·조직 컨설팅.",
};

const frictionSignals = [
  {
    number: "01",
    title: "같은 말을 다르게 듣습니다",
    body: "의도보다 표현 방식이 먼저 충돌해 피드백이 방어와 오해로 돌아옵니다.",
  },
  {
    number: "02",
    title: "잘하는 일과 맡은 일이 어긋납니다",
    body: "역할 미스매치가 반복되면 몰입은 낮아지고 스트레스와 소진은 빨라집니다.",
  },
  {
    number: "03",
    title: "회의는 길고 실행은 느립니다",
    body: "의사결정 기준과 협업 규칙이 없어 같은 논의를 반복하고 책임이 흐려집니다.",
  },
  {
    number: "04",
    title: "고객의 진짜 필요를 놓칩니다",
    body: "표면적인 요청만 듣고 상대의 동기와 욕구를 읽지 못하면 관계와 성과가 함께 흔들립니다.",
  },
];

const solutions = [
  {
    code: "01 / TEAM",
    eyebrow: "팀 소통 · 협업",
    title: "Communication Lab",
    description:
      "서로 다른 업무 언어와 반응 패턴을 팀의 공통 언어로 바꿉니다.",
    features: [
      "개인별 동기·소통 스타일 진단",
      "팀 커뮤니케이션 맵",
      "갈등 상황별 대화 실습",
      "우리 팀 협업 원칙 도출",
    ],
    output: "팀 맵 + 소통 합의문",
  },
  {
    code: "02 / TALENT",
    eyebrow: "강점 · 역할 배치",
    title: "Role Fit Consulting",
    description:
      "개인의 강점과 에너지 패턴을 업무 요구와 연결해 역할 적합도를 점검합니다.",
    features: [
      "개인 강점·동기 프로파일",
      "현재 역할 적합성 인터뷰",
      "업무·책임 재설계 제안",
      "리더 1:1 디브리핑",
    ],
    output: "역할 적합도 리포트",
  },
  {
    code: "03 / LEADER",
    eyebrow: "리더십 · 조직 운영",
    title: "Leadership Sprint",
    description:
      "리더의 의사결정과 피드백 방식을 점검하고 팀이 움직이는 운영 규칙을 만듭니다.",
    features: [
      "리더십 커뮤니케이션 진단",
      "의사결정 병목 분석",
      "피드백·1on1 프레임",
      "30일 실행 체크인",
    ],
    output: "리더십 실행 플레이북",
  },
  {
    code: "04 / CLIENT",
    eyebrow: "고객 · 사람 중심 팀",
    title: "People Insight",
    description:
      "상대의 말 뒤에 있는 필요와 욕구를 읽고 관계의 질을 성과로 연결합니다.",
    features: [
      "욕구·동기 관찰 프레임",
      "유형별 질문과 제안 방식",
      "고객·구성원 사례 롤플레이",
      "현장 적용 스크립트",
    ],
    output: "상황별 대화 가이드",
  },
];

const process = [
  {
    step: "01",
    title: "Discover",
    korean: "현황을 듣습니다",
    body: "리더 인터뷰와 사전 설문으로 팀의 목표, 갈등 지점, 업무 구조를 파악합니다.",
  },
  {
    step: "02",
    title: "Decode",
    korean: "사람을 읽습니다",
    body: "개인의 동기·성향·강점을 해석하고 팀 전체의 상호작용 패턴을 시각화합니다.",
  },
  {
    step: "03",
    title: "Design",
    korean: "해결책을 설계합니다",
    body: "진단 결과를 바탕으로 교육, 워크숍, 리더 코칭의 최적 조합을 제안합니다.",
  },
  {
    step: "04",
    title: "Deliver",
    korean: "현장에서 연습합니다",
    body: "실제 업무 장면을 다루는 참여형 세션으로 팀만의 소통·협업 규칙을 만듭니다.",
  },
  {
    step: "05",
    title: "Drive",
    korean: "실행을 정착시킵니다",
    body: "30일 체크인과 리더 디브리핑으로 배운 언어가 일하는 방식이 되도록 돕습니다.",
  },
];

const fitTeams = [
  "급성장으로 역할과 소통 방식의 재정렬이 필요한 팀",
  "부서 간 갈등과 의사결정 지연이 반복되는 조직",
  "리더·핵심인재의 번아웃을 예방하고 싶은 기업",
  "HR·L&D 체계를 사람 중심으로 고도화하려는 조직",
  "상담·교육·영업·의료·서비스처럼 사람을 다루는 팀",
  "팀빌딩을 일회성 이벤트가 아닌 실행 변화로 만들고 싶은 팀",
];

const outcomes = [
  {
    label: "COMMUNICATION",
    title: "말이 통하는 팀",
    body: "상대가 받아들일 수 있는 방식으로 질문하고 피드백하는 공통 언어",
  },
  {
    label: "ROLE FIT",
    title: "강점이 쓰이는 팀",
    body: "개인의 에너지와 역량이 실제 업무에서 발휘되도록 조정된 역할",
  },
  {
    label: "EXECUTION",
    title: "실행이 빠른 팀",
    body: "회의, 의사결정, 협업에서 반복되는 마찰을 줄이는 명확한 규칙",
  },
  {
    label: "SUSTAINABILITY",
    title: "지속 가능한 팀",
    body: "소진 신호를 조기에 발견하고 몰입을 회복하는 리더십 루틴",
  },
];

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="ER Business 홈">
          <span className="brand-mark">ER</span>
          <span className="brand-divider" aria-hidden="true" />
          <span className="brand-name">BUSINESS</span>
        </a>
        <nav className="desktop-nav" aria-label="주요 메뉴">
          <a href="#why">왜 ER인가</a>
          <a href="#solutions">프로그램</a>
          <a href="#method">진행 방식</a>
          <a href="#about">ER의 관점</a>
        </nav>
        <a
          className="header-cta"
          href="mailto:hello@er-coaching.com?subject=ER%20Business%20기업교육%20문의"
        >
          제안 요청 <span aria-hidden="true">↗</span>
        </a>
      </header>

      <section className="hero" id="top">
        <div className="hero-noise" aria-hidden="true" />
        <div className="hero-copy">
          <p className="eyebrow light">PEOPLE × TEAM × PERFORMANCE</p>
          <h1>
            사람을 이해하면,
            <br />
            <em>팀의 성과가 달라집니다.</em>
          </h1>
          <p className="hero-lead">
            ER Business는 개인의 <strong>욕구·성향·강점</strong>을 읽고,
            <br className="desktop-break" /> 팀의 소통과 역할, 실행 방식까지
            연결하는 기업교육·조직 컨설팅입니다.
          </p>
          <div className="hero-actions">
            <a
              className="button button-lime"
              href="mailto:hello@er-coaching.com?subject=ER%20Business%20기업교육%20문의&body=회사명%20%3A%0A팀%20규모%20%3A%0A현재%20고민%20%3A%0A희망%20일정%20%3A"
            >
              우리 팀 진단 문의하기 <span aria-hidden="true">→</span>
            </a>
            <a className="text-link light-link" href="#solutions">
              프로그램 살펴보기 <span aria-hidden="true">↓</span>
            </a>
          </div>
          <div className="hero-proof">
            <span>기업 · 팀</span>
            <span>리더 · HR</span>
            <span>KOREA · USA</span>
          </div>
        </div>

        <figure className="hero-visual">
          {/* Full-resolution static hero assets are intentionally served directly. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="hero-photo hero-photo-one"
            src="/hero-team-ai.jpg"
            alt=""
            width="2800"
            height="2240"
            fetchPriority="high"
            draggable="false"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="hero-photo hero-photo-two"
            src="/hero-team-real.jpg"
            alt=""
            width="3200"
            height="2133"
            loading="eager"
            decoding="async"
            draggable="false"
          />
          <div className="hero-photo-shade" aria-hidden="true" />
          <div className="visual-meta" aria-hidden="true">
            <span>ER / BUSINESS — TEAM SIGNAL 01–02</span>
            <span>PEOPLE INTELLIGENCE</span>
          </div>
          <div className="message-stage" aria-hidden="true">
            <div className="hero-message message-one">
              <div className="message-count">01</div>
              <p>
                사람을 읽으면,
                <br />
                <strong>오해가 줄어듭니다.</strong>
              </p>
              <span>UNDERSTAND</span>
            </div>
            <div className="hero-message message-two">
              <div className="message-count">02</div>
              <p>
                강점을 맞추면,
                <br />
                <strong>팀이 움직입니다.</strong>
              </p>
              <span>ALIGN</span>
            </div>
          </div>
          <div className="message-progress" aria-hidden="true">
            <span className="progress-one" />
            <span className="progress-two" />
          </div>
          <figcaption className="sr-only">
            회의와 협업에 참여하는 두 팀의 모습을 배경으로, 사람을 이해하고
            강점에 맞게 역할을 정렬하는 ER Business의 접근법을 소개합니다.
          </figcaption>
        </figure>
      </section>

      <section className="statement" aria-label="ER Business 핵심 관점">
        <p className="statement-index">THE COST OF MISALIGNMENT</p>
        <p className="statement-copy">
          사람의 문제처럼 보이지만,
          <br />
          많은 경우 <mark>이해와 배치의 문제</mark>입니다.
        </p>
        <div className="statement-arrow" aria-hidden="true">
          ↘
        </div>
      </section>

      <section className="section friction" id="why">
        <div className="section-heading split-heading">
          <div>
            <p className="eyebrow">WHY IT MATTERS</p>
            <h2>
              팀 안의 마찰은
              <br />
              성과의 비용이 됩니다.
            </h2>
          </div>
          <p>
            성향의 차이를 모르면 행동을 태도의 문제로 오해합니다. 그 오해가
            쌓이면 소통, 몰입, 실행 속도, 결국 아웃풋이 흔들립니다.
          </p>
        </div>
        <div className="friction-grid">
          {frictionSignals.map((signal) => (
            <article className="friction-card" key={signal.number}>
              <div className="friction-number">{signal.number}</div>
              <div>
                <h3>{signal.title}</h3>
                <p>{signal.body}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="cost-line" aria-label="팀 마찰이 성과 저하로 이어지는 흐름">
          <span>역할 미스매치</span>
          <b aria-hidden="true">→</b>
          <span>소통 마찰</span>
          <b aria-hidden="true">→</b>
          <span>스트레스 · 번아웃</span>
          <b aria-hidden="true">→</b>
          <span className="accent">효율 · 아웃풋 저하</span>
        </div>
      </section>

      <section className="section solutions" id="solutions">
        <div className="section-heading solution-heading">
          <div>
            <p className="eyebrow">SOLUTIONS</p>
            <h2>교육에서 끝나지 않는 변화</h2>
          </div>
          <p>
            진단, 교육, 컨설팅, 실행 점검을 팀의 과제에 맞게 조합합니다.
          </p>
        </div>

        <div className="solution-list">
          {solutions.map((solution) => (
            <article className="solution-card" key={solution.code}>
              <div className="solution-code">{solution.code}</div>
              <div className="solution-main">
                <p>{solution.eyebrow}</p>
                <h3>{solution.title}</h3>
                <p className="solution-description">{solution.description}</p>
              </div>
              <ul>
                {solution.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <div className="solution-output">
                <span>OUTPUT</span>
                <b>{solution.output}</b>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section method" id="method">
        <div className="method-intro">
          <p className="eyebrow light">THE ER METHOD</p>
          <h2>
            Understand
            <span>→</span> Align
            <span>→</span> Perform
          </h2>
          <p>
            유형을 아는 데서 멈추지 않습니다. 사람에 대한 이해를 팀의
            운영 방식과 행동 변화로 번역합니다.
          </p>
        </div>
        <div className="process-list">
          {process.map((item) => (
            <article className="process-step" key={item.step}>
              <span className="process-number">{item.step}</span>
              <div>
                <p>{item.title}</p>
                <h3>{item.korean}</h3>
                <p className="process-body">{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section outcomes">
        <div className="section-heading split-heading">
          <div>
            <p className="eyebrow">BUSINESS OUTCOMES</p>
            <h2>
              사람에 대한 이해를
              <br />
              일하는 방식으로.
            </h2>
          </div>
          <p>
            프로그램의 목표는 재미있는 유형 발견이 아니라, 다음 날의 회의와
            피드백부터 달라지는 것입니다.
          </p>
        </div>
        <div className="outcome-grid">
          {outcomes.map((outcome, index) => (
            <article className="outcome-card" key={outcome.label}>
              <div className="outcome-top">
                <span>{outcome.label}</span>
                <b>{String(index + 1).padStart(2, "0")}</b>
              </div>
              <h3>{outcome.title}</h3>
              <p>{outcome.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section fit">
        <div className="fit-copy">
          <p className="eyebrow">WHO WE WORK WITH</p>
          <h2>
            이런 팀에게
            <br />
            특히 필요합니다.
          </h2>
          <p>
            규모보다 중요한 것은 변화의 의지입니다. 팀의 실제 사례를 열어
            놓고 함께 새로운 운영 방식을 만들 준비가 된 조직과 일합니다.
          </p>
        </div>
        <ol className="fit-list">
          {fitTeams.map((team, index) => (
            <li key={team}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{team}</p>
              <b aria-hidden="true">↗</b>
            </li>
          ))}
        </ol>
      </section>

      <section className="section perspective" id="about">
        <div className="perspective-grid">
          <div className="perspective-quote">
            <p className="eyebrow light">ER PERSPECTIVE</p>
            <blockquote>
              “사람을 바꾸기 전에,
              <br />
              <em>사람을 읽는 방식</em>부터
              <br />
              바꿉니다.”
            </blockquote>
          </div>
          <div className="perspective-copy">
            <p>
              ER Business는 에니어그램의 동기 이해와 코칭의 실행 설계를
              결합합니다. 구성원을 유형에 가두는 대신, 각자의 강점과
              스트레스 패턴을 더 정교하게 읽어 팀이 활용할 수 있는 언어로
              바꿉니다.
            </p>
            <p>
              진단은 사람을 판단하거나 채용 합격·불합격을 결정하는 단독
              도구가 아닙니다. 인터뷰, 업무 역량, 조직 맥락과 함께 더 나은
              배치와 성장을 돕는 보조 프레임으로 사용합니다.
            </p>
            <div className="credentials">
              <span>IEA Accredited Instructor</span>
              <span>Enneagram Spectrum</span>
              <span>Korea · USA</span>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section" id="contact">
        <div className="cta-orbit" aria-hidden="true" />
        <p className="eyebrow">START THE CONVERSATION</p>
        <h2>
          우리 팀의 문제를
          <br />
          <em>사람의 언어로 다시 읽어보세요.</em>
        </h2>
        <p>
          회사명, 팀 규모, 현재 가장 큰 고민을 알려주시면
          <br />
          목적에 맞는 교육·컨설팅 구성을 제안드립니다.
        </p>
        <a
          className="button button-dark"
          href="mailto:hello@er-coaching.com?subject=ER%20Business%20제안%20요청&body=회사명%20%3A%0A팀%20규모%20%3A%0A현재%20고민%20%3A%0A희망%20일정%20%3A"
        >
          기업교육 제안 요청하기 <span aria-hidden="true">↗</span>
        </a>
        <a className="email-link" href="mailto:hello@er-coaching.com">
          hello@er-coaching.com
        </a>
      </section>

      <footer>
        <div className="footer-brand">
          <span className="brand-mark">ER</span>
          <span className="brand-divider" aria-hidden="true" />
          <span className="brand-name">BUSINESS</span>
        </div>
        <p>
          사람을 이해하고, 역할을 맞추고,
          <br />
          팀의 성과를 설계합니다.
        </p>
        <div className="footer-links">
          <a href="mailto:hello@er-coaching.com">Contact</a>
          <a href="https://er-coaching.com">ER Coaching</a>
          <a href="#top">Back to top ↑</a>
        </div>
        <div className="footer-bottom">
          <span>© 2026 ER — Enneagram for Restoration</span>
          <span>부산 · Korea / USA</span>
        </div>
      </footer>
    </main>
  );
}

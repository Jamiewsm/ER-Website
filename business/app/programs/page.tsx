import { InquiryCta } from "../components/inquiry-cta";
import { InternalHero } from "../components/internal-hero";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { programs } from "../content";
import { createPageMetadata } from "../site-config";

const description =
  "팀 소통, 역할 적합성, 리더십, 고객 이해를 실제 업무 변화로 연결하는 ER Business 프로그램.";

export const metadata = createPageMetadata({
  title: "프로그램",
  description,
  path: "/programs",
});

export default function ProgramsPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <InternalHero
          eyebrow="PROGRAMS"
          title="팀의 문제에 맞는 개입을 설계합니다."
          description="모든 조직에 같은 워크숍을 반복하지 않습니다. 리더 인터뷰와 사전 설문으로 현재 과제를 확인하고, 교육·워크숍·리더 디브리핑·실행 점검을 필요한 만큼 조합합니다."
        />

        <section className="page-section program-index">
          <div className="page-section-heading">
            <p className="eyebrow">CHOOSE THE STARTING POINT</p>
            <h2>지금 가장 반복되는 문제에서 시작하세요.</h2>
            <p>
              하나의 프로그램으로 시작하거나, 여러 개입을 팀 상황에 맞게
              연결할 수 있습니다.
            </p>
          </div>
          <nav className="program-jump" aria-label="프로그램 바로가기">
            {programs.map((program) => (
              <a href={`#${program.id}`} key={program.id}>
                <span>{program.code.slice(0, 2)}</span>
                <b>{program.title}</b>
                <span aria-hidden="true">↓</span>
              </a>
            ))}
          </nav>
        </section>

        <section className="program-details" aria-label="프로그램 상세">
          {programs.map((program) => (
            <article
              className="program-detail"
              id={program.id}
              key={program.id}
            >
              <header className="program-detail-heading">
                <div>
                  <p>{program.code}</p>
                  <h2>{program.title}</h2>
                </div>
                <div>
                  <p className="program-eyebrow">{program.eyebrow}</p>
                  <p>{program.description}</p>
                </div>
              </header>

              <div className="program-detail-grid">
                <section>
                  <h3>이런 상황에 적합합니다</h3>
                  <ul className="check-list">
                    {program.suitableFor.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
                <section>
                  <h3>주요 구성</h3>
                  <ul className="number-list">
                    {program.flow.map((item, index) => (
                      <li key={item}>
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
                <aside className="program-output">
                  <span>OUTPUT</span>
                  <strong>{program.output}</strong>
                  <p>
                    팀 규모와 과제에 따라 진단 범위와 산출물은 조정됩니다.
                  </p>
                </aside>
              </div>

              {program.ethicsNote ? (
                <p className="ethics-note">{program.ethicsNote}</p>
              ) : null}
            </article>
          ))}
        </section>

        <section className="scope-note">
          <p className="eyebrow">SCOPE &amp; PROPOSAL</p>
          <h2>필요한 범위만 구성합니다.</h2>
          <p>
            기간과 비용은 팀 규모, 진단 범위, 온·오프라인 방식, 후속 지원
            여부에 따라 달라집니다. 현재 과제를 알려주시면 참여 대상과
            산출물을 확인한 뒤 맞춤 제안서를 드립니다.
          </p>
        </section>

        <InquiryCta />
      </main>
      <SiteFooter />
    </>
  );
}

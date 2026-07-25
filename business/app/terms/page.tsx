import { InternalHero } from "../components/internal-hero";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import {
  businessEmail,
  createPageMetadata,
  legalOperator,
} from "../site-config";

const description =
  "ER Business 기업교육·조직 컨설팅 문의, 계약, 진단 활용과 자료 사용에 관한 서비스 안내.";

export const metadata = createPageMetadata({
  title: "서비스 이용 안내",
  description,
  path: "/terms",
});

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <InternalHero
          eyebrow="SERVICE TERMS"
          title="서비스 이용 및 상담 안내"
          description="웹사이트의 프로그램 안내와 실제 계약의 관계, 진단 활용 원칙, 자료 사용 범위를 안내합니다."
        />

        <article className="legal-document">
          <p className="legal-effective">시행일: 2026년 7월 25일</p>

          <section>
            <h2>1. 운영자와 서비스 범위</h2>
            <p>
              ER Business는 {legalOperator.name}가 운영하며 기업교육,
              워크숍, 리더 디브리핑과 조직 컨설팅을 제공합니다. 구체적인
              범위, 일정과 산출물은 개별 제안서 또는 계약서에서 정합니다.
            </p>
          </section>

          <section>
            <h2>2. 문의와 계약</h2>
            <p>
              웹사이트 문의나 초기 대화만으로 계약이 성립하지 않습니다.
              프로그램 범위, 일정, 비용, 참여 인원, 산출물과 양측의 책임을
              서면으로 합의한 때 계약이 성립합니다.
            </p>
          </section>

          <section>
            <h2>3. 일정 변경·취소·환불</h2>
            <p>
              일정 변경, 취소와 환불 조건은 프로그램의 준비 범위와 외부
              비용을 고려해 개별 제안서 또는 계약서에서 정합니다. 계약 전
              해당 조건을 확인해 주세요.
            </p>
          </section>

          <section>
            <h2>4. 고객의 책임</h2>
            <p>
              고객은 프로그램 설계와 운영에 필요한 정보를 정확하게
              제공하고, 참여자의 개인정보나 진단 정보를 제공할 권한과
              필요한 동의를 확보해야 합니다. 민감한 정보는 사전에 합의한
              안전한 방식으로만 전달해야 합니다.
            </p>
          </section>

          <section>
            <h2>5. 진단 활용의 한계</h2>
            <p>
              에니어그램과 성향 진단은 의료·심리 진단을 대체하지 않으며,
              채용, 해고, 승진 등 인사 결정을 위한 단독 기준으로 사용해서는
              안 됩니다. 업무 역량, 경험, 인터뷰와 조직 맥락을 함께
              고려하는 보조 자료로 사용합니다.
            </p>
          </section>

          <section>
            <h2>6. 비밀유지</h2>
            <p>
              ER Business와 고객은 프로젝트 과정에서 알게 된 비공개 조직
              정보와 참여자 정보를 합의한 목적 밖으로 사용하지 않습니다.
              필요한 경우 프로젝트 시작 전에 별도 비밀유지계약을
              체결합니다.
            </p>
          </section>

          <section>
            <h2>7. 자료와 지식재산권</h2>
            <p>
              교재, 프레임워크, 진단 해설과 프로그램 자료의 권리는 ER
              Business 또는 각 권리자에게 있습니다. 고객은 별도 합의가
              없는 한 계약에서 정한 조직 내부 범위에서만 자료를 사용할 수
              있으며, 외부 배포·판매·재가공은 허용되지 않습니다.
            </p>
          </section>

          <section>
            <h2>8. 성과에 관한 안내</h2>
            <p>
              ER Business는 합의한 프로그램과 산출물을 성실히 제공하지만,
              조직의 실행 환경과 참여 정도에 따라 결과가 달라질 수 있어
              특정한 경영 성과를 보장하지 않습니다.
            </p>
          </section>

          <section>
            <h2>9. 외부 링크와 변경</h2>
            <p>
              이 사이트에는 별도 운영 주체의 외부 페이지로 연결되는 링크가
              포함될 수 있습니다. 서비스와 본 안내가 변경되는 경우 변경
              내용을 이 페이지에 반영합니다.
            </p>
          </section>

          <section>
            <h2>10. 준거법과 문의</h2>
            <p>
              별도 계약에서 달리 정하지 않는 한 대한민국 법을 따릅니다.
              서비스 안내에 관한 문의는{" "}
              <a href={`mailto:${businessEmail}`}>{businessEmail}</a>로
              보내주세요.
            </p>
          </section>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}

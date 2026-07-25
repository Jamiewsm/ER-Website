import { InternalHero } from "../components/internal-hero";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import {
  businessEmail,
  createPageMetadata,
  legalOperator,
} from "../site-config";

const description =
  "ER Business 기업교육·조직 컨설팅 문의와 프로그램 운영에 적용되는 개인정보처리방침.";

export const metadata = createPageMetadata({
  title: "개인정보처리방침",
  description,
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <InternalHero
          eyebrow="PRIVACY"
          title="개인정보처리방침"
          description="ER Business는 문의에 답하고 합의된 프로그램을 운영하는 데 필요한 범위에서 개인정보를 처리합니다."
        />

        <article className="legal-document">
          <p className="legal-effective">시행일: 2026년 7월 25일</p>

          <section>
            <h2>1. 운영자와 처리 목적</h2>
            <p>
              {legalOperator.name}(이하 “ER Business”)는 기업교육·조직
              컨설팅 문의 확인, 연락과 일정 조율, 제안서 작성, 계약 및
              합의된 서비스 운영을 위해 개인정보를 처리합니다.
            </p>
          </section>

          <section>
            <h2>2. 문의 단계에서 처리하는 정보</h2>
            <p>
              이름, 회사·기관명, 담당 역할, 이메일, 연락처, 팀 규모, 문의
              내용과 사용자가 선택해 제공한 희망 일정·지역·예산 범위를
              처리할 수 있습니다.
            </p>
            <p>
              현재 웹 문의 폼은 입력값을 ER Business 웹 서버로 전송하거나
              저장하지 않습니다. 버튼을 누르면 사용자의 기기에서 이메일
              작성 화면이 열리며, 사용자가 메일을 발송한 뒤에만 해당
              이메일이 운영자의 메일함으로 전달됩니다.
            </p>
          </section>

          <section>
            <h2>3. 보유와 파기</h2>
            <p>
              문의 정보는 답변과 제안, 계약 이행 등 처리 목적에 필요한
              기간 동안 보유하며, 목적이 달성되면 지체 없이 삭제합니다.
              다만 계약·세무 등 관계 법령에 따라 보존할 의무가 있는 정보는
              해당 기간 동안 분리해 보관할 수 있습니다.
            </p>
            <p>
              파기 대상은 정기적으로 확인하며, 전자 기록은 복구하기 어려운
              방식으로 삭제합니다. 종이 문서가 있는 경우에는 분쇄하거나
              안전한 전문 파기 절차를 이용합니다.
            </p>
          </section>

          <section>
            <h2>4. 제3자 제공</h2>
            <p>
              ER Business는 사용자의 별도 동의가 있거나 법령에 근거가 있는
              경우를 제외하고 문의 과정에서 받은 개인정보를 제3자에게
              제공하지 않습니다. 프로젝트 수행을 위해 제공이 필요한 경우
              대상, 목적, 항목과 보유 기간을 사전에 안내합니다.
            </p>
          </section>

          <section>
            <h2>5. 처리 지원 서비스</h2>
            <p>
              사이트 제공과 보안에는 Cloudflare, Inc.의 인프라를 사용하며,
              문의 이메일 수신 과정에서는 Cloudflare Email Routing이
              메시지를 운영자의 최종 메일함으로 전달합니다. 발신자와
              수신자가 사용하는 이메일 서비스도 메시지를 처리할 수
              있습니다. 관련 정보는 서비스 제공과 보안, 이메일 전달에
              필요한 기간 동안 각 서비스의 정책과 계약에 따라 처리될 수
              있습니다.
            </p>
            <p>
              위 서비스는 글로벌 인프라를 사용하므로 정보가 국외에서
              처리될 수 있습니다. 구체적인 처리 내역이나 권리 행사 방법이
              필요한 경우 아래 개인정보 문의처로 연락해 주세요. 일정 예약,
              분석 또는 문의 저장 서비스를 새로 도입하는 경우 서비스 이름,
              처리 목적, 이전 국가와 보유 기간 등 필요한 사항을 이 방침에
              반영합니다.
            </p>
            <p>
              Cloudflare Web Analytics의 RUM 비콘은 페이지 조회와 로딩
              성능을 확인하기 위한 최소한의 성능 지표를 처리합니다.
              Cloudflare 안내에 따르면 이 비콘은 쿠키나 브라우저 저장소를
              사용하지 않고, 원본 IP 주소를 가장 가까운 데이터센터에서
              폐기하며, 개인을 여러 사이트에 걸쳐 추적하지 않습니다.
              현재 사이트는 맞춤 광고용 쿠키를 설치하지 않습니다.
            </p>
          </section>

          <section>
            <h2>6. 진단과 참여자 정보</h2>
            <p>
              프로그램 과정에서 구성원의 진단 또는 인터뷰 정보가 필요한
              경우, 수집 목적·공유 범위·보유 기간을 프로젝트 시작 전에
              별도로 안내하고 필요한 동의를 받습니다. 개인 결과는 사전에
              합의한 범위를 넘어 조직이나 제3자에게 제공하지 않습니다.
            </p>
          </section>

          <section>
            <h2>7. 안전성 확보 조치</h2>
            <p>
              처리 목적에 필요한 사람에게만 정보 접근을 제한하고, 이메일과
              업무 계정의 인증·권한을 관리합니다. 프로젝트별 참여자 정보는
              합의된 공유 범위와 보유 기간을 따르며, 목적이 끝난 정보는 위
              파기 절차에 따라 정리합니다.
            </p>
          </section>

          <section>
            <h2>8. 정보주체의 권리</h2>
            <p>
              본인 정보의 열람, 정정, 삭제 또는 처리 중지를 요청할 수
              있습니다. 아래 이메일로 요청하면 필요한 본인 확인 후
              처리합니다. 법령상 보관 의무 등 정당한 사유가 있는 경우 그
              사유와 처리 결과를 안내합니다.
            </p>
          </section>

          <section>
            <h2>9. 개인정보 보호 및 고충처리 문의</h2>
            <dl>
              <div>
                <dt>담당자</dt>
                <dd>
                  {legalOperator.name} · 대표 {legalOperator.representative}
                </dd>
              </div>
              <div>
                <dt>이메일</dt>
                <dd>
                  <a href={`mailto:${businessEmail}`}>{businessEmail}</a>
                </dd>
              </div>
              <div>
                <dt>주소</dt>
                <dd>{legalOperator.address}</dd>
              </div>
            </dl>
          </section>

          <section>
            <h2>10. 방침 변경</h2>
            <p>
              이 방침이 변경되면 시행일과 변경 내용을 이 페이지에
              공개합니다.
            </p>
          </section>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}

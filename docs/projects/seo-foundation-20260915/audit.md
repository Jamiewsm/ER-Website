# ER SEO 감사와 등록 현황

확인일은 2026-09-15. 공개 HTTP 응답은 curl과 실제 브라우저, Google 상태는 로그인된 Search Console 화면을 기준으로 한다.

## 검색엔진 관리 화면

| 항목 | 확인 결과 | 다음 행동 |
|---|---|---|
| Google 소유권 | er-coaching.com 도메인 속성 접근 가능 | 중복 등록 불필요 |
| Google 홈페이지 색인 | URL 검사에서 `URL is on Google`, `Page is indexed` | 새 페이지 배포 후 해당 URL 검사 |
| Google 사이트맵 | 최초 0건 → sitemap.xml 제출 → `Success`, 발견 URL 6개, 제출·읽기 9월 15일 | 동일 URL의 sitemap 변경을 Google이 재처리하는지 확인 |
| Google 성과 | 개요 화면 웹 검색 클릭 0, 색인 집계는 처리 중 | 충분한 데이터 축적 후 기간을 명시하여 비교 |
| Naver | 서치어드바이저가 로그인 화면으로 이동 | 사용자 로그인 후 속성·소유 확인·사이트맵 상태 확인 |
| Daum | 도메인 조회에서 미등록 사이트 표시 | 개인정보·서비스 이용 동의 확인 후 등록 정보 작성과 신청 |

사이트맵의 발견 URL 수는 색인 수가 아니다. 범용 검색 도구의 site: 조회에 결과가 없었지만 Search Console에서는 홈의 색인을 확인했다. 검색 결과가 없다는 이유로 미색인이라고 단정하지 않는다.

## 기술 감사

| 항목 | 운영에서 확인한 상태 | 이번 변경 |
|---|---|---|
| 홈페이지 | 200, 기본 title·description·canonical 있음 | 교육·코칭을 설명하는 메타데이터와 실제 href 링크 추가 |
| 주요 콘텐츠 | 소개·신학·유형 안내는 hash 기반 JS 렌더링 | 입문 안내와 성경적 관점에 독립 정적 문서 추가 |
| robots.txt | curl에서 200, Cloudflare 관리 블록 + 저장소 규칙과 Sitemap 포함 | 글에 사용하는 기존 CSS 토큰 파일만 수집 허용 |
| sitemap.xml | 200, 6 URL. 리다이렉트 전용 parents-workshop 포함 | 중복 제거, 대표 경로 수정, 새 안내 2개 추가하여 7 URL |
| 기본과정 URL | .html이 /basic-course로 리다이렉트되나 canonical은 .html | canonical·og:url·sitemap을 최종 주소로 일치 |
| 양육 워크숍 | canonical 누락, 옛 alias 별도 존재 | canonical 추가, alias의 이동 목적지 일치 |
| 아이 유형관찰 페이지 | description·canonical 누락 | 기본 검색·공유 메타데이터 추가 |
| 없는 주소 | 임의 없는 주소는 404 | 변경 없음 |
| HTTP 및 www | curl -L 결과 각각 해당 호스트·프로토콜에서 200. HTTPS non-www canonical은 존재 | Cloudflare 호스트/HTTPS 리다이렉트는 운영 설정 후속 항목 |
| Python 요청 | 홈페이지·sitemap에서 403, curl은 200 | 특정 클라이언트 응답을 Googlebot 차단 증거로 사용하지 않음 |

## 남은 기술 범위

- HTTP → HTTPS 및 www → non-www 리다이렉트를 Cloudflare에서 검토한다. 경로·쿼리 보존과 루프 여부를 점검해야 한다. 현재는 canonical만 일관되며 서버 리다이렉트가 완료된 상태는 아니다.
- test.html의 대표 주소는 test 트랙에서 처리한다. 이번 site 배포 번들은 live test runtime 10개를 그대로 보존한다.
- 오래된 양육 워크숍 모집 일정은 최신 운영 일정 확인 후 별도 수정한다. 실제 모집을 확인하지 않고 SEO 작업에서 날짜를 바꾸지 않았다.
- 공개 SPA 전체의 정적화는 이번 범위를 넘는다. 이번 두 글은 검색 가능한 입구이며 기존 앱 동선과 연결된다.

## 검증

- `node --test tests/seo-foundation.test.mjs tests/site-ministry-boundary.test.mjs tests/basic-course-october-site.test.mjs tests/theology-navigation.test.mjs tests/mobile-site-layout.test.mjs tests/infer-deploy-track.test.mjs` — 29개 통과.
- `npm ci --prefix tests/education --ignore-scripts` — 저장소에 이미 고정된 PGlite 테스트 의존성 설치. 패키지 정의·lock 변경 없음.
- `node --test tests/*.test.mjs` — 318개 통과, PostgreSQL 독립 세션용 외부 환경 테스트 1개 skip. 최초 실행의 모듈 누락 6건은 설치 후 해소.
- `node --check js/sections/home.js`, `git diff --check` 통과.
- `node scripts/build_site_only_deploy_bundle.mjs --source . --out /tmp/er-seo-site-bundle-20260915 --site https://er-coaching.com` — live test runtime 10개 보존 확인.
- CI 고정 버전 `wrangler@4.12.0 dev --local --port 8765`로 번들 확인. 새 문서 2개, CSS·토큰, 기존 대표 경로 200, 없는 주소 404. 새 디렉터리 주소는 trailing slash로 이동해 canonical과 일치.
- 고정 Wrangler 버전은 compatibility date를 2025-04-16으로 낮춘다는 경고가 있었다. 로컬 정적 라우팅 확인이며 실제 최신 production 런타임 검증은 배포 후 필요하다.
- Playwright 1440×1000 및 390×844 시각 확인. 두 글 모두 모바일 가로 넘침 없음. 성경적 관점 → 기본과정 → 10월 신청 화면으로 이동 확인. 신청 폼의 이름·결제지역 필드까지 확인. 로컬 신청 화면의 Turnstile은 110200/400 오류가 있어 실제 제출은 검증하지 않음.

## 참고한 공식 문서

- [Google JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) — HTML 본문과 href 링크, 고유 메타데이터.
- [Cloudflare HTML 경로 처리](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/) — 파일은 확장자 없이, 디렉터리 index는 trailing slash.
- [Naver 사이트맵·RSS](https://searchadvisor.naver.com/guide/request-feed) — 웹마스터도구 제출 절차.
- [Daum 검색등록](https://register.search.daum.net/) — 등록 조회와 신청 동의 화면.
- JavaScript 비활성화·390×844·reduced-motion 환경에서 두 문서의 실제 본문 길이, 가로 넘침, 목차 키보드 이동, 기본과정 링크 이동 assertion 통과. 새 문서는 실행 스크립트가 없으며 JSON-LD만 포함한다.

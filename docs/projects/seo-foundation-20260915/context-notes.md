# 작업 맥락

## 2026-09-15

- 시작 worktree는 clean main. origin/main 10e075b에서 site/seo-foundation 분기. 열려 있는 PR #129, #123, #90은 다른 범위이며 #123은 배포 보류 상태다.
- DEPLOY_LEDGER는 6월 기록이라 현재 운영 SHA의 증거로 사용하지 않는다. 실제 운영 응답을 별도로 확인한다.
- robots와 sitemap은 저장소에 이미 있다. 재생성보다 실제 응답·내용과 연결을 검증한다.
- 기존 소개·신학적 기초는 hash 기반 JavaScript 렌더링이다. 앱 전체 라우터 교체 대신 정적 콘텐츠 URL을 추가한다.
- 공개 신학 페이지를 편집 기준으로 사용한다. 내부 원문, 교재 전문, 운영 규칙은 웹 콘텐츠로 복사하지 않는다.
- Python urllib는 HTML에서 403, curl은 홈페이지 200. 특정 요청 결과를 모든 검색 로봇의 상태로 일반화하지 않는다.
- 계획·체크리스트·맥락을 구현 전에 만들었다. 기존 프로젝트 문서는 덮어쓰지 않는다.

- Google 속성은 기존 등록 상태였고 홈은 실제 색인되어 있다. sitemap 제출 0건을 발견하여 기존 운영 sitemap을 제출했다. Success·6 URLs 확인.
- 신규 페이지는 directory/index.html을 사용하여 /christian-enneagram/, /biblical-enneagram/ 대표 주소를 구성한다. 기본과정 등 파일형 페이지는 Cloudflare가 실제 제공하는 확장자 없는 주소로 metadata를 정렬한다.
- CSS 색은 기존 design-system/tokens.css를 참조한다. 새 토큰이나 Tailwind 런타임 의존성을 추가하지 않았다. robots에 해당 CSS 파일만 명시적으로 허용한다.
- Naver 로그인 필요 상태, Daum은 미등록 및 필수 동의 화면까지 확인. 사용자 응답 전 동의·개인정보 입력을 진행하지 않는다.
- 사이트 사역 범위를 고정 문구로 확인하는 기존 테스트가 최초 메타 설명 변경에 실패했다. 개인·가정·교회·사역 공동체를 명시하는 설명으로 수정해 기존 계약을 유지했다.
- 전체 테스트의 교육 DB 모듈 누락은 기존 lockfile의 의존성 설치로 해소했다. 새 라이브러리 추가나 테스트 비활성화는 없다.

- 구현 커밋 b8cbb23, PR https://github.com/Jamiewsm/ER-Website/pull/136. site-seo, test-runtime, live-deploy-markers, label 검사 통과. Cursor 메인 자동 검토는 대기 상태이며 merge·production 완료로 기록하지 않는다.
- QA 임시 브라우저와 로컬 Wrangler 서버 종료. 화면 캡처는 작업별 visualization 디렉터리로 옮겨 배포 번들에 포함되지 않게 했다.

## 네이버 등록 후속 — 2026-09-15

- 사용자가 네이버 로그인을 완료했다. 사이트 목록은 비어 있었으며 https://er-coaching.com 등록 화면에서 HTML 메타 태그를 발급받았다.
- Track은 site. 홈페이지 head에 검증 태그 한 줄만 추가한다. 기존 계획의 검색엔진 등록 단계를 이어가는 작업이다. 공개 검증 값이며 로그인 비밀번호나 API 비밀키가 아니다.
- HTML 파일 경로의 확장자 리다이렉트와 새 파일 배포 규칙을 추가할 필요가 없는 메타 태그 방식을 선택했다. 배포 후 네이버 소유확인, 사이트맵 제출, 주요 URL 수집 요청 순서로 진행한다.
- PR #136은 fdf649f로 병합됐고 CI 34938743282가 성공했다. 운영 두 문서 200·대표 주소·sitemap 7 URL·검사 JS 4개가 배포 전과 동일함을 확인했다. Google 재제출 성공 이후 새 문서 색인은 아직 확인 전이다.

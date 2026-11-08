# 검증 근거

2026-10-18, KST. 소스 기준 `e4f0157`. 운영 확인은 Playwright의 별도 비인증 브라우저 세션에서 수행했다.

## 운영 파일 대조

브라우저 동일 출처 fetch와 Web Crypto SHA256을 사용했다. 최신 origin/main으로 만든 리뷰 브랜치의 파일과 다음 네 개가 일치한다.

| 파일 | 바이트 | SHA256 |
|---|---|---|
| js/app-core.js | 10784 | f4f22cd572c2e4339b04e4ba0852ea1310ad1a71b95374430596f7c4af97dd0e |
| js/sections/home.js | 33954 | 179f86543b38bae5924e3fdbe35431c945158caeb86e93a9acea7625f06b29df |
| js/sections/apply.js | 68016 | 62712b102f6da102b53797129f9c99755d3744b729b52bb70a05b136ca9d4ab4 |
| js/app-helpers.js | 33663 | 2f282769366d8f0d156bdd68a07a679c34ba64e8b360115805e39f590e9332ce |

초기 로컬 브랜치의 일부 파일이 오래되어 최종 리뷰에서는 최신 main 소스로 전환하고 재검증했다. 초기 소스의 라벨 누락·홈 모집 상태 문제는 운영에서 해결되어 현행 결함으로 보고하지 않았다.

## 재현 요약

| ID | 방법 | 실제 결과 | 한계 |
|---|---|---|---|
| R1 | 현재 apply.js와 app-helpers.js를 fs/vm으로 읽어 renderApply의 track에 비실행 span 표식을 전달. | `CURRENT SOURCE INERT MARKUP INSERTION = true`. 표식이 onsubmit 속성 밖 HTML 문자열에 생성됨. | 실행형 payload·운영 DOM 삽입·제출·개인정보 접근 없음. |
| R2 | 운영 #apply?track=paid와 #privacy의 main DOM/텍스트 확인. | 일반폼 main의 정책 링크 없음. 정책에 상세 문서 추후 작성 문구 있음. | 법률 검토를 수행하지 않음. |
| R3 | 데스크톱 ER 소개 버튼에 포커스 후 Tab, 메뉴 display/aria 확인. 모바일 메뉴 열기 후 Escape. | 하위 메뉴 display none, aria-expanded 없음, 다음 포커스 유형검사. 모바일 메뉴는 Escape 후에도 표시되고 이름은 메뉴 열기 유지. | 전체 스크린리더 테스트는 아님. |
| R4 | 320×780 일반 신청 화면의 documentElement.scrollWidth 측정과 스크린샷. 페이지를 다시 진입해 반복 확인. | innerWidth320, scrollWidth366. Turnstile 오른쪽 잘림. | 실기기 검증 아님. iframe/shadow DOM은 일반 body 하위 요소 탐색에 포함되지 않음. |
| R5 | 첫 홈 Performance Navigation/Resource Timing + 현재 소스 자산 합계. | 리소스66, 전송4337582, encoded4318982, DOMContentLoaded1612ms, load2270ms. | 단일 비제한 네트워크 표본, 실제 사용자 Core Web Vitals 아님. |
| R6 | 홈 프로그램 찾기 버튼을 실제 클릭. | #programs?tab=individual로 이동. 보이는 탭은 관계·부부/교회·사역팀. 양육은 다른 메뉴에서 찾으라고 안내. | 이용자 혼란 비율은 측정하지 않음. |
| R7 | 실제 app-core.js를 Node VM, 가짜 DOM, 지연 loadNotices로 실행. 초기 홈 표시 뒤 scroll900 가정. | 공지 완료 후 scroll0, 본문 대입2회. | 코드 수준 재현이며 실제 사용자의 운영 화면 스크롤을 지연 응답으로 재현하지 않음. |
| R8 | 운영 홈 통계와 읽을 수 있는 텍스트 확인. | 98%,4.9/5와 집계 기준이 없는 상태 확인. home.js41–45에 상수. | 내부 근거의 존재 여부를 조회하지 않음. |
| R9 | 운영 프로그램 페이지 가격 정책 텍스트 확인. | 패키지 전환율이 높다는 문장 표시. programs.js290. | 문구의 사실성 평가가 아닌 고객 관점 평가. |
| R10 | programs,parenting,apply,community,coach_training에서 title 확인. | 동일한 홈 제목 유지. app-core.js에 document.title 갱신 없음. | 실제 검색 순위/검색엔진 색인은 검사하지 않음. |

## 자동 검사

최신 `e4f0157` 소스에서 다음 명령 exit0, 80개 통과, 실패0, skipped0.

```sh
node --test tests/seo-foundation.test.mjs tests/site-ministry-boundary.test.mjs tests/basic-course-october-site.test.mjs tests/theology-navigation.test.mjs tests/mobile-site-layout.test.mjs tests/infer-deploy-track.test.mjs tests/application-flow.test.mjs tests/apply-workshop-render.test.mjs
```

초기 브랜치에서 수행한 34개 검사는 최종 결과로 사용하지 않는다. 최신 소스로 재검증한 위 결과가 기준이다.

## 원본 산출물

선별 스크린샷은 이 문서와 함께 screenshots에 보관했다. 전체 브라우저 스냅샷·추가 스크린샷은 레포의 `output/playwright/website-review-20261018/`에 보존했다. 해당 output에는 기존 사용자/이전 작업의 다른 산출물이 있어 전체를 커밋 대상으로 선택하지 않는다.

## 참고 문서

- [Tailwind Play CDN](https://v3.tailwindcss.com/docs/installation/play-cdn). 개발용 CDN의 운영 적용 한계 확인.
- [Cloudflare Turnstile 위젯 구성](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/widget-configurations/). flexible 최소300px, compact150px 확인.

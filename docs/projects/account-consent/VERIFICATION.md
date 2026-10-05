# 계정 동의 검증

2026-10-05. 합성 계정·문서와 격리 DB로 검증했다. 운영 문서는 공개하지 않았다.

- `node --test tests/er-account-consent.test.mjs tests/education-student-enrollment.test.mjs` — 7개 통과. 필수 누락, 다른 회원 지정, 테이블 직접 접근, 원자적 이메일 가입, 인증 후 가입 완료, 중복 저장, 문구 변경, revision 충돌, 목적별 철회, 발송 대상 제외, 회원 삭제의 증거 정리 검증.
- `npm test --prefix tests/education` — 기존 교육·권한·승인 테스트 137개 통과.
- 포털 `node --test tests/*.test.js` — 427개 통과.
- 포털 `node tests/education-enrollment-browser.mjs` — 실제 Supabase JS SDK 요청을 격리 PostgreSQL에 연결해 390px 이메일 가입과 1280px·390px·320px 인증 후 동의 → 신청 → 승인 → 교실 → 수신 철회 통과. 선택 수신 기본 미선택·가로 스크롤 없음·서버 증거 저장 확인.
- 실제 독립 PostgreSQL 세션 경쟁 검사 `node --test tests/er-consent-concurrency.test.mjs` — CI 1개 통과. 동일 요청 두 세션은 증거 6건·요청 1건만 남기며 다른 요청의 stale revision은 부분 저장 없이 실패한다. 기존 정원 경쟁 테스트 6개도 통과했다. 로컬 머신에는 해당 PostgreSQL 실행 파일이 없어 이 검사는 CI에서 실행했다.

[API CI](https://github.com/Jamiewsm/ER-Website/actions/runs/37267760387)에서 코드 커밋 `1b4878b08bfe5bd4520043e1cf03430843b88921`을 검증했다. [포털 CI](https://github.com/Jamiewsm/CoachPortal-WebApp/actions/runs/37267784341)도 통과했다. 문서 승인 전 두 PR은 draft로 유지한다.

PGLite·Playwright는 기존 프로젝트 설치를 사용했으며 새 의존성을 추가하지 않았다. 실제 Google·카카오 제공자, 운영 인증 이메일, 운영 문서 승인·공개, 운영 migration·배포, 카카오 친구 관계·메시지 발송은 검증하거나 변경하지 않았다.

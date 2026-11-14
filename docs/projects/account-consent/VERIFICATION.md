# 계정 동의 검증

## 2026-10-05 운영 적용 검증

- API PR #165 머지 커밋 `0f0a71940d0cdef12c1b4971cf03cc889ea9eb0f`. 마지막 소스 커밋 `9b8f68dad35fabef9fd11535e46c0ea56d433d1c`의 GitHub 검사 전체 통과. 다른 반 승인 방지와 과거 실제 수료일 보존 리뷰를 수정·검증하고 대화를 해결했다.
- 포털 PR #56 머지 커밋 `4ed83f5fdf280f33e4f55ae999f697b85651c6c4`. [운영 배포](https://github.com/Jamiewsm/CoachPortal-WebApp/actions/runs/37274379048) 성공. 운영 education·consent·model·service worker HTTP 200과 `297-account-retention`을 확인했다.
- `node --test tests/education-record-retention.test.mjs` 기존 PGlite 지정 후 2개 통과. 과거 completed 레코드의 무관한 수정·실제 날짜 보완·미래 날짜 거절을 포함한다. `node --test tests/education-student-enrollment.test.mjs` 3개 통과. 잘못된 반 승인의 트랜잭션 원자성을 확인했다.
- 포털 `node --test tests/*.test.js` 429개 통과. 브라우저 320px·390px·1280px 동의·신청·승인·철회·본인 JSON 다운로드 통과. 운영 브라우저에서는 실제 승인 문서의 회원가입 동의 화면·선택 항목 기본 미선택을 확인했다. 운영 계정을 새로 만들거나 필수 약관을 대리 수락하지 않았다.
- 운영 migration 네 개 성공. 기존 Auth 27명과 legacy 회원 27명 일치, 임의 생성 동의 이벤트 0건. 모집 반 두 개는 101 하위유형·102 Parenting이고 기본 A/B는 닫혀 있다. 요청 반 승인 검증 트리거 2개와 교육 보관 RLS 4개, 일일 동의 파기 cron 활성화를 확인했다.
- 익명 `er_consent_catalog` HTTP 200, 승인 버전 `er-account-2026-10-05-v1`, 필수 3개·선택 3개 목적. `edu_application_options`의 익명 실행은 HTTP 401 권한 거절.
- 실제 Resend SMTP 저장과 이메일 인증 활성화, 로컬 키 파일 권한 600 확인. 실제 이메일 수신·소셜 제공자·카카오 발송은 미검증.
- 로컬 Resend 키로 TLS SMTP 인증 응답 235 통과. 운영에서 신규 Auth 1명 이메일 인증 완료·active 회원·동의 증거 6건·스터디 신청 1건을 추가 확인했다. 실제 메일함 내용은 조회하지 않았다.
- `node /Users/jwoo/.config/er-secrets/backup-data-snapshot.mjs` 통과. 93개 테이블·3,533행, Storage 원본 34개·36,626,845바이트. 암호화 왕복과 전체 파일 해시 대조 통과.
- `node /Users/jwoo/.config/er-secrets/verify-data-snapshot.mjs <archive>` 통과. 격리 PostgreSQL 18 JSONB 적재로 3,533행 전체 값을 대조했다.
- 사용자 직접 DB 비밀번호 재설정·로컬 입력 후 `backup-full-database.mjs <snapshot>` 통과. 전체 pg_dump 1,030,680바이트·TOC 1,383항목·역할 SQL·Storage 암호화 스냅샷을 묶어 암호화 왕복 검증 통과.
- `verify-full-database.mjs <full archive>` 통과. 교육·인증·Storage 관련 82개 테이블의 스키마·함수·제약·소유권·객체 권한·RLS 복원과 정확한 덤프 COPY 기준 3,098행 행 수 대조. 정책 166개, Auth 28명, legacy 27명, 문서 1개, 동의 6건, Storage 34개, 요청 반 승인 검증 트리거 2개를 복원했다. 플랫폼 pg_cron·pg_net·supabase_vault·Realtime 서비스는 로컬 재현에서 제외했다. PG18 호환을 위해 로컬 역할 멤버십 grantor만 변경했으며 원본 역할 SQL은 보존했다.

아래는 구현 단계의 과거 검증 기록이다. 당시 미배포 설명은 현재 운영 상태를 뜻하지 않는다.

## 보관 정책 승인 후 검증

- `node --test tests/er-account-consent.test.mjs` 기존 PGlite 모듈 지정 후 5개 통과. 탈퇴 후 최소 증거 보존, 목적별 만료 파기·재동의를 검증했다.
- `node --test tests/education-record-retention.test.mjs` 기존 PGlite 모듈 지정 후 1개 통과. 수료 시각 보존, 1년 경과 시 원문·첨부 접근 제한과 수석 조회를 검증했다.
- `PG_BIN_DIR=... node --test tests/er-consent-concurrency.test.mjs` 로컬 PostgreSQL 18 독립 세션 경쟁 검사 통과.
- `npm test --prefix tests/education` 기존 PGlite 모듈 지정 후 137개 통과.
- Resend SMTP 저장 설정은 Management API로 확인했다. 실제 인증 이메일 수신, 전체 DB·Storage 복원, 운영 migration·문서 공개·배포는 아직 확인하거나 실행하지 않았다.

2026-10-05. 합성 계정·문서와 격리 DB로 검증했다. 운영 문서는 공개하지 않았다.

- `node --test tests/er-account-consent.test.mjs tests/education-student-enrollment.test.mjs` — 7개 통과. 필수 누락, 다른 회원 지정, 테이블 직접 접근, 원자적 이메일 가입, 인증 후 가입 완료, 중복 저장, 문구 변경, revision 충돌, 목적별 철회, 발송 대상 제외, 회원 삭제의 증거 정리 검증.
- `npm test --prefix tests/education` — 기존 교육·권한·승인 테스트 137개 통과.
- 포털 `node --test tests/*.test.js` — 428개 통과.
- 포털 `node tests/education-enrollment-browser.mjs` — 실제 Supabase JS SDK 요청을 격리 PostgreSQL에 연결해 390px 이메일 가입과 1280px·390px·320px 인증 후 동의 → 신청 → 승인 → 교실 → 수신 철회 통과. 선택 수신 기본 미선택·가로 스크롤 없음·서버 증거 저장 확인.
- 실제 독립 PostgreSQL 세션 경쟁 검사 `node --test tests/er-consent-concurrency.test.mjs` — CI 1개 통과. 동일 요청 두 세션은 증거 6건·요청 1건만 남기며 다른 요청의 stale revision은 부분 저장 없이 실패한다. 기존 정원 경쟁 테스트 6개도 통과했다. 로컬 머신에는 해당 PostgreSQL 실행 파일이 없어 이 검사는 CI에서 실행했다.

[API CI](https://github.com/Jamiewsm/ER-Website/actions/runs/37267760387)에서 코드 커밋 `1b4878b08bfe5bd4520043e1cf03430843b88921`을 검증했다. [포털 CI](https://github.com/Jamiewsm/CoachPortal-WebApp/actions/runs/37267784341)도 통과했다. 문서 승인 전 두 PR은 draft로 유지한다.

PGLite·Playwright는 기존 프로젝트 설치를 사용했으며 새 의존성을 추가하지 않았다. 실제 Google·카카오 제공자, 운영 인증 이메일, 운영 문서 승인·공개, 운영 migration·배포, 카카오 친구 관계·메시지 발송은 검증하거나 변경하지 않았다.

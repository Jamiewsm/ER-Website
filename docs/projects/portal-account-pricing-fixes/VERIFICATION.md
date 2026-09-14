# 검증 결과와 적용 순서

## 검증

- `PGLITE_MODULE=/absolute/path/to/pglite/dist/index.js node --test tests/*.test.mjs`. 255개 통과, 실패 없음, 독립 PostgreSQL 세션을 요구하는 기존 정원 동시성 검사 1개는 환경 미설정으로 skip했다.
- `PGLITE_MODULE=/absolute/path/to/pglite/dist/index.js npm test --prefix tests/education`. 71개 통과. 신규 사진 Storage 정책과 발송 영속 선점 검사를 기존 교육 CI에 포함했다.
- 가격·메일·접수·발송 선점 집중 검사 74개 통과. 기본/심화 정가와 사역자 50%, 심화 분납, 체크 미선택/잘못된 값, 미지정/다른 과정 기수 거절, 정원 유지, 인증·수석 권한, 최초 발송 후 관리자 생략, 동시 요청과 24시간 경과 후 불확실 재발송 차단을 검증했다.
- 사진 DB 정책은 본인 active/completed 등록과 본인 파일에만 적용됨을 PGlite 역할별 실행으로 확인했다. 다른 사용자 경로, 미등록/철회/익명 사용자는 거절하고 기존 코치 정책은 보존한다.
- 실제 Chromium에서 기본/심화 사역자 접수 안내를 desktop/mobile로 렌더하고 가로 넘침과 금액·본문을 직접 확인했다. 강의계획안 이메일은 640/390/320px에서 확인했다.
- 강의계획안 PDF 2쪽과 자기관찰보고서 DOCX/PDF 2쪽(안내 1쪽·작성지 1쪽)을 텍스트 추출과 모든 페이지 시각 검토로 확인했다. 8회차·8질문·강사 경력·추천 자료, 이름 HTML escaping, 한글·여백·빈 페이지 없음과 부제의 ER/2026 표시를 확인했다.
- `git diff --check` 통과. 실제 이메일·DB/Storage 쓰기·migration 적용·배포는 하지 않았다.

## 적용 순서

1. 정상 백업·기존 migration 적용 상태를 확인한 운영 절차에서 새 migration 두 개만 순서대로 적용한다.
   - `20260915001000_education_profile_avatar_upload.sql`
   - `20260915002000_application_confirmation_delivery_guard.sql`
2. `submit-application`과 `notify-program-application` 및 공통 모듈을 함께 적용한다. 기존 Resend 발송 설정과 발신/회신 주소를 유지한다. `BASIC_COURSE_PRE_SURVEY_URL`은 새 자기관찰보고서 안내에 필요하지 않다.
3. CoachPortal-WebApp PR #21의 포털 UI를 적용한다. 기존 홈페이지 신청 완료/관리자 안내 문구는 별도 site PR이다.
4. 승인된 실제 계정 검증에서 학생 사진 저장/재방문, 본인 경로 제한, 신청 접수·결제 안내 1회와 등록 준비의 정원 처리, 자기관찰보고서·강의계획안 발송을 확인한다. 이 작업에서 실제 수신자에게 테스트 메일을 보내지 않았다.

메일 발송이 불확실한 상태의 복구는 [EMAIL_RECOVERY.md](EMAIL_RECOVERY.md)를 따른다. 자동 재발송을 위해 시도 기록을 무조건 초기화하지 않는다.

## 범위와 한계

- 기본 정가 450,000원/US$330, 사역자 225,000원/US$165. 심화 3개월 정가 150,000원 또는 월 50,000원, 사역자 75,000원 또는 월 25,000원. 심화 USD 가격은 만들지 않았다.
- 심화 가격 정책은 준비됐지만 실제 공개 신청 폼과 기수·반은 아직 연결되어 있지 않다. 실제 과정과 해당 기수가 일치해야만 접수와 결제 안내를 허용한다. 별도 4주 parenting_workshop은 변경하지 않는다.
- 자기관찰보고서·강의계획안은 2026년 10월 기본과정 전용이다. 정확한 날짜는 미확정이고 반별 안내로 남겼다. 내부 pre_survey 이벤트/발송 컬럼은 호환용으로 유지한다.
- 이메일은 두 문서의 내용을 본문으로 함께 제공한다. 로컬 PDF/DOCX는 검토·별도 배포용 산출물이며 서버에서 첨부파일로 자동 전송하는 기능을 추가하지 않았다.
- 메일 공급자 수신함 도착, 실제 Outlook/Gmail 렌더, 운영 OAuth/기존 계정 연결, 운영 UI·DB/Edge Function 반영은 별도 확인 대상이다.

검토용 파일은 `output/welcome-package`와 `output/email-preview`에 보관한다. 공개 웹사이트 배포 묶음에는 포함하지 않는다.

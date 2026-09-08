# 검증 기록 — 2026-09-09 갱신

실제 계정·실제 DB에 합성 테스트 자료를 넣지 않았다. 운영 DB는 용량·정책·가입 트리거를 읽기 전용으로만 확인했다. 전체 DB/파일 백업, 운영 migration 적용, 유료 전환은 아직 수행하지 않았다.

- 웹사이트: 교육 경로·조건·가격·반당 정원·신청 호환·렌더 검사24개 통과. 실제 SPA 전문가 메뉴와 기본과정 페이지를 Chromium 데스크톱/390px 모바일에서 확인했다.
- Backend: 격리 PGlite(Postgres)에서7개의 통합 시나리오 통과. 익명 차단, 반 격리, 초안 비공개, 제출 보존, 담당 멘토/공유 피드백, 공개 전 자료, 파일 읽기/수정 권한, 여러 역할, 정원7명, A/B14명→C추가21명, 기존 예약 호환, head의 학사 원문 삭제 차단. 기존 신청·메일 검사8개 통과.
- 포털: 기존·신규 검사85개 통과. Chromium에서 로그인→반 접근→질문 입력→메뉴 이동 중 입력 보존→임시저장→첨부→제출→멘토 내부/공유 피드백→학생 열람→공지 댓글→수석 수업 생성→원문8개 질문지 가져오기→질문 저장을 확인했다. 미배정 계정과 모바일 가로 넘침도 확인했다.
- 원문 자료:8개 문서,28개 답변 칸. 5번 두 판본을 보존,8번 파일 없음. 비어 있지 않은 모든 원문 문단이 안내/질문에 한 번씩 포함되는지 검사했다. 원본 문서 지시사항은 수업 내용으로만 처리했다.

## 검증 한계

PGlite는 실제 Postgres 쿼리와 RLS를 실행하지만, 운영 Supabase의 Auth/Storage 서비스 전체를 대체하지 않는다. 브라우저 테스트의 HTTP 응답은 PostgREST/Storage 동작을 필요한 범위에서 격리 DB에 연결했다. 다중 DB 연결에서의 경쟁, 실제 메일 인증/재설정과 파일 다운로드 서비스, 운영 계정 및 CDN/SW의 배포 갱신은 운영 전 검증이 남아 있다. Edge Function의 Deno 검사는 로컬 Deno가 없어 실행하지 않았다. 외부 메일을 발송하지 않았다.

## 다시 실행

ER-Website backend checkout:

```sh
npm ci --prefix tests/education --ignore-scripts
npm test --prefix tests/education
node --test tests/basic-course-october-supabase.test.mjs
```

CoachPortal checkout:

```sh
node --test tests/*.test.js
npm ci --prefix tests/education --ignore-scripts
./tests/education/node_modules/.bin/playwright install chromium
python3 -m http.server 8766 --bind 127.0.0.1
```

다른 터미널에서 `EDUCATION_DB_HELPER`에 backend checkout의 `tests/helpers/education-db.mjs` 절대경로를 지정해 `node tests/education-browser.mjs`를 실행한다. backend의 위 테스트 의존성이 설치되어 있어야 한다. 선택적으로 `EDUCATION_BANK_FILE`에 비공개 질문지 묶음 JSON 절대경로를 지정하면 실제 추출문 가져오기도 검증한다. `SUPABASE_SDK_FILE`을 지정하면 공식 CDN에서 미리 받은 SDK를 사용하며, 생략하면 CDN에서 읽는다. 합성 auth/storage 주소만 사용하므로 실제 계정 메일은 발송하지 않는다.

Site checkout:

```sh
node --test tests/basic-course-october-site.test.mjs tests/render-smoke.test.mjs tests/program-catalog-routing.test.mjs tests/site-ministry-boundary.test.mjs
```

## 출시 순서

검증된 전체 백업과 복원 → backend 검토·적용 → 포털 검토·적용 → 사이트 검토·CI 반영 → 운영자 실제 계정 확인 → 질문지/명단/일정 입력. GitHub merge와 운영 배포는 완료된 로컬 테스트와 별개다.


## 추가 확인 — 2026-09-09

- 기존 예약8명 상태에서도 초기 A/B반 생성 migration이 성공하고 예약을 보존한다.
- 이미 배정된 학생과 웹사이트 예약을 한 정원으로 계산한다. 가득 찬 반에서 같은 학생 재배정, 예약→학생 연결, 정원 감소, 직접 확정, 기존 신청 연결 해제, 다른 기수 연결을 검사했다. 정원 계산 내부 함수는 일반 계정에서 직접 호출할 수 없다.
- 실제 Chromium에서 필수 질문을 비운 임시저장은 성공하고 최종 제출은 차단됨을 확인했다. 수업 공개 취소·학생 등록 해제 후에도 내 성찰 보관함에서 질문/답변이 보이며, 멘토 내부 기록은 공개되지 않는다.
- 멘토는 확인된 기존 멘티 카드로 이동한다. 코치 프로필이 없는 교실 멘토에게 보고서 권한이 생기지 않는다. 잘못되거나 접근 불가능한 멘티 링크도 검사했다.
- 배포 묶음은 커밋된 실행 파일만 포함한다. 미커밋 파일·과제 원문·DB 설정·문서를 제외하고, 환경변수를 생략해도 main 검증을 적용하며 기능 브랜치는 명시적 preview로 전달되는지 실제 로컬 테스트 저장소와 가짜 업로드 도구로 검증했다. 운영 배포 도구는 실행하지 않았다.
- 운영 공개 파일 대조와 원 작업폴더 정리 근거는 CoachPortal PR #4의 PRODUCTION-BASELINE.md를 확인한다. 이것은 전체 DB 백업 근거가 아니다.

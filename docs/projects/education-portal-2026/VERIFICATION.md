# 검증 기록 — 2026-09-08

실제 계정·실제 DB에 합성 테스트 자료를 넣지 않았다. 운영 DB는 용량·정책·가입 트리거를 읽기 전용으로만 확인했다. 전체 DB/파일 백업, 운영 migration 적용, 유료 전환은 아직 수행하지 않았다.

- 웹사이트: 교육 경로·조건·가격·반당 정원·신청 호환·렌더 검사23개 통과. 실제 SPA 전문가 메뉴와 기본과정 페이지를 Chromium 데스크톱/390px 모바일에서 확인했다.
- Backend: 격리 PGlite(Postgres)에서5개의 통합 시나리오 통과. 익명 차단, 반 격리, 초안 비공개, 제출 보존, 담당 멘토/공유 피드백, 공개 전 자료, 파일 읽기/수정 권한, 여러 역할, 정원7명, A/B14명→C추가21명, 기존 예약 호환, head의 학사 원문 삭제 차단. 기존 신청·메일 검사8개 통과.
- 포털: 기존 검사78개 통과. Chromium에서 로그인→반 접근→질문 입력→메뉴 이동 중 입력 보존→임시저장→첨부→제출→멘토 내부/공유 피드백→학생 열람→공지 댓글→수석 수업 생성→원문8개 질문지 가져오기→질문 저장을 확인했다. 미배정 계정과 모바일 가로 넘침도 확인했다.
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

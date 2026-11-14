# 공개 검사 결과 평가 API 계획

2026-09-28. `supabase` 트랙의 독립 변경이며 운영 DB와 배포에는 접근하지 않는다.

## 목적

일반 검사 이용자의 선택형 체감 일치도를 실명 실험 자료와 분리해 저장한다. 새 `diagnostic_result_feedback` 테이블과 `submit-assessment-feedback` Edge Function만 추가한다. 기존 실험·신청·공통 보안 helper는 수정하지 않는다.

## 요청 계약

부모 작업에서 전달한 `attempt_id`, `revision`(0–2147483647), `result`, `versions`, `variant: word`, `rating` 또는 `deferred`, 일치·불일치 영역과 어려움 배열, 명시적 동의, Turnstile 토큰만 받는다. 알 수 없는 필드는 거부한다. 이름·연락처·원응답·주관식·IP·사용자 에이전트는 저장하지 않는다.

## 처리와 권한

- 운영 origin/hostname은 `er-coaching.com`, `www.er-coaching.com`으로 제한한다. 로컬 origin은 별도 환경 변수로 명시한 localhost 주소만 허용한다.
- 요청 크기와 값·배열·미확정 결과·날개 인접성을 서버에서 검사한다.
- Turnstile secret과 저장 설정이 없으면 거부한다. 검증 응답의 성공·action·hostname을 모두 확인한다.
- RLS와 명시적 권한 회수로 anon/authenticated의 직접 읽기·쓰기를 차단한다. 함수의 service_role만 SELECT/INSERT한다.
- `attempt_id + revision`은 유일하다. 정규화된 본문 fingerprint가 같으면 중복 성공, 다르면 409이며 기존 행을 변경하지 않는다.
- 이미 저장된 동일 본문과 동일 검증 토큰의 재전송은 저장된 토큰 hash를 비교해 성공을 재확인한다. 저장되지 않은 요청은 반드시 challenge 검증을 통과해야 한다. 토큰 원문은 저장하지 않는다.
- 새 rate-limit 저장소는 만들지 않는다. Turnstile의 단회 토큰, 요청 크기 제한, 중복 키가 기본 방어이며 분산 호출 제한은 제공하지 않는다는 한계를 기록한다.

## 검증

네트워크와 DB를 mock한 Node 테스트로 성공, 모든 주요 입력 제약, 설정 누락, origin·hostname·action 거부, 크기 초과, 중복·충돌·경합, DB/검증 서버 실패를 확인한다. SQL 권한·제약을 점검하고 가능한 격리 DB 검증을 추가한다. 운영 적용 전 migration, secret, 함수 배포, 실제 토큰·권한 검증이 별도로 필요하다.

## 운영 적용에 필요한 순서와 설정

1. 이 독립 Supabase 변경을 검토한 뒤 migration `20260928120000_diagnostic_result_feedback.sql`을 적용한다. 기존 실험 테이블과 데이터를 변경하지 않는다.
2. 함수 환경의 `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `TURNSTILE_SECRET_KEY`를 확인한다. 비밀키는 브라우저 설정에 넣지 않는다. 기존 공개 site key와 맞는 secret을 사용해야 한다.
3. `submit-assessment-feedback`을 배포한다. `verify_jwt=false`는 의도된 공개 경로이며 함수 내부에서 입력과 challenge를 검증한다.
4. 프런트엔드 Turnstile action을 `assessment-feedback`으로 설정한다. widget에 `er-coaching.com`과 `www.er-coaching.com`을 허용하고 두 실제 origin에서 성공·실패를 확인한다.
5. 로컬 환경에만 `ASSESSMENT_FEEDBACK_LOCAL_ORIGINS=http://localhost:8768` 같은 쉼표 구분 설정을 넣는다. localhost·127.0.0.1·[::1]의 정확한 origin만 받으며 로컬도 Turnstile 검증을 생략하지 않는다. wildcard·preview 도메인·전체 외부 origin 허용은 지원하지 않는다.
6. 실제 익명·로그인 역할의 테이블 조회/쓰기 거부, 서버 제출 1건, 중복 재제출, 다른 내용의 409, 통신 실패 후 재시도를 배포 환경에서 별도로 확인한 뒤 공개 UI를 활성화한다.

이 PR의 merge가 Supabase migration이나 함수 배포를 자동 수행하지는 않는다. 현재 `auto-deploy-on-merge.yml`은 site/test 파일 경로만 배포하며 이 변경의 추론 결과는 `skip`이다. 별도 승인된 Supabase 적용 절차로 위 단계를 수행해야 한다. CI의 테스트 통과와 운영 적용 완료를 구분한다.

CI 검증은 기존 `education-backend.yml`의 PGlite 설치 환경에 API·DB 테스트 실행 step 하나를 추가한다. 새 migration·endpoint·테스트 두 파일을 경로 trigger에 명시하며 기존 교육 검증 job은 유지한다. 로컬에서는 `npm ci --prefix tests/education --ignore-scripts`로 기존 잠금 의존성을 준비하거나 이미 설치된 동일 PGlite를 `PGLITE_MODULE` 환경 변수로 지정한 뒤 두 테스트를 실행할 수 있다.

성공은 `{saved:true}` 또는 `{saved:true,duplicate:true}`이며 DB 식별자나 결과·평가 내용을 응답으로 돌려주지 않는다. 오류는 안전한 code만 반환한다.

| HTTP | code | 클라이언트 처리 |
|---|---|---|
| 400 | `invalid_payload`, `invalid_json` | 보내는 계약을 확인한다. 선택값은 보존한다. |
| 403 | `origin_not_allowed`, `turnstile_failed` | 허용 origin을 확인하거나 새 challenge로 명시 재시도한다. |
| 409 | `revision_conflict` | 같은 revision은 수정하지 않는다. 수정 평가이면 새 revision으로 제출한다. |
| 413 / 415 | `request_too_large`, `unsupported_media_type` | 12 KiB 이하 JSON으로 제한한다. |
| 503 | `server_not_configured`, `verification_unavailable`, `storage_unavailable` | 성공으로 표시하지 않고 선택값을 보존한다. challenge를 갱신해 명시 재시도한다. |

`versions` 값은 각각 1–64자 영문·숫자·점·밑줄·하이픈 식별자다. 후보는 3–4개이며 확정 core가 후보에 포함되어야 한다. 미확정 core의 subtype과 wing은 null이다. 일치/불일치 영역은 겹치지 않으며 어려움의 `none`은 단독으로만 선택한다.

## 데이터와 남은 제한

- 공개 평가는 사용자 기기에서 계산한 결과의 자기보고다. client UUID와 challenge 검증은 유형 판정의 진위나 실명 이용자의 소유권을 증명하지 않는다. 동일 UUID의 revision을 독립적으로 검증된 개인 기록으로 취급하지 않는다.
- 공개 결과 읽기·수정·삭제 API는 없다. 보관 기간과 사용자 삭제 요청 처리는 운영자가 별도로 정해야 하며 이번 변경이 정책을 임의로 확정하지 않는다. service_role도 삭제 권한이 없으므로 승인된 정리 작업은 관리자 경로에서 수행한다.
- 분산 IP rate limiter나 시작·이탈 이벤트를 추가하지 않는다. 크기·단회 challenge·유일키 제한은 저장 남용을 줄이지만 트래픽·검증 요청·DB 조회 자체를 제한하지는 않는다. 운영 부하를 확인해 필요할 때 별도 제한을 설계한다.
- 함수와 설정이 준비되기 전에 프런트엔드가 저장 성공을 가정해서는 안 된다. 운영 적용·외부 실제 토큰 검증은 이 로컬 구현의 완료 주장에 포함하지 않는다.

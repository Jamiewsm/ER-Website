# 공개 평가 API 결정 기록

## 2026-09-28 초기 확인

- 새 체크아웃은 `9d2d507`, 브랜치는 `codex/assessment-feedback-api`이며 시작 시 변경이 없다.
- 기존 `diagnostic_experiment_sessions`는 실명·사전 초대 실험 전용이라는 SQL 지침이 있어 확장하지 않는다.
- 기존 Turnstile helper는 secret 누락 시 성공하므로 이 공개 API에는 재사용하지 않는다. 기존 helper의 동작은 이번 범위에서 변경하지 않는다.
- 기존 Node 테스트는 `stripTypeScriptTypes`와 VM으로 Edge Function의 네트워크·DB를 격리한다. 같은 패턴을 사용하고 패키지는 추가하지 않는다.
- DB 컬럼은 요청과 동일한 `result`, `versions`, `rating`, `deferred` 등의 이름을 사용해 후속 분석 연결을 단순하게 한다.
- 클라이언트가 제공한 결과와 시도 UUID는 자기보고 데이터 및 중복 방지 식별자이며 서버에서 검증한 검사 결과나 이용자 소유권을 뜻하지 않는다.
- 일치도 수정은 새 revision의 INSERT로 남긴다. 이전 행을 덮어쓰지 않는다. revision 값만으로 동일 이용자를 증명하지 않으므로 이 자료는 검증된 개인 종단 기록으로 취급하지 않는다.

## 구현 결정

- 정규화된 JSON의 SHA-256과 검증 토큰의 SHA-256을 따로 저장한다. 집합인 선택 배열과 후보 유형을 정렬하므로 순서만 다른 재전송은 같은 평가로 처리한다.
- 저장된 토큰 hash가 같은 재전송은 기존 행과 비교한 뒤 중복 성공 또는 409를 반환한다. 새로운 토큰을 사용하는 재전송은 다시 검증한다. 실패하거나 저장되지 않은 요청을 성공으로 처리하지 않는다.
- Cloudflare Siteverify의 `idempotency_key`는 본문 fingerprint와 토큰에서 파생한다. 같은 본문의 저장 실패 재시도는 같은 키를 사용하고, 다른 본문·revision은 다른 키를 사용한다. 검증 토큰 hash에도 DB UNIQUE를 두어 한 토큰으로 여러 행을 만들지 못하게 한다.
- Cloudflare 공식 문서에서 최대 토큰 길이 2048자, 유효기간 300초, 단회 사용, 서버 검증 및 idempotency key 지원을 확인했다. [검증 문서](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/).
- 기존 전역 CORS·Turnstile helper를 수정하지 않는다. 이 함수만 정확한 origin과 action/hostname을 검증한다.
- API 테스트는 기존 `stripTypeScriptTypes` 패턴으로 실행한다. DB 테스트는 이미 프로젝트가 사용하는 PGlite 0.5.8을 재사용하며 새 의존성을 추가하지 않는다.

## 검증 기록

- `node --test tests/assessment-feedback-api.test.mjs` 15개 통과.
- `PGLITE_MODULE=<기존 PGlite의 index.js 절대 경로> node --test tests/assessment-feedback-api.test.mjs tests/assessment-feedback-db.test.mjs` 16개 통과. 로컬 격리 DB에서 anon/authenticated 접근 거부와 service_role의 SELECT/INSERT 허용, UPDATE/DELETE 거부를 실제 쿼리로 확인했다.
- 기존 business 개발 의존성의 TypeScript 컴파일러를 메모리에서 사용해 `strict`/`noEmit` 진단 0개를 확인했다. Deno 전역과 원격 Supabase import에는 테스트 선언을 제공했으므로 Deno 배포 환경의 import 해석까지 검증한 것은 아니다.
- `git diff --check` 통과. 운영 DB·실제 Siteverify·Edge Function 배포에는 접근하지 않았다.
- 기존 실명 실험 저장 회귀 검사 `node --test tests/experiment-payload.test.mjs` 7개 통과. 공개 평가 구현에서 실험 저장 코드를 변경하지 않았다.
- 부모 작업의 추가 승인으로 `.github/workflows/education-backend.yml`의 기존 PGlite job에 API·DB 테스트 step 하나와 정확한 경로 trigger를 연결했다. 별도 job이나 패키지는 추가하지 않았다. 웹 작업이 수정하는 `er-test-pr-review.yml`은 건드리지 않았다.
- 자동 배포 흐름은 site/test runtime 경로만 대상으로 한다. 이 Supabase 전용 변경은 merge 후에도 migration·함수·secret 설정을 별도로 적용해야 하며 공개 UI 활성화보다 먼저 완료해야 한다.
- 마지막 실행은 공개 API·격리 DB·기존 실험 payload 회귀를 합쳐 23개 테스트가 통과했다. 테스트 두 파일의 `node --check`, workflow YAML 파싱, `git diff --check`도 통과했다. 변경 경로를 `scripts/infer_deploy_track.mjs`에 넣은 결과는 `track: skip`이다.

## 교차 검토 후 revision 범위 수정

- 부모 작업의 요청으로 임의의 20회 상한을 제거하고 API와 SQL의 revision 범위를 0–2147483647로 통일했다. 시도 UUID를 새로 만들 수 있어 낮은 상한은 남용 방지 효과가 없고 정상 재평가만 막을 수 있다.
- revision 21과 2147483647 저장 성공, -1·1.5·2147483648 거부를 API 및 격리 DB에서 확인했다. revision은 재평가 순서이며 독립 참가자 수가 아니다.
- 공개 API·격리 DB·기존 실험 payload 회귀를 합쳐 24개 테스트가 통과했다. 두 테스트 파일의 `node --check`와 `git diff --check`도 통과했다. 실제 DB에는 적용하지 않았다.

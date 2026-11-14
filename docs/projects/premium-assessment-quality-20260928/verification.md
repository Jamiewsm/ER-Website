# 검증 기록

2026-09-28. 이 문서는 로컬 구현·격리 검증 기록이며 운영 적용이나 검사 타당도 입증이 아니다.

## 자동 검사

다음 PR CI 대상 명령으로 156개 통과, 실패·건너뛰기 0개를 확인했다.

```sh
node --test tests/premium-test-guard.test.mjs tests/deploy-safety.test.mjs tests/confidence-card.test.mjs tests/response-quality.test.mjs tests/test-scoring.test.mjs tests/render-smoke.test.mjs tests/report-support-materials.test.mjs tests/report-support-wiring.test.mjs tests/phase4-options-render.test.mjs tests/question-copy-regression.test.mjs tests/tie-breaker-routing.test.mjs tests/experiment-payload.test.mjs tests/assessment-feedback-ui.test.mjs tests/premium-word-narrative.test.mjs tests/premium-report-narrative.test.mjs tests/weight-calibration-workflow.test.mjs tests/countertype-routing.test.mjs
```

별도 Supabase 브랜치에서 API·PGlite 권한·기존 실험 회귀를 검증했다. 기존 저장소의 PGlite 모듈을 `PGLITE_MODULE`에 지정하여 다음 명령으로 24개가 통과했다.

```sh
node --test tests/assessment-feedback-api.test.mjs tests/assessment-feedback-db.test.mjs tests/experiment-payload.test.mjs
```

프런트엔드의 실제 `buildPublicFeedbackPayload` 출력을 별도 백엔드의 실제 `validatePayload`에 입력해 16개 계약 사례를 검증했다. 유형 확정/보류, 평가/판단 보류, revision 0·1·21·최댓값을 조합했다. 네트워크 호출은 없다.

## 브라우저

기존 설치 Chrome과 Playwright로 `http://127.0.0.1:8768/test.html`을 열었다. Supabase 요청은 차단하고 Turnstile 및 저장 클라이언트를 대역으로 교체했다.

- 실제 화면에서 단어 81개를 응답하고, 최초 후보에 없던 7번을 선택해 서사 9개·상세 6개를 완료했다.
- 공통 관심사 SP와 유형별 하위유형 SO가 충돌할 때 유형 7은 유지하고 하위유형은 보류됐다.
- 평가·저장 동의·보안 확인 전 제출 차단, 모의 통신 실패 후 재시도와 성공, 새로고침 후 중복 제출 방지를 확인했다.
- 후보 재검토 시 같은 시도 ID와 단어 응답 81개를 보존하고 revision을 1로 올리며 서사 응답만 초기화했다.
- 390px 및 320px 한국어/영어 평가 화면에서 가로 넘침이 없었다. 페이지 오류 0개였다.
- 실명 실험 완료 결과를 새로고침하면 게이트가 결과를 숨기며, 재동의 후 결과와 평가 상태가 복원됐다. 모의 저장은 1회, 실제 Supabase 요청은 0회였다.
- 실제 CSS의 화면 캡처용 PDF 모드에서 320px/1280px 모두 평가·동의·보안 위젯·후보 검토 버튼이 숨겨지고 결과 근거·해석은 남았다. 클래스 제거 시 일반 화면이 복원됐다. 새 PDF 파일의 페이지 분할까지 검증한 것은 아니다.

## 교차 검토에서 수정한 문제

- 실명 게이트가 복원 결과의 평가 UI를 누락하던 문제.
- 하위유형이 충돌·불충분한데 보조자료가 억압 본능을 확정하던 문제. 부모·아이·형제 보조자료는 유지한다.
- 최초 후보가 명시적으로 없는 사례를 후보 포함 지표 분모에서 누락하던 문제.
- 하위유형 보류가 비교 지표에서 사라지던 문제. 비교 대상·확정·보류 또는 결측을 함께 표시한다.
- 일반 화면 캡처 PDF에 평가 입력과 보안 위젯이 포함되던 문제.
- 제출 후 새로고침하면 빈 입력들이 비활성 상태로 보이던 문제. 선택값을 추가 저장하지 않고 성공·복원 시 감사 문구만 표시한다. 실제 Chrome 320px에서 성공 직후와 재로딩 후 모두 확인했다.

## 운영 적용과 남은 범위

- 백엔드 PR의 migration·함수·Turnstile 설정 및 운영 권한 확인이 먼저다. 이후 test PR을 머지하면 기존 CI가 test 트랙을 배포한다. Supabase 변경은 자동 배포되지 않는다.
- 실제 사용자 제출, 실제 Turnstile 검증, 운영 DB 저장, 배포 후 동작은 확인하지 않았다.
- 체감 일치도는 정확도가 아니다. 독립 상담자 판정, 재검사, 단어/문장 비교 실험과 가중치 변경 검증은 [파일럿 절차](pilot-protocol.md)에 따라 별도 진행한다.
- 이번 단계에는 AI API, 자동 실험 배정, 모집, 새로운 운영 문항 전체 교체를 추가하지 않았다.

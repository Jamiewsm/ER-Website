# 검증 기록

2026-09-15. site track, 운영 요청 없이 합성 응답으로 확인했다.

## 결과
- focused 25개 통과. 실제 registration 요청 유지, 등록 준비 성공과 already_sent 분리, 공급자 발송 생략·결과 없음·불확실 오류 표시, 상태 저장 후 선택적 pre_survey 발송, 과거 기수 경계, 권한 거절.
- 아래 site/기존 CI 회귀 146개 통과.
- `node --check`로 변경한 세 JS 문법 검사 통과. `git diff --check` 통과.
- 캐시 후속 변경. `index.html`에서 `apply.js`, `coach/views.js`, `coach/applications.js` 참조만 `20260915a`로 갱신했다. Node assert로 세 참조가 정확히 한 번씩 존재하며 파일이 실제 경로에 있는지 확인했고 focused 25개를 다시 통과했다.

```sh
node --test tests/welcome-email-copy.test.mjs tests/apply-workshop-render.test.mjs
node --test tests/welcome-email-copy.test.mjs tests/apply-workshop-render.test.mjs tests/basic-course-october-site.test.mjs tests/site-ministry-boundary.test.mjs tests/program-catalog-routing.test.mjs tests/portal-entry-navigation.test.mjs tests/premium-test-guard.test.mjs tests/deploy-safety.test.mjs tests/confidence-card.test.mjs tests/response-quality.test.mjs tests/test-scoring.test.mjs tests/render-smoke.test.mjs tests/report-support-materials.test.mjs tests/report-support-wiring.test.mjs tests/phase4-options-render.test.mjs tests/question-copy-regression.test.mjs tests/tie-breaker-routing.test.mjs tests/experiment-payload.test.mjs tests/weight-calibration-workflow.test.mjs tests/countertype-routing.test.mjs
node --check js/sections/apply.js
node --check js/coach/applications.js
node --check js/coach/views.js
git diff --check
```

## 경계
실제 메일 수신, 관리자 운영 레코드 변경, 프로덕션 배포는 수행하지 않았다. 통합 메일 및 강의계획안을 지원하는 별도 Supabase 배포가 먼저 필요하다. 푸시·PR·머지·배포는 상위 작업이 조율한다.

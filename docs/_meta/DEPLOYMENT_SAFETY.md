# Deployment Safety Guardrail

이 문서는 ER Website 배포 사고를 막기 위한 운영 절차다.

## 1. 원칙

테스트 관련 작업을 배포할 때 **브랜치 전체를 그대로 production에 덮어쓰지 않는다.**

현재 production landing/menu가 최신 기준이다. 테스트 결과지 작업은 production landing을 보존한 뒤, 허용된 test runtime 파일만 overlay해서 배포한다.

## 2. Test-Only Deploy Bundle 생성

```bash
node scripts/build_test_only_deploy_bundle.mjs \
  --base /private/tmp/er-website-live-base-test-deploy-clean \
  --source . \
  --out /private/tmp/er-website-live-base-test-deploy-next \
  --site https://er-coaching.com
```

이 스크립트는 다음을 강제한다.

- `https://er-coaching.com/index.html`을 가져와 bundle의 `index.html`로 사용
- `https://er-coaching.com/js/sections/home.js`를 가져와 bundle의 `js/sections/home.js`로 사용
- Cloudflare가 fetch 응답에 삽입할 수 있는 `static.cloudflareinsights.com/beacon.min.js` script는 bundle에 저장하지 않음
- 아래 test runtime allowlist만 현재 source에서 overlay

Allowlist:

- `test.html`
- `css/test.css`
- `js/test.js`
- `js/diagnostic-experiment.js`
- `js/diagnostic-report-content.js`
- `js/report-support-materials.js`
- `test-results/background.png`
- `test-results/background_card.png`
- `test-results/background_vase.png`
- `test-results/backgrdound_road.png`

## 3. Dry-Run and Deploy

```bash
cd /private/tmp/er-website-live-base-test-deploy-next
npx --yes wrangler@latest deploy --dry-run
npx --yes wrangler@latest deploy
```

## 4. Post-Deploy Verification

```bash
node scripts/verify_live_test_deploy.mjs --site https://er-coaching.com
```

이 스크립트는 다음을 확인한다.

- Landing/menu marker: `유형검사`, `프리미엄 검사`, `child-type-test/child-type-test.html`
- Home design asset marker: `home-parent-child-photo.jpg`, `home-couple-photo.jpg`, `home-team-photo.jpg`, `hands and green.png`, `green and seat.png`
- Premium test runtime marker: `buildResponseQualitySnapshot`, `buildConfidenceExplanation`, `tb_2_9_1`, `er-report-application-map`
- Experiment payload marker: `buildExperimentAnalyticsPayload`, `experiment_payload`, `feedback_detail`
- Premium CSS marker: `background_vase.png`, `er-report-application-map`, `er-report-application-map-card`
- Child type page byte size

## 5. Regression Test

```bash
node --test tests/deploy-safety.test.mjs
```

이 테스트는 로컬 fixture로 두 가지를 검증한다.

- Test-only bundle builder가 source의 `index.html`/`home.js`를 배포하지 않고 live 파일을 보존하는가
- Live verifier가 필수 test marker 누락을 실패로 잡는가

## 6. 적용 기준

다음 상황에서는 이 문서 절차를 반드시 사용한다.

- `js/test.js`
- `css/test.css`
- `test.html`
- `js/diagnostic-experiment.js`
- `js/diagnostic-report-content.js`
- `js/report-support-materials.js`
- `test-results/*`

Landing, menu, home section, child type test를 함께 수정하는 작업은 test-only deploy가 아니라 별도 PR/review/deploy로 진행한다.

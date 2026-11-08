# PostgreSQL 환경과 배포 원장 복구 검증

2026-10-19 KST. site 배포 제어·테스트 환경 작업이다. 최종 CI·운영 상태는 아래에 추가한다.

## PostgreSQL 환경

- 기존 실패를 실제 재현했다. `node --test tests/er-consent-concurrency.test.mjs`는 `PG_BIN_DIR is required`로 실패했고, 관련 교육 경쟁 검사는 같은 환경에서 skip됐다.
- [공식 Postgres.app 2.9.6 배포](https://github.com/PostgresApp/PostgresApp/releases/tag/v2.9.6)의 PostgreSQL16.15 도구를 `/Users/jwoo/Applications/Postgres.app`에 설치했다. [다운로드 안내](https://postgresapp.com/downloads.html)는 PostgreSQL16.15를 지원 버전으로 제공한다.
- DMG SHA-256은 GitHub release의 `2689dc64d6a02e0a66e4585616919060d8fbf5bb06886fccc05b7f87638bf081`과 일치했다. `codesign --verify --deep --strict` 통과, `postgres --version`은16.15다.
- 앱 GUI·상시 서비스·운영 DB는 시작하지 않았다. 기존 helper가 `/tmp/edu-pg-*`의 일회용 DB와 전용 Unix 소켓을 만들고 TCP listen을 끈다. 합성 Auth/Storage fixture만 사용하고 종료 후 삭제한다.
- `scripts/run_tests.mjs`와 `npm test`를 추가했다. 명시한 `PG_BIN_DIR` → PATH의 `pg_config --bindir` → 사용자/시스템 Postgres.app 순으로 완전한 도구 경로를 찾는다. 명시한 잘못된 경로는 fallback 없이 실패한다. 외부 DB URL은 허용하지 않는다.
- npm pretest는 기존 `tests/education` 의존성을 별도 lockfile로 `npm ci --ignore-scripts` 설치한다. fresh checkout도 같은 명령으로 검증하며 DB나 런타임 패키지를 새로 추가하지 않는다. 처음 설치와 반복 실행에는 npm registry 접근이 필요하다.

반복 실행 명령이다.

```sh
npm test
```

다른 환경은 공식 PostgreSQL을 설치하고 다음처럼 명시할 수 있다. 환경 변수에는 DB 주소나 비밀번호를 넣지 않는다.

```sh
PG_BIN_DIR="$(pg_config --bindir)" npm test
```

## 원장 생성·저장 경로

- run39139119560 로그의 `GH006: Changes must be made through a pull request`를 확인했다. 직접 main push와 `continue-on-error`가 원인이다.
- 원장 생성기의 기존 정규식이 실제 현재 Site/Test 행과 heading을 바꾸지 못하는 문제도 임시 복제본 CLI 검사로 재현했다. 원장 파일 자체는 로컬에서 고치지 않았다.
- 생성기는 실제 성공한 배포 job만 기록한다. 미배포 Test/Edge 행은 보존한다. full SHA·UTC 검증 시각·실행 URL을 검증하고, 누락된 표/이력·오래된 실행을 거부한다. 동일 실행 재기록은 중복을 만들지 않는다.
- 배포 source를 resolve job에서 한 번 SHA로 고정하고 Site/Test job이 같은 SHA를 checkout한다. 검증 시각은 각 guard 성공 뒤 수집한다. 실패한 트랙을 요청 track만 보고 성공으로 기록하지 않는다.
- 원장 행에는 `source @ full SHA`로 기록해 비-main ref의 복구·preview 배포를 main 소속으로 잘못 표기하지 않는다.
- CI는 원장을 별도 bot 브랜치에 push하고 원장 전용 PR을 생성한다. 저장/PR 생성 실패는 더 이상 무시하지 않는다. PR 생성과 main 영구 저장은 별개 상태로 요약에 표시한다. 원장 PR 병합 전 현재 운영 배포를 확인한다.
- [GitHub 공식 문서](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow)에 따라 GITHUB_TOKEN의 이벤트 전파에는 제한이 있다. 원장 전용 PR에는 deploy 라벨을 붙이지 않으며 병합이 기능 재배포를 요구하지 않는다. PAT나 새로운 비밀키는 저장하지 않는다.

## 중간 검사

- 신규 원장·CLI·경로 탐색 및 기존 track 검사18/18 통과.
- `PG_BIN_DIR=/Users/jwoo/Applications/Postgres.app/Contents/Versions/16/bin node --test tests/education-concurrency.test.mjs tests/er-consent-concurrency.test.mjs`는7/7 통과, 실패0/skip0.

## 전체 검사·CI·운영 결과

- `npm test`는 **549/549 통과, 실패0, skip0**. PostgreSQL16.15의 동의·정원 경쟁 검사와 새 원장/경로 회귀 검사를 포함한다.
- `npm run check:css`, `node --check scripts/run_tests.mjs`, `node --check scripts/update_deploy_ledger.mjs`, `git diff --check` 통과.
- main 보호 설정을 변경 전 canonical JSON SHA-256 `120b18a97b0d85c71caf7e953dfd8ae30b4227b056a1d1416dbfc36d224e56f2`로 기록했다. 변경 후 다시 비교한다.
- CI 원장 PR을 위해 저장소 Actions의 `can_approve_pull_request_reviews` 설정을 true로 전환한다. GitHub가 PR 생성과 승인을 하나의 설정으로 묶지만 이번 workflow는 PR 생성만 하며 승인이나 자동 병합은 실행하지 않는다. 기본 workflow 권한 read와 main 보호는 유지한다.

PR/원장 영구 저장·운영 파일 검증 결과는 후속 기록에 추가한다.

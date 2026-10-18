## 문제와 변경

전체 검사에서 PostgreSQL 도구 경로가 없어 동의 저장 경쟁 검사가 실패하고 교육 경쟁 검사는 skip됐다. `npm test`가 명시 경로·pg_config·Postgres.app을 확인해 기존 일회용 Unix 소켓 DB 검사까지 실행한다. 외부 DB 연결이나 새 패키지는 추가하지 않는다.

배포 원장은 보호 main에 직접 push하다 GH006으로 실패했고 continue-on-error로 가려졌다. 현재 표를 갱신하지 못하는 생성기도 수정했다. CI는 같은 full SHA로 배포를 고정하고 guard 성공 트랙과 시각만 별도 bot 브랜치·PR에 기록한다. PR 생성 실패를 전파하며 main 반영은 PR 병합으로 구분한다.

## 검증

- `npm test` 549/549 통과, 실패0/skip0. PostgreSQL16.15 독립 경쟁7개 포함.
- 원장 현재 형식·CLI 실제 쓰기/실패 보존·부분 실패·중복·오래된 실행·잘못된 메타데이터 검사와 도구 경로 탐색 검사 통과.
- `npm run check:css`, 변경 스크립트 `node --check`, `git diff --check` 통과.
- 공식 Postgres.app DMG SHA-256·코드 서명 확인 후 사용자 로컬 설치. 상시 서비스·운영 DB 사용 없음.

## 운영 검증 계획

Track: site. 제어 경로를 검증하기 위해 이 PR의 deploy/site 라벨로 CI site-only 배포를 한 번 실행한다. 공개 기능 코드 변경은 없으며 진단 런타임을 보존한다. CI 원장 PR 생성·main 병합·운영 파일/화면을 별도 확인한다. 원장 전용 PR에는 deploy 라벨을 붙이지 않는다.

저장소 Actions의 PR 생성 허용 설정을 켰다. 기본 workflow 권한 read 및 main 보호 JSON 해시가 변경 전후 동일하다. workflow는 PR 승인·자동 병합·보호 규칙 우회를 실행하지 않으며 새 PAT를 저장하지 않는다.

# 맥락과 결정

## 2026-10-19

- 사용자가 PostgreSQL 환경 오류와 원장 갱신 실패 해결, 전체 테스트와 운영 상태 확인을 요청했다. 중단된 턴의 변경은 없고 기존 b244ec7 문서 커밋을 보존한 새 브랜치를 만들었다.
- tests/er-consent-concurrency.test.mjs는 PG_BIN_DIR 부재로 재현 실패한다. education 경쟁 검사는 같은 환경에서 skip하므로 전체 실행 때 반드시 경로를 설정한다.
- run39139119560의 update-ledger 실제 로그는 GH006/PR 필수로 실패했다. continue-on-error가 실패를 가렸다.
- update_deploy_ledger.mjs의 현재 정규식은 현대 Site/Test 표와 heading 형식을 처리하지 못한다. 원장 저장 경로만 고쳐서는 충분하지 않다.
- 원격 main 보호는 PR 필수·관리자 예외 없음이다. 이를 해제하지 않는다. 현재 GitHub Actions의 PR 생성 허용 설정은 꺼져 있다. CI 원장 PR을 위한 설정과 실제 저장 성공을 구분해 확인한다.
- PostgreSQL은 공식 Postgres.app 배포의 사용자 로컬 도구만 사용한다. 상시 서비스 등록이나 운영 DB 접속은 하지 않는다.
- 원장 파일은 로컬에서 직접 고치지 않고 CI 생성기와 PR을 통해 갱신한다. 새 비밀키나 PAT를 저장하지 않는다.
- Postgres.app2.9.6/PG16.15 DMG 해시·코드 서명 검증 후 사용자 Applications에 설치했다. 서비스 등록 없이 합성 DB 독립 경쟁7검사가 통과했다.
- 원장 CLI 임시 복제본 검사는 실제 현재 Site 행이 바뀌지 않는 실패를 재현했다. 생성기 수정 후 통과했다. 공개 runtime은 변경하지 않았다.
- resolve job의 실제 checkout SHA를 배포 두 job에 고정한다. success 트랙과 guard 시각만 원장에 기록하고 보호 main 직접 push를 PR로 바꾼다. 원장 PR 생성 실패를 숨기지 않는다.
- PR #180 독립 리뷰의 두 항목을 반영했다. 원장 source 행은 SHA만 정확히 기록하며 main 소속을 추정하지 않는다. npm pretest가 기존 교육 패키지를 lockfile/ignore-scripts로 준비해 fresh checkout에서도 전체 검사가 가능하게 한다. 도구 경로 fixture도 실제 공백 경로로 검사한다.

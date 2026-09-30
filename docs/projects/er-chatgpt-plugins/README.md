# ER 포털 ChatGPT / Codex 연결

## 구조

- 하나의 기존 Supabase 프로젝트를 사용한다. 교육포털, 코치포털, ER Website는 각각 별도 MCP Edge Function이다.
- Supabase Auth OAuth 2.1로 기존 사용자 계정을 연결하고, 각 호출의 JWT로 생성한 사용자 범위 클라이언트에 기존 RLS와 관리자 RPC가 적용된다. service-role 키는 MCP 코드에서 쓰지 않는다.
- 동의 화면은 CoachPortal-WebApp의 `oauth-consent.html`에 있다. 로그인·동의는 사용자가 직접 브라우저에서 수행한다.
- 로컬 Codex 패키지는 개인 마켓플레이스의 `er-education`, `er-coach`, `er-website` 세 개다. 정적 패키지는 원격 MCP URL과 사용 지침만 담는다. 실제 도구 코드는 이 저장소의 Edge Functions가 단일 원본이다.

## 현재 도구 범위

| 연결 | 조회 | 변경 |
| --- | --- | --- |
| 교육포털 | 계정 역할, 반, 수업, 제출물, 피드백 | 비공개 공지 초안, 비공개 피드백 |
| 코치포털 | 계정 역할, 과제, 자료, 일정 | 본인 과제 초안 |
| ER Website | 과정 신청 목록·상세 | 연락 완료·결제 대기·대기 상태 |

등록 확정, 결제 확인, 메일 발송, 공개, 파일 교체, 삭제, 권한 변경, 웹사이트 코드 수정·배포는 현재 MCP 도구에 없다. 각 작업은 기존 포털과 GitHub PR 절차를 사용한다. 새 도구는 운영 규칙과 권한·복구 검증 후 별도 변경으로 추가한다.

## 연결 활성화 순서

1. CoachPortal-WebApp의 동의 화면 PR을 배포하고 `https://coach.er-coaching.com/oauth-consent.html` 응답을 확인한다.
2. ER Website의 `/oauth-consent.html` 브리지를 site 트랙으로 배포하고, `authorization_id`가 코치 포털 동의 화면까지 전달되는지 확인한다. 기존 Auth Site URL `https://er-coaching.com`을 유지한다.
3. Supabase 대시보드에서 OAuth 2.1 Server를 켜고, Authorization Path를 `/oauth-consent.html`로 설정한다. Dynamic OAuth Apps를 허용하고 연결된 앱을 정기적으로 확인한다.
4. JWT signing key가 ES256 또는 RS256인지 확인한다. legacy HS256이면 별도 키 전환 계획이 필요하다.
5. GitHub ER-Website 저장소 Secrets에 `SUPABASE_ACCESS_TOKEN`을 설정한다. 토큰은 대화나 파일에 붙여 넣지 않는다. MCP 함수 변경이 `main`에 합쳐지면 `Deploy ER MCP servers`가 검사 후 세 함수를 함께 배포한다.
6. 운영 DB 백업과 기존 신청·등록·결제 의존성을 확인한 뒤 `20260930010000_er_mcp_safe_application_status.sql`을 적용한다. 이 마이그레이션은 수석코치만 미확정·미연동·결제 미진행 신청의 제한된 상태를 바꾸도록 한다. 함수 배포가 먼저 끝나면 상태 변경 도구는 마이그레이션 전까지 오류로 닫힌다. CI는 DB 마이그레이션을 자동 적용하지 않는다.
7. 인증 없이 `initialize`가 401과 OAuth 발견 헤더를 반환하는지, 로그인한 수석코치·멘토·학생 계정에서 허용된 도구만 데이터에 접근하는지 MCP Inspector로 검사한다. 학생 계정에서 관리자 신청 도구가 거부되어야 한다.
8. ChatGPT 개발자 모드의 Plugins에서 세 MCP URL을 각각 등록한다. 도구 메타데이터가 바뀌면 연결에서 Refresh를 실행하고 새 대화에서 검증한다.

## 갱신 규칙

- 이 저장소의 MCP 코드가 `main`에 합쳐질 때만 Edge Function이 자동 배포된다. 배포가 성공해야 운영 도구 동작이 바뀐다.
- 기존 도구의 이름과 입력 스키마는 호환되게 유지한다. 서버 결과와 DB 운영 데이터는 배포·변경 직후 최신 값이 반환된다.
- ChatGPT 개발자 모드의 도구 설명·스키마 변경은 연결 Refresh가 필요하다. 공개 플러그인으로 게시한 경우 OpenAI의 지속 검토가 적용되지만 즉시 반영은 보장되지 않는다.
- Codex 로컬 패키지의 지침이나 URL이 바뀌면 `git fetch origin main` 후 `node scripts/sync_er_plugins.mjs --ref origin/main --apply`로 개인 패키지를 동기화한다. 등록된 주기 작업은 이 절차를 병합된 `main`에서 자동 실행한다. 스크립트는 변경된 패키지만 cachebuster를 갱신하고 다시 설치한다. 일반 웹사이트 UI·테스트 코드 변경은 MCP 계약을 바꾸지 않으므로 플러그인 재설치가 필요하지 않다.
- ER Website 코드 자체의 머지·배포는 기존 `site`/`test` 트랙과 `DEPLOY_LEDGER` 절차를 따른다. MCP 배포가 웹사이트 코드를 배포하지 않는다.

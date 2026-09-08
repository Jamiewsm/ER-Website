# 결정 기록

- 2026-09-08 사용자 전체 실행 승인. 구현 중 재승인 질문 없이 진행.
- 코치 웹앱 origin/main 5fb1b78에 숙제 기능이 있으므로 오래된 로컬 dirty checkout 대신 최신 main 기반 격리 worktree 사용.
- 분리된 교육 entrypoint에서 동일 Supabase 계정을 공유. 기존 coach-only auth를 완화하지 않음.
- 예약공개는 DB 조회 권한의 publish_at으로 처리, 알림은 교실내 게시/제출 현황. 외부 자동메일·푸시는 별도 후속.

- 2026-09-09: 사용자 지정 merge·배포 담당은 Cursor CLI. 운영 코치포털5fb1b78 기반 정리 결과와 실행 순서는 CoachPortal PR #4의 PRODUCTION-BASELINE.md 및 EXECUTION-PLAN.md에 기록한다. 정원은 학생 배정과 미연결 예약을 합산하며, 기존 예약자 보존·중복 배정·예약 전환·연결 해제를 검증했다. 강사명 없이 향후 심화 과목 이름을 안내한다.

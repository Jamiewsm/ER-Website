# 결정 기록

- 2026-09-08 사용자 전체 실행 승인. 구현 중 재승인 질문 없이 진행.
- 코치 웹앱 origin/main 5fb1b78에 숙제 기능이 있으므로 오래된 로컬 dirty checkout 대신 최신 main 기반 격리 worktree 사용.
- 분리된 교육 entrypoint에서 동일 Supabase 계정을 공유. 기존 coach-only auth를 완화하지 않음.
- 예약공개는 DB 조회 권한의 publish_at으로 처리, 알림은 교실내 게시/제출 현황. 외부 자동메일·푸시는 별도 후속.

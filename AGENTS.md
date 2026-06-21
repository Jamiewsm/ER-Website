<!-- 모든 AI agent (Codex / Cursor / Claude) 의 진입점. 활성 작업으로 포워드 -->
# AGENTS.md

이 리포는 ER Website (https://er-coaching.com) 입니다. 코치 포털, 에니어그램 진단 테스트, 정적 페이지를 포함합니다.

## 메인 에이전트 (Cursor Cloud)

사용자 지정 **메인 에이전트**는 PR 머지·배포·다른 agent 작업 조율을 담당합니다.

- **조율 SSOT:** [docs/_meta/MAIN_AGENT.md](./docs/_meta/MAIN_AGENT.md) — 브랜치/PR/WORK_STATUS 확인, 머지 절차, 머지 대기 목록
- **GitHub:** `main` 은 protected → PR merge 필요. Cursor 연동에 **Pull requests: Read and write** 권한 권장.
- **다른 agent 추적:** `docs/_meta/enneagram/WORK_STATUS.md`, `HISTORY.md`, `git branch -a`, `gh pr list`

서브 에이전트(Task/explore) 결과는 메인 agent가 통합·커밋·PR까지 이어갑니다.

## 활성 수동 개선 작업 — ER Enneagram Test 발전 프로젝트

현재 예약 자동화 Phase 1~6은 archive 상태입니다. AI 에이전트로 이 리포에서 에니어그램 테스트 작업을 시작한다면 먼저 다음을 읽으세요.

1. [docs/_meta/enneagram/HANDOFF.md](./docs/_meta/enneagram/HANDOFF.md) — cold-start 5단계 protocol
2. [docs/_meta/enneagram/WORK_STATUS.md](./docs/_meta/enneagram/WORK_STATUS.md) — 현재 진행 상태 SSOT
3. [docs/_meta/enneagram/CODE_GAP_AUDIT.md](./docs/_meta/enneagram/CODE_GAP_AUDIT.md) — 오래된 문서/모듈 적용 금지 guardrail
4. [docs/_meta/enneagram/ACTIVE_EVOLUTION_PLAN.md](./docs/_meta/enneagram/ACTIVE_EVOLUTION_PLAN.md) — 현재 구현 계획 SSOT
5. [docs/_meta/enneagram/CONTEXT.md](./docs/_meta/enneagram/CONTEXT.md) — 설계 + 결정 로그

`PHASE_PLAN.md`, `PHASE_2_PLAN.md`, `PHASE_3_PLAN.md`, `PHASE_4_PLAN.md`, `PHASE_5_PLAN.md`, `PHASE_6_PLAN.md` 는 historical archive 입니다. 새 기능 구현 지시로 사용하지 마세요.

예약 자동화는 `WORK_STATUS.paused = true`, `current_phase >= 6`이면 종료합니다. 사용자가 직접 요청한 수동 작업은 `ACTIVE_EVOLUTION_PLAN.md` 기준으로 진행할 수 있습니다. 사용자가 명시적으로 "에니어그램 작업 일시정지" 라고 말하면 `WORK_STATUS.paused = true` 로 설정하고 `HISTORY.md` 에 기록.

## 그 외 작업

위 자동화 작업과 무관한 작업은 사용자가 명시적으로 요청한 범위로 한정. 일반 가이드는 리포 루트의 [CLAUDE.md](./CLAUDE.md) 참조.

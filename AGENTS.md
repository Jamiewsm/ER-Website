<!-- 모든 AI agent (Codex / Cursor / Claude) 의 진입점. 활성 작업으로 포워드 -->
# AGENTS.md

이 리포는 ER Website (https://er-coaching.com) 입니다. 코치 포털, 에니어그램 진단 테스트, 정적 페이지를 포함합니다.

## 활성 자동화 작업 — ER Enneagram Test 발전 프로젝트

현재 진행 중인 다단계 자동화 작업이 있습니다. AI 에이전트로 이 리포에서 작업을 시작한다면 먼저 다음을 읽으세요.

1. [docs/_meta/enneagram/HANDOFF.md](./docs/_meta/enneagram/HANDOFF.md) — cold-start 5단계 protocol
2. [docs/_meta/enneagram/WORK_STATUS.md](./docs/_meta/enneagram/WORK_STATUS.md) — 현재 진행 상태 SSOT
3. [docs/_meta/enneagram/CONTEXT.md](./docs/_meta/enneagram/CONTEXT.md) — 설계 + 결정 로그
4. [docs/_meta/enneagram/PHASE_PLAN.md](./docs/_meta/enneagram/PHASE_PLAN.md) — 모든 task 정의

이 작업은 하드-오토 스케줄 (Anthropic scheduled-tasks, 6시간 주기) 로도 진행됩니다. 사용자가 명시적으로 "에니어그램 작업 일시정지" 라고 말하면 `WORK_STATUS.paused = true` 로 설정하고 `HISTORY.md` 에 기록.

## 그 외 작업

위 자동화 작업과 무관한 작업은 사용자가 명시적으로 요청한 범위로 한정. 일반 가이드는 리포 루트의 [CLAUDE.md](./CLAUDE.md) 참조.

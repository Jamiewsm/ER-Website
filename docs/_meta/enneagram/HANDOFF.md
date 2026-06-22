<!-- 새 AI 세션 (스케줄 wakeup, codex, cursor, manual) 의 cold-start 5단계 protocol -->
---
kb_id: enneagram_test_meta.handoff
title: "Cold-Start Handoff Protocol"
created_at: "2026-05-06"
last_updated: "2026-06-20"
retrieval_tags:
  - handoff
  - protocol
  - cold_start
  - wakeup_prompt
---

# Cold-Start Handoff Protocol

이 문서를 처음 읽는 AI 라면 — 먼저 현재 세션이 예약 자동화인지, 사용자가 직접 요청한 수동 작업인지 구분한다. 예약 자동화는 아래 5단계를 엄격히 따른다. 사용자가 직접 요청한 수동 작업은 `WORK_STATUS.paused=true`여도 사용자 요청 범위 안에서 진행할 수 있다.

## 1단계 — 상태 확인

`docs/_meta/enneagram/WORK_STATUS.md` 의 frontmatter 를 읽는다. 예약 자동화에서는 다음 3 조건 중 하나라도 참이면 즉시 종료한다.

- `paused: true`
- `current_phase >= 6`
- `locked_task != null` AND `lock_expires_at` 가 현재 시각보다 미래

종료 시 `HISTORY.md` 에 `early_exit` 한 줄 추가.

수동 사용자 요청에서는 `paused: true`와 `current_phase >= 6`을 "예약 자동화가 멈춰 있음"으로만 해석한다. 사용자가 요청한 코드/문서 수정은 진행 가능하다. 단, `locked_task`가 활성이고 같은 파일을 건드려야 하면 충돌 위험을 먼저 확인한다.

## 2단계 — 락 획득

`WORK_STATUS.md` 를 다음과 같이 갱신.

- `locked_task` = `current_task` 값
- `lock_holder` = 자신의 에이전트 ID. 형식 — 스케줄 wakeup 은 `claude-auto-<wakeup_count>`, 수동 Claude 는 `claude-manual-<short_uuid>`, codex 는 `codex-<short_uuid>`, cursor 는 `cursor-<short_uuid>`.
- `lock_expires_at` = 현재 시각 + 30분 (ISO-8601 UTC)
- `last_updated` = 현재 시각 (ISO-8601 UTC)
- `wakeup_count` += 1

`HISTORY.md` 에 `start` 한 줄 추가.

## 3단계 — Task 정의 확인

현재 수동 개발 작업은 `docs/_meta/enneagram/ACTIVE_EVOLUTION_PLAN.md`에서 task 섹션을 찾는다. 오래된 `PHASE_PLAN.md`, `PHASE_2_PLAN.md`, `PHASE_3_PLAN.md`, `PHASE_4_PLAN.md`, `PHASE_5_PLAN.md`, `PHASE_6_PLAN.md`는 archive이며 실행 지시로 사용하지 않는다.

작업 전 반드시 함께 확인할 문서:

1. [WORK_STATUS.md](./WORK_STATUS.md) — 현재 운영 코드 스냅샷
2. [CODE_GAP_AUDIT.md](./CODE_GAP_AUDIT.md) — 적용 금지/선별 적용 항목
3. [ACTIVE_EVOLUTION_PLAN.md](./ACTIVE_EVOLUTION_PLAN.md) — 현재 task 정의
4. [CONTEXT.md](./CONTEXT.md) — 설계 결정 로그

## 4단계 — Task 실행

Steps 를 순서대로 실행. 각 step 완료 시 필요하면 `WORK_STATUS.checkpoint` 를 step ID 로 갱신한다. 토큰 리밋/오류로 중간 종료해도 다음 세션이 `checkpoint` 다음부터 재개할 수 있어야 한다.

각 task 시작 시 `WORK_STATUS.checkpoint_plan` 을 step ID 배열로 채운다 (예 — `["1.3.1","1.3.2",...,"1.3.9"]`).

## 5단계 — 락 해제 + 인계

Definition of Done 모두 충족 시 다음을 수행.

1. `node docs/_meta/enneagram/verify.mjs <task_id>` 실행 → OK 확인. 실패 시 step 으로 돌아가 수정.
2. 단일 commit (메시지 형식 — `<type>(enneagram-kb): <description>` 본문에 `Phase 1 task <id>` + agent ID + verify 요약). 푸시는 사용자 선호에 따름 (기본 — 푸시 안 함, 수동).
3. `WORK_STATUS.locked_task = null`, `lock_holder = null`, `lock_expires_at = null`, `checkpoint_plan = []`, `checkpoint = null`, `current_task = <next_id>`, `last_updated = now`.
4. `HISTORY.md` 에 `complete` 한 줄 추가.
5. 종료. (다음 wakeup/세션이 다음 task 진행)

## Wakeup Prompt (스케줄 task 가 사용)

```
You are continuing automated work on the ER Enneagram test project.

Required first action: Read docs/_meta/enneagram/HANDOFF.md COMPLETELY.
Execute the 5-step protocol exactly. Do NOT ask the user questions.
If WORK_STATUS shows paused=true OR current_phase>=6, log to HISTORY and exit.
Do not execute archived PHASE_* plans.
Manual/user-requested development should follow ACTIVE_EVOLUTION_PLAN.md, not PHASE_PLAN.md.
```

## 사용자 호출 시

사용자가 자연어로 작업 일시정지/재개/상태 요청 시.

- "일시정지" — `WORK_STATUS.paused = true`, HISTORY 에 `paused` 한 줄, 사용자에게 "일시정지 됨" 응답.
- "재개" — `WORK_STATUS.paused = false`, HISTORY 에 `resumed` 한 줄, 사용자에게 "재개 됨" 응답.
- "상태" — WORK_STATUS frontmatter + HISTORY 마지막 5줄을 사용자에게 보여줌.

## 멀티-AI 충돌 방지

락이 활성 (`lock_expires_at > now`) 이면 즉시 종료. 락 만료 시 다음 에이전트가 인계. 동일 task 가 여러 번 실행될 수 있으므로 task 의 모든 step 은 idempotent 해야 함 (이미 작성된 파일 덮어쓰기 OK, 동일 내용 재작성도 OK).

## Working Directory

현재 일반 작업 디렉토리는 `/Users/jwoo/Library/Mobile Documents/com~apple~CloudDocs/Desktop/Visual Studio Code/ER-Website`다.

과거 자동화 브랜치/워크트리 기록은 `WORK_STATUS.md`와 `HISTORY.md`에 남아 있으나, 현재 Codex/사용자 수동 작업은 위 일반 워크트리 기준으로 수행한다. 별도 브랜치나 worktree가 필요하면 작업 시작 전에 사용자가 명시한다.

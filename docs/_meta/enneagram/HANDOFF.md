<!-- 새 AI 세션 (스케줄 wakeup, codex, cursor, manual) 의 cold-start 5단계 protocol -->
---
kb_id: enneagram_test_meta.handoff
title: "Cold-Start Handoff Protocol"
created_at: "2026-05-06"
last_updated: "2026-05-06"
retrieval_tags:
  - handoff
  - protocol
  - cold_start
  - wakeup_prompt
---

# Cold-Start Handoff Protocol

이 문서를 처음 읽는 AI 라면 — 당신은 ER 에니어그램 테스트 발전 프로젝트의 자동 작업을 인계받았습니다. 아래 5단계를 정확히 따르세요.

## 1단계 — 상태 확인

`docs/_meta/enneagram/WORK_STATUS.md` 의 frontmatter 를 읽는다. 다음 4 조건 중 하나라도 참이면 즉시 종료한다.

- `paused: true`
- `current_phase >= 6`
- `locked_task != null` AND `lock_expires_at` 가 현재 시각보다 미래

종료 시 `HISTORY.md` 에 `early_exit` 한 줄 추가.

## 2단계 — 락 획득

`WORK_STATUS.md` 를 다음과 같이 갱신.

- `locked_task` = `current_task` 값
- `lock_holder` = 자신의 에이전트 ID. 형식 — 스케줄 wakeup 은 `claude-auto-<wakeup_count>`, 수동 Claude 는 `claude-manual-<short_uuid>`, codex 는 `codex-<short_uuid>`, cursor 는 `cursor-<short_uuid>`.
- `lock_expires_at` = 현재 시각 + 30분 (ISO-8601 UTC)
- `last_updated` = 현재 시각 (ISO-8601 UTC)
- `wakeup_count` += 1

`HISTORY.md` 에 `start` 한 줄 추가.

## 3단계 — Task 정의 확인

`docs/_meta/enneagram/PHASE_PLAN.md` 에서 `current_task` ID 의 task 섹션을 찾는다 (예 — `## 2. Task 1.0`, `## 3. Task 1.1` 형식). 그 task 의 (a) Files (b) Inputs (c) Definition of Done (d) Steps 를 모두 읽는다. 모호함 발견 시 `CONTEXT.md` 의 결정 로그/거부된 대안을 확인.

## 4단계 — Task 실행

Steps 를 순서대로 실행. 각 step 완료 시 `WORK_STATUS.checkpoint` 를 step ID 로 즉시 갱신 (예 — `"1.3.4"`). 부분 산출물도 즉시 git stage. 토큰 리밋/오류로 중간 종료해도 다음 wakeup 이 `checkpoint` 다음부터 재개.

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
Otherwise complete the next pending task per PHASE_PLAN, update WORK_STATUS + HISTORY, exit.
```

## 사용자 호출 시

사용자가 자연어로 작업 일시정지/재개/상태 요청 시.

- "일시정지" — `WORK_STATUS.paused = true`, HISTORY 에 `paused` 한 줄, 사용자에게 "일시정지 됨" 응답.
- "재개" — `WORK_STATUS.paused = false`, HISTORY 에 `resumed` 한 줄, 사용자에게 "재개 됨" 응답.
- "상태" — WORK_STATUS frontmatter + HISTORY 마지막 5줄을 사용자에게 보여줌.

## 멀티-AI 충돌 방지

락이 활성 (`lock_expires_at > now`) 이면 즉시 종료. 락 만료 시 다음 에이전트가 인계. 동일 task 가 여러 번 실행될 수 있으므로 task 의 모든 step 은 idempotent 해야 함 (이미 작성된 파일 덮어쓰기 OK, 동일 내용 재작성도 OK).

## Working Directory

이 프로젝트의 작업 디렉토리는 git 워크트리 — `/Users/Joeyswoo/Library/Mobile Documents/com~apple~CloudDocs/Desktop/Visual Studio Code/ER-Website/.claude/worktrees/musing-taussig-e181fd/` (브랜치 `claude/musing-taussig-e181fd`). 모든 변경은 이 워크트리에서 수행, commit 도 여기서. main 으로의 머지는 사용자가 수동.

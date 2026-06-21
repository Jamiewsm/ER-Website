<!-- ER 에니어그램 테스트 Phase 1 (KB foundation) 구현 plan. cold-start AI 가 task 별로 즉시 실행 가능 -->
---
kb_id: enneagram_test_meta.phase_plan
title: "Phase 1 Implementation Plan — KB Foundation"
phase: 1
created_at: "2026-05-06"
last_updated: "2026-06-20"
status: archived_do_not_execute
superseded_by: ACTIVE_EVOLUTION_PLAN.md
total_tasks: 9
estimated_total_minutes: "220-330"
related_files:
  - CONTEXT.md
  - WORK_STATUS.md
  - HANDOFF.md
  - HISTORY.md
retrieval_tags:
  - phase_1
  - kb_foundation
  - implementation_plan
  - task_decomposition
  - cold_start_ready
---

# ER Enneagram Test — Phase 1 (KB Foundation) Implementation Plan

> **ARCHIVED — DO NOT EXECUTE.** 이 문서는 2026-05 자동화 Phase 1 기록 보존용이다. 현재 운영 코드 발전 작업은 [ACTIVE_EVOLUTION_PLAN.md](./ACTIVE_EVOLUTION_PLAN.md)를 기준으로 진행한다. 이 문서의 task, worktree, script load 지시는 현재 운영 코드보다 오래되어 새 작업에 관여하면 안 된다.

> **For agentic workers:** This plan executes via hard-auto scheduled wakeup OR manual session. Before executing any task: read [HANDOFF.md](./HANDOFF.md), follow the 5-step protocol, then locate the task ID in this file and execute its Steps in order. Each Step's checkbox (`- [ ]`) is marked completed in WORK_STATUS, not by editing this file.

**Goal:** ER 에니어그램 테스트의 KB 토대를 완성한다 — 기존 4 KB 파일 강화 + 4 신규 KB 파일 + 5 _meta 파일 + AGENTS.md + .cursor rule + verify.mjs. Phase 2 (27 subtype 깊이) 가 의존하는 토대.

**Architecture:** SSOT 기반 + 멀티-AI 친화 + 토큰 효율. 모든 진행 상태는 `WORK_STATUS.md` frontmatter, 모든 task 정의는 본 파일, 결정 기록은 `CONTEXT.md`, 작업 로그는 `HISTORY.md`. 각 task 산출물은 frontmatter + 표 위주, 장문 산문 금지, PDF 직접 인용 금지.

**Tech Stack:** Markdown (frontmatter YAML), Node.js (verify.mjs, 무의존), git (worktree branch `claude/musing-taussig-e181fd`), `mcp__scheduled-tasks__*` (하드-오토).

**Working Directory:** `/Users/Joeyswoo/Library/Mobile Documents/com~apple~CloudDocs/Desktop/Visual Studio Code/ER-Website/.claude/worktrees/musing-taussig-e181fd/` — 모든 경로는 이 디렉토리 기준 상대 경로.

---

## 0. Task Index

| ID | 제목 | 의존 | 추정(분) |
|---|---|---|---:|
| 1.0 | 연속성 인프라 부트스트랩 (5 _meta + verify.mjs + AGENTS.md + .cursor + KB sync + 스케줄 task) | - | 25-40 |
| 1.1 | type_pair_disambiguation 24 템플릿 완성 + axis 컬럼 | 1.0 | 30-45 |
| 1.2 | centers_and_triads.md 신규 | 1.0 | 15-25 |
| 1.3 | type_wings.md 신규 (18 wing) | 1.0 | 60-90 |
| 1.4 | instinct_stacks.md 신규 (6 stack) | 1.0 | 30-45 |
| 1.5 | korean_test_copy_guide.md 신규 | 1.1, 1.2, 1.3, 1.4 | 45-60 |
| 1.6 | complete_enneagram_kb.md 보강 (state/trait + Triad pointer) | 1.2 | 5-10 |
| 1.7 | README.md 갱신 (목차 + retrieval 동선) | 1.1-1.6 | 10-15 |
| 1.8 | Phase 1 종료 검증 + Phase 2 인계 | 1.0-1.7 | 10-15 |

**병렬 가능:** 1.1, 1.2, 1.3, 1.4 는 1.0 후 서로 다른 파일을 다루므로 병렬 실행 가능. 단일 Claude 하드-오토는 순차.

---

## 1. Conventions (모든 task 가 따름)

### 1.1 WORK_STATUS.md frontmatter 스키마

```yaml
---
kb_id: enneagram_test_meta.work_status
schema_version: 1
last_updated: "<ISO-8601>"
current_phase: 1               # 1 ~ 5. 6 이상이면 종료.
current_task: "1.0"            # 다음 실행할 task ID
checkpoint_plan: ["1.0.1", ...]  # task 시작 시 채움. 종료 시 비움.
checkpoint: null               # 마지막으로 완료된 sub-step ID. 없으면 null.
paused: false
schedule_interval_hours: 6
locked_task: null              # 락 보유 시 task ID
lock_holder: null              # 락 보유 에이전트 ID (claude-auto-<n>, claude-manual, codex-<id>, cursor-<id>)
lock_expires_at: null          # ISO-8601. 30분 후 만료.
wakeup_count: 0
last_wakeup_tokens: null       # 가능 범위 내에서만
---
```

본문은 사람이 읽는 진행 상태 요약 (선택).

### 1.2 락 획득 / 해제 protocol

**획득** — task 시작 시.
```
1. WORK_STATUS.md 읽기. paused=true | current_phase>=6 | (locked_task != null AND lock_expires_at > now) → HISTORY 1줄 + 종료.
2. WORK_STATUS.locked_task = "<task_id>", lock_holder = "<agent_id>", lock_expires_at = now+30min.
3. WORK_STATUS.last_updated = now.
4. WORK_STATUS 저장.
```

**해제** — task 완료 시.
```
1. WORK_STATUS.locked_task = null, lock_holder = null, lock_expires_at = null.
2. WORK_STATUS.checkpoint_plan = [], checkpoint = null.
3. WORK_STATUS.current_task = "<next_task_id>".
4. WORK_STATUS.last_updated = now.
5. WORK_STATUS.wakeup_count += 1.
6. WORK_STATUS 저장.
```

### 1.3 Commit message 형식

```
<type>(enneagram-kb): <description>

Phase 1 task <id>: <task title>
Agent: <agent_id>
Verify: <verify.mjs output summary>
```

**type** — `feat` (신규 파일), `docs` (콘텐츠 갱신), `chore` (인프라/스크립트).

### 1.4 HISTORY.md 한 줄 형식

```
| <ISO-8601> | <agent_id> | <task_id> | <event> | <token_estimate> | <note> |
```

**event** — `start` / `checkpoint` / `complete` / `paused` / `early_exit` / `error`.

### 1.5 한국어 헤더 코멘트 규칙

각 신규 markdown 파일 첫 줄 (frontmatter 위) — `<!-- 한 줄 한국어 설명 -->`.

### 1.6 frontmatter 필수 키 (verify.mjs 검사 대상)

- `kb_id` (string)
- `title` (string)
- `created_at` (string, YYYY-MM-DD 또는 ISO-8601)
- `retrieval_tags` (array, len ≥ 1)

### 1.7 PDF 인용 금지

본 plan 의 어떤 산출물도 Complete_Enneagram.pdf 의 본문을 직접 전사하지 않는다. 페이지 참조 (예 — `p128`) 와 자체 요약/해석/추론만 사용.

---

## 2. Task 1.0 — 연속성 인프라 부트스트랩

**Files:**
- Create: `docs/_meta/enneagram/WORK_STATUS.md`
- Create: `docs/_meta/enneagram/HANDOFF.md`
- Create: `docs/_meta/enneagram/HISTORY.md`
- Create: `docs/_meta/enneagram/verify.mjs`
- Create: `AGENTS.md` (리포 루트)
- Create: `.cursor/rules/enneagram-work.mdc`
- Modify: `CLAUDE.md` (리포 루트, 1줄 추가)
- Sync: `docs/knowledge_base/enneagram/complete_enneagram/*.md` (main repo 의 untracked working dir 에서 worktree 로 복사)
- External: 스케줄 task 생성 via `mcp__scheduled-tasks__create_scheduled_task`

**Inputs:**
- `docs/_meta/enneagram/CONTEXT.md` (이미 작성됨)
- `docs/_meta/enneagram/PHASE_PLAN.md` (이 파일)
- 기존 4 KB 파일 (main repo 의 working dir, untracked)

**Definition of Done:**
- [ ] 워크트리에 KB 파일 4개 존재 (`docs/knowledge_base/enneagram/complete_enneagram/{README,source_page_index,complete_enneagram_kb,type_pair_disambiguation}.md`)
- [ ] 5 _meta 파일 모두 존재 + verify.mjs 통과
- [ ] AGENTS.md + .cursor/rules/enneagram-work.mdc 존재 + WORK_STATUS 로 포워드
- [ ] 리포 CLAUDE.md 에 진입점 1줄 추가됨
- [ ] 스케줄 task 생성됨 (cron `0 */6 * * *` 또는 동등)
- [ ] 단일 commit 으로 인프라 도입 + 푸시
- [ ] WORK_STATUS.current_task = "1.1", 락 해제, HISTORY 에 complete 1줄

### Steps

- [ ] **Step 1.0.1: KB 파일 워크트리로 sync**

KB 4개 파일을 main repo working dir 에서 워크트리로 복사. 위치 동일 (`docs/knowledge_base/enneagram/complete_enneagram/`).

```bash
mkdir -p docs/knowledge_base/enneagram/complete_enneagram
cp '/Users/Joeyswoo/Library/Mobile Documents/com~apple~CloudDocs/Desktop/Visual Studio Code/ER-Website/docs/knowledge_base/enneagram/complete_enneagram/README.md' docs/knowledge_base/enneagram/complete_enneagram/README.md
cp '/Users/Joeyswoo/Library/Mobile Documents/com~apple~CloudDocs/Desktop/Visual Studio Code/ER-Website/docs/knowledge_base/enneagram/complete_enneagram/source_page_index.md' docs/knowledge_base/enneagram/complete_enneagram/source_page_index.md
cp '/Users/Joeyswoo/Library/Mobile Documents/com~apple~CloudDocs/Desktop/Visual Studio Code/ER-Website/docs/knowledge_base/enneagram/complete_enneagram/complete_enneagram_kb.md' docs/knowledge_base/enneagram/complete_enneagram/complete_enneagram_kb.md
cp '/Users/Joeyswoo/Library/Mobile Documents/com~apple~CloudDocs/Desktop/Visual Studio Code/ER-Website/docs/knowledge_base/enneagram/complete_enneagram/type_pair_disambiguation.md' docs/knowledge_base/enneagram/complete_enneagram/type_pair_disambiguation.md
```

검증 — `wc -l docs/knowledge_base/enneagram/complete_enneagram/*.md` 가 `46 README, 90 source_page_index, 390 complete_enneagram_kb, 137 type_pair_disambiguation, 663 total` 출력해야 함.

- [ ] **Step 1.0.2: verify.mjs 작성**

Create `docs/_meta/enneagram/verify.mjs` (Node.js, 무의존).

```javascript
#!/usr/bin/env node
// 에니어그램 KB 산출물 검증 스크립트 (frontmatter, 링크, 분량, 한국어 헤더 검사)
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const META_DIR = path.join(ROOT, 'docs/_meta/enneagram');
const KB_DIR = path.join(ROOT, 'docs/knowledge_base/enneagram/complete_enneagram');

const REQUIRED_KEYS = ['kb_id', 'title', 'created_at', 'retrieval_tags'];

const TASK_FILE_SPECS = {
  '1.0': [
    { path: 'docs/_meta/enneagram/CONTEXT.md', minLines: 100, maxLines: 500 },
    { path: 'docs/_meta/enneagram/WORK_STATUS.md', minLines: 10, maxLines: 80 },
    { path: 'docs/_meta/enneagram/PHASE_PLAN.md', minLines: 200, maxLines: 2000 },
    { path: 'docs/_meta/enneagram/HANDOFF.md', minLines: 30, maxLines: 200 },
    { path: 'docs/_meta/enneagram/HISTORY.md', minLines: 5, maxLines: 5000 },
    { path: 'AGENTS.md', minLines: 5, maxLines: 80, requireOurFrontmatter: false },
    { path: '.cursor/rules/enneagram-work.mdc', minLines: 5, maxLines: 80, requireOurFrontmatter: false },
  ],
  '1.1': [
    { path: 'docs/knowledge_base/enneagram/complete_enneagram/type_pair_disambiguation.md', minLines: 200, maxLines: 400 },
  ],
  '1.2': [
    { path: 'docs/knowledge_base/enneagram/complete_enneagram/centers_and_triads.md', minLines: 80, maxLines: 150 },
  ],
  '1.3': [
    { path: 'docs/knowledge_base/enneagram/complete_enneagram/type_wings.md', minLines: 250, maxLines: 400 },
  ],
  '1.4': [
    { path: 'docs/knowledge_base/enneagram/complete_enneagram/instinct_stacks.md', minLines: 150, maxLines: 250 },
  ],
  '1.5': [
    { path: 'docs/knowledge_base/enneagram/complete_enneagram/korean_test_copy_guide.md', minLines: 200, maxLines: 320 },
  ],
  '1.6': [
    { path: 'docs/knowledge_base/enneagram/complete_enneagram/complete_enneagram_kb.md', minLines: 380, maxLines: 450 },
  ],
  '1.7': [
    { path: 'docs/knowledge_base/enneagram/complete_enneagram/README.md', minLines: 40, maxLines: 100 },
  ],
};

function parseFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split('\n')) {
    const km = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*):\s*(.*)$/);
    if (km) fm[km[1]] = km[2].trim();
  }
  // retrieval_tags array detection (multi-line list)
  const tagsBlock = m[1].match(/retrieval_tags:\s*\n((?:\s*-\s*.+\n?)+)/);
  if (tagsBlock) {
    fm.retrieval_tags = tagsBlock[1].split('\n').filter(l => l.trim().startsWith('-')).map(l => l.replace(/^\s*-\s*/, '').trim());
  } else if (fm.retrieval_tags && fm.retrieval_tags.startsWith('[')) {
    fm.retrieval_tags = fm.retrieval_tags.replace(/^\[|\]$/g, '').split(',').map(s => s.trim());
  }
  return fm;
}

function checkFile(spec) {
  const errors = [];
  const full = path.join(ROOT, spec.path);
  if (!fs.existsSync(full)) {
    errors.push(`FILE_MISSING: ${spec.path}`);
    return errors;
  }
  const text = fs.readFileSync(full, 'utf8');
  const lines = text.split('\n');
  if (lines.length < spec.minLines) errors.push(`TOO_SHORT: ${spec.path} (${lines.length} < ${spec.minLines})`);
  if (lines.length > spec.maxLines) errors.push(`TOO_LONG: ${spec.path} (${lines.length} > ${spec.maxLines})`);

  if (spec.path.endsWith('.md')) {
    // Korean header comment must be the first non-empty line, before frontmatter
    const firstNonEmpty = lines.find(l => l.trim().length > 0);
    if (!firstNonEmpty || !firstNonEmpty.trim().startsWith('<!--')) {
      errors.push(`MISSING_KOREAN_HEADER: ${spec.path}`);
    }
    if (spec.requireOurFrontmatter !== false) {
      const fm = parseFrontmatter(text);
      if (!fm) {
        errors.push(`MISSING_FRONTMATTER: ${spec.path}`);
      } else {
        for (const key of REQUIRED_KEYS) {
          if (!fm[key]) errors.push(`MISSING_KEY: ${spec.path} :: ${key}`);
        }
        if (fm.retrieval_tags && (!Array.isArray(fm.retrieval_tags) || fm.retrieval_tags.length === 0)) {
          errors.push(`EMPTY_RETRIEVAL_TAGS: ${spec.path}`);
        }
      }
    }
    // broken internal links (./xxx.md, ../xxx.md, sibling .md only — no http)
    const linkRe = /\[[^\]]+\]\((\.{1,2}\/[^)]+\.md|[a-zA-Z0-9_./-]+\.md)\)/g;
    let m;
    while ((m = linkRe.exec(text)) !== null) {
      const linkPath = m[1];
      const resolved = path.resolve(path.dirname(full), linkPath);
      if (!fs.existsSync(resolved)) errors.push(`BROKEN_LINK: ${spec.path} -> ${linkPath}`);
    }
  }
  return errors;
}

function main() {
  const taskId = process.argv[2];
  if (!taskId) { console.error('Usage: node verify.mjs <task_id>'); process.exit(2); }
  const specs = taskId === 'all'
    ? Object.values(TASK_FILE_SPECS).flat()
    : TASK_FILE_SPECS[taskId];
  if (!specs) { console.error(`Unknown task: ${taskId}`); process.exit(2); }
  const errors = [];
  for (const spec of specs) errors.push(...checkFile(spec));
  if (errors.length === 0) {
    console.log(`OK: task ${taskId} verified (${specs.length} files)`);
    process.exit(0);
  }
  console.error(`FAIL: task ${taskId}`);
  for (const e of errors) console.error('  ' + e);
  process.exit(1);
}

main();
```

검증 — `node docs/_meta/enneagram/verify.mjs 1.0` 실행. CONTEXT.md + PHASE_PLAN.md 만 존재해야 정상. 다른 파일들은 이 task 의 후속 step 에서 생성 → 일부 FILE_MISSING 출력 OK. 마지막 step 에서 다시 실행해서 OK 확인.

- [ ] **Step 1.0.3: WORK_STATUS.md 작성**

Create `docs/_meta/enneagram/WORK_STATUS.md`.

```markdown
<!-- 에니어그램 테스트 발전 프로젝트의 현재 진행 상태 SSOT. 모든 wakeup/세션의 1차 참조 -->
---
kb_id: enneagram_test_meta.work_status
schema_version: 1
title: "ER Enneagram Test — Work Status"
created_at: "2026-05-06"
last_updated: "2026-05-06T00:00:00Z"
retrieval_tags: [work_status, phase_progress, lock_state]
current_phase: 1
current_task: "1.0"
checkpoint_plan: []
checkpoint: null
paused: false
schedule_interval_hours: 6
locked_task: null
lock_holder: null
lock_expires_at: null
wakeup_count: 0
last_wakeup_tokens: null
---

# Work Status

## 현재 상태

- Phase 1 (KB Foundation) 진행 중
- 다음 task — 1.0 (연속성 인프라 부트스트랩)
- 일시정지 — 아니오

## 일시정지 방법

`paused: true` 로 변경하면 모든 wakeup 이 즉시 종료. 어느 AI 세션에서든 "에니어그램 작업 일시정지" 한 마디로 가능 — 그 세션이 본 파일을 편집한다.

## 자동 진행 보기

- [PHASE_PLAN.md](./PHASE_PLAN.md) — 모든 task 정의
- [HANDOFF.md](./HANDOFF.md) — cold-start AI 5단계 protocol
- [HISTORY.md](./HISTORY.md) — wakeup 로그
- [CONTEXT.md](./CONTEXT.md) — 설계 결정 + 거부 대안
```

- [ ] **Step 1.0.4: HANDOFF.md 작성**

Create `docs/_meta/enneagram/HANDOFF.md`.

```markdown
<!-- 새 AI 세션 (스케줄 wakeup, codex, cursor, manual) 의 cold-start 5단계 protocol -->
---
kb_id: enneagram_test_meta.handoff
title: "Cold-Start Handoff Protocol"
created_at: "2026-05-06"
last_updated: "2026-05-06"
retrieval_tags: [handoff, protocol, cold_start, wakeup_prompt]
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

WORK_STATUS.md 를 다음과 같이 갱신.

- `locked_task` = `current_task` 값
- `lock_holder` = 자신의 에이전트 ID. 형식 — 스케줄 wakeup 은 `claude-auto-<wakeup_count>`, 수동 Claude 는 `claude-manual-<short_uuid>`, codex 는 `codex-<short_uuid>`, cursor 는 `cursor-<short_uuid>`.
- `lock_expires_at` = 현재 시각 + 30분 (ISO-8601)
- `last_updated` = 현재 시각 (ISO-8601)
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

락이 활성 (lock_expires_at > now) 이면 즉시 종료. 락 만료 시 다음 에이전트가 인계. 동일 task 가 여러 번 실행될 수 있으므로 task 의 모든 step 은 idempotent 해야 함 (이미 작성된 파일 덮어쓰기 OK).
```

- [ ] **Step 1.0.5: HISTORY.md 작성 (초기화)**

Create `docs/_meta/enneagram/HISTORY.md`.

```markdown
<!-- 모든 wakeup/세션의 작업 로그. 1줄/event. 최신이 위로 -->
---
kb_id: enneagram_test_meta.history
title: "Work History Log"
created_at: "2026-05-06"
last_updated: "2026-05-06"
retrieval_tags: [history, audit_log, wakeup_log]
---

# Work History Log

| Timestamp (UTC) | Agent | Task | Event | Tokens | Note |
|---|---|---|---|---:|---|
| 2026-05-06T00:00:00Z | claude-manual-bootstrap | 1.0 | start | - | Phase 1 부트스트랩 시작 |
```

- [ ] **Step 1.0.6: AGENTS.md (리포 루트) 작성**

Create `AGENTS.md` at repo root.

```markdown
<!-- 모든 AI agent (Codex / Cursor / Claude) 의 진입점. 활성 작업으로 포워드 -->
# AGENTS.md

이 리포는 ER Website (https://er-coaching.com) 입니다. 코치 포털, 에니어그램 진단 테스트, 정적 페이지를 포함합니다.

## 활성 자동화 작업 — ER Enneagram Test 발전 프로젝트

현재 진행 중인 다단계 자동화 작업이 있습니다. AI 에이전트로 이 리포에서 작업을 시작한다면 먼저 다음을 읽으세요.

1. [docs/_meta/enneagram/HANDOFF.md](./docs/_meta/enneagram/HANDOFF.md) — cold-start 5단계 protocol
2. [docs/_meta/enneagram/WORK_STATUS.md](./docs/_meta/enneagram/WORK_STATUS.md) — 현재 진행 상태 SSOT
3. [docs/_meta/enneagram/CONTEXT.md](./docs/_meta/enneagram/CONTEXT.md) — 설계 + 결정 로그
4. [docs/_meta/enneagram/PHASE_PLAN.md](./docs/_meta/enneagram/PHASE_PLAN.md) — 모든 task 정의

이 작업은 하드-오토 스케줄 (Anthropic scheduled-tasks, 6시간 주기) 로도 진행됩니다. 사용자가 명시적으로 "에니어그램 작업 일시정지" 라고 말하면 `WORK_STATUS.paused = true` 로 설정하고 HISTORY 에 기록.

## 그 외 작업

위 자동화 작업과 무관한 작업은 사용자가 명시적으로 요청한 범위로 한정. 일반 가이드는 리포 루트의 [CLAUDE.md](./CLAUDE.md) 참조.
```

- [ ] **Step 1.0.7: .cursor/rules/enneagram-work.mdc 작성**

Create directory + file.

```bash
mkdir -p .cursor/rules
```

Create `.cursor/rules/enneagram-work.mdc`.

```markdown
<!-- Cursor 진입점. ER Enneagram Test 자동화 작업으로 포워드 -->
---
description: ER Enneagram Test 자동화 작업 진입점
globs: ["docs/_meta/enneagram/**", "docs/knowledge_base/enneagram/**"]
alwaysApply: false
---

# ER Enneagram Test — 자동화 작업

이 리포에 ER 에니어그램 진단 테스트의 KB foundation / 27 subtype 콘텐츠 / 스코어링 / 결과지 발전 프로젝트가 진행 중입니다.

작업 시작 전 반드시 다음을 읽으세요.

- `docs/_meta/enneagram/HANDOFF.md` — cold-start 5단계 protocol
- `docs/_meta/enneagram/WORK_STATUS.md` — 현재 진행 상태 SSOT
- `docs/_meta/enneagram/PHASE_PLAN.md` — task 정의

작업 후 `WORK_STATUS.md` 와 `HISTORY.md` 갱신. 자세한 protocol 은 HANDOFF.md.
```

- [ ] **Step 1.0.8: 리포 CLAUDE.md 갱신**

리포 루트의 `CLAUDE.md` 는 main repo 의 untracked working dir 에 있음 (이전 단계에서 확인). 워크트리에는 없음. 워크트리에서 갱신하려면 먼저 복사해야 함.

```bash
# main repo 에서 워크트리로 복사
cp '/Users/Joeyswoo/Library/Mobile Documents/com~apple~CloudDocs/Desktop/Visual Studio Code/ER-Website/CLAUDE.md' CLAUDE.md
```

기존 CLAUDE.md 파일 첫 줄 (`# CLAUDE.md`) 바로 아래에 다음 섹션을 추가 (Edit tool 사용).

기존 시작 부분.
```markdown
# CLAUDE.md

This file helps Claude Code and other AI agents work on this repository from the same shared context.
```

다음으로 변경 (한 섹션 추가).
```markdown
# CLAUDE.md

This file helps Claude Code and other AI agents work on this repository from the same shared context.

## ⚡ 활성 자동화 작업

ER Enneagram Test 발전 프로젝트가 하드-오토 스케줄로 진행 중입니다. 작업 시작 전 반드시 [docs/_meta/enneagram/HANDOFF.md](./docs/_meta/enneagram/HANDOFF.md) 를 읽고 5단계 protocol 을 따르세요. 진행 상태는 [WORK_STATUS.md](./docs/_meta/enneagram/WORK_STATUS.md).
```

- [ ] **Step 1.0.9: 스케줄 task 생성**

`mcp__scheduled-tasks__create_scheduled_task` 의 schema 를 ToolSearch 로 먼저 로드해야 함. 그 후 다음 파라미터로 호출.

- `name` — `er-enneagram-auto-resume`
- `cron` — `0 */6 * * *` (매 6시간 정각)
- `prompt` — HANDOFF.md 의 "Wakeup Prompt" 섹션 본문 (위 1.0.4 참조)
- `working_directory` — 워크트리 절대 경로 `/Users/Joeyswoo/Library/Mobile Documents/com~apple~CloudDocs/Desktop/Visual Studio Code/ER-Website/.claude/worktrees/musing-taussig-e181fd`

성공 시 반환된 task ID 를 `WORK_STATUS.md` 본문에 기록 (frontmatter 에는 `scheduled_task_id` 필드 추가).

만약 `mcp__scheduled-tasks__` MCP 서버가 사용 불가하면 fallback — `CronCreate` deferred tool 로 동등 cron 생성. 그것도 불가하면 사용자에게 알리고 hard-auto 일시 보류 (소프트 자동만 동작). 이 경우 `WORK_STATUS.scheduled_task_id = "manual_only"`, HISTORY 에 `error` 한 줄 추가.

- [ ] **Step 1.0.10: verify.mjs 실행 (1.0 산출물 검증)**

```bash
node docs/_meta/enneagram/verify.mjs 1.0
```

기대 출력 — `OK: task 1.0 verified (7 files)`. 실패 시 출력된 모든 ERROR 를 수정 후 재실행.

- [ ] **Step 1.0.11: Commit + WORK_STATUS 갱신**

```bash
git add docs/_meta/enneagram/ docs/knowledge_base/ AGENTS.md .cursor/ CLAUDE.md
git commit -m "$(cat <<'EOF'
chore(enneagram-kb): bootstrap continuity infrastructure for Phase 1-5 auto-progression

Phase 1 task 1.0: continuity infrastructure bootstrap
Agent: claude-manual-bootstrap
Verify: OK 7 files

- Add docs/_meta/enneagram/ (CONTEXT, PHASE_PLAN, WORK_STATUS, HANDOFF, HISTORY, verify.mjs)
- Add AGENTS.md repo entry point + .cursor/rules/enneagram-work.mdc
- Patch CLAUDE.md with active automation banner
- Sync existing 4 KB files into worktree (untracked from main repo working dir)
- Schedule hard-auto resume via mcp__scheduled-tasks__ (6h cadence)
EOF
)"
```

WORK_STATUS.md 갱신 — `current_task = "1.1"`, 락 해제, `last_updated = now`. HISTORY.md 에 complete 한 줄 추가.

---

## 3. Task 1.1 — type_pair_disambiguation 24 템플릿 완성 + axis 컬럼

**Files:**
- Modify: `docs/knowledge_base/enneagram/complete_enneagram/type_pair_disambiguation.md`

**Inputs:**
- 기존 `type_pair_disambiguation.md` (12 템플릿 + 36 쌍 인덱스 + Appendix coverage)
- `complete_enneagram_kb.md` 의 9 type Diagnostic signals + Subtype index
- `source_page_index.md` 의 페이지 매핑

**Definition of Done:**
- [ ] 36 쌍 모두 A/B 템플릿 작성 (현재 12, 추가 24)
- [ ] 표 헤더에 `target_diagnostic_axis` 컬럼 추가 — 어느 진단 axis 가 결정 요소인지 (motivation / focus_of_attention / defense / shadow / passion / countertype 중 하나)
- [ ] 각 A/B 는 motivation 차이를 직접 묻는 형태 (행동 차이 X)
- [ ] 한국어 자연스러움 (CLAUDE.md 카피 가이드 따름)
- [ ] verify.mjs 1.1 통과
- [ ] commit + WORK_STATUS 갱신

### Steps

- [ ] **Step 1.1.1: 락 획득 + checkpoint_plan 설정**

WORK_STATUS.md 갱신 — `locked_task = "1.1"`, `lock_holder`, `lock_expires_at = now+30min`, `checkpoint_plan = ["1.1.1", "1.1.2", "1.1.3", "1.1.4", "1.1.5", "1.1.6"]`.

HISTORY.md 에 start 한 줄.

- [ ] **Step 1.1.2: 24 미완성 쌍 식별**

기존 파일의 "High-Value Tie-Breaker Templates" 섹션에 작성된 12 쌍 — 1v6, 1v8, 2v3, 2v9, 3v6, 3v9, 4v7, 5v7, 5v9, 6v8, 7v8, 8v9.

36 쌍 인덱스에서 위 12 를 빼면 24 미완성 쌍 — 1v2, 1v3, 1v4, 1v5, 1v7, 1v9, 2v4, 2v5, 2v6, 2v7, 2v8, 3v4, 3v5, 3v7, 3v8, 4v5, 4v6, 4v8, 4v9, 5v6, 5v8, 6v7, 6v9, 7v9.

- [ ] **Step 1.1.3: 24 템플릿 초안 작성**

각 쌍에 대해 다음 형식으로 작성. 36 쌍 인덱스 표의 `Primary split for testing` 컬럼이 1차 가이드. `complete_enneagram_kb.md` 의 두 type 의 `Diagnostic signals` 가 motivation 차이를 직접 표현하므로 그것을 한국어로 풀어쓴다.

```markdown
### 1 vs 2

- A: 내 안의 옳음 기준에 어긋난 것을 바로잡고 싶다는 마음이 먼저 작동한다.
- B: 가까운 사람의 마음과 필요를 채워 인정과 호감을 얻고 싶다는 마음이 먼저 작동한다.
- target_diagnostic_axis: motivation
```

작성 시 원칙.
- A/B 는 정확히 motivation 차이 (또는 axis 컬럼이 명시한 axis) 를 묻는다.
- 행동 묘사 (예 — "더 나은 방법을 찾는다") 만 쓰지 않는다. 동기 (예 — "옳음 기준에 맞추려는") 가 들어가야 한다.
- 한국어가 자연스럽고 30-60자 사이.
- 24 쌍 모두 동일 깊이.

24 쌍 작성 ID — 1.1.3.1 (1v2), 1.1.3.2 (1v3), ..., 1.1.3.24 (7v9). 매 쌍 완료 시 `WORK_STATUS.checkpoint = "1.1.3.<n>"`.

- [ ] **Step 1.1.4: 36 Pair Index 표에 axis 컬럼 추가**

기존.
```markdown
| Pair | PDF page | Primary split for testing |
|---|---:|---|
```

다음으로 변경.
```markdown
| Pair | PDF page | Primary split for testing | target_diagnostic_axis |
|---|---:|---|---|
```

각 행에 axis 추가. 가이드.
- 동기 차이가 핵심이면 `motivation`
- 주의가 어디로 가는지가 핵심이면 `focus_of_attention`
- 방어 메커니즘 차이면 `defense`
- 회피하는 것이 다르면 `shadow` (avoidance)
- countertype 효과가 큰 쌍은 `countertype`
- passion 차이가 핵심이면 `passion`

대부분의 쌍은 `motivation`. 1v6 (실수 vs 위험) 은 `focus_of_attention`. 1v8 (분노 통제 vs 분노 직접) 은 `defense`. 6v8 (Sexual 6 = countertype) 은 `countertype`.

- [ ] **Step 1.1.5: 12 기존 템플릿에도 axis 컬럼 추가**

각 기존 템플릿 (1v6, 1v8, ..., 8v9) 의 A/B 다음 줄에 `- target_diagnostic_axis: <axis>` 추가.

- [ ] **Step 1.1.6: 검증 + commit**

```bash
node docs/_meta/enneagram/verify.mjs 1.1
```

기대 — `OK: task 1.1 verified (1 files)`.

추가 자체 검증.
- 36 쌍 모두 템플릿 있음 — `grep -c '^### [0-9] vs [0-9]' docs/knowledge_base/enneagram/complete_enneagram/type_pair_disambiguation.md` 출력이 36
- axis 컬럼 빠짐없음 — `grep -c 'target_diagnostic_axis:' docs/knowledge_base/enneagram/complete_enneagram/type_pair_disambiguation.md` 출력이 36

```bash
git add docs/knowledge_base/enneagram/complete_enneagram/type_pair_disambiguation.md
git commit -m "docs(enneagram-kb): complete 36 tie-breaker templates with diagnostic axis"
```

WORK_STATUS — `current_task = "1.2"` (1.2/1.3/1.4 는 1.0 후 병렬 가능. 단일 Claude 는 순차 진행 — 1.2 다음).

---

## 4. Task 1.2 — centers_and_triads.md 신규

**Files:**
- Create: `docs/knowledge_base/enneagram/complete_enneagram/centers_and_triads.md`

**Inputs:**
- `source_page_index.md` (Ch.1 p20-43 = framework 챕터)
- `complete_enneagram_kb.md` (9 type 의 Center 컬럼)

**Definition of Done:**
- [ ] 80-150 줄 범위
- [ ] frontmatter + 한국어 헤더 코멘트
- [ ] (a) Body/Heart/Head Center 표 (b) Hornevian Triad (c) Harmonic Triad (d) 진단 1차 필터 사용 가이드 4 섹션 모두 존재
- [ ] 9 type 모두 3 triad 매핑 명시
- [ ] PDF 페이지 참조 포함, 직접 인용 0회
- [ ] verify.mjs 1.2 통과

### Steps

- [ ] **Step 1.2.1: 락 획득 + checkpoint_plan**

`checkpoint_plan = ["1.2.1", "1.2.2", "1.2.3", "1.2.4", "1.2.5"]`.

- [ ] **Step 1.2.2: 파일 작성**

Create `docs/knowledge_base/enneagram/complete_enneagram/centers_and_triads.md`.

```markdown
<!-- 9 유형의 Center / Hornevian / Harmonic triad 매핑. 진단 1차 필터로 활용 -->
---
kb_id: complete_enneagram.centers_and_triads
source_pdf: "/Users/Joeyswoo/Downloads/Complete_Enneagram.pdf"
source_chapter: "Chapter 1 - The Enneagram as a Framework"
source_pages: "p20-p43"
created_at: "2026-05-06"
title: "Centers and Triads — Diagnostic First Filter"
retrieval_tags:
  - centers
  - triads
  - hornevian
  - harmonic
  - first_filter
  - diagnostic_axes
---

# Centers and Triads — 진단 1차 필터

이 문서는 9 유형을 3 그룹으로 묶는 3 종류의 triad 를 정리합니다. 진단 초반에 사용자의 자동 반응이 어느 triad 에 속하는지 빠르게 짚으면 후보를 1/3 로 줄일 수 있습니다.

## 1. Center of Intelligence (3 Center)

각 type 은 신체-감정-사고 중 하나가 1차 자동 반응 채널.

| Center | Types | 핵심 자동 반응 | Underlying emotion | Source |
|---|---|---|---|---:|
| Body / Gut (본능) | 8, 9, 1 | 분노, 경계, 통제, 침범, 의지 | Anger | p25-p27 |
| Heart / Image (감정/이미지) | 2, 3, 4 | 인정, 호감, 가치, 비교, 정체성 | Shame | p27-p29 |
| Head / Fear (사고/두려움) | 5, 6, 7 | 위험, 분석, 가능성, 신뢰, 안전 | Fear | p29-p31 |

진단 1차 시그널 — 사용자가 압박을 받을 때 (a) 신체로 즉각 대응하는가 (b) 어떻게 보일지 먼저 신경 쓰는가 (c) 머리로 분석/계획하는가.

## 2. Hornevian Triad (대인관계 전략)

Karen Horney 에서 차용. 욕구 충족 시 타인 대상의 자동 전략.

| Triad | Types | 전략 | Source |
|---|---|---|---:|
| Assertive (능동) | 3, 7, 8 | against — 자기 욕구를 직접 추구, 환경을 자기 쪽으로 끌어옴 | p35-p36 |
| Compliant (순응) | 1, 2, 6 | toward — 의무, 충성, 도움을 통해 얻음 | p35-p36 |
| Withdrawn (철수) | 4, 5, 9 | away — 거리/내면으로 물러남, 직접 추구 회피 | p35-p36 |

진단 시그널 — "원하는 것이 있으면 어떻게 하는가" 질문에서 (a) 직접 밀고 나간다 (b) 부탁하거나 의무로 묶는다 (c) 일단 물러나서 혼자 한다.

## 3. Harmonic Triad (갈등/스트레스 대처)

Don Riso 에서 차용. 갈등 직면 시 자동 대처.

| Triad | Types | 대처 | Source |
|---|---|---|---:|
| Positive Outlook (긍정화) | 2, 7, 9 | 좋은 면을 보고 무거움을 떨쳐낸다 | p36-p38 |
| Reactive (감정 반응) | 4, 6, 8 | 즉각 감정 반응, 상대도 같은 강도로 끌어들인다 | p36-p38 |
| Competency (역량/논리) | 1, 3, 5 | 감정을 옆에 두고 논리/효율/기준으로 처리 | p36-p38 |

진단 시그널 — 갈등 상황 직후 사용자가 (a) 분위기를 풀려고 한다 (b) 즉각 강하게 반응한다 (c) 차분히 분석/조정한다.

## 4. Triad Cross-Map (9 type × 3 triad)

| Type | Center | Hornevian | Harmonic |
|---:|---|---|---|
| 1 | Body | Compliant | Competency |
| 2 | Heart | Compliant | Positive Outlook |
| 3 | Heart | Assertive | Competency |
| 4 | Heart | Withdrawn | Reactive |
| 5 | Head | Withdrawn | Competency |
| 6 | Head | Compliant | Reactive |
| 7 | Head | Assertive | Positive Outlook |
| 8 | Body | Assertive | Reactive |
| 9 | Body | Withdrawn | Positive Outlook |

## 5. 진단 1차 필터 사용법

테스트 도입부 (Phase 1-2 문항) 에서 다음 3 질문으로 후보 6 개로 좁힘.

1. **Center** — 압박/스트레스 시 1차 반응이 (a) 분노/경계 → 8, 9, 1 (b) 비교/이미지/거리감 → 2, 3, 4 (c) 위험/분석/가능성 → 5, 6, 7
2. **Hornevian** — 원하는 것이 있을 때 (a) 직접 추구 → 3, 7, 8 (b) 의무/도움/충성 → 1, 2, 6 (c) 거리 두고 혼자 → 4, 5, 9
3. **Harmonic** — 갈등 직면 시 (a) 좋은 면 보기/회피 → 2, 7, 9 (b) 즉각 강한 반응 → 4, 6, 8 (c) 논리/기준 → 1, 3, 5

세 질문의 교집합이 1-2 type. 그 결과를 Phase 2 의 deep 질문 후보로 활용.

## 6. Limitations

- Triad 만으로는 핵심 type 확정 불가. countertype 은 표면적으로 다른 triad 에 속한 것처럼 보일 수 있음 (특히 Sexual 6 = counterphobic, Social 9 = participation, Self-Pres 4 = tenacity).
- Triad 는 1차 필터 — 최종 판정은 motivation + defense + passion + subtype.

## 7. Search Tags

```yaml
center_triad:
  body_gut: [8, 9, 1, anger, instinct, body]
  heart_image: [2, 3, 4, shame, image, heart, identity]
  head_fear: [5, 6, 7, fear, head, thinking, anxiety]
hornevian:
  assertive: [3, 7, 8, against, push, direct]
  compliant: [1, 2, 6, toward, duty, loyalty, helping]
  withdrawn: [4, 5, 9, away, retreat, internal, fade]
harmonic:
  positive_outlook: [2, 7, 9, reframe, lighten, smooth]
  reactive: [4, 6, 8, intense, emotion, escalate]
  competency: [1, 3, 5, logic, efficiency, standard]
```
```

- [ ] **Step 1.2.3: verify.mjs 실행**

```bash
node docs/_meta/enneagram/verify.mjs 1.2
```

- [ ] **Step 1.2.4: Commit**

```bash
git add docs/knowledge_base/enneagram/complete_enneagram/centers_and_triads.md
git commit -m "feat(enneagram-kb): add Centers and Triads as diagnostic first filter"
```

- [ ] **Step 1.2.5: WORK_STATUS 갱신 + 락 해제**

`current_task = "1.3"`, 락 해제, HISTORY 에 complete.

---

## 5. Task 1.3 — type_wings.md 신규 (18 wing)

**Files:**
- Create: `docs/knowledge_base/enneagram/complete_enneagram/type_wings.md`

**Inputs:**
- `complete_enneagram_kb.md` (9 type archetype)
- `source_page_index.md` (page reference)

**Definition of Done:**
- [ ] 250-400 줄
- [ ] frontmatter + 한국어 헤더 코멘트 + retrieval_tags
- [ ] 18 wing 모두 동일 깊이 — (a) 핵심 변형 (b) 행동 시그니처 3 (c) 흔한 혼동 1-2 (d) 약/중/강 % 표현
- [ ] verify.mjs 1.3 통과

### Steps

- [ ] **Step 1.3.1: 락 + checkpoint_plan**

`checkpoint_plan = ["1.3.1", "1.3.2", "1.3.3", "1.3.4", "1.3.5", "1.3.6", "1.3.7", "1.3.8", "1.3.9", "1.3.10", "1.3.11"]`.

각 sub-step.
- 1.3.2 — 파일 헤더 + frontmatter 작성
- 1.3.3 — 1w9, 1w2 작성
- 1.3.4 — 2w1, 2w3 작성
- 1.3.5 — 3w2, 3w4 작성
- 1.3.6 — 4w3, 4w5 작성
- 1.3.7 — 5w4, 5w6 작성
- 1.3.8 — 6w5, 6w7 작성
- 1.3.9 — 7w6, 7w8 작성
- 1.3.10 — 8w7, 8w9 + 9w8, 9w1 작성
- 1.3.11 — % 강도 해석 가이드 + verify + commit

- [ ] **Step 1.3.2: 파일 헤더 작성**

Create `docs/knowledge_base/enneagram/complete_enneagram/type_wings.md`.

```markdown
<!-- 9 유형의 18 wing 조합 — 핵심 변형, 행동 시그니처, 혼동, % 강도 해석 -->
---
kb_id: complete_enneagram.type_wings
source_pdf: "/Users/Joeyswoo/Downloads/Complete_Enneagram.pdf"
created_at: "2026-05-06"
title: "Type Wings — 18 Wing Combinations"
retrieval_tags:
  - wings
  - 1w9
  - 1w2
  - 2w1
  - 2w3
  - 3w2
  - 3w4
  - 4w3
  - 4w5
  - 5w4
  - 5w6
  - 6w5
  - 6w7
  - 7w6
  - 7w8
  - 8w7
  - 8w9
  - 9w8
  - 9w1
  - wing_strength
---

# Type Wings — 18 Wing Combinations

각 코어 type 의 양옆 두 type 중 더 활성화된 쪽이 wing. 결과지 형식 — `<core>w<wing>(<%>)`. 예 — `7w8(50%)` = 7 코어, 8 윙, 강도 50%.

## Wing % 강도 해석 가이드 (전체 적용)

| % 범위 | 해석 |
|---:|---|
| 0-20% | 거의 무 wing. 코어 type 의 순수 표현이 우세. |
| 21-40% | 약 wing. 코어 색이 80% 이상, wing 은 보조 색. |
| 41-60% | 중 wing. 코어 + wing 이 함께 작동, 표현이 혼합. |
| 61-80% | 강 wing. wing 이 코어를 깊게 변형. 한쪽 wing 만 활성. |
| 81-100% | 매우 강. 종종 wing 의 type 으로 오진단됨. countertype 가능성 점검. |

% 는 두 wing 간 상대 강도. 예 — `7w8(50%)` 는 7 의 양 wing 중 8쪽이 50% (즉 6쪽이 50%) 가 아니라, 7의 8 wing 활성도가 약-중간임. 상세 계산식은 Phase 3 에서 정의.

## 1w9 — 차분한 이상주의자

- 핵심 변형 — 1 의 기준/옳음에 9 의 평온/거리/포용이 더해져, 분노가 직접 표출되기보다 절제된 비판/철학적 사색으로 나타남.
- 행동 시그니처 1 — 시스템/원칙을 글이나 이론으로 정리하려는 경향이 강함.
- 행동 시그니처 2 — 갈등 시 큰소리 대신 침묵, 거리, 사색적 후퇴.
- 행동 시그니처 3 — 객관성과 공정성을 매우 강조, 감정적 호소를 의심.
- 흔한 혼동 — Type 5 (분석/거리). 차이 — 1w9 는 옳음/기준이 동기, 5 는 자원 보존이 동기.
- 약/중/강 차이 — 약 (10-20%): 거의 순수한 1, 약간 더 절제됨. 중 (40-50%): 1의 비판이 글/이론으로 표현. 강 (70-80%): 학자/사색가/은둔자 같은 인상, 정의/공정성 추구가 핵심 표현 통로.

## 1w2 — 변호하는 개혁가

- 핵심 변형 — 1 의 기준/개선에 2 의 관계/도움이 더해져, 비판이 사람을 위한 옹호로 표현됨. 따뜻해 보이지만 내적 기준은 엄격.
- 행동 시그니처 1 — 약자나 잘못된 대우를 받는 사람을 위해 강하게 나섬.
- 행동 시그니처 2 — 가르침/멘토링/조언이 자연스러움.
- 행동 시그니처 3 — 자기는 도와도 도움 받기 어색, 의무감으로 헌신.
- 흔한 혼동 — Type 2. 차이 — 1w2 는 옳음을 위해 도움, 2 는 인정/관계를 위해 도움.
- 약/중/강 — 약 (10-20%): 거의 순수 1, 가끔 따뜻한 멘토링. 중 (40-50%): 옹호가가 되어 사회/관계 개선에 적극. 강 (70-80%): 활동가/교사/사회운동가 인상, 도덕적 분개가 따뜻함과 결합.

## 2w1 — 봉사하는 조력자

- 핵심 변형 — 2 의 도움/관계에 1 의 기준/책임이 더해져, 봉사가 의무/올바름의 색을 띰. 더 신중하고 자기 절제적.
- 행동 시그니처 1 — 도움이 옳은 방식인지 점검, 즉흥적 친절보다 계획된 헌신.
- 행동 시그니처 2 — 자기 비판이 강함, 더 도왔어야 했다는 죄책감.
- 행동 시그니처 3 — 따뜻함이 절제되어 있음, 감정 폭발 적음.
- 흔한 혼동 — Type 1, 6. 차이 — 2w1 은 관계/사람이 동기 핵, 1 은 옳음, 6 은 안전.
- 약/중/강 — 약: 거의 순수 2. 중: 봉사가/간호사/교사 인상, 의무로 도움. 강: 사회복지/종교적 헌신, 자기 희생 강도 큼.

## 2w3 — 매력적인 호스트

- 핵심 변형 — 2 의 관계/도움에 3 의 성과/이미지가 더해져, 사교성과 영향력이 강해짐. 더 외향적, 더 야심.
- 행동 시그니처 1 — 인맥과 영향력을 만드는 데 능함.
- 행동 시그니처 2 — 도움 + 매력 + 가시적 성과를 통해 가치 확인.
- 행동 시그니처 3 — 감정적 호소 + 성공의 이미지 동시 사용.
- 흔한 혼동 — Type 3. 차이 — 2w3 은 관계로 영향, 3 은 성과 자체로 영향.
- 약/중/강 — 약: 거의 순수 2. 중: 호스티스/매니저 같은 영향력 + 따뜻함. 강: 정치인/판매자/멘토 인상, 카리스마 + 헌신.

## 3w2 — 매력적인 성취자

- 핵심 변형 — 3 의 성과/이미지에 2 의 관계/매력이 더해져, 더 친화적이고 사람들과의 연결을 통해 성공.
- 행동 시그니처 1 — 팀워크/관계망에서 빛남.
- 행동 시그니처 2 — 자기 자랑이 부드럽게 포장됨, 매력적.
- 행동 시그니처 3 — 다른 사람의 인정이 매우 중요, 거절에 민감.
- 흔한 혼동 — Type 2w3. 차이 — 3w2 는 성과가 1차 동력, 2w3 은 관계가 1차.
- 약/중/강 — 약: 거의 순수 3, 약간 친화. 중: 영업/리더십에서 빛나는 매력적 성취자. 강: 셀럽/연예인 인상, 사람 매력 + 성공이 결합.

## 3w4 — 진중한 전문가

- 핵심 변형 — 3 의 성과에 4 의 진정성/깊이가 더해져, 단순한 성공보다 의미 있는 작업/예술/장인 정신.
- 행동 시그니처 1 — 분야의 깊은 전문성을 추구.
- 행동 시그니처 2 — 성과에 미적/감정적 차원 부여.
- 행동 시그니처 3 — 자기 표현/자기 브랜딩에 신중, 깊이 있어 보이려 함.
- 흔한 혼동 — Type 4. 차이 — 3w4 는 결과물/성과가 핵심, 4 는 정체성/감정이 핵심.
- 약/중/강 — 약: 거의 순수 3, 약간 진중. 중: 예술가/디자이너/작가 인상, 깊이 + 성공. 강: 천재 예술가 이미지, 고독한 장인 정신.

## 4w3 — 표현하는 예술가

- 핵심 변형 — 4 의 깊이/진정성에 3 의 이미지/성과가 더해져, 자기 감정을 작품/표현으로 외부화. 더 야심 있고 외향적.
- 행동 시그니처 1 — 자기 감정과 정체성을 작품/이미지로 표현하려는 충동.
- 행동 시그니처 2 — 우울/감정의 강도를 매력으로 변환.
- 행동 시그니처 3 — 성공과 인정도 욕구하나, 평범한 성공은 거부.
- 흔한 혼동 — Type 3w4. 차이 — 4w3 은 감정/정체성이 핵심, 3w4 는 성과가 핵심.
- 약/중/강 — 약: 거의 순수 4, 약간 외향. 중: 예술가/패션/공연 인상. 강: 강렬한 자기 표현가, 드라마틱 페르소나.

## 4w5 — 사색적 보헤미안

- 핵심 변형 — 4 의 감정에 5 의 분석/거리가 더해져, 더 내성적이고 지적. 자기 감정을 관찰자로 들여다봄.
- 행동 시그니처 1 — 혼자 있는 시간이 많고 깊이 사색.
- 행동 시그니처 2 — 자기 감정을 글/이론으로 분해.
- 행동 시그니처 3 — 사회적 노출 적음, 소수와 깊은 관계.
- 흔한 혼동 — Type 5w4. 차이 — 4w5 는 감정이 1차 (분석은 도구), 5w4 는 분석이 1차 (감정은 부산물).
- 약/중/강 — 약: 거의 순수 4, 약간 내성. 중: 시인/철학자/내향 예술가 인상. 강: 은둔/심층 사색가, 일상 기능 어려울 수 있음.

## 5w4 — 창의적 사색가

- 핵심 변형 — 5 의 분석/거리에 4 의 감정/미적 감각이 더해져, 사고가 창의/예술적. 지적이지만 색채 있음.
- 행동 시그니처 1 — 학술 + 예술 영역 가로지름.
- 행동 시그니처 2 — 독창적 관점, 주류와 다른 시각.
- 행동 시그니처 3 — 사회 부적응, 외로움 자각.
- 흔한 혼동 — Type 4w5. 차이 위 4w5 참조.
- 약/중/강 — 약: 거의 순수 5, 약간 창의. 중: 학자/연구자 + 시인 결합. 강: 천재 + 기인, 주류와 거리.

## 5w6 — 문제 해결사

- 핵심 변형 — 5 의 분석에 6 의 위험 검토/충성이 더해져, 더 실용적이고 시스템 지향. 회의적이지만 협력 가능.
- 행동 시그니처 1 — 시스템/엔지니어링/연구에 강함.
- 행동 시그니처 2 — 권위/조직에 비판적이지만 좋은 시스템에는 충성.
- 행동 시그니처 3 — 데이터와 절차로 안전 확보.
- 흔한 혼동 — Type 6w5. 차이 — 5w6 은 자급자족이 1차, 6w5 는 안전 동맹이 1차.
- 약/중/강 — 약: 거의 순수 5, 약간 실용. 중: 엔지니어/분석가/연구자 인상. 강: 시스템 비판가/내부고발자 같은 강도.

## 6w5 — 충성스런 분석가

- 핵심 변형 — 6 의 위험/충성에 5 의 분석/거리가 더해져, 더 신중하고 내향. 데이터 기반으로 신뢰 구축.
- 행동 시그니처 1 — 결정 전 충분한 분석/연구.
- 행동 시그니처 2 — 가까운 소수와 깊은 충성.
- 행동 시그니처 3 — 권위에 회의적이나 좋은 권위에는 헌신.
- 흔한 혼동 — Type 5w6. 차이 위 5w6 참조.
- 약/중/강 — 약: 거의 순수 6, 약간 분석적. 중: 학자/연구자/관료 인상. 강: 음모론/대안 미디어 같은 강한 회의.

## 6w7 — 사교적 안정 추구자

- 핵심 변형 — 6 의 안전에 7 의 가능성/즐거움이 더해져, 더 외향적이고 낙관적. 불안을 사교/유머로 풀어냄.
- 행동 시그니처 1 — 친구/그룹 안에서 안전 확보.
- 행동 시그니처 2 — 농담과 즐거움으로 긴장 해소.
- 행동 시그니처 3 — 모험은 그룹 단위로.
- 흔한 혼동 — Type 7w6. 차이 — 6w7 은 안전이 1차 (즐거움은 보조), 7w6 은 즐거움이 1차 (안전은 보조).
- 약/중/강 — 약: 거의 순수 6, 약간 사교적. 중: 친근한 회의주의자, 그룹의 윤활제. 강: 외향적 친화가, 두려움이 표면적으로 드러나지 않음.

## 7w6 — 충실한 모험가

- 핵심 변형 — 7 의 가능성에 6 의 신뢰/관계가 더해져, 친구/그룹과 함께 모험. 더 따뜻하고 책임감.
- 행동 시그니처 1 — 가까운 사람들과의 즐거움 우선.
- 행동 시그니처 2 — 약속을 지키려 노력 (7 보다).
- 행동 시그니처 3 — 모험 + 동시 계획/안전망 구축.
- 흔한 혼동 — Type 6w7. 차이 위 6w7 참조.
- 약/중/강 — 약: 거의 순수 7, 약간 책임감. 중: 친근한 모험가/팀 리더. 강: 사회 운동가 / 자선 활동가 (Social 7 = Sacrifice countertype 가능).

## 7w8 — 강력한 추진가

- 핵심 변형 — 7 의 가능성에 8 의 힘/통제가 더해져, 더 야심 있고 직접적. 비전을 실행으로 밀어붙임.
- 행동 시그니처 1 — 큰 그림 + 강한 실행력.
- 행동 시그니처 2 — 장애물에 부딪히면 정면 돌파.
- 행동 시그니처 3 — 즐거움과 권력 모두 추구.
- 흔한 혼동 — Type 8w7. 차이 — 7w8 은 가능성/즐거움이 1차, 8w7 은 통제/힘이 1차.
- 약/중/강 — 약: 거의 순수 7. 중: 기업가/CEO 인상. 강: 카리스마적 비전가/리더, 7 의 회피 vs 8 의 침범 양면.

## 8w7 — 자유로운 권력가

- 핵심 변형 — 8 의 힘/통제에 7 의 가능성/즐거움이 더해져, 더 외향적이고 모험적. 권력 + 자유 동시 추구.
- 행동 시그니처 1 — 큰 비전 + 빠른 실행.
- 행동 시그니처 2 — 즐거움 + 영향력 모두 욕망.
- 행동 시그니처 3 — 위험 무릅쓰는 사업가/창업자 기질.
- 흔한 혼동 — Type 7w8. 차이 위 7w8 참조.
- 약/중/강 — 약: 거의 순수 8. 중: 사업가/리더/모험가 인상. 강: 정복자/제국 건설자 이미지.

## 8w9 — 차분한 보호자

- 핵심 변형 — 8 의 힘/통제에 9 의 평온/포용이 더해져, 더 차분하고 위엄. 힘이 직접 행사되기보다 존재감으로.
- 행동 시그니처 1 — 조용한 권위, 적은 말로 영향력.
- 행동 시그니처 2 — 가족/팀을 보호하는 가장 같은 역할.
- 행동 시그니처 3 — 분노가 잠복했다가 한 번에 분출.
- 흔한 혼동 — Type 9w8. 차이 — 8w9 은 힘/통제가 1차 (평온은 보조), 9w8 은 평화/조화가 1차 (힘은 보호용).
- 약/중/강 — 약: 거의 순수 8. 중: 침묵의 가장/리더. 강: 조용한 거인, 폭발 시 압도적.

## 9w8 — 행동하는 평화주의자

- 핵심 변형 — 9 의 평화/조화에 8 의 힘/직접성이 더해져, 더 단호하고 자기 주장 가능. 보호 본능 강함.
- 행동 시그니처 1 — 평소엔 부드러우나 부당함에는 단호.
- 행동 시그니처 2 — 자기 영역과 가까운 이를 보호.
- 행동 시그니처 3 — 9 의 무기력보다 행동력 있음.
- 흔한 혼동 — Type 8w9. 차이 위 8w9 참조.
- 약/중/강 — 약: 거의 순수 9. 중: 부드러우면서 단호한 가장/조정자. 강: 환경 운동가 / 시민 활동가 (가까이는 부드러움).

## 9w1 — 원칙 있는 중재자

- 핵심 변형 — 9 의 조화에 1 의 기준/올바름이 더해져, 더 도덕적이고 책임감. 평화를 위해 옳은 일을 함.
- 행동 시그니처 1 — 갈등 조정에서 공정성 추구.
- 행동 시그니처 2 — 의무와 책임을 무겁게 받아들임.
- 행동 시그니처 3 — 분노 표현이 절제됨, 도덕적 분개로 대체.
- 흔한 혼동 — Type 1w9. 차이 — 9w1 은 평화/조화가 1차 (옳음은 평화 유지 도구), 1w9 은 옳음이 1차 (평온은 부산물).
- 약/중/강 — 약: 거의 순수 9. 중: 교사/조정자 인상. 강: 종교적 인물/평화 운동가 같은 도덕적 권위.

## Search Tags

```yaml
type_wings:
  1w9: [calm, philosophical, restrained, reformer, scholar]
  1w2: [warm, advocate, mentor, helper_reformer]
  2w1: [dutiful, helper, modest, servant, careful]
  2w3: [charming, host, networker, ambitious_helper]
  3w2: [charming_achiever, sales, leader, friendly_winner]
  3w4: [serious, professional, artist, expert, refined]
  4w3: [expressive, artist, dramatic, ambitious_creative]
  4w5: [introspective, bohemian, recluse, philosopher_artist]
  5w4: [creative, intellectual, eccentric, original]
  5w6: [problem_solver, engineer, system, practical]
  6w5: [analytical, loyal, cautious, scholar]
  6w7: [sociable, lighthearted, group, anxious_friendly]
  7w6: [loyal_adventurer, friendly, responsible_explorer]
  7w8: [powerful, ambitious, executive, visionary]
  8w7: [free, charismatic, entrepreneur, conqueror]
  8w9: [calm_protector, quiet_authority, patriarch]
  9w8: [active_peacemaker, protector, decisive_calm]
  9w1: [principled_mediator, dutiful_calm, moral]
```
```

(파일 끝)

- [ ] **Step 1.3.3-1.3.10: 18 wing 작성**

위 step 1.3.2 의 파일 본문에 모두 포함됨. 만약 작성 중 토큰 리밋 가까워지면 sub-step 단위로 부분 commit + WORK_STATUS.checkpoint 갱신.

- [ ] **Step 1.3.11: verify + commit**

```bash
node docs/_meta/enneagram/verify.mjs 1.3
```

기대 — `OK: task 1.3 verified (1 files)`.

추가 자체 검증.
- 18 wing 헤더 — `grep -c '^## [0-9]w[0-9]' docs/knowledge_base/enneagram/complete_enneagram/type_wings.md` 출력이 18

```bash
git add docs/knowledge_base/enneagram/complete_enneagram/type_wings.md
git commit -m "feat(enneagram-kb): add 18 type wings with depth and strength interpretation"
```

WORK_STATUS — `current_task = "1.4"`.

---

## 6. Task 1.4 — instinct_stacks.md 신규 (6 stack)

**Files:**
- Create: `docs/knowledge_base/enneagram/complete_enneagram/instinct_stacks.md`

**Inputs:**
- `source_page_index.md` (Ch.1 instinct, p32-40)
- `complete_enneagram_kb.md` (27 subtype index)

**Definition of Done:**
- [ ] 150-250 줄
- [ ] frontmatter + 한국어 헤더 + retrieval_tags
- [ ] 6 stack 모두 (a) 1차/2차/3차 상호작용 (b) blind/repressed (3차) 빈자리 패턴 (c) % 강도 해석
- [ ] verify.mjs 1.4 통과

### Steps

- [ ] **Step 1.4.1: 락 + checkpoint_plan**

`checkpoint_plan = ["1.4.1", ..., "1.4.5"]`.

- [ ] **Step 1.4.2: 파일 작성**

Create `docs/knowledge_base/enneagram/complete_enneagram/instinct_stacks.md`.

```markdown
<!-- 6 본능 스택 (sp/sx/so 의 6 순열) — 1/2/3차 상호작용, blind 본능, % 강도 해석 -->
---
kb_id: complete_enneagram.instinct_stacks
source_pdf: "/Users/Joeyswoo/Downloads/Complete_Enneagram.pdf"
created_at: "2026-05-06"
title: "Instinct Stacks — 6 Permutations and Blind Patterns"
retrieval_tags:
  - instinct
  - stack
  - sp
  - sx
  - so
  - blind_instinct
  - repressed_instinct
  - stack_strength
---

# Instinct Stacks — 6 본능 스택과 Blind 패턴

모든 사람은 sp/sx/so 세 본능을 모두 갖되 강도가 다름. 결과지 형식 — `sx(80%) so(60%) sp(10%)`. % 는 각 본능의 절대 강도 (서로 합 100% 아님). 가장 강한 게 1차 (dominant), 가장 약한 게 3차 (blind/repressed).

## 본능 정의 (재확인)

| 본능 | 핵심 관심 | Source |
|---|---|---:|
| sp (self-preservation) | 신체적 안전, 자원, 일상 안정, 경계 | p32-p34 |
| sx (sexual / one-to-one) | 강렬한 1:1 연결, 매력, 융합, 강도 | p34-p36 |
| so (social) | 집단, 역할, 소속, 지위, 기여 | p36-p38 |

본 프로젝트에서 27 subtype 은 `core type × dominant instinct` (1차 본능). Stack 은 1/2/3차 순서로 — 6 가지 순열.

## % 강도 해석 (전체 적용)

| 절대 % | 해석 |
|---:|---|
| 80-100 | 매우 강한 표현. 일상에서 자주 작동. 1차 본능 후보. |
| 60-79 | 강한 표현. 1-2차 본능 권역. |
| 40-59 | 중간. 보조 본능 (2차) 가능성. |
| 20-39 | 약. 의식적 발달 노력 필요. |
| 0-19 | 매우 약. 3차 (blind) 본능. 자기는 잘 못 봄. |

## 6 Stack

### 1. sp/sx/so — 신체-친밀, 사회 무관

- 1차 sp — 자원/안전/안락이 최우선. 일상 루틴, 식사, 수면, 재정.
- 2차 sx — 가까운 1:1 관계에서 강렬함. 소수의 깊은 관계.
- 3차 so (blind) — 그룹 정치/지위/역할에 무관심. 사회적 상호작용에서 피곤. 큰 모임 회피.
- Blind 패턴 — 직장/조직의 정치 흐름을 못 읽거나 무시함. 그룹 내 자기 위치를 신경 쓰지 않아 손해 볼 수 있음.

### 2. sp/so/sx — 신체-사회, 친밀 무관

- 1차 sp — 자원/안전/구조가 우선.
- 2차 so — 그룹/역할/기여로 안정 강화.
- 3차 sx (blind) — 강렬한 1:1 친밀에 거리. 깊은 융합/강도 회피.
- Blind 패턴 — 연애/배우자 관계에서 정서적 거리. 강한 매력/끌림이 어색. 친구가 가족보다 가까운 경우 많음.

### 3. sx/sp/so — 친밀-신체, 사회 무관

- 1차 sx — 한 사람, 한 대상에게 강렬한 몰입.
- 2차 sp — 그 대상과의 안정/일상 확보.
- 3차 so (blind) — 그룹 차원에 무관심. "둘이 잘 지내면 그만".
- Blind 패턴 — 부부/연인이 사회적 모임 회피, 사회적 책임/역할 약함.

### 4. sx/so/sp — 친밀-사회, 신체 무관

- 1차 sx — 강렬한 1:1 + 심리적 강도.
- 2차 so — 그 강도를 사회/관계로 확장 (예 — 영향력 있는 관계망).
- 3차 sp (blind) — 자기 신체/자원/일상 관리 약함. 자기 돌봄 부족, 재정 무관심.
- Blind 패턴 — 강렬한 관계와 사회적 연결에 몰두하다 자기 건강/일상이 무너짐.

### 5. so/sp/sx — 사회-신체, 친밀 무관

- 1차 so — 그룹/역할/기여가 정체성의 핵.
- 2차 sp — 그 역할 안에서의 안정/자원 확보.
- 3차 sx (blind) — 강렬한 1:1 친밀에 거리. "공적 자기" 강하고 "사적 자기" 약함.
- Blind 패턴 — 배우자/연인 관계가 형식적이거나 정서적으로 얕음. 사적 강도 어색.

### 6. so/sx/sp — 사회-친밀, 신체 무관

- 1차 so — 그룹/역할/기여.
- 2차 sx — 그 안에서 영향력 있는 1:1 관계 (멘토, 동지) 형성.
- 3차 sp (blind) — 자기 신체/자원 관리 약함. 사회적 사명에 헌신하다 자기 소진.
- Blind 패턴 — 활동가/리더 인상이지만 개인 일상이 엉망. 자기 돌봄을 죄책감으로 봄.

## Stack 진단 시그널 요약

| 1차 | 2차 | 시그널 |
|---|---|---|
| sp | sx | "두 사람 + 안락한 공간" |
| sp | so | "안정된 가정 + 신뢰 그룹" |
| sx | sp | "단 한 사람 + 우리만의 공간" |
| sx | so | "강한 끌림 + 영향력" |
| so | sp | "역할 + 안정" |
| so | sx | "사명 + 핵심 동지" |

## Blind Instinct 활용

3차 본능은 보통 본인이 자각 못 함. Phase 2 의 본능 문항에서 3차 본능 항목에 "낮은 점수" 가 일관되게 나오면 그 본능이 blind. 결과지에서 약하게 표시 (예 — `sp(10%)`) + Phase 5 결과지에서 성장 영역으로 제시.

## 본능 강도 % 산출 (Phase 3 정의 예고)

기본식 (현재 test.js 의 단순 합산을 정밀화).

```
raw_inst[i] = Σ(본능 i 문항 점수) + 본능 i 가 활성된 typeCue 보너스
norm_inst[i] = raw_inst[i] / max_possible_inst[i]
display_inst[i] = round(norm_inst[i] * 100)
```

3 본능의 display % 는 독립적 (서로 합 100% 아님). dominant 결정은 max(display_inst). 본 식의 details + tuning 은 Phase 3 에서.

## Search Tags

```yaml
instinct_stacks:
  sp_sx_so: [sp_dominant, sx_secondary, so_blind, body_intimate]
  sp_so_sx: [sp_dominant, so_secondary, sx_blind, body_social]
  sx_sp_so: [sx_dominant, sp_secondary, so_blind, intimate_body]
  sx_so_sp: [sx_dominant, so_secondary, sp_blind, intimate_social]
  so_sp_sx: [so_dominant, sp_secondary, sx_blind, social_body]
  so_sx_sp: [so_dominant, sx_secondary, sp_blind, social_intimate]
blind_patterns:
  so_blind: [politics_oblivious, group_avoidance, role_unclear]
  sx_blind: [intimacy_distant, intensity_avoidance, formal_relations]
  sp_blind: [self_neglect, finance_neglect, body_neglect]
```
```

- [ ] **Step 1.4.3: verify**

```bash
node docs/_meta/enneagram/verify.mjs 1.4
```

- [ ] **Step 1.4.4: Commit**

```bash
git add docs/knowledge_base/enneagram/complete_enneagram/instinct_stacks.md
git commit -m "feat(enneagram-kb): add 6 instinct stacks with blind instinct patterns"
```

- [ ] **Step 1.4.5: WORK_STATUS 갱신**

`current_task = "1.5"`.

---

## 7. Task 1.5 — korean_test_copy_guide.md 신규

**Files:**
- Create: `docs/knowledge_base/enneagram/complete_enneagram/korean_test_copy_guide.md`

**Inputs:**
- `complete_enneagram_kb.md`, `type_pair_disambiguation.md`, `type_wings.md`, `instinct_stacks.md`, `centers_and_triads.md`
- 기존 `js/test.js` 의 한국어 문항 (참고용)

**Definition of Done:**
- [ ] 200-320 줄
- [ ] frontmatter + 한국어 헤더 + retrieval_tags
- [ ] (a) 추상→일상 번역 30 패턴 (b) 27 subtype 한국어 시드 단어 (c) 금기 표현 5+ (d) before-after 10 예시
- [ ] verify.mjs 1.5 통과

### Steps

- [ ] **Step 1.5.1: 락 + checkpoint_plan**

`checkpoint_plan = ["1.5.1", "1.5.2", "1.5.3", "1.5.4", "1.5.5"]`.

- [ ] **Step 1.5.2: 파일 작성**

Create `docs/knowledge_base/enneagram/complete_enneagram/korean_test_copy_guide.md`.

본문 구조 — 4 섹션.

**섹션 1 — 추상→일상 번역 30 패턴.** Chestnut 의 영어 진단 개념 (motivation, defense, focus_of_attention, passion, avoidance) 을 한국어 일상 장면으로. 표 — `Chestnut term | 한국어 일상 표현`. 30 행.

예시.
```
| Chestnut term | 한국어 일상 표현 |
|---|---|
| Anger (Type 1 passion) | 답답함, 정정해야 한다는 압력, 짜증나는 기준 미달 |
| Pride (Type 2 passion) | "나는 도와주는 게 편해", "내가 필요한 사람이고 싶어" |
| Vanity (Type 3 passion) | 못나 보이는 게 무서움, 빠르게 보여줘야 함 |
| Envy (Type 4 passion) | 나만 빠진 느낌, 나는 평범하면 안 됨 |
| Avarice (Type 5 passion) | 침범당하면 닫힘, 에너지 새는 게 두려움 |
| Fear (Type 6 passion) | 위험 빠진 거 없나, 진짜 믿을 수 있나 |
| Gluttony (Type 7 passion) | 답답하면 다른 데로, 옵션이 닫히는 게 싫어 |
| Lust (Type 8 passion) | 약해 보이기 싫음, 통제당하면 즉시 받아침 |
| Sloth (Type 9 passion) | 갈등 싫어 미루기, 내 욕구가 잘 안 보임 |
| Reaction Formation (Type 1 defense) | 화가 나도 기준에 맞춰 정리해 표현 |
| Repression (Type 2 defense) | 내 욕구를 미뤄두고 상대 욕구부터 |
| Identification (Type 3 defense) | 성공한 모습이 '진짜 나' 라고 느낌 |
| Introjection (Type 4 defense) | 결핍이 곧 나의 정체성 |
| Isolation (Type 5 defense) | 감정/욕구를 사고로 분리해 거리 |
| Projection (Type 6 defense) | 내 불안을 외부 위협으로 봄 |
| Rationalization (Type 7 defense) | 무거운 감정을 좋은 면으로 재해석 |
| Denial (Type 8 defense) | 약함/취약함을 부정 |
| Dissociation (Type 9 defense) | 자기에서 멀어져 환경으로 흡수 |
| Focus of attention | 무엇이 먼저 눈에 들어오는가 |
| Avoidance | 무엇을 피하려 자동 반응하는가 |
| Countertype | 같은 type 인데 정반대로 보이는 모습 |
| Self-Preservation instinct | 안락, 자원, 일상, 안전 |
| Sexual instinct (one-to-one) | 단 한 사람, 강렬, 몰입, 융합 |
| Social instinct | 그룹, 역할, 소속, 기여 |
| Stress arrow | 압박 시 자동으로 가는 다른 type 의 모습 |
| Growth arrow | 건강할 때 발현되는 다른 type 의 자질 |
| Wing | 양옆 type 중 더 활성화된 색깔 |
| Hornevian: Assertive | 원하는 것을 직접 끌어옴 |
| Hornevian: Compliant | 의무/도움/충성으로 얻음 |
| Hornevian: Withdrawn | 일단 물러남 |
```

**섹션 2 — 27 subtype 한국어 시드 단어.** 표 — `Subtype | 핵심 시드 단어 3-5개`. 27 행. 예 — `Self-Pres 9 (Appetite) | 식사, 루틴, 안락, 익숙함, 자기달램` ; `Sexual 6 (Strength/Beauty, countertype) | 정면돌파, 강한 인상, 매력, 두려움 마주함, 도전`.

**섹션 3 — 금기 표현.** 5+ 항목 + 이유 + 대체 표현.

```
| 금기 | 이유 | 대체 |
|---|---|---|
| "당신은 ~형입니다" (확정) | 낙인/결정론 | "현재 응답은 ~형 가까이" |
| "건강한 N형 / 안 건강한 N형" | 건강 등급 도덕화 | "통합 / 비통합 방향" |
| "원래 그래" | 변화 가능성 부정 | "지금 자동 반응이 ~" |
| 종교/영성 단정 ("죄성") | ER 은 기독교 코칭이지만 진단지는 종교 중립 | 가치 중립 표현 |
| 성별/연령 가정 | 다양성 보장 | 일반 표현 |
```

**섹션 4 — before-after 10 예시.** 진단 문항의 나쁜→좋은 변환. 표 — `before | after | 변환 이유`.

예시.
```
| before | after | 이유 |
|---|---|---|
| "당신은 분노가 많은 사람입니까" | "어떤 일이 잘못됐다고 느낄 때 답답함이 빠르게 올라오는 편이다" | 1) 낙인 제거 2) 동기 (옳음 기준) 표현 3) 일상 장면 |
| "사람들을 도와주는 것을 좋아합니까" | "사람의 필요를 빠르게 읽고 먼저 채워 주려 하지만, 내가 도와달라고 말하는 건 어색하다" | Type 2 의 핵심은 비대칭 (받는 것의 어색함). 이걸 직접 묻는다. |
| "당신은 야망이 큰가요" | "내가 가진 게 아니라 내가 만든 결과로 가치가 정해진다고 느낄 때가 있다" | 야망/이미지 표면이 아니라 vanity (정체성 = 성과) 의 motivation 직접 질문 |
... (총 10)
```

상세 작성은 task 실행자 재량. 각 예시는 (a) 표면 행동 묻는 나쁜 문항 → (b) motivation/defense/avoidance 묻는 좋은 문항 + 변환 이유 명시.

- [ ] **Step 1.5.3: verify**

```bash
node docs/_meta/enneagram/verify.mjs 1.5
```

- [ ] **Step 1.5.4: Commit**

```bash
git add docs/knowledge_base/enneagram/complete_enneagram/korean_test_copy_guide.md
git commit -m "feat(enneagram-kb): add Korean test copy guide with 30 patterns and 10 before-after examples"
```

- [ ] **Step 1.5.5: WORK_STATUS 갱신**

`current_task = "1.6"`.

---

## 8. Task 1.6 — complete_enneagram_kb.md 보강

**Files:**
- Modify: `docs/knowledge_base/enneagram/complete_enneagram/complete_enneagram_kb.md`

**Inputs:**
- 기존 파일 (390 줄)
- `centers_and_triads.md`

**Definition of Done:**
- [ ] Diagnostic Axes 표에 state vs trait 행 1개 추가
- [ ] Triad 1줄 포인터 추가 (`See centers_and_triads.md`)
- [ ] 다른 구조 변경 없음 (diff 깔끔)
- [ ] verify.mjs 1.6 통과

### Steps

- [ ] **Step 1.6.1: 락 + 1줄 plan**

`checkpoint_plan = ["1.6.1", "1.6.2"]`.

- [ ] **Step 1.6.2: 보강 + commit**

`complete_enneagram_kb.md` 의 "Core Diagnostic Axes" 표에 행 추가 (현재 8 행 → 9 행).

기존 표 마지막 행.
```markdown
| Pair differentiation | 유사 타입 구분. tie-breaker 문항 설계에 직접 사용 | Appendix p472-p517 |
```

이 행 다음에 추가.
```markdown
| State vs Trait | 일시적 (스트레스/통합 화살표 활성, 최근 사건) vs 안정적 (core type). 진단 시 state 가 trait 으로 오인되지 않도록 분리 | type chapter work sections |
| Centers & Triads (1차 필터) | Body/Heart/Head + Hornevian + Harmonic. 후보 6개로 좁히는 1차 그물. See `centers_and_triads.md` | p20-p43 |
```

```bash
node docs/_meta/enneagram/verify.mjs 1.6
git add docs/knowledge_base/enneagram/complete_enneagram/complete_enneagram_kb.md
git commit -m "docs(enneagram-kb): add state-vs-trait and triad pointer to Diagnostic Axes"
```

WORK_STATUS — `current_task = "1.7"`.

---

## 9. Task 1.7 — README.md 갱신 (목차 + retrieval 동선)

**Files:**
- Modify: `docs/knowledge_base/enneagram/complete_enneagram/README.md`

**Inputs:**
- 기존 README.md
- 신규 4 파일 + 보강 1 파일

**Definition of Done:**
- [ ] 파일 구성 표에 신규 4 파일 추가 (총 7행)
- [ ] 빠른 검색 예시에 wing/stack/triad 항목 추가 (총 6 예시)
- [ ] 에이전트 사용 규칙에 wing/stack/triad 검색 동선 1줄
- [ ] verify.mjs 1.7 통과

### Steps

- [ ] **Step 1.7.1: 락 + 작성**

기존 README.md "파일 구성" 섹션.

```markdown
## 파일 구성

- [source_page_index.md](./source_page_index.md): PDF 메타데이터, 장별 페이지 범위, 장 내부 섹션 앵커, 27개 하위유형 색인.
- [complete_enneagram_kb.md](./complete_enneagram_kb.md): 진단 테스트 설계에 바로 쓰기 좋은 타입별 핵심 구조, 본능/하위유형, countertype, 문항 설계 포인트.
- [type_pair_disambiguation.md](./type_pair_disambiguation.md): Appendix의 36개 타입쌍 감별 섹션을 페이지 참조와 함께 정리한 인덱스.
```

다음으로 변경.

```markdown
## 파일 구성

- [source_page_index.md](./source_page_index.md): PDF 메타데이터, 장별 페이지 범위, 장 내부 섹션 앵커, 27개 하위유형 색인.
- [complete_enneagram_kb.md](./complete_enneagram_kb.md): 진단 테스트 설계에 바로 쓰기 좋은 타입별 핵심 구조, 본능/하위유형, countertype, 문항 설계 포인트.
- [type_pair_disambiguation.md](./type_pair_disambiguation.md): 36개 타입쌍 감별 인덱스 + tie-breaker 템플릿 (모두 작성됨, target_diagnostic_axis 컬럼 포함).
- [centers_and_triads.md](./centers_and_triads.md): Body/Heart/Head Center + Hornevian + Harmonic triad. 진단 1차 필터.
- [type_wings.md](./type_wings.md): 18 wing 조합 (1w9 ~ 9w8). 핵심 변형, 행동 시그니처, 약/중/강 % 표현.
- [instinct_stacks.md](./instinct_stacks.md): 6 본능 스택. blind/repressed 본능 패턴 + % 강도 해석.
- [korean_test_copy_guide.md](./korean_test_copy_guide.md): 진단 문항/결과지의 한국어 카피 가이드. 30 번역 패턴, 27 subtype 시드, 금기 표현, before-after 예시.
```

기존 "에이전트 사용 규칙" 섹션 4 단계.

```markdown
## 에이전트 사용 규칙

1. 먼저 `complete_enneagram_kb.md`에서 타입, passion, defense, subtype, countertype 키워드로 검색한다.
2. 원문 맥락이 필요하면 `source_page_index.md`의 PDF page ref를 따라 `/Users/Joeyswoo/Downloads/Complete_Enneagram.pdf`를 확인한다.
3. 두 타입 점수가 비슷하면 `type_pair_disambiguation.md`에서 해당 pair를 찾고, 감별 질문을 설계한다.
4. 답변이나 테스트 로직에 원문을 장문 인용하지 않는다. 필요한 경우 짧은 문구만 확인용으로 쓰고, 대부분은 요약/해석/페이지 참조로 처리한다.
```

다음으로 변경 (3 단계 추가).

```markdown
## 에이전트 사용 규칙

1. 먼저 `complete_enneagram_kb.md`에서 타입, passion, defense, subtype, countertype 키워드로 검색한다.
2. 진단 1차 필터로 `centers_and_triads.md` 의 Center/Hornevian/Harmonic 매핑으로 후보 6개로 좁힌다.
3. wing 분석은 `type_wings.md`, 본능 스택 분석은 `instinct_stacks.md` 를 참조한다.
4. 원문 맥락이 필요하면 `source_page_index.md`의 PDF page ref를 따라 `/Users/Joeyswoo/Downloads/Complete_Enneagram.pdf`를 확인한다.
5. 두 타입 점수가 비슷하면 `type_pair_disambiguation.md`에서 해당 pair 를 찾고, `target_diagnostic_axis` 컬럼이 알려주는 axis 로 감별 질문을 설계한다.
6. 한국어 문항/결과지를 작성/검토할 때는 `korean_test_copy_guide.md` 의 패턴 + before-after 예시를 따른다.
7. 답변이나 테스트 로직에 원문을 장문 인용하지 않는다. 필요한 경우 짧은 문구만 확인용으로 쓰고, 대부분은 요약/해석/페이지 참조로 처리한다.
```

기존 "빠른 검색 예시" 섹션 3 예시.

```bash
rg "Sexual Six|countertype|Strength/Beauty" docs/knowledge_base/enneagram/complete_enneagram
rg "Type Five|Avarice|Isolation|Castle" docs/knowledge_base/enneagram/complete_enneagram
rg "Twos and Eights|2 vs 8|Social Two" docs/knowledge_base/enneagram/complete_enneagram
```

다음으로 변경 (3 예시 추가).

```bash
rg "Sexual Six|countertype|Strength/Beauty" docs/knowledge_base/enneagram/complete_enneagram
rg "Type Five|Avarice|Isolation|Castle" docs/knowledge_base/enneagram/complete_enneagram
rg "Twos and Eights|2 vs 8|Social Two" docs/knowledge_base/enneagram/complete_enneagram
rg "7w8|wing_strength|약/중/강" docs/knowledge_base/enneagram/complete_enneagram
rg "sx_blind|so_blind|blind instinct" docs/knowledge_base/enneagram/complete_enneagram
rg "Hornevian|Assertive|Compliant|Withdrawn" docs/knowledge_base/enneagram/complete_enneagram
```

- [ ] **Step 1.7.2: verify + commit**

```bash
node docs/_meta/enneagram/verify.mjs 1.7
git add docs/knowledge_base/enneagram/complete_enneagram/README.md
git commit -m "docs(enneagram-kb): update README index with 4 new KB files and retrieval steps"
```

WORK_STATUS — `current_task = "1.8"`.

---

## 10. Task 1.8 — Phase 1 종료 검증 + Phase 2 인계

**Files:**
- Modify: `docs/_meta/enneagram/WORK_STATUS.md`
- Modify: `docs/_meta/enneagram/HISTORY.md`
- Create (선언적): `docs/_meta/enneagram/PHASE_2_PLAN.md` (Phase 2 plan 의 placeholder — 실제 작성은 Phase 2 시작 시)

**Inputs:**
- 모든 Phase 1 산출물

**Definition of Done:**
- [ ] `node docs/_meta/enneagram/verify.mjs all` 통과
- [ ] git status 가 clean (모든 변경 사항 commit 됨)
- [ ] WORK_STATUS — `current_phase = 2`, `current_task = "2.0"`
- [ ] HISTORY 에 "Phase 1 complete" 한 줄
- [ ] PHASE_2_PLAN.md placeholder 생성 (Phase 2 시작 시 실제 작성)

### Steps

- [ ] **Step 1.8.1: 전체 verify**

```bash
node docs/_meta/enneagram/verify.mjs all
```

기대 — `OK: task all verified (14 files)` (1.0 의 7 파일 + 1.1-1.7 의 7 파일). 실패 시 해당 task 로 돌아가 수정.

- [ ] **Step 1.8.2: git status 점검**

```bash
git status --porcelain
```

기대 — 빈 출력 (clean). 변경 있으면 적절히 commit 후 진행.

- [ ] **Step 1.8.3: PHASE_2_PLAN.md placeholder**

Create `docs/_meta/enneagram/PHASE_2_PLAN.md`.

```markdown
<!-- Phase 2 (27 subtypes 깊이 콘텐츠) plan placeholder. Phase 1 종료 후 Phase 2 시작 시 채움 -->
---
kb_id: enneagram_test_meta.phase_2_plan
title: "Phase 2 Implementation Plan — 27 Subtypes Depth"
phase: 2
created_at: "2026-05-06"
status: placeholder
retrieval_tags: [phase_2, placeholder]
---

# Phase 2 Implementation Plan — 27 Subtypes Depth

이 plan 은 Phase 2 시작 시 작성됩니다. Phase 1 의 KB foundation 위에서 27 subtype 별 결과지용 깊이 콘텐츠를 만듭니다.

작성 시점은 — Phase 1 의 모든 task (1.0-1.8) 이 완료되고 `WORK_STATUS.current_phase = 2` 로 전환된 후. cold-start AI 가 본 placeholder 를 보면 `superpowers:writing-plans` skill 로 새 Phase 2 plan 작성 후 본 파일을 덮어쓴다.

작성 가이드.
- 27 subtype 각각이 1 task = 27 task. 또는 9 type 단위 묶음으로 9 task.
- 각 subtype task 는 (a) 핵심 집착 (b) 방어 패턴 (c) 행동 시그니처 (d) 그림자/맹점 (e) 같은 코어의 다른 두 subtype 과의 차이 (f) 자주 헷갈리는 타입 (g) 한국어 결과지 카피 — 7 슬롯 채움.
- KB foundation (Phase 1) 의 모든 신규 파일 (`type_wings.md`, `instinct_stacks.md`, `centers_and_triads.md`, `korean_test_copy_guide.md`) 와 `type_pair_disambiguation.md` 의 36 쌍 템플릿을 적극 참조.
```

- [ ] **Step 1.8.4: WORK_STATUS 갱신 (Phase 1 → Phase 2 전환)**

WORK_STATUS frontmatter.
- `current_phase = 2`
- `current_task = "2.0"` (Phase 2 의 첫 task — plan 작성)
- `last_updated = now`

본문 갱신 — "Phase 1 완료, Phase 2 시작 대기".

- [ ] **Step 1.8.5: HISTORY 갱신**

추가 1줄.
```
| <ISO-8601 now> | <agent_id> | 1.8 | complete | <token_estimate> | Phase 1 종료 — KB foundation 완성 (12 파일 검증 통과) |
| <ISO-8601 now> | <agent_id> | phase_1 | complete | - | Phase 1 → Phase 2 전환 |
```

- [ ] **Step 1.8.6: Final commit**

```bash
git add docs/_meta/enneagram/
git commit -m "chore(enneagram-kb): close Phase 1 KB foundation, advance to Phase 2"
```

다음 wakeup 은 Phase 2 의 task 2.0 (plan 작성) 을 시작.

---

## 11. Phase 1 종료 후 — Phase 2 / 3 / 4 / 5 미리보기

본 파일은 Phase 1 만 다룬다. Phase 2 부터의 plan 은 각 phase 시작 시 본 파일과 같은 형식으로 별도 작성된다 (`PHASE_2_PLAN.md`, `PHASE_3_PLAN.md`, ...).

### Phase 2 — 27 subtypes 깊이

각 subtype 1 task 또는 9 type 단위로 묶어 9 task. 산출물 — `subtype_27/` 폴더 (또는 단일 파일) 에 27 subtype 깊이 콘텐츠. 결과지에 직접 사용.

### Phase 3 — 스코어링 정확도

`js/test.js` 의 가중치/타이브레이커/wing 활성화/instinct % 산출식을 KB 에 맞게 재교정. wing % 산출식 정의. instinct % 산출식 정의. unit 테스트 추가.

### Phase 4 — 코드베이스 정리

`js/test.js` ↔ `js/app-adaptive.js` 중복 해소. 단일 소스 모듈로 통합. test.html 만 사용하도록 또는 둘 다 동일 모듈 사용.

### Phase 5 — 결과 출력 포맷

최종 결과지 디자인 — `7 w8(50%) sx(80%) so(60%) sp(10%)` 형식 + 27 subtype 콘텐츠 통합 + PDF/공유 형식 정리. UI/UX 다듬기.

---

## 12. Self-Review 체크리스트 (이 plan 의 메타)

작성 후 다음을 확인.

- [x] 모든 task 가 self-contained — cold-start AI 가 task 정의만 보고 시작 가능
- [x] 모든 step 에 정확한 파일 경로 + commit 메시지 + 검증 명령
- [x] No placeholders — TBD/TODO/"적절히" 표현 0
- [x] 각 task 의 Definition of Done 명확
- [x] 락 획득/해제 protocol 모든 task 에 적용
- [x] 토큰 리밋 graceful — 1.3 의 sub-step 분할로 대응
- [x] verify.mjs 가 모든 task 의 산출물 검증 가능
- [x] 멀티-AI (Claude/Codex/Cursor) 가 동일 SSOT 사용
- [x] PDF 직접 인용 0회 (저작권 + 토큰 보호)
- [x] CLAUDE.md rule 준수 — 한국어 헤더 + 콜론 끝 X + 세만틱 commit

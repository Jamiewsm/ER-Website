<!-- ER 에니어그램 테스트 발전 프로젝트의 모든 설계 결정과 거부된 대안을 기록하는 SSOT 문서 -->
---
kb_id: enneagram_test_meta.context
title: "ER Enneagram Test 발전 프로젝트 — 설계 컨텍스트"
project_owner: jamiewsm
created_at: "2026-05-06"
last_updated: "2026-05-06"
status: design_approved
related_files:
  - WORK_STATUS.md
  - PHASE_PLAN.md
  - HANDOFF.md
  - HISTORY.md
  - ../../knowledge_base/enneagram/complete_enneagram/
retrieval_tags:
  - design_context
  - phase_plan
  - hard_auto
  - kb_foundation
  - 27_subtypes
---

# ER Enneagram Test — 발전 프로젝트 설계 컨텍스트

## 0. 프로젝트 목표

학계 최고 수준의 유료 에니어그램 진단 테스트 + 결과지를 만든다.

산출물 핵심 — 27 instinctual subtypes (9 type × 3 instinct) + wing 분석을 모두 포함하는 결과지. 예시 형식.

```
7 w8(50%) sx(80%) so(60%) sp(10%)
```

**기준 출처** — Beatrice Chestnut, "The Complete Enneagram: 27 Paths to Greater Self-Knowledge". PDF 위치 `/Users/Joeyswoo/Downloads/Complete_Enneagram.pdf`. sha256 `d6e3648137de01cc51537243b0211cb81d68220c68a1dd4139d270cac25c8ca1`.

**원칙** — 유료 결과지가 갖춰야 할 깊이와 정확도를 위해 단순화/반복/얕음을 거부한다. 문제가 늘어나는 것은 문제가 아니다. 깊이가 줄어드는 것이 문제다.

## 1. 5 단계 phase 플랜

| Phase | 목적 | 주요 산출물 |
|---:|---|---|
| 1 | KB foundation | 4 신규 KB 파일 + 2 기존 갱신 + 5 _meta 파일 + AGENTS.md + .cursor rule + 검증 스크립트 |
| 2 | 27 subtypes 깊이 콘텐츠 | 27 subtype 별 결과지용 깊이 콘텐츠 |
| 3 | 스코어링 정확도 | 가중치 재교정, wing %, instinct % 계산식 |
| 4 | 코드베이스 정리 | `js/test.js` ↔ `js/app-adaptive.js` 중복 해소 |
| 5 | 결과 출력 포맷 | 최종 결과지 디자인 + 27 subtype 콘텐츠 통합 |

각 phase 의 task 분해 + 의존성은 [PHASE_PLAN.md](./PHASE_PLAN.md) 에서 관리. 진행 상태는 [WORK_STATUS.md](./WORK_STATUS.md). 자동 재개 protocol 은 [HANDOFF.md](./HANDOFF.md). 작업 로그는 [HISTORY.md](./HISTORY.md).

## 2. 설계 섹션 1 — 세션 연속성 인프라

### 2.1 단일 SSOT (Single Source of Truth)

`docs/_meta/enneagram/` 폴더 5 파일로 모든 진행 상태 + 결정 + 절차를 표현. 어느 AI (Claude / Codex / Cursor) 든 이 5 파일만 읽으면 cold-start 가능.

```
docs/_meta/enneagram/
├── CONTEXT.md       # 본 문서. 설계 + 결정 로그 + 용어집 (SSOT)
├── WORK_STATUS.md   # frontmatter 기반 현재 상태 (phase / task / paused / locked / checkpoint)
├── PHASE_PLAN.md    # 5 phase 의 모든 task 평탄 리스트 + 의존성 + self-contained 명세
├── HANDOFF.md       # 새 AI cold-start 5단계 protocol + wakeup prompt
└── HISTORY.md       # 완료 task 1줄 로그 (어느 AI / 언제 / 무엇 / 토큰 사용량)
```

### 2.2 멀티-AI 진입점

- 리포 루트 `AGENTS.md` — Codex CLI 표준. WORK_STATUS 로 포워드 + 1 단락 컨텍스트.
- `.cursor/rules/enneagram-work.mdc` — Cursor 표준. 동일 포워드.
- 리포 레벨 `CLAUDE.md` — 기존 파일에 WORK_STATUS 진입점 1줄 추가.
- 부모 디렉토리 글로벌 `CLAUDE.md` — 건드리지 않음 (글로벌 규칙).

### 2.3 복원 protocol (HANDOFF.md 핵심)

```
1. WORK_STATUS.md frontmatter 읽기 (current_phase, current_task, paused, locked_task, checkpoint).
2. paused=true | current_phase>=6 | locked_task (lock_expires_at 미경과) → HISTORY 1줄 + 즉시 종료.
3. 락 획득 (locked_task=X, lock_holder=<agent_id>, lock_expires_at=now+30분).
4. PHASE_PLAN 의 다음 pending task 정의 + 산출물 명세 + 검증 기준 확인. CONTEXT 의 관련 결정 확인.
5. 작업 후 산출물 git stage, 락 해제, WORK_STATUS 갱신, HISTORY 1줄 추가, 종료.
```

각 task 는 self-contained — task 정의에 (a) 입력 파일 (b) 산출물 명세 (c) 검증 기준 모두 포함. cold-start AI 가 한 번에 처리 가능해야 함.

### 2.4 멀티-AI 충돌 방지

`WORK_STATUS.locked_task` + `lock_holder` + `lock_expires_at` 필드. 락 만료 30분. 만료 후 다음 에이전트가 인계.

## 3. 설계 섹션 2 — Phase 1 KB 파일 구조

### 3.1 기존 파일 4개 (`docs/knowledge_base/enneagram/complete_enneagram/`)

| 파일 | 처리 |
|---|---|
| `README.md` | 목차에 신규 4 파일 추가, retrieval 동선 보강 |
| `source_page_index.md` | 그대로 유지 (페이지 매핑 안정적) |
| `complete_enneagram_kb.md` | Diagnostic Axes 표에 state vs trait 행 추가 + Triad 포인터 1줄 |
| `type_pair_disambiguation.md` | 미완성 24 tie-breaker 템플릿 작성 → 36 쌍 모두 완성. 표에 `target_diagnostic_axis` 컬럼 추가 |

### 3.2 신규 파일 4개 (같은 폴더)

| 파일 | 분량 | 내용 |
|---|---:|---|
| `type_wings.md` | 250-350줄 | 18 wing 조합 (1w9, 1w2 ... 9w1, 9w8). 각 (a) 핵심 변형 (b) 행동 시그니처 (c) 흔한 혼동 (d) 약/중/강 % 표현. **18개 동일 깊이.** |
| `instinct_stacks.md` | 150-220줄 | 6 stack (sp/sx/so, sp/so/sx, sx/sp/so, sx/so/sp, so/sp/sx, so/sx/sp). 각 (a) 1차/2차/3차 상호작용 (b) blind/repressed (3차) 빈자리 패턴 (c) % 강도 해석 |
| `centers_and_triads.md` | 80-120줄 | (a) Body/Heart/Head Center 표 (b) Hornevian (3·7·8 / 1·2·6 / 4·5·9) (c) Harmonic (2·7·9 / 4·6·8 / 1·3·5) (d) 진단 1차 필터 사용 가이드 |
| `korean_test_copy_guide.md` | 200-280줄 | (a) 추상→일상 번역 30 패턴 (b) 27 subtype 한국어 시드 단어 (c) 금기 표현 5+ (d) before-after 10 예시 |

### 3.3 파일 작성 규칙 (토큰 효율)

- YAML frontmatter + 표 위주 + 짧은 설명. 장문 산문 금지.
- PDF 직접 인용 0회 (저작권 + 토큰). 페이지 참조만.
- retrieval tag 매번 포함.
- 각 파일 첫 줄 한국어 헤더 코멘트 (CLAUDE.md rule #6).

## 4. 설계 섹션 3 — Phase 1 task 분해

### 4.1 Task DAG

```
1.0 ─────► 1.1 ──┐
   │              ├─► 1.5 ──► 1.7 ──► 1.8 (검증 + Phase 2 인계)
   ├─► 1.2 ──┐  │              ▲
   │         ├──┤              │
   ├─► 1.3 ──┤  │   1.6 ───────┘
   │         │  │   (1.2 의존)
   └─► 1.4 ──┘  │
                ▼
            (1.1-1.4 병렬 가능)
```

### 4.2 Task 정의 요약

| ID | 제목 | 추정 |
|---|---|---|
| 1.0 | 연속성 인프라 부트스트랩 (5 _meta + AGENTS.md + .cursor + 검증 스크립트) | 15-25분 |
| 1.1 | 24 tie-breaker 템플릿 완성 + axis 컬럼 | 30-45분 |
| 1.2 | centers_and_triads.md 신규 | 15-25분 |
| 1.3 | type_wings.md 신규 (18 wing) | 60-90분 |
| 1.4 | instinct_stacks.md 신규 (6 stack) | 30-45분 |
| 1.5 | korean_test_copy_guide.md 신규 | 45-60분 |
| 1.6 | complete_enneagram_kb.md 보강 (state/trait 행) | 5-10분 |
| 1.7 | README.md 갱신 (목차 + 검색 예시) | 10-15분 |
| 1.8 | Phase 1 종료 검증 + Phase 2 인계 | 10-15분 |

**Phase 1 총 추정** — 3.5-5 시간 (병렬 X 기준). 하드-오토에서 9 wakeup 분량.

세부 self-contained 명세는 [PHASE_PLAN.md](./PHASE_PLAN.md) 에서 task 마다 (a) 입력 (b) 산출물 (c) 검증 기준 명시.

### 4.3 검증 스크립트 (1.0 에 포함)

`docs/_meta/enneagram/verify.mjs` — Node.js (의존 없음). 각 task 산출물의 자체 검증.

- frontmatter 존재 + 필수 키 확인 (kb_id, title, created_at, retrieval_tags)
- 깨진 내부 링크 0
- retrieval_tags 키 존재 (배열, 1개 이상)
- 한국어 헤더 코멘트 (.md 는 frontmatter 위 1줄)
- 파일 분량이 task 명세 범위 내

호출 — `node docs/_meta/enneagram/verify.mjs <task_id>` (예: `node docs/_meta/enneagram/verify.mjs 1.3`). 통과 시에만 task 완료 처리.

## 5. 설계 섹션 4 — 하드-오토 운영 모드

### 5.1 메커니즘

`mcp__scheduled-tasks__create_scheduled_task` 로 cron-style 반복 에이전트 생성. 매 wakeup 마다 fresh Claude 세션 → 모든 컨텍스트는 `_meta/` 파일에서 읽어옴. 이 제약이 문서 완결성을 강제.

### 5.2 운영 파라미터

| 파라미터 | 값 | 비고 |
|---|---|---|
| Cadence | 매 6시간 (4회/일) | `WORK_STATUS.schedule_interval_hours` 로 변경 가능 |
| Quiet hours | 없음 | 조기 종료 wakeup 이 cheap 이므로 차단 불필요 |
| 일일 wakeup 상한 | 8회 | 안전장치 |
| 락 만료 | 30분 | 토큰 리밋/오류 시 다음 에이전트 인계 안전 마진 |

### 5.3 Wakeup prompt (HANDOFF.md 에 명시, 고정)

```
You are continuing automated work on the ER Enneagram test project.

Required first action: Read docs/_meta/enneagram/HANDOFF.md COMPLETELY.
Execute the 5-step protocol exactly. Do NOT ask the user questions.
If WORK_STATUS shows paused=true OR current_phase>=6, log to HISTORY and exit.
Otherwise complete the next pending task per PHASE_PLAN, update WORK_STATUS + HISTORY, exit.
```

### 5.4 Wakeup 흐름

```
1. WORK_STATUS.md frontmatter 읽기.
2. paused | current_phase>=6 | locked_task 활성 → 조기 종료 (~50 토큰).
3. 락 획득 (30분 만료).
4. PHASE_PLAN 의 다음 pending task 실행.
5. task 완료 → 락 해제, WORK_STATUS + HISTORY 갱신, 종료.
```

### 5.5 토큰 리밋 graceful 처리

- 각 task 시작 시 checkpoint plan 을 `WORK_STATUS.checkpoint_plan` 배열에 명시 (예 — 1.3 wings 의 9 sub-step `["1.3.1","1.3.2",...,"1.3.9"]`).
- 각 sub-step 완료 후 `WORK_STATUS.checkpoint` 를 완료된 sub-step ID 로 즉시 갱신 + 부분 산출물 git stage.
- 리밋/오류 → 락 30분 후 만료 → 다음 wakeup 이 `checkpoint` 다음부터 재개.

### 5.6 종료 조건

`current_phase >= 6` (Phase 5 완료) → 마지막 task 가 `mcp__scheduled-tasks__delete_scheduled_task` 호출. HISTORY 에 "Project complete" 한 줄.

### 5.7 사용자 제어

| 의도 | 방법 |
|---|---|
| 일시정지 (파일) | WORK_STATUS frontmatter `paused: true` 직접 편집 |
| 일시정지 (자연어) | 어느 AI 세션에서든 "에니어그램 작업 일시정지" — 그 세션이 WORK_STATUS 편집 후 HISTORY 기록 |
| 재개 | `paused: false` |
| 즉시 강제 실행 | `mcp__scheduled-tasks__run` 또는 사용자 직접 wakeup prompt 실행 |
| 완전 중단 | `mcp__scheduled-tasks__delete_scheduled_task` |

### 5.8 비용 가시성

가능한 범위 내에서 매 wakeup 의 토큰 사용량 + wakeup 횟수를 HISTORY 에 기록. Anthropic scheduled-tasks 가 토큰 노출 안 하면 wakeup 횟수만 기록.

**Phase 1-5 전체 예상** — 30-60 wakeup, 3-5 일 운영.

## 6. 결정 로그

| 날짜 | 결정 | 거부된 대안 | 이유 |
|---|---|---|---|
| 2026-05-06 | _meta 위치 = `docs/_meta/enneagram/` | `docs/knowledge_base/enneagram/_meta/` | 사용자 선호 |
| 2026-05-06 | 18 wing 동일 깊이 | 자주 헷갈리는 6개만 깊게 | 27 subtype 결과지의 공정한 깊이 |
| 2026-05-06 | locked_task 필드 추가 | git 충돌로만 해결 | 멀티-AI 환경에서 중복 작업 방지 |
| 2026-05-06 | 1.0 에 검증 스크립트 포함 | 1.8 에서 인라인 작성 | 모든 후속 task self-verify 가능 |
| 2026-05-06 | 하드-오토 cadence 6h | 4h (비용↑) / 12h (느림) | 균형점 |
| 2026-05-06 | 일시정지 — 파일 편집 + 자연어 둘 다 | 파일 편집 only | 편의성 ↑ |
| 2026-05-06 | Centers/Triads 단일 파일 | `complete_enneagram_kb.md` 에도 중복 | 파편화 방지 |
| 2026-05-06 | Phase 1 = foundation only, Phase 2 = 27 subtype 깊이 | Phase 1 에 일부 27 subtype 콘텐츠 침범 | 의존성 깔끔 |

## 7. 거부된 큰 대안들

- **소프트 자동만** — 사용자 한 마디로 재개. 거부 — 사용자가 "프로젝트 끝까지 자동" 명시.
- **Phase 별 별도 design 문서** — 거부. 단일 CONTEXT.md + PHASE_PLAN.md 가 더 명료, 토큰 효율.
- **PDF 직접 전사** — 거부. 저작권 + 토큰 양쪽 보호. 요약 + 페이지 참조만.
- **Health Levels (Riso-Hudson) 통합** — 보류. Chestnut 한 출처로 통일 (사용자 명시).
- **윙 콘텐츠 6개만 깊게** — 거부. 27 subtype 결과지에서 윙 분석이 빠지면 가치 손상.

## 8. 용어집

| 용어 | 정의 |
|---|---|
| core type | 9 유형 중 본인의 기본 자동 패턴 (1-9) |
| wing | core 의 인접 두 유형 중 더 활성화된 쪽 (예: 7w8). % 로 강도 표현 |
| instinct | sp (self-preservation), sx (sexual/one-to-one), so (social). 모든 사람은 셋 다 갖되 강도 다름 |
| stack | 본능 셋의 강도 순서 (예: sx > so > sp) |
| 27 subtype | core × dominant instinct 의 27 조합. 본 프로젝트의 결과지 단위 |
| countertype | core type stereotype 과 반대로 보이는 subtype (예: Social 9, Sexual 6, Self-Pres 4) |
| passion / vice | 각 type 의 자동화된 정서 동기 (1=Anger, 2=Pride, ...) |
| defense | 불편한 정서/욕구를 처리하는 자동 방어 |
| state vs trait | state = 일시적 (스트레스/통합 화살표), trait = 안정적 (core type) |
| Hornevian Triad | 대인관계 전략 (Assertive 3·7·8 / Compliant 1·2·6 / Withdrawn 4·5·9) |
| Harmonic Triad | 갈등 대처 (Positive Outlook 2·7·9 / Reactive 4·6·8 / Competency 1·3·5) |

## 9. 외부 의존

- Claude Agent SDK / Claude Code (이 작업의 1차 실행자)
- `mcp__scheduled-tasks__*` (하드-오토)
- Codex CLI (보조, AGENTS.md 진입)
- Cursor (보조, .cursor/rules 진입)
- git (브랜치 + 커밋 + 워크트리)

## 10. 변경 이력

| 날짜 | 변경 | 작성자 |
|---|---|---|
| 2026-05-06 | 초안 작성 — 4 섹션 사용자 승인 후 spec 화 | claude-opus-4-7 |

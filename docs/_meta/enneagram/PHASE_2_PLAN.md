<!-- Phase 2 (27 subtypes 깊이 콘텐츠) 구현 plan. cold-start AI 가 task 별로 즉시 실행 가능 -->
---
kb_id: enneagram_test_meta.phase_2_plan
title: "Phase 2 Implementation Plan — 27 Subtypes Depth Content"
phase: 2
created_at: "2026-05-06"
last_updated: "2026-05-06"
status: ready_to_execute
total_tasks: 11
estimated_total_minutes: "270-410"
related_files:
  - CONTEXT.md
  - WORK_STATUS.md
  - HANDOFF.md
  - HISTORY.md
  - PHASE_PLAN.md
retrieval_tags:
  - phase_2
  - 27_subtypes_depth
  - implementation_plan
  - task_decomposition
---

# ER Enneagram Test — Phase 2 (27 Subtypes Depth) Implementation Plan

> **For agentic workers:** 본 plan 은 Phase 1 의 [PHASE_PLAN.md](./PHASE_PLAN.md) 와 동일한 형식. 매 task 시작 전 [HANDOFF.md](./HANDOFF.md) 의 5단계 protocol 따르기. 검증은 `node docs/_meta/enneagram/verify.mjs <task_id>`.

**Goal:** 27 instinctual subtypes (9 type × 3 instinct) 각각의 결과지용 깊이 콘텐츠를 만든다. Phase 5 결과 출력 포맷이 직접 사용할 단위. 단일 파일 `subtypes_27.md` 에 9 type 단위 9 task 로 누적.

**Architecture:** 각 subtype 은 7 슬롯 — (a) 핵심 집착 (b) 방어 패턴 (c) 행동 시그니처 3개 (d) 그림자/맹점 (e) 같은 코어의 다른 두 subtype 과 차이 (f) 자주 헷갈리는 다른 코어 type (g) 한국어 결과지 카피 시드 + 1단락. 9 type 단위 task 로 분해 (각 task = 한 코어의 sp/so/sx 3 subtype). countertype (Sexual 1, Self-Pres 2/3/4, Sexual 5/6, Social 7/8/9) 9개는 슬롯 (e), (f) 에서 각별히 강조.

**Tech Stack:** Markdown (frontmatter YAML), Node.js (verify.mjs 신규 spec 추가), git.

**Working Directory:** `/Users/Joeyswoo/Library/Mobile Documents/com~apple~CloudDocs/Desktop/Visual Studio Code/ER-Website/.claude/worktrees/musing-taussig-e181fd/`.

---

## 0. Task Index

| ID | 제목 | 의존 | 추정(분) |
|---|---|---|---:|
| 2.0 | Phase 2 plan 작성 (이 파일 자체) + verify.mjs 의 Phase 2 task spec 추가 | Phase 1 완료 | 30-40 |
| 2.1 | subtypes_27.md 신규 + Type 1 (Self-Pres 1, Social 1, Sexual 1 — countertype) | 2.0 | 30-45 |
| 2.2 | Type 2 (Self-Pres 2 — countertype, Social 2, Sexual 2) | 2.1 | 30-45 |
| 2.3 | Type 3 (Self-Pres 3 — countertype, Social 3, Sexual 3) | 2.1 | 30-45 |
| 2.4 | Type 4 (Self-Pres 4 — countertype, Social 4, Sexual 4) | 2.1 | 30-45 |
| 2.5 | Type 5 (Self-Pres 5, Social 5, Sexual 5 — countertype) | 2.1 | 30-45 |
| 2.6 | Type 6 (Self-Pres 6, Social 6, Sexual 6 — countertype) | 2.1 | 30-45 |
| 2.7 | Type 7 (Self-Pres 7, Social 7 — countertype, Sexual 7) | 2.1 | 30-45 |
| 2.8 | Type 8 (Self-Pres 8, Social 8 — countertype, Sexual 8) | 2.1 | 30-45 |
| 2.9 | Type 9 (Self-Pres 9, Social 9 — countertype, Sexual 9) | 2.1 | 30-45 |
| 2.10 | Phase 2 종료 검증 + Phase 3 인계 (PHASE_3_PLAN.md placeholder) | 2.1-2.9 | 10-15 |

**병렬 가능성** — 2.1 후 2.2-2.9 는 동일 파일에 append 하므로 순차 실행 (병렬 시 git 충돌). 2.1 이 파일 헤더 + 첫 type 을 설정하므로 가장 먼저.

---

## 1. Conventions

### 1.1 산출물 파일 — `subtypes_27.md`

위치 — `docs/knowledge_base/enneagram/complete_enneagram/subtypes_27.md`. 단일 파일에 27 subtype 누적.

frontmatter 템플릿 (Task 2.1 에서 작성).

```yaml
---
kb_id: complete_enneagram.subtypes_27
title: "27 Instinctual Subtypes — Depth Content for Result Page"
source_pdf: "/Users/Joeyswoo/Downloads/Complete_Enneagram.pdf"
created_at: "2026-05-06"
last_updated: <ISO date>
retrieval_tags:
  - subtypes_27
  - sp_1
  - so_1
  - sx_1
  ...
  - sp_9
  - so_9
  - sx_9
  - countertype
  - result_page_content
---
```

각 type 섹션 헤더 — `## Type N — <Korean name>`. 각 subtype 헤더 — `### sp_N — <name>` / `### so_N — <name>` / `### sx_N — <name>`. countertype 은 헤더에 `(countertype)` 표기.

### 1.2 7 슬롯 템플릿 (각 subtype)

```markdown
### {sp|so|sx}_N — <Korean name>{(countertype) 인 경우 표기}

**핵심 집착** — <1-2 문장. 이 subtype 이 가장 강하게 추구하거나 회피하는 핵심 동기. complete_enneagram_kb.md 의 Subtype index "Diagnostic angle" 시드 활용.>

**방어 패턴** — <1-2 문장. 이 type 의 핵심 defense (Reaction Formation, Repression 등) 가 이 instinct 안에서 어떻게 표현되는지.>

**행동 시그니처**
- <표현 1>
- <표현 2>
- <표현 3>

**그림자/맹점** — <1-2 문장. 이 subtype 이 자기는 잘 못 보는 영역. 회피하는 것 + 자각 어려운 패턴.>

**같은 코어의 다른 두 subtype 과 차이**
- vs <other subtype 1> — <1줄 차이>
- vs <other subtype 2> — <1줄 차이>

**자주 헷갈리는 다른 코어 type** — <1-2 type. type_pair_disambiguation.md 참조. 왜 헷갈리는지 + 갈리는 지점 1줄.>

**한국어 결과지 카피**

시드 단어 — <korean_test_copy_guide.md 의 시드 단어 + 1-2 추가>

설명 한 단락 — <4-6줄. 사용자가 자기 결과지로 받을 톤. 낙인 X, 도덕화 X, 동기 중심.>
```

### 1.3 입력 소스 (모든 subtype task 공통)

매 subtype 작성 시 다음 4 파일 + PDF 페이지 참조 사용.

1. [complete_enneagram_kb.md](../../knowledge_base/enneagram/complete_enneagram/complete_enneagram_kb.md) — 각 type 의 Subtype index (sp/so/sx 별 Page + Diagnostic angle), 회피 영역 (5번 규칙).
2. [korean_test_copy_guide.md](../../knowledge_base/enneagram/complete_enneagram/korean_test_copy_guide.md) — 27 subtype 한국어 시드 단어 표.
3. [type_pair_disambiguation.md](../../knowledge_base/enneagram/complete_enneagram/type_pair_disambiguation.md) — 자주 헷갈리는 다른 코어 type.
4. [instinct_stacks.md](../../knowledge_base/enneagram/complete_enneagram/instinct_stacks.md) — 본능 별 핵심 관심 (sp/sx/so 정의).

countertype 9 개의 페이지는 [source_page_index.md](../../knowledge_base/enneagram/complete_enneagram/source_page_index.md) 의 Countertype 빠른 색인 참조.

### 1.4 분량 가이드

각 subtype = 25-40 줄 (slot 별 평균 3-5 줄). 한 type (3 subtype) = 90-130 줄. 9 type 합 = 810-1170 줄. + frontmatter + intro + index ≈ 900-1300 줄.

**verify.mjs 의 task spec** — `subtypes_27.md` 의 minLines 는 task 별로 점진 증가.

| Task | minLines | maxLines (after this task) |
|---|---:|---:|
| 2.1 (Type 1) | 110 | 200 |
| 2.2 (+ Type 2) | 200 | 320 |
| 2.3 (+ Type 3) | 290 | 440 |
| 2.4 (+ Type 4) | 380 | 560 |
| 2.5 (+ Type 5) | 470 | 680 |
| 2.6 (+ Type 6) | 560 | 800 |
| 2.7 (+ Type 7) | 650 | 920 |
| 2.8 (+ Type 8) | 740 | 1040 |
| 2.9 (+ Type 9) | 830 | 1300 |

### 1.5 PDF 인용 금지 (Phase 1 와 동일)

본 plan 의 어떤 산출물도 Complete_Enneagram.pdf 의 본문을 직접 전사하지 않는다. 페이지 참조 + 자체 요약/해석/추론만 사용.

### 1.6 락/HISTORY/commit 규칙 (Phase 1 와 동일)

[HANDOFF.md](./HANDOFF.md) 의 5단계 protocol 따름. commit 메시지 형식 — `<type>(enneagram-kb): <description>`. 본문에 `Phase 2 task <id>` + agent ID + verify 요약.

---

## 2. Task 2.0 — Phase 2 plan 작성 + verify.mjs 의 Phase 2 spec 추가

**Files:**
- Modify: `docs/_meta/enneagram/PHASE_2_PLAN.md` (placeholder → 본 실제 plan)
- Modify: `docs/_meta/enneagram/verify.mjs` (TASK_FILE_SPECS 에 2.1-2.10 추가)
- Modify: `docs/_meta/enneagram/WORK_STATUS.md` (락 + checkpoint + advance)
- Modify: `docs/_meta/enneagram/HISTORY.md` (start + complete entries)

**Inputs:**
- [PHASE_2_PLAN.md](./PHASE_2_PLAN.md) 기존 placeholder
- [verify.mjs](./verify.mjs) 기존 코드
- [PHASE_PLAN.md](./PHASE_PLAN.md) Phase 1 의 형식 참조

**Definition of Done:**
- [ ] PHASE_2_PLAN.md 가 task 2.1-2.10 모두 self-contained 명세 + 7 슬롯 템플릿 + 입력 소스 + 분량 가이드 포함
- [ ] verify.mjs 에 task 2.1-2.10 의 file spec 추가 (subtypes_27.md 의 점진 증가 minLines 반영)
- [ ] WORK_STATUS — `current_task = "2.1"`, 락 해제, `last_updated` 갱신
- [ ] HISTORY — 2.0 start + complete 2 줄 추가
- [ ] 단일 commit

### Steps

- [ ] **Step 2.0.1: PHASE_2_PLAN.md 작성**

본 파일이 그것. placeholder 를 덮어쓴 결과 = 이 파일.

- [ ] **Step 2.0.2: verify.mjs 의 TASK_FILE_SPECS 갱신**

`docs/_meta/enneagram/verify.mjs` 의 TASK_FILE_SPECS 객체에 다음 entry 추가.

```javascript
  '2.0': [
    { path: 'docs/_meta/enneagram/PHASE_2_PLAN.md', minLines: 200, maxLines: 800 },
  ],
  '2.1': [
    { path: 'docs/knowledge_base/enneagram/complete_enneagram/subtypes_27.md', minLines: 110, maxLines: 200 },
  ],
  '2.2': [
    { path: 'docs/knowledge_base/enneagram/complete_enneagram/subtypes_27.md', minLines: 200, maxLines: 320 },
  ],
  '2.3': [
    { path: 'docs/knowledge_base/enneagram/complete_enneagram/subtypes_27.md', minLines: 290, maxLines: 440 },
  ],
  '2.4': [
    { path: 'docs/knowledge_base/enneagram/complete_enneagram/subtypes_27.md', minLines: 380, maxLines: 560 },
  ],
  '2.5': [
    { path: 'docs/knowledge_base/enneagram/complete_enneagram/subtypes_27.md', minLines: 470, maxLines: 680 },
  ],
  '2.6': [
    { path: 'docs/knowledge_base/enneagram/complete_enneagram/subtypes_27.md', minLines: 560, maxLines: 800 },
  ],
  '2.7': [
    { path: 'docs/knowledge_base/enneagram/complete_enneagram/subtypes_27.md', minLines: 650, maxLines: 920 },
  ],
  '2.8': [
    { path: 'docs/knowledge_base/enneagram/complete_enneagram/subtypes_27.md', minLines: 740, maxLines: 1040 },
  ],
  '2.9': [
    { path: 'docs/knowledge_base/enneagram/complete_enneagram/subtypes_27.md', minLines: 830, maxLines: 1300 },
  ],
```

기존 1.0-1.7 spec 은 그대로 유지.

- [ ] **Step 2.0.3: 검증 + commit + 락 해제**

```bash
node docs/_meta/enneagram/verify.mjs 2.0
```

기대 — `OK: task 2.0 verified (1 files)` (PHASE_2_PLAN.md).

```bash
git add docs/_meta/enneagram/PHASE_2_PLAN.md docs/_meta/enneagram/verify.mjs docs/_meta/enneagram/WORK_STATUS.md docs/_meta/enneagram/HISTORY.md
git commit -m "chore(enneagram-kb): write Phase 2 plan + register verify specs for 9 subtype tasks"
```

WORK_STATUS — `current_task = "2.1"`, 락 해제, HISTORY 에 complete 추가.

---

## 3. Task 2.1 — subtypes_27.md 신규 + Type 1

**Files:**
- Create: `docs/knowledge_base/enneagram/complete_enneagram/subtypes_27.md`

**Inputs:**
- 1.3 입력 소스 (모든 task 공통, 위 1.3 참조).
- Type 1 specific — `complete_enneagram_kb.md` Type 1 section (p436-p471), 특히 Subtype index (Self-Pres 1 p450, Social 1 p453, Sexual 1 p455 countertype). `korean_test_copy_guide.md` 27 subtype 시드 (Self-Pres 1 / Social 1 / Sexual 1 행).

**Definition of Done:**
- [ ] 110-200 줄
- [ ] frontmatter + 한국어 헤더 + retrieval_tags
- [ ] 파일 인트로 + 27 subtype index (목차) + Type 1 섹션 (3 subtype, 7 슬롯 each)
- [ ] Sexual 1 (Zeal) countertype 헤더에 표기
- [ ] verify.mjs 2.1 통과

### Steps

- [ ] **Step 2.1.1: 락 + checkpoint_plan**

`checkpoint_plan = ["2.1.1", "2.1.2", "2.1.3", "2.1.4"]`. WORK_STATUS 갱신.

- [ ] **Step 2.1.2: 파일 작성 — frontmatter + intro + index + Type 1**

`docs/knowledge_base/enneagram/complete_enneagram/subtypes_27.md` 신규 작성. 구조.

```markdown
<!-- 27 instinctual subtypes (9 type × 3 instinct) 의 결과지용 깊이 콘텐츠. Phase 5 결과 출력 포맷이 직접 사용 -->
---
kb_id: complete_enneagram.subtypes_27
title: "27 Instinctual Subtypes — Depth Content for Result Page"
source_pdf: "/Users/Joeyswoo/Downloads/Complete_Enneagram.pdf"
created_at: "2026-05-06"
last_updated: "2026-05-06"
retrieval_tags:
  - subtypes_27
  - sp_1
  - so_1
  - sx_1
  - sp_2
  - so_2
  - sx_2
  - sp_3
  - so_3
  - sx_3
  - sp_4
  - so_4
  - sx_4
  - sp_5
  - so_5
  - sx_5
  - sp_6
  - so_6
  - sx_6
  - sp_7
  - so_7
  - sx_7
  - sp_8
  - so_8
  - sx_8
  - sp_9
  - so_9
  - sx_9
  - countertype
  - result_page_content
---

# 27 Instinctual Subtypes — Result Page Depth Content

이 문서는 27 subtype (9 type × 3 instinct) 의 결과지용 깊이 콘텐츠입니다. 각 subtype 마다 7 슬롯 — 핵심 집착, 방어 패턴, 행동 시그니처 3개, 그림자/맹점, 같은 코어의 다른 두 subtype 과 차이, 자주 헷갈리는 다른 코어 type, 한국어 결과지 카피 (시드 + 1단락).

## 27 Subtype Index

| Core | sp | so | sx |
|---:|---|---|---|
| 1 | sp_1 (Worry) | so_1 (Non-Adaptability) | **sx_1 (Zeal, countertype)** |
| 2 | **sp_2 (Privilege, countertype)** | so_2 (Ambition) | sx_2 (Aggressive/Seductive) |
| 3 | **sp_3 (Security, countertype)** | so_3 (Prestige) | sx_3 (Charisma) |
| 4 | **sp_4 (Tenacity, countertype)** | so_4 (Shame) | sx_4 (Competition) |
| 5 | sp_5 (Castle) | so_5 (Totem) | **sx_5 (Confidence, countertype)** |
| 6 | sp_6 (Warmth) | so_6 (Duty) | **sx_6 (Strength/Beauty, countertype)** |
| 7 | sp_7 (Keeper of the Castle) | **so_7 (Sacrifice, countertype)** | sx_7 (Suggestibility) |
| 8 | sp_8 (Satisfaction) | **so_8 (Solidarity, countertype)** | sx_8 (Possession) |
| 9 | sp_9 (Appetite) | **so_9 (Participation, countertype)** | sx_9 (Fusion) |

(굵은 표시 = countertype, 9 개)

## Type 1 — 개혁가 / 완벽주의자

Source — p436-p471. Passion = Anger. Defense = Reaction Formation. Center = Body/Gut. Hornevian = Compliant. Harmonic = Competency. 회피 — being wrong, bad, irresponsible, out of control.

### sp_1 — Worry (자기보호 1)

**핵심 집착** — 실수와 책임 미달에 대한 내면 압력. 일상의 작은 부정확함도 점검하고 정리해야 마음이 놓임.

**방어 패턴** — Reaction Formation 이 내면화되어, 분노가 "걱정/긴장/책임감" 으로 변형됨. 책임 영역 내의 모든 것을 통제하려 함.

**행동 시그니처**
- 일상 루틴, 청결, 정리정돈, 시간 엄수에 강한 집착.
- 마감 전 반복 점검, 자기 검토 루프가 길어 비효율 위험.
- 자기 비판이 강하고 죄책감이 자주 작동.

**그림자/맹점** — 분노의 직접 표현을 잘 못 봄. 본인은 "걱정" 으로 느끼지만 외부에는 짜증/긴장으로 전달됨. 자기를 너무 채찍질하다 번아웃.

**같은 코어의 다른 두 subtype 과 차이**
- vs so_1 (Non-Adaptability) — sp_1 은 자기 영역의 정확성, so_1 은 외부 모범/가르침.
- vs sx_1 (Zeal, countertype) — sp_1 은 내면화된 걱정, sx_1 은 강렬한 외부 개혁 충동.

**자주 헷갈리는 다른 코어 type** — Type 6 (sp_6 Warmth). 차이 — sp_1 은 실수/잘못됨에 초점, sp_6 은 외부 위험/신뢰에 초점.

**한국어 결과지 카피**

시드 단어 — 점검, 걱정, 책임, 준비, 실수 두려움, 자기 채찍질, 일상 정확.

설명 — 당신은 일상의 작은 부정확함도 그대로 두기 어렵다고 느끼는 편입니다. 책임 영역 안에서 잘못된 부분이 보이면 빠르게 정리하고 싶다는 압력이 작동하고, 다 정리되었다는 감각이 들 때 비로소 마음이 놓입니다. 이 자질은 약속을 지키고 신뢰받는 사람이 되는 데 큰 힘이 되지만, 자기에게 너무 엄격해 번아웃으로 이어질 때가 있습니다. 분노가 "걱정" 의 형태로 작동한다는 점을 알아차리는 것이 성장의 첫 걸음입니다.

### so_1 — Non-Adaptability (사회 1)

**핵심 집착** — 사회/조직에서 "옳은 방식" 의 모범이 되려는 충동. 가르침/원칙/개혁을 통해 영향력 행사.

**방어 패턴** — 분노가 "도덕적 권위" 로 변형됨. 자기는 사회 기준의 모범이라 여기며, 그 기준을 어기는 사람들에게 우월감 + 분개.

**행동 시그니처**
- 가르치는 자세, 원칙 강조, 모범 보여주기.
- 사회 운동, 개혁, 비판적 글쓰기.
- 적응보다 기준 고수, 융통성 부족 인상.

**그림자/맹점** — 자기 우월감과 경직성을 잘 못 봄. "나는 옳고 너는 틀려" 가 무의식에 깔려 있음. 학습/적응의 어려움.

**같은 코어의 다른 두 subtype 과 차이**
- vs sp_1 (Worry) — so_1 은 외부 모범/가르침, sp_1 은 내면 점검.
- vs sx_1 (Zeal, countertype) — so_1 은 차분한 권위, sx_1 은 뜨거운 개혁.

**자주 헷갈리는 다른 코어 type** — Type 3 (so_3 Prestige). 차이 — so_1 은 도덕적 모범이 핵심, so_3 은 가시적 성공이 핵심.

**한국어 결과지 카피**

시드 단어 — 모범, 가르침, 기준 제시, 개혁, 우월감, 도덕적 권위.

설명 — 당신은 자신이 속한 곳의 "옳은 방식" 이 무엇인지 분명히 보고, 그 기준을 모범으로 보여주려는 자세가 자연스럽게 나옵니다. 가르치고, 정리하고, 개선하는 역할에서 가장 살아있다고 느낍니다. 이 자질은 사회와 조직을 더 나아지게 만드는 큰 힘이지만, 융통성이 부족해 보이거나 우월감이 무의식에 깔리는 위험이 있습니다. 다른 사람의 방식도 그 안에서 옳을 수 있다는 가능성에 열려 있는 것이 다음 단계입니다.

### sx_1 — Zeal (성적/일대일 1, countertype)

**핵심 집착** — 강렬한 1:1 관계와 이상에 대한 개혁 충동. 가까운 사람이나 가치관을 "더 옳게" 만들려는 열정. 일반 1과 달리 분노가 직접 표출됨.

**방어 패턴** — Reaction Formation 의 보호 층이 얇음. 분노가 "정의로운 분개" 로 직접 표현됨. countertype — 표면적으로는 8번처럼 보일 수 있음.

**행동 시그니처**
- 가까운 사람의 결함을 직접 지적, 교정 시도.
- 강렬한 사회/관계적 운동, 사람을 바꾸려는 열정.
- 분노 표현이 통제 안 됨, 폭발적.

**그림자/맹점** — 자신의 분노가 "옳음" 으로 위장된 공격임을 잘 못 봄. 가까운 사람을 존중보다 개혁 대상으로 봄.

**같은 코어의 다른 두 subtype 과 차이**
- vs sp_1 (Worry) — sx_1 은 외부로 분출, sp_1 은 내면화.
- vs so_1 (Non-Adaptability) — sx_1 은 1:1 강도, so_1 은 그룹 모범.

**자주 헷갈리는 다른 코어 type** — Type 8 (강도/직접성), Type 4 (감정 강도). 차이 — sx_1 은 옳음/개혁이 동기, 8 은 통제, 4 는 감정/진정성.

**한국어 결과지 카피**

시드 단어 — 강렬, 개혁, 정의감, 관계 교정, 분개, 직접 표현.

설명 — 당신은 가까운 사람과 깊이 연결되었을 때 그 사람을 "더 나은 방향" 으로 끌고 가려는 열정이 자주 작동합니다. 사회나 가치관에 대한 분개도 강하고, 그 분노가 직접 표현되는 편입니다. 이 자질은 변화의 강한 동력이 되지만, 가까운 사람이 "교정 대상" 처럼 느낄 때가 있습니다. 1번 코어 중에서 가장 표현이 외향적이라 8번이나 4번으로 오해받기도 합니다. 분노 자체를 알아보고 그 안의 정당함과 공격성을 분리하는 것이 성장의 핵심입니다.
```

추가로 — `## 27 Subtype Index` 섹션 다음에 `## Type 1 — 개혁가 / 완벽주의자` 다음에 위 3 subtype.

- [ ] **Step 2.1.3: verify**

```bash
node docs/_meta/enneagram/verify.mjs 2.1
```

기대 — `OK: task 2.1 verified (1 files)`.

- [ ] **Step 2.1.4: Commit + WORK_STATUS 갱신 + HISTORY**

```bash
git add docs/knowledge_base/enneagram/complete_enneagram/subtypes_27.md docs/_meta/enneagram/WORK_STATUS.md docs/_meta/enneagram/HISTORY.md
git commit -m "feat(enneagram-kb): add subtypes_27.md with Type 1 (sp_1, so_1, sx_1 countertype)"
```

WORK_STATUS — `current_task = "2.2"`, 락 해제. HISTORY 에 complete.

---

## 4. Tasks 2.2 ~ 2.9 — Type 2 ~ Type 9 (각 코어의 3 subtype 추가)

각 task 의 구조 동일. Files / Inputs / DoD / Steps 형식 일관.

### 공통 Files

- Modify: `docs/knowledge_base/enneagram/complete_enneagram/subtypes_27.md` (해당 type 섹션 append)

### 공통 Inputs

- 기존 `subtypes_27.md`
- `complete_enneagram_kb.md` 해당 type 의 Subtype index + Diagnostic signals
- `korean_test_copy_guide.md` 시드 단어 표
- `type_pair_disambiguation.md` 자주 헷갈리는 코어 type
- `instinct_stacks.md` 본능 정의
- `source_page_index.md` Countertype 빠른 색인 (해당 type 의 countertype subtype)

### 공통 Definition of Done

- [ ] 새 type 섹션 추가 (`## Type N — <Korean name>` + 3 subtype 7 슬롯 each)
- [ ] countertype 헤더 표기 적용
- [ ] verify.mjs `2.X` task spec 의 minLines 통과
- [ ] commit + WORK_STATUS 갱신 + HISTORY entry

### 공통 Steps 템플릿

- [ ] **Step 2.X.1: 락 + checkpoint_plan**

`checkpoint_plan = ["2.X.1", "2.X.2", "2.X.3", "2.X.4"]` (sp / so / sx 각 1개 + verify+commit).

- [ ] **Step 2.X.2: Type N 섹션 append**

기존 파일 끝에 추가 (마지막 type 섹션의 마지막 subtype 다음 줄에 `## Type N — <name>` 로 시작하는 섹션).

각 subtype 슬롯 작성은 1.2 의 7 슬롯 템플릿 따름. countertype 9 개는 헤더에 명시 (예 — `### sp_3 — Security (자기보호 3, countertype)`).

소스 매핑 (각 type 의 subtype 페이지 + 한국어 시드 단어) — Phase 1 의 [source_page_index.md](../../knowledge_base/enneagram/complete_enneagram/source_page_index.md) 27 하위유형 색인 + countertype 빠른 색인 + [korean_test_copy_guide.md](../../knowledge_base/enneagram/complete_enneagram/korean_test_copy_guide.md) 의 27 subtype 시드 단어 표 사용.

**Type 별 핵심 소스 (cold-start AI 가 빠르게 위치 잡도록).**

| Task | Type | 한국어 이름 | sp page | so page | sx page | countertype |
|---|---:|---|---:|---:|---:|---|
| 2.2 | 2 | 조력자 / 돕는 사람 | p410 | p414 | p417 | sp_2 (Privilege) |
| 2.3 | 3 | 성취자 / 동기부여자 | p366 | p370 | p373 | sp_3 (Security) |
| 2.4 | 4 | 개인주의자 / 예술가 | p320 | p324 | p328 | sp_4 (Tenacity) |
| 2.5 | 5 | 사색가 / 관찰자 | p276 | p279 | p281 | sx_5 (Confidence) |
| 2.6 | 6 | 충성가 / 회의가 | p229 | p232 | p235 | sx_6 (Strength/Beauty) |
| 2.7 | 7 | 열정가 / 모험가 | p175 | p179 | p184 | so_7 (Sacrifice) |
| 2.8 | 8 | 도전자 / 보호자 | p126 | p128 | p131 | so_8 (Solidarity) |
| 2.9 | 9 | 평화주의자 / 중재자 | p81 | p84 | p86 | so_9 (Participation) |

각 type 의 Center / Passion / Defense / Hornevian / Harmonic / 회피는 [complete_enneagram_kb.md](../../knowledge_base/enneagram/complete_enneagram/complete_enneagram_kb.md) 의 매트릭스 + Type N 섹션 참조.

- [ ] **Step 2.X.3: verify**

```bash
node docs/_meta/enneagram/verify.mjs 2.X
```

- [ ] **Step 2.X.4: Commit + WORK_STATUS 갱신 + HISTORY**

```bash
git add docs/knowledge_base/enneagram/complete_enneagram/subtypes_27.md docs/_meta/enneagram/WORK_STATUS.md docs/_meta/enneagram/HISTORY.md
git commit -m "feat(enneagram-kb): add Type N subtypes (sp_N, so_N, sx_N) to subtypes_27.md"
```

WORK_STATUS — `current_task = "2.<X+1>"`. HISTORY 에 complete.

---

## 5. Task 2.10 — Phase 2 종료 검증 + Phase 3 인계

**Files:**
- Create: `docs/_meta/enneagram/PHASE_3_PLAN.md` (placeholder)
- Modify: `docs/_meta/enneagram/WORK_STATUS.md` (Phase 3 로 전환)
- Modify: `docs/_meta/enneagram/HISTORY.md` (Phase 2 complete)

**Inputs:**
- 모든 Phase 2 산출물 (subtypes_27.md 완성된 형태)

**Definition of Done:**
- [ ] `node docs/_meta/enneagram/verify.mjs all` 통과 (1.0-1.7 + 2.0-2.9 의 file spec 모두)
- [ ] `subtypes_27.md` 가 27 subtype 모두 포함 (`grep -c '^### s[pox]_[1-9] ' = 27`)
- [ ] PHASE_3_PLAN.md placeholder 생성 (스코어링 정확도 task 분해 가이드)
- [ ] WORK_STATUS — `current_phase = 3`, `current_task = "3.0"`
- [ ] HISTORY — Phase 2 complete 한 줄

### Steps

- [ ] **Step 2.10.1: 전체 verify**

```bash
node docs/_meta/enneagram/verify.mjs all
```

기대 — `OK: task all verified (<N> files)`. 실패 시 해당 task 로 돌아가 수정.

- [ ] **Step 2.10.2: 27 subtype 카운트**

```bash
grep -c '^### s[pox]_[1-9] ' docs/knowledge_base/enneagram/complete_enneagram/subtypes_27.md
```

기대 — 27.

- [ ] **Step 2.10.3: PHASE_3_PLAN.md placeholder**

`docs/_meta/enneagram/PHASE_3_PLAN.md` 신규 작성.

```markdown
<!-- Phase 3 (스코어링 정확도) plan placeholder -->
---
kb_id: enneagram_test_meta.phase_3_plan
title: "Phase 3 Implementation Plan — Scoring Accuracy"
phase: 3
created_at: <ISO>
status: placeholder
retrieval_tags: [phase_3, placeholder, scoring_accuracy]
---

# Phase 3 Implementation Plan — Scoring Accuracy

이 plan 은 Phase 3 시작 시 작성됩니다. Phase 1-2 의 KB 위에서 `js/test.js` 의 가중치/타이브레이커/wing %/instinct % 산출식을 KB 와 정렬합니다.

## 작성 가이드

- task 분해 — (1) 가중치 재교정 (2) 타이브레이커 활성화 조건 점검 (3) wing % 산출식 정의 (4) instinct % 산출식 정의 (5) state vs trait 분리 강화 (6) unit test 추가 (7) 통합 검증.
- 입력 — 현재 `js/test.js` (969 줄), Phase 1 KB foundation, Phase 2 subtypes_27 콘텐츠.
- 산출물 — `js/test.js` 갱신, 새 helper 모듈 (예 — `js/test-scoring.js`), unit test 파일.
- writing-plans skill 호출 후 본 placeholder 를 실제 plan 으로 덮어씀.

## Phase 3 종료 조건

- 결과지 형식 `<core>w<wing>(<%>) <inst1>(<%>) <inst2>(<%>) <inst3>(<%>)` 산출 가능
- unit test 통과
- WORK_STATUS.current_phase = 4 로 전환
```

- [ ] **Step 2.10.4: WORK_STATUS Phase 2 → Phase 3 전환**

`current_phase = 3`, `current_task = "3.0"`, `last_updated = now`.

- [ ] **Step 2.10.5: HISTORY 갱신 + Final commit**

HISTORY 에 `Phase 2 complete` 한 줄 추가.

```bash
git add docs/_meta/enneagram/
git commit -m "chore(enneagram-kb): close Phase 2 (27 subtypes depth), advance to Phase 3"
```

다음 wakeup 은 Phase 3 의 task 3.0 (PHASE_3_PLAN 작성) 시작.

---

## 6. Self-Review 체크리스트

작성 후 점검.

- [x] 모든 task 가 self-contained — 7 슬롯 템플릿 + 입력 소스 명시
- [x] 모든 step 에 정확한 파일 경로 + commit 메시지 + 검증 명령
- [x] No placeholders — 각 type 의 source page + 한국어 이름 + countertype 모두 표기
- [x] 각 task Definition of Done 명확
- [x] 락 protocol Phase 1 와 동일하게 적용
- [x] 토큰 graceful — 각 type task 가 30-45 분 추정, sub-step 4 단계로 분할
- [x] verify.mjs spec 의 점진 minLines 가 합리적 (단조 증가)
- [x] PDF 직접 인용 0회 (저작권 + 토큰 보호)
- [x] CLAUDE.md rule 준수 — 한국어 헤더, 콜론 끝 X, 세만틱 commit
- [x] 27 countertype subtype 모두 헤더 표기 가이드 명시

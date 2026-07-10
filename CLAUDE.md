# CLAUDE.md

This file helps Claude Code and other AI agents work on this repository from the same shared context.

## ⚡ 활성 자동화 작업

ER Enneagram Test 발전 프로젝트가 하드-오토 스케줄로 진행 중입니다. 작업 시작 전 반드시 [docs/_meta/enneagram/HANDOFF.md](./docs/_meta/enneagram/HANDOFF.md) 를 읽고 5단계 protocol 을 따르세요. 진행 상태는 [WORK_STATUS.md](./docs/_meta/enneagram/WORK_STATUS.md).

## Project Context

This repo is the ER Website, including an Enneagram diagnostic test and related coach/report workflows.

Important diagnostic files:

- `test.html` - diagnostic test page.
- `js/test.js` - main diagnostic test logic and question flow.
- `css/test.css` - diagnostic test styling.
- `docs/diagnostic_test_structure.md` - human-readable structure of the current adaptive test.
- `docs/diagnostic_test_question_bank_full.md` - current full question bank reference.
- `docs/diagnostic_test_questions.txt` - plain question list.

## Enneagram Knowledge Base

Use the derived knowledge base here:

- `docs/knowledge_base/enneagram/complete_enneagram/README.md`
- `docs/knowledge_base/enneagram/complete_enneagram/source_page_index.md`
- `docs/knowledge_base/enneagram/complete_enneagram/complete_enneagram_kb.md`
- `docs/knowledge_base/enneagram/complete_enneagram/type_pair_disambiguation.md`

Source PDF:

- `/Users/Joeyswoo/Downloads/Complete_Enneagram.pdf`
- Source title: `The Complete Enneagram: 27 Paths to Greater Self-Knowledge`
- Author: Beatrice Chestnut
- SHA-256: `d6e3648137de01cc51537243b0211cb81d68220c68a1dd4139d270cac25c8ca1`

The Markdown KB is a derived index and summary, not a full transcription. Do not copy long passages from the PDF into source code, docs, prompts, or generated reports. Use short references, summaries, and `pNNN` PDF page citations.

Fast retrieval examples:

```bash
rg "Sexual Six|countertype|Strength/Beauty" docs/knowledge_base/enneagram/complete_enneagram
rg "Type Five|Avarice|Isolation|Castle" docs/knowledge_base/enneagram/complete_enneagram
rg "Twos and Eights|2 vs 8|Social Two" docs/knowledge_base/enneagram/complete_enneagram
```

## Design System

시각·UI 관련 결정을 하기 전에 반드시 [DESIGN.md](./DESIGN.md)를 먼저 읽으세요.
서체, 색, 간격, 컴포넌트 패턴, 금지 패턴이 모두 거기에 정의되어 있습니다.
사용자의 명시적 승인 없이 시스템에서 벗어나지 마세요.
QA 시 DESIGN.md와 어긋나는 코드(특히 hex 하드코딩, 구 브라운 토큰)를 플래그하세요.

## Diagnostic Design Principles

When improving the test, prioritize motivation over surface behavior.

Use these axes:

- Core type: attention, motivation, passion, defense, avoidance pattern.
- Subtype: self-preservation (`sp`), social (`so`), sexual/one-to-one (`sx`) expression after core narrowing.
- Countertype: do not eliminate a type just because behavior looks opposite to the stereotype.
- Tie-breakers: when two types are close, use `type_pair_disambiguation.md` to create pair-specific questions.
- Recent state: keep stress, defensiveness, and unusual recent behavior separate from stable type scoring.

Avoid generic type questions when a pair-specific split is available. For example, `1 vs 6` should separate mistake/wrongness from threat/uncertainty, not just ask whether the user is responsible or anxious.

## Working Agreements

- Preserve user changes. The worktree may already contain edits from another agent or the user.
- Do not revert unrelated files.
- Keep diagnostic copy concrete and natural in Korean.
- Update docs when question logic, scoring, or test structure changes.
- Prefer small, reviewable edits over broad rewrites.
- Use `rg` for search.
- If changing JavaScript behavior, inspect the relevant test flow before editing.

## Verification

For static content or docs:

```bash
rg "keyword" docs/knowledge_base/enneagram/complete_enneagram
```

For test UI changes, run or open the local page and verify:

- question flow still advances correctly,
- adaptive stages still trigger correctly,
- result/report generation still works,
- mobile layout does not overlap,
- Korean text fits in buttons and cards.

## Git Hygiene

Before finishing, check:

```bash
git status --short
git diff --stat
```

Clearly separate your own changes from pre-existing user or agent changes in the final summary.

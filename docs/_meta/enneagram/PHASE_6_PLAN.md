<!-- Phase 6 (Premium Polish) plan — 결과지 비주얼 업그레이드, Birkman Signature Report 참조 -->
---
kb_id: enneagram_test_meta.phase_6_plan
title: "Phase 6 Implementation Plan — Premium Visual Polish ($100 Result Page)"
phase: 6
created_at: "2026-05-19"
last_updated: "2026-05-19"
status: ready_to_execute
total_tasks: 5
estimated_total_minutes: "180-280"
related_files:
  - simulation_report.md
  - CONTEXT.md
  - WORK_STATUS.md
retrieval_tags:
  - phase_6
  - visual_upgrade
  - birkman_reference
  - 3_center_colors
  - logogram
  - signature_summary
  - chart_js
---

# ER Enneagram Test — Phase 6 (Premium Visual Polish) Implementation Plan

> Reference — `/Users/Joeyswoo/Library/Mobile Documents/com~apple~CloudDocs/Desktop/Visual Studio Code/test-results/HAN_JEEMIN_G6VDFM-Signature.pdf` (32 페이지 Birkman 디자인).

**Goal:** 결과지를 $100 가치의 멀티섹션 웹 + PDF 로 업그레이드. Birkman 디자인 차용 + ER 브랜드 톤 유지.

**Architecture:** Single test.html scroll page, 15 sections, 3-center color palette (Body/Heart/Head), Chart.js + 인라인 SVG 하이브리드, CSS gradient logogram (placeholder, 추후 디자이너 이미지로 교체 가능).

**Tech Stack:** Vanilla JS + Tailwind + Chart.js CDN + 인라인 SVG. html2canvas + jspdf (이미 로드됨, PDF 자동 캡처).

---

## 0. Task Index

| ID | 제목 | 추정(분) |
|---|---|---:|
| 6.2 | Phase 6 plan + design spec (이 파일) | 20 |
| 6.3 | Cover + 섹션 디바이더 + logogram CSS + test.html 구조 재편 | 45-60 |
| 6.4 | Chart 컴포넌트 — Chart.js + SVG (9-type donut, 3-center pie, 에니어그램 지도, wing/instinct viz) | 45-70 |
| 6.5 | Subtype profile + sister-subtype 비교 + confused-with + countertype 강화 | 35-50 |
| 6.6 | Signature Summary 1-page + Action Plan + PDF capture + closure | 35-50 |

---

## 1. Design Spec

### 1.1 컬러 시스템 (3 Center 기반)

| Center | Types | 컬러 | 헥스 |
|---|---|---|---|
| Body / Gut | 8, 9, 1 | 따뜻한 빨강 | `#C44536` |
| Heart / Image | 2, 3, 4 | 짙은 초록 | `#5A8F69` |
| Head / Fear | 5, 6, 7 | 차분한 파랑 | `#3D5A80` |

ER 브랜드 액센트 — `#bfa68a` (베이지 골드), `#4a4540` (다크 브라운). 위 3 center 색이 primary, ER 베이지/브라운이 background + 본문 색.

### 1.2 본능 색 (3 Center 와 별개 차원)

| Instinct | 컬러 | 헥스 |
|---|---|---|
| sp (자기보호) | 따뜻한 어스 | `#A0522D` |
| sx (일대일) | 강렬 자홍 | `#9C3848` |
| so (사회) | 차분 청록 | `#3E7CB1` |

### 1.3 결과지 섹션 구성 (15 섹션)

```
1.  Cover           — logogram "당신의 27 SUBTYPE", 사용자 이름, 날짜
2.  Welcome         — 결과지 사용법 + 7-70년 학술 근거 (Chestnut 출처)
3.  Color Key       — 3 Center 컬러 키 (RED/GREEN/BLUE)
4.  Enneagram Map   — 9점 다이어그램 + 사용자 위치 (4 심볼)
5.  9 Type Scores   — 9 type 도넛 차트 + 자기 score
6.  Wing Analysis   — wing 메터 + 강도 해석 5단계
7.  Instinct Stack  — 3 본능 % 바 + dominant/blind 안내
8.  Triads          — Center / Hornevian / Harmonic 3 카드
9.  Your Subtype    — main subtype 카드 (이름 + 핵심 집착)
10. Subtype Detail  — 7 슬롯 (signatures / defense / shadow / sister-diff / confused-with / Korean copy)
11. Countertype     — countertype 시 강조 안내 (조건부)
12. Growth          — stress/integration arrows 시각화 + 성장 방향
13. Action Plan     — Birkman 스타일 워크시트 (입력 필드)
14. Signature       — 1-page 압축 대시보드 (모든 결과 종합)
15. Sources         — Chestnut 출처 + 학술적 신뢰도
```

### 1.4 Logogram 패턴 (CSS)

```css
.logogram-text {
  background: linear-gradient(135deg,
    #C44536 0%, #C44536 33%,
    #5A8F69 33%, #5A8F69 66%,
    #3D5A80 66%, #3D5A80 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

추후 디자이너가 PNG/SVG 로고 제공 시 교체. 현재는 CSS 그라데이션으로 모자이크 느낌.

### 1.5 차트 라이브러리

- Chart.js 4.x (CDN) — 9 type 도넛, 3 center 파이, 라디얼 차트
- 인라인 SVG — 에니어그램 9점 지도, wing 메터, 화살표
- Tailwind 막대 — 본능 stack, type 점수 막대

CDN — `<script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>`.

### 1.6 PDF Capture

기존 html2canvas + jspdf 그대로. `#result-view` 전체 캡처 → 멀티페이지 PDF 자동 분할. 신규 15 섹션 모두 자동 포함.

---

## 2. Task 6.3 — Cover + 섹션 디바이더 + 구조 재편

**Files:** test.html, css/test.css (or inline)

**Definition of Done:**
- [ ] test.html `#result-view` 안에 15 섹션 컨테이너 (각 `<section id="rs-N-name">`)
- [ ] CSS — `.logogram-text` (3 color gradient), `.section-divider` (큰 글자 + 부제), `.center-red` / `.center-green` / `.center-blue` (3 center 액센트)
- [ ] 각 섹션 디바이더에 logogram 텍스트
- [ ] 빈 컨테이너 — 콘텐츠는 다음 task 에서 채움

---

## 3. Task 6.4 — Charts

**Files:** test.html, js/test-charts.js (신규), js/test.js 와이어링

**Definition of Done:**
- [ ] Chart.js CDN 로드
- [ ] 9 type 점수 도넛 차트 — 결과 산출 후 동적 생성
- [ ] 3 center 합산 파이 차트 (3 type 합 색별)
- [ ] 에니어그램 9점 지도 SVG — 9 type 원형 배치 + 사용자 score 가시화 (점 크기 또는 색 강도)
- [ ] wing 메터 SVG (기존 향상)
- [ ] 본능 stack 바 (기존 유지)

---

## 4. Task 6.5 — Subtype Profile + Comparisons

**Files:** js/test-result-renderer.js (확장), test.html

**Definition of Done:**
- [ ] Main subtype 카드 — 큰 헤더 + nameKr + name (countertype 표시)
- [ ] 7 슬롯 모두 표시 (preoccupation, defense, signatures, shadow, sister-diff, confused-with, description)
- [ ] sister-subtype 비교 — 테이블 형태 (3 컬럼: 본인 / 다른 2 sister)
- [ ] confused-with 카드 — 헷갈리는 type 명시 + 차이점
- [ ] countertype 시 amber 배너 + 상세 안내 (왜 countertype 이고 어떻게 다른가)
- [ ] 3 center 컬러로 카드 좌측 액센트 (예 — Type 7 = Head = 파란색)

---

## 5. Task 6.6 — Signature Summary + Action Plan + Closure

**Files:** test.html (추가), js/test-result-renderer.js (확장)

**Definition of Done:**
- [ ] Signature Summary 섹션 — Birkman Advanced Summary 스타일 1-page 압축 대시보드 (모든 차트 + score 종합)
- [ ] Action Plan 워크시트 섹션 — 입력 필드 5개 (key insights, build, develop, share, accountability)
- [ ] PDF 캡처 테스트 — `downloadResultPdf` 호출 시 신규 섹션 모두 캡처되는지 확인
- [ ] Phase 6 closure — WORK_STATUS current_phase=7 또는 paused=true, HISTORY 마지막 로그

---

## 6. Verify Spec 추가

verify.mjs 의 task 6.X spec.

```javascript
'6.2': [{ path: 'docs/_meta/enneagram/PHASE_6_PLAN.md', minLines: 100, maxLines: 800 }],
'6.3': [{ path: 'test.html', minLines: 200, maxLines: 800, requireOurFrontmatter: false }],
'6.4': [{ path: 'js/test-charts.js', minLines: 80, maxLines: 400, requireOurFrontmatter: false }],
'6.5': [{ path: 'js/test-result-renderer.js', minLines: 200, maxLines: 600, requireOurFrontmatter: false }],
'6.6': [{ path: 'test.html', minLines: 250, maxLines: 1000, requireOurFrontmatter: false }],
```

# Premium Report Phase A QA — 2026-06-22

## Scope

Phase A goal: generate three premium report samples and audit visual/content readiness for a $100 paid report experience.

Samples generated from the current premium v2 path:

- `test.html`
- `js/test.js`
- `js/diagnostic-report-content.js`
- `js/report-support-materials.js`
- `css/test.css`

Legacy renderer/charts/subtype modules were not used.

## Local Artifacts

Generated locally only. Do not commit these large QA artifacts.

```text
.tmp-premium-report-qa/2026-06-22/sample_7w8_sx.pdf
.tmp-premium-report-qa/2026-06-22/sample_7w8_sx.fullpage.png
.tmp-premium-report-qa/2026-06-22/sample_7w8_sx.contact.png

.tmp-premium-report-qa/2026-06-22/sample_4w5_sp.pdf
.tmp-premium-report-qa/2026-06-22/sample_4w5_sp.fullpage.png
.tmp-premium-report-qa/2026-06-22/sample_4w5_sp.contact.png

.tmp-premium-report-qa/2026-06-22/sample_9w8_so.pdf
.tmp-premium-report-qa/2026-06-22/sample_9w8_so.fullpage.png
.tmp-premium-report-qa/2026-06-22/sample_9w8_so.contact.png
```

## Sample Metrics

| Sample | PDF Pages | PDF Size | Report Height | Body Text | Sections | Final CTA | Next Step Keys |
|---|---:|---:|---:|---:|---:|---|---|
| `7w8 sx` | 13 | 12.8 MB | 10,720 px | 5,430 chars | 9 | `result_consult` | `result_consult`, `basic_course`, `identity_session` |
| `4w5 sp` | 13 | 12.7 MB | 10,588 px | 5,192 chars | 9 | `result_consult` | `result_consult`, `basic_course`, `identity_session` |
| `9w8 so` | 13 | 12.7 MB | 10,588 px | 5,203 chars | 9 | `result_consult` | `result_consult`, `basic_course`, `identity_session` |

## Pass

- Mockup/background assets are visible in the report style layer.
- One primary font family is used in the report; the previous mixed-font issue is not visible in these samples.
- Confidence wording no longer says "보통" in the visible report; it displays "중간 이상" or "높음".
- Final CTA copy and route are aligned: "결과지 해석상담 신청" routes to `result_consult`.
- The business/application layer is present: needs, desires, strengths, defensive patterns, how others can help, and counseling/school bridge.
- Large empty pages are not visible in the generated full-page screenshots. Density is materially better than the earlier sparse report.

## Gaps

### P1 — Paged PDF Control

The report still renders as a long web page, then becomes a PDF. The generated PDFs are 13 pages for roughly 5.2k-5.4k Korean characters. This is too long for the current perceived depth.

Risk:

- Cards and sections can be cut by arbitrary PDF page boundaries.
- Page count increases faster than perceived value.
- The report can feel like a web page printed to PDF rather than a designed premium result document.

Recommendation:

- Add a report-specific print layout with explicit page templates.
- Use `break-inside: avoid` for cards, CTA blocks, graph panels, and action-plan groups.
- Target 8-10 designed pages before adding more content.

### P1 — First-Page Executive Summary

The cover is clean and now uses background imagery, but the first page still does not answer quickly enough:

"So what did I learn about myself?"

The hero title is stronger than before, but the current first screen relies on large heading + basic summary cards. It needs one premium "executive summary" card that makes the result feel interpreted, not assembled.

Recommendation:

- Put one executive summary card on page 1, directly under the hero.
- Combine top type, subtype, wing, confidence, close types, and counseling focus into one scannable block.
- Move the first consultation hook into page 1 without making it look like a sales banner.

### P1 — Personal Synthesis Copy

The samples still read partly like:

```text
core type explanation + instinct explanation + wing note
```

This is understandable, but not yet a $100 "this is my story" experience.

Recommendation:

- Introduce a synthesis paragraph per `reportKey` pattern.
- Replace generic "subtype insight + wing note" with a generated/interpreted paragraph:
  - what this combination tends to protect
  - what it overuses under pressure
  - what close people experience
  - what counseling should verify
- Prioritize `7w8 sx`, `4`, and `9` because they are current QA samples.

### P2 — Visual Hierarchy in Graph/Signal Sections

The graph section is no longer empty, but it still presents metrics before interpretation. Users need the conclusion first.

Recommendation:

- Rename the section from "시각화로 보는 점수 흐름" to a more interpretive title such as "왜 이 결과가 나왔는가".
- Put a one-sentence conclusion above each graph:
  - "7번이 선명하지만 8번 에너지가 강하게 함께 올라왔습니다."
  - "본능은 sx가 가장 선명해, 관계의 강도와 몰입에서 패턴이 먼저 켜집니다."
- Keep charts as evidence, not the primary message.

### P2 — Repeated Template Rhythm

Across 7w8/sx, 4w5/sp, and 9w8/so, the page rhythm is almost identical. Consistency is good, but the product can feel templated.

Recommendation:

- Keep page architecture consistent.
- Vary the synthesis and counseling hook by type family:
  - 7: emotional avoidance, unfinished grief, commitment in close relationship
  - 4: comparison/deficiency loop, ordinary love, embodied stability
  - 9: disappearing preference, conflict tolerance, embodied agency

### P2 — CTA Placement

The final CTA is strong and correctly centered on result consultation. However, the first explicit next-step rationale appears late in the report.

Recommendation:

- Add a soft page-1 bridge:
  - "이 결과는 혼자 확정하는 판정이 아니라, 상담에서 실제 삶의 장면과 연결할 때 가장 정확해집니다."
- Keep the final CTA as the strongest conversion point.

## Executive Summary Card Sketch

Placement: page 1, under the hero and before long detail sections.

Purpose: make the paid report feel interpreted within the first viewport/page.

### Card Title

```text
이 결과에서 가장 먼저 볼 것
```

### Layout

```text
[Core Type]      [Subtype]
7번 열정형       성적/일대일
가능성으로       깊은 몰입과 강한 끌림에서
생동감을 회복    패턴이 먼저 켜짐

[Wing]           [Confidence]
w8               해석 신뢰도: 중간 이상
강한 추진력과    7번 방향은 선명하지만,
주도성           8번 영향은 상담에서 확인 권장

[Close Types]
8번 / 9번 / 3번
헷갈릴 수 있는 가까운 유형

[Counseling Focus]
상담에서는 "불편한 감정을 가능성으로 빠르게 바꾸는가"와
"주도권을 잃는 느낌을 참기 어려운가"를 함께 확인합니다.
```

### Behavior

- Desktop: 2x2 cards + full-width counseling focus strip.
- Mobile/PDF: stacked compact cards; no nested cards.
- Color tone follows `data-core-tone`.
- No extra graph in this card. This is the conclusion card, not the evidence card.

### Data Inputs

- `model.display.core`
- `model.display.subtype`
- `model.display.wing`
- `model.display.confidence`
- `model.top3`
- `model.confidenceExplanation.consultationQuestions`
- `model.content.motivation`
- `model.content.fear`

## Next Implementation Order

1. Add executive summary card to premium report renderer and CSS.
2. Add paged/print CSS for PDF export: page breaks, card break control, CTA grouping.
3. Compress or restructure graph/summary sections to reduce 13 pages toward 8-10 pages.
4. Add synthesis copy layer for `7w8 sx`, `4`, and `9` samples before expanding all 27 combinations.
5. Regenerate the same 3 PDFs and compare page count, section clipping, first-page clarity, CTA visibility.

Do not start weight recalibration until there are at least 100 usable experiment rows.

# ER Enneagram Premium Report V2 Design

Date: 2026-06-17
Status: User-approved direction, ready for implementation planning after review

## Decision

Build the ER Enneagram result into a true premium PDF report, not a web result page exported as PDF.

The target is an 18-22 page Korean-first report that combines:

- the visual warmth and botanical editorial direction from the user's `mockup1.png` through `mockup10.png`,
- the product depth and information architecture strengths observed in the HAN_JEEMIN Birkman reference reports,
- ER's own theological and restoration-centered interpretation of Enneagram patterns,
- the existing 54 chemistry cards, scoring data, wing data, instinct data, and program recommendations already built in this branch.

This V2 report should feel more valuable than the supplied reference reports, while avoiding direct copying of their proprietary text, branding, charts, or copyrighted layout. We will borrow product principles, not assets or wording.

## Reference Inputs

### User Mockups

Directory:

`/Users/jwoo/Library/Mobile Documents/com~apple~CloudDocs/Desktop/Visual Studio Code/ER-Website/test-results`

Current visual mockups:

- `mockup1.png` - premium cover direction with large `SX 7w8`, warm paper texture, botanical corner accent, centered ER identity.
- `mockup2.png` - one-page overview with icon rows, high-trust summary fields, and subtype quote panel.
- `mockup3.png` - chemistry interpretation page with large editorial quote, botanical illustration, timeline explanation, and summary cards.
- `mockup4.png` - strengths and fit page with four quadrant cards and coaching questions.
- `mockup5.png` - score-flow page with instinct bars, wing donut, direction cards, and top-three type rows.
- `mockup6.png` - cycle page with numbered vertical timeline, formation story, distorted-self list, and restoration preview.
- `mockup7.png` - application page for work, relationships, and parenting, with stress/recovery signal panel.
- `mockup8.png` - core motivation and core fear page with two-column explanation and balancing recommendations.
- ` mockup9.png` - possibility-unlocking page. The current filename includes a leading space; implementation should either handle this exact path during reference review or the file should be renamed to `mockup9.png` before scripted processing.
- `mockup10.png` - sustainable growth and change page with principles, recommendations, journey note, scenic image panel, and next-step cards.

If the user adds `mockup11.png` or later files before implementation planning, those files must be inspected and mapped into the page plan before writing code.

### HAN_JEEMIN Reference Reports

Reference files:

- `HAN_JEEMIN_G6VDFM-AdvSumm.pdf` - 1 page, compact dashboard.
- `HAN_JEEMIN_G6VDFM-CareerExploration.pdf` - 16 pages, dense narrative plus career matching.
- `HAN_JEEMIN_G6VDFM-ImageManagement.pdf` - 1 page, focused interpretive deep dive.
- `HAN_JEEMIN_G6VDFM-Signature.pdf` - 32 pages, full product experience.

Strengths to adopt:

- A premium cover that signals a paid assessment product before any content is read.
- A high-density summary page that lets the user understand their result in one glance.
- A repeatable visual language that appears across the report, so users remember their own pattern.
- Clear sections for ordinary behavior, needs, stress behavior, strengths, challenges, and how others may perceive the person.
- Long-form narrative broken into practical subsections rather than left as one essay.
- Summary pages that restate the key points after detailed pages.
- Application sections that translate personality data into career, relationships, team roles, stress management, and next steps.
- Footer/page-number discipline, consistent header structure, and controlled whitespace.

Strengths not to adopt:

- Birkman color categories, proprietary labels, or exact wording.
- Dense job-family tables unless ER has enough validated data to make them meaningful.
- Corporate clinical tone that would conflict with ER's restoration, coaching, and discipleship voice.

## Product Goals

- Make the result feel worth at least a $100 paid test before upsells are shown.
- Help the user feel personally seen, not merely categorized.
- Provide enough structure that a coach can use the PDF in a follow-up session.
- Convert from free/self-test curiosity into coaching, typing consultation, or ER programs without making the report feel like a sales page.
- Make the report visually strong enough to compare favorably with the user's Birkman examples.

## Non-Goals

- Do not create a separate backend or paid checkout flow in this phase.
- Do not revise all 54 chemistry card JSON files unless the V2 layout exposes a specific missing field.
- Do not ship unverified career claims. Career/application content should be phrased as fit patterns, not formal job-placement recommendations.
- Do not rely on unavailable custom fonts or image assets. Use web-safe deliverable assets already in the repo or committed as part of this branch.

## Visual Direction

The V2 visual system follows the user's mockups:

- Warm ivory paper background with subtle texture.
- Deep forest green as the primary identity color.
- Muted bronze/gold as the secondary accent.
- Soft olive, sand, and clay tones for supporting states.
- Botanical leaf accents used sparingly as editorial framing, not decoration everywhere.
- One font family across the report, matching the user's earlier request. The recommended implementation font is `Pretendard` for Korean readability, with size/weight contrast doing the work instead of multiple font families.
- Large, elegant page titles and generous margins.
- Thin dividers, low-contrast borders, and restrained card shadows.
- Icons should be simple line icons in circular badges. Use the existing icon approach or a small inline icon set; avoid busy illustrations.

The visual result should be closer to an editorial coaching dossier than a web dashboard.

## Report Information Architecture

Target length: 18-22 PDF pages for the first V2 release. The first ten pages should follow the user's mockup sequence closely enough that the user can recognize their design direction in the generated PDF.

### Page 1 - Premium Cover

Purpose: immediate perceived value.

Content:

- ER logo and `Enneagram for Restoration`.
- `Enneagram Premium Report`.
- Main title: `적응형 에니어그램 심층 진단`.
- Large result code, for example `SX 7w8`.
- Human-readable identity statement.
- Core type, dominant instinct, wing, confidence.
- Medical/clinical disclaimer in quiet text.

Visual basis: `mockup1.png`.

### Page 2 - One-Glance Result

Purpose: the user's quick executive summary.

Content:

- Core type.
- Subtype.
- Wing.
- Confidence.
- Core motivation.
- Core fear.
- Growth direction and stress direction.
- Subtype interpretation quote.

Visual basis: `mockup2.png`.

### Page 3 - Combination Deep Interpretation

Purpose: the premium "this is me" moment.

Content:

- Large editorial sentence describing the exact type-instinct-wing combination.
- 2-3 paragraphs explaining the combination.
- Three summary cards: primary energy, relational pattern, repeated pattern.
- Closing quote.

Visual basis: `mockup3.png`.

### Page 4 - Strengths And Fit

Purpose: turn diagnosis into usable language.

Content:

- Strengths.
- Overuse risks.
- Best-fit environments.
- Draining environments.
- Coaching questions.

Visual basis: `mockup4.png`.

### Page 5 - Score Flow Dashboard

Purpose: show the result was computed, not guessed.

Content:

- Instinct bars.
- Wing donut or split ring.
- Growth/stress direction cards.
- Top-three type relative share rows.
- One interpretive quote.

Visual basis: `mockup5.png`.

### Page 6 - Repeated Cycle

Purpose: help the user recognize their automatic loop.

Content:

- Five-step repeated cycle timeline.
- Formation story.
- Distorted self / false self signals.
- Restoration preview.

Visual basis: `mockup6.png`.

### Page 7 - Life Application Patterns

Purpose: translate the result into daily life.

Content:

- Work and career.
- Relationships.
- Parenting or mentoring.
- For each context: strengths, what to watch together, and "starting today" practices.
- Stress signals and recovery signals in a horizontal panel.

Visual basis: `mockup7.png`.

### Page 8 - Core Motivation And Fear

Purpose: name the engine and the drain behind the pattern.

Content:

- Core motivation.
- Core fear.
- Healthy use of the motivation.
- Ways the fear appears as lost opportunity, restriction, failure, or evaluation.
- Balancing practices.

Visual basis: `mockup8.png`.

### Page 9 - Keys That Open Possibility

Purpose: help the user see internal resources and practical growth keys.

Content:

- Unique resources already present in the person.
- Growth keys that open larger possibility.
- Five-step next action sequence.
- Encouraging closing quote.

Visual basis: ` mockup9.png`.

### Page 10 - Sustainable Growth And Change

Purpose: make the report end-user actionable without sounding like homework.

Content:

- Principles of sustainable growth.
- Personalized growth recommendations.
- Journey note.
- Visual image panel or soft landscape block.
- Next-step cards.
- Closing quote.

Visual basis: `mockup10.png`.

### Pages 11-12 - Core Type, Instinct, And Stack

Purpose: establish type-level and instinct-level depth beyond the chemistry card.

Content:

- Core desire and core fear.
- Passion/automatic emotional habit.
- Defense pattern.
- Dominant instinct in ordinary language.
- Secondary instinct as support.
- Blind/repressed instinct as missing area.
- How the stack appears in relationships, work, decision-making, and spiritual formation.
- Small triangular or three-column stack visualization.

### Page 13 - Wing And Adjacent Types

Purpose: explain why this result is not just the core type.

Content:

- Wing strength.
- Adjacent wing comparison.
- What the wing adds.
- What the wing can distort.
- Why the runner-up type may appear.

### Pages 14-15 - Work, Vocation, And Team Fit

Purpose: bring over the strongest "career exploration" value without overclaiming.

Content:

- Best work conditions.
- Roles or responsibilities that energize this pattern.
- Tasks/environments likely to drain the pattern.
- Communication style at work.
- Team contribution.
- Leadership and followership notes.
- Questions to ask before taking on a role.

This section should be fit-pattern based, not a formal career inventory.

### Pages 16-17 - Relationships, Family, And Conflict

Purpose: make the report emotionally useful.

Content:

- How this pattern seeks closeness.
- How it protects itself.
- Common relational misunderstanding.
- What partners/friends/children may experience.
- Repair moves.
- Conversation prompts.

### Page 18 - Stress And Restoration Plan

Purpose: practical next steps.

Content:

- Stress signals.
- Recovery signals.
- Three-step reset practice.
- Weekly reflection.
- Small action plan.

### Page 19 - Faith And Restoration

Purpose: keep ER's distinctive Christian restoration frame.

Content:

- False belief.
- Gospel truth.
- Repentance/turning direction.
- Prayer.
- Practices that support restoration.

This page must be optional in tone, not coercive. It should feel like invitation, not pressure.

### Page 20 - Summary And Next Steps

Purpose: close like a professional report, then offer next steps.

Content:

- Final one-page summary.
- Most important things to remember.
- Recommended ER next step cards.
- Quiet CTA.
- Disclaimer.

The final page should not feel like a web landing-page sales block.

## Content Model

The current data model already supports the first V2 slice:

- core type, wing, wing percentage,
- instinct percentages,
- top-three type shares,
- stress/growth arrows,
- chemistry card display fields,
- practical insights,
- next-step program recommendations.

Likely V2 additions:

- `report_v2` display object per chemistry card or derived fallback from existing fields.
- Type-level content modules for 1-9.
- Instinct-stack content modules for six stack orders.
- Page-level copy constants for disclaimers and ER voice.
- Visual metadata for icons and accent colors by type/instinct.

V2 should avoid duplicating long prose inside `js/test.js`. Long content should live in structured data files or generated runtime data, following the pattern already used by `docs/report-content/chemistry/*.json` and `js/report-chemistry-data.js`.

## Architecture

### Rendering Boundary

Split the current monolithic report rendering into smaller units:

- `buildPremiumReportModel()` remains the model builder.
- Add a V2 model adapter that prepares page-level sections from scoring and content data.
- Add renderer functions per report page or page family.
- Keep PDF-specific layout classes separate from ordinary web result classes.

Recommended files:

- `js/report-v2-renderer.js` for page render functions.
- `js/report-v2-data.js` for generated runtime content if needed.
- `css/report-v2.css` for V2 report layout and print rules.
- `scripts/render_report_review_bundle.mjs` updated to support V2 sample bundles.
- `scripts/qa_premium_report_pdf.mjs` expanded with V2 visual/page-count expectations.

### Compatibility

The existing result flow should continue to work while V2 is built.

Recommended rollout:

- Keep current renderer available as fallback.
- Add a feature flag or route parameter such as `?debugReport=sx_7_w8&reportVersion=v2`.
- Once V2 passes QA, make V2 the default for premium result rendering.

## PDF Requirements

- Letter portrait output.
- Target 18-22 pages for the V2 premium sample.
- No mostly blank final page.
- Page header and footer discipline on all internal pages.
- Page numbers visible and consistent.
- Repeatable margins and section spacing.
- PDF should render from Playwright without relying on browser-only interactivity.
- Web-only controls must be hidden in print.
- Charts and icons must remain sharp in PDF.

## QA And Acceptance Criteria

The first V2 sample is `sx_7_w8`, because it is the current gold sample.

Acceptance criteria:

- `sx_7_w8` V2 PDF renders successfully.
- PDF page count is between 18 and 22 pages.
- The first ten pages visually match the intent of `mockup1.png` through `mockup10.png`.
- The report includes a one-page dashboard comparable in density to `HAN_JEEMIN_G6VDFM-AdvSumm.pdf`, but visually ER-branded.
- The report includes practical sections comparable in usefulness to the Career and Signature reports: work fit, relationship fit, stress behavior, how others may experience the pattern, and next steps.
- No internal review notes, source notes, raw JSON labels, or Anara drafting artifacts appear.
- The phrase `조합만의 화학` must not appear.
- One font family is used across the report.
- The PDF QA script detects mostly blank trailing pages.
- Existing scoring and chemistry content tests continue to pass.

Suggested verification commands after implementation:

```bash
node --test tests/test-scoring.test.mjs tests/render-smoke.test.mjs tests/report-chemistry-content.test.mjs tests/report-pdf-qa.test.mjs
node scripts/verify_report_content.mjs --coverage
node scripts/review_report_content.mjs
node scripts/build_report_chemistry_data.mjs --check
node scripts/qa_premium_report_pdf.mjs --key sx_7_w8 --output output/pdf/review-bundle/sx_7_w8-v2.pdf
```

## Implementation Strategy

Recommended approach: full V2, built in slices.

1. Create the V2 renderer shell and CSS using `sx_7_w8` only.
2. Implement pages 1-10 from the user's mockups.
3. Add deeper type, instinct, wing, work, relationship, stress, and faith pages using structured data.
4. Extend QA to validate V2 page count and no blank trailing page.
5. Generate a review bundle for six representative combinations.
6. Promote V2 to default only after visual review.

This avoids a risky all-at-once rewrite while still moving toward the full premium product.

## Open User Inputs Before Implementation Plan

The user has already approved the full Premium V2 direction and supplied mockups 1-10. Before implementation planning begins, check whether the user has added `mockup11.png` or later files. If present, inspect and incorporate them. If absent, proceed with the 20-page design above.

No additional content from Anara is required before the first V2 implementation slice. Anara may be useful later for deeper type-level copy, but the first slice can be built from existing ER content plus the current chemistry cards.

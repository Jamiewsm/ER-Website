---
kb_id: complete_enneagram.diagnostic_kb
source_pdf: "/Users/Joeyswoo/Downloads/Complete_Enneagram.pdf"
source_title: "The Complete Enneagram: 27 Paths to Greater Self-Knowledge"
source_author: "Beatrice Chestnut"
created_at: "2026-05-05"
index_type: "diagnostic_reference"
---

# Complete Enneagram 진단 지식베이스

이 문서는 에니어그램 진단테스트를 발전시키기 위한 agent-facing Markdown입니다. 원문 장문 복제 없이, 진단 로직에 필요한 구조와 페이지 참조를 제공합니다.

## Agent Retrieval Contract

- `pNNN`은 `/Users/Joeyswoo/Downloads/Complete_Enneagram.pdf`의 PDF 물리 페이지입니다.
- 타입 판별은 행동 묘사보다 `attention`, `motivation`, `defense`, `passion`, `avoidance`, `subtype expression`을 우선합니다.
- countertype은 stereotype과 반대로 보일 수 있으므로, 점수 계산에서 표면 행동만으로 후보를 배제하지 않습니다.
- 동점 또는 근접 점수는 [type_pair_disambiguation.md](./type_pair_disambiguation.md)의 pair 페이지를 참조합니다.

## Core Diagnostic Axes

| Axis | 진단에서 보는 것 | 관련 source |
|---|---|---:|
| Center | body/gut, heart/image, head/fear의 기본 에너지 | Framework p20-p43 |
| Passion / Vice | 자동화된 정서 동기. core type의 반복 패턴 | Overview p25-p31, type chapters |
| Defense mechanism | 불편한 감정/욕구/두려움을 처리하는 자동 방어 | type chapter anchors |
| Focus of attention | 사용자가 상황에서 가장 먼저 스캔하는 정보 | type chapter focus sections |
| Shadow | 본인이 보기 어려운 부정/결핍/분노/욕구 영역 | type chapter shadow sections |
| Instinctual subtype | self-preservation, social, sexual instinct가 core passion과 결합된 27 subtype | Overview p32-p40, subtype anchors |
| Vice to Virtue | 성장 방향. 진단 후 코칭/리포트 문구에 유용 | type chapter growth sections |
| Pair differentiation | 유사 타입 구분. tie-breaker 문항 설계에 직접 사용 | Appendix p472-p517 |

## Passion, Defense, Virtue Matrix

| Type | Center | Passion / Vice | Defense | Virtue direction | Primary diagnostic question |
|---|---|---|---|---|---|
| 1 | Body/Gut | Anger | Reaction Formation | Serenity | "내면 기준/옳음에 맞추려다 분노를 통제하고 있는가?" |
| 2 | Heart/Image | Pride | Repression | Humility | "필요를 직접 요청하기보다 도움/매력/헌신으로 애정을 얻으려 하는가?" |
| 3 | Heart/Image | Vanity | Identification | Hope | "성과와 이미지가 자기 가치의 핵심 확인 수단인가?" |
| 4 | Heart/Image | Envy | Introjection | Equanimity | "결핍/고유함/감정적 깊이를 통해 정체성을 붙잡는가?" |
| 5 | Head/Fear | Avarice | Isolation | Non-Attachment | "에너지와 경계를 보존하기 위해 관찰/분석/거리두기로 안전을 확보하는가?" |
| 6 | Head/Fear | Fear | Projection + Splitting | Courage | "위험/권위/신뢰를 계속 검증하며 안전을 찾는가?" |
| 7 | Head/Fear | Gluttony | Rationalization + Idealization | Sobriety | "고통과 제한을 피하려고 가능성, 계획, 긍정화로 이동하는가?" |
| 8 | Body/Gut | Lust | Denial | Innocence | "취약함을 부정하고 힘/통제/직접성으로 침범을 막는가?" |
| 9 | Body/Gut | Laziness / Sloth | Dissociation | Right Action | "갈등과 자기 주장보다 편안함/조화/융합을 먼저 택하는가?" |

## Type 1 - Point One Archetype

Source: p436-p471. Key anchors: defense p441, passion p442, shadow p447-p449, subtypes p449-p456, work p458-p471, virtue p468.

Search tags: `Type One`, `Point One`, `1번`, `Anger`, `Reaction Formation`, `Serenity`, `Worry`, `Non-Adaptability`, `Zeal`, `perfection`, `inner critic`, `standards`.

Core diagnostic summary: Type 1 organizes life around correctness, responsibility, improvement, and the pressure to be good. The key issue is not simply being orderly; it is the inner judge that scans for errors and tries to convert unacceptable impulse, anger, or selfishness into acceptable behavior.

Diagnostic signals:

- Strong internal standard of right/wrong, better/worse, proper/improper.
- Anger often appears as resentment, irritation, moral tension, correction, or controlled frustration.
- Self-criticism is frequent and can be stronger than visible criticism of others.
- Work style often emphasizes process, detail, discipline, and duty.
- Conflict pattern: wants to correct what is wrong; may frame anger as principle.

Subtype index:

| Subtype | Page | Diagnostic angle |
|---|---:|---|
| Self-Preservation One - Worry | p450 | Anxiety about mistakes, responsibility, order, preparedness. Often most perfectionistic. |
| Social One - Non-Adaptability | p453 | Models the right way; may appear principled, superior, teacher-like, reform-oriented. |
| Sexual One - Zeal, countertype | p455 | More intense, reforming, passionate, and relationally corrective than stereotypical 1. |

Question design implications:

- Ask whether the person feels relief only when something is done "properly."
- Distinguish from Type 6 by asking whether worry is about `being wrong/making mistakes` vs `external threat/uncertainty`.
- Distinguish from Type 8 by asking whether anger is controlled and justified through standards vs directly expressed through power.
- Distinguish from Type 9 by asking whether conflict is avoided or internally sharpened into correction.

## Type 2 - Point Two Archetype

Source: p392-p435. Key anchors: defense p399, passion p401, shadow p407-p409, subtypes p410-p418, work p420-p435, virtue p431.

Search tags: `Type Two`, `Point Two`, `2번`, `Pride`, `Repression`, `Humility`, `Privilege`, `Ambition`, `Aggressive/Seductive`, `helping`, `needs`, `approval`.

Core diagnostic summary: Type 2 seeks connection, affection, and worth through being needed, helpful, attractive, or indispensable. The deeper pattern is indirect need-getting: needs are often disowned or repressed, then pursued through giving, pleasing, seduction, or relational positioning.

Diagnostic signals:

- Attention goes to others' needs, moods, preferences, and relational openings.
- Directly asking for help or naming personal need may feel vulnerable or shameful.
- Pride can show as "I do not need much" or "I know what others need."
- Anger and disappointment appear when giving is not recognized or reciprocated.
- Conflict pattern: tries to restore connection, be valued, or influence through warmth/help.

Subtype index:

| Subtype | Page | Diagnostic angle |
|---|---:|---|
| Self-Preservation Two - Privilege, countertype | p410 | More childlike, needful, or indirectly entitled; may look less overtly helpful. |
| Social Two - Ambition | p414 | Influences groups/environments; can resemble Type 3 or 8 through power and visibility. |
| Sexual Two - Aggressive/Seductive | p417 | Focuses intensity on selected individuals; direct attraction, charm, pursuit, possession. |

Question design implications:

- Ask if helping is easier than receiving help.
- Ask whether disappointment rises when care is not acknowledged.
- Distinguish from Type 9 by emotional activation and active moving-toward others.
- Distinguish from Type 3 by relationship approval vs achievement/status approval.
- Distinguish Social Two from Type 8 by checking whether power serves being desired/needed or direct autonomy/control.

## Type 3 - Point Three Archetype

Source: p348-p391. Key anchors: defense p355, passion p357, shadow p364-p365, subtypes p366-p375, work p377-p391, virtue p388.

Search tags: `Type Three`, `Point Three`, `3번`, `Vanity`, `Identification`, `Hope`, `Security`, `Prestige`, `Charisma`, `image`, `achievement`, `persona`.

Core diagnostic summary: Type 3 builds value through achievement, effectiveness, image, and adaptive performance. The key is identification with the successful persona: the person can become what works, sometimes losing contact with deeper feelings or true preference.

Diagnostic signals:

- Self-worth is stabilized by results, recognition, competence, or visible progress.
- Emotions may be postponed, edited, or bypassed when they interfere with performance.
- Attention scans what will be valued, admired, rewarded, or successful in context.
- Work style favors efficiency, forward motion, goal completion, and image management.
- Conflict pattern: reframes quickly, moves toward outcome, resists failure exposure.

Subtype index:

| Subtype | Page | Diagnostic angle |
|---|---:|---|
| Self-Preservation Three - Security, countertype | p366 | Wants to appear non-vain; proves worth through reliability, productivity, practical security. |
| Social Three - Prestige | p370 | Most visibility/status oriented; wants influence, winning, and recognized success. |
| Sexual Three - Charisma | p373 | Seeks value through attractiveness and supporting/reflecting ideal image for important others. |

Question design implications:

- Ask whether slowing down threatens identity or usefulness.
- Ask whether failure feels like loss of self-value, not only disappointment.
- Distinguish from Type 1 by external success metrics vs internal correctness.
- Distinguish from Type 6 by decisive forward motion vs risk-checking and doubt.
- Distinguish from Type 9 by pace, ambition, and comfort with visibility.

## Type 4 - Point Four Archetype

Source: p300-p347. Key anchors: defense p307, passion p310, shadow p317-p319, subtypes p320-p330, work p332-p347, virtue p344.

Search tags: `Type Four`, `Point Four`, `4번`, `Envy`, `Introjection`, `Equanimity`, `Tenacity`, `Shame`, `Competition`, `authenticity`, `longing`, `lack`.

Core diagnostic summary: Type 4 organizes identity around emotional truth, longing, uniqueness, and the felt sense of what is missing. The diagnostic core is not creativity alone; it is the repeated return to lack, comparison, depth, and authenticity as identity anchors.

Diagnostic signals:

- Strong sensitivity to what is absent, unfulfilled, ordinary, inauthentic, or emotionally flat.
- Self-reference: "How do I feel? What does this mean about me?"
- Emotional depth may feel more real than steady ordinary experience.
- Envy can show as painful comparison, longing, or attraction to what seems unavailable.
- Conflict pattern: may intensify emotion, withdraw into feeling, or demand authenticity.

Subtype index:

| Subtype | Page | Diagnostic angle |
|---|---:|---|
| Self-Preservation Four - Tenacity, countertype | p320 | Suffers quietly and endures; can look stoic or hard-working rather than visibly dramatic. |
| Social Four - Shame | p324 | Most openly aware of deficiency/shame; compares self in social field. |
| Sexual Four - Competition | p328 | More assertive, angry, competitive; may make others feel the suffering or intensity. |

Question design implications:

- Ask whether being ordinary or emotionally unseen feels threatening.
- Ask if longing can feel more alive than satisfaction.
- Distinguish from Type 3 by authenticity/depth vs successful image.
- Distinguish from Type 7 by staying with painful emotion vs reframing away from it.
- Distinguish SP Four from Type 1 or 3 by checking hidden envy/lack underneath endurance.

## Type 5 - Point Five Archetype

Source: p256-p299. Key anchors: defense p263, passion p265, shadow p272-p274, subtypes p275-p284, work p285-p299, virtue p296.

Search tags: `Type Five`, `Point Five`, `5번`, `Avarice`, `Isolation`, `Non-Attachment`, `Castle`, `Totem`, `Confidence`, `boundaries`, `knowledge`, `energy`.

Core diagnostic summary: Type 5 seeks security through conserving inner resources, understanding, boundaries, privacy, and mental mastery. The core is not intelligence alone; it is the sense that energy, time, emotion, and involvement must be carefully protected.

Diagnostic signals:

- First response to demand is often observation, analysis, withdrawal, or boundary-setting.
- Strong sensitivity to intrusion, surprise, emotional demand, and depletion.
- Knowledge, competence, and conceptual clarity substitute for social/emotional support.
- Can discuss emotion conceptually while remaining detached from feeling.
- Conflict pattern: creates distance, withholds information, minimizes needs.

Subtype index:

| Subtype | Page | Diagnostic angle |
|---|---:|---|
| Self-Preservation Five - Castle | p276 | Most boundary-focused; protects home, privacy, resources, routines. |
| Social Five - Totem | p279 | Connects through ideals, expertise, high-value groups, intellectual symbols. |
| Sexual Five - Confidence, countertype | p281 | Seeks a trusted ideal bond; more intense/selective than stereotypical detached 5. |

Question design implications:

- Ask whether social/emotional demands feel like energy loss or invasion.
- Ask whether preparation/knowledge is needed before participation.
- Distinguish from Type 6 by retreating to self-sufficiency vs scanning external threat/trust.
- Distinguish from Type 9 by boundary clarity vs merging/going along.
- Distinguish from Type 7 by conserving options/energy vs expanding options/stimulation.

## Type 6 - Point Six Archetype

Source: p207-p255. Key anchors: defense p214, passion p218, shadow p226-p227, subtypes p228-p237, work p238-p255, virtue p251.

Search tags: `Type Six`, `Point Six`, `6번`, `Fear`, `Projection`, `Splitting`, `Courage`, `Warmth`, `Duty`, `Strength/Beauty`, `phobic`, `counterphobic`, `authority`.

Core diagnostic summary: Type 6 seeks safety by scanning for danger, testing trust, locating reliable authority or resisting unreliable authority. The same fear can appear as caution, loyalty, suspicion, rule-orientation, rebellion, or counterphobic strength.

Diagnostic signals:

- Attention goes to what could go wrong, hidden agendas, inconsistencies, risk, and trustworthiness.
- Doubt and verification may continue even after enough information exists.
- Authority is charged: may seek it, obey it, test it, challenge it, or rebel against it.
- Loyalty becomes strong after trust is earned.
- Conflict pattern: questions, prepares, tests, warns, or confronts fear directly.

Subtype index:

| Subtype | Page | Diagnostic angle |
|---|---:|---|
| Self-Preservation Six - Warmth | p229 | Phobic, warm, alliance-seeking, safety through reciprocal support. |
| Social Six - Duty | p232 | Safety through rules, duty, certainty, systems, ideology, authority structure. |
| Sexual Six - Strength/Beauty, countertype | p235 | Counterphobic, strong, intimidating, may resemble Type 8; fear is managed by confronting it. |

Question design implications:

- Ask what the person does first when uncertainty rises: verify, prepare, seek allies, challenge, or move on.
- Distinguish from Type 1 by fear/trust/authority vs correctness/mistake/inner critic.
- Distinguish from Type 3 by overchecking risk vs moving quickly to result.
- Distinguish Sexual Six from Type 8 by whether strength is built against fear.
- Distinguish from Type 9 by suspicion/testing vs easy merging/trusting.

## Type 7 - Point Seven Archetype

Source: p153-p206. Key anchors: defense p161, passion p163, shadow p172-p173, subtypes p174-p187, work p188-p206, virtue p201.

Search tags: `Type Seven`, `Point Seven`, `7번`, `Gluttony`, `Rationalization`, `Idealization`, `Sobriety`, `Keeper of the Castle`, `Sacrifice`, `Suggestibility`, `options`, `planning`.

Core diagnostic summary: Type 7 avoids pain, limitation, and deprivation through positive reframing, options, future plans, stimulation, and mental mobility. The core is not happiness alone; it is the automatic escape from discomfort into possibility.

Diagnostic signals:

- Attention goes to positive data, future options, interesting possibilities, and escape routes.
- Negative emotion may be reframed quickly before it is fully felt.
- Fear of limitation, boredom, missing out, or being trapped.
- Can use charm, rationalization, or idealization to keep experience light and open.
- Conflict pattern: changes frame, opens options, distracts, persuades, or exits.

Subtype index:

| Subtype | Page | Diagnostic angle |
|---|---:|---|
| Self-Preservation Seven - Keeper of the Castle | p175 | Networks, alliances, practical pleasure/security, opportunity gathering. |
| Social Seven - Sacrifice, countertype | p179 | Idealistic, service-oriented, may appear selfless or good; still avoids pain/limitation. |
| Sexual Seven - Suggestibility | p184 | Fantasy, idealization, fascination, intense imaginative attraction. |

Question design implications:

- Ask whether the person exits heavy emotion through planning, stimulation, or positive reframing.
- Ask whether commitment feels like lost freedom/options.
- Distinguish from Type 5 by expansion/stimulation vs contraction/conservation.
- Distinguish from Type 4 by escaping pain vs dwelling in emotional depth.
- Distinguish Social Seven from Type 2 by idealized sacrifice vs attachment through being needed.

## Type 8 - Point Eight Archetype

Source: p104-p152. Key anchors: defense p112, passion p114, shadow p123-p125, subtypes p125-p133, work p134-p152, virtue p148.

Search tags: `Type Eight`, `Point Eight`, `8번`, `Lust`, `Denial`, `Innocence`, `Satisfaction`, `Solidarity`, `Possession`, `power`, `control`, `vulnerability`.

Core diagnostic summary: Type 8 protects against vulnerability by moving toward strength, directness, impact, control, and intensity. The diagnostic core is not anger alone; it is the refusal to be controlled, weakened, or violated.

Diagnostic signals:

- Direct access to anger, force, boundaries, and action.
- Vulnerability, dependency, or weakness may be denied or protected against.
- Strong sense of justice, protection, territory, and control.
- Excess can show in work, appetite, confrontation, speed, or intensity.
- Conflict pattern: asserts, challenges, pushes, protects, decides.

Subtype index:

| Subtype | Page | Diagnostic angle |
|---|---:|---|
| Self-Preservation Eight - Satisfaction | p126 | Direct pursuit of needs, survival, resources, autonomy. |
| Social Eight - Solidarity, countertype | p128 | Protects people/groups; can look warmer or more service-oriented than typical 8. |
| Sexual Eight - Possession | p131 | Intense dominance, attraction, possession, one-to-one power. |

Question design implications:

- Ask whether anger feels clarifying and energizing rather than dangerous.
- Ask whether being controlled triggers immediate resistance.
- Distinguish from Type 1 by direct impulse/power vs controlled correctness.
- Distinguish from Sexual Six by low fear/vulnerability awareness vs strength against fear.
- Distinguish Social Eight from Type 2 by protection/control vs being needed/loved.

## Type 9 - Point Nine Archetype

Source: p65-p103. Key anchors: defense p70, passion p72, shadow p78-p79, subtypes p80-p88, work p90-p103, virtue p100.

Search tags: `Type Nine`, `Point Nine`, `9번`, `Laziness`, `Sloth`, `Dissociation`, `Right Action`, `Appetite`, `Participation`, `Fusion`, `merging`, `conflict avoidance`.

Core diagnostic summary: Type 9 maintains comfort, harmony, and connection by merging with the environment and losing contact with inner priority. The core is not calmness alone; it is the habit of going unconscious to self, anger, agenda, and decisive action.

Diagnostic signals:

- Attention goes to others' agendas, atmosphere, comfort, consensus, and friction reduction.
- Difficulty locating or asserting personal wants, especially under relational pressure.
- Anger may be forgotten, numbed, delayed, or expressed passively.
- Inertia, postponement, routine, or distraction can replace direct action.
- Conflict pattern: softens, delays, adapts, merges, or disengages.

Subtype index:

| Subtype | Page | Diagnostic angle |
|---|---:|---|
| Self-Preservation Nine - Appetite | p81 | Comfort through concrete routines, appetite, practical satisfaction. |
| Social Nine - Participation, countertype | p84 | Active group participation; may look energetic but still loses self in group agenda. |
| Sexual Nine - Fusion | p86 | Merges with important person/relationship; self-definition through bond. |

Question design implications:

- Ask whether the person knows what they want before hearing everyone else.
- Ask whether conflict creates sleepiness, fog, delay, or smoothing.
- Distinguish from Type 2 by passive merging vs active helping/approval seeking.
- Distinguish from Type 5 by lack of boundary/assertion vs strong privacy boundary.
- Distinguish from Type 3 by comfort/harmony vs achievement/visibility.

## Test Design Rules Derived From This Source

1. Use motivation-weighted scoring.

Behavior overlap is high. A user can be hardworking, helpful, intense, withdrawn, or anxious for different type reasons. Weight answers that reveal `why` the behavior happens.

2. Score subtype after core candidate narrowing.

Subtype can distort the surface type. First estimate core type; then use instinctual signals to refine into 27 subtype. Countertype flags should reopen, not close, candidate types.

3. Keep state/stress separate from core type.

Recent stress can activate defense, arrow movement, or unusual behavior. Current ER test state questions already support this; keep them separate from stable type scoring.

4. Use pair-specific tie-breakers.

When top two types are close, ask a targeted pair question. Generic "which sounds more like you" questions are weaker than asking about the conflict of attention: e.g. `1 vs 6 = mistake/wrongness vs threat/uncertainty`.

5. Ask about the avoided experience.

High-signal questions often reveal what the user avoids:

- 1 avoids being wrong, bad, irresponsible, out of control.
- 2 avoids being unwanted, unneeded, rejected, directly needy.
- 3 avoids failure, worthlessness, inefficiency, visible incompetence.
- 4 avoids ordinary identity, emotional flatness, inauthenticity, lack of depth.
- 5 avoids depletion, intrusion, dependency, emotional overwhelm.
- 6 avoids unsafe trust, hidden threat, unsupported risk, uncertainty.
- 7 avoids pain, limitation, boredom, deprivation, trappedness.
- 8 avoids vulnerability, weakness, control by others, violation.
- 9 avoids conflict, separation, pressure of self-assertion, disruptive desire.

6. Keep Korean test copy concrete.

The PDF concepts are abstract. Korean diagnostic items should translate them into ordinary lived moments: "결정 직전", "갈등 기류", "도움을 요청할 때", "권위자를 만났을 때", "내 필요를 말해야 할 때", "일이 기준에 안 맞을 때".

## Suggested Retrieval Tags

Use these as tags in future Markdown notes or embeddings.

```yaml
enneagram_core_types:
  type_1: [anger, reaction_formation, inner_critic, standards, serenity, worry, non_adaptability, zeal]
  type_2: [pride, repression, helping, needs, approval, humility, privilege, ambition, aggressive_seductive]
  type_3: [vanity, identification, achievement, image, persona, hope, security, prestige, charisma]
  type_4: [envy, introjection, longing, authenticity, shame, equanimity, tenacity, competition]
  type_5: [avarice, isolation, boundaries, energy, knowledge, non_attachment, castle, totem, confidence]
  type_6: [fear, projection, splitting, trust, authority, courage, warmth, duty, strength_beauty]
  type_7: [gluttony, rationalization, idealization, options, reframing, sobriety, sacrifice, suggestibility]
  type_8: [lust, denial, power, control, vulnerability, innocence, satisfaction, solidarity, possession]
  type_9: [laziness, sloth, dissociation, merging, conflict_avoidance, right_action, appetite, participation, fusion]
instincts:
  sp: [self_preservation, security, body, resources, comfort, stability]
  so: [social, role, group, status, contribution, belonging]
  sx: [sexual, one_to_one, attraction, intensity, fusion, chemistry]
```

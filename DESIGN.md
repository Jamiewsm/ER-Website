# ER Website — Design System

> Single source of truth for all visual decisions. Reference this before adding new pages or components.

---

## Brand Identity

**ER** (Enneagram for Restoration) is a for-profit Christian enneagram coaching service.  
Tone: **warm, professional, trustworthy** — not clinical, not overly religious.  
The visual language should feel like a trusted guide, not a ministry brochure.

---

## Color Palette

All colors are defined as Tailwind tokens in `index.html`:

| Token | Hex | Usage |
|---|---|---|
| `er-base` | `#F7EEE4` | Page background — caramel beige |
| `er-surface` | `#FFFBF6` | Cards, modal backgrounds — warm cream ivory |
| `er-primary` | `#7D6A5B` | Body text — warm taupe |
| `er-accent` | `#B89170` | Primary accent — caramel brown (links, icons, highlights) |
| `er-accentDark` | `#9D7657` | Accent hover/active state |
| `er-accentLight` | `#EEE2D5` | Soft accent background (tags, pills, hover tints) |
| `er-dark` | `#3E362E` | Headings, primary CTA background — charcoal brown |
| `er-muted` | `#AA9889` | Secondary/caption text |

**Rule:** Use `er-dark` for all primary action buttons. Never use generic black (`#000`).  
**Rule:** Use `er-accentLight` for tag/badge backgrounds, not a solid accent.  
**Rule:** Amber (`bg-amber-*`) is reserved for ministry-only UI signals.

---

## Typography

**Font family:** Pretendard (primary), fallback: system-ui, sans-serif  
**Serif:** Times New Roman (decorative only — avoid in UI)

| Scale | Class | Usage |
|---|---|---|
| Display | `text-4xl md:text-5xl font-extrabold` | Hero H1 only |
| Page H1 | `text-3xl md:text-4xl font-bold` | Section entry headings |
| Section H2 | `text-2xl font-bold` | Sub-section headings |
| Card title | `text-xl font-bold` | Card headings |
| Body | `text-base leading-relaxed` | Standard body copy |
| Caption | `text-sm text-er-muted` | Secondary info, labels |
| Label/Tag | `text-xs font-bold tracking-widest uppercase` | Metadata tags — use sparingly |

**Copy rules:**
- `break-keep` on all Korean headings (prevents awkward line breaks)
- Heading line-height: `leading-snug` (1.375)
- Body line-height: `leading-relaxed` (1.625)
- Max body column width: `max-w-xl` (~672px) for readability

---

## Spacing & Layout

**Max widths:**
- Full-width sections (hero, marketing): `max-w-7xl`
- Content pages (coaches, programs): `max-w-4xl`
- Reading content (support, about): `max-w-3xl`

**Page padding:** `px-4 sm:px-6 lg:px-8`  
**Section vertical rhythm:** `py-12 md:py-20` for major sections, `pt-8 pb-20` for content pages  
**Card gaps:** `gap-8` for vertically stacked cards

---

## Component Patterns

### Cards

```
Primary card: bg-white rounded-[2rem] shadow-card overflow-hidden border border-er-accentLight/40 floating-card
Surface card: bg-er-surface rounded-[2rem] shadow-soft
Glass card: glass rounded-[2.5rem] shadow-card floating-card hover:shadow-glow
```

**Rule:** Cards should earn their existence. Use only when card IS the interaction (e.g., coach profile = selection unit). No decorative card grids.

### Buttons

```
Primary CTA: bg-er-dark text-white rounded-full font-bold px-7 py-3.5 hover:bg-gray-800 hover:-translate-y-0.5 transition-all shadow-soft active:scale-95
Secondary: bg-white/90 text-er-dark border border-white/60 rounded-full font-bold (same padding)
Text link: text-er-accent font-bold underline underline-offset-2 hover:text-er-accentDark
Destructive: use red-600, not er-accent
```

**Rule:** One primary CTA per viewport. Duplicate primary actions cause decision fatigue.

### Tags / Badges

```
Specialty tag: inline-block px-3 py-1 rounded-full bg-er-accentLight text-er-dark text-xs font-semibold
Ministry badge: bg-amber-50 border border-amber-200 text-amber-700 rounded-full (signals free ministry track)
Cert badge: border border-er-accent/30 text-er-accent rounded-full
```

**Ministry amber** is the only amber usage — do not use amber for general UI elements.

### Compact Info Strip

```
One-line contextual notice: rounded-full bg-{color}-50 border border-{color}-200 px-4 py-2.5 flex items-center gap-3 text-xs
```

Use this instead of a full info box when the notice is secondary to the main content.

### Animations

| Token | Usage |
|---|---|
| `animate-fade-in-up` | Page entry, card reveal |
| `animate-fade-in` | Hero imagery |
| `animate-float` | Hero floating card widget |
| `floating-card` | Persistent subtle float on hover |

**Rule:** 2–3 intentional motions per page. Entrance (`fade-in-up`), scroll-linked, and hover/reveal.  
**Rule:** `animation-fill-mode: both` required on `animate-fade-in-up` for correct initial state.

---

## Page Templates

### Marketing/Content Page (coaches, programs, support)
```
Structure: max-w-4xl mx-auto px-4 sm:px-6
Header: left-aligned H1 + subtitle (NO centered badge/title pattern — this is AI slop)
Content: flex-col gap-8 cards
CTA: centered bottom CTA after content
Background: bg-er-base
Padding: pt-8 pb-20
```

### Hero/Landing Section (home)
```
Structure: max-w-7xl, two-column grid lg:grid-cols-2
Left: brand narrative, headline, dual CTA
Right: floating glass card widget
Background: bg-er-base + bg-pattern + subtle blur orbs (2 max)
```

---

## AI Slop Avoidance

These patterns are **prohibited** in new pages:

1. ❌ Centered badge + H1 + description header (every AI-generated page looks like this)
2. ❌ 3-column icon-in-circle feature grid
3. ❌ Purple/violet/indigo gradients
4. ❌ Decorative blobs beyond the 2 already in hero (don't add more)
5. ❌ Emoji in headings as design elements
6. ❌ `border-left: 3px solid <accent>` on cards
7. ❌ Generic copy: "당신의 여정을 위한 완벽한 솔루션"

**Instead:** Left-align page headers, lead with the person/outcome not the product label.

---

## Ministry Track UX

Ministry (목회자·선교사 무료 사역지원) is a secondary service, not the primary identity.

- Use amber color family ONLY for ministry signals
- Ministry strip/notice must be compact (1 line) on pages where it's secondary context
- Ministry CTA must link to `track: 'support'`, not `track: 'paid'`
- If a coach has `ministry: true`, their CTA should use a different label/track

---

## Responsive Principles

- Mobile-first: default classes are mobile, `md:` and `lg:` for larger viewports
- `flex-col md:flex-row` for coach/program cards (stack on mobile, horizontal on desktop)
- Touch targets: minimum 44px height for all interactive elements
- `break-keep` on all Korean headings to prevent awkward word wraps
- Max mobile font: `text-2xl` for H1 on mobile (not full desktop size)

---

## Accessibility (Minimum Bar)

- All `<img>` must have meaningful `alt` text
- Decorative icons: `aria-hidden="true"` 
- Dynamic section changes (SPA): announce section change to screen readers (currently unimplemented — see TODOS)
- Color contrast: all text must be WCAG AA (4.5:1 for body, 3:1 for large text)
- `er-muted` (#AA9889) on white fails AA — use only on `er-base` or `er-surface` backgrounds
- Focus visible: Tailwind's default focus ring, do not suppress globally

---

## What Does NOT Belong Here

- Business logic, pricing, service descriptions → `js/strings.js`
- Routing → `js/app-core.js`
- Section content → `js/sections/*.js`

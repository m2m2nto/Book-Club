# UX/UI Spec: Book Club Manager

This is the living UX/UI reference for Book Club Manager.

Use this file when designing or implementing new features so the product stays visually consistent, interaction patterns stay predictable, and the app continues to feel cohesive as it grows.

This spec complements `SPEC.md`:
- `SPEC.md` defines product behavior and acceptance criteria.
- `UX_UI_SPEC.md` defines visual, interaction, layout, feedback, and motion standards.

---

## 1. Chosen Creative Direction

### Direction
**Airy Editorial — Cool Editorial Variant**

Book Club Manager should feel like a modern editorial workspace translated into a product experience.

The interface should feel:
- bright
- spacious
- intelligent
- premium
- calm
- precise
- editorial rather than dashboard-like

The product should **not** feel like:
- a dark admin console
- a generic white SaaS template
- a whimsical library-themed toy
- a dense utility panel system

### Experience statement
The app should feel like a curated editorial system: open, crisp, and quietly elegant. Users should feel that the content matters, the club matters, and the software is thoughtfully designed around that reality.

### Core design thesis
In this direction, **typography and space do most of the work**.

That means:
- hierarchy comes primarily from type scale, weight, rhythm, and placement
- clarity comes from whitespace and grouping before borders and containers
- emphasis comes from restraint, not decoration
- interaction polish comes from motion and micro-feedback, not visual noise

### Locked stylistic decisions
The current Airy Editorial direction is intentionally constrained:
- **Temperature**: cool editorial
- **Accent strategy**: quiet accent only
- **Visual lead**: typography-led
- **Motion**: barely there

These choices should guide future design decisions unless the product direction changes explicitly.

---

## 2. UX/UI North Star

Every screen and component should push toward these qualities:

- **Airy**: generous whitespace, low density, visible breathing room
- **Editorial**: strong hierarchy, curated composition, content-first rhythm
- **Minimal**: fewer visual treatments, more disciplined structure
- **Refined**: polished but understated motion, careful spacing, crisp alignment
- **Coolly premium**: crisp neutrals and elegant typography, never clinical or harsh
- **Operationally clear**: admin and data-heavy flows remain dependable and legible

### Product feeling
Users should feel:
- welcomed quickly
- oriented immediately
- calm while browsing
- confident while acting
- quietly reassured when completing actions

---

## 3. Design Principles

### 3.1 Typography is structure
Typography is not decoration. It is one of the main layout systems.

Use type to create:
- section hierarchy
- emphasis
- pacing
- rhythm between modules
- contrast between editorial moments and operational UI

### 3.2 Space is the interface
Whitespace should act as a first-class design tool.

Use spacing to:
- separate ideas
- define grouping
- indicate importance
- create emotional calm
- improve scanability

Do not rely on adding another border, box, or badge when spacing can solve the problem.

### 3.3 Content over chrome
Reduce visual framing. Let the content feel placed on the page, not trapped inside stacked containers.

### 3.4 Calm precision
The app should never feel noisy. Motion, contrast, and accent color should all be used with restraint.

### 3.5 Editorial warmth, not nostalgia
The interface may nod to publishing and reading culture, but should not become literal, vintage, or skeuomorphic.

### 3.6 Premium through restraint
The app should feel designed, but never over-designed. Luxury comes from confidence and reduction.

---

## 4. Visual Language Overview

### Overall look
- bright cool canvas
- restrained surfaces
- ink-dark typography
- one quiet accent family
- subtle, minimal depth
- large amounts of breathing room

### Primary styling cues
- strong page titles
- elegant section spacing
- low-contrast dividers
- pale surface shifts instead of heavy cards
- sans-led hierarchy with optional restrained serif only for major editorial moments
- barely-there motion on reveal, hover, and completion

### What should visually lead
1. page title and main content
2. featured content block or key action
3. secondary supporting information
4. metadata and utilities

Visual weight should be intentional. Not every section deserves equal prominence.

---

## 5. Color and Surface System

Airy Editorial is a light UI with a cool editorial cast, but not a harsh or sterile white UI.

### 5.1 Foundation palette
Use a mostly neutral base.

- **App canvas**: porcelain white or very pale cool neutral
- **Raised surfaces**: clean white
- **Muted surfaces**: pale cool gray
- **Primary text**: graphite ink
- **Secondary text**: slate gray
- **Muted text**: steel gray
- **Accent**: ink blue

### 5.2 Accent strategy
Use one primary accent family to preserve calm and coherence.

Recommended primary accent:
- **Ink Blue**

Supporting accent usage may include:
- pale ink-blue wash for active states
- faint silver-gray for subtle highlights
- restrained success green, warning amber, and error rose for feedback only

### 5.3 Surface rules
Surfaces should be quiet.

Use:
- very soft shadows
- hairline borders only when needed
- pale tonal separation
- occasional cool-tinted sections for emphasis

Avoid:
- thick borders
- dark panels
- high-contrast card stacks
- too many different background tints on one screen

### 5.4 Depth model
Depth should come from a combination of:
- spacing
- tonal contrast
- soft shadow
- layering order
- hover lift

Not from loud shadows or sharp outlines.

---

## 6. Typography System

Typography is the primary brand and hierarchy system for this direction.

## 6.1 Typography roles
Use two functional families:

### A. Editorial serif
Use sparingly for moments of voice and emphasis.

Recommended usage:
- hero headlines only when a stronger editorial moment is needed
- selected empty-state statements
- rare featured callouts

### B. UI sans-serif
Use for all operational UI and as the default system for almost all screens.

Use for:
- navigation
- labels
- forms
- buttons
- table/list text
- metadata
- helper text
- toast text
- admin interfaces

### 6.2 Typography philosophy
The type system should feel:
- confident
- breathable
- highly readable
- rhythmically consistent
- not over-styled

Rules:
- prefer fewer sizes used consistently
- rely on weight, line-height, and spacing before introducing decoration
- avoid crowded headlines
- avoid overly small metadata text unless truly secondary
- keep the system typography-led, with serif as a rare accent rather than a default presence

### 6.3 Hierarchy model
Each page should follow a stable text hierarchy.

#### Level 0 — Optional eyebrow
Use sparingly.
- small uppercase or tracked label
- identifies the domain, not the main message
- e.g. `Books`, `Meetings`, `Dashboard`

#### Level 1 — Page title
The clearest headline on the page.
- short
- confident
- visually dominant
- can use serif on major top-level pages

#### Level 2 — Intro/support text
A short clarifying sentence beneath the title.
- explains the page purpose or current state
- should remain concise

#### Level 3 — Section headings
Used for major content blocks.
- strong but noticeably smaller than page title
- should not compete with L1

#### Level 4 — Card or item titles
Used inside cards, lists, and modules.
- concise
- readable at a glance
- can carry slight weight emphasis

#### Level 5 — Body text and metadata
Used for descriptions, secondary context, timestamps, and support copy.
- calm
- readable
- clearly subordinate

### 6.4 Typography scale guidance
The exact implementation may evolve, but the system should roughly maintain this rhythm:

- **Display / Hero**: large, spacious, rare
- **Page Title**: prominent and calm
- **Section Title**: clear and compact
- **Body**: highly readable default text size
- **Meta**: one step smaller, still legible
- **Caption**: only for tertiary info

The visual distance between levels should be obvious but not dramatic.

### 6.5 Line length and readability
Text blocks should not become too wide.

Rules:
- long paragraphs should use comfortable line lengths
- supporting text should generally sit in narrower columns than full-width content
- featured editorial text should have especially controlled width

### 6.6 Letter case and labels
Prefer natural sentence/title case.

Use uppercase sparingly for:
- occasional eyebrow labels
- tiny metadata tags when they aid scanning

Avoid turning the UI into a field of tracked uppercase labels.

### 6.7 Serif restraint rules
Serif is optional and rare.

Do:
- use it only for select hero or empty-state moments if it improves the editorial tone

Do not:
- use serif for dense operational content
- use serif inside forms or tables
- let serif compete with the core sans-led hierarchy

---

## 7. Spacing System

Spacing is one of the core tools of the Airy Editorial direction.

## 7.1 Spacing goals
Spacing should create:
- calm
- hierarchy
- compositional rhythm
- easier scanning
- visual confidence

The interface should feel intentionally paced, not merely padded.

## 7.2 Spatial rhythm model
Think of the UI in four spacing layers:

### A. Micro spacing
Used between closely related elements.
Examples:
- label to input
- icon to text
- title to metadata
- stacked controls inside one compact group

### B. Component spacing
Used inside a card, form block, or module.
Examples:
- spacing between fields in a form
- padding inside a toast
- internal space in a list item

### C. Section spacing
Used between content groups on a page.
Examples:
- header to featured block
- featured block to supporting grid
- section title to cards/list below

### D. Page spacing
Used for large vertical rhythm and overall canvas composition.
Examples:
- top page padding
- space between major page zones
- bottom breathing room

These layers should feel proportional to each other.

## 7.3 Spacing rules by context

### Page headers
Page headers should breathe.
- generous top spacing
- clear separation between title and following content
- support text should sit close enough to feel connected, but with enough room to stay readable

### Sections
Sections should not collapse into each other.
- each section must have a clear start
- vertical rhythm between sections should be larger than rhythm inside a section

### Cards and content modules
Modules should have room to feel curated.
- avoid cramped padding
- avoid multiple nested padded boxes when one container can suffice
- if a card contains many elements, internal grouping must be visible through spacing

### Forms
Forms should feel composed, not dense.
- enough spacing between fields to reduce anxiety
- label/input pairs should feel tightly related
- major actions should have visual room around them

### Lists and tables
Lists should be readable without heavy separators.
- use row padding generously
- rely on whitespace and alignment first
- use dividers sparingly and lightly

## 7.4 Density guidance
Default density should be **comfortable**.

Use more compact density only when:
- the content is tabular
- the user is scanning repeated data
- the screen is utility-heavy

Even then, maintain clarity and calm.

## 7.5 Alignment discipline
Spacing works only if alignment is strong.

Rules:
- align titles, actions, and content edges intentionally
- avoid near-alignments that look accidental
- keep shared gutters across sibling modules
- preserve rhythm across responsive breakpoints

---

## 8. Layout Principles

## 8.1 Composition over grid rigidity
The interface should feel composed rather than mechanically boxed.

Use layouts that allow:
- featured content to breathe
- supporting content to recede
- asymmetry when helpful
- editorial rhythm across a page

### 8.2 Default page structure
Most pages should follow this order:
1. page header
2. featured content or key action zone
3. primary content region
4. secondary content region
5. utility/history region

Not every page needs all five layers, but priority should remain visible.

### 8.3 Canvas behavior
The page canvas should feel open.

Use:
- generous outer margins
- disciplined max-widths
- clear column behavior on large screens
- lighter framing around content

### 8.4 Responsive layout behavior
On smaller screens:
- preserve hierarchy first
- reduce columns before reducing breathing room too aggressively
- maintain readable line lengths and touch targets
- preserve clear section separation

### 8.5 Modular asymmetry
Where helpful, allow one module to be featured visually while others remain quieter.

Examples:
- one large hero card paired with smaller utility blocks
- a wide main content pane with a narrower supporting rail
- a featured book above a calmer supporting list

This helps the app feel editorial rather than dashboard-like.

---

## 9. Core Component Guidance

## 9.1 Buttons
Buttons should feel deliberate and tactile.

### Primary buttons
Use for the single most important action in a view.

Style intent:
- editorial indigo fill
- refined radius
- clean text hierarchy
- subtle depth

Interaction intent:
- hover: slight lift or tonal brightening
- press: subtle compression
- focus: clear but soft ring

### Secondary buttons
Use for supporting actions.

Style intent:
- pale surface or gentle border
- quiet appearance
- clear readability

Interaction intent:
- hover: soft tonal wash
- no harsh inversion

### Ghost/text buttons
Use for tertiary actions.

Style intent:
- minimal chrome
- typographic presence rather than box presence

Interaction intent:
- subtle hover tint, underline, or movement

### Button rules
- one clear primary action per region where possible
- avoid multiple competing loud buttons in a single block
- preserve calm through consistency

## 9.2 Inputs and forms
Inputs should feel polished, clear, and easy to approach.

Style intent:
- bright field surface
- low-contrast border
- soft focus state
- readable labels above fields

Form spacing intent:
- fields grouped by meaning
- sufficient room between field groups
- helper and validation text close to the relevant field

Rules:
- do not overload forms with long instruction text
- placeholders should not carry critical meaning
- destructive actions should be visually separated from save actions

## 9.3 Cards and panels
Cards should support composition, not dominate it.

Style intent:
- quiet surface
- restrained shadow or tonal separation
- generous padding
- limited decorative styling

Use cards when they clarify grouping or elevate content.
Do not wrap every single thing in a card by default.

## 9.4 Lists
Lists should feel airy and scannable.

Rules:
- use whitespace to separate rows
- avoid dense visual dividers unless the list is highly data-heavy
- keep titles and metadata aligned predictably
- actions should reveal clearly without cluttering the row

## 9.5 Tables/admin lists
Admin tables may be slightly denser, but should still follow the same restraint.

Rules:
- keep headers light but legible
- preserve row height for readability
- use subtle status styling
- avoid dark stripes or aggressive borders

## 9.6 Badges and status indicators
Statuses should be calm and useful.

Rules:
- use low-saturation fills or outlines
- rely on text clarity over loud color blocks
- maintain consistency for survey, meeting, and book states

## 9.7 Toasts and inline feedback
Feedback should be visible but elegant.

Toast intent:
- float in softly
- remain readable and concise
- support optional action link/button
- disappear without feeling abrupt

Inline feedback intent:
- used when feedback must stay attached to a form or module
- visually secondary to the main content
- clear, not alarming

---

## 10. Motion and Transition System

Motion should make the app feel curated, not animated for animation’s sake.

## 10.1 Motion principles
Use motion to:
- guide attention
- reinforce hierarchy
- communicate continuity
- reward successful interaction

Avoid motion that:
- delays user tasks
- loops distractingly
- competes with reading
- feels playful in serious admin moments

## 10.2 Motion personality
Motion should feel:
- precise
- light
- restrained
- editorial
- composed

## 10.3 Key motion patterns

### Page entry
Pages should reveal with minimal sequencing.
- page header first
- supporting content next
- list/cards afterward with little or no visible stagger

### Page transition
Route changes should use a short fade or very small fade/translate pattern.
The feeling should resemble quiet continuity between layouts, not an overt transition effect.

### Hover lift
Interactive cards and book covers may lift slightly on hover.
This should be subtle, minimal, and almost imperceptible.

### Press feedback
Buttons should compress slightly and rebound cleanly.

### Success feedback
Toasts and successful state confirmations should feel like a soft arrival, not a loud interruption.

## 10.4 Motion restraint rules
- keep dense admin forms mostly quiet
- reduce animation if it risks harming clarity or speed
- prefer opacity, color, and tiny translate changes over expressive transforms
- support reduced-motion accessibility preferences

---

## 11. Page-Level Design Guidance

## 11.1 Login page
The login page sets the tone for the whole product.

Goals:
- immediate calm
- strong first impression
- simple sign-in path
- editorial layout rather than heavy auth box

Guidance:
- use generous whitespace
- allow headline and sign-in module to breathe
- use one memorable typographic statement
- keep benefits/supporting copy concise
- use minimal framing around the sign-in action

## 11.2 Dashboard
The dashboard should feel like a composed editorial overview, not a widget board.

Goals:
- orient users instantly
- elevate the most relevant current content
- provide a clear next step
- preserve breathing room

Guidance:
- use one featured zone
- keep utility stats quiet
- let admin guidance feel helpful, not noisy
- use spacing and type hierarchy to distinguish primary from secondary content

## 11.3 Books page
The books experience should celebrate browsing.

Goals:
- make books visually appealing
- support quick scanning
- avoid grid fatigue
- balance covers with typography

Guidance:
- book title and author should remain highly legible
- hover states should feel tactile and refined
- filtering should not crowd the canvas
- status and metadata should remain secondary to the title/content

## 11.4 Book detail page
This page should feel like a reading artifact and discussion space.

Goals:
- elevate the book itself
- make comments and notes readable
- keep actions clear but not overpowering

Guidance:
- top section should feel calm and spacious
- comments should read like thoughtful conversation, not cramped feed entries
- admin edit states must remain clean and dependable

## 11.5 Surveys
Voting should feel deliberate and satisfying.

Goals:
- reduce form-like friction
- make ranking and selection easy to understand
- keep result states elegant

Guidance:
- selected items should feel clearly placed
- scoring/results should be legible without loud visuals
- action feedback should be confident and immediate

## 11.6 Meetings
Meetings should feel social, anticipatory, and organized.

Goals:
- make next meeting obvious
- make RSVP interaction clear and satisfying
- preserve calm in recap and scheduling interfaces

Guidance:
- RSVP controls should feel tactile
- meeting date/time/location should be easy to scan
- past meeting recap should feel reflective, not cluttered

## 11.7 Admin pages
Admin pages must maintain trust.

Goals:
- preserve clarity under heavier data density
- keep forms and management actions dependable
- avoid ornament that reduces confidence

Guidance:
- slightly tighter density is acceptable
- spacing still needs to provide hierarchy
- destructive actions must be visually distinct and intentional

---

## 12. Feedback, Empty States, and Microcopy

## 12.1 Feedback tone
Feedback should be calm, direct, and useful.

Use language like:
- “Saved your rating.”
- “Created survey.”
- “Could not save your RSVP.”

The tone should read like a concise editorial notice: calm, direct, and unembellished.

Avoid:
- overly technical language
- exclamation-heavy celebration
- vague confirmations

## 12.2 Empty states
Empty states are opportunities to reinforce the editorial character.

They should:
- feel spacious
- be encouraging without sounding childish
- provide one clear next step
- avoid clutter or too many calls to action

## 12.3 Contextual guidance
Guidance should be integrated and concise.

Use:
- short supporting lines
- contextual helper text
- one next action when possible

Avoid:
- giant instruction paragraphs
- repetitive help text across every component

---

## 13. Accessibility and Usability Rules

Airy and minimal must still be accessible.

### Accessibility requirements
- maintain sufficient text/background contrast
- ensure focus states remain obvious in the light UI
- preserve readable text sizes for metadata and helper text
- support keyboard navigation across forms, lists, dialogs, and toasts
- support reduced motion preferences

### Usability requirements
- primary actions must remain visually clear
- light surfaces must not reduce field discoverability
- whitespace must not create ambiguity about grouping
- decorative motion must never block task completion

---

## 14. Implementation Priorities

When translating this spec into product work, follow this sequence:

### Phase 1 — Foundations
- light surface system
- typography hierarchy
- spacing rhythm
- page shell cleanup

### Phase 2 — Core interactions
- buttons
- inputs
- toasts
- cards
- list spacing
- focus/hover/press states

### Phase 3 — Page composition
- login page
- dashboard
- books page
- book detail page
- surveys and meetings

### Phase 4 — Motion polish
- route transitions
- staggered reveals
- hover lift
- refined success feedback

This order preserves coherence and reduces the risk of adding motion before the design language is stable.

---

## 15. Acceptance Criteria for Future UI Work

A UI change aligns with this spec when it:
- increases lightness without becoming sterile
- improves hierarchy through typography and spacing
- reduces reliance on heavy boxes and borders
- preserves operational clarity
- uses motion with restraint and purpose
- feels more editorial than dashboard-like
- makes the product more pleasant without making it harder to use

A UI change does **not** align with this spec when it:
- adds decorative complexity without improving clarity
- introduces too many colors or loud gradients
- compresses content too tightly
- overuses serif type
- relies on dark containers or thick chrome
- makes important workflows less obvious

---

## 16. Summary

Book Club Manager should evolve toward an **Airy Editorial** product experience defined by:
- bright, restrained cool surfaces
- clear ink-dark typography
- sans-led hierarchy with optional restrained serif accents
- generous, deliberate spacing
- editorial composition
- barely-there motion
- calm, premium clarity

If there is a conflict between decoration and clarity, choose clarity.
If there is a conflict between density and calm, choose calm unless operational needs demand otherwise.
If there is a choice between adding a new visual treatment and improving spacing or typography, improve spacing or typography first.

---

## 17. Concrete Design Tokens

This section translates the creative direction into practical tokens that can be implemented in Tailwind theme values, CSS custom properties, component classes, and motion presets.

### Compact visual system summary
- **Canvas**: bright porcelain-white with cool undertones
- **Accent**: disciplined ink blue used sparingly
- **Typography**: sans-led system with optional editorial serif only for rare moments
- **Surfaces**: white or pale cool-gray with hairline borders
- **Depth**: minimal shadow, mostly spacing-led hierarchy
- **Motion**: opacity-driven, tiny movement, almost invisible

## 17.1 Color tokens

### Foundation tokens
- `color.canvas.default` — soft app background
- `color.canvas.subtle` — faint section background
- `color.surface.base` — main card/form surface
- `color.surface.raised` — slightly elevated surface
- `color.surface.tint` — pale accent-tinted surface
- `color.border.soft` — low-contrast border
- `color.border.strong` — stronger but still restrained border

### Text tokens
- `color.text.primary` — charcoal for main content
- `color.text.secondary` — graphite for supporting copy
- `color.text.muted` — mist gray for metadata
- `color.text.inverse` — text used on dark accent surfaces
- `color.text.accent` — accent-colored text for links/highlights

### Accent tokens
- `color.accent.primary` — editorial indigo
- `color.accent.primaryHover` — slightly deeper indigo
- `color.accent.primarySoft` — pale indigo wash
- `color.accent.primarySoftHover` — stronger indigo wash for hover/active support states

### Semantic tokens
- `color.success.base` — calm green text/accent
- `color.success.soft` — pale green background
- `color.warning.base` — warm amber text/accent
- `color.warning.soft` — pale honey background
- `color.error.base` — refined red text/accent
- `color.error.soft` — soft rose background
- `color.info.base` — cool indigo-gray text/accent
- `color.info.soft` — pale blue-gray background

### Suggested starter values
These can be adjusted during implementation, but should remain in this family:

- `color.canvas.default` → `#f7f9fc`
- `color.canvas.subtle` → `#f1f4f8`
- `color.surface.base` → `#ffffff`
- `color.surface.raised` → `#fbfdff`
- `color.surface.tint` → `#edf3ff`
- `color.border.soft` → `#dde4ee`
- `color.border.strong` → `#cad4e0`
- `color.text.primary` → `#141c26`
- `color.text.secondary` → `#435062`
- `color.text.muted` → `#6c7a8c`
- `color.text.inverse` → `#ffffff`
- `color.text.accent` → `#2457a6`
- `color.accent.primary` → `#2a5db0`
- `color.accent.primaryHover` → `#214d95`
- `color.accent.primarySoft` → `#eaf2ff`
- `color.accent.primarySoftHover` → `#ddeaff`
- `color.success.base` → `#2d6b4f`
- `color.success.soft` → `#edf6f1`
- `color.warning.base` → `#94651f`
- `color.warning.soft` → `#fff7e5`
- `color.error.base` → `#a04552`
- `color.error.soft` → `#fff1f3`
- `color.info.base` → `#49617c`
- `color.info.soft` → `#edf4fb`

## 17.2 Typography tokens

### Font family tokens
- `font.family.ui` — primary sans-serif interface family
- `font.family.editorial` — serif family for selected editorial moments
- `font.family.mono` — monospace for code/data only when needed

Suggested starter mapping:
- `font.family.ui` → `Inter, "SF Pro Text", ui-sans-serif, system-ui, sans-serif`
- `font.family.editorial` → `"Newsreader", "Iowan Old Style", "Times New Roman", serif`
- `font.family.mono` → `ui-monospace, SFMono-Regular, Menlo, monospace`

### Type scale tokens
- `font.size.display`
- `font.size.h1`
- `font.size.h2`
- `font.size.h3`
- `font.size.title`
- `font.size.body`
- `font.size.bodySmall`
- `font.size.meta`
- `font.size.caption`

Suggested desktop rhythm:
- `font.size.display` → `clamp(2.75rem, 5vw, 4.5rem)`
- `font.size.h1` → `clamp(2rem, 3vw, 3rem)`
- `font.size.h2` → `1.75rem`
- `font.size.h3` → `1.25rem`
- `font.size.title` → `1.125rem`
- `font.size.body` → `1rem`
- `font.size.bodySmall` → `0.9375rem`
- `font.size.meta` → `0.875rem`
- `font.size.caption` → `0.75rem`

### Font weight tokens
- `font.weight.regular` → `400`
- `font.weight.medium` → `500`
- `font.weight.semibold` → `600`
- `font.weight.bold` → `700`

### Line-height tokens
- `lineHeight.tight` → `1.1`
- `lineHeight.snug` → `1.25`
- `lineHeight.normal` → `1.5`
- `lineHeight.relaxed` → `1.7`

### Letter-spacing tokens
- `tracking.eyebrow` — positive tracking for occasional eyebrows
- `tracking.normal` — default body/headline tracking
- `tracking.tight` — reserved for large serif/editorial moments only

Suggested values:
- `tracking.eyebrow` → `0.14em`
- `tracking.normal` → `0`
- `tracking.tight` → `-0.02em`

## 17.3 Spacing tokens

Use a restrained spacing scale and preserve rhythm rather than inventing per-component spacing.

### Core spacing scale
- `space.1` → `0.25rem`
- `space.2` → `0.5rem`
- `space.3` → `0.75rem`
- `space.4` → `1rem`
- `space.5` → `1.25rem`
- `space.6` → `1.5rem`
- `space.8` → `2rem`
- `space.10` → `2.5rem`
- `space.12` → `3rem`
- `space.16` → `4rem`
- `space.20` → `5rem`
- `space.24` → `6rem`

### Semantic spacing tokens
- `space.pageX` — horizontal page padding
- `space.pageY` — top/bottom page padding
- `space.sectionGap` — gap between major sections
- `space.moduleGap` — gap between sibling modules/cards
- `space.stackTight` — tight stack spacing for related text
- `space.stackDefault` — default vertical stack spacing
- `space.stackLoose` — relaxed vertical stack spacing
- `space.cardPadding` — internal card padding
- `space.formGap` — spacing between form fields/groups

Suggested starter mapping:
- `space.pageX` → `clamp(1.25rem, 3vw, 3rem)`
- `space.pageY` → `clamp(1.5rem, 4vw, 3.5rem)`
- `space.sectionGap` → `clamp(2.5rem, 5vw, 5rem)`
- `space.moduleGap` → `1.5rem`
- `space.stackTight` → `0.5rem`
- `space.stackDefault` → `1rem`
- `space.stackLoose` → `1.5rem`
- `space.cardPadding` → `1.5rem`
- `space.formGap` → `1rem`

## 17.4 Radius, border, and shadow tokens

### Radius tokens
- `radius.sm` → `0.5rem`
- `radius.md` → `0.875rem`
- `radius.lg` → `1.25rem`
- `radius.xl` → `1.75rem`
- `radius.pill` → `9999px`

### Border tokens
- `border.width.hairline` → `1px`
- `border.width.strong` → `1.5px`

### Shadow tokens
- `shadow.soft` — default card elevation
- `shadow.lifted` — hover elevation for interactive cards
- `shadow.overlay` — dialogs/toasts/popovers

Suggested shadow family:
- `shadow.soft` → `0 8px 24px rgba(24, 24, 32, 0.06)`
- `shadow.lifted` → `0 16px 36px rgba(24, 24, 32, 0.10)`
- `shadow.overlay` → `0 20px 60px rgba(24, 24, 32, 0.14)`

## 17.5 Motion tokens

### Duration tokens
- `motion.duration.fast` → `140ms`
- `motion.duration.base` → `220ms`
- `motion.duration.slow` → `360ms`
- `motion.duration.xslow` → `520ms`

### Easing tokens
- `motion.ease.standard` → `cubic-bezier(0.2, 0.8, 0.2, 1)`
- `motion.ease.emphasized` → `cubic-bezier(0.16, 1, 0.3, 1)`
- `motion.ease.exit` → `cubic-bezier(0.4, 0, 1, 1)`

### Motion patterns
- `motion.page.enter` — fade + translateY(4px)
- `motion.card.hover` — translateY(-1px) + subtle shadow shift
- `motion.button.press` — scale(0.985)
- `motion.toast.enter` — fade + translateY(6px)
- `motion.list.staggerStep` — `0–20ms` between siblings

## 17.6 Layout tokens

- `layout.maxWidth.page` → `1200px`
- `layout.maxWidth.reading` → `720px`
- `layout.maxWidth.form` → `640px`
- `layout.maxWidth.hero` → `900px`
- `layout.sidebar.width` → `240px`
- `layout.header.height` → `72px`

Use narrower reading widths for support copy, comments, and editorial text blocks.

---

## 18. Page Redesign Plan

This section turns the design direction into a practical page-by-page implementation plan.

## 18A. Page-by-Page Redesign Checklist

Use this checklist before implementation on each page. A page is only considered aligned with the Airy Editorial direction when the relevant items below are satisfied.

### 18A.1 Global shell and navigation checklist
- [ ] Replace dark or heavy shell backgrounds with cool light canvas tones.
- [ ] Simplify navigation chrome so it supports content instead of dominating it.
- [ ] Use ink-blue accent only for active navigation and key interactive emphasis.
- [ ] Standardize page max-width, horizontal padding, and vertical rhythm.
- [ ] Ensure focus states remain clear in the lighter theme.
- [ ] Remove unnecessary heavy borders, pills, and dark containers.

### 18A.2 Shared UI primitives checklist
- [ ] Define shared page header pattern with eyebrow, title, and support copy rules.
- [ ] Define shared section header pattern.
- [ ] Define light surface/card variants with restrained border and shadow usage.
- [ ] Define button variants for primary, secondary, and ghost actions.
- [ ] Define input, select, and textarea styles for the light editorial system.
- [ ] Define badge/status chip rules with low-saturation visual treatment.
- [ ] Define toast variants with editorial notice styling.
- [ ] Define minimal route/page transition wrapper with reduced-motion support.

### 18A.3 Login page checklist
- [ ] Reframe the page as an editorial welcome screen rather than a dark auth panel.
- [ ] Increase whitespace around the main headline and sign-in area.
- [ ] Keep one obvious primary sign-in action.
- [ ] Reduce heavy framing around supporting feature bullets or benefits.
- [ ] Use typography, not large color blocks, to create the first impression.
- [ ] Keep motion limited to subtle reveal and button press feedback.

### 18A.4 Dashboard checklist
- [ ] Introduce a stronger editorial header with clear page title and concise support text.
- [ ] Establish one featured primary content block.
- [ ] Reduce the widget-board feeling by simplifying secondary modules.
- [ ] Keep admin checklist/help visually useful but not dominant.
- [ ] Use spacing and hierarchy to separate current priorities from supporting information.
- [ ] Ensure quick actions feel integrated rather than visually noisy.

### 18A.5 Books page checklist
- [ ] Make the page feel like a curated catalog, not a dense app grid.
- [ ] Prioritize book title and author hierarchy.
- [ ] Keep filters and controls visually light.
- [ ] Reduce card heaviness and allow more open composition where possible.
- [ ] Ensure hover/focus states are subtle and premium.
- [ ] Preserve strong scanability across responsive breakpoints.

### 18A.6 Book detail page checklist
- [ ] Give the hero section more breathing room.
- [ ] Make title, author, and description the visual focus.
- [ ] Keep ratings, comments, and notes readable and well spaced.
- [ ] Make admin controls quieter than the core reading content.
- [ ] Ensure success/error feedback feels calm and integrated.
- [ ] Keep comment editing and moderation states visually clean.

### 18A.7 Surveys page checklist
- [ ] Separate create flow from browsing flow with spacing rather than heavy framing.
- [ ] Clarify open vs closed survey sections through headings and rhythm.
- [ ] Reduce form clutter in admin create areas.
- [ ] Keep status and deadlines readable but secondary.
- [ ] Ensure survey cards/rows remain light and scannable.
- [ ] Keep success actions and next-step CTAs stylistically consistent.

### 18A.8 Survey detail page checklist
- [ ] Make the page title and survey context immediately understandable.
- [ ] Present ranked choices in a cleaner, calmer selection surface.
- [ ] Keep selected states clear without overusing accent fills.
- [ ] Ensure results are legible and elegant after closure.
- [ ] Keep admin close/tie-resolution controls visible but restrained.
- [ ] Use minimal motion for vote submission and result updates.

### 18A.9 Meetings page checklist
- [ ] Clarify the hierarchy between date surveys, upcoming meetings, and past meetings.
- [ ] Reduce the visual weight of admin create forms.
- [ ] Make date/time/location easier to scan.
- [ ] Keep member-facing lists more prominent than admin tooling when appropriate.
- [ ] Maintain consistent status chip treatment.
- [ ] Preserve clear post-create next-step actions without clutter.

### 18A.10 Meeting detail page checklist
- [ ] Make the primary meeting information easy to read at a glance.
- [ ] Give RSVP controls enough room to feel intentional.
- [ ] Keep recap content in a readable, editorial-style block.
- [ ] Ensure linked book information integrates cleanly into the layout.
- [ ] Keep admin update/cancel controls operationally clear but visually restrained.
- [ ] Use minimal confirmation motion for RSVP and admin save actions.

### 18A.11 Date survey detail page checklist
- [ ] Present date options in a clean, easy-to-compare arrangement.
- [ ] Keep multi-select behavior understandable without visual noise.
- [ ] Separate member voting and admin confirmation controls clearly.
- [ ] Elevate the confirmed date cleanly after closure.
- [ ] Ensure availability feedback is immediate and calm.
- [ ] Avoid crowded control groupings.

### 18A.12 Wishlist page checklist
- [ ] Make the suggestion form feel lighter and more inviting.
- [ ] Improve hierarchy of title, author, and optional fields.
- [ ] Keep search/import assistance visually subordinate to the main suggestion flow.
- [ ] Make wishlist items feel curated and readable.
- [ ] Preserve clear success/error feedback after submissions.
- [ ] Avoid turning the page into a dense utility form.

### 18A.13 Admin users page checklist
- [ ] Keep the admin user list trustworthy and easy to scan.
- [ ] Lighten the overall page without reducing structure.
- [ ] Make the add-user form feel cleaner and less boxed in.
- [ ] Preserve clear distinction between primary actions and destructive actions.
- [ ] Keep table/list density comfortable and readable.
- [ ] Ensure feedback and state changes remain obvious in the lighter UI.

### 18A.14 Validation checklist for every redesigned page
- [ ] Primary action is obvious within a few seconds.
- [ ] Accent color is used sparingly and intentionally.
- [ ] Typography carries most of the hierarchy.
- [ ] Spacing, not chrome, defines grouping.
- [ ] Motion is subtle enough to go mostly unnoticed.
- [ ] Light surfaces still provide adequate contrast and affordance.
- [ ] The page feels more editorial than dashboard-like.
- [ ] The page remains operationally clear and testable.

## 18.1 Global shell and navigation

### Objectives
- remove the heavy dark-shell feel
- make the app canvas brighter and calmer
- let content pages carry more visual identity than navigation chrome

### Changes
- shift shell background to `color.canvas.default`
- simplify navigation surfaces to pale, low-contrast panels or a minimal sidebar
- reduce visible borders in the shell
- use softer active states with `color.accent.primarySoft`
- increase top-level page breathing room with `space.pageX` and `space.pageY`

### Deliverables
- updated global background and shell spacing
- typography-led nav labels
- consistent page max-width wrappers
- shared page header pattern

## 18.2 Shared primitives to build first

Before page redesign, create or refactor shared primitives for:
- page header
- section header
- editorial title styles
- surface/card variants
- button variants
- form field wrapper
- badge/status chip
- toast container and toast variants
- route transition wrapper

These primitives should consume the tokens in Section 17.

## 18.3 Login page redesign

### UX goal
Turn login into an editorial welcome screen rather than a generic auth gate.

### Layout
- two-column composition on desktop, single-column on mobile
- left side: editorial headline, short support copy, minimal benefit points
- right side: light sign-in panel with one dominant action

### Typography
- serif or serif-accented main headline
- support copy constrained to `layout.maxWidth.reading`
- minimal eyebrow label above the headline if needed

### Spacing
- large vertical breathing room
- strong separation between hero copy and sign-in area
- benefits presented as lightly spaced editorial notes, not chunky pills

### Motion
- staged reveal: eyebrow → headline → support → sign-in panel
- subtle button press interaction only

### Success criteria
- first impression feels premium and calm
- sign-in path remains obvious in under 3 seconds
- layout feels memorable without being decorative

## 18.4 Dashboard redesign

### UX goal
Make the dashboard feel like a curated overview of the club’s current state.

### Layout
- editorial page header
- one featured hero block for the most relevant current item
- secondary modules beneath in asymmetrical or balanced two-column layout
- keep utility stats visually quieter than primary actions

### Typography
- strong L1 page title
- concise support copy
- featured card title gets stronger typographic emphasis than utility cards

### Spacing
- larger gap between header and featured card
- quieter, tighter spacing within utility clusters
- more vertical room between major dashboard zones

### Motion
- hero enters first
- supporting cards stagger in softly
- checklist progress and success states animate minimally

### Success criteria
- users immediately understand the next important thing
- dashboard feels less like widgets, more like composition
- admin checklist remains useful without dominating the screen

## 18.5 Books page redesign

### UX goal
Make browsing books feel curated and tactile.

### Layout options
Preferred first pass:
- featured current or latest book at top
- below: airy grid or editorial list of remaining books
- filters placed lightly above the content, not inside a heavy toolbar

### Typography
- book titles are the visual anchor after cover images
- author and status remain clearly secondary
- filters use UI sans with subdued styling

### Spacing
- generous gaps between book items
- metadata stacked tightly under titles
- maintain breathing room around filters and sections

### Motion
- card hover lift
- soft metadata fade-in or accent emphasis on hover/focus
- smooth layout response when filters change

### Success criteria
- books feel collectible and browsable
- page avoids grid fatigue
- users can scan titles and covers quickly

## 18.6 Book detail redesign

### UX goal
Make book detail feel like a reading artifact plus discussion space.

### Layout
- generous hero section with cover, title, author, description, and key actions
- discussion and notes below in calmer reading-width blocks
- admin edit tools visually separated from the core reading experience

### Typography
- book title may use editorial serif
- author, status, and metadata use quiet sans hierarchy
- comments should read like thoughtful entries, not compressed feed rows

### Spacing
- top section should breathe more than the current implementation
- comment blocks should have strong internal spacing and reading width discipline
- form controls should not crowd discussion content

### Motion
- hero content layered fade-in
- star rating feels tactile
- comment creation success and insertion feel soft and immediate

### Success criteria
- the book itself feels central
- discussion feels readable and inviting
- admin actions remain available without visually taking over

## 18.7 Surveys page redesign

### UX goal
Make survey creation and browsing clearer and more intentional.

### Layout
- page header with support text
- admin create block elevated but not visually heavy
- open and closed surveys clearly separated by spacing and headings

### Typography
- survey titles lead
- deadlines and status remain secondary
- admin form labels become more polished and consistent

### Spacing
- reduce density in create forms
- preserve clear grouping between title, deadline, options, and submit
- survey list should breathe more between items

### Motion
- create success toast with editorial softness
- survey list items lift subtly on hover

### Success criteria
- admins can create surveys calmly and clearly
- members can quickly identify which surveys need action

## 18.8 Survey detail redesign

### UX goal
Make ranked voting feel deliberate and readable.

### Layout
- survey context at top
- voting area as a composed selection surface
- results section below with clear visual hierarchy after closure

### Typography
- page title and survey title should be distinct if both appear
- rank/score indicators should be legible but understated

### Spacing
- selected options need room to feel intentionally placed
- results should not collapse into dense rows

### Motion
- option selection animates into place
- vote submission feedback appears immediately
- results bars or score emphasis animate softly

### Success criteria
- ranking is easy to understand
- closed-state results are elegant and legible
- tie-resolution controls remain clear for admins

## 18.9 Meetings page redesign

### UX goal
Make scheduling and upcoming events feel organized and social.

### Layout
- page header
- open date surveys section
- upcoming meetings section
- past meetings section
- admin creation forms either as calm side-by-side surfaces or separated by stronger editorial spacing

### Typography
- section headings should clearly differentiate date surveys from meetings
- date, time, and location should scan quickly
- status chips remain restrained

### Spacing
- improve separation between admin forms and member-facing lists
- create stronger hierarchy between upcoming and past content

### Motion
- subtle hover lift on meeting cards
- create success feedback with optional “Open …” action

### Success criteria
- admins can create meetings without the page feeling form-heavy
- members can instantly find the next event or open date poll

## 18.10 Meeting detail redesign

### UX goal
Make RSVP and recap interactions feel focused and calm.

### Layout
- primary meeting info at top
- RSVP block prominently placed
- linked book and attendance context below or alongside
- recap in a reading-style block for completed meetings

### Typography
- date/title block leads
- RSVP copy remains compact and clear
- recap should feel more editorial than administrative

### Spacing
- RSVP controls need breathing room to feel tactile
- recap and related book sections should not crowd each other

### Motion
- segmented RSVP interaction with subtle snap and confirmation
- recap save/cancel confirmation via soft toast patterns

### Success criteria
- members can RSVP confidently in one glance
- past meeting recaps feel pleasant to read

## 18.11 Date survey detail redesign

### UX goal
Make availability selection feel calm and understandable.

### Layout
- survey context first
- date options in a clean selectable stack/grid
- final confirmation/results below

### Typography
- date options should be easy to compare
- explanatory copy should be short and reassuring

### Spacing
- enough room between options to support multi-select without visual confusion
- admin close/confirm controls separated from member voting controls

### Motion
- selected dates receive subtle active-state reinforcement
- submit availability feedback appears immediately

### Success criteria
- voting feels simple and low-friction
- confirmed meeting date feels clearly elevated after closure

## 18.12 Wishlist page redesign

### UX goal
Make wishlist suggestion feel like a contribution, not a raw form.

### Layout
- suggestion form with cleaner editorial framing
- wishlist items below in a lighter list/grid
- search assistance integrated without turning the page into a dense tool

### Typography
- suggestion title and author fields stay visually primary
- wishlist item titles lead over metadata

### Spacing
- generous form spacing to reduce friction
- stronger separation between form area and submitted suggestions

### Motion
- suggestion success feedback with gentle toast
- search results and item additions should feel responsive but not flashy

### Success criteria
- members feel invited to suggest books
- wishlist reads like a curated pool of future reads

## 18.13 Admin users page redesign

### UX goal
Preserve operational clarity while aligning with the lighter editorial system.

### Layout
- page header plus concise support copy
- lightweight add-user form or panel
- readable users table/list below

### Typography
- table/list headers stay simple and legible
- support copy remains concise and practical

### Spacing
- enough row height to scan user states comfortably
- avoid dense admin-table feel where possible

### Motion
- minimal; mostly toast and small hover/focus feedback

### Success criteria
- admin workflows remain trustworthy and fast
- the page feels lighter without losing structure

## 18.14 Implementation sequence

### Step 1 — Theme and tokens
- add token layer to Tailwind/theme/CSS variables
- update global backgrounds, text colors, and spacing utilities
- introduce serif and sans font pairing

### Step 2 — Shared primitives
- page headers
- cards/surfaces
- buttons
- inputs
- badges
- toasts
- transitions

### Step 3 — Shell and login
- global app shell
- login page redesign

### Step 4 — High-impact content pages
- dashboard
- books page
- book detail

### Step 5 — Action-heavy flows
- surveys and survey detail
- meetings and meeting detail
- date survey detail
- wishlist

### Step 6 — Utility/admin surfaces
- admin users page
- remaining forms/tables
- stats polish

## 18.15 Definition of done for the redesign

The Airy Editorial redesign is successful when:
- the app reads as light and premium on first load
- typography hierarchy is visibly stronger across all major screens
- spacing, not dark chrome, defines most grouping
- the shell feels calmer and less dominant
- books and meetings feel more curated than dashboard-like
- animations add polish without drawing attention to themselves
- admin flows remain clear and trustworthy

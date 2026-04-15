# UX/UI Spec: Book Club Manager

This is the living UX/UI reference for Book Club Manager.

Use this file when designing or implementing new features so the product stays visually consistent, interaction patterns stay predictable, and the app continues to feel cohesive as it grows.

This spec complements `SPEC.md`:
- `SPEC.md` defines product behavior and acceptance criteria.
- `UX_UI_SPEC.md` defines visual, interaction, layout, feedback, and motion standards.

---

## 1. UX/UI North Star

Book Club Manager should feel like:
- a calm, sunlit reading room
- a private literary salon
- a modern product with taste, warmth, and clarity

The product should **not** feel like:
- a dark admin dashboard
- a generic white SaaS app
- a whimsical book-themed toy

### Core qualities

Every new feature should aim for these qualities:
- **Light**: bright surfaces, breathable layouts, low visual noise
- **Minimal**: typography and spacing do more work than borders and boxes
- **Warm**: soft neutrals, paper-like surfaces, human tone
- **Editorial**: strong hierarchy, content-first layouts, elegant typography
- **Calmly animated**: motion guides and delights without distracting
- **Trustworthy**: admin and data-heavy workflows remain clear and dependable

---

## 2. Design Direction

### Primary direction
**Morning Reading Room**

A bright editorial interface with warm paper tones, soft indigo/lilac accents, airy layouts, and subtle atmospheric motion.

### Supporting influences
- editorial magazine layouts
- reading journal aesthetics
- premium consumer-product motion
- soft ambient gradients, used sparingly

### Visual balance
Use:
- editorial warmth from the base direction
- restrained modern polish from premium product UIs
- subtle delight in motion and feedback

Avoid:
- overly cold minimalism
- overly playful gradients and glow everywhere
- literal skeuomorphic book or library effects

---

## 3. Design Principles

### 3.1 Content over chrome
Favor spacing, hierarchy, and typography over heavy frames, dark panels, and strong outlines.

### 3.2 Lightness with depth
The app should be bright, but not flat. Depth should come from:
- soft shadows
- layered surfaces
- subtle contrast shifts
- occasional atmospheric accents

### 3.3 Calm social energy
The product supports a shared club experience. It should feel welcoming and alive, but never noisy.

### 3.4 Motion as guidance
Animation should:
- clarify state changes
- reward completed actions
- make navigation feel connected

Animation should not:
- block progress
- compete with content
- feel like a gimmick

### 3.5 Operational clarity
Admin flows must stay highly legible. Beauty must not reduce confidence in forms, exports, scheduling, or user management.

### 3.6 Reuse patterns
New features should reuse established patterns for:
- page headers
- cards
- forms
- toasts
- lists
- empty states
- action bars
- badges/status treatments

---

## 4. Color and Surface System

The app should use a light, warm foundation.

### Foundation guidance
- **App background**: warm ivory or very soft neutral, not pure white
- **Primary surfaces**: paper-white with a slight warm tint
- **Muted surfaces**: parchment-like or soft neutral wash
- **Primary text**: charcoal, not pure black
- **Secondary text**: muted ink gray
- **Primary accent**: dusty violet / soft indigo
- **Accent wash**: pale lilac background fills for active or featured states
- **Success**: muted sage / calm green
- **Warning**: pale honey / warm amber
- **Error**: soft rose tint with readable red text, not harsh saturated red blocks

### Color rules
Use accent color for:
- primary actions
- active navigation state
- selected items
- featured cards
- focus rings

Do not use accent color for everything. Most of the interface should remain neutral.

### Surface rules
Cards and panels should feel like paper placed on a table:
- soft radius
- low-contrast borders
- wide, soft shadows
- subtle layer separation

Avoid:
- thick dark borders
- pure white against pure white with no depth
- too many competing tinted backgrounds on the same screen

---

## 5. Typography

Typography should carry much of the product's personality.

### Roles
- **Serif**: emotional emphasis only
- **Sans-serif**: all operational UI, labels, forms, lists, and body text

### Recommended usage
Use serif for:
- hero headlines
- featured titles
- occasional page statements

Use sans-serif for:
- navigation
- buttons
- inputs
- metadata
- cards
- tables/lists
- descriptions

### Hierarchy
All new screens should include a clear hierarchy:
1. page label or eyebrow, optional
2. primary page title
3. supporting description or status context
4. section headings
5. body and metadata

### Typography behavior
- favor fewer font sizes with stronger spacing discipline
- use weight and spacing before adding visual decoration
- avoid overly compressed line lengths on large screens

---

## 6. Layout and Spacing

### General layout guidance
The app should feel open and breathable.

Use:
- larger vertical rhythm between sections
- comfortable page padding
- fewer stacked dense blocks
- clean grouping of related actions

Avoid:
- overly tight grids
- forms that feel like a wall of inputs
- pages where every section has equal visual weight

### Page structure
Most pages should follow this pattern:
1. header area
2. primary content or featured state
3. secondary content
4. low-priority utilities or historical content

### Shell/navigation
The shell should be lighter than the original dark UI:
- bright background
- minimal nav treatment
- soft active states
- reduced visual heaviness around the content area

---

## 7. Core Components

### 7.1 Buttons

#### Primary buttons
Use for the main action on a screen.
- soft violet/indigo fill
- clear contrast
- elegant radius
- hover: brighten slightly and lift subtly
- press: light compression

#### Secondary buttons
Use for supporting actions.
- light surface
- soft border or tint
- hover: gentle background wash

#### Ghost/text buttons
Use sparingly for low-priority actions.
- text-led
- subtle hover wash or underline

Rules:
- pages should usually have one clear primary action
- avoid multiple equally loud primary buttons in the same area

### 7.2 Inputs
Inputs should feel polished and calm.
- bright surface
- low-contrast border
- visible but soft focus ring in pale accent tone
- comfortable vertical padding
- labels above inputs where possible

Rules:
- prefer consistent label placement
- use helper text for clarification instead of placeholder-only instructions
- validation messages should be concise and calm

### 7.3 Cards
Cards should be soft containers, not hard boxes.
- gentle radius
- restrained shadow
- warm surface
- clear internal spacing

Rules:
- use cards for grouping or featured items
- do not wrap every small element in its own heavy card
- keep card density appropriate to task importance

### 7.4 Badges and status labels
Badges should be restrained.
- lighter fills
- subtle text styling
- used only where status adds clarity

Avoid turning every piece of metadata into a pill.

### 7.5 Toasts
Toasts are the default lightweight feedback mechanism for completed user actions.

They should:
- float lightly above the interface
- use compact, readable copy
- support optional action buttons
- have distinct but soft success/error/info styles

Use toasts for:
- success confirmations
- recoverable errors
- contextual next-step prompts

Do not use toasts for:
- critical destructive confirmations
- long-form guidance
- anything requiring immediate user reading before continuing

### 7.6 Empty states
Empty states should feel intentional and encouraging.

Each empty state should include:
- clear explanation of what is missing
- next recommended action
- calm, optimistic tone

Optional:
- soft decorative accent or subtle illustration-like shape treatment

---

## 8. Motion and Transitions

### Motion philosophy
Motion should feel like paper being placed, light settling, or a card gently lifting from a desk.

### Motion qualities
- soft
- quiet
- premium
- short enough to feel responsive
- rarely bouncy

### Motion patterns

#### Entrance motion
Use for page sections, hero blocks, and grouped lists.
Pattern:
- fade in
- slight upward movement
- optional small scale settle
- stagger only for grouped items

#### Hover motion
Use for interactive cards and key controls.
Pattern:
- tiny lift
- subtle shadow expansion
- mild background warmth or glow

#### Press motion
Use on buttons and segmented controls.
Pattern:
- slight compression
- quick release

#### Success motion
Use a restrained “ink bloom” style.
Pattern:
- soft tinted halo
- toast float-in
- no confetti or loud celebratory motion

#### Route transitions
Navigation should feel connected.
Pattern:
- outgoing content fades softly
- incoming content rises slightly
- transitions should not feel like app panels sliding aggressively

### Motion usage rules
Apply stronger motion to:
- login hero
- dashboard highlights
- book cards
- toasts
- RSVP, vote, and save confirmations

Apply subtler motion to:
- admin forms
- tables/lists
- destructive or sensitive workflows

### Accessibility rule
All new motion should degrade gracefully for reduced-motion users.

---

## 9. Interaction Patterns

### 9.1 Feedback
Every user action that changes data should produce visible feedback.

Examples:
- rating saved
- vote submitted
- RSVP updated
- comment posted
- admin item created/updated/deleted

Preferred feedback order:
1. inline state update if relevant
2. toast confirmation
3. optional contextual CTA if next step is obvious

### 9.2 Post-create guidance
After successful creation flows, provide a contextual next step when possible.

Examples:
- open created book
- open survey
- open meeting
- open date survey

### 9.3 Selection states
Selections should feel tactile and obvious.
Use:
- gentle fills
- clearer contrast
- mild motion
- consistent selected styling

Avoid:
- only changing tiny text labels
- relying on color alone

### 9.4 Progressive disclosure
Keep low-priority options out of the primary path.
Use collapsible areas, secondary sections, or quieter styling for advanced/admin-only controls.

### 9.5 Confirmation design
Use explicit confirmation for destructive or sensitive actions.
Examples:
- delete operations
- export database
- irreversible admin changes

---

## 10. Page-Level Guidelines

### 10.1 Login
Goal: memorable first impression.

Requirements:
- editorial two-column or similarly balanced layout on larger screens
- strong headline
- clear invite-only explanation
- auth card with premium but restrained treatment
- subtle atmospheric motion

### 10.2 Dashboard
Goal: curated and calm command center.

Requirements:
- welcome/hero area
- key active items elevated above secondary content
- admin getting-started guidance feels refined, not like a warning box
- recent activity is visually quiet

### 10.3 Books list
Goal: browsing feels curated and tactile.

Requirements:
- covers are visually important
- metadata is secondary to title/author
- admin create flows feel integrated, not bolted on
- empty states encourage building the shelf

### 10.4 Book detail
Goal: modern reading journal.

Requirements:
- strong book header
- rating and comment actions feel personal and rewarding
- comments feel discussion-oriented, not like raw database rows
- admin tools visually separated and quieter than member content

### 10.5 Surveys and survey detail
Goal: choices feel meaningful and easy.

Requirements:
- active surveys visually prioritized
- ranking/selection states are tactile
- results are readable and calm
- tie resolution and close actions feel intentional

### 10.6 Meetings and meeting detail
Goal: social and anticipatory.

Requirements:
- next meeting feels invitation-like
- RSVP controls are clear and satisfying
- recap content feels like a meeting note, not a dump of text
- past meetings are quieter than upcoming ones

### 10.7 Date surveys
Goal: date choice feels intuitive.

Requirements:
- date options are roomy and easy to scan
- selected states are obvious
- confirmed date receives a stronger final highlight

### 10.8 Wishlist
Goal: low-friction participation.

Requirements:
- suggestion form feels welcoming
- suggestion list feels like recommendation slips, not hard utility cards
- contribution feedback is visible and positive

### 10.9 Admin users
Goal: inviting members should feel polished.

Requirements:
- membership actions feel club-oriented, not back-office heavy
- form and list are visually separated but equally calm
- success state should reinforce invitation flow clearly

### 10.10 Admin export / sensitive admin utilities
Goal: serious but still aligned with the design system.

Requirements:
- retain clarity and caution
- use restrained warning styling
- avoid excessive decoration

---

## 11. Copy and Tone Guidelines

The interface tone should be:
- calm
- direct
- warm
- concise

### Preferred style
- short labels
- human wording
- clear verbs
- low jargon

Examples of preferred tone:
- “Invite member” over “Create user” when appropriate
- “Save availability” over “Submit availability” when the action is revisable
- “Schedule meeting” over “Create meeting” when it improves clarity

Rules:
- avoid overly technical microcopy in the UI
- avoid overly cute or whimsical wording
- write like a thoughtful host, not a system console

---

## 12. Accessibility Rules

All new UI work should preserve or improve accessibility.

Requirements:
- sufficient color contrast on all text and controls
- visible focus states
- keyboard-accessible interactions
- semantic headings and landmarks
- reduced-motion support
- do not rely on color alone for state communication
- interactive icons should have accessible labels

---

## 13. Implementation Rules for Future Features

When adding a new feature, check it against this list:

### Before designing
- Does the feature match the Morning Reading Room direction?
- Is the layout light, calm, and content-first?
- Does it reuse existing page and component patterns?

### Before implementing
- Which existing component patterns can be reused?
- What is the primary action?
- What feedback is shown after success or error?
- Does the feature need an empty state?
- Does it need a contextual next-step CTA?
- What motion, if any, genuinely helps?

### Before merging
- Does it feel visually consistent with existing pages?
- Does it maintain accessibility?
- Is the animation tasteful and optional?
- Are admin workflows still trustworthy and clear?

---

## 14. Evolving This Spec

This file is a living reference.

Update it when:
- the app gains a new major surface or workflow
- a new reusable UI pattern is introduced
- the motion system changes materially
- color/typography tokens are revised
- lessons from usability testing change the standard approach

If implementation deviates from this spec intentionally, document the reason so future work stays coherent.

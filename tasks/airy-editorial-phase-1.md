# Airy Editorial — Phase 1 Implementation Brief

This brief covers the first implementation slice of the Airy Editorial redesign:
- `7.11.1` theme tokens and shell primitives
- `7.11.2` login page redesign
- `7.11.3` dashboard page redesign
- `7.11.4` books page redesign

Use `UX_UI_SPEC.md` as the source of truth for design intent. This brief turns that direction into a small, practical implementation scope.

---

## Goals

Phase 1 should prove the new direction without requiring a full-app rewrite.

It must establish:
- the cool editorial light theme
- the typography-led hierarchy system
- the quiet ink-blue accent system
- the lighter shell and shared primitives
- the first three high-impact page redesigns

At the end of this phase, the product should already feel visibly different on first load.

---

## Non-goals

This phase should not:
- redesign every page in the app
- introduce complex animation systems
- rewrite working product logic without UX need
- change feature behavior unless needed for presentation or clarity
- add speculative new UI patterns not grounded in `UX_UI_SPEC.md`

Motion should remain subtle and implementation-friendly.

---

## Implementation order

### 1. Theme tokens + shell primitives
Build the visual system first.

### 2. Login page
Use it to validate the new visual language.

### 3. Dashboard page
Use it to validate page hierarchy and section rhythm.

### 4. Books page
Use it to validate the content browsing system.

Do not redesign downstream pages until these four steps are coherent.

---

## 7.11.1 — Theme tokens and shell primitives

### Scope
Create or update the shared design foundation used by all later pages.

### Implementation targets
Likely files:
- `packages/client/src/main.tsx`
- `packages/client/src/index.css`
- `packages/client/src/components/app-shell.tsx`
- `packages/client/src/components/ui/button.tsx`
- `packages/client/src/components/ui/toast-provider.tsx`
- shared UI helpers/components introduced during the redesign

### Required work
- Introduce light theme tokens aligned with `UX_UI_SPEC.md`
- Establish cool editorial canvas, surface, border, and text colors
- Introduce ink-blue accent usage for primary actions and active states
- Update shell background, page container spacing, and navigation styling
- Define shared page header pattern
- Define shared surface/card treatment
- Update button variants to match the new direction
- Update input/select/textarea styling toward the lighter editorial system
- Keep toast styling aligned with the new shell and surface language

### Design rules
- Typography and spacing should carry more hierarchy than cards or color blocks
- Avoid heavy dark shells, oversized shadows, and loud tints
- Preserve strong focus states and contrast in the light theme
- Maintain reduced-motion compatibility

### Acceptance criteria
- App shell looks visibly lighter and calmer
- Shared buttons, inputs, and toasts feel visually coherent
- Accent color is disciplined and not overused
- Existing pages remain usable even before full redesign
- `npm run lint` and `npm run build` pass

---

## 7.11.2 — Login page redesign

### Scope
Redesign the login page to establish the Airy Editorial look and feel.

### Implementation targets
Likely files:
- `packages/client/src/pages/login-page.tsx`
- shared page header or hero primitives introduced in 7.11.1

### Required work
- Replace the dark, boxed feeling with a bright editorial composition
- Increase whitespace and simplify the page structure
- Make the headline more typography-led
- Keep one clear primary sign-in action
- Reduce heavy treatment around supporting copy and benefit bullets
- Align the page with the updated button, spacing, and surface system

### Design rules
- The page should feel crisp and premium, not soft-glowy or playful
- Serif, if used at all, should be minimal and justified
- Motion should be limited to a subtle reveal and press feedback
- Sign-in path must stay obvious within seconds

### Acceptance criteria
- The login page reads as clearly part of the new design direction
- The sign-in button remains the dominant action
- The page feels lighter, more spacious, and more editorial than before
- The page remains fully functional in normal and test-auth flows

---

## 7.11.3 — Dashboard page redesign

### Scope
Redesign the dashboard into a calmer editorial overview.

### Implementation targets
Likely files:
- `packages/client/src/pages/dashboard-page.tsx`
- any shared dashboard or page-section primitives introduced during the redesign

### Required work
- Introduce a stronger editorial page header
- Establish one featured content block for the most important current item
- Simplify the visual treatment of secondary cards/modules
- Reduce the widget-board feeling through spacing and hierarchy
- Keep the admin getting-started checklist useful but visually quieter
- Ensure quick links/actions fit the new tone

### Design rules
- Primary vs secondary content must be obvious through structure, not loud color
- Statistics and utility content should stay readable but visually subdued
- Admin guidance must feel integrated, not bolted on
- Motion should be almost invisible

### Acceptance criteria
- The page feels more like a curated overview than a dashboard grid
- Users can identify the most important current action quickly
- Admin checklist remains discoverable and usable
- Existing dashboard data and quick actions continue to work

---

## 7.11.4 — Books page redesign

### Scope
Redesign the books page as a typography-led catalog.

### Implementation targets
Likely files:
- `packages/client/src/pages/books-page.tsx`
- any shared list/card/filter primitives introduced during the redesign

### Required work
- Reduce the heavy card/grid feeling
- Make title and author hierarchy more elegant and scannable
- Keep filters and create flow visually light
- Improve spacing between book items and sections
- Refine hover/focus states to feel subtle and premium
- Preserve admin create affordances and success feedback

### Design rules
- The page should feel curated, not like a generic media grid
- Covers may support browsing, but typography should lead the layout
- Avoid loud status badges or over-framed controls
- Interactive polish should remain restrained

### Acceptance criteria
- Browsing feels lighter and more editorial
- Titles are easy to scan quickly
- Filters and create controls remain clear without overpowering the page
- Book creation and navigation flows still work as before

---

## Shared engineering constraints

Throughout Phase 1:
- preserve current behavior and API integrations
- avoid regressions in auth, navigation, and core CRUD flows
- prefer shared primitives over one-off page styling
- keep edits incremental and easy to verify
- re-run validation after each major step rather than waiting until the end

Recommended checks during implementation:
- `npm run lint`
- `npm run build`
- targeted manual browser walkthrough for login, dashboard, and books
- `npm run e2e` after the phase is complete

---

## Definition of done for Phase 1

Phase 1 is complete when:
- the shell and primitives clearly establish the Airy Editorial direction
- the login page reflects the new visual system
- the dashboard page reflects the new layout and hierarchy principles
- the books page reflects the new typography-led browsing model
- the app still passes lint/build and remains functionally stable
- the redesign feels intentional and cohesive rather than partially themed

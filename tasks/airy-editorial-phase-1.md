# Airy Editorial — Phase 1 Execution Plan

This document turns `UX_UI_SPEC.md` into the first practical implementation phase.

Phase 1 focuses on the **foundation layer** of the redesign:
- theme tokens
- typography
- spacing rhythm
- shell
- shared primitives
- first-impression pages

It is intentionally limited to high-leverage changes that make the Airy Editorial direction visible quickly without redesigning the entire app at once.

---

## 1. Phase 1 Goal

Make the product feel meaningfully closer to the **Airy Editorial** direction through:
- a lighter visual foundation
- stronger typography hierarchy
- more deliberate spacing
- calmer shell/navigation
- refined shared components
- a redesigned login experience
- a first-pass editorial dashboard

By the end of Phase 1, users should feel the new direction immediately when they:
- open the app
- sign in
- land on the dashboard

---

## 2. Scope

### In scope
- global light theme foundation
- color/type/spacing token setup
- app shell cleanup
- button refinement
- toast refinement
- login page redesign polish
- dashboard redesign polish
- shared header/surface utility patterns where needed

### Out of scope
- full books page redesign
- book detail redesign
- surveys/meetings redesign
- wishlist/admin page redesign
- advanced shared-element transitions
- full stats page redesign

---

## 3. Exact Files to Change First

## 3.1 Global foundation

### `packages/client/src/index.css`
**Purpose:** establish the global Airy Editorial foundation.

**Change goals:**
- replace ad hoc global colors with a token-like CSS variable layer
- add typography variables for UI and editorial fonts
- define canvas, surface, text, border, accent, and semantic feedback variables
- define reusable spacing/radius/shadow variables where practical
- simplify background art so it feels lighter and less decorative
- ensure body/root styles reflect the new calmer canvas

**Expected output:**
- one clear source of truth for Phase 1 visual tokens
- lighter, more stable base for every page

---

## 3.2 Shared shell

### `packages/client/src/components/app-shell.tsx`
**Purpose:** make the app frame feel editorial and less heavy.

**Change goals:**
- reduce visual dominance of the sidebar and main content frame
- simplify gradients and glassiness where they feel too ornate
- tighten nav hierarchy around typography and spacing instead of shadows
- soften active nav states
- improve overall vertical rhythm in the shell
- make the main content area feel like an open canvas, not a boxed panel

**Specific redesign targets:**
- brand panel becomes cleaner and more typographic
- user profile module becomes quieter
- nav links gain more elegant spacing and calmer active treatment
- main panel border/shadow treatment becomes subtler

**Expected output:**
- shell no longer feels like a warm-glass dashboard
- content pages become the visual focus

---

## 3.3 Primary action primitive

### `packages/client/src/components/ui/button.tsx`
**Purpose:** align the primary interaction language with Airy Editorial.

**Change goals:**
- move button styling toward token-driven classes
- make primary buttons flatter, cleaner, and less gradient-heavy
- make secondary buttons lighter and more typographic
- keep tactile press and hover motion but reduce visual loudness
- ensure focus states remain highly visible in the lighter UI

**Specific redesign targets:**
- reduce “shiny CTA” feel
- preserve strong contrast and clarity
- keep subtle lift/compression behavior

**Expected output:**
- buttons feel premium, calm, and consistent across login/dashboard/forms

---

## 3.4 Toast primitive

### `packages/client/src/components/ui/toast-provider.tsx`
**Purpose:** make feedback feel editorial and refined.

**Change goals:**
- align toast spacing, radius, border, and text hierarchy with the new token system
- make info/success/error variants quieter and more elegant
- improve action button styling to feel lighter and more integrated
- refine placement and width so toasts feel like soft overlays, not alerts
- if useful, add a subtle enter/exit animation class strategy for future motion polish

**Expected output:**
- success/error/info feedback feels polished and calm
- toast system visually matches the new shell and buttons

---

## 3.5 Login page

### `packages/client/src/pages/login-page.tsx`
**Purpose:** create the first fully visible expression of the redesign.

**Change goals:**
- strengthen editorial hierarchy in the hero section
- shift from “panel-heavy landing” to “airy welcome composition”
- reduce decorative card noise in the supporting benefits area
- make the sign-in card more minimal and elegant
- improve headline, support copy width, and vertical spacing

**Specific redesign targets:**
- more confident hero headline treatment
- simpler benefit presentation
- cleaner sign-in block with stronger type rhythm
- preserve fast comprehension of the Google-only auth flow

**Expected output:**
- the login page becomes the clearest statement of the new brand direction

---

## 3.6 Dashboard

### `packages/client/src/pages/dashboard-page.tsx`
**Purpose:** make the main app experience feel composed rather than widget-based.

**Change goals:**
- rebalance visual weight between hero, utility stats, and admin checklist
- improve section hierarchy using typography and spacing
- make metric cards quieter and more consistent
- keep admin quick actions visible but less visually loud
- make the “book of the moment” and “next meeting” areas feel curated

**Specific redesign targets:**
- cleaner page header and hero
- more editorial spacing between sections
- less card repetition feeling
- checklist should read as guidance, not as another dashboard widget wall

**Expected output:**
- dashboard becomes calmer, more premium, and easier to scan

---

## 3.7 Optional support primitives if needed during implementation

If the first pass reveals too much repeated layout code, add these small shared pieces during Phase 1:

### `packages/client/src/components/ui/page-header.tsx`
Use for consistent page eyebrow/title/support-copy structure.

### `packages/client/src/components/ui/surface.tsx`
Use for quiet, token-aligned surface variants such as:
- `surface-base`
- `surface-raised`
- `surface-tint`

Only introduce these if duplication becomes a problem during the first implementation pass.

---

## 4. Implementation Sequence

## Step 1 — Tokenize the global foundation
**Files:**
- `packages/client/src/index.css`

**Tasks:**
- add CSS custom properties for colors, typography, spacing, radius, and shadows
- map current warm palette to the new Airy Editorial values
- establish `font-family` variables for UI and editorial roles
- simplify body background and global canvas treatment

**Checkpoint:**
- app loads with the new base palette and typography defaults
- no individual page changes required yet for the baseline to improve

---

## Step 2 — Refine shared interaction primitives
**Files:**
- `packages/client/src/components/ui/button.tsx`
- `packages/client/src/components/ui/toast-provider.tsx`

**Tasks:**
- convert button styles to use new token language
- quiet the gradients/shadows
- refine toast spacing, borders, and variants
- ensure focus and accessibility remain strong

**Checkpoint:**
- buttons and toasts visually match the new base theme
- login and dashboard inherit visible improvements immediately

---

## Step 3 — Lighten the global shell
**Files:**
- `packages/client/src/components/app-shell.tsx`

**Tasks:**
- reduce shell heaviness
- simplify sidebar and main-panel framing
- improve nav spacing and active states
- make brand block more typographic and less ornamental

**Checkpoint:**
- navigating the authenticated app feels calmer even before page-specific redesigns

---

## Step 4 — Polish the login page as the flagship first impression
**Files:**
- `packages/client/src/pages/login-page.tsx`

**Tasks:**
- improve hero hierarchy
- rebalance the two-column layout
- simplify benefit blocks
- refine sign-in panel spacing and copy rhythm

**Checkpoint:**
- login page clearly communicates the Airy Editorial direction on its own

---

## Step 5 — Recompose the dashboard
**Files:**
- `packages/client/src/pages/dashboard-page.tsx`

**Tasks:**
- reduce dashboard card-wall feeling
- strengthen feature-vs-utility hierarchy
- improve spacing and title rhythm
- quiet repeated card treatments

**Checkpoint:**
- dashboard feels editorial and easier to scan than the current version

---

## 5. Phase 1 Design Rules While Implementing

### 5.1 Typography rules
- use serif only for selective hero/title moments
- keep all utility UI in sans-serif
- prefer fewer sizes with more disciplined spacing
- constrain support-copy width where possible

### 5.2 Spacing rules
- increase section spacing before adding more visual framing
- use consistent page gutters across login, shell, and dashboard
- reduce nested padding patterns
- let modules breathe instead of stacking tightly

### 5.3 Surface rules
- one soft border is usually enough
- remove unnecessary gradients if they feel decorative
- use shadow only to separate layers subtly
- avoid visual competition between adjacent cards

### 5.4 Motion rules
- preserve subtle button press/lift
- keep toasts soft and quick
- avoid introducing route-motion complexity in Phase 1 unless nearly free
- prioritize polish that supports readability and confidence

---

## 6. Validation Plan

After each step or grouped step, run:

```bash
npm run lint
npm run build
```

After Step 5, run:

```bash
npm run e2e
```

Also perform a quick manual browser pass on:
- login page
- dashboard
- sidebar/nav behavior
- toast appearance after a create/save action

---

## 7. Suggested Commit Strategy

### Commit 1
**Message:** `Add Airy Editorial theme tokens and refine shared UI primitives`

Includes:
- `index.css`
- `button.tsx`
- `toast-provider.tsx`

### Commit 2
**Message:** `Lighten app shell and redesign login experience`

Includes:
- `app-shell.tsx`
- `login-page.tsx`

### Commit 3
**Message:** `Recompose dashboard for Airy Editorial layout`

Includes:
- `dashboard-page.tsx`

This keeps the redesign incremental and easy to review.

---

## 8. Definition of Done for Phase 1

Phase 1 is done when:
- the app immediately reads as lighter and more editorial
- the shell no longer dominates the experience
- typography hierarchy is visibly improved on login and dashboard
- spacing feels more intentional and less card-dense
- buttons and toasts feel calmer and more premium
- lint/build/e2e still pass

---

## 9. Phase 1 File Checklist

- [ ] `packages/client/src/index.css`
- [ ] `packages/client/src/components/ui/button.tsx`
- [ ] `packages/client/src/components/ui/toast-provider.tsx`
- [ ] `packages/client/src/components/app-shell.tsx`
- [ ] `packages/client/src/pages/login-page.tsx`
- [ ] `packages/client/src/pages/dashboard-page.tsx`
- [ ] optional: `packages/client/src/components/ui/page-header.tsx`
- [ ] optional: `packages/client/src/components/ui/surface.tsx`

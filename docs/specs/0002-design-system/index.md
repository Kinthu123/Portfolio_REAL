# 0002. Design system: split stage, navy on white

**Date**: 2026-11-02
**Status**: Accepted

## Summary

The portfolio uses the Taste direction "The split stage": one half of the screen stays fixed and holds your character on a flat colour field, the other half scrolls with your work. Headlines are Young Serif, reading text is Source Serif 4, colours are navy on white with one tangerine accent, every shape has square corners, and the page moves snappily while only the character bounces. This spec fixes the tokens (colours, type, spacing, motion) for light and dark mode and the base pieces every later page reuses: buttons, links, form fields, the Design / Code switch, the theme toggle, and project cards.

## Requirements

**User stories**:
- As a hiring manager, I want a site that reads easily and feels distinct, so that I remember Tyson and trust his design judgement.
- As Tyson, I want one set of tokens and pieces, so that every later page looks consistent without redesigning it.
- As a visitor using a keyboard or a screen reader, I want every control to be reachable and named, so that I can use the site fully.

**Acceptance criteria**:
- **AC-1**: `design.md` at the repo root records the direction (The split stage, seed 389900205), the idea sentence, the live thing, the extras, type, palette, shape, motion, imagery rules, and every change made to the dealt sheet.
- **AC-2**: Tokens in `src/styles/global.css` cover colour for light and dark, both type families and the five type steps, spacing, radius, and motion. Components use tokens only (no raw colour values, font names, or durations inside components).
- **AC-3**: On a first visit the theme follows the visitor's system setting; the toggle switches it and the choice is remembered on later visits; the page never shows a flash of the wrong theme on load.
- **AC-4**: Every text and background pair in the tokens meets WCAG AA in both themes (4.5:1 for normal text, 3:1 for large text, focus indicators, and control boundaries). The checked pairs and their ratios are listed in `design.md`.
- **AC-5**: Buttons come in two variants (main, secondary), each with hover, pressed, keyboard focus, and disabled states, square corners, and full keyboard operation.
- **AC-6**: Links come in two forms (inline underlined, arrow link) with a hover state and a visible keyboard focus ring.
- **AC-7**: Form fields (single line and multi line) always show their label, tie hint and error text to the field with `aria-describedby`, set `aria-invalid` on error, show a focus ring, and show errors as one plain sentence.
- **AC-8**: The Design / Code switch is two real buttons with `aria-pressed`, exactly one pressed at all times, operable by keyboard, and it announces the change to the page through a custom `designcode:change` event.
- **AC-9**: The theme toggle has an accessible name that says what it will do ("Switch to dark theme" or "Switch to light theme") and a hit area of at least 44 by 44 pixels.
- **AC-10**: A project card is one link wrapping a real image (with alt text), the title, and a meta line (discipline and year), with square corners, no shadow, a hover state, and a keyboard focus ring.
- **AC-11**: Young Serif, Source Serif 4, and Noto Sans Myanmar are self hosted through Astro's Fonts API; the Myanmar face loads only the Myanmar subset and applies only to text marked `lang="my"`; the built site makes no font requests to Google.
- **AC-12**: With `prefers-reduced-motion: reduce`, every component transition keeps its colour change and drops its movement.
- **AC-13**: A page at `/kit/` shows every piece in every state in both themes, carries `noindex`, and is not linked from the site.

## Decision

**Chosen option**: Option 2: the dealt split stage, adapted to Tyson.

Adopt the Taste split stage direction with the type swapped to Young Serif and Source Serif 4, the fog photographs replaced by the character on a flat field plus Tyson's real project screens, and cards for listing other work.

**Implementation skills**: `design-taste-frontend` (`.claude/skills/design-taste-frontend/`) · `ui-ux-pro-max` (`.claude/skills/ui-ux-pro-max/`) · `astro` (`astrolicious/agent-skills`, `.agents/skills/astro/`) · `gsap-core` (`greensock/gsap-skills`, `.agents/skills/gsap-core/`)

## Rationale

Reasoning and options: see [rationale.md](rationale.md).

## Feature design

### Art direction (recorded in `design.md`)

- **Direction**: The split stage (Taste, seed 389900205, sector personal-portfolio, tone playful). Desktop is two columns; one is `position: sticky; top: 0; height: 100svh` (the stage), the other scrolls with a reading measure of at most 46ch. On a phone the stage becomes a 60svh band at the top that stays behind the first section, then releases.
- **Idea**: on this page, Tyson's own project designs become the stage: each starts as a wireframe and the character builds it into the finished screen as the visitor scrolls.
- **Live thing**: the Design / Code switch flips the current screen between its Figma design and the real coded version.
- **Extras**: the stage field takes each project's own colour as it arrives; the character greets visitors with မင်္ဂလာပါ (Mingalaba).
- **Variety rule** (from the direction's known failure): the reading half changes what it holds from section to section, and at least one section breaks the split and runs full width.
- **Imagery**: Tyson's real project screens and the character carry the page. The dealt fog photographs are not used. Taste's floor (at least four real pictures on a page) is met with real project screens.
- **House rules** (Taste, all apply): no eyebrows, no monospace outside code, no index numbers, no thin rules, no gradients, no shadows at rest, no glass, headlines at most two lines at every width, one `h1` per page, a heading on every section.

### Tokens

**Colour** (semantic names; `light` is the default, `dark` applies under `:root[data-theme="dark"]`):

| Token | Light | Dark | Use |
|---|---|---|---|
| `bg` | `#ffffff` | `#111a33` | page ground, reading column |
| `surface` | `#f4f4f2` | `#18233f` | a tone step for panels and fields |
| `ink` | `#1f2b4d` | `#eef0f6` | all running text, headings |
| `muted` | `#646b80` | `#a3abc2` | secondary notes only |
| `accent` | `#f7941d` | `#f7941d` | the main button and one other thing per screen |
| `accent-ink` | `#1f2b4d` | `#1f2b4d` | text on accent |
| `stage` | `#05070a` | `#070b16` | default stage field (before a project colour takes over) |
| `stage-ink` | `#ffffff` | `#eef0f6` | text on the stage |
| `field-close` | `#e3e1dc` | `#18233f` | the closing field near the footer |
| `error` | `#b42318` | `#ff8a7a` | error rings and messages |
| `focus` | `#1f2b4d` | `#f7941d` | keyboard focus ring (3px, offset 3px) |
| `ring` | `#1f2b4d` | `#f7941d` | the 2px inner ring on a focused field |

**Type**:
- Display: Young Serif 400, tracking `-0.02em`, leading `0.95`, sentence case (the hero name may be lowercase).
- Text: Source Serif 4 400 (body), 600 (emphasis), italic 400 (titles and quotations), leading `1.55`.
- Myanmar: Noto Sans Myanmar 400, applied through `:lang(my)` only.
- Five steps, no sixth: `--step-small: clamp(0.8125rem, 0.79rem + 0.1vw, 0.875rem)` · `--step-body: clamp(1.125rem, 1.05rem + 0.3vw, 1.3125rem)` · `--step-lead: clamp(1.25rem, 1.1rem + 0.7vw, 1.625rem)` · `--step-head: clamp(2rem, 1.3rem + 3.2vw, 4rem)` · `--step-display: clamp(3.5rem, 9vw, 12.5rem)`.
- No text smaller than 13px; body text 16px or more.

**Spacing**: scale `4, 8, 12, 16, 24, 32, 48, 72, 120, 200` px; page margin `clamp(20px, 3vw, 32px)` on both sides; gap between sections `clamp(96px, 14vw, 200px)`; reading column padding 48 to 72px on desktop.

**Shape**: radius `0` everywhere. No borders on surfaces; surfaces separate by a tone step.

**Motion**:
- Ease `cubic-bezier(0.16, 1, 0.3, 1)` for the page.
- Durations: feedback `160ms`, entrances `520ms`, stagger `70ms`, rise `24px`.
- Character only: springy (GSAP `back.out(1.7)` or `elastic.out(1, 0.5)`), never used on page content.
- Transform and opacity only. Under reduced motion, movement drops and colour changes stay.

**Tailwind mapping**: tokens live in `@theme` in `src/styles/global.css` as `--color-*`, `--font-*`, `--text-*`, `--spacing-*`, `--ease-*`; the dark values override the same `--color-*` variables under `:root[data-theme="dark"]`; `@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *))` per spec 0001.

### Components (`src/components/ui/`)

| Component | Props | States | Notes |
|---|---|---|---|
| `Button.astro` | `variant: 'primary' \| 'secondary'`, `href?`, `type?`, `disabled?` | hover (rise 2px), pressed, focus, disabled | renders `<a>` when `href` is set, else `<button>`; primary is tangerine, secondary is solid ink |
| `Link.astro` | `href`, `arrow?: boolean` | hover, focus | inline: underline 1.5px, offset 4px, underline turns tangerine on hover; arrow: bold, arrow nudges 4px on hover |
| `Field.astro` | `label`, `name`, `multiline?`, `hint?`, `error?`, input attributes | rest, focus, error | filled with `surface`; label above; hint and error linked by `aria-describedby`; `aria-invalid="true"` when `error` is set |
| `DesignCodeSwitch.astro` | `value: 'design' \| 'code'` (initial) | pressed, focus | two `<button aria-pressed>`; dispatches `designcode:change` with `{ value }` on the element |
| `ThemeToggle.astro` | none | focus | sun/moon icon, 44px square, label reflects the next action |
| `ProjectCard.astro` | `href`, `title`, `meta`, `image` (Astro image import), `alt` | hover (thumb ground turns `ink`), focus | one link around the whole card; `astro:assets` `<Image>` |

### Theme mechanism

- Inline script in the `<head>` of `BaseLayout.astro`, before any CSS paints: read `localStorage.theme` (`'light'` or `'dark'`, wrapped in try/catch), else `matchMedia('(prefers-color-scheme: dark)')`, then set `data-theme` on `<html>`. The same script sets `class="js"` on `<html>` (spec 0001).
- `ThemeToggle` flips `data-theme`, writes `localStorage.theme`, and updates its label.
- Reapply on `astro:after-swap` once ClientRouter arrives (site shell, scope #5).

### Value sourcing

| Action | Value produced / displayed | Source |
|---|---|---|
| Theme on load | `light` or `dark` | `localStorage.theme`, else the system `prefers-color-scheme` |
| ThemeToggle label | "Switch to dark theme" / "Switch to light theme" | derived from the current `data-theme` |
| ProjectCard | title, meta, image, alt, href | props now; case study content fields from the content model spec (scope #3) |
| Stage colour per project | a colour value | case study `accent` field, defined in the content model spec (scope #3); must keep AA against `stage-ink` |
| Field error text | one sentence | `error` prop, written by the form that uses it (contact form spec, scope #10) |
| Greeting | မင်္ဂလာပါ | literal text in the home page hero (scope #6), marked `lang="my"` |
| Contrast ratios in `design.md` | numbers | computed from the token table with the WCAG formula at build time of the doc |

### Key invariants

- One accent use per screen at most besides the main button.
- One radius (0) and one button shape on the whole site.
- At most two text families plus the Myanmar face, which only renders Myanmar script.
- No component contains a raw colour, font name, or duration.
- Every project `accent` colour keeps at least 4.5:1 with `stage-ink` (enforced by the content model schema, scope #3).

### Security model

Public static site; these pieces hold no data. The theme value in `localStorage` is a convenience only and the page renders correctly without it.

### Configuration required

None. Fonts are fetched at build time by Astro's Fonts API and served from the site.

### Critical test scenarios

- Happy path: open `/kit/` in light, toggle to dark, reload, still dark, every piece visible in both, verifies **AC-3**, **AC-13**.
- Keyboard: Tab through `/kit/`, every control shows a focus ring and Enter/Space operate buttons, the switch, and the toggle, verifies **AC-5**, **AC-8**, **AC-9**.
- Error state: a field with `error` set exposes `aria-invalid` and reads the message through `aria-describedby`, verifies **AC-7**.
- Reduced motion: with the OS setting on, hovering a button changes colour without movement, verifies **AC-12**.
- Contrast: every pair in the token table measures at or above its threshold in both themes, verifies **AC-4**.

## Build plan

1. Configure Astro's Fonts API for Young Serif, Source Serif 4, and Noto Sans Myanmar (Myanmar subset), and confirm the build makes no Google requests at runtime, satisfies **AC-11**
2. Write the tokens in `src/styles/global.css`: `@theme` colours, families, five steps, spacing, radius, motion, the dark overrides, the `dark` custom variant, and the reduced motion base rule, satisfies **AC-2**, **AC-4**, **AC-12**
3. Add the theme head script to `BaseLayout.astro` and build `ThemeToggle.astro`, satisfies **AC-3**, **AC-9**
4. Build `Button.astro` and `Link.astro`, satisfies **AC-5**, **AC-6**
5. Build `Field.astro`, satisfies **AC-7**
6. Build `DesignCodeSwitch.astro`, satisfies **AC-8**
7. Build `ProjectCard.astro`, satisfies **AC-10**
8. Build `/kit/` showing every piece and state in both themes, `noindex`, satisfies **AC-13**
9. Write `design.md` with the art direction, deviations from the sheet, and the contrast table, satisfies **AC-1**, **AC-4**
10. Run Taste `lint.mjs` on `src/` and `inspect.mjs` on the built `/kit/` at 1440, 768, and 390; fix every FAIL, satisfies **AC-4**, **AC-5**, **AC-6**, **AC-7**, **AC-10**

## Consequences

**Positive**:
- Every later page builds from one token set and six pieces, so the site stays consistent.
- The split stage gives the character a permanent home, the thing you liked most about sebg.ch, without copying its layout.
- AA contrast is designed in, not patched later.

**Negative / tradeoffs**:
- Three font families (one only for Myanmar) add download weight; subsets and self hosting keep it small but not free.
- The split stage risks monotony; every page section must vary what the reading half holds.
- Cards for other work are a pattern Taste counts as a template tell; they must stay square, shadowless, and use real screens to avoid looking stock.
- Project colours on the stage need a contrast check per project, which adds a rule to the content model.

**Neutral**:
- The `/kit/` page ships with the site but is hidden from search and navigation.
- The navigation bar and footer are designed with the site shell (scope #5) from these tokens, not here.

## Follow-up

- [ ] Content model spec (scope #3): add the case study `accent` field with a schema check of at least 4.5:1 against `stage-ink`.
- [ ] Site shell (scope #5): wire `ThemeToggle` into the header and reapply the theme on `astro:after-swap`.
- [ ] Home page (scope #6): the hero greeting, the stage with the character, and the design to code scroll scene.
- [ ] Root `AGENTS.md` (`/audit`, scope #2): note that components use tokens only and that `design.md` is the art direction record.

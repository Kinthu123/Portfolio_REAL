---
name: split-stage-design-system
source: skill:design-taste-frontend
direction: "The split stage (Taste, seed 389900205, sector personal-portfolio, tone playful)"
character: "Black on white with one strong blue for links and the main button, square corners, and warm serif type. One half of the screen holds Tyson's character on a flat colour field; the other half scrolls with his work. Reading stays calm and snappy; only the character bounces."
tokens: "Real values live in src/styles/global.css (@theme and the dark overrides). Read them there; this file never copies them."
contrast: "Every pair passes AA in both themes; body 18.88 light / 16.73 dark, links 6.72 / 6.08, main button label 6.72 / 6.13. Full table below."
spec: docs/specs/0002-design-system/index.md
---

# Design: the split stage

This is the art direction record for the portfolio. It says what the site should feel like and the rules every page follows. The token values (colours, sizes, spacing, motion) live in `src/styles/global.css`, and the live reference for every piece in every state is the hidden page at `/kit/`.

## Build mandate

You are a senior product designer. Every page ships as a complete, finished surface: real copy about Tyson's work, a considered layout with clear hierarchy, every state a piece can be in, and a footer where the page needs one. Never a lone block floating on an empty page. The site is the proof of Tyson's design skill, so a page that looks templated has failed, even if it works.

## Character and direction

- **The idea:** on this page, Tyson's own project designs become the stage. Each one starts as a wireframe, and the character builds it into the finished screen as the visitor scrolls. Design becomes code, which is the one thing few other portfolios can claim.
- **The live thing:** the Design / Code switch flips the current screen between its Figma design and the real coded version.
- **Extras:** the stage field takes each project's own colour as it arrives. The character greets visitors with မင်္ဂလာပါ (Mingalaba).
- **Mood:** playful but easy to read. The personality comes from the character and Young Serif's warmth. The palette stays out of the way: black, white, one blue. Everything else is quiet and square.

## Type

- **Display: Young Serif**, regular weight only. Headlines and the hero name. Tight tracking and tight leading (0.95). Sentence case; the hero name may be lowercase.
- **Text: Source Serif 4.** Regular for body, semibold for emphasis and labels, italic for titles and quotations. Leading 1.55.
- **Myanmar: Noto Sans Myanmar.** Only for text marked `lang="my"`. It downloads only when Myanmar characters are on the page.
- **Five sizes, no sixth:** small, body, lead, head, display. Nothing smaller than 13px; body text 18px or more.
- Headlines run at most two lines at every width. One `h1` per page, and every section has a heading.
- All three faces are served from the site through Astro's Fonts API. The built site makes no requests to Google.

## Palette

- **Palette: "Sheet and biro"** (Taste library), chosen by Tyson on 2026-11-03 after comparing seven palettes on the same layout.
- **Near black ink on white** for all reading. Dark mode flips it: a near black ground with light grey text.
- **Surface** is one tone step off the ground. Panels and fields separate from the page by this step, never by a border.
- **Blue** is the accent and the only tinted colour. It marks text links and fills the main button. Never decoration, never headings, never a background area. Dark mode uses a lighter blue with dark text on the button so both stay readable.
- **Stage** is near black by default, then takes each project's colour as it arrives. Every project colour must keep 4.5:1 with the stage text (the content model checks this, scope #3).
- **Closing field** is a pale grey band near the footer (the surface tone in dark mode).
- **Error** is a deep red in light mode and a soft coral in dark mode. Errors are always also said in words, never shown by colour alone.

## Shape

- **Square corners everywhere.** One radius (none) and one button shape on the whole site.
- **No shadows.** No borders on surfaces. Lines appear only where they carry meaning: the field's bottom edge, the button's hover ledge, focus and error rings, link underlines.
- No gradients, no glass, no eyebrows, no index numbers, no thin decorative rules, no monospace outside code.

## Motion

- One page ease (a fast start that settles softly). Feedback 160ms, entrances 520ms, stagger 70ms, entrances rise 24px.
- **Only the character is springy.** Page content never bounces.
- Transform and opacity only.
- **Reduced motion:** every movement distance drops to zero and colour changes stay. A hovered button shows its ledge but does not lift; a hovered card turns its ground black but the picture stays put.

## Imagery

- Tyson's real project screens and the character carry the page. A page shows at least four real pictures.
- No stock photographs, no fog landscapes, no device mockups invented for the page. Photos from Tyson's own case studies are fine (the project card uses the laptop photo from the POS + warehouse case study).
- Every picture has alt text that describes what is in it.

## Composition

- **Desktop:** two columns. The stage column is sticky, full screen height, and holds the character on its field. The reading column scrolls, with text at most 46 characters wide.
- **Phone:** the stage becomes a band across the top (60% of the screen height) that sits behind the first section and then lets go.
- **Avoid monotony:** the reading half changes what it holds from section to section, and at least one section breaks the split and runs the full width.
- Page margins match on both sides. Sections are separated by large, generous gaps rather than lines.

## Component rules

The six base pieces live in `src/components/ui/`. Components use tokens only: no raw colours, font names, or durations inside them.

- **Button:** main (blue) or secondary (solid black). Flat, square, 44px tall at least. On hover it lifts 2px and its bottom edge becomes a ledge (black under the main button, blue under the secondary); pressing pushes it back down. Disabled turns grey. Give it an `href` and it becomes a real link. Use one main button per screen.
- **Link:** inline links are blue and underlined; on hover they turn black. Arrow links are semibold in the text colour; the arrow nudges right and a blue underline appears.
- **Field:** label always above, never only a placeholder. Filled with the surface tone, with a 2px line along the bottom. Focus draws a 2px ring inside the field. Errors draw a red ring and one plain sentence under the field, tied to it for screen readers.
- **Design / Code switch:** two real buttons, exactly one pressed. A change tells the page through the `designcode:change` event.
- **Theme toggle:** 44px square, moon or sun. Its name says what it will do ("Switch to dark theme"). It needs JavaScript, so it is hidden without it.
- **Project card:** one link around a real picture, the title, and a discipline and year line. On hover the ground behind the picture turns black, the picture lifts, and the title underlines in blue. Cards stay square, shadowless, and always show real screens.

## Accessibility

- WCAG AA in both themes from the start, checked in the table below.
- Every control works by keyboard and shows a 3px focus ring with a 3px gap, in the text colour (black in light mode, light grey in dark mode). Fields use their own inner ring instead.
- Touch targets are at least 44 by 44 pixels.
- The theme follows the visitor's system setting on a first visit, remembers their choice after that, and never flashes the wrong theme on load.

## Contrast

Computed with the WCAG formula from the tokens in `src/styles/global.css` on 2026-11-03, after the palette change.

| Pair | Use | Light | Dark | Needs |
|---|---|---|---|---|
| `ink` on `bg` | Body text and headings | 18.88 | 16.73 | 4.5 |
| `ink` on `surface` | Text in fields and panels | 17.17 | 14.89 | 4.5 |
| `muted` on `bg` | Notes on the page | 5.33 | 7.16 | 4.5 |
| `muted` on `surface` | Hints and placeholders in fields | 4.85 | 6.38 | 4.5 |
| `muted` on `field-close` | Notes on the closing field | 4.59 | 6.38 | 4.5 |
| `ink` on `field-close` | Text on the closing field | 16.28 | 14.89 | 4.5 |
| `accent` on `bg` | Inline links | 6.72 | 6.08 | 4.5 |
| `accent` on `surface` | Links on panels | 6.11 | 5.41 | 4.5 |
| `accent-ink` on `accent` | Main button label | 6.72 | 6.13 | 4.5 |
| `bg` on `ink` | Secondary button and pressed switch label | 18.88 | 16.73 | 4.5 |
| `stage-ink` on `stage` | Text on the stage | 18.88 | 18.76 | 4.5 |
| `error` on `bg` | Error message | 6.57 | 8.18 | 4.5 |
| `error` on `surface` | Error ring on a field | 5.98 | 7.28 | 3 |
| `focus` on `bg` | Focus ring | 18.88 | 16.73 | 3 |
| `ring` on `surface` | Field focus ring | 17.17 | 14.89 | 3 |
| `muted` on `surface` | Field bottom line | 4.85 | 6.38 | 3 |
| `accent` on `bg` | Main button edge | 6.72 | 6.08 | 3 |

Every control edge passes 3:1, so no exemptions are needed.

## Changes to the dealt sheet and the spec

What changed from the Taste draw, and why.

| Dealt | Now | Why |
|---|---|---|
| Literata for headings and text | Young Serif for headings, Source Serif 4 for text | Literata read calm and essay like; Young Serif adds the warmth a playful character needs. Chosen from live previews. |
| "Fog and quiet" photographs in the fixed half | The character on a flat colour field, plus Tyson's real project screens | Fog has nothing to do with Tyson or his work; it fails Taste's own subject test. |
| "Navy on white" palette (navy ink, tangerine accent, warm grey closing field) | "Sheet and biro": near black ink, one blue for links and the main button, pale grey closing field | Tyson did not like the navy and tangerine once he saw it built, and chose Sheet and biro from seven palettes shown on the same layout (2026-11-03). Along the way the navy palette had needed a darker muted grey and a navy field ring to pass AA; the new palette passes as dealt, with a dark mode added. |
| No cards (house rule) | Project cards for listing other work | Tyson chose cards knowingly after seeing both. They keep the rule's spirit: square, shadowless, real screens. |
| One fixed stage colour | The stage takes each project's colour | Carries over the idea Tyson liked from sebg.ch. |
| No Myanmar face | Noto Sans Myanmar for `lang="my"` text only | For the မင်္ဂလာပါ greeting. |
| Fields filled, no borders | Filled, with a 2px bottom line | The fill alone is about 1.1:1 on white, so the field could not be found. The line makes the control visible. |

## Where to look

- Tokens: `src/styles/global.css`
- Pieces: `src/components/ui/`
- Every piece in every state, both themes: `/kit/` (hidden from search and navigation)
- Decision record: `docs/specs/0002-design-system/`

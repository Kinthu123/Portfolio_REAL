# Scope: Thu Rein Htet (Tyson) portfolio

A new portfolio for Tyson, a UI/UX designer who can also build in code, replacing the old site at thu-rein-htet-portfolio-g8ub.vercel.app. It serves hiring managers first, then freelance clients and curious visitors, and shows real design process on the site itself instead of sending people to Behance.

**Build approach:** Journey (finish one complete visitor path, every step and state, before starting the next).
**Workflow:** Prototype (nothing runs after `/develop`; you rely on its own build time self check and your own eye). The project default level of rigor. `/architect` is the recommended first stop for a feature with a real decision, but skippable when you already know the build. Any feature can carry its own tag (e.g. `· Alpha`) to do more or less.

_These are recommendations to keep your build orderly, not requirements. Skip anything that does not fit: if you already know how to build a feature, use `/develop` and skip `/architect`. You decide when a feature is `done`._

## At a glance

| # | Feature | Phase | Status |
|---|---------|-------|--------|
| 1 | Stack & architecture | Foundation | done |
| 2 | Coding standards & tooling | Foundation | planned |
| 3 | Content model | Foundation | planned |
| 4 | Design system & UI foundation | Foundation | planned |
| 5 | Site shell | Skeleton | planned |
| 6 | Home page | Journey 1 | planned |
| 7 | POS + warehouse case study | Journey 1 | planned |
| 8 | About page + resume | Journey 1 | planned |
| 9 | Certificates | Journey 1 | planned |
| 10 | Contact form | Journey 1 | planned |
| 11 | SEO & share previews | Journey 1 | planned |
| 12 | Visitor analytics | Journey 1 | planned |
| 13 | Work with me page | Journey 2 | planned |
| 14 | Playground | Journey 3 | planned |
| 15 | Alote case study | Journey 3 | planned |
| 16 | SouthernRoot Jeans case study | Journey 3 | planned |
| 17 | PowerHive Fitness case study | Journey 3 | planned |

## Foundations

### 1. Stack & architecture
Decide the stack for a fast, content driven site (pages built from content files, a working contact form, analytics, light and dark themes, hosting), then scaffold a runnable project.
**Done when:** the stack is recorded in a spec and the empty scaffold runs locally and passes a build.
spec [0001](../specs/0001-portfolio-stack/index.md) · code in `astro.config.mjs`, `wrangler.jsonc`, `src/`
- [x] Decide the stack (spec): `/architect stack & architecture`
- [x] Scaffold from the decision: `/develop stack & architecture`

### 2. Coding standards & tooling
Capture conventions from the real scaffolded project, then install lint, format, and type checks so every later page follows them.
**Done when:** root `AGENTS.md` reflects the real stack, and lint, format, and type checks run clean.
- [ ] Capture conventions + tooling choices: `/audit`

### 3. Content model · needs a decision
The shape of every content file: case study, playground piece, certificate, service, and the site profile (bio, links, resume). One text file per item, so adding work later means adding a file.
**Done when:** each content type has defined fields, a sample file of each renders without errors, and a missing required field fails the build instead of showing a broken page.
- [ ] Design it (spec): `/architect content model`

### 4. Design system & UI foundation · needs a decision
The visual language, set from your references with the Taste skill, plus base components. Light and dark themes, built to WCAG AA from the start.
**Done when:** `design.md` records the chosen direction, tokens cover type, color (light and dark), spacing, and motion, and base components (buttons, links, cards, form fields) pass AA contrast and work by keyboard.
- [ ] Design it (spec): `/architect design system & UI foundation`

## Skeleton

### 5. Site shell
Header with navigation, footer with social links, theme toggle, a 404 page, and a first deploy, so every page has a home and the stack is proven live.
**Done when:** the shell renders on phone, tablet, and desktop, the theme toggle remembers the choice, navigation works by keyboard, and a preview deploy is live.
- [ ] Build it: `/develop site shell`

## Journey 1: Hiring manager path
A hiring manager lands, sees who you are, reads a case study in depth, checks your background, grabs your resume, and gets in touch. Every step and state finished before Journey 2 starts.

### 6. Home page · needs a decision
Hero with your positioning (UI/UX first, code as your edge), selected work, a short about teaser, and a clear next step.
**Done when:** a visitor understands your role and focus within a few seconds, every project card opens its case study (on site, or Behance until migrated), and the page reads well at every width.
- [ ] Design it (spec): `/architect home page`

### 7. POS + warehouse case study · needs a decision
Your first full case study on the site, rebuilt from the Behance post: problem, research, process, solution, results. It sets the template every later case study reuses.
**Done when:** the page tells the full story with images that load fast, it links to the next case study and to contact, and the template renders any case study content file.
- [ ] Design it (spec): `/architect POS + warehouse case study`

### 8. About page + resume · needs a decision
Your story, how you work, tools, education at Rangsit University, a photo, and a resume PDF.
**Done when:** the about page is complete and the resume downloads from the navigation and the about page.
- [ ] Design it (spec): `/architect about page + resume`

### 9. Certificates
A certificates section on the about page with real titles, issuers, and dates, instead of "Certificate 1–3".
**Done when:** every certificate shows its title, issuer, and date, with an image that has a text alternative.
- [ ] Build it: `/develop certificates`

### 10. Contact form · needs a decision · Alpha
A short form (name, email, what you need, optional budget for freelance work) with your email as a backup. It handles visitor data and spam, so it gets a real browser check.
**Done when:** a sent message reaches you, the visitor sees a clear confirmation, invalid fields show helpful errors, spam is filtered, and the email link works if the form ever fails.
- [ ] Design it (spec): `/architect contact form`

### 11. SEO & share previews · needs a decision
Search friendly pages and good looking preview cards when your links are shared on LinkedIn or in chat apps.
**Done when:** every page has its own title, description, and share image, a sitemap exists, and a shared case study link shows its own preview card.
- [ ] Design it (spec): `/architect SEO & share previews`

### 12. Visitor analytics · needs a decision
See which case studies get read and where visitors come from, set up so no cookie banner is needed.
**Done when:** page views, resume downloads, and sent messages are counted, and no cookie banner is required.
- [ ] Design it (spec): `/architect visitor analytics`

## Journey 2: Freelance client path
A small business owner lands, sees what you offer and how a project runs, and sends a project brief.

### 13. Work with me page · needs a decision
What you offer (UI/UX design, design plus build), how a project runs, and a path into the contact form ready for freelance details.
**Done when:** a client can see your services and process and reach the contact form with the freelance fields already chosen.
- [ ] Design it (spec): `/architect work with me page`

## Journey 3: Explorer path
A curious visitor browses more of your work: small explorations and the rest of your case studies.

### 14. Playground · needs a decision
A gallery of small UI explorations and concept shots, one content file each.
**Done when:** pieces show as a gallery that reads well at every width, each opens larger with a short note, and adding a piece means adding one file.
- [ ] Design it (spec): `/architect playground`

### 15. Alote case study
The Alote mobile job app, moved from Behance onto the case study template.
**Done when:** the full story is on the site and the home page card links here instead of Behance.
- [ ] Build it: `/develop Alote case study`

### 16. SouthernRoot Jeans case study
SouthernRoot Jeans, moved from Behance onto the case study template.
**Done when:** the full story is on the site and the home page card links here instead of Behance.
- [ ] Build it: `/develop SouthernRoot Jeans case study`

### 17. PowerHive Fitness case study
The PowerHive fitness app, moved from Behance onto the case study template.
**Done when:** the full story is on the site and the home page card links here instead of Behance.
- [ ] Build it: `/develop PowerHive Fitness case study`

## Deferred
Out of scope for the current build pass, kept so the plan stays honest.
- **Built with code strip**: Apple and Cocktail builds as proof you can code (not chosen for now)
- **More languages**: Burmese or Thai versions · needs a decision
- **Admin panel (CMS)**: edit content without touching files · needs a decision
- **Writing**: short articles about your process · needs a decision
- **Booking link**: clients book an intro call on your calendar
- **Content Security Policy**: a full CSP once Turnstile, Umami, and the character runtime are final (from spec 0001)
- **Your own Rive character**: replace the SVG placeholder through the mascot slot (from spec 0001)

## Legend

**The decision box.** Every feature carries exactly one, the sub-task whose label ends with `(spec)`. Its wording varies (`Design it (spec)` normally, `Decide the stack (spec)` on Stack & architecture), so skills locate it by that `(spec)` suffix, never by an exact label. Every other box is an execution box and `/architect` never ticks one.

**Feature lifecycle**: the scope updates as a feature moves; each row is what it shows and who sets it:

| State | Set by | The feature shows |
|---|---|---|
| `planned` · needs a decision | `/scope` | one box: `Design it (spec): /architect <feature>` |
| `in-progress` (designed) | **`/architect` at spec capture** | `Design it` ticked; spec linked; `Build it: /develop <feature>` + **2 to 5 milestones**; the tier's closing boxes (`Verify it` Alpha+, `Test it` Beta+, `Review it` + `Document it` GA); any surfaced follow-up enrolled |
| `in-progress` (building) | `/develop` | milestone sub-boxes tick one by one; code pointer filled |
| `in-progress` (verified) | `/check verify` | `Build it` + milestones ticked; `Verify it` ticked |
| `done` | **you, when you decide it is** (any skill sets it when you say so); `/sync` reconciles | boxes you ran ticked, skipped ones marked skipped; the tier's last stage (`Prototype` → after `/develop`; `Alpha` → after `/check verify`; `Beta`/`GA` → after `/test`) is the suggested point to call it done; `/sync` captures conventions |

- **Next step** = the first unticked box (always a command or a tracked milestone).
- **needs a decision** = run `/architect` first; otherwise straight to `/develop` (or `/audit` for standards & tooling). The tag drops once the spec is captured.
- **Atomic build tasks live in the spec's `## Build plan`, not here**: the scope carries only the milestone rollup.
- **Status** `planned` → `in-progress` → `done`, plus `existing` (pre-workflow) and `dropped` (de-scoped, kept for history).
- **Approach tag** beside a heading (e.g. `· Facade`) overrides the project default for that feature; no tag = inherits it.
- **Workflow tier tag** beside a heading (e.g. `· GA`, `· Prototype`) sets that one feature's rigor above or below the project default; no tag inherits the default. It decides the feature's check boxes and each skill's next suggestion.
- **Workflow** (header line) is the project default, what runs after `/develop`: **Prototype** = nothing (trust develop's own build time self check); **Alpha** = `/check verify`; **Beta** = `/check verify` then `/test`; **GA** = adds a fresh model `/check review` then `/document`. A feature built on an unratified decision (an `Assumed` spec) stays flagged, but that never blocks `done`.
- **Pointer line** (`spec <n> · code in <path>`): the spec link added by `/architect`, the code path by `/develop`.

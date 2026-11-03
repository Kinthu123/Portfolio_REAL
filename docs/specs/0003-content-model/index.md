# 0003. Content model: five Markdown collections with build time checks

**Date**: 2026-11-03
**Status**: Accepted

## Summary

Every piece of content on the site lives in its own text file under `src/content/`: case studies, playground pieces, certificates, services, and one profile file about you. Each type has a fixed list of fields, checked when the site builds, so a missing field, an image without alt text, a stage colour that is hard to read, or a link to a file that does not exist stops the deploy with a clear message instead of shipping a broken page. Projects still on Behance are ordinary case study files marked `where: behance`, so moving one onto the site later means writing its story into the same file. The checks that compare files with each other (duplicate orders, a story missing, the resume file) run as soon as the content loads, on every build, whatever pages exist. Pages never read the files directly; they go through one shared module, `src/lib/content.ts`, which hides drafts on the live site, sorts everything, works out the next case study link, and checks links between types.

## Requirements

**User stories**:
- As Tyson, I want to add a case study, playground piece, certificate, or service by adding one file, so that growing the site never means editing page code.
- As Tyson, I want the build to stop and tell me exactly which file and field is wrong, so that a typo never reaches the live site.
- As Tyson, I want to keep unfinished work in the repo as a draft, so that I can preview it on my Mac without publishing it.
- As a hiring manager, I want every project card to open its story (on the site, or on Behance until it moves), so that I never hit a dead link.

**Acceptance criteria**:
- **AC-1**: `src/content.config.ts` defines five collections, `caseStudies`, `playground`, `certificates`, `services`, and `profile`, with exactly the fields, types, and required or optional rules in the data model below.
- **AC-2**: One published sample of each type exists (for case studies: one `where: site`, the POS case study, and one `where: behance`), and a `/kit/content/` page (noindex, not linked) renders every published entry of every type without errors.
- **AC-3**: A missing required field or a wrong type in any file makes `pnpm build` fail, and the message names the file and the field.
- **AC-4**: Every image field has a matching alt text field; a missing or empty alt text fails the build.
- **AC-5**: A case study `stageColor` must be a six digit hex colour with a contrast ratio of at least 4.5:1 against both `#ffffff` and `#f2f2f2` (the light and dark `stage-ink`); otherwise the build fails and the message shows the ratio it got.
- **AC-6**: A case study `summary`, a service `summary`, or the profile `intro` longer than 160 characters fails the build.
- **AC-7**: A case study with `where: behance` must have a `behanceUrl`; a case study with `where: site` must have a story (text below the fields that is not empty). Either rule broken fails the build.
- **AC-8**: Two case studies with the same `order`, or two services with the same `order`, fail the build, and the message names both files.
- **AC-9**: A playground `caseStudy` or a service `examples` entry that names a case study file that does not exist fails the build. One that names a case study marked `draft: true` builds, and on the live site the link is left out.
- **AC-10**: An item with `draft: true` is missing from the live build (no page, not in any list, skipped by the next link) and is shown when running `pnpm dev`, where it counts like a published item.
- **AC-11**: The build fails unless `src/content/profile/profile.md` exists, at least one published `where: site` case study exists, and `public/resume.pdf` exists.
- **AC-12**: Lists come back sorted: case studies and services by `order` (lowest first), playground pieces and certificates by `date` (newest first). Equal dates break ties by entry id (A to Z), so the order never changes between builds.
- **AC-13**: Each published `where: site` case study's next link is the following published `where: site` case study by `order`, and the last one links back to the first. With only one such case study, there is no next link.
- **AC-14**: A case study card links to `/work/<folder name>/` when `where: site`, and to its `behanceUrl` when `where: behance`. Its meta line reads `<role> · <year>`.
- **AC-15**: Adding a new item of any type (a file plus its images) needs no code change to appear in its list.

## Decision

**Chosen option**: Option 1: Astro content collections with strict schemas, plus one shared content module for the checks across files.

Store all content as Markdown and MDX files in five Astro content collections, validate each file with a Zod schema (a description of allowed fields that Astro checks at build time), run the rules that compare files within a collection in a thin wrapper around each collection's loader (so they run in Node on every build), and route every page's reads through `src/lib/content.ts`, which applies drafts, sorting, and links between collections.

**Implementation skills**: `astro` (`astrolicious/agent-skills`, `.agents/skills/astro/`)

## Rationale

Reasoning and options: see [rationale.md](rationale.md).

## Feature design

### Files and folders

| Collection | Files | Loader | Entry id |
|---|---|---|---|
| `caseStudies` | `src/content/case-studies/<id>/index.mdx`, with that case study's images in the same folder | `glob({ pattern: '*/index.mdx', base: './src/content/case-studies' })` with `generateId` returning the folder name | folder name, e.g. `pos-warehouse` |
| `playground` | `src/content/playground/<id>.md`, image beside it | `glob({ pattern: '*.md', base: './src/content/playground' })` | file name |
| `certificates` | `src/content/certificates/<id>.md`, image beside it | `glob({ pattern: '*.md', base: './src/content/certificates' })` | file name |
| `services` | `src/content/services/<id>.md` | `glob({ pattern: '*.md', base: './src/content/services' })` | file name |
| `profile` | `src/content/profile/profile.md`, photo beside it | `glob({ pattern: 'profile.md', base: './src/content/profile' })` | `profile` |

Images are written as relative paths (`cover: ./cover.jpg`) and validated with the schema's `image()` helper, so they arrive as `ImageMetadata` ready for `astro:assets` and the existing `ProjectCard`. A missing image file fails the build as an asset error, not a schema error. The text below the fields in each file is the entry's body: the story, note, description, or bio. `z` comes from `astro/zod`. "Not empty" always means `value.trim().length > 0`; character limits count JavaScript string length.

### Where the checks run

The build runs pages inside Cloudflare's runtime (workerd, the adapter's default `prerenderEnvironment`), which cannot read the repo's files. So the checks run in three places:

| Where | Runs | Checks |
|---|---|---|
| Zod schemas in `src/content.config.ts` | per file, when it changes | AC-3, AC-4, AC-5, AC-6, the `behanceUrl` half of AC-7 |
| `withChecks(loader, check)` in `src/lib/content-checks.ts`, wrapping each collection's `glob()` loader: `load: async (ctx) => { await inner.load(ctx); check([...ctx.store.values()]) }` | in Node, on every build and dev sync, before any page | story required for `where: site` (AC-7), duplicate `order` in case studies and services, drafts included (AC-8), profile exists, at least one published `where: site` case study, `public/resume.pdf` exists (AC-11), and `STAGE_INK` values found in `src/styles/global.css` |
| `checkReferences()` in `src/lib/content.ts`, awaited by every getter | when a page reads content | playground `caseStudy` and service `examples` name existing case studies (AC-9); collections load in parallel, so this cannot run in a loader |

A loader check that fails throws one error listing every problem with its file path, which stops the build. `checkReferences()` keeps its result in a module level promise only when `import.meta.env.PROD` is true; in dev it runs again on each call, so a fixed file shows up without a restart.

### Data model sketch

`*` = required. Every type except profile also has `draft: boolean` (optional, default `false`). A draft must still pass every rule (placeholder values are fine), and its `order` still counts for clashes.

**caseStudies** (one site page each at `/work/<id>/`; the page itself is built in scope #7)

| Field | Type | Rule |
|---|---|---|
| `title`* | string | not empty |
| `summary`* | string | 1 to 160 characters; used for cards, search results, share cards |
| `order`* | integer | 1 or more; unique across all case study files |
| `where`* | `'site'` or `'behance'` | decides which other fields are required |
| `behanceUrl` | URL | required when `where: behance`; optional ("also on Behance") when `site` |
| `role`* | string | e.g. "UI/UX designer" |
| `year`* | integer | 2020 to 2100 |
| `platform`* | string | e.g. "Web and tablet" |
| `duration`* | string | e.g. "10 weeks" |
| `team`* | string | e.g. "Solo", "With two classmates" |
| `context`* | string | e.g. "Class project, Rangsit University", "Client" |
| `tools`* | string list | at least 1 |
| `cover`* | image | card and hero picture |
| `coverAlt`* | string | not empty |
| `stageColor`* | string | `#rrggbb`, any letter case, stored lower case; at least 4.5:1 against `#ffffff` and `#f2f2f2`, compared unrounded; checked with `superRefine` so the message names the field and shows the ratio rounded to two places, e.g. "3.12:1 against #f2f2f2, needs 4.5"; skipped when the format check already failed |
| `results` | list of `{ value, label }` | optional; at most 4; `value` 1 to 12 characters (e.g. "38%"), `label` 1 to 60 |
| `screens` | list of `{ title, design, designAlt, code, codeAlt }` | optional; `design` and `code` are images (Figma export, coded build screenshot), both alts not empty; feeds the Design / Code switch |
| body | MDX | required (not empty) when `where: site`; ignored when `behance` |

The schema is a discriminated union on `where` (two shapes sharing the common fields), so TypeScript knows `behanceUrl` is a string whenever `where` is `'behance'`.

**playground**

| Field | Type | Rule |
|---|---|---|
| `title`* | string | not empty |
| `date`* | date | `YYYY-MM-DD`, read with `z.coerce.date()` and always formatted in UTC so the day never shifts |
| `image`* | image | |
| `alt`* | string | not empty |
| `caseStudy` | `reference('caseStudies')` | optional; must name an existing case study |
| body | Markdown | required (not empty); the short note shown when the piece opens larger |

**certificates**

| Field | Type | Rule |
|---|---|---|
| `title`* | string | not empty |
| `issuer`* | string | not empty |
| `date`* | string | `YYYY-MM` (year and month) |
| `image`* | image | |
| `alt`* | string | not empty |
| `honour` | string | optional, 1 to 30 characters, e.g. "Merit", "Distinction" |

**services**

| Field | Type | Rule |
|---|---|---|
| `title`* | string | not empty |
| `summary`* | string | 1 to 160 characters |
| `order`* | integer | 1 or more; unique across all service files |
| `includes`* | string list | at least 1 |
| `steps`* | list of `{ title, text }` | at least 2; `title` 1 to 60 characters, `text` 1 to 280 |
| `examples` | list of `reference('caseStudies')` | optional; at most 3; each must name an existing case study |
| body | Markdown | optional longer description |

**profile** (exactly one file)

| Field | Type | Rule |
|---|---|---|
| `name`* | string | "Thu Rein Htet" |
| `role`* | string | e.g. "UI/UX Designer and Frontend Developer" |
| `intro`* | string | 1 to 160 characters; home teaser and default share text |
| `availability`* | string | one line, e.g. "Open to UI/UX internships and freelance work from June 2027" |
| `location`* | string | e.g. "Bangkok, Thailand" |
| `email`* | email | |
| `links`* | `{ linkedin, behance, github }` | each a URL |
| `photo`* | image | |
| `photoAlt`* | string | not empty |
| `experience`* | list of `{ role, place, location, start, end?, summary? }` | may be empty; `start`, `end` are `YYYY-MM`; no `end` means "now"; shown in the order written |
| `education`* | list of `{ school, degree, start, end?, note? }` | may be empty; `note` e.g. "Expected 2027"; shown in the order written |
| `awards`* | list of `{ title, issuer, year }` | may be empty |
| `tools`* | string list | may be empty |
| body | Markdown | required (not empty); the full story for the About page |

The resume is not a field: it is always `public/resume.pdf`, served at `/resume.pdf` (exported as `RESUME_PATH` from `src/lib/content.ts`).

**Relationships**

| From | To | Cardinality | How |
|---|---|---|---|
| playground piece | case study | many to one, optional | `caseStudy` reference |
| service | case study | many to many, optional | `examples` references |
| case study | next case study | one to one, derived | not stored; worked out from `order` |
| profile | (none) | exactly one | |
| certificate | (none) | | |

### State transitions

Each item: `draft` (`draft: true`, visible in `pnpm dev` only) → `published` (`draft` missing or `false`). A case study also moves `where: behance` → `where: site` when its story is moved onto the site; nothing else changes, so the home card switches from Behance to the site page by itself.

### API surface

No HTTP endpoints. The surface is the module `src/lib/content.ts`; pages and components read content only through it, never with `getCollection` directly.

**Visible set**: on the live build (`import.meta.env.PROD`), the items without `draft: true`; in `pnpm dev`, every item. Every getter, the next link, and `resolveCaseStudy` work on the visible set only.

| Function | Inputs | Returns | Errors |
|---|---|---|---|
| `getProfile()` | none | the profile entry | throws (build fails) if `checkReferences()` fails |
| `getCaseStudies()` | none | visible case studies (both `where` values), by `order` | as above |
| `getSiteCaseStudies()` | none | visible `where: site` case studies, by `order` | as above |
| `getNextCaseStudy(id)` | `id: string` | the next visible `where: site` case study, looping round; `null` when there is only one, or when `id` is a Behance, hidden, or unknown entry | as above |
| `caseStudyHref(entry)` | a case study entry | `{ href, external }`: `{ href: '/work/<id>/', external: false }` or `{ href: behanceUrl, external: true }` (new tab and label are decided in the home page spec, scope #6) | none |
| `caseStudyMeta(entry)` | a case study entry | `"<role> · <year>"` | none |
| `getPlayground()` | none | visible pieces, newest `date` first, ties by id | as above |
| `getCertificates()` | none | visible certificates, newest `date` first, ties by id | as above |
| `getServices()` | none | visible services, by `order` | as above |
| `resolveCaseStudy(ref)` | a reference | the case study, or `null` when it is outside the visible set | as above |
| `formatMonth(value)` | `YYYY-MM` string | e.g. "Nov 2025", English month names | none |

Astro itself only logs (does not fail on) a reference to a missing entry, which is why `checkReferences()` exists.

### Value sourcing

| Action | Value produced / displayed | Source |
|---|---|---|
| Case study card | title, image, alt | `title`, `cover`, `coverAlt` fields |
| Case study card | meta line | derived: `caseStudyMeta()` from `role` and `year` |
| Case study card | link and whether it leaves the site | derived: `caseStudyHref()` from the entry id or `behanceUrl` |
| Case study page URL | `/work/<id>/` | the folder name via `generateId` |
| Next case study link | the next entry | derived: `getNextCaseStudy()` from `order` among published `where: site` entries |
| Stage colour | hex value | `stageColor` field |
| Contrast check | ratio | WCAG relative luminance formula in `src/lib/contrast.ts`, against `STAGE_INK = ['#ffffff', '#f2f2f2']` in the same file (mirrors `--color-stage-ink` in `src/styles/global.css`, light and dark; the loader check confirms both values still appear there) |
| Draft hiding | visible set | `import.meta.env.PROD` (true in `astro build` and its output, false in `pnpm dev`) |
| Certificate date shown | "Nov 2025" | derived from `date` (`YYYY-MM`) by a `formatMonth()` helper in `src/lib/content.ts`, English month names |
| Resume link | `/resume.pdf` | the `RESUME_PATH` constant; `public/resume.pdf` checked with `node:fs` in the profile loader check (Node) |
| Share card text default | text | profile `intro` (scope #11 decides the rest) |
| POS sample facts | role, year, platform, duration, team, context, tools, summary | the Behance POS case study (link in `portfolio-content-sources` memory), confirmed with Tyson during `/develop` |
| POS stage colour | hex value | picked with Tyson during `/develop`; must pass AC-5 |
| POS cover | image | moved from `src/assets/work/pos-warehouse.jpg` |
| Behance sample (Alote) | `behanceUrl`, cover image | Tyson gives both during `/develop` |
| Profile facts | name, role, education, experience, awards, links | Tyson's resume facts (the `user-profile` memory), confirmed with Tyson |
| Profile photo | image | Tyson gives it; until then a plain placeholder image named `photo-placeholder.jpg`, swapped in scope #8 |
| Resume PDF | `public/resume.pdf` | Tyson gives the real file during `/develop`. Never a placeholder: `public/` deploys live on every push to `main`. |
| Certificate samples | title, issuer, date, honour | the four certificates in the `user-profile` memory |
| Certificate images | image | Tyson gives them; until then placeholder images, swapped in scope #9 |
| Service samples | title, summary, includes, steps | drafted during `/develop` for two services (UI/UX design, Design plus build), then edited by Tyson |
| Playground sample | image, note | one piece cut from the POS work, linking `caseStudy: pos-warehouse` |

### Key invariants

- Pages read content only through `src/lib/content.ts`. A direct `getCollection` call would skip drafts and the reference check.
- Drafts pass the same rules as published items; only visibility differs.
- No two case studies share an `order`, drafts included; the same for services.
- Every image has alt text that is not empty.
- Every `stageColor` reaches 4.5:1 against both stage text colours.
- A published item never links to a page that is not on the live site: draft references resolve to `null` there.
- There is always a profile, a resume PDF, and at least one published `where: site` case study.

### Security model

All content is public and lives in the repo; there is nothing to sign in to and no visitor input. The profile `email` is published on purpose as the contact form's backup (spec 0001). Never put private details (phone number, home address, private client names under agreement) in a content file, since every file ships with the public build.

### Critical test scenarios

- Happy path: the samples build, `/kit/content/` shows every type, the POS card links to `/work/pos-warehouse/`, and the Alote card links to Behance, verifies **AC-1**, **AC-2**, **AC-12**, **AC-14**
- Failure case: remove `coverAlt` from the POS file, set its `stageColor` to `#888888`, or give two case studies `order: 1`; each time `pnpm build` fails naming the file, verifies **AC-3**, **AC-4**, **AC-5**, **AC-8**
- Failure case: point the playground sample at `caseStudy: nope`; the build fails. Point it at a draft case study; the build passes and the link is gone on `pnpm preview`, verifies **AC-9**, **AC-10**
- Permission: not applicable (no accounts); the closest case is a draft, which must not appear in `pnpm build` output, verifies **AC-10**

## Build plan

Build approach: Journey. Content is a foundation, so it is built in the order the journeys need it: the hiring manager path first (case studies, profile, certificates), then the freelance path (services), then the explorer path (playground).

1. Add `src/lib/contrast.ts` (WCAG contrast ratio and `STAGE_INK`), `src/lib/content-checks.ts` (`withChecks()` and the case study check: story required, duplicate order, at least one published site case study, `STAGE_INK` found in `global.css`), and the `caseStudies` collection in `src/content.config.ts`, satisfies **AC-1**, **AC-3**, **AC-4**, **AC-5**, **AC-6**, **AC-7**, **AC-8**, **AC-11**
2. Move `src/assets/work/pos-warehouse.jpg` to `src/content/case-studies/pos-warehouse/cover.jpg`; write the POS case study (`where: site`, short real story to start) and the Alote case study (`where: behance`); point the kit page's card at the content entry, satisfies **AC-2**, **AC-14**
3. Add `src/lib/content.ts` with the visible set, the case study getters, `getNextCaseStudy`, `caseStudyHref`, `caseStudyMeta`, and the `checkReferences()` frame, satisfies **AC-10**, **AC-12**, **AC-13**, **AC-14**
4. Add the `profile` collection and `profile.md` from your resume facts, the photo placeholder, and your real `public/resume.pdf`; add the profile loader check (profile exists, resume exists), `RESUME_PATH`, and `getProfile()`, satisfies **AC-1**, **AC-6**, **AC-11**
5. Add the `certificates` collection, your four certificate files, `getCertificates()`, and `formatMonth()`, satisfies **AC-1**, **AC-12**
6. Add the `services` collection with its loader check (duplicate order), the two service files, `getServices()`, and the `examples` reference check, satisfies **AC-1**, **AC-8**, **AC-9**, **AC-12**
7. Add the `playground` collection, one sample piece, `getPlayground()`, `resolveCaseStudy()`, and the `caseStudy` reference check, satisfies **AC-1**, **AC-9**, **AC-12**
8. Build `/kit/content/` (noindex, using `BaseLayout` and `ProjectCard`) listing every visible entry of every type with its fields and its rendered body (`render(entry)`), satisfies **AC-2**, **AC-15**
9. Prove the failures: break each rule once on purpose (AC-3 to AC-11), confirm `pnpm build` stops with a clear message, then restore, satisfies **AC-3**, **AC-4**, **AC-5**, **AC-6**, **AC-7**, **AC-8**, **AC-9**, **AC-10**, **AC-11**

## Consequences

**Positive**:
- Adding work is adding a file; a mistake stops the deploy instead of reaching visitors.
- Moving a Behance project onto the site is one edit in one file.
- Cards, case study pages, the About page, and Work with me all read the same typed data, so they cannot disagree.

**Negative / tradeoffs**:
- Most checks run when content loads, but the reference check and draft hiding only run when a page calls `src/lib/content.ts`. A page that calls `getCollection` directly bypasses both until a lint rule enforces it (Follow-up).
- Astro stops at the first bad file, so two broken files are reported one build at a time. A wrong `where` value hides the other errors in that file until it is fixed.
- If `content.config.ts` itself fails to load (a broken import), Astro logs "Skipping sync" instead of failing; the "at least one published site case study" check then fails the build anyway.
- The 4.5:1 rule against `#f2f2f2` limits stage colours to mid and dark tones; pale or bright colours (yellow, mint, pastel) cannot be used as a stage.
- The stage text colours are written twice, in `global.css` and in `src/lib/contrast.ts`. If one changes and the other does not, the check tests the wrong colour.
- A Behance project still needs a cover image and full facts in the repo, not just a link.
- Nested lists in the profile (experience, education) are YAML inside the file header, where an indentation slip is easy; the build catches it, but the message can be terse.

**Neutral**:
- `src/assets/work/` empties out; case study images now live beside their story.
- The case study page route (`src/pages/work/[id].astro`) and the ready pieces available inside a story are built in scope #7, not here.

## Follow-up

- [ ] Contact form spec (scope #10): build the "what you need" choices from the service ids plus "Something else", so Work with me can open the form with a service already picked.
- [ ] SEO spec (scope #11): decide whether share images use the case study `cover` or a separate field.
- [ ] Scope #8 and #9: replace the photo and certificate placeholder images with the real files.
- [ ] If the stage text colours in `global.css` ever change, update `STAGE_INK` in `src/lib/contrast.ts` in the same commit (the loader check fails until you do).
- [ ] Coding standards (scope #2): add a lint rule (ESLint `no-restricted-imports`) that blocks `getCollection` outside `src/lib/`.
- [ ] SEO spec (scope #11): keep `/kit/` pages out of the sitemap.
- [ ] Home page spec (scope #6): decide whether Behance cards open in a new tab and how they say they leave the site. There is no `featured` flag, so the home page shows every visible case study unless that spec adds one.
- [ ] Spec 0001 asks for a per case study `accent` field; this spec names it `stageColor` so it does not clash with the site wide `accent` token. Note this when spec 0001 is next updated.

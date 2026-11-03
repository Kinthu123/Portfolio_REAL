# 0003. Content model: rationale

## Context

The portfolio has to hold five kinds of content: case studies, small playground pieces, certificates, the services offered to freelance clients, and one profile about Tyson (bio, links, resume, experience). Spec 0001 already fixed the tools: Astro's content layer with Zod schemas in `src/content.config.ts`, MDX for rich stories, and a static build on Cloudflare Workers where every push to `main` deploys. What it left open is the shape of each type, how types link to each other, and what counts as broken.

Three forces shape that. First, the site is the proof of Tyson's design judgement, so a broken page (an empty card, an image without alt text, an unreadable stage colour) costs more here than on most sites. With automatic deploys, the build is the only gate before visitors see a mistake. Second, three of four projects stay on Behance for now and move onto the site one at a time, so the model has to carry a project in two states without the home page caring which. Third, Tyson is new to Astro and edits these files by hand; the format has to be forgiving to write and loud when wrong.

Spec 0002 adds one hard rule: each project's stage colour sits behind white text (`#ffffff` light, `#f2f2f2` dark) and must keep 4.5:1 contrast. Some rules can be checked one file at a time (a field is missing), but others need every file at once (two projects claim the same order, a playground piece names a case study that does not exist). In Astro 7.4.4, a reference to a file that does not exist is only logged as an error, not a build failure, so that second kind of rule has no home by default. The build also renders pages inside Cloudflare's runtime, which cannot read the repo's files, so any check that looks at a file on disk has to run earlier, while content loads in Node.

Without this decision, each page would invent its own fields as it is built, the case study template (scope #7) would have nothing to render, and the first typo would ship.

## Options considered

### Option 1: Content collections with strict schemas, plus one shared content module

Five glob collections of Markdown and MDX files, each with a strict Zod schema (per file rules: required fields, alt text, lengths, contrast). Each loader is wrapped so the rules across files in one collection run in Node as content loads. A module `src/lib/content.ts` is the only way pages read content; it hides drafts, sorts, derives links, and checks links between collections.

**Pros**:
- Per file mistakes fail before any page renders, with the file and field named.
- Rules across files live in one place instead of being repeated on every page.
- Draft hiding and sorting cannot drift between pages.

**Cons**:
- The rule "read only through the module" is a convention; nothing stops a page from calling `getCollection` directly.
- One more module to learn for someone new to Astro.

### Option 2: Content collections with schemas only

The same collections and schemas, and each page calls `getCollection` and filters, sorts, and links for itself.

**Pros**:
- The plainest Astro setup, matching every tutorial.
- No custom module.

**Cons**:
- Duplicate orders, missing references, and the "story required for site case studies" rule have no single home; each page would have to check them or skip them.
- Draft filtering repeated on every page will eventually be forgotten on one.

### Option 3: Typed TypeScript data files

Content as typed objects in `src/data/*.ts` (one file per item, or one file per type), with stories in separate MDX files.

**Pros**:
- TypeScript catches mistakes in the editor as you type.
- Arbitrary checks are just code.

**Cons**:
- Writing prose inside TypeScript strings is painful; stories and data split across two files.
- Loses Astro's image handling in schemas and the content layer's caching.
- Not "one text file per item" in the sense the scope asks for.

### Option 4: A hosted CMS

Content edited in a hosted CMS (Sanity, for example) and pulled at build time.

**Pros**:
- A friendly editing screen, no Git needed to change a line.
- Validation rules and image handling built in.

**Cons**:
- A second system to run, sign in to, and keep in sync, for one editor who already works in the repo.
- Builds depend on an outside service; the scope explicitly defers an admin panel.

## Rationale

Option 1 is the only one that gives every rule a home. The per file rules (AC-3 to AC-6) fit Zod schemas naturally, which Option 2 also has. The difference is the rules that compare files: duplicate orders, references to missing case studies, at least one site case study, a profile and resume that exist. In Option 2 these either get copied onto each page or skipped, and with automatic deploys a skipped check means a broken page on the live site. Running them in a wrapper around each loader means they run on every build, before any page and whatever pages exist; only the links between collections wait for a page to read content, because collections load in parallel.

Option 3 fights the content: Tyson writes long case study stories, and those read best as plain Markdown, not strings in code. Option 4 solves an editing problem Tyson does not have yet (the scope keeps a CMS deferred), at the cost of a second system and a build that depends on someone else's uptime.

The finer choices follow the same forces. One case study type with `where: site | behance` (rather than a separate project list) keeps a moving project in one file, and making `where` explicit (rather than inferring it from an empty story) means an accidentally emptied story fails the build instead of silently turning into a Behance card. The field is called `stageColor`, not `accent` as spec 0001 suggested, because `accent` is already the site wide link and button token in spec 0002, and two meanings for one word is a bug waiting to happen. One stage colour checked against the harder of the two text colours (`#f2f2f2`) is simpler than a light and dark pair and loses little, since the stage is a dark field in both themes. The contrast formula is about fifteen lines of code, so it is written by hand in `src/lib/contrast.ts` rather than adding a package. Draft references resolve to `null` on the live build rather than failing it, so a draft case study never breaks a published piece that links to it. Drafts still have to pass every field rule (placeholder values are fine) and their `order` still counts: loosening the schema for drafts would mean two schemas per type, and a draft that breaks the rules is a deploy that breaks the moment you publish it.

### Settled during writing

These were small calls made with the full design in view (pick, why, runner up):

- **Field name `stageColor`**: avoids clashing with the `accent` token. Runner up: `accent`, as spec 0001 wrote it.
- **Cross file checks in a loader wrapper** (`withChecks()` in `src/lib/content-checks.ts`): runs in Node on every build, before pages, and can read `public/` and `global.css`. Only the links between collections stay in `src/lib/content.ts`. Runner up: all checks in `src/lib/content.ts`, which a cross check showed cannot read the repo's files inside Cloudflare's runtime and only runs if a page calls it.
- **Resume as a fixed `/resume.pdf`**, not a profile field: it never moves, and a fixed path is one less thing to get wrong. Runner up: a `resume` field checked for existence.
- **The reference check caches only on the live build**: in dev a fixed file shows up without a restart. Runner up: cache always, which keeps a stale error until restart.
- **Hand written contrast function**: tiny and stable. Runner up: a contrast package from npm.
- **`STAGE_INK` constants copied from `global.css`**: simple and obvious. Runner up: parsing `global.css` at build time, which is fragile for a two value list.
- **Discriminated union on `where`**: TypeScript then knows `behanceUrl` exists for Behance projects. Runner up: one object with a refine check, which loses that type narrowing.
- **Explicit `generateId` (folder name) for case studies**: makes the `/work/<id>/` rule obvious in the config. Runner up: Astro's default id, which happens to match but is easy to misread.
- **Dates**: full dates (`YYYY-MM-DD`) for playground pieces, year and month (`YYYY-MM`) for certificates and experience, a plain year for case studies: each matches what is shown. Runner up: full dates everywhere, which forces made up days.
- **Proof page at `/kit/content/`**, noindex: the real pages arrive later in the journeys, so this proves every type renders now. Runner up: proving it only through `pnpm build` with no page, which never exercises the image fields.

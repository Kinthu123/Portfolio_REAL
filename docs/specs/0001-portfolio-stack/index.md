# 0001. Build the portfolio on Astro 7 with Cloudflare Workers

**Date**: 2026-11-02
**Status**: Accepted

## Summary

The portfolio is an Astro 7 site written in strict TypeScript, styled with Tailwind CSS 4, animated with GSAP and Lenis, and hosted free on Cloudflare Workers. Almost every page is plain HTML built ahead of time. The only live server code is one contact form action, which checks for spam with Turnstile and emails you through Resend. Umami counts visits without cookies. The hero character sits behind one swappable slot: a simple SVG character now, your own Rive character later.

## Decision

**Chosen option**: Option 1: Astro 7 static first on Cloudflare Workers.

Build a static first Astro 7 site (pages built at deploy time, one on demand server action) in strict TypeScript, deployed to Cloudflare Workers from GitHub, with the layers below.

**Implementation skills**: `astro` (`astrolicious/agent-skills`, `.agents/skills/astro/`) · `gsap-core`, `gsap-scrolltrigger`, `gsap-timeline`, `gsap-performance` (`greensock/gsap-skills`, `.agents/skills/gsap-*/`) · `wrangler`, `workers-best-practices` (`cloudflare/skills`, `.agents/skills/`) · `resend` (`resend/resend-skills`, `.agents/skills/resend/`) · `design-taste-frontend` (`.claude/skills/design-taste-frontend/`) · `ui-ux-pro-max` (`.claude/skills/ui-ux-pro-max/`) · `ui-styling` (`.claude/skills/ui-styling/`)

## Rationale

Reasoning and options: see [rationale.md](rationale.md).

## Proposed stack

| Layer | Choice | Reason |
|---|---|---|
| Language | TypeScript, `strict` | Content files and components are type checked, so a missing field fails the build instead of shipping a broken page. |
| Package manager | pnpm 10 (`packageManager: "pnpm@10.x"`), Node 24 LTS (`.nvmrc` and `engines`), `pnpm.onlyBuiltDependencies: ["esbuild", "sharp", "workerd"]` | Fast, strict installs; pnpm 10 skips install scripts unless allowed, which would break those three. |
| Framework | Astro 7, default `output: 'static'` | Pages ship as HTML with JS only where motion needs it; first party Cloudflare adapter. |
| Content | Astro content layer: `glob()` loaders plus Zod schemas in `src/content.config.ts`, MDX via `@astrojs/mdx` | One file per case study, playground piece, certificate, service; schema errors fail the build. Field shapes are decided in the content model spec (scope #3). |
| Styling | Tailwind CSS 4 through `@tailwindcss/vite` in `astro.config` `vite.plugins` | Tokens (color, type, spacing, motion) live in one `@theme` block in `src/styles/global.css`; values come from the design system spec (scope #4). |
| Theme | `data-theme` on `<html>`; tiny inline head script reads `localStorage`, else `prefers-color-scheme`; Tailwind `@custom-variant dark` keyed to `data-theme` | Follows the system first, remembers the toggle, no flash of the wrong theme. |
| Page transitions | Astro `<ClientRouter />` using the browser's native view transitions; `transition:name` pairs a project card with its case study hero | Animated swaps and the card to hero morph; GSAP is never used for page swaps. The mascot survives navigation with `transition:persist`. |
| Motion | GSAP 3.15: core on every page; ScrollTrigger and SplitText loaded with `import()` only on pages containing `[data-scene]` or `[data-split]` | Free including plugins, even commercially; plugins cost nothing on pages without scenes. |
| Smooth scroll | Lenis 1.3, one instance for the whole visit, driven by `gsap.ticker`, calls `ScrollTrigger.update` on scroll | Weighted scroll for scenes; never started when `prefers-reduced-motion: reduce`. |
| Hero character | `Mascot` slot: `SvgMascot` (inline SVG plus GSAP) now; `RiveMascot` (`@rive-app/webgl2`) later | One import line switches the character; contract below. |
| Images | `astro:assets` `<Image>` / `<Picture>`, optimized at build time (AVIF, WebP), `imageService: 'compile'` on the adapter | Fast case study images with no paid image service. |
| Fonts | Astro's built in Fonts API, self hosted with generated fallbacks and preload | No third party font requests; families chosen in the design system spec. |
| Contact form | Astro Action (`src/actions/index.ts`, `accept: 'form'`, Zod input) sending through Resend | Typed, on site, free tier (3,000 a month, 100 a day). |
| Spam protection | Cloudflare Turnstile, verified server side, plus a hidden honeypot field | Free and usually invisible; honeypot catches simple bots at no cost. |
| Analytics | Umami Cloud script, page views plus custom events | Cookieless, so no banner; counts resume downloads and sent messages. |
| Hosting | Cloudflare Workers with static assets, `@astrojs/cloudflare` adapter, `wrangler.jsonc` with `name: "tyson-portfolio"`, `workers_dev: true`, `preview_urls: true` | Free plan allows commercial use; static assets served free; one Worker for the action. |
| Deploys | Cloudflare Workers Builds connected to the GitHub repo: build `pnpm build`; `main` deploys with `npx wrangler deploy`; other branches with `npx wrangler versions upload` | Build and deploy on every push, preview URL per branch, no CI file. |
| Domain | Free `tyson-portfolio.<account-subdomain>.workers.dev`, also set as `site` in `astro.config.mjs` | Your choice; `site` feeds canonical URLs and the sitemap. A custom domain can be added later by changing `site`. |
| URLs | Trailing slashes: `trailingSlash: 'always'`, `build.format: 'directory'`; assets `html_handling: "auto-trailing-slash"`, `not_found_handling: "404-page"` | URLs look like `/work/pos/`; unknown paths get the custom 404 page with a real 404 status. |
| Security headers | `public/_headers`: `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Content-Security-Policy: frame-ancestors 'none'` | Basic protection now. A full CSP is deferred on purpose: Turnstile, Umami, and later Rive would each need allowances, and Astro's CSP has ClientRouter limits. |
| Observability | Workers Logs and Traces (`observability.enabled` and `observability.traces.enabled` in `wrangler.jsonc`), structured JSON logs in the action | Enough to see failed sends; no error tracker until there is a reason. |
| Worker config | `compatibility_date` set to the scaffold date, `compatibility_flags: ["nodejs_compat"]`; secrets only via Wrangler or dashboard, never in `wrangler.jsonc` | Per the `workers-best-practices` skill. |
| Rate limiting | None, on purpose | Past Turnstile, the worst abuse is using up Resend's 100 a day cap, and the email link covers that. Do not add rate limiting. |
| Database, auth, jobs, file storage | None | Content lives in the repo; no visitor accounts; nothing runs in the background. |

### Rendering model

- Every page is prerendered at build time. The only on demand route is Astro's action endpoint for the contact form.
- `src/pages/404.astro` is prerendered and served by the Workers asset handler for unknown paths. Check on a preview that `/nope/` returns status 404 with the custom page.
- No page reads request data at render time.
- The contact form needs JS (the action call and Turnstile both do). Without JS, a `<noscript>` note shows your email link.

### Repository layout

```
src/
  actions/index.ts          # contact action
  components/
    ui/                     # buttons, links, cards, form fields
    mascot/                 # Mascot.astro (slot), controller.ts, types.ts, SvgMascot, later RiveMascot
  content/                  # one folder per collection (case-studies, playground, certificates, services)
  content.config.ts         # collection loaders and Zod schemas
  layouts/                  # BaseLayout (head, theme script, ClientRouter, analytics)
  pages/                    # routes, 404.astro
  scripts/motion.ts         # GSAP, Lenis, ScrollTrigger lifecycle
  styles/global.css         # Tailwind import, @theme tokens, dark variant
public/
  resume.pdf
  _headers                  # security headers
astro.config.mjs
wrangler.jsonc
.env.example                # public names + Turnstile test site key
.dev.vars.example           # secret names + Turnstile test secret
```

### Mascot slot contract

- `src/components/mascot/Mascot.astro` renders exactly one implementation and carries `transition:persist`, so it is not recreated on page swaps.
- It is rendered once, in `BaseLayout`, at the same spot in the page tree on every page (persist needs that). Its position per page is set by CSS keyed to a `data-page` attribute on `<html>`.
- Pages and buttons talk to it only through a shared `mascot` controller exported from `src/components/mascot/controller.ts`.
- Each implementation exposes the same browser side controller: `play(action: MascotAction): void`, `idle(): void`, `destroy(): void`, where `MascotAction` is a string union defined in `src/components/mascot/types.ts` (initial set: `wave`, `dance`, `sulk`, `peek`).
- Pointer interaction (grab, follow) lives inside the implementation, never in page code. Pages and buttons call only the controller.
- With `prefers-reduced-motion: reduce`, the character shows a static pose and ignores `play` except for an instant pose change.
- The character is decorative to assistive tech (`aria-hidden="true"`) unless an action button controls it; buttons are real `<button>` elements with text labels.
- Swapping to Rive later: add `RiveMascot` implementing the same controller, change the one import in `Mascot.astro`. No page changes.

### Motion lifecycle with ClientRouter

- `src/scripts/motion.ts` is a bundled module script (it runs once per visit, so listeners attach once; never `is:inline`).
- Per page: on `astro:page-load`, create that page's animations inside one `gsap.context()` (or `gsap.matchMedia()`); on `astro:before-swap`, call `ctx.revert()`. That kills the page's ScrollTriggers and reverts SplitText. Mascot tweens are created outside any page context and survive.
- Lenis is created once and kept. On each swap, reset it with `lenis.scrollTo(0, { immediate: true })`. Anchor links and back button scroll restore go through Lenis. Scrollable modals (playground) carry `data-lenis-prevent`.
- Call `ScrollTrigger.refresh()` after `document.fonts.ready` and after images load. Split text only after fonts load.
- Reduced motion: every scroll scene, SplitText, Lenis, and the mascot run only under `matchMedia('(prefers-reduced-motion: no-preference)')`.
- JS off: the inline head script adds `js` to `<html>`. Elements start hidden before an entrance animation only under `html.js`, so with JS off nothing stays invisible.
- The theme script also reapplies `data-theme` on `astro:after-swap`.

### Contact action

| Action | Input | Output | Errors |
|---|---|---|---|
| `actions.contact` (called from the form script with `FormData`) | `name` (req, 1 to 100 chars), `email` (req, email), `need` (req, enum decided with the contact form spec), `message` (req, 10 to 5,000 chars), `budget` (optional), honeypot field with an unusual name such as `fax_number_2` (must be empty), `cf-turnstile-response` (req), `submissionId` (req, UUID made in the browser) | `{ ok: true }` | `BAD_REQUEST` field errors (Zod); `FORBIDDEN` failed Turnstile (generic message); `INTERNAL_SERVER_ERROR` Resend failure or siteverify unreachable (the form shows your email link as backup) |

- Field list and `need` options are owned by the contact form spec (scope #10); this table fixes only the mechanism.
- **Submitting**: the form carries `data-astro-reload` so ClientRouter leaves it alone. The script calls `preventDefault()`, then `actions.contact(formData)`. The submit button is disabled while a send is in flight.
- **Honeypot**: `autocomplete="off"`, `tabindex="-1"`, `aria-hidden="true"`, positioned off screen (not `display:none`). When it is filled, the action returns `{ ok: true }` and sends nothing.
- **Turnstile**: load `https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit` once. Call `turnstile.render()` on `astro:page-load` when the form is on the page, `turnstile.remove()` on `astro:before-swap`, and `turnstile.reset()` after every failed send (tokens are single use and expire after 300 seconds). Server side, siteverify gets the token, `TURNSTILE_SECRET_KEY`, and `remoteip` from the `CF-Connecting-IP` header; the result must have `success: true` and a `hostname` matching the site. If siteverify is unreachable, fail closed (`INTERNAL_SERVER_ERROR`).
- **Email**: Resend sends a plain text email (`text` only, no HTML) `from: onboarding@resend.dev` to `CONTACT_TO_EMAIL`, `replyTo` the visitor's email, subject `Portfolio: {need} from {name}` with CR and LF removed.
- **Idempotency**: every send passes `idempotencyKey: contact/${submissionId}`. The browser makes a new `submissionId` when the form loads and again after any error response, so an edited retry is never rejected as a duplicate.
- **Inbox caveat**: with no custom domain, Resend only delivers to your own account address, so `CONTACT_TO_EMAIL` must exactly match your Resend account email (anything else returns 403). Mail from resend.dev often lands in spam; add a Gmail filter that never sends it there.
- **Logs**: structured JSON with only `submissionId`, the outcome, and the Resend error code. Never the visitor's name, email, or message.
- On success the page calls `window.umami?.track('contact-sent')`.

### Analytics events

- Page views: automatic, including ClientRouter navigations (Umami tracks history changes).
- `resume-download`: `data-umami-event="resume-download"` on every resume link.
- `contact-sent`: tracked after a successful action.
- The Umami script carries `data-domains` set to the production hostname only, so previews and local dev never count. Every call is guarded (`window.umami?.track`), because ad blockers remove the script; treat counts as a slight undercount.

### Configuration required

Declared with `astro:env` in `astro.config.mjs`. Public values are baked in at build time; secrets are read per request.

| Name | Kind | Production | Local |
|---|---|---|---|
| `RESEND_API_KEY` | server secret | Worker runtime secret | `.dev.vars` |
| `CONTACT_TO_EMAIL` | server secret, must equal your Resend account email | Worker runtime secret | `.dev.vars` |
| `TURNSTILE_SECRET_KEY` | server secret | Worker runtime secret | `.dev.vars`, Turnstile test secret |
| `PUBLIC_TURNSTILE_SITE_KEY` | client public | Workers Builds build variable | `.env`, Turnstile test site key |
| `PUBLIC_UMAMI_WEBSITE_ID` | client public, script loads only when set | Workers Builds build variable | unset, so local dev sends nothing |

- `.dev.vars` and `.env` are git ignored. Commit `.dev.vars.example` and `.env.example` with the names and Turnstile test keys.
- The production Turnstile widget allows the `<account-subdomain>.workers.dev` hostname, which should also cover preview URLs (confirm on the first preview).

## Consequences

**Positive**:
- Pages are plain HTML and fast by default; JS cost is limited to the motion layer and the character.
- Hosting, email, spam protection, and analytics all fit free tiers for a portfolio's traffic.
- Adding work later means adding one content file; schema errors stop the deploy.
- The character can be replaced without touching any page.

**Negative / tradeoffs**:
- ClientRouter means every script must handle page swaps; forgetting cleanup causes duplicate scroll triggers and memory leaks.
- Four outside accounts to keep (Cloudflare, Resend, Umami, GitHub) and three secrets to rotate.
- Resend without a custom domain shows `onboarding@resend.dev` as the sender and can only email your own account address.
- Workers runtime is not full Node: Node only libraries may not run inside the action (sharp is used only at build time, so images are unaffected).
- GSAP core, Lenis, and the character load on every page (roughly 60 to 90 KB); ScrollTrigger and SplitText add more on pages with scenes.
- The contact form does not work without JS; those visitors get the email link.
- No Content Security Policy yet, so an injected script would not be blocked; revisit once the third party scripts are settled.
- Lenis brings edge cases (anchor links, scroll restore, nested scrolling) that native scroll would not have.
- Umami Cloud free tier limits were not verified this run; check them at signup.

**Neutral**:
- Astro is now owned by Cloudflare and stays MIT licensed; deploying elsewhere later means swapping the adapter.
- Tooling (lint, format, type check in CI) is decided by scope #2, not here.
- SEO pieces (`@astrojs/sitemap`, share images) are added by scope #11 on this stack.

## Follow-up

- [ ] Content model spec (scope #3) defines each collection's Zod schema and the per case study `accent` color field.
- [ ] Design system spec (scope #4) sets the tokens in `@theme`, the font families, and records sebg.ch as the reference in `design.md` (borrow the structure and playfulness, not its character or brand).
- [ ] Contact form spec (scope #10) fixes the field list, `need` options, and the confirmation and error states.
- [ ] At scaffold time, confirm against current Astro 7 docs: the Fonts API is stable, `astro:env` secrets work on the Cloudflare adapter, and `imageService: 'compile'` is still the right adapter option. If the Fonts API is not stable, use Fontsource.
- [ ] Add a full Content Security Policy once Turnstile, Umami, and the character runtime are final.
- [ ] Confirm Umami Cloud free tier limits at signup.
- [ ] Root `AGENTS.md` does not exist yet; `/audit` (scope #2) should record this stack, the ClientRouter lifecycle rule, the mascot slot contract, and an `## Agent skills` entry for each skill above.
- [ ] Optional MCP servers, deferred (you connect them yourself when wanted):
  - Astro Docs: `claude mcp add --transport http "astro-docs" https://mcp.docs.astro.build/mcp`
  - Cloudflare Docs and Workers Builds (OAuth): `https://docs.mcp.cloudflare.com/mcp`, `https://builds.mcp.cloudflare.com/mcp`
  - Resend: `claude mcp add --transport http resend https://mcp.resend.com/mcp`

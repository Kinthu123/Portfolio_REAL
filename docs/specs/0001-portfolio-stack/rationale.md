# 0001. Rationale: portfolio stack

Decision record for [index.md](index.md). `/develop` does not need this file.

## Context

Tyson is a UI/UX designer who also codes, replacing an old Vercel portfolio. Hiring managers come first, then freelance clients. The site has to prove both design taste and build skill, so the site itself is part of the portfolio.

The reference is sebg.ch: a playful, motion heavy one page portfolio with an interactive character, featured case studies in device frames, a project grid, per project accent colors, and smooth page transitions. That sets a high bar for motion while the scope also asks for WCAG AA, light and dark themes, fast images, and good scores on phones.

Forces:
- **Content driven.** Case studies, playground pieces, certificates, and services are one file each; a missing field must fail the build (scope #3).
- **Mostly static, a little server.** Only the contact form needs server code (spam filtering, email). There are no accounts, no database, no background work.
- **Commercial use, zero budget.** The site promotes paid freelance work, so a free hosting plan has to allow commercial use. You chose the free host subdomain.
- **Custom analytics events.** The scope counts resume downloads and sent messages, with no cookie banner (scope #12).
- **A character that changes later.** A placeholder now, your own designed character later, without rewriting pages.
- **One person maintains it.** Anything that needs ongoing ops is a cost.

## Options considered

### Option 1: Astro 7 static first on Cloudflare Workers

Astro with typed content collections and MDX, Tailwind 4, GSAP plus Lenis, ClientRouter transitions, an Astro Action with Resend and Turnstile, Umami, deployed by Workers Builds.

**Pros**:
- Ships HTML with JS only where needed (basis: islands architecture, ship less JS by default).
- Content layer with Zod schemas gives the build time failure the scope asks for.
- Cloudflare's free plan allows commercial use and serves static assets free; Cloudflare now owns Astro, so the adapter is first party.
- Same framework the reference uses, so its transition and persistence patterns map directly.

**Cons**:
- Workers is not full Node; some libraries will not run in the action.
- ClientRouter needs careful script lifecycle handling.
- Four outside services to manage.

### Option 2: Next.js 16 on Vercel

App Router with MDX, Tailwind, Motion, a route handler with Resend, Vercel Web Analytics.

**Pros**:
- Smoothest deploy experience; huge ecosystem.
- React everywhere, so interactive pieces share one model.

**Cons**:
- Vercel Hobby is noncommercial only per its fair use guidelines, and has no custom analytics events; both force Pro ($20 a month) for this site.
- Ships a React runtime on every page of a mostly static site.
- Content schemas and validation have to be assembled by hand.

### Option 3: Astro static on Netlify, no server code

Astro fully static, Web3Forms for the form, Plausible or Umami for analytics.

**Pros**:
- No server code at all; nothing to break in a runtime.
- Netlify's free plan allows commercial use.

**Cons**:
- The form posts to a third party, so validation, spam rules, and confirmation states are mostly theirs.
- Netlify free tier moved to credit based limits (not verified this run).
- Plausible is paid only.

### Option 4: SvelteKit on Cloudflare

SvelteKit with mdsvex, Tailwind, Svelte transitions and GSAP, a form action with Resend.

**Pros**:
- Very light runtime; built in transitions are pleasant for motion.
- Form actions are a clean fit for the contact form.

**Cons**:
- Content collections, schema validation, and image optimization need extra libraries.
- Smaller ecosystem of portfolio and motion examples than Astro or Next.

## Rationale

The site is content first with one tiny server need, so the framework that defaults to HTML and has typed content built in (Astro) beats one that defaults to a client runtime (Next.js). The build time content validation in scope #3 comes for free with Astro's content layer, where Next.js and SvelteKit need it assembled.

Hosting was settled by the commercial use force: Vercel Hobby rules out a portfolio that sells freelance work and also lacks the custom events scope #12 needs, so Next.js on Vercel would cost $20 a month from day one. Cloudflare's free plan allows commercial use, serves the static pages free, and runs the single action as a Worker. Netlify was the runner up; Cloudflare won on the first party Astro adapter and on keeping Turnstile on the same account.

For the form, an Astro Action keeps validation, spam checks, and error states in your own code (scope #10 wants helpful field errors and a reliable fallback), which a hosted form endpoint does not. Resend's free tier is far above a portfolio's volume and works without a custom domain when sending to yourself. Umami was picked over Cloudflare Web Analytics because the latter has no custom events, and over Plausible because Plausible is paid.

GSAP over Motion because the reference's feel depends on scroll scenes and split text, where GSAP is strongest, and its plugins are now free for commercial use. The character starts as SVG plus GSAP so it adds no new tool; the controller contract makes the later Rive swap a one file change, which is the force "a character that changes later."

## References

**Project sources**:
- `docs/scope/scope.md`, features #1, #3, #10, #12 and the Journey build approach
- `CLAUDE.md`, design skill routing (Taste for direction, ui-ux-pro-max for rules)
- Installed skills: `design-taste-frontend`, `ui-ux-pro-max`, `ui-styling`

**Practices & standards**:
- Islands architecture (ship HTML, hydrate only interactive parts)
- Progressive enhancement and `prefers-reduced-motion` (WCAG 2.2, 2.3.3 Animation from Interactions)
- Server side verification of bot challenges; honeypot fields
- Secrets kept out of the repo, set per environment
- Cloudflare's acquisition of The Astro Technology Company (January 2026), from the Cloudflare press release
- Vercel fair use guidelines (Hobby is noncommercial)

**Links** (web verified):
- Rive web runtime docs: https://rive.app/docs/runtimes/web/web-js
- Resend pricing: https://resend.com/pricing
- Vercel Web Analytics limits and pricing: https://vercel.com/docs/analytics/limits-and-pricing
- Cloudflare Turnstile plans: https://developers.cloudflare.com/turnstile/plans/
- GSAP 3.15 README (license note): https://cdn.jsdelivr.net/npm/gsap@3.15.0/README.md

### Landscape check (2026-11-01)

- Astro 7.4.4, Next.js 16.4.4, Tailwind 4.3.3 (`@tailwindcss/vite` 4.3.3), GSAP 3.15.0, Motion 14.9.0, Lenis 1.3.27, `@rive-app/webgl2` recommended over `@rive-app/canvas` 2.49.0, lottie-web 5.13.0, `resend` 6.37.0, `@vercel/analytics` 2.0.1 (npm registry).
- Not verified: Astro 7 release details and ClientRouter status, Netlify and Cloudflare pricing, Umami Cloud limits, Plausible pricing, Web3Forms and Formspree limits, Astro Actions changes.

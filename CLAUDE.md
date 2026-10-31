# Portfolio: personal UI/UX design portfolio

## Workflow

Built with the jsmastery workflow skills in `.claude/skills/`, with the design skills plugged in:

`/scope` → `/architect` → `/develop` (Taste sets the direction, ui-ux-pro-max rules) → `/check verify` (+ Taste `inspect.mjs`) → `/test` → `/check review` (+ ui-ux-pro-max rules) → `/document` → `/sync`. `/debug` anytime.

## Design skills (apply on every UI task)

- **Art direction: `design-taste-frontend` (Taste).** Wherever `/develop` asks for "a proven design skill" (`ui-guide.md` case 4, `ui/generate.md` Path B), use Taste instead of `frontend-design`. Sector: `personal-portfolio`. Follow its full run: draw directions, pick one, build, `inspect.mjs` at three widths, look-and-fix loop.
- **UX rules and stack guidance: `ui-ux-pro-max`.** Use its Quick Reference rules (accessibility, interaction, performance, layout, navigation, animation) and `--domain` / `--stack` searches while building and during `/check`. Do not let its `--design-system` style, palette, or fonts override the Taste direction, and do not run `--persist`: `design.md` is the single art-direction record.
- **A user-provided reference wins** (Figma, screenshot, URL): `/develop`'s `ui/mcp.md` / `ui/image.md` path governs the look. Taste's inspector and slop checks and the ui-ux-pro-max rules still apply; where Taste's house style conflicts with the reference, follow the reference and say so.
- **Source of truth:** art direction in `design.md`, token values in the styling/theme system (per `/develop`). Record the chosen Taste direction in `design.md`.
- Optional extras from UI/UX Pro Max: `design-system`, `ui-styling`, `brand`, `banner-design`, `slides`, `design` (its logo/icon generation needs a Gemini API key).

## Updating skills

Three sources, tracked in `skills-lock.json` (jsmastery, Taste) and the uipro CLI:

```bash
npx skills@latest update -p                      # jsmastery workflow + Taste
npx -y ui-ux-pro-max-cli@latest update --ai claude  # UI/UX Pro Max and its 6 extras
patch -p0 --forward < docs/skill-patches.diff     # re-apply local patches (updates overwrite them)
```

Local patches (in `docs/skill-patches.diff`): `develop/ui-guide.md` and `develop/ui/generate.md` route design to Taste; `design/SKILL.md` and `banner-design/SKILL.md` map skills that are not installed (`frontend-design`, `chrome-devtools`, `ai-artist`, `ai-multimodal`, `/ck:` prefixes) to installed substitutes. If a hunk fails after an update, re-apply that change by hand and regenerate the diff. After changing a skill, update this file and the diff together.

# 0002. Rationale: design system

Decision record for [index.md](index.md). `/develop` does not need this file.

## Context

Tyson's portfolio must look designed, not templated, because the site itself is evidence of his design skill. He pointed to sebg.ch: a playful site whose character guides visitors and whose projects each carry their own colour. The scope also asks for light and dark themes, WCAG AA from the start, and base pieces every later page can reuse.

Forces:
- **Distinct but readable.** Hiring managers skim; the type and colour must stay easy to read while carrying personality.
- **A character that stays present.** The playful guide is the part of sebg.ch Tyson liked most, and a placeholder now must be swappable for his own character later (spec 0001 mascot slot).
- **Proof of the double skill.** He designs and builds; the design should give that a place on the page.
- **One person maintains it.** A small token set and few pieces beat a large component library.
- **Taste house rules** apply on every UI task (CLAUDE.md): no ornaments, square or pill buttons decided once, two typefaces at most.

## Options considered

### Option 1: The dealt sheet as is

Split stage with Literata, navy on white, and the dealt "Fog and quiet" photographs in the fixed half.

**Pros**:
- Exactly what the Taste draw recommends; no deviations to defend.
- Literata is a single, very readable family.

**Cons**:
- Fog landscapes have nothing to do with Tyson or his work.
- Literata reads calm and essay like, short of the playful tone he asked for.

### Option 2: The split stage, adapted to Tyson (chosen)

Same direction and palette, with the character on a flat field in the fixed half, Young Serif and Source Serif 4, real project screens as imagery, and the stage taking each project's colour.

**Pros**:
- The fixed half becomes the character's home and the stage for the design to code idea.
- Young Serif adds warmth and weight that suit a playful character.
- Per project stage colours carry over the sebg.ch idea Tyson liked.

**Cons**:
- Two families plus a Myanmar face weigh more than one family.
- Each deviation from the sheet must be recorded and held to.

### Option 3: Follow sebg.ch closely

Off white paper, a one page layout with the mascot at the top, device frame mockups, and per project accents.

**Pros**:
- Closest to the reference Tyson named.

**Cons**:
- Copies another designer's identity; a portfolio that looks like someone else's undercuts the point.
- Device frames on paper are a common portfolio pattern and read as template.

### Option 4: Another dealt direction (contact sheet or dark room)

**Pros**:
- Contact sheet shows a lot of process at once; dark room feels premium.

**Cons**:
- Neither gives the character a permanent place; dark room is the least playful.

## Rationale

The split stage was chosen because its fixed half solves the force "a character that stays present" structurally, instead of bolting a mascot onto a scrolling page. Option 1 failed the subject test: fog photographs could belong to anyone, which is exactly what Taste warns against. Option 3 would make Tyson's site read as a copy of the reference.

Within the direction, Tyson chose each detail from live previews: Young Serif over Literata and EB Garamond for warmth, navy on white over studio grey and blush for readability and an easy dark mode, square corners to match the stage's hard edges, deep navy for dark mode to keep the brand at night, and springy motion reserved for the character so reading stays calm. The idea sentence (design becomes code) came from the one thing on his resume few competitors can claim, and it passes Taste's competitor test.

Two values in the dealt palette failed AA in testing (`#6a7186` muted on the surface tone, and a tangerine field ring on a light field) and were corrected to `#646b80` and a navy ring before the choice was made. Cards for other work go against a Taste house rule; Tyson chose them knowingly after seeing both options, so the spec keeps the rule's spirit (square, shadowless, real screens) while honouring his choice.

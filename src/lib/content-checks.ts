import { existsSync, readFileSync } from 'node:fs';
import type { Loader, LoaderContext } from 'astro/loaders';
import { STAGE_INK } from './contrast';

// Checks that compare files within one collection (spec 0003, "Where the checks run").
// They run in Node after the inner loader fills the store, on every build and dev sync, before any page.

type Entry = ReturnType<LoaderContext['store']['values']>[number];
type Check = (entries: Entry[], ctx: LoaderContext) => string[];

/** Wraps a loader; any problems the check returns stop the build as one error. */
export function withChecks(inner: Loader, check: Check): Loader {
  return {
    ...inner,
    load: async (ctx) => {
      await inner.load(ctx);
      const problems = check([...ctx.store.values()], ctx);
      if (problems.length > 0) {
        throw new Error(`Content check failed in "${ctx.collection}":\n${problems.map((p) => `  - ${p}`).join('\n')}`);
      }
    },
  };
}

const where = (entry: Entry) => entry.filePath ?? entry.id;

/** Two entries with the same `order` (drafts included), naming both files. AC-8. */
function duplicateOrders(entries: Entry[]): string[] {
  const seen = new Map<unknown, Entry>();
  const problems: string[] = [];
  for (const entry of entries) {
    const order = entry.data.order;
    const first = seen.get(order);
    if (first) problems.push(`order ${order} is used by both ${where(first)} and ${where(entry)}`);
    else seen.set(order, entry);
  }
  return problems;
}

export const checkCaseStudies: Check = (entries, ctx) => {
  const problems = duplicateOrders(entries);

  // A site case study needs its story below the fields. AC-7.
  for (const entry of entries) {
    if (entry.data.where === 'site' && !entry.body?.trim()) {
      problems.push(`${where(entry)}: a "where: site" case study needs a story below the fields`);
    }
  }

  // AC-11.
  if (!entries.some((entry) => entry.data.where === 'site' && !entry.data.draft)) {
    problems.push('there must be at least one published "where: site" case study in src/content/case-studies/');
  }

  // The contrast check tests STAGE_INK, so it must still match the theme.
  const css = readFileSync(new URL('src/styles/global.css', ctx.config.root), 'utf8').toLowerCase();
  for (const ink of STAGE_INK) {
    if (!new RegExp(`--color-stage-ink:\\s*${ink}\\b`).test(css)) {
      problems.push(`STAGE_INK in src/lib/contrast.ts lists ${ink}, but src/styles/global.css no longer sets --color-stage-ink to it`);
    }
  }

  return problems;
};

export const checkServices: Check = (entries) => duplicateOrders(entries);

// The note shown when a piece opens larger.
export const checkPlayground: Check = (entries) =>
  entries.filter((entry) => !entry.body?.trim()).map((entry) => `${where(entry)}: a playground piece needs a short note below the fields`);

export const checkProfile: Check = (entries, ctx) => {
  const problems: string[] = [];
  const profile = entries.find((entry) => entry.id === 'profile');

  // AC-11.
  if (!profile) problems.push('src/content/profile/profile.md is missing');
  else if (!profile.body?.trim()) problems.push(`${where(profile)}: the profile needs your story below the fields`);

  // Served at RESUME_PATH; never a placeholder, since public/ deploys live. AC-11.
  if (!existsSync(new URL('resume.pdf', ctx.config.publicDir))) problems.push('public/resume.pdf is missing');

  return problems;
};

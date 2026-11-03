import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { checkCaseStudies, checkPlayground, checkProfile, checkServices, withChecks } from './lib/content-checks';
import { contrastRatio, HEX_COLOUR, STAGE_INK } from './lib/contrast';

// Five content collections with strict fields (spec 0003). Pages read them only through src/lib/content.ts.

const text = () => z.string().trim().min(1);
const shortText = () => text().max(160);
const month = () => z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'must be a year and month like 2025-01');

// `#rrggbb`, stored lower case, readable under both stage text colours. AC-5.
const stageColor = z
  .string()
  .regex(HEX_COLOUR, 'must be a six digit hex colour like #1f3a5f')
  .transform((value) => value.toLowerCase())
  .superRefine((value, ctx) => {
    if (!HEX_COLOUR.test(value)) return;
    for (const ink of STAGE_INK) {
      const ratio = contrastRatio(value, ink);
      if (ratio < 4.5) ctx.addIssue({ code: 'custom', message: `${ratio.toFixed(2)}:1 against ${ink}, needs 4.5` });
    }
  });

const caseStudies = defineCollection({
  loader: withChecks(
    glob({
      pattern: '*/index.mdx',
      base: './src/content/case-studies',
      generateId: ({ entry }) => entry.split('/')[0],
    }),
    checkCaseStudies,
  ),
  schema: ({ image }) => {
    const common = z.object({
      title: text(),
      summary: shortText(),
      order: z.number().int().min(1),
      role: text(),
      year: z.number().int().min(2020).max(2100),
      platform: text(),
      duration: text(),
      team: text(),
      context: text(),
      tools: z.array(text()).min(1),
      cover: image(),
      coverAlt: text(),
      stageColor,
      results: z
        .array(z.object({ value: text().max(12), label: text().max(60) }))
        .max(4)
        .optional(),
      screens: z
        .array(
          z.object({
            title: text(),
            design: image(),
            designAlt: text(),
            code: image(),
            codeAlt: text(),
          }),
        )
        .optional(),
      draft: z.boolean().default(false),
    });

    return z.discriminatedUnion('where', [
      common.extend({ where: z.literal('site'), behanceUrl: z.url().optional() }),
      common.extend({ where: z.literal('behance'), behanceUrl: z.url() }),
    ]);
  },
});

const playground = defineCollection({
  loader: withChecks(glob({ pattern: '*.md', base: './src/content/playground' }), checkPlayground),
  schema: ({ image }) =>
    z.object({
      title: text(),
      // YYYY-MM-DD; always format in UTC so the day never shifts.
      date: z.coerce.date(),
      image: image(),
      alt: text(),
      caseStudy: reference('caseStudies').optional(),
      draft: z.boolean().default(false),
    }),
});

const certificates = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/certificates' }),
  schema: ({ image }) =>
    z.object({
      title: text(),
      issuer: text(),
      date: month(),
      image: image(),
      alt: text(),
      honour: text().max(30).optional(),
      draft: z.boolean().default(false),
    }),
});

const services = defineCollection({
  loader: withChecks(glob({ pattern: '*.md', base: './src/content/services' }), checkServices),
  schema: z.object({
    title: text(),
    summary: shortText(),
    order: z.number().int().min(1),
    includes: z.array(text()).min(1),
    steps: z.array(z.object({ title: text().max(60), text: text().max(280) })).min(2),
    examples: z.array(reference('caseStudies')).max(3).optional(),
    draft: z.boolean().default(false),
  }),
});

// Exactly one file. Lists are shown in the order written.
const profile = defineCollection({
  loader: withChecks(glob({ pattern: 'profile.md', base: './src/content/profile' }), checkProfile),
  schema: ({ image }) =>
    z.object({
      name: text(),
      role: text(),
      intro: shortText(),
      availability: text(),
      location: text(),
      email: z.email(),
      links: z.object({ linkedin: z.url(), behance: z.url(), github: z.url() }),
      photo: image(),
      photoAlt: text(),
      experience: z.array(
        z.object({
          role: text(),
          place: text(),
          location: text(),
          start: month(),
          end: month().optional(),
          summary: text().optional(),
        }),
      ),
      education: z.array(
        z.object({
          school: text(),
          degree: text(),
          start: month(),
          end: month().optional(),
          note: text().optional(),
        }),
      ),
      awards: z.array(z.object({ title: text(), issuer: text(), year: z.number().int().min(2000).max(2100) })),
      tools: z.array(text()),
    }),
});

export const collections = { caseStudies, playground, certificates, services, profile };

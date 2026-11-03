import { type CollectionEntry, getCollection, getEntry, type ReferenceDataEntry } from 'astro:content';

// The only way pages read content (spec 0003, "API surface"). It hides drafts on the live
// site, sorts every list, works out links between entries, and checks references.

export type CaseStudy = CollectionEntry<'caseStudies'>;
export type Profile = CollectionEntry<'profile'>;
export type Certificate = CollectionEntry<'certificates'>;
export type Service = CollectionEntry<'services'>;
export type PlaygroundPiece = CollectionEntry<'playground'>;

/** Always public/resume.pdf; the profile loader check fails the build if it is missing. */
export const RESUME_PATH = '/resume.pdf';

// Live build: everything without `draft: true`. `pnpm dev`: everything.
const visible = (entry: { data: { draft: boolean } }) => !import.meta.env.PROD || !entry.data.draft;

const byOrder = (a: { data: { order: number } }, b: { data: { order: number } }) => a.data.order - b.data.order;

// Newest first; equal dates by id A to Z, so the order never changes between builds. AC-12.
const byNewest =
  <T extends { id: string }>(date: (entry: T) => string | number) =>
  (a: T, b: T) => {
    const [da, db] = [date(a), date(b)];
    return da < db ? 1 : da > db ? -1 : a.id.localeCompare(b.id);
  };

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** `2025-11` → `Nov 2025`. */
export function formatMonth(value: string): string {
  const [year, month] = value.split('-');
  return `${MONTHS[Number(month) - 1]} ${year}`;
}

// References between collections, which a loader cannot check because collections load in
// parallel (AC-9). Cached on the live build; in dev it runs on every call so a fixed file shows up.
let checked: Promise<void> | undefined;

async function runReferenceChecks(): Promise<void> {
  // Drafts included: a reference to a draft builds, and resolves to null on the live site.
  const [caseStudies, services, playground] = await Promise.all([
    getCollection('caseStudies'),
    getCollection('services'),
    getCollection('playground'),
  ]);
  const ids = new Set(caseStudies.map((entry) => entry.id));
  const problems: string[] = [];

  for (const piece of playground) {
    const id = piece.data.caseStudy?.id;
    if (id && !ids.has(id)) {
      problems.push(`${piece.filePath}: caseStudy names "${id}", but there is no src/content/case-studies/${id}/`);
    }
  }

  for (const service of services) {
    for (const example of service.data.examples ?? []) {
      if (!ids.has(example.id)) {
        problems.push(`${service.filePath}: examples names "${example.id}", but there is no src/content/case-studies/${example.id}/`);
      }
    }
  }

  if (problems.length > 0) {
    throw new Error(`Content reference check failed:\n${problems.map((p) => `  - ${p}`).join('\n')}`);
  }
}

function checkReferences(): Promise<void> {
  if (!import.meta.env.PROD) return runReferenceChecks();
  checked ??= runReferenceChecks();
  return checked;
}

/** The one profile entry. Its loader check guarantees it exists. */
export async function getProfile(): Promise<Profile> {
  await checkReferences();
  const [profile] = await getCollection('profile');
  return profile;
}

/** Visible case studies, both `where` values, lowest `order` first. */
export async function getCaseStudies(): Promise<CaseStudy[]> {
  await checkReferences();
  return (await getCollection('caseStudies', visible)).sort(byOrder);
}

/** Visible `where: site` case studies, lowest `order` first. */
export async function getSiteCaseStudies(): Promise<CaseStudy[]> {
  return (await getCaseStudies()).filter((entry) => entry.data.where === 'site');
}

/** The next visible site case study, looping round; `null` with only one, or for a Behance, hidden, or unknown id. AC-13. */
export async function getNextCaseStudy(id: string): Promise<CaseStudy | null> {
  const site = await getSiteCaseStudies();
  const index = site.findIndex((entry) => entry.id === id);
  if (index === -1 || site.length < 2) return null;
  return site[(index + 1) % site.length];
}

/** Visible playground pieces, newest first. */
export async function getPlayground(): Promise<PlaygroundPiece[]> {
  await checkReferences();
  return (await getCollection('playground', visible)).sort(byNewest((entry: PlaygroundPiece) => entry.data.date.getTime()));
}

/** The case study a reference points at, or `null` when it is hidden (a draft on the live site). AC-9. */
export async function resolveCaseStudy(ref: ReferenceDataEntry<'caseStudies'>): Promise<CaseStudy | null> {
  await checkReferences();
  const entry = await getEntry(ref);
  return entry && visible(entry) ? entry : null;
}

/** Visible certificates, newest first. */
export async function getCertificates(): Promise<Certificate[]> {
  await checkReferences();
  return (await getCollection('certificates', visible)).sort(byNewest((entry: Certificate) => entry.data.date));
}

/** Visible services, lowest `order` first. */
export async function getServices(): Promise<Service[]> {
  await checkReferences();
  return (await getCollection('services', visible)).sort(byOrder);
}

/** Where a case study card goes. AC-14. */
export function caseStudyHref(entry: CaseStudy): { href: string; external: boolean } {
  return entry.data.where === 'site'
    ? { href: `/work/${entry.id}/`, external: false }
    : { href: entry.data.behanceUrl, external: true };
}

/** A case study card's meta line. AC-14. */
export function caseStudyMeta(entry: CaseStudy): string {
  return `${entry.data.role} · ${entry.data.year}`;
}

import { RESUME_PATH } from '../../lib/content';

// The header menu, in order. Each page adds its own entry when it ships, so the live site
// never links to a missing page.
export type NavItem = {
  label: string;
  href: string;
  /** Opens a file rather than a page; shown with a small "PDF" note. */
  file?: 'PDF';
  /** Umami event name (spec 0001, "Analytics events"). */
  event?: string;
};

export const NAV: NavItem[] = [
  { label: 'Work', href: '/' },
  { label: 'Resume', href: RESUME_PATH, file: 'PDF', event: 'resume-download' },
];

/** True when `href` is the page being shown, so the link can carry aria-current. */
export function isCurrent(href: string, pathname: string): boolean {
  return !href.endsWith('.pdf') && href === pathname;
}

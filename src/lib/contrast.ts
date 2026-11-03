// WCAG 2 contrast ratio, used by the case study `stageColor` check (spec 0003, AC-5).

// Text on the stage field, light then dark. Mirrors `--color-stage-ink` in src/styles/global.css;
// the case study loader check fails if either value goes missing there.
export const STAGE_INK = ['#ffffff', '#f2f2f2'] as const;

export const HEX_COLOUR = /^#[0-9a-f]{6}$/i;

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const n = Number.parseInt(hex.slice(1), 16);
  return 0.2126 * channel((n >> 16) & 0xff) + 0.7152 * channel((n >> 8) & 0xff) + 0.0722 * channel(n & 0xff);
}

/** Unrounded ratio between two `#rrggbb` colours, from 1 to 21. */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

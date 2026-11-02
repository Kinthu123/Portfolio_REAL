// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Production URL, used for canonical links and the sitemap (spec 0001).
  site: 'https://portfolio-real.icedevil196.workers.dev',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  // No visitor sessions; stops the adapter provisioning a KV namespace.
  session: false,

  adapter: cloudflare({
    // Optimize images at build time; every page is prerendered.
    imageService: 'compile',
  }),
  integrations: [mdx()],

  // Downloaded at build time and served from the site; no runtime Google requests (spec 0002).
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Young Serif',
      cssVariable: '--font-young-serif',
      weights: [400],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['Georgia', 'serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Source Serif 4',
      cssVariable: '--font-source-serif',
      weights: [400, 600],
      styles: ['normal', 'italic'],
      subsets: ['latin'],
      fallbacks: ['Georgia', 'serif'],
    },
    {
      // Only Myanmar script; applied through :lang(my) in global.css.
      provider: fontProviders.google(),
      name: 'Noto Sans Myanmar',
      cssVariable: '--font-noto-myanmar',
      weights: [400],
      styles: ['normal'],
      subsets: ['myanmar'],
      fallbacks: ['sans-serif'],
    },
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});

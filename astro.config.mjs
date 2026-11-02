// @ts-check
import { defineConfig } from 'astro/config';

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

  vite: {
    plugins: [tailwindcss()],
  },
});

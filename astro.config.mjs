// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://monogrowl.com',
  integrations: [sitemap()],
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Space Grotesk',
      cssVariable: '--font-body',
      weights: [300, 500, 600],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Big Shoulders Display',
      cssVariable: '--font-display',
      weights: [900],
    },
  ],
});

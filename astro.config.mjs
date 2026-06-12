// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://monogrowl.com",
  integrations: [sitemap()],
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Space Grotesk",
      cssVariable: "--font-body",
      // weight audit (SPEC P5): no rule sets an explicit body weight → 400 only
      weights: [400],
      styles: ["normal"],
      subsets: ["latin"],
    },
    {
      provider: fontProviders.google(),
      name: "Fraunces",
      cssVariable: "--font-serif",
      // weight audit (SPEC P5): serif renders at 300 (display) and 400 (em/labels)
      weights: [300, 400],
      styles: ["normal", "italic"],
      subsets: ["latin"],
    },
    {
      provider: fontProviders.google(),
      name: "JetBrains Mono",
      cssVariable: "--font-mono",
      // weight audit (SPEC P5): 400 default labels, 500 (.section-label, hero b), 600 (.go)
      weights: [400, 500, 600],
      styles: ["normal"],
      subsets: ["latin"],
    },
  ],
});

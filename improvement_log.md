# Monogrowl Site Improvement Log

## 2026-04-20 — Hero entrance animation (Hero.astro)

**What:** Added a staggered fade-up entrance animation to the three hero content elements on page load:

- `.hero-label` ("Artist") — fades up in 0.6s with 0.1s delay
- `.hero-title` ("Monogrowl") — fades up in 0.9s with spring easing (cubic-bezier 0.22,1,0.36,1) and 0.25s delay — the longer, bouncier easing suits the large display type
- `.hero-sub` ("Music · Sheffield | Brooklyn") — fades up in 0.6s with 0.55s delay

Uses a shared `@keyframes hero-fade-up` (opacity 0→1, translateY 18px→0). `prefers-reduced-motion` override disables all three animations. No JS required.

**Also fixed:** The `hero-bg` div was passing the raw `.jpg` URL to CSS `background-image` instead of the `.webp` variant — corrected to use `.replace('.jpg', '.webp')` consistently with the `<picture>` element below it.

**Push status:** Committed locally (dbcc74d) — push requires GitHub credentials on host.

**Features verified intact:** Spotify, Apple Music, SoundCloud, Instagram links; Visualiser (visualiser.monogrowl.com); Press Kit (epk.monogrowl.com); Overflown (2024) and Monogrowl (2018) releases; all section labels and page structure.

## 2026-04-17 — Dark color-scheme declaration + Spotify preconnect (global.scss, Layout.astro)

**What:** Three 1-line additions forming a cohesive performance/rendering improvement:

1. Added `:root { color-scheme: dark; }` to `global.scss`. This tells the browser the page is dark-themed, so native UI elements (scrollbars, form inputs, selection highlights) render in dark mode immediately — no flash of light-mode chrome.

2. Added `<meta name="color-scheme" content="dark">` in `Layout.astro` directly after the viewport meta. The meta tag delivers the same signal at the HTML level, *before* CSS loads, so the browser can apply it even earlier during parse.

3. Added `preconnect` and `dns-prefetch` hints for `open.spotify.com` in Layout.astro. The Spotify artist embed loads from this origin, so pre-warming the DNS+TCP+TLS handshake reduces the time before the embed becomes visible — typically saving 100–300 ms on cold loads.

**Features verified intact:** Spotify, Apple Music, SoundCloud, Instagram links; Visualiser (visualiser.monogrowl.com); Press Kit (epk.monogrowl.com); Overflown (2024) and Monogrowl (2018) releases; all section labels and page structure.

## 2026-04-11 — Footer accessibility + hover polish (Footer.astro)

**What:** Two small changes to `src/components/Footer.astro`:

1. Added `aria-hidden="true"` to the decorative SVG icons in the footer social links. The `<a>` elements already carry `aria-label` attributes, so the SVG path data was redundant noise for screen readers.

2. Added `transform: translateY(-2px)` to the footer icon hover state and included `transform 0.15s` in the transition. This brings the footer icons in line with the subtle lift interaction used on platform buttons and release cards elsewhere on the page.

**Features verified intact:** Spotify, Apple Music, SoundCloud, Instagram links; Visualiser (visualiser.monogrowl.com); Press Kit (epk.monogrowl.com); Overflown (2024) and Monogrowl (2018) releases; all section labels and page structure.

# Quadko Website

Static site (HTML/CSS/vanilla JS, no build step) for Quadko — architecture, interiors, furniture and product design studio.

## ⚠️ Before going live on quadko.com

This repo is currently locked down for a **private client preview** on GitHub Pages. Before pointing the real domain at it (or otherwise launching publicly), undo the preview lockdown:

1. **`robots.txt`** — replace the `Disallow: /` block with the real, commented-out ruleset already sitting in the file below it (just uncomment and delete the temporary block on top).
2. **Every `.html` page** — remove the `<meta name="robots" content="noindex, nofollow">` tag and the `<!-- TEMP (GitHub Pages preview only) -->` comment above it. (Leave `404.html` alone — its noindex tag is permanent and correct.)
3. Re-check `sitemap.xml` and the canonical/`og:url` meta tags still point at `https://quadko.com/` (they already do, this repo's content assumed that domain from the start).
4. Turn off GitHub Pages here (or leave it — doesn't matter once the real host is serving `quadko.com`) after the real domain is live.

Until step 1–2 are done, search engines and AI crawlers are explicitly blocked from indexing this site.

## Local preview

No build step — open `index.html` directly, or serve the folder with any static file server.

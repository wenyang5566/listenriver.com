# Contributing

## Working Rules

- Commit source files only
- Do not commit `public/`
- Keep Hugo templates, CSS, and JS changes scoped and reviewable
- Preserve existing content structure unless a content migration is intentional
- Avoid mixing deployment cleanup with feature work unless necessary

## Before Opening or Merging Changes

Run the site build locally:

```powershell
hugo --destination public-build-check
```

If the Worker changed, also run:

```powershell
cd workers/post-interactions
npm install
npm run check
```

## Content and Frontend Changes

- Keep mobile and desktop behavior intentionally separated when needed
- Verify dark mode when touching visual styles
- Prefer improving reading rhythm, spacing, and navigation without breaking existing article content
- Keep generated output out of git history

### Homepage shared CSS

The homepage uses `assets/css/home-shared.css`, a source asset containing the
applicable rules from `assets/css/extended/custom.css`. Other pages retain the
complete shared stylesheet. The subset preserves rule order, original
declarations, media queries, keyframes, and classes introduced by shared JS.

After changing shared CSS, homepage markup, or shared JS classes, rebuild Hugo
and regenerate the subset before building again:

```powershell
hugo --minify --destination public-build-check
node scripts/subset-home-css.mjs public-build-check/index.html
hugo --minify --destination public-build-check
```

The generator uses Playwright (Edge on Windows, Chromium elsewhere) and PostCSS.
Commit the resulting source CSS, and verify mobile/desktop, light/dark themes,
navigation opening, search, carousel, and gallery controls. Do not derive a
subset solely from initial viewport coverage: hidden and interactive UI needs
its CSS too.

## Deployment Notes

- GitHub Actions validates the repository
- Cloudflare Pages performs the production site build
- The post interaction API is deployed separately from `workers/post-interactions`

Detailed deployment instructions live in [DEPLOYMENT.md](D:/Hugo/listenriver.com/DEPLOYMENT.md).

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

## Deployment Notes

- GitHub Actions validates the repository
- Cloudflare Pages performs the production site build
- The post interaction API is deployed separately from `workers/post-interactions`

Detailed deployment instructions live in [DEPLOYMENT.md](D:/Hugo/listenriver.com/DEPLOYMENT.md).

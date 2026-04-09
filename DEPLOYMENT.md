# Deployment

## Production Architecture

This project deploys in two parts:

1. Cloudflare Pages serves the Hugo site
2. Cloudflare Worker serves article interaction APIs

The site and the Worker are related, but deployed independently.

## Cloudflare Pages

Configure the Pages project with:

- Production branch: `main`
- Framework preset: `Hugo`
- Root directory: `/`
- Build command: `hugo --gc --minify`
- Build output directory: `public`
- Environment variable: `HUGO_VERSION=0.155.2`

Repository expectations:

- Commit source files only
- Do not commit `public/`
- Do not commit `resources/_gen/`
- Do not commit local cache directories such as `.hugo_cache/`
- Let Pages generate `public/sitemap.xml` and the rest of the site output during deployment

Recommended checks:

- The repository connected to Pages is this repo
- `main` is the only production branch unless you intentionally use branch previews
- Submodules are available because the site depends on `themes/PaperMod`
- The repo should not depend on prebuilt local output checked into version control

For local Windows builds, prefer the helper script below when Hugo cannot write to the default user cache directory:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\hugo-build-local.ps1
```

## Cloudflare Worker

Worker location:

- [workers/post-interactions](D:/Hugo/listenriver.com/workers/post-interactions)

Main config:

- [wrangler.jsonc](D:/Hugo/listenriver.com/workers/post-interactions/wrangler.jsonc)

Current runtime expectations:

- `SITE_ORIGIN` should match the production origin
- D1 binding name: `DB`
- D1 migrations directory: `migrations`

Deploy workflow:

```powershell
cd workers/post-interactions
npm install
npm run check
npm run deploy
```

If the schema changed:

```powershell
cd workers/post-interactions
npm run d1:migrate:remote
```

## Hugo Configuration Linkage

The site points to the Worker through:

- [hugo.yaml](D:/Hugo/listenriver.com/hugo.yaml)

Relevant key:

```yaml
params:
  postInteractionsApi: "https://listenriver-post-interactions.wenyang5566.workers.dev"
```

If the Worker URL changes, update that value and redeploy the site.

## Image Workflow

Use this split for article images:

- `old_images/` stores original source images locally and should not be committed
- `content/.../<post>/` stores only the web-ready page bundle images that Hugo will publish

When you import older article images or add new large originals:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\optimize-content-images.ps1
```

That script keeps the originals outside deployment and reduces oversized page bundle images before pushing to `main`.

## Release Checklist

- Run `powershell -ExecutionPolicy Bypass -File .\scripts\cleanup-generated.ps1` if generated output or caches have piled up
- Confirm `git status` is clean except for intentional files
- Run `powershell -ExecutionPolicy Bypass -File .\scripts\audit-aliases.ps1`
- Run `hugo --destination public-build-check`
- If Worker code changed, run `npm run check` in `workers/post-interactions`
- Push source changes to `main`
- Confirm GitHub Actions passes
- Confirm Cloudflare Pages build succeeds
- If Worker changed, confirm Worker deploy succeeds
- Smoke-check article pages, mobile reading layout, dark mode, and interactions

## Alias Maintenance

Use aliases to preserve old URLs after article renames or folder moves.

Keep aliases when they represent:

- an older published slug
- an older section or category path
- a dated historical URL that may already be indexed or shared

Remove aliases when they are clearly noise, such as:

- duplicated category prefixes like `/blog/書摘/書摘...`
- typo slugs created during a move or rename
- accidental duplicate variants that were never intentionally published

Recommended workflow after changing titles or folder structure:

1. Add or keep the real legacy URLs in front matter `aliases`
2. Run `powershell -ExecutionPolicy Bypass -File .\scripts\audit-aliases.ps1`
3. If the report only shows known noise, run `powershell -ExecutionPolicy Bypass -File .\scripts\audit-aliases.ps1 -FixKnownNoise`
4. Rebuild with `hugo --destination public-build-check`
5. After deploy, revalidate in Google Search Console

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

Recommended checks:

- The repository connected to Pages is this repo
- `main` is the only production branch unless you intentionally use branch previews
- Submodules are available because the site depends on `themes/PaperMod`

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

## Release Checklist

- Confirm `git status` is clean except for intentional files
- Run `hugo --destination public-build-check`
- If Worker code changed, run `npm run check` in `workers/post-interactions`
- Push source changes to `main`
- Confirm GitHub Actions passes
- Confirm Cloudflare Pages build succeeds
- If Worker changed, confirm Worker deploy succeeds
- Smoke-check article pages, mobile reading layout, dark mode, and interactions

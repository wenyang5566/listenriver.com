# listenriver.com

Hugo source for `listenriver.com`, deployed from GitHub to Cloudflare.

## Deployment Model

This repository now follows a source-only deployment flow:

- Commit and push source files only.
- Do not commit `public/` build output.
- GitHub Actions validates that the site can build.
- Cloudflare pulls from `main` and runs the production build.

## Cloudflare Pages Settings

Set the Cloudflare Pages project like this:

- Production branch: `main`
- Framework preset: `Hugo`
- Build command: `hugo --gc --minify`
- Build output directory: `public`
- Root directory: `/`
- Environment variable: `HUGO_VERSION=0.155.2`

Because `baseURL` is already set to `https://listenriver.com/` in [hugo.yaml](D:/Hugo/listenriver.com/hugo.yaml), the default build command should stay simple unless you intentionally want preview builds to rewrite absolute URLs.

## GitHub Actions

The repository includes [hugo-build.yml](D:/Hugo/listenriver.com/.github/workflows/hugo-build.yml) for CI validation:

- Builds the Hugo site on pushes and pull requests
- Checks the Cloudflare Worker in `workers/post-interactions`

This workflow validates the repo. It does not deploy the site.

## Local Commands

Build the site:

```powershell
hugo --gc --minify
```

Build to a temporary verification directory:

```powershell
hugo --destination public-build-check
```

## Post Interactions Worker

The article interaction API lives in [workers/post-interactions](D:/Hugo/listenriver.com/workers/post-interactions).

Useful commands:

```powershell
cd workers/post-interactions
npm install
npm run check
```

Deploy the worker when needed:

```powershell
cd workers/post-interactions
npm run deploy
```

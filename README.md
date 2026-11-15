# listenriver.com

Source repository for `listenriver.com`.

This project uses Hugo for the site, GitHub Actions for CI validation, and Cloudflare for production hosting.

## Stack

- Site generator: Hugo `0.160.1` extended
- Theme: PaperMod
- Hosting: Cloudflare Pages
- Site search: Pagefind
- Article interactions: Cloudflare Worker + D1

## Repository Model

This repository follows a source-only deployment model.

- Commit source files only
- Do not commit `public/` output
- Do not commit `resources/_gen/` or local Hugo cache directories
- Let Cloudflare Pages build the site from `main`
- Let GitHub Actions validate builds before or alongside deployment

## Project Structure

- [content](D:/Hugo/listenriver.com/content): articles and pages
- [layouts](D:/Hugo/listenriver.com/layouts): Hugo templates and overrides
- [assets](D:/Hugo/listenriver.com/assets): processed CSS and other asset pipeline files
- [static](D:/Hugo/listenriver.com/static): static files copied as-is
- [workers/post-interactions](D:/Hugo/listenriver.com/workers/post-interactions): article interactions API
- [hugo.yaml](D:/Hugo/listenriver.com/hugo.yaml): site configuration

## Local Development

Build the site:

```powershell
npm run build
```

The build command runs Hugo first, then generates the Pagefind index in
`public/pagefind/`.

Build the site with a workspace-local absolute cache directory:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\hugo-build-local.ps1
```

Run the live article preview on Windows:

```powershell
npm run preview
```

Open `http://localhost:1313/`. Saving an article in Obsidian or VS Code rebuilds
the page automatically. Drafts are included; press Ctrl+C to stop.
Use `npm run preview -- -Port 1314` if port 1313 is occupied.

The Windows helpers use Hugo extended 0.160.1, matching CI, and a project-local
cache. If needed, they download the pinned official binary into ignored `.tmp/`
and verify its published SHA256 checksum (the first run requires internet).
They apply `GODEBUG=asyncpreemptoff=1` only during the local command to avoid
the Windows Go/warpc runtime crash reproduced on this machine. The root
`hugo.exe` is not used. Production build settings remain in `npm run build`.

`npm run build:local` builds Hugo into `public-build-check/`. These helpers do
not generate Pagefind, so they are for article layout and image previews;
use the full production build when validating search.

Clean generated output and local caches:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\cleanup-generated.ps1
```

Build to a temporary verification directory:

```powershell
hugo --destination public-build-check
```

Audit legacy aliases before or after article renames:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\audit-aliases.ps1
```

Remove only the known low-value alias noise:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\audit-aliases.ps1 -FixKnownNoise
```

## CI

GitHub Actions workflow:

- [hugo-build.yml](D:/Hugo/listenriver.com/.github/workflows/hugo-build.yml)

What it checks:

- Hugo site build and Pagefind indexing
- Cloudflare Worker type/config validation

## Deployment

Cloudflare Pages should be configured to:

- Track branch: `main`
- Use framework preset: `Hugo`
- Run build command: `npm run build`
- Publish directory: `public`
- Use environment variable: `HUGO_VERSION=0.160.1`

Cloudflare Pages generates `sitemap.xml`, RSS, JSON, `pagefind/`, and the rest of the deployable output inside `public/` during the build, so those files should not be committed to the repository.

Detailed deployment guidance:

- [DEPLOYMENT.md](D:/Hugo/listenriver.com/DEPLOYMENT.md)

## Worker

The article interactions service lives here:

- [workers/post-interactions](D:/Hugo/listenriver.com/workers/post-interactions)

Worker-specific setup and commands:

- [workers/post-interactions/README.md](D:/Hugo/listenriver.com/workers/post-interactions/README.md)

## Team Workflow

Contributor guidance and day-to-day rules:

- [CONTRIBUTING.md](D:/Hugo/listenriver.com/CONTRIBUTING.md)

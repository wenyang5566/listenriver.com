# Post Interactions Worker

Cloudflare Worker for article `views` and `likes`.

## Endpoints

- `GET /stats?post=/blog/example/`
- `POST /view` with JSON body `{ "post": "/blog/example/" }`
- `POST /like` with JSON body `{ "post": "/blog/example/" }`

## Setup

1. `cd workers/post-interactions`
2. `npm install`
3. `wrangler d1 create listenriver-post-interactions`
4. Put the returned `database_id` into [`wrangler.jsonc`](D:/Hugo/listenriver.com/workers/post-interactions/wrangler.jsonc)
5. `wrangler d1 migrations apply listenriver-post-interactions --remote`
6. `wrangler deploy`

## Hugo integration

Set `params.postInteractionsApi` in [`hugo.yaml`](D:/Hugo/listenriver.com/hugo.yaml) to the deployed Worker URL, for example:

```yaml
params:
  postInteractionsApi: "https://listenriver-post-interactions.<your-subdomain>.workers.dev"
```


## Local validation

Use Node.js 22 or newer, then `npm ci`, `npm run check`, and `npm test`.
`check` runs TypeScript and a Wrangler dry run; it does not deploy. Tests execute
the actual handler and migration against Miniflare's isolated local D1 database.
The lockfile pins the tested CLI and runtime. Windows ARM may need the official
Windows x64 workerd binary under system emulation; local runtime setup stays in
ignored directories. CI uses Linux and does not require that workaround.

`/stats` creates a zero-valued row if missing. The first `/view` or `/like` adds one,
including on a new row. Paths retain encoded interaction keys and optional trailing
slash normalization. Invalid JSON/types/paths return 400; bodies over 8 KiB return
413. Concurrent increments use one SQL upsert. Repeated likes retain the existing
increment behavior; this change does not add a per-user one-like policy.

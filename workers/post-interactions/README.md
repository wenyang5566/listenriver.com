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

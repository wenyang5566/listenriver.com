export interface Env {
  DB: D1Database;
  SITE_ORIGIN?: string;
}

type StatsRow = {
  slug: string;
  views: number;
  likes: number;
  updated_at: string;
};

type JsonBody = {
  post?: unknown;
};

export default {
  async fetch(request, env): Promise<Response> {
    return handleRequest(request, env);
  },
} satisfies ExportedHandler<Env>;

async function handleRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const corsHeaders = buildCorsHeaders(request, env);

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    if (request.method === "GET" && url.pathname === "/stats") {
      const slug = normalizeSlug(url.searchParams.get("post"));
      if (!slug) {
        return json({ error: "Missing post query parameter." }, 400, corsHeaders);
      }

      const stats = await getOrCreateStats(env.DB, slug);
      return json({ slug, views: stats.views, likes: stats.likes }, 200, corsHeaders);
    }

    if (request.method === "POST" && url.pathname === "/view") {
      const slug = normalizeSlug((await readJson(request)).post);
      if (!slug) {
        return json({ error: "Missing post in request body." }, 400, corsHeaders);
      }

      const stats = await incrementCounter(env.DB, slug, "views");
      return json({ slug, views: stats.views, likes: stats.likes }, 200, corsHeaders);
    }

    if (request.method === "POST" && url.pathname === "/like") {
      const slug = normalizeSlug((await readJson(request)).post);
      if (!slug) {
        return json({ error: "Missing post in request body." }, 400, corsHeaders);
      }

      const stats = await incrementCounter(env.DB, slug, "likes");
      return json({ slug, views: stats.views, likes: stats.likes }, 200, corsHeaders);
    }

    return json({ error: "Not found." }, 404, corsHeaders);
  } catch (error) {
    if (error instanceof InputError) return json({ error: error.message }, error.status, corsHeaders);
    return json({ error: "Unable to update article statistics." }, 500, corsHeaders);
  }
}

function buildCorsHeaders(request: Request, env: Env): Headers {
  const origin = request.headers.get("Origin");
  const allowedOrigin = env.SITE_ORIGIN?.trim();
  const responseOrigin = allowedOrigin || origin || "*";

  return new Headers({
    "Access-Control-Allow-Origin": responseOrigin,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Content-Type": "application/json; charset=utf-8",
    Vary: "Origin",
  });
}

class InputError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

async function readJson(request: Request): Promise<JsonBody> {
  if (Number(request.headers.get("Content-Length")) > 8192) throw new InputError("Request body too large.", 413);
  const text = await request.text();
  if (new TextEncoder().encode(text).length > 8192) throw new InputError("Request body too large.", 413);
  let body: unknown;
  try { body = JSON.parse(text); } catch { throw new InputError("Invalid JSON body."); }
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new InputError("Expected a JSON object.");
  return body as JsonBody;
}

function normalizeSlug(value: unknown): string | null {
  if (typeof value !== "string") return null;
  let slug = value.trim();
  if (!slug || slug.length > 2048) return null;
  if (!slug.startsWith("/")) slug = `/${slug}`;
  let decoded: string;
  try { decoded = decodeURIComponent(slug); } catch { return null; }
  if (decoded.startsWith("//") || /[\\?#\s\u0000-\u001f\u007f]/u.test(decoded) || decoded.split("/").some(part => part === "." || part === "..")) return null;
  if (!slug.endsWith("/")) slug = `${slug}/`;
  return slug.length <= 2048 ? slug : null;
}

async function getOrCreateStats(db: D1Database, slug: string): Promise<StatsRow> {
  await db
    .prepare(
      `INSERT INTO post_stats (slug, views, likes)
       VALUES (?1, 0, 0)
       ON CONFLICT(slug) DO NOTHING`
    )
    .bind(slug)
    .run();

  const result = await db
    .prepare(
      `SELECT slug, views, likes, updated_at
       FROM post_stats
       WHERE slug = ?1`
    )
    .bind(slug)
    .first<StatsRow>();

  if (!result) {
    throw new Error("Failed to load stats row.");
  }

  return result;
}

async function incrementCounter(
  db: D1Database,
  slug: string,
  field: "views" | "likes"
): Promise<StatsRow> {
  const column = field === "likes" ? "likes" : "views";

  await db
    .prepare(
      `INSERT INTO post_stats (slug, views, likes)
       VALUES (?1, ${field === "views" ? 1 : 0}, ${field === "likes" ? 1 : 0})
       ON CONFLICT(slug) DO UPDATE SET
         ${column} = post_stats.${column} + 1,
         updated_at = CURRENT_TIMESTAMP`
    )
    .bind(slug)
    .run();

  return getOrCreateStats(db, slug);
}

function json(payload: unknown, status: number, headers: Headers): Response {
  return new Response(JSON.stringify(payload), { status, headers });
}

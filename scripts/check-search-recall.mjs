import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, isAbsolute, normalize, relative, resolve } from 'node:path';
import { chromium } from 'playwright';

const externalTarget = process.argv[2];
const publicRoot = resolve('public');
const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".pf_filter", "application/octet-stream"],
  [".pf_fragment", "application/octet-stream"],
  [".pf_index", "application/octet-stream"],
  [".pf_meta", "application/octet-stream"],
  [".svg", "image/svg+xml"],
  [".wasm", "application/wasm"],
]);

async function startStaticServer() {
  const server = createServer(async (request, response) => {
    try {
      const requestPath = decodeURIComponent(new URL(request.url, "http://127.0.0.1").pathname);
      const relativePath = requestPath.endsWith("/") ? `${requestPath}index.html` : requestPath;
      const filePath = resolve(publicRoot, `.${normalize(relativePath)}`);
      const publicRelativePath = relative(publicRoot, filePath);
      if (publicRelativePath.startsWith("..") || isAbsolute(publicRelativePath)) {
        response.writeHead(403).end("Forbidden");
        return;
      }

      const info = await stat(filePath).catch(() => null);
      if (!info?.isFile()) {
        response.writeHead(404).end("Not found");
        return;
      }

      response.writeHead(200, {
        "Content-Type": mimeTypes.get(extname(filePath)) || "application/octet-stream",
      });
      response.end(await readFile(filePath));
    } catch (error) {
      response.writeHead(500).end(error.message);
    }
  });

  await new Promise((resolveListen) => server.listen(0, "127.0.0.1", resolveListen));
  const address = server.address();
  return {
    origin: `http://127.0.0.1:${address.port}`,
    close: () => new Promise((resolveClose, rejectClose) => {
      server.close((error) => error ? rejectClose(error) : resolveClose());
    }),
  };
}


const fixture = JSON.parse(await readFile('docs/search-recall-cases-2026-10-13.json', 'utf8'));
const output = process.argv[3] || '.tmp/phase-one/search-recall.json';
const localServer = externalTarget ? null : await startStaticServer();
const base = externalTarget || localServer.origin;
let browser;
const results = [];
try {
browser = await chromium.launch(process.platform === 'win32' ? { channel: 'msedge' } : {});
const page = await browser.newPage();
const origin = new URL(base).origin;
await page.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  await page.goto(new URL('/search/', base).href);
  for (const test of fixture.cases) {
    const result = await page.evaluate(async query => {
      const pagefind = await import('/pagefind/pagefind.js');
      const moduleUrl = document.querySelector("[data-search-query-module]").dataset.searchQueryModule;
      const { createExactTitleResolver } = await import(moduleUrl);
      const catalog = JSON.parse(document.getElementById("search-catalog").textContent);
      const response = await pagefind.search(createExactTitleResolver(catalog)(query));
      const data = await Promise.all(response.results.map(item => item.data()));
      return data.map(item => ({ url: decodeURIComponent(new URL(item.url, location.origin).pathname), title: item.meta.title }));
    }, test.query);
    const missing = (test.expectedUrls || []).filter(url => !result.some(item => item.url === url));
    const outsideTop3 = test.top3 ? test.expectedUrls.filter(url => !result.slice(0, 3).some(item => item.url === url)) : [];
    const passed = missing.length === 0 && outsideTop3.length === 0 && (!test.zeroResults || result.length === 0);
    results.push({ query: test.query, kind: test.kind, passed, count: result.length, missing, outsideTop3, top3: result.slice(0, 3) });
    console.log(`${passed ? 'PASS' : 'FAIL'} ${test.query}: ${result.length} results`);
  }
  await mkdir(resolve(output, '..'), { recursive: true });
  await writeFile(output, JSON.stringify({ base, cases: results.length, passed: results.filter(r => r.passed).length, results }, null, 2));
  if (results.some(result => !result.passed)) process.exitCode = 1;
} finally { await browser?.close(); await localServer?.close(); }

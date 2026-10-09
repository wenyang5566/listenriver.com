import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, isAbsolute, normalize, relative, resolve } from "node:path";
import { chromium } from "playwright";

const query = "英雄";
const publicRoot = resolve("public");
const externalTarget = process.argv[2];
const checks = [];
const failures = [];
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

function fail(message) {
  failures.push(message);
}

function toSearchTarget(origin) {
  const url = new URL("/search/", origin);
  url.searchParams.set("q", query);
  return url.toString();
}

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

function watchPage(page) {
  const errors = [];
  const failedPagefind = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      const source = message.location().url || "unknown";
      errors.push(`${message.text()} [source: ${source}]`);
    }
  });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("requestfailed", (request) => {
    if (request.url().includes("/pagefind/")) {
      failedPagefind.push({
        url: request.url(),
        failure: request.failure()?.errorText,
      });
    }
  });

  return { errors, failedPagefind };
}

async function createSearchTestPage(browser, viewport) {
  const page = await browser.newPage({ viewport });

  // Search UX validation must not depend on third-party analytics availability.
  await page.addInitScript(() => {
    Object.defineProperty(Navigator.prototype, "doNotTrack", {
      configurable: true,
      get: () => "1",
    });
  });
  await page.route("https://www.googletagmanager.com/**", (route) => route.fulfill({
    status: 200,
    contentType: "text/javascript",
    body: "",
  }));

  return page;
}

async function waitForRenderedResults(page, label) {
  const input = page.locator(".pagefind-ui__search-input");
  await input.waitFor({ state: "visible", timeout: 15000 });
  await page.waitForFunction((expectedQuery) => {
    const searchInput = document.querySelector(".pagefind-ui__search-input");
    return searchInput?.value === expectedQuery
      && document.querySelectorAll(".pagefind-ui__result-link").length > 0;
  }, query, { timeout: 15000 }).catch((error) => {
    fail(`${label}: Pagefind did not render results for the prefilled query: ${error.message}`);
  });
}

async function inspectSearchPage(page) {
  return page.evaluate(() => {
    const input = document.querySelector(".pagefind-ui__search-input");
    return {
      url: location.href,
      inputValue: input?.value || "",
      inputVisible: input ? Boolean(input.offsetWidth || input.offsetHeight || input.getClientRects().length) : false,
      resultCount: document.querySelectorAll(".pagefind-ui__result").length,
      results: [...document.querySelectorAll(".pagefind-ui__result-link")].slice(0, 3).map((link) => link.textContent.trim()),
      overflow: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
    };
  });
}

function assertSearchPage(check, label) {
  if (check.inputValue !== query) {
    fail(`${label}: expected prefilled query "${query}", got "${check.inputValue}".`);
  }
  if (!check.inputVisible) {
    fail(`${label}: Pagefind search input is not visible.`);
  }
  if (check.resultCount <= 0) {
    fail(`${label}: Pagefind rendered no results.`);
  }
  if (!check.results.length) {
    fail(`${label}: Pagefind rendered no result links.`);
  }
  if (check.overflow > 1) {
    fail(`${label}: search page overflows viewport by ${check.overflow}px.`);
  }
  assertBrowserHealth(check, label);
}

function assertBrowserHealth(check, label) {
  if (check.errors.length) {
    fail(`${label}: browser errors: ${check.errors.join(" | ")}`);
  }
  if (check.failedPagefind.length) {
    fail(`${label}: Pagefind requests failed: ${JSON.stringify(check.failedPagefind)}`);
  }
}

async function waitForQueryParam(page, expectedQuery) {
  await page.waitForFunction((queryValue) => {
    const currentQuery = new URLSearchParams(window.location.search).get("q");
    return queryValue === null ? currentQuery === null : currentQuery === queryValue;
  }, expectedQuery, { timeout: 5000 });
}

async function checkPrefilledSearch(browser, target, name, viewport) {
  const page = await createSearchTestPage(browser, viewport);
  const watched = watchPage(page);

  await page.goto(target, { waitUntil: "load", timeout: 30000 });
  await waitForRenderedResults(page, name);

  const check = {
    flow: "prefilled-search",
    viewport: name,
    ...await inspectSearchPage(page),
    ...watched,
  };
  checks.push(check);
  assertSearchPage(check, `${name} prefilled search`);
  await page.close();
}

async function checkHeaderSearch(browser, origin) {
  const page = await createSearchTestPage(browser, { width: 1280, height: 900 });
  const watched = watchPage(page);
  await page.goto(origin, { waitUntil: "load", timeout: 30000 });

  await page.locator(".header-search-toggle").click();
  const headerInput = page.locator("#header-search-input");
  await headerInput.waitFor({ state: "visible", timeout: 5000 });
  await headerInput.fill(`  ${query}  `);
  await Promise.all([
    page.waitForURL((url) => url.pathname === "/search/" && url.searchParams.get("q") === query, { timeout: 15000 }),
    headerInput.press("Enter"),
  ]);
  await waitForRenderedResults(page, "header search");

  const check = {
    flow: "header-search",
    viewport: "desktop",
    ...await inspectSearchPage(page),
    ...watched,
  };
  checks.push(check);
  assertSearchPage(check, "desktop header search");
  await page.close();
}

async function checkSearchUrlSync(browser, target) {
  const page = await createSearchTestPage(browser, { width: 1280, height: 900 });
  const watched = watchPage(page);
  const updatedQuery = `${query}之旅`;

  await page.goto(target, { waitUntil: "load", timeout: 30000 });
  await waitForRenderedResults(page, "URL sync");

  const input = page.locator(".pagefind-ui__search-input");
  await input.fill(updatedQuery);
  await waitForQueryParam(page, updatedQuery);

  const updatedCheck = {
    flow: "search-url-sync",
    viewport: "desktop",
    ...await inspectSearchPage(page),
    ...watched,
  };
  checks.push(updatedCheck);
  if (updatedCheck.inputValue !== updatedQuery) {
    fail(`desktop URL sync: expected updated query "${updatedQuery}", got "${updatedCheck.inputValue}".`);
  }
  assertBrowserHealth(updatedCheck, "desktop URL sync");

  await page.locator(".pagefind-ui__search-clear").click();
  await waitForQueryParam(page, null);

  const clearedCheck = {
    flow: "clear-search",
    viewport: "desktop",
    ...await inspectSearchPage(page),
    ...watched,
  };
  checks.push(clearedCheck);
  if (clearedCheck.inputValue) {
    fail(`desktop clear search: expected empty query, got "${clearedCheck.inputValue}".`);
  }
  assertBrowserHealth(clearedCheck, "desktop clear search");
  await page.close();
}

async function checkEmptyHeaderSearch(browser, origin) {
  const page = await createSearchTestPage(browser, { width: 1280, height: 900 });
  const watched = watchPage(page);
  await page.goto(origin, { waitUntil: "load", timeout: 30000 });

  await page.locator(".header-search-toggle").click();
  const headerInput = page.locator("#header-search-input");
  await headerInput.waitFor({ state: "visible", timeout: 5000 });
  await headerInput.fill("   ");
  await Promise.all([
    page.waitForURL((url) => url.pathname === "/search/" && !url.searchParams.has("q"), { timeout: 15000 }),
    headerInput.press("Enter"),
  ]);

  const input = page.locator(".pagefind-ui__search-input");
  await input.waitFor({ state: "visible", timeout: 15000 });
  const check = {
    flow: "empty-header-search",
    viewport: "desktop",
    ...await inspectSearchPage(page),
    ...watched,
  };
  checks.push(check);
  if (check.inputValue) {
    fail(`desktop empty header search: expected empty query, got "${check.inputValue}".`);
  }
  assertBrowserHealth(check, "desktop empty header search");
  await page.close();
}

async function checkSeriesEntries(browser, origin) {
  for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
    const page = await createSearchTestPage(browser, viewport);
    for (const [name, section] of [["工作日誌", "工作日誌"], ["實習紀錄", "實習紀錄"], ["工作手冊", "工作手冊"], ["會所工作日誌", "工作日誌"], ["會所實習", "實習紀錄"], ["會所工作手冊", "工作手冊"]]) {
      const target = new URL("/search/", origin);
      target.searchParams.set("q", name);
      await page.goto(target.toString());
      const entry = page.locator("#search-series li:visible");
      await entry.waitFor({ state: "visible" });
      if (await entry.count() !== 1) fail(`Expected one series entry for ${name}.`);
      const href = await entry.locator("a").getAttribute("href");
      if (decodeURI(href) !== `/clubhouse/${section}/`) fail(`Wrong series destination for ${name}.`);
      if (!(await entry.innerText()).match(/（[1-9][0-9]* 篇）/)) fail(`Missing series count for ${name}.`);
      const response = await page.request.get(new URL(href, origin).toString());
      if (response.status() !== 200) fail(`Series destination failed for ${name}.`);
    }
    const input = page.locator(".pagefind-ui__search-input");
    await input.fill("英雄");
    await page.locator("#search-series").waitFor({ state: "hidden" });
    await input.fill("會所");
    await page.locator("#search-series").waitFor({ state: "visible" });
    if (await page.locator("#search-series li:visible").count() !== 3) fail("Expected all three clubhouse series.");
    await page.locator(".pagefind-ui__search-clear").click();
    await page.locator("#search-series").waitFor({ state: "hidden" });
    await page.close();
  }
  checks.push({ flow: "complete-series-entries", viewports: ["desktop", "mobile"], passed: true });
}

const localServer = externalTarget ? null : await startStaticServer();
const origin = localServer?.origin || new URL(externalTarget).origin;
const target = externalTarget || toSearchTarget(origin);
const browser = await chromium.launch({ headless: true });

try {
  await checkPrefilledSearch(browser, target, "desktop", { width: 1280, height: 900 });
  await checkPrefilledSearch(browser, target, "mobile", { width: 390, height: 844 });
  await checkHeaderSearch(browser, origin);
  await checkSearchUrlSync(browser, target);
  await checkEmptyHeaderSearch(browser, origin);
  await checkSeriesEntries(browser, origin);
} finally {
  await browser.close();
  await localServer?.close();
}

console.log(JSON.stringify(checks, null, 2));

if (failures.length) {
  throw new Error(`Search UX validation failed:\n- ${failures.join("\n- ")}`);
}

console.log(`Validated search prefill, results, URL sync, clear query, and header redirects for "${query}".`);

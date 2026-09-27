// Read-only production audit. Run explicitly after deployment, not during builds.
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';

const origin = 'https://listenriver.com';
const oldPath = '/categories/閱讀與筆記';
const newPath = '/categories/閱讀筆記/';
const rules = (await readFile(new URL('../static/_redirects', import.meta.url), 'utf8'))
  .split(/\r?\n/).filter(line => line.startsWith(oldPath)).map(line => line.trim().split(/\s+/));
assert.equal(rules.length, 40, 'Review the migration coverage if the redirect inventory changes.');
const report = { checkedAt: new Date().toISOString(), origin, redirects: [], pages: [], failures: [] };

async function request(path) {
  const response = await fetch(new URL(path, origin), {
    redirect: 'manual', signal: AbortSignal.timeout(20000),
  });
  const body = await response.text();
  return { response, body };
}

function pathOf(value) {
  const url = new URL(value, origin);
  assert.equal(url.origin, origin, 'Unexpected external destination');
  return decodeURI(url.pathname);
}

// Keep concurrency modest and record every failure instead of stopping early.
async function checkAll(items, check) {
  let cursor = 0;
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (cursor < items.length) {
      const item = items[cursor++];
      try { await check(item); }
      catch (error) { report.failures.push({ item, error: error.message }); }
    }
  }));
}

await checkAll(rules, async ([source, target, code]) => {
  assert.equal(code, '301');
  const { response } = await request(source);
  const location = response.headers.get('location');
  report.redirects.push({ source, status: response.status, location });
  assert.equal(response.status, 301, source);
  assert.ok(location, `Missing Location: ${source}`);
  assert.equal(pathOf(location), target, `Wrong destination: ${source}`);
});

const targets = [...new Set(rules.map(([, target]) => target))];
await checkAll(targets, async target => {
  const { response } = await request(target);
  report.pages.push({ target, status: response.status });
  assert.equal(response.status, 200, `Destination must be directly accessible: ${target}`);
});

function attributes(tag) {
  const values = {};
  for (const match of tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)) {
    values[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4];
  }
  return values;
}

await checkAll(['category', 'sitemap', 'rss'], async kind => {
  const path = kind === 'category' ? newPath : kind === 'sitemap' ? '/sitemap.xml' : `${newPath}index.xml`;
  const { response, body } = await request(path);
  assert.equal(response.status, 200);
  if (kind === 'category') {
    const links = [...body.matchAll(/<link\b[^>]*>/gi)].map(([tag]) => attributes(tag));
    const meta = [...body.matchAll(/<meta\b[^>]*>/gi)].map(([tag]) => attributes(tag));
    const canonical = links.find(link => link.rel === 'canonical')?.href;
    assert.ok(canonical, 'Missing canonical');
    assert.equal(pathOf(canonical), newPath);
    assert.equal(pathOf(meta.find(item => item.property === 'og:url')?.content), newPath);
    assert.ok(!/noindex/i.test(meta.find(item => item.name === 'robots')?.content || ''));
  } else if (kind === 'sitemap') {
    const locations = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => pathOf(url));
    assert.ok(locations.includes(newPath), 'New category missing from sitemap');
    assert.ok(!locations.some(url => url.startsWith(oldPath)), 'Old category remains in sitemap');
  } else {
    assert.match(body, /<rss\b/, 'Expected RSS');
    const urls = [...body.matchAll(/<link>([^<]+)<\/link>/g)].map(([, url]) => pathOf(url));
    assert.ok(urls.includes(newPath), 'RSS missing new category URL');
    assert.ok(!urls.some(url => url.startsWith(oldPath)), 'RSS still references old category URL');
  }
});

const output = `${JSON.stringify(report, null, 2)}\n`;
if (process.argv[2]) await writeFile(process.argv[2], output);
console.log(`Live migration: ${report.redirects.length} redirects, ${report.pages.length} destinations, ${report.failures.length} failures.`);
for (const failure of report.failures) console.error(JSON.stringify(failure));
if (report.failures.length) process.exitCode = 1;

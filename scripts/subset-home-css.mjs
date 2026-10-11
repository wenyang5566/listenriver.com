import { readFile, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import postcss from 'postcss';

// Run after building the homepage: node scripts/subset-home-css.mjs <index.html>
// Retain rules for homepage markup and classes introduced by its shared JS.
const html = await readFile(process.argv[2] || 'public/index.html', 'utf8');
const css = (await readFile('assets/css/extended/custom.css', 'utf8')).replace(/\r\n/g, '\n');
const js = await readFile('static/js/custom.js', 'utf8');
const dynamic = [...js.matchAll(/classList\.(?:add|remove|toggle|replace)\(\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
for (const match of js.matchAll(/class=["']([^"']+)["']/g)) dynamic.push(...match[1].split(/\s+/));
dynamic.push('reader-lightbox');
const browser = await chromium.launch(process.platform === 'win32' ? { channel: 'msedge' } : {});
try {
  const page = await browser.newPage();
  const inventory = await page.evaluate(({ html, dynamic }) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const classes = new Set(dynamic);
    const ids = new Set();
    for (const el of doc.querySelectorAll('*')) {
      for (const name of el.classList) classes.add(name);
      if (el.id) ids.add(el.id);
    }
    return { classes: [...classes], ids: [...ids] };
  }, { html, dynamic });
  const classes = new Set(inventory.classes), ids = new Set(inventory.ids);
  const possible = selector => {
    // Keep functional alternatives and escaped selectors conservatively.
    if (/:(?:is|where|has)\(|\\/.test(selector)) return true;
    const positive = selector.replace(/:not\([^)]*\)/g, '');
    return [...positive.matchAll(/\.([a-zA-Z_][\w-]*)/g)].every(m => classes.has(m[1]))
      && [...positive.matchAll(/#([a-zA-Z_][\w-]*)/g)].every(m => ids.has(m[1]));
  };
  const root = postcss.parse(css);
  let kept = 0, removed = 0;
  root.walkRules(rule => {
    // Animation frames are not DOM selectors.
    if (rule.parent.type === 'atrule' && /keyframes$/i.test(rule.parent.name)) return;
    if (rule.selectors.some(possible)) kept++;
    else { removed++; rule.remove(); }
  });
  root.walkComments(comment => comment.remove());
  // Remove empty conditional containers while preserving declarations verbatim.
  root.walkAtRules(rule => { if (rule.nodes?.length === 0) rule.remove(); });
  const output = '/* Generated from extended/custom.css by scripts/subset-home-css.mjs. */\n' + root.toString().trim() + '\n';
  if (process.argv.includes('--check')) {
    const existing = (await readFile('assets/css/home-shared.css', 'utf8')).replace(/\r\n/g, '\n');
    if (existing !== output) throw new Error('Homepage shared CSS is stale. Run node scripts/subset-home-css.mjs with the built index.html, then rebuild.');
  } else {
    await writeFile('assets/css/home-shared.css', output);
  }
  console.log(JSON.stringify({ kept, removed, bytes: Buffer.byteLength(output) }));
} finally {
  await browser.close();
}

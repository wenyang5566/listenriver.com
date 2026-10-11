import { test, expect } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
const groups = ['工作日誌', '實習紀錄', '工作手冊'].map(name => {
  const root = join('content', 'clubhouse', name);
  const items = readdirSync(root, { withFileTypes: true }).filter(d => d.isDirectory()).flatMap(d => {
    const text = readFileSync(join(root, d.name, 'index.md'), 'utf8');
    const label = text.match(/^seriesLabel:\s*(.+)\s*$/m)?.[1].trim();
    return label && !/^draft:\s*true\s*$/m.test(text) ? [{ number: Number(label.match(/\d+$/)[0]), url: `/clubhouse/${name}/${d.name.toLowerCase().replace(/[、，]/g, "")}/` }] : [];
  }).sort((a,b) => a.number-b.number);
  return {name, items};
});
for (const {name, items} of groups) {
  test(`${name}: every article has the correct ordered neighbors and directory`, async ({ request }) => {
    for (const [i,item] of items.entries()) {
      const response = await request.get(item.url);
      expect(response.ok()).toBe(true);
      const html = await response.text();
      const nav = html.match(/<nav class=.?post-series-nav[\s\S]*?<\/nav>/)?.[0];
      expect(nav).toBeTruthy();
      const previous = nav.match(/data-series-previous[^>]*href=(["']?)([^\s>"']+)/)?.[2];
      const next = nav.match(/data-series-next[^>]*href=(["']?)([^\s>"']+)/)?.[2];
      expect(previous && decodeURI(previous)).toBe(items[i-1]?.url);
      expect(next && decodeURI(next)).toBe(items[i+1]?.url);
      expect(nav).toContain(`回到${name}目錄`);
      if (!i) expect(nav).toContain('這是系列第一篇');
      if (i === items.length-1) expect(nav).toContain('已讀到系列最新一篇');
    }
  });
}
test.beforeEach(async ({request}, info) => {
  if (!info.title.includes('every article')) {
    const index = await request.get('/pagefind/pagefind.js');
    test.skip(!index.ok(), 'Search checks require a complete Hugo + Pagefind build.');
  }
});
for (const width of [390,1440]) for (const theme of ['light','dark']) {
  test(`search and series reading at ${width}px ${theme}`, async ({page}) => {
    await page.setViewportSize({width,height:900});
    await page.addInitScript(t=>localStorage.setItem('pref-theme',t),theme);
    await page.goto('/search/?q='+encodeURIComponent('正念的意義就在手中'));
    const result=page.locator('.pagefind-ui__result').first();
    await expect(result).toBeVisible();
    await expect(result.locator('.pagefind-ui__result-title')).toContainText('正念的意義就在手中');
    await expect(result.locator('.search-result-meta')).toBeVisible();
    const excerpt=await result.locator('.pagefind-ui__result-excerpt').evaluate(el=>{const clone=el.cloneNode(true);clone.querySelector('.search-result-meta')?.remove();return clone.textContent;});
    expect(excerpt).not.toMatch(/分鐘閱讀|文揚|目錄|回頂端|#/);
    await page.screenshot({path:`.tmp/discovery-search-${width}-${theme}.png`,fullPage:true});
    const input=page.locator('.pagefind-ui__search-input');
    await input.fill('龘齉麤鱻');
    await expect(page.locator('.pagefind-ui__message')).toContainText(/沒有|找不到|無/);
    await input.fill('英雄之旅');
    await expect(page.locator('.pagefind-ui__result').first()).toBeVisible();
    await expect(page).toHaveURL(/q=/);
    await page.getByRole('button',{name:'清除',exact:true}).click();
    await expect(input).toHaveValue('');
    await expect(page).toHaveURL(/\/search\/$/);
    await page.goto(groups[0].items[1].url);
    const nav=page.locator('.post-series-nav');
    await nav.scrollIntoViewIfNeeded();
    await expect(nav).toBeVisible();
    const inset=await nav.locator('.post-series-heading').boundingBox();
    expect(inset.x).toBeGreaterThanOrEqual(20);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
    await page.screenshot({path:`.tmp/discovery-series-${width}-${theme}.png`});
    await nav.locator('[data-series-next]').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.post-series-nav')).toHaveAttribute('data-series-number','3');
  });
}
test('metadata remains searchable and series links work without JavaScript',async({browser,page})=>{
  await page.goto('/search/?q='+encodeURIComponent('英雄之旅'));
  await expect(page.locator('.pagefind-ui__result').first()).toBeVisible();
  const cases = await page.evaluate(async()=>{
    const pf=await import('/pagefind/pagefind.js');
    const out=[];
    for(const q of ['英雄之旅','病痛經驗','工作日誌 05','正念的河流']){
      const search=await pf.search(q);
      const data=await Promise.all(search.results.slice(0,5).map(r=>r.data()));
      out.push({q,count:search.results.length,titles:data.map(d=>d.meta.title)});
    }
    return out;
  });
  for(const result of cases) expect(result.count,result.q).toBeGreaterThan(0);
  expect(cases[2].titles.join(' ')).toContain('工作日誌 05');
  const context=await browser.newContext({javaScriptEnabled:false,baseURL:new URL(page.url()).origin});
  const staticPage=await context.newPage();
  await staticPage.goto(groups[2].items[0].url);
  await staticPage.locator('[data-series-next]').click();
  await expect(staticPage.locator('.post-series-nav')).toHaveAttribute('data-series-number','2');
  await context.close();
});


for (const width of [390,1440]) {
  test(`search restores query and reading position after returning at ${width}px`,async({page})=>{
    await page.setViewportSize({width,height:700});
    await page.goto('/search/?q='+encodeURIComponent('英雄之旅'));
    const result=page.locator('.pagefind-ui__result').nth(1);
    await expect(result).toBeVisible();
    await result.scrollIntoViewIfNeeded();
    const position=await page.evaluate(()=>scrollY);
    await result.locator('a').first().click();
    await expect(page.locator('.post-title')).toBeVisible();
    await page.goBack({waitUntil:'load'});
    await expect(page.locator('.pagefind-ui__search-input')).toHaveValue('英雄之旅');
    await expect(page.locator('.pagefind-ui__result').nth(1)).toBeVisible();
    await expect.poll(()=>page.evaluate(y=>Math.abs(scrollY-y),position)).toBeLessThan(12);
  });
}

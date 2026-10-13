import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
const entries=JSON.parse(readFileSync(new URL('../data/editorial-articles.json',import.meta.url),'utf8'));
const starts=JSON.parse(readFileSync(new URL('../data/category-starts.json',import.meta.url),'utf8'));
test.beforeEach(async({page,baseURL})=>{await page.route('**/*',route=>new URL(route.request().url()).origin===new URL(baseURL).origin?route.continue():route.abort());});
test('all twelve editorial introductions preserve one primary continuation',async({page})=>{
 for(const entry of entries){
  await page.goto(entry.page);
  await expect(page.locator('.article-introduction')).toHaveText(entry.intro);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('#related-posts')).toHaveCount(1);
  if(entry.coverAlt){await expect(page.locator('.entry-cover img')).toHaveAttribute('alt',entry.coverAlt);await expect(page.locator('.entry-cover figcaption')).not.toBeEmpty();}
  else await expect(page.locator('.entry-cover')).toHaveCount(0);
  if(entry.next){await expect(page.locator('[data-editorial-next] > p').last()).toHaveText(entry.reason);expect(decodeURIComponent(await page.locator('[data-editorial-next] .reading-path-next-article').getAttribute('href'))).toBe(entry.next);}
 }
});
test('five categories expose their original fifteen choices before the article list',async({page})=>{
 for(const [category,items] of Object.entries(starts)){
  await page.goto('/categories/'+category+'/');
  const section=page.locator('[data-category-starts]');await expect(section).toHaveCount(1);
  await expect(section.locator('li')).toHaveCount(3);
  for(let i=0;i<items.length;i++){expect(decodeURIComponent(await section.locator('li').nth(i).locator('a').getAttribute('href'))).toBe(items[i][1]);await expect(section.locator('li').nth(i).locator('p')).toHaveText(items[i][2]);}
  expect(await section.evaluate(node=>{const list=document.querySelector('.post-entry,.taxonomy-story-card,.taxonomy-post-card');return !list||Boolean(node.compareDocumentPosition(list)&Node.DOCUMENT_POSITION_FOLLOWING);})).toBe(true);
 }
});
for(const width of [390,1440])for(const theme of ['light','dark'])test('shared exits '+width+' '+theme,async({page})=>{
 await page.setViewportSize({width,height:900});await page.addInitScript(t=>localStorage.setItem('pref-theme',t),theme);
 for(const url of ['/','/blog/','/categories/','/categories/病痛經驗/','/tags/','/clubhouse/','/about/','/reading-paths/','/404.html']){
  await page.goto(url);const footer=page.locator('footer.publication-footer');await expect(page.locator('footer.footer')).toHaveCount(0);await expect(footer).toHaveCount(1);await expect(footer).toHaveClass(/publication-footer/);
  await expect(footer.getByRole('navigation',{name:'頁尾導覽'}).getByRole('link')).toHaveCount(4);
  await footer.scrollIntoViewIfNeeded();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(await footer.locator('nav a').evaluateAll(nodes=>nodes.every(n=>n.getBoundingClientRect().height>=44))).toBe(true);
 }
});
test('global motion pause also pauses gallery and manual navigation updates caption',async({page})=>{
 await page.addInitScript(()=>sessionStorage.setItem('river-motion-paused','true'));
 await page.goto('/');const gallery=page.locator('.home-gallery-section');await gallery.scrollIntoViewIfNeeded();
 await expect(gallery).toHaveAttribute('data-gallery-playing','false');
 const first=await page.locator('[data-gallery-caption-output]').textContent();
 await page.waitForTimeout(3300);await expect(page.locator('[data-gallery-caption-output]')).toHaveText(first);
 await page.locator('[data-gallery-next]').click();
 await expect(page.locator('[data-gallery-caption-output]')).toHaveText('屋頂、雕像與藍天。');
 await expect(page.locator('[data-gallery-dot="1"]')).toHaveClass(/is-active/);
 await expect(gallery).toHaveAttribute('data-gallery-playing','false');
});
test('legacy homepage pagination is an identified archive preserving its historical canonical',async({page})=>{
 await page.goto('/page/2/');await expect(page.getByRole('heading',{level:1})).toHaveText('文章存檔 · 第 2 頁');await expect(page).toHaveTitle(/文章存檔 · 第 2 頁/);await expect(page.locator('meta[name=robots]')).toHaveAttribute('content','noindex, follow');expect(new URL(await page.locator('link[rel=canonical]').getAttribute('href')).pathname).toBe('/');
});
test('corrected legacy body headings retain their anchors',async({page})=>{
 for(const url of ['/blog/助人工作/北監酒駕班後記/','/blog/成為自己/傾聽自己是善待自己的方法/']){await page.goto(url);await expect(page.locator('h1')).toHaveCount(1);expect(await page.locator('.post-content h2[id]').count()).toBeGreaterThan(0);}
});

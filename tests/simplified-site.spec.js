import {test,expect} from '@playwright/test';
const pages=['/','/about/','/blog/','/categories/','/categories/病痛經驗/','/tags/','/clubhouse/','/404.html'];
const articles=['/blog/病痛經驗/關於自我揭露/','/blog/閱讀心得/聆聽疼痛/','/blog/開放式對話/肯認每一種聲音的存在/','/clubhouse/工作日誌/07白板溝通/','/blog/成為自己/正念的意義就在手中/','/blog/成為自己/最大的自由是承擔/','/blog/成為自己/不為而成/','/blog/素描/03繼續負形/','/blog/電影心得/綠洲/','/blog/助人工作/創傷知情工作坊心得/','/clubhouse/實習紀錄/06如實/','/blog/聆聽疼痛計畫/00撿拾疼痛的碎片/'];
test.beforeEach(async({page,baseURL})=>{await page.route('**/*',r=>new URL(r.request().url()).origin===new URL(baseURL).origin?r.continue():r.abort());});
for(const width of [390,1440])for(const theme of ['light','dark'])test('simple exits '+width+' '+theme,async({page})=>{
 await page.setViewportSize({width,height:900});await page.addInitScript(t=>localStorage.setItem('pref-theme',t),theme);
 for(const path of pages){await page.goto(path);await expect(page.locator('[data-reading-path-entry],a[href*="reading-paths"],.category-starts')).toHaveCount(0);
 const footer=page.locator('footer.publication-footer');await expect(footer).toHaveCount(1);await expect(footer.locator('nav a')).toHaveText(['所有文章','文章分類','關於文揚']);await expect(footer.locator('.river-footer-brand')).toHaveCount(0);
 await footer.scrollIntoViewIfNeeded();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
});
test('twelve articles retain native reading and recommendations without editorial overlays',async({page})=>{
 for(const path of articles){await page.goto(path);await expect(page.locator('.post-content')).not.toBeEmpty();await expect(page.locator('h1')).toHaveCount(1);
 await expect(page.locator('.article-introduction,[data-reading-path-next],[data-editorial-next]')).toHaveCount(0);await expect(page.locator('#related-posts')).toHaveCount(1);}
 await page.goto('/clubhouse/工作日誌/07白板溝通/');await expect(page.locator('.post-series-nav')).toHaveCount(1);
});
test('five categories keep their existing article lists without a second curated entry system',async({page})=>{
 for(const name of ['成為自己','日常札記','病痛經驗','助人工作','閱讀筆記']){await page.goto('/categories/'+name+'/');await expect(page.getByRole('heading',{level:1})).toContainText(name);await expect(page.locator('[data-category-starts],.reading-path-entry')).toHaveCount(0);expect(await page.locator('main a[href*="/blog/"],main a[href*="/clubhouse/"]').count()).toBeGreaterThan(0);}
});
for(const width of [390,1440])test('gallery remains captionless, paused and manually operable at '+width,async({page})=>{
 await page.setViewportSize({width,height:900});await page.addInitScript(()=>sessionStorage.setItem('river-motion-paused','true'));await page.goto('/');
 const gallery=page.locator('.home-gallery-section');await gallery.scrollIntoViewIfNeeded();await expect(gallery).toHaveAttribute('data-gallery-playing','false');await expect(gallery.locator('[data-gallery-caption-output],figcaption,.home-gallery-caption')).toHaveCount(0);
 await expect(gallery.locator('[data-gallery-dot]')).toHaveCount(10);expect(await gallery.locator('[data-gallery-dot]').evaluateAll(items=>items.every(i=>i.getBoundingClientRect().height>=44))).toBe(true);
 await page.waitForTimeout(3200);await expect(gallery.locator('[data-gallery-dot="0"]')).toHaveClass(/is-active/);await gallery.locator('[data-gallery-next]').click();await expect(gallery.locator('[data-gallery-dot="1"]')).toHaveClass(/is-active/);await expect(gallery).toHaveAttribute('data-gallery-playing','false');
});
test('unpublished path output is removed and simple links work without JavaScript',async({browser,baseURL,request})=>{
 expect((await request.get('/reading-paths/')).status()).toBe(404);
 const context=await browser.newContext({baseURL,javaScriptEnabled:false,viewport:{width:390,height:900}});const page=await context.newPage();await page.route('**/*',r=>new URL(r.request().url()).origin===new URL(baseURL).origin?r.continue():r.abort());
 await page.goto('/');await page.locator('footer.publication-footer').getByRole('link',{name:'所有文章'}).click();await expect(page).toHaveURL(/\/blog\/$/);
 await page.goto(articles[4]);await expect(page.locator('[data-mobile-reading-toolbar]')).toBeHidden();await expect(page.locator('#related-posts a').first()).toHaveAttribute('href',/blog|clubhouse/);await context.close();
});
test('legacy archive retains an explicit page title and historical canonical',async({page})=>{
 await page.goto('/page/2/');await expect(page.getByRole('heading',{level:1})).toHaveText('文章存檔 · 第 2 頁');await expect(page.locator('meta[name=robots]')).toHaveAttribute('content','noindex, follow');expect(new URL(await page.locator('link[rel=canonical]').getAttribute('href')).pathname).toBe('/');
});
test('corrected legacy headings still have a single page title',async({page})=>{
 for(const path of ['/blog/助人工作/北監酒駕班後記/','/blog/成為自己/傾聽自己是善待自己的方法/']){await page.goto(path);await expect(page.locator('h1')).toHaveCount(1);expect(await page.locator('.post-content h2[id]').count()).toBeGreaterThan(0);}
});

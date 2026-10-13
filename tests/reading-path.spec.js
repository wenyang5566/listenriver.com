import { test, expect } from '@playwright/test';
const articles=[
  '/blog/病痛經驗/關於自我揭露/',
  '/blog/閱讀心得/聆聽疼痛/',
  '/blog/開放式對話/肯認每一種聲音的存在/',
  '/clubhouse/工作日誌/07白板溝通/'
];
const overflow=page=>page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
const localOnly=(page,baseURL)=>page.route('**/*',route=>new URL(route.request().url()).origin===new URL(baseURL).origin?route.continue():route.abort());
for(const width of [390,1440])for(const theme of ['light','dark'])test(`complete reading path at ${width}px ${theme}`,async({page,baseURL})=>{
  await page.setViewportSize({width,height:900});
  await localOnly(page,baseURL);
  await page.addInitScript(theme=>localStorage.setItem('pref-theme',theme),theme);
  await page.goto('/');
  await expect(page.locator('[data-reading-path-entry]')).toBeVisible();
  await page.locator('[data-reading-path-entry]').click();
  await expect(page).toHaveURL(/\/reading-paths\/$/);
  await expect(page.getByRole('heading',{level:1})).toHaveText('病痛，如何被聽見？');
  await expect(page.locator('[data-path-node]')).toHaveCount(4);
  expect(await page.locator('[data-reading-path-article]').evaluateAll(nodes=>nodes.map(n=>decodeURIComponent(new URL(n.href).pathname)))).toEqual(articles);
  expect(await overflow(page)).toBe(false);
  await page.screenshot({path:`.tmp/phase-three/screenshots/path-${width}-${theme}.png`,fullPage:true});
  await page.locator('[data-reading-path-start]').focus();
  await page.keyboard.press('Enter');
  for(let i=0;i<articles.length;i++){
    await expect.poll(()=>decodeURIComponent(new URL(page.url()).pathname)).toBe(articles[i]);
    const next=page.locator('[data-reading-path-next]');
    await next.scrollIntoViewIfNeeded();
    await expect(next).toHaveAttribute('data-path-number',String(i+1));
    await expect(page.locator('.post-related-list')).toHaveCount(0);
    expect(await overflow(page)).toBe(false);
    if(width===390)await expect(page.locator('[data-mobile-reading-related]')).toBeEnabled();
    if(i<articles.length-1){
      await expect(next.locator('[data-reading-path-continue]')).toHaveCount(1);
      await expect(next.locator('h2 + p')).not.toHaveText('');
      await next.locator('[data-reading-path-continue]').click();
    }else{
      await expect(next.locator('[data-reading-path-continue]')).toHaveCount(0);
      await expect(page.locator('.post-series-nav')).toBeVisible();
      await next.screenshot({path:`.tmp/phase-three/screenshots/ending-${width}-${theme}.png`});
      await next.locator('[data-reading-path-return]').click();
    }
  }
  await expect(page).toHaveURL(/\/reading-paths\/$/);
});
for(const width of [320,820])for(const theme of ['light','dark'])test(`reading path fits ${width}px ${theme}`,async({page,baseURL})=>{
  await page.setViewportSize({width,height:900});await localOnly(page,baseURL);
  await page.addInitScript(theme=>localStorage.setItem('pref-theme',theme),theme);
  await page.goto('/reading-paths/');
  expect(await overflow(page)).toBe(false);
  await page.evaluate(()=>{
    const sizes=[...document.querySelectorAll('.reading-path-page :is(h1,h2,p,a,span)')].map(element=>({element,size:parseFloat(getComputedStyle(element).fontSize)}));
    sizes.forEach(({element,size})=>{element.style.fontSize=(size*2)+'px';});
  });
  expect(await overflow(page)).toBe(false);
});
for(const width of [390,1440])test(`reading path remains complete without JavaScript at ${width}px`,async({browser,baseURL})=>{
  const context=await browser.newContext({javaScriptEnabled:false,baseURL,viewport:{width,height:900}});
  const page=await context.newPage();await localOnly(page,baseURL);await page.goto('/');
  await page.locator('[data-reading-path-entry]').click();
  await page.locator('[data-reading-path-start]').click();
  for(let i=0;i<articles.length-1;i++){
    await expect.poll(()=>decodeURIComponent(new URL(page.url()).pathname)).toBe(articles[i]);
    await expect(page.locator('[data-mobile-reading-toolbar]')).toBeHidden();
    await page.locator('[data-reading-path-continue]').click();
  }
  await expect.poll(()=>decodeURIComponent(new URL(page.url()).pathname)).toBe(articles[3]);
  await page.locator('[data-reading-path-return]').click();
  await expect(page).toHaveURL(/\/reading-paths\/$/);
  await context.close();
});
test('reading path respects reduced motion and stays outside the prototype search index',async({page,baseURL})=>{
  await localOnly(page,baseURL);await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/reading-paths/');
  await expect(page.locator('.reading-path-line')).toHaveCSS('animation-name','none');
  await expect(page.locator('meta[name=robots]')).toHaveAttribute('content','noindex, nofollow');
  await expect(page.locator('main')).toHaveAttribute('data-pagefind-ignore','');
});

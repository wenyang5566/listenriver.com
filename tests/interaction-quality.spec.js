import { test, expect } from '@playwright/test';
const article='/blog/成為自己/正念的意義就在手中/';
test('like errors are visible, retry works, and duplicate clicks stay pending',async({page})=>{
  await page.route('**/stats?*',route=>route.fulfill({json:{views:2,likes:0}}));
  await page.route('**/view',route=>route.fulfill({json:{views:3,likes:0}}));
  let attempts=0;
  await page.route('**/like',async route=>{
    attempts++;
    if(attempts===1) await route.fulfill({status:503,json:{error:'unavailable'}});
    else { await new Promise(resolve=>setTimeout(resolve,300)); await route.fulfill({json:{views:3,likes:1}}); }
  });
  await page.goto(article);
  const button=page.locator('[data-post-like-button]');
  await button.click();
  await expect(page.locator('[data-post-interactions-status]')).toContainText('請再按一次重試');
  await expect(button).not.toHaveClass(/is-liked/);
  await button.dblclick();
  await expect(page.locator('[data-post-interactions-status]')).toContainText('已送出喜歡');
  await expect(button).toHaveClass(/is-liked/);
  await expect(button).not.toHaveAttribute('aria-busy','true');
  expect(attempts).toBe(2);
});
for(const width of [320,390,1440]) test(`gallery targets and 404 recovery at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:900});
  await page.goto('/');
  const dots=page.locator('[data-gallery-dot]');
  for(const dot of await dots.all()) {
    const rect=await dot.boundingBox();expect(rect.width).toBeGreaterThanOrEqual(24);expect(rect.height).toBeGreaterThanOrEqual(44);
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  await page.goto('/404.html');
  await expect(page).toHaveTitle(/^找不到這一頁/);
  await expect(page.locator('meta[name=robots]')).toHaveAttribute('content','noindex, follow');
  await expect(page.getByRole('heading',{name:'找不到這一頁'})).toBeVisible();
  await page.getByLabel('搜尋文章',{exact:true}).fill('工作手冊 05');
  await page.locator('.missing-page button').click();
  await expect(page.locator('.pagefind-ui__result').first()).toBeVisible();
  await expect(page.locator('.pagefind-ui__result-title').first()).toContainText('工作手冊 05');
});
test('paused motion stays paused after leaving focus and returning to the page',async({page})=>{
  await page.goto('/');
  const toggle=page.locator('[data-feature-toggle]');
  await toggle.click();
  await page.locator('[data-feature-next]').click();
  await page.getByRole('link',{name:'認識文揚'}).click();
  await page.goBack();
  await expect(page.locator('body')).toHaveAttribute('data-river-motion','paused');
  await expect(page.locator('.river-lead')).toHaveAttribute('data-feature-paused','true');
  await expect(toggle).toContainText('繼續動態');
  await page.reload();
  await expect(page.locator('body')).toHaveAttribute('data-river-motion','paused');
  await expect(page.locator('.river-brand-ribbon:visible')).toHaveCSS('animation-name','none');
  await expect(page.locator('.river-brand-ribbon:visible')).toHaveCSS('clip-path','inset(0px)');
});

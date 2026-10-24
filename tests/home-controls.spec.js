import { test, expect } from '@playwright/test';
for (const width of [390, 1440]) test(`category links and keloid drawer ${width}`, async ({page, request}) => {
  await page.setViewportSize({width,height:900});
  await page.goto('/');
  if(width<861) await page.locator('.header-mobile-menu-toggle').click();
  const nav=page.locator(width<861?'#mobile-nav-drawer':'.desktop-nav');
  const links=nav.locator(width<861?'.mobile-nav-category-row > a':'.personal-header__nav-combo > a');
  expect(await links.count()).toBe(6);
  for(const link of await links.all()) expect((await request.get(await link.getAttribute('href'))).ok()).toBeTruthy();
  await links.filter({hasText:'日常書寫'}).click();
  await expect(page).toHaveURL(/\/categories\/.*\/$/);
  if(width<861) await page.locator('.header-mobile-menu-toggle').click();
  const trigger=nav.getByRole('button',{name:width<861?'展開或收合 病痛經驗 子題':'展開 病痛經驗',exact:true});
  await trigger.click();
  const submenu=nav.locator('.header-submenu').filter({hasText:'蟹足腫'});
  if(width<861) await submenu.locator('summary svg').click();
  else await submenu.locator('summary').hover();
  await expect(submenu.getByRole('link',{name:/蟹足腫病痛/})).toBeVisible();
  await expect(submenu.getByRole('link',{name:/論文/})).toBeVisible();
  await page.screenshot({path:'.tmp/home-controls-' + width + '.png'});
  await submenu.getByRole('link',{name:/蟹足腫病痛/}).click();
  await expect(page).toHaveURL(/\/tags\//);
});
test('touch gallery can autoplay and advance manually',async({browser, baseURL})=>{
 const context=await browser.newContext({baseURL,viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 const page=await context.newPage();
 await page.goto('/');
 const gallery=page.locator('.home-gallery-section');
 await gallery.scrollIntoViewIfNeeded();
 await expect(gallery).toHaveAttribute('data-gallery-playing','true');
 const next=gallery.locator('[data-gallery-next]');
 await next.tap();
 await expect(gallery.locator('[data-gallery-dot="1"]')).toHaveAttribute('aria-current','true');
 await context.close();
});


import {test, expect} from '@playwright/test';
for (const width of [320,390,430,820]) {
  for (const theme of ['light','dark']) {
    test(`mobile directory ${width}px ${theme}`, async ({page, request}) => {
      await page.setViewportSize({width,height:932});
      await page.addInitScript(theme => localStorage.setItem('pref-theme',theme),theme);
      await page.goto('/');
      await page.locator('.header-mobile-menu-toggle').click();
      const drawer = page.locator('#mobile-nav-drawer');
      const groups = drawer.locator('.mobile-nav-group');
      await expect(drawer).toHaveCSS('transform','matrix(1, 0, 0, 1, 0, 0)');
      const drawerBox = await drawer.boundingBox();
      expect(drawerBox.x).toBeGreaterThanOrEqual(50);
      await page.mouse.click(drawerBox.x / 2, 300);
      await expect(drawer).toHaveAttribute('aria-hidden','true');
      await page.locator('.header-mobile-menu-toggle').click();
      await expect(groups).toHaveCount(6);
      await expect(drawer.locator('.mobile-nav-category-link > span:first-child')).toHaveText(['閱讀筆記','日常書寫','成為自己','病痛經驗','助人工作','會所模式']);
      await expect(drawer.locator('.mobile-nav-category-link .personal-header__dropdown-count')).toHaveCount(0);
      await expect(drawer.locator('.mobile-nav-all-link .personal-header__dropdown-count')).toHaveCount(6);
      for (const group of await groups.all()) {
        const link = group.locator('.mobile-nav-all-link');
        const trigger = group.locator('.mobile-nav-group-trigger');
        expect((await request.get(await link.getAttribute('href'))).ok()).toBeTruthy();
        await trigger.click();
        await expect(trigger).toHaveAttribute('aria-expanded','true');
        await expect(groups.filter({has:page.locator('.mobile-nav-group-trigger[aria-expanded="true"]')})).toHaveCount(1);
        const triggerBox = await trigger.boundingBox();
        expect(triggerBox.width).toBeGreaterThanOrEqual(44);
        await expect(group.locator('.mobile-nav-group-panel')).toBeVisible();
        await trigger.click();
        await expect(group.locator('.mobile-nav-group-panel')).not.toBeVisible();
      }
      const clubhouse = groups.last();
      await clubhouse.locator('.mobile-nav-group-trigger').click();
      await expect(clubhouse.locator('.mobile-nav-sub-link')).toHaveCount(4);
      expect(await drawer.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBeTruthy();
      if(width===430) {
        await page.waitForTimeout(250);
        await page.screenshot({path:`.tmp/sticky-audit/directory-${theme}.png`});
      }
      await clubhouse.locator('.mobile-nav-all-link').click();
      await expect(page).toHaveURL(/\/clubhouse\/$/);
      await page.locator('.header-mobile-menu-toggle').click();
      await expect(page.locator('#mobile-nav-drawer .mobile-nav-group.is-open')).toHaveCount(1);
      await expect(page.locator('#mobile-nav-panel-clubhouse')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.locator('.header-mobile-menu-toggle')).toBeFocused();
    });
  }
}

for (const width of [900,1440]) {
  for (const theme of ['light','dark']) {
    test(`desktop directory ${width}px ${theme}`, async ({page,request}) => {
      await page.setViewportSize({width,height:932});
      await page.addInitScript(theme=>localStorage.setItem('pref-theme',theme),theme);
      await page.goto('/');
      const groups=page.locator('.desktop-nav .nav-group');
      await expect(groups).toHaveCount(6);
      await expect(groups.locator('.personal-header__nav-link-main')).toHaveText(['閱讀筆記','日常書寫','成為自己','病痛經驗','助人工作','會所模式']);
      await expect(groups.locator('.personal-header__nav-link-main .personal-header__dropdown-count')).toHaveCount(0);
      for(const group of await groups.all()) {
        const button=group.locator('.nav-group-trigger');
        await button.hover();
        await expect(button).toHaveAttribute('aria-expanded','true');
        await button.click();
        await expect(button).toHaveAttribute('aria-expanded','true');
        const panelBox=await group.locator('.personal-header__dropdown').boundingBox();
        const buttonBox=await button.boundingBox();
        await page.mouse.move(buttonBox.x+buttonBox.width/2,buttonBox.y+buttonBox.height);
        await page.mouse.move(Math.max(panelBox.x+8,Math.min(buttonBox.x+buttonBox.width/2,panelBox.x+panelBox.width-8)),panelBox.y+8,{steps:8});
        await expect(button).toHaveAttribute('aria-expanded','true');
        const all=group.locator('.personal-header__dropdown-title');
        await expect(all.locator('span:first-child')).toHaveText('全部文章');
        await expect(all.locator('.personal-header__dropdown-count')).toHaveCount(1);
        expect((await request.get(await all.getAttribute('href'))).ok()).toBeTruthy();
        const box=await group.locator('.personal-header__dropdown').boundingBox();
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x+box.width).toBeLessThanOrEqual(width);
        await page.keyboard.press('Escape');
        await expect(button).toHaveAttribute('aria-expanded','false');
        await expect(group.locator('.personal-header__dropdown')).not.toBeVisible();
        await page.keyboard.press('Enter');
        await expect(button).toHaveAttribute('aria-expanded','true');
        await page.keyboard.press('ArrowDown');
        await expect(all).toBeFocused();
        await page.keyboard.press('Escape');
      }
      await page.mouse.move(0,500);
      await groups.last().locator('.nav-group-trigger').hover();
      if(width===1440) { await page.waitForTimeout(250); await page.screenshot({path:`.tmp/sticky-audit/desktop-${theme}.png`}); }
      await groups.last().locator('.personal-header__dropdown-title').click();
      await expect(page).toHaveURL(/\/clubhouse\/$/);
    });
  }
}

test('article context and mobile rotation preserve reading position', async ({page})=>{
  await page.setViewportSize({width:430,height:932});
  await page.goto('/blog/電影心得/媽的多重宇宙01/');
  await page.evaluate(()=>window.scrollTo(0,600));
  await expect(page.locator('#site-header')).toHaveClass(/nav--hidden/);
  await page.evaluate(()=>window.scrollBy(0,-40));
  await expect(page.locator('#site-header')).not.toHaveClass(/nav--hidden/);
  const before=await page.evaluate(()=>scrollY);
  await page.locator('.header-mobile-menu-toggle').click();
  const drawer=page.locator('#mobile-nav-drawer');
  await expect(drawer.locator('.mobile-nav-sub-link').filter({hasText:'電影心得'})).toHaveClass(/is-active/);
  await page.mouse.wheel(0,400);
  await page.waitForTimeout(250);
  expect(await page.evaluate(()=>scrollY)).toBe(before);
  await page.setViewportSize({width:820,height:430});
  await expect(drawer).toHaveAttribute('aria-hidden','false');
  await page.keyboard.press('Escape');
  expect(await page.evaluate(()=>scrollY)).toBe(before);
  await page.goto('/categories/閱讀筆記/');
  await page.locator('.header-mobile-menu-toggle').click();
  await expect(drawer.locator('.mobile-nav-all-link[aria-current="page"]')).toHaveClass(/is-active/);
});

import { test, expect } from '@playwright/test';

const paths = ['/', '/blog/', '/categories/', '/tags/', '/clubhouse/', '/about/', '/blog/電影心得/媽的多重宇宙01/'];
test('desktop hides categories first and the whole header after sustained downward reading', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const header = page.locator('#site-header');
  const categories = header.locator('.header-nav-shell');
  const moveTo = async y => {
    await page.evaluate(async y => {
      scrollTo(0, y);
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    }, y);
  };
  await moveTo(159);
  await expect(header).not.toHaveClass(/nav--compact/);
  await moveTo(160);
  await expect(header).toHaveClass(/nav--compact/);
  await expect(header).not.toHaveClass(/nav--hidden/);
  await expect(categories).toHaveAttribute('inert', '');
  await expect(categories).toHaveCSS('opacity', '0');
  await moveTo(399);
  await expect(header).not.toHaveClass(/nav--hidden/);
  await moveTo(400);
  await expect(header).toHaveClass(/nav--hidden/);
  await moveTo(1000);
  await moveTo(968);
  await expect(header).toHaveClass(/nav--hidden/);
  await moveTo(840);
  await expect(header).not.toHaveClass(/nav--hidden/);
  await expect(header).toHaveClass(/nav--compact/);
  await expect(categories).toHaveAttribute('inert', '');
  await moveTo(900);
  await expect(header).not.toHaveClass(/nav--hidden/);
  await expect(header).toHaveClass(/nav--compact/);
  await moveTo(620);
  await expect(header).not.toHaveClass(/nav--hidden|nav--compact/);
  await expect(categories).not.toHaveAttribute('inert', '');
  await moveTo(750);
  await expect(header).not.toHaveClass(/nav--compact/);
  await page.waitForTimeout(450);
  await moveTo(910);
  await expect(header).toHaveClass(/nav--compact/);
  await moveTo(750);
  await expect(header).toHaveClass(/nav--compact/);
  await moveTo(470);
  await expect(header).not.toHaveClass(/nav--hidden|nav--compact/);
});

test('mobile header ignores rebound after revealing and requires fresh downward travel', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const header = page.locator('#site-header');
  const moveTo = async y => {
    await page.evaluate(async y => {
      window.scrollTo(0, y);
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    }, y);
  };
  await moveTo(900);
  await expect(header).toHaveClass(/nav--hidden/);
  await moveTo(700);
  await expect(header).not.toHaveClass(/nav--hidden/);
  await moveTo(760);
  await expect(header).not.toHaveClass(/nav--hidden/);
  await page.waitForTimeout(450);
  // Protected movement must not carry over into the new downward gesture.
  await moveTo(839);
  await expect(header).not.toHaveClass(/nav--hidden/);
  await moveTo(840);
  await expect(header).not.toHaveClass(/nav--hidden/);
  await moveTo(842);
  await expect(header).toHaveClass(/nav--hidden/);
  await moveTo(800);
  await expect(header).not.toHaveClass(/nav--hidden/);
  await moveTo(802);
  await moveTo(800);
  await expect(header).not.toHaveClass(/nav--hidden/);
});

for (const width of [390, 820, 1440]) {
  for (const theme of ['light', 'dark']) {
    test(`scroll navigation stays coordinated at ${width}px in ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript(theme => localStorage.setItem('pref-theme', theme), theme);
      for (const path of paths) {
        await page.goto(path, { waitUntil: 'domcontentloaded' });
        const header = page.locator('#site-header');
        const toolbar = page.locator('[data-mobile-reading-toolbar]');
        const hasToolbar = width <= 768 && await toolbar.count() > 0;
        await expect(header).not.toHaveClass(/nav--hidden/);
        await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0, 800); });
        await expect(header).toHaveClass(/nav--hidden/);
        await expect(header).toHaveAttribute('inert', '');
        if (hasToolbar) {
          await expect(toolbar).toHaveClass(/is-hidden/);
          await expect(toolbar).toHaveAttribute('inert', '');
        }
        // A small reverse movement must not flicker the navigation open.
        await page.evaluate(() => window.scrollBy(0, -12));
        await page.waitForTimeout(80);
        await expect(header).toHaveClass(/nav--hidden/);
        await page.evaluate(() => window.scrollBy(0, -24));
        if (hasToolbar) {
          await expect(header).toHaveClass(/nav--hidden/);
          await expect(toolbar).toHaveClass(/is-hidden/);
          await page.evaluate(() => window.scrollBy(0, -124));
          await expect(toolbar).not.toHaveClass(/is-hidden/);
          await expect(toolbar).toHaveClass(/is-compact/);
          await page.evaluate(() => window.scrollBy(0, -320));
        }
        if (width > 860) {
          await expect(header).toHaveClass(/nav--hidden/);
          await page.evaluate(() => window.scrollBy(0, -124));
          await expect(header).not.toHaveClass(/nav--hidden/);
          await expect(header).toHaveClass(/nav--compact/);
          await page.evaluate(() => window.scrollBy(0, -280));
          await expect(header).not.toHaveClass(/nav--compact/);
        }
        await expect(header).not.toHaveClass(/nav--hidden/);
        await expect.poll(() => header.evaluate(el => Math.round(el.getBoundingClientRect().top))).toBe(0);
        if (hasToolbar) {
          await expect(toolbar).not.toHaveClass(/is-hidden/);
          await expect(toolbar).not.toHaveAttribute('inert', '');
          await expect.poll(() => toolbar.evaluate(el => Math.round(el.getBoundingClientRect().bottom))).toBe(900);
        }
        await page.evaluate(() => window.scrollTo(0, 0));
        await expect(header).not.toHaveClass(/nav--hidden/);
      }
    });
  }
}

test('panels, keyboard focus, resize and reduced motion preserve navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/blog/電影心得/媽的多重宇宙01/', { waitUntil: 'domcontentloaded' });
  const header = page.locator('#site-header');
  const toolbar = page.locator('[data-mobile-reading-toolbar]');
  await expect(header).toHaveCSS('transition-duration', '0s');
  await expect(toolbar).toHaveCSS('transition-duration', '0s');
  await page.evaluate(() => window.scrollTo(0, 600));
  await expect(header).toHaveClass(/nav--hidden/);
  await page.setViewportSize({ width: 400, height: 900 });
  await expect(header).not.toHaveClass(/nav--hidden/);
  await page.locator('.header-mobile-menu-toggle').click();
  await expect(header).toHaveClass(/mobile-nav-open/);
  await expect(toolbar).not.toHaveClass(/is-hidden/);
  await page.keyboard.press('Escape');
  await page.locator('.header-search-toggle').click();
  await page.evaluate(() => window.scrollBy(0, 200));
  await expect(header).not.toHaveClass(/nav--hidden/);
  await expect(toolbar).not.toHaveClass(/is-hidden/);
  await page.keyboard.press('Escape');
  await page.keyboard.press('Tab');
  await toolbar.locator('button').first().focus();
  await page.evaluate(() => window.scrollBy(0, 200));
  await expect(header).not.toHaveClass(/nav--hidden/);
});

test('mobile article tools remain visible longer on downward scroll', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto('/blog/電影心得/媽的多重宇宙01/', { waitUntil: 'domcontentloaded' });
  const header = page.locator('#site-header');
  const toolbar = page.locator('[data-mobile-reading-toolbar]');
  await expect(toolbar.locator('.mobile-reading-toolbar__label')).toHaveText(['上一頁', '字級', '更多文章', '分享']);
  for (const label of await toolbar.locator('.mobile-reading-toolbar__label').all()) {
    await expect(label).toBeVisible();
  }
  await page.evaluate(() => window.scrollTo(0, 200));
  await expect(header).toHaveClass(/nav--hidden/);
  await page.evaluate(() => window.scrollBy(0, -100));
  await expect(header).not.toHaveClass(/nav--hidden/);
  await page.evaluate(() => window.scrollBy(0, 80));
  await expect(header).toHaveClass(/nav--hidden/);
  await expect(toolbar).not.toHaveClass(/is-hidden/);
  await page.evaluate(() => window.scrollBy(0, 100));
  await expect(toolbar).toHaveClass(/is-compact/);
  await expect(toolbar).not.toHaveClass(/is-hidden/);
  await expect(toolbar.locator('.mobile-reading-toolbar__label').first()).toHaveCSS('max-height', '0px');
  await expect(toolbar).not.toHaveAttribute('inert', '');
  await page.evaluate(() => window.scrollBy(0, 80));
  await expect(toolbar).not.toHaveClass(/is-hidden/);
  await page.evaluate(() => window.scrollBy(0, 120));
  await expect(toolbar).not.toHaveClass(/is-hidden/);
  await page.evaluate(() => window.scrollBy(0, 120));
  await expect(toolbar).not.toHaveClass(/is-hidden/);
  await page.evaluate(() => window.scrollBy(0, 160));
  await expect(toolbar).toHaveClass(/is-hidden/);
  await page.evaluate(() => window.scrollBy(0, -32));
  await expect(toolbar).toHaveClass(/is-hidden/);
  await page.evaluate(() => window.scrollBy(0, -128));
  await expect(header).toHaveClass(/nav--hidden/);
  await expect(toolbar).not.toHaveClass(/is-hidden/);
  await expect(toolbar).toHaveClass(/is-compact/);
  await expect(toolbar).not.toHaveAttribute('inert', '');
  await page.evaluate(() => window.scrollBy(0, -320));
  await expect(header).not.toHaveClass(/nav--hidden/);
  await expect(toolbar).not.toHaveClass(/is-hidden/);
  await expect(toolbar).not.toHaveClass(/is-compact/);
  await expect(toolbar.locator('.mobile-reading-toolbar__label').first()).toBeVisible();
});

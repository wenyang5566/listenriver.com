import { test, expect } from '@playwright/test';

const paths = ['/', '/blog/', '/categories/', '/tags/', '/clubhouse/', '/about/', '/blog/電影心得/媽的多重宇宙01/'];

for (const theme of ['light', 'dark']) {
  test(`header interaction cues follow focus and expanded state in ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(theme => localStorage.setItem('pref-theme', theme), theme);
    await page.goto('/');
    const header = page.locator('#site-header');
    const trigger = header.locator('.nav-group-trigger').first();
    const arrow = trigger.locator('.nav-chip-chevron');
    const accent = theme === 'dark' ? 'rgb(240, 178, 149)' : 'rgb(180, 82, 57)';
    await expect(arrow).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
    await trigger.hover();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(trigger.locator('.personal-header__nav-link-main')).toHaveCSS('color', accent);
    await expect(arrow).toHaveCSS('transform', 'matrix(-1, 0, 0, -1, 0, 0)');
    await expect(arrow).toHaveCSS('transition-duration', '0s');
    await page.mouse.move(5, 400);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(arrow).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
    await page.keyboard.press('Tab');
    await trigger.focus();
    await expect(trigger).toHaveCSS('outline-style', 'solid');
    await expect(trigger.locator('.personal-header__nav-link-main')).toHaveCSS('color', accent);
    const search = header.locator('.header-search-toggle');
    await search.click();
    await expect(search).toHaveAttribute('aria-expanded', 'true');
    await expect(search).toHaveCSS('color', accent);
    const background = await search.evaluate(element => {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
      const context = canvas.getContext('2d');
      context.fillStyle = getComputedStyle(element).backgroundColor;
      context.fillRect(0, 0, 1, 1);
      return Array.from(context.getImageData(0, 0, 1, 1).data);
    });
    const expectedBackground = theme === 'dark' ? [70, 58, 50, 255] : [246, 237, 226, 255];
    background.forEach((value, channel) => expect(Math.abs(value - expectedBackground[channel])).toBeLessThanOrEqual(1));
    await page.keyboard.press('Escape');
  });
}

for (const width of [390, 820, 1440]) {
  for (const theme of ['light', 'dark']) {
    test(`header keeps the journal palette after scrolling and opening panels at ${width}px in ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript(theme => localStorage.setItem('pref-theme', theme), theme);
      await page.goto('/blog/成為自己/正念的意義就在手中/');
      const header = page.locator('#site-header');
      const paper = theme === 'dark' ? 'rgb(52, 44, 40)' : 'rgb(255, 250, 242)';
      const checkShells = async () => {
        await expect(header.locator('.header-top-shell')).toHaveCSS('background-color', paper);
        await expect(header.locator('.header-nav-shell')).toHaveCSS('background-color', paper);
      };
      await checkShells();
      await page.evaluate(() => scrollTo(0, 1000));
      await expect(header).toHaveClass(/nav--hidden/);
      await page.evaluate(() => scrollBy(0, -80));
      if (width > 860) {
        await expect(header).toHaveClass(/nav--compact/);
        await expect(header).not.toHaveClass(/nav--hidden/);
        await checkShells();
      }
      await page.evaluate(() => scrollBy(0, -160));
      await expect(header).not.toHaveClass(/nav--hidden|nav--compact/);
      await expect(header).toHaveClass(/is-scrolled/);
      await checkShells();
      await header.locator('.header-search-toggle').click();
      await expect(header.locator('.personal-header__search')).toBeVisible();
      await expect(header.locator('.personal-header__search')).toHaveCSS('background-color', paper);
      await checkShells();
      await page.keyboard.press('Escape');
      if (width <= 860) {
        await header.locator('.header-mobile-menu-toggle').click();
        await expect(header.locator('.mobile-nav-drawer')).toBeVisible();
        await expect(header.locator('.mobile-nav-drawer')).toHaveCSS('background-color', paper);
      } else {
        await header.locator('.nav-group-trigger').first().click();
        await expect(header.locator('.personal-header__dropdown-inner').first()).toBeVisible();
        await expect(header.locator('.personal-header__dropdown-inner').first()).toHaveCSS('background-color', paper);
      }
    });
  }
}

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
  await moveTo(921);
  await expect(header).toHaveClass(/nav--hidden/);
  await moveTo(920);
  await expect(header).not.toHaveClass(/nav--hidden/);
  await expect(header).toHaveClass(/nav--compact/);
  await expect(categories).toHaveAttribute('inert', '');
  await moveTo(980);
  await expect(header).not.toHaveClass(/nav--hidden/);
  await expect(header).toHaveClass(/nav--compact/);
  await moveTo(821);
  await expect(header).toHaveClass(/nav--compact/);
  await moveTo(820);
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
        // pageshow initializes the scroll baseline; fonts can change page geometry.
        await page.goto(path, { waitUntil: 'load' });
        await page.evaluate(async () => {
          await document.fonts.ready;
          await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        });
        const header = page.locator('#site-header');
        const toolbar = page.locator('[data-mobile-reading-toolbar]');
        const hasToolbar = width <= 768 && await toolbar.count() > 0;
        await expect(header).not.toHaveClass(/nav--hidden/);
        const maxScroll = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
        await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0, 800); });
        if (width > 860 && maxScroll < 400) {
          // A short page cannot reach the full-hide travel threshold.
          await expect(header).not.toHaveClass(/nav--hidden/);
          if (maxScroll >= 160) await expect(header).toHaveClass(/nav--compact/);
          await page.evaluate(() => scrollTo(0, 0));
          await expect(header).not.toHaveClass(/nav--compact/);
          continue;
        }
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
          await page.evaluate(() => window.scrollBy(0, -44));
          await expect(toolbar).not.toHaveClass(/is-hidden/);
          await expect(toolbar).toHaveClass(/is-compact/);
          await page.evaluate(() => window.scrollBy(0, -160));
        }
        if (width > 860) {
          await expect(header).toHaveClass(/nav--hidden/);
          await page.evaluate(() => window.scrollBy(0, -44));
          await expect(header).not.toHaveClass(/nav--hidden/);
          await expect(header).toHaveClass(/nav--compact/);
          await page.evaluate(() => window.scrollBy(0, -160));
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
  await page.goto('/blog/電影心得/媽的多重宇宙01/', { waitUntil: 'load' });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  const header = page.locator('#site-header');
  const toolbar = page.locator('[data-mobile-reading-toolbar]');
  await expect(toolbar.locator('.mobile-reading-toolbar__label')).toHaveText(['上一頁', '字級', '目錄', '更多文章', '分享']);
  for (const label of await toolbar.locator('.mobile-reading-toolbar__label').all()) {
    await expect(label).toBeVisible();
  }
  await page.evaluate(() => window.scrollTo(0, 200));
  await expect(header).toHaveClass(/nav--hidden/);
  await page.evaluate(() => window.scrollBy(0, -100));
  await expect(header).not.toHaveClass(/nav--hidden/);
  await page.waitForTimeout(450);
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
  await page.evaluate(() => window.scrollBy(0, 97));
  await expect(toolbar).not.toHaveClass(/is-hidden/);
  await page.evaluate(() => window.scrollBy(0, 3));
  await expect(toolbar).toHaveClass(/is-hidden/);
  await page.evaluate(() => window.scrollBy(0, -77));
  await expect(toolbar).toHaveClass(/is-hidden/);
  await page.evaluate(() => window.scrollBy(0, -3));
  await expect(header).toHaveClass(/nav--hidden/);
  await expect(toolbar).not.toHaveClass(/is-hidden/);
  await expect(toolbar).toHaveClass(/is-compact/);
  await expect(toolbar).not.toHaveAttribute('inert', '');
  await page.evaluate(() => window.scrollBy(0, -157));
  await expect(header).toHaveClass(/nav--hidden/);
  await expect(toolbar).toHaveClass(/is-compact/);
  await page.evaluate(() => window.scrollBy(0, -3));
  await expect(header).not.toHaveClass(/nav--hidden/);
  await expect(toolbar).not.toHaveClass(/is-hidden/);
  await expect(toolbar).not.toHaveClass(/is-compact/);
  await expect(toolbar.locator('.mobile-reading-toolbar__label').first()).toBeVisible();
});

test('desktop category row slides behind the top row before becoming transparent', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const row = page.locator('#site-header .header-nav-shell');
  const midway = await row.evaluate(element => {
    const header = element.closest('#site-header');
    header.classList.remove('nav--compact');
    element.getAnimations().forEach(animation => animation.finish());
    getComputedStyle(element).transform;
    header.classList.add('nav--compact');
    getComputedStyle(element).transform;
    const animations = element.getAnimations();
    if (!animations.length) throw new Error('Expected an active header transition');
    animations.forEach(animation => { animation.pause(); animation.currentTime = 140; });
    const style = getComputedStyle(element);
    return { opacity: style.opacity, y: new DOMMatrix(style.transform).m42, height: element.offsetHeight };
  });
  expect(midway.opacity).toBe('1');
  expect(midway.y).toBeLessThan(-12);
  expect(midway.y).toBeGreaterThanOrEqual(-midway.height);
  await row.evaluate(element => element.getAnimations().forEach(animation => animation.finish()));
  await expect(row).toHaveCSS('opacity', '0');
  const restoring = await row.evaluate(element => {
    element.closest('#site-header').classList.remove('nav--compact');
    getComputedStyle(element).transform;
    const animations = element.getAnimations();
    if (!animations.length) throw new Error('Expected an active header transition');
    animations.forEach(animation => { animation.pause(); animation.currentTime = 140; });
    const style = getComputedStyle(element);
    return { opacity: style.opacity, y: new DOMMatrix(style.transform).m42 };
  });
  expect(restoring.opacity).toBe('1');
  expect(restoring.y).toBeLessThan(0);
  expect(restoring.y).toBeGreaterThan(-midway.height);
  await row.evaluate(element => element.getAnimations().forEach(animation => animation.finish()));
  expect(await row.evaluate(element => new DOMMatrix(getComputedStyle(element).transform).m42)).toBe(0);
});

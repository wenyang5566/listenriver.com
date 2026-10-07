import { expect, test } from '@playwright/test';

test('editorial selections, topic entrances and recent articles resolve', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveCount(1);
  expect((await request.get('/fonts/river-sans.woff2')).ok()).toBeTruthy();
  expect(await page.evaluate(async () => {
    await document.fonts.ready;
    return document.fonts.check('500 32px "River Sans"', '聆聽的河流');
  })).toBeTruthy();
  await expect(page.locator('.river-lead')).toHaveCount(1);
  await expect(page.locator('.river-story')).toHaveCount(2);
  await expect(page.locator('.river-topic')).toHaveCount(6);
  await expect(page.locator('.river-recent-row')).toHaveCount(6);
  await expect(page.locator('.river-photo img:visible')).toHaveCount(9);
  for (const image of await page.locator('.river-photo img:visible').all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate(element => element.complete && element.naturalWidth > 0)).toBeTruthy();
  }
  const links = await page.locator('.publication-header a, .river-journal a').evaluateAll(elements =>
    [...new Set(elements.map(element => element.getAttribute('href')).filter(href => href.startsWith('/')))]
  );
  for (const href of links) {
    const response = await request.get(href);
    expect(response.ok(), href).toBeTruthy();
  }
  await page.locator('.river-lead-link:visible').click();
  await expect(page.locator('.post-single')).toBeVisible();
  await expect(page.locator('body')).not.toHaveClass(/river-home/);
});

test('featured pool supports manual navigation and changes opening on repeat visits', async ({ page }) => {
  await page.goto('/');
  const slides = page.locator('.river-feature-slide');
  const total = await slides.count();
  expect(total).toBeGreaterThan(1);
  expect(total).toBeLessThanOrEqual(6);
  const initial = await page.locator('.river-lead-link:visible').getAttribute('href');
  const seen = new Set();
  for (let i = 0; i < total; i++) {
    await expect(page.locator('.river-feature-slide:visible')).toHaveCount(1);
    seen.add(await page.locator('.river-lead-link:visible').getAttribute('href'));
    await page.locator('[data-feature-next]').click();
  }
  expect(seen.size).toBe(total);
  await expect(page.locator('.river-lead-link:visible')).toHaveAttribute('href', initial);
  await page.reload();
  await expect(page.locator('.river-lead-link:visible')).not.toHaveAttribute('href', initial);
  const beforeKey = await page.locator('.river-lead-link:visible').getAttribute('href');
  await page.locator('[data-feature-next]').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.river-lead-link:visible')).not.toHaveAttribute('href', beforeKey);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('[data-feature-prev]').click();
  await expect(page.locator('.river-feature-slide:visible')).toHaveCount(1);
});

test('featured autoplay waits five seconds and pauses for reading and reduced motion', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-07T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-10-07T00:00:01Z'));
  await page.goto('/');
  await page.locator('.river-lead').scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  const carousel = page.locator('.river-lead');
  await expect(carousel).toHaveAttribute('data-feature-playing', 'true');
  const link = page.locator('.river-lead-link:visible');
  const first = await link.getAttribute('href');
  await page.clock.runFor(4999);
  await expect(link).toHaveAttribute('href', first);
  await page.clock.runFor(1);
  await expect(link).not.toHaveAttribute('href', first);
  await expect(page.locator('.river-feature-ghost')).toHaveCount(1);
  await page.clock.runFor(700);
  await expect(page.locator('.river-feature-ghost')).toHaveCount(0);
  await carousel.hover();
  await expect(carousel).toHaveAttribute('data-feature-playing', 'false');
  const reading = await link.getAttribute('href');
  await page.clock.runFor(10000);
  await expect(link).toHaveAttribute('href', reading);
  await page.mouse.move(0, 0);
  await page.locator('[data-feature-next]').focus();
  await expect(carousel).toHaveAttribute('data-feature-playing', 'false');
  await page.clock.runFor(6000);
  await expect(link).toHaveAttribute('href', reading);
  await page.locator('[data-feature-next]').click();
  await expect(carousel).toHaveAttribute('data-feature-stopped', 'true');
  await page.locator('[data-feature-toggle]').click();
  await page.mouse.move(0, 0);
  await page.locator('[data-feature-toggle]').evaluate(el => el.blur());
  await expect(carousel).toHaveAttribute('data-feature-playing', 'true');
  await page.locator('[data-feature-toggle]').click();
  await page.mouse.move(0, 0);
  await page.locator('[data-feature-toggle]').evaluate(el => el.blur());
  await expect(carousel).toHaveAttribute('data-feature-stopped', 'true');
  const paused = await link.getAttribute('href');
  await page.clock.runFor(6000);
  await expect(link).toHaveAttribute('href', paused);
  await page.locator('[data-feature-toggle]').click();
  await page.mouse.move(0, 0);
  await page.locator('[data-feature-toggle]').evaluate(el => el.blur());
  await expect(carousel).toHaveAttribute('data-feature-playing', 'true');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(carousel).toHaveAttribute('data-feature-playing', 'false');
  const reduced = await link.getAttribute('href');
  await page.clock.runFor(6000);
  await expect(link).toHaveAttribute('href', reduced);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(carousel).toHaveAttribute('data-feature-playing', 'true');
  await page.locator('.river-publication-footer').scrollIntoViewIfNeeded();
  await expect(carousel).toHaveAttribute('data-feature-playing', 'false');
});

test('river flows continuously and respects reduced motion changes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const traces = page.locator('.river-editorial-opening .river-current-traces');
  await expect(page.locator('.river-motion-toggle')).toHaveCount(0);
  await expect(page.locator('body')).toHaveAttribute('data-river-motion', 'running');
  await expect(traces).toHaveCSS('animation-play-state', 'running');
  await page.waitForTimeout(4200);
  await expect(traces).toHaveCSS('animation-play-state', 'running');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(traces).toHaveCSS('animation-name', 'none');
  await expect(page.locator('body')).toHaveAttribute('data-river-motion', 'paused');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(traces).toHaveCSS('animation-play-state', 'running');
});

for (const width of [320, 390, 768, 1440]) {
  test(`journal fits ${width}px and supports keyboard theme switching`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await page.keyboard.press('Tab');
    await expect(page.locator('.river-skip')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#river-content$/);
    const layout = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth,
      paddingTop: getComputedStyle(document.body).paddingTop,
      background: getComputedStyle(document.body).backgroundColor,
    }));
    expect(layout).toEqual({overflow: false, paddingTop: '0px', background: 'rgb(255, 250, 242)'});
    await expect(page.locator('.publication-header .header-brand-text__title')).toHaveText('聆聽的河流');
    if (width <= 768) {
      await page.evaluate(() => window.scrollTo(0, 900));
      const header = page.locator('#site-header');
      await expect.poll(async () => Math.round((await header.boundingBox()).y)).toBe(0);
      await expect(header).not.toHaveClass(/nav--hidden/);
      const brand = await header.locator('.personal-header__brand').boundingBox();
      const actions = await header.locator('.personal-header__actions').boundingBox();
      expect(brand.x + brand.width).toBeLessThanOrEqual(actions.x);
      await page.locator('.header-mobile-menu-toggle').click();
      await expect(header).toHaveClass(/mobile-nav-open/);
      await page.keyboard.press('Escape');
      await expect(header).not.toHaveClass(/mobile-nav-open/);
    }
    await page.locator('#theme-toggle').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    expect(await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgb(52, 44, 40)');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });
}

test('reading entrances remain available without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('.river-lead-link:visible')).toHaveCount(1);
  await expect(page.locator('.river-feature-controls')).toBeHidden();
  await expect(page.locator('#theme-toggle')).toBeHidden();
  await expect(page.locator('.river-topic')).toHaveCount(6);
  await page.locator('.river-topic').last().click();
  await expect(page).toHaveURL(/\/clubhouse\/$/);
  await context.close();
});

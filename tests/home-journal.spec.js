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

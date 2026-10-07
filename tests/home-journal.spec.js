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
  await expect(page.locator('.river-photo img')).toHaveCount(9);
  for (const image of await page.locator('.river-photo img').all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate(element => element.complete && element.naturalWidth > 0)).toBeTruthy();
  }
  const links = await page.locator('.river-header a, .river-journal a').evaluateAll(elements =>
    [...new Set(elements.map(element => element.getAttribute('href')).filter(href => href.startsWith('/')))]
  );
  for (const href of links) {
    const response = await request.get(href);
    expect(response.ok(), href).toBeTruthy();
  }
  await page.locator('.river-lead-link').click();
  await expect(page.locator('.post-single')).toBeVisible();
  await expect(page.locator('body')).not.toHaveClass(/river-home/);
});

test('river motion can pause and respects reduced motion changes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const toggle = page.locator('.river-motion-toggle');
  const traces = page.locator('.river-hero-stream .river-current-traces');
  await expect(page.locator('body')).toHaveAttribute('data-river-motion', 'running');
  await expect(traces).toHaveCSS('animation-play-state', 'running');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(traces).toHaveCSS('animation-play-state', 'paused');
  await toggle.click();
  await expect(traces).toHaveCSS('animation-play-state', 'running');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(toggle).toBeHidden();
  await expect(traces).toHaveCSS('animation-name', 'none');
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
    expect(layout).toEqual({overflow: false, paddingTop: '0px', background: 'rgb(245, 240, 230)'});
    await page.locator('#theme-toggle').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    expect(await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgb(37, 37, 31)');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });
}

test('reading entrances remain available without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('.river-lead-link')).toBeVisible();
  await expect(page.locator('#theme-toggle')).toBeHidden();
  await expect(page.locator('.river-topic')).toHaveCount(6);
  await page.locator('.river-topic').last().click();
  await expect(page).toHaveURL(/\/clubhouse\/$/);
  await context.close();
});

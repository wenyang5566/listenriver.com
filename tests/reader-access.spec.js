// @ts-check
import { expect, test } from '@playwright/test';

const article = '/blog/成為自己/正念的意義就在手中/';
for (const width of [390, 1440]) {
  for (const theme of ['light', 'dark']) {
    test.describe(`${width}px ${theme} reader access`, () => {
      test.use({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      test.beforeEach(async ({ page }) => {
        await page.addInitScript((value) => localStorage.setItem('pref-theme', value), theme);
      });

      test('skip link is the first keyboard stop and enters content on all page types', async ({ page }) => {
        for (const route of ['/', '/blog/', '/about/', article]) {
          await page.goto(route);
          await page.keyboard.press('Tab');
          const skip = page.getByRole('link', { name: '跳至閱讀內容', exact: true });
          await expect(skip).toBeFocused();
          await expect(skip).toBeInViewport();
          await page.keyboard.press('Enter');
          await expect(page.locator('main')).toBeFocused();
          await expect(page).toHaveURL(/#river-content$/);
          const contentTop = await page.locator('main h1').first().evaluate(el => el.getBoundingClientRect().top);
          const headerBottom = await page.locator('#site-header').evaluate(el => el.getBoundingClientRect().bottom);
          expect(contentTop).toBeGreaterThanOrEqual(headerBottom - 1);
        }
      });

      test('image dialog contains keyboard focus and returns to the original trigger after navigation', async ({ page }) => {
        await page.goto(article);
        const image = page.locator('.post-content img[role="button"]').first();
        await image.focus();
        await page.keyboard.press('Enter');
        const close = page.getByRole('button', { name: '關閉圖片預覽', exact: true });
        await expect(close).toBeFocused();
        await page.keyboard.press('Tab');
        await expect(close).toBeFocused();
        await page.keyboard.press('Shift+Tab');
        await expect(close).toBeFocused();
        expect(await page.locator('main').evaluate(el => el.inert)).toBe(true);
        const enlarged = page.locator('.reader-lightbox-image');
        const originalSrc = await enlarged.getAttribute('src');
        await page.keyboard.press('ArrowRight');
        await expect(enlarged).not.toHaveAttribute('src', originalSrc);
        await expect(close).toBeFocused();
        await page.keyboard.press('Escape');
        await expect(image).toBeFocused();
        expect(await page.locator('main').evaluate(el => el.inert)).toBe(false);
        await page.keyboard.press('Space');
        await expect(close).toBeFocused();
        await close.click();
        await expect(image).toBeFocused();
        await expect(page.getByRole('dialog')).not.toBeVisible();
      });

      test('declared icons resolve to existing build assets', async ({ page, request }) => {
        await page.goto(article);
        const icons = await page.locator('link[rel="icon"],link[rel="apple-touch-icon"],link[rel="mask-icon"]').evaluateAll(links => links.map(link => link.getAttribute('href')));
        expect(icons.length).toBeGreaterThanOrEqual(3);
        for (const href of icons) {
          const response = await request.get(new URL(href).pathname);
          expect(response.status(), href).toBe(200);
          expect(response.headers()['content-type']).toMatch(/^image\//);
        }
      });
    });
  }
}

test('closing a lightbox preserves existing inert regions', async ({ page }) => {
  await page.goto(article);
  await page.locator('.footer').evaluate(el => el.setAttribute('inert', ''));
  const image = page.locator('.post-content img[role="button"]').first();
  await image.click();
  await page.keyboard.press('Escape');
  await expect(image).toBeFocused();
  expect(await page.locator('.footer').evaluate(el => el.inert)).toBe(true);
  expect(await page.locator('main').evaluate(el => el.inert)).toBe(false);
});

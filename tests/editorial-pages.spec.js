// @ts-check
import { test, expect } from '@playwright/test';
for (const width of [390, 1440]) {
  for (const theme of ['light', 'dark']) {
    test(`editorial archive navigation and author layout at ${width}px ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript(t => localStorage.setItem('pref-theme', t), theme);
      await page.goto('/blog/');
      const firstTitle = await page.locator('.blog-archive-entry h2').first().innerText();
      await page.getByRole('link', { name: '下一頁', exact: true }).click();
      await expect(page).toHaveURL(/\/blog\/page\/2\/$/);
      await expect(page.locator('.blog-archive-entry h2').first()).not.toHaveText(firstTitle);
      const entry = page.locator('.blog-archive-entry').nth(4);
      const title = (await entry.locator('h2').innerText()).trim();
      const link = entry.locator('.home-latest-item__link');
      const articleUrl = await link.getAttribute('href');
      await link.scrollIntoViewIfNeeded();
      const position = await page.evaluate(() => scrollY);
      await link.click();
      await expect(page).toHaveURL(new URL(articleUrl, page.url()).href);
      const articleTitle = page.locator('.post-title');
      await expect(articleTitle).toBeVisible();
      // Series articles retain the full title in metadata and show displayTitle in h1.
      await expect.poll(async () =>
        await articleTitle.getAttribute('data-search-title') || (await articleTitle.innerText()).trim()
      ).toBe(title);
      await page.goBack({ waitUntil: 'load' });
      await expect(page).toHaveURL(/\/blog\/page\/2\/$/);
      await expect.poll(() => page.evaluate(y => Math.abs(scrollY - y), position)).toBeLessThan(12);

      await page.goto('/blog/page/4/');
      const textOnly = page.locator('.blog-archive-entry--text').first();
      await expect(textOnly).toBeVisible();
      await expect(textOnly.locator('img')).toHaveCount(0);
      await textOnly.locator('.home-latest-item__link').focus();
      await page.keyboard.press('Enter');
      await expect(page.locator('.post-title')).toBeVisible();

      await page.goto('/about/');
      await expect(page.locator('.about-avatar')).toBeVisible();
      const geometry = await page.evaluate(() => {
        const avatar = document.querySelector('.about-avatar').getBoundingClientRect();
        const copy = document.querySelector('.about-hero-copy').getBoundingClientRect();
        const river = document.querySelector('.about-river').getBoundingClientRect();
        return { avatarRight: avatar.right, avatarBottom: avatar.bottom, copyLeft: copy.left, copyTop: copy.top, copyBottom: copy.bottom, riverTop: river.top, overflow: document.documentElement.scrollWidth > innerWidth };
      });
      expect(geometry.overflow).toBe(false);
      expect(geometry.riverTop).toBeGreaterThanOrEqual(geometry.copyBottom);
      if (width <= 640) expect(geometry.copyTop).toBeGreaterThan(geometry.avatarBottom);
      else expect(geometry.copyLeft).toBeGreaterThan(geometry.avatarRight);
    });
  }
}

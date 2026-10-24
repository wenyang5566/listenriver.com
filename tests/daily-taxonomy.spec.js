import {test, expect} from '@playwright/test';
import {readFileSync} from 'node:fs';

const articles = JSON.parse(readFileSync(new URL('../docs/taxonomy-2026-10-24/article-urls.json', import.meta.url), 'utf8'));

test('daily migration preserves the original article URLs and canonicals', async ({request}) => {
  for (const {url, title} of articles) {
    const response = await request.get(url);
    expect(response.status(), title).toBe(200);
    const html = await response.text();
    const canonical = html.match(/<link rel="?canonical"? href="?([^" >]+)/)?.[1];
    expect(decodeURIComponent(new URL(canonical).pathname), title).toBe(decodeURIComponent(url));
    expect(html).not.toMatch(/http-equiv="?refresh/);
  }
});

for (const width of [390, 1440]) for (const theme of ['light', 'dark']) {
  test(`daily and exhibition filters at ${width}px ${theme}`, async ({page}) => {
    await page.setViewportSize({width, height:900});
    await page.addInitScript(t => localStorage.setItem('pref-theme', t), theme);
    await page.goto('/categories/日常札記/');
    const filters = page.locator('[data-reading-filter]');
    expect(await filters.evaluateAll(links => links.map(link => link.dataset.readingFilter)))
      .toEqual(['', '觀察反思', '數位生活', '素描']);
    for (const name of ['觀察反思', '數位生活', '素描']) {
      const filter = page.locator(`[data-reading-filter="${name}"]`);
      const count = Number(await filter.getAttribute('data-count'));
      expect(count).toBeGreaterThan(0);
      await filter.click();
      await expect(filter).toHaveAttribute('aria-current', 'true');
      await expect(page.locator('.taxonomy-story-card:visible')).toHaveCount(count);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    await page.screenshot({path:`.tmp/daily-category-${width}-${theme}.png`,fullPage:true});
    await page.goto('/categories/閱讀筆記/');
    for (const name of ['講座筆記', '講座心得', '展覽心得']) {
      await expect(page.locator(`[data-reading-filter="${name}"]`)).toBeVisible();
    }
    const exhibitions = page.locator('[data-reading-filter="展覽心得"]');
    const count = Number(await exhibitions.getAttribute('data-count'));
    await exhibitions.click();
    await expect(page.locator('.taxonomy-story-card:visible')).toHaveCount(count);
    await expect(page.locator('.taxonomy-story-card:visible').filter({hasText:'洪瑞麟'})).toHaveCount(1);
    await expect(page.locator('.taxonomy-story-card:visible').filter({hasText:'人間出口'})).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  });
}

test('single-article topic and exhibition links work without JavaScript', async ({browser, baseURL}) => {
  const context = await browser.newContext({baseURL, javaScriptEnabled:false});
  try {
    const page = await context.newPage();
    await page.goto('/categories/日常札記/');
    await page.locator('[data-reading-filter="數位生活"]').click();
    await expect(page.getByRole('heading', {level:1})).toHaveText('#數位生活');
    await expect(page.getByRole('link', {name:'網頁架設學習歷程',exact:true}).first()).toBeVisible();
    await page.goto('/categories/閱讀筆記/');
    await page.locator('[data-reading-filter="展覽心得"]').click();
    await expect(page.getByRole('heading', {level:1})).toHaveText('#展覽心得');
  } finally {
    await context.close();
  }
});

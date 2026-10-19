import {test, expect} from '@playwright/test';

const url = '/keloid/research/';
for (const width of [390, 1440]) for (const theme of ['light', 'dark']) {
  test(`thesis citations and disclosures at ${width}px ${theme}`, async ({page}) => {
    await page.setViewportSize({width, height: 900});
    await page.route('**/*', route => route.request().url().startsWith('http://127.0.0.1:1313/') ? route.continue() : route.abort());
    await page.addInitScript(t => localStorage.setItem('pref-theme', t), theme);
    await page.goto(url);
    await expect(page.locator('.thesis-disclosure')).toHaveCount(13);
    await expect(page.locator('.thesis-disclosure[open]')).toHaveCount(0);
    await expect(page.locator('#disclosure-acknowledgements')).not.toHaveAttribute('open', '');
    await expect(page.locator('#disclosure-abstract-zh')).not.toHaveAttribute('open', '');
    await expect(page.locator('.keloid-medical-note')).toContainText('諮詢醫師');
    await expect(page.locator('img[src*="image9.jpeg"], img[src*="image10.jpeg"], img[src*="image11.jpeg"]')).toHaveCount(0);
    await expect(page.locator('a[href*="forms.gle"], a[href*="listeningtopain@gmail.com"]')).toHaveCount(0);
    await expect(page.locator('.thesis-reference-entry')).toHaveCount(171);
    await expect(page.locator('.thesis-citation')).toHaveCount(342);
    const first = page.locator('#source-p-96 .thesis-citation').first();
    await first.evaluate(node => node.scrollIntoView({block: 'center'}));
    const position = await page.evaluate(() => ({y: scrollY, hash: location.hash}));
    const popup = page.locator('.thesis-reference-popup');
    if (width === 1440) {
      await first.hover();
      await expect(popup).toBeVisible();
      await expect(popup).toContainText('林仲（2001）');
      await popup.hover();
      await expect(popup).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(popup).not.toBeVisible();
    }
    await first.click();
    await expect(popup).toBeVisible();
    const expected = await page.locator('#reference-source-p-1781').textContent();
    await expect(popup.locator('.thesis-reference-entry')).toHaveText(expected);
    expect(await page.evaluate(() => scrollY)).toBeCloseTo(position.y, 0);
    expect(await page.evaluate(() => location.hash)).toBe(position.hash);
    const bounds = await popup.boundingBox();
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
    if (width === 390) {
      await page.keyboard.press('Shift+Tab');
      expect(await popup.evaluate(node => node.contains(document.activeElement))).toBe(true);
    }
    await popup.getByRole('button', {name: '關閉參考文獻'}).click();
    await expect(popup).not.toBeVisible();
    await expect(first).toBeFocused();
    expect(await page.evaluate(() => scrollY)).toBeCloseTo(position.y, 0);
    // Multiple sources in one parenthesis appear together, with complete continuations.
    const multiple = page.locator('#source-p-96 .thesis-citation').filter({hasText: 'Kassi'});
    await multiple.click();
    await expect(popup.locator('.thesis-reference-entry')).toHaveCount(3);
    await expect(popup).toContainText('Sangare, A. (2020)');
    await page.keyboard.press('Escape');
    await expect(popup).not.toBeVisible();
    await expect(multiple).toBeFocused();
    await first.click();
    await expect(popup).toBeVisible();
    await page.mouse.click(2, 190);
    await expect(popup).not.toBeVisible();
    await expect(first).toBeFocused();
    // Appendix links open the right disclosure and retain return links.
    await page.locator('.thesis-appendix-ref[href="#appendix-6"]').click();
    await expect(page.locator('#disclosure-appendix-6')).toHaveAttribute('open', '');
    await page.locator('#disclosure-appendix-6 .thesis-backlinks a').click();
    await expect(page).toHaveURL(/#appendix-ref-6-1$/);
    await page.goto(url + '#reference-source-p-1862');
    await expect(page.locator('#references-en')).toHaveAttribute('open', '');
    const problems = await page.evaluate(() => {
      const ids = [...document.querySelectorAll('[id]')].map(n => n.id);
      return {duplicateIds: ids.filter((id, i) => ids.indexOf(id) !== i), overflow: document.documentElement.scrollWidth > innerWidth};
    });
    expect(problems).toEqual({duplicateIds: [], overflow: false});
    expect((await page.request.get(url + 'thesis.pdf')).status()).toBe(404);
  });
}

test('thesis bibliography and appendix are accessible without JavaScript', async ({browser}) => {
  const context = await browser.newContext({javaScriptEnabled: false, viewport: {width: 390, height: 900}});
  const page = await context.newPage();
  await page.goto(url + '#reference-source-p-1862');
  await expect(page.locator('#reference-source-p-1862')).toBeVisible();
  await page.goto(url + '#appendix-7');
  await expect(page.locator('#appendix-7')).toBeVisible();
  await context.close();
});

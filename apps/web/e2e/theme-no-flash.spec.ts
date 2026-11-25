import { test, expect } from '@playwright/test';

/**
 * No-flash theme boot: the inline THEME_SCRIPT must resolve the theme and set
 * `data-scheme` + `data-skin` (plus the legacy `data-theme` mirror) on
 * <html> before first paint. Review Focus #1; the OS-light test below pins
 * Review Focus #2 end-to-end because Playwright's default emulation is light.
 */
test.describe('Theme no-flash boot', () => {
  test('applies persisted scheme+skin before paint', async ({ page }) => {
    await page.addInitScript(() =>
      localStorage.setItem('pf.theme', '{"scheme":"light","skin":"3"}'),
    );
    await page.goto('/');
    const attrs = await page.evaluate(() => document.documentElement.dataset);
    expect(attrs['scheme']).toBe('light');
    expect(attrs['skin']).toBe('3');
  });
  test('resolves dark from OS preference with empty storage', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    const attrs = await page.evaluate(() => document.documentElement.dataset);
    expect(attrs['scheme']).toBe('dark');
    expect(attrs['skin']).toBe('3');
  });
  test('resolves light from OS preference with empty storage', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    const attrs = await page.evaluate(() => document.documentElement.dataset);
    expect(attrs['scheme']).toBe('light');
    expect(attrs['skin']).toBe('3');
  });
  test('SSR html carries the default theme mirror without JavaScript', async ({ browser }) => {
    // With JS disabled the inline boot script never runs, so the SSR markup
    // is all a reader gets. The static default must already expose the same
    // data-theme mirror the script writes, or the no-JS state renders with
    // an absent legacy attribute.
    const baseURL = test.info().project.use.baseURL;
    const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
    try {
      const page = await context.newPage();
      await page.goto('/');
      const html = page.locator('html');
      await expect(html).toHaveAttribute('data-theme', 'dark');
      await expect(html).toHaveAttribute('data-scheme', 'dark');
      await expect(html).toHaveAttribute('data-skin', '3');
    } finally {
      await context.close();
    }
  });
});

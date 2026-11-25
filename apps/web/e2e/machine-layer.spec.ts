import { test, expect } from '@playwright/test';

/**
 * Machine layer: the files and metadata an AI crawler or social card reads.
 *
 * `/llms.txt` is generated from the same curated content as the site and must
 * stay under 2 KB (spec §12 Q3: no `llms-full` mirror). `robots.txt` must allow
 * the named AI crawlers, the sitemap must include `/resume`, and every page
 * must advertise the static OG image by absolute URL.
 */
test.describe('Machine layer', () => {
  test('/llms.txt is plain text and under 2 KB', async ({ request }) => {
    const response = await request.get('/llms.txt');

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/plain');

    const body = await response.text();
    expect(Buffer.byteLength(body, 'utf8')).toBeLessThan(2048);
    expect(body).toContain('# Rohith Naidu');
  });

  test('/robots.txt allows GPTBot', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(response.status()).toBe(200);

    const blocks = (await response.text()).split(/\n\s*\n/);
    const gptBot = blocks.find((block) => /user-agent:\s*gptbot/i.test(block));

    expect(gptBot).toBeDefined();
    expect(gptBot).toMatch(/^Allow:\s*\/$/m);
    // `Disallow: /` (all paths) must not appear — `/admin/` and friends are fine.
    expect(gptBot).not.toMatch(/^Disallow:\s*\/$/m);
  });

  test('/sitemap.xml lists /resume', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.status()).toBe(200);

    expect(await response.text()).toContain('/resume');
  });

  test('homepage advertises the static OG image', async ({ page }) => {
    await page.goto('/');

    const ogImage = page.locator('meta[property="og:image"]').first();
    await expect(ogImage).toHaveAttribute('content', /\/og\/og-default\.png$/);
  });
});

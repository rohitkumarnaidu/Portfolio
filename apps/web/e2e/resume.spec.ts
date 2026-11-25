import { test, expect } from '@playwright/test';

/**
 * Résumé page (`/resume`).
 *
 * The page composes only verified `public-content.ts` facts and prints to a
 * committed PDF at `/resume/rohith-naidu-resume.pdf`. Print media hides the
 * site chrome so the PDF is the document, not the website.
 */
test.describe('Résumé page', () => {
  test('renders the résumé heading and PDF download', async ({ page }) => {
    await page.goto('/resume');

    await expect(
      page.getByRole('heading', { level: 1, name: 'Bappadala Rohith Kumar Naidu' }),
    ).toBeVisible();

    await expect(page.getByRole('link', { name: 'Download PDF' })).toHaveAttribute(
      'href',
      '/resume/rohith-naidu-resume.pdf',
    );
  });

  test('serves the committed PDF as application/pdf', async ({ request }) => {
    const response = await request.get('/resume/rohith-naidu-resume.pdf');

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/pdf');
    expect((await response.body()).byteLength).toBeGreaterThan(0);
  });

  test('print media hides the site header', async ({ page }) => {
    await page.goto('/resume');
    await expect(page.locator('.site-header')).toBeVisible();

    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('.site-header')).toBeHidden();
  });
});

import { test, expect } from '@playwright/test';

/**
 * Projects index (`/projects`).
 *
 * This is an editorial index of the six curated systems in
 * `lib/public-content.ts`, not a filterable dashboard: there is no search box,
 * no result counter and no category buttons. The optional "From the dashboard"
 * list only renders when the API returns extra projects, and e2e runs Next
 * without the API — so it is deliberately not asserted here.
 */
test.describe('Projects page', () => {
  test('renders the editorial index heading', async ({ page }) => {
    await page.goto('/projects');

    await expect(
      page.getByRole('heading', { level: 1, name: 'Six systems, one standard.' }),
    ).toBeVisible();
  });

  test('lists the six curated systems as case-study cards', async ({ page }) => {
    await page.goto('/projects');

    const cards = page.locator('a[href^="/projects/"]');
    await expect(cards).toHaveCount(6);
    await expect(cards.first()).toBeVisible();
  });

  test('every card resolves to a case-study page with an h1', async ({ page, request }) => {
    await page.goto('/projects');

    const hrefs = await page
      .locator('a[href^="/projects/"]')
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')));

    expect(hrefs).toHaveLength(6);
    for (const href of hrefs) {
      expect(href).toMatch(/^\/projects\/[a-z0-9-]+$/);
      const response = await request.get(href as string);
      expect(response.status()).toBe(200);
    }

    // Navigate the first card and confirm the case study renders its own h1.
    await page.locator('a[href^="/projects/"]').first().click();
    await expect(page).toHaveURL(/\/projects\/[a-z0-9-]+$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});

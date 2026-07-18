import { test, expect } from '@playwright/test';

/**
 * Projects listing page (`/projects`).
 *
 * Verifies the page renders, project cards appear, search filtering narrows the
 * results, and the category filter buttons toggle. Selectors favour roles and
 * visible text so they stay stable as styling evolves.
 */
test.describe('Projects page', () => {
  test('renders the projects listing with a heading', async ({ page }) => {
    await page.goto('/projects');

    await expect(page.getByRole('heading', { level: 1, name: 'Projects' })).toBeVisible();

    // The results counter is always rendered (Loading… then "N projects found").
    await expect(page.getByText(/project(s)? found|Loading/i)).toBeVisible();
  });

  test('shows project cards once data has loaded', async ({ page }) => {
    await page.goto('/projects');

    // Wait for the loading state to resolve into the results counter.
    await expect(page.getByText(/\d+ project(s)? found/i)).toBeVisible({ timeout: 15000 });

    const cards = page.locator('a[href^="/projects/"]');
    const emptyState = page.getByText('No projects found.');

    // Either project cards render, or the explicit empty state is shown.
    if (await emptyState.isVisible().catch(() => false)) {
      await expect(emptyState).toBeVisible();
    } else {
      await expect(cards.first()).toBeVisible();
      expect(await cards.count()).toBeGreaterThan(0);
    }
  });

  test('filters projects via the search input', async ({ page }) => {
    await page.goto('/projects');
    await expect(page.getByText(/\d+ project(s)? found/i)).toBeVisible({ timeout: 15000 });

    const search = page.getByPlaceholder('Search projects...');
    await expect(search).toBeVisible();

    // A query that is extremely unlikely to match should produce the empty state.
    await search.fill('zzz-nonexistent-query-xyz');
    await expect(page.getByText('No projects found.')).toBeVisible();

    // Clearing the filters restores the listing.
    await page.getByRole('button', { name: 'Clear filters' }).click();
    await expect(search).toHaveValue('');
  });

  test('toggles category filters', async ({ page }) => {
    await page.goto('/projects');
    await expect(page.getByText(/\d+ project(s)? found/i)).toBeVisible({ timeout: 15000 });

    const webFilter = page.getByRole('button', { name: 'Web', exact: true });
    await expect(webFilter).toBeVisible();
    await webFilter.click();

    // After filtering, the results counter still reflects a (possibly smaller) count.
    await expect(page.getByText(/\d+ project(s)? found/i)).toBeVisible();

    // The "All" filter resets the category selection.
    await page.getByRole('button', { name: 'All', exact: true }).click();
    await expect(page.getByText(/\d+ project(s)? found/i)).toBeVisible();
  });
});

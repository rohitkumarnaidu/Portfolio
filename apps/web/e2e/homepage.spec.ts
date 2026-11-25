import { test, expect } from '@playwright/test';

/**
 * Homepage (`/`) — the Phase 1 Default-view funnel.
 *
 * The page is a single editorial funnel: hero → selected work → capabilities →
 * principles → contact. Navigation is a route-based header nav (`Primary`), not
 * in-page anchors, so link assertions check `href` rather than expecting the
 * page to stay. There is no public theme toggle in Phase 1; the mobile menu is
 * a native `<details>` disclosure labelled `Menu`.
 */
test.describe('Homepage', () => {
  test('renders the five funnel sections in order', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Rohith Naidu/);
    await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible();

    // Exactly the five funnel landmarks, in funnel order.
    const sections = page.locator('main section[id]');
    await expect(sections).toHaveCount(5);

    const ids = await sections.evaluateAll((nodes) => nodes.map((node) => node.id));
    expect(ids).toEqual(['hero', 'work', 'capabilities', 'principles', 'contact']);

    for (const id of ids) {
      await expect(page.locator(`#${id}`)).toBeVisible();
    }
  });

  test('hero offers both CTAs and an availability label', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('link', { name: 'View case studies' })).toHaveAttribute(
      'href',
      '#work',
    );
    await expect(page.getByRole('link', { name: /Résumé/ })).toHaveAttribute('href', '/resume');

    // No API in e2e, so the badge falls back to the curated availability label.
    await expect(page.locator('.hero__status')).toContainText('Open to work');
  });

  test('primary nav links to the public routes', async ({ page }) => {
    await page.goto('/');

    const nav = page.getByRole('navigation', { name: 'Primary' });
    const routes = [
      { label: 'Work', href: '/projects' },
      { label: 'About', href: '/about' },
      { label: 'Resume', href: '/resume' },
      { label: 'Writing', href: '/blog' },
      { label: 'Contact', href: '/contact' },
    ] as const;

    for (const route of routes) {
      await expect(nav.getByRole('link', { name: route.label, exact: true })).toHaveAttribute(
        'href',
        route.href,
      );
    }
  });

  test('mobile menu opens as a details disclosure at 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // The desktop nav is hidden below 900px; the `<details>` menu takes over.
    await expect(page.getByRole('navigation', { name: 'Primary' })).toBeHidden();

    const menu = page.locator('details.site-menu');
    await expect(menu).toBeVisible();
    await expect(menu.locator('summary')).toHaveText('Menu');
    await expect(menu.locator('.site-menu__panel')).toBeHidden();

    await menu.locator('summary').click();

    const panel = menu.locator('.site-menu__panel');
    await expect(panel).toBeVisible();
    await expect(panel.getByRole('link', { name: 'Work', exact: true })).toHaveAttribute(
      'href',
      '/projects',
    );
    await expect(panel.getByRole('link', { name: 'Contact', exact: true })).toBeVisible();
  });
});

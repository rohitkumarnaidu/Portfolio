import { test, expect } from '@playwright/test';

test.describe('Accessibility checks', () => {
  test('homepage has proper landmarks', async ({ page }) => {
    await page.goto('/');

    // Main navigation
    const nav = page.getByRole('navigation', { name: 'Main navigation' });
    await expect(nav).toBeAttached();

    // Main content area
    const main = page.locator('#main-content');
    await expect(main).toBeAttached();

    // Footer
    const footer = page.getByRole('contentinfo');
    await expect(footer).toBeAttached();
  });

  test('images have alt text on homepage', async ({ page }) => {
    await page.goto('/');

    // All images should have alt attributes
    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt).not.toBeNull();
    }
  });

  test('keyboard navigation works', async ({ page }) => {
    await page.goto('/');

    // Tab through interactive elements
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toBeAttached();
  });
});

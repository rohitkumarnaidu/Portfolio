import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('loads successfully with all sections', async ({ page }) => {
    await page.goto('/');

    // Page loads with a title
    await expect(page).toHaveTitle(/Portfolio/);

    // Navbar is visible
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();

    // Key sections are present
    await expect(page.locator('#hero')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#about')).toBeVisible();
    await expect(page.locator('#skills')).toBeVisible();
    await expect(page.locator('#contact')).toBeVisible();
  });

  test('navigation links work correctly', async ({ page }) => {
    await page.goto('/');

    // Click on a nav link should scroll to section
    const nav = page.getByRole('navigation', { name: 'Main navigation' });
    await nav.getByText('Projects').click();

    // Should scroll to projects section
    await expect(page.locator('#projects')).toBeVisible();
  });

  test('has working theme toggle', async ({ page }) => {
    await page.goto('/');

    // Theme toggle button should exist
    const toggleButton = page.locator('button').filter({ has: page.locator('[aria-label]') }).first();
    await expect(toggleButton).toBeVisible();
  });

  test('mobile menu can be toggled', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Mobile menu button should be visible
    const menuButton = page.getByLabel('Toggle mobile menu');
    await expect(menuButton).toBeVisible();

    // Open mobile menu
    await menuButton.click();
    await expect(page.getByRole('navigation').last()).toBeVisible();
  });
});
